'use strict';

const merge        = require('merge');
const uuid = require('uuid');
const deep         = require('deep-lib');
const RESTfsError = require('restfs-lib-classes').RESTfsError;

function finalProcessing(context) {

    if (context.error) {
        context.response.statusCode = context.error.statusCode || 500;
        context.response.reasonPhrase = context.error.reasonPhrase;
        context.response.data   = format(context);
    }

    // set default values
    context.response.statusCode   = context.response.statusCode   || 200;
    context.response.reasonPhrase = context.response.reasonPhrase || context.action.getReasonPhrase(context.response.statusCode);

    if (!context.response.data) {
        context.response.data = null;
    }

    send(context);
}


// TODO evaluate: https://www.npmjs.com/package/require-stack
// TODO evaluate: https://www.npmjs.com/package/stack-trace

function format(context) {
    context.logger.debug('FORMAT ERROR:', context.error.statusCode, context.error.reasonPhrase);

    var errorObject        = {};

    errorObject.statusCode = context.error.statusCode;
    errorObject.error      = context.error.reasonPhrase;
    errorObject.code       = errorObject.error.replace(/ /g, '');

    if (context.meta.verbose) {
        errorObject.reason   =  context.error.message;
        errorObject.stack    = (context.error.stack ? context.error.stack : null);
    }

    return errorObject;
}

function send(context) {

    let formater = context.server.formaters['application/json'];

    context.http.response.writeHead(context.response.statusCode, context.response.reasonPhrase);

    context.metrics.stop('total-processing-time');

    if (context.logger.isActive(context.logger.INFO) || context.meta.data.query.metrics) {
        context.logger.info('METRICS', context.metrics.toString());
        context.response.data.metrics = context.metrics;
    }

    context.logger.debug('SENDING', context.response );
    context.http.response.end(formater(context.response.data));
}

module.exports = function (result, context) {

    if (result instanceof Error) {
        if (!result instanceof RESTfsError) {
            // this only occurs on code errors
            result = new RESTfsError(result);
            context.error = result;
            context.response = {};
        }

        if (result.statusCode >= 500) {
            context.logger.error(result);
        } else {
            context.logger.warn(result.message);
        }
    }

    finalProcessing(context);
};
