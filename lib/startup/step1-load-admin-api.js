'use strict';

const Path = require('path');
const mapper  = require('restfs-lib-mapper');
const instanciateMap  = require('restfs-lib-classes').instanciateMap;
const apiRoot = Path.normalize(Path.join(__dirname, '..', '..'));

module.exports = function loadAdminApi(server, callback) {
    var options = server.options.modules && server.options.modules.admin || {};

    mapper.map(apiRoot, options, (error, map) => {
        const instances = instanciateMap(map);

        server.registerApi(instances);

        callback(null, server);
    });
};
