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
                        previewer.preview(data);
                        return;
                    }
                }

                // TODO: notice not support
            },
            dataType: 'json'
        });
    }

    return preview;
});
