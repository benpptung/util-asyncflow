'use strict';

/**
 * add1() @
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */

const Async = require('..');

function resAfter2Sec(x, cb) {
  setTimeout(_=> cb(null, x), 2000);
}

function add1(x, cb) {

  var async = new Async();
  async.task(resAfter2Sec, 20).run(done);
  async.task(resAfter2Sec, 30).run(done);

  function done() {
    let results = async.results;
    if (results.length == 2) {
      cb(null, x + results[0][0] + results[1][0]);
    }
  }
}

add1(10, (err, res)=> {
  console.log(res);
});