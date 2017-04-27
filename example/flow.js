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
  cb(null, num1 + num2);
}


async.task(fn1);    // sum = 1
async.wait(sum, 3); // sum = 3 + 1
async.wait(sum, 5);  // sum = 4 + 5

async.run(function (err, res) {
    console.log(`res got: ${res}`);
  });
