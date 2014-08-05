var fs = require('fs');
var path = require('path');
fs.readdirSync(__dirname).forEach(function(fileName) {
  if (!/^[A-Z]/.test(fileName)) return;
  var modelName = fileName.slice(0, -3);
  exports[modelName] = require(path.join(__dirname, fileName));
});
