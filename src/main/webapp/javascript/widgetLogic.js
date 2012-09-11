function getAllMethods() {
    return Object.getOwnPropertyNames(Wix).filter(function(property) {
        return typeof Wix[property] == 'function';
    });
}

function isScriptLoaded() {
   if (!window['Wix']) {
        $("#result").text("Please choose API version first!");
        return false;
    }
    return true;
}


$(document).ready(function() {
    
    $("#version").change(function(ev) {
        if ($("#result").is(":visible")) {
            $("#result").addClass("hidden");
        }
        var versionNumber = $(ev.target).val();
        if (versionNumber == 'latest') {
            var scriptUrl = "../../webapp/javascript/Wix.js";
        }
        else scriptUrl = "//sslstatic.wix.com/services/js-sdk/" + versionNumber +"/js/Wix.js";
        $.getScript(scriptUrl, function() {                     
            $("#changeVersion").removeClass("hidden");                    
            $("#versionText").text("API Version: " + versionNumber);
            $("#version").addClass("hidden");
            $("#result").text("Script " + scriptUrl + " was loaded");
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
                var parsedData = JSON.parse(data);
                $("#result").text(JSON.stringify(parsedData, null, '\t'))});
        }
    });
    
    
    $("#changeVersion").click(function() {   
         location.reload();
    });
    
    
});