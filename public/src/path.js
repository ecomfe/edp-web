/**
 * @file 路径处理功能，主要是处理平台的路径兼容性
 * @author errorrik[errorrik@gmail.com]
 */

define(function () {
    var platform = '*nix';
    var separator = '/';
    if (DEFAULT_CWD.indexOf('/') !== 0) {
        platform = 'win';
        separator = '\\';
    }

    return {
        /**
         * resolve路径，相当于cd
         *
         * @param {string} current 当前路径
         * @param {string...} to 跳转目标路径
         * @return {string}
         */
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
