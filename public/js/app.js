/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = __webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.22.0"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = __webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version;

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/svelte-routing/src/Link.svelte":
/*!*****************************************************!*\
  !*** ./node_modules/svelte-routing/src/Link.svelte ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var _contexts_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contexts.js */ "./node_modules/svelte-routing/src/contexts.js");
/* harmony import */ var _history_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./history.js */ "./node_modules/svelte-routing/src/history.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils.js */ "./node_modules/svelte-routing/src/utils.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.43.1 */






function create_fragment(ctx) {
  var a;
  var current;
  var mounted;
  var dispose;
  var default_slot_template =
  /*#slots*/
  ctx[16]["default"];
  var default_slot = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_slot)(default_slot_template, ctx,
  /*$$scope*/
  ctx[15], null);
  var a_levels = [{
    href:
    /*href*/
    ctx[0]
  }, {
    "aria-current":
    /*ariaCurrent*/
    ctx[2]
  },
  /*props*/
  ctx[1],
  /*$$restProps*/
  ctx[6]];
  var a_data = {};

  for (var i = 0; i < a_levels.length; i += 1) {
    a_data = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(a_data, a_levels[i]);
  }

  return {
    c: function c() {
      a = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a");
      if (default_slot) default_slot.c();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_attributes)(a, a_data);
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, a, anchor);

      if (default_slot) {
        default_slot.m(a, null);
      }

      current = true;

      if (!mounted) {
        dispose = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(a, "click",
        /*onClick*/
        ctx[5]);
        mounted = true;
      }
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (default_slot) {
        if (default_slot.p && (!current || dirty &
        /*$$scope*/
        32768)) {
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_slot_base)(default_slot, default_slot_template, ctx,
          /*$$scope*/
          ctx[15], !current ? (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_all_dirty_from_scope)(
          /*$$scope*/
          ctx[15]) : (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_slot_changes)(default_slot_template,
          /*$$scope*/
          ctx[15], dirty, null), null);
        }
      }

      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_attributes)(a, a_data = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(a_levels, [(!current || dirty &
      /*href*/
      1) && {
        href:
        /*href*/
        ctx[0]
      }, (!current || dirty &
      /*ariaCurrent*/
      4) && {
        "aria-current":
        /*ariaCurrent*/
        ctx[2]
      }, dirty &
      /*props*/
      2 &&
      /*props*/
      ctx[1], dirty &
      /*$$restProps*/
      64 &&
      /*$$restProps*/
      ctx[6]]));
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(default_slot, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(default_slot, local);
      current = false;
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(a);
      if (default_slot) default_slot.d(detaching);
      mounted = false;
      dispose();
    }
  };
}

function instance($$self, $$props, $$invalidate) {
  var ariaCurrent;
  var omit_props_names = ["to", "replace", "state", "getProps"];
  var $$restProps = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.compute_rest_props)($$props, omit_props_names);
  var $location;
  var $base;
  var _$$props = $$props,
      _$$props$$$slots = _$$props.$$slots,
      slots = _$$props$$$slots === void 0 ? {} : _$$props$$$slots,
      $$scope = _$$props.$$scope;
  var _$$props2 = $$props,
      _$$props2$to = _$$props2.to,
      to = _$$props2$to === void 0 ? "#" : _$$props2$to;
  var _$$props3 = $$props,
      _$$props3$replace = _$$props3.replace,
      replace = _$$props3$replace === void 0 ? false : _$$props3$replace;
  var _$$props4 = $$props,
      _$$props4$state = _$$props4.state,
      state = _$$props4$state === void 0 ? {} : _$$props4$state;
  var _$$props5 = $$props,
      _$$props5$getProps = _$$props5.getProps,
      getProps = _$$props5$getProps === void 0 ? function () {
    return {};
  } : _$$props5$getProps;

  var _getContext = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_2__.ROUTER),
      base = _getContext.base;

  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, base, function (value) {
    return $$invalidate(14, $base = value);
  });
  var location = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_2__.LOCATION);
  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, location, function (value) {
    return $$invalidate(13, $location = value);
  });
  var dispatch = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.createEventDispatcher)();
  var href, isPartiallyCurrent, isCurrent, props;

  function onClick(event) {
    dispatch("click", event);

    if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_4__.shouldNavigate)(event)) {
      event.preventDefault(); // Don't push another entry to the history stack when the user
      // clicks on a Link to the page they are currently on.

      var shouldReplace = $location.pathname === href || replace;
      (0,_history_js__WEBPACK_IMPORTED_MODULE_3__.navigate)(href, {
        state: state,
        replace: shouldReplace
      });
    }
  }

  $$self.$$set = function ($$new_props) {
    $$props = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)((0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)({}, $$props), (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.exclude_internal_props)($$new_props));
    $$invalidate(6, $$restProps = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.compute_rest_props)($$props, omit_props_names));
    if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
  };

  $$self.$$.update = function () {
    if ($$self.$$.dirty &
    /*to, $base*/
    16512) {
      $: $$invalidate(0, href = to === "/" ? $base.uri : (0,_utils_js__WEBPACK_IMPORTED_MODULE_4__.resolve)(to, $base.uri));
    }

    if ($$self.$$.dirty &
    /*$location, href*/
    8193) {
      $: $$invalidate(11, isPartiallyCurrent = (0,_utils_js__WEBPACK_IMPORTED_MODULE_4__.startsWith)($location.pathname, href));
    }

    if ($$self.$$.dirty &
    /*href, $location*/
    8193) {
      $: $$invalidate(12, isCurrent = href === $location.pathname);
    }

    if ($$self.$$.dirty &
    /*isCurrent*/
    4096) {
      $: $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    }

    if ($$self.$$.dirty &
    /*getProps, $location, href, isPartiallyCurrent, isCurrent*/
    15361) {
      $: $$invalidate(1, props = getProps({
        location: $location,
        href: href,
        isPartiallyCurrent: isPartiallyCurrent,
        isCurrent: isCurrent
      }));
    }
  };

  return [href, props, ariaCurrent, base, location, onClick, $$restProps, to, replace, state, getProps, isPartiallyCurrent, isCurrent, $location, $base, $$scope, slots];
}

var Link = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Link, _SvelteComponent);

  var _super = _createSuper(Link);

  function Link(options) {
    var _this;

    _classCallCheck(this, Link);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
      to: 7,
      replace: 8,
      state: 9,
      getProps: 10
    });
    return _this;
  }

  return Link;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Link);

/***/ }),

/***/ "./node_modules/svelte-routing/src/Route.svelte":
/*!******************************************************!*\
  !*** ./node_modules/svelte-routing/src/Route.svelte ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var _contexts_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contexts.js */ "./node_modules/svelte-routing/src/contexts.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _excluded = ["path", "component"];

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.43.1 */




var get_default_slot_changes = function get_default_slot_changes(dirty) {
  return {
    params: dirty &
    /*routeParams*/
    4,
    location: dirty &
    /*$location*/
    16
  };
};

var get_default_slot_context = function get_default_slot_context(ctx) {
  return {
    params:
    /*routeParams*/
    ctx[2],
    location:
    /*$location*/
    ctx[4]
  };
}; // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}


function create_if_block(ctx) {
  var current_block_type_index;
  var if_block;
  var if_block_anchor;
  var current;
  var if_block_creators = [create_if_block_1, create_else_block];
  var if_blocks = [];

  function select_block_type(ctx, dirty) {
    if (
    /*component*/
    ctx[0] !== null) return 0;
    return 1;
  }

  current_block_type_index = select_block_type(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c: function c() {
      if_block.c();
      if_block_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
    },
    m: function m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
      current = true;
    },
    p: function p(ctx, dirty) {
      var previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx, dirty);

      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx, dirty);
      } else {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, function () {
          if_blocks[previous_block_index] = null;
        });
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
        if_block = if_blocks[current_block_type_index];

        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
          if_block.c();
        } else {
          if_block.p(ctx, dirty);
        }

        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block);
      current = false;
    },
    d: function d(detaching) {
      if_blocks[current_block_type_index].d(detaching);
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
    }
  };
} // (43:2) {:else}


function create_else_block(ctx) {
  var current;
  var default_slot_template =
  /*#slots*/
  ctx[10]["default"];
  var default_slot = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_slot)(default_slot_template, ctx,
  /*$$scope*/
  ctx[9], get_default_slot_context);
  return {
    c: function c() {
      if (default_slot) default_slot.c();
    },
    m: function m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }

      current = true;
    },
    p: function p(ctx, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty &
        /*$$scope, routeParams, $location*/
        532)) {
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_slot_base)(default_slot, default_slot_template, ctx,
          /*$$scope*/
          ctx[9], !current ? (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_all_dirty_from_scope)(
          /*$$scope*/
          ctx[9]) : (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_slot_changes)(default_slot_template,
          /*$$scope*/
          ctx[9], dirty, get_default_slot_changes), get_default_slot_context);
        }
      }
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(default_slot, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(default_slot, local);
      current = false;
    },
    d: function d(detaching) {
      if (default_slot) default_slot.d(detaching);
    }
  };
} // (41:2) {#if component !== null}


function create_if_block_1(ctx) {
  var switch_instance;
  var switch_instance_anchor;
  var current;
  var switch_instance_spread_levels = [{
    location:
    /*$location*/
    ctx[4]
  },
  /*routeParams*/
  ctx[2],
  /*routeProps*/
  ctx[3]];
  var switch_value =
  /*component*/
  ctx[0];

  function switch_props(ctx) {
    var switch_instance_props = {};

    for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(switch_instance_props, switch_instance_spread_levels[i]);
    }

    return {
      props: switch_instance_props
    };
  }

  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }

  return {
    c: function c() {
      if (switch_instance) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(switch_instance.$$.fragment);
      switch_instance_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
    },
    m: function m(target, anchor) {
      if (switch_instance) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(switch_instance, target, anchor);
      }

      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, switch_instance_anchor, anchor);
      current = true;
    },
    p: function p(ctx, dirty) {
      var switch_instance_changes = dirty &
      /*$location, routeParams, routeProps*/
      28 ? (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(switch_instance_spread_levels, [dirty &
      /*$location*/
      16 && {
        location:
        /*$location*/
        ctx[4]
      }, dirty &
      /*routeParams*/
      4 && (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(
      /*routeParams*/
      ctx[2]), dirty &
      /*routeProps*/
      8 && (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(
      /*routeProps*/
      ctx[3])]) : {};

      if (switch_value !== (switch_value =
      /*component*/
      ctx[0])) {
        if (switch_instance) {
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();
          var old_component = switch_instance;
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(old_component.$$.fragment, 1, 0, function () {
            (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(old_component, 1);
          });
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
        }

        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx));
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(switch_instance.$$.fragment);
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(switch_instance.$$.fragment, 1);
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i: function i(local) {
      if (current) return;
      if (switch_instance) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(switch_instance.$$.fragment, local);
      current = true;
    },
    o: function o(local) {
      if (switch_instance) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(switch_instance.$$.fragment, local);
      current = false;
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(switch_instance_anchor);
      if (switch_instance) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(switch_instance, detaching);
    }
  };
}

function create_fragment(ctx) {
  var if_block_anchor;
  var current;
  var if_block =
  /*$activeRoute*/
  ctx[1] !== null &&
  /*$activeRoute*/
  ctx[1].route ===
  /*route*/
  ctx[7] && create_if_block(ctx);
  return {
    c: function c() {
      if (if_block) if_block.c();
      if_block_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
    },
    m: function m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
      current = true;
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (
      /*$activeRoute*/
      ctx[1] !== null &&
      /*$activeRoute*/
      ctx[1].route ===
      /*route*/
      ctx[7]) {
        if (if_block) {
          if_block.p(ctx, dirty);

          if (dirty &
          /*$activeRoute*/
          2) {
            (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx);
          if_block.c();
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, function () {
          if_block = null;
        });
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
      }
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block);
      current = false;
    },
    d: function d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
    }
  };
}

function instance($$self, $$props, $$invalidate) {
  var $activeRoute;
  var $location;
  var _$$props = $$props,
      _$$props$$$slots = _$$props.$$slots,
      slots = _$$props$$$slots === void 0 ? {} : _$$props$$$slots,
      $$scope = _$$props.$$scope;
  var _$$props2 = $$props,
      _$$props2$path = _$$props2.path,
      path = _$$props2$path === void 0 ? "" : _$$props2$path;
  var _$$props3 = $$props,
      _$$props3$component = _$$props3.component,
      component = _$$props3$component === void 0 ? null : _$$props3$component;

  var _getContext = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_2__.ROUTER),
      registerRoute = _getContext.registerRoute,
      unregisterRoute = _getContext.unregisterRoute,
      activeRoute = _getContext.activeRoute;

  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, activeRoute, function (value) {
    return $$invalidate(1, $activeRoute = value);
  });
  var location = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_2__.LOCATION);
  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, location, function (value) {
    return $$invalidate(4, $location = value);
  });
  var route = {
    path: path,
    // If no path prop is given, this Route will act as the default Route
    // that is rendered if no other Route in the Router is a match.
    "default": path === ""
  };
  var routeParams = {};
  var routeProps = {};
  registerRoute(route); // There is no need to unregister Routes in SSR since it will all be
  // thrown away anyway.

  if (typeof window !== "undefined") {
    (0,svelte__WEBPACK_IMPORTED_MODULE_1__.onDestroy)(function () {
      unregisterRoute(route);
    });
  }

  $$self.$$set = function ($$new_props) {
    $$invalidate(13, $$props = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)((0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)({}, $$props), (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.exclude_internal_props)($$new_props)));
    if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
  };

  $$self.$$.update = function () {
    if ($$self.$$.dirty &
    /*$activeRoute*/
    2) {
      $: if ($activeRoute && $activeRoute.route === route) {
        $$invalidate(2, routeParams = $activeRoute.params);
      }
    }

    $: {
      var _$$props4 = $$props,
          _path = _$$props4.path,
          _component = _$$props4.component,
          rest = _objectWithoutProperties(_$$props4, _excluded);

      $$invalidate(3, routeProps = rest);
    }
  };

  $$props = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.exclude_internal_props)($$props);
  return [component, $activeRoute, routeParams, routeProps, $location, activeRoute, location, route, path, $$scope, slots];
}

var Route = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Route, _SvelteComponent);

  var _super = _createSuper(Route);

  function Route(options) {
    var _this;

    _classCallCheck(this, Route);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
      path: 8,
      component: 0
    });
    return _this;
  }

  return Route;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Route);

/***/ }),

/***/ "./node_modules/svelte-routing/src/Router.svelte":
/*!*******************************************************!*\
  !*** ./node_modules/svelte-routing/src/Router.svelte ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var svelte_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! svelte/store */ "./node_modules/svelte/store/index.mjs");
/* harmony import */ var _contexts_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contexts.js */ "./node_modules/svelte-routing/src/contexts.js");
/* harmony import */ var _history_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./history.js */ "./node_modules/svelte-routing/src/history.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils.js */ "./node_modules/svelte-routing/src/utils.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.43.1 */







