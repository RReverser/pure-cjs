var recast = require('recast'),
	fs = require('fs'),
	b = recast.types.builders;

exports.moduleArgs = [b.identifier('module'), b.identifier('exports')];
exports.require = b.identifier('_require');
exports.factoryArgs = [b.identifier('define')];
exports.localReqModules = b.memberExpression(exports.require, b.identifier('modules'), false);

exports.preamble = recast.parse(fs.readFileSync(__dirname + '/templates/preamble.js'), {sourceFileName: 'preamble.js'}).program.body;
exports.umdWrapper = recast.parse(fs.readFileSync(__dirname + '/templates/umdWrapper.js'), {sourceFileName: 'umdWrapper.js'}).program.body[0].expression;