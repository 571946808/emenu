/*-----------------------------------------------------------------------------
* @Description: XmlHttpRequest新增功能 (net-cross domain support)
* @Version:     V3.0.0
* @author:      Nina(1284663246@qq.com)
* @date         2015.04.13
* ==NOTES:=============================================
* v3.0.0(2015.04.13):
*     初始生成
* 历史版本： create by Simon(406400939@qq.com) 2012.3.16
* ---------------------------------------------------------------------------*/
KISSY.add('net/base', function(S) {
	 var EMPTY_FUNCTION = function(){}, net = { proxy:{} },
        DOM = S.DOM, Event = S.Event, on = Event.on;

    function XmlHttpRequest(config){
        this._init(config);
    }

    S.augment(XmlHttpRequest, {
        url: '',
        async: true,
        data: '',
        onStart: EMPTY_FUNCTION,
        onSend: EMPTY_FUNCTION,
        onSuccess: null,
        onFailure: null,
        onComplete: EMPTY_FUNCTION,
        method: 'post',
        xhr: null,
        header: null,
        startEventObj:{notice:'正在加载...'},
        completeEventObj:{},

        _init: function(config){
            S.mix(this, config);
            var self = this,
                data = this.data;
            
            if(S.isPlainObject(data)){
                this.data = S.param(data);
            }
        },

        getXhr: function(){
            var url = this.url,
                host, self = this, frame, xhr;

            function getHost(url){
                var link = DOM.create('<a>', {href:url});
                return link.hostname;
            }
            
            host = getHost(url);
            if(host != location.hostname && /^http/.test(url)){
               if(!net.proxy[host]){
               		
                    frame = DOM.create('<iframe>', {src:'http://code:81/jsBase/test/proxy.html', width:0, height:0, frameborder:0});
                    document.body.appendChild(frame);
                    on(frame, 'load', function(){
                        net.proxy[host] = frame;
                        self.xhr = frame.contentWindow.getXhr();
                        self._send();
                    });
                }else{
                    self.xhr = net.proxy[host].contentWindow.getXhr();
                    self._send();
                }
 
            }else if(S.UA.ie){
                try{
                    self.xhr = new ActiveXObject( 'Msxml2.XMLHTTP' );
                }catch(e){
                    self.xhr =  new ActiveXObject( 'Microsoft.XMLHTTP' );
                }
                self._send();
            }else{
                self.xhr = new XMLHttpRequest();
                self._send();
            }

        },

        abort: function(){
            this.xhr.abort();
        },

        send:function(){
            this.getXhr();
        },

        _send: function(){
            var url = this.url,
                method = this.method,
                param = null,
                self = this;

            if(method == 'get' && !!this.data){
                url = this.url + (/\?/.test(this.url) ? '&' : '?') + this.data;
            }else{
                param = this.data;
            }
            this.xhr.onreadystatechange = function(){
                self._onStateChange();
            }

            this.xhr.open(method, url, this.async);
            this.xhr.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
            if(S.isPlainObject(this.header)){
                for(var k in this.header){
                    this.xhr.setRequestHeader(k, this.header[k]);
                }
            }
            this.xhr.send(param);
        },

        _onStateChange: function(){
            var xhr = this.xhr;

            if(xhr.readyState == 1 && !this._hasStart){
                this.onStart();
                net.fire('start', {'startEventObj':this.startEventObj});
                this._hasStart = true;
            }else if(xhr.readyState == 2){
                this._onSend();
            }else if(xhr.readyState == 4){
                if(xhr.status == undefined || xhr.status == 0 || ( xhr.status >= 200 && xhr.status < 300 || xhr.status == 1223 || xhr.status == 304)){
                    this._onSuccess();
                }else{
                    (this.onError || this.onFailure || EMPTY_FUNCTION ).call(this, xhr);
                }
                net.fire('complete', {'completeEventObj':this.comleteEventObj});
                this._onComplete();
            }

        },

        _onSuccess: function(){
            this.onSuccess(this.xhr);
        },
        _onSend : function(){
            this.onSend(this.xhr);  
        },
        _onComplete: function(){
            this.onComplete(this.xhr);
        }

    });

    S.mix(net, {
        XmlHttpRequest: XmlHttpRequest,
        post: function(config){
            config.method = 'post';
            var request = new XmlHttpRequest(config);
            request.send();
            return request;
        },
        get: function(config){
            config.method = 'get';
            var request = new XmlHttpRequest(config);
            request.send();
            return request;
        }
    });

    S.mix(net, S.EventTarget);

    S.net = net;
},{
	requires:['core']
});


KISSY.add('mod/net',function(S){
    return S.net;
},{
    requires:['net/base']
});
