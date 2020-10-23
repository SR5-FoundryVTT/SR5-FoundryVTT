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

},{"regenerator-runtime":39}],15:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],16:[function(require,module,exports){

},{}],17:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)

},{"base64-js":15,"buffer":17,"ieee754":20}],18:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})

},{"../../is-buffer/index.js":22}],19:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],20:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],21:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],22:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],23:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],24:[function(require,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))

},{"_process":25}],25:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":27}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":29,"./_stream_writable":31,"core-util-is":18,"inherits":21,"process-nextick-args":24}],28:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":30,"core-util-is":18,"inherits":21}],29:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./_stream_duplex":27,"./internal/streams/BufferList":32,"./internal/streams/destroy":33,"./internal/streams/stream":34,"_process":25,"core-util-is":18,"events":19,"inherits":21,"isarray":23,"process-nextick-args":24,"safe-buffer":40,"string_decoder/":43,"util":16}],30:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":27,"core-util-is":18,"inherits":21}],31:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"./_stream_duplex":27,"./internal/streams/destroy":33,"./internal/streams/stream":34,"_process":25,"core-util-is":18,"inherits":21,"process-nextick-args":24,"safe-buffer":40,"timers":44,"util-deprecate":45}],32:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":40,"util":16}],33:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":24}],34:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":19}],35:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":36}],36:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":27,"./lib/_stream_passthrough.js":28,"./lib/_stream_readable.js":29,"./lib/_stream_transform.js":30,"./lib/_stream_writable.js":31}],37:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":36}],38:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":31}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":17}],41:[function(require,module,exports){
(function (Buffer){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this,require("buffer").Buffer)

},{"buffer":17,"stream":42,"string_decoder":43}],42:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":19,"inherits":21,"readable-stream/duplex.js":26,"readable-stream/passthrough.js":35,"readable-stream/readable.js":36,"readable-stream/transform.js":37,"readable-stream/writable.js":38}],43:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":40}],44:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":25,"timers":44}],45:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],46:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  exports.stripBOM = function(str) {
    if (str[0] === '\uFEFF') {
      return str.substring(1);
    } else {
      return str;
    }
  };

}).call(this);

},{}],47:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  var builder, defaults, escapeCDATA, requiresCDATA, wrapCDATA,
    hasProp = {}.hasOwnProperty;

  builder = require('xmlbuilder');

  defaults = require('./defaults').defaults;

  requiresCDATA = function(entry) {
    return typeof entry === "string" && (entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0);
  };

  wrapCDATA = function(entry) {
    return "<![CDATA[" + (escapeCDATA(entry)) + "]]>";
  };

  escapeCDATA = function(entry) {
    return entry.replace(']]>', ']]]]><![CDATA[>');
  };

  exports.Builder = (function() {
    function Builder(opts) {
      var key, ref, value;
      this.options = {};
      ref = defaults["0.2"];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this.options[key] = value;
      }
      for (key in opts) {
        if (!hasProp.call(opts, key)) continue;
        value = opts[key];
        this.options[key] = value;
      }
    }

    Builder.prototype.buildObject = function(rootObj) {
      var attrkey, charkey, render, rootElement, rootName;
      attrkey = this.options.attrkey;
      charkey = this.options.charkey;
      if ((Object.keys(rootObj).length === 1) && (this.options.rootName === defaults['0.2'].rootName)) {
        rootName = Object.keys(rootObj)[0];
        rootObj = rootObj[rootName];
      } else {
        rootName = this.options.rootName;
      }
      render = (function(_this) {
        return function(element, obj) {
          var attr, child, entry, index, key, value;
          if (typeof obj !== 'object') {
            if (_this.options.cdata && requiresCDATA(obj)) {
              element.raw(wrapCDATA(obj));
            } else {
              element.txt(obj);
            }
          } else if (Array.isArray(obj)) {
            for (index in obj) {
              if (!hasProp.call(obj, index)) continue;
              child = obj[index];
              for (key in child) {
                entry = child[key];
                element = render(element.ele(key), entry).up();
              }
            }
          } else {
            for (key in obj) {
              if (!hasProp.call(obj, key)) continue;
              child = obj[key];
              if (key === attrkey) {
                if (typeof child === "object") {
                  for (attr in child) {
                    value = child[attr];
                    element = element.att(attr, value);
                  }
                }
              } else if (key === charkey) {
                if (_this.options.cdata && requiresCDATA(child)) {
                  element = element.raw(wrapCDATA(child));
                } else {
                  element = element.txt(child);
                }
              } else if (Array.isArray(child)) {
                for (index in child) {
                  if (!hasProp.call(child, index)) continue;
                  entry = child[index];
                  if (typeof entry === 'string') {
                    if (_this.options.cdata && requiresCDATA(entry)) {
                      element = element.ele(key).raw(wrapCDATA(entry)).up();
                    } else {
                      element = element.ele(key, entry).up();
                    }
                  } else {
                    element = render(element.ele(key), entry).up();
                  }
                }
              } else if (typeof child === "object") {
                element = render(element.ele(key), child).up();
              } else {
                if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
                  element = element.ele(key).raw(wrapCDATA(child)).up();
                } else {
                  if (child == null) {
                    child = '';
                  }
                  element = element.ele(key, child.toString()).up();
                }
              }
            }
          }
          return element;
        };
      })(this);
      rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
        headless: this.options.headless,
        allowSurrogateChars: this.options.allowSurrogateChars
      });
      return render(rootElement, rootObj).end(this.options.renderOpts);
    };

    return Builder;

  })();

}).call(this);

},{"./defaults":48,"xmlbuilder":84}],48:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  exports.defaults = {
    "0.1": {
      explicitCharkey: false,
      trim: true,
      normalize: true,
      normalizeTags: false,
      attrkey: "@",
      charkey: "#",
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: false,
      explicitRoot: false,
      validator: null,
      xmlns: false,
      explicitChildren: false,
      childkey: '@@',
      charsAsChildren: false,
      includeWhiteChars: false,
      async: false,
      strict: true,
      attrNameProcessors: null,
      attrValueProcessors: null,
      tagNameProcessors: null,
      valueProcessors: null,
      emptyTag: ''
    },
    "0.2": {
      explicitCharkey: false,
      trim: false,
      normalize: false,
      normalizeTags: false,
      attrkey: "$",
      charkey: "_",
      explicitArray: true,
      ignoreAttrs: false,
      mergeAttrs: false,
      explicitRoot: true,
      validator: null,
      xmlns: false,
      explicitChildren: false,
      preserveChildrenOrder: false,
      childkey: '$$',
      charsAsChildren: false,
      includeWhiteChars: false,
      async: false,
      strict: true,
      attrNameProcessors: null,
      attrValueProcessors: null,
      tagNameProcessors: null,
      valueProcessors: null,
      rootName: 'root',
      xmldec: {
        'version': '1.0',
        'encoding': 'UTF-8',
        'standalone': true
      },
      doctype: null,
      renderOpts: {
        'pretty': true,
        'indent': '  ',
        'newline': '\n'
      },
      headless: false,
      chunkSize: 10000,
      emptyTag: '',
      cdata: false
    }
  };

}).call(this);

},{}],49:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  var bom, defaults, events, isEmpty, processItem, processors, sax, setImmediate,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  sax = require('sax');

  events = require('events');

  bom = require('./bom');

  processors = require('./processors');

  setImmediate = require('timers').setImmediate;

  defaults = require('./defaults').defaults;

  isEmpty = function(thing) {
    return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
  };

  processItem = function(processors, item, key) {
    var i, len, process;
    for (i = 0, len = processors.length; i < len; i++) {
      process = processors[i];
      item = process(item, key);
    }
    return item;
  };

  exports.Parser = (function(superClass) {
    extend(Parser, superClass);

    function Parser(opts) {
      this.parseStringPromise = bind(this.parseStringPromise, this);
      this.parseString = bind(this.parseString, this);
      this.reset = bind(this.reset, this);
      this.assignOrPush = bind(this.assignOrPush, this);
      this.processAsync = bind(this.processAsync, this);
      var key, ref, value;
      if (!(this instanceof exports.Parser)) {
        return new exports.Parser(opts);
      }
      this.options = {};
      ref = defaults["0.2"];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this.options[key] = value;
      }
      for (key in opts) {
        if (!hasProp.call(opts, key)) continue;
        value = opts[key];
        this.options[key] = value;
      }
      if (this.options.xmlns) {
        this.options.xmlnskey = this.options.attrkey + "ns";
      }
      if (this.options.normalizeTags) {
        if (!this.options.tagNameProcessors) {
          this.options.tagNameProcessors = [];
        }
        this.options.tagNameProcessors.unshift(processors.normalize);
      }
      this.reset();
    }

    Parser.prototype.processAsync = function() {
      var chunk, err;
      try {
        if (this.remaining.length <= this.options.chunkSize) {
          chunk = this.remaining;
          this.remaining = '';
          this.saxParser = this.saxParser.write(chunk);
          return this.saxParser.close();
        } else {
          chunk = this.remaining.substr(0, this.options.chunkSize);
          this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
          this.saxParser = this.saxParser.write(chunk);
          return setImmediate(this.processAsync);
        }
      } catch (error1) {
        err = error1;
        if (!this.saxParser.errThrown) {
          this.saxParser.errThrown = true;
          return this.emit(err);
        }
      }
    };

    Parser.prototype.assignOrPush = function(obj, key, newValue) {
      if (!(key in obj)) {
        if (!this.options.explicitArray) {
          return obj[key] = newValue;
        } else {
          return obj[key] = [newValue];
        }
      } else {
        if (!(obj[key] instanceof Array)) {
          obj[key] = [obj[key]];
        }
        return obj[key].push(newValue);
      }
    };

    Parser.prototype.reset = function() {
      var attrkey, charkey, ontext, stack;
      this.removeAllListeners();
      this.saxParser = sax.parser(this.options.strict, {
        trim: false,
        normalize: false,
        xmlns: this.options.xmlns
      });
      this.saxParser.errThrown = false;
      this.saxParser.onerror = (function(_this) {
        return function(error) {
          _this.saxParser.resume();
          if (!_this.saxParser.errThrown) {
            _this.saxParser.errThrown = true;
            return _this.emit("error", error);
          }
        };
      })(this);
      this.saxParser.onend = (function(_this) {
        return function() {
          if (!_this.saxParser.ended) {
            _this.saxParser.ended = true;
            return _this.emit("end", _this.resultObject);
          }
        };
      })(this);
      this.saxParser.ended = false;
      this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
      this.resultObject = null;
      stack = [];
      attrkey = this.options.attrkey;
      charkey = this.options.charkey;
      this.saxParser.onopentag = (function(_this) {
        return function(node) {
          var key, newValue, obj, processedKey, ref;
          obj = {};
          obj[charkey] = "";
          if (!_this.options.ignoreAttrs) {
            ref = node.attributes;
            for (key in ref) {
              if (!hasProp.call(ref, key)) continue;
              if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                obj[attrkey] = {};
              }
              newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
              processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
              if (_this.options.mergeAttrs) {
                _this.assignOrPush(obj, processedKey, newValue);
              } else {
                obj[attrkey][processedKey] = newValue;
              }
            }
          }
          obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
          if (_this.options.xmlns) {
            obj[_this.options.xmlnskey] = {
              uri: node.uri,
              local: node.local
            };
          }
          return stack.push(obj);
        };
      })(this);
      this.saxParser.onclosetag = (function(_this) {
        return function() {
          var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
          obj = stack.pop();
          nodeName = obj["#name"];
          if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
            delete obj["#name"];
          }
          if (obj.cdata === true) {
            cdata = obj.cdata;
            delete obj.cdata;
          }
          s = stack[stack.length - 1];
          if (obj[charkey].match(/^\s*$/) && !cdata) {
            emptyStr = obj[charkey];
            delete obj[charkey];
          } else {
            if (_this.options.trim) {
              obj[charkey] = obj[charkey].trim();
            }
            if (_this.options.normalize) {
              obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
            }
            obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
              obj = obj[charkey];
            }
          }
          if (isEmpty(obj)) {
            obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
          }
          if (_this.options.validator != null) {
            xpath = "/" + ((function() {
              var i, len, results;
              results = [];
              for (i = 0, len = stack.length; i < len; i++) {
                node = stack[i];
                results.push(node["#name"]);
              }
              return results;
            })()).concat(nodeName).join("/");
            (function() {
              var err;
              try {
                return obj = _this.options.validator(xpath, s && s[nodeName], obj);
              } catch (error1) {
                err = error1;
                return _this.emit("error", err);
              }
            })();
          }
          if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
            if (!_this.options.preserveChildrenOrder) {
              node = {};
              if (_this.options.attrkey in obj) {
                node[_this.options.attrkey] = obj[_this.options.attrkey];
                delete obj[_this.options.attrkey];
              }
              if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                node[_this.options.charkey] = obj[_this.options.charkey];
                delete obj[_this.options.charkey];
              }
              if (Object.getOwnPropertyNames(obj).length > 0) {
                node[_this.options.childkey] = obj;
              }
              obj = node;
            } else if (s) {
              s[_this.options.childkey] = s[_this.options.childkey] || [];
              objClone = {};
              for (key in obj) {
                if (!hasProp.call(obj, key)) continue;
                objClone[key] = obj[key];
              }
              s[_this.options.childkey].push(objClone);
              delete obj["#name"];
              if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                obj = obj[charkey];
              }
            }
          }
          if (stack.length > 0) {
            return _this.assignOrPush(s, nodeName, obj);
          } else {
            if (_this.options.explicitRoot) {
              old = obj;
              obj = {};
              obj[nodeName] = old;
            }
            _this.resultObject = obj;
            _this.saxParser.ended = true;
            return _this.emit("end", _this.resultObject);
          }
        };
      })(this);
      ontext = (function(_this) {
        return function(text) {
          var charChild, s;
          s = stack[stack.length - 1];
          if (s) {
            s[charkey] += text;
            if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, '').trim() !== '')) {
              s[_this.options.childkey] = s[_this.options.childkey] || [];
              charChild = {
                '#name': '__text__'
              };
              charChild[charkey] = text;
              if (_this.options.normalize) {
                charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
              }
              s[_this.options.childkey].push(charChild);
            }
            return s;
          }
        };
      })(this);
      this.saxParser.ontext = ontext;
      return this.saxParser.oncdata = (function(_this) {
        return function(text) {
          var s;
          s = ontext(text);
          if (s) {
            return s.cdata = true;
          }
        };
      })(this);
    };

    Parser.prototype.parseString = function(str, cb) {
      var err;
      if ((cb != null) && typeof cb === "function") {
        this.on("end", function(result) {
          this.reset();
          return cb(null, result);
        });
        this.on("error", function(err) {
          this.reset();
          return cb(err);
        });
      }
      try {
        str = str.toString();
        if (str.trim() === '') {
          this.emit("end", null);
          return true;
        }
        str = bom.stripBOM(str);
        if (this.options.async) {
          this.remaining = str;
          setImmediate(this.processAsync);
          return this.saxParser;
        }
        return this.saxParser.write(str).close();
      } catch (error1) {
        err = error1;
        if (!(this.saxParser.errThrown || this.saxParser.ended)) {
          this.emit('error', err);
          return this.saxParser.errThrown = true;
        } else if (this.saxParser.ended) {
          throw err;
        }
      }
    };

    Parser.prototype.parseStringPromise = function(str) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.parseString(str, function(err, value) {
            if (err) {
              return reject(err);
            } else {
              return resolve(value);
            }
          });
        };
      })(this));
    };

    return Parser;

  })(events);

  exports.parseString = function(str, a, b) {
    var cb, options, parser;
    if (b != null) {
      if (typeof b === 'function') {
        cb = b;
      }
      if (typeof a === 'object') {
        options = a;
      }
    } else {
      if (typeof a === 'function') {
        cb = a;
      }
      options = {};
    }
    parser = new exports.Parser(options);
    return parser.parseString(str, cb);
  };

  exports.parseStringPromise = function(str, a) {
    var options, parser;
    if (typeof a === 'object') {
      options = a;
    }
    parser = new exports.Parser(options);
    return parser.parseStringPromise(str);
  };

}).call(this);

},{"./bom":46,"./defaults":48,"./processors":50,"events":19,"sax":41,"timers":44}],50:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  var prefixMatch;

  prefixMatch = new RegExp(/(?!xmlns)^.*:/);

  exports.normalize = function(str) {
    return str.toLowerCase();
  };

  exports.firstCharLowerCase = function(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  exports.stripPrefix = function(str) {
    return str.replace(prefixMatch, '');
  };

  exports.parseNumbers = function(str) {
    if (!isNaN(str)) {
      str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
    }
    return str;
  };

  exports.parseBooleans = function(str) {
    if (/^(?:true|false)$/i.test(str)) {
      str = str.toLowerCase() === 'true';
    }
    return str;
  };

}).call(this);

},{}],51:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  var builder, defaults, parser, processors,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  defaults = require('./defaults');

  builder = require('./builder');

  parser = require('./parser');

  processors = require('./processors');

  exports.defaults = defaults.defaults;

  exports.processors = processors;

  exports.ValidationError = (function(superClass) {
    extend(ValidationError, superClass);

    function ValidationError(message) {
      this.message = message;
    }

    return ValidationError;

  })(Error);

  exports.Builder = builder.Builder;

  exports.Parser = parser.Parser;

  exports.parseString = parser.parseString;

  exports.parseStringPromise = parser.parseStringPromise;

}).call(this);

},{"./builder":47,"./defaults":48,"./parser":49,"./processors":50}],52:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  module.exports = {
    Disconnected: 1,
    Preceding: 2,
    Following: 4,
    Contains: 8,
    ContainedBy: 16,
    ImplementationSpecific: 32
  };

}).call(this);

},{}],53:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  module.exports = {
    Element: 1,
    Attribute: 2,
    Text: 3,
    CData: 4,
    EntityReference: 5,
    EntityDeclaration: 6,
    ProcessingInstruction: 7,
    Comment: 8,
    Document: 9,
    DocType: 10,
    DocumentFragment: 11,
    NotationDeclaration: 12,
    Declaration: 201,
    Raw: 202,
    AttributeDeclaration: 203,
    ElementDeclaration: 204,
    Dummy: 205
  };

}).call(this);

},{}],54:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  assign = function() {
    var i, key, len, source, sources, target;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (isFunction(Object.assign)) {
      Object.assign.apply(null, arguments);
    } else {
      for (i = 0, len = sources.length; i < len; i++) {
        source = sources[i];
        if (source != null) {
          for (key in source) {
            if (!hasProp.call(source, key)) continue;
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };

  isFunction = function(val) {
    return !!val && Object.prototype.toString.call(val) === '[object Function]';
  };

  isObject = function(val) {
    var ref;
    return !!val && ((ref = typeof val) === 'function' || ref === 'object');
  };

  isArray = function(val) {
    if (isFunction(Array.isArray)) {
      return Array.isArray(val);
    } else {
      return Object.prototype.toString.call(val) === '[object Array]';
    }
  };

  isEmpty = function(val) {
    var key;
    if (isArray(val)) {
      return !val.length;
    } else {
      for (key in val) {
        if (!hasProp.call(val, key)) continue;
        return false;
      }
      return true;
    }
  };

  isPlainObject = function(val) {
    var ctor, proto;
    return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && (typeof ctor === 'function') && (ctor instanceof ctor) && (Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object));
  };

  getValue = function(obj) {
    if (isFunction(obj.valueOf)) {
      return obj.valueOf();
    } else {
      return obj;
    }
  };

  module.exports.assign = assign;

  module.exports.isFunction = isFunction;

  module.exports.isObject = isObject;

  module.exports.isArray = isArray;

  module.exports.isEmpty = isEmpty;

  module.exports.isPlainObject = isPlainObject;

  module.exports.getValue = getValue;

}).call(this);

},{}],55:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  module.exports = {
    None: 0,
    OpenTag: 1,
    InsideTag: 2,
    CloseTag: 3
  };

}).call(this);

},{}],56:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLAttribute, XMLNode;

  NodeType = require('./NodeType');

  XMLNode = require('./XMLNode');

  module.exports = XMLAttribute = (function() {
    function XMLAttribute(parent, name, value) {
      this.parent = parent;
      if (this.parent) {
        this.options = this.parent.options;
        this.stringify = this.parent.stringify;
      }
      if (name == null) {
        throw new Error("Missing attribute name. " + this.debugInfo(name));
      }
      this.name = this.stringify.name(name);
      this.value = this.stringify.attValue(value);
      this.type = NodeType.Attribute;
      this.isId = false;
      this.schemaTypeInfo = null;
    }

    Object.defineProperty(XMLAttribute.prototype, 'nodeType', {
      get: function() {
        return this.type;
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'ownerElement', {
      get: function() {
        return this.parent;
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'textContent', {
      get: function() {
        return this.value;
      },
      set: function(value) {
        return this.value = value || '';
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'namespaceURI', {
      get: function() {
        return '';
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'prefix', {
      get: function() {
        return '';
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'localName', {
      get: function() {
        return this.name;
      }
    });

    Object.defineProperty(XMLAttribute.prototype, 'specified', {
      get: function() {
        return true;
      }
    });

    XMLAttribute.prototype.clone = function() {
      return Object.create(this);
    };

    XMLAttribute.prototype.toString = function(options) {
      return this.options.writer.attribute(this, this.options.writer.filterOptions(options));
    };

    XMLAttribute.prototype.debugInfo = function(name) {
      name = name || this.name;
      if (name == null) {
        return "parent: <" + this.parent.name + ">";
      } else {
        return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
      }
    };

    XMLAttribute.prototype.isEqualNode = function(node) {
      if (node.namespaceURI !== this.namespaceURI) {
        return false;
      }
      if (node.prefix !== this.prefix) {
        return false;
      }
      if (node.localName !== this.localName) {
        return false;
      }
      if (node.value !== this.value) {
        return false;
      }
      return true;
    };

    return XMLAttribute;

  })();

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],57:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLCData, XMLCharacterData,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLCharacterData = require('./XMLCharacterData');

  module.exports = XMLCData = (function(superClass) {
    extend(XMLCData, superClass);

    function XMLCData(parent, text) {
      XMLCData.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing CDATA text. " + this.debugInfo());
      }
      this.name = "#cdata-section";
      this.type = NodeType.CData;
      this.value = this.stringify.cdata(text);
    }

    XMLCData.prototype.clone = function() {
      return Object.create(this);
    };

    XMLCData.prototype.toString = function(options) {
      return this.options.writer.cdata(this, this.options.writer.filterOptions(options));
    };

    return XMLCData;

  })(XMLCharacterData);

}).call(this);

},{"./NodeType":53,"./XMLCharacterData":58}],58:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLCharacterData, XMLNode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLNode = require('./XMLNode');

  module.exports = XMLCharacterData = (function(superClass) {
    extend(XMLCharacterData, superClass);

    function XMLCharacterData(parent) {
      XMLCharacterData.__super__.constructor.call(this, parent);
      this.value = '';
    }

    Object.defineProperty(XMLCharacterData.prototype, 'data', {
      get: function() {
        return this.value;
      },
      set: function(value) {
        return this.value = value || '';
      }
    });

    Object.defineProperty(XMLCharacterData.prototype, 'length', {
      get: function() {
        return this.value.length;
      }
    });

    Object.defineProperty(XMLCharacterData.prototype, 'textContent', {
      get: function() {
        return this.value;
      },
      set: function(value) {
        return this.value = value || '';
      }
    });

    XMLCharacterData.prototype.clone = function() {
      return Object.create(this);
    };

    XMLCharacterData.prototype.substringData = function(offset, count) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLCharacterData.prototype.appendData = function(arg) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLCharacterData.prototype.insertData = function(offset, arg) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLCharacterData.prototype.deleteData = function(offset, count) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLCharacterData.prototype.replaceData = function(offset, count, arg) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLCharacterData.prototype.isEqualNode = function(node) {
      if (!XMLCharacterData.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
        return false;
      }
      if (node.data !== this.data) {
        return false;
      }
      return true;
    };

    return XMLCharacterData;

  })(XMLNode);

}).call(this);

},{"./XMLNode":75}],59:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLCharacterData, XMLComment,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLCharacterData = require('./XMLCharacterData');

  module.exports = XMLComment = (function(superClass) {
    extend(XMLComment, superClass);

    function XMLComment(parent, text) {
      XMLComment.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing comment text. " + this.debugInfo());
      }
      this.name = "#comment";
      this.type = NodeType.Comment;
      this.value = this.stringify.comment(text);
    }

    XMLComment.prototype.clone = function() {
      return Object.create(this);
    };

    XMLComment.prototype.toString = function(options) {
      return this.options.writer.comment(this, this.options.writer.filterOptions(options));
    };

    return XMLComment;

  })(XMLCharacterData);

}).call(this);

},{"./NodeType":53,"./XMLCharacterData":58}],60:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList;

  XMLDOMErrorHandler = require('./XMLDOMErrorHandler');

  XMLDOMStringList = require('./XMLDOMStringList');

  module.exports = XMLDOMConfiguration = (function() {
    function XMLDOMConfiguration() {
      var clonedSelf;
      this.defaultParams = {
        "canonical-form": false,
        "cdata-sections": false,
        "comments": false,
        "datatype-normalization": false,
        "element-content-whitespace": true,
        "entities": true,
        "error-handler": new XMLDOMErrorHandler(),
        "infoset": true,
        "validate-if-schema": false,
        "namespaces": true,
        "namespace-declarations": true,
        "normalize-characters": false,
        "schema-location": '',
        "schema-type": '',
        "split-cdata-sections": true,
        "validate": false,
        "well-formed": true
      };
      this.params = clonedSelf = Object.create(this.defaultParams);
    }

    Object.defineProperty(XMLDOMConfiguration.prototype, 'parameterNames', {
      get: function() {
        return new XMLDOMStringList(Object.keys(this.defaultParams));
      }
    });

    XMLDOMConfiguration.prototype.getParameter = function(name) {
      if (this.params.hasOwnProperty(name)) {
        return this.params[name];
      } else {
        return null;
      }
    };

    XMLDOMConfiguration.prototype.canSetParameter = function(name, value) {
      return true;
    };

    XMLDOMConfiguration.prototype.setParameter = function(name, value) {
      if (value != null) {
        return this.params[name] = value;
      } else {
        return delete this.params[name];
      }
    };

    return XMLDOMConfiguration;

  })();

}).call(this);

},{"./XMLDOMErrorHandler":61,"./XMLDOMStringList":63}],61:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLDOMErrorHandler;

  module.exports = XMLDOMErrorHandler = (function() {
    function XMLDOMErrorHandler() {}

    XMLDOMErrorHandler.prototype.handleError = function(error) {
      throw new Error(error);
    };

    return XMLDOMErrorHandler;

  })();

}).call(this);

},{}],62:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLDOMImplementation;

  module.exports = XMLDOMImplementation = (function() {
    function XMLDOMImplementation() {}

    XMLDOMImplementation.prototype.hasFeature = function(feature, version) {
      return true;
    };

    XMLDOMImplementation.prototype.createDocumentType = function(qualifiedName, publicId, systemId) {
      throw new Error("This DOM method is not implemented.");
    };

    XMLDOMImplementation.prototype.createDocument = function(namespaceURI, qualifiedName, doctype) {
      throw new Error("This DOM method is not implemented.");
    };

    XMLDOMImplementation.prototype.createHTMLDocument = function(title) {
      throw new Error("This DOM method is not implemented.");
    };

    XMLDOMImplementation.prototype.getFeature = function(feature, version) {
      throw new Error("This DOM method is not implemented.");
    };

    return XMLDOMImplementation;

  })();

}).call(this);

},{}],63:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLDOMStringList;

  module.exports = XMLDOMStringList = (function() {
    function XMLDOMStringList(arr) {
      this.arr = arr || [];
    }

    Object.defineProperty(XMLDOMStringList.prototype, 'length', {
      get: function() {
        return this.arr.length;
      }
    });

    XMLDOMStringList.prototype.item = function(index) {
      return this.arr[index] || null;
    };

    XMLDOMStringList.prototype.contains = function(str) {
      return this.arr.indexOf(str) !== -1;
    };

    return XMLDOMStringList;

  })();

}).call(this);

},{}],64:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDTDAttList, XMLNode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDTDAttList = (function(superClass) {
    extend(XMLDTDAttList, superClass);

    function XMLDTDAttList(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      XMLDTDAttList.__super__.constructor.call(this, parent);
      if (elementName == null) {
        throw new Error("Missing DTD element name. " + this.debugInfo());
      }
      if (attributeName == null) {
        throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
      }
      if (!attributeType) {
        throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
      }
      if (!defaultValueType) {
        throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
      }
      if (defaultValueType.indexOf('#') !== 0) {
        defaultValueType = '#' + defaultValueType;
      }
      if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
        throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
      }
      if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
        throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
      }
      this.elementName = this.stringify.name(elementName);
      this.type = NodeType.AttributeDeclaration;
      this.attributeName = this.stringify.name(attributeName);
      this.attributeType = this.stringify.dtdAttType(attributeType);
      if (defaultValue) {
        this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
      }
      this.defaultValueType = defaultValueType;
    }

    XMLDTDAttList.prototype.toString = function(options) {
      return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options));
    };

    return XMLDTDAttList;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],65:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDTDElement, XMLNode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDTDElement = (function(superClass) {
    extend(XMLDTDElement, superClass);

    function XMLDTDElement(parent, name, value) {
      XMLDTDElement.__super__.constructor.call(this, parent);
      if (name == null) {
        throw new Error("Missing DTD element name. " + this.debugInfo());
      }
      if (!value) {
        value = '(#PCDATA)';
      }
      if (Array.isArray(value)) {
        value = '(' + value.join(',') + ')';
      }
      this.name = this.stringify.name(name);
      this.type = NodeType.ElementDeclaration;
      this.value = this.stringify.dtdElementValue(value);
    }

    XMLDTDElement.prototype.toString = function(options) {
      return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options));
    };

    return XMLDTDElement;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],66:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDTDEntity, XMLNode, isObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  isObject = require('./Utility').isObject;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDTDEntity = (function(superClass) {
    extend(XMLDTDEntity, superClass);

    function XMLDTDEntity(parent, pe, name, value) {
      XMLDTDEntity.__super__.constructor.call(this, parent);
      if (name == null) {
        throw new Error("Missing DTD entity name. " + this.debugInfo(name));
      }
      if (value == null) {
        throw new Error("Missing DTD entity value. " + this.debugInfo(name));
      }
      this.pe = !!pe;
      this.name = this.stringify.name(name);
      this.type = NodeType.EntityDeclaration;
      if (!isObject(value)) {
        this.value = this.stringify.dtdEntityValue(value);
        this.internal = true;
      } else {
        if (!value.pubID && !value.sysID) {
          throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
        }
        if (value.pubID && !value.sysID) {
          throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
        }
        this.internal = false;
        if (value.pubID != null) {
          this.pubID = this.stringify.dtdPubID(value.pubID);
        }
        if (value.sysID != null) {
          this.sysID = this.stringify.dtdSysID(value.sysID);
        }
        if (value.nData != null) {
          this.nData = this.stringify.dtdNData(value.nData);
        }
        if (this.pe && this.nData) {
          throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
        }
      }
    }

    Object.defineProperty(XMLDTDEntity.prototype, 'publicId', {
      get: function() {
        return this.pubID;
      }
    });

    Object.defineProperty(XMLDTDEntity.prototype, 'systemId', {
      get: function() {
        return this.sysID;
      }
    });

    Object.defineProperty(XMLDTDEntity.prototype, 'notationName', {
      get: function() {
        return this.nData || null;
      }
    });

    Object.defineProperty(XMLDTDEntity.prototype, 'inputEncoding', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDTDEntity.prototype, 'xmlEncoding', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDTDEntity.prototype, 'xmlVersion', {
      get: function() {
        return null;
      }
    });

    XMLDTDEntity.prototype.toString = function(options) {
      return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options));
    };

    return XMLDTDEntity;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./Utility":54,"./XMLNode":75}],67:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDTDNotation, XMLNode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDTDNotation = (function(superClass) {
    extend(XMLDTDNotation, superClass);

    function XMLDTDNotation(parent, name, value) {
      XMLDTDNotation.__super__.constructor.call(this, parent);
      if (name == null) {
        throw new Error("Missing DTD notation name. " + this.debugInfo(name));
      }
      if (!value.pubID && !value.sysID) {
        throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
      }
      this.name = this.stringify.name(name);
      this.type = NodeType.NotationDeclaration;
      if (value.pubID != null) {
        this.pubID = this.stringify.dtdPubID(value.pubID);
      }
      if (value.sysID != null) {
        this.sysID = this.stringify.dtdSysID(value.sysID);
      }
    }

    Object.defineProperty(XMLDTDNotation.prototype, 'publicId', {
      get: function() {
        return this.pubID;
      }
    });

    Object.defineProperty(XMLDTDNotation.prototype, 'systemId', {
      get: function() {
        return this.sysID;
      }
    });

    XMLDTDNotation.prototype.toString = function(options) {
      return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options));
    };

    return XMLDTDNotation;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],68:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDeclaration, XMLNode, isObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  isObject = require('./Utility').isObject;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDeclaration = (function(superClass) {
    extend(XMLDeclaration, superClass);

    function XMLDeclaration(parent, version, encoding, standalone) {
      var ref;
      XMLDeclaration.__super__.constructor.call(this, parent);
      if (isObject(version)) {
        ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
      }
      if (!version) {
        version = '1.0';
      }
      this.type = NodeType.Declaration;
      this.version = this.stringify.xmlVersion(version);
      if (encoding != null) {
        this.encoding = this.stringify.xmlEncoding(encoding);
      }
      if (standalone != null) {
        this.standalone = this.stringify.xmlStandalone(standalone);
      }
    }

    XMLDeclaration.prototype.toString = function(options) {
      return this.options.writer.declaration(this, this.options.writer.filterOptions(options));
    };

    return XMLDeclaration;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./Utility":54,"./XMLNode":75}],69:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLNamedNodeMap, XMLNode, isObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  isObject = require('./Utility').isObject;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  XMLDTDAttList = require('./XMLDTDAttList');

  XMLDTDEntity = require('./XMLDTDEntity');

  XMLDTDElement = require('./XMLDTDElement');

  XMLDTDNotation = require('./XMLDTDNotation');

  XMLNamedNodeMap = require('./XMLNamedNodeMap');

  module.exports = XMLDocType = (function(superClass) {
    extend(XMLDocType, superClass);

    function XMLDocType(parent, pubID, sysID) {
      var child, i, len, ref, ref1, ref2;
      XMLDocType.__super__.constructor.call(this, parent);
      this.type = NodeType.DocType;
      if (parent.children) {
        ref = parent.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          if (child.type === NodeType.Element) {
            this.name = child.name;
            break;
          }
        }
      }
      this.documentObject = parent;
      if (isObject(pubID)) {
        ref1 = pubID, pubID = ref1.pubID, sysID = ref1.sysID;
      }
      if (sysID == null) {
        ref2 = [pubID, sysID], sysID = ref2[0], pubID = ref2[1];
      }
      if (pubID != null) {
        this.pubID = this.stringify.dtdPubID(pubID);
      }
      if (sysID != null) {
        this.sysID = this.stringify.dtdSysID(sysID);
      }
    }

    Object.defineProperty(XMLDocType.prototype, 'entities', {
      get: function() {
        var child, i, len, nodes, ref;
        nodes = {};
        ref = this.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          if ((child.type === NodeType.EntityDeclaration) && !child.pe) {
            nodes[child.name] = child;
          }
        }
        return new XMLNamedNodeMap(nodes);
      }
    });

    Object.defineProperty(XMLDocType.prototype, 'notations', {
      get: function() {
        var child, i, len, nodes, ref;
        nodes = {};
        ref = this.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          if (child.type === NodeType.NotationDeclaration) {
            nodes[child.name] = child;
          }
        }
        return new XMLNamedNodeMap(nodes);
      }
    });

    Object.defineProperty(XMLDocType.prototype, 'publicId', {
      get: function() {
        return this.pubID;
      }
    });

    Object.defineProperty(XMLDocType.prototype, 'systemId', {
      get: function() {
        return this.sysID;
      }
    });

    Object.defineProperty(XMLDocType.prototype, 'internalSubset', {
      get: function() {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    XMLDocType.prototype.element = function(name, value) {
      var child;
      child = new XMLDTDElement(this, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      var child;
      child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.entity = function(name, value) {
      var child;
      child = new XMLDTDEntity(this, false, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.pEntity = function(name, value) {
      var child;
      child = new XMLDTDEntity(this, true, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.notation = function(name, value) {
      var child;
      child = new XMLDTDNotation(this, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.toString = function(options) {
      return this.options.writer.docType(this, this.options.writer.filterOptions(options));
    };

    XMLDocType.prototype.ele = function(name, value) {
      return this.element(name, value);
    };

    XMLDocType.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
    };

    XMLDocType.prototype.ent = function(name, value) {
      return this.entity(name, value);
    };

    XMLDocType.prototype.pent = function(name, value) {
      return this.pEntity(name, value);
    };

    XMLDocType.prototype.not = function(name, value) {
      return this.notation(name, value);
    };

    XMLDocType.prototype.up = function() {
      return this.root() || this.documentObject;
    };

    XMLDocType.prototype.isEqualNode = function(node) {
      if (!XMLDocType.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
        return false;
      }
      if (node.name !== this.name) {
        return false;
      }
      if (node.publicId !== this.publicId) {
        return false;
      }
      if (node.systemId !== this.systemId) {
        return false;
      }
      return true;
    };

    return XMLDocType;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./Utility":54,"./XMLDTDAttList":64,"./XMLDTDElement":65,"./XMLDTDEntity":66,"./XMLDTDNotation":67,"./XMLNamedNodeMap":74,"./XMLNode":75}],70:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLDocument, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  isPlainObject = require('./Utility').isPlainObject;

  XMLDOMImplementation = require('./XMLDOMImplementation');

  XMLDOMConfiguration = require('./XMLDOMConfiguration');

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  XMLStringifier = require('./XMLStringifier');

  XMLStringWriter = require('./XMLStringWriter');

  module.exports = XMLDocument = (function(superClass) {
    extend(XMLDocument, superClass);

    function XMLDocument(options) {
      XMLDocument.__super__.constructor.call(this, null);
      this.name = "#document";
      this.type = NodeType.Document;
      this.documentURI = null;
      this.domConfig = new XMLDOMConfiguration();
      options || (options = {});
      if (!options.writer) {
        options.writer = new XMLStringWriter();
      }
      this.options = options;
      this.stringify = new XMLStringifier(options);
    }

    Object.defineProperty(XMLDocument.prototype, 'implementation', {
      value: new XMLDOMImplementation()
    });

    Object.defineProperty(XMLDocument.prototype, 'doctype', {
      get: function() {
        var child, i, len, ref;
        ref = this.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          if (child.type === NodeType.DocType) {
            return child;
          }
        }
        return null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'documentElement', {
      get: function() {
        return this.rootObject || null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'inputEncoding', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'strictErrorChecking', {
      get: function() {
        return false;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'xmlEncoding', {
      get: function() {
        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
          return this.children[0].encoding;
        } else {
          return null;
        }
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'xmlStandalone', {
      get: function() {
        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
          return this.children[0].standalone === 'yes';
        } else {
          return false;
        }
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'xmlVersion', {
      get: function() {
        if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
          return this.children[0].version;
        } else {
          return "1.0";
        }
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'URL', {
      get: function() {
        return this.documentURI;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'origin', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'compatMode', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'characterSet', {
      get: function() {
        return null;
      }
    });

    Object.defineProperty(XMLDocument.prototype, 'contentType', {
      get: function() {
        return null;
      }
    });

    XMLDocument.prototype.end = function(writer) {
      var writerOptions;
      writerOptions = {};
      if (!writer) {
        writer = this.options.writer;
      } else if (isPlainObject(writer)) {
        writerOptions = writer;
        writer = this.options.writer;
      }
      return writer.document(this, writer.filterOptions(writerOptions));
    };

    XMLDocument.prototype.toString = function(options) {
      return this.options.writer.document(this, this.options.writer.filterOptions(options));
    };

    XMLDocument.prototype.createElement = function(tagName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createDocumentFragment = function() {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createTextNode = function(data) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createComment = function(data) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createCDATASection = function(data) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createProcessingInstruction = function(target, data) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createAttribute = function(name) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createEntityReference = function(name) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.getElementsByTagName = function(tagname) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.importNode = function(importedNode, deep) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createElementNS = function(namespaceURI, qualifiedName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.getElementById = function(elementId) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.adoptNode = function(source) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.normalizeDocument = function() {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.renameNode = function(node, namespaceURI, qualifiedName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.getElementsByClassName = function(classNames) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createEvent = function(eventInterface) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createRange = function() {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createNodeIterator = function(root, whatToShow, filter) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLDocument.prototype.createTreeWalker = function(root, whatToShow, filter) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    return XMLDocument;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./Utility":54,"./XMLDOMConfiguration":60,"./XMLDOMImplementation":62,"./XMLNode":75,"./XMLStringWriter":80,"./XMLStringifier":81}],71:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLDocumentCB, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref,
    hasProp = {}.hasOwnProperty;

  ref = require('./Utility'), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue;

  NodeType = require('./NodeType');

  XMLDocument = require('./XMLDocument');

  XMLElement = require('./XMLElement');

  XMLCData = require('./XMLCData');

  XMLComment = require('./XMLComment');

  XMLRaw = require('./XMLRaw');

  XMLText = require('./XMLText');

  XMLProcessingInstruction = require('./XMLProcessingInstruction');

  XMLDeclaration = require('./XMLDeclaration');

  XMLDocType = require('./XMLDocType');

  XMLDTDAttList = require('./XMLDTDAttList');

  XMLDTDEntity = require('./XMLDTDEntity');

  XMLDTDElement = require('./XMLDTDElement');

  XMLDTDNotation = require('./XMLDTDNotation');

  XMLAttribute = require('./XMLAttribute');

  XMLStringifier = require('./XMLStringifier');

  XMLStringWriter = require('./XMLStringWriter');

  WriterState = require('./WriterState');

  module.exports = XMLDocumentCB = (function() {
    function XMLDocumentCB(options, onData, onEnd) {
      var writerOptions;
      this.name = "?xml";
      this.type = NodeType.Document;
      options || (options = {});
      writerOptions = {};
      if (!options.writer) {
        options.writer = new XMLStringWriter();
      } else if (isPlainObject(options.writer)) {
        writerOptions = options.writer;
        options.writer = new XMLStringWriter();
      }
      this.options = options;
      this.writer = options.writer;
      this.writerOptions = this.writer.filterOptions(writerOptions);
      this.stringify = new XMLStringifier(options);
      this.onDataCallback = onData || function() {};
      this.onEndCallback = onEnd || function() {};
      this.currentNode = null;
      this.currentLevel = -1;
      this.openTags = {};
      this.documentStarted = false;
      this.documentCompleted = false;
      this.root = null;
    }

    XMLDocumentCB.prototype.createChildNode = function(node) {
      var att, attName, attributes, child, i, len, ref1, ref2;
      switch (node.type) {
        case NodeType.CData:
          this.cdata(node.value);
          break;
        case NodeType.Comment:
          this.comment(node.value);
          break;
        case NodeType.Element:
          attributes = {};
          ref1 = node.attribs;
          for (attName in ref1) {
            if (!hasProp.call(ref1, attName)) continue;
            att = ref1[attName];
            attributes[attName] = att.value;
          }
          this.node(node.name, attributes);
          break;
        case NodeType.Dummy:
          this.dummy();
          break;
        case NodeType.Raw:
          this.raw(node.value);
          break;
        case NodeType.Text:
          this.text(node.value);
          break;
        case NodeType.ProcessingInstruction:
          this.instruction(node.target, node.value);
          break;
        default:
          throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
      }
      ref2 = node.children;
      for (i = 0, len = ref2.length; i < len; i++) {
        child = ref2[i];
        this.createChildNode(child);
        if (child.type === NodeType.Element) {
          this.up();
        }
      }
      return this;
    };

    XMLDocumentCB.prototype.dummy = function() {
      return this;
    };

    XMLDocumentCB.prototype.node = function(name, attributes, text) {
      var ref1;
      if (name == null) {
        throw new Error("Missing node name.");
      }
      if (this.root && this.currentLevel === -1) {
        throw new Error("Document can only have one root node. " + this.debugInfo(name));
      }
      this.openCurrent();
      name = getValue(name);
      if (attributes == null) {
        attributes = {};
      }
      attributes = getValue(attributes);
      if (!isObject(attributes)) {
        ref1 = [attributes, text], text = ref1[0], attributes = ref1[1];
      }
      this.currentNode = new XMLElement(this, name, attributes);
      this.currentNode.children = false;
      this.currentLevel++;
      this.openTags[this.currentLevel] = this.currentNode;
      if (text != null) {
        this.text(text);
      }
      return this;
    };

    XMLDocumentCB.prototype.element = function(name, attributes, text) {
      var child, i, len, oldValidationFlag, ref1, root;
      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
        this.dtdElement.apply(this, arguments);
      } else {
        if (Array.isArray(name) || isObject(name) || isFunction(name)) {
          oldValidationFlag = this.options.noValidation;
          this.options.noValidation = true;
          root = new XMLDocument(this.options).element('TEMP_ROOT');
          root.element(name);
          this.options.noValidation = oldValidationFlag;
          ref1 = root.children;
          for (i = 0, len = ref1.length; i < len; i++) {
            child = ref1[i];
            this.createChildNode(child);
            if (child.type === NodeType.Element) {
              this.up();
            }
          }
        } else {
          this.node(name, attributes, text);
        }
      }
      return this;
    };

    XMLDocumentCB.prototype.attribute = function(name, value) {
      var attName, attValue;
      if (!this.currentNode || this.currentNode.children) {
        throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
      }
      if (name != null) {
        name = getValue(name);
      }
      if (isObject(name)) {
        for (attName in name) {
          if (!hasProp.call(name, attName)) continue;
          attValue = name[attName];
          this.attribute(attName, attValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        if (this.options.keepNullAttributes && (value == null)) {
          this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
        } else if (value != null) {
          this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
        }
      }
      return this;
    };

    XMLDocumentCB.prototype.text = function(value) {
      var node;
      this.openCurrent();
      node = new XMLText(this, value);
      this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.cdata = function(value) {
      var node;
      this.openCurrent();
      node = new XMLCData(this, value);
      this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.comment = function(value) {
      var node;
      this.openCurrent();
      node = new XMLComment(this, value);
      this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.raw = function(value) {
      var node;
      this.openCurrent();
      node = new XMLRaw(this, value);
      this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.instruction = function(target, value) {
      var i, insTarget, insValue, len, node;
      this.openCurrent();
      if (target != null) {
        target = getValue(target);
      }
      if (value != null) {
        value = getValue(value);
      }
      if (Array.isArray(target)) {
        for (i = 0, len = target.length; i < len; i++) {
          insTarget = target[i];
          this.instruction(insTarget);
        }
      } else if (isObject(target)) {
        for (insTarget in target) {
          if (!hasProp.call(target, insTarget)) continue;
          insValue = target[insTarget];
          this.instruction(insTarget, insValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        node = new XMLProcessingInstruction(this, target, value);
        this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      }
      return this;
    };

    XMLDocumentCB.prototype.declaration = function(version, encoding, standalone) {
      var node;
      this.openCurrent();
      if (this.documentStarted) {
        throw new Error("declaration() must be the first node.");
      }
      node = new XMLDeclaration(this, version, encoding, standalone);
      this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.doctype = function(root, pubID, sysID) {
      this.openCurrent();
      if (root == null) {
        throw new Error("Missing root node name.");
      }
      if (this.root) {
        throw new Error("dtd() must come before the root node.");
      }
      this.currentNode = new XMLDocType(this, pubID, sysID);
      this.currentNode.rootNodeName = root;
      this.currentNode.children = false;
      this.currentLevel++;
      this.openTags[this.currentLevel] = this.currentNode;
      return this;
    };

    XMLDocumentCB.prototype.dtdElement = function(name, value) {
      var node;
      this.openCurrent();
      node = new XMLDTDElement(this, name, value);
      this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      var node;
      this.openCurrent();
      node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
      this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.entity = function(name, value) {
      var node;
      this.openCurrent();
      node = new XMLDTDEntity(this, false, name, value);
      this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.pEntity = function(name, value) {
      var node;
      this.openCurrent();
      node = new XMLDTDEntity(this, true, name, value);
      this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.notation = function(name, value) {
      var node;
      this.openCurrent();
      node = new XMLDTDNotation(this, name, value);
      this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
      return this;
    };

    XMLDocumentCB.prototype.up = function() {
      if (this.currentLevel < 0) {
        throw new Error("The document node has no parent.");
      }
      if (this.currentNode) {
        if (this.currentNode.children) {
          this.closeNode(this.currentNode);
        } else {
          this.openNode(this.currentNode);
        }
        this.currentNode = null;
      } else {
        this.closeNode(this.openTags[this.currentLevel]);
      }
      delete this.openTags[this.currentLevel];
      this.currentLevel--;
      return this;
    };

    XMLDocumentCB.prototype.end = function() {
      while (this.currentLevel >= 0) {
        this.up();
      }
      return this.onEnd();
    };

    XMLDocumentCB.prototype.openCurrent = function() {
      if (this.currentNode) {
        this.currentNode.children = true;
        return this.openNode(this.currentNode);
      }
    };

    XMLDocumentCB.prototype.openNode = function(node) {
      var att, chunk, name, ref1;
      if (!node.isOpen) {
        if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
          this.root = node;
        }
        chunk = '';
        if (node.type === NodeType.Element) {
          this.writerOptions.state = WriterState.OpenTag;
          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<' + node.name;
          ref1 = node.attribs;
          for (name in ref1) {
            if (!hasProp.call(ref1, name)) continue;
            att = ref1[name];
            chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
          }
          chunk += (node.children ? '>' : '/>') + this.writer.endline(node, this.writerOptions, this.currentLevel);
          this.writerOptions.state = WriterState.InsideTag;
        } else {
          this.writerOptions.state = WriterState.OpenTag;
          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<!DOCTYPE ' + node.rootNodeName;
          if (node.pubID && node.sysID) {
            chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.sysID) {
            chunk += ' SYSTEM "' + node.sysID + '"';
          }
          if (node.children) {
            chunk += ' [';
            this.writerOptions.state = WriterState.InsideTag;
          } else {
            this.writerOptions.state = WriterState.CloseTag;
            chunk += '>';
          }
          chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
        }
        this.onData(chunk, this.currentLevel);
        return node.isOpen = true;
      }
    };

    XMLDocumentCB.prototype.closeNode = function(node) {
      var chunk;
      if (!node.isClosed) {
        chunk = '';
        this.writerOptions.state = WriterState.CloseTag;
        if (node.type === NodeType.Element) {
          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '</' + node.name + '>' + this.writer.endline(node, this.writerOptions, this.currentLevel);
        } else {
          chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + ']>' + this.writer.endline(node, this.writerOptions, this.currentLevel);
        }
        this.writerOptions.state = WriterState.None;
        this.onData(chunk, this.currentLevel);
        return node.isClosed = true;
      }
    };

    XMLDocumentCB.prototype.onData = function(chunk, level) {
      this.documentStarted = true;
      return this.onDataCallback(chunk, level + 1);
    };

    XMLDocumentCB.prototype.onEnd = function() {
      this.documentCompleted = true;
      return this.onEndCallback();
    };

    XMLDocumentCB.prototype.debugInfo = function(name) {
      if (name == null) {
        return "";
      } else {
        return "node: <" + name + ">";
      }
    };

    XMLDocumentCB.prototype.ele = function() {
      return this.element.apply(this, arguments);
    };

    XMLDocumentCB.prototype.nod = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLDocumentCB.prototype.txt = function(value) {
      return this.text(value);
    };

    XMLDocumentCB.prototype.dat = function(value) {
      return this.cdata(value);
    };

    XMLDocumentCB.prototype.com = function(value) {
      return this.comment(value);
    };

    XMLDocumentCB.prototype.ins = function(target, value) {
      return this.instruction(target, value);
    };

    XMLDocumentCB.prototype.dec = function(version, encoding, standalone) {
      return this.declaration(version, encoding, standalone);
    };

    XMLDocumentCB.prototype.dtd = function(root, pubID, sysID) {
      return this.doctype(root, pubID, sysID);
    };

    XMLDocumentCB.prototype.e = function(name, attributes, text) {
      return this.element(name, attributes, text);
    };

    XMLDocumentCB.prototype.n = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLDocumentCB.prototype.t = function(value) {
      return this.text(value);
    };

    XMLDocumentCB.prototype.d = function(value) {
      return this.cdata(value);
    };

    XMLDocumentCB.prototype.c = function(value) {
      return this.comment(value);
    };

    XMLDocumentCB.prototype.r = function(value) {
      return this.raw(value);
    };

    XMLDocumentCB.prototype.i = function(target, value) {
      return this.instruction(target, value);
    };

    XMLDocumentCB.prototype.att = function() {
      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
        return this.attList.apply(this, arguments);
      } else {
        return this.attribute.apply(this, arguments);
      }
    };

    XMLDocumentCB.prototype.a = function() {
      if (this.currentNode && this.currentNode.type === NodeType.DocType) {
        return this.attList.apply(this, arguments);
      } else {
        return this.attribute.apply(this, arguments);
      }
    };

    XMLDocumentCB.prototype.ent = function(name, value) {
      return this.entity(name, value);
    };

    XMLDocumentCB.prototype.pent = function(name, value) {
      return this.pEntity(name, value);
    };

    XMLDocumentCB.prototype.not = function(name, value) {
      return this.notation(name, value);
    };

    return XMLDocumentCB;

  })();

}).call(this);

},{"./NodeType":53,"./Utility":54,"./WriterState":55,"./XMLAttribute":56,"./XMLCData":57,"./XMLComment":59,"./XMLDTDAttList":64,"./XMLDTDElement":65,"./XMLDTDEntity":66,"./XMLDTDNotation":67,"./XMLDeclaration":68,"./XMLDocType":69,"./XMLDocument":70,"./XMLElement":73,"./XMLProcessingInstruction":77,"./XMLRaw":78,"./XMLStringWriter":80,"./XMLStringifier":81,"./XMLText":82}],72:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLDummy, XMLNode,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  module.exports = XMLDummy = (function(superClass) {
    extend(XMLDummy, superClass);

    function XMLDummy(parent) {
      XMLDummy.__super__.constructor.call(this, parent);
      this.type = NodeType.Dummy;
    }

    XMLDummy.prototype.clone = function() {
      return Object.create(this);
    };

    XMLDummy.prototype.toString = function(options) {
      return '';
    };

    return XMLDummy;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],73:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLAttribute, XMLElement, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('./Utility'), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue;

  XMLNode = require('./XMLNode');

  NodeType = require('./NodeType');

  XMLAttribute = require('./XMLAttribute');

  XMLNamedNodeMap = require('./XMLNamedNodeMap');

  module.exports = XMLElement = (function(superClass) {
    extend(XMLElement, superClass);

    function XMLElement(parent, name, attributes) {
      var child, j, len, ref1;
      XMLElement.__super__.constructor.call(this, parent);
      if (name == null) {
        throw new Error("Missing element name. " + this.debugInfo());
      }
      this.name = this.stringify.name(name);
      this.type = NodeType.Element;
      this.attribs = {};
      this.schemaTypeInfo = null;
      if (attributes != null) {
        this.attribute(attributes);
      }
      if (parent.type === NodeType.Document) {
        this.isRoot = true;
        this.documentObject = parent;
        parent.rootObject = this;
        if (parent.children) {
          ref1 = parent.children;
          for (j = 0, len = ref1.length; j < len; j++) {
            child = ref1[j];
            if (child.type === NodeType.DocType) {
              child.name = this.name;
              break;
            }
          }
        }
      }
    }

    Object.defineProperty(XMLElement.prototype, 'tagName', {
      get: function() {
        return this.name;
      }
    });

    Object.defineProperty(XMLElement.prototype, 'namespaceURI', {
      get: function() {
        return '';
      }
    });

    Object.defineProperty(XMLElement.prototype, 'prefix', {
      get: function() {
        return '';
      }
    });

    Object.defineProperty(XMLElement.prototype, 'localName', {
      get: function() {
        return this.name;
      }
    });

    Object.defineProperty(XMLElement.prototype, 'id', {
      get: function() {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    Object.defineProperty(XMLElement.prototype, 'className', {
      get: function() {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    Object.defineProperty(XMLElement.prototype, 'classList', {
      get: function() {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    Object.defineProperty(XMLElement.prototype, 'attributes', {
      get: function() {
        if (!this.attributeMap || !this.attributeMap.nodes) {
          this.attributeMap = new XMLNamedNodeMap(this.attribs);
        }
        return this.attributeMap;
      }
    });

    XMLElement.prototype.clone = function() {
      var att, attName, clonedSelf, ref1;
      clonedSelf = Object.create(this);
      if (clonedSelf.isRoot) {
        clonedSelf.documentObject = null;
      }
      clonedSelf.attribs = {};
      ref1 = this.attribs;
      for (attName in ref1) {
        if (!hasProp.call(ref1, attName)) continue;
        att = ref1[attName];
        clonedSelf.attribs[attName] = att.clone();
      }
      clonedSelf.children = [];
      this.children.forEach(function(child) {
        var clonedChild;
        clonedChild = child.clone();
        clonedChild.parent = clonedSelf;
        return clonedSelf.children.push(clonedChild);
      });
      return clonedSelf;
    };

    XMLElement.prototype.attribute = function(name, value) {
      var attName, attValue;
      if (name != null) {
        name = getValue(name);
      }
      if (isObject(name)) {
        for (attName in name) {
          if (!hasProp.call(name, attName)) continue;
          attValue = name[attName];
          this.attribute(attName, attValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        if (this.options.keepNullAttributes && (value == null)) {
          this.attribs[name] = new XMLAttribute(this, name, "");
        } else if (value != null) {
          this.attribs[name] = new XMLAttribute(this, name, value);
        }
      }
      return this;
    };

    XMLElement.prototype.removeAttribute = function(name) {
      var attName, j, len;
      if (name == null) {
        throw new Error("Missing attribute name. " + this.debugInfo());
      }
      name = getValue(name);
      if (Array.isArray(name)) {
        for (j = 0, len = name.length; j < len; j++) {
          attName = name[j];
          delete this.attribs[attName];
        }
      } else {
        delete this.attribs[name];
      }
      return this;
    };

    XMLElement.prototype.toString = function(options) {
      return this.options.writer.element(this, this.options.writer.filterOptions(options));
    };

    XMLElement.prototype.att = function(name, value) {
      return this.attribute(name, value);
    };

    XMLElement.prototype.a = function(name, value) {
      return this.attribute(name, value);
    };

    XMLElement.prototype.getAttribute = function(name) {
      if (this.attribs.hasOwnProperty(name)) {
        return this.attribs[name].value;
      } else {
        return null;
      }
    };

    XMLElement.prototype.setAttribute = function(name, value) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getAttributeNode = function(name) {
      if (this.attribs.hasOwnProperty(name)) {
        return this.attribs[name];
      } else {
        return null;
      }
    };

    XMLElement.prototype.setAttributeNode = function(newAttr) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.removeAttributeNode = function(oldAttr) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getElementsByTagName = function(name) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getAttributeNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.removeAttributeNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.setAttributeNodeNS = function(newAttr) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.hasAttribute = function(name) {
      return this.attribs.hasOwnProperty(name);
    };

    XMLElement.prototype.hasAttributeNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.setIdAttribute = function(name, isId) {
      if (this.attribs.hasOwnProperty(name)) {
        return this.attribs[name].isId;
      } else {
        return isId;
      }
    };

    XMLElement.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.setIdAttributeNode = function(idAttr, isId) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getElementsByTagName = function(tagname) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.getElementsByClassName = function(classNames) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLElement.prototype.isEqualNode = function(node) {
      var i, j, ref1;
      if (!XMLElement.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
        return false;
      }
      if (node.namespaceURI !== this.namespaceURI) {
        return false;
      }
      if (node.prefix !== this.prefix) {
        return false;
      }
      if (node.localName !== this.localName) {
        return false;
      }
      if (node.attribs.length !== this.attribs.length) {
        return false;
      }
      for (i = j = 0, ref1 = this.attribs.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
        if (!this.attribs[i].isEqualNode(node.attribs[i])) {
          return false;
        }
      }
      return true;
    };

    return XMLElement;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./Utility":54,"./XMLAttribute":56,"./XMLNamedNodeMap":74,"./XMLNode":75}],74:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLNamedNodeMap;

  module.exports = XMLNamedNodeMap = (function() {
    function XMLNamedNodeMap(nodes) {
      this.nodes = nodes;
    }

    Object.defineProperty(XMLNamedNodeMap.prototype, 'length', {
      get: function() {
        return Object.keys(this.nodes).length || 0;
      }
    });

    XMLNamedNodeMap.prototype.clone = function() {
      return this.nodes = null;
    };

    XMLNamedNodeMap.prototype.getNamedItem = function(name) {
      return this.nodes[name];
    };

    XMLNamedNodeMap.prototype.setNamedItem = function(node) {
      var oldNode;
      oldNode = this.nodes[node.nodeName];
      this.nodes[node.nodeName] = node;
      return oldNode || null;
    };

    XMLNamedNodeMap.prototype.removeNamedItem = function(name) {
      var oldNode;
      oldNode = this.nodes[name];
      delete this.nodes[name];
      return oldNode || null;
    };

    XMLNamedNodeMap.prototype.item = function(index) {
      return this.nodes[Object.keys(this.nodes)[index]] || null;
    };

    XMLNamedNodeMap.prototype.getNamedItemNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented.");
    };

    XMLNamedNodeMap.prototype.setNamedItemNS = function(node) {
      throw new Error("This DOM method is not implemented.");
    };

    XMLNamedNodeMap.prototype.removeNamedItemNS = function(namespaceURI, localName) {
      throw new Error("This DOM method is not implemented.");
    };

    return XMLNamedNodeMap;

  })();

}).call(this);

},{}],75:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNamedNodeMap, XMLNode, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref1,
    hasProp = {}.hasOwnProperty;

  ref1 = require('./Utility'), isObject = ref1.isObject, isFunction = ref1.isFunction, isEmpty = ref1.isEmpty, getValue = ref1.getValue;

  XMLElement = null;

  XMLCData = null;

  XMLComment = null;

  XMLDeclaration = null;

  XMLDocType = null;

  XMLRaw = null;

  XMLText = null;

  XMLProcessingInstruction = null;

  XMLDummy = null;

  NodeType = null;

  XMLNodeList = null;

  XMLNamedNodeMap = null;

  DocumentPosition = null;

  module.exports = XMLNode = (function() {
    function XMLNode(parent1) {
      this.parent = parent1;
      if (this.parent) {
        this.options = this.parent.options;
        this.stringify = this.parent.stringify;
      }
      this.value = null;
      this.children = [];
      this.baseURI = null;
      if (!XMLElement) {
        XMLElement = require('./XMLElement');
        XMLCData = require('./XMLCData');
        XMLComment = require('./XMLComment');
        XMLDeclaration = require('./XMLDeclaration');
        XMLDocType = require('./XMLDocType');
        XMLRaw = require('./XMLRaw');
        XMLText = require('./XMLText');
        XMLProcessingInstruction = require('./XMLProcessingInstruction');
        XMLDummy = require('./XMLDummy');
        NodeType = require('./NodeType');
        XMLNodeList = require('./XMLNodeList');
        XMLNamedNodeMap = require('./XMLNamedNodeMap');
        DocumentPosition = require('./DocumentPosition');
      }
    }

    Object.defineProperty(XMLNode.prototype, 'nodeName', {
      get: function() {
        return this.name;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'nodeType', {
      get: function() {
        return this.type;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'nodeValue', {
      get: function() {
        return this.value;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'parentNode', {
      get: function() {
        return this.parent;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'childNodes', {
      get: function() {
        if (!this.childNodeList || !this.childNodeList.nodes) {
          this.childNodeList = new XMLNodeList(this.children);
        }
        return this.childNodeList;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'firstChild', {
      get: function() {
        return this.children[0] || null;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'lastChild', {
      get: function() {
        return this.children[this.children.length - 1] || null;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'previousSibling', {
      get: function() {
        var i;
        i = this.parent.children.indexOf(this);
        return this.parent.children[i - 1] || null;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'nextSibling', {
      get: function() {
        var i;
        i = this.parent.children.indexOf(this);
        return this.parent.children[i + 1] || null;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'ownerDocument', {
      get: function() {
        return this.document() || null;
      }
    });

    Object.defineProperty(XMLNode.prototype, 'textContent', {
      get: function() {
        var child, j, len, ref2, str;
        if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
          str = '';
          ref2 = this.children;
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            if (child.textContent) {
              str += child.textContent;
            }
          }
          return str;
        } else {
          return null;
        }
      },
      set: function(value) {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    XMLNode.prototype.setParent = function(parent) {
      var child, j, len, ref2, results;
      this.parent = parent;
      if (parent) {
        this.options = parent.options;
        this.stringify = parent.stringify;
      }
      ref2 = this.children;
      results = [];
      for (j = 0, len = ref2.length; j < len; j++) {
        child = ref2[j];
        results.push(child.setParent(this));
      }
      return results;
    };

    XMLNode.prototype.element = function(name, attributes, text) {
      var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val;
      lastChild = null;
      if (attributes === null && (text == null)) {
        ref2 = [{}, null], attributes = ref2[0], text = ref2[1];
      }
      if (attributes == null) {
        attributes = {};
      }
      attributes = getValue(attributes);
      if (!isObject(attributes)) {
        ref3 = [attributes, text], text = ref3[0], attributes = ref3[1];
      }
      if (name != null) {
        name = getValue(name);
      }
      if (Array.isArray(name)) {
        for (j = 0, len = name.length; j < len; j++) {
          item = name[j];
          lastChild = this.element(item);
        }
      } else if (isFunction(name)) {
        lastChild = this.element(name.apply());
      } else if (isObject(name)) {
        for (key in name) {
          if (!hasProp.call(name, key)) continue;
          val = name[key];
          if (isFunction(val)) {
            val = val.apply();
          }
          if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
            lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
          } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
            lastChild = this.dummy();
          } else if (isObject(val) && isEmpty(val)) {
            lastChild = this.element(key);
          } else if (!this.options.keepNullNodes && (val == null)) {
            lastChild = this.dummy();
          } else if (!this.options.separateArrayItems && Array.isArray(val)) {
            for (k = 0, len1 = val.length; k < len1; k++) {
              item = val[k];
              childNode = {};
              childNode[key] = item;
              lastChild = this.element(childNode);
            }
          } else if (isObject(val)) {
            if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
              lastChild = this.element(val);
            } else {
              lastChild = this.element(key);
              lastChild.element(val);
            }
          } else {
            lastChild = this.element(key, val);
          }
        }
      } else if (!this.options.keepNullNodes && text === null) {
        lastChild = this.dummy();
      } else {
        if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
          lastChild = this.text(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
          lastChild = this.cdata(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
          lastChild = this.comment(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
          lastChild = this.raw(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
          lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
        } else {
          lastChild = this.node(name, attributes, text);
        }
      }
      if (lastChild == null) {
        throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
      }
      return lastChild;
    };

    XMLNode.prototype.insertBefore = function(name, attributes, text) {
      var child, i, newChild, refChild, removed;
      if (name != null ? name.type : void 0) {
        newChild = name;
        refChild = attributes;
        newChild.setParent(this);
        if (refChild) {
          i = children.indexOf(refChild);
          removed = children.splice(i);
          children.push(newChild);
          Array.prototype.push.apply(children, removed);
        } else {
          children.push(newChild);
        }
        return newChild;
      } else {
        if (this.isRoot) {
          throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
        }
        i = this.parent.children.indexOf(this);
        removed = this.parent.children.splice(i);
        child = this.parent.element(name, attributes, text);
        Array.prototype.push.apply(this.parent.children, removed);
        return child;
      }
    };

    XMLNode.prototype.insertAfter = function(name, attributes, text) {
      var child, i, removed;
      if (this.isRoot) {
        throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
      }
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i + 1);
      child = this.parent.element(name, attributes, text);
      Array.prototype.push.apply(this.parent.children, removed);
      return child;
    };

    XMLNode.prototype.remove = function() {
      var i, ref2;
      if (this.isRoot) {
        throw new Error("Cannot remove the root element. " + this.debugInfo());
      }
      i = this.parent.children.indexOf(this);
      [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref2 = [])), ref2;
      return this.parent;
    };

    XMLNode.prototype.node = function(name, attributes, text) {
      var child, ref2;
      if (name != null) {
        name = getValue(name);
      }
      attributes || (attributes = {});
      attributes = getValue(attributes);
      if (!isObject(attributes)) {
        ref2 = [attributes, text], text = ref2[0], attributes = ref2[1];
      }
      child = new XMLElement(this, name, attributes);
      if (text != null) {
        child.text(text);
      }
      this.children.push(child);
      return child;
    };

    XMLNode.prototype.text = function(value) {
      var child;
      if (isObject(value)) {
        this.element(value);
      }
      child = new XMLText(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.cdata = function(value) {
      var child;
      child = new XMLCData(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.comment = function(value) {
      var child;
      child = new XMLComment(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.commentBefore = function(value) {
      var child, i, removed;
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i);
      child = this.parent.comment(value);
      Array.prototype.push.apply(this.parent.children, removed);
      return this;
    };

    XMLNode.prototype.commentAfter = function(value) {
      var child, i, removed;
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i + 1);
      child = this.parent.comment(value);
      Array.prototype.push.apply(this.parent.children, removed);
      return this;
    };

    XMLNode.prototype.raw = function(value) {
      var child;
      child = new XMLRaw(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.dummy = function() {
      var child;
      child = new XMLDummy(this);
      return child;
    };

    XMLNode.prototype.instruction = function(target, value) {
      var insTarget, insValue, instruction, j, len;
      if (target != null) {
        target = getValue(target);
      }
      if (value != null) {
        value = getValue(value);
      }
      if (Array.isArray(target)) {
        for (j = 0, len = target.length; j < len; j++) {
          insTarget = target[j];
          this.instruction(insTarget);
        }
      } else if (isObject(target)) {
        for (insTarget in target) {
          if (!hasProp.call(target, insTarget)) continue;
          insValue = target[insTarget];
          this.instruction(insTarget, insValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        instruction = new XMLProcessingInstruction(this, target, value);
        this.children.push(instruction);
      }
      return this;
    };

    XMLNode.prototype.instructionBefore = function(target, value) {
      var child, i, removed;
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i);
      child = this.parent.instruction(target, value);
      Array.prototype.push.apply(this.parent.children, removed);
      return this;
    };

    XMLNode.prototype.instructionAfter = function(target, value) {
      var child, i, removed;
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i + 1);
      child = this.parent.instruction(target, value);
      Array.prototype.push.apply(this.parent.children, removed);
      return this;
    };

    XMLNode.prototype.declaration = function(version, encoding, standalone) {
      var doc, xmldec;
      doc = this.document();
      xmldec = new XMLDeclaration(doc, version, encoding, standalone);
      if (doc.children.length === 0) {
        doc.children.unshift(xmldec);
      } else if (doc.children[0].type === NodeType.Declaration) {
        doc.children[0] = xmldec;
      } else {
        doc.children.unshift(xmldec);
      }
      return doc.root() || doc;
    };

    XMLNode.prototype.dtd = function(pubID, sysID) {
      var child, doc, doctype, i, j, k, len, len1, ref2, ref3;
      doc = this.document();
      doctype = new XMLDocType(doc, pubID, sysID);
      ref2 = doc.children;
      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
        child = ref2[i];
        if (child.type === NodeType.DocType) {
          doc.children[i] = doctype;
          return doctype;
        }
      }
      ref3 = doc.children;
      for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
        child = ref3[i];
        if (child.isRoot) {
          doc.children.splice(i, 0, doctype);
          return doctype;
        }
      }
      doc.children.push(doctype);
      return doctype;
    };

    XMLNode.prototype.up = function() {
      if (this.isRoot) {
        throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
      }
      return this.parent;
    };

    XMLNode.prototype.root = function() {
      var node;
      node = this;
      while (node) {
        if (node.type === NodeType.Document) {
          return node.rootObject;
        } else if (node.isRoot) {
          return node;
        } else {
          node = node.parent;
        }
      }
    };

    XMLNode.prototype.document = function() {
      var node;
      node = this;
      while (node) {
        if (node.type === NodeType.Document) {
          return node;
        } else {
          node = node.parent;
        }
      }
    };

    XMLNode.prototype.end = function(options) {
      return this.document().end(options);
    };

    XMLNode.prototype.prev = function() {
      var i;
      i = this.parent.children.indexOf(this);
      if (i < 1) {
        throw new Error("Already at the first node. " + this.debugInfo());
      }
      return this.parent.children[i - 1];
    };

    XMLNode.prototype.next = function() {
      var i;
      i = this.parent.children.indexOf(this);
      if (i === -1 || i === this.parent.children.length - 1) {
        throw new Error("Already at the last node. " + this.debugInfo());
      }
      return this.parent.children[i + 1];
    };

    XMLNode.prototype.importDocument = function(doc) {
      var clonedRoot;
      clonedRoot = doc.root().clone();
      clonedRoot.parent = this;
      clonedRoot.isRoot = false;
      this.children.push(clonedRoot);
      return this;
    };

    XMLNode.prototype.debugInfo = function(name) {
      var ref2, ref3;
      name = name || this.name;
      if ((name == null) && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
        return "";
      } else if (name == null) {
        return "parent: <" + this.parent.name + ">";
      } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
        return "node: <" + name + ">";
      } else {
        return "node: <" + name + ">, parent: <" + this.parent.name + ">";
      }
    };

    XMLNode.prototype.ele = function(name, attributes, text) {
      return this.element(name, attributes, text);
    };

    XMLNode.prototype.nod = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLNode.prototype.txt = function(value) {
      return this.text(value);
    };

    XMLNode.prototype.dat = function(value) {
      return this.cdata(value);
    };

    XMLNode.prototype.com = function(value) {
      return this.comment(value);
    };

    XMLNode.prototype.ins = function(target, value) {
      return this.instruction(target, value);
    };

    XMLNode.prototype.doc = function() {
      return this.document();
    };

    XMLNode.prototype.dec = function(version, encoding, standalone) {
      return this.declaration(version, encoding, standalone);
    };

    XMLNode.prototype.e = function(name, attributes, text) {
      return this.element(name, attributes, text);
    };

    XMLNode.prototype.n = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLNode.prototype.t = function(value) {
      return this.text(value);
    };

    XMLNode.prototype.d = function(value) {
      return this.cdata(value);
    };

    XMLNode.prototype.c = function(value) {
      return this.comment(value);
    };

    XMLNode.prototype.r = function(value) {
      return this.raw(value);
    };

    XMLNode.prototype.i = function(target, value) {
      return this.instruction(target, value);
    };

    XMLNode.prototype.u = function() {
      return this.up();
    };

    XMLNode.prototype.importXMLBuilder = function(doc) {
      return this.importDocument(doc);
    };

    XMLNode.prototype.replaceChild = function(newChild, oldChild) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.removeChild = function(oldChild) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.appendChild = function(newChild) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.hasChildNodes = function() {
      return this.children.length !== 0;
    };

    XMLNode.prototype.cloneNode = function(deep) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.normalize = function() {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.isSupported = function(feature, version) {
      return true;
    };

    XMLNode.prototype.hasAttributes = function() {
      return this.attribs.length !== 0;
    };

    XMLNode.prototype.compareDocumentPosition = function(other) {
      var ref, res;
      ref = this;
      if (ref === other) {
        return 0;
      } else if (this.document() !== other.document()) {
        res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
        if (Math.random() < 0.5) {
          res |= DocumentPosition.Preceding;
        } else {
          res |= DocumentPosition.Following;
        }
        return res;
      } else if (ref.isAncestor(other)) {
        return DocumentPosition.Contains | DocumentPosition.Preceding;
      } else if (ref.isDescendant(other)) {
        return DocumentPosition.Contains | DocumentPosition.Following;
      } else if (ref.isPreceding(other)) {
        return DocumentPosition.Preceding;
      } else {
        return DocumentPosition.Following;
      }
    };

    XMLNode.prototype.isSameNode = function(other) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.lookupPrefix = function(namespaceURI) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.isDefaultNamespace = function(namespaceURI) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.lookupNamespaceURI = function(prefix) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.isEqualNode = function(node) {
      var i, j, ref2;
      if (node.nodeType !== this.nodeType) {
        return false;
      }
      if (node.children.length !== this.children.length) {
        return false;
      }
      for (i = j = 0, ref2 = this.children.length - 1; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
        if (!this.children[i].isEqualNode(node.children[i])) {
          return false;
        }
      }
      return true;
    };

    XMLNode.prototype.getFeature = function(feature, version) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.setUserData = function(key, data, handler) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.getUserData = function(key) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLNode.prototype.contains = function(other) {
      if (!other) {
        return false;
      }
      return other === this || this.isDescendant(other);
    };

    XMLNode.prototype.isDescendant = function(node) {
      var child, isDescendantChild, j, len, ref2;
      ref2 = this.children;
      for (j = 0, len = ref2.length; j < len; j++) {
        child = ref2[j];
        if (node === child) {
          return true;
        }
        isDescendantChild = child.isDescendant(node);
        if (isDescendantChild) {
          return true;
        }
      }
      return false;
    };

    XMLNode.prototype.isAncestor = function(node) {
      return node.isDescendant(this);
    };

    XMLNode.prototype.isPreceding = function(node) {
      var nodePos, thisPos;
      nodePos = this.treePosition(node);
      thisPos = this.treePosition(this);
      if (nodePos === -1 || thisPos === -1) {
        return false;
      } else {
        return nodePos < thisPos;
      }
    };

    XMLNode.prototype.isFollowing = function(node) {
      var nodePos, thisPos;
      nodePos = this.treePosition(node);
      thisPos = this.treePosition(this);
      if (nodePos === -1 || thisPos === -1) {
        return false;
      } else {
        return nodePos > thisPos;
      }
    };

    XMLNode.prototype.treePosition = function(node) {
      var found, pos;
      pos = 0;
      found = false;
      this.foreachTreeNode(this.document(), function(childNode) {
        pos++;
        if (!found && childNode === node) {
          return found = true;
        }
      });
      if (found) {
        return pos;
      } else {
        return -1;
      }
    };

    XMLNode.prototype.foreachTreeNode = function(node, func) {
      var child, j, len, ref2, res;
      node || (node = this.document());
      ref2 = node.children;
      for (j = 0, len = ref2.length; j < len; j++) {
        child = ref2[j];
        if (res = func(child)) {
          return res;
        } else {
          res = this.foreachTreeNode(child, func);
          if (res) {
            return res;
          }
        }
      }
    };

    return XMLNode;

  })();

}).call(this);

},{"./DocumentPosition":52,"./NodeType":53,"./Utility":54,"./XMLCData":57,"./XMLComment":59,"./XMLDeclaration":68,"./XMLDocType":69,"./XMLDummy":72,"./XMLElement":73,"./XMLNamedNodeMap":74,"./XMLNodeList":76,"./XMLProcessingInstruction":77,"./XMLRaw":78,"./XMLText":82}],76:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLNodeList;

  module.exports = XMLNodeList = (function() {
    function XMLNodeList(nodes) {
      this.nodes = nodes;
    }

    Object.defineProperty(XMLNodeList.prototype, 'length', {
      get: function() {
        return this.nodes.length || 0;
      }
    });

    XMLNodeList.prototype.clone = function() {
      return this.nodes = null;
    };

    XMLNodeList.prototype.item = function(index) {
      return this.nodes[index] || null;
    };

    return XMLNodeList;

  })();

}).call(this);

},{}],77:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLCharacterData, XMLProcessingInstruction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLCharacterData = require('./XMLCharacterData');

  module.exports = XMLProcessingInstruction = (function(superClass) {
    extend(XMLProcessingInstruction, superClass);

    function XMLProcessingInstruction(parent, target, value) {
      XMLProcessingInstruction.__super__.constructor.call(this, parent);
      if (target == null) {
        throw new Error("Missing instruction target. " + this.debugInfo());
      }
      this.type = NodeType.ProcessingInstruction;
      this.target = this.stringify.insTarget(target);
      this.name = this.target;
      if (value) {
        this.value = this.stringify.insValue(value);
      }
    }

    XMLProcessingInstruction.prototype.clone = function() {
      return Object.create(this);
    };

    XMLProcessingInstruction.prototype.toString = function(options) {
      return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options));
    };

    XMLProcessingInstruction.prototype.isEqualNode = function(node) {
      if (!XMLProcessingInstruction.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
        return false;
      }
      if (node.target !== this.target) {
        return false;
      }
      return true;
    };

    return XMLProcessingInstruction;

  })(XMLCharacterData);

}).call(this);

},{"./NodeType":53,"./XMLCharacterData":58}],78:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLNode, XMLRaw,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLNode = require('./XMLNode');

  module.exports = XMLRaw = (function(superClass) {
    extend(XMLRaw, superClass);

    function XMLRaw(parent, text) {
      XMLRaw.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing raw text. " + this.debugInfo());
      }
      this.type = NodeType.Raw;
      this.value = this.stringify.raw(text);
    }

    XMLRaw.prototype.clone = function() {
      return Object.create(this);
    };

    XMLRaw.prototype.toString = function(options) {
      return this.options.writer.raw(this, this.options.writer.filterOptions(options));
    };

    return XMLRaw;

  })(XMLNode);

}).call(this);

},{"./NodeType":53,"./XMLNode":75}],79:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, WriterState, XMLStreamWriter, XMLWriterBase,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLWriterBase = require('./XMLWriterBase');

  WriterState = require('./WriterState');

  module.exports = XMLStreamWriter = (function(superClass) {
    extend(XMLStreamWriter, superClass);

    function XMLStreamWriter(stream, options) {
      this.stream = stream;
      XMLStreamWriter.__super__.constructor.call(this, options);
    }

    XMLStreamWriter.prototype.endline = function(node, options, level) {
      if (node.isLastRootNode && options.state === WriterState.CloseTag) {
        return '';
      } else {
        return XMLStreamWriter.__super__.endline.call(this, node, options, level);
      }
    };

    XMLStreamWriter.prototype.document = function(doc, options) {
      var child, i, j, k, len, len1, ref, ref1, results;
      ref = doc.children;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        child = ref[i];
        child.isLastRootNode = i === doc.children.length - 1;
      }
      options = this.filterOptions(options);
      ref1 = doc.children;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        child = ref1[k];
        results.push(this.writeChildNode(child, options, 0));
      }
      return results;
    };

    XMLStreamWriter.prototype.attribute = function(att, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.attribute.call(this, att, options, level));
    };

    XMLStreamWriter.prototype.cdata = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.cdata.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.comment = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.comment.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.declaration = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.declaration.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.docType = function(node, options, level) {
      var child, j, len, ref;
      level || (level = 0);
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      this.stream.write(this.indent(node, options, level));
      this.stream.write('<!DOCTYPE ' + node.root().name);
      if (node.pubID && node.sysID) {
        this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
      } else if (node.sysID) {
        this.stream.write(' SYSTEM "' + node.sysID + '"');
      }
      if (node.children.length > 0) {
        this.stream.write(' [');
        this.stream.write(this.endline(node, options, level));
        options.state = WriterState.InsideTag;
        ref = node.children;
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          this.writeChildNode(child, options, level + 1);
        }
        options.state = WriterState.CloseTag;
        this.stream.write(']');
      }
      options.state = WriterState.CloseTag;
      this.stream.write(options.spaceBeforeSlash + '>');
      this.stream.write(this.endline(node, options, level));
      options.state = WriterState.None;
      return this.closeNode(node, options, level);
    };

    XMLStreamWriter.prototype.element = function(node, options, level) {
      var att, child, childNodeCount, firstChildNode, j, len, name, prettySuppressed, ref, ref1;
      level || (level = 0);
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      this.stream.write(this.indent(node, options, level) + '<' + node.name);
      ref = node.attribs;
      for (name in ref) {
        if (!hasProp.call(ref, name)) continue;
        att = ref[name];
        this.attribute(att, options, level);
      }
      childNodeCount = node.children.length;
      firstChildNode = childNodeCount === 0 ? null : node.children[0];
      if (childNodeCount === 0 || node.children.every(function(e) {
        return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === '';
      })) {
        if (options.allowEmpty) {
          this.stream.write('>');
          options.state = WriterState.CloseTag;
          this.stream.write('</' + node.name + '>');
        } else {
          options.state = WriterState.CloseTag;
          this.stream.write(options.spaceBeforeSlash + '/>');
        }
      } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && (firstChildNode.value != null)) {
        this.stream.write('>');
        options.state = WriterState.InsideTag;
        options.suppressPrettyCount++;
        prettySuppressed = true;
        this.writeChildNode(firstChildNode, options, level + 1);
        options.suppressPrettyCount--;
        prettySuppressed = false;
        options.state = WriterState.CloseTag;
        this.stream.write('</' + node.name + '>');
      } else {
        this.stream.write('>' + this.endline(node, options, level));
        options.state = WriterState.InsideTag;
        ref1 = node.children;
        for (j = 0, len = ref1.length; j < len; j++) {
          child = ref1[j];
          this.writeChildNode(child, options, level + 1);
        }
        options.state = WriterState.CloseTag;
        this.stream.write(this.indent(node, options, level) + '</' + node.name + '>');
      }
      this.stream.write(this.endline(node, options, level));
      options.state = WriterState.None;
      return this.closeNode(node, options, level);
    };

    XMLStreamWriter.prototype.processingInstruction = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.processingInstruction.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.raw = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.raw.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.text = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.text.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.dtdAttList = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.dtdAttList.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.dtdElement = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.dtdElement.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.dtdEntity = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.dtdEntity.call(this, node, options, level));
    };

    XMLStreamWriter.prototype.dtdNotation = function(node, options, level) {
      return this.stream.write(XMLStreamWriter.__super__.dtdNotation.call(this, node, options, level));
    };

    return XMLStreamWriter;

  })(XMLWriterBase);

}).call(this);

},{"./NodeType":53,"./WriterState":55,"./XMLWriterBase":83}],80:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLStringWriter, XMLWriterBase,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  XMLWriterBase = require('./XMLWriterBase');

  module.exports = XMLStringWriter = (function(superClass) {
    extend(XMLStringWriter, superClass);

    function XMLStringWriter(options) {
      XMLStringWriter.__super__.constructor.call(this, options);
    }

    XMLStringWriter.prototype.document = function(doc, options) {
      var child, i, len, r, ref;
      options = this.filterOptions(options);
      r = '';
      ref = doc.children;
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        r += this.writeChildNode(child, options, 0);
      }
      if (options.pretty && r.slice(-options.newline.length) === options.newline) {
        r = r.slice(0, -options.newline.length);
      }
      return r;
    };

    return XMLStringWriter;

  })(XMLWriterBase);

}).call(this);

},{"./XMLWriterBase":83}],81:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var XMLStringifier,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    hasProp = {}.hasOwnProperty;

  module.exports = XMLStringifier = (function() {
    function XMLStringifier(options) {
      this.assertLegalName = bind(this.assertLegalName, this);
      this.assertLegalChar = bind(this.assertLegalChar, this);
      var key, ref, value;
      options || (options = {});
      this.options = options;
      if (!this.options.version) {
        this.options.version = '1.0';
      }
      ref = options.stringify || {};
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this[key] = value;
      }
    }

    XMLStringifier.prototype.name = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalName('' + val || '');
    };

    XMLStringifier.prototype.text = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar(this.textEscape('' + val || ''));
    };

    XMLStringifier.prototype.cdata = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      val = '' + val || '';
      val = val.replace(']]>', ']]]]><![CDATA[>');
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.comment = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      val = '' + val || '';
      if (val.match(/--/)) {
        throw new Error("Comment text cannot contain double-hypen: " + val);
      }
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.raw = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return '' + val || '';
    };

    XMLStringifier.prototype.attValue = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar(this.attEscape(val = '' + val || ''));
    };

    XMLStringifier.prototype.insTarget = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.insValue = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      val = '' + val || '';
      if (val.match(/\?>/)) {
        throw new Error("Invalid processing instruction value: " + val);
      }
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.xmlVersion = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      val = '' + val || '';
      if (!val.match(/1\.[0-9]+/)) {
        throw new Error("Invalid version number: " + val);
      }
      return val;
    };

    XMLStringifier.prototype.xmlEncoding = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      val = '' + val || '';
      if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
        throw new Error("Invalid encoding: " + val);
      }
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.xmlStandalone = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      if (val) {
        return "yes";
      } else {
        return "no";
      }
    };

    XMLStringifier.prototype.dtdPubID = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdSysID = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdElementValue = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdAttType = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdAttDefault = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdEntityValue = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.dtdNData = function(val) {
      if (this.options.noValidation) {
        return val;
      }
      return this.assertLegalChar('' + val || '');
    };

    XMLStringifier.prototype.convertAttKey = '@';

    XMLStringifier.prototype.convertPIKey = '?';

    XMLStringifier.prototype.convertTextKey = '#text';

    XMLStringifier.prototype.convertCDataKey = '#cdata';

    XMLStringifier.prototype.convertCommentKey = '#comment';

    XMLStringifier.prototype.convertRawKey = '#raw';

    XMLStringifier.prototype.assertLegalChar = function(str) {
      var regex, res;
      if (this.options.noValidation) {
        return str;
      }
      regex = '';
      if (this.options.version === '1.0') {
        regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
        if (res = str.match(regex)) {
          throw new Error("Invalid character in string: " + str + " at index " + res.index);
        }
      } else if (this.options.version === '1.1') {
        regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
        if (res = str.match(regex)) {
          throw new Error("Invalid character in string: " + str + " at index " + res.index);
        }
      }
      return str;
    };

    XMLStringifier.prototype.assertLegalName = function(str) {
      var regex;
      if (this.options.noValidation) {
        return str;
      }
      this.assertLegalChar(str);
      regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
      if (!str.match(regex)) {
        throw new Error("Invalid character in name");
      }
      return str;
    };

    XMLStringifier.prototype.textEscape = function(str) {
      var ampregex;
      if (this.options.noValidation) {
        return str;
      }
      ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
    };

    XMLStringifier.prototype.attEscape = function(str) {
      var ampregex;
      if (this.options.noValidation) {
        return str;
      }
      ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;');
    };

    return XMLStringifier;

  })();

}).call(this);

},{}],82:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, XMLCharacterData, XMLText,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NodeType = require('./NodeType');

  XMLCharacterData = require('./XMLCharacterData');

  module.exports = XMLText = (function(superClass) {
    extend(XMLText, superClass);

    function XMLText(parent, text) {
      XMLText.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing element text. " + this.debugInfo());
      }
      this.name = "#text";
      this.type = NodeType.Text;
      this.value = this.stringify.text(text);
    }

    Object.defineProperty(XMLText.prototype, 'isElementContentWhitespace', {
      get: function() {
        throw new Error("This DOM method is not implemented." + this.debugInfo());
      }
    });

    Object.defineProperty(XMLText.prototype, 'wholeText', {
      get: function() {
        var next, prev, str;
        str = '';
        prev = this.previousSibling;
        while (prev) {
          str = prev.data + str;
          prev = prev.previousSibling;
        }
        str += this.data;
        next = this.nextSibling;
        while (next) {
          str = str + next.data;
          next = next.nextSibling;
        }
        return str;
      }
    });

    XMLText.prototype.clone = function() {
      return Object.create(this);
    };

    XMLText.prototype.toString = function(options) {
      return this.options.writer.text(this, this.options.writer.filterOptions(options));
    };

    XMLText.prototype.splitText = function(offset) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    XMLText.prototype.replaceWholeText = function(content) {
      throw new Error("This DOM method is not implemented." + this.debugInfo());
    };

    return XMLText;

  })(XMLCharacterData);

}).call(this);

},{"./NodeType":53,"./XMLCharacterData":58}],83:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, WriterState, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, assign,
    hasProp = {}.hasOwnProperty;

  assign = require('./Utility').assign;

  NodeType = require('./NodeType');

  XMLDeclaration = require('./XMLDeclaration');

  XMLDocType = require('./XMLDocType');

  XMLCData = require('./XMLCData');

  XMLComment = require('./XMLComment');

  XMLElement = require('./XMLElement');

  XMLRaw = require('./XMLRaw');

  XMLText = require('./XMLText');

  XMLProcessingInstruction = require('./XMLProcessingInstruction');

  XMLDummy = require('./XMLDummy');

  XMLDTDAttList = require('./XMLDTDAttList');

  XMLDTDElement = require('./XMLDTDElement');

  XMLDTDEntity = require('./XMLDTDEntity');

  XMLDTDNotation = require('./XMLDTDNotation');

  WriterState = require('./WriterState');

  module.exports = XMLWriterBase = (function() {
    function XMLWriterBase(options) {
      var key, ref, value;
      options || (options = {});
      this.options = options;
      ref = options.writer || {};
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this["_" + key] = this[key];
        this[key] = value;
      }
    }

    XMLWriterBase.prototype.filterOptions = function(options) {
      var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6;
      options || (options = {});
      options = assign({}, this.options, options);
      filteredOptions = {
        writer: this
      };
      filteredOptions.pretty = options.pretty || false;
      filteredOptions.allowEmpty = options.allowEmpty || false;
      filteredOptions.indent = (ref = options.indent) != null ? ref : '  ';
      filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : '\n';
      filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0;
      filteredOptions.dontPrettyTextNodes = (ref3 = (ref4 = options.dontPrettyTextNodes) != null ? ref4 : options.dontprettytextnodes) != null ? ref3 : 0;
      filteredOptions.spaceBeforeSlash = (ref5 = (ref6 = options.spaceBeforeSlash) != null ? ref6 : options.spacebeforeslash) != null ? ref5 : '';
      if (filteredOptions.spaceBeforeSlash === true) {
        filteredOptions.spaceBeforeSlash = ' ';
      }
      filteredOptions.suppressPrettyCount = 0;
      filteredOptions.user = {};
      filteredOptions.state = WriterState.None;
      return filteredOptions;
    };

    XMLWriterBase.prototype.indent = function(node, options, level) {
      var indentLevel;
      if (!options.pretty || options.suppressPrettyCount) {
        return '';
      } else if (options.pretty) {
        indentLevel = (level || 0) + options.offset + 1;
        if (indentLevel > 0) {
          return new Array(indentLevel).join(options.indent);
        }
      }
      return '';
    };

    XMLWriterBase.prototype.endline = function(node, options, level) {
      if (!options.pretty || options.suppressPrettyCount) {
        return '';
      } else {
        return options.newline;
      }
    };

    XMLWriterBase.prototype.attribute = function(att, options, level) {
      var r;
      this.openAttribute(att, options, level);
      r = ' ' + att.name + '="' + att.value + '"';
      this.closeAttribute(att, options, level);
      return r;
    };

    XMLWriterBase.prototype.cdata = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<![CDATA[';
      options.state = WriterState.InsideTag;
      r += node.value;
      options.state = WriterState.CloseTag;
      r += ']]>' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.comment = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<!-- ';
      options.state = WriterState.InsideTag;
      r += node.value;
      options.state = WriterState.CloseTag;
      r += ' -->' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.declaration = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<?xml';
      options.state = WriterState.InsideTag;
      r += ' version="' + node.version + '"';
      if (node.encoding != null) {
        r += ' encoding="' + node.encoding + '"';
      }
      if (node.standalone != null) {
        r += ' standalone="' + node.standalone + '"';
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '?>';
      r += this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.docType = function(node, options, level) {
      var child, i, len, r, ref;
      level || (level = 0);
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level);
      r += '<!DOCTYPE ' + node.root().name;
      if (node.pubID && node.sysID) {
        r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
      } else if (node.sysID) {
        r += ' SYSTEM "' + node.sysID + '"';
      }
      if (node.children.length > 0) {
        r += ' [';
        r += this.endline(node, options, level);
        options.state = WriterState.InsideTag;
        ref = node.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          r += this.writeChildNode(child, options, level + 1);
        }
        options.state = WriterState.CloseTag;
        r += ']';
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '>';
      r += this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.element = function(node, options, level) {
      var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2;
      level || (level = 0);
      prettySuppressed = false;
      r = '';
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r += this.indent(node, options, level) + '<' + node.name;
      ref = node.attribs;
      for (name in ref) {
        if (!hasProp.call(ref, name)) continue;
        att = ref[name];
        r += this.attribute(att, options, level);
      }
      childNodeCount = node.children.length;
      firstChildNode = childNodeCount === 0 ? null : node.children[0];
      if (childNodeCount === 0 || node.children.every(function(e) {
        return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === '';
      })) {
        if (options.allowEmpty) {
          r += '>';
          options.state = WriterState.CloseTag;
          r += '</' + node.name + '>' + this.endline(node, options, level);
        } else {
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + '/>' + this.endline(node, options, level);
        }
      } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && (firstChildNode.value != null)) {
        r += '>';
        options.state = WriterState.InsideTag;
        options.suppressPrettyCount++;
        prettySuppressed = true;
        r += this.writeChildNode(firstChildNode, options, level + 1);
        options.suppressPrettyCount--;
        prettySuppressed = false;
        options.state = WriterState.CloseTag;
        r += '</' + node.name + '>' + this.endline(node, options, level);
      } else {
        if (options.dontPrettyTextNodes) {
          ref1 = node.children;
          for (i = 0, len = ref1.length; i < len; i++) {
            child = ref1[i];
            if ((child.type === NodeType.Text || child.type === NodeType.Raw) && (child.value != null)) {
              options.suppressPrettyCount++;
              prettySuppressed = true;
              break;
            }
          }
        }
        r += '>' + this.endline(node, options, level);
        options.state = WriterState.InsideTag;
        ref2 = node.children;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          child = ref2[j];
          r += this.writeChildNode(child, options, level + 1);
        }
        options.state = WriterState.CloseTag;
        r += this.indent(node, options, level) + '</' + node.name + '>';
        if (prettySuppressed) {
          options.suppressPrettyCount--;
        }
        r += this.endline(node, options, level);
        options.state = WriterState.None;
      }
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.writeChildNode = function(node, options, level) {
      switch (node.type) {
        case NodeType.CData:
          return this.cdata(node, options, level);
        case NodeType.Comment:
          return this.comment(node, options, level);
        case NodeType.Element:
          return this.element(node, options, level);
        case NodeType.Raw:
          return this.raw(node, options, level);
        case NodeType.Text:
          return this.text(node, options, level);
        case NodeType.ProcessingInstruction:
          return this.processingInstruction(node, options, level);
        case NodeType.Dummy:
          return '';
        case NodeType.Declaration:
          return this.declaration(node, options, level);
        case NodeType.DocType:
          return this.docType(node, options, level);
        case NodeType.AttributeDeclaration:
          return this.dtdAttList(node, options, level);
        case NodeType.ElementDeclaration:
          return this.dtdElement(node, options, level);
        case NodeType.EntityDeclaration:
          return this.dtdEntity(node, options, level);
        case NodeType.NotationDeclaration:
          return this.dtdNotation(node, options, level);
        default:
          throw new Error("Unknown XML node type: " + node.constructor.name);
      }
    };

    XMLWriterBase.prototype.processingInstruction = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<?';
      options.state = WriterState.InsideTag;
      r += node.target;
      if (node.value) {
        r += ' ' + node.value;
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '?>';
      r += this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.raw = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level);
      options.state = WriterState.InsideTag;
      r += node.value;
      options.state = WriterState.CloseTag;
      r += this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.text = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level);
      options.state = WriterState.InsideTag;
      r += node.value;
      options.state = WriterState.CloseTag;
      r += this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.dtdAttList = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<!ATTLIST';
      options.state = WriterState.InsideTag;
      r += ' ' + node.elementName + ' ' + node.attributeName + ' ' + node.attributeType;
      if (node.defaultValueType !== '#DEFAULT') {
        r += ' ' + node.defaultValueType;
      }
      if (node.defaultValue) {
        r += ' "' + node.defaultValue + '"';
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.dtdElement = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<!ELEMENT';
      options.state = WriterState.InsideTag;
      r += ' ' + node.name + ' ' + node.value;
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.dtdEntity = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<!ENTITY';
      options.state = WriterState.InsideTag;
      if (node.pe) {
        r += ' %';
      }
      r += ' ' + node.name;
      if (node.value) {
        r += ' "' + node.value + '"';
      } else {
        if (node.pubID && node.sysID) {
          r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
        } else if (node.sysID) {
          r += ' SYSTEM "' + node.sysID + '"';
        }
        if (node.nData) {
          r += ' NDATA ' + node.nData;
        }
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.dtdNotation = function(node, options, level) {
      var r;
      this.openNode(node, options, level);
      options.state = WriterState.OpenTag;
      r = this.indent(node, options, level) + '<!NOTATION';
      options.state = WriterState.InsideTag;
      r += ' ' + node.name;
      if (node.pubID && node.sysID) {
        r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
      } else if (node.pubID) {
        r += ' PUBLIC "' + node.pubID + '"';
      } else if (node.sysID) {
        r += ' SYSTEM "' + node.sysID + '"';
      }
      options.state = WriterState.CloseTag;
      r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
      options.state = WriterState.None;
      this.closeNode(node, options, level);
      return r;
    };

    XMLWriterBase.prototype.openNode = function(node, options, level) {};

    XMLWriterBase.prototype.closeNode = function(node, options, level) {};

    XMLWriterBase.prototype.openAttribute = function(att, options, level) {};

    XMLWriterBase.prototype.closeAttribute = function(att, options, level) {};

    return XMLWriterBase;

  })();

}).call(this);

},{"./NodeType":53,"./Utility":54,"./WriterState":55,"./XMLCData":57,"./XMLComment":59,"./XMLDTDAttList":64,"./XMLDTDElement":65,"./XMLDTDEntity":66,"./XMLDTDNotation":67,"./XMLDeclaration":68,"./XMLDocType":69,"./XMLDummy":72,"./XMLElement":73,"./XMLProcessingInstruction":77,"./XMLRaw":78,"./XMLText":82}],84:[function(require,module,exports){
// Generated by CoffeeScript 1.12.7
(function() {
  var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;

  ref = require('./Utility'), assign = ref.assign, isFunction = ref.isFunction;

  XMLDOMImplementation = require('./XMLDOMImplementation');

  XMLDocument = require('./XMLDocument');

  XMLDocumentCB = require('./XMLDocumentCB');

  XMLStringWriter = require('./XMLStringWriter');

  XMLStreamWriter = require('./XMLStreamWriter');

  NodeType = require('./NodeType');

  WriterState = require('./WriterState');

  module.exports.create = function(name, xmldec, doctype, options) {
    var doc, root;
    if (name == null) {
      throw new Error("Root element needs a name.");
    }
    options = assign({}, xmldec, doctype, options);
    doc = new XMLDocument(options);
    root = doc.element(name);
    if (!options.headless) {
      doc.declaration(options);
      if ((options.pubID != null) || (options.sysID != null)) {
        doc.dtd(options);
      }
    }
    return root;
  };

  module.exports.begin = function(options, onData, onEnd) {
    var ref1;
    if (isFunction(options)) {
      ref1 = [options, onData], onData = ref1[0], onEnd = ref1[1];
      options = {};
    }
    if (onData) {
      return new XMLDocumentCB(options, onData, onEnd);
    } else {
      return new XMLDocument(options);
    }
  };

  module.exports.stringWriter = function(options) {
    return new XMLStringWriter(options);
  };

  module.exports.streamWriter = function(stream, options) {
    return new XMLStreamWriter(stream, options);
  };

  module.exports.implementation = new XMLDOMImplementation();

  module.exports.nodeType = NodeType;

  module.exports.writerState = WriterState;

}).call(this);

},{"./NodeType":53,"./Utility":54,"./WriterState":55,"./XMLDOMImplementation":62,"./XMLDocument":70,"./XMLDocumentCB":71,"./XMLStreamWriter":79,"./XMLStringWriter":80}],85:[function(require,module,exports){
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
            dodge: {
                label: 'SR5.Dodge',
                value: (_b = this.findActiveSkill('gymnastics')) === null || _b === void 0 ? void 0 : _b.value,
                initMod: -5,
            },
            block: {
                label: 'SR5.Block',
                value: (_c = this.findActiveSkill('unarmed_combat')) === null || _c === void 0 ? void 0 : _c.value,
                initMod: -5,
            },
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
        // if we are defending a melee attack
        if ((_d = options.incomingAttack) === null || _d === void 0 ? void 0 : _d.reach) {
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
            parts.addUniquePart('SR5.Bonus', mod);
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

},{"../constants":114,"../helpers":123,"../parts/PartsList":170,"../rolls/ShadowrunRoller":171,"./prep/ActorPrepFactory":87}],86:[function(require,module,exports){
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

},{"../apps/chummer-import-form":104,"../apps/skills/KnowledgeSkillEditForm":107,"../apps/skills/LanguageSkillEditForm":108,"../apps/skills/SkillEditForm":109,"../config":113,"../helpers":123}],87:[function(require,module,exports){
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

},{"./CharacterPrep":89,"./SpiritPrep":90,"./SpritePrep":91,"./VehiclePrep":92}],88:[function(require,module,exports){
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

},{"../../item/SR5ItemDataWrapper":160}],89:[function(require,module,exports){
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

},{"./BaseActorPrep":88,"./functions/AttributesPrep":93,"./functions/ConditionMonitorsPrep":94,"./functions/InitiativePrep":95,"./functions/ItemPrep":96,"./functions/LimitsPrep":97,"./functions/MatrixPrep":98,"./functions/ModifiersPrep":99,"./functions/MovementPrep":100,"./functions/NPCPrep":101,"./functions/SkillsPrep":102,"./functions/WoundsPrep":103}],90:[function(require,module,exports){
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

},{"../../helpers":123,"./BaseActorPrep":88,"./functions/AttributesPrep":93,"./functions/ConditionMonitorsPrep":94,"./functions/InitiativePrep":95,"./functions/LimitsPrep":97,"./functions/ModifiersPrep":99,"./functions/MovementPrep":100,"./functions/SkillsPrep":102,"./functions/WoundsPrep":103}],91:[function(require,module,exports){
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

},{"../../helpers":123,"../../parts/PartsList":170,"./BaseActorPrep":88,"./functions/AttributesPrep":93,"./functions/InitiativePrep":95,"./functions/LimitsPrep":97,"./functions/MatrixPrep":98,"./functions/ModifiersPrep":99,"./functions/SkillsPrep":102}],92:[function(require,module,exports){
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

},{"../../helpers":123,"../../parts/PartsList":170,"./BaseActorPrep":88,"./functions/AttributesPrep":93,"./functions/InitiativePrep":95,"./functions/LimitsPrep":97,"./functions/MatrixPrep":98,"./functions/ModifiersPrep":99,"./functions/SkillsPrep":102}],93:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],94:[function(require,module,exports){
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

},{}],95:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],96:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],97:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],98:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],99:[function(require,module,exports){
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

},{}],100:[function(require,module,exports){
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

},{}],101:[function(require,module,exports){
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

},{"../../../constants":114,"../../../dataTemplates":115,"../../../helpers":123,"../../../parts/PartsList":170}],102:[function(require,module,exports){
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

},{"../../../helpers":123,"../../../parts/PartsList":170}],103:[function(require,module,exports){
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

},{}],104:[function(require,module,exports){
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

},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10,"@babel/runtime/regenerator":14}],105:[function(require,module,exports){
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

},{"../../helpers":123}],106:[function(require,module,exports){
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

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":4,"@babel/runtime/helpers/defineProperty":5,"@babel/runtime/helpers/get":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10}],107:[function(require,module,exports){
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

},{"./LanguageSkillEditForm":108}],108:[function(require,module,exports){
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

},{"./SkillEditForm":109}],109:[function(require,module,exports){
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

},{}],110:[function(require,module,exports){
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

},{}],111:[function(require,module,exports){
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

},{"./actor/SR5Actor":85,"./constants":114,"./item/SR5Item":159,"./parts/PartsList":170,"./template":173}],112:[function(require,module,exports){
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

},{}],113:[function(require,module,exports){
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

},{}],114:[function(require,module,exports){
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

},{}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataWrapper = void 0;
class DataWrapper {
    constructor(data) {
        this.data = data;
    }
}
exports.DataWrapper = DataWrapper;

},{}],117:[function(require,module,exports){
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

},{"../helpers":123}],118:[function(require,module,exports){
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

},{"./BasicHelpers":117,"./HandlebarTemplates":119,"./ItemLineHelpers":120,"./RollAndLabelHelpers":121,"./SkillLineHelpers":122}],119:[function(require,module,exports){
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

},{}],120:[function(require,module,exports){
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
        const wrapper = new SR5ItemDataWrapper_1.SR5ItemDataWrapper(item);
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${wrapper.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
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
        switch (wrapper.getType()) {
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

},{"../item/SR5ItemDataWrapper":160}],121:[function(require,module,exports){
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

},{"../parts/PartsList":170}],122:[function(require,module,exports){
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

},{"../helpers":123}],123:[function(require,module,exports){
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

},{"./parts/PartsList":170}],124:[function(require,module,exports){
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
const import_form_1 = require("./importer/apps/import-form");
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
        Hooks.on('renderItemDirectory', HooksManager.renderItemDirectory);
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
    static renderItemDirectory(app, html) {
        const button = $('<button>Import Chummer Data</button>');
        html.find('footer').before(button);
        button.on('click', (event) => {
            new import_form_1.Import().render(true);
        });
    }
}
exports.HooksManager = HooksManager;

},{"./actor/SR5Actor":85,"./actor/SR5ActorSheet":86,"./apps/gmtools/OverwatchScoreTracker":106,"./canvas":110,"./chat":111,"./combat/SR5Combat":112,"./config":113,"./constants":114,"./handlebars/HandlebarManager":118,"./helpers":123,"./importer/apps/import-form":125,"./item/SR5Item":159,"./item/SR5ItemSheet":161,"./macros":162,"./migrator/Migrator":164,"./rolls/ShadowrunRoller":171,"./settings":172}],125:[function(require,module,exports){
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
exports.Import = void 0;
const WeaponImporter_1 = require("../importer/WeaponImporter");
const ArmorImporter_1 = require("../importer/ArmorImporter");
const DataImporter_1 = require("../importer/DataImporter");
const AmmoImporter_1 = require("../importer/AmmoImporter");
const ModImporter_1 = require("../importer/ModImporter");
const SpellImporter_1 = require("../importer/SpellImporter");
const QualityImporter_1 = require("../importer/QualityImporter");
const ComplexFormImporter_1 = require("../importer/ComplexFormImporter");
const CyberwareImporter_1 = require("../importer/CyberwareImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
class Import extends Application {
    constructor() {
        super();
        this.supportedDataFiles = [];
        this.dataFiles = [];
        this.parsedFiles = [];
        this.disableImportButton = true;
        this.isDataFile = (file) => {
            return this.supportedDataFiles.some((supported) => supported === file.name);
        };
        this.isLangDataFile = (file) => {
            const pattern = /[a-zA-Z]{2}-[a-zA-Z]{2}_data\.xml/;
            return file.name.match(pattern) !== null;
        };
        this.collectDataImporterFileSupport();
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['app', 'window-app', 'filepicker'];
        options.title = 'Chummer/Data Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/compendium-import.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }
    getData(options) {
        const data = super.getData(options);
        data.dataFiles = {};
        this.supportedDataFiles.forEach((supportedFileName) => {
            const missing = !this.dataFiles.some((dataFile) => supportedFileName === dataFile.name);
            const parsed = this.parsedFiles.some((parsedFileName) => supportedFileName === parsedFileName);
            data.dataFiles[supportedFileName] = {
                name: supportedFileName,
                missing,
                parsed,
            };
        });
        data.langDataFile = this.langDataFile ? this.langDataFile.name : '';
        data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;
        data.disableImportButton = this.disableImportButton;
        return Object.assign({}, data);
    }
    collectDataImporterFileSupport() {
        this.supportedDataFiles = [];
        Import.Importers.forEach((importer) => {
            if (this.supportedDataFiles.some((supported) => supported === importer.file)) {
                return;
            }
            this.supportedDataFiles.push(importer.file);
        });
    }
    clearParsingStatus() {
        this.parsedFiles = [];
    }
    parseXML(xmlSource) {
        return __awaiter(this, void 0, void 0, function* () {
            let jsonSource = yield DataImporter_1.DataImporter.xml2json(xmlSource);
            ImportHelper_1.ImportHelper.SetMode(ImportHelper_1.ImportMode.XML);
            for (const di of Import.Importers) {
                if (di.CanParse(jsonSource)) {
                    di.ExtractTranslation();
                    yield di.Parse(jsonSource);
                }
            }
        });
    }
    parseXmli18n(xmlSource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!xmlSource) {
                return;
            }
            let jsonSource = yield DataImporter_1.DataImporter.xml2json(xmlSource);
            if (DataImporter_1.DataImporter.CanParseI18n(jsonSource)) {
                DataImporter_1.DataImporter.ParseTranslation(jsonSource);
            }
        });
    }
    activateListeners(html) {
        html.find("button[type='submit']").on('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.clearParsingStatus();
            this.disableImportButton = true;
            yield this.render();
            if (this.langDataFile) {
                const text = yield this.langDataFile.text();
                yield this.parseXmli18n(text);
            }
            // Use 'for of'-loop to allow await to actually pause.
            // don't use .forEach as it won't await for async callbacks.
            // iterate over supportedDataFiles to adhere to Importer order
            for (const supportedFile of this.supportedDataFiles) {
                // Only try supported files.
                const dataFile = this.dataFiles.find((dataFile) => dataFile.name === supportedFile);
                if (dataFile) {
                    const text = yield dataFile.text();
                    yield this.parseXML(text);
                    // Store status to show parsing progression.
                    if (!this.parsedFiles.some((parsedFileName) => parsedFileName === dataFile.name)) {
                        this.parsedFiles.push(dataFile.name);
                    }
                    yield this.render();
                }
            }
            this.disableImportButton = false;
            yield this.render();
        }));
        html.find("input[type='file'].langDataFileDrop").on('change', (event) => __awaiter(this, void 0, void 0, function* () {
            Array.from(event.target.files).forEach((file) => {
                if (this.isLangDataFile(file)) {
                    this.langDataFile = file;
                    this.render();
                }
            });
            return true;
        }));
        html.find("input[type='file'].filedatadrop").on('change', (event) => __awaiter(this, void 0, void 0, function* () {
            Array.from(event.target.files).forEach((file) => {
                if (this.isDataFile(file)) {
                    // Allow user to overwrite an already added file, they have their reasons.
                    const existingIdx = this.dataFiles.findIndex((dataFile) => dataFile.name === file.name);
                    if (existingIdx === -1) {
                        this.dataFiles.push(file);
                    }
                    else {
                        this.dataFiles[existingIdx] = file;
                    }
                }
            });
            if (this.dataFiles.length > 0) {
                this.disableImportButton = false;
            }
            this.render();
        }));
    }
}
exports.Import = Import;
//Order is important, ex. some weapons need mods to fully import
Import.Importers = [
    new ModImporter_1.ModImporter(),
    new WeaponImporter_1.WeaponImporter(),
    new ArmorImporter_1.ArmorImporter(),
    new AmmoImporter_1.AmmoImporter(),
    new SpellImporter_1.SpellImporter(),
    new ComplexFormImporter_1.ComplexFormImporter(),
    new QualityImporter_1.QualityImporter(),
    new CyberwareImporter_1.CyberwareImporter(),
];

},{"../helper/ImportHelper":126,"../importer/AmmoImporter":130,"../importer/ArmorImporter":131,"../importer/ComplexFormImporter":132,"../importer/CyberwareImporter":134,"../importer/DataImporter":135,"../importer/ModImporter":136,"../importer/QualityImporter":137,"../importer/SpellImporter":138,"../importer/WeaponImporter":139}],126:[function(require,module,exports){
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
exports.ImportHelper = exports.LookupMode = exports.ImportMode = void 0;
const Constants_1 = require("../importer/Constants");
const XMLStrategy_1 = require("./XMLStrategy");
const JSONStrategy_1 = require("./JSONStrategy");
var ImportMode;
(function (ImportMode) {
    ImportMode[ImportMode["XML"] = 1] = "XML";
    ImportMode[ImportMode["JSON"] = 2] = "JSON";
})(ImportMode = exports.ImportMode || (exports.ImportMode = {}));
var LookupMode;
(function (LookupMode) {
    LookupMode[LookupMode["Directory"] = 0] = "Directory";
    LookupMode[LookupMode["Actor"] = 1] = "Actor";
})(LookupMode = exports.LookupMode || (exports.LookupMode = {}));
/**
 * An import helper to standardize data extraction.
 * Mostly conceived to reduced required refactoring if Chummer changes data file layout.
 * Also contains helper methods to safely parse values to appropriate types.
 */
class ImportHelper {
    constructor() { }
    static SetMode(mode) {
        switch (mode) {
            case ImportMode.XML:
                ImportHelper.s_Strategy = new XMLStrategy_1.XMLStrategy();
                break;
            case ImportMode.JSON:
                ImportHelper.s_Strategy = new JSONStrategy_1.JSONStrategy();
                break;
        }
    }
    /**
     * Helper method to create a new folder.
     * @param name The name of the folder.
     * @param parent The parent folder.
     * @returns {Promise<Folder>} A promise that resolves with the folder object when the folder is created.
     */
    static NewFolder(name, parent = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Folder.create({
                type: 'Item',
                parent: parent === null ? null : parent.id,
                name: name,
            });
        });
    }
    /**
     * Get a folder at a path in the items directory.
     * @param path The absolute path of the folder.
     * @param mkdirs If true, will make all folders along the hierarchy if they do not exist.
     * @returns A promise that will resolve with the found folder.
     */
    static GetFolderAtPath(path, mkdirs = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let idx = 0;
            let curr, last = null;
            let next = path.split('/');
            while (idx < next.length) {
                curr = game.folders.find((folder) => folder.parent === last && folder.name === next[idx]);
                if (curr === null) {
                    if (!mkdirs) {
                        return Promise.reject(`Unable to find folder: ${path}`);
                    }
                    curr = yield ImportHelper.NewFolder(next[idx], last);
                }
                last = curr;
                idx++;
            }
            return Promise.resolve(curr);
        });
    }
    /**
     * Get a value from the the provided jsonData, optionally returning a default value if it is not found
     * or is unable to be parsed to an integer.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    static IntValue(jsonData, key, fallback = undefined) {
        return ImportHelper.s_Strategy.intValue(jsonData, key, fallback);
    }
    /**
     * Get a value from the the provided jsonData, optionally returning a default value if it is not found.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    static StringValue(jsonData, key, fallback = undefined) {
        return ImportHelper.s_Strategy.stringValue(jsonData, key, fallback);
    }
    /**
     * Get an object from the the provided jsonData, optionally returning a default value if it is not found.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    static ObjectValue(jsonData, key, fallback = undefined) {
        return ImportHelper.s_Strategy.objectValue(jsonData, key, fallback);
    }
    //TODO
    static findItem(nameOrCmp) {
        let result;
        if (typeof nameOrCmp === 'string') {
            result = game.items.find((item) => item.name == nameOrCmp);
        }
        else {
            result = game.items.find(nameOrCmp);
        }
        return result;
    }
    //TODO
    static MakeCategoryFolders(jsonData, path, jsonCategoryTranslations) {
        return __awaiter(this, void 0, void 0, function* () {
            let folders = {};
            let jsonCategories = jsonData['categories']['category'];
            for (let i = 0; i < jsonCategories.length; i++) {
                let categoryName = jsonCategories[i][ImportHelper.CHAR_KEY];
                // use untranslated category name for easier mapping during DataImporter.Parse implementations.
                let origCategoryName = categoryName;
                if (jsonCategoryTranslations && jsonCategoryTranslations.hasOwnProperty(categoryName)) {
                    categoryName = jsonCategoryTranslations[categoryName];
                }
                folders[origCategoryName.toLowerCase()] = yield ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/${path}/${categoryName}`, true);
            }
            return folders;
        });
    }
    /** Extract the correct <chummer file="${dataFileName}>[...]</chummer> element from xx-xx_data.xml translations.
     *
     * @param jsoni18n
     * @param dataFileName Expected translation target file name
     */
    static ExtractDataFileTranslation(jsoni18n, dataFileName) {
        for (let i = 0; i < jsoni18n.length; i++) {
            const translation = jsoni18n[i];
            if (translation.$.file === dataFileName) {
                return translation;
            }
        }
        return {};
    }
    /** Extract categories translations within xx-xx_data.xml <chummer/> translation subset.
     *
     *  Note: Not all file translations provide categories.
     *
     * @param jsonChummeri18n Translations as given by ExtractDataFileTranslations
     */
    static ExtractCategoriesTranslation(jsonChummeri18n) {
        const categoryTranslations = {};
        if (jsonChummeri18n && jsonChummeri18n.hasOwnProperty('categories')) {
            jsonChummeri18n.categories.category.forEach((category) => {
                const name = category[ImportHelper.CHAR_KEY];
                const translate = category.$.translate;
                categoryTranslations[name] = translate;
            });
        }
        return categoryTranslations;
    }
    /** Extract item type translations within xx-xx_data.xml <chummer/> translation subset.
     *
     * @param jsonItemsi18n Translations as given by ExtractDataFileTranslations
     * @param typeKey The item type to translate. Tends to be plural.
     * @param listKey The item to translate. Tends to be singular.
     */
    static ExtractItemTranslation(jsonItemsi18n, typeKey, listKey) {
        const itemTranslation = {};
        if (jsonItemsi18n && jsonItemsi18n[typeKey] && jsonItemsi18n[typeKey][listKey] && jsonItemsi18n[typeKey][listKey].length > 0) {
            jsonItemsi18n[typeKey][listKey].forEach((item) => {
                const name = item.name[ImportHelper.CHAR_KEY];
                const translate = item.translate[ImportHelper.CHAR_KEY];
                const altpage = item.altpage[ImportHelper.CHAR_KEY];
                itemTranslation[name] = { translate, altpage };
            });
        }
        return itemTranslation;
    }
    static MapNameToTranslationKey(translationMap, name, key, fallbackValue = '') {
        if (translationMap && translationMap.hasOwnProperty(name) && translationMap[name].hasOwnProperty(key)) {
            return translationMap[name][key];
        }
        return fallbackValue;
    }
    static MapNameToTranslation(translationMap, name) {
        return ImportHelper.MapNameToTranslationKey(translationMap, name, 'translate', name);
    }
    static MapNameToPageSource(translationMap, name) {
        return ImportHelper.MapNameToTranslationKey(translationMap, name, 'altpage', '?');
    }
}
exports.ImportHelper = ImportHelper;
ImportHelper.CHAR_KEY = '_TEXT';
ImportHelper.s_Strategy = new XMLStrategy_1.XMLStrategy();

},{"../importer/Constants":133,"./JSONStrategy":128,"./XMLStrategy":129}],127:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportStrategy = void 0;
class ImportStrategy {
}
exports.ImportStrategy = ImportStrategy;

},{}],128:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONStrategy = void 0;
const ImportStrategy_1 = require("./ImportStrategy");
class JSONStrategy extends ImportStrategy_1.ImportStrategy {
    intValue(jsonData, key, fallback = undefined) {
        throw new Error('Unimplemented');
    }
    stringValue(jsonData, key, fallback = undefined) {
        throw new Error('Unimplemented');
    }
    objectValue(jsonData, key, fallback = undefined) {
        throw new Error('Unimplemented');
    }
}
exports.JSONStrategy = JSONStrategy;

},{"./ImportStrategy":127}],129:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLStrategy = void 0;
const ImportHelper_1 = require("./ImportHelper");
const ImportStrategy_1 = require("./ImportStrategy");
class XMLStrategy extends ImportStrategy_1.ImportStrategy {
    intValue(jsonData, key, fallback = undefined) {
        try {
            return parseInt(jsonData[key][ImportHelper_1.ImportHelper.CHAR_KEY]);
        }
        catch (e) {
            if (fallback !== undefined) {
                return fallback;
            }
            else {
                throw e;
            }
        }
    }
    stringValue(jsonData, key, fallback = undefined) {
        try {
            return jsonData[key][ImportHelper_1.ImportHelper.CHAR_KEY];
        }
        catch (e) {
            if (fallback !== undefined) {
                return fallback;
            }
            else {
                throw e;
            }
        }
    }
    objectValue(jsonData, key, fallback = undefined) {
        try {
            return jsonData[key];
        }
        catch (e) {
            if (fallback !== undefined) {
                return fallback;
            }
            else {
                throw e;
            }
        }
    }
}
exports.XMLStrategy = XMLStrategy;

},{"./ImportHelper":126,"./ImportStrategy":127}],130:[function(require,module,exports){
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
exports.AmmoImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const Constants_1 = require("./Constants");
class AmmoImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'gear.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }
    GetDefaultData() {
        return {
            name: '',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'ammo',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                element: '',
                ap: 0,
                damage: 0,
                damageType: 'physical',
                blast: {
                    radius: 0,
                    dropoff: 0,
                },
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonGeari18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.gearsTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            let ammoDatas = [];
            let jsonAmmos = jsonObject['gears']['gear'];
            for (let i = 0; i < jsonAmmos.length; i++) {
                let jsonData = jsonAmmos[i];
                if (ImportHelper_1.ImportHelper.StringValue(jsonData, 'category', '') !== 'Ammunition') {
                    continue;
                }
                let data = this.GetDefaultData();
                data.name = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
                data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(this.gearsTranslations, data.name);
                data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.StringValue(jsonData, 'page')}`;
                data.data.technology.rating = 2;
                data.data.technology.availability = ImportHelper_1.ImportHelper.StringValue(jsonData, 'avail');
                data.data.technology.cost = ImportHelper_1.ImportHelper.IntValue(jsonData, 'cost', 0);
                let bonusData = ImportHelper_1.ImportHelper.ObjectValue(jsonData, 'weaponbonus', null);
                if (bonusData !== undefined && bonusData !== null) {
                    data.data.ap = ImportHelper_1.ImportHelper.IntValue(bonusData, 'ap', 0);
                    data.data.damage = ImportHelper_1.ImportHelper.IntValue(bonusData, 'damage', 0);
                    let damageType = ImportHelper_1.ImportHelper.StringValue(bonusData, 'damagetype', '');
                    if (damageType.length > 0) {
                        if (damageType.includes('P')) {
                            data.data.damageType = 'physical';
                        }
                        else if (damageType.includes('S')) {
                            data.data.damageType = 'stun';
                        }
                        else if (damageType.includes('M')) {
                            data.data.damageType = 'matrix';
                        }
                    }
                }
                let shouldLookForWeapons = false;
                let nameLower = data.name.toLowerCase();
                ['grenade', 'rocket', 'missile'].forEach((compare) => {
                    shouldLookForWeapons = shouldLookForWeapons || nameLower.includes(compare);
                });
                // NOTE: Should either weapons or gear not have been imported with translation, this will fail.
                if (shouldLookForWeapons) {
                    let foundWeapon = ImportHelper_1.ImportHelper.findItem((item) => {
                        return item.name.toLowerCase() === nameLower;
                    });
                    if (foundWeapon !== null) {
                        console.log(foundWeapon);
                        data.data.damage = foundWeapon.data.data.action.damage.value;
                        data.data.ap = foundWeapon.data.data.action.damage.ap.value;
                    }
                }
                // ammo doesn't have conceal rating from looking at the data
                // data.data.technology.conceal.base = ImportHelper.intValue(jsonData, "conceal");
                data.data.technology.conceal.base = 0;
                ammoDatas.push(data);
            }
            for (let i = 0; i < ammoDatas.length; i++) {
                let folderName = 'Misc';
                let ammo = ammoDatas[i];
                let splitName = ammo.name.split(':');
                if (splitName.length > 1) {
                    folderName = splitName[0].trim();
                }
                let folder = yield ImportHelper_1.ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/Ammo/${folderName}`, true);
                ammo.folder = folder.id;
            }
            return yield Item.create(ammoDatas);
        });
    }
}
exports.AmmoImporter = AmmoImporter;

},{"../helper/ImportHelper":126,"./Constants":133,"./DataImporter":135}],131:[function(require,module,exports){
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
exports.ArmorImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const ArmorParserBase_1 = require("../parser/armor/ArmorParserBase");
class ArmorImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'armor.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Armor',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'armor',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                armor: {
                    value: 0,
                    mod: false,
                    acid: 0,
                    cold: 0,
                    fire: 0,
                    electricity: 0,
                    radiation: 0,
                },
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonArmori18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
        this.armorTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonArmori18n, 'armors', 'armor');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = yield ImportHelper_1.ImportHelper.MakeCategoryFolders(jsonObject, 'Armor', this.categoryTranslations);
            const parser = new ArmorParserBase_1.ArmorParserBase();
            let datas = [];
            let jsonDatas = jsonObject['armors']['armor'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData());
                const category = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category').toLowerCase();
                data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(this.armorTranslations, data.name);
                data.folder = folders[category].id;
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.ArmorImporter = ArmorImporter;

},{"../helper/ImportHelper":126,"../parser/armor/ArmorParserBase":142,"./DataImporter":135}],132:[function(require,module,exports){
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
exports.ComplexFormImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const Constants_1 = require("./Constants");
const ComplexFormParserBase_1 = require("../parser/complex-form/ComplexFormParserBase");
class ComplexFormImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'complexforms.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('complexforms') && jsonObject['complexforms'].hasOwnProperty('complexform');
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Form',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'complex_form',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: {
                    type: 'complex',
                    category: '',
                    attribute: 'resonance',
                    attribute2: '',
                    skill: 'compiling',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: 'physical',
                            value: 'physical',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: 'defense',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                target: '',
                duration: '',
                fade: 0,
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        // Complexforms don't provide a category translation.
        let jsonItemi18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.nameTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonItemi18n, 'complexforms', 'complexform');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new ComplexFormParserBase_1.ComplexFormParserBase();
            const folder = yield ImportHelper_1.ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/Complex Forms`, true);
            let datas = [];
            let jsonDatas = jsonObject['complexforms']['complexform'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData(), this.nameTranslations);
                data.folder = folder.id;
                // TODO: Follow ComplexFormParserBase approach.
                data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(this.nameTranslations, data.name);
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.ComplexFormImporter = ComplexFormImporter;

},{"../helper/ImportHelper":126,"../parser/complex-form/ComplexFormParserBase":143,"./Constants":133,"./DataImporter":135}],133:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.MAP_CATEGORY_TO_SKILL = {
    'Assault Cannons': 'heavy_weapons',
    'Assault Rifles': 'automatics',
    'Blades': 'blades',
    'Bows': 'archery',
    'Carbines': 'automatics',
    'Clubs': 'clubs',
    'Crossbows': 'archery',
    'Exotic Melee Weapons': 'exotic_melee',
    'Exotic Ranged Weapons': 'exotic_ranged',
    'Flamethrowers': 'exotic_ranged',
    'Grenade Launchers': 'heavy_weapons',
    'Heavy Machine Guns': 'heavy_weapons',
    'Heavy Pistols': 'pistols',
    'Holdouts': 'pistols',
    'Laser Weapons': 'exotic_ranged',
    'Light Machine Guns': 'heavy_weapons',
    'Light Pistols': 'pistols',
    'Machine Pistols': 'automatics',
    'Medium Machine Guns': 'automatics',
    'Missile Launchers': 'heavy_weapons',
    'Shotguns': 'longarms',
    'Sniper Rifles': 'longarms',
    'Sporting Rifles': 'longarms',
    'Submachine Guns': 'automatics',
    'Tasers': 'pistols',
    'Unarmed': 'unarmed_combat',
};
Constants.WEAPON_RANGES = {
    'Tasers': {
        short: 5,
        medium: 10,
        long: 15,
        extreme: 20,
    },
    'Holdouts': {
        short: 5,
        medium: 15,
        long: 30,
        extreme: 50,
    },
    'Light Pistols': {
        short: 5,
        medium: 15,
        long: 30,
        extreme: 50,
    },
    'Heavy Pistols': {
        short: 5,
        medium: 20,
        long: 40,
        extreme: 60,
    },
    'Machine Pistols': {
        short: 5,
        medium: 15,
        long: 30,
        extreme: 50,
    },
    'Submachine Guns': {
        short: 10,
        medium: 40,
        long: 80,
        extreme: 150,
    },
    'Assault Rifles': {
        short: 25,
        medium: 150,
        long: 350,
        extreme: 550,
    },
    'Shotguns': {
        short: 10,
        medium: 40,
        long: 80,
        extreme: 150,
    },
    'Shotguns (slug)': {
        short: 10,
        medium: 40,
        long: 80,
        extreme: 150,
    },
    'Shotguns (flechette)': {
        short: 15,
        medium: 30,
        long: 45,
        extreme: 60,
    },
    'Sniper Rifles': {
        short: 50,
        medium: 350,
        long: 800,
        extreme: 1500,
    },
    'Sporting Rifles': {
        short: 50,
        medium: 250,
        long: 500,
        extreme: 750,
    },
    'Light Machine Guns': {
        short: 25,
        medium: 200,
        long: 400,
        extreme: 800,
    },
    'Medium/Heavy Machinegun': {
        short: 40,
        medium: 250,
        long: 750,
        extreme: 1200,
    },
    'Assault Cannons': {
        short: 50,
        medium: 300,
        long: 750,
        extreme: 1500,
    },
    'Grenade Launchers': {
        min: 5,
        short: 50,
        medium: 100,
        long: 150,
        extreme: 500,
    },
    'Missile Launchers': {
        min: 20,
        short: 70,
        medium: 150,
        long: 450,
        extreme: 1500,
    },
    'Bows': {
        short: 1,
        medium: 10,
        long: 30,
        extreme: 60,
        attribute: 'strength',
    },
    'Light Crossbows': {
        short: 6,
        medium: 24,
        long: 60,
        extreme: 120,
    },
    'Medium Crossbows': {
        short: 9,
        medium: 36,
        long: 90,
        extreme: 150,
    },
    'Heavy Crossbows': {
        short: 15,
        medium: 45,
        long: 120,
        extreme: 180,
    },
    'Thrown Knife': {
        short: 1,
        medium: 2,
        long: 3,
        extreme: 5,
        attribute: 'strength',
    },
    'Net': {
        short: 0.5,
        medium: 1,
        long: 1.5,
        extreme: 2.5,
        attribute: 'strength',
    },
    'Shuriken': {
        short: 1,
        medium: 2,
        long: 5,
        extreme: 7,
        attribute: 'strength',
    },
    'Standard Grenade': {
        short: 2,
        medium: 4,
        long: 6,
        extreme: 10,
        attribute: 'strength',
    },
    'Aerodynamic Grenade': {
        min: 0,
        short: 2,
        medium: 4,
        long: 8,
        extreme: 15,
        attribute: 'strength',
    },
    'Harpoon Gun': {
        short: 5,
        medium: 20,
        long: 40,
        extreme: 60,
    },
    'Harpoon Gun (Underwater)': {
        short: 6,
        medium: 24,
        long: 60,
        extreme: 120,
    },
    'Flamethrowers': {
        short: 15,
        medium: 20,
        long: -1,
        extreme: -1,
    },
};
Constants.ROOT_IMPORT_FOLDER_NAME = 'SR5e';

},{}],134:[function(require,module,exports){
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
exports.CyberwareImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const CyberwareParser_1 = require("../parser/cyberware/CyberwareParser");
class CyberwareImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'cyberware.xml';
    }
    CanParse(jsonObject) {
        return ((jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware')) ||
            (jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware')));
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Form',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'cyberware',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                armor: {
                    value: 0,
                    mod: false,
                    acid: 0,
                    cold: 0,
                    fire: 0,
                    electricity: 0,
                    radiation: 0,
                },
                action: {
                    type: '',
                    category: '',
                    attribute: '',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: '',
                            value: '',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                grade: 'standard',
                essence: 0,
                capacity: 0,
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonItemi18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonItemi18n);
        this.itemTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonItemi18n, 'cyberwares', 'cyberware');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new CyberwareParser_1.CyberwareParser();
            let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
            const folders = yield ImportHelper_1.ImportHelper.MakeCategoryFolders(jsonObject, key);
            key = key.toLowerCase();
            let datas = [];
            let jsonDatas = jsonObject[key + 's'][key];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
                const category = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category');
                data.folder = folders[category.toLowerCase()].id;
                // // TODO: Follow ComplexFormParserBase approach.
                // data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.CyberwareImporter = CyberwareImporter;

},{"../helper/ImportHelper":126,"../parser/cyberware/CyberwareParser":144,"./DataImporter":135}],135:[function(require,module,exports){
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
exports.DataImporter = void 0;
const ImportHelper_1 = require("../helper/ImportHelper");
const xml2js = require('xml2js');
class DataImporter {
    /**
     *
     * @param jsonObject JSON Data with all data translations for one language.
     */
    static CanParseI18n(jsonObject) {
        return jsonObject.hasOwnProperty('chummer') && jsonObject.chummer.length > 0 && jsonObject.chummer[0].$.hasOwnProperty('file');
    }
    /**
     * Stores translations as a whole for all implementing classes to extract from without reparsing.
     * @param jsonObject JSON Data with all data translations for one language.
     */
    static ParseTranslation(jsonObject) {
        if (jsonObject && jsonObject.hasOwnProperty('chummer')) {
            DataImporter.jsoni18n = jsonObject['chummer'];
        }
    }
    /**
     * Parse an XML string into a JSON object.
     * @param xmlString The string to parse as XML.
     * @returns A json object converted from the string.
     */
    static xml2json(xmlString) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = xml2js.Parser({
                explicitArray: false,
                explicitCharkey: true,
                charkey: ImportHelper_1.ImportHelper.CHAR_KEY,
            });
            return (yield parser.parseStringPromise(xmlString))['chummer'];
        });
    }
}
exports.DataImporter = DataImporter;

},{"../helper/ImportHelper":126,"xml2js":51}],136:[function(require,module,exports){
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
exports.ModImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const Constants_1 = require("./Constants");
const ModParserBase_1 = require("../parser/mod/ModParserBase");
class ModImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'weapons.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('accessories') && jsonObject['accessories'].hasOwnProperty('accessory');
    }
    GetDefaultData() {
        return {
            name: '',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'modification',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                type: '',
                mount_point: '',
                dice_pool: 0,
                accuracy: 0,
                rc: 0,
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonWeaponsi18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        // Parts of weapon accessory translations are within the application translation. Currently only data translation is used.
        this.accessoryTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, 'accessories', 'accessory');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new ModParserBase_1.ModParserBase();
            let datas = [];
            let jsonDatas = jsonObject['accessories']['accessory'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData());
                // TODO: Integrate into ModParserBase approach.
                data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(this.accessoryTranslations, data.name);
                //TODO: Test this
                let folderName = data.data.mount_point !== undefined ? data.data.mount_point : 'Other';
                if (folderName.includes('/')) {
                    let splitName = folderName.split('/');
                    folderName = splitName[0];
                }
                let folder = yield ImportHelper_1.ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
                data.folder = folder.id;
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.ModImporter = ModImporter;

},{"../helper/ImportHelper":126,"../parser/mod/ModParserBase":147,"./Constants":133,"./DataImporter":135}],137:[function(require,module,exports){
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
exports.QualityImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const QualityParserBase_1 = require("../parser/quality/QualityParserBase");
class QualityImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'qualities.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('qualities') && jsonObject['qualities'].hasOwnProperty('quality');
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Armor',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'quality',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: {
                    type: '',
                    category: '',
                    attribute: '',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: '',
                            value: '',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                type: '',
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonQualityi18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonQualityi18n);
        this.itemTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonQualityi18n, 'qualities', 'quality');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonNameTranslations = {};
            const folders = yield ImportHelper_1.ImportHelper.MakeCategoryFolders(jsonObject, 'Qualities', this.categoryTranslations);
            console.log(folders);
            const parser = new QualityParserBase_1.QualityParserBase();
            let datas = [];
            let jsonDatas = jsonObject['qualities']['quality'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
                let category = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category');
                data.folder = folders[category.toLowerCase()].id;
                data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.QualityImporter = QualityImporter;

},{"../helper/ImportHelper":126,"../parser/quality/QualityParserBase":148,"./DataImporter":135}],138:[function(require,module,exports){
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
exports.SpellImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const SpellParserBase_1 = require("../parser/spell/SpellParserBase");
const CombatSpellParser_1 = require("../parser/spell/CombatSpellParser");
const ManipulationSpellParser_1 = require("../parser/spell/ManipulationSpellParser");
const IllusionSpellParser_1 = require("../parser/spell/IllusionSpellParser");
const DetectionSpellImporter_1 = require("../parser/spell/DetectionSpellImporter");
const ParserMap_1 = require("../parser/ParserMap");
class SpellImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'spells.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Item',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'spell',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: {
                    type: 'varies',
                    category: '',
                    attribute: 'magic',
                    attribute2: '',
                    skill: 'spellcasting',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: '',
                            value: '',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                drain: 0,
                category: '',
                type: '',
                range: '',
                duration: '',
                combat: {
                    type: '',
                },
                detection: {
                    passive: false,
                    type: '',
                    extended: false,
                },
                illusion: {
                    type: '',
                    sense: '',
                },
                manipulation: {
                    damaging: false,
                    mental: false,
                    environmental: false,
                    physical: false,
                },
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonSpelli18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonSpelli18n);
        this.itemTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonSpelli18n, 'spells', 'spell');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = yield ImportHelper_1.ImportHelper.MakeCategoryFolders(jsonObject, 'Spells', this.categoryTranslations);
            const parser = new ParserMap_1.ParserMap('category', [
                { key: 'Combat', value: new CombatSpellParser_1.CombatSpellParser() },
                { key: 'Manipulation', value: new ManipulationSpellParser_1.ManipulationSpellParser() },
                { key: 'Illusion', value: new IllusionSpellParser_1.IllusionSpellParser() },
                { key: 'Detection', value: new DetectionSpellImporter_1.DetectionSpellImporter() },
                { key: 'Health', value: new SpellParserBase_1.SpellParserBase() },
                { key: 'Enchantments', value: new SpellParserBase_1.SpellParserBase() },
                { key: 'Rituals', value: new SpellParserBase_1.SpellParserBase() },
            ]);
            let datas = [];
            let jsonDatas = jsonObject['spells']['spell'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
                data.folder = folders[data.data.category].id;
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.SpellImporter = SpellImporter;

},{"../helper/ImportHelper":126,"../parser/ParserMap":141,"../parser/spell/CombatSpellParser":149,"../parser/spell/DetectionSpellImporter":150,"../parser/spell/IllusionSpellParser":151,"../parser/spell/ManipulationSpellParser":152,"../parser/spell/SpellParserBase":153,"./DataImporter":135}],139:[function(require,module,exports){
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
exports.WeaponImporter = void 0;
const DataImporter_1 = require("./DataImporter");
const ImportHelper_1 = require("../helper/ImportHelper");
const Constants_1 = require("./Constants");
const RangedParser_1 = require("../parser/weapon/RangedParser");
const MeleeParser_1 = require("../parser/weapon/MeleeParser");
const ThrownParser_1 = require("../parser/weapon/ThrownParser");
const ParserMap_1 = require("../parser/ParserMap");
const WeaponParserBase_1 = require("../parser/weapon/WeaponParserBase");
class WeaponImporter extends DataImporter_1.DataImporter {
    constructor() {
        super(...arguments);
        this.file = 'weapons.xml';
    }
    CanParse(jsonObject) {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }
    GetDefaultData() {
        return {
            name: 'Unnamed Item',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'weapon',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: {
                    type: 'varies',
                    category: '',
                    attribute: 'agility',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: 'physical',
                            value: 'physical',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: 'defense',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                ammo: {
                    spare_clips: {
                        value: 0,
                        max: 0,
                    },
                    current: {
                        value: 0,
                        max: 0,
                    },
                },
                range: {
                    category: '',
                    ranges: {
                        short: 0,
                        medium: 0,
                        long: 0,
                        extreme: 0,
                    },
                    rc: {
                        value: 0,
                        base: 0,
                        mod: [],
                    },
                    modes: {
                        single_shot: false,
                        semi_auto: false,
                        burst_fire: false,
                        full_auto: false,
                    },
                },
                melee: {
                    reach: 0,
                },
                thrown: {
                    ranges: {
                        short: 0,
                        medium: 0,
                        long: 0,
                        extreme: 0,
                        attribute: '',
                    },
                    blast: {
                        radius: 0,
                        dropoff: 0,
                    },
                },
                category: 'range',
                subcategory: '',
            },
            permission: {
                default: 2,
            },
        };
    }
    ExtractTranslation() {
        if (!DataImporter_1.DataImporter.jsoni18n) {
            return;
        }
        let jsonWeaponi18n = ImportHelper_1.ImportHelper.ExtractDataFileTranslation(DataImporter_1.DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper_1.ImportHelper.ExtractCategoriesTranslation(jsonWeaponi18n);
        this.itemTranslations = ImportHelper_1.ImportHelper.ExtractItemTranslation(jsonWeaponi18n, 'weapons', 'weapon');
    }
    Parse(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = yield ImportHelper_1.ImportHelper.MakeCategoryFolders(jsonObject, 'Weapons', this.categoryTranslations);
            folders['gear'] = yield ImportHelper_1.ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Gear`, true);
            folders['quality'] = yield ImportHelper_1.ImportHelper.GetFolderAtPath(`${Constants_1.Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Quality`, true);
            const parser = new ParserMap_1.ParserMap(WeaponParserBase_1.WeaponParserBase.GetWeaponType, [
                { key: 'range', value: new RangedParser_1.RangedParser() },
                { key: 'melee', value: new MeleeParser_1.MeleeParser() },
                { key: 'thrown', value: new ThrownParser_1.ThrownParser() },
            ]);
            let datas = [];
            let jsonDatas = jsonObject['weapons']['weapon'];
            for (let i = 0; i < jsonDatas.length; i++) {
                let jsonData = jsonDatas[i];
                let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
                data.folder = folders[data.data.subcategory].id;
                datas.push(data);
            }
            return yield Item.create(datas);
        });
    }
}
exports.WeaponImporter = WeaponImporter;

},{"../helper/ImportHelper":126,"../parser/ParserMap":141,"../parser/weapon/MeleeParser":154,"../parser/weapon/RangedParser":155,"../parser/weapon/ThrownParser":156,"../parser/weapon/WeaponParserBase":157,"./Constants":133,"./DataImporter":135}],140:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
}
exports.Parser = Parser;

},{}],141:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserMap = void 0;
const Parser_1 = require("./Parser");
const ImportHelper_1 = require("../helper/ImportHelper");
class ParserMap extends Parser_1.Parser {
    constructor(branchKey, elements) {
        super();
        this.m_BranchKey = branchKey;
        this.m_Map = new Map();
        for (const { key, value } of elements) {
            this.m_Map.set(key, value);
        }
    }
    Parse(jsonData, data, jsonTranslation) {
        let key;
        if (typeof this.m_BranchKey === 'function') {
            key = this.m_BranchKey(jsonData);
        }
        else {
            key = this.m_BranchKey;
            key = ImportHelper_1.ImportHelper.StringValue(jsonData, key);
        }
        const parser = this.m_Map.get(key);
        if (parser === undefined) {
            console.warn(`Could not find mapped parser for category ${key}.`);
            return data;
        }
        return parser.Parse(jsonData, data, jsonTranslation);
    }
}
exports.ParserMap = ParserMap;

},{"../helper/ImportHelper":126,"./Parser":140}],142:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmorParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const TechnologyItemParserBase_1 = require("../item/TechnologyItemParserBase");
class ArmorParserBase extends TechnologyItemParserBase_1.TechnologyItemParserBase {
    Parse(jsonData, data) {
        data = super.Parse(jsonData, data);
        data.data.armor.value = ImportHelper_1.ImportHelper.IntValue(jsonData, 'armor', 0);
        data.data.armor.mod = ImportHelper_1.ImportHelper.StringValue(jsonData, 'armor').includes('+');
        return data;
    }
}
exports.ArmorParserBase = ArmorParserBase;

},{"../../helper/ImportHelper":126,"../item/TechnologyItemParserBase":146}],143:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexFormParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const ItemParserBase_1 = require("../item/ItemParserBase");
class ComplexFormParserBase extends ItemParserBase_1.ItemParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data.name = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
        data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.StringValue(jsonData, 'page')}`;
        let fade = ImportHelper_1.ImportHelper.StringValue(jsonData, 'fv');
        if (fade.includes('+') || fade.includes('-')) {
            data.data.fade = parseInt(fade.substring(1, fade.length));
        }
        let duration = ImportHelper_1.ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'I') {
            data.data.duration = 'instant';
        }
        else if (duration === 'S') {
            data.data.duration = 'sustained';
        }
        else if (duration === 'P') {
            data.data.duration = 'permanent';
        }
        let target = ImportHelper_1.ImportHelper.StringValue(jsonData, 'target');
        switch (target) {
            case 'Device':
            case 'File':
            case 'Host':
            case 'Persona':
            case 'Self':
            case 'Sprite':
                data.data.target = target.toLowerCase();
                break;
            default:
                data.data.target = 'other';
                break;
        }
        if (jsonTranslation) {
            const origName = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }
        return data;
    }
}
exports.ComplexFormParserBase = ComplexFormParserBase;

},{"../../helper/ImportHelper":126,"../item/ItemParserBase":145}],144:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberwareParser = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const TechnologyItemParserBase_1 = require("../item/TechnologyItemParserBase");
class CyberwareParser extends TechnologyItemParserBase_1.TechnologyItemParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        const essence = ImportHelper_1.ImportHelper.StringValue(jsonData, 'ess', '0').match(/[0-9]\.?[0-9]*/g);
        if (essence !== null) {
            data.data.essence = parseFloat(essence[0]);
        }
        const capacity = ImportHelper_1.ImportHelper.StringValue(jsonData, 'capacity', '0').match(/[0-9]+/g);
        if (capacity !== null) {
            data.data.capacity = parseInt(capacity[0]);
        }
        return data;
    }
}
exports.CyberwareParser = CyberwareParser;

},{"../../helper/ImportHelper":126,"../item/TechnologyItemParserBase":146}],145:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemParserBase = void 0;
const Parser_1 = require("../Parser");
const ImportHelper_1 = require("../../helper/ImportHelper");
class ItemParserBase extends Parser_1.Parser {
    Parse(jsonData, data, jsonTranslation) {
        data.name = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
        data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.StringValue(jsonData, 'page')}`;
        if (jsonTranslation) {
            const origName = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }
        return data;
    }
}
exports.ItemParserBase = ItemParserBase;

},{"../../helper/ImportHelper":126,"../Parser":140}],146:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyItemParserBase = void 0;
const ItemParserBase_1 = require("./ItemParserBase");
const ImportHelper_1 = require("../../helper/ImportHelper");
class TechnologyItemParserBase extends ItemParserBase_1.ItemParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data);
        data.data.technology.availability = ImportHelper_1.ImportHelper.StringValue(jsonData, 'avail', '0');
        data.data.technology.cost = ImportHelper_1.ImportHelper.IntValue(jsonData, 'cost', 0);
        data.data.technology.rating = ImportHelper_1.ImportHelper.IntValue(jsonData, 'rating', 0);
        return data;
    }
}
exports.TechnologyItemParserBase = TechnologyItemParserBase;

},{"../../helper/ImportHelper":126,"./ItemParserBase":145}],147:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const TechnologyItemParserBase_1 = require("../item/TechnologyItemParserBase");
class ModParserBase extends TechnologyItemParserBase_1.TechnologyItemParserBase {
    Parse(jsonData, data) {
        data = super.Parse(jsonData, data);
        data.data.type = 'weapon';
        data.data.mount_point = ImportHelper_1.ImportHelper.StringValue(jsonData, 'mount');
        data.data.rc = ImportHelper_1.ImportHelper.IntValue(jsonData, 'rc', 0);
        data.data.accuracy = ImportHelper_1.ImportHelper.IntValue(jsonData, 'accuracy', 0);
        data.data.technology.conceal.base = ImportHelper_1.ImportHelper.IntValue(jsonData, 'conceal', 0);
        return data;
    }
}
exports.ModParserBase = ModParserBase;

},{"../../helper/ImportHelper":126,"../item/TechnologyItemParserBase":146}],148:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const ItemParserBase_1 = require("../item/ItemParserBase");
class QualityParserBase extends ItemParserBase_1.ItemParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data.name = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
        data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.StringValue(jsonData, 'page')}`;
        data.data.type = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category') === 'Positive' ? 'positive' : 'negative';
        if (jsonTranslation) {
            const origName = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }
        return data;
    }
}
exports.QualityParserBase = QualityParserBase;

},{"../../helper/ImportHelper":126,"../item/ItemParserBase":145}],149:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatSpellParser = void 0;
const SpellParserBase_1 = require("./SpellParserBase");
const ImportHelper_1 = require("../../helper/ImportHelper");
class CombatSpellParser extends SpellParserBase_1.SpellParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        let descriptor = ImportHelper_1.ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }
        data.data.combat.type = descriptor.includes('Indirect') ? 'indirect' : 'direct';
        if (data.data.combat.type === 'direct') {
            data.data.action.opposed.type = 'custom';
            switch (data.data.type) {
                case 'physical':
                    data.data.action.opposed.attribute = 'body';
                    break;
                case 'mana':
                    data.data.action.opposed.attribute = 'willpower';
                    break;
                default:
                    break;
            }
        }
        else if (data.data.combat.type === 'indirect') {
            data.data.action.opposed.type = 'defense';
        }
        return data;
    }
}
exports.CombatSpellParser = CombatSpellParser;

},{"../../helper/ImportHelper":126,"./SpellParserBase":153}],150:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionSpellImporter = void 0;
const SpellParserBase_1 = require("./SpellParserBase");
const ImportHelper_1 = require("../../helper/ImportHelper");
class DetectionSpellImporter extends SpellParserBase_1.SpellParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        let descriptor = ImportHelper_1.ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }
        data.data.detection.passive = descriptor.includes('Passive');
        if (!data.data.detection.passive) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'willpower';
            data.data.action.opposed.attribute2 = 'logic';
        }
        data.data.detection.extended = descriptor.includes('Extended');
        if (descriptor.includes('Psychic')) {
            data.data.detection.type = 'psychic';
        }
        else if (descriptor.includes('Directional')) {
            data.data.detection.type = 'directional';
        }
        else if (descriptor.includes('Area')) {
            data.data.detection.type = 'area';
        }
        return data;
    }
}
exports.DetectionSpellImporter = DetectionSpellImporter;

},{"../../helper/ImportHelper":126,"./SpellParserBase":153}],151:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IllusionSpellParser = void 0;
const SpellParserBase_1 = require("./SpellParserBase");
const ImportHelper_1 = require("../../helper/ImportHelper");
class IllusionSpellParser extends SpellParserBase_1.SpellParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        let descriptor = ImportHelper_1.ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }
        if (data.data.type === 'mana') {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'logic';
            data.data.action.opposed.attribute2 = 'willpower';
        }
        else if (data.data.type === 'physical') {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'intuition';
            data.data.action.opposed.attribute2 = 'logic';
        }
        return data;
    }
}
exports.IllusionSpellParser = IllusionSpellParser;

},{"../../helper/ImportHelper":126,"./SpellParserBase":153}],152:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManipulationSpellParser = void 0;
const SpellParserBase_1 = require("./SpellParserBase");
const ImportHelper_1 = require("../../helper/ImportHelper");
class ManipulationSpellParser extends SpellParserBase_1.SpellParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        let descriptor = ImportHelper_1.ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }
        data.data.manipulation.environmental = descriptor.includes('Environmental');
        // Generally no resistance roll.
        data.data.manipulation.mental = descriptor.includes('Mental');
        if (data.data.manipulation.mental) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'logic';
            data.data.action.opposed.attribute2 = 'willpower';
        }
        data.data.manipulation.physical = descriptor.includes('Physical');
        if (data.data.manipulation.physical) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'body';
            data.data.action.opposed.attribute2 = 'strength';
        }
        data.data.manipulation.damaging = descriptor.includes('Damaging');
        if (data.data.manipulation.damaging) {
            data.data.action.opposed.type = 'soak';
        }
        return data;
    }
}
exports.ManipulationSpellParser = ManipulationSpellParser;

},{"../../helper/ImportHelper":126,"./SpellParserBase":153}],153:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpellParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const ItemParserBase_1 = require("../item/ItemParserBase");
class SpellParserBase extends ItemParserBase_1.ItemParserBase {
    Parse(jsonData, data, jsonTranslation) {
        data.name = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
        data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.StringValue(jsonData, 'page')}`;
        data.data.category = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category').toLowerCase();
        let damage = ImportHelper_1.ImportHelper.StringValue(jsonData, 'damage');
        if (damage === 'P') {
            data.data.action.damage.type.base = 'physical';
            data.data.action.damage.type.value = 'physical';
        }
        else if (damage === 'S') {
            data.data.action.damage.type.base = 'stun';
            data.data.action.damage.type.value = 'stun';
        }
        let duration = ImportHelper_1.ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'I') {
            data.data.duration = 'instant';
        }
        else if (duration === 'S') {
            data.data.duration = 'sustained';
        }
        else if (duration === 'P') {
            data.data.duration = 'permanent';
        }
        let drain = ImportHelper_1.ImportHelper.StringValue(jsonData, 'dv');
        if (drain.includes('+') || drain.includes('-')) {
            data.data.drain = parseInt(drain.substring(1, drain.length));
        }
        let range = ImportHelper_1.ImportHelper.StringValue(jsonData, 'range');
        if (range === 'T') {
            data.data.range = 'touch';
        }
        else if (range === 'LOS') {
            data.data.range = 'los';
        }
        else if (range === 'LOS (A)') {
            data.data.range = 'los_a';
        }
        let type = ImportHelper_1.ImportHelper.StringValue(jsonData, 'type');
        if (type === 'P') {
            data.data.type = 'physical';
        }
        else if (type === 'M') {
            data.data.type = 'mana';
        }
        if (jsonTranslation) {
            const origName = ImportHelper_1.ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper_1.ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper_1.ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper_1.ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }
        return data;
    }
}
exports.SpellParserBase = SpellParserBase;

},{"../../helper/ImportHelper":126,"../item/ItemParserBase":145}],154:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeleeParser = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const WeaponParserBase_1 = require("./WeaponParserBase");
class MeleeParser extends WeaponParserBase_1.WeaponParserBase {
    GetDamage(jsonData) {
        var _a;
        let jsonDamage = ImportHelper_1.ImportHelper.StringValue(jsonData, 'damage');
        let damageCode = (_a = jsonDamage.match(/(STR)([+-]?)([1-9]*)\)([PS])/g)) === null || _a === void 0 ? void 0 : _a[0];
        if (damageCode == null) {
            return {
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                element: {
                    base: '',
                    value: '',
                },
                base: 0,
                value: 0,
                ap: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                attribute: '',
                mod: [],
            };
        }
        let damageBase = 0;
        let damageAp = ImportHelper_1.ImportHelper.IntValue(jsonData, 'ap', 0);
        let splitDamageCode = damageCode.split(')');
        let damageType = splitDamageCode[1].includes('P') ? 'physical' : 'stun';
        let splitBaseCode = damageCode.includes('+') ? splitDamageCode[0].split('+') : splitDamageCode[0].split('-');
        if (splitDamageCode[0].includes('+') || splitDamageCode[0].includes('-')) {
            damageBase = parseInt(splitBaseCode[1], 0);
        }
        let damageAttribute = damageCode.includes('STR') ? 'strength' : '';
        return {
            type: {
                base: damageType,
                value: damageType,
            },
            element: {
                base: '',
                value: '',
            },
            base: damageBase,
            value: damageBase,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: [],
            },
            attribute: damageAttribute,
            mod: [],
        };
    }
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        data.data.melee.reach = ImportHelper_1.ImportHelper.IntValue(jsonData, 'reach');
        return data;
    }
}
exports.MeleeParser = MeleeParser;

},{"../../helper/ImportHelper":126,"./WeaponParserBase":157}],155:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangedParser = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const WeaponParserBase_1 = require("./WeaponParserBase");
const Constants_1 = require("../../importer/Constants");
class RangedParser extends WeaponParserBase_1.WeaponParserBase {
    GetDamage(jsonData) {
        var _a;
        let jsonDamage = ImportHelper_1.ImportHelper.StringValue(jsonData, 'damage');
        let damageCode = (_a = jsonDamage.match(/[0-9]+[PS]/g)) === null || _a === void 0 ? void 0 : _a[0];
        if (damageCode == null) {
            return {
                type: {
                    base: 'physical',
                    value: '',
                },
                element: {
                    base: '',
                    value: '',
                },
                base: 0,
                value: 0,
                ap: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                attribute: '',
                mod: [],
            };
        }
        let damageType = damageCode.includes('P') ? 'physical' : 'stun';
        let damageAmount = parseInt(damageCode.replace(damageType[0].toUpperCase(), ''));
        let damageAp = ImportHelper_1.ImportHelper.IntValue(jsonData, 'ap', 0);
        return {
            type: {
                base: damageType,
                value: damageType,
            },
            element: {
                base: '',
                value: '',
            },
            value: damageAmount,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: [],
            },
            attribute: '',
            mod: [],
            base: damageAmount,
        };
    }
    GetAmmo(weaponJson) {
        var _a;
        let jsonAmmo = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'ammo');
        let match = (_a = jsonAmmo.match(/([0-9]+)/g)) === null || _a === void 0 ? void 0 : _a[0];
        return match !== undefined ? parseInt(match) : 0;
    }
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        data.data.range.rc.base = ImportHelper_1.ImportHelper.IntValue(jsonData, 'rc');
        data.data.range.rc.value = ImportHelper_1.ImportHelper.IntValue(jsonData, 'rc');
        if (jsonData.hasOwnProperty('range')) {
            data.data.range.ranges = Constants_1.Constants.WEAPON_RANGES[ImportHelper_1.ImportHelper.StringValue(jsonData, 'range')];
        }
        else {
            data.data.range.ranges = Constants_1.Constants.WEAPON_RANGES[ImportHelper_1.ImportHelper.StringValue(jsonData, 'category')];
        }
        data.data.ammo.current.value = this.GetAmmo(jsonData);
        data.data.ammo.current.max = this.GetAmmo(jsonData);
        data.data.range.modes.single_shot = ImportHelper_1.ImportHelper.StringValue(jsonData, 'mode').includes('SS');
        data.data.range.modes.semi_auto = ImportHelper_1.ImportHelper.StringValue(jsonData, 'mode').includes('SA');
        data.data.range.modes.burst_fire = ImportHelper_1.ImportHelper.StringValue(jsonData, 'mode').includes('BF');
        data.data.range.modes.full_auto = ImportHelper_1.ImportHelper.StringValue(jsonData, 'mode').includes('FA');
        return data;
    }
}
exports.RangedParser = RangedParser;

},{"../../helper/ImportHelper":126,"../../importer/Constants":133,"./WeaponParserBase":157}],156:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrownParser = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const WeaponParserBase_1 = require("./WeaponParserBase");
const Constants_1 = require("../../importer/Constants");
class ThrownParser extends WeaponParserBase_1.WeaponParserBase {
    GetDamage(jsonData) {
        var _a, _b, _c, _d;
        let jsonDamage = ImportHelper_1.ImportHelper.StringValue(jsonData, 'damage');
        let damageAmount = 0;
        let damageType = 'physical';
        let damageAttribute = '';
        //STR scaling weapons like the boomerang
        if (jsonDamage.includes('STR')) {
            damageAttribute = 'strength';
            let damageMatch = (_a = jsonDamage.match(/((STR)([+-])[0-9]\)[PS])/g)) === null || _a === void 0 ? void 0 : _a[0];
            if (damageMatch !== undefined) {
                let amountMatch = (_b = damageMatch.match(/-?[0-9]+/g)) === null || _b === void 0 ? void 0 : _b[0];
                damageAmount = amountMatch !== undefined ? parseInt(amountMatch) : 0;
            }
        }
        else {
            let damageMatch = (_c = jsonDamage.match(/([0-9]+[PS])/g)) === null || _c === void 0 ? void 0 : _c[0];
            if (damageMatch !== undefined) {
                let amountMatch = (_d = damageMatch.match(/[0-9]+/g)) === null || _d === void 0 ? void 0 : _d[0];
                if (amountMatch !== undefined) {
                    damageAmount = parseInt(amountMatch);
                }
            }
            else {
                return {
                    type: {
                        base: 'physical',
                        value: 'physical',
                    },
                    element: {
                        base: '',
                        value: '',
                    },
                    base: 0,
                    value: 0,
                    ap: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    attribute: '',
                    mod: [],
                };
            }
        }
        damageType = jsonDamage.includes('P') ? 'physical' : 'stun';
        let damageAp = ImportHelper_1.ImportHelper.IntValue(jsonData, 'ap', 0);
        return {
            type: {
                base: damageType,
                value: damageType,
            },
            element: {
                base: '',
                value: '',
            },
            base: damageAmount,
            value: damageAmount,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: [],
            },
            attribute: damageAttribute,
            mod: [],
        };
    }
    GetBlast(jsonData, data) {
        var _a, _b, _c, _d;
        let blastData = {
            radius: 0,
            dropoff: 0,
        };
        let blastCode = ImportHelper_1.ImportHelper.StringValue(jsonData, 'damage');
        let radiusMatch = (_a = blastCode.match(/([0-9]+m)/)) === null || _a === void 0 ? void 0 : _a[0];
        if (radiusMatch !== undefined) {
            radiusMatch = (_b = radiusMatch.match(/[0-9]+/)) === null || _b === void 0 ? void 0 : _b[0];
            if (radiusMatch !== undefined) {
                blastData.radius = parseInt(radiusMatch);
            }
        }
        let dropoffMatch = (_c = blastCode.match(/(-[0-9]+\/m)/)) === null || _c === void 0 ? void 0 : _c[0];
        if (dropoffMatch !== undefined) {
            dropoffMatch = (_d = dropoffMatch.match(/-[0-9]+/)) === null || _d === void 0 ? void 0 : _d[0];
            if (dropoffMatch !== undefined) {
                blastData.dropoff = parseInt(dropoffMatch);
            }
        }
        if (blastData.dropoff && !blastData.radius) {
            blastData.radius = -(data.data.action.damage.base / blastData.dropoff);
        }
        return blastData;
    }
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        if (jsonData.hasOwnProperty('range')) {
            data.data.thrown.ranges = Constants_1.Constants.WEAPON_RANGES[ImportHelper_1.ImportHelper.StringValue(jsonData, 'range')];
        }
        else {
            data.data.thrown.ranges = Constants_1.Constants.WEAPON_RANGES[ImportHelper_1.ImportHelper.StringValue(jsonData, 'category')];
        }
        data.data.thrown.blast = this.GetBlast(jsonData, data);
        return data;
    }
}
exports.ThrownParser = ThrownParser;

},{"../../helper/ImportHelper":126,"../../importer/Constants":133,"./WeaponParserBase":157}],157:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponParserBase = void 0;
const ImportHelper_1 = require("../../helper/ImportHelper");
const Constants_1 = require("../../importer/Constants");
const TechnologyItemParserBase_1 = require("../item/TechnologyItemParserBase");
class WeaponParserBase extends TechnologyItemParserBase_1.TechnologyItemParserBase {
    GetSkill(weaponJson) {
        if (weaponJson.hasOwnProperty('useskill')) {
            let jsonSkill = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'useskill');
            if (Constants_1.Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(jsonSkill)) {
                return Constants_1.Constants.MAP_CATEGORY_TO_SKILL[jsonSkill];
            }
            return jsonSkill.replace(/[\s\-]/g, '_').toLowerCase();
        }
        else {
            let category = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'category');
            if (Constants_1.Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(category)) {
                return Constants_1.Constants.MAP_CATEGORY_TO_SKILL[category];
            }
            let type = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'type').toLowerCase();
            return type === 'ranged' ? 'exotic_range' : 'exotic_melee';
        }
    }
    static GetWeaponType(weaponJson) {
        let type = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'type');
        //melee is the least specific, all melee entries are accurate
        if (type === 'Melee') {
            return 'melee';
        }
        else {
            // skill takes priorities over category
            if (weaponJson.hasOwnProperty('useskill')) {
                let skill = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'useskill');
                if (skill === 'Throwing Weapons')
                    return 'thrown';
            }
            // category is the fallback
            let category = ImportHelper_1.ImportHelper.StringValue(weaponJson, 'category');
            if (category === 'Throwing Weapons')
                return 'thrown';
            // ranged is everything else
            return 'range';
        }
    }
    Parse(jsonData, data, jsonTranslation) {
        data = super.Parse(jsonData, data, jsonTranslation);
        let category = ImportHelper_1.ImportHelper.StringValue(jsonData, 'category');
        // A single item does not meet normal rules, thanks Chummer!
        // TODO: Check these rules after localization using a generic, non-english approach.
        if (category === 'Hold-outs') {
            category = 'Holdouts';
        }
        data.data.category = WeaponParserBase.GetWeaponType(jsonData);
        data.data.subcategory = category.toLowerCase();
        data.data.action.skill = this.GetSkill(jsonData);
        data.data.action.damage = this.GetDamage(jsonData);
        data.data.action.limit.value = ImportHelper_1.ImportHelper.IntValue(jsonData, 'accuracy');
        data.data.action.limit.base = ImportHelper_1.ImportHelper.IntValue(jsonData, 'accuracy');
        data.data.technology.conceal.base = ImportHelper_1.ImportHelper.IntValue(jsonData, 'conceal');
        return data;
    }
}
exports.WeaponParserBase = WeaponParserBase;

},{"../../helper/ImportHelper":126,"../../importer/Constants":133,"../item/TechnologyItemParserBase":146}],158:[function(require,module,exports){
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
            if (data.action.limit) {
                const { limit } = data.action;
                const attribute = limit.attribute ? `${game.i18n.localize(CONFIG.SR5.limits[limit.attribute])}` : '';
                const limitVal = limit.value ? limit.value : '';
                let limitStr = '';
                if (attribute) {
                    limitStr += attribute;
                }
                if (limitVal) {
                    if (attribute) {
                        limitStr += ' + ';
                    }
                    limitStr += limitVal;
                }
                if (limitStr) {
                    props.push(`Limit ${limitStr}`);
                }
            }
            if (data.action.damage.type.value) {
                const { damage } = data.action;
                let damageString = '';
                let elementString = '';
                const attribute = damage.attribute ? `${game.i18n.localize(CONFIG.SR5.attributes[damage.attribute])} + ` : '';
                if (damage.value || attribute) {
                    const type = damage.type.value ? damage.type.value.toUpperCase().charAt(0) : '';
                    damageString = `DV ${attribute}${damage.value}${type}`;
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

},{"../helpers":123}],159:[function(require,module,exports){
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
    /**
     * PREPARE DATA CANNOT PULL FROM this.actor at ALL
     * - as of foundry v0.7.4, actor data isn't prepared by the time we prepare items
     * - this caused issues with Actions that have a Limit or Damage attribute and so those were moved
     */
    prepareData() {
        var _a;
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
            item.data.type = ((_a = item.data.action) === null || _a === void 0 ? void 0 : _a.type) ? 'active' : 'passive';
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
        const action = duplicate(this.data.data.action); // TODO replace with getAction() when available
        // add attribute value to the damage if we
        if (action.damage.attribute) {
            const { attribute } = action.damage;
            const att = this.actor.findAttribute(attribute);
            if (att) {
                action.damage.mod = PartsList_1.PartsList.AddUniquePart(action.damage.mod, att.label, att.value);
                action.damage.value = helpers_1.Helpers.calcTotal(action.damage);
            }
        }
        const damage = action.damage;
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
        const limit = duplicate((_a = this.data.data.action) === null || _a === void 0 ? void 0 : _a.limit);
        if (!limit)
            return undefined;
        // go through and set the label correctly
        if (this.data.type === 'weapon') {
            limit.label = 'SR5.Accuracy';
        }
        else if (limit === null || limit === void 0 ? void 0 : limit.attribute) {
            limit.label = CONFIG.SR5.limits[limit.attribute];
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
        // adjust limit value for actor data
        if (limit.attribute) {
            const att = this.actor.findLimit(limit.attribute);
            if (att) {
                limit.mod = PartsList_1.PartsList.AddUniquePart(limit.mod, att.label, att.value);
                helpers_1.Helpers.calcTotal(limit);
            }
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
        let limit = this.wrapper.getActionLimit();
        // get the limit modifiers from the actor if we have them
        const action = this.wrapper.getData().action; // TODO replace with the getAction() when available
        if ((action === null || action === void 0 ? void 0 : action.limit.attribute) && limit && this.actor) {
            const { attribute } = action.limit;
            const att = this.actor.findAttribute(attribute);
            if (att) {
                limit += att.value;
            }
        }
        return limit;
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

},{"../apps/dialogs/ShadowrunItemDialog":105,"../chat":111,"../constants":114,"../helpers":123,"../parts/PartsList":170,"../rolls/ShadowrunRoller":171,"./ChatData":158,"./SR5ItemDataWrapper":160}],160:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SR5ItemDataWrapper = void 0;
const DataWrapper_1 = require("../dataWrappers/DataWrapper");
class SR5ItemDataWrapper extends DataWrapper_1.DataWrapper {
    getType() {
        return this.data.type;
    }
    getData() {
        return this.data.data;
    }
    isAreaOfEffect() {
        // TODO figure out how to detect explosive ammo
        return this.isGrenade() || (this.isSpell() && this.getData().range === 'los_a'); //|| this.hasExplosiveAmmo();
    }
    isArmor() {
        return this.data.type === 'armor';
    }
    hasArmorBase() {
        var _a;
        return this.hasArmor() && !((_a = this.getData().armor) === null || _a === void 0 ? void 0 : _a.mod);
    }
    hasArmorAccessory() {
        var _a, _b;
        return this.hasArmor() && ((_b = (_a = this.getData().armor) === null || _a === void 0 ? void 0 : _a.mod) !== null && _b !== void 0 ? _b : false);
    }
    hasArmor() {
        return this.getArmorValue() > 0;
    }
    isGrenade() {
        var _a, _b;
        return this.isThrownWeapon() && ((_b = (_a = this.getData().thrown) === null || _a === void 0 ? void 0 : _a.blast.radius) !== null && _b !== void 0 ? _b : 0) > 0;
    }
    isThrownWeapon() {
        return this.isWeapon() && this.getData().category === 'thrown';
    }
    isWeapon() {
        return this.data.type === 'weapon';
    }
    isCyberware() {
        return this.data.type === 'cyberware';
    }
    isCombatSpell() {
        return this.isSpell() && this.getData().category === 'combat';
    }
    isRangedWeapon() {
        return this.isWeapon() && this.getData().category === 'range';
    }
    isSpell() {
        return this.data.type === 'spell';
    }
    isComplexForm() {
        return this.data.type === 'complex_form';
    }
    isMeleeWeapon() {
        return this.data.type === 'weapon' && this.getData().category === 'melee';
    }
    isDevice() {
        return this.data.type === 'device';
    }
    isEquipped() {
        var _a;
        return ((_a = this.getData().technology) === null || _a === void 0 ? void 0 : _a.equipped) || false;
    }
    isCyberdeck() {
        return this.isDevice() && this.getData().category === 'cyberdeck';
    }
    getId() {
        return this.data._id;
    }
    getBookSource() {
        var _a, _b;
        return (_b = (_a = this.getData().description) === null || _a === void 0 ? void 0 : _a.source) !== null && _b !== void 0 ? _b : '';
    }
    getConditionMonitor() {
        var _a, _b;
        return (_b = (_a = this.getData().technology) === null || _a === void 0 ? void 0 : _a.condition_monitor) !== null && _b !== void 0 ? _b : { value: 0, max: 0, label: '' };
    }
    getRating() {
        var _a;
        return ((_a = this.getData().technology) === null || _a === void 0 ? void 0 : _a.rating) || 0;
    }
    getArmorValue() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.getData()) === null || _a === void 0 ? void 0 : _a.armor) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 0;
    }
    getArmorElements() {
        // TODO clean this up
        const { fire, electricity, cold, acid } = this.getData().armor || {};
        return { fire: fire !== null && fire !== void 0 ? fire : 0, electricity: electricity !== null && electricity !== void 0 ? electricity : 0, cold: cold !== null && cold !== void 0 ? cold : 0, acid: acid !== null && acid !== void 0 ? acid : 0 };
    }
    getName() {
        return this.data.name;
    }
    getEssenceLoss() {
        var _a, _b;
        return (_b = (_a = this.getData()) === null || _a === void 0 ? void 0 : _a.essence) !== null && _b !== void 0 ? _b : 0;
    }
    getAmmo() {
        return this.getData().ammo;
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
            const atts = this.getData().atts;
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
        return ((_b = (_a = this.getData()) === null || _a === void 0 ? void 0 : _a.technology) === null || _b === void 0 ? void 0 : _b.quantity) || 1;
    }
    getActionDicePoolMod() {
        var _a;
        return (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.mod;
    }
    getLimitAttribute() {
        var _a, _b;
        return (_b = (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.limit) === null || _b === void 0 ? void 0 : _b.attribute;
    }
    getActionSkill() {
        var _a;
        return (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.skill;
    }
    getActionAttribute() {
        var _a;
        return (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.attribute;
    }
    getActionAttribute2() {
        var _a;
        return (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.attribute2;
    }
    getActionLimit() {
        var _a, _b;
        return (_b = (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.limit) === null || _b === void 0 ? void 0 : _b.value;
    }
    getModifierList() {
        var _a;
        return ((_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.dice_pool_mod) || [];
    }
    getActionSpecialization() {
        var _a;
        if ((_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.spec)
            return 'SR5.Specialization';
        return undefined;
    }
    getDrain() {
        return this.getData().drain || 0;
    }
    getFade() {
        return this.getData().fade || 0;
    }
    getRecoilCompensation() {
        var _a, _b, _c;
        if (!this.isRangedWeapon())
            return 0;
        const base = (_c = (_b = (_a = this.getData()) === null || _a === void 0 ? void 0 : _a.range) === null || _b === void 0 ? void 0 : _b.rc.value) !== null && _c !== void 0 ? _c : '0';
        return Number(base);
    }
    getReach() {
        var _a, _b;
        if (this.isMeleeWeapon()) {
            return (_b = (_a = this.getData().melee) === null || _a === void 0 ? void 0 : _a.reach) !== null && _b !== void 0 ? _b : 0;
        }
        return 0;
    }
    hasDefenseTest() {
        var _a, _b;
        return ((_b = (_a = this.getData().action) === null || _a === void 0 ? void 0 : _a.opposed) === null || _b === void 0 ? void 0 : _b.type) === 'defense';
    }
}
exports.SR5ItemDataWrapper = SR5ItemDataWrapper;

},{"../dataWrappers/DataWrapper":116}],161:[function(require,module,exports){
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

},{"../helpers":123}],162:[function(require,module,exports){
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

},{}],163:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlebarManager_1 = require("./handlebars/HandlebarManager");
const hooks_1 = require("./hooks");
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
hooks_1.HooksManager.registerHooks();
HandlebarManager_1.HandlebarManager.registerHelpers();

},{"./handlebars/HandlebarManager":118,"./hooks":124}],164:[function(require,module,exports){
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

},{"./VersionMigration":165,"./versions/LegacyMigration":166,"./versions/Version0_6_10":167,"./versions/Version0_6_5":168,"./versions/Version0_7_2":169}],165:[function(require,module,exports){
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

},{}],166:[function(require,module,exports){
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

},{"../VersionMigration":165}],167:[function(require,module,exports){
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

},{"../VersionMigration":165}],168:[function(require,module,exports){
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

},{"../VersionMigration":165}],169:[function(require,module,exports){
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

},{"../../config":113,"../VersionMigration":165}],170:[function(require,module,exports){
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

},{}],171:[function(require,module,exports){
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

},{"../chat":111,"../constants":114,"../helpers":123,"../parts/PartsList":170}],172:[function(require,module,exports){
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

},{"./constants":114,"./migrator/VersionMigration":165}],173:[function(require,module,exports){
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

},{}]},{},[163])

//# sourceMappingURL=bundle.js.map
