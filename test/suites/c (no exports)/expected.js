(function (define) {
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
            var a = _require(1);
            exports.value = 3;
        },
        function (module, exports) {
            var c = _require(0), url = require('url');
            this.topValue = _require(2) * 2;
        },
        function (module, exports) {
            module.exports = _require(0).value * 7;
        }
    ];
    _require(0);
}());