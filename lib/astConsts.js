var astUtils = require('./astUtils'),
	b = astUtils.builders,
	fs = require('fs');

exports.moduleArgs = [b.identifier('module'), b.identifier('exports')];

var funcTmpl = astUtils.tmpl.compile(fs.readFileSync(__dirname + '/templates/preamble.js', 'utf-8'), {
	loc: true,
	source: 'preamble.js',
	comment: true,
	attachComment: true
});

exports.getFuncExpr = function (data) {
	data.b = b;
	return funcTmpl(data).body[0].expression;
};

var umdTmpl = astUtils.tmpl.compile(fs.readFileSync(__dirname + '/templates/umdWrapper.js', 'utf-8'), {
	loc: true,
	source: 'umdWrapper.js',
	comment: true,
	attachComment: true
});

exports.getUmdWrapper = function (deps) {
	return umdTmpl({b: b, deps: deps}).body[0].expression;
};