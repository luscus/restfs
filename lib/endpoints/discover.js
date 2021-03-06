'use strict';

var loader  = require('package.loader');
var mapper  = require('restfs-lib-mapper');
var path    = require('path');
var map     = require('../map.json');

var adminApiRoot = path.normalize(path.join(__dirname, '..', '..'));

function addToApiMap (apiMap, info) {
  map.routes[apiMap.alias || apiMap.name] = apiMap;
}

module.exports = function discover(api, callback) {
  callback = callback || function () {};

  var apiExtensionLoader = null;
  var apiExtensionDir    = null;
  var adminApiPath       = null;

  if (api.options.root.toLowerCase() === 'parent') {
    api.logger.debug('api.extensions FROM ROOT');

    apiExtensionLoader = loader.matchInRoot.bind(loader);
    adminApiPath       = loader.ROOT.path;
    apiExtensionDir    = adminApiPath + path.sep + 'node_modules';
  }
  else {
    api.logger.debug('api.extensions FROM EXTERN');
    apiExtensionLoader = loader.matchInExternal.bind(loader);
    apiExtensionDir    = loader.EXTERNAL.path;
    adminApiPath       = apiExtensionDir + path.sep + loader.ROOT.name;
  }

  var apiModules   = apiExtensionLoader(/^restfs-api-.*/);

  // add admin api
  apiModules.unshift(adminApiRoot);

  exports.loadApiModules(apiExtensionDir, apiModules, api, function () {

    var apiPlugins = apiExtensionLoader(/^restfs-api-plugin-.*/);

    exports.loadApiPlugins(apiExtensionDir, apiPlugins, api, function () {
      callback();
    });
  });
};

exports.loadApiModules = function loadApiModules(root, apiModules, api, callback) {

  if (apiModules.length) {
    var apiModuleName = apiModules.shift();
    var apiModulePath = (
      path.isAbsolute(apiModuleName) ?
        apiModuleName + path.sep + 'RESTfs'
        : root + path.sep + apiModuleName + path.sep + 'RESTfs'
    );

    var options = api.options.modules && api.options.modules[apiModuleName] || {};

    mapper.map(apiModulePath, options, function (apiMap, info) {

      apiMap.modules.forEach(function (module, index) {
        if (module.handler.name) {
          api.modules[module.chainPosition][module.handler.name] = module;
          api.modules.all[module.handler.name]                   = api.modules[module.chainPosition][module.handler.name];

          if (module.autoload) {
            api.chain[module.chainPosition].push(module.handler);
          }
        }
        else {
          throw new Error('API "' + apiMap.name +'" module #' + index + ' handler function is no named function');
        }
      });

      // load routes
      Object.getOwnPropertyNames(apiMap.routes).forEach(function routeIterator (path) {
        var route   = apiMap.routes[path];

        route.chain = [];

        Object.getOwnPropertyNames(route.verbs).forEach(function verbIterator (verb) {
          if (root === adminApiRoot) {
            // admin routes can use the api Object as "this"
            route.verbs[verb].handler.bind(api);

            route.verbs[verb].pre.forEach(function (handlerName) {
              if (api.modules.all[handlerName] && api.modules.all[handlerName].chainPosition === 'pre') {
                route.chain.push(api.modules.all[handlerName].handler);
              }
            });

            route.chain.push(route.verbs[verb].handler.bind(api));

            route.verbs[verb].post.forEach(function (handlerName) {
              if (api.modules.all[handlerName] && api.modules.all[handlerName].chainPosition === 'post') {
                route.chain.push(api.modules.all[handlerName].handler);
              }
            });
          }
        });
      });

      addToApiMap(apiMap, info);

      exports.loadApiModules(root, apiModules, api, callback);
    });
  }
  else {
    callback();
  }
};

exports.loadApiPlugins = function loadApiPlugins(root, apiModules, api, callback) {
  callback();
};
