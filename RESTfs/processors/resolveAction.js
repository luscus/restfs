'use strict';

var map     = require('../map.json');

module.exports = {
    chainPosition: 'pre',
    autoload: true,
    position: {
        absolute: 'pre',
        relative: {
            after: ['resolveRoute']
        }
    },
    handler: function resolveAction(context) {
        // search for action in this route
        context.action = context.route.getAction(context);

        if (!context.route) {
            let error = new RESTfsError('Method "' + context.meta.action + '" not allowed', 405);
            context.error = error;

            return error;
        }
    }
};