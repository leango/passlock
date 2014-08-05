var utils = require('./utils.js');


function DBAdapter (settings) {
  this.data = utils.defecto(settings.testData, {});
}
utils.declare(DBAdapter, {
  save: function(scope, key, obj, cb) {
    if (!this.data[scope]) this.data[scope] = {};
    this.data[scope][key] = obj;
    setTimeout(cb, 0, null);
  },
  find: function(scope, key, cb) {
    var scopeData = utils.defecto(this.data[scope], {});
    setTimeout(cb, 0, null, scopeData[key]);
  },
  delete: function(scope, key, cb) {
    if (this.data[scope]) {
      delete this.data[scope][key];
    }
    setTimeout(cb, 0);
  }
});

module.exports = DBAdapter;
