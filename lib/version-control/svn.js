var exec = require('child_process').exec;
var async = require('async');
var svn = {};

module.exports = svn;

svn.info = function (directory, finished) {
    function getInfo(callback) {
        var cmd = 'cd "' + directory + '"; svn info';
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                console.log(err)
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
            data.updateTime = Date.parse(infoData['Last Changed Rev']);
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
