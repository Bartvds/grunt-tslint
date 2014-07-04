"use strict";

var path = require("path");

var Linter = require("tslint");

var mc = require("manticore");
var fs = require('./minifs');

mc.registerTask(function lint(params) {
  return fs.exists(params.filepath).then(function (exist) {
    if (!exist) {
      return null
    }
    return fs.readFile(params.filepath, "utf8").then(function (contents) {
      var linter = new Linter(params.filepath, contents, params.options);
      var result = linter.lint();
      var outputFile = params.options.outputFile;

      result.output = result.output.split("\n").reduce(function (memo, line) {
        if (line !== "") {
          memo.push(line + "\n");
        }
        return memo;
      }, []).join("");

      if (result.failureCount === 0 || !outputFile) {
        return result;
      }

      return fs.mkdirp(path.dirname(outputFile)).then(function () {
        return fs.appendFile(outputFile, result.output, "utf8");
      }).then(function () {
        return result;
      });
    });
  });
});
