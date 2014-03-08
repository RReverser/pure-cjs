(function (name, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        this[name] = factory();
  }
})("A", function(define) {
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
        var c = _require(1),
            url = require('url');

        this.topValue = _require(2) * 2;
    }, function(module, exports) {
        var a = _require(0);
        exports.value = 3;
    }, function(module, exports) {
        module.exports = _require(1).value * 7;
    }];

    return _require(0);
});