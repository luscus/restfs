/* jshint node:true */
'use strict';

var accepts   = require('accepts');
var typer     = require('media-typer');
var useragent = require('useragent');

exports.parse = function parse (request) {
  var parsed = {};

  if (request.headers) {
    var headerNames   = Object.getOwnPropertyNames(request.headers);
    var parsedHeaders = accepts(request);


    // handle content request information
    parsed.headers           = {};
    parsed.headers.raw       = request.headers;
    parsed.headers.encodings = parsedHeaders.encodings();
    parsed.headers.languages = parsedHeaders.languages();
    parsed.headers.accepts   = exports.parseResource(parsedHeaders, request.headers.accept);
    parsed.headers.charsets  = exports.parseCharsets(parsedHeaders.charsets());

    // handle use agent
    var agent    = useragent.parse(request.headers['user-agent']);
    parsed.agent = agent.toJSON();

    headerNames.forEach(function headerIterator(headerName) {
      var name  = headerName.toLowerCase();
      var value = request.headers[headerName];

      switch (name) {

        case 'cache-control':
          break;
      }
    });
  }

  return parsed;
};

exports.parseResource = function parseResource (parsedHeaders, accepts) {
  var result = {'text/plain':{}};

  if (accepts && accepts !== '*/*') {

    result = {};
    result.list = [];

    var types = accepts.split(',');
    var temp  = {};

    types.forEach(function typeIterator (typeExpression) {
      var parts   = typeExpression.split(';');
      var type    = parts.shift().trim();
      var options = {};

      parts.forEach(function optionIterator(option) {
        var keyValue = option.split('=');
        options[keyValue[0].trim()] = keyValue[1].trim();
      });

      temp[type] = options;
    });

    // sort as parsed
    parsedHeaders.types().forEach(function sorter (type) {
      if (type !== '*/*') {
        result.list.push(type);
        result[type] = temp[type];
      }
    });
  }

  return result;
};

exports.parseCharsets = function parseCharsets (charsets) {

  if (charsets && charsets[0] !== '*') {
    return charsets;
  }

  return ['utf-8'];
};
