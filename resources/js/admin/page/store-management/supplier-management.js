/*-----------------------------------------------------------------------------
 * @Description:     管理员-库存管理-供应商管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.09
 * ==NOTES:=============================================
 * v1.0.0(2015.11.09):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/supplier-management', function(S, Core){
    PW.namespace('page.StoreManagement.SupplierManagement');
    PW.page.StoreManagement.SupplierManagement = function(param){
        return new Core(param);
    }
},{
    requires: [
        'supplier-management/core'
    ]
});

KISSY.add('supplier-management/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender= PW.mod.Defender,
        SupplierManagementIO = PW.io.StoreManagement.SupplierManagement,
        el = {
             // 操作表单
            operForm: '.J_operForm',
            // 添加表单
            addForm: '.J_addForm',
            // 添加触发器
            addTrigger: '.J_add',
            // 删除触发器
            delTrigger: '.J_del',
            // 编辑触发器
            editTrigger: '.J_edit',
            // 对话框模板
            dlgTemp: '#dlgTpl',
            // 所有隐藏域name
            nameEl: '.J_name',
            // 渲染模板
            renderTemp: '#renderTpl',
            // 数据容器
            templateContainer: '#J_template'
        },
        // 供货商id
        DATA_SUPPLIER_ID = 'data-supplier-id',
        DATA_PARTY_ID = 'data-party-id';

    function Core(param){
        this.defender;
        this.isEdit;
        this.count;
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._getSupplierCount();
            this._tip();
            this._getName();
            this._bulidEvt();
        },
        /**
         * 获取当前列表中的供应商数目
         * @private
         */
        _getSupplierCount: function(){
            var
                that = this,
                trs = query('tr', el.templateContainer);
            that.count = trs.length;
        },
        /**
         * 获取隐藏域的所有name
         * @private
         */
        _getName: function(){
            var
                that = this,
                nameEls = query(el.nameEl, el.operForm);

            that.nameEls = nameEls;
        },
        _bulidEvt: function(){
            var
                that = this;

            on(el.addTrigger, 'click', function(){
                that.title = '添加';
                that.isEdit = false;
                that._addSupplier();
            });

            delegate(el.operForm, 'click', el.editTrigger, function(e){
                that.title = '编辑';
                that.isEdit = true;
                that._getSupplier(e.target);
                that._editSupplier(e.target);
            });

            delegate(el.operForm, 'click', el.delTrigger, function(e){
                that._delSupplier(e.target);
            });
        },
        /**
         * 删除供货商
         * @param e
         * @private
         */
        _delSupplier: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_SUPPLIER_ID),
                partyId = DOM.attr(tr, DATA_PARTY_ID);

            Dialog.confirm('确定删除此供货商吗?', function(){
                SupplierManagementIO.delSupplier({
                    id: id,
                    partyId: partyId
                }, function(rs, errMsg){
                    if(rs){
                        DOM.remove(tr);
                        Dialog.alert('删除成功!');
                        that.count --;
                        that._tip();
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 添加供货商
         * @private
         */
        _addSupplier: function(){
            var
                that = this,
                dlgTemp = DOM.html(el.dlgTemp),
                tip = Juicer.client(dlgTemp, {});
            that._openDlg(tip);
        },
        /**
         * 打开对话框,准备添加或者编辑
         * @param tip
         * @param tr
         * @private
         */
        _openDlg: function(tip, tr){
            var
                that = this,
                dlgTemp = DOM.html(el.dlgTemp),
                tip,
                settings = {
                    title: that.title +  '供货商',
                    header: true,
                    height: 300,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validForm(me, tr);
                                }
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                }
                            }
                        ]
                    },
                    afterOpenHandler: function(){
                        that.defender = Defender.client(el.addForm, {});
                    }
                };

            Dialog.alert(tip, function(){}, settings);
        },
        /**
         * 获取供货商信息
         * @param e
         * @private
         */
        _getSupplier: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_SUPPLIER_ID),
                partyId = DOM.attr(tr, DATA_PARTY_ID),
                tds = query('td', tr),
                supplier = [];

            supplier.push(id);
            supplier.push(partyId);
            S.each(tds, function(td){
                supplier.push(S.trim(DOM.text(td)));
            });
            that.supplier = supplier;
        },
        /**
         * 编辑供货商
         * @param e
         * @private
         */
        _editSupplier: function(e){
            var
                that = this,
                dlgTemp = DOM.html(el.dlgTemp),
                tr = DOM.parent(e, 'tr'),
                data,
                tip;

            S.each(that.nameEls, function(input, index){
                DOM.val(that.nameEls[index], that.supplier[index]);
            });
            data = DOM.serialize(el.operForm);
            tip = Juicer.client(dlgTemp, data);
            that._openDlg(tip, tr);
        },
        /**
         * 验证对话框中的表单
         * @param me
         * @param tr
         * @private
         */
        _validForm: function(me, tr){
            var
                that = this,
                error,
                supplierData = DOM.serialize(el.addForm);
            that.defender.validAll(function(rs){
                if(rs){
                    if(!that.isEdit){
                        SupplierManagementIO.addSupplier(supplierData, function(rs, data, errMsg){
                            if(rs){
                                S.mix(supplierData, {
                                    id: data.id,
                                    partyId: data.partyId
                                })
                                that._renderSupplier(supplierData);
                                Dialog.alert('添加成功!');
                                that.count ++;
                                that._tip();
                            }else{
                                Dialog.alert(errMsg);
                            }
                        });
                    }else{
                        SupplierManagementIO.editSupplier(supplierData, function(rs, errMsg){
                            if(rs){
                                that._renderSupplier(supplierData, tr, true);
                                Dialog.alert('编辑成功!');
                            }else{
                                Dialog.alert(errMsg);
                            }
                        });
                    }
                    me.close();
                }else{
                    error = get('.error-field', el.addForm);
                    error.focus();
                }
            });
        },
        /**
         * 渲染新添加的或者修改后的供货商
         * @param data
         * @param tr
         * @param bool
         * @private
         */
        _renderSupplier: function(data, tr, bool){
            var
                that = this,
                renderTemp = DOM.html(el.renderTemp),
                renderStr = Juicer.client(renderTemp, data),
                renderDOM = DOM.create(renderStr);

            if(bool){
                // 如果为编辑后渲染执行下面的操作,否则不用
                DOM.insertAfter(renderDOM, tr);
                DOM.remove(tr);
            }else{
                DOM.prepend(renderDOM, el.templateContainer);
            }
        },
        /**
         * 如果供货商个数为0,显示暂无内容
         * @private
         */
        _tip: function(){
            var
                that = this,
                thead = get('thead', el.operForm),
                ths = query('th', thead);

            if(that.count == 0){
                DOM.html(el.templateContainer, '<tr class="J_tip"><td class="text-center" colspan="' + ths.length + '">暂无内容!</td></tr>')
            }else{
                DOM.remove('.J_tip');
            }
        }
    });

    return Core;
},{
    requires: [
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'pio/store-management/supplier-management'
    ]
})