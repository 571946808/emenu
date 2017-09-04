/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-原配料管理-添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2016.05.23
* ==NOTES:=============================================
* v1.0.0(2016.05.23):
     初始生成
* -------------------------------------------------------------------------*/
KISSY.add('page/store-management/ingredients-management-edit', function(S, Core){
	PW.namespace('page.StoreManagement.IngredientsManagementEdit');
	PW.page.StoreManagement.IngredientsManagementEdit = function(param){
		new Core(param);
	}
}, {
	requires: [
		'ingredients-management/edit'
	]
});
/***********************************************************/
KISSY.add('ingredients-management/edit', function(S){
	var
		$ = S.all, DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		config = {},
		Defender = PW.mod.Defender,
		Dialog = PW.widget.Dialog,
		IngredientsManagementIO = PW.io.StoreManagement.IngredientsManagement,
		el = {
			//原配料Id元素
			ingredientIdEl: '.J_ingredientId',
			//原配料的原名称元素
			ingredientNameEl: '.J_ingredientName',
			//提交表单
			submitForm: '.J_submitForm',
			//根据“是否可更改标志”元素控制的控件元素
			isDisabledEl: '.J_isDisabled',
			//是否可更改名字标志元素
			isUpdatedEl: '.J_isUpdated',
			//原配料名称元素
			nameEl: '.J_name',
			//单位类型元素
			unitTypeEl: '.J_unitType',
			//库存单位类型元素
			storageUnitTypeEl: '.J_storageUnitType',
			//库存单位元素
			storageUnitEl: '.J_storageUnit',
			//库存预警上限元素
			maxStorageEl: '.J_maxStorageWarning',
			//库存预警下限元素
			minStorageEl: '.J_minStorageWarning',
			//库存预警元素
			storageWarningEl: '.J_storageWarning',
			//库存预警单位元素
			storageWarningUnitEl: '.J_storageWarningUnit',
			//库存单位到成本卡单位的换算关系元素
			storageToCostRatioEl: '.J_storageToCostRatio',
			//均价元素
			averagePriceEl: '.J_averagePrice',
			//结存元素
			realQuantityEl: '.J_realQuantity',
			//总数量元素
			totalQuantityEl: '.J_totalQuantity',
			//提交表单触发器
			submitTrigger: '.J_submit',
			//提示元素
			tipEl: '.J_tip'
		},
		DATA_UNIT_NAME = 'data-unit-name',
		DATA_VALID_RULE = 'data-valid-rule',
		DATA_VALID_TIP = 'data-valid-tip';

	function Core(param){
		this.opts = S.mix(config, param);
		this.defender;
		this.isRepeat = true;
		this.init();
	}

	S.augment(Core, {
		init: function(){
			this._defender();
			this._initUnitType();
			this._isUpdated();
			this._addEventListener();
		},
		_addEventListener: function(){
			var
				that = this;

			on(el.nameEl, 'blur', function(e){
				that._isEdited(e.target);
			});

			$(el.unitTypeEl).each(function(ele){
				on(ele, 'change', function(e){
					that._setUnit(e.target);
				});
			});

			on(el.storageUnitTypeEl, 'change', function(){
				that._ifGetRelatedSettings();
			});

			on(el.storageUnitEl, 'change', function(){
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
		 * 根据“是否可更改标志”元素控制的控件元素
		 * @return {Boolean} [description]
		 */
		_isUpdated: function(){
			var
				that = this,
				isUpdatedMark = DOM.val(el.isUpdatedEl),
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
		 * 判断当前名称是否可编辑
		 * @param  {[type]}  e [description]
		 * @return {Boolean}   [description]
		 */
		_isEdited: function(e){
			var
				that = this,
				nameValidResult,
				updateMark = DOM.val(el.isUpdatedEl);

			if(updateMark == 0){
				nameValidResult = that.defender.getItemResult(el.nameEl);
				if(nameValidResult){
					that._isRepeat(e);
				}
			}
		},
		/**
		 * 当名称控件失去焦点，判断该名称是否重复
		 * @return {[type]} [description]
		 */
		_isRepeat: function(e){
			var
				that = this,
				id = DOM.val(el.ingredientIdEl),
				originalName = DOM.val(el.ingredientNameEl),
				name = DOM.val(el.nameEl),
				isUpdated = DOM.val(el.isUpdatedEl),
				info = {
					id: id,
					name: name,
					isUpdated: isUpdated
				};
			
			if(originalName != name){
				IngredientsManagementIO.hasName(info, function(rs, errMsg){
					if(rs){
						that.isRepeat = false;
						if(!DOM.hasClass(e, 'success-field')){
							DOM.removeClass(e, 'error-field');
							DOM.addClass(e, 'success-field');
						}
					}else{
						that.isRepeat = true;
						that._setRepeatTip(e);
					}
				});
			}else{
				that.isRepeat = false;
			}
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
		 * 根据单位类型，设置单位
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
				ingredientId = DOM.val(el.ingredientIdEl),
				next = DOM.next(el.storageUnitTypeEl),
				storageUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next,
				storageUnitId = DOM.val(storageUnitEl),
				ratio = DOM.val(el.storageToCostRatioEl),
				info = {
					id: ingredientId,
					storageUnitId: storageUnitId,
					storageToCostCardRatio: ratio
				};

			IngredientsManagementIO.getRelatedSettings(info, function(rs, data, errMsg){
				if(rs){
					that._setRelatedSettings(data);
				}else{
					Dialog.alert(errMsg);
				}
			})
		},
		/**
		 * 获取当前库存单位名称
		 * @return {[type]} [description]
		 */
		_getSrorageUnit: function(){
			var
				that = this,
				next = DOM.next(el.storageUnitTypeEl),
				storageUnitEl = DOM.hasAttr(next, 'disabled') ? DOM.next(next) : next,
				storageUnitId = DOM.val(storageUnitEl),
				options = DOM.children(storageUnitEl),
				value,
				storageUnit;

			S.each(options, function(ele){
				value = DOM.val(ele);
				if(value == storageUnitId){
					storageUnit = DOM.attr(ele, DATA_UNIT_NAME);
				}
			});

			return storageUnit;
		},
		/**
		 * 当请求成功后，设置对应库存单位下的库存预警、均价、结存、总数量
		 * @param {[type]} data [description]
		 */
		_setRelatedSettings: function(data){
			var
				that = this,
				storageUnit = that._getSrorageUnit(),
				maxStorageEl = get(el.maxStorageEl),
				maxStorageUnitEl = DOM.next(maxStorageEl),
				minStorageEl = get(el.minStorageEl),
				minStorageUnitEl = DOM.next(minStorageEl),
				averagePriceEl = get(el.averagePriceEl),
				realQuantityEl = get(el.realQuantityEl),
				realQuantityUnitEl = DOM.next(realQuantityEl),
				totalQuantityEl = get(el.totalQuantityEl),
				totalQuantityUnitEl = DOM.next(totalQuantityEl);

			DOM.val(maxStorageEl, data.maxStorageQuantity);
			DOM.val(maxStorageUnitEl,storageUnit);
			DOM.val(minStorageEl, data.minStorageQuantity);
			DOM.val(minStorageUnitEl, storageUnit);
			DOM.val(averagePriceEl, data.averagePrice);
			DOM.val(realQuantityEl, data.realQuantity);
			DOM.val(realQuantityUnitEl, storageUnit);
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
				that = this,
				isRepeat = that.isRepeat,
				updateMark = DOM.val(el.isUpdatedEl);
			
			that.defender.validAll(function(rs){
				if(rs){
					if(!isRepeat){
						that._submit();
					}else{
						if(updateMark == 0){
							that._setRepeatTip(el.nameEl);
						}
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
			
			IngredientsManagementIO.submitEditIngredient(form, function(rs, errMsg){
				if(rs){
					DOM.addClass(tipEl, 'alert-success');
				}else{
					DOM.addClass(tipEl, 'alert-warning');
					DOM.text(tipEl, errMsg);
				}
			});
			that._autoToggleTipEl(tipEl);
		},
		/**
		 * 表单提交后，自动切换显示提示元素
		 * @param  {[type]} tipEl [description]
		 * @return {[type]}       [description]
		 */
		_autoToggleTipEl: function(tipEl){
			var
				that = this;

			DOM.removeClass(tipEl, 'hidden');
			setTimeout(function(){
				DOM.addClass(tipEl, 'hidden');
			}, 5000);
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