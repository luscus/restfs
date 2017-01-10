'use strict';

const Url          = require('url');

module.exports = {
  chainPosition: 'pre',
  position: {
    absolute: 'pre',
    relative: {
      after: ['resolveReferer']
    }
  },
  autoload: true,
  handler: function parseUrl(context) {
      var url = Url.parse(context.http.request.url, true);

      context.meta.domain = context.http.request.socket && context.http.request.socket.servername;
      context.meta.protocol = context.http.request.scheme;
      context.meta.port = url.port;
      context.meta.url = url.pathname;

      var urlParts = context.meta.url.match(/^\/(.*)\/.*/);
      context.meta.api = (urlParts ? urlParts[1] : null);

      // add request data to context
      context.meta.data.query = url.query || {};
  }
};