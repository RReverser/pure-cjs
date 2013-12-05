var fs = require('fs'),
	recast = require('recast'),
	Visitor = recast.Visitor,
	b = recast.builders,
	n = recast.namedTypes,
	url = require('url'),
	jsExtRegExp = /(\.js)?$/,
	localRegEx = /^\.\.?\//,
	moduleArgs = [b.identifier('module'), b.identifier('exports')],
	_requireId = b.identifier('_require'),
	_requireModulesMember = b.memberExpression(_requireId, b.identifier('modules'), false),
	preambleStmts = recast.parse(fs.readFileSync(__dirname + '/preamble.js')).program.body,
	Replacer = Visitor.extend({
		path: '',

		init: function (modulePath, parent) {
			this.ids = parent ? parent.ids : {};
			this.modulesArray = parent ? parent.modulesArray : [];
			this.path = this.toAbsolute(modulePath);
			this.id = this.getId(this.path);
		},

		getId: function (name) {
			return name in this.ids ? this.ids[name] : (this.ids[name] = this.modulesArray.push());
		},

		toAbsolute: function (modulePath) {
			return url.resolve(this.path, modulePath).replace(jsExtRegExp, '.js');
		},

		visitCallExpression: function (node) {
			if (n.Identifier.check(node.callee) && node.callee.name === 'require' && n.Literal.check(node.arguments[0]) && localRegEx.test(node.arguments[0].value)) {
				var path = this.toAbsolute(node.arguments[0].value);
				new Replacer(path, this).visit(recast.parse(fs.readFileSync(path, {encoding: 'utf-8'})));
				return b.callExpression(_requireId, [b.literal(this.getId(path))]);
			}

			this.genericVisit(node);
		},

		visitProgram: function (node) {
			this.modulesArray[this.id] = b.functionExpression(null, moduleArgs, b.blockStatement(node.body));
			this.visit(node.body);
		}
	});

exports.transform = function (options) {
	if (!options.output) {
		options.output = options.input.replace(jsExtRegExp, '.out.js');
	}

	var replacer = new Replacer(options.input);
	replacer.visit(recast.parse(fs.readFileSync(options.input, {encoding: 'utf-8'})));

	var requireExpr = b.callExpression(
		_requireId,
		[b.literal(replacer.id)]
	);

	var stmts = preambleStmts.slice();

	stmts.push(
		b.expressionStatement(b.assignmentExpression(
			'=',
			_requireModulesMember,
			b.arrayExpression(replacer.modulesArray)
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

	fs.writeFileSync(options.output, recast.print(b.program(stmts)));
};