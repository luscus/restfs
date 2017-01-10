'use strict';

const async = require('async');
const Path = require('path');
const mapper  = require('restfs-lib-mapper');
const loader  = require('package.loader');
const instanciateMap  = require('restfs-lib-classes').instanciateMap;

module.exports = function loadApiModules(server, callback) {
    var apiExtensionLoader = null;
    var apiExtensionDir = null;
    var adminApiPath = null;
    var tasks = [];

    if (server.options.root && server.options.root.toLowerCase() === 'parent') {
        server.logger.debug('server.extensions FROM ROOT');

        apiExtensionLoader = loader.matchInRoot.bind(loader);
        adminApiPath       = loader.ROOT.path;
        apiExtensionDir    = adminApiPath + Path.sep + 'node_modules';
    }
    else {
        server.logger.debug('server.extensions FROM EXTERN');
        apiExtensionLoader = loader.matchInExternal.bind(loader);
        apiExtensionDir    = loader.EXTERNAL.path;
    }

    const apiModules   = apiExtensionLoader(/^restfs-api-.*/);

    apiModules.forEach(apiModule => {

        var moduleOptions = server.options.modules && server.options.modules[apiModule] || {};
        var moduleEnabled = !moduleOptions.disabled;
        server.logger.debug('MODULE OPTIONS', apiModule, moduleOptions, moduleEnabled);

        if (moduleEnabled) {
            tasks.push(mapper.map.bind(null,
                apiExtensionDir + Path.sep + apiModule,
                moduleOptions
            ));
        }

    });

    async.parallel(tasks, (error, results) => {

        results.forEach(result => {
            // TODO fix the result structure
            const error = result[1];
            const map = result[0];

            const instances = instanciateMap(map);
            server.registerApi(instances);
        });

        callback(null, server);
    });
};
