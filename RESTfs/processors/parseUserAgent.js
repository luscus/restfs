'use strict';

var useragent = require('useragent');

module.exports = {
  chainPosition: 'pre',
  position: {
    absolute: 'pre',
    relative: {
      after: ['resolveAction']
    }
  },
  handler: function parseUserAgent(context) {
      if (context.meta.headers.raw['user-agent']) {
          var agent = useragent.parse(context.meta.headers.raw['user-agent']);
          context.meta.headers.agent = agent.toJSON();
      }
  }
};