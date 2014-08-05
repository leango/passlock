var settings = require('../../settings');
if (settings.oauth) {
  var oauth2server = require('./oauth2server.js');
  var router = require('./router.js');
  exports.oauth2server = oauth2server;
  exports.router = router;
}
