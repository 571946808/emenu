/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存物品管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.12
 * ==NOTES:=============================================
 * v1.0.0(2015.11.12):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/store-item-management', function(S, List, Conversion){
    PW.namespace('page.StoreManagement.StoreItemManagement');
    PW.page.StoreManagement.StoreItemManagement = {
        List: function(param){
            new List(param);
        },
        Conversion: function(param){
            new Conversion(param);
        }
    };
},{
    requires: [
        'store-item-management/list',
        'store-item-management/conversion'
    ]
});
/**
 * 库存物品管理--列表
 */
KISSY.add('store-item-management/list', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Pagination = PW.mod.Pagination,
        StoreItemManagementIO = PW.io.StoreManagement.StoreItemManagement,
        el = {
            // 搜索表单
            searchForm: '.J_searchForm',
            // 删除触发器
            delTrigger: '.J_del',
            // 操作表单
            operForm: '.J_operForm',
            //导出触发器
            exportTrigger: '.J_export'
        },
        DATA_STORE_ID= 'data-store-item-id';

    function List(param){
        this.opts = param;
        this.pagination;
        this._init();
    }

    S.augment(List, {
        _init: function(){
            this._initPagi();
            this._showTip();
            this._select();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            on(el.searchForm, 'submit', function(){
                that._search();
                return false;
            });
            delegate(el.operForm, 'click', el.delTrigger, function(e){
                that._delStoreItem(e.target);
            });
            on(el.exportTrigger, 'click', function(e){
                that._export(e.currentTarget);
            })
        },
        _showTip: function(){
            var
                that = this,
                tipEl = S.one('.J_tip');

            if(tipEl){
                setTimeout(function(){
                    DOM.remove(tipEl);
                }, 2000);
            }
        },
        _select: function(){
            var
                that = this;

            PW.mod.Selectall.client({
                root: el.searchForm,
                select: '.J_storeType',
                toggleTrigger: '.J_selectAll'
            });
        },
        _initPagi: function(){
            var
                that = this;
            that.pagination = Pagination.client(that.opts);
        },
        _search: function(){
            var
                that = this,
                data = DOM.serialize(el.searchForm);

            that.pagination.reload(S.mix(that.opts, {
                extraParam: data
            }));
        },
        _delStoreItem: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_STORE_ID);

            Dialog.confirm('确定删除此库存物品?', function(){
                StoreItemManagementIO.delStoreItem({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert('删除成功!');
                        that.pagination.reload(that.opts);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 导出excel
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _export: function(e){
            var
                that = this,
                href = DOM.attr(e, 'href').split(',')[0],
                extraParam = S.IO.serialize(el.searchForm),
                newHref = href + '?' + extraParam;

            DOM.attr(e, 'href', newHref);
        }
    });

    return List;
},{
    requires: [
        'widget/dialog',
        'mod/pagination',
        'mod/selectall',
        'pio/store-management/store-item-management'
    ]
});
/**
 * 库存物品换算比例管理
 */
KISSY.add('store-item-management/conversion', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Pagination = PW.mod.Pagination,
        Defender = PW.mod.Defender,
        Juicer = PW.mod.Juicer,
        StoreItemManagementIO = PW.io.StoreManagement.StoreItemManagement,
        el = {
            // 搜索表单
            searchForm: '.J_searchForm',
            // 操作表单
            operForm: '.J_operForm',
            // 编辑触发器
            editTrigger: '.J_edit',
            // 编辑表单
            editForm: '.J_editForm',
            // 编辑表单模板
            editTemp: '#editForm'
        },
        //换算比例
        DATA_CONVERSION_RATIO_ID = 'data-conversion-ratio-id';

    function Conversion(param){
        this.opts = param;
        this.pagination;
        this.defender;
        this._init();
    }

    S.augment(Conversion, {
        _init: function(param){
            this._initPagi();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            delegate(el.operForm, 'click', el.editTrigger, function(e){
                that._getConversion(e.target);
                that._edit(e.target);
            });
            on(el.searchForm, 'submit', function(){
                that._search();
                return false;
            });
        },
        /**
         * 搜索表单
         * @private
         */
        _search: function(){
            var
                that = this,
                data = DOM.serialize(el.searchForm);

            that.pagination.reload(S.mix(that.opts, {
                extraParam: data
            }));
        },
        _initPagi: function(){
            var
                that = this;

            that.pagination = Pagination.client(that.opts);
        },
        /**
         * 获取当前换算单位对象
         * @param e
         * @private
         */
        _getConversion: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                conversionObj = DOM.serialize(tr);

            that.conversion = conversionObj;
        },
        /**
         * 打开对话框进行编辑
         * @param e
         * @private
         */
        _edit: function(e){
            var
                that = this,
                editFormTemp = DOM.html(el.editTemp),
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_CONVERSION_RATIO_ID),
                settings = {
                    header: true,
                    width: 800,
                    height: 400,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validForm(me);
                                },
                                className: 'J_ok',
                                bType: 'submit'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                },
                                bType: 'button'
                            }
                        ]
                    },
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.editForm, {});
                        that._selected(that.conversion);
                        on(el.editForm, 'submit', function(){
                            that._validForm(me);
                            return false;
                        });
                    }
                };
            var
                editFormStr = Juicer.client(editFormTemp, that.conversion);
            Dialog.alert(editFormStr, function(){}, settings);
        },
        /**
         * 验证编辑表单
         * @param me
         * @private
         */
        _validForm: function(me){
            var
                that = this,
                conversionData = DOM.serialize(el.editForm);

            that.defender.validAll(function(rs){
                if(rs){
                    StoreItemManagementIO.editStoreItemConversionRatio(conversionData, function(rs, errMsg){
                        if(rs){
                            Dialog.alert('编辑成功!', function(){}, {
                                enterHandler: true
                            });
                            that.pagination.reload(that.opts);
                        }else{
                            Dialog.alert(errMsg);
                        }
                        me.close();
                    });
                }
            });
        },
        /**
         * 编辑时,选中原来的值
         * @param conversion
         * @private
         */
        _selected: function(conversion){
            var
                that = this;
            S.each(query('option', '[name="orderUnitId"]'), function(option){
                if(DOM.attr(option, 'value') == conversion.orderUnitId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
            S.each(query('option', '[name="storageUnitId"]'), function(option){
                if(DOM.attr(option, 'value') == conversion.storageUnitId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
            S.each(query('option', '[name="costCardUnitId"]'), function(option){
                if(DOM.attr(option, 'value') == conversion.costCardUnitId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
            S.each(query('option', '[name="countUnitId"]'), function(option){
                if(DOM.attr(option, 'value') == conversion.countUnitId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
        }
    });

    return Conversion;
},{
    requires: [
        'widget/dialog',
        'mod/pagination',
        'mod/defender',
        'mod/juicer',
        'pio/store-management/store-item-management'
    ]
});