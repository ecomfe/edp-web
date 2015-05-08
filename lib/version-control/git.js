var exec = require('child_process').exec;
var async = require('async');
var git = {};

module.exports = git;

function trim(source) {
    return source.replace(/\n/g, '');
}

git.info = function (directory, finished) {
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
