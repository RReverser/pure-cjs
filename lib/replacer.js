var fs = require('fs'),
	Promise = require('./promise'),
	es = require('event-stream'),
	pathUtils = require('./pathUtils'),
	isCoreModule = require('resolve').isCore,
	astUtils = require('./astUtils'),
	astConsts = require('./astConsts'),
	b = astUtils.builders,
	n = astUtils.namedTypes;

function Replacer(options) {
	this.id = options.id;
	this.map = options.map;
	this.path = options.path;

	var pipeline = this.map.transform.reduce(function (stream, transform) {
		return stream.pipe(transform(this.path));
	}, fs.createReadStream(this.path, {encoding: 'utf-8'}));

	var promise = new Promise();

	pipeline.pipe(es.wait(function (err, js) {
		err ? promise.reject(err) : promise.fulfill(js);
	}));

	this.promise = promise.then(function (js) {
		var ast = astUtils.parse(js, {loc: true, source: this.path});
		this.visit(ast);
		return b.functionExpression(null, astConsts.moduleArgs, b.blockStatement(ast.body));
	}.bind(this));
}

Replacer.prototype.getDependency = function (path) {
	return this.map.get(pathUtils.getNodePath(this.path, path));
};

Replacer.prototype.visit = function (ast) {
	return astUtils.traverse(ast, function (node) {
		if (n.CallExpression.check(node)) {
			var func = node.callee,
				arg = node.arguments[0];

			if (n.Identifier.check(func) && func.name === 'require' && n.Literal.check(arg) && !isCoreModule(arg.value)) {
				func.name = astConsts.require.name;
				arg.value = this.getDependency(arg.value).id;
			}
		}
	}.bind(this));
};

module.exports = Replacer;