'use strict';

module.exports = Order;
const prototype = Order.prototype;

function Order() {

  this.orders = {
    1001: { total: 1000000}
  }
}

prototype.find = function(oId, cb) {
  cb(null, this.orders[oId]);
};