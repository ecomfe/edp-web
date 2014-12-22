define(function (require) {
    function gloOnData() {
    }

    function gloOnExit() {
    }

    function launcher(cmd, cwd, ondata, onexit) {
        gloOnData = ondata || gloOnData;
        gloOnExit = onexit || gloOnExit;
        socket.emit('launch', {
            cmd: cmd,
            cwd: cwd
        });
    }

    var socket;
    launcher.init = function () {
        socket = io.connect(location.origin);

        socket.on('cmd-stdout', function (data) {
            gloOnData(data);
        });

        socket.on('cmd-stderr', function (data) {
            gloOnData(data);
        });

        socket.on('cmd-exit', function () {
            gloOnExit();
        });
    };

    return launcher;
});
