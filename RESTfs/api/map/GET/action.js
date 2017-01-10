'use strict';

const RESTfsResponse  = require('restfs-lib-classes').RESTfsResponse;

module.exports = function loadApiMap (context) {

    var map = {};

    return new RESTfsResponse(map, 200);
};
