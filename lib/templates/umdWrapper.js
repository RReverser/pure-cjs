(function (name, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([{{dependencyNames}}], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory({{dependencyRequires}});
    } else {
        // Browser globals (root is window)
        this[name] = factory({{dependencyGlobals}});
  }
})