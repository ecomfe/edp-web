/**
 * @file 页面部件：标题区域
 * @author errorrik[errorrik@gmail.com]
 */

define(function () {
    return {
        /**
         * 设置标题
         *
         * @param {string} title 标题文字
         */
        set: function (title) {
            var el = document.getElementById('title');
            el.innerHTML = title;
            el.style.display = '';
        }
    }
});
