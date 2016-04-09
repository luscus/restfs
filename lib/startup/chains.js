'use strict';

const map     = require('../map.json');
var   chains  = {};

exports.build = function build(server, callback) {

  const apiNames        = Object.getOwnPropertyNames(map.routes);
  const chainConditions = {
    pre:  [],
    post: []
  };

  Object.getOwnPropertyNames(server.modules.all).forEach(function (module) {
    if (module.chainCondition) {
      chainConditions[module.chainPosition].push(module);
    }
  });
  
  apiNames.forEach(function apiIterator(apiName) {
    const api       = map.routes[apiName];
    const endpoints = Object.getOwnPropertyNames(api.routes);

    exports.applyChainConditions(server, api);

    endpoints.forEach(function endpoindIterator(endpointReference) {
      const endpoint     = api.routes[endpointReference];
      const endpointPath = '/' + apiName + endpointReference;
      const verbs        = Object.getOwnPropertyNames(endpoint.verbs);

      exports.applyChainConditions(server, endpoint);

      if (!server.routes[endpointPath]) {
        server.routes[endpointPath] = {};
      }

      server.routes[endpointPath].regex           = endpoint.regex;
      server.routes[endpointPath].parameters      = endpoint.parameters;

      verbs.forEach(function verbIterator(verb) {
        const info = endpoint.verbs[verb];
        exports.applyChainConditions(server, info);

        server.routes[endpointPath][verb]         = {};

        // add pre processors
        server.routes[endpointPath][verb].pre   = [].concat(
          server.chain && server.chain.pre     || [],
          api.chain && api.chain.pre           || [],
          endpoint.chain && endpoint.chain.pre || [],
          info.chain && info.chain.pre         || []
        );

        // add endpoint handler
        server.routes[endpointPath][verb].handler = info.handler;

        // add post processors
        server.routes[endpointPath][verb].post   = [].concat(
          info.chain && info.chain.post         || [],
          endpoint.chain && endpoint.chain.post || [],
          api.chain && api.chain.post           || [],
          server.chain && server.chain.post     || []
        );
      });
    });
  });

  callback();
};

exports.applyChainConditions = function applyChainConditions (server, routeElement) {
  Object.getOwnPropertyNames(server.modules.all).forEach(function (moduleName) {
    var module = server.modules.all[moduleName];
    
    if (module.chainCondition && module.chainCondition(routeElement)) {
      if (!routeElement.chain) {
        routeElement.chain = {};
      }

      if (!routeElement.chain[module.chainPosition]) {
        routeElement.chain[module.chainPosition] = [];
      }

      server.logger.debug('   -- add conditioned chain module ' + module.chainPosition + ':' + module.handler.name);
      routeElement.chain[module.chainPosition].push(module.handler);
    }
  });
};
