var pathUtils = require('./pathUtils');
var b = require('./astUtils').builders;

function toValue(value) {
	return value instanceof Function ? value.apply(null, Array.prototype.slice.call(arguments, 1)) : value;
}

module.exports = function (inOptions) {
	var options = {
		defaultExt: inOptions.defaultExt || 'js',
		moduleDir: inOptions.moduleDir || 'node_modules',
		input: pathUtils.normalizePath(toValue(inOptions.input))
	};

	options.output = pathUtils.normalizePath(toValue(
		inOptions.output || function (input) {
			return pathUtils.forceExt(input, 'out.js');
		},
		options.input
	));

	if (inOptions.map) {
		options.map = pathUtils.normalizePath(toValue(
			inOptions.map !== true ? inOptions.map : function (input, output) {
				return output + '.map';
			},
			options.input,
			options.output
		));
	}

	options.exports = toValue(inOptions.exports, options.input, options.output);

	var transform = inOptions.transform;
	options.transform = transform ? (transform instanceof Array ? transform : [transform]) : [];

	options.comments = !!inOptions.comments;
	options.dryRun = !!inOptions.dryRun;

	options.deps = [];

	for (var name in inOptions.external) {
		var dep = inOptions.external[name];
		if (dep === true) {
			dep = {name: name};
		}
		dep.global = dep.global || dep.name.replace(/\W/g, '');
		dep.amd = dep.amd || dep.name;
		dep.id = b.identifier('__external_' + (dep.global || deps.length));
		options.deps.push(dep);
	}

	return options;
};