'use strict';

module.exports = {
    mimetypes: ['application/json'],
    transform: function json(data) {
        return JSON.parse(data);
    }
};
