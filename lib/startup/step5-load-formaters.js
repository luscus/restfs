'use strict';

const Path = require('path');

module.exports = function loadFormaters(server, callback) {
    let formaterDir = Path.normalize(Path.join(__dirname, '..', '..', '/RESTfs/formaters'));
    server.formaters = {};

    require('fs').readdirSync(formaterDir).forEach(function(filename) {
        if (filename) {
            let formater = require(formaterDir + Path.sep + filename);
            formater.mimetypes.forEach(mimetype => {
                server.formaters[mimetype] = formater.transform;
            });
        }
    });

    callback(null, server);
};
