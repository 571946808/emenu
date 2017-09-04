/*-----------------------------------------------------------------------------
* @Description:     根据下拉框选中的内容，将输入框修改为相应的验证条件
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.25
* ==NOTES:=============================================
* v1.0.0(2015.9.25):
* v1.0.0(2015.11.24):
* 修改了渲染验证条件的方式，采用juicer渲染验证输入框，为了完成value值的渲染
* ---------------------------------------------------------------------------*/

KISSY.add('module/select-valid', function(S, Core){
	PW.namespace('module.SelectValid');
	var
		DOM = S.DOM, query = DOM.query, $ = S.all,
		el = {
			// 触发器：下拉列表
			selectEl: '.J_select',
			// 渲染输入框
			renderTo: '.J_renderTo',
			// 验证输入框的位置
			position: '.J_renderPosition'
		},
		SelectValid = {
			client: function(param){
				return new Core(param);
			},
			refresh: function(){
				var
					that = this;
				S.each(query(el.selectEl), function(o){
					var 
						renderTo = $(o).parent().next().children(el.renderTo),
						position = $(o).parent().next().children(el.position);
					DOM.data(o, 'selectValid', that.client({
						triggerEl: o,
						renderTo: renderTo,
						position: position
					}));
				});
			}
		};
	S.ready(function(){
		SelectValid.refresh();
	});
	PW.module.SelectValid = SelectValid;
	return SelectValid;
},{
	requires: [
		'select-valid/core'
	]
});

KISSY.add('select-valid/core', function(S){
	var
		DOM = S.DOM, query = DOM.query,
		on = S.Event.on, fire = S.Event.fire,
		Juicer = PW.mod.Juicer,
		config = {
			// 下拉列表
			triggerEl: '',
			// 渲染输入框
			renderTo: ''
		},
		el = {
			renderTo: '.J_renderInp'
		},
		TEMP = '<input class="J_renderInp" type="text" data-valid-tip="&{tip}" data-valid-rule="&{rule}" name="&{name}" value="&{value}" />&nbsp;',
		DATA_VALID_RULE = 'data-valid-rule',
		DATA_VALID_TIP = 'data-valid-tip',
		DATA_NAME = 'data-name',
		DATA_VALUE = 'data-value';

	function Core(param){
		this.opts = S.merge(config, param);
		this._init();
	}

	S.augment(Core, S.EventTarget, {
		_init: function(){
			this._renderVaild();
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				renderTo = that.opts.renderTo;
			on(triggerEl, 'change', that._renderVaild, that);
		},
		_renderVaild: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				renderTo = that.opts.renderTo;
			// 获取输入框验证条件
			that._getVaild();
			// 渲染验证条件和验证提示
			that._render();
			that.fire('refreshValid');
		},
		_render: function(){
			var
				that = this,
				position = that.opts.position,
				str = Juicer.client(TEMP, {
					value: that.value ,
					name: that.name,
					tip: that.validTip,
					rule: that.validRule
				}),
				strDOM = DOM.create(str);

			DOM.remove(el.renderTo);
			// 如果不是无促销，就在相应位置处添加输入框
			if(that.val != 1){
				DOM.insertAfter(strDOM, position);
			}
		},
		_getVaild: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				options = query('option', triggerEl),
				val = DOM.val(triggerEl);
			S.each(options, function(option){
				if(option.selected){
					that.validRule = DOM.attr(option, DATA_VALID_RULE);
					that.validTip = DOM.attr(option, DATA_VALID_TIP);
					that.name = DOM.attr(option, DATA_NAME);
					that.value = DOM.attr(option, DATA_VALUE);
					that.val = DOM.attr(option, 'value');
				}
			});
		}
	});

	return Core;
},{
	requires: [
		'mod/juicer',
		'core'
	]
});