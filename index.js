var express = require('express');
var passport = require('passport');

var utils = require('./lib/utils');
var defaultSettings = require('./settings');
function initialize() {
  delete exports.initialize;

  var settings = defaultSettings;
  for(var i=0; i<arguments.length; ++i) {
    utils.extend(settings, arguments[i], true, true);
  }
  var lockit = require('./lib/lockit');
  var oauth2 = require('./lib/oauth2');
  var routers = require('./lib/routers');
  var router = express.Router();

  if (lockit.router) {
    router.use(lockit.router);
  }
  if (oauth2.router) {
    router.use(oauth2.router);
    exports.ensureAuthenticate = passport.authenticate('bearer', {
      session: false
    });
  }
  exports.ensureLogin = routers.ensureLogin;
  exports.ensureLogout = routers.ensureLogout;
  exports.populateUser = routers.populateUser;
  
  exports.router = router;
  exports.settings = settings;
}
exports.initialize = initialize;
