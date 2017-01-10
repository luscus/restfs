'use strict';

const RESTfsError = require('restfs-lib-classes').RESTfsError;

module.exports = {
    chainPosition: 'post',
    autoload: true,
    position: {
        absolute: 'post',
        relative: {
            after: ['resolveAliases']
        }
    },
    handler: function setCorsHeaders(context) {
        context.logger.debug('SETTING CORS HEADERS');

        // see https://www.owasp.org/index.php/List_of_useful_HTTP_headers
        // TODO 'Public-Key-Pins': 'pin-sha256="<sha256>"; pin-sha256="<sha256>"; max-age=15768000; includeSubDomains',
        // TODO https://en.wikipedia.org/wiki/P3P ???
        // TODO https://www.owasp.org/index.php/Content_Security_Policy
        // TODO https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF) + https://github.com/krakenjs/lusca/blob/master/lib/token.js

        context.http.response.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authentication');     https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Expose-Headers
        context.http.response.setHeader('Access-Control-Allow-Origin',    context.meta.remote.referer);                  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin
        context.http.response.setHeader('Strict-Transport-Security',     'max-age=31536000; includeSubDomains'); // https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
        context.http.response.setHeader('Referrer-Policy',               'same-origin');                         // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
        context.http.response.setHeader('X-XSS-Protection',              '1; mode=block');                       // http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
        context.http.response.setHeader('X-Content-Type-Options',        'nosniff');                             // https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
        context.http.response.setHeader('X-Frame-Options',               'SAMEORIGIN');                          // https://www.owasp.org/index.php/Clickjacking
    }
};