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

KISSY.add('page/dish-management/package-dish-management-add', function(S, Add){
    PW.namespace('page.DishManagement.PackageDishManagement.Add');
    PW.page.DishManagement.PackageDishManagement.Add = function(param){
        new Add(param);
    }
},{
    requires: [
        'dish-management/add'
    ]
});
/**
 * 菜品管理 添加菜品基本信息
 * @param  {[type]} S){	var DOM [description]
 * @param  {Object} el       [description]
 * @param  {String} BTN_KEY  [description]
 * @return {[type]}          [description]
 */
KISSY.add('dish-management/add', function(S, Promotion, AddDish){
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
            unitNumberEl: '.J_unitNumber',
            dishListEl: '.J_dishList'
            // //存储菜品idInput
            // dishIdInp: '.J_dishIdInp',
            // //存储菜品数量Input
            // dishQuantityInp: '.J_dishQuantityInp'
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
            //this.detail = new Detail();
            this.addDish = new AddDish();
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
                        that._jointDishIdAndNum();
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
         * 将多个input中的id和num都分别拼接在.J_dishIdInp和.J_dishQuantityInp的value中，利于后台接收数据
         * @return {[type]} [description]
         */
        _jointDishIdAndNum: function(){
            var
                that = this,
                idsAndNumsData = DOM.serialize(el.dishListEl),
                inputEls = DOM.query('input', el.dishListEl);

            DOM.attr('.J_dishIdInp', 'value', idsAndNumsData.dishId);
            DOM.attr('.J_dishQuantityInp', 'value', idsAndNumsData.dishQuantity);
            S.each(inputEls, function(item){
                item.setAttribute('disabled','disabled');
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
        //'dish/detail',
        'dish/add',
        'mod/defender',
        'widget/btn',
        //'module/search-select',
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
//KISSY.add('dish/detail', function(S){
//    var
//        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
//        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
//        Dialog = PW.widget.Dialog,
//        Defender = PW.mod.Defender,
//        Juicer = PW.mod.Juicer.client,
//        DishManagementIO = PW.io.DishManagement.DishManagement,
//        config = {},
//        el = {
//            // 操作表单
//            operForm: '.J_operForm',
//            // 菜品详情
//            dishDetailEl: '.J_dishDetail',
//            // 菜品详情-菜品
//            dishEl: '.J_dish',
//            // 菜品详情-原料
//            ingredientEl: '.J_ingredient',
//            // 菜品详情-添加原料触发器
//            ingredientAddTrigger: '.J_ingredientAdd',
//            // 菜品详情-添加菜品触发器
//            dishAddTrigger: '.J_dishAdd',
//            // 备选原材料模板
//            beforeIngredientTemp: '#beforeIngredient',
//            // 已选原材料模板
//            afterIngredientTemp: '#afterIngredient',
//            // 原材料添加表单
//            ingredientForm: '.J_ingredientForm',
//            // 存放原材料标签容器
//            ingredientTagsEl: '.J_ingredient-tags',
//            // 删除标签触发器
//            delTagTrigger: '.J_delTag'
//        },
//        TIP = ['确定删除此原材料吗？'],
//        SUCCESS_TIP = ['删除成功！'];
//
//    function Detail(param){
//        this._init();
//    }
//
//    S.augment(Detail, S.EventTarget, {
//        _init: function(){
//            this._bulidEvt();
//        },
//        _bulidEvt: function(){
//            var
//                that = this;
//        },
//        /**
//         * 删除原材料
//         * @param  {[type]} e [description]
//         * @return {[type]}   [description]
//         */
//        _delIngredient: function(e){
//            var
//                that = this,
//                id = e.id,
//                tagEl = e.tagEl;
//            Dialog.confirm(TIP[0], function(){
//                DishManagementIO.delIngredient({
//                    id: id
//                }, function(rs, errMsg){
//                    if(rs){
//                        Dialog.alert(SUCCESS_TIP[0]);
//                        DOM.remove(tagEl);
//                    }
//                });
//            });
//        },
//        /**
//         * 渲染选择好的原材料
//         * @param  {[type]} items [description]
//         * @return {[type]}       [description]
//         */
//        _renderTagIngredient: function(items){
//            var
//                that = this,
//                ingredient = that.ingredient,
//                id,
//                tds,
//                data = {},
//                tagStr = '',
//                inputEl,
//                tagDOM;
//
//            S.each(items, function(item){
//                id = DOM.attr(item, 'data-ingredient-id');
//                tds = query('td', item);
//                S.each(tds, function(td, i){
//                    if(i == 1){
//                        inputEl = get('input', td);
//                        data[i] = DOM.val(inputEl);
//                    }else{
//                        data[i] = S.trim(DOM.text(td));
//                    }
//                });
//                S.mix(data, {
//                    attr: 'data-ingredient-id',
//                    id: id,
//                    dataName: ingredient.nameAttr
//                });
//                tagStr += Juicer(TAG_TEMP, {
//                    data: data
//                });
//            });
//            tagDOM = DOM.create(tagStr);
//            DOM.append(tagDOM, el.ingredientTagsEl);
//        },
//        /**
//         * 隐藏菜品详情
//         * @return {[type]} [description]
//         */
//        hideAll: function(){
//            var
//                that = this;
//            DOM.hide(el.dishDetailEl);
//        },
//        /**
//         * 显示菜品详情
//         * @return {[type]} [description]
//         */
//        showAll: function(){
//            var
//                that = this;
//            DOM.show(el.dishDetailEl);
//        },
//        /**
//         * 显示原材料
//         * @return {[type]} [description]
//         */
//        showIngredient: function(){
//            var
//                that = this;
//            DOM.show(el.ingredientEl);
//        },
//        /**
//         * 隐藏原材料
//         * @return {[type]} [description]
//         */
//        hideIngredient: function(){
//            var
//                that = this;
//            DOM.hide(el.ingredientEl);
//        }
//    });
//    return Detail;
//},{
//    requires: [
//        'widget/dialog',
//        'pio/dish-management/dish-management',
//        'mod/defender',
//        'mod/juicer'
//    ]
//});
/**
 * 添加菜品
 */
KISSY.add('dish/add', function(S, Oper, Count){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        Juicer = PW.mod.Juicer.client,
        DishManagementIO = PW.io.DishManagement.PackageDishManagement,
        config = {},
        el = {
            // 添加菜品
            addDishTrigger: '.J_addDish',
            // 对话框模板
            dlgTemp: '#dlgTpl',
            // 添加菜品表单
            addForm: '.J_addForm',
            // 表格表单
            operForm: '.J_oper',
            // 菜品容器
            template: '#J_template',
            // 价格输入框
            priceInp: '.J_priceInp',
            // 数量输入框
            numberInp: '.J_numberInp',
            // 添加菜品触发器
            addSpecificDishTrigger: '.J_addSpecificDish',
            // 删除菜品触发器
            delSpecificDishTrigger: '.J_delSpecificDish',
            //搜索输入框
            inputEl: '.focusedInput',
            // 菜品数量
            dishNumberEl: '.J_dishNumber',
            // 菜品总价
            dishCountEl: '.J_dishCount',
            // 菜品列表渲染容器
            dishListEl: '.J_dishList',
            // 保存菜品模板
            dishTemp: '#dishTpl',
            //弹出框中表格 +add
            tableEl: ".J_table",
            countEl: ".count", 
        },
        // 菜品id
        DATA_DISH_ID = 'data-result-id',
        // 菜品价格
        DATA_DISH_PRICE = 'data-result-price',
        // 菜品名称
        DATA_DISH_NAME = 'data-result-name',
        // 菜品单位
        DATA_DISH_UNIT = 'data-result-unit';

    function AddDish(){
        // 添加菜品的表单的验证结果
        this.vaildResult = false;
        // 选中的复选框数目
        this.checkedCount = 0;
        this._init();
    }

    S.augment(AddDish, {
        _init: function(){
            this.dishCount = new Count();
            this._buildEvt();
            this._searchSelect();
        },
        _buildEvt: function(){
            var
                that = this;

            on(el.addDishTrigger, 'click', function(){
                that.title = '添加菜品';
                //that.isEdit = false;
                that._addDish();
            });
        },
        _addDish: function(){
            var
                that = this,
                dlgStr,dlgDishListStr,dishListStr,
                settings = {
                    title: that.title,
                    header: true,
                    height: 400,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._renderPackageDish();
                                    that._updatePriceAndNumInDialog();
                                    me.close();
                                },
                                bType: 'submit',
                                className: 'J_ok'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                }
                            }
                        ]
                    },
                    afterOpenHandler: function(me){
                        that.dishOper = new Oper({dishCount: that.dishCount});
                        that._addEventListener();
                        that._searchSelect();
                        that.defender = Defender.client(el.addForm, {});
                        if(dishListStr){
                            var
                                dishListDOM = DOM.create(dishListStr);
                            DOM.append(dishListDOM, el.template);
                        }
                        that._renderPriceAndNum();
                    }
                };

            dlgDishListStr = that._getDialogContent();
            dlgStr = dlgDishListStr.dlgStr;
            dishListStr = dlgDishListStr.dishList;
            Dialog.alert(dlgStr, function(){}, settings);
        },
        _renderPackageDish: function(){
            var
                that = this,
                trs = query('tr', el.template),
                tds,
                tagList = '',
                dishId,
                dishName,
                dishUnit,
                dishPrice,
                dishQuantity;

            S.each(trs, function(tr){
                tds = query('td', tr);
                dishId = DOM.attr(tr, 'data-dish-id');
                dishName = DOM.text(tds[1]);
                dishUnit = DOM.text(tds[2]);
                dishPrice = DOM.text(tds[3]);
                dishQuantity = DOM.text(tds[4]);
                tagList += '<div data-result-unit="' + dishUnit + '" data-result-price="' + dishPrice + '" data-result-name="' + dishName +'" data-result-id="' + dishId +'" data-result-quantity="' + dishQuantity +'" class="select-tag">' + dishName + ' ' + dishQuantity + dishUnit + '<i class="fa fa-times J_delSelectTag"></i><input type="hidden" value="' + dishId + '" name="dishId"><input type="hidden" value="'+ dishQuantity + '" name="dishQuantity"></div>';
            });
            DOM.html(el.dishListEl, tagList);    
        },
        _updatePriceAndNumInDialog: function(){
            var
                that = this,
                afterConfirmPrice = DOM.text(get(el.dishCountEl));
                afterConfirmNum = DOM.text(get(el.dishNumberEl));
                initialContent = DOM.serialize('.J_initialNumberAndCount');
            DOM.attr('.J_initalDishPrice', 'value', afterConfirmPrice);
            DOM.attr('.J_initalDishQuantity', 'value', afterConfirmNum);
        },
        /**
         * 获取后台刷页保存的的价格和数量渲，染编辑页下打开对话框中原有菜品的价格和
         * @return {[type]} [description]
         */
        _renderPriceAndNum: function(){
            var 
                //获取后台刷页保存的的价格和数量
                initialContent = DOM.serialize('.J_initialNumberAndCount');

            DOM.text('.J_dishCount', initialContent.initalDishPrice);
            DOM.text('.J_dishNumber', initialContent.initalDishQuantity);
        },
        _addEventListener: function(){
            var
                that = this;

            delegate(el.addForm, 'click', el.addSpecificDishTrigger, function(){
                that._addSpecificDish();
            });

            delegate(el.addForm, 'click', el.delSpecificDishTrigger, function(){
                that._delSpecificDish();
            });

            delegate(el.addForm, 'keyup', el.numberInp, function(){
                that._isAddDish();
            });

            delegate(el.addForm, 'keyup', el.priceInp, function(){
                that._isAddDish();
            });

            delegate(el.operForm, 'click', '.J_check', function(e){
                that._hasCheckedBox(e.target);
            });

            delegate(el.operForm, 'click', '.J_selectAll', function(e){
                that._isSelectAllChecked(e.target);

            });
        },
        _isSelectAllChecked: function(e){
            var
                that = this;

            if(DOM.attr(e, 'checked') == 'checked'){
                that._unlock(el.delSpecificDishTrigger);
            }else{
                that._lock(el.delSpecificDishTrigger);
            }
        },
        _isAddDish: function(){
            var
                that = this;

            that._validAddForm();
            if(that.vaildResult){
                that._unlock(el.addSpecificDishTrigger);
            }else{
                that._lock(el.addSpecificDishTrigger);
            }
        },
        _validAddForm: function(){
            var
                that = this;

            if(DOM.val(el.priceInp) == '' || DOM.val(el.numberInp) == ''){
                that.vaildResult = false;
                return false;
            }else{
                that.vaildResult = true;
                return true;
            }
        },
        _unlock: function(trigger){
            var
                that = this;

            DOM.removeAttr(trigger, 'disabled', 'disabled');
        },
        _hasCheckedBox: function(e){
            var
                that = this;

            if(DOM.attr(e, 'checked') == 'checked'){
                that.checkedCount ++;
            }else{
                that.checkedCount --;
            }

            if(that.checkedCount != 0){
                that._unlock(el.delSpecificDishTrigger);
            }else{
                that._lock(el.delSpecificDishTrigger);
            }
        },
        _hasCheckedDish: function(){
            var
                that = this,
                tr = query('tr',el.template),
                checkedTr = [],
                checkedTrId = [];

            for(var i = 0; i < tr.length; i ++){
                var
                    currentTr = tr[i],
                    checkboxEl = get('input[type="checkbox"]', currentTr);
                if(DOM.attr(checkboxEl, 'checked') == 'checked'){
                    checkedTr.push(currentTr);
                    checkedTrId.push(DOM.attr(currentTr, 'data-dish-id'));
                }
            }
            return {
                checkedTr: checkedTr,
                checkedTrId: checkedTrId
            };
        },
        _delSpecificDish: function(){
            var
                that = this,
                trsEl = query('tr', el.template),
                dishId, dishPrice, dishQuantity,
                tds,
                // 获取菜品列表中已经选中的菜品
                checkedObj = that._hasCheckedDish();

            if(trsEl.length == 0){
                Dialog.alert('当前没有菜品可以删除!');
            }else{
                if(checkedObj.checkedTr.length == 0){
                    Dialog.alert('请选择要删除的菜品!');
                }else{
                    S.each(checkedObj.checkedTr, function(tr){
                        tds = query('td', tr);
                        dishId = DOM.attr(tr, 'data-dish-id');
                        dishPrice = S.trim(DOM.text(tds[3]));
                        dishQuantity = S.trim(DOM.text(tds[4]));
                         that.dishOper.fire('delDish', {
                            checkedTr: tr
                        });
                        that._lock(el.delSpecificDishTrigger);
                        // change:del多个菜品不需要发ajax
                        // DishManagementIO.delDishInPackage({
                        //     dishId: dishId,
                        //     dishPrice: dishPrice,
                        //     dishQuantity: dishQuantity
                        // }, function(rs, data, errMsg){
                        //     if(rs){
                        //         that.dishOper.fire('delDish', {
                        //             checkedTr: tr
                        //         });
                        //         that.dishCount.fire('delDishNumberAndCount', {
                        //             dishNumber: DOM.text(el.dishNumberEl),
                        //             dishDel: dishQuantity,
                        //             dishCount:  10 //data.money
                        //         });
                        //         that._lock(el.delSpecificDishTrigger);
                        //     }else{
                        //         Dialog.alert(errMsg);
                        //     }
                        // });
                    });
                    that.dishCount.fire('delDishNumberAndCount');
                }
            }
        },
        _addSpecificDish: function(){
            var
                that = this,
                dishId = DOM.attr('.J_renderTo', DATA_DISH_ID),
                dishName = DOM.attr('.J_renderTo', DATA_DISH_NAME),
                dishUnit = DOM.attr('.J_renderTo', DATA_DISH_UNIT),
                dishPrice = DOM.val(el.priceInp),
                dishQuantity = DOM.val(el.numberInp),
                dishObj = {
                    dishName: dishName,
                    dishId: dishId,
                    dishUnit: dishUnit,
                    dishPrice: dishPrice,
                    dishQuantity: dishQuantity
                },
                sendData = DOM.serialize(el.tableEl);

            if(DOM.text('.J_renderTo') == ''){
                Dialog.alert('请选择菜品!', function(){
                    that.searchSelect.unfold();
                });
            }
            that.defender.validAll(function(rs){
                if(rs){
                    // DishManagementIO.getPackageDishTotalMoney(sendData, function(rs, data, errMsg){
                    //     if(rs){
                    //         that.dishOper.fire('addDish', dishObj);
                    //         that.dishCount.fire('addDishNumberAndCount', {
                    //             dishNumber: DOM.text(el.dishNumberEl),
                    //             dishAdd: DOM.val(el.numberInp),
                    //             dishCount: 100 // data.money
                    //         });
                    //     }else{
                    //         Dialog.alert(errMsg);
                    //     }
                    // });
                    that.dishOper.fire('addDish', dishObj);
                    that.dishCount.fire('addDishNumberAndCount');
                }
            });
            // initial code:
            // that.defender.validAll(function(rs){
            //     if(rs){
            //         DishManagementIO.getPackageDishTotalMoney({
            //             dishId: dishId,
            //             dishPrice: dishPrice,
            //             dishQuantity: dishQuantity
            //         }, function(rs, data, errMsg){
            //             if(rs){
            //                 that.dishOper.fire('addDish', dishObj);
            //                 that.dishCount.fire('addDishNumberAndCount', {
            //                     dishNumber: DOM.text(el.dishNumberEl),
            //                     dishAdd: DOM.val(el.numberInp),
            //                     dishCount: 100 // data.money
            //                 });
            //             }else{
            //                 Dialog.alert(errMsg);
            //             }
            //         });
            //     }
            // });
        },
        _searchSelect: function(){
            var
                that = this,
                price,
                unit;

            that.searchSelect = PW.module.SearchSelect.client({
                selectPicker: '.selectpicker',
                liveSearch: true,
                root: '#basic',
                multiple: false,
                inDlg: true,
                urlCoreParam: 'getDishsName'
            }).on('selectAfter', function(e){
                price = e.extendParam.price;
                that._renderPrice(price);
                that._clearNumber();
                that._lock(el.addSpecificDishTrigger);
            }).on('deleteTagAfter', function(){
                that._afterDeleteTagRespond();
            });
        },
        /**
         * 编辑页删除tag后，发ajax请求后台计算当前的价格，
         * 刷新初始input中存储的价格和数量
         * @return {[type]} [description]
         */
        _afterDeleteTagRespond: function(){
            var
                that = this,
                sendData = DOM.serialize(el.dishListEl);

                DishManagementIO.getPackagePriceAndQuantity(sendData, function(rs, data, errMsg){
                    if(rs){
                        DOM.attr('.J_initalDishPrice', 'value', data.totalPrice);
                        DOM.attr('.J_initalDishQuantity', 'value', data.totalQuantity);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });

        },
        _lock: function(trigger){
            var
                that = this;

            DOM.attr(trigger, 'disabled', 'disabled');
        },
        _clearNumber: function(){
            var
                that = this;

            DOM.val(el.numberInp, '');
        },
        _renderPrice: function(price){
            var
                that = this;

            DOM.val(el.priceInp, price);
        },
        _getDialogContent: function(){
            var
                that = this,
                dlgTemp = DOM.html(el.dlgTemp),
                dlgStr = '',
                tagList = query('.select-tag', el.dishListEl),
                length = tagList.length,
                dishTemp = DOM.html(el.dishTemp),
                dishList = '';

            if(length){
                S.each(tagList, function(tag){
                    dishList += Juicer(dishTemp, {
                        dishId: DOM.attr(tag, DATA_DISH_ID),
                        dishName: DOM.attr(tag, DATA_DISH_NAME),
                        dishUnit: DOM.attr(tag, DATA_DISH_UNIT),
                        dishPrice: DOM.attr(tag, DATA_DISH_PRICE),
                        dishQuantity: DOM.attr(tag, 'data-result-quantity')
                    });
                });
            }

            dlgStr = Juicer(dlgTemp, {});

            return {
                dlgStr: dlgStr,
                dishList: dishList
            };
        }
    });

    return AddDish;
},{
    requires: [
        'dish/oper',
        'dish/count',
        'module/search-select',
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'pio/dish-management/package-dish-management'
    ]
});

/**
 * 菜品列表中的操作
 */
KISSY.add('dish/oper', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        Juicer = PW.mod.Juicer.client,
        DishManagementIO = PW.io.DishManagement.PackageDishManagement,
        config = {},
        el = {
            //表单
            form: '.J_operForm',
            // 编辑具体菜品
            editDishTrigger: '.J_editDish',
            // 删除具体菜品
            delDishTrigger: '.J_delDish',
            // 取消当前编辑
            cancelDishTrigger: '.J_cancelDish',
            // 保存具体菜品
            saveDishTrigger: '.J_saveDish',
            // 编辑菜品模板
            editDishTemp: '#editDishTpl',
            // 保存菜品模板
            dishTemp: '#dishTpl',
            // 编辑模板中的输入框
            dishInputEl: '.J_dishInput',
            // 添加菜品表单
            addForm: '.J_addForm',
            // 添加菜品操作表单
            operForm: '.J_oper',
            // 菜品列表
            dishList: '#J_template',
            // 全选菜品
            selectAllTrigger: '.J_selectAll',
            // 复选框
            checkEl: '.J_check',
            // 餐段复选框
            periodCheckEl: '.J_period',
            // 套餐包涵菜品的总个数
            dishNumberEl: '.J_dishNumber',
            // 套餐包涵菜品的总金额
            dishCountEl: '.J_dishCount',
        },
        TIP = [],
        // 菜品id
        DATA_DISH_ID = 'data-dish-id';

    function Oper(param){
        this.opts = param;
        // 计算套餐中菜品总个数和总金额的对象
        this.dishCount = this.opts.dishCount;
        // 当前要编辑的菜品对象
        this.dishObj;
        // 当前要编辑的菜品对象所对应的tr
        this.tr;
        this.defender = Defender.client(el.operForm, {showTip: false});
        this._init();
    }

    S.augment(Oper, S.EventTarget, {
        _init: function(){
            this._select();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            // 添加菜品
            that.on('addDish', function(e){
                that._addSpecificDish(e);
                that._detachHandler();
                that._addHandler();
            });

            // 批量删除菜品
            that.on('delDish', function(e){
                that._delSpecificDish(e.checkedTr);
            });
        },
        /**
         * 批量删除菜品
         * @param checkedTr
         * @private
         */
        _delSpecificDish: function(checkedTr){
            var
                that = this;

            DOM.remove(checkedTr);
            DOM.removeAttr(el.selectAllTrigger, 'checked');
        },
        /**
         * 添加菜品
         * @param e
         * @private
         */
        _addSpecificDish: function(e){
            var
                that = this,
                dishTemp = DOM.html(el.dishTemp),
                dishStr = Juicer(dishTemp, e),
                dishDOM = DOM.create(dishStr);

            DOM.prepend(dishDOM, el.dishList);
            that._select();
        },
        /**
         * 保存菜品
         * @param e
         * @private
         */
        _saveDish: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                dishObj = DOM.serialize(tr),
                id = DOM.attr(tr, DATA_DISH_ID);

            S.mix(dishObj, {
                dishId: id
            });
            that.defender.validAll(function(rs){
                if(rs){
                    that._renderEditDish(dishObj, tr);
                }
            });
        },
        /**
         * 渲染编辑之后的新菜品对象
         * @param dishObj
         * @param tr
         * @private
         */
        _renderEditDish: function(dishObj, tr){
            var
                that = this,
                prev = DOM.prev(tr),
                dishTemp = DOM.html(el.dishTemp),
                dishStr = Juicer(dishTemp, dishObj),
                dishDOM = DOM.create(dishStr),
                inputs = query('input', tr),
                dishId = DOM.attr(tr, DATA_DISH_ID),
                dishQuantity = DOM.val(inputs[4]),
                dishPrice = DOM.val(inputs[3]);

            
            DOM.replace(tr,dishDOM);
            DOM.remove(prev);

            that.defender.refresh();
            that.dishCount.fire('updateDishNumberAndCount');
            that._detachHandler();
            that._addHandler();
            that._select();

            //change:不需要发ajax
            // DishManagementIO.getPackageDishTotalMoney({
            //     dishId: dishId,
            //     dishPrice: dishPrice,
            //     dishQuantity: dishQuantity
            // }, function(rs, data, errMsg){
            //     if(rs){
            //         that.dishCount.fire('updateDishNumberAndCount', {
            //             dishNumber: S.trim(DOM.text(el.dishNumberEl)),
            //             dishUpdate: that.dishObj.dishQuantity + ',' + dishQuantity,
            //             dishCount: 100 //data.money
            //         });
            //         DOM.replace(tr,dishDOM);
            //         DOM.remove(prev);
            //         that.defender.refresh();
            //         that._detachHandler();
            //         that._addHandler();
            //         that._select();
            //     }
            // });
        },
        /**
         * 删除菜品(单个)
         * @param e
         * @private
         */
        _delDish: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                tds = query('td', tr),
                dishDel = S.trim(DOM.text(tds[4])),
                dishId = DOM.attr(tr, DATA_DISH_ID),
                dishPrice = S.trim(DOM.text(tds[3]));

            // change：删除不需发ajax
           
            DOM.remove(tr);
            that.dishCount.fire('delDishNumberAndCount');
            that._select();

            // DishManagementIO.getPackageDishTotalMoney({
            //     dishId: dishId,
            //     dishPrice: dishPrice,
            //     dishQuantity: dishDel
            // }, function(rs, data, errMsg){
            //     if(rs){
            //         that.dishCount.fire('delDishNumberAndCount', {
            //             dishNumber: S.trim(DOM.text(el.dishNumberEl)),
            //             dishDel: dishDel,
            //             dishCount: 100  //data.money
            //         });
            //         DOM.remove(tr);
            //         that._select();
            //     }
            // });
        },
        /**
         * 取消菜品编辑
         * @param e
         * @private
         */
        _cancelDish: function(e){
            var
                that = this,
                prev = that.tr,
                tr = DOM.parent(e, 'tr');

            DOM.remove(tr);
            DOM.show(prev);
            that._detachHandler();
            that._addHandler();
        },
        /**
         * 获取当前正在编辑的菜品信息
         * @param e
         * @private
         */
        _getDish: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_DISH_ID),
                tds = query('td', tr),
                dishArr = [],
                dishObj;

            dishArr.push(id);
            S.each(tds, function(td){
                dishArr.push(S.trim(DOM.text(td)));
            });
            dishObj = {
                dishId: dishArr[0],
                dishName: dishArr[2],
                dishUnit: dishArr[3],
                dishPrice: dishArr[4],
                dishQuantity: dishArr[5]
            };
            // 当前要编辑的菜品对象
            that.dishObj = dishObj;
            // 当前要编辑的菜品对象所对应的tr
            that.tr = tr;
        },
        /**
         * 编辑菜品列表中的菜品
         * @private
         */
        _editDish: function(){
            var
                that = this,
                prev = that.tr,
                dishTemp = DOM.html(el.editDishTemp),
                dishStr = Juicer(dishTemp, that.dishObj),
                dishDOM = DOM.create(dishStr);

            DOM.insertAfter(dishDOM, prev);
            DOM.hide(prev);
            that.defender.refresh();
            that._detachHandler();
            that._addEditHandler();
        },
        /**
         * 绑定菜品列表中的编辑/删除事件
         * @private
         */
        _addHandler: function(){
            var
                that = this;

            on(el.editDishTrigger, 'click', function(e){
                that._getDish(e.target);
                that._editDish();
            });
            on(el.delDishTrigger, 'click', function(e){
                that._delDish(e.target);
            });
        },
        /**
         * 解绑菜品列表中的事件
         * @private
         */
        _detachHandler: function(){
            var
                that = this;

            detach(el.editDishTrigger, 'click');
            detach(el.delDishTrigger, 'click');
            detach(el.cancelDishTrigger, 'click');
            detach(el.saveDishTrigger, 'click');
        },
        /**
         * 绑定取消/保存事件
         * @private
         */
        _addEditHandler: function(){
            var
                that = this;

            on(el.cancelDishTrigger, 'click', function(e){
                that._cancelDish(e.target);
            });
            on(el.saveDishTrigger, 'click', function(e){
                that._saveDish(e.target);
            });
        },
        /**
         * 全选菜品列表中的菜品和编辑页中的餐段
         * @private
         */
        _select: function(){
            var
                that = this;

            PW.mod.Selectall.client({
                root: el.operForm,
                select: el.checkEl,
                toggleTrigger: el.selectAllTrigger
            });
        }
    });

    return Oper;
},{
    requires: [
        'mod/juicer',
        'mod/defender',
        'widget/dialog',
        'mod/selectall',
        'pio/dish-management/package-dish-management'
    ]
});
/**
 * 计算套餐中菜品的总个数和总金额
 */
