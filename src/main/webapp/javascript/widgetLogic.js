function getAllMethods() {
    return Object.getOwnPropertyNames(Wix).filter(function(property) {
        return typeof Wix[property] == 'function';
    });
}

$("#run").click(function() {
    var sdkFunctions = getAllMethods();
    sdkFunctions.forEach(function(func){});
});