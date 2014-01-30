var url = require('url'),
	stdUtils = exports.std = require('path'),
	nodeResolve = require('resolve'),
	cwd = process.cwd(),
	badPathSep = /\\/g,
	localRegEx = /^\.\.?\//,
	jsExtRegExp = /(\.js)?$/;

exports.forceJsExt = function (path, ext) {
	return path.replace(jsExtRegExp, ext || '.js');
};

exports.normalizePath = function (path) {
	return url.resolve('', path.replace(badPathSep, '/'));
};

exports.relative = function (from, to) {
	return stdUtils.relative(from, to).replace(badPathSep, '/');
};

exports.getNodePath = function (from, to) {
	if (localRegEx.test(to)) {
		return exports.forceJsExt(url.resolve(from, to));
	} else {
		return exports.relative(cwd, nodeResolve.sync(to, {
			basedir: stdUtils.resolve(cwd, stdUtils.dirname(from))
		}));
	}
};