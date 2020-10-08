const utils = require('util');

function inspect(data) {
    return utils.inspect(data, { depth: 3 });
}

module.exports = { inspect };