function create_fragment(ctx) {
  var current;
  var default_slot_template =
  /*#slots*/
  ctx[9]["default"];
  var default_slot = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_slot)(default_slot_template, ctx,
  /*$$scope*/
  ctx[8], null);
  return {
    c: function c() {
      if (default_slot) default_slot.c();
    },
    m: function m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }

      current = true;
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (default_slot) {
        if (default_slot.p && (!current || dirty &
        /*$$scope*/
        256)) {
          (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_slot_base)(default_slot, default_slot_template, ctx,
          /*$$scope*/
          ctx[8], !current ? (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_all_dirty_from_scope)(
          /*$$scope*/
          ctx[8]) : (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_slot_changes)(default_slot_template,
          /*$$scope*/
          ctx[8], dirty, null), null);
        }
      }
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(default_slot, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(default_slot, local);
      current = false;
    },
    d: function d(detaching) {
      if (default_slot) default_slot.d(detaching);
    }
  };
}

function instance($$self, $$props, $$invalidate) {
  var $location;
  var $routes;
  var $base;
  var _$$props$$$slots = $$props.$$slots,
      slots = _$$props$$$slots === void 0 ? {} : _$$props$$$slots,
      $$scope = $$props.$$scope;
  var _$$props$basepath = $$props.basepath,
      basepath = _$$props$basepath === void 0 ? "/" : _$$props$basepath;
  var _$$props$url = $$props.url,
      url = _$$props$url === void 0 ? null : _$$props$url;
  var locationContext = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_3__.LOCATION);
  var routerContext = (0,svelte__WEBPACK_IMPORTED_MODULE_1__.getContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_3__.ROUTER);
  var routes = (0,svelte_store__WEBPACK_IMPORTED_MODULE_2__.writable)([]);
  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, routes, function (value) {
    return $$invalidate(6, $routes = value);
  });
  var activeRoute = (0,svelte_store__WEBPACK_IMPORTED_MODULE_2__.writable)(null);
  var hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.
  // If locationContext is not set, this is the topmost Router in the tree.
  // If the `url` prop is given we force the location to it.

  var location = locationContext || (0,svelte_store__WEBPACK_IMPORTED_MODULE_2__.writable)(url ? {
    pathname: url
  } : _history_js__WEBPACK_IMPORTED_MODULE_4__.globalHistory.location);
  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, location, function (value) {
    return $$invalidate(5, $location = value);
  }); // If routerContext is set, the routerBase of the parent Router
  // will be the base for this Router's descendants.
  // If routerContext is not set, the path and resolved uri will both
  // have the value of the basepath prop.

  var base = routerContext ? routerContext.routerBase : (0,svelte_store__WEBPACK_IMPORTED_MODULE_2__.writable)({
    path: basepath,
    uri: basepath
  });
  (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, base, function (value) {
    return $$invalidate(7, $base = value);
  });
  var routerBase = (0,svelte_store__WEBPACK_IMPORTED_MODULE_2__.derived)([base, activeRoute], function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        base = _ref4[0],
        activeRoute = _ref4[1];

    // If there is no activeRoute, the routerBase will be identical to the base.
    if (activeRoute === null) {
      return base;
    }

    var basepath = base.path;
    var route = activeRoute.route,
        uri = activeRoute.uri; // Remove the potential /* or /*splatname from
    // the end of the child Routes relative paths.

    var path = route["default"] ? basepath : route.path.replace(/\*.*$/, "");
    return {
      path: path,
      uri: uri
    };
  });

  function registerRoute(route) {
    var _$base = $base,
        basepath = _$base.path;
    var path = route.path; // We store the original path in the _path property so we can reuse
    // it when the basepath changes. The only thing that matters is that
    // the route reference is intact, so mutation is fine.

    route._path = path;
    route.path = (0,_utils_js__WEBPACK_IMPORTED_MODULE_5__.combinePaths)(basepath, path);

    if (typeof window === "undefined") {
      // In SSR we should set the activeRoute immediately if it is a match.
      // If there are more Routes being registered after a match is found,
      // we just skip them.
      if (hasActiveRoute) {
        return;
      }

      var matchingRoute = (0,_utils_js__WEBPACK_IMPORTED_MODULE_5__.match)(route, $location.pathname);

      if (matchingRoute) {
        activeRoute.set(matchingRoute);
        hasActiveRoute = true;
      }
    } else {
      routes.update(function (rs) {
        rs.push(route);
        return rs;
      });
    }
  }

  function unregisterRoute(route) {
    routes.update(function (rs) {
      var index = rs.indexOf(route);
      rs.splice(index, 1);
      return rs;
    });
  }

  if (!locationContext) {
    // The topmost Router in the tree is responsible for updating
    // the location store and supplying it through context.
    (0,svelte__WEBPACK_IMPORTED_MODULE_1__.onMount)(function () {
      var unlisten = _history_js__WEBPACK_IMPORTED_MODULE_4__.globalHistory.listen(function (history) {
        location.set(history.location);
      });
      return unlisten;
    });
    (0,svelte__WEBPACK_IMPORTED_MODULE_1__.setContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_3__.LOCATION, location);
  }

  (0,svelte__WEBPACK_IMPORTED_MODULE_1__.setContext)(_contexts_js__WEBPACK_IMPORTED_MODULE_3__.ROUTER, {
    activeRoute: activeRoute,
    base: base,
    routerBase: routerBase,
    registerRoute: registerRoute,
    unregisterRoute: unregisterRoute
  });

  $$self.$$set = function ($$props) {
    if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    if ('url' in $$props) $$invalidate(4, url = $$props.url);
    if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
  };

  $$self.$$.update = function () {
    if ($$self.$$.dirty &
    /*$base*/
    128) {
      // This reactive statement will update all the Routes' path when
      // the basepath changes.
      $: {
        var _$base2 = $base,
            _basepath = _$base2.path;
        routes.update(function (rs) {
          rs.forEach(function (r) {
            return r.path = (0,_utils_js__WEBPACK_IMPORTED_MODULE_5__.combinePaths)(_basepath, r._path);
          });
          return rs;
        });
      }
    }

    if ($$self.$$.dirty &
    /*$routes, $location*/
    96) {
      // This reactive statement will be run when the Router is created
      // when there are no Routes and then again the following tick, so it
      // will not find an active Route in SSR and in the browser it will only
      // pick an active Route after all Routes have been registered.
      $: {
        var bestMatch = (0,_utils_js__WEBPACK_IMPORTED_MODULE_5__.pick)($routes, $location.pathname);
        activeRoute.set(bestMatch);
      }
    }
  };

  return [routes, location, base, basepath, url, $location, $routes, $base, $$scope, slots];
}

var Router = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Router, _SvelteComponent);

  var _super = _createSuper(Router);

  function Router(options) {
    var _this;

    _classCallCheck(this, Router);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
      basepath: 3,
      url: 4
    });
    return _this;
  }

  return Router;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Router);

/***/ }),

/***/ "./resources/js/App.svelte":
/*!*********************************!*\
  !*** ./resources/js/App.svelte ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte_routing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte-routing */ "./node_modules/svelte-routing/src/index.js");
/* harmony import */ var _routes_Home__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./routes/Home */ "./resources/js/routes/Home.svelte");
/* harmony import */ var _routes_Nofifications__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./routes/Nofifications */ "./resources/js/routes/Nofifications.svelte");
/* harmony import */ var _routes_Messages__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./routes/Messages */ "./resources/js/routes/Messages.svelte");
/* harmony import */ var _routes_Favorites__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./routes/Favorites */ "./resources/js/routes/Favorites.svelte");
/* harmony import */ var _routes_UserProfile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./routes/UserProfile */ "./resources/js/routes/UserProfile.svelte");
/* harmony import */ var _routes_MyProfile_svelte__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./routes/MyProfile.svelte */ "./resources/js/routes/MyProfile.svelte");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* resources\js\App.svelte generated by Svelte v3.43.1 */









function create_default_slot_5(ctx) {
  var t;
  return {
    c: function c() {
      t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Home");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
    }
  };
} // (20:16) <Link to="notifications">


function create_default_slot_4(ctx) {
  var t;
  return {
    c: function c() {
      t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Notifications");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
    }
  };
} // (21:16) <Link to="messages">


function create_default_slot_3(ctx) {
  var t;
  return {
    c: function c() {
      t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Messages");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
    }
  };
} // (22:16) <Link to="compte">


function create_default_slot_2(ctx) {
  var t;
  return {
    c: function c() {
      t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Mon compte");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
    }
  };
} // (26:12) <Route path="/">


function create_default_slot_1(ctx) {
  var home;
  var current;
  home = new _routes_Home__WEBPACK_IMPORTED_MODULE_2__["default"]({});
  return {
    c: function c() {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(home.$$.fragment);
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(home, target, anchor);
      current = true;
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(home.$$.fragment, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(home.$$.fragment, local);
      current = false;
    },
    d: function d(detaching) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(home, detaching);
    }
  };
} // (15:0) <Router url="{url}">


function create_default_slot(ctx) {
  var div2;
  var div0;
  var nav;
  var link0;
  var t0;
  var link1;
  var t1;
  var link2;
  var t2;
  var link3;
  var t3;
  var div1;
  var route0;
  var t4;
  var route1;
  var t5;
  var route2;
  var t6;
  var route3;
  var t7;
  var route4;
  var t8;
  var route5;
  var current;
  link0 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Link({
    props: {
      to: "/",
      $$slots: {
        "default": [create_default_slot_5]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  link1 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Link({
    props: {
      to: "notifications",
      $$slots: {
        "default": [create_default_slot_4]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  link2 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Link({
    props: {
      to: "messages",
      $$slots: {
        "default": [create_default_slot_3]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  link3 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Link({
    props: {
      to: "compte",
      $$slots: {
        "default": [create_default_slot_2]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  route0 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "/",
      $$slots: {
        "default": [create_default_slot_1]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  route1 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "notifications",
      component: _routes_Nofifications__WEBPACK_IMPORTED_MODULE_3__["default"]
    }
  });
  route2 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "messages",
      component: _routes_Messages__WEBPACK_IMPORTED_MODULE_4__["default"]
    }
  });
  route3 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "favoris",
      component: _routes_Favorites__WEBPACK_IMPORTED_MODULE_5__["default"]
    }
  });
  route4 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "compte",
      component: _routes_MyProfile_svelte__WEBPACK_IMPORTED_MODULE_7__["default"]
    }
  });
  route5 = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Route({
    props: {
      path: "*",
      component: _routes_UserProfile__WEBPACK_IMPORTED_MODULE_6__["default"]
    }
  });
  return {
    c: function c() {
      div2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      div0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      nav = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("nav");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(link0.$$.fragment);
      t0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(link1.$$.fragment);
      t1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(link2.$$.fragment);
      t2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(link3.$$.fragment);
      t3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      div1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route0.$$.fragment);
      t4 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route1.$$.fragment);
      t5 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route2.$$.fragment);
      t6 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route3.$$.fragment);
      t7 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route4.$$.fragment);
      t8 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(route5.$$.fragment);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(nav, "class", "flex flex-col");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div0, "class", "p-5 w-1/5 bg-gray-100");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", "");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div2, "class", "container flex items-stretch");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div2, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div2, div0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, nav);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(link0, nav, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, t0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(link1, nav, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, t1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(link2, nav, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, t2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(link3, nav, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div2, t3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div2, div1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route0, div1, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t4);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route1, div1, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t5);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route2, div1, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t6);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route3, div1, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t7);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route4, div1, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t8);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(route5, div1, null);
      current = true;
    },
    p: function p(ctx, dirty) {
      var link0_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link0_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link0.$set(link0_changes);
      var link1_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link1_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link1.$set(link1_changes);
      var link2_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link2_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link2.$set(link2_changes);
      var link3_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        link3_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link3.$set(link3_changes);
      var route0_changes = {};

      if (dirty &
      /*$$scope*/
      2) {
        route0_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      route0.$set(route0_changes);
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(link0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(link1.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(link2.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(link3.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route1.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route2.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route3.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route4.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(route5.$$.fragment, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(link0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(link1.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(link2.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(link3.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route1.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route2.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route3.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route4.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(route5.$$.fragment, local);
      current = false;
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(link0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(link1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(link2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(link3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route4);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(route5);
    }
  };
}

function create_fragment(ctx) {
  var router;
  var current;
  router = new svelte_routing__WEBPACK_IMPORTED_MODULE_1__.Router({
    props: {
      url:
      /*url*/
      ctx[0],
      $$slots: {
        "default": [create_default_slot]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  return {
    c: function c() {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(router.$$.fragment);
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(router, target, anchor);
      current = true;
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      var router_changes = {};
      if (dirty &
      /*url*/
      1) router_changes.url =
      /*url*/
      ctx[0];

      if (dirty &
      /*$$scope*/
      2) {
        router_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      router.$set(router_changes);
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(router.$$.fragment, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(router.$$.fragment, local);
      current = false;
    },
    d: function d(detaching) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(router, detaching);
    }
  };
}

function instance($$self, $$props, $$invalidate) {
  var _$$props$url = $$props.url,
      url = _$$props$url === void 0 ? '' : _$$props$url;

  $$self.$$set = function ($$props) {
    if ('url' in $$props) $$invalidate(0, url = $$props.url);
  };

  return [url];
}

var App = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(App, _SvelteComponent);

  var _super = _createSuper(App);

  function App(options) {
    var _this;

    _classCallCheck(this, App);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
      url: 0
    });
    return _this;
  }

  return App;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./resources/js/routes/Favorites.svelte":
/*!**********************************************!*\
  !*** ./resources/js/routes/Favorites.svelte ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* resources\js\routes\Favorites.svelte generated by Svelte v3.43.1 */


function create_fragment(ctx) {
  var div;
  return {
    c: function c() {
      div = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      div.textContent = "favorites";
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
    },
    p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
    }
  };
}

var Favorites = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Favorites, _SvelteComponent);

  var _super = _createSuper(Favorites);

  function Favorites(options) {
    var _this;

    _classCallCheck(this, Favorites);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, null, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {});
    return _this;
  }

  return Favorites;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Favorites);

/***/ }),

/***/ "./resources/js/routes/Home.svelte":
/*!*****************************************!*\
  !*** ./resources/js/routes/Home.svelte ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var svelte_routing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! svelte-routing */ "./node_modules/svelte-routing/src/index.js");
/* harmony import */ var _UserProfile__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./UserProfile */ "./resources/js/routes/UserProfile.svelte");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* resources\js\routes\Home.svelte generated by Svelte v3.43.1 */






function get_each_context(ctx, list, i) {
  var child_ctx = ctx.slice();
  child_ctx[2] = list[i];
  return child_ctx;
} // (26:16) <Link to="{user.username}">


function create_default_slot_1(ctx) {
  var img;
  var img_src_value;
  return {
    c: function c() {
      img = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("img");
      if (!(0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.src_url_equal)(img.src, img_src_value = "https://picsum.photos/seed/picsum/200/150")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(img, "src", img_src_value);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(img, "alt", "");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, img, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(img);
    }
  };
} // (34:16) <Link to="{user.username}">


function create_default_slot(ctx) {
  var t;
  return {
    c: function c() {
      t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)("Voir profil");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, t, anchor);
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(t);
    }
  };
} // (23:4) {#each users as user}


function create_each_block(ctx) {
  var div6;
  var div0;
  var link0;
  var t0;
  var div4;
  var div1;
  var t1_value =
  /*user*/
  ctx[2].username + "";
  var t1;
  var t2;
  var div2;
  var t3_value = new Date().getFullYear() -
  /*user*/
  ctx[2].birth_year + "";
  var t3;
  var t4;
  var t5;
  var div3;
  var t7;
  var div5;
  var link1;
  var t8;
  var current;
  link0 = new svelte_routing__WEBPACK_IMPORTED_MODULE_4__.Link({
    props: {
      to:
      /*user*/
      ctx[2].username,
      $$slots: {
        "default": [create_default_slot_1]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  link1 = new svelte_routing__WEBPACK_IMPORTED_MODULE_4__.Link({
    props: {
      to:
      /*user*/
      ctx[2].username,
      $$slots: {
        "default": [create_default_slot]
      },
      $$scope: {
        ctx: ctx
      }
    }
  });
  return {
    c: function c() {
      div6 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      div0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.create_component)(link0.$$.fragment);
      t0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div4 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      div1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      t1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(t1_value);
      t2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      t3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(t3_value);
      t4 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(" ans");
      t5 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      div3.textContent = "Paris";
      t7 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div5 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.create_component)(link1.$$.fragment);
      t8 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div0, "class", "card-image");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div4, "class", "card-content p-3");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div5, "class", "card-footer flex text-center border-t-2 border-fuchsia-600 text-center p-3");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div6, "class", "bg-white m-5 card");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, div6, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, div0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.mount_component)(link0, div0, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, t0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, div4);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, div1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, t1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, t2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, div2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div2, t3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div2, t4);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, t5);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, div3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, t7);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, div5);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.mount_component)(link1, div5, null);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div6, t8);
      current = true;
    },
    p: function p(ctx, dirty) {
      var link0_changes = {};
      if (dirty &
      /*users*/
      1) link0_changes.to =
      /*user*/
      ctx[2].username;

      if (dirty &
      /*$$scope*/
      32) {
        link0_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link0.$set(link0_changes);
      if ((!current || dirty &
      /*users*/
      1) && t1_value !== (t1_value =
      /*user*/
      ctx[2].username + "")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_data)(t1, t1_value);
      if ((!current || dirty &
      /*users*/
      1) && t3_value !== (t3_value = new Date().getFullYear() -
      /*user*/
      ctx[2].birth_year + "")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_data)(t3, t3_value);
      var link1_changes = {};
      if (dirty &
      /*users*/
      1) link1_changes.to =
      /*user*/
      ctx[2].username;

      if (dirty &
      /*$$scope*/
      32) {
        link1_changes.$$scope = {
          dirty: dirty,
          ctx: ctx
        };
      }

      link1.$set(link1_changes);
    },
    i: function i(local) {
      if (current) return;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_in)(link0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_in)(link1.$$.fragment, local);
      current = true;
    },
    o: function o(local) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_out)(link0.$$.fragment, local);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_out)(link1.$$.fragment, local);
      current = false;
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(div6);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.destroy_component)(link0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.destroy_component)(link1);
    }
  };
}

