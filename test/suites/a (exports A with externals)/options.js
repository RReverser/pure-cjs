module.exports = {
	input: 'fixtures/a.js',
	exports: 'A',
	map: true,
	comments: true,
	external: {
		davy: true,
		url: {
			amd: false,
			global: false
		}
	}
};