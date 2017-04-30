'use strict';

const Async = require('..');
const inspect = require('util').inspect;
const colors = require('colors');

var asynfn1 = function(x, next) {

  console.log(x + ': ' + async.results.length);

  next(null, 'asynfn1-> ' + x);
};

var asynfn2 = function(x, next) {

  console.log(x + ': ' + async.results.length);

  next(null, 'asynfn2-> ' + x);
};

var arr = [1, 2, 3, 4, 5];

var async = Async({output: 'collection'});

  async
  .task(asynfn1, 10)
  .task(asynfn2, 20)
  .task(function(next) {

    var aflow = new Async();
    arr.forEach(x=> aflow.task(asynfn1, x));
    aflow.run(finish); //run another async flow inside an async function
    next()
  })
  .task(asynfn2, 100)
  .run((err, collection)=> {
      console.log('------ 1st final callback start');
      if (err) return console.error(inspect(err));
      console.log(collection);
      console.log('------ 1st final callback end\n');
    });

function finish(err, collection) {

  console.log('\n------ another final callback start');
  if (err) return console.error(inspect(err));
  console.log(collection);
  console.log('------ another final callback end\n')
}