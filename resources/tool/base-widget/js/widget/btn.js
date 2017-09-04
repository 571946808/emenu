/*-----------------------------------------------------------------------------
* @Description:     智能按钮js
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.17
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('widget/btn', function(S, Core){
	var
		DOM = S.DOM, query = DOM.query, $ = S.all,
		BTN_TYPE_ATTR = 'data-btn-type',
		BTN_LOADING_TEXT = 'data-btn-loading-text',
        el = {
            smartBtn: '.btn[' + BTN_TYPE_ATTR + ']'
        }
		BTN_KEY = 'btn';
	var
		Btn = {
			client: function(param){
				return new Core(param);
			},
			refresh: function(){
				var
					that = this,
					smartBtn = $(el.smartBtn);
				S.each(smartBtn, function(smartBtn){
					DOM.data(smartBtn, BTN_KEY, that.client({
						triggerEl: smartBtn,
						loadingText: DOM.attr(smartBtn, BTN_LOADING_TEXT),
						triggerType: DOM.attr(smartBtn, BTN_TYPE_ATTR)
					}));
				});
			}
		};
	PW.namespace('widget.Btn');
	S.ready(function(){
		Btn.refresh();
	});
	PW.widget.Btn = Btn;
	return Btn;
},{
	requires: [
		'btn/core'
	]
});

KISSY.add('btn/core', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, 
        fire = S.Event.fire
        config = {},
        el = {},
        LOADING_CLASS = 'btn-loading',
        DISABLED_CLASS = 'disabled';
    
    function Core(param){
    	this.opts = S.merge(config, param);
    	this.loadingContent;
    	this._init();
    }

    S.augment(Core, S.EventTarget, {
    	/**
    	 * 对外函数：重置智能按钮
    	 * @return {[type]} [description]
    	 */
    	reset: function(){
    		var
    			that = this;

    		if(that.loadingTimer){
                that._unloading(); 
            }
    	},
    	_init: function(){
    		this._bulidEvt();
    	},
    	_bulidEvt: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		that.formEl = DOM.parent(that.opts.triggerEl, 'form');
    		on(triggerEl, 'click', that._clickHandler, that);
    		on(that.formEl, 'submit', that._formSubmitHandler, that);
    	},
    	_formSubmitHandler: function(e){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		if(that.opts.triggerType == 'loading'){
				if(e.keyCode == 13 || e.which == 13){
					that._loading();
				}
    			return false;
    		}
    	},
    	_clickHandler: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl,
    			type = that.opts.triggerType;

    		if(type == 'loading'){
    			that._loading();
    		}
    		return false;
    	},
    	/**
    	 * 修改智能按钮信息
    	 * @param  {[type]} text [description]
    	 * @return {[type]}      [description]
    	 */
    	_text: function(text){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		DOM.html(triggerEl, text);
    	},
    	/**
    	 * 获取智能按钮原始信息
    	 * @return {[type]} [description]
    	 */
    	_getTriggerEl: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		that.loadingContent = S.trim(DOM.html(triggerEl));
    	},
    	/**
    	 * 智能按钮loading状态
    	 * @return {[type]} [description]
    	 */
    	_loading: function(){
    		var
    			that = this,
    			txt = that.opts.loadingText,
    			triggerEl = that.opts.triggerEl;
    		that._getTriggerEl();
    		that.loadingTimer = S.timer(function(index){
                var 
                    t = txt;
                if(index > 2) {
                    that.loadingTimer = this.restart();
                }
                if(index == 0) {
            		DOM.addClass(triggerEl, LOADING_CLASS);
                	t = txt + '.&nbsp;&nbsp;'; 
                }
                if(index == 1) {
                	t = txt + '..&nbsp;';
                } 
                if(index == 2) {
                	t = txt + '...'; 
                }
               	that._text(t);
            }, .5, 0);
            that._lock();
    		that.fire('loading');
    	},
    	/**
    	 * 加锁，防止多次点击按钮
    	 * @return {[type]} [description]
    	 */
    	_lock: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		DOM.addClass(triggerEl, DISABLED_CLASS);
    	},
    	/**
    	 * 解锁
    	 * @return {[type]} [description]
    	 */
    	_unLock: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		DOM.removeClass(triggerEl, DISABLED_CLASS);
    	},
    	/**
    	 * 取消智能按钮loading状态
    	 * @return {[type]} [description]
    	 */
    	_unloading: function(){
    		var
    			that = this,
    			triggerEl = that.opts.triggerEl;
    		if(that.loadingTimer){
                S.clearTimer(that.loadingTimer);    
                that.loadingTimer = null;
            }
    		DOM.removeClass(triggerEl, LOADING_CLASS);
    		DOM.html(triggerEl, that.loadingContent);
    		that._unLock();
    	}
    });

    return Core;
});