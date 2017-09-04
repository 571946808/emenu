/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-存放点管理-添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.11.19
* ==NOTES:=============================================
* v1.0.0(2015.11.19):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add("page/store-management/depot-management-add", function(S,Add){
	PW.namespace("page.StoreManagement.DepotManagementAdd");
	PW.page.StoreManagement.DepotManagementAdd = function(param){
		new Add(param);
	}
},{
	requires: [
		'depot-management/add'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add("depot-management/add", function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
		Defender = PW.mod.Defender;
		config = {},
		el = {
			//提示元素
			tipEl: '.J_tip',
			//表单元素
			submitForm: '.J_submitForm',
			//提交触发器
			submitTrigger: '.J_submitBtn'
		};

	function Add(param){
		this.opts = S.merge(config, param);
		this._hideTip();
		this.defender;
		this.btn = DOM.data(el.submitTrigger, 'btn');
		this._init();
	}

	S.augment(Add, {
		_init: function(){
			this._addEventListener();
			this._defender();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			that.btn.on('loading',function(){
				that._valid();
				return false;
			});
			
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
				}, 2000);
			}
		},
		_defender: function(){
			var
				that = this;

			that.defender = Defender.client(el.submitForm, {});
		},
		_valid: function(){
			var
				that = this,
				form = get(el.submitForm);

			that.defender.validAll(function(rs){
				if(rs){
					setTimeout(function(){
						form.submit();
					},2000);
				}else{
					that.btn.reset();
					return false;
				}
			});
		}

	});
	return Add;
},{
	requires: [
		'mod/defender',
		'widget/btn'
	]
});