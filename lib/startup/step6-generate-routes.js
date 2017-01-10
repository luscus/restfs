'use strict';

const RESTfsError = require('restfs-lib-classes').RESTfsError;
const RESTfsAction = require('restfs-lib-classes').RESTfsAction;
const RESTfsResponse = require('restfs-lib-classes').RESTfsResponse;

function wrapProcessorHandler (processor) {
    let handler = function (context, next) {
        context.metrics.start(processor.key);

        var result = processor.handler(context);

        if (!result) {
            // no results, only context has been modified
            // continue pre-processing loop
            context.metrics.stop(processor.key);
            return next(null, context);
        }

        if (!(result instanceof RESTfsError) && !(result instanceof RESTfsResponse)) {
            // returned results must be of instances of RESTfsError or RESTfsResponse
            result = new RESTfsError('RESTfsAction handler should return an instance of RESTfsError or RESTfsResponse: ' + processor.key);
        }

        // any result RESTfsError or RESTfsResponse will break
        // the pre- and action-processing loop
        // triggering the post-processing loop directly
        if (result instanceof RESTfsError) {
            context.error = result;
            context.response = {};
            return next(result, context);
        }

        context.response = result;

        context.metrics.stop(processor.key);
        next(result, context);
    };

    handler.displayName = processor.handler.name;

    return handler;
}

module.exports = function generateRoutes(server, callback) {
    server.pre = [
        wrapProcessorHandler(server.getProcessor('resolveRemote')),
        wrapProcessorHandler(server.getProcessor('parseUrl')),
        wrapProcessorHandler(server.getProcessor('resolveReferer')),
        wrapProcessorHandler(server.getProcessor('resolveAliases')),
        wrapProcessorHandler(server.getProcessor('parseHeaders')),
        wrapProcessorHandler(server.getProcessor('resolveRoute')),
        wrapProcessorHandler(server.getProcessor('resolveAction')),
        wrapProcessorHandler(server.getProcessor('parseBody')),
        wrapProcessorHandler(server.getProcessor('mergeRequestData')),
        wrapProcessorHandler(server.getProcessor('freezeContextMeta'))
    ];

    server.post = [
        wrapProcessorHandler(server.getProcessor('setCorsHeaders'))
    ];

    server.actions.forEach(action => {

        if (action.config.handler) {
            action.pre = [];
            action.post = [];
            action.handler = wrapProcessorHandler({
                key: action.key,
                handler: action.config.handler
            });

            server.registerAction(action);
        }
    });

    callback(null, server);
};
