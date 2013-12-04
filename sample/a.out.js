var $MODULES = [function() {
        var exports = {},
            module = {
                exports: exports
            }

        $MODULES[0] = function() {
            return module.exports;
        };

        module.exports = $MODULES[1]() * 2;
        return module.exports;
    }, function() {
        var exports = {},
            module = {
                exports: exports
            }

        $MODULES[1] = function() {
            return module.exports;
        };

        module.exports = $MODULES[2]().value * 7;
        return module.exports;
    }, function() {
        var exports = {},
            module = {
                exports: exports
            }

        $MODULES[2] = function() {
            return module.exports;
        };

        exports.value = 3;
        return module.exports;
    }];

$MODULES[0]();