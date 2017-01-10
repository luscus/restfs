'use strict';

const deepFreeze = require('deep-freeze-strict');

module.exports = {
    chainPosition: 'pre',
    position: {
        absolute: 'pre',
        relative: {
            after: ['resolveAction']
        }
    },
    autoload: true,
    handler: function freezeContextMeta(context) {
        deepFreeze(context.meta);

        context.logger.debug('REQUEST META', context.meta);
    }
};