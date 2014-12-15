define(function () {
    var platform = '*nix';
    var separator = '/';
    if (DEFAULT_CWD.indexOf('/') !== 0) {
        platform = 'win';
        separator = '\\';
    }


    return {
        resolve: function (current) {
            var segs = current.split(separator);
            for (var i = 1, l = arguments.length; i < l; i++) {
                var arg = arguments[i];
                switch (arg) {
                    case '.':
                    case '':
                        break;
                    case '..':
                        if (segs.length > 1) {
                            segs.pop();
                        }
                        break;
                    default:
                        segs.push(arg);
                }
            }

            if (platform === '*nix' && segs.length === 1) {
                segs.push('');
            }

            return segs.join(separator);
        }
    };
});
