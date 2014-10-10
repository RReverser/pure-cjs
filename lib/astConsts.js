var astUtils = require('./astUtils'),
	b = astUtils.builders,
	fs = require('fs');

exports.moduleArgs = [b.identifier('module'), b.identifier('exports')];
exports.require = b.identifier('_require');
exports.factoryArgs = [b.identifier('define')];
exports.localReqModules = b.memberExpression(exports.require, b.identifier('modules'), false);

exports.preamble = astUtils.parse(fs.readFileSync(__dirname + '/templates/preamble.js'), {
	loc: true,
	source: 'preamble.js',
	comment: true,
	attachComment: true
}).body;

var umdTmpl = astUtils.tmpl.compile(fs.readFileSync(__dirname + '/templates/umdWrapper.js', 'utf-8'), {
	loc: true,
	source: 'umdWrapper.js',
	comment: true,
	attachComment: true
});

exports.getUmdWrapper = function (deps) {
	return umdTmpl({b: b, deps: deps}).body[0].expression;
};