A thin and tiny utility to run async functions in series. 
This is similiar to [async](http://caolan.github.io/async/)'s `series`, `seq`, `compose`, `waterfall`.

### new AsyncFlow({Object}) options:

- prepend: {Boolean}, default to false. Prepend async function result prepend to the arguments in the next async function like [`example 1`](#Example1)

- last: {Boolean}, default to true, if `false`, will return all results in final callback like [`example 2`](#ex2)

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

All results are stored in `async.results` one by one. See [`example 3`](#ex3) how to use it.


#Example 1

prepend previous function result to next function arguments

```
'use strict'

/**
 * Modules
 */
const Async = require('util-asyncflow');
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
async.wait(fs.rename, join(dest, 'hello.txt')); // <--- prepend previous result as argument

async.run((err, res)=> {

  if (err) return console.error(inspect(err));

  console.log('  see async.results:'.cyan);
  console.log(inspect(async.results, {colors: true}));

});
```

#Example 2

return all results

```
// similar to add2() in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const Async = require('util-asyncflow');

function resAfter2Sec(x, cb) {
  setTimeout(_=> cb(null, x), 2000);
}

function add2(x, cb) {

  Async({last: false})
    .task(resAfter2Sec, 20)
    .task(resAfter2Sec, 30)
    .run( (err, a, b)=> cb(null, x + a + b) );
}

add2(10, (err, res)=> {
  console.log(res);
});
```


#Example 3


Handle collection and dynamically add new async function

```
'use strict';

/**
 * modules
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
var async = new Async();

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

  // another forEach usage case, and dynamically add new task
  files.forEach(file=> {
    async.task(fs.writeFile, join(__dirname, file), 'hello')
  });

  next()
});

async.run();
```