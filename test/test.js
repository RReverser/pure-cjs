var fs = require('fs'),
	cjs = require('..'),
	Promise = require('davy'),
	whenReadFile = Promise.wrap(fs.readFile),
	suitesPath = 'suites/';

process.chdir(__dirname);

fs.readdirSync(__dirname + '/' + suitesPath).forEach(function (suiteName) {
	this[suiteName] = function (test) {
		var suitePath = suitesPath + suiteName + '/';

		var options = require('./' + suitePath + 'options');
		options.output = suitePath + 'expected.js';
		options.dryRun = true;
		
		cjs.transform(options).then(function (output) {
			var promises = [
				whenReadFile(output.options.output, 'utf-8').then(function (contents) {
					test.equal(output.code, contents);
				})
			];

			if (output.options.map) {
				promises.push(
					whenReadFile(output.options.map, 'utf-8').then(function (contents) {
						test.deepEqual(output.map, JSON.parse(contents));
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