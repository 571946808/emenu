/*-----------------------------------------------------------------------------
* @Description:     管理员-菜品管理-菜品管理
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.11
* ==NOTES:=============================================
* v1.0.0(2015.9.11):
     初始生成
  v1.0.0(2015.9.17):
     添加编辑菜品模块Add
* ---------------------------------------------------------------------------*/

KISSY.add('page/dish-management/dish-management-add', function(S, Add){
	PW.namespace('page.DishManagement.Add');
	PW.page.DishManagement.Add = function(param){
		new Add(param);
	}
},{
	requires: [
		'dish-management/add'
	]
});
/**
 * 菜品管理 添加菜品基本信息
 * @param  {[type]} S){	var                     DOM [description]
 * @param  {Object} el       [description]
 * @param  {String} BTN_KEY  [description]
 * @return {[type]}          [description]
 */
KISSY.add('dish-management/add', function(S, Promotion, Detail, Taste){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
        	// 表单
        	operForm: '.J_operForm',
        	// 提交按钮
        	submitBtn: '.J_submitBtn',
            // 根分类
            rootClassTrigger: '.J_rootClass',
            // 菜品大类
            bigClassTrigger: '.J_bigClass',
            // 菜品小类
            smallClassTrigger: '.J_smallClass',
            // 根计量单位分类
            unitClassTrigger: '.J_unitClass',
            // 计量单位
            unitTrigger: '.J_unit',
            // 定价
            priceEl: '.J_price',
            // 促销方式输入框
            promotionEl: '.J_promotion',
            // 无促销时的内容
            noPromotionEl: '.J_noPromotion',
            // 促销方式
            promotionTypeEl: '.J_promotionType',
            // 菜品详情-菜品
            dishEl: '.J_dish',
            // 菜品详情-原料
            ingredientEl: '.J_ingredient',
            // 菜品名称
            dishNameEl: '.J_name',
            // 助记码
            assistantCodeEl: '.J_assistantCode',
            // 联动级数
            linkageEl: '.J_linkage',
            // 重量单位列表
            unitWeightEl: '.J_unitWeight',
            // 数量单位列表
            unitNumberEl: '.J_unitNumber'
        },
        BTN_KEY = 'btn';

    function Add(param){
    	this.opts = S.merge(config, param);
    	this.defender;
    	this.btn;
    	this._init();
    }

    S.augment(Add, S.EventTarget, {
    	_init: function(){
            this._defender();
    		this.btn = DOM.data(el.submitBtn, BTN_KEY);
            DOM.removeAttr(el.bigClassTrigger, 'disabled');
            this.promotion = new Promotion(this.defender);
            this.detail = new Detail();
            this.taste = new Taste();
            this._selectClass();
            this._showTip();
    		this._bulidEvt();
    	},
    	_bulidEvt: function(){
    		var
    			that = this,
    	  		btn = that.btn,
                linkage = DOM.val(el.linkageEl);

    		btn.on('loading', function(){
    			that._submitForm();
    			return false;
    		});

            on(el.priceEl, 'keyup', function(e){
                that._showPrice(e.target);
            });

            on(el.rootClassTrigger, 'change', function(){
                that._validSelectItem(el.rootClassTrigger, '菜品总分类', true);
            });

            on(el.unitClassTrigger, 'change', function(){
                that._validSelectItem(el.unitClassTrigger, '单位类型', true);
                that._toggleUnit(DOM.val(el.unitClassTrigger));
            });

            on(el.dishNameEl, 'blur', function(){
                that._getAssistantCode();
            });

            on(el.unitTrigger, 'change', function(){
                that._validSelectItem(this, '单位', true);
            });

            if(linkage == 3){
                on(el.bigClassTrigger, 'change', function(){
                    that._validSelectItem(el.bigClassTrigger, '菜品大类', true);
                });
                on(el.smallClassTrigger, 'change', function(){
                    that._validSelectItem(el.smallClassTrigger, '菜品小类', true);
                });
            }else if(linkage == 2){
                on(el.bigClassTrigger, 'change', function(){
                    that._validSelectItem(el.bigClassTrigger, '菜品大类', true);
                });
            }
    	},
        /**
         * 显示重量或者数量单位
         * @param val
         * @private
         */
        _toggleUnit: function(val){
            var
                that = this;

            if(val == 1){
                DOM.addClass(el.unitNumberEl, 'hidden');
                DOM.removeClass(el.unitWeightEl, 'hidden');
                DOM.attr('.J_unitNumberSelect', 'disabled', 'disabled');
                DOM.removeAttr('.J_unitWeightSelect', 'disabled');
            }else if(val == 2){
                DOM.addClass(el.unitWeightEl, 'hidden');
                DOM.removeClass(el.unitNumberEl, 'hidden');
                DOM.attr('.J_unitWeightSelect', 'disabled', 'disabled');
                DOM.removeAttr('.J_unitNumberSelect', 'disabled');
            }
        },
        /**
         * 获取菜品助记码
         * @private
         */
        _getAssistantCode: function(){
            var
                that = this,
                result;
            result = that.defender.getItemResult(el.dishNameEl);
            if(result){
                PW.module.GetAssistantCode.client({
                    trigger: el.dishNameEl,
                    renderTo: el.assistantCodeEl
                });
            }
        },
        /**
         * 总体通过rootClassId值来整体调配模块的显示情况
         * @return {[type]} [description]
         */
        _showModule: function(){
            var
                that = this,
                rootClassId = DOM.val(el.rootClassTrigger),
                dishDetail = that.detail;
            if(rootClassId == 2){
                dishDetail.showAll();
                dishDetail.showIngredient();
            }else if(rootClassId == 3){ //如果是酒水
                dishDetail.hideAll();
            }else if(rootClassId == 5){  //如果是套餐
                dishDetail.showAll();
                dishDetail.hideIngredient();
            }
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
         * 促销价格模块处，显示促销的价格
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _showPrice: function(e){
            var
                that = this,
                promotionType = DOM.val(el.promotionTypeEl),
                promotionEl = get(el.promotionEl, el.operForm),
                price,
                noPromotionEl;

            if(promotionType == 1){
                price = DOM.val(e);
                noPromotionEl = get(el.noPromotionEl, el.operForm);
                DOM.text(noPromotionEl, price);
                DOM.addClass(promotionEl, 'hidden');
                DOM.val(el.promotionEl, price);
            }
        },
        /**
         * 添加菜品信息：菜品分类联动
         * @return {[type]} [description]
         */
        _selectClass: function(){
            var
                that = this,
                linkageObj,
                linkage = DOM.val(el.linkageEl);

            if(linkage == 3){
                linkageObj= PW.module.Linkage.client({
                    linkage: 3,
                    firstLinkage: el.rootClassTrigger,
                    secondLinkage: el.bigClassTrigger,
                    thirdLinkage: el.smallClassTrigger,
                    manageIO: {
                        sendLinkage: DishManagementIO.sendClassLinkage
                    }
                });
            }else if(linkage == 2){
                linkageObj= PW.module.Linkage.client({
                    linkage: 2,
                    firstLinkage: el.rootClassTrigger,
                    secondLinkage: el.bigClassTrigger,
                    manageIO: {
                        sendLinkage: DishManagementIO.sendClassLinkage
                    }
                });
            }
        },
        /**
         * 对添加表单中的下拉进行验证，如果下拉列表的值为-1，则不允许提交，并且聚焦提示
         * @param  {[type]} trigger [description]
         * @return {[type]}         [description]
         */
        _validSelectItem: function(trigger, tip, bool){
            var
                that = this,
                form = get(el.operForm),
                btn = that.btn;
            if(DOM.val(trigger) == -1){
                DOM.addClass(trigger, 'error-field');
                if(bool){
                    Dialog.alert('请选择' + tip + '!', function(){
                        get(trigger).focus();
                    });
                }
                btn.reset();
                return false;
            }else{
                DOM.removeClass(trigger, 'error-field');
                return true;
            }
        },
        /**
         * 提交添加菜品的表单
         * @return {[type]} [description]
         */
    	_submitForm: function(){
    		var
    			that = this,
    			form = get(el.operForm),
    			btn = that.btn,
                errInp,
                result,
                linkage = DOM.val(el.linkageEl),
                result1, result2, result3;

            if(linkage == 3){
                // if(DOM.val(el.rootClassTrigger) == -1 || DOM.val(el.smallClassTrigger) == -1){
                //     Dialog.alert('请选择菜品总分类和菜品小类!', function(){
                //         if(DOM.val(el.rootClassTrigger) == -1){
                //             DOM.addClass(el.rootClassTrigger, 'error-field');
                //             get(el.rootClassTrigger).focus();
                //         }else if(DOM.val(el.smallClassTrigger) == -1){
                //             DOM.addClass(el.smallClassTrigger, 'error-field');
                //             DOM.addClass(el.bigClassTrigger, 'error-field');
                //             get(el.smallClassTrigger).focus();
                //         }
                //     });
                //     btn.reset();
                //     return false;
                // }
                if(DOM.val(el.rootClassTrigger) == -1 || DOM.val(el.smallClassTrigger) == -1){
                    if(DOM.val(el.rootClassTrigger) == -1){
                        Dialog.alert('请选择菜品分类!', function(){
                            DOM.addClass(el.rootClassTrigger, 'error-field');
                            DOM.addClass(el.bigClassTrigger, 'error-field');
                            DOM.addClass(el.smallClassTrigger, 'error-field');
                            get(el.rootClassTrigger).focus();
                        });
                    }else if(DOM.val(el.bigClassTrigger) != -1 && DOM.val(el.smallClassTrigger) == -1){
                        Dialog.alert('请选择菜品小类!', function(){
                            DOM.addClass(el.smallClassTrigger, 'error-field');
                            DOM.removeClass(el.bigClassTrigger, 'error-field');
                            get(el.smallClassTrigger).focus();
                        }); 
                    }else if(DOM.val(el.bigClassTrigger) == -1 && DOM.val(el.smallClassTrigger) == -1){
                        Dialog.alert('请选择菜品大类和小类!', function(){
                            DOM.addClass(el.smallClassTrigger, 'error-field');
                            DOM.addClass(el.bigClassTrigger, 'error-field');
                            get(el.bigClassTrigger).focus();
                        }); 
                    }
                    btn.reset();
                    return false;
                }
            }else if(linkage == 2){
                if(DOM.val(el.rootClassTrigger) == -1 || DOM.val(el.bigClassTrigger) == -1){
                    Dialog.alert('请选择菜品总分类和菜品大类!', function(){
                        if(DOM.val(el.rootClassTrigger) == -1){
                            DOM.addClass(el.rootClassTrigger, 'error-field');
                            DOM.addClass(el.bigClassTrigger, 'error-field');
                            get(el.rootClassTrigger).focus();
                        }else if(DOM.val(el.bigClassTrigger) == -1){
                            DOM.addClass(el.bigClassTrigger, 'error-field');
                            get(el.bigClassTrigger).focus();
                        }
                    });
                    btn.reset();
                    return false;
                }
            }
            that.defender.validAll(function(rs){
                if(rs){
                    that._setClassifyValid();
                    if(that._validUnit()){
                        setTimeout(function(){
                            form.submit();
                        }, 1000);
                    }
                }else{
                    btn.reset();
                    errInp = get('.error-field', el.operForm);
                    if(errInp){
                        errInp.focus();
                    }
                }
            });
    	},
        /**
         * 验证单位类型是否已选
         * @returns {boolean}
         * @private
         */
        _validUnit: function(){
            var
                that = this,
                btn = that.btn,
                unitClassTriggerEl = get(el.unitClassTrigger, el.operForm);

            if(DOM.val(unitClassTriggerEl) == -1){
                Dialog.alert('请选择单位类型!', function(){
                    unitClassTriggerEl.focus();
                    DOM.addClass(unitClassTriggerEl, '.error-field');
                });
                btn.reset();
                return false;
            }else{
                return true;
            }
        },
        /**
         * 控制是传菜品大类还是菜品小类
         * @private
         */
        _setClassifyValid: function(){
            var
                that = this,
                rootClassSelect = S.one(el.rootClassTrigger),
                bigClassSelect = S.one(el.bigClassTrigger),
                smallClassSelect = S.one(el.smallClassTrigger);

            if(smallClassSelect){
                DOM.attr(bigClassSelect, 'disabled', 'disabled');
            }
        },
        /**
         * 控制显示提示信息
         * @private
         */
        _showTip: function(){
            var
                that = this,
                tipContainer = S.one('.J_tip');

            if(tipContainer){
                setTimeout(function(){
                    DOM.remove(tipContainer);
                }, 2000);
            }
        }
    });

   	return Add;
},{
	requires: [
        'dish/promotion',
        'dish/detail',
        'dish/taste',
		'mod/defender',
		'widget/btn',
        'module/linkage',
        'module/get-assistantCode',
        'widget/dialog',
        'pio/dish-management/dish-management'
	]
});
KISSY.add('dish/promotion', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        config = {},
        el = {
            // 操作表单
            operForm: '.J_operForm',
            // 定价
            priceEl: '.J_price',
            // 促销方式输入框
            promotionEl: '.J_promotion',
            // 无促销时的内容
            noPromotionEl: '.J_noPromotion',
            // 促销方式
            promotionTypeEl: '.J_promotionType',
            // 促销单位
            promotionUnitEl: '.J_promotionUnit'
        },
        DATA_VALID_RULE = 'data-valid-rule',
        DATA_VALID_TIP = 'data-valid-tip',
        DATA_VALID_ID = 'data-valid-id';

    function Promotion(defender){
        this.defender = defender;
        this._init();
    }

    S.augment(Promotion, S.EventTarget, {
        _init: function(){
            this._initPromotionInp();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
            on(el.promotionTypeEl, 'change', function(){
                that._showPromotionInp();
            });
        },
        /**
         * 初始促销输入框和促销单位
         * @return {[type]} [description]
         */
        _initPromotionInp: function(){
            var
                that = this,
                promotionEl,
                promotionType = DOM.val(el.promotionTypeEl),
                noPromotionEl = get(el.noPromotionEl, el.operForm),
                price = DOM.val(el.priceEl);

            if(promotionType == 1){
                DOM.text(noPromotionEl, price);
                DOM.text(el.promotionUnitEl, '元');
            }else if(promotionType == 2){
                DOM.text(el.promotionUnitEl, '折');
            }else{
                DOM.text(el.promotionUnitEl, '元');
            }
            that.defender.refresh();
        },
        /**
         * 显示促销价格下的输入框
         * @param  {[type]} trigger [description]
         * @return {[type]}         [description]
         */
        _showPromotionInp: function(trigger){
            var
                that = this,
                promotionEl,
                promotionType = DOM.val(el.promotionTypeEl),
                noPromotionEl = get(el.noPromotionEl, el.operForm),
                priceEl = get(el.priceEl, el.operForm),
                price = DOM.val(priceEl);
            if(promotionType == 1){
                DOM.text(noPromotionEl, price);
                DOM.text(el.promotionUnitEl, '元');
            }else if(promotionType == 2){
                DOM.empty(noPromotionEl);
                DOM.text(el.promotionUnitEl, '折');
            }else{
                DOM.empty(noPromotionEl);
                promotionEl = DOM.next(noPromotionEl);
                if(price != ''){
                    DOM.val(promotionEl, price);
                }
                DOM.text(el.promotionUnitEl, '元');
            }
            that.defender.refresh();
        }
    });

    return Promotion;
},{
    requires: [
        'module/select-valid',
        'core'
    ]
});
/**
 * 菜品详情
 * @param  {[type]} S          [description]
 * @param  {[type]} Ingredient [description]
 * @return {[type]}            [description]
 */
