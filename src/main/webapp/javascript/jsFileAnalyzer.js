    
    function getAllMethods() {            
        return getPropertyArray(Wix, []);
    }
    

    function getFuncParameters(funcName) {    
        var func = getFunctionByName(funcName, Wix).toString();
        return getParameters(func);
    }
                
    function getParameters(func) {
        return func.slice(func.indexOf('(')+1, func.indexOf(')')).match(/([^\s,]+)/g);
    }
    
    function getFuncBody(func) {
        return func.substring(func.indexOf("{") + 1, func.lastIndexOf("}"));
    }
    

    //this function doesn't work now
    function getFunctionByName(funcName, namespace) {
                
        if (namespace[funcName]) {
            return namespace[funcName];
        }
        var namespaceArray = Object.getOwnPropertyNames(namespace).filter(function(property) {
            return typeof namespace[property] == 'object';
        });
        
        for (var i=0; i<namespaceArray.length; i++) {
            var func = getFunctionByName(funcName, namespace[namespaceArray[i]]);
            if (func) {
                return func;
            }
        }

    }   
