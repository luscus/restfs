var config = process.env.NODE_CONFIG && JSON.parse(process.env.NODE_CONFIG) || {};

if (!config.port) {
    config.port = 8443;
}

if (!config.root) {
    config.root = 'external'
}

module.exports = Object.freeze(config);
