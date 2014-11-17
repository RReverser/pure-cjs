module.exports = {
	input: 'fixtures/a.js',
	exports: 'A',
	map: true,
	comments: true,
	external: {
		url: {
			amd: false,
			global: false
		}
	}
};