    
    function getPropertyArray(object, propertyArray) {
        var childArray = Object.getOwnPropertyNames(object);
        var childObjectArray = childArray.filter(function(property) {
            return typeof object[property] == 'object';
        });      
                                    
        if (childObjectArray.length == 0){                
            return propertyArray.concat(childArray.filter(function(property) {
                return (typeof object[property] == 'function') && (propertyArray.indexOf(property) == -1);
            }));
        }
        
        var chilsNonObjectArray = childArray.filter(function(property) {
            return typeof object[property] != 'object';
        });
        
        propertyArray = propertyArray.concat(chilsNonObjectArray.filter(function(property) {
                return typeof object[property] == 'function';
            }));
        
        for (var i=0; i<childObjectArray.length; i++) {
            propertyArray = getPropertyArray(object[childObjectArray[i]], propertyArray);                    
        }                       
                    
        return propertyArray;
    }

    
    function isScriptLoaded() {
       if (!window['Wix']) {
            $("#resultContent").text("Please choose API version first!");
            return false;
        }
        return true;
    }
    
    
    function areFuncParamsSavedInLS(funcName) {
        var data = JSON.parse(localStorage.getItem('parameters'));
        if (data && data[versionNumber]) {
            return !!data[versionNumber][funcName];
        }
        return false;            
    }
    
    function isFuncParamSavedInLS(funcName, param) {
        var data = JSON.parse(localStorage.getItem('parameters'));
        if (data && data[versionNumber] && data[versionNumber][funcName]) {
            return !!data[versionNumber][funcName][param];
        }
        return false; 
    }
        
        
    function createParameterValue(value) {            
        try {
            var evaluatedValue = (new Function('return '+ value +';'))();
        }
        catch(e){
            return value;
        }
        return evaluatedValue;
    }
    
    function getValueFromLocalStorage(funcName, param) {
        var data =  localStorage.getItem('parameters');
        var parsedData = JSON.parse(data);
        return parsedData[versionNumber] && parsedData[versionNumber][funcName] && parsedData[versionNumber][funcName][param];
    }
    
    function addToLocalStorage(data){
        var oldData = localStorage.getItem('parameters');
        var oldDataJson = JSON.parse(oldData);
        var newDataJson = jQuery.extend(true, oldDataJson, data);        
        localStorage.setItem('parameters', JSON.stringify(newDataJson));
    }
