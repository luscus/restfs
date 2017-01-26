'use strict';

const http = require('http');
const RESTfsError = require('restfs-lib-classes').RESTfsError;
const RESTfsResponse = require('restfs-lib-classes').RESTfsResponse;

module.exports = {
    chainPosition: 'post',
    autoload: true,
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveAliases']
        }
    },
    handler: function prepareResponse(context) {
        if (context.response instanceof Error) {
            if (!context.response instanceof RESTfsError) {
                // this only occurs on code errors
                context.response = new RESTfsError(context.response);
            }

            // log errors
            if (context.response.statusCode >= 500) {
                context.logger.error(context.response);
            } else {
                context.logger.warn(context.response.message);
            }
        }

        // set default values
        context.response.statusCode   = context.response.statusCode   || 200;
        context.response.reasonPhrase = context.response.reasonPhrase || // custom provided reason phrase
            (context.action && context.action.getReasonPhrase(context.response.statusCode)) || // action related reason phrase
            http.STATUS_CODES[context.response.statusCode]; // standard reason phrase for provided status code

        if (context.meta.verbose && context.response.statusCode >= 400) {
            // the response can be verbose: show error stack
            context.response.data.reason   =  context.response.message;
            context.response.data.stack    = (context.response.stack ? context.response.stack : null);
            context.response.data.code     = context.response.reasonPhrase.replace(/ /g, '');
        }

        if (!context.response.data) {
            context.response.data = null;
        }
    }
};