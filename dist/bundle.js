(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],2:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],3:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],4:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],5:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],6:[function(require,module,exports){
var superPropBase = require("./superPropBase");

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

module.exports = _get;
},{"./superPropBase":12}],7:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],8:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
},{"./setPrototypeOf":11}],9:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],10:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"../helpers/typeof":13,"./assertThisInitialized":1}],11:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],12:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf");

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

module.exports = _superPropBase;
},{"./getPrototypeOf":7}],13:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],14:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":15}],15:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],16:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5Actor = void 0;
const ShadowrunRoller_1 = require("../rolls/ShadowrunRoller");
const helpers_1 = require("../helpers");
const constants_1 = require("../constants");
const PartsList_1 = require("../parts/PartsList");
const ActorPrepFactory_1 = require("./prep/ActorPrepFactory");
class SR5Actor extends Actor {
    update(data, options) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.update.call(this, data, options);
            // trigger update for all items with action
            // needed for rolls to properly update when items or attributes update
            const itemUpdates = [];
            // @ts-ignore
            for (let item of this.data.items) {
                if (item && item.data.action) {
                    itemUpdates.push(item);
                }
            }
            yield this.updateEmbeddedEntity('OwnedItem', itemUpdates);
            return this;
        });
    }
    getOverwatchScore() {
        const os = this.getFlag(constants_1.SYSTEM_NAME, 'overwatchScore');
        return os !== undefined ? os : 0;
    }
    setOverwatchScore(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const num = parseInt(value);
            if (!isNaN(num)) {
                return this.setFlag(constants_1.SYSTEM_NAME, 'overwatchScore', num);
            }
        });
    }
    prepareData() {
        super.prepareData();
        const actorData = this.data;
        const prepper = ActorPrepFactory_1.ActorPrepFactory.Create(actorData);
        if (prepper) {
            prepper.prepare();
        }
    }
    getModifier(modifierName) {
        return this.data.data.modifiers[modifierName];
    }
    findActiveSkill(skillName) {
        if (skillName === undefined)
            return undefined;
        return this.data.data.skills.active[skillName];
    }
    findAttribute(attributeName) {
        if (attributeName === undefined)
            return undefined;
        return this.data.data.attributes[attributeName];
    }
    findVehicleStat(statName) {
        if (statName === undefined)
            return undefined;
        return this.data.data.vehicle_stats[statName];
    }
    findLimitFromAttribute(attributeName) {
        if (attributeName === undefined)
            return undefined;
        const attribute = this.findAttribute(attributeName);
        if (!(attribute === null || attribute === void 0 ? void 0 : attribute.limit))
            return undefined;
        return this.findLimit(attribute.limit);
    }
    findLimit(limitName) {
        if (!limitName)
            return undefined;
        return this.data.data.limits[limitName];
    }
    getWoundModifier() {
        var _a;
        return -1 * ((_a = this.data.data.wounds) === null || _a === void 0 ? void 0 : _a.value) || 0;
    }
    getEdge() {
        return this.data.data.attributes.edge;
    }
    getArmor() {
        return this.data.data.armor;
    }
    getOwnedSR5Item(itemId) {
        return super.getOwnedItem(itemId);
    }
    getMatrixDevice() {
        const matrix = this.data.data.matrix;
        if (matrix.device)
            return this.getOwnedSR5Item(matrix.device);
        return undefined;
    }
    getFullDefenseAttribute() {
        if (this.isVehicle()) {
            return this.findVehicleStat('pilot');
        }
        else {
            let att = this.data.data.full_defense_attribute;
            if (!att)
                att = 'willpower';
            return this.findAttribute(att);
        }
    }
    getEquippedWeapons() {
        return this.items.filter((item) => item.isEquipped() && item.data.type === 'weapon');
    }
    getRecoilCompensation() {
        let total = 1; // always get 1
        const strength = this.findAttribute('strength');
        if (strength) {
            total += Math.ceil(strength.value / 3);
        }
        return total;
    }
    getDeviceRating() {
        return this.data.data.matrix.rating;
    }
    isVehicle() {
        return this.data.type === 'vehicle';
    }
    isGrunt() {
        return this.data.data.is_npc && this.data.data.npc.is_grunt;
    }
    getVehicleTypeSkill() {
        let skill;
        switch (this.data.data.vehicleType) {
            case 'air':
                skill = this.findActiveSkill('pilot_aircraft');
                break;
            case 'ground':
                skill = this.findActiveSkill('pilot_ground_craft');
                break;
            case 'water':
                skill = this.findActiveSkill('pilot_water_craft');
                break;
            case 'aerospace':
                skill = this.findActiveSkill('pilot_aerospace');
                break;
            case 'walker':
                skill = this.findActiveSkill('pilot_walker');
                break;
            case 'exotic':
                skill = this.findActiveSkill('pilot_exotic_vehicle');
                break;
            default:
                break;
        }
        return skill;
    }
    getSkill(skillId) {
        const { skills } = this.data.data;
        if (skills.active.hasOwnProperty(skillId)) {
            return skills.active[skillId];
        }
        if (skills.language.value.hasOwnProperty(skillId)) {
            return skills.language.value[skillId];
        }
        // Knowledge skills are de-normalized into categories (street, hobby, ...)
        for (const categoryKey in skills.knowledge) {
            if (skills.knowledge.hasOwnProperty(categoryKey)) {
                const category = skills.knowledge[categoryKey];
                if (category.value.hasOwnProperty(skillId)) {
                    return category.value[skillId];
                }
            }
        }
    }
    getSkillLabel(skillId) {
        const skill = this.getSkill(skillId);
        if (!skill) {
            return '';
        }
        return skill.label ? skill.label : skill.name ? skill.name : '';
    }
    addKnowledgeSkill(category, skill) {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            mod: 0,
        };
        skill = Object.assign(Object.assign({}, defaultSkill), skill);
        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `data.skills.knowledge.${category}.value`;
        const updateData = {};
        updateData[fieldName] = value;
        this.update(updateData);
    }
    removeLanguageSkill(skillId) {
        const value = {};
        value[skillId] = { _delete: true };
        this.update({ 'data.skills.language.value': value });
    }
    addLanguageSkill(skill) {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            mod: 0,
        };
        skill = Object.assign(Object.assign({}, defaultSkill), skill);
        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `data.skills.language.value`;
        const updateData = {};
        updateData[fieldName] = value;
        this.update(updateData);
    }
    removeKnowledgeSkill(skillId, category) {
        const value = {};
        const updateData = {};
        const dataString = `data.skills.knowledge.${category}.value`;
        value[skillId] = { _delete: true };
        updateData[dataString] = value;
        this.update(updateData);
    }
    rollFade(options = {}, incoming = -1) {
        const wil = duplicate(this.data.data.attributes.willpower);
        const res = duplicate(this.data.data.attributes.resonance);
        const data = this.data.data;
        const parts = new PartsList_1.PartsList();
        parts.addUniquePart(wil.label, wil.value);
        parts.addUniquePart(res.label, res.value);
        if (data.modifiers.fade)
            parts.addUniquePart('SR5.Bonus', data.modifiers.fade);
        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Fade')}`;
        const incomingDrain = {
            label: 'SR5.Fade',
            value: incoming,
        };
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            parts: parts.list,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }
    rollDrain(options = {}, incoming = -1) {
        const wil = duplicate(this.data.data.attributes.willpower);
        const drainAtt = duplicate(this.data.data.attributes[this.data.data.magic.attribute]);
        const parts = new PartsList_1.PartsList();
        parts.addPart(wil.label, wil.value);
        parts.addPart(drainAtt.label, drainAtt.value);
        if (this.data.data.modifiers.drain)
            parts.addUniquePart('SR5.Bonus', this.data.data.modifiers.drain);
        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Drain')}`;
        const incomingDrain = {
            label: 'SR5.Drain',
            value: incoming,
        };
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            parts: parts.list,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }
    rollArmor(options = {}, partsProps = []) {
        const parts = new PartsList_1.PartsList(partsProps);
        this._addArmorParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            actor: this,
            parts: parts.list,
            title: game.i18n.localize('SR5.Armor'),
            wounds: false,
        });
    }
    rollDefense(options = {}, partsProps = []) {
        var _a, _b, _c, _d;
        const parts = new PartsList_1.PartsList(partsProps);
        this._addDefenseParts(parts);
        // full defense is always added
        const activeDefenses = {
            full_defense: {
                label: 'SR5.FullDefense',
                value: (_a = this.getFullDefenseAttribute()) === null || _a === void 0 ? void 0 : _a.value,
                initMod: -10,
            },
        };
        // if we have a melee attack
        if ((_b = options.incomingAttack) === null || _b === void 0 ? void 0 : _b.reach) {
            activeDefenses['dodge'] = {
                label: 'SR5.Dodge',
                value: (_c = this.findActiveSkill('gymnastics')) === null || _c === void 0 ? void 0 : _c.value,
                initMod: -5,
            };
            activeDefenses['block'] = {
                label: 'SR5.Block',
                value: (_d = this.findActiveSkill('unarmed_combat')) === null || _d === void 0 ? void 0 : _d.value,
                initMod: -5,
            };
            const equippedMeleeWeapons = this.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
            let defenseReach = 0;
            equippedMeleeWeapons.forEach((weapon) => {
                var _a;
                activeDefenses[`parry-${weapon.name}`] = {
                    label: 'SR5.Parry',
                    weapon: weapon.name,
                    value: (_a = this.findActiveSkill(weapon.getActionSkill())) === null || _a === void 0 ? void 0 : _a.value,
                    init: -5,
                };
                defenseReach = Math.max(defenseReach, weapon.getReach());
            });
            const incomingReach = options.incomingAttack.reach;
            const netReach = defenseReach - incomingReach;
            if (netReach !== 0) {
                parts.addUniquePart('SR5.Reach', netReach);
            }
        }
        let dialogData = {
            parts: parts.getMessageOutput(),
            cover: options.cover,
            activeDefenses,
        };
        let template = 'systems/shadowrun5e/dist/templates/rolls/roll-defense.html';
        let cancel = true;
        const incomingAttack = options.incomingAttack;
        const event = options.event;
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: game.i18n.localize('SR5.Defense'),
                    content: dlg,
                    buttons: {
                        continue: {
                            label: game.i18n.localize('SR5.Continue'),
                            callback: () => (cancel = false),
                        },
                    },
                    default: 'normal',
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        if (cancel)
                            return;
                        let cover = helpers_1.Helpers.parseInputToNumber($(html).find('[name=cover]').val());
                        let special = helpers_1.Helpers.parseInputToString($(html).find('[name=activeDefense]').val());
                        if (special) {
                            // TODO subtract initiative score when Foundry updates to 0.7.0
                            const defense = activeDefenses[special];
                            parts.addUniquePart(defense.label, defense.value);
                        }
                        if (cover)
                            parts.addUniquePart('SR5.Cover', cover);
                        resolve(ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                            event: event,
                            actor: this,
                            parts: parts.list,
                            title: game.i18n.localize('SR5.DefenseTest'),
                            incomingAttack,
                        }).then((roll) => __awaiter(this, void 0, void 0, function* () {
                            if (incomingAttack && roll) {
                                let defenderHits = roll.total;
                                let attackerHits = incomingAttack.hits || 0;
                                let netHits = attackerHits - defenderHits;
                                if (netHits >= 0) {
                                    const damage = incomingAttack.damage;
                                    damage.mod = PartsList_1.PartsList.AddUniquePart(damage.mod, 'SR5.NetHits', netHits);
                                    damage.value = helpers_1.Helpers.calcTotal(damage);
                                    const soakRollOptions = {
                                        event: event,
                                        damage: damage,
                                    };
                                    yield this.rollSoak(soakRollOptions);
                                }
                            }
                        })));
                    }),
                }).render(true);
            });
        });
    }
    rollSoak(options, partsProps = []) {
        const parts = new PartsList_1.PartsList(partsProps);
        this._addSoakParts(parts);
        let dialogData = {
            damage: options === null || options === void 0 ? void 0 : options.damage,
            parts: parts.getMessageOutput(),
            elementTypes: CONFIG.SR5.elementTypes,
        };
        let id = '';
        let cancel = true;
        let template = 'systems/shadowrun5e/dist/templates/rolls/roll-soak.html';
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: game.i18n.localize('SR5.DamageResistanceTest'),
                    content: dlg,
                    buttons: {
                        continue: {
                            label: game.i18n.localize('SR5.Continue'),
                            callback: () => {
                                id = 'default';
                                cancel = false;
                            },
                        },
                    },
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        if (cancel)
                            return;
                        const soak = (options === null || options === void 0 ? void 0 : options.damage) ? options.damage
                            : {
                                base: 0,
                                value: 0,
                                mod: [],
                                ap: {
                                    base: 0,
                                    value: 0,
                                    mod: [],
                                },
                                attribute: '',
                                type: {
                                    base: '',
                                    value: '',
                                },
                                element: {
                                    base: '',
                                    value: '',
                                },
                            };
                        const armor = this.getArmor();
                        // handle element changes
                        const element = helpers_1.Helpers.parseInputToString($(html).find('[name=element]').val());
                        if (element) {
                            soak.element.value = element;
                        }
                        const bonusArmor = (_a = armor[element]) !== null && _a !== void 0 ? _a : 0;
                        if (bonusArmor) {
                            parts.addUniquePart(CONFIG.SR5.elementTypes[element], bonusArmor);
                        }
                        // handle ap changes
                        const ap = helpers_1.Helpers.parseInputToNumber($(html).find('[name=ap]').val());
                        if (ap) {
                            let armorVal = armor.value + bonusArmor;
                            // don't take more AP than armor
                            parts.addUniquePart('SR5.AP', Math.max(ap, -armorVal));
                        }
                        // handle incoming damage changes
                        const incomingDamage = helpers_1.Helpers.parseInputToNumber($(html).find('[name=incomingDamage]').val());
                        if (incomingDamage) {
                            const totalDamage = helpers_1.Helpers.calcTotal(soak);
                            if (totalDamage !== incomingDamage) {
                                const diff = incomingDamage - totalDamage;
                                // add part and calc total again
                                soak.mod = PartsList_1.PartsList.AddUniquePart(soak.mod, 'SR5.UserInput', diff);
                                soak.value = helpers_1.Helpers.calcTotal(soak);
                            }
                            const totalAp = helpers_1.Helpers.calcTotal(soak.ap);
                            if (totalAp !== ap) {
                                const diff = ap - totalAp;
                                // add part and calc total
                                soak.ap.mod = PartsList_1.PartsList.AddUniquePart(soak.ap.mod, 'SR5.UserInput', diff);
                                soak.ap.value = helpers_1.Helpers.calcTotal(soak.ap);
                            }
                        }
                        let title = game.i18n.localize('SR5.SoakTest');
                        resolve(ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                            event: options === null || options === void 0 ? void 0 : options.event,
                            actor: this,
                            soak: soak,
                            parts: parts.list,
                            title: title,
                            wounds: false,
                        }));
                    }),
                }).render(true);
            });
        });
    }
    rollSingleAttribute(attId, options) {
        const attr = duplicate(this.data.data.attributes[attId]);
        const parts = new PartsList_1.PartsList();
        parts.addUniquePart(attr.label, attr.value);
        this._addMatrixParts(parts, attr);
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts: parts.list,
            title: helpers_1.Helpers.label(attId),
        });
    }
    rollTwoAttributes([id1, id2], options) {
        const attr1 = duplicate(this.data.data.attributes[id1]);
        const attr2 = duplicate(this.data.data.attributes[id2]);
        const label1 = helpers_1.Helpers.label(id1);
        const label2 = helpers_1.Helpers.label(id2);
        const parts = new PartsList_1.PartsList();
        parts.addPart(attr1.label, attr1.value);
        parts.addPart(attr2.label, attr2.value);
        this._addMatrixParts(parts, [attr1, attr2]);
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts: parts.list,
            title: `${label1} + ${label2}`,
        });
    }
    rollNaturalRecovery(track, options) {
        let id1 = 'body';
        let id2 = 'willpower';
        let title = 'Natural Recover';
        if (track === 'physical') {
            id2 = 'body';
            title += ' - Physical - 1 Day';
        }
        else {
            title += ' - Stun - 1 Hour';
        }
        let att1 = duplicate(this.data.data.attributes[id1]);
        let att2 = duplicate(this.data.data.attributes[id2]);
        const parts = new PartsList_1.PartsList();
        parts.addPart(att1.label, att1.value);
        parts.addPart(att2.label, att2.value);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts: parts.list,
            title: title,
            extended: true,
            after: (roll) => __awaiter(this, void 0, void 0, function* () {
                if (!roll)
                    return;
                let hits = roll.total;
                let current = this.data.data.track[track].value;
                current = Math.max(current - hits, 0);
                let key = `data.track.${track}.value`;
                let u = {};
                u[key] = current;
                yield this.update(u);
            }),
        });
    }
    rollMatrixAttribute(attr, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let matrix_att = duplicate(this.data.data.matrix[attr]);
            let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);
            const parts = new PartsList_1.PartsList();
            parts.addPart(CONFIG.SR5.matrixAttributes[attr], matrix_att.value);
            if (options && options.event && options.event[CONFIG.SR5.kbmod.SPEC])
                parts.addUniquePart('SR5.Specialization', 2);
            if (helpers_1.Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
                return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts: parts.list,
                    title: title,
                });
            }
            const attributes = helpers_1.Helpers.filter(this.data.data.attributes, ([, value]) => value.value > 0);
            const attribute = 'willpower';
            let dialogData = {
                attribute: attribute,
                attributes: attributes,
            };
            const buttons = {
                roll: {
                    label: 'Continue',
                    callback: () => (cancel = false),
                },
            };
            let cancel = true;
            renderTemplate('systems/shadowrun5e/dist/templates/rolls/matrix-roll.html', dialogData).then((dlg) => {
                new Dialog({
                    title: `${title} Test`,
                    content: dlg,
                    buttons: buttons,
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        if (cancel)
                            return;
                        const newAtt = helpers_1.Helpers.parseInputToString($(html).find('[name=attribute]').val());
                        let att = undefined;
                        if (newAtt) {
                            att = this.data.data.attributes[newAtt];
                            title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                        }
                        if (att !== undefined) {
                            if (att.value && att.label)
                                parts.addPart(att.label, att.value);
                            this._addMatrixParts(parts, true);
                            this._addGlobalParts(parts);
                            return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                                event: options === null || options === void 0 ? void 0 : options.event,
                                actor: this,
                                parts: parts.list,
                                title: title,
                            });
                        }
                    }),
                }).render(true);
            });
        });
    }
    promptRoll(options) {
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            title: 'Roll',
            parts: [],
            actor: this,
            dialogOptions: {
                prompt: true,
            },
        });
    }
    rollDeviceRating(options) {
        const title = game.i18n.localize('SR5.Labels.ActorSheet.DeviceRating');
        const parts = new PartsList_1.PartsList();
        const rating = this.getDeviceRating();
        // add device rating twice as this is the most common roll
        parts.addPart(title, rating);
        parts.addPart(title, rating);
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            title,
            parts: parts.list,
            actor: this,
        });
    }
    rollAttributesTest(rollId, options) {
        const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
        const atts = this.data.data.attributes;
        const modifiers = this.data.data.modifiers;
        const parts = new PartsList_1.PartsList();
        if (rollId === 'composure') {
            parts.addUniquePart(atts.charisma.label, atts.charisma.value);
            parts.addUniquePart(atts.willpower.label, atts.willpower.value);
            if (modifiers.composure)
                parts.addUniquePart('SR5.Bonus', modifiers.composure);
        }
        else if (rollId === 'judge_intentions') {
            parts.addUniquePart(atts.charisma.label, atts.charisma.value);
            parts.addUniquePart(atts.intuition.label, atts.intuition.value);
            if (modifiers.judge_intentions)
                parts.addUniquePart('SR5.Bonus', modifiers.judge_intentions);
        }
        else if (rollId === 'lift_carry') {
            parts.addUniquePart(atts.strength.label, atts.strength.value);
            parts.addUniquePart(atts.body.label, atts.body.value);
            if (modifiers.lift_carry)
                parts.addUniquePart('SR5.Bonus', modifiers.lift_carry);
        }
        else if (rollId === 'memory') {
            parts.addUniquePart(atts.willpower.label, atts.willpower.value);
            parts.addUniquePart(atts.logic.label, atts.logic.value);
            if (modifiers.memory)
                parts.addUniquePart('SR5.Bonus', modifiers.memory);
        }
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts: parts.list,
            title: `${title} Test`,
        });
    }
    rollSkill(skill, options) {
        var _a;
        let att = duplicate(this.data.data.attributes[skill.attribute]);
        let title = game.i18n.localize(skill.label);
        if (options === null || options === void 0 ? void 0 : options.attribute)
            att = this.data.data.attributes[options.attribute];
        let limit = this.data.data.limits[att.limit];
        const parts = new PartsList_1.PartsList();
        parts.addUniquePart(skill.label, skill.value);
        if ((options === null || options === void 0 ? void 0 : options.event) && helpers_1.Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
            parts.addUniquePart(att.label, att.value);
            if (options.event[CONFIG.SR5.kbmod.SPEC])
                parts.addUniquePart('SR5.Specialization', 2);
            this._addMatrixParts(parts, [att, skill]);
            this._addGlobalParts(parts);
            return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                event: options.event,
                actor: this,
                parts: parts.list,
                limit,
                title: `${title} Test`,
            });
        }
        let dialogData = {
            attribute: skill.attribute,
            attributes: helpers_1.Helpers.filter(this.data.data.attributes, ([, value]) => value.value > 0),
            limit: att.limit,
            limits: this.data.data.limits,
        };
        let cancel = true;
        let spec = '';
        let buttons = {
            roll: {
                label: 'Normal',
                callback: () => (cancel = false),
            },
        };
        // add specializations to dialog as buttons
        if ((_a = skill.specs) === null || _a === void 0 ? void 0 : _a.length) {
            skill.specs.forEach((s) => (buttons[s] = {
                label: s,
                callback: () => {
                    cancel = false;
                    spec = s;
                },
            }));
        }
        renderTemplate('systems/shadowrun5e/dist/templates/rolls/skill-roll.html', dialogData).then((dlg) => {
            new Dialog({
                title: `${title} Test`,
                content: dlg,
                buttons,
                close: (html) => __awaiter(this, void 0, void 0, function* () {
                    if (cancel)
                        return;
                    const newAtt = helpers_1.Helpers.parseInputToString($(html).find('[name="attribute"]').val());
                    const newLimit = helpers_1.Helpers.parseInputToString($(html).find('[name="attribute.limit"]').val());
                    att = this.data.data.attributes[newAtt];
                    title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                    limit = this.data.data.limits[newLimit];
                    parts.addUniquePart(att.label, att.value);
                    if (skill.value === 0)
                        parts.addUniquePart('SR5.Defaulting', -1);
                    if (spec)
                        parts.addUniquePart('SR5.Specialization', 2);
                    this._addMatrixParts(parts, [att, skill]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        actor: this,
                        parts: parts.list,
                        limit,
                        title: `${title} Test`,
                    });
                }),
            }).render(true);
        });
    }
    rollDronePerception(options) {
        if (!this.isVehicle()) {
            return undefined;
        }
        const actorData = duplicate(this.data.data);
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList_1.PartsList();
            const pilot = helpers_1.Helpers.calcTotal(actorData.vehicle_stats.pilot);
            // TODO possibly look for autosoft item level?
            const perception = this.findActiveSkill('perception');
            const limit = this.findLimit('sensor');
            if (perception && limit) {
                parts.addPart('SR5.Vehicle.Clearsight', helpers_1.Helpers.calcTotal(perception));
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);
                this._addGlobalParts(parts);
                return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollDronePerception'),
                });
            }
        }
        else {
            this.rollActiveSkill('perception', options);
        }
    }
    rollPilotVehicle(options) {
        if (!this.isVehicle()) {
            return undefined;
        }
        const actorData = duplicate(this.data.data);
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList_1.PartsList();
            const pilot = helpers_1.Helpers.calcTotal(actorData.vehicle_stats.pilot);
            let skill = this.getVehicleTypeSkill();
            const environment = actorData.environment;
            const limit = this.findLimit(environment);
            if (skill && limit) {
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);
                // TODO possibly look for autosoft item level?
                parts.addPart('SR5.Vehicle.Maneuvering', helpers_1.Helpers.calcTotal(skill));
                this._addGlobalParts(parts);
                return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollPilotVehicleTest'),
                });
            }
        }
        else {
            this.rollActiveSkill('perception', options);
        }
    }
    rollDroneInfiltration(options) {
        if (!this.isVehicle()) {
            return undefined;
        }
        const actorData = duplicate(this.data.data);
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList_1.PartsList();
            const pilot = helpers_1.Helpers.calcTotal(actorData.vehicle_stats.pilot);
            // TODO possibly look for autosoft item level?
            const sneaking = this.findActiveSkill('sneaking');
            const limit = this.findLimit('sensor');
            if (sneaking && limit) {
                parts.addPart('SR5.Vehicle.Stealth', helpers_1.Helpers.calcTotal(sneaking));
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);
                this._addGlobalParts(parts);
                return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollDroneInfiltration'),
                });
            }
        }
        else {
            this.rollActiveSkill('sneaking', options);
        }
    }
    rollKnowledgeSkill(catId, skillId, options) {
        const category = duplicate(this.data.data.skills.knowledge[catId]);
        const skill = duplicate(category.value[skillId]);
        skill.attribute = category.attribute;
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }
    rollLanguageSkill(skillId, options) {
        const skill = duplicate(this.data.data.skills.language.value[skillId]);
        skill.attribute = 'intuition';
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }
    rollActiveSkill(skillId, options) {
        const skill = duplicate(this.data.data.skills.active[skillId]);
        return this.rollSkill(skill, options);
    }
    rollAttribute(attId, options) {
        let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
        const att = duplicate(this.data.data.attributes[attId]);
        const atts = duplicate(this.data.data.attributes);
        const parts = new PartsList_1.PartsList();
        parts.addUniquePart(att.label, att.value);
        let dialogData = {
            attribute: att,
            attributes: atts,
        };
        let cancel = true;
        renderTemplate('systems/shadowrun5e/dist/templates/rolls/single-attribute.html', dialogData).then((dlg) => {
            new Dialog({
                title: `${title} Attribute Test`,
                content: dlg,
                buttons: {
                    roll: {
                        label: 'Continue',
                        callback: () => (cancel = false),
                    },
                },
                default: 'roll',
                close: (html) => __awaiter(this, void 0, void 0, function* () {
                    if (cancel)
                        return;
                    const att2Id = helpers_1.Helpers.parseInputToString($(html).find('[name=attribute2]').val());
                    let att2 = undefined;
                    if (att2Id !== 'none') {
                        att2 = atts[att2Id];
                        if (att2 === null || att2 === void 0 ? void 0 : att2.label) {
                            parts.addUniquePart(att2.label, att2.value);
                            const att2IdLabel = game.i18n.localize(CONFIG.SR5.attributes[att2Id]);
                            title += ` + ${att2IdLabel}`;
                        }
                    }
                    if (att2Id === 'default') {
                        parts.addUniquePart('SR5.Defaulting', -1);
                    }
                    this._addMatrixParts(parts, [att, att2]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        title: `${title} Test`,
                        actor: this,
                        parts: parts.list,
                    });
                }),
            }).render(true);
        });
    }
    _addMatrixParts(parts, atts) {
        if (helpers_1.Helpers.isMatrix(atts)) {
            const m = this.data.data.matrix;
            if (m.hot_sim)
                parts.addUniquePart('SR5.HotSim', 2);
            if (m.running_silent)
                parts.addUniquePart('SR5.RunningSilent', -2);
        }
    }
    _addGlobalParts(parts) {
        if (this.data.data.modifiers.global) {
            parts.addUniquePart('SR5.Global', this.data.data.modifiers.global);
        }
    }
    _addDefenseParts(parts) {
        if (this.isVehicle()) {
            const pilot = this.findVehicleStat('pilot');
            if (pilot) {
                parts.addUniquePart(pilot.label, helpers_1.Helpers.calcTotal(pilot));
            }
            const skill = this.getVehicleTypeSkill();
            if (skill) {
                parts.addUniquePart('SR5.Vehicle.Maneuvering', helpers_1.Helpers.calcTotal(skill));
            }
        }
        else {
            const reaction = this.findAttribute('reaction');
            const intuition = this.findAttribute('intuition');
            if (reaction) {
                parts.addUniquePart(reaction.label || 'SR5.Reaction', reaction.value);
            }
            if (intuition) {
                parts.addUniquePart(intuition.label || 'SR5.Intuition', intuition.value);
            }
        }
        const mod = this.getModifier('defense');
        if (mod) {
            parts.addUniquePart('SR5.Bonus', mod);
        }
    }
    _addArmorParts(parts) {
        const armor = this.getArmor();
        if (armor) {
            parts.addUniquePart(armor.label || 'SR5.Armor', armor.base);
            for (let part of armor.mod) {
                parts.addUniquePart(part.name, part.value);
            }
        }
    }
    _addSoakParts(parts) {
        const body = this.findAttribute('body');
        if (body) {
            parts.addUniquePart(body.label || 'SR5.Body', body.value);
        }
        const mod = this.getModifier('soak');
        if (mod) {
            parts.addUniquePart("SR5.Bonus", mod);
        }
        this._addArmorParts(parts);
    }
    static pushTheLimit(li) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = game.messages.get(li.data().messageId);
            if (msg.getFlag(constants_1.SYSTEM_NAME, constants_1.FLAGS.MessageCustomRoll)) {
                let actor = msg.user.character;
                if (!actor) {
                    // get controlled tokens
                    const tokens = canvas.tokens.controlled;
                    if (tokens.length > 0) {
                        for (let token of tokens) {
                            if (token.actor.owner) {
                                actor = token.actor;
                                break;
                            }
                        }
                    }
                }
                if (actor) {
                    const parts = new PartsList_1.PartsList();
                    parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().value);
                    ShadowrunRoller_1.ShadowrunRoller.basicRoll({
                        title: ` - ${game.i18n.localize('SR5.PushTheLimit')}`,
                        parts: parts.list,
                        actor: actor,
                    }).then(() => {
                        actor.update({
                            'data.attributes.edge.uses': actor.getEdge().uses - 1,
                        });
                    });
                }
                else {
                    // @ts-ignore
                    ui.notifications.warn(game.i18n.localize('SR5.SelectTokenMessage'));
                }
            }
        });
    }
    static secondChance(li) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let msg = game.messages.get(li.data().messageId);
            // @ts-ignore
            let roll = JSON.parse((_a = msg.data) === null || _a === void 0 ? void 0 : _a.roll);
            let formula = roll.formula;
            let hits = roll.total;
            let re = /(\d+)d6/;
            let matches = formula.match(re);
            if (matches && matches[1]) {
                let match = matches[1];
                let pool = parseInt(match.replace('d6', ''));
                if (!isNaN(pool) && !isNaN(hits)) {
                    let actor = msg.user.character;
                    if (!actor) {
                        // get controlled tokens
                        const tokens = canvas.tokens.controlled;
                        if (tokens.length > 0) {
                            for (let token of tokens) {
                                if (token.actor.owner) {
                                    actor = token.actor;
                                    break;
                                }
                            }
                        }
                    }
                    if (actor) {
                        const parts = new PartsList_1.PartsList();
                        parts.addUniquePart('SR5.OriginalDicePool', pool);
                        parts.addUniquePart('SR5.Successes', -hits);
                        return ShadowrunRoller_1.ShadowrunRoller.basicRoll({
                            title: ` - Second Chance`,
                            parts: parts.list,
                            actor: actor,
                        }).then(() => {
                            actor.update({
                                'data.attributes.edge.uses': actor.getEdge().uses - 1,
                            });
                        });
                    }
                    else {
                        // @ts-ignore
                        ui.notifications.warn(game.i18n.localize('SR5.SelectTokenMessage'));
                    }
                }
            }
        });
    }
    /**
     * Override setFlag to remove the 'SR5.' from keys in modlists, otherwise it handles them as embedded keys
     * @param scope
     * @param key
     * @param value
     */
    setFlag(scope, key, value) {
        const newValue = helpers_1.Helpers.onSetFlag(value);
        return super.setFlag(scope, key, newValue);
    }
    /**
     * Override getFlag to add back the 'SR5.' keys correctly to be handled
     * @param scope
     * @param key
     */
    getFlag(scope, key) {
        const data = super.getFlag(scope, key);
        return helpers_1.Helpers.onGetFlag(data);
    }
}
exports.SR5Actor = SR5Actor;

},{"../constants":45,"../helpers":54,"../parts/PartsList":68,"../rolls/ShadowrunRoller":69,"./prep/ActorPrepFactory":18}],17:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5ActorSheet = void 0;
const helpers_1 = require("../helpers");
const chummer_import_form_1 = require("../apps/chummer-import-form");
const SkillEditForm_1 = require("../apps/skills/SkillEditForm");
const KnowledgeSkillEditForm_1 = require("../apps/skills/KnowledgeSkillEditForm");
const LanguageSkillEditForm_1 = require("../apps/skills/LanguageSkillEditForm");
const config_1 = require("../config");
// Use SR5ActorSheet._showSkillEditForm to only ever render one SkillEditForm instance.
// Should multiple instances be open, Foundry will cause cross talk between skills and actors,
// when opened in succession, causing SkillEditForm to wrongfully overwrite the wrong data.
let globalSkillAppId = -1;
/**
 * Extend the basic ActorSheet with some very simple modifications
 */
