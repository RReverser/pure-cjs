var fs = require('fs'),
	recast = require('recast'),
	url = require('url'),
	Promise = require('davy'),

	b = recast.builders,
	n = recast.namedTypes,

	whenReadFile = Promise.wrap(fs.readFile),
	
	jsExtRegExp = /(\.js)?$/,
	localRegEx = /^\.\.?\//,
	
	astModuleArgs = [b.identifier('module'), b.identifier('exports')],
	astRequire = b.identifier('_require'),
	astLocalReqModules = b.memberExpression(astRequire, b.identifier('modules'), false),
	astPreamble = recast.parse(fs.readFileSync(__dirname + '/preamble.js')).program.body,
	
	Replacer = recast.Visitor.extend({
		path: '',

		init: function (modulePath, parent) {
			this.ids = parent ? parent.ids : {};
			this.modulesArray = parent ? parent.modulesArray : [];
			this.deps = [];
			this.path = this.toAbsolute(modulePath);
			this.id = this.getId(this.path);

			Object.defineProperty(this, 'promise', {
				enumerable: true,
				configurable: true,
				get: function () {
					var promise = Promise.all(this.deps);

					Object.defineProperty(this, 'promise', {
						configurable: false,
						value: promise
					});

					return promise;
				}
			});
		},

		getId: function (path) {
			var ids = this.ids;

			path = this.toAbsolute(path);

			if (path in ids) {
				return ids[path];
			}

			var self = this,
				promise = whenReadFile(path, {encoding: 'utf-8'}).then(function (js) {
					var replacer = new Replacer(path, self);
					replacer.visit(recast.parse(js));
					return replacer.promise;
				});

			this.deps.push(promise);

			return ids[path] = this.modulesArray.push(promise.then(function () {
				return b.functionExpression(null, astModuleArgs, b.blockStatement(node.body));
			}));
		},

		toAbsolute: function (modulePath) {
			return url.resolve(this.path, modulePath).replace(jsExtRegExp, '.js');
		},

		visitCallExpression: function (node) {
			if (n.Identifier.check(node.callee) && node.callee.name === 'require' && n.Literal.check(node.arguments[0]) && localRegEx.test(node.arguments[0].value)) {
				return b.callExpression(astRequire, [b.literal(this.getId(node.arguments[0].value))]);
			}

			this.genericVisit(node);
		}
	});

exports.transform = function (options) {
	if (!options.output) {
		options.output = options.input.replace(jsExtRegExp, '.out.js');
	}

	var replacer = new Replacer(options.input);

	replacer.promise.then(function () {
		var requireExpr = b.callExpression(
			astRequire,
			[b.literal(replacer.id)]
		);

		var stmts = astPreamble.slice();

		stmts.push(
			b.expressionStatement(b.assignmentExpression(
				'=',
				astLocalReqModules,
				b.arrayExpression(replacer.modulesArray.map(function (promise) { return promise.value }))
			))
		);

		if (options.exports) {
			stmts.push(b.returnStatement(requireExpr));

			stmts = [b.expressionStatement(
				b.assignmentExpression(
					'=',
					recast.parse(options.exports).program.body[0].expression,
					b.callExpression(
						b.functionExpression(null, [], b.blockStatement(stmts)),
						[]
					)
				)
			)];
		} else {
			stmts.push(b.expressionStatement(requireExpr));
		}

		fs.writeFile(options.output, recast.print(b.program(stmts)));
	});
};