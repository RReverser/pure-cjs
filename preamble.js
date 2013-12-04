function require(index) {
	var moduleObj = {exports: {}},
		moduleFunc = require.modules[index];

	require.modules[index] = function () { return moduleObj.exports };

	moduleFunc(moduleObj, moduleObj.exports);
	
	return module.exports;
}