function create_fragment(ctx) {
  var div;
  var current;
  var each_value =
  /*users*/
  ctx[0];
  var each_blocks = [];

  for (var i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }

  var out = function out(i) {
    return (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_out)(each_blocks[i], 1, 1, function () {
      each_blocks[i] = null;
    });
  };

  return {
    c: function c() {
      div = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");

      for (var _i = 0; _i < each_blocks.length; _i += 1) {
        each_blocks[_i].c();
      }

      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div, "class", "p-5 flex flex-wrap");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, div, anchor);

      for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
        each_blocks[_i2].m(div, null);
      }

      current = true;
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (dirty &
      /*users, Date*/
      1) {
        each_value =
        /*users*/
        ctx[0];

        var _i3;

        for (_i3 = 0; _i3 < each_value.length; _i3 += 1) {
          var child_ctx = get_each_context(ctx, each_value, _i3);

          if (each_blocks[_i3]) {
            each_blocks[_i3].p(child_ctx, dirty);

            (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_in)(each_blocks[_i3], 1);
          } else {
            each_blocks[_i3] = create_each_block(child_ctx);

            each_blocks[_i3].c();

            (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_in)(each_blocks[_i3], 1);

            each_blocks[_i3].m(div, null);
          }
        }

        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.group_outros)();

        for (_i3 = each_value.length; _i3 < each_blocks.length; _i3 += 1) {
          out(_i3);
        }

        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.check_outros)();
      }
    },
    i: function i(local) {
      if (current) return;

      for (var _i4 = 0; _i4 < each_value.length; _i4 += 1) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_in)(each_blocks[_i4]);
      }

      current = true;
    },
    o: function o(local) {
      each_blocks = each_blocks.filter(Boolean);

      for (var _i5 = 0; _i5 < each_blocks.length; _i5 += 1) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.transition_out)(each_blocks[_i5]);
      }

      current = false;
    },
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(div);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.destroy_each)(each_blocks, detaching);
    }
  };
}

function instance($$self, $$props, $$invalidate) {
  var users = [];
  var error = null;
  (0,svelte__WEBPACK_IMPORTED_MODULE_2__.onMount)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee() {
    var response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return axios__WEBPACK_IMPORTED_MODULE_3___default().get('http://localhost:8080/api/users');

          case 3:
            response = _context.sent;
            $$invalidate(0, users = response.data);
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            error = _context.t0; // console.log(users)

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 7]]);
  })));
  return [users];
}

var Home = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Home, _SvelteComponent);

  var _super = _createSuper(Home);

  function Home(options) {
    var _this;

    _classCallCheck(this, Home);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_1__.safe_not_equal, {});
    return _this;
  }

  return Home;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_1__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);

/***/ }),

/***/ "./resources/js/routes/Messages.svelte":
/*!*********************************************!*\
  !*** ./resources/js/routes/Messages.svelte ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* resources\js\routes\Messages.svelte generated by Svelte v3.43.1 */


function create_fragment(ctx) {
  var div;
  return {
    c: function c() {
      div = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      div.textContent = "messages";
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
    },
    p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
    }
  };
}

var Messages = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Messages, _SvelteComponent);

  var _super = _createSuper(Messages);

  function Messages(options) {
    var _this;

    _classCallCheck(this, Messages);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, null, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {});
    return _this;
  }

  return Messages;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Messages);

/***/ }),

/***/ "./resources/js/routes/MyProfile.svelte":
/*!**********************************************!*\
  !*** ./resources/js/routes/MyProfile.svelte ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* resources\js\routes\MyProfile.svelte generated by Svelte v3.43.1 */




function create_fragment(ctx) {
  var div4;
  var form;
  var h2;
  var t1;
  var div0;
  var label0;
  var t3;
  var input0;
  var t4;
  var div1;
  var label1;
  var t6;
  var input1;
  var t7;
  var div2;
  var t10;
  var div3;
  var t13;
  var button;
  var t15;
  var p;
  var mounted;
  var dispose;
  return {
    c: function c() {
      div4 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      form = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("form");
      h2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("h2");
      h2.textContent = "Mon profil";
      t1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      label0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("label");
      label0.textContent = "Nom";
      t3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      input0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("input");
      t4 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      label1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("label");
      label1.textContent = "Email";
      t6 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      input1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("input");
      t7 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      div2.innerHTML = "<label for=\"bio\" class=\"leading-7 text-sm text-gray-600\">Bio</label> \n            <input type=\"text\" id=\"bio\" name=\"email\" class=\"w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out\"/>";
      t10 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      div3.innerHTML = "<label for=\"password\" class=\"leading-7 text-sm text-gray-600\">Mot de passe</label> \n            <input type=\"password\" id=\"password\" name=\"password\" class=\"w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out\"/>";
      t13 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      button = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("button");
      button.textContent = "Button";
      t15 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      p = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("p");
      p.textContent = "Chicharrones blog helvetica normcore iceland tousled brook viral artisan.";
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(h2, "class", "text-gray-900 text-lg mb-1 font-medium title-font");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(label0, "for", "username");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(label0, "class", "leading-7 text-sm text-gray-600");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input0, "type", "text");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input0, "id", "username");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input0, "name", "username");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div0, "class", "relative mb-4");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(label1, "for", "bio");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(label1, "class", "leading-7 text-sm text-gray-600");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input1, "type", "email");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input1, "id", "email");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input1, "name", "email");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div1, "class", "relative mb-4");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div2, "class", "relative mb-4");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div3, "class", "relative mb-4");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(button, "class", "text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(p, "class", "text-xs text-gray-500 mt-3");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(form, "class", "bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md");
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.attr)(div4, "class", "container px-5 py-6 mx-auto flex");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, div4, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div4, form);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, h2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, div0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div0, label0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div0, t3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div0, input0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_input_value)(input0,
      /*user*/
      ctx[0].username);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t4);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, div1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, label1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, t6);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, input1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_input_value)(input1,
      /*user*/
      ctx[0].email);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t7);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, div2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t10);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, div3);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t13);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, button);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, t15);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(form, p);

      if (!mounted) {
        dispose = [(0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.listen)(input0, "input",
        /*input0_input_handler*/
        ctx[2]), (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.listen)(input1, "input",
        /*input1_input_handler*/
        ctx[3]), (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.listen)(form, "submit", (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.prevent_default)(
        /*handleForm*/
        ctx[1]))];
        mounted = true;
      }
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (dirty &
      /*user*/
      1 && input0.value !==
      /*user*/
      ctx[0].username) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_input_value)(input0,
        /*user*/
        ctx[0].username);
      }

      if (dirty &
      /*user*/
      1 && input1.value !==
      /*user*/
      ctx[0].email) {
        (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_input_value)(input1,
        /*user*/
        ctx[0].email);
      }
    },
    i: svelte_internal__WEBPACK_IMPORTED_MODULE_1__.noop,
    o: svelte_internal__WEBPACK_IMPORTED_MODULE_1__.noop,
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(div4);
      mounted = false;
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.run_all)(dispose);
    }
  };
}

var error = null;

function instance($$self, $$props, $$invalidate) {
  var user = {};
  (0,svelte__WEBPACK_IMPORTED_MODULE_2__.onMount)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee() {
    var url, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            url = 'http://localhost:8080/api/users/logged';
            _context.next = 4;
            return axios__WEBPACK_IMPORTED_MODULE_3___default().get(url);

          case 4:
            response = _context.sent;
            // TODO .env
            $$invalidate(0, user = response.data);
            _context.next = 10;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  })));

  function handleForm() {
    return _handleForm.apply(this, arguments);
  }

  function _handleForm() {
    _handleForm = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee2() {
      var url, response;
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              url = "http://localhost:8080/api/users/logged";
              _context2.next = 3;
              return axios__WEBPACK_IMPORTED_MODULE_3___default().post(url, {
                username: user.username,
                email: user.email,
                bio: user.bio,
                password: user.password
              });

            case 3:
              response = _context2.sent;

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _handleForm.apply(this, arguments);
  }

  function input0_input_handler() {
    user.username = this.value;
    $$invalidate(0, user);
  }

  function input1_input_handler() {
    user.email = this.value;
    $$invalidate(0, user);
  }

  return [user, handleForm, input0_input_handler, input1_input_handler];
}

var MyProfile = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(MyProfile, _SvelteComponent);

  var _super = _createSuper(MyProfile);

  function MyProfile(options) {
    var _this;

    _classCallCheck(this, MyProfile);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_1__.safe_not_equal, {});
    return _this;
  }

  return MyProfile;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_1__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyProfile);

/***/ }),

/***/ "./resources/js/routes/Nofifications.svelte":
/*!**************************************************!*\
  !*** ./resources/js/routes/Nofifications.svelte ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* resources\js\routes\Nofifications.svelte generated by Svelte v3.43.1 */


function create_fragment(ctx) {
  var div;
  return {
    c: function c() {
      div = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div");
      div.textContent = "notifications 123";
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
    },
    p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
    }
  };
}

var Nofifications = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(Nofifications, _SvelteComponent);

  var _super = _createSuper(Nofifications);

  function Nofifications(options) {
    var _this;

    _classCallCheck(this, Nofifications);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(_assertThisInitialized(_this), options, null, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {});
    return _this;
  }

  return Nofifications;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Nofifications);

/***/ }),

/***/ "./resources/js/routes/UserProfile.svelte":
/*!************************************************!*\
  !*** ./resources/js/routes/UserProfile.svelte ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* resources\js\routes\UserProfile.svelte generated by Svelte v3.43.1 */




function create_fragment(ctx) {
  var div1;
  var h1;
  var t0_value =
  /*user*/
  ctx[0].username + "";
  var t0;
  var t1;
  var div0;
  var t2_value = new Date().getFullYear() -
  /*user*/
  ctx[0].birth_year + "";
  var t2;
  var t3;
  return {
    c: function c() {
      div1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      h1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("h1");
      t0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(t0_value);
      t1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.space)();
      div0 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.element)("div");
      t2 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(t2_value);
      t3 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.text)(" ans");
    },
    m: function m(target, anchor) {
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.insert)(target, div1, anchor);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, h1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(h1, t0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, t1);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div1, div0);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div0, t2);
      (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.append)(div0, t3);
    },
    p: function p(ctx, _ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          dirty = _ref2[0];

      if (dirty &
      /*user*/
      1 && t0_value !== (t0_value =
      /*user*/
      ctx[0].username + "")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_data)(t0, t0_value);
      if (dirty &
      /*user*/
      1 && t2_value !== (t2_value = new Date().getFullYear() -
      /*user*/
      ctx[0].birth_year + "")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.set_data)(t2, t2_value);
    },
    i: svelte_internal__WEBPACK_IMPORTED_MODULE_1__.noop,
    o: svelte_internal__WEBPACK_IMPORTED_MODULE_1__.noop,
    d: function d(detaching) {
      if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.detach)(div1);
    }
  };
}

var error = null;

function instance($$self, $$props, $$invalidate) {
  var user = {};
  (0,svelte__WEBPACK_IMPORTED_MODULE_2__.onMount)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee() {
    var url, username, response;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            url = new URL(window.location.href);
            username = url.pathname;
            username = username.substr(1);
            _context.next = 6;
            return axios__WEBPACK_IMPORTED_MODULE_3___default().get("http://localhost:8080/api/users/".concat(username));

          case 6:
            response = _context.sent;
            // TODO .env
            $$invalidate(0, user = response.data);
            console.log(user);
            _context.next = 13;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  })));
  return [user];
}

var UserProfile = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(UserProfile, _SvelteComponent);

  var _super = _createSuper(UserProfile);

  function UserProfile(options) {
    var _this;

    _classCallCheck(this, UserProfile);

    _this = _super.call(this);
    (0,svelte_internal__WEBPACK_IMPORTED_MODULE_1__.init)(_assertThisInitialized(_this), options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_1__.safe_not_equal, {});
    return _this;
  }

  return UserProfile;
}(svelte_internal__WEBPACK_IMPORTED_MODULE_1__.SvelteComponent);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserProfile);

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

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


/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/***/ ((module) => {

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
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

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
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
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
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
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
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

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
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ "./node_modules/svelte-routing/src/actions.js":
/*!****************************************************!*\
  !*** ./node_modules/svelte-routing/src/actions.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "link": () => (/* binding */ link),
/* harmony export */   "links": () => (/* binding */ links)
/* harmony export */ });
/* harmony import */ var _history_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./history.js */ "./node_modules/svelte-routing/src/history.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/svelte-routing/src/utils.js");



/**
 * A link action that can be added to <a href=""> tags rather
 * than using the <Link> component.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:link>{post.title}</a>
 * ```
 */
