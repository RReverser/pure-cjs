(function (name, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        this[name] = factory();
    }
}('A', function (define) {
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
            var c = _require(1), url = require('url');
            this.topValue = _require(2) * 2;
        },
        function (module, exports) {
            var a = _require(0);
            exports.value = 3;
        },
        function (module, exports) {
            module.exports = _require(1).value * 7;
        }
    ];
    return _require(0);
}));
//# sourceMappingURL=expected.js.map