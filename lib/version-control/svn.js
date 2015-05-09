/**
 * @file 版本控制相关功能 - svn
 * @author errorrik[errorrik@gmail.com]
 */

var exec = require('child_process').exec;
var async = require('async');
var svn = {};

module.exports = svn;

/**
 * 获取svn信息
 *
 * @param {string} directory 目录
 * @param {Function} finished 获取信息完成回调函数
 */
svn.info = function (directory, finished) {
    /**
     * 获取基础信息
     *
     * @inner
     * @param {Function} callback 回调函数
     */
    function getInfo(callback) {
        var cmd = 'cd "' + directory + '"; svn info';
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                callback(err);
                return;
            }

            var data = {type: 'svn'};
            var infoData = {};
            var lines = stdout.split(/\r?\n/);
            lines.forEach(function (line) {
                if (line) {
                    var segs = line.split(': ');
                    infoData[segs[0]] = segs[1];
                }
            });
            data.url = infoData['URL'];
            data.updateTime = Date.parse(infoData['Last Changed Date']);
            data.revision = infoData['Last Changed Rev'];
            callback(null, data);
        });
    }

    async.waterfall(
        [getInfo],
        function (err, data) {
            if (err) {
                finished(err);
                return;
            }

            finished(null, data);
        }
    );
};
