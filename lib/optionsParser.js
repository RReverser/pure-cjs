var pathUtils = require('./pathUtils');

function toValue(value) {
	return value instanceof Function ? value.apply(null, Array.prototype.slice.call(arguments, 1)) : value;
}

module.exports = function (inOptions) {
	var options = {
		input: pathUtils.normalizePath(toValue(inOptions.input))
	};

	options.output = pathUtils.normalizePath(toValue(
		inOptions.output || function (input) {
			return pathUtils.forceJsExt(input, '.out.js');
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

	options.dryRun = !!inOptions.dryRun;

	options.link = inOptions.link || {};

	options.externals = Object.keys(options.link).filter(function (name) {
		return options.link[name].source === 'external';
	}).sort();

	return options;
};