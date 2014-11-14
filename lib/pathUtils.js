var stdUtils = exports.std = require('path'),
	nodeResolve = require('resolve'),
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

exports.getNodePath = function (from, to, options) {
	var fromDir = from + '/..';

	if (localRegEx.test(to)) {
		return exports.forceExt(exports.normalizePath(stdUtils.resolve(fromDir, to)), options.defaultExt);
	} else {
		return exports.normalizePath(nodeResolve.sync(to, {
			basedir: stdUtils.resolve('', fromDir),
			extensions: (options.defaultExt !== 'js' ? ['.' + options.defaultExt] : []).concat(['.js']),
			moduleDirectory: options.moduleDir
		}));
	}
};

exports.ext = function (path) {
	return stdUtils.extname(path).slice(1).toLowerCase();
};