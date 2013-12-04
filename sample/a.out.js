var $MODULES = [function() {
        var exports = {},
            module = {
                exports: exports
            }

        module.exports = $MODULES[1]() * 2;
        return module.exports;
    }, function() {
        var exports = {},
            module = {
                exports: exports
            }

        module.exports = $MODULES[2]().value * 7;
        return module.exports;
    }, function() {
        var exports = {},
            module = {
                exports: exports
            }

        exports.value = 3;
        return module.exports;
    }];

$MODULES[0]();