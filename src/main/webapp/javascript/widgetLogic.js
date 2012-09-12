$(document).ready(function() {
    
    $("#version").change(function(ev) {
        if ($("#resultContent").is(":visible")) {
            $("#resultContent").addClass("hidden");
        }
        var versionNumber = $(ev.target).val();
        var scriptUrl;
        if (versionNumber == 'latest') {
            scriptUrl = "../../webapp/javascript/Wix.js";
        }
        else scriptUrl = "//sslstatic.wix.com/services/js-sdk/" + versionNumber +"/js/Wix.js";
        $.getScript(scriptUrl, function() {                     
            $("#changeVersion").removeClass("hidden");                    
            $("#versionText").text("SDK Version: " + versionNumber);
            $("#version").addClass("hidden");
            $("#resultContent").text("Script " + scriptUrl + " was loaded");
        });
                                    
    });
    
    $("#showFunctions").click(function() {
        var sdkFunctions = getAllMethods();
        sdkFunctions.forEach(function(func){
            addFunctionToContainer(func);
        });           
        addListenersToRunButtons(sdkFunctions);
    });
    
    var parametersValueMap = {
        addEventListener: {eventName: "Wix.Events.PAGE_NAVIGATION_CHANGE",
                            callBack: "function(data){$(\"#resultContent\").html(\"<pre>\" + JSON.stringify(data, null, '  ') + \"</pre>\")};"
                          },
        getSiteInfo:      {onSuccess: "function(data){$(\"#resultContent\").html(\"<pre>\" + JSON.stringify(data, null, '  ') + \"</pre>\")};"}    
    }
    
    function getAllMethods() {
    return Object.getOwnPropertyNames(Wix).filter(function(property) {
        return typeof Wix[property] == 'function';
    });
}

    function getFuncParameters(funcName) {    
        var func = Wix[funcName].toString();
        return func.slice(func.indexOf('(')+1, func.indexOf(')')).match(/([^\s,]+)/g);
    }
    
    function isScriptLoaded() {
       if (!window['Wix']) {
            $("#resultContent").text("Please choose API version first!");
            return false;
        }
        return true;
    }
    
    function addFunctionToContainer(func) {   
        var functionSection = '<hr/>' +
            '<div class="row-fluid">' +
                '<div id="funcName" class="pull-left">' + func + '</div>' +
                '<button id="run' + func + '"' + 'class="btn pull-right">Run</button>'
                '<div id="result" class="hidden"></div>' +
            '</div>' +
        '<hr/>'
        
        $("#functionsContainer").append(functionSection);
    }
    
    function addListenersToRunButtons(functions) {
            functions.forEach(function(func) {
                $("#run"+func).click({funcName: func}, function(event) {
                    if (isScriptLoaded()) {
                        var funcName = event.data.funcName;
                        var parameters = getFuncParameters(funcName);
                        var parameterValues = [];
                        for (var i=0; i<parameters.length; i++) {
                             parameterValues[i] = parametersValueMap[funcName][parameters[i]];
                        }
                        Wix[funcName].apply(Wix, parameterValues);                        
                    }
                });
                
            });
        }

    
    $("#runA").click(function() {
        
        if (isScriptLoaded()) {
            Wix.refreshApp();       
        }
    });
    
    $("#runB").click(function() {
        if(isScriptLoaded()) {
            Wix.openPopup("http://www.ynet.co.il", "fixed",
                      {top: 40, left: 40, bottom: 'auto', right: 'auto', width: 300, height: 500});
        }
    });
    
    $("#runC").click(function() {
        if (isScriptLoaded()) {
            Wix.getSiteInfo(function(data){
                $("#resultContent").html("<pre>" + JSON.stringify(data, null, '  ') + "</pre>");
            });
        }
    });
    
    
    $("#changeVersion").click(function() {   
         location.reload();
    });
    
    
});