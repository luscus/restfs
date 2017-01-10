'use strict';

const json = require('../../RESTfs/parsers/application_json');

module.exports = function loadParsers(server, callback) {

    server.parsers = {};

    server.parsers[json.mimetypes[0]] = json.transform;

    callback(null, server);
};
