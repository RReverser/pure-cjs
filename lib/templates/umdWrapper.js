<%
var undef = b.identifier('undefined');
%>
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([%= deps.map(function (dep) {
            return b.literal(dep.amd || '');
        }) %], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(%= deps.map(function (dep) {
            return dep.name ? b.callExpression(b.identifier('require'), [b.literal(dep.name)]) : undef;
        }) %);
    } else {
        // Browser globals
        this[<%= b.literal(exports) %>] = factory(%= deps.map(function (dep) {
            return dep.global ? b.identifier(dep.global) : undef;
        }) %);
  }
})