/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-原配料管理-添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2016.05.23
* ==NOTES:=============================================
* v1.0.0(2016.05.23):
     初始生成
* -------------------------------------------------------------------------*/
KISSY.add('page/store-management/ingredients-management-add', function(S, Core){
	PW.namespace('page.StoreManagement.IngredientsManagementAdd');
	PW.page.StoreManagement.IngredientsManagementAdd = function(param){
		new Core(param);
	}
}, {
	requires: [
		'ingredients-management/add'
	]
});
/***********************************************************/
KISSY.add('ingredients-management/add', function(S){
	var
		$ = S.all, DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		config = {},
		Defender = PW.mod.Defender,
		Dialog = PW.widget.Dialog,
		IngredientsManagementIO = PW.io.StoreManagement.IngredientsManagement,
		el = {
			//提交表单
			submitForm: '.J_submitForm',
			//原配料名称元素
			nameEl: '.J_name',
			//单位类型元素
			unitTypeEl: '.J_unitType',
			//库存单位类型元素
			storageUnitTypeEl: '.J_storageUnitType',
			//库存单位元素
			storageUnitEl: '.J_storageUnit',
			//库存预警元素
			storageWarningEl: '.J_storageWarning',
			//库存预警单位元素
			storageWarningUnitEl: '.J_storageWarningUnit',
			//提交表单触发器
			submitTrigger: '.J_submit',
			//提示元素
			tipEl: '.J_tip'
		},
		DATA_UNIT_NAME = 'data-unit-name';

	function Core(param){
		this.opts = S.mix(config, param);
		this.defender;
		this.isRepeat = true;
		this.init();
	}

	S.augment(Core, {
		init: function(){
			this._defender();
			this._changeStorageUnitType(el.storageUnitTypeEl);
			this._addEventListener();
		},
		_addEventListener: function(){
			var
				that = this,
				nameValidResult;

			on(el.nameEl, 'focus', function(e){
				that._removeClass(e.target);
			});

			on(el.nameEl, 'blur', function(e){
				nameValidResult = that.defender.getItemResult(el.nameEl);
				if(nameValidResult){
					that._isRepeat(e.target);
				}
			});

			$(el.unitTypeEl).each(function(ele){
				on(ele, 'change', function(e){
					that._setUnit(e.target);
				});
			});

			on(el.storageUnitTypeEl, 'change', function(e){
				that._changeStorageUnitType(e.target);
			})

			on(el.storageUnitEl, 'change', function(e){
				that._setStorageWarning(e.target);
			});

			on(el.storageWarningEl, 'focus blur', function(e){
				that._moveTip(e.target);
			});

			on(el.submitTrigger, 'click', function(){
				that._valid();
				return false;
			})
		},
		/**
		 * 将表单加入验证池
		 * @return {[type]} [description]
		 */
		_defender: function(){
			var
				that = this;

			that.defender = Defender.client(el.submitForm, {
				showTip: true
			});
		},
		/**
		 * 当名称控件失去焦点，判断该名称是否重复
		 * @return {[type]} [description]
		 */
		_isRepeat: function(e){
			var
				that = this,
				name = DOM.val(e),
				info = {
					id: "",
					name: name,
					isUpdated: ""
				};
			
			IngredientsManagementIO.hasName(info, function(rs, errMsg){
				if(rs){
					that.isRepeat = false;
					if(!DOM.hasClass(e, 'success-field')){
						DOM.addClass(e, 'success-field');
					}
				}else{
					that.isRepeat = true;
					that._setRepeatTip(e);
				}
			});
		},
		/**
		 * 当名称重复时，设置提示
		 * @return {[type]} [description]
		 */
		_setRepeatTip: function(e){
			var
				that = this,
				nameEl = get(e),
				tipEl = DOM.next(nameEl);

			DOM.removeClass(nameEl, 'success-field');
			DOM.addClass(nameEl, 'error-field');
			DOM.text(tipEl, '请重新输入原配料名称');
		},
		/**
		 * 当名称域聚焦时，清除相关类
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_removeClass: function(e){
			var
				that = this;

			if(DOM.hasClass(e, 'error-field')){
				DOM.removeClass(e, 'error-field');
			}
		},
		/**
		 * 根据单位类型，设置单位选项
		 * @param {[type]} e [description]
		 */
		_setUnit: function(e){
			var
				that = this,
				unitType = DOM.val(e),
				weightUnitEl = DOM.next(e),
				numberUnitEl = DOM.next(weightUnitEl);

			if(unitType == 1){
				DOM.addClass(numberUnitEl, 'hidden');
				DOM.removeClass(weightUnitEl, 'hidden');
				DOM.removeAttr(weightUnitEl, 'disabled');
				DOM.attr(numberUnitEl, 'disabled', 'disabled');
			}else if(unitType == 2){
				DOM.addClass(weightUnitEl, 'hidden');
				DOM.removeClass(numberUnitEl, 'hidden');
				DOM.removeAttr(numberUnitEl, 'disabled');
				DOM.attr(weightUnitEl, 'disabled', 'disabled');
			}
		},
		/**
		 * 当库存单位类型改变时，设置库存预警的初始单位
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_changeStorageUnitType: function(e){
			var
				that = this,
				next = DOM.next(e);
				storageUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next;

			that._setStorageWarning(storageUnitEl);
		},
		/**
		 * 当库存单位改变时，设置库存预警的单位
		 * @return {[type]} [description]
		 */
		_setStorageWarning: function(e){
			var
				that = this,
				storageUnitId = DOM.val(e),
				options = DOM.children(e),
				val;

			S.each(options, function(ele){
				val = DOM.val(ele);
				if(val == storageUnitId){
					storageUnit = DOM.attr(ele, DATA_UNIT_NAME);
				}
			});
			DOM.val(el.storageWarningUnitEl, storageUnit);
		},
		/**
		 * 将每个库存预警的提示信息，移动到对应的单位元素的后面
		 * @return {[type]} [description]
		 */
		_moveTip: function(e){
			var
				that = this,
				eleClass = DOM.attr(e, "class"),
				contain = eleClass.indexOf('-field'),
				tipEl = DOM.next(e, 'span'),
				unitEl = DOM.next(e, el.storageWarningUnitEl);

			if(contain > 0){
				DOM.insertAfter(tipEl, unitEl);
			}
		},
		/**
		 * 验证表单
		 * @return {[type]} [description]
		 */
		_valid: function(){
			var
				that = this,
				isRepeat = that.isRepeat;
			
			that.defender.validAll(function(rs){
				if(rs){
					if(!isRepeat){
						that._submit();
					}else{
						that._setRepeatTip(el.nameEl);
					}
				}else{
					$(el.storageWarningEl).each(function(ele){						
						that._moveTip(ele);
					});
					Dialog.alert('填写不符合规则，请重新填写表单！');
				}
			})
		},
		/**
		 * 提交表单
		 * @return {[type]} [description]
		 */
		_submit: function(){
			var
				that = this,
				form = DOM.serialize(el.submitForm), 
				tipEl = get(el.tipEl);
			
			IngredientsManagementIO.submitIngredient(form, function(rs, errMsg){
				if(rs){
					DOM.addClass(tipEl, 'alert-success');
				}else{
					DOM.addClass(tipEl, 'alert-warning');
					DOM.text(tipEl, errMsg);
				}
				DOM.removeClass(tipEl, 'hidden');
				setTimeout(function(){
					DOM.addClass(tipEl, 'hidden');
				}, 5000);
			});
		}
	});

	return Core;
}, {
	requires: [
		'mod/defender',
		'widget/dialog',
		'pio/store-management/ingredients-management'
	]
});