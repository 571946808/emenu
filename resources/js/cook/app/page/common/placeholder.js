/*-----------------------------------------------------------------------------
* @Description:     placeholder组件
* @Version:         1.0.0
* @author:          wangjing(1284663246@qq.com)
* @date             2014.07.23
* ==NOTES:=============================================
* v1.0.0(2014.07.23):
*     placeholder组件,支持
* --------------------------------------------------------------------------*/
KISSY.add('page/common/placeholder', function(S, Placeholder){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        PLACEHOLDER_ATTR = 'placeholder',
        el = {
            // placeHolder: 'input[' + INPUT_TYPE_ATTR + ']'
            placeHolder: 'input[' + PLACEHOLDER_ATTR + ']'
        };
       
    PW.namespace('page.common.Placeholder');
    PW.page.common.Placeholder = {
    	refresh: function(){
            var    
                that = this;
            //如果原生支持placeholder属性，则返回对象本身
            if ("placeholder" in document.createElement("input"))  return this;

            S.each(query(el.placeHolder), function(p){
                DOM.data(p, PLACEHOLDER_ATTR, that.client(p));
            })
            return this;
        },
        client: function(selector){
            return new Placeholder(selector);
        }
    }
 	S.ready(function(){
        PW.page.common.Placeholder.refresh();
    });

},{
	requires:['placeholder/core']
});

KISSY.add('placeholder/core', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        el = {

        },
        INPUT_TYPE = 'password',
        PLACEHOLDER_ATTR = 'placeholder',
        PLACEHOLDER_CLASS = 'placeholder';
    var
    	Placeholder = function(param){
    		this.param = param;
            this.placeholder = get(this.param);
            this.newInput;
    		this._init();
    	}
    S.augment(Placeholder, {
    	_init: function(){
            this._initText();
    		this._buildEvt();
    	},
    	_buildEvt: function(){
    		var
    			that = this,
                placeholderEl = get(that.param),
                newPwdEl = get(that.newInput);
    		on(placeholderEl,'focus', that._focus, that);
            on(placeholderEl, 'blur', that._blur, that);
            on(newPwdEl, 'focus', that._pwdFocus, that);
    	},
        _initText: function(){
            var
                placeholder = this.placeholder,
                text = DOM.attr(placeholder,PLACEHOLDER_ATTR);

            //如果该input域的属性为password
            if(DOM.attr(placeholder, 'type') == INPUT_TYPE){
                this._passwordInput();

            }else if(!DOM.val(placeholder)){
                DOM.val(placeholder, text);
                DOM.addClass(placeholder, PLACEHOLDER_CLASS);
            }
        },
        /**
         * 非密码域获取焦点
         * @return {[type]} [description]
         */
        _focus: function(){
            var
                that = this,
                placeholder = that.placeholder,
                text = DOM.attr(placeholder,PLACEHOLDER_ATTR);
            if(DOM.val(placeholder) == text){
                DOM.val(placeholder,'');
                DOM.removeClass(placeholder, PLACEHOLDER_CLASS);
            }
        },
        /**
         * 输入域失去焦点 
         * 当输入域为密码类型显示placeholder里面的内容
         * @return {[type]} [description]
         */
        _blur: function(){
            var
                that = this,
                placeholder = that.placeholder,
                newInput = that.newInput,
                text = DOM.attr(placeholder,PLACEHOLDER_ATTR);
            if(DOM.attr(placeholder, 'type') == INPUT_TYPE && !DOM.val(placeholder)){
                DOM.hide(placeholder);
                DOM.show(newInput);
            }else if(!DOM.val(placeholder)){
                DOM.val(placeholder, text);
                DOM.addClass(placeholder, PLACEHOLDER_CLASS);
            }
        },
        /**
         * 密码域操作
         * @return {[type]} [description]
         */
        _passwordInput: function(){
            var
                that = this,
                placeholder = this.placeholder,
                text = DOM.attr(placeholder,PLACEHOLDER_ATTR),
                NewInputStr = '<input class="pwdPlaceholder form-control input-sm '+ PLACEHOLDER_CLASS +'" type="text" value='+text+' />',
                NewInputEl = DOM.create(NewInputStr);
            that.newInput = NewInputEl;
            DOM.insertAfter(NewInputEl, placeholder);
            if(!DOM.val(placeholder)){
                 DOM.hide(placeholder);
            }else{
                DOM.hide(NewInputEl);
            }
        },
        /**
         * 输入为密码域时获取焦点
         * @return {[type]} [description]
         */
        _pwdFocus: function(){
            var
                that = this,
                placeholder = that.placeholder,
                newInput = that.newInput,
                text = DOM.attr(placeholder,PLACEHOLDER_ATTR);
             DOM.show(placeholder);
             placeholder.focus();
             DOM.hide(newInput);
        }
    });
    return Placeholder;
},{
	requires:['core','mod/ext']
})