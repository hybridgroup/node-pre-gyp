var path = require('path'),
    fs = require('fs'),
    existsSync = fs.existsSync;

var Utils = {
  targetsExist: function(targets, from, executable) {
    var allFound = false;

    if ((targets !== null) && (Array.isArray(targets))) {
      var targetsFound = targets.map(function(target) {
        var appendMod = !!executable ? '' : '.node';
        var targetPath = path.join(from, target + appendMod);

        return existsSync(targetPath);
      });

      if (targetsFound.indexOf(false) == -1) {
        allFound = true;
      }
    }

    return allFound;
  }
};

module.exports = Utils;
