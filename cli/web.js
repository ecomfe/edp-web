
/**
 * 命令行配置相
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '启动EDP Web服务';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [
    'port:'
];

/**
 * 命令入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function (args, opts) {
    var port = opts.port || 8008;
    require('../lib/start')(port);
};

// 导出命令
exports.cli = cli;
