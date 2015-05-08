/**
 * @file 主启动模块
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    /**
     * 管理当前页面的模块对象，用于离开当前页面时，调用模块的unload，做清扫工作
     * 仅有web专属功能时，该变量存在值
     *
     * @inner
     * @type {Object}
     */
    var currentFuncModule;

    /**
     * 卸载当前功能
     * 在载入一个新功能时，需要卸载
     *
     * @inner
     */
    function unloadFunc() {
        if (currentFuncModule) {
            currentFuncModule.unload && currentFuncModule.unload();
            var links = document.getElementsByTagName('link');
            var len = links.length;
            while (len--) {
                var link = links[len];
                if (link.getAttribute('data-dynamic')) {
                    link.parentNode.removeChild(link);
                }
            }
        }

        currentFuncModule = null;
    }

    /**
     * 载入web专属功能
     *
     * @inner
     * @param {Object} info web专属功能信息
     */
    function loadWebFunc(info) {
        unloadFunc();
        document.getElementById('main').style.display = '';

        require('./partial/title').set(info.title);

        var board = require('./partial/board');
        board.setHTML(info.html);
        board.show();

        var help = require('./partial/help');
        help.hide();

        require('./partial/cmd').hide();

        var jsModule = info.jsModule;
        if (jsModule) {
            require([info.path + '/' + jsModule], function (mod) {
                currentFuncModule = mod;
                mod.load && mod.load();
            });
        }

        var cssFile = info.cssFile;
        if (cssFile) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', '/_static/' + info.path + '/' +cssFile);
            link.setAttribute('data-dynamic', '1');
            var parent = document.getElementsByTagName('head')[0]
                || document.body;
            parent.appendChild(link);
        }
    }

    /**
     * 载入命令运行功能
     *
     * @inner
     * @param {Object} info 当前命令信息
     */
    function loadCmdFunc(info) {
        unloadFunc();
        document.getElementById('main').style.display = '';

        require('./partial/title').set(info.path + ' - ' + info.description);

        var cons = require('./partial/console');
        cons.clear();
        cons.hide();

        var cmd = require('./partial/cmd');
        cmd.update(info);
        cmd.show();

        var help = require('./partial/help');
        help.setContentByMarkdown(info.help);
        help.show();

        var board = require('./partial/board');
        board.setHTML('');
        board.hide();
    }

    return {
        /**
         * 启动edp web界面功能
         */
        start: function () {
            require('./launch').init();
            require('./partial/cwd').init(DEFAULT_CWD);

            var nav = require('./partial/nav');
            nav.behavior(loadWebFunc, loadCmdFunc);
            nav.init(NAV);
        }
    };
});
