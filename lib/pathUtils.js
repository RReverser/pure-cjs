var stdUtils = exports.std = require('path'),
	nodeResolve = require('resolve'),
	cwd = process.cwd(),
	badPathSep = /\\/g,
	localRegEx = /^\.\.?\//;

exports.forceExt = function (path, ext) {
	return path + (stdUtils.extname(path) ? '' : '.' + (ext || 'js'));
};

exports.normalizePath = function (path) {
	return exports.relative('', path);
};

exports.relative = function (from, to) {
	return stdUtils.relative(from, to).replace(badPathSep, '/');
};

exports.getNodePath = function (from, to, defaultExt) {
	if (localRegEx.test(to)) {
		return exports.forceExt(exports.normalizePath(stdUtils.resolve(from + '/..', to)), defaultExt);
	} else {
		return exports.relative(cwd, nodeResolve.sync(to, {
			basedir: stdUtils.resolve(cwd, stdUtils.dirname(from))
		}));
	}
};