/**
 * @file 工具方法集
 * @author errorrik[errorrik@gmail.com]
 */


var path = require('path');
var fs = require('fs');
var mime = require('mime');
var edp = require('edp-core');

// 查找edp主包的安装目录
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

// require edp主包下的模块，后面的数据预读使用
var edpCmd = require(path.resolve(edpPkgPath, 'lib', 'cmd.js'));
var edpHelp = require(path.resolve(edpPkgPath, 'lib', 'help.js'));
var edpUtil = require(path.resolve(edpPkgPath, 'lib', 'util.js'));

// 初始化extension和disabledCommands的相关信息
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

/**
 * 获取扩展目录列表
 *
 * @return {Array}
 */
exports.getExtensionDirs = function () {
    return extensionDirs;
};

/**
 * 获取内建命令列表
 *
 * @return {Array}
 */
exports.getBuiltinCommands = function () {
    return edpHelp.getBuiltinCommands();
};

/**
 * 获取用户命令列表
 *
 * @return {Array}
 */
exports.getUserCommands = function () {
    return edpHelp.getUserCommands();
};

/**
 * 获取edp web禁用的命令列表
 *
 * @return {Object}
 */
exports.getDisabledCommands = function () {
    return disabledCommands;
};


var yaml = require('js-yaml');
var fileReg = /^(?:-{3,}\s*\n+)?([\s\S]+?)(?:\n+-{3,})(?:\s*\n+([\s\S]*))?/;

/**
 * 对yfm文件的front-matter区块进行解析和提取
 *
 * @inner
 * @param {string} source 文件内容
 * @return {Object}
 */
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

/**
 * 对yaml数据进行初次解析，主要是把行首的tab字符替换成2空格缩进
 *
 * @inner
 * @param {string} str 源yaml数据串
 * @return {string}
 */
function escapeYaml(str) {
    return str.replace(/\n(\t+)/g, function (match, tabs) {
        var result = '\n';

        for (var i = 0, len = tabs.length; i < len; i++) {
            result += '  ';
        }

        return result;
    });
}

/**
 * 读取使用yaml作为front-matter的文件
 *
 * @param {string} file 文件路径
 * @param {Object=} options yaml读取参数
 * @return {Object} {data:yaml data, content: file content}
 */
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

/**
 * 获取文件的mime type
 *
 * @param {string} file 文件路径
 * @return {string}
 */
exports.mimeLookup = function (file) {
    var mimeType = mime.lookup(file);

    switch (mimeType) {
        case 'application/javascript':
            return 'text/javascript';

        case 'application/json':
            return 'text/json';

        case 'application/octet-stream':
            var stat = fs.statSync(file);

            var bufSize = Math.min(stat.size, 4096);
            if (bufSize === 0) {
                return 'text/plain';
            }

            var buffer = new Buffer(bufSize);
            var fd = fs.openSync(file, 'r');
            fs.readSync(fd, buffer, 0, bufSize, 0);
            fs.closeSync(fd);

            if (!edp.fs.isBinary(buffer)) {
                return 'text/plain';
            }
            break;

        case 'application/x-sh':
            return 'text/x-sh';
    }

    return mimeType;
};
