var Model = require('./Model.js');
var utils = require('../utils.js');
var config = require('../config.js');

var logger = Model.logger;
function Client() {}
utils.inherit(Client, Model, {
  init: function(obj) {
    this.id = obj.id;
    this.secret = obj.secret;
    this.name = obj.name;
    this.redirects = {};
    var redirects = obj.redirects;
    if (redirects.split) redirects = redirects.split(' ');
    if (!(redirects instanceof Array)) redirects = [];
    for(var i=0; i<redirects.length; ++i) {
      this.redirects[redirects[i]] = true;
    }
  },
  getObj: function() {
    return {
      id: this.id,
      secret: this.secret,
      name: this.name,
      redirects: Object.keys(this.redirects).join(' ')
    };
  },
  getKey: function() {
    if (!this.code) {
      logger.warn('Call :getKey on uninitial Client instance.');
    }
    return this.id;
  },
  getScope: function() {
    return 'client';
  },
  checkRedirectURI: function(uri) {
    // TODO: check redirect uri
    return this.redirects[uri];
  }
});
module.exports = Client;
