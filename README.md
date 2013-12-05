pure-cjs
========

Pure CommonJS Modules builder.

Features:

* Minimal destination overhead (almost as small as concatenated file).
* Ability to export `module.exports` from top module as single property / identifier (useful for building libs).
* Resolves all the paths on build stage to static number identifiers (so saves space and execution time used for storing and resolving string paths, but should be used only for projects with static `require('./some/module')` calls and would fail on others (same restriction applicable for [r.js (Simplified CommonJS wrapper)](http://requirejs.org/docs/whyamd.html#sugar) and most projects already match this).
* Does not corrupt `require('systemModule')` calls, transforms only local ones.

For AMD modules minimalistic builder, check out https://github.com/gfranko/amdclean.
