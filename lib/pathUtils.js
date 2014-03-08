var stdUtils = exports.std = require('path'),
	nodeResolve = require('resolve'),
	cwd = process.cwd(),
	badPathSep = /\\/g,
	localRegEx = /^\.\.?\//,
	jsExtRegExp = /(\.js)?$/;

exports.forceJsExt = function (path, ext) {
	return path.replace(jsExtRegExp, ext || '.js');
};

exports.normalizePath = function (path) {
	return exports.relative('', path);
};

exports.relative = function (from, to) {
	return stdUtils.relative(from, to).replace(badPathSep, '/');
};

exports.getNodePath = function (from, to) {
	if (localRegEx.test(to)) {
		return exports.forceJsExt(exports.normalizePath(stdUtils.resolve(from + '/..', to)));
	} else {
		return exports.relative(cwd, nodeResolve.sync(to, {
			basedir: stdUtils.resolve(cwd, stdUtils.dirname(from))
		}));
	}
};