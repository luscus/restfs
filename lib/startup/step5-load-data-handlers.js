'use strict';

const Path = require('path');

module.exports = function loadDataHandlers(server, callback) {
    let formaterDir = Path.normalize(Path.join(__dirname, '..', '..', '/RESTfs/formaters'));
    let encoderDir = Path.normalize(Path.join(__dirname, '..', '..', '/RESTfs/encoders'));
    server.formaters = {};
    server.encoders = {};

    require('fs').readdirSync(formaterDir).forEach(function(filename) {
        if (filename) {
            let formater = require(formaterDir + Path.sep + filename);
            formater.mimetypes.forEach(mimetype => {
                server.formaters[mimetype] = formater.transform;
            });
        }
    });

    require('fs').readdirSync(encoderDir).forEach(function(filename) {
        if (filename) {
            let encoder = require(encoderDir + Path.sep + filename);
            console.log(formaterDir + Path.sep + filename, encoder);
            server.encoders[encoder.encoding] = encoder;
        }
    });

    callback(null, server);
};
