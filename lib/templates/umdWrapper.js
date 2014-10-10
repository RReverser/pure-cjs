(function (name, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(<%= b.arrayExpression(deps.map(function (dep) {
            return b.literal(dep.amd);
        })) %>, factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = <%= b.callExpression(b.identifier('factory'), deps.map(function (dep) {
            return b.callExpression(b.identifier('require'), [b.literal(dep.name)]);
        })) %>;
    } else {
        // Browser globals (root is window)
        this[name] = <%= b.callExpression(b.identifier('factory'), deps.map(function (dep) {
            return b.memberExpression(b.thisExpression(), b.identifier(dep.global), false);
        })) %>;
  }
})