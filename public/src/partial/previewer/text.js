define(function (require) {
    var controller;

    /**
     * 获取区域容器元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getPanelEl() {
        return document.getElementById('preview-text');
    }

    /**
     * 获取关闭按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getCloseEl() {
        return document.getElementById('preview-text-close');
    }

    /**
     * 获取编辑器容器元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getEditorEl() {
        return document.getElementById('preview-text-editor');
    }

    var editor;

    /**
     * 初始化编辑器
     *
     * @inner
     */
    function initEditor() {
        if (editor) {
            return;
        }

        editor = CodeMirror(getEditorEl(), {
            theme: 'monokai',
            lineNumbers: true
        });
        resizeEditor();

        window.addEventListener('resize', resizeEditor, false);
    }

    /**
     * 重新设定编辑器尺寸
     *
     * @inner
     */
    function resizeEditor() {
        editor.setSize(
            document.body.clientWidth,
            document.body.clientHeight - 50
        );
    }

    return {
        /**
         * 是否支持对当前文件的预览
         *
         * @param {Object} info 文件信息
         * @return {boolean}
         */
        isSupport: function (info) {
            return /^text\//.test(info.type);
        },

        /**
         * 预览文件
         *
         * @param {Object} info 文件信息
         */
        preview: function (info) {
            getPanelEl().style.display = '';
            initEditor();
            editor.setOption({
                mode: info.type
            });
            editor.doc.setValue(info.data);
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

        }
    };
});
