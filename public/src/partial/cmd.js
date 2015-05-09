/**
 * @file 页面部件：命令运行区域
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    var panelId = 'cmd-panel';
    var argsId = 'cmd-args';
    var optsId = 'cmd-options';
    var launchId = 'cmd-launch';

    /**
     * 获取区域面板元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getPanel() {
        return document.getElementById(panelId);
    }

    /**
     * 获取args表单区域面板元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getArgsEl() {
        return document.getElementById(argsId);
    }

    /**
     * 获取options表单区域面板元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getOptsEl() {
        return document.getElementById(optsId);
    }

    var currentPath = '';
    var inited;

    /**
     * 初始化命令运行区域
     *
     * @inner
     */
    function init() {
        var cons = require('./console');

        document.getElementById(launchId).onclick = function () {
            this.disabled = true;
            this.innerHTML = '<i class="fa fa-refresh fa-spin"></i>';

            var cmd = getCmdContent();

            cons.show();
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

    /**
     * 输出命令运行提示
     *
     * @inner
     * @param {string} text 命令运行提示串
     */
    function cmdLog(text) {
        require('./console').log(text);
    }

    /**
     * 命令运行结束的行为
     *
     * @inner
     */
    function cmdExit() {
        require('./help').unfold();

        var launchBtn = document.getElementById(launchId);
        launchBtn.innerHTML = '<i class="fa fa-play"></i>';
        launchBtn.disabled = false;
        launchBtn = null;

        require('./console').complete();
    }

    /**
     * 从命令面板的用户输入中获取命令
     *
     * @inner
     * @return {string}
     */
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
        /**
         * 隐藏命令运行区域
         */
        hide: function () {
            getPanel().style.display = 'none';
        },

        /**
         * 显示命令运行区域
         */
        show: function () {
            getPanel().style.display = '';
        },

        /**
         * 获取命令
         *
         * @return {string}
         */
        get: getCmdContent,

        /**
         * 显示命令运行区域
         *
         * @param {Object} info 命令信息
         * @param {string} info.path 命令路径信息
         * @param {Array=} info.options 命令options信息
         */
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
