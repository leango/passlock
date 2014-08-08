var lockit = require('./lockit').lockit;
exports.ensureLogin = function(opts) {
  return function(req, res, next) {
    var currentUrl = req.originalUrl || req.url;
    if (req.session.loggedIn !== true) {
      req.session.returnTo = currentUrl;
      if (lockit)
        return res.redirect(lockit.config.login.route);
      return res.status(204).end();
    }
    req.user = req.session.user;
    next();
  }
}
exports.ensureLogout = function(opts) {
  return function(req, res, next) {
    var currentUrl = req.originalUrl || req.url;
    if (req.session.loggedIn === true) {
      req.session.returnTo = currentUrl;
      if (lockit)
        return res.redirect(lockit.config.logout.route);
      return res.status(204).end();
    }
    next();
  }
}
exports.populateUser = function(opts) {
  return function(req, res, next) {
    req.user = req.session && req.session.user;
    next();
  }
}