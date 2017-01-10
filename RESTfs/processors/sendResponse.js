'use strict';

const headers    = require('../../lib/middleware/headers');
const deep       = require('deep-lib');
const merge           = require('merge');

module.exports = {
    chainPosition: 'post',
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveRemote']
        }
    },
    autoload: true,
    handler: function parseBody(context) {
        context.logger.debug('SENDING', context.response );

        let formater = context.server.formaters['application/json'];

        context.http.response.writeHead(context.response.statusCode, context.response.reasonPhrase);
        context.http.response.write(formater(context.response.data));
        context.http.response.end();
    }
};