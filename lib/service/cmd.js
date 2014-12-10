var path = require('path');
var fs = require('fs');

// find edp install directory
var edpPkgPath = (function () {
    var installPath = path.resolve(__dirname, '..', '..', '..');
    if (!fs.existsSync(path.resolve(installPath, 'edp'))) {
        installPath = path.resolve(installPath, '..', '..');
    }

    var edpPath = path.resolve(installPath, 'edp');
    if (fs.existsSync(path.resolve(installPath, 'edp'))) {
        return edpPath;
    }
})();

var edpCmd = require(path.resolve(edpPkgPath, 'lib', 'cmd.js'));
var edpHelp = require(path.resolve(edpPkgPath, 'lib', 'help.js'));

var builtinCmds = edpHelp.getBuiltinCommands();
var userCmds = edpHelp.getUserCommands();

exports.builtinCommands = builtinCmds;
exports.userCommands = userCmds;