function link(node) {
  function onClick(event) {
    const anchor = event.currentTarget;

    if (
      anchor.target === "" &&
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.hostMatches)(anchor) &&
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.shouldNavigate)(event)
    ) {
      event.preventDefault();
      (0,_history_js__WEBPACK_IMPORTED_MODULE_0__.navigate)(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
    }
  }

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    }
  };
}

/**
 * An action to be added at a root element of your application to
 * capture all relative links and push them onto the history stack.
 *
 * Example:
 * ```html
 * <div use:links>
 *   <Router>
 *     <Route path="/" component={Home} />
 *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
 *     {#each projects as project}
 *       <a href="/p/{project.id}">{project.title}</a>
 *     {/each}
 *   </Router>
 * </div>
 * ```
 */
function links(node) {
  function findClosest(tagName, el) {
    while (el && el.tagName !== tagName) {
      el = el.parentNode;
    }
    return el;
  }

  function onClick(event) {
    const anchor = findClosest("A", event.target);

    if (
      anchor &&
      anchor.target === "" &&
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.hostMatches)(anchor) &&
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.shouldNavigate)(event) &&
      !anchor.hasAttribute("noroute")
    ) {
      event.preventDefault();
      (0,_history_js__WEBPACK_IMPORTED_MODULE_0__.navigate)(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
    }
  }

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    }
  };
}




/***/ }),

/***/ "./node_modules/svelte-routing/src/contexts.js":
/*!*****************************************************!*\
  !*** ./node_modules/svelte-routing/src/contexts.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LOCATION": () => (/* binding */ LOCATION),
/* harmony export */   "ROUTER": () => (/* binding */ ROUTER)
/* harmony export */ });
const LOCATION = {};
const ROUTER = {};


/***/ }),

/***/ "./node_modules/svelte-routing/src/history.js":
/*!****************************************************!*\
  !*** ./node_modules/svelte-routing/src/history.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "globalHistory": () => (/* binding */ globalHistory),
/* harmony export */   "navigate": () => (/* binding */ navigate),
/* harmony export */   "createHistory": () => (/* binding */ createHistory),
/* harmony export */   "createMemorySource": () => (/* binding */ createMemorySource)
/* harmony export */ });
/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

function getLocation(source) {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  };
}

function createHistory(source, options) {
  const listeners = [];
  let location = getLocation(source);

  return {
    get location() {
      return location;
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      state = { ...state, key: Date.now() + "" };
      // try...catch iOS Safari limits to 100 pushState calls
      try {
        if (replace) {
          source.history.replaceState(state, null, to);
        } else {
          source.history.pushState(state, null, to);
        }
      } catch (e) {
        source.location[replace ? "replace" : "assign"](to);
      }

      location = getLocation(source);
      listeners.forEach(listener => listener({ location, action: "PUSH" }));
    }
  };
}

// Stores history entries in memory for testing or other platforms like Native
function createMemorySource(initialPathname = "/") {
  let index = 0;
  const stack = [{ pathname: initialPathname, search: "" }];
  const states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search });
        states.push(state);
      },
      replaceState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      }
    }
  };
}

// Global history uses window.history as the source if available,
// otherwise a memory history
const canUseDOM = Boolean(
  typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);
const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
const { navigate } = globalHistory;




/***/ }),

/***/ "./node_modules/svelte-routing/src/index.js":
/*!**************************************************!*\
  !*** ./node_modules/svelte-routing/src/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Router": () => (/* reexport safe */ _Router_svelte__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "Route": () => (/* reexport safe */ _Route_svelte__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "Link": () => (/* reexport safe */ _Link_svelte__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   "navigate": () => (/* reexport safe */ _history_js__WEBPACK_IMPORTED_MODULE_3__.navigate),
/* harmony export */   "link": () => (/* reexport safe */ _actions_js__WEBPACK_IMPORTED_MODULE_4__.link),
/* harmony export */   "links": () => (/* reexport safe */ _actions_js__WEBPACK_IMPORTED_MODULE_4__.links)
/* harmony export */ });
/* harmony import */ var _Router_svelte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Router.svelte */ "./node_modules/svelte-routing/src/Router.svelte");
/* harmony import */ var _Route_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Route.svelte */ "./node_modules/svelte-routing/src/Route.svelte");
/* harmony import */ var _Link_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Link.svelte */ "./node_modules/svelte-routing/src/Link.svelte");
/* harmony import */ var _history_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./history.js */ "./node_modules/svelte-routing/src/history.js");
/* harmony import */ var _actions_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./actions.js */ "./node_modules/svelte-routing/src/actions.js");







/***/ }),

/***/ "./node_modules/svelte-routing/src/utils.js":
/*!**************************************************!*\
  !*** ./node_modules/svelte-routing/src/utils.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "startsWith": () => (/* binding */ startsWith),
/* harmony export */   "stripSlashes": () => (/* binding */ stripSlashes),
/* harmony export */   "pick": () => (/* binding */ pick),
/* harmony export */   "match": () => (/* binding */ match),
/* harmony export */   "resolve": () => (/* binding */ resolve),
/* harmony export */   "combinePaths": () => (/* binding */ combinePaths),
/* harmony export */   "shouldNavigate": () => (/* binding */ shouldNavigate),
/* harmony export */   "hostMatches": () => (/* binding */ hostMatches)
/* harmony export */ });
/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

const paramRe = /^:(.+)/;

const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

/**
 * Check if `string` starts with `search`
 * @param {string} string
 * @param {string} search
 * @return {boolean}
 */
function startsWith(string, search) {
  return string.substr(0, search.length) === search;
}

/**
 * Check if `segment` is a root segment
 * @param {string} segment
 * @return {boolean}
 */
function isRootSegment(segment) {
  return segment === "";
}

/**
 * Check if `segment` is a dynamic segment
 * @param {string} segment
 * @return {boolean}
 */
function isDynamic(segment) {
  return paramRe.test(segment);
}

/**
 * Check if `segment` is a splat
 * @param {string} segment
 * @return {boolean}
 */
function isSplat(segment) {
  return segment[0] === "*";
}

/**
 * Split up the URI into segments delimited by `/`
 * @param {string} uri
 * @return {string[]}
 */
function segmentize(uri) {
  return (
    uri
      // Strip starting/ending `/`
      .replace(/(^\/+|\/+$)/g, "")
      .split("/")
  );
}

/**
 * Strip `str` of potential start and end `/`
 * @param {string} str
 * @return {string}
 */
function stripSlashes(str) {
  return str.replace(/(^\/+|\/+$)/g, "");
}

/**
 * Score a route depending on how its individual segments look
 * @param {object} route
 * @param {number} index
 * @return {object}
 */
function rankRoute(route, index) {
  const score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;

        if (isRootSegment(segment)) {
          score += ROOT_POINTS;
        } else if (isDynamic(segment)) {
          score += DYNAMIC_POINTS;
        } else if (isSplat(segment)) {
          score -= SEGMENT_POINTS + SPLAT_PENALTY;
        } else {
          score += STATIC_POINTS;
        }

        return score;
      }, 0);

  return { route, score, index };
}

/**
 * Give a score to all routes and sort them on that
 * @param {object[]} routes
 * @return {object[]}
 */
function rankRoutes(routes) {
  return (
    routes
      .map(rankRoute)
      // If two routes have the exact same score, we go by index instead
      .sort((a, b) =>
        a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
      )
  );
}

/**
 * Ranks and picks the best route to match. Each segment gets the highest
 * amount of points, then the type of segment gets an additional amount of
 * points where
 *
 *  static > dynamic > splat > root
 *
 * This way we don't have to worry about the order of our routes, let the
 * computers do it.
 *
 * A route looks like this
 *
 *  { path, default, value }
 *
 * And a returned match looks like:
 *
 *  { route, params, uri }
 *
 * @param {object[]} routes
 * @param {string} uri
 * @return {?object}
 */
function pick(routes, uri) {
  let match;
  let default_;

  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "";
  const ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    const route = ranked[i].route;
    let missed = false;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri
      };
      continue;
    }

    const routeSegments = segmentize(route.path);
    const params = {};
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      const routeSegment = routeSegments[index];
      const uriSegment = uriSegments[index];

      if (routeSegment !== undefined && isSplat(routeSegment)) {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/* or /files/*splatname
        const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

        params[splatName] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (uriSegment === undefined) {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, index).join("/")
      };
      break;
    }
  }

  return match || default_ || null;
}

/**
 * Check if the `path` matches the `uri`.
 * @param {string} path
 * @param {string} uri
 * @return {?object}
 */
function match(route, uri) {
  return pick([route], uri);
}

/**
 * Add the query to the pathname if a query is given
 * @param {string} pathname
 * @param {string} [query]
 * @return {string}
 */
function addQuery(pathname, query) {
  return pathname + (query ? `?${query}` : "");
}

/**
 * Resolve URIs as though every path is a directory, no files. Relative URIs
 * in the browser can feel awkward because not only can you be "in a directory",
 * you can be "at a file", too. For example:
 *
 *  browserSpecResolve('foo', '/bar/') => /bar/foo
 *  browserSpecResolve('foo', '/bar') => /foo
 *
 * But on the command line of a file system, it's not as complicated. You can't
 * `cd` from a file, only directories. This way, links have to know less about
 * their current path. To go deeper you can do this:
 *
 *  <Link to="deeper"/>
 *  // instead of
 *  <Link to=`{${props.uri}/deeper}`/>
 *
 * Just like `cd`, if you want to go deeper from the command line, you do this:
 *
 *  cd deeper
 *  # not
 *  cd $(pwd)/deeper
 *
 * By treating every path as a directory, linking to relative paths should
 * require less contextual information and (fingers crossed) be more intuitive.
 * @param {string} to
 * @param {string} base
 * @return {string}
 */
function resolve(to, base) {
  // /foo/bar, /baz/qux => /foo/bar
  if (startsWith(to, "/")) {
    return to;
  }

  const [toPathname, toQuery] = to.split("?");
  const [basePathname] = base.split("?");
  const toSegments = segmentize(toPathname);
  const baseSegments = segmentize(basePathname);

  // ?a=b, /users?b=c => /users?a=b
  if (toSegments[0] === "") {
    return addQuery(basePathname, toQuery);
  }

  // profile, /users/789 => /users/789/profile
  if (!startsWith(toSegments[0], ".")) {
    const pathname = baseSegments.concat(toSegments).join("/");

    return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
  }

  // ./       , /users/123 => /users/123
  // ../      , /users/123 => /users
  // ../..    , /users/123 => /
  // ../../one, /a/b/c/d   => /a/b/one
  // .././one , /a/b/c/d   => /a/b/c/one
  const allSegments = baseSegments.concat(toSegments);
  const segments = [];

  allSegments.forEach(segment => {
    if (segment === "..") {
      segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });

  return addQuery("/" + segments.join("/"), toQuery);
}

/**
 * Combines the `basepath` and the `path` into one path.
 * @param {string} basepath
 * @param {string} path
 */
function combinePaths(basepath, path) {
  return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
}

/**
 * Decides whether a given `event` should result in a navigation or not.
 * @param {object} event
 */
function shouldNavigate(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}

function hostMatches(anchor) {
  const host = location.host
  return (
    anchor.host == host ||
    // svelte seems to kill anchor.host value in ie11, so fall back to checking href
    anchor.href.indexOf(`https://${host}`) === 0 ||
    anchor.href.indexOf(`http://${host}`) === 0
  )
}




/***/ }),

/***/ "./node_modules/svelte/index.mjs":
/*!***************************************!*\
  !*** ./node_modules/svelte/index.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SvelteComponent": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev),
/* harmony export */   "SvelteComponentTyped": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentTyped),
/* harmony export */   "afterUpdate": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.afterUpdate),
/* harmony export */   "beforeUpdate": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.beforeUpdate),
/* harmony export */   "createEventDispatcher": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createEventDispatcher),
/* harmony export */   "getAllContexts": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.getAllContexts),
/* harmony export */   "getContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.getContext),
/* harmony export */   "hasContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.hasContext),
/* harmony export */   "onDestroy": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.onDestroy),
/* harmony export */   "onMount": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.onMount),
/* harmony export */   "setContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.setContext),
/* harmony export */   "tick": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.tick)
/* harmony export */ });
/* harmony import */ var _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/index.mjs */ "./node_modules/svelte/internal/index.mjs");


/***/ }),

/***/ "./node_modules/svelte/internal/index.mjs":
/*!************************************************!*\
  !*** ./node_modules/svelte/internal/index.mjs ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HtmlTag": () => (/* binding */ HtmlTag),
