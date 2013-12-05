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