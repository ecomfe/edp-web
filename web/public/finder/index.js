define(function (require) {
    var cwdModule = require('partial/cwd');
    var path = require('path');
    var preview = require('partial/preview');
    var message = require('partial/message');

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
     * 获取查看按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getOpenEl() {
        return document.getElementById('finder-op-open');
    }

    /**
     * 获取删除按钮元素
     *
     * @inner
     * @return {HTMLElement}
     */
    function getRemoveEl() {
        return document.getElementById('finder-op-rm');
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

        openCurrent();
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
        updateOpState();
    }

    /**
     * 查看当前选中的文件
     *
     * @inner
     */
    function openCurrent() {
        if (currentFileEl) {
            var name = currentFileEl.getAttribute('data-name');
            var type = currentFileEl.getAttribute('data-type');
            var fullPath = path.resolve(cwdModule.get(), name);

            if (type === 'directory') {
                currentFileEl = null;
                updateOpState();
                cwdModule.set(fullPath);
            }
            else {
                preview(fullPath);
            }
        }
    }

    /**
     * 删除当前选中的文件
     *
     * @inner
     */
    function removeCurrent() {
        if (currentFileEl) {
            var name = currentFileEl.getAttribute('data-name');
            var type = currentFileEl.getAttribute('data-type');
            var fullPath = path.resolve(cwdModule.get(), name);

            if (type === 'file') {
                message.loading('File deleteing');

                $.ajax({
                    method: 'POST',
                    url: '/file-rm',
                    data: {
                        file: fullPath
                    },
                    success: function (data) {
                        if (!currentFileEl) {
                            return;
                        }

                        if (data.success) {
                            currentFileEl.parentNode.removeChild(currentFileEl);
                            currentFileEl = null;
                            updateOpState();

                            message.success('删除成功', {remain: 2});
                        }
                        else {
                            message.error(info.message, {remain: 2});
                        }
                    },
                    dataType: 'json'
                });
            }
        }
    }

    /**
     * 更新操作按钮的状态
     *
     * @inner
     */
    function updateOpState() {
        if (!currentFileEl) {
            getOpenEl().disabled = true;
            getRemoveEl().disabled = true;
        }
        else {
            getOpenEl().disabled = false;
            var type = currentFileEl.getAttribute('data-type');
            getRemoveEl().disabled = (type === 'directory');
        }
    }

    return {
        load: function () {
            var wrap = getWrap();
            wrap.ondblclick = dblClicker;
            wrap.onclick = clicker;
            getOpenEl().onclick = openCurrent;
            getRemoveEl().onclick = removeCurrent;

            lsDir(cwdModule.get());
            cwdModule.on('change', cwdChanger);
        },

        unload: function () {
            var wrap = getWrap();
            wrap.ondblclick = wrap.onclick = null;

            currentFileEl = null;
            getOpenEl().onclick = null;
            getRemoveEl().onclick = null;
            updateOpState();

            cwdModule.un('change', cwdChanger);
        }
    }
});
