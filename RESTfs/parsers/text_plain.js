'use strict';

const YAML = require('yamljs');

module.exports = {
    mimetypes: ['application/x-yaml', 'text/x-yaml'],
    transform: function yaml(data) {
        if (data) {
            return YAML.parse(data);
        }

        return null;
    }
};
