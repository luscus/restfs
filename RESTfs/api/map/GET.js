'use strict';

var map     = require('../../../lib/map.json');

module.exports = {
  handler: function handler (context) {
    context.resolve(map, 'Endpoint Map');
  }
};
