'use strict';

var accepts   = require('accepts');

module.exports = {
  chainPosition: 'pre',
  position: {
    absolute: 'pre',
    relative: {
      after: ['resolveAction']
    }
  },
  autoload: true,
  handler: function parseHeaders(context) {
      if (context.http.request.headers) {
          var parsedHeaders = accepts(context.http.request);
          var charsets = parsedHeaders.charsets();


          // handle content context.http.request information
          context.meta.headers           = {};
          context.meta.headers.raw       = context.http.request.headers;
          context.meta.headers.encodings = parsedHeaders.encodings();
          context.meta.headers.languages = parsedHeaders.languages();

          context.meta.headers.charsets  = (charsets && charsets[0] !== '*' ? charsets() : ['utf-8']);
          context.meta.headers.accepts   = parsedHeaders.types();

          var index = context.meta.headers.accepts.indexOf('*/*');

          if (index > -1) {
              context.meta.headers.accepts.splice(index, 1);
          }

          context.logger.debug('CONTEXT', context.meta);
      }
  }
};