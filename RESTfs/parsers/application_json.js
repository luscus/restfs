'use strict';

module.exports = {
    mimetypes: ['application/json'],
    transform: function json(data) {
        if (data) {
            return JSON.parse(data);
        }

        return null;
    }
};
