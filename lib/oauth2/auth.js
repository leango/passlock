/**
 * passport authorization strategies
 */

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var models = require('../models');

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
  function(clientId, clientSecret, done) {
    var cli = new models.Client();
    cli.find(clientId, function(err, client) {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (client.secret !== clientSecret) return done(null, false);
      return done(null, client);
    });
  }
));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
    var cli = new models.Client();
    cli.find(clientId, function(err, client) {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (client.secret !== clientSecret) return done(null, false);
      return done(null, client);
    });
  }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(function(accessToken, done) {
    var at = new models.AccessToken();
    at.find(accessToken, function(err, obj) {
      if (err) return done(err);
      if (!obj) return done(null, false);
      at.init(obj);
      if (at.expired()) return at.delete(done);
      if (at.userId) {
        var user = new models.User();
        user.find(at.userId, function(err, obj) {
          if (err) return done(err);
          user.init(obj);
          done(null, user, at);
        });
        return;
      }

      // The request came from a client only since userID is null
      // therefore the client is passed back instead of a user
      // var cli = new models.Client();
      // cli.find(at.clientId, function(err, obj) {
      //   if (err) return done(err);
      //   if (!obj) return done(null, false);
      //   cli.init(obj);
      //   return done(null, cli.getObj(), at);
      // });
    });
  }
));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('call deserializeUser');
  var user = new models.User();
  user.find(id, function(err, obj) {
    if (err) return done(err);
    user.init(obj);
    done(err, user);
  });
});
