'use strict';

const https           = require('https');
const merge           = require('merge');

const config          = require('../tools/config');
const defaultLogger   = require('../tools/logger');
const RequestContext  = require('./RequestContext');
const endpoints       = require('../endpoints/index');
const responseHandler = require('../response');
const ssl             = require('../middleware/ssl/certificates');
const chains          = require('../startup/chains');

var map               = require('./../map.json');

function Api (options) {
  options = options || {};

  var _api = this;

  this.logger  = options.logger || defaultLogger;

  this.options         = merge.recursive(true, config, options);
  this.options.verbose = !!(this.options.verboseEnvs && this.options.verboseEnvs.indexOf(process.env.NODE_ENV) > -1);

  ssl.buildSecureContexts(_api);
  this.secureContexts = ssl.getSecureContexts();

  this.options.defaultDomain = this.options.defaultDomain || Object.getOwnPropertyNames(this.secureContexts)[0];

  var serverOptions = {
    port: this.options.port
  };

  this.modules       = {
    all: {},
    pre: {},
    post: {}
  };

  this.chain       = {
    pre: [],
    post: []
  };

  this.routes        = {};

  // set default ssl certificate
  serverOptions.key  = this.secureContexts[this.options.defaultDomain].key;
  serverOptions.cert = this.secureContexts[this.options.defaultDomain].cert;
  serverOptions.ca   = this.secureContexts[this.options.defaultDomain].ca;

  // set SNI support for multiple domains and certificates
  serverOptions.SNICallback = function SNICallback (domain, callback) {
    if (!this.secureContexts[domain]) {
      domain = ssl.defaultDomain;
    }

    callback(null, this.secureContexts[domain].context);
  }.bind(this);

  this.server = https.createServer(serverOptions,  function requestHandler (request, response) {
    request.body = '';

    request.on('data', function(data) {
      request.body += data;
    });

    request.on('end', function() {

      _api.logger.debug('-----------------------------------------');
      // build request context
      var context  = new RequestContext(request, _api);

      // search and execute route handler
      const route = endpoints.find(_api, context);

      // add event handlers
      context.on('resolved', responseHandler.success.bind(null, route, response));
      context.on('error',    responseHandler.failure.bind(null, route, response));

      if (route) {

        var max = route.chain.pre.length;

        for (let index = 0; index < max; index += 1) {
          if (!context.meta.failed) {
            try {
              _api.logger.debug('  -- apply "pre" handler "' + route.chain.pre[index].name + '"');
              route.chain.pre[index](request, context);
            }
            catch (exception) {
              return context.fail(exception);
            }
          }
        }

        if (!context.meta.failed) {
          _api.logger.debug('  -- apply route handler "' + route.chain.handler.name + '"');
          route.chain.handler(context);
        }
      }
      else {
        return context.fail('Endpoint "' + context.meta.url + '" not found', 404);
      }
    });
  }.bind(this));

  this.refreshEndpoints = function refreshEndpoints (callback) {
    endpoints.discover(this, function () {
      chains.build(_api, callback);
    });
  };

  this.getApiList = function getApiList () {
    return Object.getOwnPropertyNames(map.routes);
  };


  this.refreshEndpoints(function () {
    _api.server.listen(_api.options.port);
    console.log('Api listening on: https://'+ssl.defaultDomain+':' + _api.options.port);
  });
}

module.exports = Api;
