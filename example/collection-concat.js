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

dirs.map(dir=> join(__dirname, dir))
  .forEach(dir=> {
    async.task(fs.readdir, dir)
  });

async.run(function (err) {
  if (err) return console.error(inspect(err, {colors: true}));

  var files = Array.prototype.slice.call(arguments, 1)
    .reduce((pre, cur)=> pre.concat(cur), []);

  console.log(files);

  console.log(` >>> show async.results`.cyan);
  console.log(inspect(async.results));

});