window.A = function() {
    function _require(index) {
        var cache = _require.cache;
        
        if (index in cache) {
            return cache[index].exports;
        } else {
            var module = cache[index] = {id: index, exports: {}};
            _require.modules[index](module, module.exports);
            return module.exports;
        }
    }

    _require.cache = [];

    _require.modules = [function(module, exports) {
        var url = require('url'),
            c = _require(1);

        module.exports.topValue = _require(2) * 2;
    }, function(module, exports) {
        var a = _require(0);
        exports.value = 3;
    }, function(module, exports) {
        module.exports = _require(1).value * 7;
    }];

    return _require(0);
}();