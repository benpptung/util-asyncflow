'use strict';

/**
 * Modules
 */
const Async = require('..');
const fs = require('fs');
const join = require('path').join;
const dirname = require('path').dirname;
const mkdirp = require('mkdirp');
const inspect = require('util').inspect;
const color = require('colors');

/**
 * instances
 */
var async = new Async({prepend: true});
var dest = join(__dirname, 'xb', 'dc', 'hello.txt');
var src = join(__dirname, 'hello.txt');

// make destination directory
async.task(mkdirp, dirname(dest));

// create source file
async.task(function(cb) {

  fs.createWriteStream(src)
    .on('close', _=> {
      console.log(`\n  ${src}`.green + ' was created.'.cyan );
      cb(null, src)
    })
    .on('error', err=> cb(err))
    .end('hello world');

});

// move source file to destination
async.wait(fs.rename, dest);

// exec
async.run( err=> {

  if (err) return console.error(inspect(err));
  console.log('  hello.txt'.green + ' was moved to '.cyan + dest.green + '\n');
});
