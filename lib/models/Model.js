var utils = require('../utils');
var config = require('../config.js');
var logger = config.getLogger('models');
function Model (obj) {}
utils.declare(Model, {
  save: function(cb) {
    var scope = this.getScope();
    var key = this.getKey();
    var obj = this.getObj();
    logger.debug('save scope:key %s:%s %j', scope, key, obj);
    config.db.save(this.getScope(), this.getKey(), this.getObj(), cb);
  },
  sync: function(cb) {
    var self = this;
    this.find(this.getKey(), function(err, obj) {
      if (err) return cb(err);
      self.init(obj);
      cb(null);
    });
  },
  find: function(key, cb) {
    config.db.find(this.getScope(), key, cb);
  },
  delete: function(cb) {
    config.db.delete(this.getScope(), this.getKey(), cb);
  },
  expired: function() {
    if (!(this.expirationTime instanceof Date)) return false;
    return new Date() > this.expirationTime;
  },
  /**
   * init __this__ object with obj
   */
  init: function(obj) {
    throw new Error('Should now call Model.init directly');
  },
  /**
   * getObj should return a hash table structure.
   * @return {HashTable}
   */
  getObj: function() {
    throw new Error('Should not call Model.getObj directly');
  },
  /**
   * getKey should return primary key in the hash table.
   * Key in redis.
   * @return {String}
   */
  getKey: function() {
    throw new Error('Should not call Model.getKey directly');
  },
  /**
   * getScope should return a string which can identify
   * the Model from others. Collection name in mongodb.
   * @return {String}
   */
  getScope: function() {
    throw new Error('Should not call Model.getScope directly');
  }
});
module.exports = Model;
module.exports.logger = logger;
