    var versionNumber = null;
    
    $(document).ready(function() {
        
        $("#version").change(function(ev) {
            if ($("#resultContent").is(":visible")) {
                $("#resultContent").addClass("hidden");
            }
            versionNumber = $(ev.target).val();        
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
            addListenersToEnterParamsButtons(sdkFunctions);
        });
        
        var parametersValueMap = {
            latest: {
                        addEventListener: {eventName: "Wix.Events.PAGE_NAVIGATION_CHANGE",
                                            callBack: "function(data){$(\"#resultContent\").html(\"<pre>\" + JSON.stringify(data, null, '  ') + \"</pre>\")};"
                                          },
                        getSiteInfo:      {onSuccess: "function(data){$(\"#resultContent\").html(\"<pre>\" + JSON.stringify(data, null, '  ') + \"</pre>\")};"}                    
                    }
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
                    '<button id="enterParamsTo' + func + '"' + 'class="btn pull-right">Enter parameters</button>' +
                    '<button id="run' + func + '"' + 'class="btn pull-right hidden">Run</button>'
                    '<div id="result" class="hidden"></div>' +
                '</div>' +
            '<hr/>'                        
            
            $("#functionsContainer").append(functionSection);
            if (!getFuncParameters(func)) { //or params are already saved
                $("#enterParamsTo" + func).addClass("hidden");
                $("#run" + func).removeClass("hidden");
            }
        }
        
        function addParameterToContainer(param) {
                  var parameterSection = '<hr/>' +
                '<div class="row-fluid">' +
                    '<div id="funcName" class="pull-left">' + param + '</div>' +
                    '<input id="valueOf' + param + '"' + 'class="pull-right"></input>' +                                     
                '</div>' +
            '<hr/>'
            
            $("#paramsContainer").append(parameterSection);
        }
        
        function addListenersToRunButtons(functions) {
                functions.forEach(function(func) {
                    $("#run"+func).click({funcName: func}, function(event) {
                        if (isScriptLoaded()) {
                            var funcName = event.data.funcName;
                            var parameters = getFuncParameters(funcName);
                            var parameterValues = [];
                            if (parameters) {
                                for (var i=0; i<parameters.length; i++) {
                                    if (true) {
                                        //get parameters from local storage
                                        var localStorageParams = localStorage.get('paramateres');
                                        parameterValues[i] = localStorageParams[versionNumber][funcName][parameters[i]];
                                    } else {                            
                                        //get default parameters
                                        if (parametersValueMap[funcName] && parametersValueMap[funcName][parameters[i]]) {
                                            parameterValues[i] = parametersValueMap[versionNumber][funcName][parameters[i]];
                                        }
                                    }
                                }
                            }
                            Wix[funcName].apply(Wix, parameterValues);                        
                        }
                    });
                    
                });
            }
            
        function addListenersToEnterParamsButtons(functions) {
            functions.forEach(function(func) {
                    $("#enterParamsTo"+func).click({funcName: func}, function(event) {
                            //Cancel the link behavior
                            event.preventDefault();
                            
                            //Get the screen height and width
                            var maskHeight = $(document).height();
                            var maskWidth = $(window).width();
                            
                            //Set height and width to mask to fill up the whole screen
                            $('#mask').css({'width':maskWidth,'height':maskHeight});
                            
                            //transition effect 
                            $('#mask').fadeIn(500); 
                            $('#mask').fadeTo("fast",0.4); 
                            
                            //Get the window height and width
                            var winH = $(window).height();
                            var winW = $(window).width();
                            
                            var id = "#dialog";
                            //Set the popup window to center
                            $(id).css('top', winH/2-$(id).height()/2);
                            $(id).css('left', winW/2-$(id).width()/2);
                            $(id).css('background-color', 'white');
                            
                            $('#popupTitle').text("Please enter " + func + " parameters");
                             var parameterList = getFuncParameters(func);
                                parameterList.forEach(function(param){
                                    addParameterToContainer(param);
                                });           
                            
                            
                            //transition effect
                            $(id).fadeIn(500); 
                            
                            });
                            
                            //if close button is clicked
                            $('.window .close').click(function (e) {
                            //Cancel the link behavior
                            event.preventDefault();
                            $('#mask, .window').hide();
                            }); 
                            
                            //if mask is clicked
                            $('#mask').click(function () {
                            $(this).hide();
                            $('.window').hide();
                        }); 
                    });                        
        }
    
        
        function addToLocalStorage(data){
            var oldData = localStorage.getItem('parameters');
            var oldDataJson = JSON.parse(oldData);
            var newDataJson = jQuery.extend(oldDataJson, data);        
            localStorage.setItem('parameters', JSON.stringify(newDataJson));
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