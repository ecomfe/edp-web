define(function (require) {
    return {
        setContent: function (content) {
            document.getElementById('help-main').innerHTML = content;
        },

        setContentByMarkdown: function (content) {
            this.setContent(markdown.toHTML(content || '没有详细的帮助信息'));
        },

        show: function () {
            document.getElementById('help').style.display = '';
            this.unfold();
        },

        hide: function () {
            document.getElementById('help').style.display = 'none';
        },

        fold: function () {
            document.getElementById('help-main').style.display = 'none';
        },

        unfold: function () {
            document.getElementById('help-main').style.display = '';
        }
    }
});
