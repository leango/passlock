/**
 * Oauth 2 routers
 */

var express = require('express');
var passport = require('passport');
var lockit = require('../lockit').lockit;
var settings = require('../../settings');
var models = require('../models');
var routers = require('../routers');

require('./auth.js');

var server = require('./oauth2server.js');

var router = express.Router({
  caseSensitive: true
});

router.use(passport.initialize());



// authorization end point

var authorization = [
  // makre sure user is logged in, otherwise redirect to login page
  routers.ensureLogin(),

  server.authorization(function(clientId, redirectURI, done) {
    var cli = new models.Client();
    cli.find(clientId, function(err, obj) {
      if (err) return done(err);
      if (!obj) return done(null, false);
      cli.init(obj);
      if (!cli.checkRedirectURI(redirectURI)) return done(null, false);
      return done(null, obj, redirectURI);
    });
  }),
  function(req, res) {
    res.render(settings.oauth.views.authorize, {
      action: settings.oauth.endpoints.decision,
      transactionID: req.oauth2.transactionID,
      user: req.oauth2.user,
      client: req.oauth2.client
    });
  }
];
router.get(settings.oauth.endpoints.authorize, authorization);


// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

var decision = [
  routers.ensureLogin(),
  server.decision()
];
router.post(settings.oauth.endpoints.decision, decision);


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

var token = [
  passport.authenticate(['basic', 'oauth2-client-password'], {
    session: false
  }),
  function(req, res, next) {
    console.log(req.session);
    next();
  },
  server.token(),
  server.errorHandler()
];
router.post(settings.oauth.endpoints.token, token);



// tokeninfo endpoint
// similary to google's oauth2 tokeninfo endpoint

var tokenInfo = [
  passport.authenticate('bearer', {
    session: false
  }),
  function(req, res, next) {
    var expires_in = 
      Math.floor((req.authInfo.expirationTime.getTime() - Date.now()) / 1000);
    if (expires_in < 0) expires_in = 'expired';
    res.json({
      "issued_to": req.authInfo.clientId,
      "user_id": req.authInfo.userId,
      "expires_in": expires_in,
      "scope": req.authInfo.scope,
      "email": req.user.email,
      "verified_email": true
    });
  }
];
router.get(settings.oauth.endpoints.tokenInfo, tokenInfo);

module.exports = router;
