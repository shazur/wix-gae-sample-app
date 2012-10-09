    var versionNumber = null;
    
    $(document).ready(function() {
        
        //Loading SDK version according to the user request
        $("#version").change(function(ev) {
            $("#chooseVersion").click(ev, function(event) {
                if ($("#resultContent").is(":visible")) {
                    $("#resultContent").addClass("hidden");
                }
                versionNumber = $(event.data.originalEvent.target).val();
                var scriptUrl;
                if (versionNumber == 'latest') {
                    scriptUrl = "../../webapp/javascript/Wix.js";
                }
                else scriptUrl = "//sslstatic.wix.com/services/js-sdk/" + versionNumber +"/js/Wix.js";
                var wasScriptLoaded = false;
                $.getScript(scriptUrl, function() {                     
                    wasScriptLoaded = true;
                    $("#changeVersion").removeClass("hidden");                    
                    $("#chooseVersion").addClass("hidden");
                    $("#versionText").text("SDK Version: " + versionNumber);
                    $("#version").addClass("hidden");
                    $("#resultContent").text("Script " + scriptUrl + " was loaded");
                    $("#sdkScript").attr("src", this.url);
                    displayFunctions();
                })
                if (!wasScriptLoaded) {
                    $("#resultContent").text(scriptUrl + " does not exist");
                }
                    
            });            
                                            
        });
        
        
    
        $("#changeVersion").click(function() {   
             location.reload();
        });               
        
            
        function displayFunctions(){
            var sdkFunctions = getAllMethods();
            sdkFunctions.forEach(function(func){
                addFunctionToContainer(func);
            });
            
            addListenersToEnterParamsButtons(sdkFunctions);
            addListenersToRunButtons(sdkFunctions);
            addListenersToChangeButtons(sdkFunctions);
        };
              
        
        function addFunctionToContainer(func) {   
            var functionSection = 
                '<div class="row-fluid">' +
                    '<a id="help' + func + '"' + 'href="http://dev.wix.com/display/wixdevelopersapi/JavaScript+SDK#JavaScriptSDK-' + func + '"' + 'target="_blank" style="color:#08C; margin-right:13px" class=pull-left><b>?</b></a>' +
                    '<h4 id="funcName" class="pull-left">' + func + '</h4>' +
                    '<a id="enterParamsTo' + func + '"' + 'class="pull-right" href="">Enter parameters</a>' +
                    '<button id="run' + func + '"' + 'class="btn pull-right hidden">Run</button>' +
                    '<a id="change' + func + '"' + 'class="pull-right hidden" style="margin-right:10px" href="">Change parameters</a>' +
                    '<div id="result" class="hidden"></div>' +
                '</div>' +
            '<hr size="10">'                        
            
            $("#functionsContainer").append(functionSection);
            //If the function doesn't have parameters or its parameters are already stored in the local storage, display run button only
            var hasParameters = getFuncParameters(func);
            if (!hasParameters || areFuncParamsSavedInLS(func)) {
                $("#enterParamsTo" + func).addClass("hidden");
                $("#run" + func).removeClass("hidden");
                if (hasParameters) {
                    $("#change" + func).removeClass("hidden");
                }
            }
            else {
                $("#enterParamsTo" + func).removeClass("hidden");
                $("#run" + func).addClass("hidden");
                $("#change" + func).addClass("hidden");                
            }
        }
        
              
        function addParameterToContainer(param, paramValue) {
                  var parameterSection = '<div class="row-fluid">' +
                    '<div id="funcName" class="pull-left">' + param + '</div>' +
                    '<input id="valueOf' + param + '"' + 'class="pull-right"></input>' +                                     
                    '<a id="lSValue' + param + '"' + 'class="pull-right hidden">' + paramValue + '</a>' +
                '</div></br>'            
            
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
                                    if (areFuncParamsSavedInLS(funcName)) {
                                        //get parameters from local storage
                                        var localStorageParams = JSON.parse(localStorage.getItem('parameters'));
                                        parameterStringValues[i] = localStorageParams[versionNumber][funcName][parameters[i]];
                                    } 
                                }
                            }
                        
                            //I should covert parameterValues to the correct type (currently all are strings)
                            var parameterValues = [];
                            parameterStringValues.forEach(function(value) {
                                parameterValues.push(createParameterValue(value));
                            });
                            var result = getFunctionByName(funcName, Wix).apply(Wix, parameterValues);                        
                            if (result) {
                                $("#resultContent").text(result.toString());
                            } else {
                                $("#resultContent").text('');
                            }
                            
                        }
                    });
                    
                });
            }
                 
        
        function addListenersToChangeButtons(functions) {
            functions.forEach(function(func) {
                $("#change" + func).click({funcName: func}, function(event) {
                    openParametersPopupAndSaveToLS(event, func);
                });
            });
        }
        
        function openParametersPopupAndSaveToLS(event, func) {
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
                   
                    if (parameterList) {
                       parameterList.forEach(function(param){
                           var parameterValue = getValueFromLocalStorage(func, param);
                           addParameterToContainer(param, parameterValue);
                           if (isFuncParamSavedInLS(func, param)) {
                                $("#valueOf" + param).addClass("hidden");
                                $("#lSValue" + param).removeClass("hidden");                                                               
                           } else {
                                $("#valueOf" + param).removeClass("hidden");
                                $("#lSValue" + param).addClass("hidden");  
                           }                            
                            $("#valueOf" + param).change(function(event) {
                                var input = $(this).val();
                                if (typeof(input) == 'Object') {
                                    input = JSON.parse(input);
                                }
                                data[versionNumber][func][param] = input;                                     
                            });
                            
                            $("#lSValue" + param).click(function() {
                                 $("#valueOf" + param).removeClass("hidden");
                                $("#lSValue" + param).addClass("hidden");                          
                            });
                      
                        });  
                    }
                        
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
        }
        
            
        function addListenersToEnterParamsButtons(functions) {
            functions.forEach(function(func) {
                    $("#enterParamsTo"+func).click({funcName: func}, function(event) {
                        openParametersPopupAndSaveToLS(event, func);                                                             
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
                     
    });