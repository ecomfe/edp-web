/**
 * @file 控制器与其初始化
 * @author errorrik[errorrik@gmail.com]
 */

var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var util = require('../util');

/**
 * 初始化
 *
 * @param {express} app express服务实例
 */
exports.init = function (app) {
    // for parsing application/json
    app.use(bodyParser.json());

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    exports.routeNav(app);
    exports.routeRequireConfig(app);
    exports.routeCwd(app);
    exports.routeLS(app);
    exports.routeCat(app);
};

var cmdService = require('../service/cmd');

/**
 * 导航信息请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeNav = function (app) {
    var only4web = [];
    var navData = {
        builtin: cmdService.builtinCommands,
        user: cmdService.userCommands,
        only4web: only4web
    };

    var extensionDirs = util.getExtensionDirs();
    extensionDirs.forEach(function (dir) {
        var webPub = path.resolve(dir, 'web', 'public');
        var pkgName = path.basename(dir);

        if (!fs.existsSync(webPub) || !fs.statSync(webPub).isDirectory()) {
            return;
        }

        fs.readdirSync(webPub).forEach(function (pubFile) {
            var indexFile = path.resolve(webPub, pubFile, 'index.html');
            if (fs.existsSync(indexFile)) {
                var fileData = util.readYFMFile(indexFile);
                var yfm = fileData.data;
                if (!yfm.title) {
                    return;
                }

                var funcInfo = {
                    title: yfm.title,
                    path: pkgName + '/' + pubFile,
                    html : fileData.content || ''
                };
                only4web.push(funcInfo);

                // js module info
                var jsModule = yfm.jsModule;
                if (!jsModule) {
                    if (fs.existsSync(path.resolve(webPub, pubFile, 'index.js'))) {
                        jsModule = 'index';
                    }
                }
                funcInfo.jsModule = jsModule;

                // css file info
                var cssFile = yfm.cssFile;
                if (!cssFile) {
                    if (fs.existsSync(path.resolve(webPub, pubFile, 'index.css'))) {
                        cssFile = 'index.css';
                    }
                }
                funcInfo.cssFile = cssFile;
            }
        });
    });

    var content = 'var NAV = ' + JSON.stringify(navData) + ';';

    app.get('/nav.js', function (request, response) {
        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end(content);
    });
};

/**
 * 当前目录信息请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeCwd = function (app) {
    app.get('/cwd.js', function (request, response) {
        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end('var DEFAULT_CWD = "' + process.cwd() + '";');
    });
};

/**
 * 当前amd配置信息请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeRequireConfig = function (app) {
    var extensionDirs = util.getExtensionDirs();
    var config = {
        baseUrl: './src',
        packages: [
            {
                name: 'etpl',
                location: '../dep/etpl'
            }
        ]
    };
    var path = require('path');

    extensionDirs.forEach(function (dir) {
        var pkgName = path.basename(dir);
        config.packages.push({
            name: pkgName,
            location: '/_static/' + pkgName,
            main: 'index'
        });
    });

    var configStr = 'require.config(' + JSON.stringify(config) + ');';
    app.get('/require.config.js', function (request, response) {
        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end(configStr);
    });
};


/**
 * 目录遍历请求的路由
 *
 * @param {express} app express服务实例
 */
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

/**
 * 文件内容查看请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeCat = function (app) {
    app.post('/cat', function (request, response) {
        var cwd = request.body.cwd;
        var file = path.resolve(cwd, request.body.file);

        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
            response.end(fs.readFileSync(file, 'UTF-8'));
        }
        else {
            response.status(404).end();
        }
    });
};

