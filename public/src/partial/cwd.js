/**
 * @file 页面部件：当前目录区域
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    var currentCwd;
    var repoInfo;

    var STORAGE_NAME = 'edp-cwd';
    var repoId = 'repo';
    var inRepoClass = 'in-repo';

    /**
     * 设置当前目录
     *
     * @inner
     * @param {string} cwd 当前目录
     */
    function setCwd(cwd) {
        currentCwd = cwd;
        $('#cwd').html(cwd);
        try {
            localStorage.setItem(STORAGE_NAME, cwd);
        }
        catch (ex) {}

        $.ajax({
            method: 'POST',
            url: '/repo-info',
            data: {
                dir: currentCwd
            },
            success: function (data) {
                repoInfo = data;
                var repoEl = document.getElementById(repoId);
                if (data) {
                    repoEl.innerHTML = data.type;
                    repoEl.className = inRepoClass;
                    $('#repo-url').html(data.url);
                    $('#repo-branch').html(data.branch);
                    $('#repo-revision').html(data.revision);
                    $('#repo-update-time').html(moment(data.updateTime).format('YYYY-MM-DD HH:mm:ss'));
                }
                else {
                    repoEl.innerHTML = 'No Repository';
                    repoEl.className = '';
                }
            },
            dataType: 'json'
        });
    }

    /**
     * 初始化编辑当前目录行为的浏览器事件
     *
     * @inner
     */
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

        document.getElementById(repoId).onclick = showRepoInfo;
        $('#cwd-panel').click(lsCwd);
        $('#repo-update').click(updateRepo);
        $(document).bind('click', function (e) {
            if(!$(e.target).closest('ol').is('#cwd-dir-list')){
                $('#cwd-dir-list').hide();
            }

            if(e.target.id != 'repo' && !$(e.target).closest('dl').is('#repo-detail')){
                $('#repo-detail').hide();
            }
        });
    }

    var cons = require('./console');

    /**
     * 从远程仓库同步
     *
     * @inner
     */
    function updateRepo() {
        $('#repo-detail').hide();
        if (repoInfo) {
            var cmd;
            switch (repoInfo.type) {
                case 'git':
                    cmd = 'git pull';
                    break;
                case 'svn':
                    cmd = 'svn update';
                    break;
            }

            if (cmd) {
                cons.show();
                cons.clear();
                cons.log('$ ' + cmd + '\n');
                require('../launch')(
                    cmd,
                    currentCwd,
                    cmdLog,
                    cmdExit
                );
            }
        }
    }


    /**
     * 输出命令运行提示
     *
     * @inner
     * @param {string} text 命令运行提示串
     */
    function cmdLog(text) {
        cons.log(text);
    }

    /**
     * 命令运行结束的行为
     *
     * @inner
     */
    function cmdExit() {
        cons.scrollToBottom();
    }

    /**
     * 显示版本控制仓库信息
     *
     * @inner
     */
    function showRepoInfo() {
        if ($('#repo').hasClass(inRepoClass)) {
            $('#repo-detail').show();
        }
    }

    /**
     * 浏览当前目录下的目录列表
     *
     * @inner
     */
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

                var pos = $('#cwd-panel').position();
                $('#cwd-dir-list')
                    .show()
                    .css('top', pos.top + 40)
                    .css('left', pos.left + 100)
                    .html(html.join(''));
            },
            dataType: 'json'
        });
    }


    return {
        /**
         * 获取当前目录
         *
         * @return {string}
         */
        get: function () {
            return currentCwd;
        },

        /**
         * 初始化当前目录区域
         *
         * @param {string} defaultCwd 默认的当前目录
         */
        init: function (defaultCwd) {
            try {
                var cwd = localStorage.getItem(STORAGE_NAME);
                setCwd(cwd || defaultCwd);
            }
            catch (ex) {
                setCwd(defaultCwd);
            }

            initEditBehavior();
        }
    };
});
