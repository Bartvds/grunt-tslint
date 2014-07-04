"use strict";

var fs = require("fs");
var mkdirp = require("mkdirp");

var Promise = global.Promise || require("es6-promises").Promise;

function promiseify(func, noErr) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (noErr) {
          resolve(err);
        } else if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
      func.apply(null, args);
    })
  };
}

module.exports = {
  exists: promiseify(fs.exists, true),
  readFile: promiseify(fs.readFile),
  appendFile: promiseify(fs.appendFile),
  mkdirp: promiseify(mkdirp)
};

