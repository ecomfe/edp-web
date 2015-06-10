/**
 * @file 图片预览
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    var init
    function init() {

    }

    function getImgEl() {
        return document.getElementById('preview-image');
    }

    return {
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
            init();
            getImgEl().src = 'data:' + info.type + ';base64,' + info.data;
        }
    };
});
