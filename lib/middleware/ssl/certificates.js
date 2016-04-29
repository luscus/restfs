/* jshint node:true */
'use strict';

const loader = require('package.loader');
var tls    = require('tls');
var path   = require('path');
var fs     = require('../../tools/fs');

var secureContexts = {};
var defaultCaCerts = [];
exports.defaultDomain;

exports.getSecureContexts = function getSecureContexts () {
  return secureContexts;
};

exports.SecureContext = function SecureContext (domain,  options) {
  this.domain = domain;

  this.cert = options.cert;
  this.key  = options.key;
  this.ca   = options.ca;

  this.context = tls.createSecureContext(options);
};

exports.fetchDomainCertificates = function () {
  return loader.requireFromExternal('DomainCertificates.json');
};

exports.buildSecureContexts = function buildSecureContexts (api, force) {
  force = !!force;

  var domains = exports.fetchDomainCertificates();

  Object.getOwnPropertyNames(domains).forEach(function domainIterator (domain) {
    if (!secureContexts[domain] || force) {
      if (!exports.defaultDomain) {
        exports.defaultDomain = domain;
      }

      api.logger.info('  -- add domain ', domain);
      secureContexts[domain] = new exports.SecureContext(domain, domains[domain]);
    }
  });
};