class SR5ActorSheet extends ActorSheet {
    constructor(...args) {
        super(...args);
        /**
         * Keep track of the currently active sheet tab
         * @type {string}
         */
        this._shownDesc = [];
        this._filters = {
            skills: '',
            showUntrainedSkills: true,
        };
    }
    /* -------------------------------------------- */
    /**
     * Extend and override the default options used by the 5e Actor Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            width: 880,
            height: 690,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.sheetbody',
                    initial: 'skills',
                },
            ],
        });
    }
    get template() {
        const path = 'systems/shadowrun5e/dist/templates/actor/';
        return `${path}${this.actor.data.type}.html`;
    }
    /* -------------------------------------------- */
    /**
     * Prepare data for rendering the Actor sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data = super.getData();
        // General purpose fields...
        data.config = CONFIG.SR5;
        data.filters = this._filters;
        this._prepareMatrixAttributes(data);
        this._prepareActorAttributes(data);
        this._prepareItems(data);
        this._prepareSkillsWithFilters(data);
        this._prepareActorTypeFields(data);
        this._prepareCharacterFields(data);
        return data;
    }
    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }
    _isSkillResonance(skill) {
        return skill.attribute === 'resonance';
    }
    _getSkillLabelOrName(skill) {
        // Custom skills don't have labels, use their name instead.
        return skill.label ? game.i18n.localize(skill.label) : skill.name;
    }
    _doesSkillContainText(key, skill, text) {
        if (!text) {
            return true;
        }
        // Search both english keys, localized labels and all specializations.
        const name = this._getSkillLabelOrName(skill);
        const searchKey = skill.name === undefined ? key : '';
        // some "specs" were a string from old code I think
        const specs = skill.specs !== undefined && Array.isArray(skill.specs) ? skill.specs.join(' ') : '';
        let searchString = `${searchKey} ${name} ${specs}`;
        return searchString.toLowerCase().search(text.toLowerCase()) > -1;
    }
    _prepareCharacterFields(data) {
        // Empty zero value modifiers for display purposes.
        const { modifiers: mods } = data.data;
        for (let [key, value] of Object.entries(mods)) {
            if (value === 0)
                mods[key] = '';
        }
        data.awakened = data.data.special === 'magic';
        data.emerged = data.data.special === 'resonance';
        data.woundTolerance = 3 + (Number(mods['wound_tolerance']) || 0);
    }
    _prepareActorTypeFields(data) {
        data.isCharacter = this.actor.data.type === 'character';
        data.isSpirit = this.actor.data.type === 'spirit';
    }
    _prepareMatrixAttributes(data) {
        const { matrix } = data.data;
        if (matrix) {
            const cleanupAttribute = (attribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod)
                        att.mod = {};
                    if (att.temp === 0)
                        delete att.temp;
                }
            };
            ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att) => cleanupAttribute(att));
        }
    }
    _prepareActorAttributes(data) {
        // Clear visible, zero value attributes temporary modifiers so they appear blank.
        const attrs = data.data.attributes;
        for (let [, att] of Object.entries(attrs)) {
            if (!att.hidden) {
                if (att.temp === 0)
                    delete att.temp;
            }
        }
    }
    _prepareSkillsWithFilters(data) {
        this._filterActiveSkills(data);
        this._filterKnowledgeSkills(data);
        this._filterLanguageSkills(data);
    }
    _filterActiveSkills(data) {
        // Handle active skills directly, as it doesn't use sub-categories.
        data.data.skills.active = this._filterSkills(data, data.data.skills.active);
    }
    _filterKnowledgeSkills(data) {
        // Knowledge skill have separate sub-categories.
        Object.keys(config_1.SR5.knowledgeSkillCategories).forEach((category) => {
            if (!data.data.skills.knowledge.hasOwnProperty(category)) {
                console.warn(`Knowledge Skill doesn't provide configured category ${category}`);
                return;
            }
            data.data.skills.knowledge[category].value = this._filterSkills(data, data.data.skills.knowledge[category].value);
        });
    }
    _filterLanguageSkills(data) {
        // Language Skills have no sub-categories.
        data.data.skills.language.value = this._filterSkills(data, data.data.skills.language.value);
    }
    _filterSkills(data, skills) {
        const filteredSkills = {};
        for (let [key, skill] of Object.entries(skills)) {
            if (this._showSkill(key, skill, data)) {
                filteredSkills[key] = skill;
            }
        }
        helpers_1.Helpers.orderKeys(filteredSkills);
        return filteredSkills;
    }
    _showSkill(key, skill, data) {
        if (this._showMagicSkills(key, skill, data)) {
            return true;
        }
        if (this._showResonanceSkills(key, skill, data)) {
            return true;
        }
        return this._showGeneralSkill(key, skill);
    }
    _isSkillFiltered(skillId, skill) {
        // a newly created skill should be filtered, no matter what.
        const isFilterable = this._getSkillLabelOrName(skill).length > 0;
        const isHiddenForText = !this._doesSkillContainText(skillId, skill, this._filters.skills);
        const isHiddenForUntrained = !this._filters.showUntrainedSkills && skill.value === 0;
        return !(isFilterable && (isHiddenForUntrained || isHiddenForText));
    }
    _showGeneralSkill(skillId, skill) {
        return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill) && this._isSkillFiltered(skillId, skill);
    }
    _showMagicSkills(skillId, skill, data) {
        return this._isSkillMagic(skillId, skill) && data.data.special === 'magic' && this._isSkillFiltered(skillId, skill);
    }
    _showResonanceSkills(skillId, skill, data) {
        return this._isSkillResonance(skill) && data.data.special === 'resonance' && this._isSkillFiltered(skillId, skill);
    }
    _prepareItems(data) {
        const inventory = {};
        inventory['weapon'] = {
            label: game.i18n.localize('SR5.Weapon'),
            items: [],
            dataset: {
                type: 'weapon',
            },
        };
        if (this.actor.data.type === 'character') {
            inventory['armor'] = {
                label: game.i18n.localize('SR5.Armor'),
                items: [],
                dataset: {
                    type: 'armor',
                },
            };
            inventory['device'] = {
                label: game.i18n.localize('SR5.Device'),
                items: [],
                dataset: {
                    type: 'device',
                },
            };
            inventory['equipment'] = {
                label: game.i18n.localize('SR5.Equipment'),
                items: [],
                dataset: {
                    type: 'equipment',
                },
            };
            inventory['cyberware'] = {
                label: game.i18n.localize('SR5.Cyberware'),
                items: [],
                dataset: {
                    type: 'cyberware',
                },
            };
        }
        let [items, spells, qualities, adept_powers, actions, complex_forms, lifestyles, contacts, sins, programs, critter_powers, sprite_powers,] = data.items.reduce((arr, item) => {
            item.isStack = item.data.quantity ? item.data.quantity > 1 : false;
            if (item.type === 'spell')
                arr[1].push(item);
            else if (item.type === 'quality')
                arr[2].push(item);
            else if (item.type === 'adept_power')
                arr[3].push(item);
            else if (item.type === 'action')
                arr[4].push(item);
            else if (item.type === 'complex_form')
                arr[5].push(item);
            else if (item.type === 'lifestyle')
                arr[6].push(item);
            else if (item.type === 'contact')
                arr[7].push(item);
            else if (item.type === 'sin')
                arr[8].push(item);
            else if (item.type === 'program')
                arr[9].push(item);
            else if (item.type === 'critter_power')
                arr[10].push(item);
            else if (item.type === 'sprite_power')
                arr[11].push(item);
            else if (Object.keys(inventory).includes(item.type))
                arr[0].push(item);
            return arr;
        }, [[], [], [], [], [], [], [], [], [], [], [], []]);
        const sortByName = (i1, i2) => {
            if (i1.name > i2.name)
                return 1;
            if (i1.name < i2.name)
                return -1;
            return 0;
        };
        const sortByEquipped = (left, right) => {
            var _a, _b, _c, _d;
            const leftEquipped = (_b = (_a = left.data) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.equipped;
            const rightEquipped = (_d = (_c = right.data) === null || _c === void 0 ? void 0 : _c.technology) === null || _d === void 0 ? void 0 : _d.equipped;
            if (leftEquipped && !rightEquipped)
                return -1;
            if (rightEquipped && !leftEquipped)
                return 1;
            if (left.name > right.name)
                return 1;
            if (left.name < right.name)
                return -1;
            return 0;
        };
        actions.sort(sortByName);
        adept_powers.sort(sortByName);
        complex_forms.sort(sortByName);
        items.sort(sortByEquipped);
        spells.sort(sortByName);
        contacts.sort(sortByName);
        lifestyles.sort(sortByName);
        sins.sort(sortByName);
        programs.sort(sortByEquipped);
        critter_powers.sort(sortByName);
        sprite_powers.sort(sortByName);
        items.forEach((item) => {
            inventory[item.type].items.push(item);
        });
        data.inventory = Object.values(inventory);
        data.magic = {
            spellbook: spells,
            powers: adept_powers,
        };
        data.actions = actions;
        data.complex_forms = complex_forms;
        data.lifestyles = lifestyles;
        data.contacts = contacts;
        data.sins = sins;
        data.programs = programs;
        data.critter_powers = critter_powers;
        data.sprite_powers = sprite_powers;
        qualities.sort((a, b) => {
            if (a.data.type === 'positive' && b.data.type === 'negative')
                return -1;
            if (a.data.type === 'negative' && b.data.type === 'positive')
                return 1;
            return a.name < b.name ? -1 : 1;
        });
        data.qualities = qualities;
    }
    /* -------------------------------------------- */
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.hidden').hide();
        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.list-item');
            const iid = $(item).data().item;
            const field = item.next();
            field.toggle();
            if (iid) {
                if (field.is(':visible'))
                    this._shownDesc.push(iid);
                else
                    this._shownDesc = this._shownDesc.filter((val) => val !== iid);
            }
        });
        html.find('.skill-header').click(this._onFilterUntrainedSkills.bind(this));
        html.find('.cell-input-roll').click(this._onRollCellInput.bind(this));
        html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
        html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));
        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));
        html.find('.skill-edit').click(this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').click(this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').click(this._onShowEditLanguageSkill.bind(this));
        html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
        html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
        html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
        html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
        html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
        html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));
        html.find('.item-roll').click(this._onRollItem.bind(this));
        html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
        html.find('.item-qty').change(this._onChangeQty.bind(this));
        html.find('.item-rtg').change(this._onChangeRtg.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
        html.find('.matrix-att-selector').change(this._onMatrixAttributeSelected.bind(this));
        html.find('.import-character').click(this._onShowImportCharacter.bind(this));
        /**
         * Open the PDF for an item on the actor
         */
        $(html)
            .find('.open-source-pdf')
            .on('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const field = $(event.currentTarget).parents('.list-item');
            const iid = $(field).data().itemId;
            const item = this.actor.getOwnedSR5Item(iid);
            if (item) {
                yield item.openPdfSource();
            }
        }));
        $(html).find('.horizontal-cell-input .cell').on('click', this._onSetCellInput.bind(this));
        $(html).find('.horizontal-cell-input .cell').on('contextmenu', this._onClearCellInput.bind(this));
        /**
         * New API to use for rolling from the actor sheet
         * the clickable label needs the css class Roll
         * a parent of the label needs to have the css class RollId, and then have data-roll-id set
         */
        $(html).find('.Roll').on('click', this._onRollFromSheet.bind(this));
        // updates matrix condition monitor on the device the actor has equippe
        $(html)
            .find('[name="data.matrix.condition_monitor.value"]')
            .on('change', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const value = helpers_1.Helpers.parseInputToNumber(event.currentTarget.value);
            const matrixDevice = this.actor.getMatrixDevice();
            if (matrixDevice && !isNaN(value)) {
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = value;
                yield matrixDevice.update(updateData);
            }
        }));
        // Update Inventory Item
        html.find('.item-edit').click((event) => {
            event.preventDefault();
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            if (item)
                item.sheet.render(true);
        });
        // Delete Inventory Item
        html.find('.item-delete').click((event) => {
            event.preventDefault();
            const iid = helpers_1.Helpers.listItemId(event);
            const el = $(event.currentTarget).parents('.list-item');
            this.actor.deleteOwnedItem(iid);
            el.slideUp(200, () => this.render(false));
        });
        // Drag inventory item
        let handler = (ev) => this._onDragStart(ev);
        html.find('.list-item').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }
    _onRollFromSheet(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            // look for roll id data in the current line
            let rollId = (_a = $(event.currentTarget).data()) === null || _a === void 0 ? void 0 : _a.rollId;
            // if that doesn't exist, look for a prent with RollId name
            rollId = rollId !== null && rollId !== void 0 ? rollId : $(event.currentTarget).parent('.RollId').data().rollId;
            const split = rollId.split('.');
            const options = { event };
            switch (split[0]) {
                case 'prompt-roll':
                    this.actor.promptRoll(options);
                    break;
                case 'armor':
                    this.actor.rollArmor(options);
                    break;
                case 'fade':
                    this.actor.rollFade(options);
                    break;
                case 'drain':
                    this.actor.rollDrain(options);
                    break;
                case 'defense':
                    this.actor.rollDefense(options);
                    break;
                case 'damage-resist':
                    this.actor.rollSoak(options);
                    break;
                // attribute only rolls
                case 'composure':
                    this.actor.rollAttributesTest('composure');
                    break;
                case 'judge-intentions':
                    this.actor.rollAttributesTest('judge_intentions');
                    break;
                case 'lift-carry':
                    this.actor.rollAttributesTest('lift_carry');
                    break;
                case 'memory':
                    this.actor.rollAttributesTest('memory');
                    break;
                case 'vehicle-stat':
                    console.log('roll vehicle stat', rollId);
                    break;
                case 'drone':
                    const prop = split[1]; // we expect another for "drone" category
                    switch (prop) {
                        case 'perception':
                            this.actor.rollDronePerception(options);
                            break;
                        case 'infiltration':
                            this.actor.rollDroneInfiltration(options);
                            break;
                        case 'pilot-vehicle':
                            this.actor.rollPilotVehicle(options);
                            break;
                    }
                    break;
                // end drone
                case 'attribute':
                    const attribute = split[1];
                    if (attribute) {
                        this.actor.rollAttribute(attribute, options);
                    }
                    break;
                // end attribute
                case 'skill':
                    const skillType = split[1];
                    switch (skillType) {
                        case 'active': {
                            const skillId = split[2];
                            this.actor.rollActiveSkill(skillId, options);
                            break;
                        }
                        case 'language': {
                            const skillId = split[2];
                            this.actor.rollLanguageSkill(skillId, options);
                            break;
                        }
                        case 'knowledge': {
                            const category = split[2];
                            const skillId = split[3];
                            this.actor.rollKnowledgeSkill(category, skillId, options);
                            break;
                        }
                    }
                    break;
                // end skill
                case 'matrix':
                    const subkey = split[1];
                    switch (subkey) {
                        case 'attribute':
                            const attr = split[2];
                            this.actor.rollMatrixAttribute(attr, options);
                            break;
                        case 'device-rating':
                            this.actor.rollDeviceRating(options);
                            break;
                    }
                    break;
                // end matrix
            }
        });
    }
    // Setup skill name filter within getData
    _onFilterSkills(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this._filters.skills = event.currentTarget.value;
            yield this.render();
        });
    }
    // Setup untrained skill filter within getData
    _onFilterUntrainedSkills(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this._filters.showUntrainedSkills = !this._filters.showUntrainedSkills;
            yield this.render();
        });
    }
    _onReloadAmmo(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            if (item)
                return item.reloadAmmo();
        });
    }
    _onMatrixAttributeSelected(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let iid = this.actor.data.data.matrix.device;
            let item = this.actor.getOwnedSR5Item(iid);
            if (!item) {
                console.error('could not find item');
                return;
            }
            // grab matrix attribute (sleaze, attack, etc.)
            let att = event.currentTarget.dataset.att;
            // grab device attribute (att1, att2, ...)
            let deviceAtt = event.currentTarget.value;
            // get current matrix attribute on the device
            let oldVal = item.data.data.atts[deviceAtt].att;
            let data = {
                _id: iid,
            };
            // go through atts on device, setup matrix attributes on it
            for (let i = 1; i <= 4; i++) {
                let tmp = `att${i}`;
                let key = `data.atts.att${i}.att`;
                if (tmp === deviceAtt) {
                    data[key] = att;
                }
                else if (item.data.data.atts[`att${i}`].att === att) {
                    data[key] = oldVal;
                }
            }
            yield this.actor.updateOwnedItem(data);
        });
    }
    _onItemCreate(event) {
        event.preventDefault();
        const type = helpers_1.Helpers.listItemId(event);
        const itemData = {
            name: `New ${type}`,
            type: type,
        };
        return this.actor.createOwnedItem(itemData, { renderSheet: true });
    }
    _onAddLanguageSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.actor.addLanguageSkill({ name: '' });
        });
    }
    _onRemoveLanguageSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skillId = helpers_1.Helpers.listItemId(event);
            this.actor.removeLanguageSkill(skillId);
        });
    }
    _onAddKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const category = helpers_1.Helpers.listItemId(event);
            this.actor.addKnowledgeSkill(category);
        });
    }
    _onRemoveKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const [skillId, category] = helpers_1.Helpers.listItemId(event).split('.');
            this.actor.removeKnowledgeSkill(skillId, category);
        });
    }
    _onChangeRtg(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            const rtg = parseInt(event.currentTarget.value);
            if (item && rtg) {
                item.update({ 'data.technology.rating': rtg });
            }
        });
    }
    _onChangeQty(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            const qty = parseInt(event.currentTarget.value);
            if (item && qty) {
                item.data.data.technology.quantity = qty;
                item.update({ 'data.technology.quantity': qty });
            }
        });
    }
    _onEquipItem(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            if (item) {
                const itemData = item.data.data;
                const newItems = [];
                if (item.type === 'device') {
                    // turn off all other devices than the one that is being equipped
                    // if clicking the equipped, toggle it
                    for (let ite of this.actor.items.filter((i) => i.type === 'device')) {
                        newItems.push({
                            '_id': ite._id,
                            'data.technology.equipped': ite._id === iid ? !itemData.technology.equipped : false,
                        });
                    }
                }
                else {
                    newItems.push({
                        '_id': iid,
                        'data.technology.equipped': !itemData.technology.equipped,
                    });
                }
                yield this.actor.updateEmbeddedEntity('OwnedItem', newItems);
                this.actor.render();
            }
        });
    }
    _onSetCellInput(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = Number(event.currentTarget.dataset.value);
            const cmId = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
            const data = {};
            if (cmId === 'stun' || cmId === 'physical') {
                const property = `data.track.${cmId}.value`;
                data[property] = value;
            }
            else if (cmId === 'edge') {
                const property = `data.attributes.edge.uses`;
                data[property] = value;
            }
            else if (cmId === 'overflow') {
                const property = 'data.track.physical.overflow.value';
                data[property] = value;
            }
            else if (cmId === 'matrix') {
                const matrixDevice = this.actor.getMatrixDevice();
                if (matrixDevice && !isNaN(value)) {
                    const updateData = {};
                    updateData['data.technology.condition_monitor.value'] = value;
                    yield matrixDevice.update(updateData);
                }
                else {
                    data['data.matrix.condition_monitor.value'] = value;
                }
            }
            yield this.actor.update(data);
        });
    }
    _onClearCellInput(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmId = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
            const data = {};
            if (cmId === 'stun' || cmId === 'physical') {
                const property = `data.track.${cmId}.value`;
                data[property] = 0;
            }
            else if (cmId === 'edge') {
                const property = `data.attributes.edge.uses`;
                data[property] = 0;
            }
            else if (cmId === 'overflow') {
                const property = 'data.track.physical.overflow.value';
                data[property] = 0;
            }
            else if (cmId === 'matrix') {
                const matrixDevice = this.actor.getMatrixDevice();
                if (matrixDevice) {
                    const updateData = {};
                    updateData['data.technology.condition_monitor.value'] = 0;
                    yield matrixDevice.update(updateData);
                }
                else {
                    data['data.matrix.condition_monitor.value'] = 0;
                }
            }
            yield this.actor.update(data);
        });
    }
    _onRollCellInput(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            let track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
            if (track === 'stun' || track === 'physical') {
                yield this.actor.rollNaturalRecovery(track, event);
            }
            else if (track === 'edge') {
                yield this.actor.rollAttribute('edge');
            }
        });
    }
    _onRollItem(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const iid = helpers_1.Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            if (item) {
                yield item.postCard(event);
            }
        });
    }
    _onRollKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const id = helpers_1.Helpers.listItemId(event);
            const [skill, category] = id.split('.');
            return this.actor.rollKnowledgeSkill(category, skill, { event: event });
        });
    }
    _onRollLanguageSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skill = helpers_1.Helpers.listItemId(event);
            return this.actor.rollLanguageSkill(skill, { event: event });
        });
    }
    _onRollActiveSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skill = helpers_1.Helpers.listItemId(event);
            return this.actor.rollActiveSkill(skill, { event: event });
        });
    }
    _onRollAttribute(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const attr = event.currentTarget.closest('.attribute').dataset.attribute;
            return this.actor.rollAttribute(attr, { event: event });
        });
    }
    /**
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }
    /**
     * @private
     */
    _render(...args) {
        const _super = Object.create(null, {
            _render: { get: () => super._render }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const focusList = $(this.element).find(':focus');
            const focus = focusList.length ? focusList[0] : null;
            this._saveScrollPositions();
            yield _super._render.call(this, ...args);
            this._restoreScrollPositions();
            if (focus && focus.name) {
                const element = this.form[focus.name];
                if (element) {
                    element.focus();
                    // set the selection range on the focus formed from before (keeps track of cursor in input)
                    element.setSelectionRange && element.setSelectionRange(focus.selectionStart, focus.selectionEnd);
                }
            }
        });
    }
    /**
     * @private
     */
    _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }
    /**
     * @private
     */
    _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }
    _closeOpenSkillApp() {
        return __awaiter(this, void 0, void 0, function* () {
            if (globalSkillAppId !== -1) {
                if (ui.windows[globalSkillAppId]) {
                    yield ui.windows[globalSkillAppId].close();
                }
                globalSkillAppId = -1;
            }
        });
    }
    /** Keep track of each SkillEditForm instance and close before opening another.
     *
     * @param skillEditFormImplementation Any extending class! of SkillEditForm
     * @param actor
     * @param options
     * @param args Collect arguments of the different renderWithSkill implementations.
     */
    _showSkillEditForm(skillEditFormImplementation, actor, options, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._closeOpenSkillApp();
            const skillEditForm = new skillEditFormImplementation(actor, options, ...args);
            globalSkillAppId = skillEditForm.appId;
            yield skillEditForm.render(true);
        });
    }
    _onShowEditKnowledgeSkill(event) {
        event.preventDefault();
        const [skill, category] = helpers_1.Helpers.listItemId(event).split('.');
        this._showSkillEditForm(KnowledgeSkillEditForm_1.KnowledgeSkillEditForm, this.actor, {
            event: event,
        }, skill, category);
    }
    _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = helpers_1.Helpers.listItemId(event);
        // new LanguageSkillEditForm(this.actor, skill, { event: event }).render(true);
        this._showSkillEditForm(LanguageSkillEditForm_1.LanguageSkillEditForm, this.actor, { event: event }, skill);
    }
    _onShowEditSkill(event) {
        event.preventDefault();
        const skill = helpers_1.Helpers.listItemId(event);
        // new SkillEditForm(this.actor, skill, { event: event }).render(true);
        this._showSkillEditForm(SkillEditForm_1.SkillEditForm, this.actor, { event: event }, skill);
    }
    _onShowImportCharacter(event) {
        event.preventDefault();
        const options = {
            name: 'chummer-import',
            title: 'Chummer Import',
        };
        new chummer_import_form_1.ChummerImportForm(this.actor, options).render(true);
    }
}
exports.SR5ActorSheet = SR5ActorSheet;

},{"../apps/chummer-import-form":35,"../apps/skills/KnowledgeSkillEditForm":38,"../apps/skills/LanguageSkillEditForm":39,"../apps/skills/SkillEditForm":40,"../config":44,"../helpers":54}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorPrepFactory = void 0;
const CharacterPrep_1 = require("./CharacterPrep");
const SpiritPrep_1 = require("./SpiritPrep");
const SpritePrep_1 = require("./SpritePrep");
const VehiclePrep_1 = require("./VehiclePrep");
class ActorPrepFactory {
    static Create(data) {
        if (data.type === 'character') {
            return new CharacterPrep_1.CharacterPrep(data);
        }
        else if (data.type === 'spirit') {
            return new SpiritPrep_1.SpiritPrep(data);
        }
        else if (data.type === 'sprite') {
            return new SpritePrep_1.SpritePrep(data);
        }
        else if (data.type === 'vehicle') {
            return new VehiclePrep_1.VehiclePrep(data);
        }
    }
}
exports.ActorPrepFactory = ActorPrepFactory;

},{"./CharacterPrep":20,"./SpiritPrep":21,"./SpritePrep":22,"./VehiclePrep":23}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseActorPrep = void 0;
const SR5ItemDataWrapper_1 = require("../../item/SR5ItemDataWrapper");
class BaseActorPrep {
    constructor(data) {
        this.data = data.data;
        this.items = data.items.map((item) => new SR5ItemDataWrapper_1.SR5ItemDataWrapper(item));
    }
}
exports.BaseActorPrep = BaseActorPrep;

},{"../../item/SR5ItemDataWrapper":58}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterPrep = void 0;
const BaseActorPrep_1 = require("./BaseActorPrep");
const InitiativePrep_1 = require("./functions/InitiativePrep");
const ModifiersPrep_1 = require("./functions/ModifiersPrep");
const MatrixPrep_1 = require("./functions/MatrixPrep");
const ItemPrep_1 = require("./functions/ItemPrep");
const SkillsPrep_1 = require("./functions/SkillsPrep");
const LimitsPrep_1 = require("./functions/LimitsPrep");
const ConditionMonitorsPrep_1 = require("./functions/ConditionMonitorsPrep");
const MovementPrep_1 = require("./functions/MovementPrep");
const WoundsPrep_1 = require("./functions/WoundsPrep");
const AttributesPrep_1 = require("./functions/AttributesPrep");
const NPCPrep_1 = require("./functions/NPCPrep");
class CharacterPrep extends BaseActorPrep_1.BaseActorPrep {
    prepare() {
        ModifiersPrep_1.ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep_1.ModifiersPrep.clearAttributeMods(this.data);
        ItemPrep_1.ItemPrep.prepareArmor(this.data, this.items);
        ItemPrep_1.ItemPrep.prepareCyberware(this.data, this.items);
        SkillsPrep_1.SkillsPrep.prepareSkills(this.data);
        AttributesPrep_1.AttributesPrep.prepareAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimitBaseFromAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimits(this.data);
        MatrixPrep_1.MatrixPrep.prepareMatrix(this.data, this.items);
        MatrixPrep_1.MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);
        if (this.data.is_npc && this.data.npc.is_grunt) {
            ConditionMonitorsPrep_1.ConditionMonitorsPrep.prepareGrunt(this.data);
        }
        else {
            ConditionMonitorsPrep_1.ConditionMonitorsPrep.preparePhysical(this.data);
            ConditionMonitorsPrep_1.ConditionMonitorsPrep.prepareStun(this.data);
        }
        MovementPrep_1.MovementPrep.prepareMovement(this.data);
        WoundsPrep_1.WoundsPrep.prepareWounds(this.data);
        InitiativePrep_1.InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep_1.InitiativePrep.prepareAstralInit(this.data);
        InitiativePrep_1.InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep_1.InitiativePrep.prepareCurrentInitiative(this.data);
        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep_1.NPCPrep.prepareNPCData(this.data);
    }
}
exports.CharacterPrep = CharacterPrep;

},{"./BaseActorPrep":19,"./functions/AttributesPrep":24,"./functions/ConditionMonitorsPrep":25,"./functions/InitiativePrep":26,"./functions/ItemPrep":27,"./functions/LimitsPrep":28,"./functions/MatrixPrep":29,"./functions/ModifiersPrep":30,"./functions/MovementPrep":31,"./functions/NPCPrep":32,"./functions/SkillsPrep":33,"./functions/WoundsPrep":34}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiritPrep = void 0;
const BaseActorPrep_1 = require("./BaseActorPrep");
const SkillsPrep_1 = require("./functions/SkillsPrep");
const AttributesPrep_1 = require("./functions/AttributesPrep");
const LimitsPrep_1 = require("./functions/LimitsPrep");
const ConditionMonitorsPrep_1 = require("./functions/ConditionMonitorsPrep");
const MovementPrep_1 = require("./functions/MovementPrep");
const WoundsPrep_1 = require("./functions/WoundsPrep");
const ModifiersPrep_1 = require("./functions/ModifiersPrep");
const InitiativePrep_1 = require("./functions/InitiativePrep");
const helpers_1 = require("../../helpers");
class SpiritPrep extends BaseActorPrep_1.BaseActorPrep {
    prepare() {
        ModifiersPrep_1.ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep_1.ModifiersPrep.clearAttributeMods(this.data);
        SpiritPrep.prepareSpiritBaseData(this.data);
        SkillsPrep_1.SkillsPrep.prepareSkills(this.data);
        AttributesPrep_1.AttributesPrep.prepareAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimitBaseFromAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimits(this.data);
        SpiritPrep.prepareSpiritArmor(this.data);
        ConditionMonitorsPrep_1.ConditionMonitorsPrep.prepareStun(this.data);
        ConditionMonitorsPrep_1.ConditionMonitorsPrep.preparePhysical(this.data);
        MovementPrep_1.MovementPrep.prepareMovement(this.data);
        WoundsPrep_1.WoundsPrep.prepareWounds(this.data);
        InitiativePrep_1.InitiativePrep.prepareCurrentInitiative(this.data);
        this.data.special = 'magic';
    }
    static prepareSpiritBaseData(data) {
        const overrides = this.getSpiritStatModifiers(data.spiritType);
        if (overrides) {
            const { attributes, skills, initiative, force, modifiers } = data;
            // set the base of attributes to the provided value
            for (const [attId, value] of Object.entries(overrides.attributes)) {
                if (attributes[attId] !== undefined) {
                    attributes[attId].base = value + force;
                }
            }
            for (const [skillId, skill] of Object.entries(skills.active)) {
                skill.base = overrides.skills.find((s) => s === skillId) ? force : 0;
            }
            // prepare initiative data
            initiative.meatspace.base.base = force * 2 + overrides.init + Number(modifiers['astral_initiative']);
            initiative.meatspace.dice.base = 2;
            initiative.astral.base.base = force * 2 + overrides.astral_init + Number(modifiers['astral_initiative_dice']);
            initiative.astral.dice.base = 3;
        }
    }
    static prepareSpiritArmor(data) {
        var _a;
        const { armor, attributes } = data;
        armor.base = ((_a = attributes.essence.value) !== null && _a !== void 0 ? _a : 0) * 2;
        armor.value = helpers_1.Helpers.calcTotal(armor);
    }
    /**
     * get the attribute and initiative modifiers and skills
     */
    static getSpiritStatModifiers(spiritType) {
        const overrides = {
            // value of 0 for attribute makes it equal to the Force
            attributes: {
                body: 0,
                agility: 0,
                reaction: 0,
                strength: 0,
                willpower: 0,
                logic: 0,
                intuition: 0,
                charisma: 0,
                magic: 0,
                essence: 0,
            },
            // modifiers for after the Force x 2 calculation
            init: 0,
            astral_init: 0,
            // skills are all set to Force
            skills: [],
        };
        switch (spiritType) {
            case 'air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'flight', 'perception', 'unarmed_combat');
                break;
            case 'guardian':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 2;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'clubs', 'counter_spelling', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'guidance':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.skills.push('arcana', 'assensing', 'astral_combat', 'counter_spelling', 'perception', 'unarmed_combat');
                break;
            case 'man':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.logic = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spellcasting', 'unarmed_combat');
                break;
            case 'plant':
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'exotic_range', 'unarmed_combat');
                break;
            case 'task':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push('artisan', 'assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'water':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'toxic_air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'running', 'unarmed_combat');
                break;
            case 'toxic_beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'gymnastics', 'perception', 'running', 'unarmed_combat');
                break;
            case 'toxic_earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'toxic_fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'flight', 'unarmed_combat');
                break;
            case 'toxic_man':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spell_casting', 'unarmed_combat');
                break;
            case 'toxic_water':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'blood':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 2;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'running', 'unarmed_combat');
                break;
            case 'muse':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'nightmare':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'shade':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'succubus':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'wraith':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'master_shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'counterspelling', 'perception', 'spellcasting', 'unarmed_combat');
                break;
            // insect
            case 'caretaker':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'leadership', 'perception', 'unarmed_combat');
                break;
            case 'nymph':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'spellcasting', 'unarmed_combat');
                break;
            case 'scout':
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'sneaking', 'unarmed_combat');
                break;
            case 'soldier':
                overrides.attributes.body = 3;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = 3;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'counterspelling', 'exotic_range', 'gymnastics', 'perception', 'unarmed_combat');
                break;
            case 'worker':
                overrides.attributes.strength = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'queen':
                overrides.attributes.body = 5;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = 5;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 5;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'counterspelling', 'gymnastics', 'leadership', 'negotiation', 'perception', 'spellcasting', 'unarmed_combat');
                break;
        }
        return overrides;
    }
}
exports.SpiritPrep = SpiritPrep;

},{"../../helpers":54,"./BaseActorPrep":19,"./functions/AttributesPrep":24,"./functions/ConditionMonitorsPrep":25,"./functions/InitiativePrep":26,"./functions/LimitsPrep":28,"./functions/ModifiersPrep":30,"./functions/MovementPrep":31,"./functions/SkillsPrep":33,"./functions/WoundsPrep":34}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpritePrep = void 0;
const BaseActorPrep_1 = require("./BaseActorPrep");
const SkillsPrep_1 = require("./functions/SkillsPrep");
const ModifiersPrep_1 = require("./functions/ModifiersPrep");
const InitiativePrep_1 = require("./functions/InitiativePrep");
const AttributesPrep_1 = require("./functions/AttributesPrep");
const LimitsPrep_1 = require("./functions/LimitsPrep");
const MatrixPrep_1 = require("./functions/MatrixPrep");
const helpers_1 = require("../../helpers");
const PartsList_1 = require("../../parts/PartsList");
/**
 * Prepare a Sprite Type of Actor
 */
