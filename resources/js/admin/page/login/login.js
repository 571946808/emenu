/*-----------------------------------------------------------------------------
* @Description:     登录首页
* @Version:         1.0.0
* @author:          hujun(435043636@qq.com)
* @date             2015.9.25
* ==NOTES:=============================================
* v1.0.0(2015.9.25):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/login/login',function(S,Index){
	PW.namespace('page.Login.Index');
	PW.page.Login.Index = function(param){
		return new Index(param);
	}
},{
	requires:[
		'login/index'
	]
}); 
/**
 * 登录首页
 * @param  {[type]} S        [description]
 * @param  {Object} el       [description]
 * @param  {String} 		 [description]
 * @return {[type]}          [description]
 */
 KISSY.add('login/index',function(S){
 	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire,
        Defender = PW.mod.Defender,
        LoginIO = PW.io.Login,
        Dialog = PW.widget.Dialog,
        config = {},
        el = {
        	//表单
            form : '.J_loginForm',
        	//登录按钮
        	submitBtn :'.J_submitBtn',
        	//用户名
        	userName : '.J_username',
        	//密码
        	passWord : '.J_pwd',
            //记住登录状态
            rememberEl: '.J_remember'
        };
    function Index(param){
        this.btn = DOM.data(el.submitBtn,'btn');
        this._validForm;
        this.remember = 0;
        this._init();
    }

    S.augment(Index, S.EventTarget, {
        _init: function(){
            this._bulidEvt();
            this._validForm = Defender.client(el.form, {});
        },
        _bulidEvt: function(){
            var 
                that = this;

            that.btn.on("loading",function(){
                that._submitHandler();
                return false;  
            });
            //记住登录状态
            on(el.rememberEl,"click" , function(e){
                 that._rememberHandler(e.target);
            });
        },
        /**
         * 表单提交验证用户信息
         * @return {[type]} [description]
         */
        _submitHandler : function(){
            var 
                that = this,
                data = DOM.serialize(el.form);
                
            that._validForm.validAll(function(rs){
                if(rs){                                     
                    that._sendUserInfo(data);
                }else{
                    that.btn.reset();
                    return false;  
                }
            });
            return false;            
        },
        /**
         * 后台交互用户名密码验证是否合理
         * @return {[type]} [description]
         */
        _sendUserInfo : function(data){
            var 
                that = this,
                formContent = get(el.form);

            LoginIO.getLogin(data ,function(rs,errMsg){
                if(rs){
                    //延迟提交
                    setTimeout(function(){
                        formContent.submit();
                    }, 1000);
                }else{
                    that.btn.reset();
                    Dialog.alert(errMsg, function(){
                    },{
                        footer:{
                            btns: [
                                {
                                    text: '确定',
                                    clickHandler: function(e,me){
                                        me.close();
                                    }
                                }
                            ]
                        }
                    });
                    return false;
                }
            });
               
           
        },
        /**
         * 记住登录状态
         * @param  {[type]} target [description]
         * @return {[type]}        [description]
         */
        _rememberHandler : function(target){
            var 
                that = this;

            rememberStatus = DOM.attr(target,'checked');
            if(rememberStatus == 'checked'){
                DOM.attr(target,'checked','checked');
                DOM.val(target,1);
                that.remember = 1;
            }else{
                DOM.removeAttr(target,'checked');
                DOM.val(target,0);
                that.remember = 0;
            }    
        },
    });
    return Index;
 },{
 	requires:[
 		'mod/defender',
		'pio/login/login',
        'widget/dialog',
        'widget/btn'
 	]
 });

