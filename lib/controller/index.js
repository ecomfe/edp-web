/**
 * @file 控制器与其初始化
 * @author errorrik[errorrik@gmail.com]
 */

var bodyParser = require('body-parser');
var edp = require('edp-core');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var charsetDetect = require('charset-detector');
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
    exports.routeRepoInfo(app);
    exports.routePreviewInfo(app);
    exports.routeFileSave(app);
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

/**
 * 目录repo信息请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeRepoInfo = function (app) {
    var git = require('../version-control/git');
    var svn = require('../version-control/svn');
    var async = require('async');
    var analyzers = [git, svn];

    app.post('/repo-info', function (request, response) {
        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');

        var i = 0;
        var repoInfo;
        var dir = request.body.dir;
        async.whilst(
            function () {
                return i < analyzers.length && !repoInfo;
            },
            function (callback) {
                var analyzer = analyzers[i++];
                analyzer.info(dir, function (err, info) {
                    if (info) {
                        repoInfo = info;
                    }

                    callback();
                })
            },
            function () {
                if (!repoInfo) {
                    response.end('false');
                    return;
                }
                response.end(JSON.stringify(repoInfo));
            }
        );
    });
};

/**
 * 预览信息请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routePreviewInfo = function (app) {
    app.post('/preview-info', function (request, response) {
        var file = request.body.file;
        var mimeType = mime.lookup(file);
        var info = {};

        // 逻辑是这样的：
        // 1. 文件不存在就直接报错了。不存在预览个毛啊
        // 2. 如果是没有后缀的文件，或者认不出来的，mime会识别成application/octet-stream
        //    这时候自动检测一下，看是binary文件还是text文件
        // 3. 对于text文件，太大的就不让看了
        // 4. 对于text文件，不是utf8的也不让看了
        if (!fs.existsSync(file)) {
            info.error = 'NO_FOUND';
        }
        else {
            if (!edp.fs.isBinary(file) && mimeType === 'application/octet-stream') {
                mimeType = 'text/plain';
            }
            else if (mimeType === 'application/javascript') {
                mimeType = 'text/javascript';
            }
            info.type = mimeType;

            switch (mimeType.split('/')[0]) {
                case 'text':
                    // 500K，暂时写死在这吧，魔法数字出现了
                    if (fs.statSync(file).size > 1024 * 500) {
                        info.error = 'TOO_LARGE';
                    }
                    else {
                        var buffer = require('fs').readFileSync(file);
                        var matches = charsetDetect(buffer);
                        var firstMatch;
                        if (matches
                            && (firstMatch = matches[0])
                            && (/^iso-8859/i.test(firstMatch.charsetName)
                                || /^windows-/i.test(firstMatch.charsetName)
                                || /^utf-8/i.test(firstMatch.charsetName)
                                )
                        ) {
                            info.data = buffer.toString('UTF-8');
                        }
                        else {
                            info.error = 'CHARSET_NO_SUPPORT';
                        }
                    }
                    break;

                case 'image':
                    info.data = fs.readFileSync(file).toString('base64');
                    break;
            }
        }

        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end(JSON.stringify(info));
    });
};

/**
 * 文件保存请求的路由
 *
 * @param {express} app express服务实例
 */
exports.routeFileSave = function (app) {
    app.post('/file-save', function (request, response) {
        var file = request.body.file;
        var content = request.body.content;
        var info = {};

        try {
            fs.writeFileSync(file, content, 'UTF-8');
            info.success = true;
        }
        catch (ex) {
            info.success = false;
            info.message = '';
        }

        response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        response.end(JSON.stringify(info));
    });
};

