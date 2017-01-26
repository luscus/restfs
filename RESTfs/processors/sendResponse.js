'use strict';

module.exports = {
    chainPosition: 'post',
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveRemote']
        }
    },
    autoload: true,
    handler: function sendResponse(context) {
        context.http.response.writeHead(context.response.statusCode, context.response.reasonPhrase);
        context.http.response.end(context.response.data);

        context.logger.debug('SENDING', context.response );
    }
};