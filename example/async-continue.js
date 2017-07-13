'use strict';

const Async = require('..');
const inspect = require('util').inspect;

var pow2inputAfterLong = function(x, next) {
  setTimeout(_=> {
    next(null, Math.pow(x, 2));
  }, 2000)
};

var mul3inputAfterShort = function(x, next) {
  setTimeout(_=> {
    next(null, x * 3);
  }, 1000)
};

var aflow1 = new Async();
var aflow2 = new Async({halt: true});

aflow1.task(mul3inputAfterShort, 2);
aflow1.wait(mul3inputAfterShort);
aflow1.run((err, res)=> {

  if (err) return console.error(inspect(err));

  console.log('==== end of aflow1');
  console.log(res);

  if (res > 18) return;
  aflow2.go(null, res);
});

aflow2.wait(mul3inputAfterShort);
aflow2.wait(mul3inputAfterShort);
aflow2.run((err, res)=> {
  if (err) return console.error(inspect(err));

  console.log();
  console.log('===== end of aflow2');
  console.log(res);
});

////// compare with async/await
async function flow() {

  try {
    var res = await mul3inputAfterShort(2);
    res = await mul3inputAfterShort(res);
  } catch (er) {
    return console.error(er);
  }

  console.log('==== end of stage 1');
  console.log(res);

  if (res > 18) return;
  try {
    res = await mul3inputAfterShort(res);
    res = await mul3inputAfterShort(res);
  } catch (er) {
    return console.error(er);
  }

  console.log();
  console.log('===== end of aflow2');
  console.log(res);
}

/// compare with asyncflow
var flow1 = new Async();
var flow2 = new Async();
var data = [];

db.query('ccc', (err, _data)=> {
  data = _data;
  if (data.length > 1) {
    flow1.go();
  }
  else {
    flow2.go();
  }
});

flow1.task(db.writeBack, data[0]);
flow1.task(db.writeBack, data[1]);
flow1.run(err=> console.log('success'));

flow2.task(db.query, 'xxx');
flow2.wait(db.writeBack, '...');
flow2.run();