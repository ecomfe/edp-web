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
        },

        /**
         * 获取文件名
         *
         * @param {string} fullPath 完整路径
         * @return {string}
         */
        basename: function (fullPath) {
            var terms = fullPath.split(separator);
            var len = terms.length;
            if (len > 0) {
                return terms[len - 1];
            }

            return '';
        },

        /**
         * 获取文件所在目录
         *
         * @param {string} fullPath 完整路径
         * @return {string}
         */
        dirname: function (fullPath) {
            var terms = fullPath.split(separator);
            var len = terms.length;
            if (len > 0) {
                terms.length = len - 1;
            }

            return terms.join(separator);
        }
    };
});
