var util = require('../util');
var disabledCommands = util.getDisabledCommands();

exports.builtinCommands = adapter(util.getBuiltinCommands());
exports.userCommands = adapter(util.getUserCommands());


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
