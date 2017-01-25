'use strict';

const YAML = require('yamljs');

module.exports = {
    mimetypes: ['text/plain', 'application/x-yaml', 'text/x-yaml'],
    transform: function yaml(data) {
        if (data) {
            return YAML.stringify(data);
        }

        return null;
    }
};
