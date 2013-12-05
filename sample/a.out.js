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
        var url = require('url');
        module.exports.topValue = _require(1) * 2;
    }, function(module, exports) {
        module.exports = _require(2).value * 7;
    }, function(module, exports) {
        exports.value = 3;
    }];

    return _require(0);
}();