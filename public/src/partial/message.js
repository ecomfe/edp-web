/**
 * @file 页面部件：消息提示
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    function getMessageEl () {
        return document.getElementById('message');
    }

    function getMaskEl() {
        return document.getElementById('mask');
    }

    function message(msg, option) {
        option = option || {};
        if (option.mask) {
            getMaskEl().className = '';
        }

        var className = 'message';
        if (option.type) {
            className += ' message-' + option.type;
        }

        var msgEl = getMessageEl();
        msgEl.className = className;
        msgEl.innerHTML = msg;
        msgEl.style.display = '';
        msgEl.style.left = (document.body.clientWidth - msgEl.offsetWidth ) / 2 + 'px';

        if (option.remain) {
            setTimeout(message.hide, option.remain * 1000);
        }
    }

    message.hide = function () {
        getMaskEl().className = 'mask-hidden';
        getMessageEl().className += ' message-hidden';
    };

    message.warn = function (msg, option) {
        option = option || {};
        option.type = 'warn';
        message(msg, option);
    };

    message.error = function (msg, option) {
        option = option || {};
        option.type = 'error';
        message(msg, option);
    };

    message.success = function (msg, option) {
        option = option || {};
        option.type = 'success';
        message(msg, option);
    };

    message.loading = function (msg) {
        msg = msg || 'Loading';
        message('<i class="fa fa-spin fa-spinner"></i>' + msg, {mask: 1});
    };

    return message;
});
