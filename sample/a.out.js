var $MODULES = [function() {
        module.exports = $MODULES[1]() * 2;
    }, function() {
        module.exports = $MODULES[2]().value * 7;
    }, function() {
        exports.value = 3;
    }];