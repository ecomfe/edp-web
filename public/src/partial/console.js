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
            getTTY().innerHTML = '';
        },

        log: function (output) {
            var code = document.createElement('code');
            code.innerHTML = output;

            getTTY().appendChild(code);
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
