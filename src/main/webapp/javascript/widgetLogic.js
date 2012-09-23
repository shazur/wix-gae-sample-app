    var versionNumber = null;
    
    $(document).ready(function() {
        
        //Loading SDK version according to the user request
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
                $("#sdkScript").attr("src", this.url);
            });
                                        
        });
        
    
        $("#changeVersion").click(function() {   
             location.reload();
        });               
        
            
        //Display SDK functions (according to the version)
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
            return getPropertyArray(Wix, []).filter(function(property) {
                return typeof Wix[property] == 'function';
            });
        }
        
        function getPropertyArray(object, propertyArray) {
            var childArray = Object.getOwnPropertyNames(object);
            var childObjectArray = childArray.filter(function(property) {
                return typeof object[property] == 'object';
            });      
                                        
            if (childObjectArray.length == 0){
                return propertyArray.concat(childArray);
            }
            
            var chilsNonObjectArray = childArray.filter(function(property) {
                return typeof object[property] != 'object';
            });
            
            propertyArray = propertyArray.concat(chilsNonObjectArray);
            
            for (var i=0; i<childObjectArray.length; i++) {
                return getPropertyArray(object[childObjectArray[i]], propertyArray);                    
            }                       
        }
    
        function getFuncParameters(funcName) {    
            var func = Wix[funcName].toString();
            return getParameters(func);
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
                    '<button id="run' + func + '"' + 'class="btn pull-right hidden">Run</button>' +
                    '<button id="change' + func + '"' + 'class="btn pull-right hidden">Change</button>' +
                    '<div id="result" class="hidden"></div>' +
                '</div>' +
            '<hr/>'                        
            
            $("#functionsContainer").append(functionSection);
            //If the function doesn't have parameters or its parameters are already stored in the local storage, display run button only
            if (!getFuncParameters(func) || areFuncParamsSavedInLS(func)) {
                $("#enterParamsTo" + func).addClass("hidden");
                $("#run" + func).removeClass("hidden");
            }
        }
        
        function areFuncParamsSavedInLS(func) {
            var data = JSON.parse(localStorage.getItem('parameters'));
            if (data && data[versionNumber]) {
                return !!data[versionNumber][func];
            }
            return false;            
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
                            var parameterStringValues = [];
                            if (parameters) {
                                for (var i=0; i<parameters.length; i++) {
                                    if (true) {
                                        //get parameters from local storage
                                        var localStorageParams = JSON.parse(localStorage.getItem('parameters'));
                                        parameterStringValues[i] = localStorageParams[versionNumber][funcName][parameters[i]];
                                    } else {                            
                                        //get default parameters
                                        if (parametersValueMap[funcName] && parametersValueMap[funcName][parameters[i]]) {
                                            parameterStringValues[i] = parametersValueMap[versionNumber][funcName][parameters[i]];
                                        }
                                    }
                                }
                            }
                            //I should covert parameterValues to the correct type (currently all are strings)
                            var parameterValues = [];
                            parameterStringValues.forEach(function(value) {
                                parameterValues.push(createParameterValue(value));
                            });
                            var result = Wix[funcName].apply(Wix, parameterValues);                        
                            if (result) {
                                $("#resultContent").text(result.toString());
                            }
                        }
                    });
                    
                });
            }
            
        function createParameterValue(value) {            
            return (new Function('return '+ value +';'))();
        }
        
        function getParameters(func) {
            return func.slice(func.indexOf('(')+1, func.indexOf(')')).match(/([^\s,]+)/g);
        }
        
        function getFuncBody(func) {
            return func.substring(func.indexOf("{") + 1, func.lastIndexOf("}"));
        }
        
//        function addListenersToChangeButtons(functions) {
//            functions.forEach(function(func) {
//                $("#change" + func).click({funcName: func}, function(event) {
//                    openParametersPopupAndSaveToLS(event, func);
//                }
//            }
//        }
        
            
        function addListenersToEnterParamsButtons(functions) {
            functions.forEach(function(func) {
                    $("#enterParamsTo"+func).click({funcName: func}, function(event) {
//                        openParametersPopupAndSaveToLS(event, func);                                            
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
            
            $('#popupTitle').html("<b>"+func+"</b></br></br>Please enter parameter values");
               var parameterList = getFuncParameters(func);
               var data = {};
               data[versionNumber] = {};
               data[versionNumber][func] = {};
               parameterList.forEach(function(param){
                    addParameterToContainer(param);                                                                         
                    $("#valueOf" + param).change(function(event) {
                        var input = $(this).val();
                        if (typeof(input) == 'Object') {
                            input = JSON.parse(input);
                        }
                        data[versionNumber][func][param] = input;                                     
                    });
              
                });  
                
            $("#save").click(function() {
                addToLocalStorage(data);
                $("#run" + func).removeClass("hidden");
                $("#change" + func).removeClass("hidden");
                $("#enterParamsTo" + func).addClass("hidden");                                                                 
                $('#mask, .window').hide();
               $("#paramsContainer").children().remove();                                
            });
            
            
            
            //transition effect
            $(id).fadeIn(500); 
                        });
                            
                            //if close button is clicked
                            $('.window .close').click(function (e) {
                            //Cancel the link behavior
                            event.preventDefault();
                                $('#mask, .window').hide();
                                $("#paramsContainer").children().remove();
                            }); 
                            
                            //if mask is clicked
                            $('#mask').click(function () {
                                $(this).hide();
                                $('.window').hide();
                                $("#paramsContainer").children().remove();                                
                        }); 
                    });                        
        }
    
        
        function addToLocalStorage(data){
            var oldData = localStorage.getItem('parameters');
            var oldDataJson = JSON.parse(oldData);
            var newDataJson = jQuery.extend(true, oldDataJson, data);        
            localStorage.setItem('parameters', JSON.stringify(newDataJson));
        }
        
        
 
    });