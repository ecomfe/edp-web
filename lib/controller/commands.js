var cmdService = require('../service/cmd');

exports = module.exports = function (request, response) {
    var builtinData = serviceAdapter(cmdService.builtinCommands);
    var userData = serviceAdapter(cmdService.userCommands);

    response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
    response.end(JSON.stringify({builtin: builtinData, user: userData}));
};

var IGNORE_COMMAND = {
    'web': 1,
    'outdated': 1,
    'install': 1
};

function serviceAdapter(data) {
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

        if (!IGNORE_COMMAND[stack.join(' ')]) {
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