KISSY.add('dish/count', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        //Defender = PW.mod.Defender,
        //Juicer = PW.mod.Juicer.client,
        DishManagementIO = PW.io.DishManagement.PackageDishManagement,
        config = {},
        el = {
            // 菜品数量
            dishNumberEl: '.J_dishNumber',
            // 菜品总价
            dishCountEl: '.J_dishCount',
            //dialog中table
            tableEl: '.J_table'
        };

    function Count(param){
        this.opts = param;
        this._init();
    }

    S.augment(Count, S.EventTarget ,{
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            // 添加套餐中菜品的总个数和总金额
            that.on('addDishNumberAndCount', function(e){
                // that._addDishNumberAndCount(e);
                that._calPriceAndNum();
            });

            // 减少套餐中菜品的总个数和总金额
            that.on('delDishNumberAndCount', function(e){
                // that._delDishNumberAndCount(e);
                that._calPriceAndNum();
            });
            // 编辑套餐中菜品的总个数和总金额
            that.on('updateDishNumberAndCount', function(e){
                //that._updateDishNumberAndCount(e);
                that._calPriceAndNum();
            });
        },
        /**
         * 由后台返回当前套餐中已选菜品的总金额和数量的计算结果，更新显示
         * @return {[type]} [description]
         */
        _calPriceAndNum: function(){
            if(S.one("#J_template tr") == null){
                DOM.text(el.dishNumberEl, "0.00");
                DOM.text(el.dishCountEl, "0");
            }else{
                var  
                    sendData = DOM.serialize(el.tableEl);

                DishManagementIO.getPackagePriceAndQuantity(sendData, function(rs, data, errMsg){
                    if(rs){
                        DOM.text(el.dishNumberEl, data.totalQuantity);
                        DOM.text(el.dishCountEl, data.totalPrice);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            }   
        }
        /**
         * 编辑(更新)套餐中菜品的总个数与总金额
         * @param e
         * @private
         */
        // _updateDishNumberAndCount: function(e){
        //     var
        //         that = this;

        //     that._updateDishNumber(e.dishNumber, e.dishUpdate);
        //     that._updateDishCount(e.dishCount);
        // },
        /**
         * 编辑(更新)套餐中菜品总个数
         * @param dishNumber
         * @param dishUpdate
         * @private
         */
        // _updateDishNumber: function(dishNumber, dishUpdate){
        //     var
        //         that = this,
        //         number = parseFloat(dishNumber),
        //         oldNumber = parseFloat(dishUpdate.split(',')[0]),
        //         newNumber = parseFloat(dishUpdate.split(',')[1]);

        //     number = number - oldNumber + newNumber;
        //     DOM.text(el.dishNumberEl, number);
        // },
        /**
         * 编辑(更新)套餐中菜品总金额
         * @param dishCount
         * @private
         */
        // _updateDishCount: function(dishCount){
        //     var
        //         that = this;

        //     DOM.text(el.dishCountEl, dishCount);
        // },
        /**
         * 删除具体菜品时,计算套餐的总个数和总金额
         * @param e
         * @private
         */
        // _delDishNumberAndCount: function(e){
        //     var
        //         that = this;

        //     that._delDishNumber(e.dishNumber, e.dishDel);
        //     that._delDishCount(e.dishCount);
        // },
       /* *
         * 删除具体菜品时,计算套餐的总个数
         * @param dishNumber
         * @private
         **/ 
        // _delDishNumber: function(dishNumber, dishDel){
        //     var
        //         that = this,
        //         number = parseFloat(dishNumber);

        //     number -= parseFloat(dishDel);
        //     DOM.text(el.dishNumberEl, number);
        // },
        /**
         * 删除具体菜品时,计算套餐的总金额
         * @param dishCount
         * @private
         */
        // _delDishCount: function(dishCount){
        //     var
        //         that = this;

        //     DOM.text(el.dishCountEl, dishCount);
        // },
        /**
         * 添加具体菜品时,计算套餐总数和总金额
         * @param e
         * @private
         */
        // _addDishNumberAndCount: function(e){
        //     var
        //         that = this;
        //     that._calPriceAndNum();
        //     // that._addDishNumber(e.dishNumber, e.dishAdd);
        //     // that._addDishCount(e.dishCount);
        // },
        /**
         * 添加具体菜品时,计算套餐总个数
         * @param dishNumber
         * @private
         */
        // _addDishNumber: function(dishNumber, dishAdd){
        //     var
        //         that = this,
        //         number = parseFloat(dishNumber);

        //     number += parseFloat(dishAdd);
        //     DOM.text(el.dishNumberEl, number);
        // },
        /**
         * 添加具体菜品时,计算套餐总价格
         * @param dishCount
         * @private
         */
        // _addDishCount: function(dishCount){
        //     var
        //         that = this;

        //     DOM.text(el.dishCountEl, dishCount);
        // }
    });
    return Count;
},{
    requires: [
        'widget/dialog',
        'pio/dish-management/package-dish-management'
    ]
});