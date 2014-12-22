define(function () {
    var panelId = 'board';

    function getPanel() {
        return document.getElementById(panelId);
    }

    return {
        setHTML: function (html) {
            getPanel().innerHTML = html;
        },

        show: function () {
            getPanel().style.display = '';
        },

        hide: function () {
            getPanel().style.display = 'none';
        }
    };
});
