'use strict';

exports.setHeaders = function setHeaders (response, context) {
  exports.setCorsHeaders(response, context);
  exports.setContentHeaders(response, context);
};

exports.setCorsHeaders = function getCorsHeaders (response, context) {
  context.logger.debug(' SETTING CORS HEADERS');

  // see https://www.owasp.org/index.php/List_of_useful_HTTP_headers
  // TODO 'Public-Key-Pins': 'pin-sha256="<sha256>"; pin-sha256="<sha256>"; max-age=15768000; includeSubDomains',
  // TODO https://en.wikipedia.org/wiki/P3P ???
  // TODO https://www.owasp.org/index.php/Content_Security_Policy
  // TODO https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF) + https://github.com/krakenjs/lusca/blob/master/lib/token.js

  response.setHeader('Strict-Transport-Security',  'max-age=31536000; includeSubDomains'); // https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
  response.setHeader('Access-Control-Allow-Origin', context.meta.domain);                       // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin
  response.setHeader('X-XSS-Protection',           '1; mode=block');                       // http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
  response.setHeader('X-Content-Type-Options',     'nosniff');                             // https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
  response.setHeader('X-Frame-Options',            'SAMEORIGIN');                          // https://www.owasp.org/index.php/Clickjacking
};

exports.setContentHeaders = function setContentHeaders (response, context) {

  if (!response.getHeader('content-type')) {
    var contentType = context.meta.headers.accepts && context.meta.headers.accepts.list[0] || context.meta.defaultContentType;
    var charset     = context.meta.headers.charsets && context.meta.headers.charsets[0]    || context.meta.defaultChaset;

    if (!contentType) {
      contentType = 'application/json';
    }

    context.logger.debug(' SETTING HEADER: ', 'Content-Type', contentType + '; charset=' + charset);

    response.setHeader('Content-Type', contentType + '; charset=' + charset);
  }
};
