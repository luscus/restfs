/* jshint node:true */
'use strict';

var tls    = require('tls');
var path   = require('path');
var fs     = require('../../tools/fs');

var secureContexts = {};
var defaultCaCerts = [];
exports.defaultDomain;

exports.readCertificate = function (certpath) {
  var cert = fs.readFileSync(certpath).toString();

  cert = cert.replace(/\r/g, '');
  //cert = cert.replace(/PUBLIC KEY/g, 'CERTIFICATE');


  return cert;
};

exports.getSecureContexts = function getSecureContexts () {
  return secureContexts;
};

exports.SecureContext = function SecureContext (domain,  ssldir) {
  var domaindir = ssldir + path.sep + domain;
  var files     = fs.list(domaindir, 'file');
  var ca = [];

  this.domain = domain;
  console.log('add domain:', this.domain);

  files.forEach(function certIterator (filename) {
    var filepath = domaindir + path.sep + filename;

    if (filename.match(/.*ca\.pem$/)) {
      // domain related CA Cert
      ca.push(exports.readCertificate(filepath));
      console.log('domain CA Cert:', filepath);
    }
    else if (filename.match(/.*cert\.pem$/)) {
      //
      this.certName = filename;
      this.certPath = filepath;
      this.cert = exports.readCertificate(filepath);
      console.log('domain PEM:    ', filepath);
    }
    else if (filename.match(/.*key\.pem$/)) {
      //
      this.keyName = filename;
      this.keyPath = filepath;
      this.key = exports.readCertificate(filepath);
      console.log('domain Key:    ', filepath);
    }
  }.bind(this));

  this.ca = (ca.length ? ca : defaultCaCerts);

  var options = {
    key:  this.key,
    cert: this.cert,
    ca:   this.ca
  };

  this.context = tls.createSecureContext(options);
};

exports.buildSecureContexts = function buildSecureContexts (ssldir, force) {
  force = !!force;

  var domains = fs.list(ssldir, 'directory');
  var files   = fs.list(ssldir, 'files');

  files.forEach(function fileIterator (filename) {
    if (filename.match(/.*ca\.pem$/)) {
      defaultCaCerts.push(exports.readCertificate(ssldir + path.sep + filename));
    }
  });

  domains.forEach(function domainIterator (domain) {
    if (!secureContexts[domain] || force) {
      if (!exports.defaultDomain) {

        exports.defaultDomain = domain;
      }

      console.log('######### '+domain+' #######################################');
      secureContexts[domain] = new exports.SecureContext(domain, ssldir);
    }
  });
};
