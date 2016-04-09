'use strict';

const http            = require('http');
const error           = require('./error');
const responseHeaders = require('./headers');
const objectLib       = require('./../tools/object');

exports.success     = function success(route, response, context, data, statusCode, reasonPhrase) {
  exports.postProcessing(route, response, context, data, statusCode, reasonPhrase);
};

exports.failure     = function failure(route, response, context, exception, statusCode, reasonPhrase) {
  statusCode = statusCode || 500;
  exports.postProcessing(route, response, context, exception, statusCode, reasonPhrase);
};

exports.postProcessing = function postProcessing(route, response, context, data, statusCode, reasonPhrase) {

  // set default values
  response.statusCode    = statusCode   || 200;
  response.statusMessage = reasonPhrase || route && route.config.STATUS_CODES && route.config.STATUS_CODES[response.statusCode] || http.STATUS_CODES[response.statusCode];

  if (response.statusCode >= 400 || response.statusCode >= 500) {
    data   = error.format(response, data, context.meta.verbose);
  }

  var max = route && route.chain.post.length || 0;

  for (let index = 0; index < max; index += 1) {
    try {
      context.logger.debug('  -- apply "post" handler "' + route.chain.post[index].name + '"');
      route.chain.post[index](response, context);
    }
    catch(exception) {
      context.logger.error(exception.stack);

      data                   = error.format(response, exception, context.meta.verbose);
      response.statusCode    = 500;
      response.statusMessage = http.STATUS_CODES[response.statusCode];
    }
  }

  exports.send(response, context, data);
};

exports.send        = function send(response, context, data) {
  context.logger.debug(' SENDING', response.statusCode, response.statusMessage, data);

  responseHeaders.setHeaders(response, context);

  context.logger.debug(response.statusCode, response.statusMessage, data, '=>', response._headers);
  data = (data === undefined ? context : data);

  response.writeHead(response.statusCode, response.statusMessage);
  response.write(objectLib.toString(data));
  response.end();
};