class SpritePrep extends BaseActorPrep_1.BaseActorPrep {
    prepare() {
        ModifiersPrep_1.ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep_1.ModifiersPrep.clearAttributeMods(this.data);
        SpritePrep.prepareSpriteData(this.data);
        MatrixPrep_1.MatrixPrep.prepareAttributesForDevice(this.data);
        SkillsPrep_1.SkillsPrep.prepareSkills(this.data);
        AttributesPrep_1.AttributesPrep.prepareAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimits(this.data);
        MatrixPrep_1.MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);
        InitiativePrep_1.InitiativePrep.prepareCurrentInitiative(this.data);
        this.data.special = 'resonance';
    }
    /**
     * Prepares basic Sprite specific data
     * - matrix attribute values
     * - device rating
     * - matrix condition monitor
     * - matrix initiative
     * - skills
     * @param data
     */
    static prepareSpriteData(data) {
        const { level, skills, matrix, spriteType, initiative, attributes, modifiers } = data;
        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'];
        const overrides = this.getSpriteStatModifiers(spriteType);
        // apply the matrix overrides
        matrixAtts.forEach((att) => {
            if (matrix[att] !== undefined) {
                matrix[att].base = level + overrides[att];
                matrix[att].value = helpers_1.Helpers.calcTotal(matrix[att]);
            }
        });
        // setup initiative from overrides
        initiative.matrix.base.base = level * 2 + overrides.init;
        PartsList_1.PartsList.AddUniquePart(initiative.matrix.base.mod, 'SR5.Bonus', modifiers['matrix_initiative']);
        helpers_1.Helpers.calcTotal(initiative.matrix.base);
        initiative.matrix.dice.base = 4;
        PartsList_1.PartsList.AddUniquePart(initiative.matrix.dice.mod, 'SR5.Bonus', modifiers['matrix_initiative_dice']);
        helpers_1.Helpers.calcTotal(initiative.matrix.dice);
        // always in matrix perception
        initiative.perception = 'matrix';
        // calculate resonance value
        attributes.resonance.base = level + overrides.resonance;
        helpers_1.Helpers.calcTotal(attributes.resonance);
        // apply skill levels
        // clear skills that we don't have
        for (const [skillId, skill] of Object.entries(skills.active)) {
            skill.base = overrides.skills.find((s) => s === skillId) ? level : 0;
        }
        matrix.rating = level;
        matrix.condition_monitor.max = 8 + Math.ceil(level / 2);
    }
    /**
     * Get the stat modifiers for the specified type of sprite
     * @param spriteType
     */
    static getSpriteStatModifiers(spriteType) {
        const overrides = {
            attack: 0,
            sleaze: 0,
            data_processing: 0,
            firewall: 0,
            resonance: 0,
            init: 0,
            // all sprites have computer
            skills: ['computer'],
        };
        switch (spriteType) {
            case 'courier':
                overrides.sleaze = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('hacking');
                break;
            case 'crack':
                overrides.sleaze = 3;
                overrides.data_processing = 2;
                overrides.firewall = 1;
                overrides.init = 2;
                overrides.skills.push('hacking', 'electronic_warfare');
                break;
            case 'data':
                overrides.attack = -1;
                overrides.data_processing = 4;
                overrides.firewall = 1;
                overrides.init = 4;
                overrides.skills.push('electronic_warfare');
                break;
            case 'fault':
                overrides.attack = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('cybercombat', 'hacking');
                break;
            case 'machine':
                overrides.attack = 1;
                overrides.data_processing = 3;
                overrides.firewall = 2;
                overrides.init = 3;
                overrides.skills.push('electronic_warfare', 'hardware');
                break;
        }
        return overrides;
    }
}
exports.SpritePrep = SpritePrep;

},{"../../helpers":54,"../../parts/PartsList":68,"./BaseActorPrep":19,"./functions/AttributesPrep":24,"./functions/InitiativePrep":26,"./functions/LimitsPrep":28,"./functions/MatrixPrep":29,"./functions/ModifiersPrep":30,"./functions/SkillsPrep":33}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclePrep = void 0;
const BaseActorPrep_1 = require("./BaseActorPrep");
const SkillsPrep_1 = require("./functions/SkillsPrep");
const ModifiersPrep_1 = require("./functions/ModifiersPrep");
const InitiativePrep_1 = require("./functions/InitiativePrep");
const AttributesPrep_1 = require("./functions/AttributesPrep");
const LimitsPrep_1 = require("./functions/LimitsPrep");
const MatrixPrep_1 = require("./functions/MatrixPrep");
const helpers_1 = require("../../helpers");
const PartsList_1 = require("../../parts/PartsList");
class VehiclePrep extends BaseActorPrep_1.BaseActorPrep {
    prepare() {
        ModifiersPrep_1.ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep_1.ModifiersPrep.clearAttributeMods(this.data);
        VehiclePrep.prepareVehicleStats(this.data);
        VehiclePrep.prepareAttributes(this.data);
        VehiclePrep.prepareLimits(this.data);
        SkillsPrep_1.SkillsPrep.prepareSkills(this.data);
        AttributesPrep_1.AttributesPrep.prepareAttributes(this.data);
        LimitsPrep_1.LimitsPrep.prepareLimits(this.data);
        VehiclePrep.prepareConditionMonitor(this.data);
        MatrixPrep_1.MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);
        MatrixPrep_1.MatrixPrep.prepareAttributesForDevice(this.data);
        VehiclePrep.prepareMovement(this.data);
        VehiclePrep.prepareMeatspaceInit(this.data);
        InitiativePrep_1.InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep_1.InitiativePrep.prepareCurrentInitiative(this.data);
        VehiclePrep.prepareArmor(this.data);
    }
    static prepareVehicleStats(data) {
        var _a;
        const { vehicle_stats, isOffRoad } = data;
        // set the value for the stats
        for (let [key, stat] of Object.entries(vehicle_stats)) {
            // this turns the Object model into the list mod
            if (typeof stat.mod === 'object') {
                stat.mod = new PartsList_1.PartsList(stat.mod).list;
            }
            const parts = new PartsList_1.PartsList(stat.mod);
            parts.addUniquePart('SR5.Temporary', (_a = stat.temp) !== null && _a !== void 0 ? _a : 0);
            stat.mod = parts.list;
            helpers_1.Helpers.calcTotal(stat);
            // add labels
            stat.label = CONFIG.SR5.vehicle.stats[key];
        }
        // hide certain stats depending on if we're offroad
        if (isOffRoad) {
            vehicle_stats.off_road_speed.hidden = false;
            vehicle_stats.off_road_handling.hidden = false;
            vehicle_stats.speed.hidden = true;
            vehicle_stats.handling.hidden = true;
        }
        else {
            vehicle_stats.off_road_speed.hidden = true;
            vehicle_stats.off_road_handling.hidden = true;
            vehicle_stats.speed.hidden = false;
            vehicle_stats.handling.hidden = false;
        }
    }
    static prepareAttributes(data) {
        const { attributes, vehicle_stats } = data;
        const attributeIds = ['agility', 'reaction', 'strength', 'willpower', 'logic', 'intuition', 'charisma'];
        const totalPilot = helpers_1.Helpers.calcTotal(vehicle_stats.pilot);
        attributeIds.forEach((attId) => {
            if (attributes[attId] !== undefined) {
                attributes[attId].base = totalPilot;
            }
        });
    }
    static prepareLimits(data) {
        const { limits, vehicle_stats, isOffRoad } = data;
        limits.mental.base = helpers_1.Helpers.calcTotal(vehicle_stats.sensor);
        // add sensor, handling, and speed as limits
        limits.sensor = Object.assign(Object.assign({}, vehicle_stats.sensor), { hidden: true });
        limits.handling = Object.assign(Object.assign({}, (isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling)), { hidden: true });
        limits.speed = Object.assign(Object.assign({}, (isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed)), { hidden: true });
    }
    static prepareConditionMonitor(data) {
        const { track, attributes, matrix, isDrone, modifiers } = data;
        const halfBody = Math.ceil(helpers_1.Helpers.calcTotal(attributes.body) / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        if (isDrone) {
            track.physical.max = 6 + halfBody + (Number(modifiers['physical_track']) || 0);
        }
        else {
            track.physical.max = 12 + halfBody + (Number(modifiers['physical_track']) || 0);
        }
        track.physical.label = CONFIG.SR5.damageTypes.physical;
        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = 8 + Math.ceil(rating / 2);
    }
    static prepareMovement(data) {
        const { vehicle_stats, movement, isOffRoad } = data;
        let speedTotal = helpers_1.Helpers.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);
        // algorithm to determine speed, CRB pg 202 table
        movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
        movement.walk.value = movement.walk.base;
        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = movement.run.base;
    }
    static prepareMeatspaceInit(data) {
        const { vehicle_stats, initiative } = data;
        const pilot = helpers_1.Helpers.calcTotal(vehicle_stats.pilot);
        initiative.meatspace.base.base = pilot * 2;
        initiative.meatspace.dice.base = 4;
        helpers_1.Helpers.calcTotal(initiative.meatspace.base);
        helpers_1.Helpers.calcTotal(initiative.meatspace.dice);
    }
    static prepareArmor(data) {
        const { armor } = data;
        armor.mod = PartsList_1.PartsList.AddUniquePart(armor.mod, 'SR5.Temporary', armor['temp']);
        helpers_1.Helpers.calcTotal(armor);
    }
}
exports.VehiclePrep = VehiclePrep;

},{"../../helpers":54,"../../parts/PartsList":68,"./BaseActorPrep":19,"./functions/AttributesPrep":24,"./functions/InitiativePrep":26,"./functions/LimitsPrep":28,"./functions/MatrixPrep":29,"./functions/ModifiersPrep":30,"./functions/SkillsPrep":33}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesPrep = void 0;
const PartsList_1 = require("../../../parts/PartsList");
const helpers_1 = require("../../../helpers");
class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(data) {
        const { attributes } = data;
        // always have special attributes set to hidden
        attributes.magic.hidden = true;
        attributes.resonance.hidden = true;
        attributes.edge.hidden = true;
        attributes.essence.hidden = true;
        // set the value for the attributes
        for (let [key, attribute] of Object.entries(attributes)) {
            // don't manage the attribute if it is using the old method of edge tracking
            // needed to be able to migrate things correctly
            if (key === 'edge' && attribute['uses'] === undefined)
                return;
            const parts = new PartsList_1.PartsList(attribute.mod);
            attribute.mod = parts.list;
            helpers_1.Helpers.calcTotal(attribute);
            // add labels
            attribute.label = CONFIG.SR5.attributes[key];
        }
    }
}
exports.AttributesPrep = AttributesPrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionMonitorsPrep = void 0;
class ConditionMonitorsPrep {
    static prepareStun(data) {
        const { track, attributes, modifiers } = data;
        track.stun.max = 8 + Math.ceil(attributes.willpower.value / 2) + Number(modifiers['stun_track']);
        track.stun.label = CONFIG.SR5.damageTypes.stun;
        track.stun.disabled = false;
    }
    static preparePhysical(data) {
        const { track, attributes, modifiers } = data;
        track.physical.max = 8 + Math.ceil(attributes.body.value / 2) + Number(modifiers['physical_track']);
        track.physical.overflow.max = attributes.body.value;
        track.physical.label = CONFIG.SR5.damageTypes.physical;
        track.physical.disabled = false;
    }
    static prepareGrunt(data) {
        // Grunts use only one monitor, use physical to get overflow functionality.
        ConditionMonitorsPrep.prepareStun(data);
        const { track, attributes, modifiers } = data;
        // Overwrite stun damage to avoid invisible damage modifiers.
        track.stun.value = 0;
        track.stun.disabled = true;
        // Grunts use either their WIL or BOD as their monitors attribute.
        const attribute = attributes.willpower.value > attributes.body.value ?
            attributes.willpower :
            attributes.body;
        // TODO: Should track modifiers switch according to used attribute?
        track.physical.max = 8 + Math.ceil(attribute.value / 2) + Number(modifiers['physical_track']);
        track.physical.overflow.max = attributes.body.value;
        track.physical.label = "SR5.ConditionMonitor";
        track.physical.disabled = false;
    }
}
exports.ConditionMonitorsPrep = ConditionMonitorsPrep;

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiativePrep = void 0;
const helpers_1 = require("../../../helpers");
const PartsList_1 = require("../../../parts/PartsList");
class InitiativePrep {
    static prepareCurrentInitiative(data) {
        const { initiative } = data;
        if (initiative.perception === 'matrix')
            initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral')
            initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }
        initiative.current.dice.value = helpers_1.Helpers.calcTotal(initiative.current.dice);
        if (initiative.edge)
            initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;
        initiative.current.base.value = helpers_1.Helpers.calcTotal(initiative.current.base);
    }
    static prepareMeatspaceInit(data) {
        const { initiative, attributes, modifiers } = data;
        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        initiative.meatspace.base.mod = PartsList_1.PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
        initiative.meatspace.dice.base = 1;
        initiative.meatspace.dice.mod = PartsList_1.PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));
    }
    static prepareAstralInit(data) {
        const { initiative, attributes, modifiers } = data;
        initiative.astral.base.base = attributes.intuition.value * 2;
        initiative.astral.base.mod = PartsList_1.PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));
        initiative.astral.dice.base = 2;
        initiative.astral.dice.mod = PartsList_1.PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
    }
    static prepareMatrixInit(data) {
        const { initiative, attributes, modifiers, matrix } = data;
        if (matrix) {
            initiative.matrix.base.base = attributes.intuition.value + data.matrix.data_processing.value;
            initiative.matrix.base.mod = PartsList_1.PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers['matrix_initiative']));
            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            initiative.matrix.dice.mod = PartsList_1.PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers['matrix_initiative_dice']));
        }
    }
}
exports.InitiativePrep = InitiativePrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemPrep = void 0;
const helpers_1 = require("../../../helpers");
const PartsList_1 = require("../../../parts/PartsList");
class ItemPrep {
    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used
     * - all "accessories" will be added to the armor
     */
    static prepareArmor(data, items) {
        const { armor } = data;
        armor.base = 0;
        armor.value = 0;
        armor.mod = [];
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }
        const equippedArmor = items.filter((item) => item.hasArmor() && item.isEquipped());
        const armorModParts = new PartsList_1.PartsList(armor.mod);
        equippedArmor === null || equippedArmor === void 0 ? void 0 : equippedArmor.forEach((item) => {
            if (item.hasArmorAccessory()) {
                armorModParts.addUniquePart(item.getName(), item.getArmorValue());
            } // if not a mod, set armor.value to the items value
            else {
                armor.base = item.getArmorValue();
                armor.label = item.getName();
                for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
                    armor[element] = item.getArmorElements()[element];
                }
            }
        });
        if (data.modifiers['armor'])
            armorModParts.addUniquePart(game.i18n.localize('SR5.Bonus'), data.modifiers['armor']);
        // SET ARMOR
        armor.value = helpers_1.Helpers.calcTotal(armor);
    }
    /**
     * Prepare actor data for cyberware changes
     * - this calculates the actors essence
     */
    static prepareCyberware(data, items) {
        const { attributes } = data;
        const parts = new PartsList_1.PartsList();
        // add Items as values to lower the total value of essence
        items
            .filter((item) => item.isCyberware() && item.isEquipped())
            .forEach((item) => {
            if (item.getEssenceLoss()) {
                parts.addUniquePart(item.getName(), -Number(item.getEssenceLoss()));
            }
        });
        // add the bonus from the misc tab if applied
        const essenceMod = data.modifiers['essence'];
        if (essenceMod && !Number.isNaN(essenceMod)) {
            parts.addUniquePart('SR5.Bonus', Number(essenceMod));
        }
        attributes.essence.base = 6;
        attributes.essence.mod = parts.list;
        attributes.essence.value = helpers_1.Helpers.calcTotal(attributes.essence);
    }
}
exports.ItemPrep = ItemPrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitsPrep = void 0;
const PartsList_1 = require("../../../parts/PartsList");
const helpers_1 = require("../../../helpers");
class LimitsPrep {
    static prepareLimits(data) {
        const { limits, modifiers } = data;
        // SETUP LIMITS
        limits.physical.mod = PartsList_1.PartsList.AddUniquePart(limits.physical.mod, 'SR5.Bonus', Number(modifiers['physical_limit']));
        limits.mental.mod = PartsList_1.PartsList.AddUniquePart(limits.mental.mod, 'SR5.Bonus', Number(modifiers['mental_limit']));
        limits.social.mod = PartsList_1.PartsList.AddUniquePart(limits.social.mod, "SR5.Bonus", Number(modifiers['social_limit']));
        // limit labels
        for (let [limitKey, limitValue] of Object.entries(limits)) {
            helpers_1.Helpers.calcTotal(limitValue);
            limitValue.label = CONFIG.SR5.limits[limitKey];
        }
    }
    static prepareLimitBaseFromAttributes(data) {
        const { limits, attributes } = data;
        limits.physical.base = Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3);
        limits.mental.base = Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3);
        limits.social.base = Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3);
    }
}
exports.LimitsPrep = LimitsPrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatrixPrep = void 0;
const helpers_1 = require("../../../helpers");
const PartsList_1 = require("../../../parts/PartsList");
class MatrixPrep {
    /**
     * Prepare Matrix data on the actor
     * - if an item is equipped, it will use that data
     * - if it isn't and player is technomancer, it will use that data
     */
    static prepareMatrix(actorData, items) {
        const { matrix, attributes } = actorData;
        const MatrixList = ['firewall', 'sleaze', 'data_processing', 'attack'];
        // clear matrix data to defaults
        MatrixList.forEach((key) => {
            const parts = new PartsList_1.PartsList(matrix[key].mod);
            parts.addUniquePart('SR5.Temporary', matrix[key].temp);
            // TODO LEGACY from when the sheet used 'mod.Temporary'
            parts.removePart('Temporary');
            matrix[key].mod = parts.list;
            matrix[key].value = parts.total;
        });
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';
        matrix.condition_monitor.label = 'SR5.ConditionMonitor';
        // get the first equipped device, we don't care if they have more equipped -- it shouldn't happen
        const device = items.find((item) => item.isEquipped() && item.isDevice());
        if (device) {
            const conditionMonitor = device.getConditionMonitor();
            matrix.device = device.getId();
            matrix.condition_monitor.max = conditionMonitor.max;
            matrix.condition_monitor.value = conditionMonitor.value;
            matrix.rating = device.getRating();
            matrix.is_cyberdeck = device.isCyberdeck();
            matrix.name = device.getName();
            matrix.item = device.getData();
            const deviceAtts = device.getASDF();
            if (deviceAtts) {
                // setup the actual matrix attributes for the actor
                for (const [key, value] of Object.entries(deviceAtts)) {
                    if (value && matrix[key]) {
                        matrix[key].base = value.value;
                        matrix[key].device_att = value.device_att;
                    }
                }
            }
        } // if we don't have a device, use living persona
        else if (actorData.special === 'resonance') {
            matrix.firewall.base = helpers_1.Helpers.calcTotal(attributes.willpower);
            matrix.data_processing.base = helpers_1.Helpers.calcTotal(attributes.logic);
            matrix.rating = helpers_1.Helpers.calcTotal(attributes.resonance);
            matrix.attack.base = helpers_1.Helpers.calcTotal(attributes.charisma);
            matrix.sleaze.base = helpers_1.Helpers.calcTotal(attributes.intuition);
            matrix.name = game.i18n.localize('SR5.LivingPersona');
        }
        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
            matrix.condition_monitor.value = matrix.condition_monitor.max;
        }
    }
    /**
     * Add Matrix Attributes to Limits and Attributes
     * @param data
     */
    static prepareMatrixToLimitsAndAttributes(data) {
        const { matrix, attributes, limits } = data;
        const MatrixList = ['firewall', 'sleaze', 'data_processing', 'attack'];
        // add matrix attributes to both limits and attributes as hidden entries
        MatrixList.forEach((key) => {
            helpers_1.Helpers.calcTotal(matrix[key]);
            if (matrix[key]) {
                const label = CONFIG.SR5.matrixAttributes[key];
                const { value, base, mod } = matrix[key];
                const hidden = true;
                limits[key] = {
                    value,
                    base,
                    mod,
                    label,
                    hidden,
                };
                attributes[key] = {
                    value,
                    base,
                    mod,
                    label,
                    hidden,
                };
            }
        });
    }
    /**
     * Prepare the mental attributes for a sheet that just has a device rating
     * @param data
     */
    static prepareAttributesForDevice(data) {
        const { matrix, attributes } = data;
        const rating = matrix.rating || 0;
        const mentalAttributes = ['intuition', 'logic', 'charisma', 'willpower'];
        mentalAttributes.forEach((attLabel) => {
            if (attributes[attLabel] !== undefined) {
                attributes[attLabel].base = rating;
                helpers_1.Helpers.calcTotal(attributes[attLabel]);
            }
        });
        const basic = ['firewall', 'data_processing'];
        basic.forEach((attId) => {
            matrix[attId].base = rating;
        });
        [...basic, 'sleaze', 'attack'].forEach((attId) => {
            helpers_1.Helpers.calcTotal(matrix[attId]);
        });
    }
}
exports.MatrixPrep = MatrixPrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifiersPrep = void 0;
class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    static prepareModifiers(data) {
        if (!data.modifiers)
            data.modifiers = {};
        const modifiers = {};
        let miscTabModifiers = [
            'soak',
            'drain',
            'armor',
            'physical_limit',
            'social_limit',
            'mental_limit',
            'stun_track',
            'physical_track',
            'meat_initiative',
            'meat_initiative_dice',
            'astral_initiative',
            'astral_initiative_dice',
            'matrix_initiative',
            'matrix_initiative_dice',
            'composure',
            'lift_carry',
            'judge_intentions',
            'memory',
            'walk',
            'run',
            'defense',
            'wound_tolerance',
            'essence',
            'fade',
        ];
        miscTabModifiers.sort();
        // force global to the top
        miscTabModifiers.unshift('global');
        for (let item of miscTabModifiers) {
            modifiers[item] = Number(data.modifiers[item]) || 0;
        }
        data.modifiers = modifiers;
    }
    static clearAttributeMods(data) {
        const { attributes } = data;
        for (const [, attribute] of Object.entries(attributes)) {
            attribute.mod = [];
        }
    }
}
exports.ModifiersPrep = ModifiersPrep;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementPrep = void 0;
class MovementPrep {
    static prepareMovement(data) {
        const { attributes, modifiers } = data;
        const movement = data.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.value = attributes.agility.value * (2 + Number(modifiers['walk']));
        movement.run.value = attributes.agility.value * (4 + Number(modifiers['run']));
    }
}
exports.MovementPrep = MovementPrep;

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPCPrep = void 0;
const dataTemplates_1 = require("../../../dataTemplates");
const helpers_1 = require("../../../helpers");
const constants_1 = require("../../../constants");
const PartsList_1 = require("../../../parts/PartsList");
class NPCPrep {
    static prepareNPCData(data) {
        // Apply to NPC and none NPC to remove lingering modifiers after actor has been removed it's npc status.
        NPCPrep.applyMetatypeModifiers(data);
    }
    /** Replace current metatype modifiers with, even if nothing has changed.
     *
     */
    static applyMetatypeModifiers(data) {
        var _a;
        const { metatype } = data;
        let modifiers = dataTemplates_1.DataTemplates.grunt.metatype_modifiers[metatype];
        modifiers = modifiers ? modifiers : {};
        const { attributes } = data;
        for (const [attId, attribute] of Object.entries(attributes)) {
            // old-style object mod transformation is happening in AttributePrep and is needed here. Order is important.
            if (!Array.isArray(attribute.mod)) {
                console.error('Actor data contains wrong data type for attribute.mod', attribute, !Array.isArray(attribute.mod));
            }
            else {
                const modifyBy = (_a = modifiers === null || modifiers === void 0 ? void 0 : modifiers.attributes) === null || _a === void 0 ? void 0 : _a[attId];
                const parts = new PartsList_1.PartsList(attribute.mod);
                parts.removePart(constants_1.METATYPEMODIFIER);
                if (data.is_npc && modifyBy) {
                    parts.addPart(constants_1.METATYPEMODIFIER, modifyBy);
                }
                attribute.mod = parts.list;
                helpers_1.Helpers.calcTotal(attribute);
            }
        }
    }
    static AddNPCMetatypeAttributeModifier(value) {
        return {
            name: constants_1.METATYPEMODIFIER,
            value: value
        };
    }
}
exports.NPCPrep = NPCPrep;

},{"../../../constants":45,"../../../dataTemplates":46,"../../../helpers":54,"../../../parts/PartsList":68}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsPrep = void 0;
const helpers_1 = require("../../../helpers");
const PartsList_1 = require("../../../parts/PartsList");
class SkillsPrep {
    /**
     * Prepare actor data for skills
     */
    static prepareSkills(data) {
        const { language, active, knowledge } = data.skills;
        if (language) {
            if (!language.value)
                language.value = {};
            language.attribute = 'intuition';
        }
        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            var _a;
            skill.mod = [];
            if (!skill.base)
                skill.base = 0;
            if ((_a = skill.bonus) === null || _a === void 0 ? void 0 : _a.length) {
                for (let bonus of skill.bonus) {
                    skill.mod = PartsList_1.PartsList.AddUniquePart(skill.mod, bonus.key, Number(bonus.value));
                }
            }
            skill.value = helpers_1.Helpers.calcTotal(skill);
        };
        // setup active skills
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }
        const entries = Object.entries(data.skills.language.value);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]) => val._delete && delete data.skills.language.value[key]);
        for (let skill of Object.values(language.value)) {
            prepareSkill(skill);
            skill.attribute = 'intuition';
        }
        // setup knowledge skills
        for (let [, group] of Object.entries(knowledge)) {
            const entries = Object.entries(group.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            group.value = entries
                .filter(([, val]) => !val._delete)
                .reduce((acc, [id, skill]) => {
                prepareSkill(skill);
                // set the attribute on the skill
                skill.attribute = group.attribute;
                acc[id] = skill;
                return acc;
            }, {});
        }
        // skill labels
        for (let [skillKey, skillValue] of Object.entries(active)) {
            skillValue.label = CONFIG.SR5.activeSkills[skillKey];
        }
    }
}
exports.SkillsPrep = SkillsPrep;

},{"../../../helpers":54,"../../../parts/PartsList":68}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WoundsPrep = void 0;
class WoundsPrep {
    static prepareWounds(data) {
        const { modifiers, track } = data;
        const count = 3 + Number(modifiers['wound_tolerance']);
        const stunWounds = track.stun.disabled ? 0 : Math.floor(track.stun.value / count);
        const physicalWounds = track.physical.disabled ? 0 : Math.floor(track.physical.value / count);
        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;
        data.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
exports.WoundsPrep = WoundsPrep;

},{}],35:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChummerImportForm = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ChummerImportForm = /*#__PURE__*/function (_FormApplication) {
  (0, _inherits2["default"])(ChummerImportForm, _FormApplication);

  var _super = _createSuper(ChummerImportForm);

  function ChummerImportForm() {
    (0, _classCallCheck2["default"])(this, ChummerImportForm);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(ChummerImportForm, [{
    key: "getData",
    value: function getData() {
      return {};
    }
  }, {
    key: "activateListeners",
    value: function activateListeners(html) {
      var _this = this;

      html.find('.submit-chummer-import').click( /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(event) {
          var chummerfile, weapons, armor, cyberware, equipment, qualities, powers, spells, parseAtt, parseDamage, getValues, getArray, updateData, update, items, error, c, attr, atts, skills, i, s, group, skill, id, category, skillCategory, cat, name, _qualities, _weapons, armors, cyberwares, _powers, gears, _spells;

          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  event.preventDefault();
                  chummerfile = JSON.parse($('.chummer-text').val());
                  weapons = $('.weapons').is(':checked');
                  armor = $('.armor').is(':checked');
                  cyberware = $('.cyberware').is(':checked');
                  equipment = $('.gear').is(':checked');
                  qualities = $('.qualities').is(':checked');
                  powers = $('.powers').is(':checked');
                  spells = $('.spells').is(':checked');
                  console.log(chummerfile);

                  parseAtt = function parseAtt(att) {
                    if (att.toLowerCase() === 'bod') {
                      return 'body';
                    }

                    if (att.toLowerCase() === 'agi') {
                      return 'agility';
                    }

                    if (att.toLowerCase() === 'rea') {
                      return 'reaction';
                    }

                    if (att.toLowerCase() === 'str') {
                      return 'strength';
                    }

                    if (att.toLowerCase() === 'cha') {
                      return 'charisma';
                    }

                    if (att.toLowerCase() === 'int') {
                      return 'intuition';
                    }

                    if (att.toLowerCase() === 'log') {
                      return 'logic';
                    }

                    if (att.toLowerCase() === 'wil') {
                      return 'willpower';
                    }

                    if (att.toLowerCase() === 'edg') {
                      return 'edge';
                    }

                    if (att.toLowerCase() === 'mag') {
                      return 'magic';
                    }

                    if (att.toLowerCase() === 'res') {
                      return 'resonance';
                    }
                  };

                  parseDamage = function parseDamage(val) {
                    var damage = {
                      damage: 0,
                      type: 'physical',
                      radius: 0,
                      dropoff: 0
                    };
                    var split = val.split(',');

                    if (split.length > 0) {
                      var l = split[0].match(/(\d+)(\w+)/);
                      if (l && l[1]) damage.damage = parseInt(l[1]);
                      if (l && l[2]) damage.type = l[2] === 'P' ? 'physical' : 'stun';
                    }

                    for (var i = 1; i < split.length; i++) {
                      var _l = split[i].match(/(-?\d+)(.*)/);

                      if (_l && _l[2]) {
                        if (_l[2].toLowerCase().includes('/m')) damage.dropoff = parseInt(_l[1]);else damage.radius = parseInt(_l[1]);
                      }
                    }

                    return damage;
                  };

                  getValues = function getValues(val) {
                    var regex = /(-?[0-9]+)(?:([0-9]+))*/g;
                    var l = val.match(regex);
                    return l || ['0'];
                  };

                  getArray = function getArray(value) {
                    return Array.isArray(value) ? value : [value];
                  };

                  updateData = duplicate(_this.object.data);
                  update = updateData.data;
                  items = [];
                  error = ''; // character info stuff, also techno/magic and essence

                  if (chummerfile.characters && chummerfile.characters.character) {
                    c = chummerfile.characters.character;

                    try {
                      if (c.playername) {
                        update.player_name = c.playername;
                      }

                      if (c.alias) {
                        update.name = c.alias;
                        updateData.name = c.alias;
                      }

                      if (c.metatype) {
                        update.metatype = c.metatype;
                      }

                      if (c.sex) {
                        update.sex = c.sex;
                      }

                      if (c.age) {
                        update.age = c.age;
                      }

                      if (c.height) {
                        update.height = c.height;
                      }

                      if (c.weight) {
                        update.weight = c.weight;
                      }

                      if (c.calculatedstreetcred) {
                        update.street_cred = c.calculatedstreetcred;
                      }

                      if (c.calculatednotoriety) {
                        update.notoriety = c.calculatednotoriety;
                      }

                      if (c.calculatedpublicawareness) {
                        update.public_awareness = c.calculatedpublicawareness;
                      }

                      if (c.karma) {
                        update.karma.value = c.karma;
                      }

                      if (c.totalkarma) {
                        update.karma.max = c.totalkarma;
                      }

                      if (c.technomancer && c.technomancer.toLowerCase() === 'true') {
                        update.special = 'resonance';
                      }

                      if (c.magician && c.magician.toLowerCase() === 'true' || c.adept && c.adept.toLowerCase() === 'true') {
                        update.special = 'magic';
                        attr = [];

                        if (c.tradition && c.tradition.drainattribute && c.tradition.drainattribute.attr) {
                          attr = c.tradition.drainattribute.attr;
                        } else if (c.tradition && c.tradition.drainattributes) {
                          attr = c.tradition.drainattributes.split('+').map(function (item) {
                            return item.trim();
                          });
                        }

                        attr.forEach(function (att) {
                          att = parseAtt(att);
                          if (att !== 'willpower') update.magic.attribute = att;
                        });
                      }

                      if (c.totaless) {
                        update.attributes.essence.value = c.totaless;
                      }

                      if (c.nuyen) {
                        update.nuyen = parseInt(c.nuyen.replace(',', ''));
                      }
                    } catch (e) {
                      error += "Error with character info: ".concat(e, ". ");
                    } // update attributes


                    atts = chummerfile.characters.character.attributes[1].attribute;
                    atts.forEach(function (att) {
                      try {
                        var newAtt = parseAtt(att.name);
                        if (newAtt) update.attributes[newAtt].base = parseInt(att.total);
                      } catch (e) {
                        error += "Error with attributes: ".concat(e, ". ");
                      }
                    }); // initiative stuff

                    try {
                      if (c.initbonus) {
                        // not sure if this one is correct
                        update.mods.initiative = c.initbonus;
                      }

                      if (c.initdice) {
                        update.mods.initiative_dice = c.initdice - 1;
                      }
                    } catch (e) {
                      error += "Error with initiative: ".concat(e, ". ");
                    } // skills...


                    skills = c.skills.skill;

                    for (i = 0; i < skills.length; i++) {
                      try {
                        s = skills[i];

                        if (s.rating > 0 && s.islanguage) {
                          group = 'active';
                          skill = null;
                          id = randomID(16);

                          if (s.islanguage && s.islanguage.toLowerCase() === 'true') {
                            skill = {};
                            update.skills.language.value[id] = skill;
                            group = 'language';
                          } else if (s.knowledge && s.knowledge.toLowerCase() === 'true') {
                            category = s.skillcategory_english;
                            console.log(category);
                            skill = {};
                            skillCategory = void 0;

                            if (category) {
                              console.log('found category', category);
                              cat = category.toLowerCase();
                              if (cat === 'street') skillCategory = update.skills.knowledge.street.value;
                              if (cat === 'academic') skillCategory = update.skills.knowledge.academic.value;
                              if (cat === 'professional') skillCategory = update.skills.knowledge.professional.value;
                              if (cat === 'interest') skillCategory = update.skills.knowledge.interests.value;
                              if (skillCategory) skillCategory[id] = skill;
                            } else {
                              if (s.attribute.toLowerCase() === 'int') {
                                update.skills.knowledge.street.value[id] = skill;
                              }

                              if (s.attribute.toLowerCase() === 'log') {
                                update.skills.knowledge.professional.value[id] = skill;
                              }
                            }

                            group = 'knowledge';
                          } else {
                            name = s.name.toLowerCase().trim().replace(/\s/g, '_').replace(/-/g, '_');
                            if (name.includes('exotic') && name.includes('_weapon')) name = name.replace('_weapon', '');
                            skill = update.skills.active[name];
                          }

                          if (!skill) console.error("Couldn't parse skill ".concat(s.name));

                          if (skill) {
                            if (group !== 'active') skill.name = s.name;
                            skill.base = parseInt(s.rating);

                            if (s.skillspecializations) {
                              skill.specs = getArray(s.skillspecializations.skillspecialization.name);
                            }
                          }
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    } // qualities


                    if (qualities && c.qualities && c.qualities.quality) {
                      _qualities = getArray(c.qualities.quality);

                      _qualities.forEach(function (q) {
                        try {
                          var data = {};
                          data.type = q.qualitytype.toLowerCase();
                          if (q.description) data.description = {
                            value: TextEditor.enrichHTML(q.description)
                          };
                          var itemData = {
                            name: q.name,
                            type: 'quality',
                            data: data
                          };
                          items.push(itemData);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } // weapons


                    if (weapons && c.weapons != null && c.weapons.weapon != null) {
                      _weapons = getArray(c.weapons.weapon);

                      _weapons.forEach(function (w) {
                        try {
                          var data = {};
                          var action = {};
                          var damage = {};
                          action.damage = damage;
                          data.action = action;

                          if (w.description) {
                            data.description = {
                              value: TextEditor.enrichHTML(w.description)
                            };
                          }

                          damage.ap = {
                            base: parseInt(getValues(w.ap)[0])
                          };
                          action.type = 'varies';
                          if (w.skill) action.skill = w.skill.toLowerCase().replace(/\s/g, '_');else if (w.category && w.category.toLowerCase().includes('exotic')) action.skill = w.category.toLowerCase().replace(' weapons', '').replace(/\s/g, '_');
                          if (action.skill.includes('exotic')) action.skill = action.skill.replace('_weapon', '');
                          action.attribute = 'agility';
                          action.limit = {
                            base: parseInt(getValues(w.accuracy)[0])
                          };
                          action.opposed = {
                            type: 'defense'
                          };

                          if (w.type.toLowerCase() === 'melee') {
                            action.type = 'complex';
                            data.category = 'melee';
                            var melee = {};
                            data.melee = melee;
                            melee.reach = parseInt(w.reach);
                          } else if (w.type.toLowerCase() === 'ranged') {
                            data.category = 'range';

                            if (w.skill.toLowerCase().includes('throw')) {
                              data.category = 'thrown'; // TODO clean this up
                            }

                            var range = {};
                            data.range = range;
                            range.rc = {
                              base: parseInt(getValues(w.rc)[0])
                            };

                            if (w.mode) {
                              // HeroLab export doesn't have mode
                              var lower = w.mode.toLowerCase();
                              range.modes = {
                                single_shot: lower.includes('ss'),
                                semi_auto: lower.includes('sa'),
                                burst_fire: lower.includes('bf'),
                                full_auto: lower.includes('fa')
                              };
                            }

                            if (w.clips != null && w.clips.clip != null) {
                              // HeroLab export doesn't have clips
                              var clips = Array.isArray(w.clips.clip) ? w.clips.clip : [w.clips.clip];
                              clips.forEach(function (clip) {
                                console.log(clip);
                              });
                            }

                            if (w.ranges && w.ranges["short"] && w.ranges.medium && w.ranges["long"] && w.ranges.extreme) {
                              console.log(w.ranges);
                              range.ranges = {
                                "short": parseInt(w.ranges["short"].split('-')[1]),
                                medium: parseInt(w.ranges.medium.split('-')[1]),
                                "long": parseInt(w.ranges["long"].split('-')[1]),
                                extreme: parseInt(w.ranges.extreme.split('-')[1])
                              };
                            } // TODO figure out how to add mods to weapons
                            // if (w.accessories && w.accessories.accessory) {
                            //     range.mods = [];
                            //     const accessories = getArray(w.accessories.accessory);
                            //     accessories.forEach((a) => {
                            //         if (a) {
                            //             range.mods.push({
                            //                 name: a.name,
                            //             });
                            //         }
                            //     });
                            // }

                          } else if (w.type.toLowerCase() === 'thrown') {
                            data.category = 'thrown';
                          }

                          {
                            // TODO handle raw damage if present
                            var d = parseDamage(w.damage_english);
                            damage.base = d.damage;
                            damage.type = {};
                            damage.type.base = d.type;

                            if (d.dropoff || d.radius) {
                              var thrown = {};
                              data.thrown = thrown;
                              thrown.blast = {
                                radius: d.radius,
                                dropoff: d.dropoff
                              };
                            }
                          }
                          var itemData = {
                            name: w.name,
                            type: 'weapon',
                            data: data
                          };
                          items.push(itemData);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } // armors


                    if (armor && c.armors && c.armors.armor) {
                      armors = getArray(c.armors.armor);
                      armors.forEach(function (a) {
                        try {
                          var data = {};
                          var _armor = {};
                          data.armor = _armor;
                          var desc = '';
                          _armor.mod = a.armor.includes('+');
                          _armor.value = parseInt(a.armor.replace('+', ''));
                          if (a.description) desc = a.description;
                          console.log(a);

                          if (a.armormods && a.armormods.armormod) {
                            _armor.fire = 0;
                            _armor.electricity = 0;
                            _armor.cold = 0;
                            _armor.acid = 0;
                            _armor.radiation = 0;
                            var modDesc = [];
                            var mods = getArray(a.armormods.armormod);
                            mods.forEach(function (mod) {
                              if (mod.name.toLowerCase().includes('fire resistance')) {
                                _armor.fire += parseInt(mod.rating);
                              } else if (mod.name.toLowerCase().includes('nonconductivity')) {
                                _armor.electricity += parseInt(mod.rating);
                              } else if (mod.name.toLowerCase().includes('insulation')) {
                                _armor.cold += parseInt(mod.rating);
                              } else if (mod.name.toLowerCase().includes('radiation shielding')) {
                                _armor.radiation += parseInt(mod.rating);
                              }

                              if (mod.rating !== '') {
                                modDesc.push("".concat(mod.name, " R").concat(mod.rating));
                              } else {
                                modDesc.push(mod.name);
                              }
                            });

                            if (modDesc.length > 0) {
                              // add desc to beginning
                              desc = "".concat(modDesc.join(','), "\n\n").concat(desc);
                            }
                          }

                          if (a.equipped.toLowerCase() === 'true') {
                            data.technology = {
                              equipped: true
                            };
                          }

                          data.description = {
                            value: TextEditor.enrichHTML(desc)
                          };
                          var itemData = {
                            name: a.name,
                            type: 'armor',
                            data: data
                          };
                          items.push(itemData);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } // cyberware


                    if (cyberware && c.cyberwares && c.cyberwares.cyberware) {
                      cyberwares = getArray(c.cyberwares.cyberware);
                      cyberwares.forEach(function (cy) {
                        try {
                          var data = {};
                          data.description = {
                            rating: cy.rating,
                            value: cy.description
                          };
                          data.technology = {
                            equipped: true
                          };
                          data.essence = cy.ess;
                          data.grade = cy.grade;
                          var itemData = {
                            name: cy.name,
                            type: 'cyberware',
                            data: data
                          };
                          items.push(itemData);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } // powers


                    if (powers && c.powers && c.powers.power) {
                      _powers = getArray(c.powers.power);

                      _powers.forEach(function (p) {
                        var data = {};
                        if (p.description) data.description = {
                          value: TextEditor.enrichHTML(p.description)
                        };
                        data.level = parseInt(p.rating);
                        p.pp = parseInt(p.totalpoints);
                        var itemData = {
                          name: p.name,
                          type: 'adept_power',
                          data: data
                        };
                        items.push(itemData);
                      });
                    } // gear


                    if (equipment && c.gears && c.gears.gear) {
                      gears = getArray(c.gears.gear);
                      gears.forEach(function (g) {
                        try {
                          var data = {};
                          var _name = g.name;
                          if (g.extra) _name += " (".concat(g.extra, ")");
                          data.technology = {
                            rating: g.rating,
                            quantity: g.qty
                          };
                          data.description = {
                            value: g.description
                          };
                          var itemData = {
                            name: _name,
                            type: 'equipment',
                            data: data
                          };
                          items.push(itemData);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } // spells


                    if (spells && c.spells && c.spells.spell) {
                      _spells = getArray(c.spells.spell);

                      _spells.forEach(function (s) {
                        try {
                          if (s.alchemy.toLowerCase() !== 'true') {
                            var action = {};
                            var data = {};
                            data.action = action;
                            data.category = s.category.toLowerCase().replace(/\s/g, '_');
                            data.name = s.name;
                            data.type = s.type === 'M' ? 'mana' : 'physical';
                            data.range = s.range === 'T' ? 'touch' : s.range.toLowerCase().replace(/\s/g, '_').replace('(', '').replace(')', '');
                            data.drain = parseInt(s.dv.replace('F', ''));
                            var description = '';
                            if (s.descriptors) description = s.descriptors;
                            if (s.description) description += "\n".concat(s.description);
                            data.description = {};
                            data.description.value = TextEditor.enrichHTML(description);
                            if (s.duration.toLowerCase() === 's') data.duration = 'sustained';else if (s.duration.toLowerCase() === 'i') data.duration = 'instant';else if (s.duration.toLowerCase() === 'p') data.duration = 'permanent';
                            action.type = 'varies';
                            action.skill = 'spellcasting';
                            action.attribute = 'magic';

                            if (s.descriptors) {
                              var desc = s.descriptors.toLowerCase();

                              if (s.category.toLowerCase() === 'combat') {
                                data.combat = {};

                                if (desc.includes('direct')) {
                                  data.combat.type = 'indirect';
                                  action.opposed = {
                                    type: 'defense'
                                  };
                                } else {
                                  data.combat.type = 'direct';

                                  if (data.type === 'mana') {
                                    action.opposed = {
                                      type: 'custom',
                                      attribute: 'willpower'
                                    };
                                  } else if (data.type === 'physical') {
                                    action.opposed = {
                                      type: 'custom',
                                      attribute: 'body'
                                    };
                                  }
                                }
                              }

                              if (s.category.toLowerCase() === 'detection') {
                                data.detection = {};
                                var split = desc.split(',');
                                split.forEach(function (token) {
                                  token = token || '';
                                  token = token.replace(' detection spell', '');
                                  if (!token) return;
                                  if (token.includes('area')) return;
                                  if (token.includes('passive')) data.detection.passive = true;else if (token.includes('active')) data.detection.passive = false;else if (token) data.detection.type = token.toLowerCase();
                                });

                                if (!data.detection.passive) {
                                  action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic'
                                  };
                                }
                              }

                              if (s.category.toLowerCase() === 'illusion') {
                                data.illusion = {};

                                var _split = desc.split(',');

                                _split.forEach(function (token) {
                                  token = token || '';
                                  token = token.replace(' illusion spell', '');
                                  if (!token) return;
                                  if (token.includes('area')) return;
                                  if (token.includes('sense')) data.illusion.sense = token.toLowerCase();else if (token) data.illusion.type = token.toLowerCase();
                                });

                                if (data.type === 'mana') {
                                  action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic'
                                  };
                                } else {
                                  action.opposed = {
                                    type: 'custom',
                                    attribute: 'intuition',
                                    attribute2: 'logic'
                                  };
                                }
                              }

                              if (s.category.toLowerCase() === 'manipulation') {
                                data.manipulation = {};
                                if (desc.includes('environmental')) data.manipulation.environmental = true;
                                if (desc.includes('physical')) data.manipulation.physical = true;
                                if (desc.includes('mental')) data.manipulation.mental = true; // TODO figure out how to parse damaging

                                if (data.manipulation.mental) {
                                  action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic'
                                  };
                                }

                                if (data.manipulation.physical) {
                                  action.opposed = {
                                    type: 'custom',
                                    attribute: 'body',
                                    attribute2: 'strength'
                                  };
                                }
                              }
                            }

                            var itemData = {
                              name: s.name,
                              type: 'spell',
                              data: data
                            };
                            items.push(itemData);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    }
                  }

                  _context.next = 21;
                  return _this.object.update(updateData);

                case 21:
                  _context.next = 23;
                  return _this.object.createEmbeddedEntity('OwnedItem', items);

                case 23:
                  ui.notifications.info('Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;');

                  _this.close();

                case 25:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }], [{
    key: "defaultOptions",
    get: function get() {
      var options = (0, _get2["default"])((0, _getPrototypeOf2["default"])(ChummerImportForm), "defaultOptions", this);
      options.id = 'chummer-import';
      options.classes = ['shadowrun5e'];
      options.title = 'Chummer/Hero Lab Import';
      options.template = 'systems/shadowrun5e/dist/templates/apps/import.html';
      options.width = 600;
      options.height = 'auto';
      return options;
    }
  }]);
  return ChummerImportForm;
}(FormApplication);

exports.ChummerImportForm = ChummerImportForm;

},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10,"@babel/runtime/regenerator":14}],36:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowrunItemDialog = void 0;
const helpers_1 = require("../../helpers");
class ShadowrunItemDialog extends Dialog {
    static fromItem(item, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogData = {
                title: item.name,
                buttons: {},
            };
            if (event)
                dialogData['event'] = event;
            const templateData = {};
            let templatePath = '';
            if (item.isRangedWeapon()) {
                ShadowrunItemDialog.addRangedWeaponData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/range-weapon-roll.html';
            }
            else if (item.isSpell()) {
                ShadowrunItemDialog.addSpellData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-spell.html';
            }
            else if (item.isComplexForm()) {
                ShadowrunItemDialog.addComplexFormData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-complex-form.html';
            }
            if (templatePath) {
                const dialog = yield renderTemplate(templatePath, templateData);
                return mergeObject(dialogData, {
                    content: dialog,
                });
            }
            return undefined;
        });
    }
    /*
    static get defaultOptions() {
        const options = super.defaultOptions;
        return mergeObject(options, {
            classes: ['sr5', 'sheet'],
        });
    }
     */
    static addComplexFormData(templateData, dialogData, item) {
        var _a;
        const fade = item.getFade();
        const title = `${helpers_1.Helpers.label(item.name)} Level`;
        const level = ((_a = item.getLastComplexFormLevel()) === null || _a === void 0 ? void 0 : _a.value) || 2 - fade;
        templateData['fade'] = fade >= 0 ? `+${fade}` : fade;
        templateData['level'] = level;
        templateData['title'] = title;
        let cancel = true;
        dialogData.buttons = {
            roll: {
                label: 'Continue',
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            if (cancel)
                return false;
            const level = helpers_1.Helpers.parseInputToNumber($(html).find('[name=level]').val());
            yield item.setLastComplexFormLevel({ value: level });
            return true;
        });
    }
    static addSpellData(templateData, dialogData, item) {
        var _a;
        const title = `${helpers_1.Helpers.label(item.name)} Force`;
        const drain = item.getDrain();
        const force = ((_a = item.getLastSpellForce()) === null || _a === void 0 ? void 0 : _a.value) || 2 - drain;
        templateData['drain'] = drain >= 0 ? `+${drain}` : `${drain}`;
        templateData['force'] = force;
        templateData['title'] = title;
        dialogData.title = title;
        let cancel = true;
        let reckless = false;
        dialogData.buttons = {
            normal: {
                label: game.i18n.localize('SR5.NormalSpellButton'),
                callback: () => (cancel = false),
            },
            reckless: {
                label: game.i18n.localize('SR5.RecklessSpellButton'),
                callback: () => {
                    reckless = true;
                    cancel = false;
                },
            },
        };
        dialogData.default = 'normal';
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            if (cancel)
                return false;
            const force = helpers_1.Helpers.parseInputToNumber($(html).find('[name=force]').val());
            yield item.setLastSpellForce({ value: force, reckless });
            return true;
        });
    }
    static addRangedWeaponData(templateData, dialogData, item) {
        let title = dialogData.title || item.name;
        const itemData = item.data.data;
        const fireModes = {};
        const { modes, ranges } = itemData.range;
        const { ammo } = itemData;
        if (modes.single_shot) {
            fireModes['1'] = game.i18n.localize("SR5.WeaponModeSingleShotShort");
        }
        if (modes.semi_auto) {
            fireModes['1'] = game.i18n.localize("SR5.WeaponModeSemiAutoShort");
            fireModes['3'] = game.i18n.localize("SR5.WeaponModeSemiAutoBurst");
        }
        if (modes.burst_fire) {
            fireModes['3'] = `${modes.semi_auto ? `${game.i18n.localize("SR5.WeaponModeSemiAutoBurst")}/` : ''}${game.i18n.localize("SR5.WeaponModeBurstFireShort")}`;
            fireModes['6'] = game.i18n.localize("SR5.WeaponModeBurstFireLong");
        }
        if (modes.full_auto) {
            fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(s)`;
            fireModes['10'] = `${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(c)`;
            fireModes['20'] = game.i18n.localize('SR5.Suppressing');
        }
        const templateRanges = this._getRangeWeaponTemplateData(ranges);
        const fireMode = item.getLastFireMode();
        const rc = item.getRecoilCompensation(true);
        templateData['fireModes'] = fireModes;
        templateData['fireMode'] = fireMode === null || fireMode === void 0 ? void 0 : fireMode.value;
        templateData['rc'] = rc;
        templateData['ammo'] = ammo;
        templateData['title'] = title;
        templateData['ranges'] = templateRanges;
        templateData['targetRange'] = item.getLastFireRangeMod();
        let cancel = true;
        dialogData.buttons = {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => (cancel = false),
            },
        };
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            if (cancel)
                return false;
            const fireMode = helpers_1.Helpers.parseInputToNumber($(html).find('[name="fireMode"]').val());
            const range = helpers_1.Helpers.parseInputToNumber($(html).find('[name="range"]').val());
            if (range) {
                yield item.setLastFireRangeMod({ value: range });
            }
            if (fireMode) {
                const fireModeString = fireModes[fireMode];
                const defenseModifier = helpers_1.Helpers.mapRoundsToDefenseDesc(fireMode);
                const fireModeData = {
                    label: fireModeString,
                    value: fireMode,
                    defense: defenseModifier,
                };
                yield item.setLastFireMode(fireModeData);
            }
            return true;
        });
    }
    static _getRangeWeaponTemplateData(ranges) {
        const lookup = {
            short: 0,
            medium: -1,
            long: -3,
            extreme: -6,
        };
        const newRanges = {};
        for (const [key, value] of Object.entries(ranges)) {
            newRanges[key] = {
                distance: value,
                label: CONFIG.SR5.weaponRanges[key],
                modifier: lookup[key],
            };
        }
        return newRanges;
    }
}
exports.ShadowrunItemDialog = ShadowrunItemDialog;

},{"../../helpers":54}],37:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OverwatchScoreTracker = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * A GM-Tool to keep track of all players overwatch scores
 */
var OverwatchScoreTracker = /*#__PURE__*/function (_Application) {
  (0, _inherits2["default"])(OverwatchScoreTracker, _Application);

  var _super = _createSuper(OverwatchScoreTracker);

  function OverwatchScoreTracker() {
    (0, _classCallCheck2["default"])(this, OverwatchScoreTracker);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(OverwatchScoreTracker, [{
    key: "getData",
    value: function getData() {
      // get list of actors that belong to users
      var actors = game.users.reduce(function (acc, user) {
        if (!user.isGM && user.character) {
          acc.push(user.character.data);
        }

        return acc;
      }, []);
      OverwatchScoreTracker.addedActors.forEach(function (id) {
        var actor = game.actors.find(function (a) {
          return a._id === id;
        });

        if (actor) {
          actors.push(actor.data);
        }
      });
      return {
        actors: actors
      };
    }
  }, {
    key: "activateListeners",
    value: function activateListeners(html) {
      html.find('.overwatch-score-reset').on('click', this._resetOverwatchScore.bind(this));
      html.find('.overwatch-score-add').on('click', this._addOverwatchScore.bind(this));
      html.find('.overwatch-score-input').on('change', this._setOverwatchScore.bind(this));
      html.find('.overwatch-score-roll-15-minutes').on('click', this._rollFor15Minutes.bind(this));
      html.find('.overwatch-score-add-actor').on('click', this._onAddActor.bind(this));
    } // returns the actor that this event is acting on

  }, {
    key: "_getActorFromEvent",
    value: function _getActorFromEvent(event) {
      var id = event.currentTarget.closest('.list-item').dataset.actorId;
      if (id) return game.actors.find(function (a) {
        return a._id === id;
      });
    }
  }, {
    key: "_onAddActor",
    value: function _onAddActor(event) {
      var _this = this;

      event.preventDefault();
      var tokens = canvas.tokens.controlled;

      if (tokens.length === 0) {
        ui.notifications.warn(game.i18n.localize('SR5.OverwatchScoreTracker.NotifyNoSelectedTokens'));
        return;
      }

      tokens.forEach(function (token) {
        var actorId = token.data.actorId;
        OverwatchScoreTracker.addedActors.push(actorId);

        _this.render();
      });
    }
  }, {
    key: "_setOverwatchScore",
    value: function _setOverwatchScore(event) {
      var _this2 = this;

      var actor = this._getActorFromEvent(event);

      var amount = event.currentTarget.value;

      if (amount && actor) {
        actor.setOverwatchScore(amount).then(function () {
          return _this2.render();
        });
      }
    }
  }, {
    key: "_addOverwatchScore",
    value: function _addOverwatchScore(event) {
      var _this3 = this;

      var actor = this._getActorFromEvent(event);

      var amount = parseInt(event.currentTarget.dataset.amount);

      if (amount && actor) {
        var os = actor.getOverwatchScore();
        actor.setOverwatchScore(os + amount).then(function () {
          return _this3.render();
        });
      }
    }
  }, {
    key: "_resetOverwatchScore",
    value: function _resetOverwatchScore(event) {
      var _this4 = this;

      event.preventDefault();

      var actor = this._getActorFromEvent(event);

      if (actor) {
        actor.setOverwatchScore(0).then(function () {
          return _this4.render();
        });
      }
    }
  }, {
    key: "_rollFor15Minutes",
    value: function _rollFor15Minutes(event) {
      var _this5 = this;

      event.preventDefault();

      var actor = this._getActorFromEvent(event);

      if (actor) {
        //  use static value so it can be modified in modules
        var roll = new Roll(OverwatchScoreTracker.MatrixOverwatchDiceCount);
        roll.roll(); // use GM Roll Mode so players don't see
        // const rollMode = CONFIG.Dice.rollModes.gmroll;
        // roll.toMessage({ rollMode });

        if (roll.total) {
          var os = actor.getOverwatchScore();
          actor.setOverwatchScore(os + roll.total).then(function () {
            return _this5.render();
          });
        }
      }
    }
  }], [{
    key: "defaultOptions",
    get: function get() {
      var options = (0, _get2["default"])((0, _getPrototypeOf2["default"])(OverwatchScoreTracker), "defaultOptions", this);
      options.id = 'overwatch-score-tracker';
      options.classes = ['sr5'];
      options.title = game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
      options.template = 'systems/shadowrun5e/dist/templates/apps/gmtools/overwatch-score-tracker.html';
      options.width = 450;
      options.height = 'auto';
      options.resizable = true;
      return options;
    }
  }]);
  return OverwatchScoreTracker;
}(Application);

exports.OverwatchScoreTracker = OverwatchScoreTracker;
(0, _defineProperty2["default"])(OverwatchScoreTracker, "MatrixOverwatchDiceCount", '2d6');
(0, _defineProperty2["default"])(OverwatchScoreTracker, "addedActors", []);

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/defineProperty":5,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSkillEditForm = void 0;
const LanguageSkillEditForm_1 = require("./LanguageSkillEditForm");
class KnowledgeSkillEditForm extends LanguageSkillEditForm_1.LanguageSkillEditForm {
    constructor(actor, options, skillId, category) {
        super(actor, options, skillId);
        this.category = category;
    }
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
exports.KnowledgeSkillEditForm = KnowledgeSkillEditForm;

},{"./LanguageSkillEditForm":39}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageSkillEditForm = void 0;
const SkillEditForm_1 = require("./SkillEditForm");
class LanguageSkillEditForm extends SkillEditForm_1.SkillEditForm {
    _updateString() {
        return `data.skills.language.value.${this.skillId}`;
    }
    getData() {
        return mergeObject(super.getData(), {
            editable_name: true,
        });
    }
    /** @override */
    _onUpdateObject(event, formData, updateData) {
        super._onUpdateObject(event, formData, updateData);
        const name = formData['data.name'];
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = Object.assign(Object.assign({}, currentData), { name });
    }
}
exports.LanguageSkillEditForm = LanguageSkillEditForm;

},{"./SkillEditForm":40}],40:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillEditForm = void 0;
class SkillEditForm extends BaseEntitySheet {
    constructor(actor, options, skillId) {
        super(actor, options);
        this.skillId = skillId;
    }
    _updateString() {
        return `data.skills.active.${this.skillId}`;
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        return mergeObject(options, {
            id: 'skill-editor',
            classes: ['sr5', 'sheet', 'skill-edit-window'],
            template: 'systems/shadowrun5e/dist/templates/apps/skill-edit.html',
            width: 300,
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }
    get title() {
        const label = this.entity.getSkillLabel(this.skillId);
        return `${game.i18n.localize('SR5.EditSkill')} - ${game.i18n.localize(label)}`;
    }
    _onUpdateObject(event, formData, updateData) {
        // get base value
        const base = formData['data.base'];
        // process specializations
        const specsRegex = /data\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce((running, [key, val]) => {
            const found = key.match(specsRegex);
            if (found && found[0]) {
                running.push(val);
            }
            return running;
        }, []);
        // process bonuses
        const bonusKeyRegex = /data\.bonus\.(\d+).key/;
        const bonusValueRegex = /data\.bonus\.(\d+).value/;
        const bonus = Object.entries(formData).reduce((running, [key, value]) => {
            const foundKey = key.match(bonusKeyRegex);
            const foundVal = key.match(bonusValueRegex);
            if (foundKey && foundKey[0] && foundKey[1]) {
                const index = foundKey[1];
                if (running[index] === undefined)
                    running[index] = {};
                running[index].key = value;
            }
            else if (foundVal && foundVal[0] && foundVal[1]) {
                const index = foundVal[1];
                if (running[index] === undefined)
                    running[index] = {};
                running[index].value = value;
            }
            return running;
        }, []);
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = Object.assign(Object.assign({}, currentData), { base,
            specs,
            bonus });
    }
    /** @override */
    _updateObject(event, formData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            this._onUpdateObject(event, formData, updateData);
            yield this.entity.update(updateData);
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
        $(html).find('.add-spec').on('click', this._addNewSpec.bind(this));
        $(html).find('.remove-spec').on('click', this._removeSpec.bind(this));
        $(html).find('.add-bonus').on('click', this._addNewBonus.bind(this));
        $(html).find('.remove-bonus').on('click', this._removeBonus.bind(this));
    }
    _addNewBonus(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const updateData = {};
            const data = this.getData().data;
            if (!data)
                return;
            const { bonus = [] } = data;
            // add blank line for new bonus
            updateData[`${this._updateString()}.bonus`] = [...bonus, { key: '', value: 0 }];
            yield this.entity.update(updateData);
        });
    }
    _removeBonus(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const updateData = {};
            const data = this.getData().data;
            if (data === null || data === void 0 ? void 0 : data.bonus) {
                const { bonus } = data;
                const index = event.currentTarget.dataset.spec;
                if (index >= 0) {
                    bonus.splice(index, 1);
                    updateData[`${this._updateString()}.bonus`] = bonus;
                    yield this.entity.update(updateData);
                }
            }
        });
    }
    _addNewSpec(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const updateData = {};
            const data = this.getData().data;
            if (data === null || data === void 0 ? void 0 : data.specs) {
                // add a blank line to specs
                const { specs } = data;
                updateData[`${this._updateString()}.specs`] = [...specs, ''];
            }
            yield this.entity.update(updateData);
        });
    }
    _removeSpec(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const updateData = {};
            const data = this.getData().data;
            if (data === null || data === void 0 ? void 0 : data.specs) {
                const { specs } = data;
                const index = event.currentTarget.dataset.spec;
                if (index >= 0) {
                    specs.splice(index, 1);
                    updateData[`${this._updateString()}.specs`] = specs;
                    yield this.entity.update(updateData);
                }
            }
        });
    }
    getData() {
        const data = super.getData();
        const actor = data.entity;
        data['data'] = actor ? getProperty(actor, this._updateString()) : {};
        return data;
    }
}
exports.SkillEditForm = SkillEditForm;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureDistance = void 0;
// directly pulled from DND5e, just changed the
exports.measureDistance = function (segments, options = {}) {
    //@ts-ignore
    // basegrid isn't typed, options aren't really important
    if (!options.gridSpaces)
        return BaseGrid.prototype.measureDistances.call(this, segments, options);
    // Track the total number of diagonals
    let nDiagonal = 0;
    const rule = this.parent.diagonalRule;
    const d = canvas.dimensions;
    // Iterate over measured segments
    return segments.map((s) => {
        let r = s.ray;
        // Determine the total distance traveled
        let nx = Math.abs(Math.ceil(r.dx / d.size));
        let ny = Math.abs(Math.ceil(r.dy / d.size));
        // Determine the number of straight and diagonal moves
        let nd = Math.min(nx, ny);
        let ns = Math.abs(ny - nx);
        nDiagonal += nd;
        // Common houserule variant
        if (rule === '1-2-1') {
            let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
            let spaces = nd10 * 2 + (nd - nd10) + ns;
            return spaces * canvas.dimensions.distance;
        }
        // Euclidean Measurement
        else if (rule === 'EUCL') {
            return Math.round(Math.hypot(nx, ny) * canvas.scene.data.gridDistance);
        }
        // diag and straight are same space count
        else
            return (ns + nd) * canvas.scene.data.gridDistance;
    });
};

},{}],42:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRollListeners = exports.addChatMessageContextOptions = exports.createChatData = void 0;
const SR5Actor_1 = require("./actor/SR5Actor");
const SR5Item_1 = require("./item/SR5Item");
const template_1 = require("./template");
const constants_1 = require("./constants");
const PartsList_1 = require("./parts/PartsList");
exports.createChatData = (templateData, roll) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
    const hackyTemplateData = Object.assign(Object.assign({}, templateData), { parts: new PartsList_1.PartsList(templateData.parts).getMessageOutput(), showGlitchAnimation: game.settings.get(constants_1.SYSTEM_NAME, constants_1.FLAGS.ShowGlitchAnimation) });
    const html = yield renderTemplate(template, hackyTemplateData);
    const actor = templateData.actor;
    const chatData = {
        user: game.user._id,
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: html,
        roll: roll ? JSON.stringify(roll) : undefined,
        speaker: {
            actor: actor === null || actor === void 0 ? void 0 : actor._id,
            token: actor === null || actor === void 0 ? void 0 : actor.token,
            alias: templateData.header.name,
        },
        flags: {
            shadowrun5e: {
                customRoll: true,
            },
        },
    };
    if (roll) {
        chatData['sound'] = CONFIG.sounds.dice;
    }
    const rollMode = (_a = templateData.rollMode) !== null && _a !== void 0 ? _a : game.settings.get('core', 'rollMode');
    if (['gmroll', 'blindroll'].includes(rollMode))
        chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    if (rollMode === 'blindroll')
        chatData['blind'] = true;
    return chatData;
});
exports.addChatMessageContextOptions = (html, options) => {
    const canRoll = (li) => {
        const msg = game.messages.get(li.data().messageId);
        return msg.getFlag(constants_1.SYSTEM_NAME, constants_1.FLAGS.MessageCustomRoll);
    };
    options.push({
        name: 'Push the Limit',
        callback: (li) => SR5Actor_1.SR5Actor.pushTheLimit(li),
        condition: canRoll,
        icon: '<i class="fas fa-meteor"></i>',
    }, {
        name: 'Second Chance',
        callback: (li) => SR5Actor_1.SR5Actor.secondChance(li),
        condition: canRoll,
        icon: '<i class="fas fa-dice-d6"></i>',
    });
    return options;
};
exports.addRollListeners = (app, html) => {
    if (!app.getFlag(constants_1.SYSTEM_NAME, constants_1.FLAGS.MessageCustomRoll))
        return;
    const item = SR5Item_1.SR5Item.getItemFromMessage(html);
    html.on('click', '.test-roll', (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        if (item) {
            const roll = yield item.rollTest(event, { hideRollMessage: true });
            if (roll && roll.templateData) {
                const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
                const html = yield renderTemplate(template, roll.templateData);
                const data = {};
                data['content'] = html;
                yield app.update(data);
            }
        }
    }));
    html.on('click', '.test', (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const type = event.currentTarget.dataset.action;
        if (item) {
            yield item.rollExtraTest(type, event);
        }
    }));
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        if (item) {
            const template = template_1.default.fromItem(item);
            template === null || template === void 0 ? void 0 : template.drawPreview();
        }
    });
    html.on('click', '.card-title', (event) => {
        event.preventDefault();
        $(event.currentTarget).siblings('.card-description').toggle();
    });
    if ((item === null || item === void 0 ? void 0 : item.hasRoll) && app.isRoll)
        $(html).find('.card-description').hide();
};

},{"./actor/SR5Actor":16,"./constants":45,"./item/SR5Item":57,"./parts/PartsList":68,"./template":71}],43:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5Combat = void 0;
class SR5Combat extends Combat {
    constructor(...args) {
        // @ts-ignore
        super(...args);
        Hooks.on('updateActor', (actor) => {
            const combatant = this.getActorCombatant(actor);
            if (combatant) {
                // TODO handle monitoring Wound changes
            }
        });
    }
    get initiativePass() {
        var _a;
        return ((_a = this.data) === null || _a === void 0 ? void 0 : _a.initiativePass) || 0;
    }
    getActorCombatant(actor) {
        return this.combatants.find((c) => c.actor._id === actor._id);
    }
    /**
     * Add ContextMenu options to CombatTracker Entries -- adds the basic Initiative Subtractions
     * @param html
     * @param options
     */
    static addCombatTrackerContextOptions(html, options) {
        options.push({
            name: game.i18n.localize('SR5.COMBAT.ReduceInitByOne'),
            icon: '<i class="fas fa-caret-down"></i>',
            callback: (li) => __awaiter(this, void 0, void 0, function* () {
                // @ts-ignore
                const combatant = yield game.combat.getCombatant(li.data('combatant-id'));
                if (combatant) {
                    const combat = game.combat;
                    yield combat.adjustInitiative(combatant, -1);
                }
            }),
        }, {
            name: game.i18n.localize('SR5.COMBAT.ReduceInitByFive'),
            icon: '<i class="fas fa-angle-down"></i>',
            callback: (li) => __awaiter(this, void 0, void 0, function* () {
                // @ts-ignore
                const combatant = yield game.combat.getCombatant(li.data('combatant-id'));
                if (combatant) {
                    const combat = game.combat;
                    yield combat.adjustInitiative(combatant, -5);
                }
            }),
        }, {
            name: game.i18n.localize('SR5.COMBAT.ReduceInitByTen'),
            icon: '<i class="fas fa-angle-double-down"></i>',
            callback: (li) => __awaiter(this, void 0, void 0, function* () {
                // @ts-ignore
                const combatant = yield game.combat.getCombatant(li.data('combatant-id'));
                if (combatant) {
                    const combat = game.combat;
                    yield combat.adjustInitiative(combatant, -10);
                }
            }),
        });
        return options;
    }
    _onUpdate(data, ...args) {
        console.log(data);
        // @ts-ignore
        super._onUpdate(data, ...args);
    }
    /**
     *
     * @param combatant
     * @param adjustment
     */
    adjustInitiative(combatant, adjustment) {
        return __awaiter(this, void 0, void 0, function* () {
            combatant = typeof combatant === 'string' ? this.combatants.find((c) => c._id === combatant) : combatant;
            if (!combatant || typeof combatant === 'string') {
                console.error('Could not find combatant with id ', combatant);
                return;
            }
            const newCombatant = {
                _id: combatant._id,
                initiative: Number(combatant.initiative) + adjustment,
            };
            // @ts-ignore
            yield this.updateCombatant(newCombatant);
        });
    }
    static sortByRERIC(left, right) {
        // First sort by initiative value if different
        const leftInit = Number(left.initiative);
        const rightInit = Number(right.initiative);
        if (isNaN(leftInit))
            return 1;
        if (isNaN(rightInit))
            return -1;
        if (leftInit > rightInit)
            return -1;
        if (leftInit < rightInit)
            return 1;
        // now we sort by ERIC
        const genData = (actor) => {
            var _a, _b;
            // edge, reaction, intuition, coinflip
            return [
                Number(actor.getEdge().max),
                Number((_a = actor.findAttribute('reaction')) === null || _a === void 0 ? void 0 : _a.value),
                Number((_b = actor.findAttribute('intuition')) === null || _b === void 0 ? void 0 : _b.value),
                new Roll('1d2').roll().total,
            ];
        };
        const leftData = genData(left.actor);
        const rightData = genData(right.actor);
        // if we find a difference that isn't 0, return it
        for (let index = 0; index < leftData.length; index++) {
            const diff = rightData[index] - leftData[index];
            if (diff !== 0)
                return diff;
        }
        return 0;
    }
    /**
     * @Override
     * remove any turns that are less than 0
     * filter using ERIC
     */
    setupTurns() {
        const turns = super.setupTurns().filter((turn) => {
            if (turn.initiative === null)
                return true;
            const init = Number(turn.initiative);
            if (isNaN(init))
                return true;
            return init > 0;
        });
        // @ts-ignore
        this.turns = turns.sort(SR5Combat.sortByRERIC);
        return turns;
    }
    /**
     * @Override
     * proceed to the next turn
     * - handles going to next initiative pass or combat round.
     */
    nextTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            let turn = this.turn;
            let skip = this.settings.skipDefeated;
            // Determine the next turn number
            let next = null;
            if (skip) {
                for (let [i, t] of this.turns.entries()) {
                    if (i <= turn)
                        continue;
                    // @ts-ignore
                    if (!t.defeated) {
                        next = i;
                        break;
                    }
                }
            }
            else
                next = turn + 1;
            // Maybe advance to the next round/init pass
            let round = this.round;
            let initPass = this.initiativePass;
            // if both are 0, we just started so set both to 1
            if (round === 0 && initPass === 0) {
                initPass = initPass + 1;
                round = round + 1;
                next = 0;
            }
            else if (next === null || next >= this.turns.length) {
                const combatants = [];
                // check for initpass
                const over10Init = this.combatants.reduce((accumulator, running) => {
                    return accumulator || Number(running.initiative) > 10;
                }, false);
                // do an initiative pass
                if (over10Init) {
                    next = 0;
                    initPass = initPass + 1;
                    // adjust combatants
                    for (const c of this.combatants) {
                        let init = Number(c.initiative);
                        init -= 10;
                        // @ts-ignore
                        combatants.push({ _id: c._id, initiative: init });
                    }
                }
                else {
                    next = 0;
                    round = round + 1;
                    initPass = 0;
                    // resetall isn't typed
                    // @ts-ignore
                    yield this.resetAll();
                    yield this.rollAll();
                }
                if (combatants.length > 0) {
                    // @ts-ignore
                    yield this.updateCombatant(combatants);
                }
                if (skip) {
                    // @ts-ignore
                    next = this.turns.findIndex((t) => !t.defeated);
                    if (next === -1) {
                        // @ts-ignore
                        ui.notifications.warn(game.i18n.localize('COMBAT.NoneRemaining'));
                        next = 0;
                    }
                }
            }
            // Update the encounter
            yield this.update({ round: round, turn: next, initiativePass: initPass });
        });
    }
}
exports.SR5Combat = SR5Combat;

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5 = void 0;
exports.SR5 = {
    itemTypes: {
        action: 'SR5.ItemTypes.Action',
        adept_power: 'SR5.ItemTypes.AdeptPower',
        ammo: 'SR5.ItemTypes.Ammo',
        armor: 'SR5.ItemTypes.Armor',
        complex_form: 'SR5.ItemTypes.ComplexForm',
        contact: 'SR5.ItemTypes.Contact',
        critter_power: 'SR5.ItemTypes.CritterPower',
        cyberware: 'SR5.ItemTypes.Cyberware',
        device: 'SR5.ItemTypes.Device',
        equipment: 'SR5.ItemTypes.Equipment',
        lifestyle: 'SR5.ItemTypes.Lifestyle',
        modification: 'SR5.ItemTypes.Modification',
        quality: 'SR5.ItemTypes.Quality',
        sin: 'SR5.ItemTypes.Sin',
        spell: 'SR5.ItemTypes.Spell',
        weapon: 'SR5.ItemTypes.Weapon',
    },
    attributes: {
        body: 'SR5.AttrBody',
        agility: 'SR5.AttrAgility',
        reaction: 'SR5.AttrReaction',
        strength: 'SR5.AttrStrength',
        willpower: 'SR5.AttrWillpower',
        logic: 'SR5.AttrLogic',
        intuition: 'SR5.AttrIntuition',
        charisma: 'SR5.AttrCharisma',
        magic: 'SR5.AttrMagic',
        resonance: 'SR5.AttrResonance',
        edge: 'SR5.AttrEdge',
        essence: 'SR5.AttrEssence',
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall',
    },
    limits: {
        physical: 'SR5.LimitPhysical',
        social: 'SR5.LimitSocial',
        mental: 'SR5.LimitMental',
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall',
    },
    specialTypes: {
        mundane: 'SR5.Mundane',
        magic: 'SR5.Awakened',
        resonance: 'SR5.Emerged',
    },
    damageTypes: {
        physical: 'SR5.DmgTypePhysical',
        stun: 'SR5.DmgTypeStun',
        matrix: 'SR5.DmgTypeMatrix',
    },
    elementTypes: {
        fire: 'SR5.ElementFire',
        cold: 'SR5.ElementCold',
        acid: 'SR5.ElementAcid',
        electricity: 'SR5.ElementElectricity',
        radiation: 'SR5.ElementRadiation',
    },
    spellCategories: {
        combat: 'SR5.SpellCatCombat',
        detection: 'SR5.SpellCatDetection',
        health: 'SR5.SpellCatHealth',
        illusion: 'SR5.SpellCatIllusion',
        manipulation: 'SR5.SpellCatManipulation',
    },
    spellTypes: {
        physical: 'SR5.SpellTypePhysical',
        mana: 'SR5.SpellTypeMana',
    },
    spellRanges: {
        touch: 'SR5.SpellRangeTouch',
        los: 'SR5.SpellRangeLos',
        los_a: 'SR5.SpellRangeLosA',
    },
    combatSpellTypes: {
        direct: 'SR5.SpellCombatDirect',
        indirect: 'SR5.SpellCombatIndirect',
    },
    detectionSpellTypes: {
        directional: 'SR5.SpellDetectionDirectional',
        psychic: 'SR5.SpellDetectionPsychic',
        area: 'SR5.SpellDetectionArea',
    },
    illusionSpellTypes: {
        obvious: 'SR5.SpellIllusionObvious',
        realistic: 'SR5.SpellIllusionRealistic',
    },
    illusionSpellSenses: {
        'single-sense': 'SR5.SpellIllusionSingleSense',
        'multi-sense': 'SR5.SpellIllusionMultiSense',
    },
    attributeRolls: {
        composure: 'SR5.RollComposure',
        lift_carry: 'SR5.RollLiftCarry',
        judge_intentions: 'SR5.RollJudgeIntentions',
        memory: 'SR5.RollMemory',
    },
    matrixTargets: {
        persona: 'SR5.TargetPersona',
        device: 'SR5.TargetDevice',
        file: 'SR5.TargetFile',
        self: 'SR5.TargetSelf',
        sprite: 'SR5.TargetSprite',
        other: 'SR5.TargetOther',
    },
    durations: {
        instant: 'SR5.DurationInstant',
        sustained: 'SR5.DurationSustained',
        permanent: 'SR5.DurationPermanent',
    },
    weaponCategories: {
        range: 'SR5.WeaponCatRange',
        melee: 'SR5.WeaponCatMelee',
        thrown: 'SR5.WeaponCatThrown',
    },
    weaponRanges: {
        short: 'SR5.WeaponRangeShort',
        medium: 'SR5.WeaponRangeMedium',
        long: 'SR5.WeaponRangeLong',
        extreme: 'SR5.WeaponRangeExtreme',
    },
    qualityTypes: {
        positive: 'SR5.QualityTypePositive',
        negative: 'SR5.QualityTypeNegative',
    },
    adeptPower: {
        types: {
            active: 'SR5.AdeptPower.Types.Active',
            passive: 'SR5.AdeptPower.Types.Passive',
        },
    },
    deviceCategories: {
        commlink: 'SR5.DeviceCatCommlink',
        cyberdeck: 'SR5.DeviceCatCyberdeck',
    },
    cyberwareGrades: {
        standard: 'SR5.CyberwareGradeStandard',
        alpha: 'SR5.CyberwareGradeAlpha',
        beta: 'SR5.CyberwareGradeBeta',
        delta: 'SR5.CyberwareGradeDelta',
        used: 'SR5.CyberwareGradeUsed',
    },
    knowledgeSkillCategories: {
        street: 'SR5.KnowledgeSkillStreet',
        academic: 'SR5.KnowledgeSkillAcademic',
        professional: 'SR5.KnowledgeSkillProfessional',
        interests: 'SR5.KnowledgeSkillInterests',
    },
    activeSkills: {
        archery: 'SR5.SkillArchery',
        automatics: 'SR5.SkillAutomatics',
        blades: 'SR5.SkillBlades',
        clubs: 'SR5.SkillClubs',
        exotic_melee: 'SR5.SkillExoticMelee',
        exotic_range: 'SR5.SkillExoticRange',
        heavy_weapons: 'SR5.SkillHeavyWeapons',
        longarms: 'SR5.SkillLongarms',
        pistols: 'SR5.SkillPistols',
        throwing_weapons: 'SR5.SkillThrowingWeapons',
        unarmed_combat: 'SR5.SkillUnarmedCombat',
        disguise: 'SR5.SkillDisguise',
        diving: 'SR5.SkillDiving',
        escape_artist: 'SR5.SkillEscapeArtist',
        free_fall: 'SR5.SkillFreeFall',
        gymnastics: 'SR5.SkillGymnastics',
        palming: 'SR5.SkillPalming',
        perception: 'SR5.SkillPerception',
        running: 'SR5.SkillRunning',
        sneaking: 'SR5.SkillSneaking',
        survival: 'SR5.SkillSurvival',
        swimming: 'SR5.SkillSwimming',
        tracking: 'SR5.SkillTracking',
        con: 'SR5.SkillCon',
        etiquette: 'SR5.SkillEtiquette',
        impersonation: 'SR5.SkillImpersonation',
        instruction: 'SR5.SkillInstruction',
        intimidation: 'SR5.SkillIntimidation',
        leadership: 'SR5.SkillLeadership',
        negotiation: 'SR5.SkillNegotiation',
        performance: 'SR5.SkillPerformance',
        alchemy: 'SR5.SkillAlchemy',
        arcana: 'SR5.SkillArcana',
        artificing: 'SR5.SkillArtificing',
        assensing: 'SR5.SkillAssensing',
        astral_combat: 'SR5.SkillAstralCombat',
        banishing: 'SR5.SkillBanishing',
        binding: 'SR5.SkillBinding',
        counterspelling: 'SR5.SkillCounterspelling',
        disenchanting: 'SR5.SkillDisenchanting',
        ritual_spellcasting: 'SR5.SkillRitualSpellcasting',
        spellcasting: 'SR5.SkillSpellcasting',
        summoning: 'SR5.SkillSummoning',
        compiling: 'SR5.SkillCompiling',
        decompiling: 'SR5.SkillDecompiling',
        registering: 'SR5.SkillRegistering',
        aeronautics_mechanic: 'SR5.SkillAeronauticsMechanic',
        automotive_mechanic: 'SR5.SkillAutomotiveMechanic',
        industrial_mechanic: 'SR5.SkillIndustrialMechanic',
        nautical_mechanic: 'SR5.SkillNauticalMechanic',
        animal_handling: 'SR5.SkillAnimalHandling',
        armorer: 'SR5.SkillArmorer',
        artisan: 'SR5.SkillArtisan',
        biotechnology: 'SR5.SkillBiotechnology',
        chemistry: 'SR5.SkillChemistry',
        computer: 'SR5.SkillComputer',
        cybercombat: 'SR5.SkillCybercombat',
        cybertechnology: 'SR5.SkillCybertechnology',
        demolitions: 'SR5.SkillDemolitions',
        electronic_warfare: 'SR5.SkillElectronicWarfare',
        first_aid: 'SR5.SkillFirstAid',
        forgery: 'SR5.SkillForgery',
        hacking: 'SR5.SkillHacking',
        hardware: 'SR5.SkillHardware',
        locksmith: 'SR5.SkillLocksmith',
        medicine: 'SR5.SkillMedicine',
        navigation: 'SR5.SkillNavigation',
        software: 'SR5.SkillSoftware',
        gunnery: 'SR5.SkillGunnery',
        pilot_aerospace: 'SR5.SkillPilotAerospace',
        pilot_aircraft: 'SR5.SkillPilotAircraft',
        pilot_walker: 'SR5.SkillPilotWalker',
        pilot_ground_craft: 'SR5.SkillPilotGroundCraft',
        pilot_water_craft: 'SR5.SkillPilotWaterCraft',
        pilot_exotic_vehicle: 'SR5.SkillPilotExoticVehicle',
    },
    actionTypes: {
        none: 'SR5.ActionTypeNone',
        free: 'SR5.ActionTypeFree',
        simple: 'SR5.ActionTypeSimple',
        complex: 'SR5.ActionTypeComplex',
        varies: 'SR5.ActionTypeVaries',
    },
    matrixAttributes: {
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall',
    },
    initiativeCategories: {
        meatspace: 'SR5.InitCatMeatspace',
        astral: 'SR5.InitCatAstral',
        matrix: 'SR5.InitCatMatrix',
    },
    modificationTypes: {
        weapon: 'SR5.Weapon',
        armor: 'SR5.Armor',
    },
    mountPoints: {
        barrel: 'SR5.Barrel',
        stock: 'SR5.Stock',
        top: 'SR5.Top',
        side: 'SR5.Side',
        internal: 'SR5.Internal',
    },
    lifestyleTypes: {
        street: 'SR5.LifestyleStreet',
        squatter: 'SR5.LifestyleSquatter',
        low: 'SR5.LifestyleLow',
        medium: 'SR5.LifestyleMiddle',
        high: 'SR5.LifestyleHigh',
        luxory: 'SR5.LifestyleLuxory',
        other: 'SR5.LifestyleOther',
    },
    kbmod: {
        STANDARD: 'shiftKey',
        EDGE: 'altKey',
        SPEC: 'ctrlKey',
    },
    actorModifiers: {
        soak: 'SR5.RollSoak',
        drain: 'SR5.Drain',
        armor: 'SR5.Armor',
        physical_limit: 'SR5.PhysicalLimit',
        social_limit: 'SR5.SocialLimit',
        mental_limit: 'SR5.MentalLimit',
        stun_track: 'SR5.StunTrack',
        physical_track: 'SR5.PhysicalTrack',
        meat_initiative: 'SR5.MeatSpaceInit',
        meat_initiative_dice: 'SR5.MeatSpaceDice',
        astral_initiative: 'SR5.AstralInit',
        astral_initiative_dice: 'SR5.AstralDice',
        matrix_initiative: 'SR5.MatrixInit',
        matrix_initiative_dice: 'SR5.MatrixDice',
        composure: 'SR5.RollComposure',
        lift_carry: 'SR5.RollLiftCarry',
        judge_intentions: 'SR5.RollJudgeIntentions',
        memory: 'SR5.RollMemory',
        walk: 'SR5.Walk',
        run: 'SR5.Run',
        defense: 'SR5.RollDefense',
        wound_tolerance: 'SR5.WoundTolerance',
        essence: 'SR5.AttrEssence',
        fade: 'SR5.RollFade',
        global: 'SR5.Global',
    },
    programTypes: {
        common_program: 'SR5.CommonProgram',
        hacking_program: 'SR5.HackingProgram',
        agent: 'SR5.Agent',
    },
    spiritTypes: {
        // base types
        air: 'SR5.Spirit.Types.Air',
        beasts: 'SR5.Spirit.Types.Beasts',
        earth: 'SR5.Spirit.Types.Earth',
        fire: 'SR5.Spirit.Types.Fire',
        guardian: 'SR5.Spirit.Types.Guardian',
        guidance: 'SR5.Spirit.Types.Guidance',
        man: 'SR5.Spirit.Types.Man',
        plant: 'SR5.Spirit.Types.Plant',
        task: 'SR5.Spirit.Types.Task',
        water: 'SR5.Spirit.Types.Water',
        // toxic types
        toxic_air: 'SR5.Spirit.Types.ToxicAir',
        toxic_beasts: 'SR5.Spirit.Types.ToxicBeasts',
        toxic_earth: 'SR5.Spirit.Types.ToxicEarth',
        toxic_fire: 'SR5.Spirit.Types.ToxicFire',
        toxic_man: 'SR5.Spirit.Types.ToxicMan',
        toxic_water: 'SR5.Spirit.Types.ToxicWater',
        // blood types
        blood: 'SR5.Spirit.Types.Blood',
        // shadow types
        muse: 'SR5.Spirit.Types.Muse',
        nightmare: 'SR5.Spirit.Types.Nightmare',
        shade: 'SR5.Spirit.Types.Shade',
        succubus: 'SR5.Spirit.Types.Succubus',
        wraith: 'SR5.Spirit.Types.Wraith',
        // shedim types
        shedim: 'SR5.Spirit.Types.Shedim',
        master_shedim: 'SR5.Spirit.Types.MasterShedim',
        // insect types
        caretaker: 'SR5.Spirit.Types.Caretaker',
        nymph: 'SR5.Spirit.Types.Nymph',
        scout: 'SR5.Spirit.Types.Scout',
        soldier: 'SR5.Spirit.Types.Soldier',
        worker: 'SR5.Spirit.Types.Worker',
        queen: 'SR5.Spirit.Types.Queen',
    },
    critterPower: {
        types: {
            mana: 'SR5.CritterPower.Types.Mana',
            physical: 'SR5.CritterPower.Types.Physical',
        },
        ranges: {
            los: 'SR5.CritterPower.Ranges.LineOfSight',
            self: 'SR5.CritterPower.Ranges.Self',
            touch: 'SR5.CritterPower.Ranges.Touch',
        },
        durations: {
            always: 'SR5.CritterPower.Durations.Always',
            instant: 'SR5.CritterPower.Durations.Instant',
            sustained: 'SR5.CritterPower.Durations.Sustained',
            permanent: 'SR5.CritterPower.Durations.Permanent',
            special: 'SR5.CritterPower.Durations.Special',
        },
    },
    spriteTypes: {
        courier: 'SR5.Sprite.Types.Courier',
        crack: 'SR5.Sprite.Types.Crack',
        data: 'SR5.Sprite.Types.Data',
        fault: 'SR5.Sprite.Types.Fault',
        machine: 'SR5.Sprite.Types.Machine',
    },
    vehicle: {
        types: {
            air: 'SR5.Vehicle.Types.Air',
            aerospace: 'SR5.Vehicle.Types.Aerospace',
            ground: 'SR5.Vehicle.Types.Ground',
            water: 'SR5.Vehicle.Types.Water',
            walker: 'SR5.Vehicle.Types.Walker',
            exotic: 'SR5.Vehicle.Types.Exotic',
        },
        stats: {
            handling: 'SR5.Vehicle.Stats.Handling',
            off_road_handling: 'SR5.Vehicle.Stats.OffRoadHandling',
            speed: 'SR5.Vehicle.Stats.Speed',
            off_road_speed: 'SR5.Vehicle.Stats.OffRoadSpeed',
            acceleration: 'SR5.Vehicle.Stats.Acceleration',
            pilot: 'SR5.Vehicle.Stats.Pilot',
            sensor: 'SR5.Vehicle.Stats.Sensor',
        },
        control_modes: {
            manual: 'SR5.Vehicle.ControlModes.Manual',
            remote: 'SR5.Vehicle.ControlModes.Remote',
            rigger: 'SR5.Vehicle.ControlModes.Rigger',
            autopilot: 'SR5.Vehicle.ControlModes.Autopilot',
        },
        environments: {
            speed: 'SR5.Vehicle.Environments.Speed',
            handling: 'SR5.Vehicle.Environments.Handling',
        },
    },
    character: {
        types: {
            human: 'SR5.Character.Types.Human',
            elf: 'SR5.Character.Types.Elf',
            ork: 'SR5.Character.Types.Ork',
            dwarf: 'SR5.Character.Types.Dwarf',
            troll: 'SR5.Character.Types.Troll'
        }
    }
};

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METATYPEMODIFIER = exports.GLITCH_DIE = exports.FLAGS = exports.SYSTEM_NAME = void 0;
exports.SYSTEM_NAME = 'shadowrun5e';
exports.FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    MessageCustomRoll: 'customRoll'
};
exports.GLITCH_DIE = 1;
exports.METATYPEMODIFIER = 'SR5.Character.Modifiers.NPCMetatypeAttribute';

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTemplates = void 0;
exports.DataTemplates = {
    grunt: {
        metatype_modifiers: {
            elf: {
                attributes: {
                    agility: +1,
                    charisma: +2,
                    edge: -1
                }
            },
            ork: {
                attributes: {
                    body: +3,
                    strength: +2,
                    logic: -1,
                    charisma: -1,
                    edge: -1
                }
            },
            troll: {
                attributes: {
                    body: +4,
                    agility: -1,
                    strength: +4,
                    logic: -1,
                    intuition: -1,
                    charisma: -2,
                    edge: -1,
                },
                general: {
                    armor: +1
                }
            },
            dwarf: {
                attributes: {
                    body: +2,
                    reaction: -1,
                    strength: +2,
                    willpower: +1,
                    edge: -1
                }
            }
        }
    }
};

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataWrapper = void 0;
class DataWrapper {
    constructor(data) {
        this.data = data;
    }
}
exports.DataWrapper = DataWrapper;

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBasicHelpers = void 0;
const helpers_1 = require("../helpers");
exports.registerBasicHelpers = () => {
    Handlebars.registerHelper('localizeOb', function (strId, obj) {
        if (obj)
            strId = obj[strId];
        return game.i18n.localize(strId);
    });
    Handlebars.registerHelper('toHeaderCase', function (str) {
        if (str)
            return helpers_1.Helpers.label(str);
        return '';
    });
    Handlebars.registerHelper('concatStrings', function (...args) {
        return args.filter(a => typeof a === 'string').join('');
    });
    Handlebars.registerHelper('concat', function (strs, c = ',') {
        if (Array.isArray(strs)) {
            return strs.join(c);
        }
        return strs;
    });
    Handlebars.registerHelper('for', function (from, to, options) {
        let accum = '';
        for (let i = from; i < to; i += 1) {
            accum += options.fn(i);
        }
        return accum;
    });
    Handlebars.registerHelper('modulo', function (v1, v2) {
        return v1 % v2;
    });
    Handlebars.registerHelper('divide', function (v1, v2) {
        if (v2 === 0)
            return 0;
        return v1 / v2;
    });
    Handlebars.registerHelper('hasprop', function (obj, prop, options) {
        if (obj.hasOwnProperty(prop)) {
            return options.fn(this);
        }
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('ifin', function (val, arr, options) {
        if (arr.includes(val))
            return options.fn(this);
        else
            return options.inverse(this);
    });
    // if greater than
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    // if less than
    Handlebars.registerHelper('iflt', function (v1, v2, options) {
        if (v1 < v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    // if less than or equal
    Handlebars.registerHelper('iflte', function (v1, v2, options) {
        if (v1 <= v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    // if not equal
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    // if equal
    Handlebars.registerHelper('ife', function (v1, v2, options) {
        if (v1 === v2)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    Handlebars.registerHelper('not', function (v1) {
        return !v1;
    });
    Handlebars.registerHelper('sum', function (v1, v2) {
        return v1 + v2;
    });
    Handlebars.registerHelper('isDefined', function (value) {
        return value !== undefined && value !== null;
    });
    /**
     * Return a default value if the provided value is not defined (null or undefined)
     */
    Handlebars.registerHelper('default', function (value, defaultValue) {
        return new Handlebars.SafeString(value !== null && value !== void 0 ? value : defaultValue);
    });
    Handlebars.registerHelper('log', function (value) {
        console.log(value);
    });
    Handlebars.registerHelper('buildName', function (options) {
        const hash = helpers_1.Helpers.orderKeys(options.hash);
        const name = Object.values(hash).reduce((retVal, current, index) => {
            if (index > 0)
                retVal += '.';
            return retVal + current;
        }, '');
        return new Handlebars.SafeString(name);
    });
    Handlebars.registerHelper('disabledHelper', function (value) {
        const val = Boolean(value);
        return val ? val : undefined;
    });
    // TODO: This helper doesn't work... Don't why, but it doesn't.
    Handlebars.registerHelper('localizeShortened', function (label, length, options) {
        return new Handlebars.SafeString(helpers_1.Helpers.shortenAttributeLocalization(label, length));
    });
};

},{"../helpers":54}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlebarManager = void 0;
const HandlebarTemplates_1 = require("./HandlebarTemplates");
const BasicHelpers_1 = require("./BasicHelpers");
const RollAndLabelHelpers_1 = require("./RollAndLabelHelpers");
const ItemLineHelpers_1 = require("./ItemLineHelpers");
const SkillLineHelpers_1 = require("./SkillLineHelpers");
class HandlebarManager {
    static loadTemplates() {
        HandlebarTemplates_1.preloadHandlebarsTemplates();
    }
    static registerHelpers() {
        BasicHelpers_1.registerBasicHelpers();
        RollAndLabelHelpers_1.registerRollAndLabelHelpers();
        ItemLineHelpers_1.registerItemLineHelpers();
        SkillLineHelpers_1.registerSkillLineHelpers();
    }
}
exports.HandlebarManager = HandlebarManager;

},{"./BasicHelpers":48,"./HandlebarTemplates":50,"./ItemLineHelpers":51,"./RollAndLabelHelpers":52,"./SkillLineHelpers":53}],50:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadHandlebarsTemplates = void 0;
exports.preloadHandlebarsTemplates = () => __awaiter(void 0, void 0, void 0, function* () {
    const templatePaths = [
        // actor tabs
        'systems/shadowrun5e/dist/templates/actor/tabs/ActionsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/BioTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/GearTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/MagicTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/MatrixTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/MiscTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/SkillsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/SocialTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/SpellsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/CritterPowersTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/spirit/SpiritSkillsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/SpriteSkillsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleSkillsTab.html',
        'systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleMatrixTab.html',
        // uncategorized lists
        'systems/shadowrun5e/dist/templates/actor/parts/Initiative.html',
        'systems/shadowrun5e/dist/templates/actor/parts/Movement.html',
        'systems/shadowrun5e/dist/templates/actor/parts/ProfileImage.html',
        'systems/shadowrun5e/dist/templates/actor/parts/NameInput.html',
        'systems/shadowrun5e/dist/templates/actor/parts/ActionList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/ContactList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/SinAndLifestyleList.html',
        // magic
        'systems/shadowrun5e/dist/templates/actor/parts/magic/AdeptPowerList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SpellList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SpellAndAdeptPowerList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SpiritOptions.html',
        // matrix
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/ProgramList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/ComplexFormList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/MatrixAttribute.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/SpritePowerList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/DeviceRating.html',
        // attributes
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/Attribute.html',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/AttributeList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/SpecialAttributeList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/Limits.html',
        // skills
        'systems/shadowrun5e/dist/templates/actor/parts/skills/ActiveSkillList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/skills/LanguageAndKnowledgeSkillList.html',
        // vehicle
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleStatsList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleSecondStatsList.html',
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleMovement.html',
        'systems/shadowrun5e/dist/templates/item/parts/description.html',
        'systems/shadowrun5e/dist/templates/item/parts/technology.html',
        'systems/shadowrun5e/dist/templates/item/parts/header.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/action.html',
        'systems/shadowrun5e/dist/templates/item/parts/damage.html',
        'systems/shadowrun5e/dist/templates/item/parts/opposed.html',
        'systems/shadowrun5e/dist/templates/item/parts/spell.html',
        'systems/shadowrun5e/dist/templates/item/parts/complex_form.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon.html',
        'systems/shadowrun5e/dist/templates/item/parts/armor.html',
        'systems/shadowrun5e/dist/templates/item/parts/matrix.html',
        'systems/shadowrun5e/dist/templates/item/parts/sin.html',
        'systems/shadowrun5e/dist/templates/item/parts/contact.html',
        'systems/shadowrun5e/dist/templates/item/parts/lifestyle.html',
        'systems/shadowrun5e/dist/templates/item/parts/ammo.html',
        'systems/shadowrun5e/dist/templates/item/parts/modification.html',
        'systems/shadowrun5e/dist/templates/item/parts/program.html',
        'systems/shadowrun5e/dist/templates/item/parts/critter_power.html',
        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.html',
        // to wrap the bodies of tabs
        'systems/shadowrun5e/dist/templates/common/TabWrapper.html',
        'systems/shadowrun5e/dist/templates/common/ValueInput.html',
        // Useful wrapper and implemented components
        'systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.html',
        'systems/shadowrun5e/dist/templates/common/Attribute.html',
        'systems/shadowrun5e/dist/templates/common/ValueModifiers.html',
        // useful select template for the common pattern
        'systems/shadowrun5e/dist/templates/common/Select.html',
        // to create the condition monitors and edge counter
        'systems/shadowrun5e/dist/templates/common/HorizontalCellInput.html',
        // looks like a ListHeader
        'systems/shadowrun5e/dist/templates/common/HeaderBlock.html',
        'systems/shadowrun5e/dist/templates/common/NameLineBlock.html',
        // list components
        'systems/shadowrun5e/dist/templates/common/List/ListItem.html',
        'systems/shadowrun5e/dist/templates/common/List/ListHeader.html'
    ];
    return loadTemplates(templatePaths);
});

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerItemLineHelpers = void 0;
const SR5ItemDataWrapper_1 = require("../item/SR5ItemDataWrapper");
exports.registerItemLineHelpers = () => {
    Handlebars.registerHelper('ItemHeaderIcons', function (id) {
        const PlusIcon = 'fas fa-plus';
        const AddText = game.i18n.localize('SR5.Add');
        const addIcon = {
            icon: PlusIcon,
            text: AddText,
            title: game.i18n.localize('SR5.CreateItem'),
            cssClass: 'item-create',
        };
        switch (id) {
            case 'lifestyle':
                addIcon.title = game.i18n.localize('SR5.CreateItemLifestyle');
                return [addIcon];
            case 'contact':
                addIcon.title = game.i18n.localize('SR5.CreateItemContact');
                return [addIcon];
            case 'sin':
                addIcon.title = game.i18n.localize('SR5.CreateItemSIN');
                return [addIcon];
            case 'license':
                addIcon.title = game.i18n.localize('SR5.CreateItemLicense');
                return [addIcon];
            case 'quality':
                addIcon.title = game.i18n.localize('SR5.CreateItemQuality');
                return [addIcon];
            case 'adept_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemAdeptPower');
                return [addIcon];
            case 'action':
                addIcon.title = game.i18n.localize('SR5.CreateItemAction');
                return [addIcon];
            case 'spell':
                addIcon.title = game.i18n.localize('SR5.CreateItemSpell');
                return [addIcon];
            case 'gear':
                addIcon.title = game.i18n.localize('SR5.CreateItemGear');
                return [addIcon];
            case 'complex_form':
                addIcon.title = game.i18n.localize('SR5.CreateItemComplexForm');
                return [addIcon];
            case 'program':
                addIcon.title = game.i18n.localize('SR5.CreateItemProgram');
                return [addIcon];
            case 'weapon':
                addIcon.title = game.i18n.localize('SR5.CreateItemWeapon');
                return [addIcon];
            case 'armor':
                addIcon.title = game.i18n.localize('SR5.CreateItemArmor');
                return [addIcon];
            case 'device':
                addIcon.title = game.i18n.localize('SR5.CreateItemDevice');
                return [addIcon];
            case 'equipment':
                addIcon.title = game.i18n.localize('SR5.CreateItemEquipment');
                return [addIcon];
            case 'cyberware':
                addIcon.title = game.i18n.localize('SR5.CreateItemCyberware');
                return [addIcon];
            case 'critter_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemCritterPower');
                return [addIcon];
            case 'sprite_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemSpritePower');
                return [addIcon];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('ItemHeaderRightSide', function (id) {
        switch (id) {
            case 'action':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Skill'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Limit'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Modifier'),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'weapon':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Qty'),
                        },
                    },
                ];
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Target'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Fade'),
                        },
                    },
                ];
            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.PowerType'),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.SpellType'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.SpellRange'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Drain'),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Type'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Range'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Duration'),
                        },
                    },
                ];
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.QualityType'),
                        },
                    },
                ];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('ItemRightSide', function (item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const wrapper = new SR5ItemDataWrapper_1.SR5ItemDataWrapper(item);
        const qtyInput = {
            input: {
                type: 'number',
                value: wrapper.getQuantity(),
                cssClass: 'item-qty',
            },
        };
        switch (item.type) {
            case 'action':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.activeSkills[(_a = wrapper.getActionSkill()) !== null && _a !== void 0 ? _a : '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.attributes[(_b = wrapper.getActionAttribute()) !== null && _b !== void 0 ? _b : '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.attributes[(_c = wrapper.getActionAttribute2()) !== null && _c !== void 0 ? _c : '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: wrapper.getLimitAttribute()
                                ? game.i18n.localize(CONFIG.SR5.attributes[(_d = wrapper.getLimitAttribute()) !== null && _d !== void 0 ? _d : ''])
                                : wrapper.getActionLimit(),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: wrapper.getActionDicePoolMod(),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
                return [qtyInput];
            case 'weapon':
                if (wrapper.isRangedWeapon()) {
                    const count = (_f = (_e = wrapper.getAmmo()) === null || _e === void 0 ? void 0 : _e.current.value) !== null && _f !== void 0 ? _f : 0;
                    const max = (_h = (_g = wrapper.getAmmo()) === null || _g === void 0 ? void 0 : _g.current.max) !== null && _h !== void 0 ? _h : 0;
                    const text = count < max ? `${game.i18n.localize('SR5.WeaponReload')} (${count}/${max})` : game.i18n.localize('SR5.AmmoFull');
                    const cssClass = 'no-break' + (count < max ? ' reload-ammo roll' : ' faded');
                    return [
                        {
                            text: {
                                title: `${game.i18n.localize('SR5.WeaponAmmoCount')}: ${count}`,
                                text,
                                cssClass,
                            },
                        },
                        {
                            text: {
                                text: '',
                            },
                        },
                        qtyInput,
                    ];
                }
                else {
                    return [qtyInput];
                }
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.qualityTypes[(_j = item.data.type) !== null && _j !== void 0 ? _j : '']),
                        },
                    },
                ];
            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.adeptPower.types[(_k = item.data.type) !== null && _k !== void 0 ? _k : '']),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.spellTypes[(_l = item.data.type) !== null && _l !== void 0 ? _l : '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.spellRanges[(_m = item.data.range) !== null && _m !== void 0 ? _m : '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.durations[(_o = item.data.duration) !== null && _o !== void 0 ? _o : '']),
                        },
                    },
                    {
                        text: {
                            text: wrapper.getDrain(),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.critterPower.types[(_p = item.data.powerType) !== null && _p !== void 0 ? _p : '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.critterPower.ranges[(_q = item.data.range) !== null && _q !== void 0 ? _q : '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.critterPower.durations[(_r = item.data.duration) !== null && _r !== void 0 ? _r : '']),
                        },
                    },
                ];
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.matrixTargets[(_s = item.data.target) !== null && _s !== void 0 ? _s : '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.durations[(_t = item.data.duration) !== null && _t !== void 0 ? _t : '']),
                        },
                    },
                    {
                        text: {
                            text: String(item.data.fade),
                        },
                    },
                ];
            case 'program':
                return [
                    {
                        button: {
                            cssClass: `item-equip-toggle ${wrapper.isEquipped() ? 'light' : ''}`,
                            short: true,
                            text: wrapper.isEquipped() ? game.i18n.localize('SR5.Loaded') : game.i18n.localize('SR5.Load') + ' >>',
                        },
                    },
                ];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('ItemIcons', function (item) {
        var _a;
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${((_a = item.data.technology) === null || _a === void 0 ? void 0 : _a.equipped) ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source-pdf',
            title: game.i18n.localize('SR5.OpenSourcePdf'),
        };
        const icons = [editIcon, removeIcon];
        if (ui['PDFoundry']) {
            icons.unshift(pdfIcon);
        }
        switch (item.type) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'weapon':
                icons.unshift(equipIcon);
        }
        return icons;
    });
};

},{"../item/SR5ItemDataWrapper":58}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRollAndLabelHelpers = void 0;
const PartsList_1 = require("../parts/PartsList");
exports.registerRollAndLabelHelpers = () => {
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical')
            return 'P';
        if (damage === 'stun')
            return 'S';
        if (damage === 'matrix')
            return 'M';
        return '';
    });
    Handlebars.registerHelper('diceIcon', function (side) {
        if (side) {
            switch (side) {
                case 1:
                    return 'red';
                case 2:
                    return 'grey';
                case 3:
                    return 'grey';
                case 4:
                    return 'grey';
                case 5:
                    return 'green';
                case 6:
                    return 'green';
            }
        }
    });
    Handlebars.registerHelper('elementIcon', function (element) {
        let icon = '';
        if (element === 'electricity') {
            icon = 'fas fa-bolt';
        }
        else if (element === 'radiation') {
            icon = 'fas fa-radiation-alt';
        }
        else if (element === 'fire') {
            icon = 'fas fa-fire';
        }
        else if (element === 'acid') {
            icon = 'fas fa-vials';
        }
        else if (element === 'cold') {
            icon = 'fas fa-snowflake';
        }
        return icon;
    });
    Handlebars.registerHelper('partsTotal', function (partsList) {
        const parts = new PartsList_1.PartsList(partsList);
        return parts.total;
    });
    Handlebars.registerHelper('signedValue', function (value) {
        if (value > 0) {
            return `+${value}`;
        }
        else {
            return `${value}`;
        }
    });
};

},{"../parts/PartsList":68}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSkillLineHelpers = void 0;
const helpers_1 = require("../helpers");
exports.registerSkillLineHelpers = () => {
    Handlebars.registerHelper('SkillHeaderIcons', function (id) {
        const addIcon = {
            icon: 'fas fa-plus',
            title: game.i18n.localize('SR5.AddSkill'),
            text: game.i18n.localize('SR5.Add'),
            cssClass: '',
        };
        switch (id) {
            case 'active':
                return [{}];
            case 'language':
                addIcon.cssClass = 'add-language';
                return [addIcon];
            case 'knowledge':
                addIcon.cssClass = 'add-knowledge';
                return [addIcon];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('SkillHeaderRightSide', function (id, filters) {
        const specs = {
            text: {
                text: game.i18n.localize('SR5.Specialization'),
                cssClass: 'skill-spec-item',
            },
        };
        const rtg = {
            // Change Rating header to show active filtering.
            text: {
                text: !filters || filters.showUntrainedSkills ?
                    game.i18n.localize('SR5.Rtg') :
                    game.i18n.localize('SR5.RtgAboveZero'),
                cssClass: 'rtg',
            },
        };
        switch (id) {
            case 'active':
            case 'knowledge':
            case 'language':
                return [specs, rtg];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('SkillRightSide', function (skillType, skill) {
        var _a;
        const specs = Array.isArray(skill.specs) ? skill.specs : [skill.specs];
        return [
            {
                text: {
                    text: (_a = specs.join(', ')) !== null && _a !== void 0 ? _a : '',
                    cssClass: 'skill-spec-item',
                },
            },
            {
                text: {
                    text: helpers_1.Helpers.calcTotal(skill),
                    cssClass: 'rtg',
                },
            },
        ];
    });
    Handlebars.registerHelper('SkillIcons', function (skillType, skill) {
        const editIcon = {
            icon: 'fas fa-edit',
            title: game.i18n.localize('SR5.EditSkill'),
            cssClass: '',
        };
        const removeIcon = {
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.DeleteSkill'),
            cssClass: '',
        };
        switch (skillType) {
            case 'active':
                editIcon.cssClass = 'skill-edit';
                return [editIcon];
            case 'language':
                editIcon.cssClass = 'language-skill-edit';
                removeIcon.cssClass = 'remove-language';
                return [editIcon, removeIcon];
            case 'knowledge':
                editIcon.cssClass = 'knowledge-skill-edit';
                removeIcon.cssClass = 'remove-knowledge';
                return [editIcon, removeIcon];
            default:
                return [editIcon];
        }
    });
};

},{"../helpers":54}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
const PartsList_1 = require("./parts/PartsList");
class Helpers {
    /**
     * Calculate the total value for a data object
     * - stores the total value and returns it
     * @param data
     */
    static calcTotal(data) {
        if (data.mod === undefined)
            data.mod = [];
        const parts = new PartsList_1.PartsList(data.mod);
        // if a temp field is found, add it as a unique part
        if (data['temp'] !== undefined) {
            parts.addUniquePart('SR5.Temporary', data['temp']);
        }
        data.value = parts.total + data.base;
        data.mod = parts.list;
        return data.value;
    }
    static listItemId(event) {
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }
    // replace 'SR5.'s on keys with 'SR5_DOT_'
    static onSetFlag(data) {
        if (typeof data !== 'object')
            return data;
        if (data === undefined || data === null)
            return data;
        const newData = {};
        for (const [key, value] of Object.entries(data)) {
            const newKey = key.replace('SR5.', 'SR5_DOT_');
            newData[newKey] = this.onSetFlag(value);
        }
        return newData;
    }
    // replace 'SR5_DOT_' with 'SR5.' on keys
    static onGetFlag(data) {
        if (typeof data !== 'object')
            return data;
        if (data === undefined || data === null)
            return data;
        const newData = {};
        for (const [key, value] of Object.entries(data)) {
            const newKey = key.replace('SR5_DOT_', 'SR5.');
            newData[newKey] = this.onGetFlag(value);
        }
        return newData;
    }
    static isMatrix(atts) {
        var _a;
        if (!atts)
            return false;
        if (typeof atts === 'boolean')
            return atts;
        // array of labels to check for on the incoming data
        const matrixLabels = [
            'SR5.MatrixAttrFirewall',
            'SR5.MatrixAttrDataProcessing',
            'SR5.MatrixAttrSleaze',
            'SR5.MatrixAttrAttack',
            'SR5.SkillComputer',
            'SR5.SkillHacking',
            'SR5.SkillCybercombat',
            'SR5.SkillElectronicWarfare',
            'SR5.Software',
        ];
        if (!Array.isArray(atts))
            atts = [atts];
        atts = atts.filter((att) => att);
        // iterate over the attributes and return true if we find a matrix att
        for (const att of atts) {
            if (typeof att === 'string') {
                if (matrixLabels.indexOf(att) >= 0) {
                    return true;
                }
            }
            else if (typeof att === 'object' && att.label !== undefined) {
                if (matrixLabels.indexOf((_a = att.label) !== null && _a !== void 0 ? _a : '') >= 0) {
                    return true;
                }
            }
        }
        // if we don't find anything return false
        return false;
    }
    static parseInputToString(val) {
        if (val === undefined)
            return '';
        if (typeof val === 'number')
            return val.toString();
        if (typeof val === 'string')
            return val;
        if (Array.isArray(val)) {
            return val.join(',');
        }
        return '';
    }
    static parseInputToNumber(val) {
        if (typeof val === 'number')
            return val;
        if (typeof val === 'string') {
            const ret = +val;
            if (!isNaN(ret))
                return ret;
            return 0;
        }
        if (Array.isArray(val)) {
            const str = val.join('');
            const ret = +str;
            if (!isNaN(ret))
                return ret;
            return 0;
        }
        return 0;
    }
    static setupCustomCheckbox(app, html) {
        const setContent = (el) => {
            const checkbox = $(el).children('input[type=checkbox]');
            const checkmark = $(el).children('.checkmark');
            if ($(checkbox).prop('checked')) {
                $(checkmark).addClass('fa-check-circle');
                $(checkmark).removeClass('fa-circle');
            }
            else {
                $(checkmark).addClass('fa-circle');
                $(checkmark).removeClass('fa-check-circle');
            }
        };
        html.find('label.checkbox').each(function () {
            setContent(this);
        });
        html.find('label.checkbox').click((event) => setContent(event.currentTarget));
        html.find('.submit-checkbox').change((event) => app._onSubmit(event));
    }
    static mapRoundsToDefenseMod(rounds) {
        if (rounds === 1)
            return 0;
        if (rounds === 3)
            return -2;
        if (rounds === 6)
            return -5;
        if (rounds === 10)
            return -9;
        return 0;
    }
    static mapRoundsToDefenseDesc(rounds) {
        if (rounds === 1)
            return '';
        if (rounds === 3)
            return '-2';
        if (rounds === 6)
            return '-5';
        if (rounds === 10)
            return '-9';
        if (rounds === 20)
            return 'SR5.DuckOrCover';
        return '';
    }
    static label(str) {
        const frags = str.split('_');
        for (let i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        frags.forEach((frag, idx) => {
            if (frag === 'Processing')
                frags[idx] = 'Proc.';
            if (frag === 'Mechanic')
                frags[idx] = 'Mech.';
        });
        return frags.join(' ');
    }
    static orderKeys(obj) {
        const keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2)
                return -1;
            if (k1 > k2)
                return +1;
            return 0;
        });
        let i;
        const after = {};
        for (i = 0; i < keys.length; i++) {
            after[keys[i]] = obj[keys[i]];
            delete obj[keys[i]];
        }
        for (i = 0; i < keys.length; i++) {
            obj[keys[i]] = after[keys[i]];
        }
        return obj;
    }
    static hasModifiers(event) {
        return event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
    }
    static filter(obj, comp) {
        const retObj = {};
        if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (comp([key, value]))
                    retObj[key] = value;
            });
        }
        return retObj;
    }
    static addLabels(obj, label) {
        if (typeof obj === 'object' && obj !== null) {
            if (!obj.hasOwnProperty('label') && obj.hasOwnProperty('value') && label !== '') {
                obj.label = label;
            }
            Object.entries(obj)
                .filter(([, value]) => typeof value === 'object')
                .forEach(([key, value]) => Helpers.addLabels(value, key));
        }
    }
    /* Handle Shadowrun style shortened attribute names with typical three letter shortening. */
    static shortenAttributeLocalization(label, length = 3) {
        const name = game.i18n.localize(label);
        if (length <= 0) {
            return name;
        }
        if (name.length < length) {
            length = name.length;
        }
        return name.slice(0, length).toUpperCase();
    }
}
exports.Helpers = Helpers;

},{"./parts/PartsList":68}],55:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooksManager = void 0;
const config_1 = require("./config");
const Migrator_1 = require("./migrator/Migrator");
const settings_1 = require("./settings");
const constants_1 = require("./constants");
const SR5Actor_1 = require("./actor/SR5Actor");
const SR5ActorSheet_1 = require("./actor/SR5ActorSheet");
const SR5Item_1 = require("./item/SR5Item");
const SR5ItemSheet_1 = require("./item/SR5ItemSheet");
const ShadowrunRoller_1 = require("./rolls/ShadowrunRoller");
const helpers_1 = require("./helpers");
const HandlebarManager_1 = require("./handlebars/HandlebarManager");
const canvas_1 = require("./canvas");
const chat = require("./chat");
const macros_1 = require("./macros");
const OverwatchScoreTracker_1 = require("./apps/gmtools/OverwatchScoreTracker");
const SR5Combat_1 = require("./combat/SR5Combat");
class HooksManager {
    static registerHooks() {
        // Register your highest level hook callbacks here for a quick overview of what's hooked into.
        Hooks.once('init', HooksManager.init);
        Hooks.on('canvasInit', HooksManager.canvasInit);
        Hooks.on('ready', HooksManager.ready);
        Hooks.on('renderChatMessage', HooksManager.readyChatMessage);
        Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
        Hooks.on('hotbarDrop', HooksManager.hotbarDrop);
        Hooks.on('renderSceneControls', HooksManager.renderSceneControls);
        Hooks.on('getSceneControlButtons', HooksManager.getSceneControlButtons);
        Hooks.on('getCombatTrackerEntryContext', SR5Combat_1.SR5Combat.addCombatTrackerContextOptions);
    }
    static init() {
        console.log('Loading Shadowrun 5e System');
        // Create a shadowrun5e namespace within the game global
        game['shadowrun5e'] = {
            SR5Actor: SR5Actor_1.SR5Actor,
            ShadowrunRoller: ShadowrunRoller_1.ShadowrunRoller,
            SR5Item: SR5Item_1.SR5Item,
            rollItemMacro: macros_1.rollItemMacro,
        };
        CONFIG.SR5 = config_1.SR5;
        CONFIG.Actor.entityClass = SR5Actor_1.SR5Actor;
        CONFIG.Item.entityClass = SR5Item_1.SR5Item;
        CONFIG.Combat.entityClass = SR5Combat_1.SR5Combat;
        settings_1.registerSystemSettings();
        // Register sheet application classes
        Actors.unregisterSheet('core', ActorSheet);
        Actors.registerSheet(constants_1.SYSTEM_NAME, SR5ActorSheet_1.SR5ActorSheet, { makeDefault: true });
        Items.unregisterSheet('core', ItemSheet);
        Items.registerSheet(constants_1.SYSTEM_NAME, SR5ItemSheet_1.SR5ItemSheet, { makeDefault: true });
        ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
            Hooks.on(s, (app, html) => helpers_1.Helpers.setupCustomCheckbox(app, html));
        });
        HandlebarManager_1.HandlebarManager.loadTemplates();
    }
    static ready() {
        return __awaiter(this, void 0, void 0, function* () {
            if (game.user.isGM) {
                yield Migrator_1.Migrator.BeginMigration();
            }
            // TODO make based on foundry version
            const diceIconSelector = '#chat-controls .roll-type-select .fa-dice-d20';
            $(document).on('click', diceIconSelector, () => ShadowrunRoller_1.ShadowrunRoller.promptRoll());
            const diceIconSelectorNew = '#chat-controls .chat-control-icon .fa-dice-d20';
            $(document).on('click', diceIconSelectorNew, () => ShadowrunRoller_1.ShadowrunRoller.promptRoll());
        });
    }
    static canvasInit() {
        canvas.grid.diagonalRule = game.settings.get(constants_1.SYSTEM_NAME, 'diagonalMovement');
        //@ts-ignore
        // SquareGrid isn't typed.
        SquareGrid.prototype.measureDistances = canvas_1.measureDistance;
    }
    static hotbarDrop(bar, data, slot) {
        if (data.type === 'Item') {
            // Promise can't be honored in this non-async function scope, as it needs to return a boolean.
            macros_1.createItemMacro(data.data, slot);
        }
        return false;
    }
    static renderSceneControls(controls, html) {
        html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
            event.preventDefault();
            new OverwatchScoreTracker_1.OverwatchScoreTracker().render(true);
        });
    }
    static getSceneControlButtons(controls) {
        if (game.user.isGM) {
            const tokenControls = controls.find((c) => c.name === 'token');
            tokenControls.tools.push({
                name: 'overwatch-score-tracker',
                title: 'CONTROLS.SR5.OverwatchScoreTracker',
                icon: 'fas fa-network-wired',
            });
        }
    }
    static readyChatMessage(app, html) {
        chat.addRollListeners(app, html);
    }
}
exports.HooksManager = HooksManager;

},{"./actor/SR5Actor":16,"./actor/SR5ActorSheet":17,"./apps/gmtools/OverwatchScoreTracker":37,"./canvas":41,"./chat":42,"./combat/SR5Combat":43,"./config":44,"./constants":45,"./handlebars/HandlebarManager":49,"./helpers":54,"./item/SR5Item":57,"./item/SR5ItemSheet":59,"./macros":60,"./migrator/Migrator":62,"./rolls/ShadowrunRoller":69,"./settings":70}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatData = void 0;
const helpers_1 = require("../helpers");
exports.ChatData = {
    action: (data, labels, props) => {
        if (data.action) {
            const labelStringList = [];
            if (data.action.skill) {
                labelStringList.push(helpers_1.Helpers.label(data.action.skill));
                labelStringList.push(helpers_1.Helpers.label(data.action.attribute));
            }
            else if (data.action.attribute2) {
                labelStringList.push(helpers_1.Helpers.label(data.action.attribute));
                labelStringList.push(helpers_1.Helpers.label(data.action.attribute2));
            }
            else if (data.action.attribute) {
                labelStringList.push(helpers_1.Helpers.label(data.action.attribute));
            }
            if (data.action.mod) {
                labelStringList.push(`${game.i18n.localize('SR5.ItemMod')} (${data.action.mod})`);
                // TODO when all mods are modlists
                // Object.entries(data.action.mod).forEach(([key, value]) =>
                //     labelStringList.push(`${game.i18n.localize(key)} (${value})`)
                // );
            }
            if (labelStringList.length) {
                labels.roll = labelStringList.join(' + ');
            }
            if (data.action.opposed.type) {
                const { opposed } = data.action;
                if (opposed.type !== 'custom')
                    labels.opposedRoll = `vs. ${helpers_1.Helpers.label(opposed.type)}`;
                else if (opposed.skill)
                    labels.opposedRoll = `vs. ${helpers_1.Helpers.label(opposed.skill)}+${helpers_1.Helpers.label(opposed.attribute)}`;
                else if (opposed.attribute2)
                    labels.opposedRoll = `vs. ${helpers_1.Helpers.label(opposed.attribute)}+${helpers_1.Helpers.label(opposed.attribute2)}`;
                else if (opposed.attribute)
                    labels.opposedRoll = `vs. ${helpers_1.Helpers.label(opposed.attribute)}`;
            }
            // setup action props
            // go in order of "Limit/Accuracy" "Damage" "AP"
            // don't add action type if set to 'varies' or 'none' as that's pretty much useless info
            if (data.action.type !== '' && data.action.type !== 'varies' && data.action.type !== 'none') {
                props.push(`${helpers_1.Helpers.label(data.action.type)} Action`);
            }
            if (data.action.limit.value)
                props.push(`Limit ${data.action.limit.value}`);
            if (data.action.damage.type.value) {
                const { damage } = data.action;
                let damageString = '';
                let elementString = '';
                if (damage.value) {
                    damageString = `DV ${damage.value}${damage.type.value ? damage.type.value.toUpperCase().charAt(0) : ''}`;
                }
                if (damage.element.value) {
                    // if we have a damage value and are electric, follow the convention of (e) after
                    if (damage.value) {
                        if (damage.element.value === 'electricity') {
                            damageString += ' (e)';
                        }
                        else {
                            elementString = helpers_1.Helpers.label(damage.element.value);
                        }
                    }
                    else {
                        elementString = helpers_1.Helpers.label(damage.element.value);
                    }
                }
                if (damageString)
                    props.push(damageString);
                if (elementString)
                    props.push(elementString);
                if (damage.ap && damage.ap.value)
                    props.push(`AP ${damage.ap.value}`);
            }
        }
    },
    sin: (data, labels, props) => {
        props.push(`Rating ${data.technology.rating}`);
        data.licenses.forEach((license) => {
            props.push(`${license.name} R${license.rtg}`);
        });
    },
    contact: (data, labels, props) => {
        props.push(data.type);
        props.push(`${game.i18n.localize('SR5.Connection')} ${data.connection}`);
        props.push(`${game.i18n.localize('SR5.Loyalty')} ${data.loyalty}`);
        if (data.blackmail) {
            props.push(`${game.i18n.localize('SR5.Blackmail')}`);
        }
        if (data.family) {
            props.push(game.i18n.localize('SR5.Family'));
        }
    },
    lifestyle: (data, labels, props) => {
        props.push(helpers_1.Helpers.label(data.type));
        if (data.cost)
            props.push(`¥${data.cost}`);
        if (data.comforts)
            props.push(`Comforts ${data.comforts}`);
        if (data.security)
            props.push(`Security ${data.security}`);
        if (data.neighborhood)
            props.push(`Neighborhood ${data.neighborhood}`);
        if (data.guests)
            props.push(`Guests ${data.guests}`);
    },
    adept_power: (data, labels, props) => {
        exports.ChatData.action(data, labels, props);
        props.push(`PP ${data.pp}`);
        props.push(helpers_1.Helpers.label(data.type));
    },
    armor: (data, labels, props) => {
        if (data.armor) {
            if (data.armor.value)
                props.push(`Armor ${data.armor.mod ? '+' : ''}${data.armor.value}`);
            if (data.armor.acid)
                props.push(`Acid ${data.armor.acid}`);
            if (data.armor.cold)
                props.push(`Cold ${data.armor.cold}`);
            if (data.armor.fire)
                props.push(`Fire ${data.armor.fire}`);
            if (data.armor.electricity)
                props.push(`Electricity ${data.armor.electricity}`);
            if (data.armor.radiation)
                props.push(`Radiation ${data.armor.radiation}`);
        }
    },
    program: (data, labels, props) => {
        props.push(game.i18n.localize(CONFIG.SR5.programTypes[data.type]));
    },
    complex_form: (data, labels, props) => {
        exports.ChatData.action(data, labels, props);
        props.push(helpers_1.Helpers.label(data.target), helpers_1.Helpers.label(data.duration));
        const { fade } = data;
        if (fade > 0)
            props.push(`Fade L+${fade}`);
        else if (fade < 0)
            props.push(`Fade L${fade}`);
        else
            props.push('Fade L');
    },
    cyberware: (data, labels, props) => {
        exports.ChatData.action(data, labels, props);
        exports.ChatData.armor(data, labels, props);
        if (data.essence)
            props.push(`Ess ${data.essence}`);
    },
    device: (data, labels, props) => {
        if (data.technology && data.technology.rating)
            props.push(`Rating ${data.technology.rating}`);
        if (data.category === 'cyberdeck') {
            for (const attN of Object.values(data.atts)) {
                props.push(`${helpers_1.Helpers.label(attN.att)} ${attN.value}`);
            }
        }
    },
    equipment: (data, labels, props) => {
        if (data.technology && data.technology.rating)
            props.push(`Rating ${data.technology.rating}`);
    },
    quality: (data, labels, props) => {
        exports.ChatData.action(data, labels, props);
        props.push(helpers_1.Helpers.label(data.type));
    },
    sprite_power: (data, labels, props) => {
        // add action data
        exports.ChatData.action(data, labels, props);
    },
    critter_power: (data, labels, props) => {
        // power type
        props.push(game.i18n.localize(CONFIG.SR5.critterPower.types[data.powerType]));
        // duration
        props.push(game.i18n.localize(CONFIG.SR5.critterPower.durations[data.duration]));
        // range
        props.push(game.i18n.localize(CONFIG.SR5.critterPower.ranges[data.range]));
        // add action data
        exports.ChatData.action(data, labels, props);
    },
    // add properties for spell data, follow order in book
    spell: (data, labels, props) => {
        // first category and type
        props.push(helpers_1.Helpers.label(data.category), helpers_1.Helpers.label(data.type));
        // add subtype tags
        if (data.category === 'combat') {
            props.push(helpers_1.Helpers.label(data.combat.type));
        }
        else if (data.category === 'health') {
        }
        else if (data.category === 'illusion') {
            props.push(data.illusion.type);
            props.push(data.illusion.sense);
        }
        else if (data.category === 'manipulation') {
            if (data.manipulation.damaging)
                props.push('Damaging');
            if (data.manipulation.mental)
                props.push('Mental');
            if (data.manipulation.environmental)
                props.push('Environmental');
            if (data.manipulation.physical)
                props.push('Physical');
        }
        else if (data.category === 'detection') {
            props.push(data.illusion.type);
            props.push(data.illusion.passive ? 'Passive' : 'Active');
            if (data.illusion.extended)
                props.push('Extended');
        }
        // add range
        props.push(helpers_1.Helpers.label(data.range));
        // add action data
        exports.ChatData.action(data, labels, props);
        // add duration data
        props.push(helpers_1.Helpers.label(data.duration));
        // add drain data
        const { drain } = data;
        if (drain > 0)
            props.push(`Drain F+${drain}`);
        else if (drain < 0)
            props.push(`Drain F${drain}`);
        else
            props.push('Drain F');
        labels.roll = 'Cast';
    },
    weapon: (data, labels, props, item) => {
        var _a, _b, _c;
        exports.ChatData.action(data, labels, props);
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            if (prop.includes('Limit')) {
                props[i] = prop.replace('Limit', 'Accuracy');
            }
        }
        const equippedAmmo = item.getEquippedAmmo();
        if (equippedAmmo && data.ammo && ((_a = data.ammo.current) === null || _a === void 0 ? void 0 : _a.max)) {
            if (equippedAmmo) {
                const { current, spare_clips } = data.ammo;
                if (equippedAmmo.name)
                    props.push(`${equippedAmmo.name} (${current.value}/${current.max})`);
                if (equippedAmmo.data.data.blast.radius)
                    props.push(`${game.i18n.localize('SR5.BlastRadius')} ${equippedAmmo.data.data.blast.radius}m`);
                if (equippedAmmo.data.data.blast.dropoff)
                    props.push(`${game.i18n.localize('SR5.Dropoff')} ${equippedAmmo.data.data.blast.dropoff}/m`);
                if (spare_clips && spare_clips.max)
                    props.push(`${game.i18n.localize('SR5.SpareClips')} (${spare_clips.value}/${spare_clips.max})`);
            }
        }
        if ((_c = (_b = data.technology) === null || _b === void 0 ? void 0 : _b.conceal) === null || _c === void 0 ? void 0 : _c.value) {
            props.push(`${game.i18n.localize('SR5.Conceal')} ${data.technology.conceal.value}`);
        }
        if (data.category === 'range') {
            if (data.range.rc) {
                let rcString = `${game.i18n.localize('SR5.RecoilCompensation')} ${data.range.rc.value}`;
                if (item === null || item === void 0 ? void 0 : item.actor) {
                    rcString += ` (${game.i18n.localize('SR5.Total')} ${item.actor.getRecoilCompensation()})`;
                }
                props.push(rcString);
            }
            if (data.range.modes) {
                const newModes = [];
                const { modes } = data.range;
                if (modes.single_shot)
                    newModes.push('SR5.WeaponModeSingleShotShort');
                if (modes.semi_auto)
                    newModes.push('SR5.WeaponModeSemiAutoShort');
                if (modes.burst_fire)
                    newModes.push('SR5.WeaponModeBurstFireShort');
                if (modes.full_auto)
                    newModes.push('SR5.WeaponModeFullAutoShort');
                props.push(newModes.map((m) => game.i18n.localize(m)).join('/'));
            }
            if (data.range.ranges)
                props.push(Array.from(Object.values(data.range.ranges)).join('/'));
        }
        else if (data.category === 'melee') {
            if (data.melee.reach) {
                const reachString = `${game.i18n.localize('SR5.Reach')} ${data.melee.reach}`;
                // find accuracy in props and insert ourselves after it
                const accIndex = props.findIndex((p) => p.includes('Accuracy'));
                if (accIndex > -1) {
                    props.splice(accIndex + 1, 0, reachString);
                }
                else {
                    props.push(reachString);
                }
            }
        }
        else if (data.category === 'thrown') {
            const { blast } = data.thrown;
            if (blast === null || blast === void 0 ? void 0 : blast.radius)
                props.push(`${game.i18n.localize('SR5.BlastRadius')} ${blast.radius}m`);
            if (blast === null || blast === void 0 ? void 0 : blast.dropoff)
                props.push(`${game.i18n.localize('SR5.Dropoff')} ${blast.dropoff}/m`);
            if (data.thrown.ranges) {
                const mult = data.thrown.ranges.attribute && (item === null || item === void 0 ? void 0 : item.actor) ? item.actor.data.data.attributes[data.thrown.ranges.attribute].value : 1;
                const ranges = [data.thrown.ranges.short, data.thrown.ranges.medium, data.thrown.ranges.long, data.thrown.ranges.extreme];
                props.push(ranges.map((v) => v * mult).join('/'));
            }
        }
        const equippedMods = item.getEquippedMods();
        if (equippedMods) {
            equippedMods.forEach((mod) => {
                props.push(`${mod.name}`);
            });
        }
    },
};

},{"../helpers":54}],57:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5Item = void 0;
const helpers_1 = require("../helpers");
const ShadowrunItemDialog_1 = require("../apps/dialogs/ShadowrunItemDialog");
const ChatData_1 = require("./ChatData");
const ShadowrunRoller_1 = require("../rolls/ShadowrunRoller");
const chat_1 = require("../chat");
const constants_1 = require("../constants");
const SR5ItemDataWrapper_1 = require("./SR5ItemDataWrapper");
const PartsList_1 = require("../parts/PartsList");
class SR5Item extends Item {
    constructor() {
        super(...arguments);
        this.labels = {};
    }
    get wrapper() {
        // we need to cast here to unknown first to make ts happy
        return new SR5ItemDataWrapper_1.SR5ItemDataWrapper(this.data);
    }
    // Flag Functions
    getLastFireMode() {
        return this.getFlag(constants_1.SYSTEM_NAME, 'lastFireMode') || { value: 0 };
    }
    setLastFireMode(fireMode) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setFlag(constants_1.SYSTEM_NAME, 'lastFireMode', fireMode);
        });
    }
    getLastSpellForce() {
        return this.getFlag(constants_1.SYSTEM_NAME, 'lastSpellForce') || { value: 0 };
    }
    setLastSpellForce(force) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setFlag(constants_1.SYSTEM_NAME, 'lastSpellForce', force);
        });
    }
    getLastComplexFormLevel() {
        return this.getFlag(constants_1.SYSTEM_NAME, 'lastComplexFormLevel') || { value: 0 };
    }
    setLastComplexFormLevel(level) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setFlag(constants_1.SYSTEM_NAME, 'lastComplexFormLevel', level);
        });
    }
    getLastFireRangeMod() {
        return this.getFlag(constants_1.SYSTEM_NAME, 'lastFireRange') || { value: 0 };
    }
    setLastFireRangeMod(environmentalMod) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setFlag(constants_1.SYSTEM_NAME, 'lastFireRange', environmentalMod);
        });
    }
    /**
     * Return an Array of the Embedded Item Data
     * TODO properly types this
     */
    getEmbeddedItems() {
        let items = this.getFlag(constants_1.SYSTEM_NAME, 'embeddedItems');
        if (items) {
            // moved this "hotfix" to here so that everywhere that accesses the flag just gets an array -- Shawn
            //TODO: This is a hotfix. Items should either always be
            // stored as an array or always be stored as a object.
            if (!Array.isArray(items)) {
                let newItems = [];
                for (const key of Object.keys(items)) {
                    newItems.push(items[key]);
                }
                return newItems;
            }
            return items;
        }
        return [];
    }
    /**
     * Set the embedded item data
     * @param items
     */
    setEmbeddedItems(items) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear the flag first to remove the previous items - if we don't do this then it doesn't actually "delete" any items
            // await this.unsetFlag(SYSTEM_NAME, 'embeddedItems');
            yield this.setFlag(constants_1.SYSTEM_NAME, 'embeddedItems', items);
        });
    }
    clearEmbeddedItems() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unsetFlag(constants_1.SYSTEM_NAME, 'embeddedItems');
        });
    }
    getLastAttack() {
        return this.getFlag(constants_1.SYSTEM_NAME, 'lastAttack');
    }
    setLastAttack(attack) {
        return __awaiter(this, void 0, void 0, function* () {
            // unset the flag first to clear old data, data can get weird if not done
            yield this.unsetFlag(constants_1.SYSTEM_NAME, 'lastAttack');
            return this.setFlag(constants_1.SYSTEM_NAME, 'lastAttack', attack);
        });
    }
    update(data, options) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const ret = _super.update.call(this, data, options);
            ret.then(() => {
                if (this.actor) {
                    this.actor.render(false);
                }
            });
            return ret;
        });
    }
    get hasOpposedRoll() {
        return !!(this.data.data.action && this.data.data.action.opposed.type);
    }
    get hasRoll() {
        const { action } = this.data.data;
        return !!(action && action.type !== '' && (action.skill || action.attribute));
    }
    get hasTemplate() {
        return this.isAreaOfEffect();
    }
    prepareData() {
        var _a, _b, _c;
        super.prepareData();
        const labels = {};
        const item = this.data;
        if (item.type === 'sin') {
            if (typeof item.data.licenses === 'object') {
                item.data.licenses = Object.values(item.data.licenses);
            }
        }
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();
        const { technology, range, action } = item.data;
        if (technology) {
            if (technology.condition_monitor === undefined) {
                technology.condition_monitor = { value: 0 };
            }
            technology.condition_monitor.max = 8 + Math.ceil(technology.rating / 2);
            if (!technology.conceal)
                technology.conceal = {};
            const concealParts = new PartsList_1.PartsList();
            equippedMods.forEach((mod) => {
                if (mod.data.data.technology.conceal.value) {
                    concealParts.addUniquePart(mod.name, mod.data.data.technology.conceal.value);
                }
            });
            technology.conceal.mod = concealParts.list;
            technology.conceal.value = helpers_1.Helpers.calcTotal(technology.conceal);
        }
        if (action) {
            action.alt_mod = 0;
            action.limit.mod = [];
            action.damage.mod = [];
            action.damage.ap.mod = [];
            action.dice_pool_mod = [];
            // handle overrides from mods
            const limitParts = new PartsList_1.PartsList(action.limit.mod);
            const dpParts = new PartsList_1.PartsList(action.dice_pool_mod);
            equippedMods.forEach((mod) => {
                if (mod.data.data.accuracy) {
                    limitParts.addUniquePart(mod.name, mod.data.data.accuracy);
                }
                if (mod.data.data.dice_pool) {
                    dpParts.addUniquePart(mod.name, mod.data.data.dice_pool);
                }
            });
            if (equippedAmmo) {
                // add mods to damage from ammo
                action.damage.mod = PartsList_1.PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name, equippedAmmo.data.data.damage);
                // add mods to ap from ammo
                action.damage.ap.mod = PartsList_1.PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name, equippedAmmo.data.data.ap);
                // override element
                if (equippedAmmo.data.data.element) {
                    action.damage.element.value = equippedAmmo.data.data.element;
                }
                else {
                    action.damage.element.value = action.damage.element.base;
                }
                // override damage type
                if (equippedAmmo.data.data.damageType) {
                    action.damage.type.value = equippedAmmo.data.data.damageType;
                }
                else {
                    action.damage.type.value = action.damage.type.base;
                }
            }
            else {
                // set value if we don't have item overrides
                action.damage.element.value = action.damage.element.base;
                action.damage.type.value = action.damage.type.base;
            }
            // once all damage mods have been accounted for, sum base and mod to value
            action.damage.value = helpers_1.Helpers.calcTotal(action.damage);
            action.damage.ap.value = helpers_1.Helpers.calcTotal(action.damage.ap);
            action.limit.value = helpers_1.Helpers.calcTotal(action.limit);
            if (this.actor) {
                if (action.damage.attribute) {
                    const { attribute } = action.damage;
                    // TODO convert this in the template
                    action.damage.mod = PartsList_1.PartsList.AddUniquePart(action.damage.mod, game.i18n.localize(CONFIG.SR5.attributes[attribute]), (_a = this.actor.findAttribute(attribute)) === null || _a === void 0 ? void 0 : _a.value);
                    action.damage.value = helpers_1.Helpers.calcTotal(action.damage);
                }
                if (action.limit.attribute) {
                    const { attribute } = action.limit;
                    // TODO convert this in the template
                    action.limit.mod = PartsList_1.PartsList.AddUniquePart(action.limit.mod, game.i18n.localize(CONFIG.SR5.limits[attribute]), (_b = this.actor.findLimit(attribute)) === null || _b === void 0 ? void 0 : _b.value);
                    action.limit.value = helpers_1.Helpers.calcTotal(action.limit);
                }
            }
        }
        if (range) {
            if (range.rc) {
                const rangeParts = new PartsList_1.PartsList();
                equippedMods.forEach((mod) => {
                    if (mod.data.data.rc)
                        rangeParts.addUniquePart(mod.name, mod.data.data.rc);
                    // handle overrides from ammo
                });
                range.rc.mod = rangeParts.list;
                if (range.rc)
                    range.rc.value = helpers_1.Helpers.calcTotal(range.rc);
            }
        }
        if (item.type === 'adept_power') {
            item.data.type = ((_c = item.data.action) === null || _c === void 0 ? void 0 : _c.type) ? 'active' : 'passive';
        }
        this.labels = labels;
        item['properties'] = this.getChatData().properties;
    }
    postCard(event) {
        return __awaiter(this, void 0, void 0, function* () {
            // we won't work if we don't have an actor
            if (!this.actor)
                return;
            const postOnly = (event === null || event === void 0 ? void 0 : event.shiftKey) || !this.hasRoll;
            const post = (bonus = {}) => {
                // if only post, don't roll and post a card version -- otherwise roll
                if (postOnly) {
                    const { token } = this.actor;
                    const attack = this.getAttackData(0);
                    // don't include any hits
                    attack === null || attack === void 0 ? true : delete attack.hits;
                    // generate chat data
                    chat_1.createChatData(Object.assign({ header: {
                            name: this.name,
                            img: this.img,
                        }, testName: this.getRollName(), actor: this.actor, tokenId: token ? `${token.scene._id}.${token.id}` : undefined, description: this.getChatData(), item: this, previewTemplate: this.hasTemplate, attack }, bonus)).then((chatData) => {
                        // create the message
                        return ChatMessage.create(chatData, { displaySheet: false });
                    });
                }
                else {
                    this.rollTest(event);
                }
            };
            // prompt user if needed
            const dialogData = yield ShadowrunItemDialog_1.ShadowrunItemDialog.fromItem(this, event);
            if (dialogData) {
                // keep track of old close function
                const oldClose = dialogData.close;
                // call post() after dialog closes
                dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
                    if (oldClose) {
                        // the oldClose we put on the dialog will return a boolean
                        const ret = (yield oldClose(html));
                        if (!ret)
                            return;
                    }
                    post();
                });
                return new Dialog(dialogData).render(true);
            }
            else {
                post();
            }
        });
    }
    getChatData(htmlOptions) {
        const data = duplicate(this.data.data);
        const { labels } = this;
        if (!data.description)
            data.description = {};
        data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
        const props = [];
        const func = ChatData_1.ChatData[this.data.type];
        if (func)
            func(duplicate(data), labels, props, this);
        data.properties = props.filter((p) => !!p);
        return data;
    }
    getOpposedTestName() {
        var _a, _b;
        let name = '';
        if ((_b = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.opposed) === null || _b === void 0 ? void 0 : _b.type) {
            const { opposed } = this.data.data.action;
            if (opposed.type !== 'custom') {
                name = `${helpers_1.Helpers.label(opposed.type)}`;
            }
            else if (opposed.skill) {
                name = `${helpers_1.Helpers.label(opposed.skill)}+${helpers_1.Helpers.label(opposed.attribute)}`;
            }
            else if (opposed.attribute2) {
                name = `${helpers_1.Helpers.label(opposed.attribute)}+${helpers_1.Helpers.label(opposed.attribute2)}`;
            }
            else if (opposed.attribute) {
                name = `${helpers_1.Helpers.label(opposed.attribute)}`;
            }
        }
        const mod = this.getOpposedTestModifier();
        if (mod)
            name += ` ${mod}`;
        return name;
    }
    getOpposedTestMod() {
        const parts = new PartsList_1.PartsList();
        if (this.hasDefenseTest()) {
            if (this.isAreaOfEffect()) {
                parts.addUniquePart('SR5.Aoe', -2);
            }
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData === null || fireModeData === void 0 ? void 0 : fireModeData.defense) {
                    if (fireModeData.defense !== 'SR5.DuckOrCover') {
                        const fireMode = +fireModeData.defense;
                        parts.addUniquePart('SR5.FireMode', fireMode);
                    }
                }
            }
        }
        return parts;
    }
    getOpposedTestModifier() {
        const testMod = this.getOpposedTestMod();
        const total = testMod.total;
        if (total)
            return `(${total})`;
        else {
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData === null || fireModeData === void 0 ? void 0 : fireModeData.defense) {
                    if (fireModeData.defense === 'SR5.DuckOrCover') {
                        return game.i18n.localize('SR5.DuckOrCover');
                    }
                }
            }
        }
        return '';
    }
    getBlastData() {
        // can only handle spells and grenade right now
        if (this.isSpell() && this.isAreaOfEffect()) {
            // distance on spells is equal to force
            let distance = this.getLastSpellForce().value;
            // extended spells multiply by 10
            if (this.data.data.extended)
                distance *= 10;
            return {
                radius: distance,
                dropoff: 0,
            };
        }
        else if (this.isGrenade()) {
            // use blast radius
            const distance = this.data.data.thrown.blast.radius;
            const dropoff = this.data.data.thrown.blast.dropoff;
            return {
                radius: distance,
                dropoff: dropoff,
            };
        }
        else if (this.hasExplosiveAmmo()) {
            const ammo = this.getEquippedAmmo();
            const distance = ammo.data.data.blast.radius;
            const dropoff = ammo.data.data.blast.dropoff;
            return {
                radius: distance,
                dropoff,
            };
        }
    }
    getEquippedAmmo() {
        return (this.items || []).filter((item) => { var _a, _b; return item.type === 'ammo' && ((_b = (_a = item.data.data) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.equipped); })[0];
    }
    getEquippedMods() {
        return (this.items || []).filter((item) => { var _a, _b; return item.type === 'modification' && item.data.data.type === 'weapon' && ((_b = (_a = item.data.data) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.equipped); });
    }
    hasExplosiveAmmo() {
        var _a, _b, _c;
        const ammo = this.getEquippedAmmo();
        return ((_c = (_b = (_a = ammo === null || ammo === void 0 ? void 0 : ammo.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.blast) === null || _c === void 0 ? void 0 : _c.radius) > 0;
    }
    equipWeaponMod(iid) {
        return __awaiter(this, void 0, void 0, function* () {
            const mod = this.getOwnedItem(iid);
            if (mod) {
                const dupData = duplicate(mod.data);
                dupData.data.technology.equipped = !dupData.data.technology.equipped;
                yield this.updateOwnedItem(dupData);
            }
        });
    }
    get hasAmmo() {
        return this.data.data.ammo !== undefined;
    }
    useAmmo(fireMode) {
        return __awaiter(this, void 0, void 0, function* () {
            const dupData = duplicate(this.data);
            const { ammo } = dupData.data;
            if (ammo) {
                ammo.current.value = Math.max(0, ammo.current.value - fireMode);
                return this.update(dupData);
            }
        });
    }
    reloadAmmo() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = duplicate(this.data);
            const { ammo } = data.data;
            const diff = ammo.current.max - ammo.current.value;
            ammo.current.value = ammo.current.max;
            if (ammo.spare_clips) {
                ammo.spare_clips.value = Math.max(0, ammo.spare_clips.value - 1);
            }
            yield this.update(data);
            const newAmmunition = (this.items || [])
                .filter((i) => i.data.type === 'ammo')
                .reduce((acc, item) => {
                const { technology } = item.data.data;
                if (technology.equipped) {
                    const qty = technology.quantity;
                    technology.quantity = Math.max(0, qty - diff);
                    acc.push(item.data);
                }
                return acc;
            }, []);
            if (newAmmunition.length)
                yield this.updateOwnedItem(newAmmunition);
        });
    }
    equipAmmo(iid) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // only allow ammo that was just clicked to be equipped
            const ammo = (_a = this.items) === null || _a === void 0 ? void 0 : _a.filter((item) => item.type === 'ammo').map((item) => {
                const i = this.getOwnedItem(item._id);
                if (i) {
                    i.data.data.technology.equipped = iid === item._id;
                    return i.data;
                }
            });
            yield this.updateOwnedItem(ammo);
        });
    }
    addNewLicense() {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        if (typeof licenses === 'object') {
            data.data.licenses = Object.values(licenses);
        }
        data.data.licenses.push({
            name: '',
            rtg: '',
            description: '',
        });
        this.update(data);
    }
    getRollPartsList() {
        // we only have a roll if we have an action or an actor
        if (!this.data.data.action || !this.actor)
            return [];
        const parts = new PartsList_1.PartsList(duplicate(this.getModifierList()));
        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());
        if (attribute && attribute.label)
            parts.addPart(attribute.label, attribute.value);
        // if we have a valid skill, don't look for a second attribute
        if (skill && skill.label) {
            parts.addUniquePart(skill.label, skill.value);
            if (skill.value === 0) {
                parts.addUniquePart('SR5.Defaulting', -1);
            }
        }
        else if (attribute2 && attribute2.label)
            parts.addUniquePart(attribute2.label, attribute2.value);
        const spec = this.getActionSpecialization();
        if (spec)
            parts.addUniquePart(spec, 2);
        const mod = parseInt(this.data.data.action.mod || 0);
        if (mod)
            parts.addUniquePart('SR5.ItemMod', mod);
        const atts = [];
        if (attribute !== undefined)
            atts.push(attribute);
        if (attribute2 !== undefined)
            atts.push(attribute2);
        if (skill !== undefined)
            atts.push(skill);
        // add global parts from actor
        this.actor._addGlobalParts(parts);
        this.actor._addMatrixParts(parts, atts);
        this._addWeaponParts(parts);
        return parts.list;
    }
    calculateRecoil() {
        var _a;
        const lastFireMode = this.getLastFireMode();
        if (!lastFireMode)
            return 0;
        if (lastFireMode.value === 20)
            return 0;
        return Math.min(this.getRecoilCompensation(true) - (((_a = this.getLastFireMode()) === null || _a === void 0 ? void 0 : _a.value) || 0), 0);
    }
    _addWeaponParts(parts) {
        if (this.isRangedWeapon()) {
            const recoil = this.calculateRecoil();
            if (recoil)
                parts.addUniquePart('SR5.Recoil', recoil);
        }
    }
    removeLicense(index) {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        licenses.splice(index, 1);
        this.update(data);
    }
    rollOpposedTest(target, ev) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const itemData = this.data.data;
            const options = {
                event: ev,
                fireModeDefense: 0,
                cover: false,
            };
            const lastAttack = this.getLastAttack();
            const parts = this.getOpposedTestMod();
            const { opposed } = itemData.action;
            if (opposed.type === 'defense') {
                if (lastAttack) {
                    options['incomingAttack'] = lastAttack;
                    options.cover = true;
                    if ((_a = lastAttack.fireMode) === null || _a === void 0 ? void 0 : _a.defense) {
                        options.fireModeDefense = +lastAttack.fireMode.defense;
                    }
                }
                return target.rollDefense(options, parts.list);
            }
            else if (opposed.type === 'soak') {
                options['damage'] = lastAttack === null || lastAttack === void 0 ? void 0 : lastAttack.damage;
                options['attackerHits'] = lastAttack === null || lastAttack === void 0 ? void 0 : lastAttack.hits;
                return target.rollSoak(options, parts.list);
            }
            else if (opposed.type === 'armor') {
                return target.rollArmor(options);
            }
            else {
                if (opposed.skill && opposed.attribute) {
                    return target.rollSkill(opposed.skill, Object.assign(Object.assign({}, options), { attribute: opposed.attribute }));
                }
                else if (opposed.attribute && opposed.attribute2) {
                    return target.rollTwoAttributes([opposed.attribute, opposed.attribute2], options);
                }
                else if (opposed.attribute) {
                    return target.rollSingleAttribute(opposed.attribute, options);
                }
            }
        });
    }
    rollExtraTest(type, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const targets = SR5Item.getTargets();
            if (type === 'opposed') {
                for (const t of targets) {
                    yield this.rollOpposedTest(t, event);
                }
            }
        });
    }
    /**
     * Rolls a test using the latest stored data on the item (force, fireMode, level)
     * @param event - mouse event
     * @param options - any additional roll options to pass along - note that currently the Item will overwrite -- WIP
     */
    rollTest(event, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = ShadowrunRoller_1.ShadowrunRoller.itemRoll(event, this, options);
            // handle promise when it resolves for our own stuff
            promise.then((roll) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const attackData = this.getAttackData((_a = roll === null || roll === void 0 ? void 0 : roll.total) !== null && _a !== void 0 ? _a : 0);
                if (attackData) {
                    yield this.setLastAttack(attackData);
                }
                // complex form handles fade
                if (this.isComplexForm()) {
                    const totalFade = Math.max(this.getFade() + this.getLastComplexFormLevel().value, 2);
                    yield this.actor.rollFade({ event }, totalFade);
                } // spells handle drain, force, and attack data
                else if (this.isSpell()) {
                    if (this.isCombatSpell() && roll) {
                    }
                    const forceData = this.getLastSpellForce();
                    const drain = Math.max(this.getDrain() + forceData.value + (forceData.reckless ? 3 : 0), 2);
                    yield ((_b = this.actor) === null || _b === void 0 ? void 0 : _b.rollDrain({ event }, drain));
                } // weapons handle ammo and attack data
                else if (this.data.type === 'weapon') {
                    if (this.hasAmmo) {
                        const fireMode = ((_c = this.getLastFireMode()) === null || _c === void 0 ? void 0 : _c.value) || 1;
                        yield this.useAmmo(fireMode);
                    }
                }
            }));
            return promise;
        });
    }
    static getItemFromMessage(html) {
        const card = html.find('.chat-card');
        let actor;
        const tokenKey = card.data('tokenId');
        if (tokenKey) {
            const [sceneId, tokenId] = tokenKey.split('.');
            let token;
            if (sceneId === (canvas === null || canvas === void 0 ? void 0 : canvas.scene._id))
                token = canvas.tokens.get(tokenId);
            else {
                const scene = game.scenes.get(sceneId);
                if (!scene)
                    return;
                // @ts-ignore
                const tokenData = scene.data.tokens.find((t) => t.id === Number(tokenId));
                if (tokenData)
                    token = new Token(tokenData);
            }
            if (!token)
                return;
            actor = Actor.fromToken(token);
        }
        else
            actor = game.actors.get(card.data('actorId'));
        if (!actor)
            return;
        const itemId = card.data('itemId');
        return actor.getOwnedItem(itemId);
    }
    static getTargets() {
        const { character } = game.user;
        const { controlled } = canvas.tokens;
        const targets = controlled.reduce((arr, t) => (t.actor ? arr.concat([t.actor]) : arr), []);
        if (character && controlled.length === 0)
            targets.push(character);
        if (!targets.length)
            throw new Error(`You must designate a specific Token as the roll target`);
        return targets;
    }
    /**
     * Create an item in this item
     * @param itemData
     * @param options
     */
    createOwnedItem(itemData, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(itemData))
                itemData = [itemData];
            // weapons accept items
            if (this.type === 'weapon') {
                const currentItems = duplicate(this.getEmbeddedItems());
                itemData.forEach((ogItem) => {
                    var _a, _b;
                    const item = duplicate(ogItem);
                    item._id = randomID(16);
                    if (item.type === 'ammo' || item.type === 'modification') {
                        if ((_b = (_a = item === null || item === void 0 ? void 0 : item.data) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.equipped) {
                            item.data.technology.equipped = false;
                        }
                        currentItems.push(item);
                    }
                });
                yield this.setEmbeddedItems(currentItems);
            }
            yield this.prepareEmbeddedEntities();
            yield this.prepareData();
            yield this.render(false);
            return true;
        });
    }
    /**
     * Prepare embeddedItems
     */
    prepareEmbeddedEntities() {
        super.prepareEmbeddedEntities();
        let items = this.getEmbeddedItems();
        if (items) {
            const existing = (this.items || []).reduce((object, i) => {
                object[i.id] = i;
                return object;
            }, {});
            this.items = items.map((i) => {
                if (i._id in existing) {
                    const a = existing[i._id];
                    a.data = i;
                    a.prepareData();
                    return a;
                }
                else {
                    // dirty things done here
                    // @ts-ignore
                    return Item.createOwned(i, this);
                }
            });
        }
    }
    getOwnedItem(itemId) {
        const items = this.items;
        if (!items)
            return;
        return items.find((i) => i._id === itemId);
    }
    updateOwnedItem(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = duplicate(this.getEmbeddedItems());
            if (!items)
                return;
            changes = Array.isArray(changes) ? changes : [changes];
            if (!changes || changes.length === 0)
                return;
            changes.forEach((itemChanges) => {
                const index = items.findIndex((i) => i._id === itemChanges._id);
                if (index === -1)
                    return;
                const item = items[index];
                if (item) {
                    itemChanges = expandObject(itemChanges);
                    mergeObject(item, itemChanges);
                    items[index] = item;
                    // this.items[index].data = items[index];
                }
            });
            yield this.setEmbeddedItems(items);
            yield this.prepareEmbeddedEntities();
            yield this.prepareData();
            yield this.render(false);
            return true;
        });
    }
    updateEmbeddedEntity(embeddedName, updateData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateOwnedItem(updateData);
            return this;
        });
    }
    /**
     * Remove an owned item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    deleteOwnedItem(deleted) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = duplicate(this.getEmbeddedItems());
            if (!items)
                return;
            const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
            if (idx === -1)
                throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
            items.splice(idx, 1);
            // we need to clear the items when one is deleted or it won't actually be deleted
            yield this.clearEmbeddedItems();
            yield this.setEmbeddedItems(items);
            yield this.prepareEmbeddedEntities();
            yield this.prepareData();
            yield this.render(false);
            return true;
        });
    }
    openPdfSource() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for PDFoundry module hook: https://github.com/Djphoenix719/PDFoundry
            if (!ui['PDFoundry']) {
                ui.notifications.warn(game.i18n.localize('SR5.DIALOG.MissingModuleContent'));
                return;
            }
            const source = this.getBookSource();
            if (source === '') {
                // @ts-ignore
                ui.notifications.error(game.i18n.localize('SR5.SourceFieldEmptyError'));
            }
            // TODO open PDF to correct location
            // parse however you need, all "buttons" will lead to this function
            const [code, page] = source.split(' ');
            //@ts-ignore
            ui.PDFoundry.openPDFByCode(code, { page: parseInt(page) });
        });
    }
    getAttackData(hits) {
        var _a;
        if (!((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.damage.type))
            return undefined;
        const damage = this.data.data.action.damage;
        const data = {
            hits,
            damage: damage,
        };
        if (this.isCombatSpell()) {
            const force = this.getLastSpellForce().value;
            const damageParts = new PartsList_1.PartsList(data.damage.mod);
            data.force = force;
            data.damage.base = force;
            data.damage.value = force + damageParts.total;
            data.damage.ap.value = -force + damageParts.total;
            data.damage.ap.base = -force;
        }
        if (this.isComplexForm()) {
            data.level = this.getLastComplexFormLevel().value;
        }
        if (this.isMeleeWeapon()) {
            data.reach = this.getReach();
            data.accuracy = this.getActionLimit();
        }
        if (this.isRangedWeapon()) {
            data.fireMode = this.getLastFireMode();
            data.accuracy = this.getActionLimit();
        }
        const blastData = this.getBlastData();
        if (blastData)
            data.blast = blastData;
        return data;
    }
    getRollName() {
        if (this.isRangedWeapon()) {
            return game.i18n.localize('SR5.RangeWeaponAttack');
        }
        if (this.isMeleeWeapon()) {
            return game.i18n.localize('SR5.MeleeWeaponAttack');
        }
        if (this.isCombatSpell()) {
            return game.i18n.localize('SR5.SpellAttack');
        }
        if (this.isSpell()) {
            return game.i18n.localize('SR5.SpellCast');
        }
        if (this.hasRoll)
            return this.name;
        return undefined;
    }
    getLimit() {
        var _a;
        const limit = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.limit;
        if (!limit)
            return undefined;
        if (this.data.type === 'weapon') {
            limit.label = 'SR5.Accuracy';
        }
        else if (limit === null || limit === void 0 ? void 0 : limit.attribute) {
            limit.label = CONFIG.SR5.attributes[limit.attribute];
        }
        else if (this.isSpell()) {
            limit.value = this.getLastSpellForce().value;
            limit.label = 'SR5.Force';
        }
        else if (this.isComplexForm()) {
            limit.value = this.getLastComplexFormLevel().value;
            limit.label = 'SR5.Level';
        }
        else {
            limit.label = 'SR5.Limit';
        }
        return limit;
    }
    /**
     * Override setFlag to remove the 'SR5.' from keys in modlists, otherwise it handles them as embedded keys
     * @param scope
     * @param key
     * @param value
     */
    setFlag(scope, key, value) {
        const newValue = helpers_1.Helpers.onSetFlag(value);
        return super.setFlag(scope, key, newValue);
    }
    /**
     * Override getFlag to add back the 'SR5.' keys correctly to be handled
     * @param scope
     * @param key
     */
    getFlag(scope, key) {
        const data = super.getFlag(scope, key);
        return helpers_1.Helpers.onGetFlag(data);
    }
    /**
     * Passthrough functions
     */
    isAreaOfEffect() {
        return this.wrapper.isAreaOfEffect();
    }
    isArmor() {
        return this.wrapper.isArmor();
    }
    hasArmorBase() {
        return this.wrapper.hasArmorBase();
    }
    hasArmorAccessory() {
        return this.wrapper.hasArmorAccessory();
    }
    hasArmor() {
        return this.wrapper.hasArmor();
    }
    isGrenade() {
        return this.wrapper.isGrenade();
    }
    isWeapon() {
        return this.wrapper.isWeapon();
    }
    isCyberware() {
        return this.wrapper.isCyberware();
    }
    isCombatSpell() {
        return this.wrapper.isCombatSpell();
    }
    isRangedWeapon() {
        return this.wrapper.isRangedWeapon();
    }
    isSpell() {
        return this.wrapper.isSpell();
    }
    isComplexForm() {
        return this.wrapper.isComplexForm();
    }
    isMeleeWeapon() {
        return this.wrapper.isMeleeWeapon();
    }
    isDevice() {
        return this.wrapper.isDevice();
    }
    isEquipped() {
        return this.wrapper.isEquipped();
    }
    isCyberdeck() {
        return this.wrapper.isCyberdeck();
    }
    getBookSource() {
        return this.wrapper.getBookSource();
    }
    getConditionMonitor() {
        return this.wrapper.getConditionMonitor();
    }
    getRating() {
        return this.wrapper.getRating();
    }
    getArmorValue() {
        return this.wrapper.getArmorValue();
    }
    getArmorElements() {
        return this.wrapper.getArmorElements();
    }
    getEssenceLoss() {
        return this.wrapper.getEssenceLoss();
    }
    getASDF() {
        return this.wrapper.getASDF();
    }
    getActionSkill() {
        return this.wrapper.getActionSkill();
    }
    getActionAttribute() {
        return this.wrapper.getActionAttribute();
    }
    getActionAttribute2() {
        return this.wrapper.getActionAttribute2();
    }
    getActionLimit() {
        return this.wrapper.getActionLimit();
    }
    getModifierList() {
        return this.wrapper.getModifierList();
    }
    getActionSpecialization() {
        return this.wrapper.getActionSpecialization();
    }
    getDrain() {
        return this.wrapper.getDrain();
    }
    getFade() {
        return this.wrapper.getFade();
    }
    getRecoilCompensation(includeActor = true) {
        let rc = this.wrapper.getRecoilCompensation();
        if (includeActor && this.actor) {
            rc += this.actor.getRecoilCompensation();
        }
        return rc;
    }
    getReach() {
        var _a, _b;
        if (this.isMeleeWeapon()) {
            return (_b = (_a = this.data.data.melee) === null || _a === void 0 ? void 0 : _a.reach) !== null && _b !== void 0 ? _b : 0;
        }
        return 0;
    }
    hasDefenseTest() {
        var _a, _b;
        return ((_b = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.opposed) === null || _b === void 0 ? void 0 : _b.type) === 'defense';
    }
}
exports.SR5Item = SR5Item;

},{"../apps/dialogs/ShadowrunItemDialog":36,"../chat":42,"../constants":45,"../helpers":54,"../parts/PartsList":68,"../rolls/ShadowrunRoller":69,"./ChatData":56,"./SR5ItemDataWrapper":58}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5ItemDataWrapper = void 0;
const DataWrapper_1 = require("../dataWrappers/DataWrapper");
class SR5ItemDataWrapper extends DataWrapper_1.DataWrapper {
    getData() {
        return this.data.data;
    }
    isAreaOfEffect() {
        // TODO figure out how to detect explosive ammo
        return this.isGrenade() || (this.isSpell() && this.data.data.range === 'los_a'); //|| this.hasExplosiveAmmo();
    }
    isArmor() {
        return this.data.type === 'armor';
    }
    hasArmorBase() {
        var _a;
        return this.hasArmor() && !((_a = this.data.data.armor) === null || _a === void 0 ? void 0 : _a.mod);
    }
    hasArmorAccessory() {
        var _a, _b;
        return this.hasArmor() && ((_b = (_a = this.data.data.armor) === null || _a === void 0 ? void 0 : _a.mod) !== null && _b !== void 0 ? _b : false);
    }
    hasArmor() {
        return this.getArmorValue() > 0;
    }
    isGrenade() {
        var _a, _b;
        return this.isThrownWeapon() && ((_b = (_a = this.data.data.thrown) === null || _a === void 0 ? void 0 : _a.blast.radius) !== null && _b !== void 0 ? _b : 0) > 0;
    }
    isThrownWeapon() {
        return this.isWeapon() && this.data.data.category === 'thrown';
    }
    isWeapon() {
        return this.data.type === 'weapon';
    }
    isCyberware() {
        return this.data.type === 'cyberware';
    }
    isCombatSpell() {
        return this.isSpell() && this.data.data.category === 'combat';
    }
    isRangedWeapon() {
        return this.isWeapon() && this.data.data.category === 'range';
    }
    isSpell() {
        return this.data.type === 'spell';
    }
    isComplexForm() {
        return this.data.type === 'complex_form';
    }
    isMeleeWeapon() {
        return this.data.type === 'weapon' && this.data.data.category === 'melee';
    }
    isDevice() {
        return this.data.type === 'device';
    }
    isEquipped() {
        var _a;
        return ((_a = this.data.data.technology) === null || _a === void 0 ? void 0 : _a.equipped) || false;
    }
    isCyberdeck() {
        return this.isDevice() && this.data.data.category === 'cyberdeck';
    }
    getId() {
        return this.data._id;
    }
    getBookSource() {
        return this.data.data.description.source;
    }
    getConditionMonitor() {
        var _a, _b;
        return (_b = (_a = this.data.data.technology) === null || _a === void 0 ? void 0 : _a.condition_monitor) !== null && _b !== void 0 ? _b : { value: 0, max: 0, label: '' };
    }
    getRating() {
        var _a;
        return ((_a = this.data.data.technology) === null || _a === void 0 ? void 0 : _a.rating) || 0;
    }
    getArmorValue() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.data.data) === null || _a === void 0 ? void 0 : _a.armor) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 0;
    }
    getArmorElements() {
        // TODO clean this up
        const { fire, electricity, cold, acid } = this.data.data.armor || {};
        return { fire: fire !== null && fire !== void 0 ? fire : 0, electricity: electricity !== null && electricity !== void 0 ? electricity : 0, cold: cold !== null && cold !== void 0 ? cold : 0, acid: acid !== null && acid !== void 0 ? acid : 0 };
    }
    getName() {
        return this.data.name;
    }
    getEssenceLoss() {
        var _a, _b;
        return (_b = (_a = this.data.data) === null || _a === void 0 ? void 0 : _a.essence) !== null && _b !== void 0 ? _b : 0;
    }
    getAmmo() {
        return this.data.data.ammo;
    }
    getASDF() {
        if (!this.isDevice())
            return undefined;
        // matrix attributes are set up as an object
        const matrix = {
            attack: {
                value: 0,
                device_att: '',
            },
            sleaze: {
                value: 0,
                device_att: '',
            },
            data_processing: {
                value: this.getRating(),
                device_att: '',
            },
            firewall: {
                value: this.getRating(),
                device_att: '',
            },
        };
        if (this.isCyberdeck()) {
            /**
             * {
             *     attN: {
             *         value: number,
             *         att: string (the ASDF attribute)
             *     }
             * }
             */
            const atts = this.data.data.atts;
            if (atts) {
                for (let [key, att] of Object.entries(atts)) {
                    matrix[att.att].value = att.value;
                    matrix[att.att].device_att = key;
                }
            }
        }
        return matrix;
    }
    getQuantity() {
        var _a, _b;
        return ((_b = (_a = this.data.data) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.quantity) || 1;
    }
    getActionDicePoolMod() {
        var _a;
        return (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.mod;
    }
    getLimitAttribute() {
        var _a, _b;
        return (_b = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.limit) === null || _b === void 0 ? void 0 : _b.attribute;
    }
    getActionSkill() {
        var _a;
        return (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.skill;
    }
    getActionAttribute() {
        var _a;
        return (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.attribute;
    }
    getActionAttribute2() {
        var _a;
        return (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.attribute2;
    }
    getActionLimit() {
        var _a, _b;
        return (_b = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.limit) === null || _b === void 0 ? void 0 : _b.value;
    }
    getModifierList() {
        var _a;
        return ((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.dice_pool_mod) || [];
    }
    getActionSpecialization() {
        var _a;
        if ((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.spec)
            return 'SR5.Specialization';
        return undefined;
    }
    getDrain() {
        return this.data.data.drain || 0;
    }
    getFade() {
        return this.data.data.fade || 0;
    }
    getRecoilCompensation() {
        var _a, _b, _c;
        if (!this.isRangedWeapon())
            return 0;
        const base = (_c = (_b = (_a = this.data.data) === null || _a === void 0 ? void 0 : _a.range) === null || _b === void 0 ? void 0 : _b.rc.value) !== null && _c !== void 0 ? _c : '0';
        return Number(base);
    }
    getReach() {
        var _a, _b;
        if (this.isMeleeWeapon()) {
            return (_b = (_a = this.data.data.melee) === null || _a === void 0 ? void 0 : _a.reach) !== null && _b !== void 0 ? _b : 0;
        }
        return 0;
    }
    hasDefenseTest() {
        var _a, _b;
        return ((_b = (_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.opposed) === null || _b === void 0 ? void 0 : _b.type) === 'defense';
    }
}
exports.SR5ItemDataWrapper = SR5ItemDataWrapper;

},{"../dataWrappers/DataWrapper":47}],59:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5ItemSheet = void 0;
const helpers_1 = require("../helpers");
/**
 * Extend the basic ItemSheet with some very simple modifications
 */
class SR5ItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
        this._shownDesc = [];
    }
    getEmbeddedItems() {
        return this.item.items || [];
    }
    /**
     * Extend and override the default options used by the Simple Item Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'item'],
            width: 650,
            height: 450,
            tabs: [{ navSelector: '.tabs', contentSelector: '.sheetbody' }],
        });
    }
    get template() {
        const path = 'systems/shadowrun5e/dist/templates/item/';
        return `${path}${this.item.data.type}.html`;
    }
    /* -------------------------------------------- */
    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data = super.getData();
        const itemData = data.data;
        if (itemData.action) {
            try {
                const { action } = itemData;
                if (action.mod === 0)
                    delete action.mod;
                if (action.limit === 0)
                    delete action.limit;
                if (action.damage) {
                    if (action.damage.mod === 0)
                        delete action.damage.mod;
                    if (action.damage.ap.mod === 0)
                        delete action.damage.ap.mod;
                }
                if (action.limit) {
                    if (action.limit.mod === 0)
                        delete action.limit.mod;
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        if (itemData.technology) {
            try {
                const tech = itemData.technology;
                if (tech.rating === 0)
                    delete tech.rating;
                if (tech.quantity === 0)
                    delete tech.quantity;
                if (tech.cost === 0)
                    delete tech.cost;
            }
            catch (e) {
                console.log(e);
            }
        }
        data['config'] = CONFIG.SR5;
        const items = this.getEmbeddedItems();
        const [ammunition, weaponMods, armorMods] = items.reduce((parts, item) => {
            if (item.type === 'ammo')
                parts[0].push(item.data);
            if (item.type === 'modification' && item.data.data.type === 'weapon')
                parts[1].push(item.data);
            if (item.type === 'modification' && item.data.data.type === 'armor')
                parts[2].push(item.data);
            return parts;
        }, [[], [], []]);
        data['ammunition'] = ammunition;
        data['weaponMods'] = weaponMods;
        data['armorMods'] = armorMods;
        // TODO set to the proper boolean for if the source PDF can be accessed
        // I'm thinking maybe check for the mod being installed?
        data['hasSourcePdfAvailable'] = true;
        return data;
    }
    /* -------------------------------------------- */
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        if (this.item.type === 'weapon') {
            this.form.ondragover = (event) => this._onDragOver(event);
            this.form.ondrop = (event) => this._onDrop(event);
        }
        html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
        html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
        html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
        html.find('.ammo-reload').click(this._onAmmoReload.bind(this));
        html.find('.edit-item').click(this._onEditItem.bind(this));
        html.find('.add-new-mod').click(this._onAddWeaponMod.bind(this));
        html.find('.mod-equip').click(this._onWeaponModEquip.bind(this));
        html.find('.mod-delete').click(this._onWeaponModRemove.bind(this));
        html.find('.add-new-license').click(this._onAddLicense.bind(this));
        html.find('.license-delete').on('click', this._onRemoveLicense.bind(this));
        html.find('.open-source-pdf').on('click', this._onOpenSourcePdf.bind(this));
        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.list-item');
            const iid = $(item).data().item;
            const field = item.next();
            field.toggle();
            if (iid) {
                if (field.is(':visible'))
                    this._shownDesc.push(iid);
                else
                    this._shownDesc = this._shownDesc.filter((val) => val !== iid);
            }
        });
        html.find('.hidden').hide();
    }
    _onDragOver(event) {
        event.preventDefault();
        return false;
    }
    _onDrop(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            let data;
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
                if (data.type !== 'Item') {
                    console.log('Shadowrun5e | Can only drop Items');
                }
            }
            catch (err) {
                console.log('Shadowrun5e | drop error');
            }
            let item;
            // Case 1 - Data explicitly provided
            if (data.data) {
                // TODO test
                if (this.item.isOwned && data.actorId === ((_a = this.item.actor) === null || _a === void 0 ? void 0 : _a._id) && data.data._id === this.item._id) {
                    console.log('Shadowrun5e | Cant drop item on itself');
                    // @ts-ignore
                    ui.notifications.error('Are you trying to break the game??');
                }
                item = data;
            }
            else if (data.pack) {
                console.log(data);
                // Case 2 - From a Compendium Pack
                // TODO test
                item = yield this._getItemFromCollection(data.pack, data.id);
            }
            else {
                // Case 3 - From a World Entity
                item = game.items.get(data.id);
            }
            this.item.createOwnedItem(item.data);
        });
    }
    _getItemFromCollection(collection, itemId) {
        const pack = game.packs.find((p) => p.collection === collection);
        return pack.getEntity(itemId);
    }
    _eventId(event) {
        event.preventDefault();
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }
    _onOpenSourcePdf(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            yield this.item.openPdfSource();
        });
    }
    _onEditItem(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.item.getOwnedItem(this._eventId(event));
            if (item) {
                item.sheet.render(true);
            }
        });
    }
    _onAddLicense(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.item.addNewLicense();
        });
    }
    _onRemoveLicense(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const index = event.currentTarget.dataset.index;
            if (index >= 0)
                this.item.removeLicense(index);
        });
    }
    _onWeaponModRemove(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.item.deleteOwnedItem(this._eventId(event));
        });
    }
    _onWeaponModEquip(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.item.equipWeaponMod(this._eventId(event));
        });
    }
    _onAddWeaponMod(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const type = 'modification';
            const itemData = {
                name: `New ${helpers_1.Helpers.label(type)}`,
                type: type,
                data: duplicate(game.system.model.Item.modification),
            };
            itemData.data.type = 'weapon';
            // @ts-ignore
            const item = Item.createOwned(itemData, this.item);
            this.item.createOwnedItem(item.data);
        });
    }
    _onAmmoReload(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.item.reloadAmmo();
        });
    }
    _onAmmoRemove(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.item.deleteOwnedItem(this._eventId(event));
        });
    }
    _onAmmoEquip(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.item.equipAmmo(this._eventId(event));
        });
    }
    _onAddNewAmmo(event) {
        event.preventDefault();
        const type = 'ammo';
        const itemData = {
            name: `New ${helpers_1.Helpers.label(type)}`,
            type: type,
            data: duplicate(game.system.model.Item.ammo),
        };
        // @ts-ignore
        const item = Item.createOwned(itemData, this.item);
        this.item.createOwnedItem(item.data);
    }
    /**
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }
    /** This is needed to circumvent Application.close setting closed state early, due to it's async animation
     * - The length of the closing animation can't be longer then any await time in the closing cycle
     * - FormApplication._onSubmit will otherwise set ._state to RENDERED even if the Application window has closed already
     * - Subsequent render calls then will show the window again, due to it's state
     *
     * @private
     */
    fixStaleRenderedState() {
        if (this._state === Application.RENDER_STATES.RENDERED && ui.windows[this.appId] === undefined) {
            console.warn(`SR5ItemSheet app for ${this.entity.name} is set as RENDERED but has no window registered. Fixing app internal render state. This is a known bug.`);
            // Hotfixing instead of this.close() since FormApplication.close() expects form elements, which don't exist anymore.
            this._state = Application.RENDER_STATES.CLOSED;
        }
    }
    /**
     * @private
     */
    _render(force = false, options = {}) {
        const _super = Object.create(null, {
            _render: { get: () => super._render }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // NOTE: This is for a timing bug. See function doc for code removal. Good luck, there be dragons here. - taM
            this.fixStaleRenderedState();
            this._saveScrollPositions();
            yield _super._render.call(this, force, options);
            this._restoreScrollPositions();
        });
    }
    /**
     * @private
     */
    _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }
    /**
     * @private
     */
    _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }
}
exports.SR5ItemSheet = SR5ItemSheet;

},{"../helpers":54}],60:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollItemMacro = exports.createItemMacro = void 0;
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} item     The item data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
function createItemMacro(item, slot) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
        let macro = game.macros.entities.find((m) => m.name === item.name);
        if (!macro) {
            macro = (yield Macro.create({
                name: item.name,
                type: 'script',
                img: item.img,
                command: command,
                flags: { 'shadowrun5e.itemMacro': true },
            }, { displaySheet: false }));
        }
        if (macro)
            game.user.assignHotbarMacro(macro, slot);
    });
}
exports.createItemMacro = createItemMacro;
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token)
        actor = game.actors.tokens[speaker.token];
    if (!actor)
        actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
    if (!item) {
        // @ts-ignore
        return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);
    }
    return item.postCard();
}
exports.rollItemMacro = rollItemMacro;

},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlebarManager_1 = require("./handlebars/HandlebarManager");
const hooks_1 = require("./hooks");
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
hooks_1.HooksManager.registerHooks();
HandlebarManager_1.HandlebarManager.registerHelpers();

},{"./handlebars/HandlebarManager":49,"./hooks":55}],62:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrator = void 0;
const VersionMigration_1 = require("./VersionMigration");
const LegacyMigration_1 = require("./versions/LegacyMigration");
const Version0_6_5_1 = require("./versions/Version0_6_5");
const Version0_6_10_1 = require("./versions/Version0_6_10");
const Version0_7_2_1 = require("./versions/Version0_7_2");
class Migrator {
    //TODO: Call on Init()
    static BeginMigration() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentVersion = game.settings.get(VersionMigration_1.VersionMigration.MODULE_NAME, VersionMigration_1.VersionMigration.KEY_DATA_VERSION);
            if (currentVersion === undefined || currentVersion === null) {
                currentVersion = VersionMigration_1.VersionMigration.NO_VERSION;
            }
            const migrations = Migrator.s_Versions.filter(({ versionNumber }) => {
                // if versionNUmber is greater than currentVersion, we need to apply this migration
                return this.compareVersion(versionNumber, currentVersion) === 1;
            });
            // No migrations are required, exit.
            if (migrations.length === 0) {
                return;
            }
            const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.WarningTitle');
            const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.WarningHeader');
            const localizedWarningRequired = game.i18n.localize('SR5.MIGRATION.WarningRequired');
            const localizedWarningDescription = game.i18n.localize('SR5.MIGRATION.WarningDescription');
            const localizedWarningBackup = game.i18n.localize('SR5.MIGRATION.WarningBackup');
            const localizedWarningBegin = game.i18n.localize('SR5.MIGRATION.BeginMigration');
            const d = new Dialog({
                title: localizedWarningTitle,
                content: `<h2 style="color: red; text-align: center">${localizedWarningHeader}</h2>` +
                    `<p style="text-align: center"><i>${localizedWarningRequired}</i></p>` +
                    `<p>${localizedWarningDescription}</p>` +
                    `<h3 style="color: red">${localizedWarningBackup}</h3>`,
                buttons: {
                    ok: {
                        label: localizedWarningBegin,
                        callback: () => this.migrate(migrations),
                    },
                },
                default: 'ok',
            });
            d.render(true);
        });
    }
    static migrate(migrations) {
        return __awaiter(this, void 0, void 0, function* () {
            // we want to apply migrations in ascending order until we're up to the latest
            migrations.sort((a, b) => {
                return this.compareVersion(a.versionNumber, b.versionNumber);
            });
            yield this.migrateWorld(game, migrations);
            yield this.migrateCompendium(game, migrations);
            const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.SuccessTitle');
            const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.SuccessHeader');
            const localizedSuccessDescription = game.i18n.localize('SR5.MIGRATION.SuccessDescription');
            const localizedSuccessPacksInfo = game.i18n.localize('SR5.MIGRATION.SuccessPacksInfo');
            const localizedSuccessConfirm = game.i18n.localize('SR5.MIGRATION.SuccessConfirm');
            const packsDialog = new Dialog({
                title: localizedWarningTitle,
                content: `<h2 style="text-align: center; color: green">${localizedWarningHeader}</h2>` +
                    `<p>${localizedSuccessDescription}</p>` +
                    `<p style="text-align: center"><i>${localizedSuccessPacksInfo}</i></p>`,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: localizedSuccessConfirm,
                    },
                },
                default: 'ok',
            });
            packsDialog.render(true);
        });
    }
    /**
     * Migrate all world objects
     * @param game
     * @param migrations
     */
    static migrateWorld(game, migrations) {
        return __awaiter(this, void 0, void 0, function* () {
            // Run the migrations in order
            for (const { migration } of migrations) {
                yield migration.Migrate(game);
            }
        });
    }
    /**
     * Iterate over all world compendium packs
     * @param game Game that will be migrated
     * @param migrations Instances of the version migration
     */
    static migrateCompendium(game, migrations) {
        return __awaiter(this, void 0, void 0, function* () {
            // Migrate World Compendium Packs
            const packs = game.packs.filter((pack) => pack.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(pack.metadata.entity));
            // Run the migrations in order on each pack.
            for (const pack of packs) {
                for (const { migration } of migrations) {
                    yield migration.MigrateCompendiumPack(pack);
                }
            }
        });
    }
    // found at: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
    // updated for typescript
    /**
     * compare two version numbers, returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     * @param v1
     * @param v2
     */
    static compareVersion(v1, v2) {
        const s1 = v1.split('.').map((s) => parseInt(s, 10));
        const s2 = v2.split('.').map((s) => parseInt(s, 10));
        const k = Math.min(v1.length, v2.length);
        for (let i = 0; i < k; ++i) {
            if (s1[i] > s2[i])
                return 1;
            if (s1[i] < s2[i])
                return -1;
        }
        return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
    }
}
exports.Migrator = Migrator;
// Map of all version migrations to their target version numbers.
Migrator.s_Versions = [
    { versionNumber: LegacyMigration_1.LegacyMigration.TargetVersion, migration: new LegacyMigration_1.LegacyMigration() },
    { versionNumber: Version0_6_5_1.Version0_6_5.TargetVersion, migration: new Version0_6_5_1.Version0_6_5() },
    { versionNumber: Version0_6_10_1.Version0_6_10.TargetVersion, migration: new Version0_6_10_1.Version0_6_10() },
    { versionNumber: Version0_7_2_1.Version0_7_2.TargetVersion, migration: new Version0_7_2_1.Version0_7_2() },
];

},{"./VersionMigration":63,"./versions/LegacyMigration":64,"./versions/Version0_6_10":65,"./versions/Version0_6_5":66,"./versions/Version0_7_2":67}],63:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionMigration = void 0;
/**
 * Converts a game's data model from source version to a target version.
 * Extending classes are only required to handle items, actors, and scenes,
 *  other methods are implementable purely for convenience and atomicity.
 */
class VersionMigration {
    constructor() {
        this.m_Abort = false;
    }
    get SourceVersionFriendlyName() {
        return `v${this.SourceVersion}`;
    }
    get TargetVersionFriendlyName() {
        return `v${this.TargetVersion}`;
    }
    /**
     * Flag the migration to be aborted.
     * @param reason The reason that the migration must be aborted, to be displayed
     *  to the user and returned from the migration call.
     */
    abort(reason) {
        this.m_Abort = true;
        this.m_AbortReason = reason;
        // @ts-ignore
        ui.notifications.error(`Data migration has been aborted: ${reason}`, { permanent: true });
    }
    /**
     * Begin migration for the specified game.
     * @param game The world that should be migrated.
     */
    Migrate(game) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore TODO Unignore when Foundry Types updates
            ui.notifications.info(`Beginning Shadowrun system migration from version ${this.SourceVersionFriendlyName} to ${this.TargetVersionFriendlyName}.`);
            // @ts-ignore TODO Unignore when Foundry Types updates
            ui.notifications.warn(`Please do not close your game or shutdown FoundryVTT.`, {
                permanent: true,
            });
            // Map of entities to update, store until later to reduce chance of partial updates
            // which may result in impossible game states.
            const entityUpdates = new Map();
            // Migrate World Items
            yield this.PreMigrateItemData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            yield this.IterateItems(game, entityUpdates);
            yield this.PostMigrateItemData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            // Migrate World Actors
            yield this.PreMigrateActorData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            yield this.IterateActors(game, entityUpdates);
            yield this.PostMigrateActorData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            // Migrate Actor Tokens
            yield this.PreMigrateSceneData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            yield this.IterateScenes(game, entityUpdates);
            yield this.PostMigrateSceneData(game, entityUpdates);
            if (this.m_Abort) {
                return Promise.reject(this.m_AbortReason);
            }
            // Apply the updates, this should *always* work, now that parsing is complete.
            yield this.Apply(entityUpdates);
            yield game.settings.set(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION, this.TargetVersion);
            // @ts-ignore TODO Unignore when Foundry Types updates
            ui.notifications.info(`Shadowrun system migration successfully migrated to version ${this.TargetVersion}.`, { permanent: true });
        });
    }
    /**
     * Applies the specified mapping of entities, iteratively updating each.
     * @param entityUpdates A mapping of entity updateData pairs.
     */
    Apply(entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [entity, { updateData, embeddedItems }] of entityUpdates) {
                if (embeddedItems !== null) {
                    const actor = entity;
                    yield actor.updateOwnedItem(embeddedItems);
                }
                yield entity.update(updateData, { enforceTypes: false });
            }
        });
    }
    /**
     * Iterate through all scenes and migrate each if needed.
     * @param game
     * @param entityUpdates
     */
    IterateScenes(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const scene of game.scenes.entities) {
                try {
                    if (!(yield this.ShouldMigrateSceneData(scene))) {
                        continue;
                    }
                    if (scene._id === 'MAwSFhlXRipixOWw') {
                        console.log('Scene Pre-Update');
                        console.log(scene);
                    }
                    console.log(`Migrating Scene entity ${scene.name}`);
                    const updateData = yield this.MigrateSceneData(duplicate(scene.data));
                    let hasTokenUpdates = false;
                    updateData.tokens = yield Promise.all(
                    // @ts-ignore
                    scene.data.tokens.map((token) => __awaiter(this, void 0, void 0, function* () {
                        if (isObjectEmpty(token.actorData)) {
                            return token;
                        }
                        let tokenDataUpdate = yield this.MigrateActorData(token.actorData);
                        if (!isObjectEmpty(tokenDataUpdate)) {
                            hasTokenUpdates = true;
                            tokenDataUpdate['_id'] = token._id;
                            const newToken = duplicate(token);
                            newToken.actorData = yield mergeObject(token.actorData, tokenDataUpdate, {
                                enforceTypes: false,
                                inplace: false,
                            });
                            console.log(newToken);
                            return newToken;
                        }
                        else {
                            return token;
                        }
                    })));
                    if (scene._id === 'MAwSFhlXRipixOWw') {
                        console.log('Scene Pre-Update');
                        console.log(scene);
                    }
                    if (isObjectEmpty(updateData)) {
                        continue;
                    }
                    expandObject(updateData);
                    entityUpdates.set(scene, {
                        updateData,
                        embeddedItems: null,
                    });
                }
                catch (error) {
                    console.error(error);
                    return Promise.reject(error);
                }
            }
        });
    }
    /**
     * Iterate through all items and migrate each if needed.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    IterateItems(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of game.items.entities) {
                try {
                    if (!(yield this.ShouldMigrateItemData(item.data))) {
                        continue;
                    }
                    console.log(`Migrating Item: ${item.name}`);
                    const updateData = yield this.MigrateItemData(item.data);
                    if (isObjectEmpty(updateData)) {
                        continue;
                    }
                    expandObject(updateData);
                    entityUpdates.set(item, {
                        updateData,
                        embeddedItems: null,
                    });
                }
                catch (error) {
                    console.error(error);
                    return Promise.reject(error);
                }
            }
        });
    }
    /**
     * Iterate through all actors and migrate each if needed.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    IterateActors(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const actor of game.actors.entities) {
                try {
                    if (!(yield this.ShouldMigrateActorData(actor.data))) {
                        continue;
                    }
                    console.log(`Migrating Actor ${actor.name}`);
                    console.log(actor);
                    const updateData = yield this.MigrateActorData(duplicate(actor.data));
                    console.log(updateData);
                    let items = [];
                    if (updateData.items) {
                        items = updateData.items;
                        delete updateData.items;
                    }
                    expandObject(updateData);
                    entityUpdates.set(actor, {
                        updateData,
                        embeddedItems: items,
                    });
                }
                catch (error) {
                    console.error(error);
                    return Promise.reject(error);
                }
            }
        });
    }
    /**
     * Iterate over an actor's items, updating those that need updating.
     * @param actorData The actor to iterate over
     * @param updateData The existing update data to merge into
     */
    IterateActorItems(actorData, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasItemUpdates = false;
            // @ts-ignore
            if (actorData.items !== undefined) {
                const items = yield Promise.all(
                // @ts-ignore
                actorData.items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    let itemUpdate = yield this.MigrateItemData(item);
                    if (!isObjectEmpty(itemUpdate)) {
                        hasItemUpdates = true;
                        itemUpdate['_id'] = item._id;
                        return yield mergeObject(item, itemUpdate, {
                            enforceTypes: false,
                            inplace: false,
                        });
                    }
                    else {
                        return item;
                    }
                })));
                if (hasItemUpdates) {
                    updateData.items = items;
                }
            }
            return updateData;
        });
    }
    /**
     * Check if a scene requires updates.
     * @param scene The scene to check.
     * @return A promise that resolves true or false.
     */
    ShouldMigrateSceneData(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /**
     * Migrate the specified scene's data.
     * @param scene The scene to migrate.
     * @return A promise that resolves with the update data.
     */
    MigrateSceneData(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PreMigrateSceneData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PostMigrateSceneData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Check if an item requires updates.
     * @param item The item to check.
     * @return A promise that resolves true or false.
     */
    ShouldMigrateItemData(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /**
     * Migrate the specified item's data.
     * @param item The item to migrate.
     * @return A promise that resolves with the update data.
     */
    MigrateItemData(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PreMigrateItemData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PostMigrateItemData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Check if an actor requires updates.
     * @param actor The actor to check.
     * @return A promise that resolves true or false.
     */
    ShouldMigrateActorData(actor) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /**
     * Migrate the specified actor's data.
     * @param actor The actor to migrate.
     * @return A promise that resolves with the update data.
     */
    MigrateActorData(actor) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    /**
     * Do something right before actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PreMigrateActorData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Do something right after actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    PostMigrateActorData(game, entityUpdates) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Migrate a compendium pack
     * @param pack
     */
    MigrateCompendiumPack(pack) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = pack.metadata.entity;
            if (!['Actor', 'Item', 'Scene'].includes(entity))
                return;
            // Begin by requesting server-side data model migration and get the migrated content
            yield pack.migrate({});
            const content = yield pack.getContent();
            // Iterate over compendium entries - applying fine-tuned migration functions
            for (let ent of content) {
                try {
                    let updateData = null;
                    if (entity === 'Item') {
                        updateData = yield this.MigrateItemData(ent.data);
                        if (isObjectEmpty(updateData)) {
                            continue;
                        }
                        expandObject(updateData);
                        updateData['_id'] = ent._id;
                        yield pack.updateEntity(updateData);
                        // TODO: Uncomment when foundry allows embeddeds to be updated in packs
                        // } else if (entity === 'Actor') {
                        //     updateData = await this.MigrateActorData(ent.data);
                        //
                        //     if (isObjectEmpty(updateData)) {
                        //         continue;
                        //     }
                        //
                        //     updateData['_id'] = ent._id;
                        //     await pack.updateEntity(updateData);
                    }
                    else if (entity === 'Scene') {
                        updateData = yield this.MigrateSceneData(ent.data);
                        if (isObjectEmpty(updateData)) {
                            continue;
                        }
                        expandObject(updateData);
                        updateData['_id'] = ent._id;
                        yield pack.updateEntity(updateData);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }
            console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
        });
    }
}
exports.VersionMigration = VersionMigration;
VersionMigration.MODULE_NAME = 'shadowrun5e';
VersionMigration.KEY_DATA_VERSION = 'systemMigrationVersion';
VersionMigration.NO_VERSION = '0';

},{}],64:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyMigration = void 0;
const VersionMigration_1 = require("../VersionMigration");
/**
 * Migrates the data model for Legacy migrations prior to 0.6.4
 */
class LegacyMigration extends VersionMigration_1.VersionMigration {
    get SourceVersion() {
        return '0';
    }
    get TargetVersion() {
        return LegacyMigration.TargetVersion;
    }
    static get TargetVersion() {
        return '0.6.4';
    }
    MigrateActorData(actorData) {
        return __awaiter(this, void 0, void 0, function* () {
            let updateData = {};
            LegacyMigration.migrateActorOverflow(actorData, updateData);
            LegacyMigration.migrateActorSkills(actorData, updateData);
            updateData = yield this.IterateActorItems(actorData, updateData);
            return updateData;
        });
    }
    MigrateItemData(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            LegacyMigration.migrateDamageTypeAndElement(item, updateData);
            LegacyMigration.migrateItemsAddActions(item, updateData);
            LegacyMigration.migrateActorOverflow(item, updateData);
            LegacyMigration.migrateItemsAddCapacity(item, updateData);
            LegacyMigration.migrateItemsAmmo(item, updateData);
            LegacyMigration.migrateItemsConceal(item, updateData);
            return updateData;
        });
    }
    MigrateSceneData(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    ShouldMigrateActorData(actorData) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    ShouldMigrateItemData(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    ShouldMigrateSceneData(scene) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return ((_a = scene.data.tokens) === null || _a === void 0 ? void 0 : _a.length) > 0;
        });
    }
    /**
     * Migrate actor overflow from an integer to an object
     * - it wasn't even displayed before so we know it is 0
     * @param actorData
     * @param updateData
     */
    static migrateActorOverflow(actorData, updateData) {
        if (getProperty(actorData.data, 'track.physical.overflow') === 0) {
            updateData['data.track.physical.overflow.value'] = 0;
            updateData['data.track.physical.overflow.max'] = 0;
        }
    }
    /**
     * Migrate actor skills specializations to be a list instead of string
     * @param actorData
     * @param updateData
     */
    static migrateActorSkills(actorData, updateData) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (!((_b = (_a = actorData.data) === null || _a === void 0 ? void 0 : _a.skills) === null || _b === void 0 ? void 0 : _b.active))
            return;
        const splitRegex = /[,\/|.]+/;
        const reducer = (running, [key, val]) => {
            if (!Array.isArray(val.specs) && val.specs) {
                running[key] = {
                    specs: val.specs.split(splitRegex).filter((s) => s !== ''),
                };
            }
            return running;
        };
        if (actorData.data.skills) {
            updateData['data.skills.active'] = Object.entries(actorData.data.skills.active).reduce(reducer, {});
            if (actorData.data.skills.knowledge) {
                updateData['data.skills.knowledge.street.value'] = Object.entries((_e = (_d = (_c = actorData.data.skills) === null || _c === void 0 ? void 0 : _c.knowledge) === null || _d === void 0 ? void 0 : _d.street) === null || _e === void 0 ? void 0 : _e.value).reduce(reducer, {});
                updateData['data.skills.knowledge.professional.value'] = Object.entries((_h = (_g = (_f = actorData.data.skills) === null || _f === void 0 ? void 0 : _f.knowledge) === null || _g === void 0 ? void 0 : _g.professional) === null || _h === void 0 ? void 0 : _h.value).reduce(reducer, {});
                updateData['data.skills.knowledge.academic.value'] = Object.entries((_l = (_k = (_j = actorData.data.skills) === null || _j === void 0 ? void 0 : _j.knowledge) === null || _k === void 0 ? void 0 : _k.academic) === null || _l === void 0 ? void 0 : _l.value).reduce(reducer, {});
                updateData['data.skills.knowledge.interests.value'] = Object.entries((_p = (_o = (_m = actorData.data.skills) === null || _m === void 0 ? void 0 : _m.knowledge) === null || _o === void 0 ? void 0 : _o.interests) === null || _p === void 0 ? void 0 : _p.value).reduce(reducer, {});
            }
            if (actorData.data.skills.language) {
                updateData['data.skills.language.value'] = Object.entries((_r = (_q = actorData.data.skills) === null || _q === void 0 ? void 0 : _q.language) === null || _r === void 0 ? void 0 : _r.value).reduce(reducer, {});
            }
        }
    }
    /**
     *
     * @param item
     * @param updateData
     */
    static migrateDamageTypeAndElement(item, updateData) {
        // console.log('Migrating Damage and Elements');
        if (item.data.action) {
            const action = item.data.action;
            if (typeof action.damage.type === 'string') {
                updateData['data.action.damage.type.base'] = item.data.action.damage.type;
            }
            if (typeof action.damage.element === 'string') {
                updateData['data.action.damage.element.base'] = item.data.action.damage.element;
            }
        }
    }
    /**
     * Migrate ammo from ranged weapons only to all weapons
     * @param item
     * @param updateData
     */
    static migrateItemsAmmo(item, updateData) {
        // console.log('Migrating Ammo');
        if (item.type === 'weapon' && item.data.ammo === undefined) {
            let currentAmmo = { value: 0, max: 0 };
            if (item.data.category === 'range' && item.data.range && item.data.range.ammo) {
                // copy over ammo count
                const oldAmmo = item.data.range.ammo;
                currentAmmo.value = oldAmmo.value;
                currentAmmo.max = oldAmmo.max;
            }
            updateData['data.ammo'] = {
                spare_clips: {
                    value: 0,
                    max: 0,
                },
                current: {
                    value: currentAmmo.value,
                    max: currentAmmo.max,
                },
            };
        }
    }
    /**
     * Migrate conceal name
     * @param item
     * @param updateData
     */
    static migrateItemsConceal(item, updateData) {
        var _a;
        if (((_a = item.data.technology) === null || _a === void 0 ? void 0 : _a.concealability) !== undefined) {
            updateData['data.technology.conceal'] = {
                base: item.data.technology.concealability,
            };
        }
    }
    /**
     * Add capacity to items
     * @param item
     * @param updateData
     */
    static migrateItemsAddCapacity(item, updateData) {
        if (['cyberware'].includes(item.type)) {
            if (item.data.capacity === undefined) {
                updateData.data.capacity = 0;
            }
        }
    }
    /**
     * Add actions to needed items
     * @param item
     * @param updateData
     */
    static migrateItemsAddActions(item, updateData) {
        if (['quality', 'cyberware'].includes(item.type)) {
            if (item.data.action === undefined) {
                const action = {
                    type: '',
                    category: '',
                    attribute: '',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    limit: {
                        value: 0,
                        attribute: '',
                    },
                    extended: false,
                    damage: {
                        type: '',
                        element: '',
                        value: 0,
                        ap: {
                            value: 0,
                        },
                        attribute: '',
                    },
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                };
                if (!updateData.data)
                    updateData.data = {};
                updateData.data.action = action;
            }
        }
    }
}
exports.LegacyMigration = LegacyMigration;

},{"../VersionMigration":63}],65:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version0_6_10 = void 0;
const VersionMigration_1 = require("../VersionMigration");
/**
 * Add default value of willpower to the full_defense_attribute field
 */
class Version0_6_10 extends VersionMigration_1.VersionMigration {
    get SourceVersion() {
        return '0.6.9';
    }
    get TargetVersion() {
        return Version0_6_10.TargetVersion;
    }
    static get TargetVersion() {
        return '0.6.10';
    }
    MigrateActorData(actorData) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_b = (_a = actorData.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.edge) === undefined)
                return {};
            return {
                data: {
                    attributes: {
                        edge: {
                            base: actorData.data.attributes.edge.max,
                            value: actorData.data.attributes.edge.max,
                            uses: actorData.data.attributes.edge.value,
                        },
                    },
                },
            };
        });
    }
    ShouldMigrateActorData(actorData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = actorData.data.attributes.edge) === null || _a === void 0 ? void 0 : _a.uses) === undefined;
        });
    }
    ShouldMigrateSceneData(scene) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return ((_a = scene.data.tokens) === null || _a === void 0 ? void 0 : _a.length) > 0;
        });
    }
}
exports.Version0_6_10 = Version0_6_10;

},{"../VersionMigration":63}],66:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version0_6_5 = void 0;
const VersionMigration_1 = require("../VersionMigration");
/**
 * Add default value of willpower to the full_defense_attribute field
 */
class Version0_6_5 extends VersionMigration_1.VersionMigration {
    get SourceVersion() {
        return '0.6.4';
    }
    get TargetVersion() {
        return Version0_6_5.TargetVersion;
    }
    static get TargetVersion() {
        return '0.6.5';
    }
    MigrateActorData(actorData) {
        return __awaiter(this, void 0, void 0, function* () {
            let updateData = {};
            if (updateData.data === undefined)
                updateData.data = {};
            updateData.data.full_defense_attribute = 'willpower';
            return updateData;
        });
    }
    ShouldMigrateActorData(actorData) {
        return __awaiter(this, void 0, void 0, function* () {
            return actorData.data.full_defense_attribute === undefined;
        });
    }
    ShouldMigrateSceneData(scene) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return ((_a = scene.data.tokens) === null || _a === void 0 ? void 0 : _a.length) > 0;
        });
    }
}
exports.Version0_6_5 = Version0_6_5;

},{"../VersionMigration":63}],67:[function(require,module,exports){
"use strict";
// TODO: How to trigger test migration.
// TODO: How to test migration results?
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version0_7_2 = void 0;
const VersionMigration_1 = require("../VersionMigration");
const config_1 = require("../../config");
/** NPC / Grunt feature set
 * - Add npc character data.
 * - Add track disabled feature
 */
class Version0_7_2 extends VersionMigration_1.VersionMigration {
    get SourceVersion() {
        return '0.7.1';
    }
    get TargetVersion() {
        return Version0_7_2.TargetVersion;
    }
    static get TargetVersion() {
        return '0.7.2';
    }
    static NoNPCDataForCharacter(actorData) {
        var _a, _b;
        return actorData.type === 'character' && (((_a = actorData === null || actorData === void 0 ? void 0 : actorData.data) === null || _a === void 0 ? void 0 : _a.is_npc) === undefined ||
            ((_b = actorData === null || actorData === void 0 ? void 0 : actorData.data) === null || _b === void 0 ? void 0 : _b.npc) === undefined);
    }
    static UnsupportedMetatype(actorData) {
        var _a, _b;
        const type = (_b = (_a = actorData.data.metatype) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
        return actorData.type === 'character' &&
            config_1.SR5.character.types.hasOwnProperty(type);
    }
    MigrateActorData(actorData) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            if (Version0_7_2.UnsupportedMetatype(actorData)) {
                const type = (_b = (_a = actorData.data.metatype) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
                // TODO: What to do with custom metatypes?
                const metatypeData = { metatype: config_1.SR5.character.types.hasOwnProperty(type) ? type : 'human' };
                updateData.data = Object.assign(Object.assign({}, updateData.data), metatypeData);
            }
            if (Version0_7_2.NoNPCDataForCharacter(actorData)) {
                updateData.data = updateData.data ? updateData.data : {};
                const npcData = {
                    is_npc: false,
                    npc: {
                        is_grunt: false,
                        professional_rating: 0
                    }
                };
                updateData.data = Object.assign(Object.assign({}, updateData.data), npcData);
            }
            return updateData;
        });
    }
    ShouldMigrateActorData(actorData) {
        return __awaiter(this, void 0, void 0, function* () {
            return Version0_7_2.UnsupportedMetatype(actorData) || Version0_7_2.NoNPCDataForCharacter(actorData);
        });
    }
}
exports.Version0_7_2 = Version0_7_2;

},{"../../config":44,"../VersionMigration":63}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsList = void 0;
class PartsList {
    constructor(parts) {
        let actualParts = [];
        if (parts) {
            if (Array.isArray(parts)) {
                actualParts = parts;
            }
            else if (typeof parts === 'object') {
                for (const [name, value] of Object.entries(parts)) {
                    if (value !== null && value !== undefined) {
                        // if it's a number, we are dealing with an array as an object
                        if (!isNaN(Number(name)) && typeof value === 'object') {
                            actualParts.push({
                                name: value.name,
                                value: value.value,
                            });
                        }
                        else {
                            actualParts.push({
                                name,
                                value,
                            });
                        }
                    }
                }
            }
        }
        this._list = actualParts;
    }
    get list() {
        return this._list.slice();
    }
    get length() {
        return this._list.length;
    }
    get total() {
        let total = 0;
        for (const part of this._list) {
            if (typeof part.value === 'number') {
                total += part.value;
            }
        }
        return total;
    }
    getPartValue(name) {
        var _a;
        return (_a = this._list.find((part) => part.name === name)) === null || _a === void 0 ? void 0 : _a.value;
    }
    clear() {
        this._list.length = 0;
    }
    addPart(name, value) {
        this._list.push({
            name,
            value,
        });
    }
    addUniquePart(name, value, overwrite = true) {
        const index = this._list.findIndex((part) => part.name === name);
        if (index > -1) {
            // if we exist and should've overwrite, return
            if (!overwrite)
                return;
            this._list.splice(index, 1);
            // if we are passed undefined, remove the value
            if (value === undefined || value === null)
                return;
            // recursively go through until we no longer have a part of this name
            this.addUniquePart(name, value);
        }
        else if (value) {
            this.addPart(name, value);
        }
    }
    removePart(name) {
        const index = this._list.findIndex((part) => part.name === name);
        if (index > -1) {
            this._list.splice(index, 1);
            return true;
        }
        return false;
    }
    getMessageOutput() {
        return this.list;
    }
    static AddUniquePart(list, name, value, overwrite = true) {
        const parts = new PartsList(list);
        parts.addUniquePart(name, value, overwrite);
        return parts._list;
    }
    static Total(list) {
        const parts = new PartsList(list);
        return parts.total;
    }
}
exports.PartsList = PartsList;

},{}],69:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowrunRoller = exports.ShadowrunRoll = void 0;
const helpers_1 = require("../helpers");
const chat_1 = require("../chat");
const constants_1 = require("../constants");
const PartsList_1 = require("../parts/PartsList");
class ShadowrunRoll extends Roll {
    // add class Roll to the json so dice-so-nice works
    toJSON() {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
    }
    get sides() {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.terms[0].results.map(result => result.result);
        }
        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.map(roll => roll.roll);
    }
    count(side) {
        const results = this.sides;
        return results.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
    }
    get hits() {
        return this.total;
    }
    get pool() {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.dice[0].number;
        }
        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.length;
    }
    get glitched() {
        return this.count(constants_1.GLITCH_DIE) > Math.floor(this.pool / 2);
    }
}
exports.ShadowrunRoll = ShadowrunRoll;
class ShadowrunRoller {
    static itemRoll(event, item, options) {
        var _a;
        const parts = item.getRollPartsList();
        let limit = item.getLimit();
        let title = item.getRollName();
        const rollData = Object.assign(Object.assign({}, options), { event: event, dialogOptions: {
                environmental: true,
            }, parts, actor: item.actor, item,
            limit,
            title, name: item.name, img: item.img, previewTemplate: item.hasTemplate });
        rollData['attack'] = item.getAttackData(0);
        rollData['blast'] = item.getBlastData();
        if (item.hasOpposedRoll) {
            rollData['tests'] = [
                {
                    label: item.getOpposedTestName(),
                    type: 'opposed',
                },
            ];
        }
        if (item.isMeleeWeapon()) {
            rollData['reach'] = item.getReach();
        }
        if (item.isRangedWeapon()) {
            rollData['fireMode'] = (_a = item.getLastFireMode()) === null || _a === void 0 ? void 0 : _a.label;
            if (rollData.dialogOptions) {
                rollData.dialogOptions.environmental = item.getLastFireRangeMod().value;
            }
        }
        rollData.description = item.getChatData();
        return ShadowrunRoller.advancedRoll(rollData);
    }
    static shadowrunFormula({ parts: partsProps, limit, explode, }) {
        const parts = new PartsList_1.PartsList(partsProps);
        const count = parts.total;
        if (count <= 0) {
            // @ts-ignore
            ui.notifications.error(game.i18n.localize('SR5.RollOneDie'));
            return '0d6cs>=5';
        }
        let formula = `${count}d6`;
        if (explode) {
            formula += 'x6';
        }
        if (limit === null || limit === void 0 ? void 0 : limit.value) {
            formula += `kh${limit.value}`;
        }
        formula += 'cs>=5';
        return formula;
    }
    static basicRoll(_a) {
        var { parts: partsProps = [], limit, explodeSixes, title, actor, img = actor === null || actor === void 0 ? void 0 : actor.img, name = actor === null || actor === void 0 ? void 0 : actor.name, hideRollMessage, rollMode } = _a, props = __rest(_a, ["parts", "limit", "explodeSixes", "title", "actor", "img", "name", "hideRollMessage", "rollMode"]);
        return __awaiter(this, void 0, void 0, function* () {
            let roll;
            const parts = new PartsList_1.PartsList(partsProps);
            if (parts.length) {
                const formula = this.shadowrunFormula({ parts: parts.list, limit, explode: explodeSixes });
                if (!formula)
                    return;
                roll = new ShadowrunRoll(formula);
                roll.roll();
                if (game.settings.get(constants_1.SYSTEM_NAME, 'displayDefaultRollCard')) {
                    yield roll.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor: actor }),
                        flavor: title,
                        rollMode: rollMode,
                    });
                }
            }
            const token = actor === null || actor === void 0 ? void 0 : actor.token;
            [name, img] = ShadowrunRoller.getPreferedNameAndImageSource(name, img, actor, token);
            const templateData = Object.assign({ actor: actor, header: {
                    name: name || '',
                    img: img || '',
                }, tokenId: token ? `${token.scene._id}.${token.id}` : undefined, rollMode, dice: roll.sides, limit, testName: title, dicePool: roll.pool, parts: parts.list, hits: roll.hits, glitch: roll.glitched }, props);
            // In what case would no roll be present? No parts? Why would this reach any logic then?
            if (roll) {
                roll.templateData = templateData;
            }
            if (!hideRollMessage) {
                const chatData = yield chat_1.createChatData(templateData, roll);
                ChatMessage.create(chatData, { displaySheet: false }).then((message) => {
                    console.log(message);
                });
            }
            return roll;
        });
    }
    /**
     * Prompt a roll for the user
     */
    static promptRoll() {
        const lastRoll = game.user.getFlag(constants_1.SYSTEM_NAME, 'lastRollPromptValue') || 0;
        const parts = [{ name: 'SR5.LastRoll', value: lastRoll }];
        return ShadowrunRoller.advancedRoll({ parts, title: 'Roll', dialogOptions: { prompt: true } });
    }
    /**
     * Start an advanced roll
     * - Prompts the user for modifiers
     * @param props
     */
    static advancedRoll(props) {
        // destructure what we need to use from props
        // any value pulled out needs to be updated back in props if changed
        const { title, actor, parts: partsProps = [], limit, extended, wounds = true, after, dialogOptions } = props;
        const parts = new PartsList_1.PartsList(partsProps);
        // remove limits if game settings is set
        if (!game.settings.get(constants_1.SYSTEM_NAME, 'applyLimits')) {
            delete props.limit;
        }
        // TODO create "fast roll" option
        const rollMode = game.settings.get('core', 'rollMode');
        let dialogData = {
            options: dialogOptions,
            extended,
            dice_pool: parts.total,
            parts: parts.getMessageOutput(),
            limit: limit === null || limit === void 0 ? void 0 : limit.value,
            wounds,
            woundValue: actor === null || actor === void 0 ? void 0 : actor.getWoundModifier(),
            rollMode,
            rollModes: CONFIG.Dice.rollModes,
        };
        let template = 'systems/shadowrun5e/dist/templates/rolls/roll-dialog.html';
        let edge = false;
        let cancel = true;
        const buttons = {
            roll: {
                label: game.i18n.localize('SR5.Roll'),
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        if (actor) {
            buttons['edge'] = {
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().value})`,
                icon: '<i class="fas fa-bomb"></i>',
                callback: () => {
                    edge = true;
                    cancel = false;
                },
            };
        }
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: title,
                    content: dlg,
                    buttons,
                    default: 'roll',
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        if (cancel)
                            return;
                        // get the actual dice_pool from the difference of initial parts and value in the dialog
                        const dicePoolValue = helpers_1.Helpers.parseInputToNumber($(html).find('[name="dice_pool"]').val());
                        if (dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.prompt) {
                            parts.clear();
                            yield game.user.setFlag(constants_1.SYSTEM_NAME, 'lastRollPromptValue', dicePoolValue);
                            parts.addUniquePart('SR5.Base', dicePoolValue);
                        }
                        const limitValue = helpers_1.Helpers.parseInputToNumber($(html).find('[name="limit"]').val());
                        if (limit && limit.value !== limitValue) {
                            limit.value = limitValue;
                            limit.base = limitValue;
                            limit.label = 'SR5.Override';
                        }
                        const woundValue = helpers_1.Helpers.parseInputToNumber($(html).find('[name="wounds"]').val());
                        const situationMod = helpers_1.Helpers.parseInputToNumber($(html).find('[name="dp_mod"]').val());
                        const environmentMod = helpers_1.Helpers.parseInputToNumber($(html).find('[name="options.environmental"]').val());
                        if (wounds && woundValue !== 0) {
                            parts.addUniquePart('SR5.Wounds', woundValue);
                            props.wounds = true;
                        }
                        if (situationMod) {
                            parts.addUniquePart('SR5.SituationalModifier', situationMod);
                        }
                        if (environmentMod) {
                            parts.addUniquePart('SR5.EnvironmentModifier', environmentMod);
                            if (!props.dialogOptions)
                                props.dialogOptions = {};
                            props.dialogOptions.environmental = true;
                        }
                        const extendedString = helpers_1.Helpers.parseInputToString($(html).find('[name="extended"]').val());
                        const extended = extendedString === 'true';
                        if (edge && actor) {
                            props.explodeSixes = true;
                            parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().value);
                            delete props.limit;
                            // TODO: Edge usage doesn't seem to apply on actor sheet.
                            yield actor.update({
                                'data.attributes.edge.uses': actor.data.data.attributes.edge.uses - 1,
                            });
                        }
                        props.rollMode = helpers_1.Helpers.parseInputToString($(html).find('[name=rollMode]').val());
                        props.parts = parts.list;
                        const r = this.basicRoll(Object.assign({}, props));
                        if (extended && r) {
                            const currentExtended = (_a = parts.getPartValue('SR5.Extended')) !== null && _a !== void 0 ? _a : 0;
                            parts.addUniquePart('SR5.Extended', currentExtended - 1);
                            props.parts = parts.list;
                            // add a bit of a delay to roll again
                            setTimeout(() => this.advancedRoll(props), 400);
                        }
                        resolve(r);
                        if (after && r)
                            r.then((roll) => after(roll));
                    }),
                }).render(true);
            });
        });
    }
    /** Use either the actor or the tokens name and image, depending on system settings.
     *
     * However don't change anything if a custom name or image has been given.
     */
    static getPreferedNameAndImageSource(name, img, actor, token) {
        const namedAndImageMatchActor = name === (actor === null || actor === void 0 ? void 0 : actor.name) && img === (actor === null || actor === void 0 ? void 0 : actor.img);
        const useTokenNameForChatOutput = game.settings.get(constants_1.SYSTEM_NAME, constants_1.FLAGS.ShowTokenNameForChatOutput);
        if (namedAndImageMatchActor && useTokenNameForChatOutput && token) {
            img = token === null || token === void 0 ? void 0 : token.data.img;
            name = token === null || token === void 0 ? void 0 : token.data.name;
        }
        return [name, img];
    }
}
exports.ShadowrunRoller = ShadowrunRoller;

},{"../chat":42,"../constants":45,"../helpers":54,"../parts/PartsList":68}],70:[function(require,module,exports){
"use strict";
// game settings for shadowrun 5e
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSystemSettings = void 0;
const VersionMigration_1 = require("./migrator/VersionMigration");
const constants_1 = require("./constants");
exports.registerSystemSettings = () => {
    /**
     * Register diagonal movement rule setting
     */
    game.settings.register(constants_1.SYSTEM_NAME, 'diagonalMovement', {
        name: 'SETTINGS.DiagonalMovementName',
        hint: 'SETTINGS.DiagonalMovementDescription',
        scope: 'world',
        config: true,
        type: String,
        default: '1-2-1',
        choices: {
            '1-1-1': 'SETTINGS.IgnoreDiagonal',
            '1-2-1': 'SETTINGS.EstimateDiagonal',
            'EUCL': 'SETTINGS.Euclidean',
        },
        onChange: (rule) => (canvas.grid.diagonalRule = rule),
    });
    /**
     * Default limit behavior
     */
    game.settings.register(constants_1.SYSTEM_NAME, 'applyLimits', {
        name: 'SETTINGS.ApplyLimitsName',
        hint: 'SETTINGS.ApplyLimitsDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register(constants_1.SYSTEM_NAME, 'displayDefaultRollCard', {
        name: 'SETTINGS.DisplayDefaultRollCardName',
        hint: 'SETTINGS.DisplayDefaultRollCardDescription',
        scope: 'user',
        config: true,
        type: Boolean,
        default: false,
    });
    /**
     * Track system version upon which a migration was last applied
     */
    game.settings.register(constants_1.SYSTEM_NAME, VersionMigration_1.VersionMigration.KEY_DATA_VERSION, {
        name: 'System Data Version.',
        scope: 'world',
        config: false,
        type: String,
        default: '0',
    });
    game.settings.register(constants_1.SYSTEM_NAME, constants_1.FLAGS.ShowGlitchAnimation, {
        name: 'SETTINGS.ShowGlitchAnimationName',
        hint: 'SETTINGS.ShowGlitchAnimationDescription',
        scope: 'user',
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register(constants_1.SYSTEM_NAME, constants_1.FLAGS.ShowTokenNameForChatOutput, {
        name: 'SETTINGS.ShowTokenNameForChatOutputName',
        hint: 'SETTINGS.ShowTokenNameForChatOutputDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
};

},{"./constants":45,"./migrator/VersionMigration":63}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Template extends MeasuredTemplate {
    static fromItem(item, onComplete) {
        const templateShape = 'circle';
        const templateData = {
            t: templateShape,
            user: game.user._id,
            direction: 0,
            x: 0,
            y: 0,
            // @ts-ignore
            fillColor: game.user.color,
        };
        const blast = item.getBlastData();
        templateData['distance'] = blast === null || blast === void 0 ? void 0 : blast.radius;
        templateData['dropoff'] = blast === null || blast === void 0 ? void 0 : blast.dropoff;
        // @ts-ignore
        const template = new this(templateData);
        template.item = item;
        template.onComplete = onComplete;
        return template;
    }
    drawPreview() {
        const initialLayer = canvas.activeLayer;
        // @ts-ignore
        this.draw();
        // @ts-ignore
        this.layer.activate();
        // @ts-ignore
        this.layer.preview.addChild(this);
        this.activatePreviewListeners(initialLayer);
    }
    activatePreviewListeners(initialLayer) {
        const handlers = {};
        let moveTime = 0;
        // Update placement (mouse-move)
        handlers['mm'] = (event) => {
            event.stopPropagation();
            let now = Date.now(); // Apply a 20ms throttle
            if (now - moveTime <= 20)
                return;
            const center = event.data.getLocalPosition(this.layer);
            const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
            this.data.x = snapped.x;
            this.data.y = snapped.y;
            // @ts-ignore
            this.refresh();
            moveTime = now;
        };
        // Cancel the workflow (right-click)
        handlers['rc'] = () => {
            this.layer.preview.removeChildren();
            canvas.stage.off('mousemove', handlers['mm']);
            canvas.stage.off('mousedown', handlers['lc']);
            canvas.app.view.oncontextmenu = null;
            canvas.app.view.onwheel = null;
            initialLayer.activate();
            if (this.onComplete)
                this.onComplete();
        };
        // Confirm the workflow (left-click)
        handlers['lc'] = (event) => {
            handlers['rc'](event);
            // Confirm final snapped position
            const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
            this.data.x = destination.x;
            this.data.y = destination.y;
            // Create the template
            canvas.scene.createEmbeddedEntity('MeasuredTemplate', this.data);
        };
        // Rotate the template by 3 degree increments (mouse-wheel)
        handlers['mw'] = (event) => {
            if (event.ctrlKey)
                event.preventDefault(); // Avoid zooming the browser window
            event.stopPropagation();
            let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
            let snap = event.shiftKey ? delta : 5;
            this.data.direction += snap * Math.sign(event.deltaY);
            // @ts-ignore
            this.refresh();
        };
        // Activate listeners
        canvas.stage.on('mousemove', handlers['mm']);
        canvas.stage.on('mousedown', handlers['lc']);
        canvas.app.view.oncontextmenu = handlers['rc'];
        canvas.app.view.onwheel = handlers['mw'];
    }
}
exports.default = Template;

},{}]},{},[61])

//# sourceMappingURL=bundle.js.map
