var path = require('path');
var fs = require('fs');

// find edp install directory
var edpPkgPath = (function () {
    var installPath = path.resolve(__dirname, '..', '..');
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
var edpUtil = require(path.resolve(edpPkgPath, 'lib', 'util.js'));

var extensionDirs = edpHelp.getPackages();
var extensionInfo = {};
var disabledCommands = {};

extensionDirs.forEach(function (pkgName) {
    var dir = path.resolve(edpPkgPath, '..', pkgName);
    if (!fs.existsSync(dir)) {
        return;
    }

    var info = JSON.parse(
        fs.readFileSync(path.resolve(dir, 'package.json'), 'UTF-8')
    );

    var webInfo = info.web || {};
    var disabledCmds = webInfo.disabledCommands || [];
    disabledCmds.forEach(function (cmd) {
        disabledCommands[cmd] = 1;
    });

    extensionInfo[pkgName] = info;
});

exports.getExtensionDirs = function () {
    return extensionDirs;
};

exports.getBuiltinCommands = function () {
    return edpHelp.getBuiltinCommands();
};

exports.getUserCommands = function () {
    return edpHelp.getUserCommands();
};

exports.getDisabledCommands = function () {
    return disabledCommands;
}
