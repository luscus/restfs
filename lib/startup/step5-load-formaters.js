'use strict';

const json = require('../../RESTfs/formaters/application_json');

module.exports = function loadFormaters(server, callback) {

    server.formaters = {};

    server.formaters[json.mimetypes[0]] = json.transform;

    callback(null, server);
};
