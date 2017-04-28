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
var async = new Async({last: false});

// forEach dirs
dirs.map(dir=> join(__dirname, dir))
  .forEach(dir=> {
    async.task(fs.readdir, dir)
  });

// concat files found
async.task(function (next) {

  var files = async.results.map(res=> res[0]).reduce((pre, cur)=> pre.concat(cur), []);
  next(null, files);
});

// write `hello` into new files
async.wait(function(files, next) {

  // another forEach usage case
  files.forEach(file=> {
    async.task(fs.writeFile, join(__dirname, file), 'hello')
  });

  next()
});

async.run();