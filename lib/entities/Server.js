'use strict';

const http2           = require('http2');
const merge           = require('merge');

const config          = require('../tools/config');
const defaultLogger   = require('../tools/logger');
const RequestContext  = require('restfs-lib-classes').RequestContext;
const endpoints       = require('../endpoints/index');
const responseHandler = require('../response');
const ssl             = require('../middleware/ssl/certificates');
const chains          = require('../startup/chains');
const resolveRemote   = require('../../RESTfs/processors/resolveRemote');
const parseHeaders    = require('../../RESTfs/processors/parseHeaders');
const parseUrl        = require('../../RESTfs/processors/parseUrl');

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
    mandatory: {
      resolveRemote: resolveRemote,
      parseUrl: parseUrl,
      parseHeaders: parseHeaders
    },
    all: {
    },
    pre: {
    },
    post: {}
  };

  this.chain       = {
    mandatory: [parseUrl.handler, parseHeaders.handler],
    pre: [],
    post: []
  };

  this.routes        = {};

  serverOptions.ALPNProtocols = ['HTTP/2', 'HTTP'];
  serverOptions.NPNProtocols  = serverOptions.ALPNProtocols;

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

  this.server = http2.createServer(serverOptions,  function requestHandler (request, response) {
    request.body = '';

    request.on('data', function(data) {
      request.body += data;
    });

    request.on('end', function() {
      console.log(request.httpVersion);

      _api.logger.debug('-----------------------------------------');
      _api.logger.debug('HTTP Version: ', request.httpVersion);
      // build request context
      console.log(require('restfs-lib-classes'), RequestContext);
      var context  = new RequestContext(request, _api);
      _api.logger.debug('Remote IP:    ', context.meta.remoteIp);

      var max = _api.chain.mandatory.length;
      for (let index = 0; index < max; index += 1) {
        if (!context.meta.failed) {
          try {
            _api.logger.debug('  -- apply "mandatory" handler "' + _api.chain.mandatory[index].name + '"');
            _api.chain.mandatory[index](request, context);
          }
          catch (exception) {
            return context.fail(exception);
          }
        }
      }


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
