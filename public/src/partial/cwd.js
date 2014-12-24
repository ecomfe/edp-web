define(function (require) {
    var currentCwd;
    function setCwd(cwd) {
        currentCwd = cwd;
        $('#cwd').html(cwd);
        try {
            localStorage.setItem('edp-cwd', cwd);
        }
        catch (ex) {}
    }

    function initEditBehavior() {
        $('#cwd-dir-list').delegate('li', 'click', function () {
            var dir = require('../path').resolve(
                currentCwd,
                this.getAttribute('data-dir')
            );
            setCwd(dir);
            $('#cwd-dir-list').hide();
            lsCwd();
        });

        $('#cwd-edit').click(lsCwd);
        $(document).bind('click', function (e) {
            if(!$(e.target).closest('ol').is('#cwd-dir-list')){
                $('#cwd-dir-list').hide();
            }
        });
    }

    function lsCwd() {
        $.ajax({
            method: 'POST',
            url: '/ls',
            data: {
                dir: currentCwd
            },
            success: function (data) {
                var html = [];
                if (currentCwd.split('/').length > 2) {
                    data.unshift('..');
                }

                for (var i = 0; i < data.length; i++) {
                    var dir = data[i];
                    html.push('<li data-dir="' + dir + '"><i class="fa '
                        + (dir === '..' ? 'fa-arrow-circle-up' : 'fa-folder')
                        + '"></i>'
                        + dir
                        + '</li>'
                    );
                }

                var pos = $('#cwd-edit').position();
                $('#cwd-dir-list')
                    .show()
                    .css('top', pos.top)
                    .css('left', pos.left + 30)
                    .html(html.join(''));
            },
            dataType: 'json'
        });
    }

    return {
        get: function () {
            return currentCwd;
        },

        init: function (defaultCwd) {
            try {
                var cwd = localStorage.getItem('edp-cwd');
                setCwd(cwd || defaultCwd);
            }
            catch (ex) {
                setCwd(defaultCwd);
            }

            initEditBehavior();
        }
    };
});
