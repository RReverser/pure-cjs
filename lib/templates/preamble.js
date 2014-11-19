(function (%= deps.map(function (dep) { return dep.id }) %) {
	var global = this, define;

	function _require(id) {
		var module = _require.cache[id];

		if (!module) {
			var exports = {};
			module = _require.cache[id] = {id: id, exports: exports};
			_require.modules[id].call(exports, module, exports);
		}

		return module.exports;
	}

	_require.cache = [];
	_require.modules = [%= modules %];

	return _require(<%= b.literal(replacer.id) %>);
})