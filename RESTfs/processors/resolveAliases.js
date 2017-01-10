'use strict';

const deep       = require('deep-lib');

module.exports = {
    chainPosition: 'pre',
    description: 'retrieves the client\'s ip address and if it came from the local host',
    autoload: true,
    handler: function resolveAliases(context) {
    }
};