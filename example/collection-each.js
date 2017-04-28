'use strict';

/**
 * Modules
 */
const Async = require('..');
const join = require('path').join;
const fs = require('fs');
const inspect = require('util').inspect;
const colors = require('colors');

/**
 * instances
 */

var dirs = ['dir1', 'dir2', 'dir3'];
var async = new Async({output: 'collection'});

// forEach dirs
dirs.map(dir=> join(__dirname, dir))
  .forEach(dir=> {
    async.task(fs.readdir, dir)
  });

// write `hello` into new files
async.run(function(err, results) {

  // manually concat the results
  var files = results.reduce((pre, cur)=> pre.concat(cur), []);

  // another forEach usage case
  files.forEach(file=> {
    async.task(fs.writeFile, join(__dirname, file), 'hello')
  });

  async.run();
});