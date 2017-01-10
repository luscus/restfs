/* jshint node:true */
'use strict';

const async = require('async');
const RESTfsServer = require('restfs-lib-classes').RESTfsServer;
const startupTasks = require('./startup/tasks');

function RESTsf (options) {
    options = options || {};
    options.port = options.port || 8443;

    var server = new RESTfsServer(options);

    var startup =[function (callback) {
        callback(null, server);
    }].concat(startupTasks);

    async.waterfall(startup, function startupCallback(error, server) {
        server.logger.debug('server', server.options);
        server.listen(function socketReady() {
            server.logger.info('RESTfs Server listening on: https://' +server.options.defaultDomain+':'+server.options.port);
        });
    });

    return server;
}



module.exports = RESTsf;
