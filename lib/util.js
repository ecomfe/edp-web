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

extensionDirs = extensionDirs
    .map(function (pkgName) {
        var dir = path.resolve(edpPkgPath, '..', pkgName);
        if (!fs.existsSync(dir)) {
            dir = path.resolve(edpPkgPath, 'node_modules', pkgName);
        }

        if (!fs.existsSync(dir)) {
            dir = '';
        }

        return dir;
    })
    .filter(function (content) {
        return !!content;
    });

extensionDirs.forEach(function (dir) {
    if (!dir) {
        return;
    }

    var pkgName = path.basename(dir);
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
};


var yaml = require('js-yaml');
var fileReg = /^(?:-{3,}\s*\n+)?([\s\S]+?)(?:\n+-{3,})(?:\s*\n+([\s\S]*))?/;

function splitYFMContent (source) {
    if (!fileReg.test(source)) {
        return {content: source};
    }

    var match = source.match(fileReg);
    data = match[1],
    content = match[2] || '';

    return {
        data: data,
        content: content
    };
}

function escapeYaml(str) {
    return str.replace(/\n(\t+)/g, function (match, tabs) {
        var result = '\n';

        for (var i = 0, len = tabs.length; i < len; i++) {
            result += '  ';
        }

        return result;
    });
}

exports.readYFMFile = function (file, options) {
    var content = fs.readFileSync(file, 'UTF-8');
    var result = splitYFMContent(content);
    var raw = result.data;
    var content = result.content;
    result.data = {};

    if (raw) {
        try {
            var data = yaml.load(escapeYaml(raw), options);

            if (typeof data === 'object') {
                result.data = data;
            }
        }
        catch (e) {}
    }

    return result;
};
