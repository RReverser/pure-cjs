var fs = require('fs'),
	assert = require('chai').assert,
	cjs = require('..'),
	Promise = require('../lib/promise'),
	whenReadFile = Promise.wrap(fs.readFile),
	suitesPath = 'suites/';

function assertEqualContents(content1, content2) {
	assert.equal(String(content1), String(content2));
}

process.chdir(__dirname);

fs.readdirSync(__dirname + '/' + suitesPath).forEach(function (suiteName) {
	it(suiteName, function () {
		var suitePath = suitesPath + suiteName + '/';

		var options = require('./' + suitePath + 'options');
		options.output = suitePath + 'expected.js';
		options.dryRun = true;

		return cjs.transform(options).then(function (output) {
			var promises = [
				whenReadFile(output.options.output, 'utf-8').then(function (contents) {
					assertEqualContents(
						output.code,
						contents.replace(/\s*\/\/#\s+sourceMappingURL=.*$/, '')
					);
				})
			];

			if (output.options.map) {
				promises.push(
					whenReadFile(output.options.map, 'utf-8').then(function (contents) {
						assertEqualContents(
							output.map,
							contents
						);
					})
				);
			} else {
				assert.notOk(output.map);
			}

			return Promise.all(promises);
		});
	});
});