var parse = require('esprima').parse,
	generate = require('escodegen').generate,
	types = require('ast-types'),
	traverse = types.traverse.fast;

// Polyfill until https://github.com/ariya/esprima/pull/148/files is merged into npm version

exports.parse = function (code, options) {
	var ast = parse.apply(this, arguments);

	if (options.source) {
		traverse(ast, function (node) {
			node.loc.source = options;
		});
	}

	return ast;
};

// Workaround until https://github.com/Constellation/escodegen/issues/174 is fixed

exports.generate = function (ast, options) {
	var output = generate(ast, options);
	
	if (options.sourceMapWithCode && typeof output === 'string') {
		output = {code: output};
	}

	return output;
};

exports.traverse = traverse;

exports.builders = types.builders;
exports.namedTypes = types.namedTypes;