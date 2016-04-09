'use strict';

var priority = [
    'debug',
    'info',
    'warn',
    'error'
];

var isEnabled         = {};

var currentLevel      = 'debug';
var currentLevelIndex = priority.indexOf(currentLevel);

function log () {
    var args  = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
    var level = args.shift();

    if (isEnabled[level] === undefined) {
        isEnabled[level] = (priority.indexOf(level) >= currentLevelIndex);
    }

    if (isEnabled[level]) {
        if (typeof console[level] === 'function') {
            console[level].apply(null, args);
        }
        else {
            console.log.apply(null, args);
        }
    }
}

module.exports = {
    level: function level(newLevel) {
        if (!newLevel) {
            return currentLevel;
        }
        else {
            var index = priority.indexOf(newLevel.toString().toLowerCase());

            if (index > -1) {
                currentLevel      = newLevel;
                currentLevelIndex = index;
                isEnabled         = {};
            }
        }
    },
    error: log.bind(module.exports, 'error'),
    warn: log.bind(module.exports, 'warn'),
    info: log.bind(module.exports, 'info'),
    debug: log.bind(module.exports, 'debug')
};
