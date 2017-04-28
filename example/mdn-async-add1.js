'use strict';

/**
 * add1() @
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 *
 * use util-asyncflow to run parallel async functions
 */

const async = require('..');

function resAfter2Sec(x, cb) {
  setTimeout(_=> cb(null, x), 2000);
}

function add1(x, cb) {

  async({output: 'rest'})
    .task(resAfter2Sec, 20).run(done)
    .task(resAfter2Sec, 30).run(done);

  function done(err, a, b) {
    let res = x + a + b;
    if (res) cb(null, res);
  }
}

console.time('add1');
add1(10, (err, res)=> {
  console.log(res);
  console.timeEnd('add1');
});