/* harmony export */   "HtmlTagHydration": () => (/* binding */ HtmlTagHydration),
/* harmony export */   "SvelteComponent": () => (/* binding */ SvelteComponent),
/* harmony export */   "SvelteComponentDev": () => (/* binding */ SvelteComponentDev),
/* harmony export */   "SvelteComponentTyped": () => (/* binding */ SvelteComponentTyped),
/* harmony export */   "SvelteElement": () => (/* binding */ SvelteElement),
/* harmony export */   "action_destroyer": () => (/* binding */ action_destroyer),
/* harmony export */   "add_attribute": () => (/* binding */ add_attribute),
/* harmony export */   "add_classes": () => (/* binding */ add_classes),
/* harmony export */   "add_flush_callback": () => (/* binding */ add_flush_callback),
/* harmony export */   "add_location": () => (/* binding */ add_location),
/* harmony export */   "add_render_callback": () => (/* binding */ add_render_callback),
/* harmony export */   "add_resize_listener": () => (/* binding */ add_resize_listener),
/* harmony export */   "add_transform": () => (/* binding */ add_transform),
/* harmony export */   "afterUpdate": () => (/* binding */ afterUpdate),
/* harmony export */   "append": () => (/* binding */ append),
/* harmony export */   "append_dev": () => (/* binding */ append_dev),
/* harmony export */   "append_empty_stylesheet": () => (/* binding */ append_empty_stylesheet),
/* harmony export */   "append_hydration": () => (/* binding */ append_hydration),
/* harmony export */   "append_hydration_dev": () => (/* binding */ append_hydration_dev),
/* harmony export */   "append_styles": () => (/* binding */ append_styles),
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "attr": () => (/* binding */ attr),
/* harmony export */   "attr_dev": () => (/* binding */ attr_dev),
/* harmony export */   "attribute_to_object": () => (/* binding */ attribute_to_object),
/* harmony export */   "beforeUpdate": () => (/* binding */ beforeUpdate),
/* harmony export */   "bind": () => (/* binding */ bind),
/* harmony export */   "binding_callbacks": () => (/* binding */ binding_callbacks),
/* harmony export */   "blank_object": () => (/* binding */ blank_object),
/* harmony export */   "bubble": () => (/* binding */ bubble),
/* harmony export */   "check_outros": () => (/* binding */ check_outros),
/* harmony export */   "children": () => (/* binding */ children),
/* harmony export */   "claim_component": () => (/* binding */ claim_component),
/* harmony export */   "claim_element": () => (/* binding */ claim_element),
/* harmony export */   "claim_html_tag": () => (/* binding */ claim_html_tag),
/* harmony export */   "claim_space": () => (/* binding */ claim_space),
/* harmony export */   "claim_svg_element": () => (/* binding */ claim_svg_element),
/* harmony export */   "claim_text": () => (/* binding */ claim_text),
/* harmony export */   "clear_loops": () => (/* binding */ clear_loops),
/* harmony export */   "component_subscribe": () => (/* binding */ component_subscribe),
/* harmony export */   "compute_rest_props": () => (/* binding */ compute_rest_props),
/* harmony export */   "compute_slots": () => (/* binding */ compute_slots),
/* harmony export */   "createEventDispatcher": () => (/* binding */ createEventDispatcher),
/* harmony export */   "create_animation": () => (/* binding */ create_animation),
/* harmony export */   "create_bidirectional_transition": () => (/* binding */ create_bidirectional_transition),
/* harmony export */   "create_component": () => (/* binding */ create_component),
/* harmony export */   "create_in_transition": () => (/* binding */ create_in_transition),
/* harmony export */   "create_out_transition": () => (/* binding */ create_out_transition),
/* harmony export */   "create_slot": () => (/* binding */ create_slot),
/* harmony export */   "create_ssr_component": () => (/* binding */ create_ssr_component),
/* harmony export */   "current_component": () => (/* binding */ current_component),
/* harmony export */   "custom_event": () => (/* binding */ custom_event),
/* harmony export */   "dataset_dev": () => (/* binding */ dataset_dev),
/* harmony export */   "debug": () => (/* binding */ debug),
/* harmony export */   "destroy_block": () => (/* binding */ destroy_block),
/* harmony export */   "destroy_component": () => (/* binding */ destroy_component),
/* harmony export */   "destroy_each": () => (/* binding */ destroy_each),
/* harmony export */   "detach": () => (/* binding */ detach),
/* harmony export */   "detach_after_dev": () => (/* binding */ detach_after_dev),
/* harmony export */   "detach_before_dev": () => (/* binding */ detach_before_dev),
/* harmony export */   "detach_between_dev": () => (/* binding */ detach_between_dev),
/* harmony export */   "detach_dev": () => (/* binding */ detach_dev),
/* harmony export */   "dirty_components": () => (/* binding */ dirty_components),
/* harmony export */   "dispatch_dev": () => (/* binding */ dispatch_dev),
/* harmony export */   "each": () => (/* binding */ each),
/* harmony export */   "element": () => (/* binding */ element),
/* harmony export */   "element_is": () => (/* binding */ element_is),
/* harmony export */   "empty": () => (/* binding */ empty),
/* harmony export */   "end_hydrating": () => (/* binding */ end_hydrating),
/* harmony export */   "escape": () => (/* binding */ escape),
/* harmony export */   "escape_attribute_value": () => (/* binding */ escape_attribute_value),
/* harmony export */   "escape_object": () => (/* binding */ escape_object),
/* harmony export */   "escaped": () => (/* binding */ escaped),
/* harmony export */   "exclude_internal_props": () => (/* binding */ exclude_internal_props),
/* harmony export */   "fix_and_destroy_block": () => (/* binding */ fix_and_destroy_block),
/* harmony export */   "fix_and_outro_and_destroy_block": () => (/* binding */ fix_and_outro_and_destroy_block),
/* harmony export */   "fix_position": () => (/* binding */ fix_position),
/* harmony export */   "flush": () => (/* binding */ flush),
/* harmony export */   "getAllContexts": () => (/* binding */ getAllContexts),
/* harmony export */   "getContext": () => (/* binding */ getContext),
/* harmony export */   "get_all_dirty_from_scope": () => (/* binding */ get_all_dirty_from_scope),
/* harmony export */   "get_binding_group_value": () => (/* binding */ get_binding_group_value),
/* harmony export */   "get_current_component": () => (/* binding */ get_current_component),
/* harmony export */   "get_custom_elements_slots": () => (/* binding */ get_custom_elements_slots),
/* harmony export */   "get_root_for_style": () => (/* binding */ get_root_for_style),
/* harmony export */   "get_slot_changes": () => (/* binding */ get_slot_changes),
/* harmony export */   "get_spread_object": () => (/* binding */ get_spread_object),
/* harmony export */   "get_spread_update": () => (/* binding */ get_spread_update),
/* harmony export */   "get_store_value": () => (/* binding */ get_store_value),
/* harmony export */   "globals": () => (/* binding */ globals),
/* harmony export */   "group_outros": () => (/* binding */ group_outros),
/* harmony export */   "handle_promise": () => (/* binding */ handle_promise),
/* harmony export */   "hasContext": () => (/* binding */ hasContext),
/* harmony export */   "has_prop": () => (/* binding */ has_prop),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "init": () => (/* binding */ init),
/* harmony export */   "insert": () => (/* binding */ insert),
/* harmony export */   "insert_dev": () => (/* binding */ insert_dev),
/* harmony export */   "insert_hydration": () => (/* binding */ insert_hydration),
/* harmony export */   "insert_hydration_dev": () => (/* binding */ insert_hydration_dev),
/* harmony export */   "intros": () => (/* binding */ intros),
/* harmony export */   "invalid_attribute_name_character": () => (/* binding */ invalid_attribute_name_character),
/* harmony export */   "is_client": () => (/* binding */ is_client),
/* harmony export */   "is_crossorigin": () => (/* binding */ is_crossorigin),
/* harmony export */   "is_empty": () => (/* binding */ is_empty),
/* harmony export */   "is_function": () => (/* binding */ is_function),
/* harmony export */   "is_promise": () => (/* binding */ is_promise),
/* harmony export */   "listen": () => (/* binding */ listen),
/* harmony export */   "listen_dev": () => (/* binding */ listen_dev),
/* harmony export */   "loop": () => (/* binding */ loop),
/* harmony export */   "loop_guard": () => (/* binding */ loop_guard),
/* harmony export */   "missing_component": () => (/* binding */ missing_component),
/* harmony export */   "mount_component": () => (/* binding */ mount_component),
/* harmony export */   "noop": () => (/* binding */ noop),
/* harmony export */   "not_equal": () => (/* binding */ not_equal),
/* harmony export */   "now": () => (/* binding */ now),
/* harmony export */   "null_to_empty": () => (/* binding */ null_to_empty),
/* harmony export */   "object_without_properties": () => (/* binding */ object_without_properties),
/* harmony export */   "onDestroy": () => (/* binding */ onDestroy),
/* harmony export */   "onMount": () => (/* binding */ onMount),
/* harmony export */   "once": () => (/* binding */ once),
/* harmony export */   "outro_and_destroy_block": () => (/* binding */ outro_and_destroy_block),
/* harmony export */   "prevent_default": () => (/* binding */ prevent_default),
/* harmony export */   "prop_dev": () => (/* binding */ prop_dev),
/* harmony export */   "query_selector_all": () => (/* binding */ query_selector_all),
/* harmony export */   "raf": () => (/* binding */ raf),
/* harmony export */   "run": () => (/* binding */ run),
/* harmony export */   "run_all": () => (/* binding */ run_all),
/* harmony export */   "safe_not_equal": () => (/* binding */ safe_not_equal),
/* harmony export */   "schedule_update": () => (/* binding */ schedule_update),
/* harmony export */   "select_multiple_value": () => (/* binding */ select_multiple_value),
/* harmony export */   "select_option": () => (/* binding */ select_option),
/* harmony export */   "select_options": () => (/* binding */ select_options),
/* harmony export */   "select_value": () => (/* binding */ select_value),
/* harmony export */   "self": () => (/* binding */ self),
/* harmony export */   "setContext": () => (/* binding */ setContext),
/* harmony export */   "set_attributes": () => (/* binding */ set_attributes),
/* harmony export */   "set_current_component": () => (/* binding */ set_current_component),
/* harmony export */   "set_custom_element_data": () => (/* binding */ set_custom_element_data),
/* harmony export */   "set_data": () => (/* binding */ set_data),
/* harmony export */   "set_data_dev": () => (/* binding */ set_data_dev),
/* harmony export */   "set_input_type": () => (/* binding */ set_input_type),
/* harmony export */   "set_input_value": () => (/* binding */ set_input_value),
/* harmony export */   "set_now": () => (/* binding */ set_now),
/* harmony export */   "set_raf": () => (/* binding */ set_raf),
/* harmony export */   "set_store_value": () => (/* binding */ set_store_value),
/* harmony export */   "set_style": () => (/* binding */ set_style),
/* harmony export */   "set_svg_attributes": () => (/* binding */ set_svg_attributes),
/* harmony export */   "space": () => (/* binding */ space),
/* harmony export */   "spread": () => (/* binding */ spread),
/* harmony export */   "src_url_equal": () => (/* binding */ src_url_equal),
/* harmony export */   "start_hydrating": () => (/* binding */ start_hydrating),
/* harmony export */   "stop_propagation": () => (/* binding */ stop_propagation),
/* harmony export */   "subscribe": () => (/* binding */ subscribe),
/* harmony export */   "svg_element": () => (/* binding */ svg_element),
/* harmony export */   "text": () => (/* binding */ text),
/* harmony export */   "tick": () => (/* binding */ tick),
/* harmony export */   "time_ranges_to_array": () => (/* binding */ time_ranges_to_array),
/* harmony export */   "to_number": () => (/* binding */ to_number),
/* harmony export */   "toggle_class": () => (/* binding */ toggle_class),
/* harmony export */   "transition_in": () => (/* binding */ transition_in),
/* harmony export */   "transition_out": () => (/* binding */ transition_out),
/* harmony export */   "trusted": () => (/* binding */ trusted),
/* harmony export */   "update_await_block_branch": () => (/* binding */ update_await_block_branch),
/* harmony export */   "update_keyed_each": () => (/* binding */ update_keyed_each),
/* harmony export */   "update_slot": () => (/* binding */ update_slot),
/* harmony export */   "update_slot_base": () => (/* binding */ update_slot_base),
/* harmony export */   "validate_component": () => (/* binding */ validate_component),
/* harmony export */   "validate_each_argument": () => (/* binding */ validate_each_argument),
/* harmony export */   "validate_each_keys": () => (/* binding */ validate_each_keys),
/* harmony export */   "validate_slots": () => (/* binding */ validate_slots),
/* harmony export */   "validate_store": () => (/* binding */ validate_store),
/* harmony export */   "xlink_attr": () => (/* binding */ xlink_attr)
/* harmony export */ });
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function noop() {}

var identity = function identity(x) {
  return x;
};

function assign(tar, src) {
  // @ts-ignore
  for (var k in src) {
    tar[k] = src[k];
  }

  return tar;
}

function is_promise(value) {
  return value && _typeof(value) === 'object' && typeof value.then === 'function';
}

function add_location(element, file, line, column, _char) {
  element.__svelte_meta = {
    loc: {
      file: file,
      line: line,
      column: column,
      "char": _char
    }
  };
}

function run(fn) {
  return fn();
}

function blank_object() {
  return Object.create(null);
}

function run_all(fns) {
  fns.forEach(run);
}

function is_function(thing) {
  return typeof thing === 'function';
}

function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
}

var src_url_equal_anchor;

function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement('a');
  }

  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}

function not_equal(a, b) {
  return a != a ? b == b : a !== b;
}

function is_empty(obj) {
  return Object.keys(obj).length === 0;
}

function validate_store(store, name) {
  if (store != null && typeof store.subscribe !== 'function') {
    throw new Error("'".concat(name, "' is not a store with a 'subscribe' method"));
  }
}

function subscribe(store) {
  if (store == null) {
    return noop;
  }

  for (var _len = arguments.length, callbacks = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    callbacks[_key - 1] = arguments[_key];
  }

  var unsub = store.subscribe.apply(store, callbacks);
  return unsub.unsubscribe ? function () {
    return unsub.unsubscribe();
  } : unsub;
}

function get_store_value(store) {
  var value;
  subscribe(store, function (_) {
    return value = _;
  })();
  return value;
}

function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}

function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    var slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}

function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}

function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    var lets = definition[2](fn(dirty));

    if ($$scope.dirty === undefined) {
      return lets;
    }

    if (_typeof(lets) === 'object') {
      var merged = [];
      var len = Math.max($$scope.dirty.length, lets.length);

      for (var i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }

      return merged;
    }

    return $$scope.dirty | lets;
  }

  return $$scope.dirty;
}

function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    var slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}

function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
  var slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
  update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn);
}

function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    var dirty = [];
    var length = $$scope.ctx.length / 32;

    for (var i = 0; i < length; i++) {
      dirty[i] = -1;
    }

    return dirty;
  }

  return -1;
}

function exclude_internal_props(props) {
  var result = {};

  for (var k in props) {
    if (k[0] !== '$') result[k] = props[k];
  }

  return result;
}

function compute_rest_props(props, keys) {
  var rest = {};
  keys = new Set(keys);

  for (var k in props) {
    if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
  }

  return rest;
}

function compute_slots(slots) {
  var result = {};

  for (var key in slots) {
    result[key] = true;
  }

  return result;
}

function once(fn) {
  var ran = false;
  return function () {
    if (ran) return;
    ran = true;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    fn.call.apply(fn, [this].concat(args));
  };
}

function null_to_empty(value) {
  return value == null ? '' : value;
}

function set_store_value(store, ret, value) {
  store.set(value);
  return ret;
}

