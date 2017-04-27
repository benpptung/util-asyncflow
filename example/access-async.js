'use strict';

/**
 * Modules
 */
const Async = require('..');
const fs = require('fs');
const join = require('path').join;
const mkdirp = require('mkdirp');
const inspect = require('util').inspect;
const color = require('colors');

/**
 * instances
 */
var async = new Async({prepend: true});
var dest = join(__dirname, 'xb', 'dc');
var src = join(__dirname, 'hello.txt');

async.task(mkdirp, dest);
async.task(function(cb) {

  fs.createWriteStream(src)
    .on('close', _=> cb(null, src))
    .on('error', err=> cb(err))
    .end('hello world');

});
async.wait(fs.rename, join(dest, 'hello.txt'));

async.run((err, res)=> {

  if (err) return console.error(inspect(err));

  console.log('  see async.results:'.cyan);
  console.log(inspect(async.results, {colors: true}));

});
