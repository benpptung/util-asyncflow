A thin and tiny utility to run async functions in series. 
This is similiar to [async](http://caolan.github.io/async/)'s `series`, `seq`, `compose`, `waterfall`.

See also [util-retry](https://www.npmjs.com/package/util-retry) - an async function retry flow utility

#### Why the fork?
- This code is simpler, and has no dependency.
- Less methods to manage async control flows. 
- More flexible to manage arguments and results during async flow.

### new AsyncFlow({Object}) options:

- prepend: {Boolean}, default to false. Prepend async function result prepend to the arguments in the next async function like [`example 1`](#example-1)

- output: '`last`|`collection`|`rest`', default to `last`. This option control how all results returned in the `final callback`. 

  -`last`: callback last function result
  
  -`collection`: Receive all task results in a collection style, so it is easy to handle collection via `forEach`, `map`...   See [`example 4`](#example-4)
  
  -`rest`: Receive all task results too, but in a `rest` style.  see [`example 2`](#example-2)


### .task(fn, [arg1,[arg2...)

Add an async function as a task following necessary arguments. 

### .wait(fn, [art1, [art2...) 

Add an async function as a task too, but it will wait for previous task's result as part of arguments. This behavior is similar to `seq`, `compose`, `waterfall` in `async`.

### .run([callback])

Start this async functions flow with an optional `final callback`. This callback will recieve results based on `output` option. 

### property: results {Array}

All original results are stored in `async.results` in order.


# Example 1

prepend previous function result to next function arguments

```
'use strict'

/**
 * Modules
 */
const Async = require('util-asyncflow');
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
async.wait(fs.rename, dest); // prepend previous result as first argument

// exec
async.run( err=> {

  if (err) return console.error(inspect(err));
  console.log('  hello.txt'.green + ' was moved to '.cyan + dest.green + '\n');
});
```

# Example 2

return all results

```
// similar to add2() in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const Async = require('util-asyncflow');

function resAfter2Sec(x, cb) {
  setTimeout(_=> cb(null, x), 2000);
}

function add2(x, cb) {

  Async({output: 'rest'}).task(resAfter2Sec, 20).task(resAfter2Sec, 30)
    .run( (err, a, b)=> cb(null, x + a + b) );
}

console.time('add2');
add2(10, (err, res)=> {
  console.log(res);
  console.timeEnd('add2');
});
```


# Example 3


Handle collection and dynamically add new async function

```
'use strict';

/**
 * modules
 */
const Async = require('util-asyncflow');
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
```


# Example 4

Use simple `forEach` to map value in collection through an async function in series.

```
'use strict';

/**
 * Modules
 */
const Async = require('util-asyncflow');
const join = require('path').join;
const fs = require('fs');
const inspect = require('util').inspect;
const colors = require('colors');

/**
 * instances
 */

var nums = [1, 2, 3, 4, 5];
var async = new Async({output: 'collection'});

function square(x, done) {
  done(null, Math.pow(x, 2));
}

nums.forEach(num=> async.task(square, num));

async.run((err, results)=> {
  console.log(results);
});
```