var has_prop = function has_prop(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

var is_client = typeof window !== 'undefined';
var now = is_client ? function () {
  return window.performance.now();
} : function () {
  return Date.now();
};
var raf = is_client ? function (cb) {
  return requestAnimationFrame(cb);
} : noop; // used internally for testing

function set_now(fn) {
  now = fn;
}

function set_raf(fn) {
  raf = fn;
}

var tasks = new Set();

function run_tasks(now) {
  tasks.forEach(function (task) {
    if (!task.c(now)) {
      tasks["delete"](task);
      task.f();
    }
  });
  if (tasks.size !== 0) raf(run_tasks);
}
/**
 * For testing purposes only!
 */


function clear_loops() {
  tasks.clear();
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */


function loop(callback) {
  var task;
  if (tasks.size === 0) raf(run_tasks);
  return {
    promise: new Promise(function (fulfill) {
      tasks.add(task = {
        c: callback,
        f: fulfill
      });
    }),
    abort: function abort() {
      tasks["delete"](task);
    }
  };
} // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.


var is_hydrating = false;

function start_hydrating() {
  is_hydrating = true;
}

function end_hydrating() {
  is_hydrating = false;
}

function upper_bound(low, high, key, value) {
  // Return first index of value larger than input value in the range [low, high)
  while (low < high) {
    var mid = low + (high - low >> 1);

    if (key(mid) <= value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function init_hydrate(target) {
  if (target.hydrate_init) return;
  target.hydrate_init = true; // We know that all children have claim_order values since the unclaimed have been detached if target is not <head>

  var children = target.childNodes; // If target is <head>, there may be children without claim_order

  if (target.nodeName === 'HEAD') {
    var myChildren = [];

    for (var i = 0; i < children.length; i++) {
      var node = children[i];

      if (node.claim_order !== undefined) {
        myChildren.push(node);
      }
    }

    children = myChildren;
  }
  /*
  * Reorder claimed children optimally.
  * We can reorder claimed children optimally by finding the longest subsequence of
  * nodes that are already claimed in order and only moving the rest. The longest
  * subsequence subsequence of nodes that are claimed in order can be found by
  * computing the longest increasing subsequence of .claim_order values.
  *
  * This algorithm is optimal in generating the least amount of reorder operations
  * possible.
  *
  * Proof:
  * We know that, given a set of reordering operations, the nodes that do not move
  * always form an increasing subsequence, since they do not move among each other
  * meaning that they must be already ordered among each other. Thus, the maximal
  * set of nodes that do not move form a longest increasing subsequence.
  */
  // Compute longest increasing subsequence
  // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j


  var m = new Int32Array(children.length + 1); // Predecessor indices + 1

  var p = new Int32Array(children.length);
  m[0] = -1;
  var longest = 0;

  for (var _i = 0; _i < children.length; _i++) {
    var current = children[_i].claim_order; // Find the largest subsequence length such that it ends in a value less than our current value
    // upper_bound returns first greater value, so we subtract one
    // with fast path for when we are on the current longest subsequence

    var seqLen = (longest > 0 && children[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, function (idx) {
      return children[m[idx]].claim_order;
    }, current)) - 1;
    p[_i] = m[seqLen] + 1;
    var newLen = seqLen + 1; // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.

    m[newLen] = _i;
    longest = Math.max(newLen, longest);
  } // The longest increasing subsequence of nodes (initially reversed)


  var lis = []; // The rest of the nodes, nodes that will be moved

  var toMove = [];
  var last = children.length - 1;

  for (var cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
    lis.push(children[cur - 1]);

    for (; last >= cur; last--) {
      toMove.push(children[last]);
    }

    last--;
  }

  for (; last >= 0; last--) {
    toMove.push(children[last]);
  }

  lis.reverse(); // We sort the nodes being moved to guarantee that their insertion order matches the claim order

  toMove.sort(function (a, b) {
    return a.claim_order - b.claim_order;
  }); // Finally, we move the nodes

  for (var _i2 = 0, j = 0; _i2 < toMove.length; _i2++) {
    while (j < lis.length && toMove[_i2].claim_order >= lis[j].claim_order) {
      j++;
    }

    var anchor = j < lis.length ? lis[j] : null;
    target.insertBefore(toMove[_i2], anchor);
  }
}

function append(target, node) {
  target.appendChild(node);
}

function append_styles(target, style_sheet_id, styles) {
  var append_styles_to = get_root_for_style(target);

  if (!append_styles_to.getElementById(style_sheet_id)) {
    var style = element('style');
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}

function get_root_for_style(node) {
  if (!node) return document;
  var root = node.getRootNode ? node.getRootNode() : node.ownerDocument;

  if (root && root.host) {
    return root;
  }

  return node.ownerDocument;
}

function append_empty_stylesheet(node) {
  var style_element = element('style');
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element;
}

function append_stylesheet(node, style) {
  append(node.head || node, style);
}

function append_hydration(target, node) {
  if (is_hydrating) {
    init_hydrate(target);

    if (target.actual_end_child === undefined || target.actual_end_child !== null && target.actual_end_child.parentElement !== target) {
      target.actual_end_child = target.firstChild;
    } // Skip nodes of undefined ordering


    while (target.actual_end_child !== null && target.actual_end_child.claim_order === undefined) {
      target.actual_end_child = target.actual_end_child.nextSibling;
    }

    if (node !== target.actual_end_child) {
      // We only insert if the ordering of this node should be modified or the parent node is not target
      if (node.claim_order !== undefined || node.parentNode !== target) {
        target.insertBefore(node, target.actual_end_child);
      }
    } else {
      target.actual_end_child = node.nextSibling;
    }
  } else if (node.parentNode !== target || node.nextSibling !== null) {
    target.appendChild(node);
  }
}

function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}

function insert_hydration(target, node, anchor) {
  if (is_hydrating && !anchor) {
    append_hydration(target, node);
  } else if (node.parentNode !== target || node.nextSibling != anchor) {
    target.insertBefore(node, anchor || null);
  }
}

function detach(node) {
  node.parentNode.removeChild(node);
}

function destroy_each(iterations, detaching) {
  for (var i = 0; i < iterations.length; i += 1) {
    if (iterations[i]) iterations[i].d(detaching);
  }
}

function element(name) {
  return document.createElement(name);
}

function element_is(name, is) {
  return document.createElement(name, {
    is: is
  });
}

function object_without_properties(obj, exclude) {
  var target = {};

  for (var k in obj) {
    if (has_prop(obj, k) // @ts-ignore
    && exclude.indexOf(k) === -1) {
      // @ts-ignore
      target[k] = obj[k];
    }
  }

  return target;
}

function svg_element(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function text(data) {
  return document.createTextNode(data);
}

function space() {
  return text(' ');
}

function empty() {
  return text('');
}

function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return function () {
    return node.removeEventListener(event, handler, options);
  };
}

function prevent_default(fn) {
  return function (event) {
    event.preventDefault(); // @ts-ignore

    return fn.call(this, event);
  };
}

function stop_propagation(fn) {
  return function (event) {
    event.stopPropagation(); // @ts-ignore

    return fn.call(this, event);
  };
}

function self(fn) {
  return function (event) {
    // @ts-ignore
    if (event.target === this) fn.call(this, event);
  };
}

function trusted(fn) {
  return function (event) {
    // @ts-ignore
    if (event.isTrusted) fn.call(this, event);
  };
}

function attr(node, attribute, value) {
  if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

function set_attributes(node, attributes) {
  // @ts-ignore
  var descriptors = Object.getOwnPropertyDescriptors(node.__proto__);

  for (var key in attributes) {
    if (attributes[key] == null) {
      node.removeAttribute(key);
    } else if (key === 'style') {
      node.style.cssText = attributes[key];
    } else if (key === '__value') {
      node.value = node[key] = attributes[key];
    } else if (descriptors[key] && descriptors[key].set) {
      node[key] = attributes[key];
    } else {
      attr(node, key, attributes[key]);
    }
  }
}

function set_svg_attributes(node, attributes) {
  for (var key in attributes) {
    attr(node, key, attributes[key]);
  }
}

function set_custom_element_data(node, prop, value) {
  if (prop in node) {
    node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
  } else {
    attr(node, prop, value);
  }
}

function xlink_attr(node, attribute, value) {
  node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

function get_binding_group_value(group, __value, checked) {
  var value = new Set();

  for (var i = 0; i < group.length; i += 1) {
    if (group[i].checked) value.add(group[i].__value);
  }

  if (!checked) {
    value["delete"](__value);
  }

  return Array.from(value);
}

function to_number(value) {
  return value === '' ? null : +value;
}

function time_ranges_to_array(ranges) {
  var array = [];

  for (var i = 0; i < ranges.length; i += 1) {
    array.push({
      start: ranges.start(i),
      end: ranges.end(i)
    });
  }

  return array;
}

function children(element) {
  return Array.from(element.childNodes);
}

function init_claim_info(nodes) {
  if (nodes.claim_info === undefined) {
    nodes.claim_info = {
      last_index: 0,
      total_claimed: 0
    };
  }
}

function claim_node(nodes, predicate, processNode, createNode) {
  var dontUpdateLastIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  // Try to find nodes in an order such that we lengthen the longest increasing subsequence
  init_claim_info(nodes);

  var resultNode = function () {
    // We first try to find an element after the previous one
    for (var i = nodes.claim_info.last_index; i < nodes.length; i++) {
      var node = nodes[i];

      if (predicate(node)) {
        var replacement = processNode(node);

        if (replacement === undefined) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }

        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = i;
        }

        return node;
      }
    } // Otherwise, we try to find one before
    // We iterate in reverse so that we don't go too far back


    for (var _i3 = nodes.claim_info.last_index - 1; _i3 >= 0; _i3--) {
      var _node = nodes[_i3];

      if (predicate(_node)) {
        var _replacement = processNode(_node);

        if (_replacement === undefined) {
          nodes.splice(_i3, 1);
        } else {
          nodes[_i3] = _replacement;
        }

        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = _i3;
        } else if (_replacement === undefined) {
          // Since we spliced before the last_index, we decrease it
          nodes.claim_info.last_index--;
        }

        return _node;
      }
    } // If we can't find any matching node, we create a new one


    return createNode();
  }();

  resultNode.claim_order = nodes.claim_info.total_claimed;
  nodes.claim_info.total_claimed += 1;
  return resultNode;
}

function claim_element_base(nodes, name, attributes, create_element) {
  return claim_node(nodes, function (node) {
    return node.nodeName === name;
  }, function (node) {
    var remove = [];

    for (var j = 0; j < node.attributes.length; j++) {
      var attribute = node.attributes[j];

      if (!attributes[attribute.name]) {
        remove.push(attribute.name);
      }
    }

    remove.forEach(function (v) {
      return node.removeAttribute(v);
    });
    return undefined;
  }, function () {
    return create_element(name);
  });
}

function claim_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, element);
}

function claim_svg_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, svg_element);
}

function claim_text(nodes, data) {
  return claim_node(nodes, function (node) {
    return node.nodeType === 3;
  }, function (node) {
    var dataStr = '' + data;

    if (node.data.startsWith(dataStr)) {
      if (node.data.length !== dataStr.length) {
        return node.splitText(dataStr.length);
      }
    } else {
      node.data = dataStr;
    }
  }, function () {
    return text(data);
  }, true // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
  );
}

function claim_space(nodes) {
  return claim_text(nodes, ' ');
}

function find_comment(nodes, text, start) {
  for (var i = start; i < nodes.length; i += 1) {
    var node = nodes[i];

    if (node.nodeType === 8
    /* comment node */
    && node.textContent.trim() === text) {
      return i;
    }
  }

  return nodes.length;
}

function claim_html_tag(nodes) {
  // find html opening tag
  var start_index = find_comment(nodes, 'HTML_TAG_START', 0);
  var end_index = find_comment(nodes, 'HTML_TAG_END', start_index);

  if (start_index === end_index) {
    return new HtmlTagHydration();
  }

  init_claim_info(nodes);
  var html_tag_nodes = nodes.splice(start_index, end_index + 1);
  detach(html_tag_nodes[0]);
  detach(html_tag_nodes[html_tag_nodes.length - 1]);
  var claimed_nodes = html_tag_nodes.slice(1, html_tag_nodes.length - 1);

  var _iterator = _createForOfIteratorHelper(claimed_nodes),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var n = _step.value;
      n.claim_order = nodes.claim_info.total_claimed;
      nodes.claim_info.total_claimed += 1;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return new HtmlTagHydration(claimed_nodes);
}

function set_data(text, data) {
  data = '' + data;
  if (text.wholeText !== data) text.data = data;
}

function set_input_value(input, value) {
  input.value = value == null ? '' : value;
}

function set_input_type(input, type) {
  try {
    input.type = type;
  } catch (e) {// do nothing
  }
}

function set_style(node, key, value, important) {
  node.style.setProperty(key, value, important ? 'important' : '');
}

function select_option(select, value) {
  for (var i = 0; i < select.options.length; i += 1) {
    var option = select.options[i];

    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }

  select.selectedIndex = -1; // no option should be selected
}

function select_options(select, value) {
  for (var i = 0; i < select.options.length; i += 1) {
    var option = select.options[i];
    option.selected = ~value.indexOf(option.__value);
  }
}

function select_value(select) {
  var selected_option = select.querySelector(':checked') || select.options[0];
  return selected_option && selected_option.__value;
}

function select_multiple_value(select) {
  return [].map.call(select.querySelectorAll(':checked'), function (option) {
    return option.__value;
  });
} // unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead


var crossorigin;

function is_crossorigin() {
  if (crossorigin === undefined) {
    crossorigin = false;

    try {
      if (typeof window !== 'undefined' && window.parent) {
        void window.parent.document;
      }
    } catch (error) {
      crossorigin = true;
    }
  }

  return crossorigin;
}

function add_resize_listener(node, fn) {
  var computed_style = getComputedStyle(node);

  if (computed_style.position === 'static') {
    node.style.position = 'relative';
  }

  var iframe = element('iframe');
  iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' + 'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  var crossorigin = is_crossorigin();
  var unsubscribe;

  if (crossorigin) {
    iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
    unsubscribe = listen(window, 'message', function (event) {
      if (event.source === iframe.contentWindow) fn();
    });
  } else {
    iframe.src = 'about:blank';

    iframe.onload = function () {
      unsubscribe = listen(iframe.contentWindow, 'resize', fn);
    };
  }

  append(node, iframe);
  return function () {
    if (crossorigin) {
      unsubscribe();
    } else if (unsubscribe && iframe.contentWindow) {
      unsubscribe();
    }

    detach(iframe);
  };
}

function toggle_class(element, name, toggle) {
  element.classList[toggle ? 'add' : 'remove'](name);
}

function custom_event(type, detail) {
  var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}

function query_selector_all(selector) {
  var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
  return Array.from(parent.querySelectorAll(selector));
}

var HtmlTag = /*#__PURE__*/function () {
  function HtmlTag() {
    _classCallCheck(this, HtmlTag);

    this.e = this.n = null;
  }

  _createClass(HtmlTag, [{
    key: "c",
    value: function c(html) {
      this.h(html);
    }
  }, {
    key: "m",
    value: function m(html, target) {
      var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (!this.e) {
        this.e = element(target.nodeName);
        this.t = target;
        this.c(html);
      }

      this.i(anchor);
    }
  }, {
    key: "h",
    value: function h(html) {
      this.e.innerHTML = html;
      this.n = Array.from(this.e.childNodes);
    }
  }, {
    key: "i",
    value: function i(anchor) {
      for (var i = 0; i < this.n.length; i += 1) {
        insert(this.t, this.n[i], anchor);
      }
    }
  }, {
    key: "p",
    value: function p(html) {
      this.d();
      this.h(html);
      this.i(this.a);
    }
  }, {
    key: "d",
    value: function d() {
      this.n.forEach(detach);
    }
  }]);

  return HtmlTag;
}();

var HtmlTagHydration = /*#__PURE__*/function (_HtmlTag) {
  _inherits(HtmlTagHydration, _HtmlTag);

  var _super = _createSuper(HtmlTagHydration);

  function HtmlTagHydration(claimed_nodes) {
    var _this;

    _classCallCheck(this, HtmlTagHydration);

    _this = _super.call(this);
    _this.e = _this.n = null;
    _this.l = claimed_nodes;
    return _this;
  }

  _createClass(HtmlTagHydration, [{
    key: "c",
    value: function c(html) {
      if (this.l) {
        this.n = this.l;
      } else {
        _get(_getPrototypeOf(HtmlTagHydration.prototype), "c", this).call(this, html);
      }
    }
  }, {
    key: "i",
    value: function i(anchor) {
      for (var i = 0; i < this.n.length; i += 1) {
        insert_hydration(this.t, this.n[i], anchor);
      }
    }
  }]);

  return HtmlTagHydration;
}(HtmlTag);

function attribute_to_object(attributes) {
  var result = {};

  var _iterator2 = _createForOfIteratorHelper(attributes),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var attribute = _step2.value;
      result[attribute.name] = attribute.value;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return result;
}

function get_custom_elements_slots(element) {
  var result = {};
  element.childNodes.forEach(function (node) {
    result[node.slot || 'default'] = true;
  });
  return result;
}

var active_docs = new Set();
var active = 0; // https://github.com/darkskyapp/string-hash/blob/master/index.js

function hash(str) {
  var hash = 5381;
  var i = str.length;

  while (i--) {
    hash = (hash << 5) - hash ^ str.charCodeAt(i);
  }

  return hash >>> 0;
}

