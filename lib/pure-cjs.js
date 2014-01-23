var fs = require('fs'),
	recast = require('recast'),
	url = require('url'),
	cwd = process.cwd(),
	pathUtils = require('path'),
	nodeResolve = require('resolve'),
	Promise = require('davy'),

	types = recast.types,
	b = types.builders,
	n = types.namedTypes,

	whenReadFile = Promise.wrap(fs.readFile),
	whenWriteFile = Promise.wrap(fs.writeFile),
	
	jsExtRegExp = /(\.js)?$/,
	localRegEx = /^\.\.?\//,
	badPathSep = /\\/g,
	
	astModuleArgs = [b.identifier('module'), b.identifier('exports')],
	astRequire = b.identifier('_require'),
	astLocalReqModules = b.memberExpression(astRequire, b.identifier('modules'), false),
	astPreamble = recast.parse(fs.readFileSync(__dirname + '/preamble.js'), {sourceFileName: 'preamble.js'}).program.body;

function normalizePath(path) {
	return url.resolve('', path.replace(badPathSep, '/'));
}

function relative(from, to) {
	return pathUtils.relative(from, to).replace(badPathSep, '/');
}

function toValue(value) {
	return value instanceof Function ? value.apply(null, Array.prototype.slice.call(arguments, 1)) : value;
}

function ReplacerMap() {
	this.replacers = {};
	this.promises = [];
}

ReplacerMap.prototype.get = function (path) {
	if (path in this.replacers) {
		return this.replacers[path];
	}

	var id = this.promises.length++,
		replacer = this.replacers[path] = new Replacer(path, this, id);

	this.promises[id] = replacer.promise;

	return replacer;
};

ReplacerMap.prototype.whenAll = function (startIndex) {
	var currentLength = this.promises.length;

	return Promise.all(this.promises.slice(startIndex || 0)).then(function (firstPart) {
		if (this.promises.length > currentLength) {
			return this.whenAll(currentLength).then(function (secondPart) {
				return firstPart.concat(secondPart);
			});
		} else {
			return firstPart;
		}
	}.bind(this));
};

var Replacer = recast.Visitor.extend({
	init: function (path, map, id) {
		this.id = id;
		this.map = map;
		this.path = path;
		this.promise = whenReadFile(path, {encoding: 'utf-8'}).then(function (js) {
			var ast = recast.parse(js, {sourceFileName: path}).program;
			this.visit(ast);
			return b.functionExpression(null, astModuleArgs, b.blockStatement(ast.body));
		}.bind(this));
	},

	getDependency: function (path) {
		if (localRegEx.test(path)) {
			path = url.resolve(this.path, path).replace(jsExtRegExp, '.js');
		} else {
			path = relative(cwd, nodeResolve.sync(path, {
				basedir: pathUtils.resolve(cwd, pathUtils.dirname(this.path))
			}));
		}

		return this.map.get(path);
	},

	visitCallExpression: function (node) {
		var func = node.callee,
			arg = node.arguments[0];

		if (n.Identifier.check(func) && func.name === 'require' && n.Literal.check(arg) && !nodeResolve.isCore(arg.value)) {
			func.name = astRequire.name;
			arg.value = this.getDependency(arg.value).id;
		}

		this.genericVisit(node);
	}
});

exports.transform = function (inOptions) {
	var options = {
		input: normalizePath(toValue(inOptions.input))
	};
	
	options.output = normalizePath(toValue(
		inOptions.output || function (input) {
			return input.replace(jsExtRegExp, '.out.js');
		},
		options.input
	));

	if (inOptions.map) {
		options.map = normalizePath(toValue(
			inOptions.map !== true ? inOptions.map : function (input, output) {
				return output + '.map';
			},
			options.input,
			options.output
		));
	}

	options.exports = toValue(inOptions.exports, options.input, options.output);

	var map = new ReplacerMap(),
		replacer = map.get(options.input);

	return map.whenAll().then(function (modules) {
		var requireExpr = b.callExpression(
			astRequire,
			[b.literal(replacer.id)]
		);

		var stmts = astPreamble.slice();

		stmts.push(b.expressionStatement(b.assignmentExpression(
			'=',
			astLocalReqModules,
			b.arrayExpression(modules)
		)));

		if (options.exports) {
			stmts.push(b.returnStatement(requireExpr));

			stmts = [b.expressionStatement(b.assignmentExpression(
				'=',
				recast.parse(options.exports).program.body[0].expression,
				b.callExpression(
					b.functionExpression(null, [], b.blockStatement(stmts)),
					[]
				)
			))];
		} else {
			stmts.push(b.expressionStatement(requireExpr));
		}

		var output = recast.print(b.program(stmts), {sourceMapName: options.map}),
			whenOut;

		if (options.map) {
			whenOut = Promise.all(
				whenWriteFile(options.output, output.code + '\n//# sourceMappingURL=' + relative(pathUtils.dirname(options.output), options.map)),
				whenWriteFile(options.map, JSON.stringify(output.map))
			);
		} else {
			whenOut = whenWriteFile(options.output, output.code);
		}

		return whenOut.then(function () {
			return options;
		});
	});
};