function _require(index) {
	if (index in _require.cache) {
		return _require.cache[index]();
	}

	var module = {id: index, exports: {}};

	_require.cache[index] = function () {
		return module.exports;
	};

	_require.modules[index](module, module.exports);
	return module.exports;
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

window.A = _require(0);