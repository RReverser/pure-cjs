(function (name, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['davy'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('davy'));
    } else {
        // Browser globals (root is window)
        this[name] = factory(this.davy);
    }
}('A', function (__external_davy, define) {
    function _require(index) {
        var module = _require.cache[index];
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {
                id: index,
                exports: exports
            };
            _require.modules[index].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            return __external_davy;
        },
        function (module, exports) {
            // License of a
            var c = _require(3), url = require('url'), Promise = _require(0);
            this.topValue = _require(2) * 2;
            this.expectedValue = _require(4).answer;
        },
        function (module, exports) {
            // License of b
            module.exports = _require(3).value * 7;
        },
        function (module, exports) {
            // License of c
            var a = _require(1);
            exports.value = 3;
        },
        function (module, exports) {
            module.exports = { 'answer': 42 };
        }
    ];
    return _require(1);
}));
//# sourceMappingURL=expected.js.map