/* jshint node:true */
'use strict';

var Api = require('./entities/Api');


function RESTsf (options) {
    var api = new Api(options);

    this.refreshEndpoints = function refreshEndpoints () {
        api.refreshEndpoints();
    };

    this.getEndpointNames = function getEndpointNames () {
        // only return a copy
        return api.endpointNames.concat([]);
    };

    this.logger = api.logger;
}

module.exports = RESTsf;
