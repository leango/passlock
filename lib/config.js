var utils = require('./utils');
var settings = require('../settings');
var log4js = require('log4js');
log4js.configure(settings.log4js);

// Config getLogger
var loggers = {};
function getLogger(key) {
  if (loggers[key]) return loggers[key];
  var logger = log4js.getLogger(key);
  loggers[key] = logger;
  return logger;
}
exports.getLogger = getLogger;

var configLogger = getLogger('config');

// Config exports.db
if (utils.tipode(settings.db.adapter) === 'string') {
  try {
    exports.db = require(settings.db.adapter)(settings.db);
  } catch(err) {
    configLogger.error('Cannot find db adapter: %s, use memory database adapter.',
      settings.db.adapter);
    exports.db = DBAdapter(settings.db);
  }
} else if (settings.db.adapter) {
  exports.db = settings.db.adapter;
} else {
  configLogger.warn('Use memory database adapter.');
  exports.db = DBAdapter(settings.db);
}

// Config ExpireDurations
Object.keys(settings.oauth).forEach(function(key) {
  if (/ExpireDuration/.test(key))
    exports[key] = utils.ms(settings.oauth[key]);
});
