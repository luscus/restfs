'use strict';

const tasks = [];

require('fs').readdirSync(__dirname).forEach(function(filename) {

    if (/^step\d+-.*\.js$/.test(filename)) {
        tasks.push( require('./' + filename) );
    }
});

module.exports = tasks;