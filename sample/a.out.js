function require(index) {
	if (index in require.cache) {
		return require.cache[index]();
	}

	var module = {id: index, exports: {}};

	require.cache[index] = function () {
		return module.exports;
	};

	require.modules[index](module, module.exports);
	return module.exports;
}

require.cache = [];

require.modules = [function(module, exports) {
    module.exports.topValue = require(1) * 2;
}, function(module, exports) {
    module.exports = require(2).value * 7;
}, function(module, exports) {
    exports.value = 3;
}];

window.A = require(0);