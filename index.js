var fs = require('fs'),
	recast = require('recast'),
	Visitor = recast.Visitor,
	b = recast.builders,
	n = recast.namedTypes,
	program = require('commander'),
	url = require('url'),
	jsExtRegExp = /(\.js)?$/;

program
	.version(require('./package.json').version)
	.option('-i, --input <file>', 'Input file (required)')
	.option('-o, --output <file>', 'Output file (defaults to <input>.out.js)')
	.parse(process.argv);

if (!program.input) {
	program.help();
}

if (!program.output) {
	program.output = program.input.replace(jsExtRegExp, '.out.js');
}

var Replacer = Visitor.extend({
	modulesId: b.identifier('$MODULES'),

	init: function (modulePath, parent) {
		this.ids = parent ? parent.ids : {};
		this.modulesArray = parent ? parent.modulesArray : [];
		this.hasParent = !!parent;
		this.path = '';
		this.path = this.toAbsolute(modulePath);
	},

	getId: function (name) {
		return name in this.ids ? this.ids[name] : (this.ids[name] = this.modulesArray.push());
	},

	toAbsolute: function (modulePath) {
		return url.resolve(this.path, modulePath).replace(jsExtRegExp, '.js');
	},

	visitCallExpression: function (node) {
		if (n.Identifier.check(node.callee) && node.callee.name === 'require' && n.Literal.check(node.arguments[0])) {
			var path = this.toAbsolute(node.arguments[0].value);

			new Replacer(path, this).visit(recast.parse(fs.readFileSync(path, {encoding: 'utf-8'})));

			return b.callExpression(
				b.memberExpression(
					this.modulesId,
					b.literal(this.getId(path)),
					true
				),
				node.arguments.slice(1)
			);
		}

		this.genericVisit(node);
	},

	visitProgram: function (node) {
		this.modulesArray[this.getId(this.path)] = b.functionExpression(null, [], b.blockStatement(node.body));
		this.visit(node.body);

		if (!this.hasParent) {
			return b.program([b.variableDeclaration(
				'var',
				[b.variableDeclarator(
					this.modulesId,
					b.arrayExpression(this.modulesArray)
				)]
			)]);
		}
	}
});

console.log(program.input);
var ast = recast.parse(fs.readFileSync(program.input, {encoding: 'utf-8'}));

console.log(' => ');
new Replacer(program.input).visit(ast);

fs.writeFileSync(program.output, recast.print(ast));
console.log(program.output);