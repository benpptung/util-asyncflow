'use strict';

module.exports = User;
const prototype = User.prototype;

function User() {

  this.result = {
    profile: {
      name: 'ben',
      country: 'Taiwan'
    },
    orders: [1001]
  }
}

prototype.find = function(cb) {

  setTimeout(_=> {
    cb(null, this.result);
  }, 1000);
};