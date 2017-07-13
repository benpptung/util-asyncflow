'use strict';

const Async = require('..');
const inspect = require('util').inspect;

var asynfn1 = function(x, next) {

  setTimeout(_=> {
    console.log(x + ': ' + async.results.length);

    next(null, 'asynfn1-> ' + x);
  }, 2000)

};

var asynfn2 = function(x, next) {

  setTimeout(_=> {
    console.log(x + ': ' + async.results.length);

    next(null, 'asynfn2-> ' + x);
  }, 1000)


};

var async = new Async({output: 'collection'});

async.task(asynfn1, 1).task(asynfn1, 3).task(asynfn1, 5).run(finish1);
async.task(asynfn2, 2).task(asynfn2, 4).task(asynfn2, 6).run(finish2);

function finish1(err, collection) {
  if (err) return console.error(err);

  console.log('\nfinish1:');
  console.log(collection);
  console.log()
}

function finish2(err, collection) {
  console.log('\nfinish2:');
  console.log(collection);
  console.log()
}