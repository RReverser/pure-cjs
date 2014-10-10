# pure-cjs

Pure CommonJS Modules builder.

## Features

* Minimal destination overhead (almost as small as concatenated file).
* Resolves all the paths on build stage to static number identifiers (so saves space and execution time used for storing and resolving string paths, but should be used only for projects with static `require('./some/module')` calls and would fail on others (same restriction applicable for [r.js (Simplified CommonJS wrapper)](http://requirejs.org/docs/whyamd.html#sugar) and most projects already match this).
* Ability to export `module.exports` from top module in [UMD](https://github.com/umdjs/umd) style (useful for building libs).
* Allows to use [through](https://github.com/dominictarr/through)-stream(s) for pre-transformations.
* Supports modules installed as `npm` dependencies in `node_modules` hierarchy.
* Does not corrupt `require('systemModule')` calls, transforms only local ones.

## Console usage

Installation:
`npm install -g pure-cjs`

Command-line options:
```
-h, --help             output usage information
-V, --version          output the version number
-i, --input <file>     input file (required)
-o, --output <file>    output file (defaults to <input>.out.js)
-m, --map <file>       file to store source map to (optional, defaults to <output>.map)
-c, --comments         preserve comments in output
-e, --exports <id>     top module exports destination (optional)
-x, --extension <ext>  default extension for requires (defaults to "js")
-d, --module-dir <dir> modules directory name to look in (defaults to "node_modules")
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

Name | Type | Description | Default
---- | ---- | ----------- | -------
input | `String` / `Function()` | Input file; example: `'superLib/topModule.js'` | **(required)**
output | `String` / `Function(input)` | Output file | `input => input.replace(/(\.js)?$/, '.out.js')`
map | `String` / `Function(input,output)` / `Boolean` | Source map | if true: `(input, output) => output + '.map'`.
comments | `Boolean` | Preserve comments in output | `false`
exports | `String` / `Function(input,output)` | Export top module with [UMD](https://github.com/umdjs/umd) with given global object name | `false`
transform | `Array` / `Function(input)` | Transformation [through](https://github.com/dominictarr/through)-stream(s) to be used against input files | `[]`
defaultExt | `String` | Default extension for requires | `"js"`
moduleDir | `String` | Modules directory name | `"node_modules"`
dryRun | `Boolean` | Don't write output to disk (and don't append `//# sourceMappingURL=...` to code) | `false`
external | `{ [CommonJS name]: (true / { amd?: String, global?: String }) }` | External dependencies (to be excluded from bundling). Each value can be either `true` (for same name across module systems) or hash with specific names;<br />example: `{jquery: true, lodash: {amd: '../vendor/lodash.js', global: '_'}}` | `{}`

### Result object

* **code**: `String` &mdash; generated source code.
* **map**: `Object` &mdash; source map object.
* **options**: `Object` &mdash; options object with resolved defaults and paths.

## Usage from Grunt

Check out [grunt-pure-cjs](https://github.com/RReverser/grunt-pure-cjs) to use builder as [Grunt](https://gruntjs.com/) plugin.

## Usage from Gulp

Check out [gulp-pure-cjs](https://github.com/parroit/gulp-pure-cjs) to use builder as [Gulp](http://gulpjs.com/) plugin.
