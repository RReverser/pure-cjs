var fs = require('fs'),
	b = require('ast-types').builders,
	generate = require('escodegen').generate,
	Promise = require('./promise'),
	astConsts = require('./astConsts'),
	parseOptions = require('./parseOptions'),
	pathUtils = require('./pathUtils'),
	ReplacerMap = require('./replacerMap'),
	whenWriteFile = Promise.wrap(fs.writeFile);

exports.transformAST = function (inOptions) {
	var options = parseOptions(inOptions),
		map = new ReplacerMap(options),
		replacer = map.get(options.input);

	return map.whenAll().then(function (modules) {
		var factoryExpr = astConsts.tmpl.preamble({
				deps: options.deps,
				exports: options.exports,
				modules: modules,
				replacer: replacer
			});

		return {
			ast: b.program([b.expressionStatement(
				options.exports
				? b.callExpression(astConsts.tmpl.umdWrapper(options), [factoryExpr])
				: b.callExpression(factoryExpr, [])
			)]),
			options: options
		};
	});
};

exports.transform = function (inOptions) {
	return exports.transformAST(inOptions).then(function (result) {
		var options = result.options;

		result = generate(result.ast, {
			sourceMap: !!options.map,
			comment: options.comments,
			sourceMapWithCode: true
		});

		result.options = options;

		var whenOut;

		if (!options.dryRun) {
			if (options.map) {
				result.code += '\n//# sourceMappingURL=' + pathUtils.relative(pathUtils.std.dirname(options.output), options.map);
				whenOut = Promise.all(
					whenWriteFile(options.output, result.code),
					whenWriteFile(options.map, JSON.stringify(result.map))
				);
			} else {
				whenOut = whenWriteFile(options.output, result.code);
			}
		} else {
			whenOut = Promise.resolve();
		}

		return whenOut.then(function () {
			return result;
		});
	});
};