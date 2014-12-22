define(function (require) {

    var builtinCommands;
    var userCommands;
    var only4web;

    var commandCache = {};


    var currentPageModule;
    var only4webInfos = {};
    function initOnly4WebNav() {
        var html = ['<h3>专属功能</h3>', '<ul>'];
        for (var i = 0, l = only4web.length; i < l; i++) {
            var info = only4web[i];
            only4webInfos[info.path] = info;
            html.push('<li data-func-path="' + info.path + '">' + info.title + '</li>');
        }
        html.push('</ul>');

        var wrap = document.getElementById('only4web');
        wrap.innerHTML = html.join('');
        wrap.onclick = function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            if (target.tagName == 'LI') {
                if (currentPageModule) {
                    currentPageModule.unload && currentPageModule.unload();
                    var links = document.getElementsByTagName('link');
                    var len = links.length;
                    while (len--) {
                        var link = links[len];
                        if (link.getAttribute('data-dynamic')) {
                            link.parentNode.removeChild(link);
                        }
                    }
                }

                var info = only4webInfos[target.getAttribute('data-func-path')];
                document.getElementById('only4web-page').innerHTML = info.html;

                var jsModule = info.jsModule;
                if (jsModule) {
                    require([info.path + '/' + jsModule], function (mod) {
                        currentPageModule = mod;
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
        }
    }

    var viewInited;
    function initView() {
        if (viewInited) {
            return;
        }

        initOnly4WebNav();

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

        $('#commands')
            .html(listHtml.join(''))
            .click(function (e) {
                if (e.target.tagName === 'LI') {
                    var cmdPath = e.target.getAttribute('data-index');
                    selectCmd(cmdPath);
                }
            });

        $('#toggle-console').click(function () {
            $('#launch-console').toggle();
        });
        viewInited = 1;
    }


    return {
        set: function (data) {
            data = data || {};
            builtinCommands = data.builtin || [];
            userCommands = data.user || [];
            only4web = data.only4web || [];

            initView();
        }
    };
});
