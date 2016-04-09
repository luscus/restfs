'use strict';

var map     = require('../../../lib/map.json');

exports.handler = function handler (context) {
  context.resolve(map, 'Endpoint Map');
};
