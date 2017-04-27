'use strict';

/**
 * Modules
 */
const AsyncFlow = require('..');
const inspect = require('util').inspect;

/**
 * instances
 */
var async = new AsyncFlow();

function fn1(cb) {
  cb(null, 1);
}

function sum(num1, num2, cb) {

  if (typeof num2 == 'function') {
    cb = num2;
  }

  var err = new TypeError('invalid num2');
  err.original = {num1, num2};
  cb(err);
}


async.task(fn1);    // sum = 1
async.task(sum, 3); // will callback error, since it doesn't wait for previous result
async.wait(sum, 5);  // sum = 4 + 5

async.run(function (err, res) {
  console.error(inspect(err, {colors: true}));
});