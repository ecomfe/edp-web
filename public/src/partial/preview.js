/**
 * @file 页面部件：预览
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    // 不搞什么注入了，就那么几个货
    var previewers = [
        require('./previewer/text'),
        require('./previewer/image')
    ];

    function getPanel() {
        return document.getElementById('preview-panel');
    }

    var currentPreviewer;

    /**
     * 预览文件
     *
     * @param {string} file 文件路径
     */
    function preview(file) {
        $.ajax({
            method: 'POST',
            url: '/preview-info',
            data: {
                file: file
            },
            success: function (data) {
                for (var i = 0, l = previewers.length; i < l; i++) {
                    var previewer = previewers[i];
                    if (previewer.isSupport(data)) {
                        currentPreviewer = previewer;
                        previewer.preview(data);
                        return;
                    }
                }

                // TODO: notice not support
            },
            dataType: 'json'
        });
    }

    preview.show = function () {
        getPanel().style.display = '';
    };

    preview.hide = function () {
        currentPreviewer && currentPreviewer.hide();
        getPanel().style.display = 'none';
        currentPreviewer = null;
    };

    previewers.forEach(function (previewer) {
        previewer.init && previewer.init(preview);
    });

    return preview;
});
