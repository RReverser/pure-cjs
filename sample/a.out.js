window.A = function() {
    function _require(index) {
        var module = _require.cache[index];
        
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {id: index, exports: exports};
            _require.modules[index].call(exports, module, exports);
        }
    
        return module.exports;
    }

    _require.cache = [];

    _require.modules = [function(module, exports) {
        var davy = _require(1),
            url = require('url'),
            c = _require(2);

        this.topValue = _require(3) * 2;
        window.Promise = davy;
    }, function(module, exports) {
        module.exports = _require(4);
    }, function(module, exports) {
        var a = _require(0);
        exports.value = 3;
    }, function(module, exports) {
        module.exports = _require(2).value * 7;
    }, function(module, exports) {
        (function(global) {
          "use strict";
          var next;
          if (typeof define === "function" && define.amd) {
            define([ "subsequent" ], function(subsequent) {
              next = subsequent;
              return Promise;
            });
          } else if (typeof module === "object" && module.exports) {
            module.exports = Promise;
            next = _require(5);
          } else {
            global.Davy = Promise;
            next = global.subsequent;
          }
          function Promise() {
            this.value = undefined;
            this.deferreds = [];
          }
          Promise.prototype.isFulfilled = false;
          Promise.prototype.isRejected = false;
          Promise.prototype.then = function(onFulfill, onReject) {
            var promise = new Promise(), deferred = defer(promise, onFulfill, onReject);
            if (this.isFulfilled || this.isRejected) {
              resolve(deferred, this.isFulfilled ? Promise.SUCCESS : Promise.FAILURE, this.value);
            } else {
              this.deferreds.push(deferred);
            }
            return promise;
          };
          Promise.prototype.catch = function(onReject) {
            return this.then(null, onReject);
          };
          Promise.prototype.throw = function() {
            return this.catch(function(error) {
              next(function() {
                throw error;
              });
            });
          };
          Promise.prototype.fulfill = function(value) {
            if (this.isFulfilled || this.isRejected) return;
            var isResolved = false;
            try {
              if (value === this) throw new TypeError("Can't resolve a promise with itself.");
              if (isObject(value) || isFunction(value)) {
                var then = value.then, self = this;
                if (isFunction(then)) {
                  then.call(value, function(val) {
                    if (!isResolved) {
                      isResolved = true;
                      self.fulfill(val);
                    }
                  }, function(err) {
                    if (!isResolved) {
                      isResolved = true;
                      self.reject(err);
                    }
                  });
                  return;
                }
              }
              this.isFulfilled = true;
              this.complete(value);
            } catch (e) {
              if (!isResolved) {
                this.reject(e);
              }
            }
          };
          Promise.prototype.reject = function(error) {
            if (this.isFulfilled || this.isRejected) return;
            this.isRejected = true;
            this.complete(error);
          };
          Promise.prototype.complete = function(value) {
            this.value = value;
            var type = this.isFulfilled ? Promise.SUCCESS : Promise.FAILURE;
            for (var i = 0; i < this.deferreds.length; ++i) {
              resolve(this.deferreds[i], type, value);
            }
            this.deferreds = undefined;
          };
          Promise.SUCCESS = "fulfill";
          Promise.FAILURE = "reject";
          function resolve(deferred, type, value) {
            var fn = deferred[type], promise = deferred.promise;
            if (isFunction(fn)) {
              next(function() {
                try {
                  value = fn(value);
                  promise.fulfill(value);
                } catch (e) {
                  promise.reject(e);
                }
              });
            } else {
              promise[type](value);
            }
          }
          function defer(promise, fulfill, reject) {
            return {
              promise: promise,
              fulfill: fulfill,
              reject: reject
            };
          }
          function isObject(obj) {
            return obj && typeof obj === "object";
          }
          function isFunction(fn) {
            return fn && typeof fn === "function";
          }
          Promise.all = function() {
            var args = [].slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments), promise = new Promise(), remaining = args.length;
            if (remaining === 0) promise.fulfill([]);
            for (var i = 0; i < args.length; ++i) {
              resolve(i, args[i]);
            }
            return promise;
            function reject(err) {
              promise.reject(err);
            }
            function resolve(i, value) {
              if (isObject(value) && isFunction(value.then)) {
                value.then(function(val) {
                  resolve(i, val);
                }, reject);
                return;
              }
              args[i] = value;
              if (--remaining === 0) {
                promise.fulfill(args);
              }
            }
          };
          Promise.wrap = function(fn) {
            return function() {
              var args = [].slice.call(arguments), promise = new Promise();
              args.push(function(err, val) {
                if (err) {
                  promise.reject(err);
                } else {
                  promise.fulfill(val);
                }
              });
              fn.apply(this, args);
              return promise;
            };
          };
        })(this);
    }, function(module, exports) {
        module.exports = _require(6);
    }, function(module, exports) {
        (function(global) {
          "use strict";
          var next = function(next, buffer, length, tick) {
            buffer = new Array(1e4);
            length = 0;
            function enqueue(fn) {
              if (length === buffer.length) {
                length = buffer.push(fn);
              } else {
                buffer[length++] = fn;
              }
              if (!tick) {
                return tick = true;
              }
            }
            function execute() {
              var i = 0;
              while (i < length) {
                buffer[i]();
                buffer[i++] = undefined;
              }
              length = 0;
              tick = false;
            }
            if (typeof setImmediate === "function") {
              next = function(fn) {
                enqueue(fn) && setImmediate(execute);
              };
            } else if (typeof process === "object" && process.nextTick) {
              next = function(fn) {
                enqueue(fn) && process.nextTick(execute);
              };
            } else if (global.postMessage) {
              var message = "__subsequent", onMessage = function(e) {
                if (e.data === message) {
                  e.stopPropagation && e.stopPropagation();
                  execute();
                }
              };
              if (global.addEventListener) {
                global.addEventListener("message", onMessage, true);
              } else {
                global.attachEvent("onmessage", onMessage);
              }
              next = function(fn) {
                enqueue(fn) && global.postMessage(message, "*");
              };
            } else {
              next = function(fn) {
                enqueue(fn) && setTimeout(execute, 0);
              };
            }
            return next;
          }();
          if (typeof define === "function" && define.amd) {
            define(function() {
              return next;
            });
          } else if (typeof module === "object" && module.exports) {
            module.exports = next;
          } else {
            global.subsequent = next;
          }
        })(this);
    }];

    return _require(0);
}();
//# sourceMappingURL=a.out.js.map