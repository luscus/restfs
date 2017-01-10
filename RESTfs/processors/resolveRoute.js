'use strict';

const RESTfsError = require('restfs-lib-classes').RESTfsError;

module.exports = {
    chainPosition: 'pre',
    autoload: true,
    position: {
        absolute: 'pre',
        relative: {
            after: ['resolveAliases']
        }
    },
    handler: function resolveRoute(context) {
        // search and execute route handler
        context.route = context.server.find(context);

        if (!context.route) {
            let error = new RESTfsError('Endpoint "' + context.meta.url + '" not found', 404);
            context.error = error;

            return error;
        }
    }
};