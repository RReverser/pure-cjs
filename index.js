var fs = require('fs'),
	recast = require('recast'),
	program = require('commander');

program
	.version(require('./package.json').version)
	.option('-i, --input <file>', 'Input file (required)')
	.option('-o, --output <file>', 'Output file (defaults to <input>.out.js)')
	.parse(process.argv);

if (!program.input) {
	program.help();
}

if (!program.output) {
	program.output = program.input.replace(/(\.js)?$/, '.out.js');
}

console.log(program.input);
var ast = recast.parse(fs.readFileSync(program.input, {encoding: 'utf-8'}));

console.log(' => ');

fs.writeFileSync(program.output, recast.print(ast));
console.log(program.output);