/**
 * @file 图片预览
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    var controller;

    /**
     * 获取图片预览的img元素
     *
     * @inner
     * @return {HTMLImgElement}
     */
    function getImgEl() {
        return document.getElementById('preview-image-show');
    }

    /**
     * 获取图片预览的关闭按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getCloseEl() {
        return document.getElementById('preview-image-close');
    }

    /**
     * 获取图片预览区域容器元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getPanelEl() {
        return document.getElementById('preview-image');
    }

    var previewer = {
        /**
         * 是否支持对当前文件的预览
         *
         * @param {Object} info 文件信息
         * @return {boolean}
         */
        isSupport: function (info) {
            return /^image\//.test(info.type);
        },

        /**
         * 预览文件
         *
         * @param {Object} info 文件信息
         */
        preview: function (info) {
            getPanelEl().style.display = '';
            getImgEl().src = 'data:' + info.type + ';base64,' + info.data;
        },

        /**
         * 关闭预览显示
         */
        hide: function () {
            getPanelEl().style.display = 'none';
        },

        /**
         * 初始化
         *
         * @param {Object} ctrl 控制器
         */
        init: function (ctrl) {
            controller = ctrl;
            getCloseEl().onclick = controller.hide;
            getImgEl().onclick = function () {
                window.open(this.src);
            };
        }
    };

    return previewer;
});
