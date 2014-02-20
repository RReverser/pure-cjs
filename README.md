# pure-cjs

Pure CommonJS Modules builder.

## Features

* Minimal destination overhead (almost as small as concatenated file).
* Resolves all the paths on build stage to static number identifiers (so saves space and execution time used for storing and resolving string paths, but should be used only for projects with static `require('./some/module')` calls and would fail on others (same restriction applicable for [r.js (Simplified CommonJS wrapper)](http://requirejs.org/docs/whyamd.html#sugar) and most projects already match this).
* Ability to export `module.exports` from top module in [UMD](https://github.com/umdjs/umd) style (useful for building libs).
* Allows to use [through](https://github.com/dominictarr/through)-stream(s) for pre-transformations.
* Supports modules installed as `npm` dependencies in `node_modules` hierarchy.
* Does not corrupt `require('systemModule')` calls, transforms only local ones.
* Ability to exclude required UMD modules from the output. The excluded modules will be added as requirements to the UMD block.

## Console usage

Installation:
`npm install -g pure-cjs`

Command-line options:
```
-h, --help           output usage information
-V, --version        output the version number
-i, --input <file>   input file (required)
-o, --output <file>  output file (defaults to <input>.out.js)
-m, --map <file>     file to store source map to (optional, defaults to <output>.map)
-e, --exports <id>   top module exports destination (optional)
```

## Usage from Node.js

```javascript
var cjs = require('pure-cjs');

cjs.transform(options).then(function (result) {
    // handle successful result
}, function (err) {
	// handle error
});
```

### Options object

* **input**: `String|Function()` &mdash; input file; example: `'superLib/topModule.js'`.
* **output**: `String|Function(input)` &mdash; output file; optional, defaults to: `function (input) { return input.replace(/(\.js)?$/, '.out.js') }`.
* **map**: `String|Function(input, output)|Boolean` &mdash; source map file; optional, doesn't generate source map by default; if `true` is provided, path default to `function (input, output) { return output + '.map' }`.
* **exports**: `String|Function(input, output)` &mdash; Exports top module with [UMD](https://github.com/umdjs/umd) with given global object name; optional, doesn't wrap into UMD by default.
* **transform**: `Array|Function(input)` &mdash; Array of or single function that returns transformation [through](https://github.com/dominictarr/through)-stream(s) to be used against input files before their usage; optional.
* **dryRun**: `Boolean` &mdash; if set to `true`, doesn't write output to disk.
* **link**: `Object` &mdash; Link module names. Currently only supports excluding modules from the build, but other kind of module links are planned for the future.
    - **[moduleName]**:
        + **source**: `String` &mdash; How to link the object. Currently only 'external' is supported.
        + **name**: `String` &mdash; The module name to link to. If **source** is 'external' then this value points to the name of the global variable that the given UMD module exports in the absence of a module system like CommonJS or AMD.

### Result object

* **code**: `String` &mdash; generated source code.
* **map**: `Object` &mdash; source map object.
* **options**: `Object` &mdash; options object with resolved defaults and paths.

## Usage from Grunt

Check out [grunt-pure-cjs](https://github.com/RReverser/grunt-pure-cjs) to use builder as [Grunt](https://gruntjs.com/) plugin.
