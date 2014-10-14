(function (%=
	deps.map(function (dep) { return dep.id }).concat([b.identifier('define')])
%) {

function _require(index) {
	var module = _require.cache[index];
	
	if (!module) {
		var exports = {};
		module = _require.cache[index] = {id: index, exports: exports};
		_require.modules[index].call(exports, module, exports);
	}

	return module.exports;
}

_require.cache = [];
_require.modules = [%= modules %];

return _require(<%= b.literal(replacer.id) %>);

})