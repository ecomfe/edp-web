/**
 * @file 版本控制相关功能 - git
 * @author errorrik[errorrik@gmail.com]
 */


var exec = require('child_process').exec;
var async = require('async');
var git = {};

module.exports = git;

/**
 * 把命令行返回的文本中空行给去掉
 * 主要用于处理返回的有用信息位于单行时，去除前后无用的空行
 *
 * @inner
 * @param {string} source 源信息串
 * @return {string}
 */
function trim(source) {
    return source.replace(/\n/g, '');
}

/**
 * 获取git信息
 *
 * @param {string} directory 目录
 * @param {Function} finished 获取信息完成回调函数
 */
git.info = function (directory, finished) {
    /**
     * 获取remote url
     *
     * @inner
     * @param {Function} callback 回调函数
     */
    function getUrl(callback) {
        var cmd = 'cd "' + directory + '"; git config --get remote.origin.url';
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                callback(err);
                return;
            }

            var data = {type: 'git'};
            data.url = trim(stdout);
            callback(null, data);
        });
    }

    /**
     * 获取revision和updateTime
     *
     * @inner
     * @param {Function} callback 回调函数
     */
    function getMeta(data, callback) {
        var cmd = 'cd "' + directory + '"; git show --quiet --format=%H%n%aD%n%s%n%B HEAD';
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                callback(err);
                return;
            }

            var lines = stdout.split('\n');
            data.revision = trim(lines.shift());
            data.updateTime = Date.parse(trim(lines.shift()));
            callback(null, data);
        });
    }

    /**
     * 获取branch
     *
     * @inner
     * @param {Function} callback 回调函数
     */
    function getBranch(data, callback) {
        var cmd = 'cd "' + directory + '"; git rev-parse --abbrev-ref HEAD';
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                callback(err);
                return;
            }

            data.branch = trim(stdout);
            callback(null, data);
        });
    }

    async.waterfall(
        [getUrl, getMeta, getBranch],
        function (err, data) {
            if (err) {
                finished(err);
                return;
            }

            finished(null, data);
        }
    );
};
