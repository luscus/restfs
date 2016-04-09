'use strict';

var map     = require('../map.json');

var cache   = {};

module.exports = function find (api, context) {
  api.logger.debug('find route for url: "', context.meta.url + '"');

  var endpoints            = api.routes;
  var endpoint             = cache[context.meta.url] || endpoints && endpoints[context.meta.url];

  if (!endpoint) {
    var endpointPaths = Object.getOwnPropertyNames(endpoints);

    for(var index = 0; index < endpointPaths.length; index += 1) {
      var endpointPath = endpointPaths[index];
      var regex        = endpoints[endpointPath].regex;

      if (regex.test(context.meta.url)) {
        cache[context.meta.url] = endpoint = endpoints[endpointPath];
        context.meta.route      = endpointPath.replace('/' + context.meta.root, '');

        break;
      }
    }
  }

  if (endpoint) {
    api.logger.debug('  -- RESOLVED to route "' + context.meta.route + '"');

    // cache endpoint
    cache[context.meta.url] = endpoint;

    // populate url parameter
    endpoint.parameters.forEach(function (parameter) {
      context.data.url[parameter.name] = context.meta.pathElements[parameter.position];
      context.data.all[parameter.name] = context.meta.pathElements[parameter.position];
    });

    const chain  = endpoint[context.meta.httpVerb];

    if (!chain) {
      return context.fail('Method "' + context.meta.httpVerb + '" not Allowed for endpoint "' + context.meta.url + "'", 405);
    }

    const config = map.routes[context.meta.root].routes[context.meta.route].verbs[context.meta.httpVerb];

    context.meta.defaultContentType = config && config.accept[0];
    context.meta.defaultChaset      = config && config['accept-charset'][0];

    return {
      chain:  chain,
      config: config
    };
  }

  return false;
};
