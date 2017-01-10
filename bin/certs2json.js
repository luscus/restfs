#!/usr/bin/env node
'use strict';

var path       = require('path');
var fs         = require('../lib/tools/fs');
const loader   = require('package.loader');
const nativeFs = require('fs');

var secureContexts = {};
var defaultCaCerts = [];

function readCertificate (certpath) {
  var cert = fs.readFileSync(certpath).toString();

  cert = cert.replace(/\r/g, '');

  return cert;
}

function readDomainCertificates (domain,  ssldir) {
  var domaindir = ssldir + path.sep + domain;
  var files     = fs.list(domaindir, 'file');
  var ca = [];

  this.domain = domain;
  console.log('add domain:', this.domain);


  files.forEach(function certIterator (filename) {
    var filepath = domaindir + path.sep + filename;

    if (filename.match(/.*ca\.pem$/) || filename.match(/^chain\.pem$/)) {
      // domain related CA Cert
      ca.push(readCertificate(filepath));
      console.log('domain CA Cert:', filepath);
    }
    else if (filename.match(/.*cert\.pem$/)) {
      //
      this.certName = filename;
      this.certPath = filepath;
      this.cert = readCertificate(filepath);
      console.log('domain PEM:    ', filepath);
    }
    else if (filename.match(/.*key\.pem$/)) {
      //
      this.keyName = filename;
      this.keyPath = filepath;
      this.key = readCertificate(filepath);
      console.log('domain Key:    ', filepath);
    }
  }.bind(this));

  this.ca = (ca.length ? ca : defaultCaCerts);

  this.options = {
    key:  this.key,
    cert: this.cert,
    ca:   this.ca
  };
}

exports.generateDomainCertificateList = function generateDomainCertificateList (ssldir, targetdir, force) {

  ssldir    = ssldir || process.argv[2] || '/etc/letsencrypt/live';
  targetdir = targetdir || process.argv[3] || loader.EXTERNAL.path;

  force = !!force;

  var domains = fs.list(ssldir, 'directory');
  var files   = fs.list(ssldir, 'files');

  files.forEach(function fileIterator (filename) {
    if (filename.match(/.*ca\.pem$/)) {
      defaultCaCerts.push(readCertificate(ssldir + path.sep + filename));
    }
  });

  domains.forEach(function domainIterator (domain) {
    if (!secureContexts[domain] || force) {
      console.log('######### '+domain+' #######################################');
      var secureContext      = new readDomainCertificates(domain, ssldir);
      secureContexts[domain] = secureContext.options;
      secureContexts[domain].timestamp = Date.now();
    }
  });

  nativeFs.writeFileSync(targetdir + '/DomainCertificates.json', JSON.stringify(secureContexts));
};

//exports.generateDomainCertificateList();
