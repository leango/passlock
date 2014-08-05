/**
 * Oauth2 server
 */


var oauth2orize = require('oauth2orize');
var async = require('async');
var models = require('../models');
var utils = require('../utils');
var settings = require('../../settings');
var config = require('../config.js');
var logger = config.getLogger('oauth2server');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.authorizationCode(function(client, redirectURI, user, ares, done) {
  var code = utils.uid(24);
  var now = new Date();
  var ac = new models.AuthorizationCode();

  // TODO: 
  // check ares.scope, now use all scopes for default
  ares.scope = '*';
  
  ac.init({
    code: code,
    clientId: client.id,
    userId: user.id,
    scope: ares.scope,
    redirectURI: redirectURI,
    createTime: now,
    expirationTime: new Date(now.getTime() +
      utils.ms(settings.oauth.authorizationCodeExpireDuration))
  });
  ac.save(function(err) {
    if (err) return done(err);
    done(null, code);
  });
}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange('authorization_code', oauth2orize.exchange.authorizationCode(
  function(client, code, redirectURI, done) {
    var ac = new models.AuthorizationCode();
    ac.find(code, function(err, obj) {
      if (err) return done(err);
      if (!obj) return done(null, false);
      if (client.id !== obj.clientId) return done(null, false);
      if (redirectURI !== obj.redirectURI) return done(null, false);
      ac.init(obj);

      // authorization code expired
      if (ac.expired()) {
        ac.delete(function(err) {
          if (err) return done(err);
          return done(null, false);
        });
        return;
      }

      ac.delete(function(err) {
        if (err) return done(err);
        var token = utils.uid(32);

        var now = new Date();
        var refreshDuration = config.accessTokenExpireDurationByCode;
        var at = new models.AccessToken();
        at.init({
          type: 'code',
          token: token,
          userId: ac.userId,
          clientId: ac.clientId,
          scope: ac.scope,
          createTime: now,
          expirationTime: new Date(now.getTime() + refreshDuration)
        });

        var refreshToken = utils.uid(256);
        var rt = new models.RefreshToken();
        rt.init({
          type: 'code',
          token: refreshToken,
          accessToken: token,
          userId: ac.userId,
          clientId: ac.clientId,
          scope: ac.scope,
          createTime: now
        });

        at.save(function(err) {
          if (err) return done(err);
          done(null, token, rt.token, {
            expires_in: refreshDuration
          });

          // save access token first, if access token save success,
          // save refresh token
          rt.save(warnFactory('Refresh tokan save error, cannot update access token'));
        });
      });
    });
  }));

// Refresh access token with refresh token. 
server.exchange('refresh_token', oauth2orize.exchange.refreshToken(
  function(client, refreshToken, scope, done) {
    logger.debug('refreshToken', refreshToken);
    var rt = new models.RefreshToken();
    rt.find(refreshToken, function(err, obj) {
      if (err) return done(err);
      if (!obj) return done(null, false);
      rt.init(obj);
      if (rt.scope !== '*' && rt.scope !== scope) return done(null, false);
      if (rt.clientId !== client.id) return done(null, false);

      var refreshDuration;
      if (rt.type === 'code') {
        refreshDuration = config.accessTokenExpireDurationByCode;
      } else if (rt.type === 'implict') {
        refreshDuration = config.accessTokenExpireDurationByImplict;
      }
      var oldAccessToken = rt.accessToken;
      var at = rt.refreshAccessToken(refreshDuration);
      at.save(function(err) {
        if (err) return done(err);
        done(null, at.token, rt.token, {
          expires_in: refreshDuration
        });

        // save access token first, if AT save success, save
        // refresh token
        rt.save(warnFactory('Refresh token save error'));

        // delete old access token then
        var oldAt = new models.AccessToken();
        oldAt.find(oldAccessToken, function(err, obj) {
          if (err) {
            logger.warn('Find old access token error', err);
            return;
          }
          if (!obj) {
            logger.warn('Cannot find old access token: %s', oldAccessToken);
            return;
          }
          oldAt.init(obj);
          oldAt.delete(warnFactory('Delete old access token error'));
        })
      });
    });
  }));
module.exports = server;

// server.exchange('client_credentials', oauth2orize.exchange.clientCredentials(
//   function(client, scope, issue) {

//   }));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  var cli = new models.Client();
  cli.find(id, done);
});

function warnFactory(text) {
  return function warn(err) {
    if(err) logger.warn(text, err);
  }
}
