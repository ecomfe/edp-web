
// node 的 child_process 运行时候把标准输出中的 ansi escape 都去掉了
// 所以拿不到颜色信息。反正没颜色，用 pre + code 还会创建很多 dom 节点
// 于是控制台运行结果的输出就用 textarea 了

define(function (require) {
    var panelId = 'console-panel';
    var ttyId = 'console-tty';

    function getPanel() {
        return document.getElementById(panelId);
    }

    function getTTY() {
        return document.getElementById(ttyId);
    }

    getPanel().style.display = 'none';
    var isFold = 0;

    var texts = [];

    var exports = {
        show: function () {
            getPanel().style.display = '';
            this.fold();
        },

        hide: function () {
            getPanel().style.display = 'none';
        },

        fold: function () {
            getTTY().style.display = 'none';
            isFold = 1;
        },

        unfold: function () {
            getTTY().style.display = '';
            isFold = 0;
        },

        toggleFold: function () {
            if (isFold) {
                this.unfold();
            }
            else {
                this.fold();
            }
        },

        clear: function () {
            getTTY().value = '';
            texts = [];
        },

        log: function (output) {
            var lines = output.replace(/(^[\x0d\x0a]+|[\x0d\x0a]+$)/g, '').split('\n');
            texts.push.apply(texts, lines);
            getTTY().value = texts.join('\n');
        },

        scrollToTop: function () {
            var tty = getTTY();
            tty.scrollTop = 0;
        },

        scrollToBottom: function () {
            var tty = getTTY();
            tty.scrollTop = tty.scrollHeight;
        }
    };

    document.getElementById('toggle-console').onclick = function () {
        exports.toggleFold();
    };

    return exports;
});
