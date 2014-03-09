var Promise = require('./promise'),
	Replacer = require('./replacer');

function ReplacerMap(options) {
	this.replacers = {};
	this.promises = [];
	this.transform = options.transform;
}

ReplacerMap.prototype.get = function (path) {
	if (path in this.replacers) {
		return this.replacers[path];
	}

	var id = this.promises.length++,
		replacer = this.replacers[path] = new Replacer({
			id: id,
			map: this,
			path: path
		});

	this.promises[id] = replacer.promise;

	return replacer;
};

ReplacerMap.prototype.whenAll = function (startIndex) {
	var currentLength = this.promises.length;

	return Promise.all(this.promises.slice(startIndex || 0)).then(function (firstPart) {
		if (this.promises.length > currentLength) {
			return this.whenAll(currentLength).then(function (secondPart) {
				return firstPart.concat(secondPart);
			});
		} else {
			return firstPart;
		}
	}.bind(this));
};

module.exports = ReplacerMap;