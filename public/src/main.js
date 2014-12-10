define(function (require) {
    var jquery = require('jquery');
    return {
        start: function () {
            jquery
                .ajax({
                    url: '/commands',
                    dataType: 'json'
                })
                .done(function (data) {
                    require('./commands').set(data);
                    require('./launcher').init();
                    require('./cwd').init(window.DEFAULT_CWD);
                });
        }
    }
});
