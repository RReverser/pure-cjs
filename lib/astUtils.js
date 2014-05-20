var parse = require('esprima').parse,
	generate = require('escodegen').generate,
	types = require('ast-types'),
	traverse = types.traverse.fast;

exports.parse = parse;
exports.generate = generate;

exports.traverse = traverse;

exports.builders = types.builders;
exports.namedTypes = types.namedTypes;