KISSY.add('dish/detail', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        Juicer = PW.mod.Juicer.client,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
            // 操作表单
            operForm: '.J_operForm',
            // 菜品详情
            dishDetailEl: '.J_dishDetail',
             // 菜品详情-菜品
            dishEl: '.J_dish',
            // 菜品详情-原料
            ingredientEl: '.J_ingredient',
            // 菜品详情-添加原料触发器
            ingredientAddTrigger: '.J_ingredientAdd',
            // 菜品详情-添加菜品触发器
            dishAddTrigger: '.J_dishAdd',
            // 备选原材料模板
            beforeIngredientTemp: '#beforeIngredient',
            // 已选原材料模板
            afterIngredientTemp: '#afterIngredient',
            // 原材料添加表单
            ingredientForm: '.J_ingredientForm',
            // 存放原材料标签容器
            ingredientTagsEl: '.J_ingredient-tags',
            // 删除标签触发器
            delTagTrigger: '.J_delTag'
        },
        TIP = ['确定删除此原材料吗？'],
        SUCCESS_TIP = ['删除成功！'];
        
    function Detail(param){
        this._init();
    }

    S.augment(Detail, S.EventTarget, {
        _init: function(){
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
        },
        /**
         * 删除原材料
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delIngredient: function(e){
            var
                that = this,
                id = e.id,
                tagEl = e.tagEl;
            Dialog.confirm(TIP[0], function(){
                DishManagementIO.delIngredient({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[0]);
                        DOM.remove(tagEl);
                    }
                });
            });
        },
        /**
         * 渲染选择好的原材料
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        _renderTagIngredient: function(items){
            var
                that = this,
                ingredient = that.ingredient,
                id,
                tds,
                data = {},
                tagStr = '',
                inputEl,
                tagDOM;

            S.each(items, function(item){
                id = DOM.attr(item, 'data-ingredient-id');
                tds = query('td', item);
                S.each(tds, function(td, i){
                    if(i == 1){
                        inputEl = get('input', td);
                        data[i] = DOM.val(inputEl);
                    }else{
                        data[i] = S.trim(DOM.text(td));
                    }
                });
                S.mix(data, {
                    attr: 'data-ingredient-id',
                    id: id,
                    dataName: ingredient.nameAttr
                });
                tagStr += Juicer(TAG_TEMP, {
                    data: data
                });
            });
            tagDOM = DOM.create(tagStr);
            DOM.append(tagDOM, el.ingredientTagsEl);
        },
        /**
         * 隐藏菜品详情
         * @return {[type]} [description]
         */
        hideAll: function(){
            var
                that = this;
            DOM.hide(el.dishDetailEl);
        },
        /**
         * 显示菜品详情
         * @return {[type]} [description]
         */
        showAll: function(){
            var
                that = this;
            DOM.show(el.dishDetailEl);
        },
        /**
         * 显示原材料
         * @return {[type]} [description]
         */
        showIngredient: function(){
            var
                that = this;
            DOM.show(el.ingredientEl);
        },
        /**
         * 隐藏原材料
         * @return {[type]} [description]
         */
        hideIngredient: function(){
            var
                that = this;
            DOM.hide(el.ingredientEl);
        }
    });
    return Detail;
},{
    requires: [
        'widget/dialog',
        'pio/dish-management/dish-management',
        'mod/defender',
        'mod/juicer'
    ]
});
/**
 * 菜品口味添加
 */
KISSY.add('dish/taste', function(S){
    var
        DOM = S.DOM;

    function Taste(){
        this._init();
    }

    S.augment(Taste, {
        _init: function(){
            this._selectTaste();
        },
        _selectTaste: function(){
            var
                that = this;

            that.searchSelect = PW.module.SearchSelect.client({
                selectPicker: '.selectpicker',
                liveSearch: true,
                root: '#basic',
                multiple: true,
                hasHiddenInput: true,
                inputName: 'tasteIdList',
                isEdit: DOM.attr('#basic', 'data-isEdit') == "true" ? true : false
            });
        }
    });

    return Taste;
},{
    requires: [
        'module/search-select'
    ]
});