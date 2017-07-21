'use strict';

const Async = require('..');

///// flow 1
var fl1 = new Async();
fl1.task(mul3async, 2);
fl1.wait(mul3async);
fl1.run((err, res)=> {

  if (err) return console.error(err);

  console.log(res);
  console.log('==== end of fl1');

  mul3async(2, fl2.go);
  //if (res > 18) return;
  //fl2.go(null, res);
});


///// flow 2
var fl2 = new Async({halt: true});
fl2.wait(mul3async);
fl2.wait(mul3async);
fl2.run((err, res)=> {
  if (err) return console.error(err);

  console.log();
  console.log(res);
  console.log('===== end of fl2');

});



/////////////////////
function pow2inputAfterLong(x, next) {
  setTimeout(_=> {
    next(null, Math.pow(x, 2));
  }, 2000)
}

function mul3async(x, next) {
  setTimeout(_=> {
    next(null, x * 3);
  }, 1000)
}