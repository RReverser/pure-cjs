var fs = require('fs'),
	cjs = require('..'),
	Promise = require('../lib/promise'),
	whenReadFile = Promise.wrap(fs.readFile),
	suitesPath = 'suites/';

process.chdir(__dirname);

fs.readdirSync(__dirname + '/' + suitesPath).forEach(function (suiteName) {
	this[suiteName] = function (test) {
		var suitePath = suitesPath + suiteName + '/';

		var options = require('./' + suitePath + 'options');
		options.output = suitePath + 'expected.js';
		options.dryRun = true;

		console.time('Execution time');
		
		cjs.transform(options).then(function (output) {
			console.timeEnd('Execution time');

			var promises = [
				whenReadFile(output.options.output, 'utf-8').then(function (contents) {
					test.equal(output.code, contents.replace(/\s*\/\/#\s+sourceMappingURL=.*$/, ''));
				})
			];

			if (output.options.map) {
				promises.push(
					whenReadFile(output.options.map, 'utf-8').then(function (contents) {
						test.equal(output.map.toString(), contents);
					})
				);
			} else {
				test.ok(!output.map);
			}

			return Promise.all(promises);
		}).then(function () {
			test.done();
		}, function (err) {
			test.ifError(err);
			test.done();
		});
	};
}, exports);