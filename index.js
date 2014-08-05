var express = require('express');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ensureLogin = require('lockit-ensure-login');

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
  var router = express.Router();

  if (lockit.router) {
    router.use(lockit.router);
  }
  if (lockit.lockit) {
    var config = lockit.lockit.config;
    exports.ensureLogin = ensureLogin(config.login.route);
  }
  if (oauth2.router) {
    router.use(oauth2.router);
    exports.ensureAuthenticate = passport.authenticate('bearer', {
      session: false
    });
  }
  exports.router = router;
  exports.settings = settings;
}
exports.initialize = initialize;
