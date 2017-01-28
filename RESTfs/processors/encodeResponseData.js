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

                // cache response mime type
                encoders[encodingKey] =  responseEncoder;
            } else {
                // retrieve cached response mime type
                responseEncoder = encoders[encodingKey];
            }

            // TODO build some kind of smart select for the right encoding: size threshold, ...

            if (responseEncoder) {
                context.logger.debug('COMPRESS RESPONSE DATA TO', responseEncoder.encoding);
                context.http.response.setHeader('Content-Encoding', responseEncoder.encoding);

                context.response.data = responseEncoder.compress(context.response.data);
            }

            return;
        }
    }
};