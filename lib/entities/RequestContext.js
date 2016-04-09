'use strict';

var headers      = require('./../middleware/headers');
var clone        = require('clone');
var deep         = require('deep-lib');
var EventEmitter = require('events').EventEmitter;

function RequestContext (request, api) {
  var emitter = new EventEmitter();
  var self    = this;

  // use the Api logger
  this.logger = api.logger;

  // setup emitter
  this.on      = emitter.on.bind(emitter);
  this.resolve = function resolve (data, statusCode, reasonPhrase) {
    emitter.emit('resolved', self, data, statusCode, reasonPhrase);

    return true;
  };
  this.fail    = function fail (error, statusCode, reasonPhrase) {

    if (typeof error === 'string') {
      // log warning
      this.logger.warn(error);

      error = {
        reasonPhrase: reasonPhrase,
        statusCode:   statusCode,
        message:      error
      };
    }
    else if (error instanceof Error) {
      error.statusCode   = statusCode;
      error.reasonPhrase = reasonPhrase;

      // log error
      this.logger.error(error.stack);
    }

    emitter.emit('error', self, error, statusCode, reasonPhrase);

    return false;
  };

  this.meta   = {};
  this.data   = {
    all:   {},
    query: {},
    url:   {},
    body:  {}
  };
  
  this.meta.domain   = request.socket && request.socket.servername;
  this.meta.url      = request.url;

  // add certificate
  this.meta.certificate = {};
  this.meta.certificate.private = api.secureContexts[this.meta.domain].key;
  this.meta.certificate.public  = api.secureContexts[this.meta.domain].cert;

  // parse url
  var urlParts  = this.meta.url.substring(1).split('/');

  if (!urlParts[urlParts.length - 1]) {
    urlParts.splice(urlParts.length - 1, 1);
  }

  this.meta.remoteIp     = (
    request.headers && request.headers['x-forwarded-for'] ?
      request.headers['x-forwarded-for'].split(',')[0] :
      request.connection.remoteAddress
  );

  this.meta.localRequest = ['127.0.0.1', '::ffff:127.0.0.1'].indexOf(this.meta.remoteIp) > -1;

  this.meta.verbose      = api.options.verbose || this.meta.localRequest;
  this.meta.httpVerb     = request.method;
  this.meta.root         = urlParts.shift() || '/';
  this.meta.route        = '/' + urlParts.join('/');
  this.meta.pathElements = urlParts;
  this.data.body         = request.body && JSON.parse(request.body) || {};
  this.data.all          = clone(this.data.body);

  // reference the parent api Object
  deep.define(this, 'api', api, {enumerable: false});

  var parsedHeaders = headers.parse(request);
  var propertyPaths = deep.getPaths(parsedHeaders);

  propertyPaths.forEach(function propertyIterator (propertyPath) {
    deep.define(this, propertyPath, deep.select(parsedHeaders, propertyPath));
  }.bind(this.meta));

  return this;
}

module.exports = RequestContext;
