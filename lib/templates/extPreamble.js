function _require(index) {
  var external, module, exports;

  external = _require.externals[index];

  if (external) {
    return external;
  }

  index = index - _require.externals.length;

  module = _require.cache[index];
  
  if (!module) {
    exports = {};
    module = _require.cache[index] = {id: index, exports: exports};
    _require.modules[index].call(exports, module, exports);
  }

  return module.exports;
}

_require.cache = [];

_require.externals = Array.prototype.slice.call(arguments);
