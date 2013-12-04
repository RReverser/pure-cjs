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