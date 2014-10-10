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
```bash
npm install -g pure-cjs
```

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
-s, --external [hash]  external modules (names or JSON hashes)
```

Example:
```bash
pure-cjs \
    --input src/index.js \
    --output dist/index.js \
    --map \
    --exports SuperLib \
    --external lodash \
    --external '{"jquery": {"global": "$", "amd": "../vendor/jquery.js"}}'
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

* `input`: `String` | `Function()`. <br />
  Input file.<br />
  Example: `'superLib/topModule.js'`

* `output`: `String` | `Function(input)`<br />
  Output file.<br />
  Default: `input => input.replace(/(\.js)?$/, '.out.js')`

* `map`: `Boolean` | `String` | `Function(input, output)`<br />
  Source map.<br />
  Default: `false` (don't generate source map).

* `comments`: `Boolean`<br />
  Preserve comments in output.<br />
  Default: `false`

* `external`: `{ cjsName: (true | { amd?: String, global?: String }) }`<br />
  External dependencies (to be excluded from bundling). Example:
  ```javascript
  {
    jquery: true,
    lodash: {amd: '../vendor/lodash.js', global: '_'}
  }
  ```

* `exports`: `String` | `Function(input, output)`<br />
  Export top module with [UMD](https://github.com/umdjs/umd) with given global object name.<br />
  Default: no exports.

* `transform`: `Array` | `Function(input)`<br />
  Browserify plugins ([through](https://github.com/dominictarr/through)-stream(s) to be used against input files).

* `moduleDir`: `String`<br />
  Modules directory name.<br />
  Default: `"node_modules"`

* `defaultExt`: `String`<br />
  Default extension for require calls (`"js"`).

* `dryRun`: `Boolean`<br />
  Don't write output to disk (and don't append `//# sourceMappingURL=...` to code).<br />
  Default: `false`

### Result object

* **code**: `String` &mdash; generated source code.
* **map**: `Object` &mdash; source map object.
* **options**: `Object` &mdash; options object with resolved defaults and paths.

## Usage from Grunt

Check out [grunt-pure-cjs](https://github.com/RReverser/grunt-pure-cjs) to use builder as [Grunt](https://gruntjs.com/) plugin.

## Usage from Gulp

Check out [gulp-pure-cjs](https://github.com/parroit/gulp-pure-cjs) to use builder as [Gulp](http://gulpjs.com/) plugin.
