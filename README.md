pure-cjs
========

Pure CommonJS Modules builder.

Features
--------

* Minimal destination overhead (almost as small as concatenated file).
* Ability to export `module.exports` from top module as single property / identifier (useful for building libs).
* Resolves all the paths on build stage to static number identifiers (so saves space and execution time used for storing and resolving string paths, but should be used only for projects with static `require('./some/module')` calls and would fail on others (same restriction applicable for [r.js (Simplified CommonJS wrapper)](http://requirejs.org/docs/whyamd.html#sugar) and most projects already match this).
* Does not corrupt `require('systemModule')` calls, transforms only local ones.

Console usage
-------------

Installation:
`npm install -g pure-cjs`

Command-line options:
```
-h, --help           output usage information
-V, --version        output the version number
-i, --input <file>   input file (required)
-o, --output <file>  output file (defaults to <input>.out.js)
-e, --exports <id>   top module exports destination (optional)
```

Usage from Node.js
------------------

```javascript
var cjs = require('pure-cjs');

cjs.transform({
	input: 'superLib/topModule.js' /* String|Function(): input file */,
	output: function (input) { return input.replace(/(\.js)?$/, '.out.js') } /* [?] String|Function(input): output file */,
	exports: 'window.SuperLib' /* [?] String|Function(input, output): Object to wrap and put exports from top module into */
});
```

Usage from Grunt
----------------

Check out [grunt-pure-cjs](https://github.com/RReverser/grunt-pure-cjs) to use builder as [Grunt](https://gruntjs.com/) plugin.
