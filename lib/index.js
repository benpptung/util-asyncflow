'use strict';

module.exports = AsyncFlow;
var prototype = AsyncFlow.prototype;

/**
 *
 * @param opt
 * @return {AsyncFlow}
 * @constructor
 */
function AsyncFlow(opt) {
  if (!(this instanceof AsyncFlow)) return new AsyncFlow(opt);

  opt = opt || {};

  this._tasks = [];

  this.results = [];

  Object.defineProperties(this, {

    append: { get: _=> opt.prepend !== true },

    res: { get: _=> this.results[this.results.length - 1]}
  })
}

/**
 * @public
 * @return {AsyncFlow}
 */
prototype.task = function() {
  this._task().apply(this, arguments);
  return this;
};

/**
 * @public
 * @return {AsyncFlow}
 */
prototype.wait = function() {
  this._task(true).apply(this, arguments);
  return this;
};

/**
 * @public
 * @param cb
 * @return {*}
 */
prototype.run = function(cb) {
  var task = this._tasks.shift();
  var pre_res = this.res || [];

  if (!task) {
    let res = [null].concat(pre_res);
    return cb.apply(null, res);
  }

  var args = task.args;
  if (task.wait === true) {
    args = this.append ? args.concat(pre_res) : pre_res.concat(args);
  }

  args = args.concat([this._cb(cb)]);

  if (typeof task.fn !== 'function') {
    let err = new TypeError('no function to run');
    err.original = task;
    return cb(err)
  }

  task.fn.apply(null, args);
};

/**
 *
 * @param wait
 * @return {Function}
 * @private
 */
prototype._task = function(wait) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var fn = args.shift();
    this._tasks.push({fn, args, wait});
  };
};

/**
 *
 * @param cb
 * @return {Function}
 * @private
 */
prototype._cb = function(cb) {

  var that = this;

  return function () {
    var args = Array.prototype.slice.call(arguments);
    var err = args.shift();
    if (err) return cb(err);

    that.results.push(args);
    that.run(cb);
  };
};