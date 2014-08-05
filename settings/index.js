var path = require('path');
var fs = require('fs');
fs.readdirSync(__dirname).forEach(function(fileName) {
  if (!/\.js$/.test(fileName)) return;
  if (fileName === 'index.js') return;
  var configName = fileName.slice(0, -3);
  exports[configName] = require(path.join(__dirname, fileName));
});
