define(function (require) {
    var builtinCommands;
    var userCommands;
    var only4web;

    var inited;
    function initView() {
        if (inited) {
            return;
        }
        inited = 1;

        initOnly4Web();
        initCommands();
    }

    var handlers = {
        on4web: function () {},
        oncmd: function () {}
    };

    var currentPageModule;
    var only4webInfos = {};
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

    var commandCache = {};
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

    function setCurrent(liEl) {
        var lis = document.getElementById('aside-nav').getElementsByTagName('li');
        var len = lis.length;
        while (len--) {
            var li = lis[len];
            li.setAttribute('data-current', li === liEl ? 1 : 0);
        }
    }

    var beforeHash = '';
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

            switch (type) {
                case 'web':
                    handlers.on4web(only4webInfos[path]);
                    setCurrent(document.getElementById('navweb--' + path));
                    break;
                case 'cmd':
                    handlers.oncmd(commandCache[path]);
                    setCurrent(document.getElementById('navcmd--' + path));
                    break;
            }
        }
    }

    return {
        init: function (data) {
            data = data || {};
            builtinCommands = data.builtin || [];
            userCommands = data.user || [];
            only4web = data.only4web || [];

            initView();

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

        behavior: function (on4web, oncmd) {
            on4web && (handlers.on4web = on4web);
            oncmd && (handlers.oncmd = oncmd);
        }
    };
});
