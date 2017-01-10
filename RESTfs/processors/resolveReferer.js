'use strict';

const deep       = require('deep-lib');

module.exports = {
    chainPosition: 'pre',
    description: 'retrieves the client\'s ip address and if it came from the local host',
    autoload: true,
    handler: function resolveReferer(context) {
        var referer = context.http.request.headers.referer || context.http.request.headers.origin || context.http.request.headers.host;
        var protocol = (context.http.request.socket.encrypted ? 'https://' : 'http://');

        if (referer) {
            // remove all trailing url information: path, query
            var firstSlash = referer.indexOf('/', protocol.length);
            var end   = (firstSlash > -1 ? firstSlash : referer.length);
            referer = referer.substr(0, end);

            // TODO referer same-origin take account of port: test it
            // remove the port part
            //var start = (referer.indexOf(']') > -1 ? referer.indexOf(']') : protocol.length);
            //var portIndex = referer.indexOf(':', start);
            //referer = (portIndex > -1 ? referer.substring(0, portIndex) : referer);
        } else {
            // return a default referer that is either
            //    localhost if the request comes for the host
            //    the default domain of the server instance
            referer = (context.meta.remote.isLocal ? 'localhost' : context.server.options.defaultDomain);
        }

        context.meta.remote.referer = (referer.indexOf('http') === 0 ? referer : protocol + referer);
    },
};