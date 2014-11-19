var Promise = require('./promise'),
	pathUtils = require('./pathUtils'),
	astTypes = require('ast-types'),
	astConsts = require('./astConsts'),
	b = astTypes.builders,
	n = astTypes.namedTypes;

function Replacer(options) {
	this.id = undefined;
	this.map = options.map;
	this.path = options.path;
	this.refs = [];

	if (options.externalId) {
		// global external dependency should be assigned
		// to module.exports.
		// maybe this not work for amd?
		this.promise = Promise.resolve(
			[
			b.expressionStatement(
				b.assignmentExpression(
					'=',
					b.memberExpression(
						b.identifier('module'),
						b.identifier('exports'),
						false 
					),
					options.externalId
			))]);
	} else {
		this.promise = this.map.getFileAST({
			source: this.path,
			loc: true,
			comment: options.comments,
			attachComment: options.comments
		}).then(function (ast) {
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
	var replacer = this;
	
	return astTypes.visit(ast, {
		visitCallExpression: function (path) {
			var node = path.node,
			    func = node.callee,
				arg = node.arguments[0];

			if (n.Identifier.check(func) && func.name === 'require' && n.Literal.check(arg)) {
				func.name = '_require';
				replacer.getDependency(arg.value).referenceFrom(arg);
			}

			this.traverse(path);
		}
	});
};

module.exports = Replacer;