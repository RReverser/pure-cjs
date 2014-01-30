var recast = require('recast'),
	fs = require('fs'),
	Promise = require('davy'),
	es = require('event-stream'),
	astConsts = require('./astConsts'),
	pathUtils = require('./pathUtils'),
	isCoreModule = require('resolve').isCore,
	
	types = recast.types,
	b = types.builders,
	n = types.namedTypes;

module.exports = recast.Visitor.extend({
	init: function (options) {
		this.id = options.id;
		this.map = options.map;
		this.path = options.path;

		var pipeline = [fs.createReadStream(this.path, {encoding: 'utf-8'})];
		
		this.map.transform.forEach(function (transform) {
			pipeline.push(transform(this.path));
		}, this);

		var promise = new Promise();
		pipeline.push(es.wait(function (err, js) {
			err ? promise.reject(err) : promise.fulfill(js);
		}));

		this.promise = promise.then(function (js) {
			var ast = recast.parse(js, {sourceFileName: this.path}).program;
			this.visit(ast);
			return b.functionExpression(null, astConsts.moduleArgs, b.blockStatement(ast.body));
		}.bind(this));

		es.pipeline.apply(es, pipeline);
	},

	getDependency: function (path) {
		return this.map.get(pathUtils.getNodePath(this.path, path));
	},

	visitCallExpression: function (node) {
		var func = node.callee,
			arg = node.arguments[0];

		if (n.Identifier.check(func) && func.name === 'require' && n.Literal.check(arg) && !isCoreModule(arg.value)) {
			func.name = astConsts.require.name;
			arg.value = this.getDependency(arg.value).id;
		}

		this.genericVisit(node);
	}
});