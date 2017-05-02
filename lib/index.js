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

  var output = ~['last', 'collection', 'rest'].indexOf(opt.output) ? opt.output : 'last';

  this._tasks = [];

  this.results = [];

  Object.defineProperties(this, {

    go: { get: _=> this.run.bind(this)},

    output: { get: _=> output},

    append: { get: _=> opt.prepend !== true },

    res: { get: _=> this.results[this.results.length - 1]},

    _finalResAll: {
      get: _=> {

        let all = this.concatResults();
        if (output == 'collection') return [all];
        if (output == 'rest') return all;
        return this.results;
      }
    }
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
 * @return {AsyncFlow}
 */
prototype.run = function(cb) {
  var task = this._tasks.shift();
  var pre_res = this.res || [];

  cb = typeof cb == 'function' ? cb : nop;

  if (!task) {
    pre_res = this.output == 'last' ? pre_res : this._finalResAll;
    let res = [null].concat(pre_res);
    cb.apply(null, res);
    return this;
  }

  if (typeof task.fn !== 'function') {
    let err = new TypeError('asyncflow has no function to run in task');
    err.original = {task};
    cb(err)
    return this;
  }

  var args = task.args;
  if (task.wait === true) {
    args = this.append ? args.concat(pre_res) : pre_res.concat(args);
  }

  args = args.concat([this._cb(cb)]);

  try {
    task.fn.apply(null, args);
  } catch (er) {
    er.original = {task, note: 'if function is an object method, function might need `this` bound to the object. e.g. object.method.bind(object)'};
    cb(er);
  }
  return this;
};

prototype.concatResults = function() {
  return this.results.reduce((pre, cur)=> pre.concat(cur), []);
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

function nop(){}