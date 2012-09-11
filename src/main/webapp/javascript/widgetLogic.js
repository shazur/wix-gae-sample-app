function getAllMethods() {
    return Object.getOwnPropertyNames(Wix).filter(function(property) {
        return typeof Wix[property] == 'function';
    });
}

function isScriptLoaded() {
   if (!window['Wix']) {
        $("#resultContent").text("Please choose API version first!");
        return false;
    }
    return true;
}


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
    
    $("#runA").click(function() {
        //var sdkFunctions = getAllMethods();
        //sdkFunctions.forEach(function(func){});       
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