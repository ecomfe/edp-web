define(function (require) {
    var currentFuncModule;
    function unloadFunc() {
        if (currentFuncModule) {
            currentFuncModule.unload && currentFuncModule.unload();
            var links = document.getElementsByTagName('link');
            var len = links.length;
            while (len--) {
                var link = links[len];
                if (link.getAttribute('data-dynamic')) {
                    link.parentNode.removeChild(link);
                }
            }
        }

        currentFuncModule = null;
    }

    function loadWebFunc(info) {
        unloadFunc();
        document.getElementById('main').style.display = '';

        require('./partial/title').set(info.title);

        var board = require('./partial/board');
        board.setHTML(info.html);
        board.show();

        var help = require('./partial/help');
        help.hide();

        require('./partial/cmd').hide();
        require('./partial/console').hide();

        var jsModule = info.jsModule;
        if (jsModule) {
            require([info.path + '/' + jsModule], function (mod) {
                currentFuncModule = mod;
                mod.load && mod.load();
            });
        }

        var cssFile = info.cssFile;
        if (cssFile) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', '/_static/' + info.path + '/' +cssFile);
            link.setAttribute('data-dynamic', '1');
            var parent = document.getElementsByTagName('head')[0]
                || document.body;
            parent.appendChild(link);
        }
    }

    function loadCmdFunc(info) {
        unloadFunc();
        document.getElementById('main').style.display = '';

        require('./partial/title').set(info.path + ' - ' + info.description);

        var cons = require('./partial/console');
        cons.clear();
        cons.show();
        cons.fold();

        var cmd = require('./partial/cmd');
        cmd.update(info);
        cmd.show();

        var help = require('./partial/help');
        help.setContentByMarkdown(info.help);
        help.show();

        var board = require('./partial/board');
        board.setHTML('');
        board.hide();
    }

    return {
        start: function () {
            require('./launch').init();
            require('./partial/cwd').init(DEFAULT_CWD);

            var nav = require('./partial/nav');
            nav.behavior(loadWebFunc, loadCmdFunc);
            nav.init(NAV);
        }
    };
});