function create_rule(node, a, b, duration, delay, ease, fn) {
  var uid = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
  var step = 16.666 / duration;
  var keyframes = '{\n';

  for (var p = 0; p <= 1; p += step) {
    var t = a + (b - a) * ease(p);
    keyframes += p * 100 + "%{".concat(fn(t, 1 - t), "}\n");
  }

  var rule = keyframes + "100% {".concat(fn(b, 1 - b), "}\n}");
  var name = "__svelte_".concat(hash(rule), "_").concat(uid);
  var doc = get_root_for_style(node);
  active_docs.add(doc);
  var stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
  var current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});

  if (!current_rules[name]) {
    current_rules[name] = true;
    stylesheet.insertRule("@keyframes ".concat(name, " ").concat(rule), stylesheet.cssRules.length);
  }

  var animation = node.style.animation || '';
  node.style.animation = "".concat(animation ? "".concat(animation, ", ") : '').concat(name, " ").concat(duration, "ms linear ").concat(delay, "ms 1 both");
  active += 1;
  return name;
}

function delete_rule(node, name) {
  var previous = (node.style.animation || '').split(', ');
  var next = previous.filter(name ? function (anim) {
    return anim.indexOf(name) < 0;
  } // remove specific animation
  : function (anim) {
    return anim.indexOf('__svelte') === -1;
  } // remove all Svelte animations
  );
  var deleted = previous.length - next.length;

  if (deleted) {
    node.style.animation = next.join(', ');
    active -= deleted;
    if (!active) clear_rules();
  }
}

function clear_rules() {
  raf(function () {
    if (active) return;
    active_docs.forEach(function (doc) {
      var stylesheet = doc.__svelte_stylesheet;
      var i = stylesheet.cssRules.length;

      while (i--) {
        stylesheet.deleteRule(i);
      }

      doc.__svelte_rules = {};
    });
    active_docs.clear();
  });
}

function create_animation(node, from, fn, params) {
  if (!from) return noop;
  var to = node.getBoundingClientRect();
  if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;

  var _fn = fn(node, {
    from: from,
    to: to
  }, params),
      _fn$delay = _fn.delay,
      delay = _fn$delay === void 0 ? 0 : _fn$delay,
      _fn$duration = _fn.duration,
      duration = _fn$duration === void 0 ? 300 : _fn$duration,
      _fn$easing = _fn.easing,
      easing = _fn$easing === void 0 ? identity : _fn$easing,
      _fn$start = _fn.start,
      start_time = _fn$start === void 0 ? now() + delay : _fn$start,
      _fn$end = _fn.end,
      end = _fn$end === void 0 ? start_time + duration : _fn$end,
      _fn$tick = _fn.tick,
      tick = _fn$tick === void 0 ? noop : _fn$tick,
      css = _fn.css;

  var running = true;
  var started = false;
  var name;

  function start() {
    if (css) {
      name = create_rule(node, 0, 1, duration, delay, easing, css);
    }

    if (!delay) {
      started = true;
    }
  }

  function stop() {
    if (css) delete_rule(node, name);
    running = false;
  }

  loop(function (now) {
    if (!started && now >= start_time) {
      started = true;
    }

    if (started && now >= end) {
      tick(1, 0);
      stop();
    }

    if (!running) {
      return false;
    }

    if (started) {
      var p = now - start_time;
      var t = 0 + 1 * easing(p / duration);
      tick(t, 1 - t);
    }

    return true;
  });
  start();
  tick(0, 1);
  return stop;
}

function fix_position(node) {
  var style = getComputedStyle(node);

  if (style.position !== 'absolute' && style.position !== 'fixed') {
    var width = style.width,
        height = style.height;
    var a = node.getBoundingClientRect();
    node.style.position = 'absolute';
    node.style.width = width;
    node.style.height = height;
    add_transform(node, a);
  }
}

function add_transform(node, a) {
  var b = node.getBoundingClientRect();

  if (a.left !== b.left || a.top !== b.top) {
    var style = getComputedStyle(node);
    var transform = style.transform === 'none' ? '' : style.transform;
    node.style.transform = "".concat(transform, " translate(").concat(a.left - b.left, "px, ").concat(a.top - b.top, "px)");
  }
}

var current_component;

function set_current_component(component) {
  current_component = component;
}

function get_current_component() {
  if (!current_component) throw new Error('Function called outside component initialization');
  return current_component;
}

function beforeUpdate(fn) {
  get_current_component().$$.before_update.push(fn);
}

function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}

function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}

function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}

function createEventDispatcher() {
  var component = get_current_component();
  return function (type, detail) {
    var callbacks = component.$$.callbacks[type];

    if (callbacks) {
      // TODO are there situations where events could be dispatched
      // in a server (non-DOM) environment?
      var event = custom_event(type, detail);
      callbacks.slice().forEach(function (fn) {
        fn.call(component, event);
      });
    }
  };
}

function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}

function getContext(key) {
  return get_current_component().$$.context.get(key);
}

function getAllContexts() {
  return get_current_component().$$.context;
}

function hasContext(key) {
  return get_current_component().$$.context.has(key);
} // TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism


function bubble(component, event) {
  var _this2 = this;

  var callbacks = component.$$.callbacks[event.type];

  if (callbacks) {
    // @ts-ignore
    callbacks.slice().forEach(function (fn) {
      return fn.call(_this2, event);
    });
  }
}

var dirty_components = [];
var intros = {
  enabled: false
};
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;

function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}

function tick() {
  schedule_update();
  return resolved_promise;
}

function add_render_callback(fn) {
  render_callbacks.push(fn);
}

function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}

var flushing = false;
var seen_callbacks = new Set();

function flush() {
  if (flushing) return;
  flushing = true;

  do {
    // first, call beforeUpdate functions
    // and update components
    for (var i = 0; i < dirty_components.length; i += 1) {
      var component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }

    set_current_component(null);
    dirty_components.length = 0;

    while (binding_callbacks.length) {
      binding_callbacks.pop()();
    } // then, once components are updated, call
    // afterUpdate functions. This may cause
    // subsequent updates...


    for (var _i4 = 0; _i4 < render_callbacks.length; _i4 += 1) {
      var callback = render_callbacks[_i4];

      if (!seen_callbacks.has(callback)) {
        // ...so guard against infinite loops
        seen_callbacks.add(callback);
        callback();
      }
    }

    render_callbacks.length = 0;
  } while (dirty_components.length);

  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }

  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}

function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    var dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}

var promise;

function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(function () {
      promise = null;
    });
  }

  return promise;
}

function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event("".concat(direction ? 'intro' : 'outro').concat(kind)));
}

var outroing = new Set();
var outros;

function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros // parent group

  };
}

function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }

  outros = outros.p;
}

function transition_in(block, local) {
  if (block && block.i) {
    outroing["delete"](block);
    block.i(local);
  }
}

