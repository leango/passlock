var Lockit = require('lockit-hotfix');
var express = require('express');

var models = require('./models');
var utils = require('./utils.js');
var settings = require('../settings');
var config = require('./config.js');
var logger = config.getLogger('lockit');

var router = express.Router();
if (settings.lockit || settings.lockitRest) {
  exports.router = router;
}

if (settings.lockit) {
  var lockit = new Lockit(settings.lockit);
  lockit.config.login.handleResponse = false;
  lockit.on('signup', onSignup);
  lockit.on('login', function(user, res) {
    var req = res.req;
    var returnTo;
    if (req.session) {
      req.session.user = user;
      if (req.session.returnTo) {
        res.redirect(req.session.returnTo);
        return;
      }
    }
    if (req.query && req.query.redirect) {
      res.redirect(req.query.redirect);
      return;
    }
    res.redirect('/');
  });
  router.use(lockit.router);
  exports.lockit = lockit;
}

if (settings.lockitRest) {
  settings.lockitRest.rest = true;
  var lockitRest = new Lockit(settings.lockitRest);
  lockitRest.config.login.handleResponse = false;
  lockitRest.on('signup', onSignup);
  lockitRest.on('login', function(user, res) {
    var req = res.req;
    if (req.session) {
      req.session.user = user;
    }
    res.json(200, {
      id: user.id,
      name: user.name,
      email: user.email
    });
  });
  lockitRest.on('logout', function(user, res) {
    res.send(204);
  });
  router.use(lockitRest.router);
  exports.lockitRest = lockitRest;
}

function onSignup(user, res) {
  user.id = utils.uid(24);
  user.id = Math.floor(Math.random() * 1000000);
  lockit.adapter.update(user, function(err) {
    if (err) logger.error('Save user error', err);
  });
}
