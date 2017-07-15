'use strict';

module.exports = AsyncFlow;
var prototype = AsyncFlow.prototype;

/**
 *
 * @param [opt]
 * @param [context]
 * @return {AsyncFlow}
 * @constructor
 */
function AsyncFlow(opt, context) {
  if (!(this instanceof AsyncFlow)) return new AsyncFlow(opt, context);

  var prepend = false;
  var output = 'last';
  var halt = false;
  var ctx = null;

  if (opt === Object(opt)) {
    var isContext = true;

    if (~['last', 'collection', 'rest'].indexOf(opt.output)) {
      isContext = false;
      output = opt.output;
    }

    if (typeof opt.prepend === 'boolean') {
      isContext = false;
      prepend = opt.prepend;
    }

    if (typeof opt.halt === 'boolean') {
      isContext = false;
      halt = opt.halt;
    }

    if (Object(opt.ctx) === opt.ctx) {
      isContext = false;
      ctx = opt.ctx;
    }

    if (isContext) {
      ctx = opt;
    }
    else {
      if (!ctx && context === Object(context)) ctx = context;
    }
  }

  this._ctx = ctx;

  this._tasks = [];

  this._callback = nop;

  this.results = [];

  Object.defineProperties(this, {

    halt: {
      get: function(){ return halt},
      set: function(){ halt = false }
    },

    go: { get: function(){ return prototype._go.bind(this) }},

    output: { get: function() { return output }},

    append: { get: function(){ return !prepend }},

    res: { get: function(){ return this.results[this.results.length - 1]}},

    _finalResAll: {
      get: function() {

        var all = this.concatResults();
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
 * set thisArg
 * @param {*} ctx
 * @return {AsyncFlow.ctx}
 */
prototype.ctx = function(ctx) {
  this._ctx = !!ctx ? ctx : null;
  return this;
};

/**
 * @public
 * @param cb
 * @return {AsyncFlow}
 */
prototype.run = function(cb) {

  cb = typeof cb == 'function' ? cb : nop;
  if (this.halt === true) {
    this._callback = cb;
    return;
  }

  var task = this._tasks.shift();
  var pre_res = this.res || [];

  if (!task) {
    pre_res = this.output == 'last' ? pre_res : this._finalResAll;
    var res = [null].concat(pre_res);
    cb.apply(null, res);
    return this;
  }

  if (typeof task.fn !== 'function') {
    var err = new TypeError('asyncflow has no function to run in task');
    err.original = {task:task};
    cb(err)
    return this;
  }

  var args = task.args;
  if (task.wait === true) {
    args = this.append ? args.concat(pre_res) : pre_res.concat(args);
  }

  args = args.concat([this._cb(cb)]);

  try {
    task.fn.apply(task.ctx, args);
  } catch (er) {
    //er.original = {task, note: 'if function is an object method, function might need `this` bound to the object. e.g. object.method.bind(object)'};
    er.original = {task:task, note: 'something wrong with task function'};
    cb(er);
  }
  return this;
};

/**
 * todo: might add second param to pre-process the result.
 * @public
 * A shorthand to return results[index][0]
 * @param index
 * @return {*}
 */
prototype.in = function(index) {
  return this.results[index] && this.results[index][0];
};

prototype.concatResults = function() {
  return this.results.reduce(function(pre, cur){ return pre.concat(cur) }, [])
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
    var ctx = this._ctx;
    this._tasks.push({fn:fn, args:args, wait:wait, ctx:ctx});
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
  var called = false;

  return function () {
    if (called) return; // avoid double callback
    called = true;

    var args = Array.prototype.slice.call(arguments);
    var err = args.shift();
    if (err) return cb(err);
    that.results.push(args);
    that.run(cb);
  };
};

/**
 * disable `halt` and re-run this async flow
 * @private
 */
prototype._go = function() {
  if (this.halt !== true) return;
  this.halt = false;

  var cb = typeof this._callback == 'function' ? this._callback : nop;
  this._cb(cb).apply(this, arguments);
};

function nop(){}