/**
 * @file 命令信息提供
 * @author errorrik[errorrik@gmail.com]
 */

var util = require('../util');
var disabledCommands = util.getDisabledCommands();

/**
 * 内建命令列表
 *
 * @type {Array}
 */
exports.builtinCommands = adapter(util.getBuiltinCommands());

/**
 * 用户命令列表
 *
 * @type {Array}
 */
exports.userCommands = adapter(util.getUserCommands());

/**
 * 数据适配函数
 *
 * @inner
 * @param {Array} data 从edp主包调用来源的原始数据
 * @return {Array}
 */
function adapter(data) {
    var result = [];
    var stack = [];

    data.forEach(function (cmd) {
        readCmdData(cmd, result);
    });

    function compare(a, b) {
        return a.name.localeCompare(b.name);
    }


    function readCmdData(cmd, resultArray) {
        var node = {
            name: cmd.name,
            description: cmd.module.cli.description || '',
            help: cmd.help || '',
            options: cmd.module.cli.options || [],
            children: []
        };

        stack.push(cmd.name);

        if (!disabledCommands[stack.join(' ')]) {
            for (var key in cmd.children) {
                readCmdData(cmd.children[key], node.children);
            }

            resultArray.push(node);
            node.children.sort(compare);
        }
        stack.pop();
    }

    result.sort(compare);
    return result;
}