function transition_out(block, local, detach, callback) {
  if (block && block.o) {
    if (outroing.has(block)) return;
    outroing.add(block);
    outros.c.push(function () {
      outroing["delete"](block);

      if (callback) {
        if (detach) block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}

var null_transition = {
  duration: 0
};

function create_in_transition(node, fn, params) {
  var config = fn(node, params);
  var running = false;
  var animation_name;
  var task;
  var uid = 0;

  function cleanup() {
    if (animation_name) delete_rule(node, animation_name);
  }

  function go() {
    var _ref = config || null_transition,
        _ref$delay = _ref.delay,
        delay = _ref$delay === void 0 ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === void 0 ? 300 : _ref$duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? identity : _ref$easing,
        _ref$tick = _ref.tick,
        tick = _ref$tick === void 0 ? noop : _ref$tick,
        css = _ref.css;

    if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    var start_time = now() + delay;
    var end_time = start_time + duration;
    if (task) task.abort();
    running = true;
    add_render_callback(function () {
      return dispatch(node, true, 'start');
    });
    task = loop(function (now) {
      if (running) {
        if (now >= end_time) {
          tick(1, 0);
          dispatch(node, true, 'end');
          cleanup();
          return running = false;
        }

        if (now >= start_time) {
          var t = easing((now - start_time) / duration);
          tick(t, 1 - t);
        }
      }

      return running;
    });
  }

  var started = false;
  return {
    start: function start() {
      if (started) return;
      started = true;
      delete_rule(node);

      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate: function invalidate() {
      started = false;
    },
    end: function end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}

function create_out_transition(node, fn, params) {
  var config = fn(node, params);
  var running = true;
  var animation_name;
  var group = outros;
  group.r += 1;

  function go() {
    var _ref2 = config || null_transition,
        _ref2$delay = _ref2.delay,
        delay = _ref2$delay === void 0 ? 0 : _ref2$delay,
        _ref2$duration = _ref2.duration,
        duration = _ref2$duration === void 0 ? 300 : _ref2$duration,
        _ref2$easing = _ref2.easing,
        easing = _ref2$easing === void 0 ? identity : _ref2$easing,
        _ref2$tick = _ref2.tick,
        tick = _ref2$tick === void 0 ? noop : _ref2$tick,
        css = _ref2.css;

    if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    var start_time = now() + delay;
    var end_time = start_time + duration;
    add_render_callback(function () {
      return dispatch(node, false, 'start');
    });
    loop(function (now) {
      if (running) {
        if (now >= end_time) {
          tick(0, 1);
          dispatch(node, false, 'end');

          if (! --group.r) {
            // this will result in `end()` being called,
            // so we don't need to clean up here
            run_all(group.c);
          }

          return false;
        }

        if (now >= start_time) {
          var t = easing((now - start_time) / duration);
          tick(1 - t, t);
        }
      }

      return running;
    });
  }

  if (is_function(config)) {
    wait().then(function () {
      // @ts-ignore
      config = config();
      go();
    });
  } else {
    go();
  }

  return {
    end: function end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }

      if (running) {
        if (animation_name) delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}

function create_bidirectional_transition(node, fn, params, intro) {
  var config = fn(node, params);
  var t = intro ? 0 : 1;
  var running_program = null;
  var pending_program = null;
  var animation_name = null;

  function clear_animation() {
    if (animation_name) delete_rule(node, animation_name);
  }

  function init(program, duration) {
    var d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d: d,
      duration: duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }

  function go(b) {
    var _ref3 = config || null_transition,
        _ref3$delay = _ref3.delay,
        delay = _ref3$delay === void 0 ? 0 : _ref3$delay,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === void 0 ? 300 : _ref3$duration,
        _ref3$easing = _ref3.easing,
        easing = _ref3$easing === void 0 ? identity : _ref3$easing,
        _ref3$tick = _ref3.tick,
        tick = _ref3$tick === void 0 ? noop : _ref3$tick,
        css = _ref3.css;

    var program = {
      start: now() + delay,
      b: b
    };

    if (!b) {
      // @ts-ignore todo: improve typings
      program.group = outros;
      outros.r += 1;
    }

    if (running_program || pending_program) {
      pending_program = program;
    } else {
      // if this is an intro, and there's a delay, we need to do
      // an initial tick and/or apply CSS animation immediately
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }

      if (b) tick(0, 1);
      running_program = init(program, duration);
      add_render_callback(function () {
        return dispatch(node, b, 'start');
      });
      loop(function (now) {
        if (pending_program && now > pending_program.start) {
          running_program = init(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, 'start');

          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }

        if (running_program) {
          if (now >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, 'end');

            if (!pending_program) {
              // we're done
              if (running_program.b) {
                // intro — we can tidy up immediately
                clear_animation();
              } else {
                // outro — needs to be coordinated
                if (! --running_program.group.r) run_all(running_program.group.c);
              }
            }

            running_program = null;
          } else if (now >= running_program.start) {
            var p = now - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }

        return !!(running_program || pending_program);
      });
    }
  }

  return {
    run: function run(b) {
      if (is_function(config)) {
        wait().then(function () {
          // @ts-ignore
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end: function end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}

function handle_promise(promise, info) {
  var token = info.token = {};

  function update(type, index, key, value) {
    if (info.token !== token) return;
    info.resolved = value;
    var child_ctx = info.ctx;

    if (key !== undefined) {
      child_ctx = child_ctx.slice();
      child_ctx[key] = value;
    }

    var block = type && (info.current = type)(child_ctx);
    var needs_flush = false;

    if (info.block) {
      if (info.blocks) {
        info.blocks.forEach(function (block, i) {
          if (i !== index && block) {
            group_outros();
            transition_out(block, 1, 1, function () {
              if (info.blocks[i] === block) {
                info.blocks[i] = null;
              }
            });
            check_outros();
          }
        });
      } else {
        info.block.d(1);
      }

      block.c();
      transition_in(block, 1);
      block.m(info.mount(), info.anchor);
      needs_flush = true;
    }

    info.block = block;
    if (info.blocks) info.blocks[index] = block;

    if (needs_flush) {
      flush();
    }
  }

  if (is_promise(promise)) {
    var _current_component = get_current_component();

    promise.then(function (value) {
      set_current_component(_current_component);
      update(info.then, 1, info.value, value);
      set_current_component(null);
    }, function (error) {
      set_current_component(_current_component);
      update(info["catch"], 2, info.error, error);
      set_current_component(null);

      if (!info.hasCatch) {
        throw error;
      }
    }); // if we previously had a then/catch block, destroy it

    if (info.current !== info.pending) {
      update(info.pending, 0);
      return true;
    }
  } else {
    if (info.current !== info.then) {
      update(info.then, 1, info.value, promise);
      return true;
    }

    info.resolved = promise;
  }
}

function update_await_block_branch(info, ctx, dirty) {
  var child_ctx = ctx.slice();
  var resolved = info.resolved;

  if (info.current === info.then) {
    child_ctx[info.value] = resolved;
  }

  if (info.current === info["catch"]) {
    child_ctx[info.error] = resolved;
  }

  info.block.p(child_ctx, dirty);
}

var globals = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : global;

function destroy_block(block, lookup) {
  block.d(1);
  lookup["delete"](block.key);
}

function outro_and_destroy_block(block, lookup) {
  transition_out(block, 1, 1, function () {
    lookup["delete"](block.key);
  });
}

function fix_and_destroy_block(block, lookup) {
  block.f();
  destroy_block(block, lookup);
}

function fix_and_outro_and_destroy_block(block, lookup) {
  block.f();
  outro_and_destroy_block(block, lookup);
}

function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
  var o = old_blocks.length;
  var n = list.length;
  var i = o;
  var old_indexes = {};

  while (i--) {
    old_indexes[old_blocks[i].key] = i;
  }

  var new_blocks = [];
  var new_lookup = new Map();
  var deltas = new Map();
  i = n;

  while (i--) {
    var child_ctx = get_context(ctx, list, i);
    var key = get_key(child_ctx);
    var block = lookup.get(key);

    if (!block) {
      block = create_each_block(key, child_ctx);
      block.c();
    } else if (dynamic) {
      block.p(child_ctx, dirty);
    }

    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
  }

  var will_move = new Set();
  var did_move = new Set();

  function insert(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }

  while (o && n) {
    var new_block = new_blocks[n - 1];
    var old_block = old_blocks[o - 1];
    var new_key = new_block.key;
    var old_key = old_block.key;

    if (new_block === old_block) {
      // do nothing
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      // remove old block
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }

  while (o--) {
    var _old_block = old_blocks[o];
    if (!new_lookup.has(_old_block.key)) destroy(_old_block, lookup);
  }

  while (n) {
    insert(new_blocks[n - 1]);
  }

  return new_blocks;
}

function validate_each_keys(ctx, list, get_context, get_key) {
  var keys = new Set();

  for (var i = 0; i < list.length; i++) {
    var key = get_key(get_context(ctx, list, i));

    if (keys.has(key)) {
      throw new Error('Cannot have duplicate keys in a keyed each');
    }

    keys.add(key);
  }
}

function get_spread_update(levels, updates) {
  var update = {};
  var to_null_out = {};
  var accounted_for = {
    $$scope: 1
  };
  var i = levels.length;

  while (i--) {
    var o = levels[i];
    var n = updates[i];

    if (n) {
      for (var key in o) {
        if (!(key in n)) to_null_out[key] = 1;
      }

      for (var _key3 in n) {
        if (!accounted_for[_key3]) {
          update[_key3] = n[_key3];
          accounted_for[_key3] = 1;
        }
      }

      levels[i] = n;
    } else {
      for (var _key4 in o) {
        accounted_for[_key4] = 1;
      }
    }
  }

  for (var _key5 in to_null_out) {
    if (!(_key5 in update)) update[_key5] = undefined;
  }

  return update;
}

function get_spread_object(spread_props) {
  return _typeof(spread_props) === 'object' && spread_props !== null ? spread_props : {};
} // source: https://html.spec.whatwg.org/multipage/indices.html


var boolean_attributes = new Set(['allowfullscreen', 'allowpaymentrequest', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'ismap', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected']);
var invalid_attribute_name_character = /(?:[\t-\r "'\/=>\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFDD0-\uFDEF\uFEFF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF])/; // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter

function spread(args, classes_to_add) {
  var attributes = Object.assign.apply(Object, [{}].concat(_toConsumableArray(args)));

  if (classes_to_add) {
    if (attributes["class"] == null) {
      attributes["class"] = classes_to_add;
    } else {
      attributes["class"] += ' ' + classes_to_add;
    }
  }

  var str = '';
  Object.keys(attributes).forEach(function (name) {
    if (invalid_attribute_name_character.test(name)) return;
    var value = attributes[name];
    if (value === true) str += ' ' + name;else if (boolean_attributes.has(name.toLowerCase())) {
      if (value) str += ' ' + name;
    } else if (value != null) {
      str += " ".concat(name, "=\"").concat(value, "\"");
    }
  });
  return str;
}

var escaped = {
  '"': '&quot;',
  "'": '&#39;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

function escape(html) {
  return String(html).replace(/["'&<>]/g, function (match) {
    return escaped[match];
  });
}

function escape_attribute_value(value) {
  return typeof value === 'string' ? escape(value) : value;
}

function escape_object(obj) {
  var result = {};

  for (var key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }

  return result;
}

function each(items, fn) {
  var str = '';

  for (var i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }

  return str;
}

var missing_component = {
  $$render: function $$render() {
    return '';
  }
};

function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === 'svelte:component') name += ' this={...}';
    throw new Error("<".concat(name, "> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules"));
  }

  return component;
}

function debug(file, line, column, values) {
  console.log("{@debug} ".concat(file ? file + ' ' : '', "(").concat(line, ":").concat(column, ")")); // eslint-disable-line no-console

  console.log(values); // eslint-disable-line no-console

  return '';
}

var on_destroy;

function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    var parent_component = current_component;
    var $$ = {
      on_destroy: on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      // these will be immediately discarded
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({
      $$: $$
    });
    var html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }

  return {
    render: function render() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$$$slots = _ref4.$$slots,
          $$slots = _ref4$$$slots === void 0 ? {} : _ref4$$$slots,
          _ref4$context = _ref4.context,
          context = _ref4$context === void 0 ? new Map() : _ref4$context;

      on_destroy = [];
      var result = {
        title: '',
        head: '',
        css: new Set()
      };
      var html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html: html,
        css: {
          code: Array.from(result.css).map(function (css) {
            return css.code;
          }).join('\n'),
          map: null // TODO

        },
        head: result.title + result.head
      };
    },
    $$render: $$render
  };
}

function add_attribute(name, value, _boolean) {
  if (value == null || _boolean && !value) return '';
  return " ".concat(name).concat(value === true ? '' : "=".concat(typeof value === 'string' ? JSON.stringify(escape(value)) : "\"".concat(value, "\"")));
}

function add_classes(classes) {
  return classes ? " class=\"".concat(classes, "\"") : '';
}

function bind(component, name, callback) {
  var index = component.$$.props[name];

  if (index !== undefined) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}

function create_component(block) {
  block && block.c();
}

function claim_component(block, parent_nodes) {
  block && block.l(parent_nodes);
}

function mount_component(component, target, anchor, customElement) {
  var _component$$$ = component.$$,
      fragment = _component$$$.fragment,
      on_mount = _component$$$.on_mount,
      on_destroy = _component$$$.on_destroy,
      after_update = _component$$$.after_update;
  fragment && fragment.m(target, anchor);

  if (!customElement) {
    // onMount happens before the initial afterUpdate
    add_render_callback(function () {
      var new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
  }

  after_update.forEach(add_render_callback);
}

function destroy_component(component, detaching) {
  var $$ = component.$$;

  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
    // preserve final state?)

    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}

function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }

  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}

function init(component, options, instance, create_fragment, not_equal, props, append_styles) {
  var dirty = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [-1];
  var parent_component = current_component;
  set_current_component(component);
  var $$ = component.$$ = {
    fragment: null,
    ctx: null,
    // state
    props: props,
    update: noop,
    not_equal: not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty: dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  var ready = false;
  $$.ctx = instance ? instance(component, options.props || {}, function (i, ret) {
    var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
      if (ready) make_dirty(component, i);
    }

    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update); // `false` as a special case of no DOM component

  $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      $$.fragment && $$.fragment.c();
    }

    if (options.intro) transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }

  set_current_component(parent_component);
}

var SvelteElement;

if (typeof HTMLElement === 'function') {
  SvelteElement = /*#__PURE__*/function (_HTMLElement) {
    _inherits(SvelteElement, _HTMLElement);

    var _super2 = _createSuper(SvelteElement);

    function SvelteElement() {
      var _this3;

      _classCallCheck(this, SvelteElement);

      _this3 = _super2.call(this);

      _this3.attachShadow({
        mode: 'open'
      });

      return _this3;
    }

    _createClass(SvelteElement, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var on_mount = this.$$.on_mount;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function); // @ts-ignore todo: improve typings

        for (var key in this.$$.slotted) {
          // @ts-ignore todo: improve typings
          this.appendChild(this.$$.slotted[key]);
        }
      }
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(attr, _oldValue, newValue) {
        this[attr] = newValue;
      }
    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
    }, {
      key: "$destroy",
      value: function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        // TODO should this delegate to addEventListener?
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    }]);

    return SvelteElement;
  }( /*#__PURE__*/_wrapNativeSuper(HTMLElement));
}
/**
 * Base class for Svelte components. Used when dev=false.
 */


var SvelteComponent = /*#__PURE__*/function () {
  function SvelteComponent() {
    _classCallCheck(this, SvelteComponent);
  }

  _createClass(SvelteComponent, [{
    key: "$destroy",
    value: function $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
  }, {
    key: "$on",
    value: function $on(type, callback) {
      var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
  }, {
    key: "$set",
    value: function $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  }]);

  return SvelteComponent;
}();

function dispatch_dev(type, detail) {
  document.dispatchEvent(custom_event(type, Object.assign({
    version: '3.43.1'
  }, detail), true));
}

function append_dev(target, node) {
  dispatch_dev('SvelteDOMInsert', {
    target: target,
    node: node
  });
  append(target, node);
}

function append_hydration_dev(target, node) {
  dispatch_dev('SvelteDOMInsert', {
    target: target,
    node: node
  });
  append_hydration(target, node);
}

function insert_dev(target, node, anchor) {
  dispatch_dev('SvelteDOMInsert', {
    target: target,
    node: node,
    anchor: anchor
  });
  insert(target, node, anchor);
}

function insert_hydration_dev(target, node, anchor) {
  dispatch_dev('SvelteDOMInsert', {
    target: target,
    node: node,
    anchor: anchor
  });
  insert_hydration(target, node, anchor);
}

function detach_dev(node) {
  dispatch_dev('SvelteDOMRemove', {
    node: node
  });
  detach(node);
}

function detach_between_dev(before, after) {
  while (before.nextSibling && before.nextSibling !== after) {
    detach_dev(before.nextSibling);
  }
}

function detach_before_dev(after) {
  while (after.previousSibling) {
    detach_dev(after.previousSibling);
  }
}

function detach_after_dev(before) {
  while (before.nextSibling) {
    detach_dev(before.nextSibling);
  }
}

function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
  var modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
  if (has_prevent_default) modifiers.push('preventDefault');
  if (has_stop_propagation) modifiers.push('stopPropagation');
  dispatch_dev('SvelteDOMAddEventListener', {
    node: node,
    event: event,
    handler: handler,
    modifiers: modifiers
  });
  var dispose = listen(node, event, handler, options);
  return function () {
    dispatch_dev('SvelteDOMRemoveEventListener', {
      node: node,
      event: event,
      handler: handler,
      modifiers: modifiers
    });
    dispose();
  };
}

function attr_dev(node, attribute, value) {
  attr(node, attribute, value);
  if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', {
    node: node,
    attribute: attribute
  });else dispatch_dev('SvelteDOMSetAttribute', {
    node: node,
    attribute: attribute,
    value: value
  });
}

function prop_dev(node, property, value) {
  node[property] = value;
  dispatch_dev('SvelteDOMSetProperty', {
    node: node,
    property: property,
    value: value
  });
}

function dataset_dev(node, property, value) {
  node.dataset[property] = value;
  dispatch_dev('SvelteDOMSetDataset', {
    node: node,
    property: property,
    value: value
  });
}

function set_data_dev(text, data) {
  data = '' + data;
  if (text.wholeText === data) return;
  dispatch_dev('SvelteDOMSetData', {
    node: text,
    data: data
  });
  text.data = data;
}

function validate_each_argument(arg) {
  if (typeof arg !== 'string' && !(arg && _typeof(arg) === 'object' && 'length' in arg)) {
    var msg = '{#each} only iterates over array-like objects.';

    if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
      msg += ' You can use a spread to convert this iterable into an array.';
    }

    throw new Error(msg);
  }
}

function validate_slots(name, slot, keys) {
  for (var _i5 = 0, _Object$keys = Object.keys(slot); _i5 < _Object$keys.length; _i5++) {
    var slot_key = _Object$keys[_i5];

    if (!~keys.indexOf(slot_key)) {
      console.warn("<".concat(name, "> received an unexpected slot \"").concat(slot_key, "\"."));
    }
  }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */


var SvelteComponentDev = /*#__PURE__*/function (_SvelteComponent) {
  _inherits(SvelteComponentDev, _SvelteComponent);

  var _super3 = _createSuper(SvelteComponentDev);

  function SvelteComponentDev(options) {
    _classCallCheck(this, SvelteComponentDev);

    if (!options || !options.target && !options.$$inline) {
      throw new Error("'target' is a required option");
    }

    return _super3.call(this);
  }

  _createClass(SvelteComponentDev, [{
    key: "$destroy",
    value: function $destroy() {
      _get(_getPrototypeOf(SvelteComponentDev.prototype), "$destroy", this).call(this);

      this.$destroy = function () {
        console.warn('Component was already destroyed'); // eslint-disable-line no-console
      };
    }
  }, {
    key: "$capture_state",
    value: function $capture_state() {}
  }, {
    key: "$inject_state",
    value: function $inject_state() {}
  }]);

  return SvelteComponentDev;
}(SvelteComponent);
/**
 * Base class to create strongly typed Svelte components.
 * This only exists for typing purposes and should be used in `.d.ts` files.
 *
 * ### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponentTyped } from "svelte";
 * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 *
 * #### Why not make this part of `SvelteComponent(Dev)`?
 * Because
 * ```ts
 * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
 * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
 * ```
 * will throw a type error, so we need to separate the more strictly typed class.
 */


var SvelteComponentTyped = /*#__PURE__*/function (_SvelteComponentDev) {
  _inherits(SvelteComponentTyped, _SvelteComponentDev);

  var _super4 = _createSuper(SvelteComponentTyped);

  function SvelteComponentTyped(options) {
    _classCallCheck(this, SvelteComponentTyped);

    return _super4.call(this, options);
  }

  return SvelteComponentTyped;
}(SvelteComponentDev);

function loop_guard(timeout) {
  var start = Date.now();
  return function () {
    if (Date.now() - start > timeout) {
      throw new Error('Infinite loop detected');
    }
  };
}



/***/ }),

/***/ "./node_modules/svelte/store/index.mjs":
/*!*********************************************!*\
  !*** ./node_modules/svelte/store/index.mjs ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "get": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.get_store_value),
/* harmony export */   "derived": () => (/* binding */ derived),
/* harmony export */   "readable": () => (/* binding */ readable),
/* harmony export */   "writable": () => (/* binding */ writable)
/* harmony export */ });
/* harmony import */ var _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/index.mjs */ "./node_modules/svelte/internal/index.mjs");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



var subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */

function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */


function writable(value) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
  var stop;
  var subscribers = new Set();

  function set(new_value) {
    if ((0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal)(value, new_value)) {
      value = new_value;

      if (stop) {
        // store is ready
        var run_queue = !subscriber_queue.length;

        var _iterator = _createForOfIteratorHelper(subscribers),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var subscriber = _step.value;
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (run_queue) {
          for (var i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }

          subscriber_queue.length = 0;
        }
      }
    }
  }

  function update(fn) {
    set(fn(value));
  }

  function subscribe(run) {
    var invalidate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
    var subscriber = [run, invalidate];
    subscribers.add(subscriber);

    if (subscribers.size === 1) {
      stop = start(set) || _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
    }

    run(value);
    return function () {
      subscribers["delete"](subscriber);

      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }

  return {
    set: set,
    update: update,
    subscribe: subscribe
  };
}

function derived(stores, fn, initial_value) {
  var single = !Array.isArray(stores);
  var stores_array = single ? [stores] : stores;
  var auto = fn.length < 2;
  return readable(initial_value, function (set) {
    var inited = false;
    var values = [];
    var pending = 0;
    var cleanup = _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;

    var sync = function sync() {
      if (pending) {
        return;
      }

      cleanup();
      var result = fn(single ? values[0] : values, set);

      if (auto) {
        set(result);
      } else {
        cleanup = (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.is_function)(result) ? result : _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
      }
    };

    var unsubscribers = stores_array.map(function (store, i) {
      return (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.subscribe)(store, function (value) {
        values[i] = value;
        pending &= ~(1 << i);

        if (inited) {
          sync();
        }
      }, function () {
        pending |= 1 << i;
      });
    });
    inited = true;
    sync();
    return function stop() {
      (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.run_all)(unsubscribers);
      cleanup();
    };
  });
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./resources/js/app.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _App_svelte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App.svelte */ "./resources/js/App.svelte");

var app = new _App_svelte__WEBPACK_IMPORTED_MODULE_0__["default"]({
  target: document.getElementById('app'),
  props: {
    name: 'world'
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (app);
})();

/******/ })()
;