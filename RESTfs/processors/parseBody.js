'use strict';

const RESTfsError = require('restfs-lib-classes').RESTfsError;

module.exports = {
  chainPosition: 'pre',
  position: {
    absolute: 'pre',
    relative: {
      after: ['parseHeaders']
    }
  },
  autoload: true,
  handler: function parseBody(context) {
      var body = context.http.request.body && JSON.parse(context.http.request.body);

      if (body) {
          var contentType = context.meta.headers.raw['content-type'];
          var parser = context.server.parsers[contentType];

          if (parser) {
              context.meta.data.body = parser(body);
          } else {
              let error = new RESTfsError('Content-Type "' + contentType + '" not supported', 415);
              context.error = error;

              return error;
          }
      }
  }
};