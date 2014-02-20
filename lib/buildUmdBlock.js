var recast = require('recast'),
  fs = require('fs');

module.exports = function (options) {
  var umdWrapperString,
      externalModules,
      externalModulesRequiresString,
      externalModulesString,
      externalModulesGlobalsString;

  umdWrapperString = fs.readFileSync(__dirname + '/templates/umdWrapper.js').toString();

  externalModules = options.externals;

  externalModulesGlobalsString = externalModules.map(function(key) {
    return options.link[key].name;
  }).join(', ');

  externalModulesRequiresString = externalModules.map(function(name) {
    return 'require(\'' + name + '\')';
  }).join(', ');

  externalModulesString = externalModules.map(function(name) {
    return '\'' + name + '\'';
  }).join(', ');

  umdWrapperString = umdWrapperString
    .replace('{{dependencyNames}}', externalModulesString)
    .replace('{{dependencyRequires}}', externalModulesRequiresString)
    .replace('{{dependencyGlobals}}', externalModulesGlobalsString);

  return recast.parse(umdWrapperString, {sourceFileName: 'umdWrapper.js'}).program.body[0].expression;
};