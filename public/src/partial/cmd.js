define(function (require) {
    var panelId = 'cmd-panel';
    var argsId = 'cmd-args';
    var optsId = 'cmd-options';
    var launchId = 'cmd-launch';

    function getPanel() {
        return document.getElementById(panelId);
    }

    function getArgsEl() {
        return document.getElementById(argsId);
    }

    function getOptsEl() {
        return document.getElementById(optsId);
    }

    var currentPath = '';
    var inited;

    function init() {
        var cons = require('./console');

        document.getElementById(launchId).onclick = function () {
            this.disabled = true;
            this.innerHTML = '<i class="fa fa-refresh fa-spin"></i>';

            var cmd = getCmdContent();

            cons.unfold();
            cons.clear();
            cons.log('$ ' + cmd + '\n');

            require('./help').fold();
            require('../launch')(
                cmd,
                require('./cwd').get(),
                cmdLog,
                cmdExit
            );
        };

        inited = 1;
    }

    function cmdLog(text) {
        require('./console').log(text);
    }

    function cmdExit() {
        require('./help').unfold();

        var launchBtn = document.getElementById(launchId);
        launchBtn.innerHTML = '<i class="fa fa-play"></i>';
        launchBtn.disabled = false;
        launchBtn = null;

        require('./console').scrollToBottom();
    }

    function getCmdContent() {
        var cmd = ['edp'];
        currentPath && cmd.push(currentPath);

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
        });

        var args = getArgsEl().value;
        args && cmd.push(args);
        return cmd.join(' ');
    }

    return {
        hide: function () {
            getPanel().style.display = 'none';
        },

        show: function () {
            getPanel().style.display = '';
        },

        get: getCmdContent,

        update: function (info) {
            if (!inited) {
                init();
            }

            currentPath = info.path;
            document.getElementById(argsId).value = '';

            var opts = info.options || [];
            var len = opts.length;
            var optsEl = getOptsEl();
            if (len) {
                var optsHtml = ['<legend>Options:</legend>'];
                for (var i = 0; i < len; i++) {
                    var opt = opts[i];
                    var textValue = false;
                    if (/\:$/.test(opt)) {
                        textValue = true;
                        opt = opt.slice(0, opt.length - 1);
                    }

                    var optionDomId = 'cmd-option-' + opt;
                    optsHtml.push(
                        '<label for="' + optionDomId + '"><b>--',
                        opt,
                        '</b><input type="' + (textValue ? 'text' : 'checkbox' ) + '" id="' + optionDomId + '">',
                        '</label>'
                    );
                }

                optsEl.style.display = '';
                optsEl.innerHTML = optsHtml.join('');
            }
            else {
                optsEl.style.display = 'none';
            }
        }
    };
});
