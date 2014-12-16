define(function (require) {
    var jquery = require('jquery');
    return {
        start: function () {
            require('./commands').set(NAV);
            require('./launcher').init();
            require('./cwd').init(DEFAULT_CWD);
        }
    }
});
