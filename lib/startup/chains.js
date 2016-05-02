'use strict';

const map     = require('../map.json');
var   chains  = {};

exports.POSITIONS = ['pre', 'post'];

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

  server.logger.debug('  -- Build Action Chains -------------------------');
  apiNames.forEach(function apiIterator(apiName) {
    const api       = map.routes[apiName];
    const endpoints = Object.getOwnPropertyNames(api.routes);

    exports.applyChainConditions(server, api, server);
    server.logger.debug('    - api chain "' + apiName + '":', api.chain);

    endpoints.forEach(function endpoindIterator(endpointReference) {
      const endpoint     = api.routes[endpointReference];
      const endpointPath = '/' + apiName + endpointReference;
      const verbs        = Object.getOwnPropertyNames(endpoint.verbs);

      exports.applyChainConditions(server, endpoint, api);
      server.logger.debug('    - endpoint chain "' + endpoint.regex + '":', endpoint.chain);

      if (!server.routes[endpointPath]) {
        server.routes[endpointPath] = {};
      }

      server.routes[endpointPath].regex           = endpoint.regex;
      server.routes[endpointPath].parameters      = endpoint.parameters;

      verbs.forEach(function verbIterator(verb) {
        const info = endpoint.verbs[verb];
        exports.applyChainConditions(server, info, endpoint);
        server.logger.debug('      - action chain "' + verb + '":', info.chain);

        server.routes[endpointPath][verb]         = info.chain;

        // add endpoint handler
        server.routes[endpointPath][verb].handler = info.handler;
      });
    });
  });

  callback();
};

exports.applyChainConditions = function applyChainConditions (server, routeElement, parentRouteElement) {


  // concat parent into child chain
  exports.concat(parentRouteElement, routeElement);

  Object.getOwnPropertyNames(server.modules.all).forEach(function (moduleName) {

    var module = server.modules.all[moduleName];

    if (typeof module.chainCondition === 'function') {
      let conditionResult = module.chainCondition(routeElement);

      if (conditionResult) {
        if (!routeElement.chain) {
          routeElement.chain = {};
        }

        if (!routeElement.chain[module.chainPosition]) {
          routeElement.chain[module.chainPosition] = [];
        }

        server.logger.debug('        + ADD conditioned chain module ', module.chainPosition, ':', module.handler.name);
        routeElement.chain[module.chainPosition].push(module.handler);
      }
      else if (conditionResult === false) {
        var handlerPosition = routeElement.chain && routeElement.chain[module.chainPosition] && routeElement.chain[module.chainPosition].indexOf(module.handler) || -1;

        if (handlerPosition > -1) {
          server.logger.debug('        - REMOVE conditioned chain module ', module.chainPosition, ':', module.handler.name);
          routeElement.chain[module.chainPosition].splice(handlerPosition, 1);
        }
      }
    }
  });
};

exports.concat = function concat (parent, child, forcedPosition) {
  forcedPosition = (forcedPosition && exports.POSITIONS.indexOf(forcedPosition) > -1 ? forcedPosition : exports.POSITIONS);

  if (!parent.chain || typeof parent.chain !== 'object') {
    parent.chain = {};
  }

  if (!child.chain || typeof child.chain !== 'object') {
    child.chain = {};
  }

  forcedPosition.forEach(function (position) {
    if (!child.chain[position]) {
      child.chain[position] = [];
    }

    if (parent.chain && parent.chain[position]) {
      child.chain[position] = parent.chain[position].concat(child.chain[position]);
    }
  });

  return child.chain;
};
