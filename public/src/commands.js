define(function (require) {

    var builtinCommands;
    var userCommands;

    var commandCache = {};

    var viewInited;
    function initView() {
        if (viewInited) {
            return;
        }

        var readState = [];
        var html = ['<ul>'];
        function genCmdHtml(cmds) {
            for (var i = 0, l = cmds.length; i < l; i++) {
                var cmd = cmds[i];
                var cmdName = cmd.name;
                readState.push(cmdName);

                var cmdPath = readState.join(' ');
                commandCache[cmdPath] = cmd;
                html.push('<li data-index="' + cmdPath + '" class="cmd-level-' + readState.length + '">' + cmdName + '</li>');
                genCmdHtml(cmd.children || []);
                readState.pop();
            }
        }
        genCmdHtml(builtinCommands);
        html.join('</ul>');

        $('#commands')
            .html(html.join(''))
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
            launchConsole.innerHTML = '<code>$ ' + cmd + '\n</code>';
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

            initView();
            initLaunchEvent();
        }
    };
});
