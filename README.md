# util-asyncflow

A thin and tiny utility to control async flows. 
This is similiar to [async](http://caolan.github.io/async/)'s `series`, `seq`, `compose`, `waterfall`... in control flow section. Just 240 lines.

See also [util-retry](https://www.npmjs.com/package/util-retry) - an async function retry flow utility

#### Why this?
- This code is simpler, and has `NO` dependency.

- Few methods to learn for async flows control. 

- Flexible to manage arguments and results during async flow.

- Easy to connect multiple async flows and less callback hell, see [`example 5`](#example-5)

- Make codes clean and readable using async function and callback.



# installation

```
npm install util-asyncflow
```


# API

### new AsyncFlow([option, [thisArg]]) 

#### option:

- prepend: {Boolean}, default to false. Prepend previous async function result to the arguments of next async function like [`example 1`](#example-1)

- output: '`last`|`collection`|`rest`', default to `last`. This option control how all results returned in the `final callback`. 

  -`last`: callback last function result
  
  -`collection`: Receive all task results in a collection style, so it is easy to handle collection via `forEach`, `map`...   See [`example 4`](#example-4)
  
  -`rest`: Receive all task results too, but in a `rest` style.  see [`example 2`](#example-2)
  
- halt: {Boolean}, default to false. If halt is true, the whole async flow won't run till .go() is called.


#### thisArg:

if thisArg exits, all task functions in the flow will be bound to this `thisArg`.

<b>example:</b> send context as second option

```

prototype.method = function(arg, cb) {

  var fl = new AsyncFlow(this);
  
  fl.task(this.method2, arg);
  
  fl.wait(this.method3)
  
  fl.run(cb)
}

```
All `method2`, `method3`, in the above `method` will be bound to `this` automatically.


### .task(fn, [arg1,[arg2...)

Add an async function as a task following necessary arguments. ( shortname: `.t()` )

### .wait(fn, [art1, [art2...) 

Add an async function as a task too, but it will wait for previous task's result as part of arguments. This behavior is similar to `seq`, `compose`, `waterfall` in `async`. ( shortname: `.w()` )

### .send([arg1,[arg2...)

send arguments to next Async flow or task.

```
var fl = new Async();

fl.task(fn1);

fl.task(fn2);

fl.send(arg);

fl.run(fl2.go)

var fl2 = new Async({halt: true});

fl2.wait(fn3) // fn3 will recieve `arg`

```

Both of the followings are the same

```
fl.task(fn, arg1, arg2, arg3);

fl.send(arg1, arg2, arg3).wait(fn)
```



### .ctx(thisArg)

update thisArg during this async calls flow.
Call `flow.ctx()`, will set `thisArg` to `null`.


So, we can initiate flow with `this` context

```
var flow = new Asyncflow(this);

flow.task(this.method, arg1, arg2...)
```

switch to `this.db` if necessary
```
flow.ctx(this.db).wait(this.db.method)

flow.run(cb)
```

Shortname is `.c()`

### .run([callback])

Start this async functions flow with an optional `final callback`. This callback will recieve results based on `output` option. 

### .go()

Trigger `new AsyncFlow({halt: true})` to go.

`.go` expects an Error as its first argument. When it is called, the halted async flow will start to run, so we can start another async flow without callback hell.

 



See [`example 5`](#example-5)

### property: results {Array}

All original results are stored in `async.results` in order.

### property: length

How many tasks remaining in the current flow. Same to flow.results.length.

```

fl.task(fn);

fl.task(next=> {

  var res = fl.in(fl.length - 1); // retrieve previous task result
})

```


### .in(index)

A shorthand to retrieve `results[index][0]`, so we can write something like following:

```
var flow = new AsyncFlow();

flow.task(UserModel.findById, 1);  // #1 task

flow.wait(TaskModel); // #2 task

flow.task(next=> {
  let user = flow.in(0); // get user found in #1 task
  
  service.sendNotification(user, 'Task Created', next);
})
...

```

instead of 
```
flow.task(next=> {
  let user = flow.results[0][0]; // get user found in #1 task
  ...
}

```

If this async flow was triggered by `.go()`, `.in(0)` will return the argument sent by previous async flow.

##### todo

Consider to extend this syntax to retrieve previous result.


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
async.task(function(next) {

  fs.createWriteStream(src)
    .on('close', _=> {
      console.log(`\n  ${src}`.green + ' was created.'.cyan );
      next(null, src)
    })
    .on('error', next)
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

# Example 5

From time to time, we have to stop and catch something to decide if go further or not. In that case, to avoid callback hell, we can connect multiple async flows to avoid callback hell using option `halt` and `.go()`.

Call .go() directly
```

///// flow 1
var fl1 = new Async();
fl1.task(mul3async, 2);
fl1.wait(mul3async);
fl1.run((err, res)=> {

  if (err) return console.error(err);

  console.log(res);
  console.log('==== end of fl1');


  if (res > 18) return;
  fl2.go(null, res);
});


///// flow 2
var fl2 = new Async({halt: true});
fl2.wait(mul3async);
fl2.wait(mul3async);
fl2.run((err, res)=> {
  if (err) return console.error(err);

  console.log();
  console.log(res);
  console.log('===== end of fl2');

});



/////////////////////
function pow2inputAfterLong(x, next) {
  setTimeout(_=> {
    next(null, Math.pow(x, 2));
  }, 2000)
}

function mul3async(x, next) {
  setTimeout(_=> {
    next(null, x * 3);
  }, 1000)
}
```



Put .go as a callback

```

///// flow 1
var fl1 = new Async();
fl1.task(mul3async, 2);
fl1.wait(mul3async);
fl1.run((err, res)=> {

  if (err) return console.error(err);

  console.log(res);
  console.log('==== end of fl1');


  mul3async(2, fl2.go)
});


///// flow 2
var fl2 = new Async({halt: true});
fl2.wait(mul3async);
fl2.wait(mul3async);
fl2.run((err, res)=> {
  if (err) return console.error(err);

  console.log();
  console.log(res);
  console.log('===== end of fl2');

});



/////////////////////
function pow2inputAfterLong(x, next) {
  setTimeout(_=> {
    next(null, Math.pow(x, 2));
  }, 2000)
}

function mul3async(x, next) {
  setTimeout(_=> {
    next(null, x * 3);
  }, 1000)
}
```

