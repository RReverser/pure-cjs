var recast = require('recast'),
	fs = require('fs'),
	b = recast.types.builders;

exports.moduleArgs = [b.identifier('module'), b.identifier('exports')];
exports.require = b.identifier('_require');
exports.localReqModules = b.memberExpression(exports.require, b.identifier('modules'), false);

exports.preamble = recast.parse(fs.readFileSync(__dirname + '/templates/preamble.js'), {sourceFileName: 'preamble.js'}).program.body;
exports.extPreamble = recast.parse(fs.readFileSync(__dirname + '/templates/extPreamble.js'), {sourceFileName: 'extPreamble.js'}).program.body;