var Promise = require('./promise'),
	fs = require('fs'),
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
	
	// if this.path does not exists, chech to see if it is a folder,
	// and then check if path/index.js exists. If it exists, load it
	if ( !fs.existsSync(this.path)  ) {
		var newName = this.path.replace(/\.js$/,'/index.js');
		if (fs.existsSync(newName)){
			this.path = newName;
		}
	}

	if (options.externalId) {
		this.promise = Promise.resolve([b.expressionStatement(astConsts.tmpl.external(options))]);
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