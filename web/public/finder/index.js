define(function (require) {
    var cwdModule = require('partial/cwd');
    var path = require('path');
    var preview = require('partial/preview');

    var TPL = ''
        + '<ul>'
        + '<!-- for: ${files} as ${file} -->'
        + '<!-- var: type = ${file.type} === "directory" ? "folder" : "file-o" -->'
        + '<li data-name="${file.name}" data-type="${file.type}">'
        +   '<i class="fa fa-${file.icon}"></i><b>${file.name}</b>'
        + '</li>'
        + '<!-- /for -->'
        + '</ul>';

    var renderer = require('etpl').compile(TPL);

    /**
     * 获取列表容器元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getWrap() {
        return document.getElementById('finder-wrap');
    }

    /**
     * 获取目录下的文件并显示
     *
     * @inner
     * @param {string} cwd 当前目录
     */
    function lsDir(dir) {
        $.ajax({
            method: 'POST',
            url: '/ls',
            data: {
                dir: dir,
                all: 1
            },
            success: function (data) {
                if (cwdModule.get() !== dir) {
                    return;
                }

                data.sort(function (a, b) {
                    var typeDiff = a.type.localeCompare(b.type);
                    if (typeDiff === 0) {
                        return a.name.localeCompare(b.name);
                    }

                    return typeDiff;
                });

                data.forEach(function (file) {
                    file.icon = 'file-o';
                    if (file.type === 'directory') {
                        file.icon = 'folder';
                    }
                    else if (/^image/i.test(file.mime)) {
                        file.icon = 'file-image-o';
                    }
                    else {
                        switch (file.mime) {
                            case 'text/javascript':
                            case 'text/html':
                            case 'text/css':
                            case 'text/json':
                            case 'text/x-sh':
                                file.icon = 'file-code-o';
                                break;
                        }
                    }
                });

                data.unshift({
                    name: '..',
                    type: 'directory',
                    icon: 'arrow-circle-up'
                });

                getWrap().innerHTML = renderer({files: data});
            },
            dataType: 'json'
        });
    }

    /**
     * 当前目录变更时处理函数
     *
     * @inner
     * @param {string} cwd 变更后的目录
     */
    function cwdChanger (cwd) {
        lsDir(cwd);
    }

    /**
     * 文件列表双击处理函数
     *
     * @inner
     * @param {Event} e 事件对象
     */
    function dblClicker(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        var li = $(e.target).closest('li').get(0);
        if (!li) {
            return;
        }

        var name = li.getAttribute('data-name');
        var type = li.getAttribute('data-type');
        var fullPath = path.resolve(cwdModule.get(), name);

        if (type === 'directory') {
            cwdModule.set(fullPath)
        }
        else {
            preview(fullPath);
        }
    }

    /**
     * 当前选中文件的节点
     *
     * @inner
     * @type {HTMLLiElement}
     */
    var currentFileEl;

    /**
     * 文件列表点击处理函数
     *
     * @inner
     * @param {Event} e 事件对象
     */
    function clicker(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        var li = $(e.target).closest('li').get(0);
        if (!li) {
            return;
        }

        if (currentFileEl) {
            currentFileEl.className = '';
        }
        li.className = 'current-file';
        currentFileEl = li;
    }

    return {
        load: function () {
            var wrap = getWrap();
            wrap.ondblclick = dblClicker;
            wrap.onclick = clicker;

            lsDir(cwdModule.get());
            cwdModule.on('change', cwdChanger);
        },

        unload: function () {
            var wrap = getWrap();
            wrap.ondblclick = wrap.onclick = null;
            currentFileEl = null;
            cwdModule.un('change', cwdChanger);
        }
    }
});
