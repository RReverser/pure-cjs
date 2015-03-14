(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([''], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('url'));
    } else {
        this['A'] = factory(undefined);
    }
}(function (__external_url) {
    var global = this, define;
    function _require(id) {
        var module = _require.cache[id];
        if (!module) {
            var exports = {};
            module = _require.cache[id] = {
                id: id,
                exports: exports
            };
            _require.modules[id].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            (function (global) {
                'use strict';
                var next;
                if (typeof define === 'function' && define.amd) {
                    define(['subsequent'], function (subsequent) {
                        next = subsequent;
                        return Promise;
                    });
                } else if (typeof module === 'object' && module.exports) {
                    module.exports = Promise;
                    next = _require(2);
                } else {
                    global.Davy = Promise;
                    next = global.subsequent;
                }
                function Promise(fn) {
                    this.value = undefined;
                    this.__deferreds = [];
                    if (arguments.length > 0) {
                        var resolver = new Resolver(this);
                        if (typeof fn == 'function') {
                            try {
                                fn(function (val) {
                                    resolver.fulfill(val);
                                }, function (err) {
                                    resolver.reject(err);
                                });
                            } catch (e) {
                                resolver.reject(e);
                            }
                        } else {
                            resolver.fulfill(fn);
                        }
                    }
                }
                Promise.prototype.isFulfilled = false;
                Promise.prototype.isRejected = false;
                Promise.prototype.then = function (onFulfill, onReject) {
                    var resolver = new Resolver(new Promise()), deferred = defer(resolver, onFulfill, onReject);
                    if (this.isFulfilled || this.isRejected) {
                        resolve(deferred, this.isFulfilled ? Promise.SUCCESS : Promise.FAILURE, this.value);
                    } else {
                        this.__deferreds.push(deferred);
                    }
                    return resolver.promise;
                };
                Promise.SUCCESS = 'fulfill';
                Promise.FAILURE = 'reject';
                function defer(resolver, fulfill, reject) {
                    return {
                        resolver: resolver,
                        fulfill: fulfill,
                        reject: reject
                    };
                }
                function Resolver(promise) {
                    this.promise = promise;
                }
                Resolver.prototype.fulfill = function (value) {
                    var promise = this.promise;
                    if (promise.isFulfilled || promise.isRejected)
                        return;
                    if (value === promise)
                        throw new TypeError('Can\'t resolve a promise with itself.');
                    if (isObject(value) || isFunction(value)) {
                        var then;
                        try {
                            then = value.then;
                        } catch (e) {
                            this.reject(e);
                            return;
                        }
                        if (isFunction(then)) {
                            var isResolved = false, self = this;
                            try {
                                then.call(value, function (val) {
                                    if (!isResolved) {
                                        isResolved = true;
                                        self.fulfill(val);
                                    }
                                }, function (err) {
                                    if (!isResolved) {
                                        isResolved = true;
                                        self.reject(err);
                                    }
                                });
                            } catch (e) {
                                if (!isResolved) {
                                    this.reject(e);
                                }
                            }
                            return;
                        }
                    }
                    promise.isFulfilled = true;
                    this.complete(value);
                };
                Resolver.prototype.reject = function (error) {
                    var promise = this.promise;
                    if (promise.isFulfilled || promise.isRejected)
                        return;
                    promise.isRejected = true;
                    this.complete(error);
                };
                Resolver.prototype.complete = function (value) {
                    var promise = this.promise, deferreds = promise.__deferreds, type = promise.isFulfilled ? Promise.SUCCESS : Promise.FAILURE;
                    promise.value = value;
                    for (var i = 0; i < deferreds.length; ++i) {
                        resolve(deferreds[i], type, value);
                    }
                    promise.__deferreds = undefined;
                };
                function resolve(deferred, type, value) {
                    var fn = deferred[type], resolver = deferred.resolver;
                    if (isFunction(fn)) {
                        next(function () {
                            try {
                                value = fn(value);
                                resolver.fulfill(value);
                            } catch (e) {
                                resolver.reject(e);
                            }
                        });
                    } else {
                        resolver[type](value);
                    }
                }
                Promise.prototype['catch'] = function (onRejected) {
                    return this.then(null, onRejected);
                };
                Promise.prototype['throw'] = function () {
                    return this['catch'](function (error) {
                        next(function () {
                            throw error;
                        });
                    });
                };
                Promise.prototype['finally'] = function (onResolved) {
                    return this.then(onResolved, onResolved);
                };
                Promise.prototype['yield'] = function (value) {
                    return this.then(function () {
                        return value;
                    });
                };
                Promise.prototype.tap = function (onFulfilled) {
                    return this.then(onFulfilled)['yield'](this);
                };
                Promise.prototype.spread = function (onFulfilled, onRejected) {
                    return this.then(function (val) {
                        return onFulfilled.apply(this, val);
                    }, onRejected);
                };
                Promise.resolve = Promise.cast = function (val) {
                    if (isObject(val) && isFunction(val.then)) {
                        return val;
                    }
                    return new Promise(val);
                };
                Promise.reject = function (err) {
                    var resolver = Promise.defer();
                    resolver.reject(err);
                    return resolver.promise;
                };
                Promise.defer = function () {
                    return new Resolver(new Promise());
                };
                Promise.each = function (list, iterator) {
                    var resolver = Promise.defer(), len = list.length;
                    if (len === 0)
                        resolver.reject(TypeError());
                    for (var i = 0; i < len; ++i) {
                        iterator(list[i], i);
                    }
                    return resolver;
                };
                Promise.all = function () {
                    var list = parse(arguments), length = list.length, resolver = Promise.each(list, resolve);
                    return resolver.promise;
                    function reject(err) {
                        resolver.reject(err);
                    }
                    function resolve(value, i) {
                        if (isObject(value) && isFunction(value.then)) {
                            value.then(function (val) {
                                resolve(val, i);
                            }, reject);
                            return;
                        }
                        list[i] = value;
                        if (--length === 0) {
                            resolver.fulfill(list);
                        }
                    }
                };
                Promise.race = function () {
                    var list = parse(arguments), resolver = Promise.each(list, resolve);
                    return resolver.promise;
                    function reject(err) {
                        resolver.reject(err);
                    }
                    function resolve(value) {
                        if (isObject(value) && isFunction(value.then)) {
                            value.then(resolve, reject);
                            return;
                        }
                        resolver.fulfill(value);
                    }
                };
                Promise.wrap = function (fn) {
                    return function () {
                        var resolver = new Resolver(new Promise());
                        arguments[arguments.length++] = function (err, val) {
                            if (err) {
                                resolver.reject(err);
                            } else {
                                resolver.fulfill(val);
                            }
                        };
                        fn.apply(this, arguments);
                        return resolver.promise;
                    };
                };
                function isObject(obj) {
                    return obj && typeof obj === 'object';
                }
                function isFunction(fn) {
                    return fn && typeof fn === 'function';
                }
                function parse(obj) {
                    if (obj.length === 1 && Array.isArray(obj[0])) {
                        return obj[0];
                    } else {
                        var args = new Array(obj.length);
                        for (var i = 0; i < args.length; ++i) {
                            args[i] = obj[i];
                        }
                        return args;
                    }
                }
            }(this));
        },
        function (module, exports) {
            module.exports = _require(0);
        },
        function (module, exports) {
            module.exports = _require(3);
        },
        function (module, exports) {
            (function (global) {
                'use strict';
                var next = function (next, buffer, length, tick) {
                        buffer = new Array(10000);
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
                        if (typeof setImmediate === 'function') {
                            next = function (fn) {
                                enqueue(fn) && setImmediate(execute);
                            };
                        } else if (typeof process === 'object' && process.nextTick) {
                            next = function (fn) {
                                enqueue(fn) && process.nextTick(execute);
                            };
                        } else if (global.postMessage) {
                            var message = '__subsequent', onMessage = function (e) {
                                    if (e.data === message) {
                                        e.stopPropagation && e.stopPropagation();
                                        execute();
                                    }
                                };
                            if (global.addEventListener) {
                                global.addEventListener('message', onMessage, true);
                            } else {
                                global.attachEvent('onmessage', onMessage);
                            }
                            next = function (fn) {
                                enqueue(fn) && global.postMessage(message, '*');
                            };
                        } else {
                            next = function (fn) {
                                enqueue(fn) && setTimeout(execute, 0);
                            };
                        }
                        return next;
                    }();
                if (typeof define === 'function' && define.amd) {
                    define(function () {
                        return next;
                    });
                } else if (typeof module === 'object' && module.exports) {
                    module.exports = next;
                } else {
                    global.subsequent = next;
                }
            }(this));
        },
        function (module, exports) {
            var c = _require(6), url = _require(8), Promise = _require(1);
            this.topValue = _require(5) * 2;
            this.expectedValue = _require(7).answer;
        },
        function (module, exports) {
            module.exports = _require(6).value * 7;
        },
        function (module, exports) {
            var a = _require(4);
            exports.value = 3;
        },
        function (module, exports) {
            module.exports = { 'answer': 42 };
        },
        function (module, exports) {
            module.exports = __external_url;
        }
    ];
    return _require(4);
}));