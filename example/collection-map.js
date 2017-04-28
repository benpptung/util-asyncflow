'use strict';

/**
 * Modules
 */
const Async = require('..');
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