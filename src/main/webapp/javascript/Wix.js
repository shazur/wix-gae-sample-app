(function (container) {
    var _w = {
        /**
         * Constants
         */
        version: "__VERSION_NUMBER__",

        TPA_INTENT:"TPA",
        firstAddEventListenerCall:true,

        MessageTypes:{
            CHANGE_APP_SIZE:"changeWindowSize",
            REFRESH_APP:"refreshApp",
            APP_IS_ALIVE:"appIsAlive",
            APP_STATE_CHANGED:"appStateChanged",
            CLOSE_POPUP:"closePopup",
            OPEN_POPUP:"openPopup",
            OPEN_MODAL:"openModal",
            OPEN_FULLSCREEN:"openFullscreen",
            SM_REQUEST_LOGIN:"pingpong:smRequestLogin",
            SM_CURRENT_MEMBER:"pingpong:smCurrentMember",
            SITE_INFO:"pingpong:siteInfo",
            EVENT_LISTENER_ADDED:"pingpong:addEventListener",
            // Deprecated
            HEIGHT_CHANGED:"heightChanged",
            APP_SETTINGS_CHANGED:"appSettingsChanged",
            APP_SETTINGS_CLOSE:"appSettingsClose",
            APP_SHOW_POPUP:"appShowPopup"
        },

        Origin: {
            /* TOP LEFT corner is the default */
            DEFAULT: 'TOP_LEFT',

            /* corners enumeration */
            TOP_LEFT: 'TOP_LEFT',
            TOP_RIGHT: 'TOP_RIGHT',
            BOTTOM_RIGHT: 'BOTTOM_RIGHT',
            BOTTOM_LEFT: 'BOTTOM_LEFT'
        },

        Events:{
            EDIT_MODE_CHANGE:[],
            PAGE_NAVIGATION_CHANGE:[],
            SITE_PUBLISHED: []
        },

        compId: null,

        /**
         * Functions
         */

        sendMessageInternal:function (type, data) {
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            if (target && typeof target != "undefined") {
                target.postMessage(JSON.stringify({
                    intent:_w.TPA_INTENT,
                    compId:_w.compId,
                    type:type,
                    data:data
                }), "*");
            }
        },

        /** Function sendPingPongMessage
         *  sends a post message to TPAManager (viewer) with message type and invokes the callback
         * @param type - a property of MessageTypes
         * @param callback
         * @param runMultipleTimes - optional, if set to true the post message callback isn't removed
         */
        sendPingPongMessage:function (type, callback, runMultipleTimes) {
            this.sendMessageInternal(type);

            var onMessageCallback = function (evt) {
                var postMessageData = JSON.parse(evt.data);
                if (postMessageData.intent == _w.TPA_INTENT) {
                    if (postMessageData.type == type && callback) {
                        callback(postMessageData.data);
                        if (!runMultipleTimes) {
                            this._removePostMessageCallback(onMessageCallback);
                        }
                    }
                }
            }.bind(this);

            this.addPostMessageCallback(onMessageCallback);
        },

        addPostMessageCallback:function (callback) {
            if (window.addEventListener) {
                window.addEventListener('message', callback, false);
            } else if (window.attachEvent) {
                window.attachEvent('onmessage', callback);
            }
        },

        _removePostMessageCallback:function (callback) {
            if (window.removeEventListener) {
                window.removeEventListener('message', callback);
            } else if (window.detachEvent) {
                window.detachEvent('onmessage', callback);
            }
        },

        getQueryParameter:function (parameterName) {
            var queryString = location.search.substring(1);
            parameterName += "=";
            if (queryString.length > 0) {
                var begin = queryString.indexOf(parameterName);
                if (begin != -1) {
                    begin += parameterName.length;
                    var end = queryString.indexOf("&", begin);
                    if (end == -1) {
                        end = queryString.length;
                    }
                    return unescape(queryString.substring(begin, end));
                }
            }
            return null;
        },

        getUrlQueryParameters: function() {
            var url = location.search;
            return url.substring(url.indexOf("?"));
        },

        decodeBase64: function(str) {
            var e={},i,k,v=[],r='',w=String.fromCharCode;
            var n=[[65,91],[97,123],[48,58],[43,44],[47,48]];

            for(z in n){for(i=n[z][0];i<n[z][1];i++){v.push(w(i));}}
            for(i=0;i<64;i++){e[v[i]]=i;}

            for(i=0;i<str.length;i+=72){
            var b=0,c,x,l=0,o=str.substring(i,i+72);
                 for(x=0;x<o.length;x++){
                        c=e[o.charAt(x)];b=(b<<6)+c;l+=6;
                        while(l>=8){r+=w((b>>>(l-=8))%256);}
                 }
            }
            return r;
        },

        getVersion: function() {

            var version = _w.version != "__VERSION_NUMBER__" ? _w.version :
                (window.location.pathname.split('/')[3] || "unknown");

            return version;
        },

        getDecodedInstance: function() {
            var instanceStr = _w.getQueryParameter("instance");
            var encodedInstance = instanceStr.substring(instanceStr.indexOf(".")+1);
            return JSON.parse(this.decodeBase64(encodedInstance));
        },

        getInstanceValue: function(key) {
            var decodedInstance = _w.getDecodedInstance();
            if (decodedInstance) {
                return decodedInstance[key];
            }
            return null;
        },

        receiver:function (event) {
            var data = JSON.parse(event.data);
            if (data.intent === "addEventListener") {
                this.Events[data.eventType].forEach(
                    function (callback) {
                        callback.apply(this, [data.params]);
                    }
                );
            }
        }
    };

    /**
     * Public API definition
     */
    var API = {

        Events:{
            EDIT_MODE_CHANGE:'EDIT_MODE_CHANGE',
            PAGE_NAVIGATION_CHANGE:'PAGE_NAVIGATION_CHANGE',
            SITE_PUBLISHED: 'SITE_PUBLISHED'
        },

        Origin: _w.Origin,

        currentEditMode: '',

        _init:function () {
            _w.compId = _w.getQueryParameter("compId") || "[UNKNOWN]";
            _w.sendMessageInternal(_w.MessageTypes.APP_IS_ALIVE); // Send isAlive message
            this.addEventListener(this.Events.EDIT_MODE_CHANGE, function(params) {
                this.currentEditMode = params.editMode;
            });
        },

        Settings: {

            getSiteInfo: function(onSuccess) {
                Wix.getSiteInfo(onSuccess);
            },

            refreshApp: function(queryParams) {
                Wix.refreshApp(queryParams);
            },

            refreshAppByCompIds: function(compIds, queryParams) {
                Wix.refreshAppByCompIds(compIds, queryParams);
            }
        },

        Utils: {
            /**
               * Function getCompId
               *
               * @return (String) the widget/section/settings iframe's component id
            */
            getCompId: function(){
                return _w.compId;
            },

            /**
             * @return for valid endpoints returns origCompId parameter value, otherwise returns null
             */
            getOrigCompId: function(){
                return _w.getQueryParameter("origCompId");
            },

            /**
             * @return for valid endpoints returns viewMode parameter value, otherwise returns null
             */
            getViewMode: function(){
                return _w.getQueryParameter("viewMode");
            },

            /**
             * @return for valid endpoints returns width parameter value, otherwise returns null
             */
            getWidth: function(){
                return _w.getQueryParameter("width");
            },

            /**
             * @return for valid endpoints returns locale parameter value, otherwise returns null
             */
            getLocale: function(){
                return _w.getQueryParameter("locale");
            },

            /**
             * @return for valid endpoints returns cacheKiller parameter value, otherwise returns null
             */
            getCacheKiller: function(){
                return _w.getQueryParameter("cacheKiller");
            },

            /**
             * @return for valid endpoints returns target parameter value, otherwise returns null
             */
            getTarget: function(){
                return _w.getQueryParameter("target");
            },

            /**
             * @return for valid endpoints returns section-url parameter value, otherwise returns null
             */
            getSectionUrl: function(){
                return _w.getQueryParameter("section-url").slice(0, -1);
            },

            /**
             * @return for valid endpoints returns instanceId parameter value, otherwise returns null
             */
            getInstanceId: function(){
                return _w.getInstanceValue("instanceId");
            },

            /**
             * @return for valid endpoints returns signDate parameter value, otherwise returns null
             */
            getSignDate: function(){
                return _w.getInstanceValue("signDate");
            },

            /**
             * @return for valid endpoints returns uid parameter value, otherwise returns null
             */
            getUid: function(){
                return _w.getInstanceValue("uid");
            },

            /**
             * @return for valid endpoints returns permissions parameter value, otherwise returns null
             */
            getPermissions: function(){
                return _w.getInstanceValue("permissions");
            },

            /**
             * @return for valid endpoints returns ipAndPort parameter value, otherwise returns null
             */
            getIpAndPort: function(){
                return _w.getInstanceValue("ipAndPort");
            },

            /**
             * @return for valid endpoints returns demoNode parameter value, otherwise returns null
             */
            getDemoMode: function(){
                return _w.getInstanceValue("demoMode");
            }
        },


        /**
         * Function reportHeightChange
         *
         * @param height (Number) new component height
         */
        reportHeightChange:function (height) {
            _w.sendMessageInternal(_w.MessageTypes.HEIGHT_CHANGED, height);
        },

        /**
         * Function pushState
         *
         * @param state (String) new app's state to push into the editor history stack
         */
        pushState:function (state) {
            _w.sendMessageInternal(_w.MessageTypes.APP_STATE_CHANGED, state);
        },

        /**
         * Function refreshApp
         *
         * @param queryParams (Array) component ids for which a refresh is required
         */
        refreshApp:function (queryParams) {
            this.refreshAppByCompIds(null, queryParams);
        },

        /**
         * Function refreshAppByCompIds
         *
         * @param compIds (Array) component ids for which a refresh is required
         * @param queryParams ()
         */
        refreshAppByCompIds:function (compIds, queryParams) {
            _w.sendMessageInternal(_w.MessageTypes.APP_SETTINGS_CHANGED, {'queryParams':queryParams, 'compIds':compIds});
        },

        /**
         * Function requestLogin
         *
         * @param onSuccess (Function) a callback function to receive the operation completion
         * status. The function signature should be :
         *  function onSuccess(param) {...}
         */
        requestLogin:function (onSuccess) {
            _w.sendPingPongMessage(_w.MessageTypes.SM_REQUEST_LOGIN, onSuccess);
        },

        /**
         * Function getSiteInfo
         *
         * @param onSuccess (Function) a callback function to receive the function completion
         * status. The function signature should be :
         *  function onSuccess(param) {...}
         */
        getSiteInfo:function (onSuccess) {
            _w.sendPingPongMessage(_w.MessageTypes.SITE_INFO, onSuccess);
        },

        /**
         * Function currentMember
         *
         * @param onSuccess (Function) a call back function to receive the function completion
         * status. The function signature should be :
         *  function onSuccess(param) {...}
         */
        currentMember:function (onSuccess) {
            _w.sendPingPongMessage(_w.MessageTypes.SM_CURRENT_MEMBER, onSuccess);
        },

        /**
         * Function openPopup
         *
         * @param url (String) popup iframe's url
         * @param x (Number) popup horizontal offset from origin point
         * @param y (Number) popup vertical offset from origin point
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         * @param origin (String, optional) popup origin point, reserved values, one of Origin's values
         *        example - TOP_LEFT, TOP_RIGHT, etc.
         */
        openPopup:function (url, x, y, width, height, origin) {
            var args = {
                url   : url,
                origin: origin || _w.Origin.DEFAULT,
                x     : x,
                y     : y,
                width : width,
                height: height
            };
            _w.sendMessageInternal(_w.MessageTypes.OPEN_POPUP, args);
        },

        /*
         * Function closePopup
         *
         * Closes the app's popup window.
         * This function can be used from popup scope only!!
         */
        closePopup:function () {
            _w.sendMessageInternal(_w.MessageTypes.APP_SETTINGS_CLOSE);
        },

        /**
         * Function openModal
         *
         * @param url (String) popup iframe's url
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         */
        openModal:function (url, width, height) {
            var args = {
                url   : url,
                width : width,
                height: height
            };
            _w.sendMessageInternal(_w.MessageTypes.OPEN_MODAL, args);
        },

        /**
         * Function openFullScreen
         *
         * @param url (String) popup iframe's url
         */
        openFullScreen:function (url) {
            var args = {
                url   : url
            };
            _w.sendMessageInternal(_w.MessageTypes.OPEN_FULLSCREEN, args);
        },

        /**
         * Function changeAppSize
         *
         * @param width (Number) in pixels
         * @param height (Number) in pixels
         */
        changeWindowSize:function (width, height) {
            _w.sendMessageInternal(_w.MessageTypes.CHANGE_APP_SIZE, {width:width, height:height});
        },

        /**
         * Function addEventListener
         *
         * @param eventName (String) the event name, reserved values, see Events
         * @param callBack (Function) a callback function which gets invoked when a new
         * event is sent from the wix site, The function signature should be :
         *  function callBack(param) {...}
         */
        addEventListener: function(eventName, callBack) {
            var callbacks = _w.Events[eventName] || [];
            callbacks.push(callBack);
            if (_w.firstAddEventListenerCall) {
                _w.addPostMessageCallback(_w.receiver.bind(_w));
                _w.firstAddEventListenerCall = false;
            }
        },

        navigateToState: function(innerState) {
            if (this.currentEditMode == 'preview') {
                if (event) {
                    event.preventDefault();
                }          
                var newUrl = this.Utils.getSectionUrl() + innerState + _w.getUrlQueryParameters();
                window.location = newUrl;
            }
        }

    };

    /**
     * Deploy API on the container (iframe window)
     */
    API._init();
    container.Wix = API;
}(this));
