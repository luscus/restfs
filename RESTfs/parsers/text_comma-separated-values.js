'use strict';

module.exports = {
    mimetypes: ['text/comma-separated-values'],
    transform: function json(data) {
        var cache = [];

        var content = JSON.stringify(data, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // Enable garbage collection

        return content;
    }
};
