/**
 * @file 页面部件：空白面板，用于专属功能的视图与功能
 * @author errorrik[errorrik@gmail.com]
 */

define(function () {
    var panelId = 'board';

    /**
     * 获取面板dom对象
     *
     * @inner
     * @return {HTMLElement}
     */
    function getPanel() {
        return document.getElementById(panelId);
    }

    return {
        /**
         * 设置面板的html
         *
         * @param {string} html html内容串
         */
        setHTML: function (html) {
            getPanel().innerHTML = html;
        },

        /**
         * 显示面板
         */
        show: function () {
            getPanel().style.display = '';
        },

        /**
         * 隐藏面板
         */
        hide: function () {
            getPanel().style.display = 'none';
        }
    };
});
