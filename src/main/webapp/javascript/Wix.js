var Wix = (function(){
    var _w = {
        /**
         * Constants
         */

        TPA_INTENT               : "TPA",
        firstAddEventListenerCall: true,

        MessageTypes: {
            CHANGE_APP_SIZE     : "changeAppSize",
            REFRESH_APP         : "refreshApp",
            APP_IS_ALIVE        : "appIsAlive",
            APP_STATE_CHANGED   : "appStateChanged",
            CLOSE_POPUP         : "closePopup",
            OPEN_POPUP          : "openPopup",
            SM_REQUEST_LOGIN    : "pingpong:smRequestLogin",
            SM_CURRENT_MEMBER   : "pingpong:smCurrentMember",
            SITE_INFO           : "pingpong:siteInfo",
            EVENT_LISTENER_ADDED: "pingpong:addEventListener",
            // Deprecated
            HEIGHT_CHANGED      : "heightChanged",
            APP_SETTINGS_CHANGED: "appSettingsChanged",
            APP_SETTINGS_CLOSE  : "appSettingsClose",
            APP_SHOW_POPUP      : "appShowPopup"
        },

        Events: {
            EDIT_MODE_CHANGE      : [],
            PAGE_NAVIGATION_CHANGE: []
        },

        //FULL_VIEWPORT: 'fullViewport',

        /**
         * Functions
         */

        sendMessageInternal: function(type, data){
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            if(target && typeof target != "undefined"){
                target.postMessage(JSON.stringify({
                    intent: _w.TPA_INTENT,
                    compId: window.Wix.compId,
                    type  : type,
                    data  : data
                }), "*");
            }
        },

        /** Function sendPingPongMessage
         *  sends a post message to TPAManager (viewer) with message type and invokes the callback
         * @param type - a property of MessageTypes
         * @param callback
         * @param runMultipleTimes - optional, if set to true the post message callback isn't removed
         */
        sendPingPongMessage: function(type, callback, runMultipleTimes){
            this.sendMessageInternal(type);

            var onMessageCallback = function(evt){
                var postMessageData = JSON.parse(evt.data);
                if(postMessageData.intent == _w.TPA_INTENT){
                    if(postMessageData.type == type && callback){
                        callback(postMessageData.data);
                        if(!runMultipleTimes){
                            this._removePostMessageCallback(onMessageCallback);
                        }
                    }
                }
            }.bind(this);

            this.addPostMessageCallback(onMessageCallback);
        },

        addPostMessageCallback: function(callback){
            if(window.addEventListener){
                window.addEventListener('message', callback, false);
            } else if(window.attachEvent){
                window.attachEvent('onmessage', callback);
            }
        },

        _removePostMessageCallback: function(callback){
            if(window.removeEventListener){
                window.removeEventListener('message', callback);
            } else if(window.detachEvent){
                window.detachEvent('onmessage', callback);
            }
        },

        getQueryParameter: function(parameterName){
            var queryString = location.search.substring(1);
            parameterName += "=";
            if(queryString.length > 0){
                var begin = queryString.indexOf(parameterName);
                if(begin != -1){
                    begin += parameterName.length;
                    var end = queryString.indexOf("&", begin);
                    if(end == -1){
                        end = queryString.length;
                    }
                    return unescape(queryString.substring(begin, end));
                }
            }
            return null;
        },

        receiver: function(event){
            var data = JSON.parse(event.data);
            if(data.intent === "addEventListener"){
                this.Events[data.eventType].forEach(
                    function(callback){
                        callback.apply(this, [data.params]);
                    }
                );
            }
        }
    };

    var compId = _w.getQueryParameter("compId");

    return {

        Events: {
            EDIT_MODE_CHANGE      : 'EDIT_MODE_CHANGE',
            PAGE_NAVIGATION_CHANGE: 'PAGE_NAVIGATION_CHANGE'
        },

        init: function(initObj){
            window.Wix.compId = _w.getQueryParameter("compId") || (initObj ? initObj.compId : "[UNKNOWN]");
            _w.sendMessageInternal(_w.MessageTypes.APP_IS_ALIVE); // Send isAlive message
        },

        reportHeightChange: function(height){
            _w.sendMessageInternal(_w.MessageTypes.HEIGHT_CHANGED, height);
        },

        pushState: function(state){
            _w.sendMessageInternal(_w.MessageTypes.APP_STATE_CHANGED, state);
        },

        refreshApp: function(queryParams){
            this.refreshAppByCompIds(null, queryParams);
        },

        refreshAppByCompIds: function(compIds, queryParams){
            _w.sendMessageInternal(_w.MessageTypes.APP_SETTINGS_CHANGED, {'queryParams': queryParams, 'compIds': compIds});
        },

        isAlive: function(){
            _w.sendMessageInternal(_w.MessageTypes.APP_IS_ALIVE);
        },

        closeSettings: function(){
            _w.sendMessageInternal(_w.MessageTypes.APP_SETTINGS_CLOSE);
        },

        requestLogin: function(onSuccess){
            _w.sendPingPongMessage(_w.MessageTypes.SM_REQUEST_LOGIN, onSuccess);
        },

        getSiteInfo: function(onSuccess){
            _w.sendPingPongMessage(_w.MessageTypes.SITE_INFO, onSuccess);
        },

        currentMember: function(onSuccess){
            _w.sendPingPongMessage(_w.MessageTypes.SM_CURRENT_MEMBER, onSuccess);
        },

        openPopup: function(url, type, coordinates){
            var args = {
                url        : url,
                type       : type,
                coordinates: coordinates
            };
            _w.sendMessageInternal(_w.MessageTypes.OPEN_POPUP, args);
        },

        changeAppSize: function(width, height){
            _w.sendMessageInternal(_w.MessageTypes.CHANGE_APP_SIZE, {width: width, height: height});
        },

        addEventListener: function(eventName, callBack){
            var callbacks = _w.Events[eventName] || [];
            callbacks.push(callBack);
            if(_w.firstAddEventListenerCall){
                _w.addPostMessageCallback(_w.receiver.bind(_w));
                _w.firstAddEventListenerCall = false;
            }
        }

    };
}());

if(window.wixInit){
    window.wixInit();
}
else {
    Wix.init();
}
