var fs = require('fs'),
	recast = require('recast'),
	Promise = require('davy'),
	astConsts = require('./astConsts'),
	optionsParser = require('./optionsParser'),
	pathUtils = require('./pathUtils'),
	ReplacerMap = require('./replacerMap'),
	b = recast.types.builders,
	whenWriteFile = Promise.wrap(fs.writeFile);

exports.transform = function (inOptions) {
	var options = optionsParser(inOptions),
		map = new ReplacerMap(options),
		replacer = map.get(options.input);

	return map.whenAll().then(function (modules) {
		var factoryExpr = b.functionExpression(
				null,
				astConsts.factoryArgs,
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
				? b.callExpression(astConsts.umdWrapper, [b.literal(options.exports), factoryExpr])
				: b.callExpression(factoryExpr, [])
			),
			_result = recast.print(b.program([b.expressionStatement(expr)]), {sourceMapName: options.map}),
			result = {
				code: _result.code,
				map: _result.map,
				options: options
			},
			whenOut;

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
			whenOut = new Promise();
			whenOut.fulfill();
		}

		return whenOut.then(function () {
			return result;
		});
	});
};