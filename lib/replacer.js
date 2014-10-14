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
	this.id = undefined;
	this.map = options.map;
	this.path = options.path;
	this.refs = [];

	if (options.externalId) {
		this.promise = Promise.resolve([b.returnStatement(options.externalId)]);
	} else {
		var pipeline = this.map.transform.reduce(function (stream, transform) {
			return stream.pipe(transform(options.path));
		}, fs.createReadStream(this.path, {encoding: 'utf-8'}));

		var defer = Promise.defer();

		pipeline.pipe(es.wait(function (err, js) {
			err ? defer.reject(err) : defer.fulfill(js);
		}));

		this.promise = defer.promise.then(function (js) {
			var ast = astUtils.parse(js, {
				loc: true,
				source: this.path,
				comment: options.comments,
				attachComment: options.comments
			});

			this.visit(ast);

			return ast.body;
		}.bind(this));
	}

	this.promise = this.promise.then(function (body) {
		return b.functionExpression(null, astConsts.moduleArgs, b.blockStatement(body));
	});
}

Replacer.prototype.getDependency = function (path) {
	return this.map.get(pathUtils.getNodePath(this.path, path, this.map));
};

Replacer.prototype.referenceFrom = function (ref) {
	this.refs.push(ref);
	return this;
};

Replacer.prototype.resolveAs = function (id) {
	this.id = id;

	this.refs.forEach(function (ref) {
		ref.value = this.id;
	}, this);

	return this;
};

Replacer.prototype.visit = function (ast) {
	return astUtils.traverse(ast, function (node) {
		if (n.CallExpression.check(node)) {
			var func = node.callee,
				arg = node.arguments[0];

			if (n.Identifier.check(func) && func.name === 'require' && n.Literal.check(arg) && !isCoreModule(arg.value)) {
				func.name = '_require';
				this.getDependency(arg.value).referenceFrom(arg);
			}
		}
	}.bind(this));
};

module.exports = Replacer;