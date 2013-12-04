function require(index) {
	if (index in require.cache) {
		return require.cache[index]();
	}

	var module = {
		id: index,
		exports: {}
	};

	require.cache[index] = function () {
		return module.exports;
	};

	require.modules[index](module, module.exports);
	return module.exports;
}

require.cache = [];