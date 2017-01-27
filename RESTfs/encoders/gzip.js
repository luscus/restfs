'use strict';

const pako = require('pako');

module.exports = {
    encoding: ['gzip'],
    compress: function compress(data) {
        if (data) {
            return Buffer.from(pako.gzip(data));
        }

        return null;
    },
    decompress: function decompress(data) {
        if (data) {
            return pako.ungzip(data);
        }

        return null;
    }
};
