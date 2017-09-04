/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-库存物品管理-添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2016.05.28
* ==NOTES:=============================================
* v1.0.0(2016.05.28):
     初始生成
* -------------------------------------------------------------------------*/
KISSY.add('page/store-management/store-item-management-edit', function(S, Core){
	PW.namespace('page.StoreManagement.StoreItemManagementEdit');
	PW.page.StoreManagement.StoreItemManagementEdit = function(param){
		new Core(param);
	}
}, {
	requires: [
		'store-item-management/edit'
	]
});
/***********************************************************/
KISSY.add('store-item-management/edit', function(S){
	var
		$ = S.all, DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		config = {},
		Defender = PW.mod.Defender,
		Dialog = PW.widget.Dialog,
		StoreItemManagementIO = PW.io.StoreManagement.StoreItemManagement,
		el = {
			//提交表单
			submitForm: '.J_submitForm',
			//库存物品id元素
			storeItemIdEl: '.J_storeItemId',
			//库存物品名称元素
			nameEl: '.J_name',
			//是否可更改部分控件的标志元素
			isUpdatedMarkEl: '.J_isUpdated',
			//根据“是否可更改标志”元素控制的控件元素
			isDisabledEl: '.J_isDisabled',
			//原配料元素
			ingredientEl: '.J_ingredient',
			//单位类型元素
			unitTypeEl: '.J_unitType',
			//订货单位类型元素
			orderUnitTypeEl: '.J_orderUnitType',
			//订货单位元素
			orderUnitEl: '.J_orderUnit',
			//库存单位类型元素
			storageUnitTypeEl: '.J_storageUnitType',
			//库存单位元素
			storageUnitEl: '.J_storageUnit',
			//库存单位到成本卡单位的换算关系元素
			storageToCostRatioEl: '.J_storageToCostRatio',
			//成本卡单位元素
			costCardUnitEl: '.J_costCardUnit',
			//计数单位元素
			countUnitEl: '.J_countUnit',
			//库存预警上限元素
			maxStorageEl: '.J_maxStorageWarning',
			//库存预警下限元素
			minStorageEl: '.J_minStorageWarning',
			//库存预警元素
			storageWarningEl: '.J_storageWarning',
			//库存预警单位元素
			storageWarningUnitEl: '.J_storageWarningUnit',
			//总数量元素
			totalQuantityEl: '.J_totalQuantity',
			//提交表单触发器
			submitTrigger: '.J_submit',
			//提示元素
			tipEl: '.J_tip'
		},
		DATA_UNIT_NAME = 'data-unit-name';

	function Core(param){
		this.opts = S.mix(config, param);
		this.defender;
		this.init();
	}

	S.augment(Core, {
		init: function(){
			this._defender();
			this._initUnitType();
			this._isUpdated();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			$(el.unitTypeEl).each(function(ele){
				on(ele, 'change', function(e){
					that._setUnit(e.target);
				});
			});

			on(el.ingredientEl, 'change', function(e){
				that._getCostCardUnit(e.target);
			});

			on(el.orderUnitTypeEl, 'change', function(e){
				that._setCountUnitType(e.target);
			})

			on(el.orderUnitEl, 'change', function(e){
				that._setCountUnit(e.target);
			});

			on(el.storageUnitTypeEl, 'change', function(e){
				that._ifGetRelatedSettings();
			});

			on(el.storageUnitEl, 'change', function(e){
				that._ifGetRelatedSettings();
			});

			on(el.storageToCostRatioEl, 'blur', function(){
				that._ifGetRelatedSettings();
			});

			on(el.storageWarningEl, 'focus blur', function(e){
				that._moveTip(e.target);
			});

			on(el.submitTrigger, 'click', function(){
				that._valid();
				return false;
			});
		},
		/**
		 * 根据“是否可更改标志”元素控制的控件元素
		 * @return {Boolean} [description]
		 */
		_isUpdated: function(){
			var
				that = this,
				isUpdatedMark = DOM.val(el.isUpdatedMarkEl),
				disabledEls = query(el.isDisabledEl),
				div,
				label,
				span;

			if(isUpdatedMark == 1){
				S.each(disabledEls, function(ele){
					div = DOM.parent(ele);
					label = DOM.prev(div);
					span = DOM.children(label);
					DOM.removeAttr(ele, 'data-valid-rule');
					DOM.removeAttr(ele, 'data-valid-tip');
					DOM.attr(ele, 'disabled', 'disabled');
					DOM.remove(span);
				});
			}
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
		 * 页面加载后，设置各个单位类型默认的单位
		 * @return {[type]} [description]
		 */
		_initUnitType: function(){
			var
				that = this,
				unitTypeEls = query(el.unitTypeEl);

			S.each(unitTypeEls, function(ele){
				that._setUnit(ele);
			});
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
		 * 改变原配料之后，获取相应的成本卡单位
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_getCostCardUnit: function(e){
			var
				that = this,
				ingredientId = DOM.val(e),
				costCardUnitEl = get(el.costCardUnitEl),
				costCardUnitIdEl = DOM.prev(costCardUnitEl);
				info = {
					ingredientId: ingredientId
				};

			StoreItemManagementIO.getCostCardUnit(info, function(rs, data, errMsg){
				if(rs){
					DOM.val(costCardUnitIdEl, data.costCardUnitId);
					DOM.val(costCardUnitEl, data.costCardUnitName);
				}else{
					Dialog.alert(errMsg);
				}
			});
		},
		/**
		 * 当单位类型改变时，设置相关单位的初始单位
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_setCountUnitType: function(e){
			var
				that = this,
				next = DOM.next(e);
				originUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next;

			that._setCountUnit(originUnitEl);
		},
		/**
		 * 设置对应单位值下，所对应的单位实际文本
		 * @return {[type]} [description]
		 */
		_setCountUnit: function(e){
			var
				that = this,
				countUnitIdEl = DOM.prev(el.countUnitEl),
				unitId = DOM.val(e),
				storageUnit = that._getUnit(e);

			DOM.val(countUnitIdEl, unitId);
			DOM.val(el.countUnitEl, storageUnit);
		},
		/**
		 * 获取对应单位值下，所对应的单位实际文本
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_getUnit: function(e){
			var
				that = this,
				unitId = DOM.val(e),
				options = DOM.children(e),
				val,
				unit;

			S.each(options, function(ele){
				val = DOM.val(ele);
				if(val == unitId){
					unit = DOM.attr(ele, DATA_UNIT_NAME);
				}
			});

			return unit;
		},
		/**
		 * 判断是否获取与库存单位相关的配置项，如果换算关系未通过验证，则不获取
		 * @return {[type]} [description]
		 */
		_ifGetRelatedSettings: function(){
			var
				that = this,
				RatioValidResult = that.defender.getItemResult(el.storageToCostRatioEl);
			
			if(RatioValidResult){
				that._getRelatedSettings();
			}
		},
		/**
		 * 根据原配料id、库存单位及其到成本卡换算关系，获取均价、结存、总数量信息
		 * @return {[type]} [description]
		 */
		_getRelatedSettings: function(){
			var
				that = this,
				storeItemId = DOM.val(el.storeItemIdEl),
				next = DOM.next(el.storageUnitTypeEl),
				storageUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next,
				storageUnitId = DOM.val(storageUnitEl),
				ratio = DOM.val(el.storageToCostRatioEl),
				info = {
					id: storeItemId,
					storageUnitId: storageUnitId,
					storageToCostCardRatio: ratio
				};

			StoreItemManagementIO.getRelatedSettings(info, function(rs, data, errMsg){
				if(rs){
					that._setRelatedSettings(data);
				}else{
					Dialog.alert(errMsg);
				}
			})
		},
		/**
		 * 当请求成功后，设置对应库存单位下的库存预警、总数量
		 * @param {[type]} data [description]
		 */
		_setRelatedSettings: function(data){
			var
				that = this,
				next = DOM.next(el.storageUnitTypeEl);
				storageUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next;
				storageUnit = that._getUnit(storageUnitEl),
				maxStorageEl = get(el.maxStorageEl),
				maxStorageUnitEl = DOM.next(maxStorageEl),
				minStorageEl = get(el.minStorageEl),
				minStorageUnitEl = DOM.next(minStorageEl),
				totalQuantityEl = get(el.totalQuantityEl),
				totalQuantityUnitEl = DOM.next(totalQuantityEl);

			DOM.val(maxStorageEl, data.maxStorageQuantity);
			DOM.val(maxStorageUnitEl,storageUnit);
			DOM.val(minStorageEl, data.minStorageQuantity);
			DOM.val(minStorageUnitEl, storageUnit);
			DOM.val(totalQuantityEl, data.totalQuantity);
			DOM.val(totalQuantityUnitEl, storageUnit);
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
				that = this;
			
			that.defender.validAll(function(rs){
				if(rs){
					that._submit();
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
			
			StoreItemManagementIO.submitEditedStorageItem(form, function(rs, errMsg){
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
		'pio/store-management/store-item-management'
	]
});