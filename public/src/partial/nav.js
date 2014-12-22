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
            only4webInfos[info.path] = info;
            html.push('<li data-func-path="' + info.path + '">' + info.title + '</li>');
        }
        html.push('</ul>');

        var wrap = document.getElementById('nav-4web');
        wrap.innerHTML = html.join('');
        wrap.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            if (target.tagName == 'LI') {
                var info = only4webInfos[target.getAttribute('data-func-path')];
                setCurrent(target);
                handlers.on4web(info);
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

                var cmdPath = readState.join(' ');
                cmd.path = cmdPath;
                commandCache[cmdPath] = cmd;
                html.push(
                    '<li data-index="' + cmdPath + '" class="cmd-level-' + readStateLevel + '">' + cmdName + '</li>',
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
                var cmdPath = e.target.getAttribute('data-index');
                setCurrent(target);
                handlers.oncmd(commandCache[cmdPath]);
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

    return {
        init: function (data) {
            data = data || {};
            builtinCommands = data.builtin || [];
            userCommands = data.user || [];
            only4web = data.only4web || [];

            initView();
        },

        behavior: function (on4web, oncmd) {
            on4web && (handlers.on4web = on4web);
            oncmd && (handlers.oncmd = oncmd);
        }
    };
});
