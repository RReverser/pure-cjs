var Promise = require('./promise'),
	Replacer = require('./replacer'),
	pathUtils = require('./pathUtils');

function ReplacerMap(options) {
	this.replacers = {};
	this.promises = [];
	this.getFileAST = options.getFileAST;
	this.comments = options.comments;
	this.defaultExt = options.defaultExt;
	this.moduleDir = options.moduleDir;
	this.depsMap = options.deps.reduce(function (obj, dep) {
		obj[pathUtils.getNodePath('_', dep.name, this)] = dep;
		return obj;
	}.bind(this), {});
}

ReplacerMap.prototype.get = function (path) {
	if (path in this.replacers) {
		return this.replacers[path];
	}

	var id = this.promises.length++,
		replacer = this.replacers[path] = new Replacer({
			map: this,
			path: path,
			comments: this.comments,
			externalId: (this.depsMap[path] || {}).id
		});

	this.promises[id] = replacer.promise;

	return replacer;
};

ReplacerMap.prototype.whenAll = function (startIndex) {
	var map = this, currentLength = this.promises.length;

	return (
		Promise.all(this.promises.slice(startIndex || 0))
		.then(function () {
			if (map.promises.length > currentLength) {
				return map.whenAll(currentLength);
			}
		})
		.then(function () {
			return Promise.all(Object.keys(map.replacers).sort().map(function (path, id) {
				return this[path].resolveAs(id).promise;
			}, map.replacers));
		})
	);
};

module.exports = ReplacerMap;