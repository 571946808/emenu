/*----------------------------------------------------------------
 * @Description:     省略号插件
 * @note: 自定义属性data-ellipsis必须配置，值类似为"40|..."
 * ---------------------------------------------------------------*/
KISSY.add('mod/ellipsis', function(S, Core){
    var 
        DOM = S.DOM, query = DOM.query, get = DOM.get, $ = S.all,
        SELECT_ATTR = 'data-ellipsis',
        ORIGINAL_TEXT_STORE_KEY = 'originalText',
        ELLIPSIS_KEY = 'ellipsis';
        Ellipsis = {
        	client: function(el){
        		var
                    ellipsis = new Core(el);
        		DOM.data(el, ELLIPSIS_KEY, ellipsis);
        		ellipsis.ellipsis(el);
        	},
        	/**
        	 * 获取原字符串内容
        	 * @param  {[type]} el [description]
        	 * @return {[type]}    [description]
        	 */
        	getOrignalText: function(el){
        		var t = DOM.data(el, ORIGINAL_TEXT_STORE_KEY);
        		return t;
        	},
        	/**
        	 * 设置截取字符串长度
        	 * @param {[type]} el     [description]
        	 * @param {[type]} length [description]
        	 */
        	setEllipsisLength: function(el, length){
        		var
        			elsObj = DOM.data(el, ELLIPSIS_KEY);
        		elsObj.resetLength(el, length);
        	},
        	/**
        	 * 重新截取相应节点的字符串
        	 * @param  {[type]} el [description]
        	 * @return {[type]}    [description]
        	 */
        	refresh: function(el){
        		var
        			elsObj = DOM.data(el, ELLIPSIS_KEY);
        		elsObj.refresh(el);
        	},
        	/**
        	 * 重新截取所有注册截取字符串节点的字符串
        	 * @return {[type]} [description]
        	 */
        	refreshAll: function(){
        		var els = query('*[data-ellipsis]'),
        			elsObj = DOM.data(el, ELLIPSIS_KEY);
    	        els.each(function(el){
    	        	elsObj.refresh(el);
    	        });
        	},
        	/**
        	 * 移除字符串截取
        	 * @return {[type]} [description]
        	 */
        	remove: function(el){
        		var
        			elsObj = DOM.data(el, ELLIPSIS_KEY);
        		elsObj.remove(el);
        	}
        };
    S.ready(function(){
        var els = query('*[data-ellipsis]');
        els.each(function(el){
        	Ellipsis.client(el);
        });
    });
    PW.namespace('mod.Ellipsis');
    PW.mod.Ellipsis = Ellipsis;
    return Ellipsis;
}, {
    requires: ['ellipsis/core']
});
KISSY.add('ellipsis/core', function(S){
	var 
        DOM = S.DOM, query = DOM.query, get = DOM.get, $ = S.all,
        SELECT_ATTR = 'data-ellipsis',
        ORIGINAL_TEXT_STORE_KEY = 'originalText';
	var
		Core = function(el){
			this.ellipsis(el);
		}
	S.augment(Core, {
		ellipsis: function(el){
	        var 
	            setting = DOM.attr(el, SELECT_ATTR).split('|'),
	            threshold = parseInt(setting[0]) || 30,
	            suffixText = setting[1] || '...';
	        if(DOM.data(el, ORIGINAL_TEXT_STORE_KEY)) return;
	        this._storeOriginalText(el);
	        this._spliceText(el,threshold, suffixText);
    	},
    	_storeOriginalText: function(el){
    		var t = DOM.text(el).trim();
        	DOM.data(el, ORIGINAL_TEXT_STORE_KEY, t);
    	},
    	_spliceText: function(el, threshold, suffixText){
	        var
	            t = DOM.data(el, ORIGINAL_TEXT_STORE_KEY),
	            shortenText;
	        if(t.length <= threshold) return;
	        shortenText = t.substring(0, threshold) + suffixText;
	        shortenText = S.escapeHTML(shortenText);
	        DOM.html(el, shortenText);
    	},
    	remove: function(el){
    		var t = DOM.data(el, ORIGINAL_TEXT_STORE_KEY);
    		DOM.removeData(el, ORIGINAL_TEXT_STORE_KEY);
    		DOM.text(el, t);
    	},
    	resetLength: function(el, length){
    		var
    			threshold = parseInt(length) || 30,
    			setting = DOM.attr(el, SELECT_ATTR).split('|'),
	            suffixText = setting[1] || '...',
	            newEllipsisOpts = length + '|' + suffixText;
            DOM.attr(el, SELECT_ATTR, newEllipsisOpts);
    		this._spliceText(el, threshold, suffixText);
    	},
    	refresh: function(el){
    		var
    			that = this;
    		that.remove(el);
    		that.ellipsis(el);
    	}
	});
	return Core;
},{
	requires: ['core', 'node']
})