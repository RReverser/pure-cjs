var fs = require('fs'),
	assert = require('chai').assert,
	cjs = require('..'),
	Promise = require('../lib/promise'),
	whenReadFile = Promise.wrap(fs.readFile),
	suitesPath = 'suites/',
	SourceMapConsumer = require('source-map').SourceMapConsumer;

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
						var expectedMap = new SourceMapConsumer(contents);
						var actualMap = new SourceMapConsumer(contents);
						expectedMap.eachMapping(function (mapping) {
							var actualPos = actualMap.originalPositionFor({
								line: mapping.generatedLine,
								column: mapping.generatedColumn
							});
							var expectedPos = {
								source: mapping.source,
								line: mapping.originalLine,
								column: mapping.originalColumn,
								name: mapping.name
							};
							for (var prop in expectedPos) {
								if (expectedPos[prop] === undefined) {
									expectedPos[prop] = null;
								}
							}
							assert.deepEqual(actualPos, expectedPos);
						});
					})
				);
			} else {
				assert.notOk(output.map);
			}

			return Promise.all(promises);
		});
	});
});