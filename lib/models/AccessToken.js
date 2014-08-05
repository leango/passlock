var Model = require('./Model.js');
var utils = require('../utils.js');
var config = require('../config.js');

var logger = Model.logger;
function AccessToken() {}
utils.inherit(AccessToken, Model, {
  init: function(obj) {
    this.type = obj.type;
    this.token = obj.token;
    this.userId = obj.userId;
    this.clientId = obj.clientId;
    this.scope = obj.scope;
    this.createTime = obj.createTime;
    this.expirationTime = obj.expirationTime;
  },
  getObj: function() {
    return {
      type: this.type,
      token: this.token,
      userId: this.userId,
      clientId: this.clientId,
      scope: this.scope,
      createTime: this.createTime,
      expirationTime: this.expirationTime
    };
  },
  getKey: function() {
    if (!this.token) {
      logger.warn('Call :getKey on uninitial AccessToken instance.');
    }
    return this.token;
  },
  getScope: function() {
    return 'access_token';
  }
});
module.exports = AccessToken;