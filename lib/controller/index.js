
var bodyParser = require('body-parser');

exports.init = function (app) {
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    exports.routeCommands(app);
    exports.routeCwd(app);
    exports.routeLS(app);
};

exports.routeCommands = function (app) {
    app.get('/commands', require('./commands'));
};

exports.routeCwd = function (app) {
    app.get('/cwd', function (request, response) {
        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end('var DEFAULT_CWD = "' + process.cwd() + '";');
    });
};

var fs = require('fs');
var path = require('path');
exports.routeLS = function (app) {
    var IGNORE_DIRS = {
        'node_modules': 1
    };
    app.post('/ls', function (request, response) {
        var dir = request.body.dir;

        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        if (!dir || !fs.statSync(dir).isDirectory()) {
            response.end('[]');
        }
        else {
            var files = fs.readdirSync(dir);
            files = files.filter(function (file) {
                if (file.indexOf('.') === 0 || IGNORE_DIRS[file]) {
                    return false;
                }


                return fs.statSync(path.resolve(dir, file)).isDirectory();
            });
            response.end(JSON.stringify(files));
        }
    });
};
