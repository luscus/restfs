'use strict';

// TODO evaluate: https://www.npmjs.com/package/require-stack
// TODO evaluate: https://www.npmjs.com/package/stack-trace

exports.format = function format(response, error, isVerbose) {
  console.log('FORMAT ERROR:', response.statusCode, response.statusMessage);

  var errorObject        = {};

  errorObject.statusCode = response.statusCode;
  errorObject.error      = response.statusMessage;
  errorObject.code       = errorObject.error.replace(/ /g, '');

  if (isVerbose) {
    errorObject.reason   =  error.message;
    errorObject.stack    = (error.stack ? error.stack : null);
  }

  return errorObject;
};
