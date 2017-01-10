'use strict';

const deep       = require('deep-lib');

module.exports = {
    chainPosition: 'pre',
    description: 'retrieves the client\'s ip address and if it came from the local host',
    autoload: true,
    handler: function resolveRemote(context) {
        var xff = context.http.request.headers && context.http.request.headers['x-forwarded-for'];

        context.meta.remote = {};

        if (xff) {
            context.meta.remote.proxies = xff.split(',');
            context.meta.remote.ip      = context.meta.remote.route.shift();
        }
        else {
            context.meta.remote.ip    = context.http.request.connection.remoteAddress;
        }

        context.meta.remote.isLocal   = ['127.0.0.1', '::ffff:127.0.0.1', '::1'].indexOf(context.meta.remote.ip) > -1;

        context.meta.verbose    = context.meta.verbose || context.meta.remote.isLocal;
    }
};