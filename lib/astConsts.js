var estemplate = require('estemplate'),
	b = require('ast-types').builders,
	fs = require('fs');

exports.moduleArgs = [b.identifier('module'), b.identifier('exports')];

exports.tmpl = {};

['external', 'preamble', 'umdWrapper'].forEach(function (name) {
	var tmpl = estemplate.compile(fs.readFileSync(__dirname + '/templates/' + name + '.js', 'utf-8'), {
		comment: true,
		attachComment: true
	});

	exports.tmpl[name] = function (data) {
		data.b = b;
		return tmpl(data).body[0].expression;
	};
});