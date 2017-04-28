'use strict';

/**
 * add2() @
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */

const Async = require('..');

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

