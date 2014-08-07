/**
 * Extend an object with another object
 * @param  {Object} obj      object to be extended
 * @param  {Object} ext      extension object
 * @param  {bool} override   Overwrite existing properties in obj
 * @param  {bool} deep       Doing an deep extend (perform extend on every object property)
 * @return {Object}          reference to obj
 */
function extend(obj, ext, override, deep) {
  var key;
  if (override) {
    if (deep)
      _overrideDeepExtend(obj, ext);
    else
      for (key in ext)
        obj[key] = ext[key];
  } else {
    if (deep)
      _deepExtend(obj, ext);
    else
      for (key in ext)
        if (!(key in obj))
          obj[key] = ext[key];
  }
  return obj;
}

function _overrideDeepExtend(obj, ext) {
  for (var key in ext)
    if (Object.isObjectStrict(obj[key]) && Object.isObjectStrict(ext[key]))
      _overrideDeepExtend(obj[key], ext[key]);
    else
      obj[key] = ext[key];
}

function _deepExtend(obj, ext) {
  for (var key in ext)
    if (Object.isObjectStrict(obj[key]) && Object.isObjectStrict(ext[key]))
      _deepExtend(obj[key], ext[key]);
    else if (!(key in obj))
      obj[key] = ext[key];
}

/**
 * Define properties of an Object, Which usually used to extend prototype
 *   of an object, as it will set properties as non-enumerable, and will
 *   turn setValue(value) and getValue() functions to setter and getters.
 * Note: You should only use $define or Object.defineProperty on prototype,
 *   or on a class' itself (to define static methods), instead of on instances
 *   which could lead to severe performance issue.
 * @param  {Object} object    target object
 * @param  {Object} prototype extension object
 * @param  {bool} preserve    preserve existing property
 * @return {Object}           reference to object
 */
function define(object, prototype, preserve) {
  Object.getOwnPropertyNames(prototype).forEach(function(key) {
    if (preserve && (key in object))
      return;
    var desc = Object.getOwnPropertyDescriptor(prototype, key);
    if ('value' in desc)
      desc.writable = true;
    delete desc.enumerable;
    delete desc.configurable;
    Object.defineProperty(object, key, desc);
  });
  return object;
}

/**
 * Declare a Class.
 * @param  {Function} fn      constructor of the Class
 * @param  {Object} prototype prototype of Class
 * @return {Function}         reference to constructor
 */
function declare(fn, prototype) {
  fn.prototype.constructor = fn;
  define(fn.prototype, prototype);
  return fn;
}

/**
 * Inherit another Class to current Class
 * @param  {Function} fn      constructor of the Class
 * @param  {Function} parent  parent Class
 * @param  {Object} prototype prototype of Class
 * @return {Function}         reference to constructor
 */
function inherit(fn, parent, prototype) {
  fn.prototype = {
    constructor: fn,
    __proto__: parent.prototype
  };
  if (prototype)
    define(fn.prototype, prototype);
  return fn;
}

/**
 * Return default value of an undefined variable.
 * @param  {Mixed} val  value
 * @param  {Mixed} def  default value
 * @return {Mixed}
 */
function defecto(val, def) {
  return val === undefined ? def : val;
}

/**
 * Use Object.prototype.toString to determine an element's type
 * This method provide more stricter strategy on type detection,
 * can be worked with typeof.
 * @param  {Mixed}  obj  Variable
 * @return {String}      type of the variable, like typeof,
 *                       but with better precision.
 */
function tipode(obj) {
  var type = Object.prototype.toString.call(obj);
  return type.substring(8, type.length - 1).toLowerCase();
}

exports.extend = extend;
exports.define = define;
exports.declare = declare;
exports.inherit = inherit;
exports.defecto = defecto;
exports.tipode = tipode;
var uid = require('uid');
exports.uid = function(len) {
  var uidLength = len - 11;
  if (!uidLength || uidLength < 13) uidLength = 13;
  var now = new Date();
  var timestamp = now.getTime().toString(16)
  return uid(uidLength) + timestamp;
}
exports.ms = require('ms');


define(Object, {
  isObjectStrict: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }
});




exports.ensureLogin = function ensuerLogin(options) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }
  if (!options || !options.redirectTo) throw new Error('options.redirectTo is required');
  
  return function(req, res, next) {
    var currentUrl = req.originalUrl || req.url;
    if (req.session.loggedIn !== true) {
      req.session.returnTo = currentUrl;
      return res.redirect(options.redirectTo);
    }
    req.user = req.session.user;
    next();
  }
}

exports.populateUser = function(req, res, next) {
  req.user = req.session && req.session.user;
  next();
}

