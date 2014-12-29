/**
 * @file 页面部件：导航区域
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    var builtinCommands;
    var userCommands;
    var only4web;

    var inited;

    /**
     * 初始化导航区域的视图
     *
     * @inner
     */
    function initView() {
        if (inited) {
            return;
        }
        inited = 1;

        initOnly4Web();
        initCommands();
    }

    /**
     * 导航区域点击的行为函数，空函数是为了容错
     *
     * @type {Object}
     */
    var handlers = {
        on4web: function () {},
        oncmd: function () {}
    };

    /**
     * web专属功能信息缓存对象，用于点击行为的事件触发查找
     *
     * @inner
     * @type {Object}
     */
    var only4webInfos = {};

    /**
     * 初始化专属功能区域
     *
     * @inner
     */
    function initOnly4Web() {
        var html = ['<h3>专属功能</h3>', '<ul>'];
        for (var i = 0, l = only4web.length; i < l; i++) {
            var info = only4web[i];
            var path = info.path;
            only4webInfos[path] = info;
            var liId = path.replace(/\//g, '--');

            html.push('<li data-func-path="' + path + '" id="navweb--' + liId + '">' + info.title + '</li>');
        }
        html.push('</ul>');

        var wrap = document.getElementById('nav-4web');
        wrap.innerHTML = html.join('');
        wrap.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            if (target.tagName == 'LI') {
                location.hash = '#web!' + target.getAttribute('data-func-path');
            }
        };
        wrap = null;
    }

    /**
     * 命令信息缓存对象，用于点击行为的事件触发查找
     *
     * @inner
     * @type {Object}
     */
    var commandCache = {};

    /**
     * 初始化命令区域
     *
     * @inner
     */
    function initCommands() {
        var readState = [];
        var readStateLevel = 0;

        function genCmdHtml(cmds) {
            var html = [];
            for (var i = 0, l = cmds.length; i < l; i++) {
                var cmd = cmds[i];
                var cmdName = cmd.name;
                readState.push(cmdName);
                readStateLevel++;

                var cmdPath = readState.join('/');
                var liId = readState.join('--');
                cmd.path = cmdPath;
                commandCache[cmdPath] = cmd;
                html.push(
                    '<li data-index="' + cmdPath + '" id="navcmd--'+ liId + '" class="cmd-level-' + readStateLevel + '">' + cmdName + '</li>',
                    genCmdHtml(cmd.children || [])
                );

                readState.pop();
                readStateLevel--;
            }

            return html.join('');
        }

        var listHtml = [];
        if (builtinCommands && builtinCommands.length) {
            listHtml.push(
                '<h3>内置命令</h3><ul>',
                genCmdHtml(builtinCommands),
                '</ul>'
            );
        }

        if (userCommands && userCommands.length) {
            listHtml.push(
                '<h3>用户扩展命令</h3><ul>',
                genCmdHtml(userCommands),
                '</ul>'
            );
        }

        var wrap = document.getElementById('nav-cmd');
        wrap.innerHTML = listHtml.join('');
        wrap.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            if (target.tagName == 'LI') {
                location.hash = '#cmd!' + target.getAttribute('data-index');
            }
        };

        wrap = null;
    }

    /**
     * 设置当前选中功能
     *
     * @inner
     * @param {HTMLLiElement} liEl 当前选中功能对应的li元素
     */
    function setCurrent(liEl) {
        var lis = document.getElementById('aside-nav').getElementsByTagName('li');
        var len = lis.length;
        while (len--) {
            var li = lis[len];
            li.setAttribute('data-current', li === liEl ? 1 : 0);
        }
    }

    var beforeHash = '';

    /**
     * hash发生变化的处理函数
     *
     * @inner
     */
    function hashChange() {
        var index = location.href.indexOf('#');
        var hash = index === -1 ? '' : location.href.slice(index + 1);

        if (hash === beforeHash) {
            return;
        }

        beforeHash = hash;
        var parts = hash.split('!');
        if (parts.length === 2) {
            var type = parts[0];
            var path = parts[1];
            var navLiId = path.replace(/\//g, '--');
            switch (type) {
                case 'web':
                    handlers.on4web(only4webInfos[path]);
                    setCurrent(document.getElementById('navweb--' + navLiId));
                    break;
                case 'cmd':
                    handlers.oncmd(commandCache[path]);
                    setCurrent(document.getElementById('navcmd--' + navLiId));
                    break;
            }
        }
    }

    return {
        /**
         * 初始化导航区域
         *
         * @param {Object} data 导航信息对象
         */
        init: function (data) {
            // 初始化数据
            data = data || {};
            builtinCommands = data.builtin || [];
            userCommands = data.user || [];
            only4web = data.only4web || [];

            // 初始化视图
            initView();

            // 挂载页面hash变化的处理
            if (window.addEventListener) {
                window.addEventListener('hashchange', hashChange, false);
            }
            else if ('onhashchange' in window && document.documentMode > 7) {
                window.attachEvent('onhashchange', hashChange);
            }
            else {
                setInterval(hashChange, 1000);
            }
            hashChange();
        },

        /**
         * 设置页面发生跳转的行为
         *
         * @param {Function} on4web 跳转到web专属功能的行为
         * @param {Function} oncmd 跳转到命令运行功能的行为
         */
        behavior: function (on4web, oncmd) {
            on4web && (handlers.on4web = on4web);
            oncmd && (handlers.oncmd = oncmd);
        }
    };
});
