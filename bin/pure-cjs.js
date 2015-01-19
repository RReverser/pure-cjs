#!/usr/bin/env node

var program = require('commander'),
	cjs = require(__dirname + '/../lib/');

program
	.version(require(__dirname + '/../package.json').version)
	.option('-i, --input <file>', 'input file (required)')
	.option('-o, --output <file>', 'output file (defaults to <input>.out.js)')
	.option('-x, --extension <ext>', 'default extension for requires (defaults to "js")')
	.option('-m, --map [file]', 'file to store source map to (optional)')
	.option('-c, --comments', 'preserve comments in output')
	.option('-e, --exports <id>', 'top module exports destination (optional)')
	.option('-d, --module-dir <dir>', 'top level location to search for external modules (optional)')
	.option('-s, --external [hash]', 'external modules (names or JSON hashes)', function (value, obj) {
		try {
			var add = JSON.parse(value);
			for (var name in add) {
				obj[name] = add[name];
			}
		} catch (e) {
			obj[value] = true;
		}
		return obj;
	}, {})
	.parse(process.argv);

if (!program.input) {
	program.help();
}

console.log('Building...');

cjs.transform(program).then(function (result) {
	console.log('Built to:', result.options.output);
}, function (error) {
	console.error(error.stack);
});
