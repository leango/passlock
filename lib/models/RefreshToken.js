var Model = require('./Model.js');
var utils = require('../utils.js');
var config = require('../config.js');
var AccessToken = require('./AccessToken.js');

var logger = Model.logger;

function RefreshToken() {}
utils.inherit(RefreshToken, Model, {
  init: function(obj) {
    this.type = obj.type;
    this.token = obj.token;
    this.accessToken = obj.accessToken;
    this.userId = obj.userId;
    this.clientId = obj.clientId;
    this.scope = obj.scope;
    this.createTime = obj.createTime;

    this.refreshTime = new Date();
    this.refreshCount = 0;
  },
  refreshAccessToken: function(refreshDuration) {
    var at = new AccessToken();
    var now = new Date();
    at.init({
      type: this.type,
      token: utils.uid(32),
      userId: this.userId,
      clientId: this.clientId,
      scope: this.scope,
      createTime: now,
      expirationTime: new Date(now.getTime() + refreshDuration)
    });
    this.accessToken = at.token;
    this.refreshTime = new Date();
    this.refreshCount ++;
    return at;
  },
  getObj: function() {
    return {
      type: this.type,
      token: this.token,
      accessToken: this.accessToken,
      userId: this.userId,
      clientId: this.clientId,
      scope: this.scope,
      createTime: this.createTime,

      refreshTime: this.refreshTime,
      refreshCount: this.refreshCount
    };
  },
  getKey: function() {
    if (!this.token) {
      logger.warn('Call :getKey on uninitial RefreshToken instance.');
    }
    return this.token;
  },
  getScope: function() {
    return 'refresh_token';
  }
});
module.exports = RefreshToken;