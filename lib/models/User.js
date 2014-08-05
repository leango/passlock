/**
 * Readonly model user
 */

var Model = require('./Model.js');
var utils = require('../utils.js');
var config = require('../config.js');
var AccessToken = require('./AccessToken.js');

var logger = Model.logger;

function User() {}
utils.inherit(User, Model, {
  init: function(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.email = obj.email;
    this.createTime = obj.signupTimestamp;
  },
  getObj: function() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createTime: this.createTime
    };
  },
  getKey: function() {
    if (!this.token) {
      logger.warn('Call :getKey on uninitial User instance.');
    }
    return this.id;
  },
  getScope: function() {
    return 'user';
  },
  save: function(cb) {
    logger.warn('Model user is readyonly');
  },
  delete: function(cb) {
    logger.warn('Model user is readyonly');
  },
  find: function(key, cb) {
    require('../lockit').lockit.adapter.find('id', key, cb);
  }
});
module.exports = User;