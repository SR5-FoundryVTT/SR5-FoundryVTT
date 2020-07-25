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
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
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
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
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

  Gp[toStringTagSymbol] = "Generator";

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
const BaseActorPrep_1 = require("./prep/BaseActorPrep");
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
        const prepper = new BaseActorPrep_1.BaseActorPrep(actorData);
        prepper.prepareModifiers();
        prepper.prepareArmor();
        prepper.prepareCyberware();
        prepper.prepareSkills();
        prepper.prepareAttributes();
        prepper.prepareMatrix();
        prepper.prepareLimits();
        prepper.prepareConditionMonitors();
        prepper.prepareMovement();
        prepper.prepareWounds();
        prepper.prepareInitiative();
        const data = actorData.data;
        if (data.magic.drain && !data.magic.drain.mod)
            data.magic.drain.mod = {};
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
    getEquippedMatrixDevice() {
        return this.items.find((item) => item.isDevice());
    }
    getEquippedArmor() {
        return this.items.filter((item) => item.isArmor());
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
    getOwnedItem(itemId) {
        return super.getOwnedItem(itemId);
    }
    getMatrixDevice() {
        const matrix = this.data.data.matrix;
        if (matrix.device)
            return this.getOwnedItem(matrix.device);
        return undefined;
    }
    getFullDefenseAttribute() {
        let att = this.data.data.full_defense_attribute;
        if (!att)
            att = 'willpower';
        return this.findAttribute(att);
    }
    getEquippedWeapons() {
        return this.items.filter((item) => item.isEquipped() && item.data.type === 'weapon');
    }
    getRecoilCompensation() {
        var _a;
        return (_a = this.data.data.recoil_compensation) !== null && _a !== void 0 ? _a : 0;
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
        const wil = this.data.data.attributes.willpower;
        const res = this.data.data.attributes.resonance;
        const data = this.data.data;
        const parts = {};
        parts[wil.label] = wil.value;
        parts[res.label] = res.value;
        if (data.modifiers.fade)
            parts['SR5.Bonus'] = data.modifiers.fade;
        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Fade')}`;
        const incomingDrain = {
            label: 'SR5.Fade',
            value: incoming,
        };
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }
    rollDrain(options = {}, incoming = -1) {
        const wil = this.data.data.attributes.willpower;
        const drainAtt = this.data.data.attributes[this.data.data.magic.attribute];
        const parts = {};
        parts[wil.label] = wil.value;
        parts[drainAtt.label] = drainAtt.value;
        if (this.data.data.modifiers.drain)
            parts['SR5.Bonus'] = this.data.data.modifiers.drain;
        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Drain')}`;
        const incomingDrain = {
            label: 'SR5.Drain',
            value: incoming,
        };
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }
    rollArmor(options = {}, parts = {}) {
        this._addArmorParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options.event,
            actor: this,
            parts,
            title: game.i18n.localize('SR5.Armor'),
            wounds: false,
        });
    }
    rollDefense(options = {}, parts = {}) {
        var _a, _b, _c, _d;
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
                parts['SR5.Reach'] = netReach;
            }
        }
        let dialogData = {
            parts,
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
                            parts[defense.label] = defense.value;
                        }
                        if (cover)
                            parts['SR5.Cover'] = cover;
                        resolve(ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                            event: event,
                            actor: this,
                            parts,
                            title: game.i18n.localize('SR5.DefenseTest'),
                            incomingAttack,
                        }).then((roll) => __awaiter(this, void 0, void 0, function* () {
                            if (incomingAttack && roll) {
                                let defenderHits = roll.total;
                                let attackerHits = incomingAttack.hits || 0;
                                let netHits = attackerHits - defenderHits;
                                if (netHits >= 0) {
                                    const damage = incomingAttack.damage;
                                    damage.mod['SR5.NetHits'] = netHits;
                                    damage.value = damage.base + helpers_1.Helpers.totalMods(damage.mod);
                                    const soakRollOptions = {
                                        event: event,
                                        damage: incomingAttack.damage,
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
    rollSoak(options, parts = {}) {
        this._addSoakParts(parts);
        let dialogData = {
            damage: options === null || options === void 0 ? void 0 : options.damage,
            parts,
            elementTypes: CONFIG.SR5.elementTypes,
        };
        let id = '';
        let cancel = true;
        let template = 'systems/shadowrun5e/dist/templates/rolls/roll-soak.html';
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: 'SR5.DamageResistanceTest',
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
                        if (cancel)
                            return;
                        const armor = this.getArmor();
                        const armorId = helpers_1.Helpers.parseInputToString($(html).find('[name=element]').val());
                        const bonusArmor = armor[armorId] || 0;
                        if (bonusArmor)
                            parts[CONFIG.SR5.elementTypes[armorId]] = bonusArmor;
                        const ap = helpers_1.Helpers.parseInputToNumber($(html).find('[name=ap]').val());
                        if (ap) {
                            let armorVal = armor.value + bonusArmor;
                            // don't take more AP than armor
                            parts['SR5.AP'] = Math.max(ap, -armorVal);
                        }
                        let title = game.i18n.localize('SR5.SoakTest');
                        resolve(ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                            event: options === null || options === void 0 ? void 0 : options.event,
                            actor: this,
                            soak: options === null || options === void 0 ? void 0 : options.damage,
                            parts,
                            title: title,
                            wounds: false,
                        }));
                    }),
                }).render(true);
            });
        });
    }
    rollSingleAttribute(attId, options) {
        const attr = this.data.data.attributes[attId];
        const parts = {};
        parts[attr.label] = attr.value;
        this._addMatrixParts(parts, attr);
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            title: helpers_1.Helpers.label(attId),
        });
    }
    rollTwoAttributes([id1, id2], options) {
        const attr1 = this.data.data.attributes[id1];
        const attr2 = this.data.data.attributes[id2];
        const label1 = helpers_1.Helpers.label(id1);
        const label2 = helpers_1.Helpers.label(id2);
        const parts = {};
        parts[attr1.label] = attr1.value;
        parts[attr2.label] = attr2.value;
        this._addMatrixParts(parts, [attr1, attr2]);
        this._addGlobalParts(parts);
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
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
        let att1 = this.data.data.attributes[id1];
        let att2 = this.data.data.attributes[id2];
        const parts = {};
        parts[att1.label] = att1.value;
        parts[att2.label] = att2.value;
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
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
            let matrix_att = this.data.data.matrix[attr];
            let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);
            const parts = {};
            parts[CONFIG.SR5.matrixAttributes[attr]] = matrix_att.value;
            if (options && options.event && options.event[CONFIG.SR5.kbmod.SPEC])
                parts['SR5.Specialization'] = 2;
            if (helpers_1.Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
                return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts,
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
                                parts[att.label] = att.value;
                            this._addMatrixParts(parts, true);
                            this._addGlobalParts(parts);
                            return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                                event: options === null || options === void 0 ? void 0 : options.event,
                                actor: this,
                                parts,
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
            parts: {},
            actor: this,
            dialogOptions: {
                prompt: true,
            },
        });
    }
    rollAttributesTest(rollId, options) {
        const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
        const atts = this.data.data.attributes;
        const modifiers = this.data.data.modifiers;
        const parts = {};
        if (rollId === 'composure') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.willpower.label] = atts.willpower.value;
            if (modifiers.composure)
                parts['SR5.Bonus'] = modifiers.composure;
        }
        else if (rollId === 'judge_intentions') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.intuition.label] = atts.intuition.value;
            if (modifiers.judge_intentions)
                parts['SR5.Bonus'] = modifiers.judge_intentions;
        }
        else if (rollId === 'lift_carry') {
            parts[atts.strength.label] = atts.strength.value;
            parts[atts.body.label] = atts.body.value;
            if (modifiers.lift_carry)
                parts['SR5.Bonus'] = modifiers.lift_carry;
        }
        else if (rollId === 'memory') {
            parts[atts.willpower.label] = atts.willpower.value;
            parts[atts.logic.label] = atts.logic.value;
            if (modifiers.memory)
                parts['SR5.Bonus'] = modifiers.memory;
        }
        return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            title: `${title} Test`,
        });
    }
    rollSkill(skill, options) {
        var _a;
        let att = this.data.data.attributes[skill.attribute];
        let title = skill.label;
        if (options === null || options === void 0 ? void 0 : options.attribute)
            att = this.data.data.attributes[options.attribute];
        let limit = this.data.data.limits[att.limit];
        const parts = {};
        parts[skill.label] = skill.value;
        if ((options === null || options === void 0 ? void 0 : options.event) && helpers_1.Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
            parts[att.label] = att.value;
            if (options.event[CONFIG.SR5.kbmod.SPEC])
                parts['SR5.Specialization'] = 2;
            this._addMatrixParts(parts, [att, skill]);
            this._addGlobalParts(parts);
            return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                event: options.event,
                actor: this,
                parts,
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
                    parts[att.label] = att.value;
                    if (skill.value === 0)
                        parts['SR5.Defaulting'] = -1;
                    if (spec)
                        parts['SR5.Specialization'] = 2;
                    this._addMatrixParts(parts, [att, skill]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        actor: this,
                        parts,
                        limit,
                        title: `${title} Test`,
                    });
                }),
            }).render(true);
        });
    }
    rollKnowledgeSkill(catId, skillId, options) {
        const category = this.data.data.skills.knowledge[catId];
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
        const skill = this.data.data.skills.active[skillId];
        skill.label = game.i18n.localize(CONFIG.SR5.activeSkills[skillId]);
        return this.rollSkill(skill, options);
    }
    rollAttribute(attId, options) {
        let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
        const att = this.data.data.attributes[attId];
        const atts = this.data.data.attributes;
        const parts = {};
        parts[att.label] = att.label === 'SR5.AttrEdge' ? this.getEdge().max : att.value;
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
                            parts[att2.label] = att2.label === 'SR5.AttrEdge' ? this.getEdge().max : att2.value;
                            const att2IdLabel = game.i18n.localize(CONFIG.SR5.attributes[att2Id]);
                            title += ` + ${att2IdLabel}`;
                        }
                    }
                    if (att2Id === 'default') {
                        parts['SR5.Defaulting'] = -1;
                    }
                    this._addMatrixParts(parts, [att, att2]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller_1.ShadowrunRoller.advancedRoll({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        title: `${title} Test`,
                        actor: this,
                        parts,
                    });
                }),
            }).render(true);
        });
    }
    _addMatrixParts(parts, atts) {
        if (helpers_1.Helpers.isMatrix(atts)) {
            const m = this.data.data.matrix;
            if (m.hot_sim)
                parts['SR5.HotSim'] = 2;
            if (m.running_silent)
                parts['SR5.RunningSilent'] = -2;
        }
    }
    _addGlobalParts(parts) {
        if (this.data.data.modifiers.global) {
            parts['SR5.Global'] = this.data.data.modifiers.global;
        }
    }
    _addDefenseParts(parts) {
        const reaction = this.findAttribute('reaction');
        const intuition = this.findAttribute('intuition');
        const mod = this.getModifier('defense');
        if (reaction) {
            parts[reaction.label || 'SR5.Reaction'] = reaction.value;
        }
        if (intuition) {
            parts[intuition.label || 'SR5.Intuition'] = intuition.value;
        }
        if (mod) {
            parts['SR5.Bonus'] = mod;
        }
    }
    _addArmorParts(parts) {
        const armor = this.getArmor();
        if (armor) {
            parts[armor.label || 'SR5.Armor'] = armor.base;
            for (let [key, val] of Object.entries(armor.mod)) {
                parts[key] = val;
            }
        }
    }
    _addSoakParts(parts) {
        const body = this.findAttribute('body');
        if (body) {
            parts[body.label || 'SR5.Body'] = body.value;
        }
        this._addArmorParts(parts);
    }
    static pushTheLimit(li) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = game.messages.get(li.data().messageId);
            if (msg.getFlag(constants_1.SYSTEM_NAME, 'customRoll')) {
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
                    const parts = {};
                    parts['SR5.PushTheLimit'] = actor.getEdge().max;
                    ShadowrunRoller_1.ShadowrunRoller.basicRoll({
                        title: ` - ${game.i18n.localize('SR5.PushTheLimit')}`,
                        parts: parts,
                        actor: actor,
                    }).then(() => {
                        actor.update({
                            'data.attributes.edge.value': actor.getEdge().value - 1,
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
                        const parts = {};
                        parts['SR5.OriginalDicePool'] = pool;
                        parts['SR5.Successes'] = -hits;
                        return ShadowrunRoller_1.ShadowrunRoller.basicRoll({
                            title: ` - Second Chance`,
                            parts,
                            actor: actor,
                        }).then(() => {
                            actor.update({
                                'data.attributes.edge.value': actor.getEdge().value - 1,
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
},{"../constants":29,"../helpers":32,"../rolls/ShadowrunRoller":42,"./prep/BaseActorPrep":18}],17:[function(require,module,exports){
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
        this._shownUntrainedSkills = true;
        this._shownDesc = [];
        this._filters = {
            skills: '',
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
            template: 'systems/shadowrun5e/dist/templates/actor/character.html',
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
    /* -------------------------------------------- */
    /**
     * Prepare data for rendering the Actor sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data = super.getData();
        this._prepareMatrixAttributes(data);
        const attrs = data.data.attributes;
        for (let [, att] of Object.entries(attrs)) {
            if (!att.hidden) {
                if (att.mod['Temporary'] === 0)
                    delete att.mod;
            }
        }
        const { magic } = data.data;
        if (magic.drain && magic.drain.mod['Temporary'] === 0)
            delete magic.drain.mod['Temporary'];
        const { modifiers: mods } = data.data;
        for (let [key, value] of Object.entries(mods)) {
            if (value === 0)
                mods[key] = '';
        }
        this._prepareItems(data);
        this._prepareSkills(data);
        data['config'] = CONFIG.SR5;
        data['awakened'] = data.data.special === 'magic';
        data['emerged'] = data.data.special === 'resonance';
        data.filters = this._filters;
        return data;
    }
    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }
    _doesSkillContainText(key, skill, text) {
        var _a;
        let searchString = `${key} ${game.i18n.localize(skill.label)} ${(_a = skill === null || skill === void 0 ? void 0 : skill.specs) === null || _a === void 0 ? void 0 : _a.join(' ')}`;
        return searchString.toLowerCase().search(text.toLowerCase()) > -1;
    }
    _prepareMatrixAttributes(data) {
        const { matrix } = data.data;
        const cleanupAttribute = (attribute) => {
            const att = matrix[attribute];
            if (att) {
                if (!att.mod)
                    att.mod = {};
                if (att.mod['Temporary'] === 0)
                    delete att.mod['Temporary'];
            }
        };
        ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att) => cleanupAttribute(att));
    }
    _prepareSkills(data) {
        const activeSkills = {};
        const oldSkills = data.data.skills.active;
        for (let [key, skill] of Object.entries(oldSkills)) {
            // if filter isn't empty, we are doing custom filtering
            if (this._filters.skills !== '') {
                if (this._doesSkillContainText(key, skill, this._filters.skills)) {
                    activeSkills[key] = skill;
                }
                // general check if we aren't filtering
            }
            else if ((skill.value > 0 || this._shownUntrainedSkills) &&
                !(this._isSkillMagic(key, skill) && data.data.special !== 'magic') &&
                !(skill.attribute === 'resonance' && data.data.special !== 'resonance')) {
                activeSkills[key] = skill;
            }
        }
        helpers_1.Helpers.orderKeys(activeSkills);
        data.data.skills.active = activeSkills;
    }
    _prepareItems(data) {
        const inventory = {
            weapon: {
                label: game.i18n.localize('SR5.Weapon'),
                items: [],
                dataset: {
                    type: 'weapon',
                },
            },
            armor: {
                label: game.i18n.localize('SR5.Armor'),
                items: [],
                dataset: {
                    type: 'armor',
                },
            },
            device: {
                label: game.i18n.localize('SR5.Device'),
                items: [],
                dataset: {
                    type: 'device',
                },
            },
            equipment: {
                label: game.i18n.localize('SR5.Equipment'),
                items: [],
                dataset: {
                    type: 'equipment',
                },
            },
            cyberware: {
                label: game.i18n.localize('SR5.Cyberware'),
                items: [],
                dataset: {
                    type: 'cyberware',
                },
            },
            programs: {
                label: game.i18n.localize('SR5.Program'),
            },
        };
        let [items, spells, qualities, adept_powers, actions, complex_forms, lifestyles, contacts, sins, programs] = data.items.reduce((arr, item) => {
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
            else if (Object.keys(inventory).includes(item.type))
                arr[0].push(item);
            return arr;
        }, [[], [], [], [], [], [], [], [], [], []]);
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
        html.find('.skill-header').click((event) => {
            event.preventDefault();
            this._shownUntrainedSkills = !this._shownUntrainedSkills;
            this._render(true);
        });
        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.item');
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
        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));
        html.find('.track-roll').click(this._onRollTrack.bind(this));
        html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
        html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));
        html.find('.defense-roll').click(this._onRollDefense.bind(this));
        html.find('.attribute-only-roll').click(this._onRollAttributesOnly.bind(this));
        html.find('.soak-roll').click(this._onRollSoak.bind(this));
        html.find('.drain-roll').click(this._onRollDrain.bind(this));
        html.find('.fade-roll').click(this._onRollFade.bind(this));
        html.find('.item-roll').click(this._onRollItem.bind(this));
        // $(html).find('.item-roll').on('contextmenu', () => console.log('TEST'));
        html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
        html.find('.item-qty').change(this._onChangeQty.bind(this));
        html.find('.item-rtg').change(this._onChangeRtg.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.matrix-roll').click(this._onRollMatrixAttribute.bind(this));
        html.find('.matrix-att-selector').change(this._onMatrixAttributeSelected.bind(this));
        html.find('.basic-roll').click(this._onRollPrompt.bind(this));
        html.find('.armor-roll').click(this._onRollArmor.bind(this));
        html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
        html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
        html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
        html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
        html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));
        html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
        html.find('.import-character').click(this._onShowImportCharacter.bind(this));
        html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
        html.find('.skill-edit').click(this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').click(this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').click(this._onShowEditLanguageSkill.bind(this));
        html.find('.matrix-condition-value').on('change', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            console.log(event);
            const value = helpers_1.Helpers.parseInputToNumber(event.currentTarget.value);
            console.log(value);
            const matrixDevice = this.actor.getMatrixDevice();
            console.log(matrixDevice);
            if (matrixDevice && !isNaN(value)) {
                console.log(matrixDevice);
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = value;
                yield matrixDevice.update(updateData);
            }
        }));
        // Update Inventory Item
        html.find('.item-edit').click((event) => {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
            if (item)
                item.sheet.render(true);
        });
        // Delete Inventory Item
        html.find('.item-delete').click((event) => {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const el = $(event.currentTarget).parents('.item');
            this.actor.deleteOwnedItem(iid);
            el.slideUp(200, () => this.render(false));
        });
        // Drag inventory item
        let handler = (ev) => this._onDragItemStart(ev);
        html.find('.item').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }
    _onFilterSkills(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this._filters.skills = event.currentTarget.value;
            this.render();
        });
    }
    _onReloadAmmo(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
            if (item)
                return item.reloadAmmo();
        });
    }
    _onMatrixAttributeSelected(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let iid = this.actor.data.data.matrix.device;
            let item = this.actor.getOwnedItem(iid);
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
        const header = event.currentTarget;
        const type = header.dataset.type;
        const itemData = {
            name: `New ${helpers_1.Helpers.label(type)}`,
            type: type,
            data: duplicate(header.dataset),
        };
        delete itemData.data['type'];
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
            const skillId = event.currentTarget.dataset.skill;
            this.actor.removeLanguageSkill(skillId);
        });
    }
    _onAddKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const category = event.currentTarget.dataset.category;
            this.actor.addKnowledgeSkill(category);
        });
    }
    _onRemoveKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skillId = event.currentTarget.dataset.skill;
            const category = event.currentTarget.dataset.category;
            this.actor.removeKnowledgeSkill(skillId, category);
        });
    }
    _onChangeRtg(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
            const rtg = parseInt(event.currentTarget.value);
            if (item && rtg) {
                item.update({ 'data.technology.rating': rtg });
            }
        });
    }
    _onChangeQty(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
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
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
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
    _onRollTrack(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            let track = event.currentTarget.closest('.attribute').dataset.track;
            yield this.actor.rollNaturalRecovery(track, event);
        });
    }
    _onRollPrompt(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            yield this.actor.promptRoll({ event: event });
        });
    }
    _onRollItem(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
            if (item) {
                yield item.postCard(event);
            }
        });
    }
    _onRollFade(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.actor.rollFade({ event: event });
        });
    }
    _onRollDrain(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.actor.rollDrain({ event: event });
        });
    }
    _onRollArmor(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            return this.actor.rollArmor({ event: event });
        });
    }
    _onRollDefense(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            return this.actor.rollDefense({ event: event });
        });
    }
    _onRollMatrixAttribute(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const attr = event.currentTarget.dataset.attribute;
            return this.actor.rollMatrixAttribute(attr, { event: event });
        });
    }
    _onRollSoak(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            return this.actor.rollSoak({ event: event });
        });
    }
    _onRollAttributesOnly(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const roll = event.currentTarget.dataset.roll;
            return this.actor.rollAttributesTest(roll, { event: event });
        });
    }
    _onRollKnowledgeSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skill = event.currentTarget.dataset.skill;
            const category = event.currentTarget.dataset.category;
            return this.actor.rollKnowledgeSkill(category, skill, { event: event });
        });
    }
    _onRollLanguageSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skill = event.currentTarget.dataset.skill;
            return this.actor.rollLanguageSkill(skill, { event: event });
        });
    }
    _onRollActiveSkill(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const skill = event.currentTarget.dataset.skill;
            return this.actor.rollActiveSkill(skill, { event: event });
        });
    }
    _onRollAttribute(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const attr = event.currentTarget.dataset.attribute;
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
    _onShowEditKnowledgeSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        const category = event.currentTarget.dataset.category;
        new KnowledgeSkillEditForm_1.KnowledgeSkillEditForm(this.actor, skill, category, {
            event: event,
        }).render(true);
    }
    _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        new LanguageSkillEditForm_1.LanguageSkillEditForm(this.actor, skill, { event: event }).render(true);
    }
    _onShowEditSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        new SkillEditForm_1.SkillEditForm(this.actor, skill, { event: event }).render(true);
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
},{"../apps/chummer-import-form":19,"../apps/skills/KnowledgeSkillEditForm":22,"../apps/skills/LanguageSkillEditForm":23,"../apps/skills/SkillEditForm":24,"../helpers":32}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseActorPrep = void 0;
const SR5ItemDataWrapper_1 = require("../../item/SR5ItemDataWrapper");
const helpers_1 = require("../../helpers");
class BaseActorPrep {
    constructor(data) {
        this.data = data.data;
        this.items = data.items.map((item) => new SR5ItemDataWrapper_1.SR5ItemDataWrapper(item));
    }
    /**
     * Prepare Matrix data on the actor
     * - if an item is equipped, it will use that data
     * - if it isn't and player is technomancer, it will use that data
     */
    prepareMatrix() {
        const { matrix, attributes, limits } = this.data;
        // clear matrix data to defaults
        matrix.firewall.value = helpers_1.Helpers.totalMods(matrix.firewall.mod);
        matrix.data_processing.value = helpers_1.Helpers.totalMods(matrix.data_processing.mod);
        matrix.attack.value = helpers_1.Helpers.totalMods(matrix.attack.mod);
        matrix.sleaze.value = helpers_1.Helpers.totalMods(matrix.sleaze.mod);
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';
        // get the first equipped device, we don't care if they have more equipped -- it shouldn't happen
        const device = this.items.find((item) => item.isEquipped() && item.isDevice());
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
                        matrix[key].value += value.value;
                        matrix[key].device_att = value.device_att;
                    }
                }
            }
        } // if we don't have a device, use living persona
        else if (this.data.special === 'resonance') {
            matrix.firewall.value += helpers_1.Helpers.calcTotal(attributes.willpower);
            matrix.data_processing.value += helpers_1.Helpers.calcTotal(attributes.logic);
            matrix.rating = helpers_1.Helpers.calcTotal(attributes.resonance);
            matrix.attack.value += helpers_1.Helpers.calcTotal(attributes.charisma);
            matrix.sleaze.value += helpers_1.Helpers.calcTotal(attributes.intuition);
            matrix.name = game.i18n.localize('SR5.LivingPersona');
        }
        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
            matrix.condition_monitor.value = matrix.condition_monitor.max;
        }
        // add matrix attributes to both limits and attributes as hidden entries
        ['firewall', 'sleaze', 'data_processing', 'firewall'].forEach((key) => {
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
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used
     * - all "accessories" will be added to the armor
     */
    prepareArmor() {
        const { armor } = this.data;
        armor.base = 0;
        armor.value = 0;
        armor.mod = {};
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }
        const equippedArmor = this.items.filter((item) => item.isArmor() && item.isEquipped());
        equippedArmor === null || equippedArmor === void 0 ? void 0 : equippedArmor.forEach((item) => {
            if (item.isArmorAccessory()) {
                armor.mod[item.getName()] = item.getArmorValue();
            } // if not a mod, set armor.value to the items value
            else {
                armor.base = item.getArmorValue();
                armor.label = item.getName();
                for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
                    armor[element] = item.getArmorElements()[element];
                }
            }
        });
        if (this.data.modifiers['armor'])
            armor.mod[game.i18n.localize('SR5.Bonus')] = this.data.modifiers['armor'];
        // SET ARMOR
        armor.value = armor.base + helpers_1.Helpers.totalMods(armor.mod);
    }
    /**
     * Prepare actor data for cyberware changes
     * - this calculates the actors essence
     */
    prepareCyberware() {
        const { attributes } = this.data;
        let totalEssence = 6;
        this.items
            .filter((item) => item.isCyberware() && item.isEquipped())
            .forEach((item) => {
            if (item.getEssenceLoss()) {
                totalEssence -= Number(item.getEssenceLoss());
            }
        });
        attributes.essence.base = +(totalEssence + Number(this.data.modifiers['essence'] || 0)).toFixed(3);
    }
    /**
     * Prepare actor data for attributes
     */
    prepareAttributes() {
        const { attributes } = this.data;
        // hide attributes if we aren't special
        attributes.magic.hidden = !(this.data.special === 'magic');
        attributes.resonance.hidden = !(this.data.special === 'resonance');
        // set the value for the attributes
        for (let [key, attribute] of Object.entries(attributes)) {
            helpers_1.Helpers.calcTotal(attribute);
            // add labels
            attribute.label = CONFIG.SR5.attributes[key];
        }
        // CALCULATE RECOIL
        this.data.recoil_compensation = 1 + Math.ceil(attributes.strength.value / 3);
    }
    /**
     * Prepare actor data for skills
     */
    prepareSkills() {
        const { language, active, knowledge } = this.data.skills;
        if (language) {
            if (!language.value)
                language.value = {};
            language.attribute = 'intuition';
        }
        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            var _a;
            skill.mod = {};
            if (!skill.base)
                skill.base = 0;
            if ((_a = skill.bonus) === null || _a === void 0 ? void 0 : _a.length) {
                for (let bonus of skill.bonus) {
                    skill.mod[bonus.key] = bonus.value;
                }
            }
            helpers_1.Helpers.calcTotal(skill);
        };
        // setup active skills
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }
        const entries = Object.entries(this.data.skills.language.value);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]) => val._delete && delete this.data.skills.language.value[key]);
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
    /**
     * Prepare the actor data limits
     */
    prepareLimits() {
        const { limits, attributes, modifiers } = this.data;
        // SETUP LIMITS
        limits.physical.value =
            Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3) + Number(modifiers['physical_limit']);
        limits.mental.value =
            Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3) + Number(modifiers['mental_limit']);
        limits.social.value =
            Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3) + Number(modifiers['social_limit']);
        // limit labels
        for (let [limitKey, limitValue] of Object.entries(limits)) {
            limitValue.label = CONFIG.SR5.limits[limitKey];
        }
    }
    /**
     * Prepare actor data condition monitors (aka Tracks)
     */
    prepareConditionMonitors() {
        const { track, attributes, modifiers } = this.data;
        // TODO we will have grunts eventually that only have one track
        track.physical.max = 8 + Math.ceil(attributes.body.value / 2) + Number(modifiers['physical_track']);
        track.physical.overflow.max = attributes.body.value;
        track.stun.max = 8 + Math.ceil(attributes.willpower.value / 2) + Number(modifiers['stun_track']);
        // tracks
        for (let [trackKey, trackValue] of Object.entries(track)) {
            trackValue.label = CONFIG.SR5.damageTypes[trackKey];
        }
    }
    /**
     * Prepare actor data movement
     */
    prepareMovement() {
        const { attributes, modifiers } = this.data;
        const movement = this.data.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.value = attributes.agility.value * (2 + Number(modifiers['walk']));
        movement.run.value = attributes.agility.value * (4 + Number(modifiers['run']));
    }
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    prepareModifiers() {
        if (!this.data.modifiers)
            this.data.modifiers = {};
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
            modifiers[item] = Number(this.data.modifiers[item]) || 0;
        }
        this.data.modifiers = modifiers;
    }
    /**
     * Prepare actor data for initiative
     */
    prepareInitiative() {
        const { initiative, attributes, modifiers, matrix } = this.data;
        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value + Number(modifiers['meat_initiative']);
        initiative.meatspace.dice.base = 1 + Number(modifiers['meat_initiative_dice']);
        initiative.astral.base.base = attributes.intuition.value * 2 + Number(modifiers['astral_initiative']);
        initiative.astral.dice.base = 2 + Number(modifiers['astral_initiative_dice']);
        initiative.matrix.base.base = attributes.intuition.value + this.data.matrix.data_processing.value + Number(modifiers['matrix_initiative']);
        initiative.matrix.dice.base = matrix.hot_sim ? 4 : 3 + Number(modifiers['matrix_initiative_dice']);
        if (initiative.perception === 'matrix')
            initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral')
            initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }
        initiative.current.dice.value = initiative.current.dice.base;
        if (initiative.edge)
            initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;
        initiative.current.base.value = initiative.current.base.base;
    }
    /**
     * Prepare actor data for wounds
     */
    prepareWounds() {
        const { modifiers, track } = this.data;
        const count = 3 + Number(modifiers['wound_tolerance']);
        const stunWounds = Math.floor(this.data.track.stun.value / count);
        const physicalWounds = Math.floor(this.data.track.physical.value / count);
        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;
        this.data.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
exports.BaseActorPrep = BaseActorPrep;
},{"../../helpers":32,"../../item/SR5ItemDataWrapper":35}],19:[function(require,module,exports){
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

},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10,"@babel/runtime/regenerator":14}],20:[function(require,module,exports){
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
            fireModes['1'] = 'SS';
        }
        if (modes.semi_auto) {
            fireModes['1'] = 'SA';
            fireModes['3'] = 'SB';
        }
        if (modes.burst_fire) {
            fireModes['3'] = `${modes.semi_auto ? 'SB/' : ''}BF`;
            fireModes['6'] = 'LB';
        }
        if (modes.full_auto) {
            fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}FA(s)`;
            fireModes['10'] = 'FA(c)';
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
},{"../../helpers":32}],21:[function(require,module,exports){
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
    } // returns the actor that this event is acting on

  }, {
    key: "_getActorFromEvent",
    value: function _getActorFromEvent(event) {
      var id = event.currentTarget.closest('.item').dataset.actorId;
      if (id) return game.actors.find(function (a) {
        return a._id === id;
      });
    }
  }, {
    key: "_setOverwatchScore",
    value: function _setOverwatchScore(event) {
      var _this = this;

      var actor = this._getActorFromEvent(event);

      var amount = event.currentTarget.value;

      if (amount && actor) {
        actor.setOverwatchScore(amount).then(function () {
          return _this.render();
        });
      }
    }
  }, {
    key: "_addOverwatchScore",
    value: function _addOverwatchScore(event) {
      var _this2 = this;

      var actor = this._getActorFromEvent(event);

      var amount = parseInt(event.currentTarget.dataset.amount);

      if (amount && actor) {
        var os = actor.getOverwatchScore();
        actor.setOverwatchScore(os + amount).then(function () {
          return _this2.render();
        });
      }
    }
  }, {
    key: "_resetOverwatchScore",
    value: function _resetOverwatchScore(event) {
      var _this3 = this;

      event.preventDefault();

      var actor = this._getActorFromEvent(event);

      if (actor) {
        actor.setOverwatchScore(0).then(function () {
          return _this3.render();
        });
      }
    }
  }, {
    key: "_rollFor15Minutes",
    value: function _rollFor15Minutes(event) {
      var _this4 = this;

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
            return _this4.render();
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

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/defineProperty":5,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSkillEditForm = void 0;
const LanguageSkillEditForm_1 = require("./LanguageSkillEditForm");
class KnowledgeSkillEditForm extends LanguageSkillEditForm_1.LanguageSkillEditForm {
    constructor(actor, skillId, category, options) {
        super(actor, skillId, options);
        this.category = category;
    }
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
exports.KnowledgeSkillEditForm = KnowledgeSkillEditForm;
},{"./LanguageSkillEditForm":23}],23:[function(require,module,exports){
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
},{"./SkillEditForm":24}],24:[function(require,module,exports){
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
    constructor(actor, skillId, options) {
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
        const data = this.getData().data;
        return `${game.i18n.localize('SR5.EditSkill')} - ${(data === null || data === void 0 ? void 0 : data.label) ? game.i18n.localize(data.label) : ''}`;
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
            console.log(formData);
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
        const actor = super.getData().entity;
        data['data'] = actor ? getProperty(actor, this._updateString()) : {};
        return data;
    }
}
exports.SkillEditForm = SkillEditForm;
},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureDistance = void 0;
/**
 * Measure the distance between two pixel coordinates
 * See BaseGrid.measureDistance for more details
 *
 * @param {Object} p0           The origin coordinate {x, y}
 * @param {Object} p1           The destination coordinate {x, y}
 * @param {boolean} gridSpaces  Enforce grid distance (if true) vs. direct point-to-point (if false)
 * @return {number}             The distance between p1 and p0
 */
const constants_1 = require("./constants");
exports.measureDistance = function (p0, p1, { gridSpaces = true } = {}) {
    if (!gridSpaces) { // BaseGrid exists... fix in foundry types
        // @ts-ignore
        return BaseGrid.prototype.measureDistance.bind(this)(p0, p1, {
            gridSpaces,
        });
    }
    const gs = canvas.dimensions.size;
    const ray = new Ray(p0, p1);
    const nx = Math.abs(Math.ceil(ray.dx / gs));
    const ny = Math.abs(Math.ceil(ray.dy / gs));
    // Get the number of straight and diagonal moves
    const nDiagonal = Math.min(nx, ny);
    const nStraight = Math.abs(ny - nx);
    const diagonalRule = game.settings.get(constants_1.SYSTEM_NAME, 'diagonalMovement');
    if (diagonalRule === '1-2-1') {
        const nd10 = Math.floor(nDiagonal / 2);
        const spaces = nd10 * 2 + (nDiagonal - nd10) + nStraight;
        return spaces * canvas.dimensions.distance;
    }
    return (nStraight + nDiagonal) * canvas.scene.data.gridDistance;
};
},{"./constants":29}],26:[function(require,module,exports){
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
exports.createChatData = (templateData, roll) => __awaiter(void 0, void 0, void 0, function* () {
    const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
    const html = yield renderTemplate(template, templateData);
    const actor = templateData.actor;
    const chatData = {
        user: game.user._id,
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: html,
        roll: roll ? JSON.stringify(roll) : undefined,
        speaker: {
            actor: actor === null || actor === void 0 ? void 0 : actor._id,
            token: actor === null || actor === void 0 ? void 0 : actor.token,
            alias: actor === null || actor === void 0 ? void 0 : actor.name,
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
    const rollMode = game.settings.get('core', 'rollMode');
    if (['gmroll', 'blindroll'].includes(rollMode))
        chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
    if (rollMode === 'blindroll')
        chatData['blind'] = true;
    return chatData;
});
exports.addChatMessageContextOptions = (html, options) => {
    const canRoll = (li) => {
        const msg = game.messages.get(li.data().messageId);
        return msg.getFlag(constants_1.SYSTEM_NAME, 'customRoll');
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
    if (!app.getFlag(constants_1.SYSTEM_NAME, 'customRoll'))
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
            template === null || template === void 0 ? void 0 : template.drawPreview(event);
        }
    });
    html.on('click', '.card-title', (event) => {
        event.preventDefault();
        $(event.currentTarget).siblings('.card-description').toggle();
    });
    if ((item === null || item === void 0 ? void 0 : item.hasRoll) && app.isRoll)
        $(html).find('.card-description').hide();
};
},{"./actor/SR5Actor":16,"./constants":29,"./item/SR5Item":34,"./template":44}],27:[function(require,module,exports){
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
exports.shadowrunCombatUpdate = exports.preCombatUpdate = void 0;
const constants_1 = require("./constants");
exports.preCombatUpdate = function (combat, changes, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // triggers when combat round changes
        if (changes.round && combat.round && changes.round > combat.round) {
            let initPassEnd = true;
            for (const c of combat.combatants) {
                let init = Number(c.initiative);
                init -= 10;
                if (init > 0)
                    initPassEnd = false;
            }
            if (!initPassEnd) {
                changes.round = combat.round;
            }
            // if we are gm, call function normally
            // if not gm, send a socket message for the gm to update the combatants
            // for new initative passes or reroll
            if (game.user.isGM) {
                yield exports.shadowrunCombatUpdate(changes, options);
            }
            else {
                // @ts-ignore
                game.socket.emit('system.shadowrun5e', {
                    gmCombatUpdate: {
                        changes,
                        options,
                    },
                });
            }
        }
    });
};
exports.shadowrunCombatUpdate = (changes, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { combat } = game;
    // subtact 10 from all initiative, we just went into the next initiative pass
    const removedCombatants = combat.getFlag(constants_1.SYSTEM_NAME, 'removedCombatants') || [];
    const combatants = [];
    for (const c of combat.combatants) {
        let init = Number(c.initiative);
        init -= 10;
        if (init <= 0)
            removedCombatants.push(Object.assign({}, c));
        else {
            // @ts-ignore
            combatants.push({ _id: c._id, initiative: init });
        }
    }
    yield combat.deleteEmbeddedEntity('Combatant', removedCombatants.map((c) => c._id), {});
    yield combat.updateEmbeddedEntity('Combatant', combatants, {});
    if (combatants.length === 0) {
        const messages = [];
        const messageOptions = options.messageOptions || {};
        for (const c of removedCombatants) {
            const actorData = c.actor ? c.actor.data : {};
            // @ts-ignore
            const formula = combat._getInitiativeFormula(c);
            const roll = new Roll(formula, actorData).roll();
            c.initiative = roll.total;
            const rollMode = messageOptions.rollMode || c.token.hidden || c.hidden ? 'gmroll' : 'roll';
            const messageData = mergeObject({
                speaker: {
                    scene: canvas.scene._id,
                    actor: c.actor ? c.actor._id : null,
                    token: c.token._id,
                    alias: c.token.name,
                },
                flavor: `${c.token.name} rolls for Initiative!`,
            }, messageOptions);
            yield roll.toMessage(messageData, {
                rollMode,
            });
        }
        yield combat.createEmbeddedEntity('Combatant', removedCombatants, {});
        yield ChatMessage.create(messages);
        yield combat.unsetFlag(constants_1.SYSTEM_NAME, 'removedCombatants');
        // @ts-ignore
        yield combat.resetAll();
        yield combat.rollAll();
        yield combat.update({ turn: 0 });
    }
    else if (removedCombatants.length) {
        yield combat.setFlag(constants_1.SYSTEM_NAME, 'removedCombatants', removedCombatants);
        yield combat.update({ turn: 0 });
    }
});
},{"./constants":29}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5 = void 0;
exports.SR5 = {};
exports.SR5['attributes'] = {
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
};
exports.SR5['limits'] = {
    physical: 'SR5.LimitPhysical',
    social: 'SR5.LimitSocial',
    mental: 'SR5.LimitMental',
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};
exports.SR5['specialTypes'] = {
    mundane: 'SR5.Mundane',
    magic: 'SR5.Awakened',
    resonance: 'SR5.Emerged',
};
exports.SR5['damageTypes'] = {
    physical: 'SR5.DmgTypePhysical',
    stun: 'SR5.DmgTypeStun',
    matrix: 'SR5.DmgTypeMatrix',
};
exports.SR5['elementTypes'] = {
    fire: 'SR5.ElementFire',
    cold: 'SR5.ElementCold',
    acid: 'SR5.ElementAcid',
    electricity: 'SR5.ElementElectricity',
    radiation: 'SR5.ElementRadiation',
};
exports.SR5['spellCategories'] = {
    combat: 'SR5.SpellCatCombat',
    detection: 'SR5.SpellCatDetection',
    health: 'SR5.SpellCatHealth',
    illusion: 'SR5.SpellCatIllusion',
    manipulation: 'SR5.SpellCatManipulation',
};
exports.SR5['spellTypes'] = {
    physical: 'SR5.SpellTypePhysical',
    mana: 'SR5.SpellTypeMana',
};
exports.SR5['spellRanges'] = {
    touch: 'SR5.SpellRangeTouch',
    los: 'SR5.SpellRangeLos',
    los_a: 'SR5.SpellRangeLosA',
};
exports.SR5['combatSpellTypes'] = {
    direct: 'SR5.SpellCombatDirect',
    indirect: 'SR5.SpellCombatIndirect',
};
exports.SR5['detectionSpellTypes'] = {
    directional: 'SR5.SpellDetectionDirectional',
    psychic: 'SR5.SpellDetectionPsychic',
    area: 'SR5.SpellDetectionArea',
};
exports.SR5['illusionSpellTypes'] = {
    obvious: 'SR5.SpellIllusionObvious',
    realistic: 'SR5.SpellIllusionRealistic',
};
exports.SR5['illusionSpellSenses'] = {
    'single-sense': 'SR5.SpellIllusionSingleSense',
    'multi-sense': 'SR5.SpellIllusionMultiSense',
};
exports.SR5['attributeRolls'] = {
    composure: 'SR5.RollComposure',
    lift_carry: 'SR5.RollLiftCarry',
    judge_intentions: 'SR5.RollJudgeIntentions',
    memory: 'SR5.RollMemory',
};
exports.SR5['matrixTargets'] = {
    persona: 'SR5.TargetPersona',
    device: 'SR5.TargetDevice',
    file: 'SR5.TargetFile',
    self: 'SR5.TargetSelf',
    sprite: 'SR5.TargetSprite',
    other: 'SR5.TargetOther',
};
exports.SR5['durations'] = {
    instant: 'SR5.DurationInstant',
    sustained: 'SR5.DurationSustained',
    permanent: 'SR5.DurationPermanent',
};
exports.SR5['weaponCategories'] = {
    range: 'SR5.WeaponCatRange',
    melee: 'SR5.WeaponCatMelee',
    thrown: 'SR5.WeaponCatThrown',
};
exports.SR5['weaponRanges'] = {
    short: 'SR5.WeaponRangeShort',
    medium: 'SR5.WeaponRangeMedium',
    long: 'SR5.WeaponRangeLong',
    extreme: 'SR5.WeaponRangeExtreme',
};
exports.SR5['qualityTypes'] = {
    positive: 'SR5.QualityTypePositive',
    negative: 'SR5.QualityTypeNegative',
};
exports.SR5['deviceCategories'] = {
    commlink: 'SR5.DeviceCatCommlink',
    cyberdeck: 'SR5.DeviceCatCyberdeck',
};
exports.SR5['cyberwareGrades'] = {
    standard: 'SR5.CyberwareGradeStandard',
    alpha: 'SR5.CyberwareGradeAlpha',
    beta: 'SR5.CyberwareGradeBeta',
    delta: 'SR5.CyberwareGradeDelta',
    used: 'SR5.CyberwareGradeUsed',
};
exports.SR5['knowledgeSkillCategories'] = {
    street: 'SR5.KnowledgeSkillStreet',
    academic: 'SR5.KnowledgeSkillAcademic',
    professional: 'SR5.KnowledgeSkillProfessional',
    interests: 'SR5.KnowledgeSkillInterests',
};
exports.SR5['activeSkills'] = {
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
};
exports.SR5['actionTypes'] = {
    none: 'SR5.ActionTypeNone',
    free: 'SR5.ActionTypeFree',
    simple: 'SR5.ActionTypeSimple',
    complex: 'SR5.ActionTypeComplex',
    varies: 'SR5.ActionTypeVaries',
};
exports.SR5['matrixAttributes'] = {
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};
exports.SR5['initiativeCategories'] = {
    meatspace: 'SR5.InitCatMeatspace',
    astral: 'SR5.InitCatAstral',
    matrix: 'SR5.InitCatMatrix',
};
exports.SR5['modificationTypes'] = {
    weapon: 'SR5.Weapon',
    armor: 'SR5.Armor',
};
exports.SR5['mountPoints'] = {
    barrel: 'SR5.Barrel',
    stock: 'SR5.Stock',
    top: 'SR5.Top',
    side: 'SR5.Side',
    internal: 'SR5.Internal',
};
exports.SR5['lifestyleTypes'] = {
    street: 'SR5.LifestyleStreet',
    squatter: 'SR5.LifestyleSquatter',
    low: 'SR5.LifestyleLow',
    medium: 'SR5.LifestyleMiddle',
    high: 'SR5.LifestyleHigh',
    luxory: 'SR5.LifestyleLuxory',
    other: 'SR5.LifestyleOther',
};
exports.SR5['kbmod'] = {
    STANDARD: 'shiftKey',
    EDGE: 'altKey',
    SPEC: 'ctrlKey',
};
exports.SR5['actorModifiers'] = {
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
};
exports.SR5['programTypes'] = {
    common_program: 'SR5.CommonProgram',
    hacking_program: 'SR5.HackingProgram',
    agent: 'SR5.Agent',
};
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_NAME = void 0;
exports.SYSTEM_NAME = 'shadowrun5e';
},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataWrapper = void 0;
class DataWrapper {
    constructor(data) {
        this.data = data;
    }
}
exports.DataWrapper = DataWrapper;
},{}],31:[function(require,module,exports){
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
exports.registerHandlebarHelpers = exports.preloadHandlebarsTemplates = void 0;
const helpers_1 = require("./helpers");
exports.preloadHandlebarsTemplates = () => __awaiter(void 0, void 0, void 0, function* () {
    const templatePaths = [
        'systems/shadowrun5e/dist/templates/actor/parts/actor-equipment.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-spellbook.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-skills.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-matrix.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-actions.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-config.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-bio.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-social.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/matrix-attribute.html',
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
        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.html',
        'systems/shadowrun5e/dist/templates/common/ValueInput.html',
    ];
    return loadTemplates(templatePaths);
});
exports.registerHandlebarHelpers = () => {
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
    Handlebars.registerHelper('concat', function (strs, c = ',') {
        if (Array.isArray(strs)) {
            return strs.join(c);
        }
        return strs;
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
    Handlebars.registerHelper('sum', function (v1, v2) {
        return v1 + v2;
    });
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical')
            return 'P';
        if (damage === 'stun')
            return 'S';
        if (damage === 'matrix')
            return 'M';
        return '';
    });
    Handlebars.registerHelper('diceIcon', function (roll) {
        if (roll.roll) {
            switch (roll.roll) {
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
    Handlebars.registerHelper('isDefined', function (value) {
        return value !== undefined;
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
        const { hash } = options;
        return new Handlebars.SafeString(`${hash.part1}.${hash.key}.${hash.part2}`);
    });
};
},{"./helpers":32}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
class Helpers {
    static totalMods(mods) {
        const reducer = (acc, cur) => +acc + +cur;
        if (!mods)
            return 0;
        if (Array.isArray(mods))
            return mods.reduce(reducer, 0);
        // assume object of key/values
        return Object.values(mods).reduce(reducer, 0);
    }
    /**
     * Calculate the total value for a data object
     * - stores the total value and returns it
     * @param data
     */
    static calcTotal(data) {
        if (data.mod === undefined)
            data.mod = {};
        data.value = this.totalMods(data.mod) + data.base;
        return data.value;
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
        if (!atts)
            return false;
        if (typeof atts === 'boolean' && atts)
            return true;
        const matrixAtts = ['firewall', 'data_processing', 'sleaze', 'attack', 'computer', 'hacking', 'cybercombat', 'electronic_warfare', 'software'];
        const matrixLabels = matrixAtts.map((s) => this.label(s));
        if (!Array.isArray(atts))
            atts = [atts];
        atts = atts.filter((att) => att);
        atts.forEach((att) => {
            if (typeof att === 'string' && matrixAtts.includes(att))
                return true;
            else if (matrixLabels.includes(att.label))
                return true;
        });
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
    static setNestedValue(obj, prop, val) {
        console.log(obj);
        console.log(prop);
        console.log(val);
        const props = prop.split('.');
        props.forEach((p) => (obj = p in obj ? obj[p] : null));
        if (obj) {
            console.log(`setting ${obj} to ${val}`);
            obj = val;
        }
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
}
exports.Helpers = Helpers;
},{}],33:[function(require,module,exports){
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
        props.push(`Connection ${data.connection}`);
        props.push(`Loyalty ${data.loyalty}`);
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
        const equippedAmmo = item === null || item === void 0 ? void 0 : item.getEquippedAmmo();
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
                    rcString += ` (${game.i18n.localize('SR5.Total')} ${item.actor.data.data.recoil_compensation + data.range.rc.value})`;
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
    },
};
},{"../helpers":32}],34:[function(require,module,exports){
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
const template_1 = require("../template");
const chat_1 = require("../chat");
const constants_1 = require("../constants");
const SR5ItemDataWrapper_1 = require("./SR5ItemDataWrapper");
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
            yield this.unsetFlag(constants_1.SYSTEM_NAME, 'embeddedItems');
            yield this.setFlag(constants_1.SYSTEM_NAME, 'embeddedItems', items);
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
                    this.actor.render();
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
            if (!technology.condition_monitor)
                technology.condition_monitor = { value: 0 };
            technology.condition_monitor.max = 8 + Math.ceil(technology.rating / 2);
            if (!technology.conceal)
                technology.conceal = {};
            technology.conceal.mod = {};
            equippedMods.forEach((mod) => {
                if ((technology === null || technology === void 0 ? void 0 : technology.conceal) && mod.data.data.technology.conceal.value) {
                    technology.conceal.mod[mod.name] = mod.data.data.technology.conceal.value;
                }
            });
            technology.conceal.value = technology.conceal.base + helpers_1.Helpers.totalMods(technology.conceal.mod);
        }
        if (action) {
            action.alt_mod = 0;
            action.limit.mod = {};
            action.damage.mod = {};
            action.damage.ap.mod = {};
            action.dice_pool_mod = {};
            // handle overrides from mods
            equippedMods.forEach((mod) => {
                if (mod.data.data.accuracy)
                    action.limit.mod[mod.name] = mod.data.data.accuracy;
                if (mod.data.data.dice_pool)
                    action.dice_pool_mod[mod.name] = mod.data.data.dice_pool;
            });
            if (equippedAmmo) {
                // add mods to damage from ammo
                action.damage.mod[`${equippedAmmo.name}`] = equippedAmmo.data.data.damage;
                // add mods to ap from ammo
                action.damage.ap.mod[`${equippedAmmo.name}`] = equippedAmmo.data.data.ap;
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
            action.damage.value = action.damage.base + helpers_1.Helpers.totalMods(action.damage.mod);
            action.damage.ap.value = action.damage.ap.base + helpers_1.Helpers.totalMods(action.damage.ap.mod);
            action.limit.value = action.limit.base + helpers_1.Helpers.totalMods(action.limit.mod);
            if (this.actor) {
                if (action.damage.attribute) {
                    const { attribute } = action.damage;
                    // TODO convert this in the template
                    action.damage.mod[game.i18n.localize(CONFIG.SR5.attributes[attribute])] = (_a = this.actor.findAttribute(attribute)) === null || _a === void 0 ? void 0 : _a.value;
                    action.damage.value = action.damage.base + helpers_1.Helpers.totalMods(action.damage.mod);
                }
                if (action.limit.attribute) {
                    const { attribute } = action.limit;
                    // TODO convert this in the template
                    action.limit.mod[game.i18n.localize(CONFIG.SR5.limits[attribute])] = (_b = this.actor.findLimit(attribute)) === null || _b === void 0 ? void 0 : _b.value;
                    action.limit.value = action.limit.base + helpers_1.Helpers.totalMods(action.limit.mod);
                }
            }
        }
        if (range) {
            if (range.rc) {
                range.rc.mod = {};
                equippedMods.forEach((mod) => {
                    if (mod.data.data.rc)
                        range.rc.mod[mod.name] = mod.data.data.rc;
                    // handle overrides from ammo
                });
                if (range.rc)
                    range.rc.value = range.rc.base + helpers_1.Helpers.totalMods(range.rc.mod);
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
                const onComplete = postOnly
                    ? () => {
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
                    : () => this.rollTest(event);
                if (!postOnly && this.hasTemplate) {
                    // onComplete is called when template is finished
                    const template = template_1.default.fromItem(this, onComplete);
                    if (template) {
                        template.drawPreview();
                    }
                }
                else {
                    onComplete();
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
        const parts = {};
        if (this.hasDefenseTest()) {
            if (this.isAreaOfEffect()) {
                parts['SR5.Aoe'] = -2;
            }
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData === null || fireModeData === void 0 ? void 0 : fireModeData.defense) {
                    if (fireModeData.defense !== 'SR5.DuckOrCover') {
                        const fireMode = +fireModeData.defense;
                        if (fireMode)
                            parts['SR5.FireMode'] = fireMode;
                    }
                }
            }
        }
        return parts;
    }
    getOpposedTestModifier() {
        const testMod = this.getOpposedTestMod();
        const total = helpers_1.Helpers.totalMods(testMod);
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
            return {};
        const parts = duplicate(this.getModifierList());
        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());
        if (attribute && attribute.label)
            parts[attribute.label] = attribute.value;
        // if we have a valid skill, don't look for a second attribute
        if (skill && skill.label)
            parts[skill.label] = skill.value;
        else if (attribute2 && attribute2.label)
            parts[attribute2.label] = attribute2.value;
        const spec = this.getActionSpecialization();
        if (spec)
            parts[spec] = 2;
        // TODO remove these (by making them not used, not just delete)
        const mod = parseInt(this.data.data.action.mod || 0);
        if (mod)
            parts['SR5.ItemMod'] = mod;
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
        return parts;
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
                parts['SR5.Recoil'] = recoil;
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
                return target.rollDefense(options, parts);
            }
            else if (opposed.type === 'soak') {
                options['damage'] = lastAttack === null || lastAttack === void 0 ? void 0 : lastAttack.damage;
                options['attackerHits'] = lastAttack === null || lastAttack === void 0 ? void 0 : lastAttack.hits;
                return target.rollSoak(options, parts);
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
                var _a, _b;
                // complex form handles fade
                if (this.isComplexForm()) {
                    const totalFade = Math.max(this.getFade() + this.getLastComplexFormLevel().value, 2);
                    yield this.actor.rollFade({ event }, totalFade);
                } // spells handle drain, force, and attack data
                else if (this.isSpell()) {
                    if (this.isCombatSpell() && roll) {
                        const attackData = this.getAttackData(roll.total);
                        if (attackData) {
                            yield this.setLastAttack(attackData);
                        }
                    }
                    const forceData = this.getLastSpellForce();
                    const drain = Math.max(this.getDrain() + forceData.value + (forceData.reckless ? 3 : 0), 2);
                    yield ((_a = this.actor) === null || _a === void 0 ? void 0 : _a.rollDrain({ event }, drain));
                } // weapons handle ammo and attack data
                else if (this.data.type === 'weapon') {
                    const attackData = this.getAttackData((roll === null || roll === void 0 ? void 0 : roll.total) || 0);
                    if (attackData) {
                        yield this.setLastAttack(attackData);
                    }
                    if (this.hasAmmo) {
                        const fireMode = ((_b = this.getLastFireMode()) === null || _b === void 0 ? void 0 : _b.value) || 1;
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
            if (sceneId === canvas.scene._id)
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
            yield this.setEmbeddedItems(items);
            yield this.prepareEmbeddedEntities();
            yield this.prepareData();
            yield this.render(false);
            return true;
        });
    }
    openPdfSource() {
        return __awaiter(this, void 0, void 0, function* () {
            const source = this.getBookSource();
            if (source === '') {
                // @ts-ignore
                ui.notifications.error(game.i18n.localize('SR5.SourceFieldEmptyError'));
            }
            // TODO open PDF to correct location
            // parse however you need, all "buttons" will lead to this function
            const [code, page] = source.split(' ');
            //@ts-ignore
            ui.PDFoundry.openPDFByCode(code, parseInt(page));
        });
    }
    getAttackData(hits) {
        var _a;
        if (!((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.damage))
            return undefined;
        const damage = this.data.data.action.damage;
        const data = {
            hits,
            damage: damage,
        };
        if (this.isCombatSpell()) {
            const force = this.getLastSpellForce().value;
            data.force = force;
            data.damage.base = force;
            data.damage.value = force + helpers_1.Helpers.totalMods(data.damage.mod);
            data.damage.ap.value = -force + helpers_1.Helpers.totalMods(data.damage.mod);
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
    isArmorBase() {
        return this.wrapper.isArmorBase();
    }
    isArmorAccessory() {
        return this.wrapper.isArmorAccessory();
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
},{"../apps/dialogs/ShadowrunItemDialog":20,"../chat":26,"../constants":29,"../helpers":32,"../rolls/ShadowrunRoller":42,"../template":44,"./ChatData":33,"./SR5ItemDataWrapper":35}],35:[function(require,module,exports){
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
    isArmorBase() {
        var _a;
        return this.isArmor() && !((_a = this.data.data.armor) === null || _a === void 0 ? void 0 : _a.mod);
    }
    isArmorAccessory() {
        var _a, _b;
        return this.isArmor() && ((_b = (_a = this.data.data.armor) === null || _a === void 0 ? void 0 : _a.mod) !== null && _b !== void 0 ? _b : false);
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
        return (_b = (_a = this.data.data.technology) === null || _a === void 0 ? void 0 : _a.condition_monitor) !== null && _b !== void 0 ? _b : { value: 0, max: 0 };
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
                matrix[att.att].value += att.value;
                matrix[att.att].device_att = key;
            }
        }
        return matrix;
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
        return ((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.dice_pool_mod) || {};
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
},{"../dataWrappers/DataWrapper":30}],36:[function(require,module,exports){
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
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
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
            const item = $(event.currentTarget).parents('.item');
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
        return event.currentTarget.closest('.item').dataset.itemId;
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
    /**
     * @private
     */
    _render(force = false, options = {}) {
        const _super = Object.create(null, {
            _render: { get: () => super._render }
        });
        return __awaiter(this, void 0, void 0, function* () {
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
},{"../helpers":32}],37:[function(require,module,exports){
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
const SR5ItemSheet_1 = require("./item/SR5ItemSheet");
const SR5ActorSheet_1 = require("./actor/SR5ActorSheet");
const SR5Actor_1 = require("./actor/SR5Actor");
const SR5Item_1 = require("./item/SR5Item");
const config_1 = require("./config");
const helpers_1 = require("./helpers");
const settings_1 = require("./settings");
const combat_1 = require("./combat");
const canvas_1 = require("./canvas");
const chat = require("./chat");
const OverwatchScoreTracker_1 = require("./apps/gmtools/OverwatchScoreTracker");
const handlebars_1 = require("./handlebars");
const ShadowrunRoller_1 = require("./rolls/ShadowrunRoller");
const Migrator_1 = require("./migrator/Migrator");
const constants_1 = require("./constants");
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once('init', function () {
    console.log('Loading Shadowrun 5e System');
    // Create a shadowrun5e namespace within the game global
    game['shadowrun5e'] = {
        SR5Actor: SR5Actor_1.SR5Actor,
        ShadowrunRoller: ShadowrunRoller_1.ShadowrunRoller,
        SR5Item: SR5Item_1.SR5Item,
        rollItemMacro,
    };
    CONFIG.SR5 = config_1.SR5;
    CONFIG.Actor.entityClass = SR5Actor_1.SR5Actor;
    CONFIG.Item.entityClass = SR5Item_1.SR5Item;
    settings_1.registerSystemSettings();
    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(constants_1.SYSTEM_NAME, SR5ActorSheet_1.SR5ActorSheet, { makeDefault: true });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet(constants_1.SYSTEM_NAME, SR5ItemSheet_1.SR5ItemSheet, { makeDefault: true });
    ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
        Hooks.on(s, (app, html) => helpers_1.Helpers.setupCustomCheckbox(app, html));
    });
    handlebars_1.preloadHandlebarsTemplates();
    // CONFIG.debug.hooks = true;
});
Hooks.on('canvasInit', function () {
    // this does actually exist. Fix in types?
    // @ts-ignore
    SquareGrid.prototype.measureDistance = canvas_1.measureDistance;
});
Hooks.on('ready', function () {
    // this is correct, will need to be fixed in foundry types
    // @ts-ignore
    game.socket.on('system.shadowrun5e', (data) => {
        if (game.user.isGM && data.gmCombatUpdate) {
            combat_1.shadowrunCombatUpdate(data.gmCombatUpdate.changes, data.gmCombatUpdate.options);
        }
    });
    if (game.user.isGM) {
        Migrator_1.Migrator.BeginMigration();
    }
});
Hooks.on('preUpdateCombat', combat_1.preCombatUpdate);
Hooks.on('renderChatMessage', (app, html) => {
    chat.addRollListeners(app, html);
});
Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type !== 'Item')
        return;
    createItemMacro(data.data, slot);
    return false;
});
Hooks.on('renderSceneControls', (controls, html) => {
    html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
        event.preventDefault();
        new OverwatchScoreTracker_1.OverwatchScoreTracker().render(true);
    });
});
Hooks.on('getSceneControlButtons', (controls) => {
    if (game.user.isGM) {
        const tokenControls = controls.find((c) => c.name === 'token');
        tokenControls.tools.push({
            name: 'overwatch-score-tracker',
            title: 'CONTROLS.SR5.OverwatchScoreTracker',
            icon: 'fas fa-network-wired',
        });
    }
});
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
    return item.rollTest(event);
}
handlebars_1.registerHandlebarHelpers();
},{"./actor/SR5Actor":16,"./actor/SR5ActorSheet":17,"./apps/gmtools/OverwatchScoreTracker":21,"./canvas":25,"./chat":26,"./combat":27,"./config":28,"./constants":29,"./handlebars":31,"./helpers":32,"./item/SR5Item":34,"./item/SR5ItemSheet":36,"./migrator/Migrator":38,"./rolls/ShadowrunRoller":42,"./settings":43}],38:[function(require,module,exports){
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
let Migrator = /** @class */ (() => {
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
    // Map of all version migrations to their target version numbers.
    Migrator.s_Versions = [
        { versionNumber: LegacyMigration_1.LegacyMigration.TargetVersion, migration: new LegacyMigration_1.LegacyMigration() },
        { versionNumber: Version0_6_5_1.Version0_6_5.TargetVersion, migration: new Version0_6_5_1.Version0_6_5() },
    ];
    return Migrator;
})();
exports.Migrator = Migrator;
},{"./VersionMigration":39,"./versions/LegacyMigration":40,"./versions/Version0_6_5":41}],39:[function(require,module,exports){
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
let VersionMigration = /** @class */ (() => {
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
    VersionMigration.MODULE_NAME = 'shadowrun5e';
    VersionMigration.KEY_DATA_VERSION = 'systemMigrationVersion';
    VersionMigration.NO_VERSION = '0';
    return VersionMigration;
})();
exports.VersionMigration = VersionMigration;
},{}],40:[function(require,module,exports){
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
},{"../VersionMigration":39}],41:[function(require,module,exports){
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
},{"../VersionMigration":39}],42:[function(require,module,exports){
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
class ShadowrunRoll extends Roll {
    toJSON() {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
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
    static shadowrunFormula({ parts, limit, explode }) {
        const count = helpers_1.Helpers.totalMods(parts);
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
        var { parts = {}, limit, explodeSixes, title, actor, img = actor === null || actor === void 0 ? void 0 : actor.img, name = actor === null || actor === void 0 ? void 0 : actor.name, hideRollMessage } = _a, props = __rest(_a, ["parts", "limit", "explodeSixes", "title", "actor", "img", "name", "hideRollMessage"]);
        return __awaiter(this, void 0, void 0, function* () {
            let roll;
            const rollMode = game.settings.get('core', 'rollMode');
            if (Object.keys(parts).length > 0) {
                const formula = this.shadowrunFormula({ parts, limit, explode: explodeSixes });
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
            // start of custom message
            const dice = roll === null || roll === void 0 ? void 0 : roll.parts[0].rolls;
            const token = actor === null || actor === void 0 ? void 0 : actor.token;
            const templateData = Object.assign({ actor: actor, header: {
                    name: name || '',
                    img: img || '',
                }, tokenId: token ? `${token.scene._id}.${token.id}` : undefined, dice,
                limit, testName: title, dicePool: helpers_1.Helpers.totalMods(parts), parts, hits: roll === null || roll === void 0 ? void 0 : roll.total }, props);
            roll.templateData = templateData;
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
        const parts = {
            'SR5.LastRoll': lastRoll,
        };
        return ShadowrunRoller.advancedRoll({ parts, dialogOptions: { prompt: true } });
    }
    /**
     * Start an advanced roll
     * - Prompts the user for modifiers
     * @param props
     */
    static advancedRoll(props) {
        // destructure what we need to use from props
        // any value pulled out needs to be updated back in props if changed
        const { title, actor, parts = {}, limit, extended, wounds = true, after, dialogOptions } = props;
        // remove limits if game settings is set
        if (!game.settings.get(constants_1.SYSTEM_NAME, 'applyLimits')) {
            delete props.limit;
        }
        // TODO create "fast roll" option
        let dialogData = {
            options: dialogOptions,
            extended,
            dice_pool: helpers_1.Helpers.totalMods(parts),
            parts,
            limit: limit === null || limit === void 0 ? void 0 : limit.value,
            wounds,
            woundValue: actor === null || actor === void 0 ? void 0 : actor.getWoundModifier(),
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
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().max})`,
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
                        if (cancel)
                            return;
                        // get the actual dice_pool from the difference of initial parts and value in the dialog
                        const dicePoolValue = helpers_1.Helpers.parseInputToNumber($(html).find('[name="dice_pool"]').val());
                        if ((dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.prompt) && dicePoolValue > 0) {
                            for (const key in parts) {
                                delete parts[key];
                            }
                            yield game.user.setFlag(constants_1.SYSTEM_NAME, 'lastRollPromptValue', dicePoolValue);
                            parts['SR5.Base'] = dicePoolValue;
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
                            parts['SR5.Wounds'] = woundValue;
                            props.wounds = true;
                        }
                        if (situationMod)
                            parts['SR5.SituationalModifier'] = situationMod;
                        if (environmentMod) {
                            parts['SR5.EnvironmentModifier'] = environmentMod;
                            if (!props.dialogOptions)
                                props.dialogOptions = {};
                            props.dialogOptions.environmental = true;
                        }
                        const extendedString = helpers_1.Helpers.parseInputToString($(html).find('[name="extended"]').val());
                        const extended = extendedString === 'true';
                        if (edge && actor) {
                            props.explodeSixes = true;
                            parts['SR5.PushTheLimit'] = actor.getEdge().max;
                            yield actor.update({
                                'data.attributes.edge.value': actor.data.data.attributes.edge.value - 1,
                            });
                        }
                        props.parts = parts;
                        const r = this.basicRoll(Object.assign({}, props));
                        if (extended && r) {
                            const currentExtended = parts['SR5.Extended'] || 0;
                            parts['SR5.Extended'] = currentExtended - 1;
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
}
exports.ShadowrunRoller = ShadowrunRoller;
},{"../chat":26,"../constants":29,"../helpers":32}],43:[function(require,module,exports){
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
};
},{"./constants":29,"./migrator/VersionMigration":39}],44:[function(require,module,exports){
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
    drawPreview(event) {
        var _a, _b;
        const initialLayer = canvas.activeLayer;
        // @ts-ignore
        this.draw();
        // @ts-ignore
        this.layer.activate();
        // @ts-ignore
        this.layer.preview.addChild(this);
        this.activatePreviewListeners(initialLayer);
        if (this.item && this.item.actor) {
            (_b = (_a = this.item.actor) === null || _a === void 0 ? void 0 : _a.sheet) === null || _b === void 0 ? void 0 : _b.minimize();
        }
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
            var _a, _b;
            this.layer.preview.removeChildren();
            canvas.stage.off('mousemove', handlers['mm']);
            canvas.stage.off('mousedown', handlers['lc']);
            canvas.app.view.oncontextmenu = null;
            canvas.app.view.onwheel = null;
            initialLayer.activate();
            if (this.item && this.item.actor) {
                // @ts-ignore
                (_b = (_a = this.item.actor) === null || _a === void 0 ? void 0 : _a.sheet) === null || _b === void 0 ? void 0 : _b.maximize();
            }
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
},{}]},{},[37])

//# sourceMappingURL=bundle.js.map
