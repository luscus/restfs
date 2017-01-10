'use strict';

const merge = require('merge');

module.exports = {
    chainPosition: 'pre',
    position: {
        absolute: 'pre',
        relative: {
            after: ['resolveAction']
        }
    },
    autoload: true,
    handler: function mergeRequestData(context) {
        context.meta.data.all = merge.recursive(true, context.meta.data.query, context.meta.data.url, context.meta.data.body);
    }
};