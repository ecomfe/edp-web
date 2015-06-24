/**
 * @file 让对象拥有事件功能
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    return function (target) {
        var listenerContainer = {};

        /**
         * 获取事件的监听器列表
         *
         * @inner
         * @param {string} name 事件名
         * @return {Array}
         */
        function getListeners(name) {
            var listeners = listenerContainer[name];
            if (!listeners) {
                listeners = listenerContainer[name] = [];
            }

            return listeners;
        }

        /**
         * 添加事件监听器
         *
         * @param {string} name 事件名
         * @param {Function} listener 监听器
         */
        target.on = function (name, listener) {
            if (typeof listener !== 'function') {
                return;
            }

            getListeners(name).push(listener);
        };

        /**
         * 移除事件监听器
         *
         * @param {string} name 事件名
         * @param {Function=} listener 监听器
         */
        target.un = function (name, listener) {
            var listeners = getListeners(name);
            if (!listener) {
                listeners.length = 0;
            }
            else {
                var len = listeners.length;
                while (len--) {
                    if (listener === listeners[len]) {
                        listeners.splice(len, 1);
                    }
                }
            }
        };

        /**
         * 触发事件
         *
         * @param {string} name 事件名
         * @param {*} arg 事件参数对象
         */
        target.fireEvent = function (name, arg) {
            var listeners = getListeners(name);
            for (var i = 0, l = listeners.length; i < l; i++) {
                var listener = listeners[i];
                listener(arg);
            }
        }

        return target;
    };
});
