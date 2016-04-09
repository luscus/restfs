'use strict';

var path = require('path');
var fs   = require('fs');

var types = ['file', 'directory'];

exports.readFileSync = fs.readFileSync;

exports.list = function list (dirpath, type) {
  type = (types.indexOf(type) > -1 ? type : 'all');

  var folders = fs.readdirSync(dirpath);
  var content = [];

  folders.forEach(function folderIterator (name) {

    if (type === 'all') {
      content.push(name);
    }
    else {
      var stat = fs.statSync(dirpath + path.sep + name);

      switch (type) {
        case 'file':
          if (stat.isFile()) {
            content.push(name);
          }
          break;

        case 'directory':
          if (stat.isDirectory()) {
            content.push(name);
          }
          break;
      }
    }
  });

  // package folder names as Array
  return content;
};
