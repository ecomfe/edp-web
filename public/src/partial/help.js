/**
 * @file 页面部件：帮助信息区域
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    return {
        /**
         * 设置帮助信息内容
         *
         * @param {string} content 帮助信息内容
         */
        setContent: function (content) {
            document.getElementById('help-main').innerHTML = content;
        },

        /**
         * 设置帮助信息内容，自动解析markdown内容成html
         *
         * @param {string} content 帮助信息内容
         */
        setContentByMarkdown: function (content) {
            this.setContent(marked(content || '没有详细的帮助信息'));
        },

        /**
         * 显示帮助信息区域
         */
        show: function () {
            document.getElementById('help').style.display = '';
            this.unfold();
        },

        /**
         * 隐藏帮助信息区域
         */
        hide: function () {
            document.getElementById('help').style.display = 'none';
        },

        /**
         * 折叠帮助信息区域
         */
        fold: function () {
            document.getElementById('help-main').style.display = 'none';
        },

        /**
         * 展开帮助信息区域
         */
        unfold: function () {
            document.getElementById('help-main').style.display = '';
        }
    }
});
