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

var moduleArgs = [b.identifier('module'), b.identifier('exports')],
	Replacer = Visitor.extend({
		path: '',

		init: function (modulePath, parent) {
			this.ids = parent ? parent.ids : {};
			this.modulesArray = parent ? parent.modulesArray : [];
			this.hasParent = !!parent;
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
				node.arguments[0] = b.literal(this.getId(path));
				new Replacer(path, this).visit(recast.parse(fs.readFileSync(path, {encoding: 'utf-8'})));
			}

			this.genericVisit(node);
		},

		visitProgram: function (node) {
			var id = this.getId(this.path);

			this.modulesArray[id] = b.functionExpression(null, moduleArgs, b.blockStatement(node.body));
			this.visit(node.body);

			if (!this.hasParent) {
				return b.program(
					recast.parse(fs.readFileSync('preamble.js')).program.body.concat([
						b.expressionStatement(b.assignmentExpression(
							'=',
							b.memberExpression(b.identifier('require'), b.identifier('modules'), false),
							b.arrayExpression(this.modulesArray)
						)),
						b.expressionStatement(b.callExpression(b.identifier('require'), [b.literal(id)]))
					])
				);
			}
		}
	});

console.log(program.input);
var ast = recast.parse(fs.readFileSync(program.input, {encoding: 'utf-8'}));

console.log(' => ');
new Replacer(program.input).visit(ast);

fs.writeFileSync(program.output, recast.print(ast));
console.log(program.output);