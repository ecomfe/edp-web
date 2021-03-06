/**
 * @file 页面部件：控制台区域
 * @author errorrik[errorrik@gmail.com]
 */

// node 的 child_process 运行时候把标准输出中的 ansi escape 都去掉了
// 所以拿不到颜色信息。反正没颜色，用 pre + code 还会创建很多 dom 节点
// 于是控制台运行结果的输出就用 textarea 了

define(function (require) {
    var ttyId = 'console-tty';
    var switchId = 'console-switch';
    var prventHide = 0;

    /**
     * 获取控制台输出元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getTTY() {
        return document.getElementById(ttyId);
    }

    /**
     * 获取控制台开关元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getSwitch() {
        return document.getElementById(switchId);
    }

    var isHidden = 0;
    var texts = [];

    var exports = {

        /**
         * 隐藏控制台区域
         */
        hide: function () {
            getTTY().style.display = 'none';
            getSwitch().className = '';
            isHidden = 1;
        },

        /**
         * 显示控制台区域
         */
        show: function () {
            getTTY().style.display = '';
            getSwitch().className = 'active';
            isHidden = 0;
            prventHide = 1;
        },

        /**
         * 显示/隐藏 控制台区域
         */
        toggle: function () {
            if (isHidden) {
                this.show();
            }
            else {
                this.hide();
            }
        },

        /**
         * 清除控制台输出
         */
        clear: function () {
            getTTY().value = '';
            texts = [];
        },

        /**
         * 输出控制台信息
         *
         * @param {string} output 信息串
         */
        log: function (output) {
            var lines = output.replace(/(^[\x0d\x0a]+|[\x0d\x0a]+$)/g, '').split('\n');
            texts.push.apply(texts, lines);

            // build 过程可能处理很多文件，每个文件都会有一条提示
            // 在 cli 下，后面的提示会覆盖前面的提示
            // 但是 child_process 运行下，相关 console 信息缺失
            // 所以这里专门针对 build 的提示信息特征，做了一个 hack
            // 以防止输出的提示信息过长，不方便看，也拖慢网页速度
            var processReg = /^\s+\(\d+ms\)\s+[⋅.]{3,}\s+(\[\d+\/\d+\]:[^\(\)]+\(\d+ms\))?/i;
            var len = texts.length - 1;
            while (len--) {
                var current = texts[len];
                var next = texts[len + 1];
                if (processReg.test(next) && (/^\s*$/.test(current) || processReg.test(current))) {
                    texts.splice(len, 1);
                }
            }

            getTTY().value = texts.join('\n');
        },

        /**
         * 控制台输出区域滚动到顶部
         */
        scrollToTop: function () {
            var tty = getTTY();
            tty.scrollTop = 0;
        },

        /**
         * 控制台输出区域滚动到底部
         */
        scrollToBottom: function () {
            var tty = getTTY();
            tty.scrollTop = tty.scrollHeight;
        },

        /**
         * 命令完成。将输出完成标识，并滚动到底部
         */
        complete: function () {
            this.log('\n');
            this.log('\n');
            this.log('------ Completed! ------');
            this.log('\n');
            this.scrollToBottom();
        }
    };

    // 标题区域事件挂载，使点击时隐藏或展开
    document.getElementById(switchId).onclick = function () {
        exports.toggle();
    };

    $(document).bind('click', function (e) {
        if(e.target.id != switchId && e.target.id != ttyId && !prventHide){
            exports.hide();
        }

        prventHide = 0;
    });

    return exports;
});
