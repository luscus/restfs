'use strict';

const pako = require('pako');

module.exports = {
    encoding: ['deflate'],
    compress: function compress(data) {
        if (data) {
            return Buffer.from(pako.deflate(data));
        }

        return null;
    },
    decompress: function decompress(data) {
        if (data) {
            return pako.inflate(data);
        }

        return null;
    }
};
