'use strict';

const Path = require('path');

let formaters = {};

module.exports = {
    chainPosition: 'post',
    autoload: true,
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveAliases']
        }
    },
    handler: function formatResponseData(context) {
        context.logger.debug('FORMAT RESPONSE DATA TO', context.response.data);

        if (context.response.data) {
            var responseMimetype = 'text/plain';
            var acceptsKey = context.meta.headers.accepts.toString();


            if (formaters[acceptsKey]) {
                // retrieve cached response mimetype
                responseMimetype = formaters[acceptsKey];
            } else {
                // find first match between client accepted and server supported mimetypes
                var mimetypes = Object.getOwnPropertyNames(context.server.formaters);
                var accepts = [].concat(context.meta.headers.accepts);

                while (accepts.length) {
                    var mimetype = accepts.shift();

                    if (mimetypes.indexOf(mimetype) > -1) {
                        responseMimetype = mimetype;
                        break;
                    }
                }

                // cache response mimetype
                formaters[acceptsKey] =  responseMimetype;
            }

            var formater = context.server.formaters[responseMimetype];

            context.logger.debug('FORMAT RESPONSE DATA TO', responseMimetype);
            context.http.response.setHeader('Content-Type', responseMimetype + '; charset=utf-8');

            if (context.response.data && context.meta.data.query.metrics) {
                context.metrics.stop(Path.join(__dirname, 'formatResponseData.js'));
                context.response.data.metrics = context.metrics.toJSON();
            }

            context.response.data = formater(context.response.data);
            return;
        }
    }
};