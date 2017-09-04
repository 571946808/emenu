/*-----------------------------------------------------------------------------
* @Description:     修改个人信息
* @Version:         1.0.0
* @author:          yud(862669640@qq.com)
* @date             2016.7.25
* ==NOTES:=============================================
* v1.0.0(2016.7.25):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('page/user-management/modify-personal-information', function(S, Modify){
	PW.namespace('page.UserManagement.ModifyPersonalInformation.Modify');
	PW.page.UserManagement.ModifyPersonalInformation.Modify = function(param){
		new Modify(param);
	};
},{
	requires: [
		'modify-personal-information/core'
	]
});
KISSY.add('modify-personal-information/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, 
        on = S.Event.on, 
		Defender = PW.mod.Defender,
		config = {
			
		},
		el = {
			// 添加表单
			operForm: '.J_operForm',
			// 保存按钮
			submitBtn: '.J_submitBtn',
			//提示元素
			tipEl: '.J_tip'
		};
		
	function Modify(param){
		this.opts = S.merge(config, param);
		this.submitBtn = DOM.data(el.submitBtn, 'btn');
		this.defender;
		this._init();
		this._hideTip();
	}

	S.augment(Modify, {
		_init: function(){
			//this._validForm();
			this._bulidEvt();
			this._defender();
		},
		_bulidEvt: function(){
			var
				that = this;

			that.submitBtn.on('loading', function(){
				that._submitForm();
				return false;
			});
		},

		/**
		 * 提交表单
		 * @private
		 */
		_submitForm: function(){
			var
				that = this,
				form = get(el.operForm);

			that.defender.validAll(function(rs){
				if(rs){
					setTimeout(function(){
						form.submit();
					}, 1500);
				}else{
					that.submitBtn.reset();
				}
			});
		},
		/**
         * 验证添加表单
         * @return {[type]} [description]
         */
        _defender: function(){
            var
                that = this;

            that.defender = Defender.client(el.operForm, {});
        },
        /**
		 * 隐藏提示
		 * @return {[type]} [description]
		 */
		_hideTip: function(){
			var
				that = this,
				msg = S.one(el.tipEl);

			if( msg ){
				setTimeout(function(){
					DOM.remove(msg);
				}, 1000);
			}
		},

	});
	return Modify;
},{
	requires: [
		'mod/defender',
		'widget/btn'
	]
});