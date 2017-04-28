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

dirs.map(dir=> join(__dirname, dir))
  .forEach(dir=> {
    async.task(fs.readdir, dir)
  });

async.run(function (err, results) {
  if (err) return console.error(inspect(err, {colors: true}));

  // manually concat the results
  console.log(results.reduce((pre, cur)=> pre.concat(cur), []))
});