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

    var currentCmdPath;

    function selectCmd(path) {
        var cmd = commandCache[path];
        currentCmdPath = path;
        var optionsHtml = ['<legend>Options:</legend>'];
        var cmdOptions = cmd.options || [];
        for (var i = 0, l = cmdOptions.length; i < l; i++) {
            var opt = cmdOptions[i];
            var textValue = false;
            if (/\:$/.test(opt)) {
                textValue = true;
                opt = opt.slice(0, opt.length - 1);
            }

            var optionDomId = 'cmd-option-' + opt;

            optionsHtml.push(
                '<label for="' + optionDomId + '"><b>--',
                opt,
                '</b><input type="' + (textValue ? 'text' : 'checkbox' ) + '" id="' + optionDomId + '">',
                '</label>'
            );
        }

        document.getElementById('cmd-main').style.display = '';
        document.getElementById('cmd-args').value = '';
        $('#cmd-options').html(optionsHtml.join(''));
        $('#cmd-options')[l ? 'show' : 'hide']();
        $('#cmd-title').html(path + ' - ' + cmd.description);
        $('#cmd-all').html('');
        $('#help').html(markdown.toHTML(cmd.help || '没有详细的帮助信息'));
    }

    function getCmdContent() {
        var cmd = ['edp', currentCmdPath];

        $('#cmd-options input').each(function () {
            var input = this;
            var inputId = input.id;
            if(/^cmd-option-/.test(inputId)) {
                var optName = '--' + inputId.slice(11);

                if (input.type == 'checkbox') {
                    if (input.checked) {
                        cmd.push(optName);
                    }
                }
                else {
                    if (input.value) {
                        cmd.push(optName);
                        cmd.push(input.value);
                    }
                }
            }
        })

        var args = document.getElementById('cmd-args').value;
        args && cmd.push(args);
        return cmd.join(' ');
    }

    function initLaunchEvent() {
        $('#launch').click(function () {
            this.disabled = true;
            this.innerHTML = '<i class="fa fa-refresh"></i>';
            var cmd = getCmdContent();

            var launchConsole = document.getElementById('launch-console');
            launchConsole.innerHTML = '<code>$ ' + cmd + '\n\n</code>';
            launchConsole.style.display = '';
            document.getElementById('help').style.display = 'none';
            document.getElementById('help-title').style.display = 'none';

            require('./launcher')(
                cmd,
                require('./cwd').get(),
                cmdLog,
                cmdExit
            );
        });
    }

    function cmdLog(text) {
        var launchConsole = document.getElementById('launch-console');
        var code = document.createElement('code');
        code.innerHTML = text;

        launchConsole.appendChild(code);
    }

    function cmdExit() {
        document.getElementById('help').style.display = '';
        document.getElementById('help-title').style.display = '';

        var launchBtn = document.getElementById('launch');
        launchBtn.innerHTML = '<i class="fa fa-play"></i>';
        launchBtn.disabled = false;
        launchBtn = null;

        var launchConsole = document.getElementById('launch-console');
        launchConsole.scrollTop = launchConsole.scrollHeight;
    }

    return {
        set: function (data) {
            data = data || {};
            builtinCommands = data.builtin || [];
            userCommands = data.user || [];
            only4web = data.only4web || [];

            initView();
            initLaunchEvent();
        }
    };
});
