var Model = require('./Model.js');
var utils = require('../utils.js');
var config = require('../config.js');

var logger = Model.logger;
function AuthorizationCode() {}
utils.inherit(AuthorizationCode, Model, {
  init: function(obj) {
    this.code = obj.code;
    this.clientId = obj.clientId;
    this.userId = obj.userId;
    this.scope = obj.scope;
    this.redirectURI = obj.redirectURI;
    this.createTime = obj.createTime;
    this.expirationTime = obj.expirationTime;
  },
  getObj: function() {
    return {
      code: this.code,
      clientId: this.clientId,
      userId: this.userId,
      scope: this.scope,
      redirectURI: this.redirectURI,
      createTime: this.createTime,
      expirationTime: this.expirationTime
    };
  },
  getKey: function() {
    if (!this.code) {
      logger.warn('Call :getKey on uninitial AuthorizationCode instance.');
    }
    return this.code;
  },
  getScope: function() {
    return 'authorization_code';
  }
});
module.exports = AuthorizationCode;
