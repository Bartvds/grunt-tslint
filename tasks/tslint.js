/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

module.exports = function (grunt) {

  var mc = require("manticore");
  var Promise = global.Promise || require("es6-promises");

  grunt.registerMultiTask("tslint", "A linter for TypeScript.", function () {
    var options = this.options({
      formatter: "prose",
      outputFile: null
    });
    var done = this.async();
    var failed = 0;

    var pool = mc.createPool({
      modulePath: require.resolve('../lib/worker'),
      concurrent: require('os').cpus().length
    });

    Promise.all(this.filesSrc.map(function (filepath) {
      return pool.run('lint', {
        filepath: filepath,
        options: options
      }).then(function(res) {
        if (res) {
          failed += res.failureCount;
          if (res.output && !options.outputFile) {
            grunt.log.error(res.output);
          }
        }
        return res;
      });
    })).then(function (results) {
      if (failed > 0) {
        grunt.log.error(failed + " " + grunt.util.pluralize(failed, "error/errors") + " in " +
            this.filesSrc.length + " " + grunt.util.pluralize(this.filesSrc.length, "file/files"));
        done(false);
      } else {
        grunt.log.ok(this.filesSrc.length + " " + grunt.util.pluralize(this.filesSrc.length, "file/files") + " lint free.");
        done();
      }
    }.bind(this), function (err) {
      grunt.log.error(err.stack);
      done(false);
    });
  });

};
