'use strict';

const AsyncFlow = require('../lib/browser');
const User = require('./db.user');
const Order = require('./db.order');
const inspect = require('util').inspect;

var user = new User();
var order = new Order();
var flow = new AsyncFlow(user);

flow.task(user.find);
flow.wait((user, next)=> {
  next(null, user.orders[0]);
});
flow.ctx(order);
flow.wait(order.find);

console.time('test');
flow.run((err, order)=> {
  console.timeEnd('test');
  if (err) console.error(err);
  console.log(inspect(order));
});