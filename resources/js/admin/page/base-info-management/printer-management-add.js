/*-----------------------------------------------------------------------------
* @Description:     基本信息管理-打印机管理--添加
* @Version:         1.0.0
* @author:          daiqiaoling(1649500603@qq.com)
* @date             2015.11.10
* ==NOTES:=============================================
* v1.0.0(2015.11.10):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/base-info-management/printer-management-add', function(S, Add){
	PW.namespace('page.BaseInfoManagement.PrinterManagementAdd');
	PW.page.BaseInfoManagement.PrinterManagementAdd = function(param){
		new Add(param);
	}
},{
	requires: [
		'printerManagementEdit/add'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('printerManagementEdit/add', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, on = S.Event.on, $ = S.all,
		config = {},
		Defender = PW.mod.Defender,
        Dialog = PW.widget.Dialog,
		el = {		
			// 操作的表单
			operForm: '.J_addForm',
        	//保存按钮
        	submitBtn: '.J_submitBtn',
        	//下拉列表元素
        	selectEl: '.J_select',
        	//打印机品牌元素
        	brandEl: '.J_brand',
        	//打印机型号元素
        	printerModelEl: '.J_printerModel',
        	//打印机类型元素
        	typeEl: '.J_type',
        	//分类详情元素
        	detailsEl: '.J_classifyDetails',
        	//提示元素
        	tipEl: '.J_tip'
		},
		TIP = [
			'此为必选项'
		];

	function Add(param){
		this.opts = S.mix(config, param);
		this.defender;
		this.results = {
			brand: $(el.brandEl).val(),
			printerModel: $(el.printerModelEl).val(),
			type: $(el.typeEl).val()
		};
		this.btn = DOM.data(el.submitBtn,'btn');
		this._init();
	}

	S.augment(Add, {
		_init: function(){
			this._defender();
			this._addEventListener();
			this._hideTip();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this,
				selects = $(el.selectEl);

			on(el.selectEl, 'change', function(e){
				e.stopPropagation();
				that._validSelect(e.target);
			});

			on(el.selectEl, 'blur', function(e){
				e.stopPropagation();
				that._validSelect(e.target);
			});

			on(el.typeEl, 'change', function(e){
				that._showHandler(e.target);
			});

			that.btn.on('loading', function(){
				that._valid();
				return false;
			});
		},
		/**
		 * 隐藏提示信息
		 * @return {[type]} [description]
		 */
		_hideTip: function(){
			var
				that = this,
				msg = S.one(el.tipEl);
			
			if( msg ){
				setTimeout(function(){
					DOM.remove(el.tipEl);
				}, 2000);
			}
		},
		/**
		 * 表单验证
		 * @return {[type]} [description]
		 */
		_defender: function(){
			var 
				that = this;

			that.defender = Defender.client(el.operForm,{});
		},
		/**
		 * 验证下拉列表
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_validSelect: function(ev){
			var 
				that = this,
				value = $(ev).val(),
				name = $(ev).attr('name'),
				tip = '<span class="pw-tip error-state">' + TIP[0] + '</span>';
			
			DOM.remove($(ev).next('span'));

			if( value == -1 ){
				$(ev).addClass('error-field');
				$(tip).insertAfter($(ev));
			}else{
				$(ev).removeClass('error-field');
			}
			that.results[name] = value;
		},
		/**
		 * 验证通过后，提交表单
		 * @return {[type]} [description]
		 */
		_valid: function(){
			var 
				that = this,
				form = get(el.operForm),
				results = that.results,
				state = 0;

			that._validSelect(el.selectEl);

			S.each(results, function(elem){
				if( elem !== '-1' ){
					state ++;
				}
			});

			that.defender.validAll(function(rs){
				if( rs && state == 3 ){
					setTimeout(function(){
						form.submit();
					}, 1000);
				}else{
					that.btn.reset();
					return false;
				}
			});
		},
		/**
		 * 如果打印机类型为分类打印机，则显示分类详情模块
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_showHandler: function(ev){
			var
				that = this,
				type = $(ev).val();
				
			if( type == 3 ){
				$(el.detailsEl).show();
			}else{
				$(el.detailsEl).hide();
			}
		}        
	});

	return Add;
},{
	requires: [
		'mod/defender',
		'widget/dialog',
        'widget/btn'
	]
});