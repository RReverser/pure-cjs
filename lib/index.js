var fs = require('fs'),
	astUtils = require('./astUtils'),
	b = astUtils.builders,
	Promise = require('./promise'),
	astConsts = require('./astConsts'),
	parseOptions = require('./parseOptions'),
	pathUtils = require('./pathUtils'),
	ReplacerMap = require('./replacerMap'),
	whenWriteFile = Promise.wrap(fs.writeFile);

exports.transform = function (inOptions) {
	var options = parseOptions(inOptions),
		map = new ReplacerMap(options),
		replacer = map.get(options.input);

	return map.whenAll().then(function (modules) {
		var factoryExpr = b.functionExpression(
				null,
				options.deps.map(function (dep) { return dep.id }).concat(astConsts.factoryArgs),
				b.blockStatement(astConsts.preamble.concat([
					b.expressionStatement(b.assignmentExpression(
						'=',
						astConsts.localReqModules,
						b.arrayExpression(modules)
					)),
					b[options.exports ? 'returnStatement' : 'expressionStatement'](b.callExpression(
						astConsts.require,
						[b.literal(replacer.id)]
					))
				]))
			),
			expr = (
				options.exports
				? b.callExpression(astConsts.getUmdWrapper(options.deps), [b.literal(options.exports), factoryExpr])
				: b.callExpression(factoryExpr, [])
			),
			result = astUtils.generate(b.program([b.expressionStatement(expr)]), {
				sourceMap: !!options.map,
				comment: options.comments,
				sourceMapWithCode: true
			}),
			whenOut;

		result.options = options;

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