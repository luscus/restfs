'use strict';

const async           = require('async');
const http2           = require('http2');
const merge           = require('merge');

const RESTfsRequestContext  = require('restfs-lib-classes').RESTfsRequestContext;
const ssl             = require('../middleware/ssl/certificates');

function finalProcessing (error, context) {
    if (error) {
        context.logger.error(error);
    }

    if (context.logger.isActive(context.logger.INFO)) {
        context.metrics.stop('total-processing-time');
        context.logger.info('METRICS', context.metrics.toString());
    }
}

module.exports = function createSocket(server, callback) {

    ssl.buildSecureContexts(server);
    let secureContexts = ssl.getSecureContexts();

    server.options.defaultDomain = server.options.defaultDomain || Object.getOwnPropertyNames(secureContexts)[0];

    let serverOptions = {
        port: server.options.port
    };
    serverOptions.ALPNProtocols = ['HTTP/2', 'HTTP'];
    serverOptions.NPNProtocols  = serverOptions.ALPNProtocols;

    // set default ssl certificate
    serverOptions.key  = secureContexts[server.options.defaultDomain].key;
    serverOptions.cert = secureContexts[server.options.defaultDomain].cert;
    serverOptions.ca   = secureContexts[server.options.defaultDomain].ca;

    // set SNI support for multiple domains and certificates
    serverOptions.SNICallback = function SNICallback (domain, callback) {
        if (!secureContexts[domain]) {
            domain = ssl.defaultDomain;
        }

        callback(null, secureContexts[domain].context);
    }.bind(this);

    server.socket = http2.createServer(serverOptions,  function requestHandler (request, response) {
        request.body = '';

        request.on('data', function(data) {
            request.body += data;
        });

        request.on('end', function() {

            server.logger.debug('-----------------------------------------');
            server.logger.debug('HTTP Version: ', request.httpVersion);

            var serverChain = [function createRequestContext(next) {
                // build request context
                var context  = new RESTfsRequestContext(server, request, response);
                next(null, context);
            }].concat(
                server.pre
            );

            async.waterfall(serverChain, (result, context) => {

                if (result) {
                    var serverPostChain = [function (next) {
                        next(null, context);
                    }].concat(
                        server.post
                    );

                    return async.waterfall(serverPostChain, finalProcessing);
                }

                var actionChain = [function (next) {
                    next(null, context);
                }].concat(
                    context.action.pre,
                    context.action.handler,
                    context.action.post,
                    server.post
                );

                async.waterfall(actionChain,  (result, context) => {

                    var serverPostChain = [function (next) {
                        next(null, context);
                    }].concat(
                       server.post
                    );

                    async.waterfall(serverPostChain, finalProcessing);
                });

            });
        });
    }.bind(server));


    callback(null, server);
};
