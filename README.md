A thin and tiny utility to run async functions in series. This utility is similiar to [async](http://http://caolan.github.io/async/)'s `series`, `seq`, `compose`.

### new AsyncFlow({Object}) options:

- prepend: {Boolean}, default to false. Prepend async function result prepend to the arguments in the next async function

```
const AsyncFlow = require('util-asyncflow');

var async = new AsyncFlow({prepend: true}); // prepend defaults to false
```

### .task(fn, [arg1,[arg2...)

Add an async function as a task following necessary arguments. 

### .wait(fn, [art1, [art2...) 

Add an async function as a task too, but it will wait for previous task's result as part of arguments. This behavior is similar to `seq` in `async`.

### .run(callback)

Start this async functions flow with a final callback. This callback will recieve the last async function callback result if any. 

### property: results {Array}

All results by async functions in sequence


# Example
```
'use strict'

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