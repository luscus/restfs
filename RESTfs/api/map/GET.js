'use strict';

const RESTfsResponse  = require('restfs-lib-classes').RESTfsResponse;
const map     = require('../../../lib/map.json');

module.exports = {
  handler: function returnApiMap (context) {
    console.log('MAP', map);
    return new RESTfsResponse(map, 200);
  }
};
