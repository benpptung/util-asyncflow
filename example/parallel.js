'use strict';

const Async = require('..');
const inspect = require('util').inspect;

var asynfn1 = function(x, next) {

  setImmediate(_=> {
    console.log(x + ': ' + async.results.length);

    next(null, 'asynfn1-> ' + x);
  })

};

var asynfn2 = function(x, next) {

  setImmediate(_=> {
    console.log(x + ': ' + async.results.length);

    next(null, 'asynfn2-> ' + x);
  })


};

var async = new Async({output: 'collection'});

async.task(asynfn1, 1).task(asynfn1, 3).task(asynfn1, 5).run(finish);
async.task(asynfn2, 2).task(asynfn2, 4).task(asynfn2, 6).run(finish);

function finish(err, collection) {
  if (err) return console.error(err);

  console.log(collection);
}