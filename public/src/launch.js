/**
 * @file 命令运行模块
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {

    var gloOnData;
    var gloOnExit;
    var launching;

    /**
     * 运行命令
     *
     * @param {string} cmd 要运行的命令
     * @param {string} cwd 命令运行的当前目录
     * @param {Function} ondata 当运行输出数据到达时的处理行为
     * @param {Function} onexit 命令运行结束的处理行为
     */
    function launch(cmd, cwd, ondata, onexit) {
        if (launching) {
            throw new Error('Command is launching!');
        }

        if (typeof ondata === 'function') {
            gloOnData = ondata;
        }

        if (typeof onexit === 'function') {
            gloOnExit = onexit;
        }

        socket.emit('launch', {
            cmd: cmd,
            cwd: cwd
        });

        launching = 1;
    }

    /**
     * 和后端WebSocket通信的对象
     *
     * @inner
     * @type {Object}
     */
    var socket;

    /**
     * 初始化命令运行器
     */
    launch.init = function () {
        socket = io.connect(location.origin);

        socket.on('cmd-stdout', function (data) {
            gloOnData && gloOnData(data);
        });

        socket.on('cmd-stderr', function (data) {
            gloOnData && gloOnData(data);
        });

        socket.on('cmd-exit', function () {
            gloOnExit && gloOnExit();
            launching = false;
        });
    };

    return launch;
});
