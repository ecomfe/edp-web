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
     * 获取保存按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getSaveEl() {
        return document.getElementById('preview-text-save');
    }

    /**
     * 获取保存并关闭按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getSaveCloseEl() {
        return document.getElementById('preview-text-saveclose');
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

    var message = require('../message');
    var currentFile;

    /**
     * 保存修改结果
     *
     * @inner
     * @param {Function} onsuccess 保存成功的回调函数
     */
    function save(onsuccess, onfail) {
        if (!currentFile) {
            return;
        }

        message.loading('Saving');
        var value = editor.doc.getValue();

        $.ajax({
            method: 'POST',
            url: '/file-save',
            data: {
                file: currentFile,
                content: value
            },
            success: function (data) {
                if (data.success) {
                    (typeof onsuccess === 'function') && onsuccess();
                    message.success('保存成功', {remain: 3});
                }
                else {
                    message.error('保存失败: ' + data.message, {remain: 3});
                }
            },
            dataType: 'json'
        });
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
            currentFile = info.file;
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
            currentFile = null;
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
            getSaveEl().onclick = function () {
                save()
            };
            getSaveCloseEl().onclick = function () {
                save(controller.hide);
            };
        }
    };
});
