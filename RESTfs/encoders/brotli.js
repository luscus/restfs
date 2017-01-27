'use strict';

const iltorb = require('iltorb').compressSync;

module.exports = {
    encoding: ['br'],
    compress: function compress(data) {
        if (data) {
            return iltorb(Buffer.from(data));
        }

        return null;
    },
    decompress: function decompress(data) {
        if (data) {
            return iltorb.ungzip(data);
        }

        return null;
    }
};
