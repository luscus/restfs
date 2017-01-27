'use strict';

let encoders = {};

module.exports = {
    chainPosition: 'post',
    autoload: true,
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveAliases']
        }
    },
    handler: function encodeResponseData(context) {

        if (context.response.data) {
            var responseEncoder = null;
            var encodingKey = context.meta.headers.encodings.toString();

            if (encoders[encodingKey] === undefined) {
                // find first match between client accepted and server supported mime types
                var encodings = [].concat(context.meta.headers.encodings);

                while (encodings.length) {
                    var encoding = encodings.shift();

                    if (context.server.encoders[encoding]) {
                        responseEncoder = context.server.encoders[encoding];
                        break;
                    }
                }

                if (context.meta.headers.encodings.indexOf('br') > -1) {
                    // enforce br when ever possible
                    responseEncoder = context.server.encoders['br']
                }

                // cache response mime type
                encoders[encodingKey] =  responseEncoder;
            } else {
                // retrieve cached response mime type
                responseEncoder = encoders[encodingKey];
            }

            if (responseEncoder) {
                context.logger.debug('COMPRESS RESPONSE DATA TO', responseEncoder.encoding);
                context.http.response.setHeader('Content-Encoding', responseEncoder.encoding);

                context.response.data = responseEncoder.compress(context.response.data);
            }

            return;
        }
    }
};