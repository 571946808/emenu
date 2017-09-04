/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.21
 * ==NOTES:=============================================
 * v1.0.0(2015.11.21):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/store-bill-management', function(S, List){
    PW.namespace('page.StoreManagement.StoreBillManagement');
    PW.page.StoreManagement.StoreBillManagement = function(param){
        new List(param);
    };
},{
    requires: [
        'store-bill-management/list'
    ]
});

KISSY.add('store-bill-management/list', function(S, Oper){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        SelectAll = PW.mod.Selectall,
        Calender = PW.mod.Calendar,
        Pagination = PW.mod.Pagination,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        StoreBillManagementIO = PW.io.StoreManagement.StoreBillManagement,
        el = {
            // 开始时间
            startTimeEl: '.J_startTime',
            // 结束时间
            endTimeEl: '.J_endTime',
            // 搜索表单
            searchForm: '.J_searchForm',
            // 快捷时间搜索
            shortCutEl: '.J_shortcut',
             // 全选触发器
            selectAllTrigger: '.J_selectAll',
            // 存放点多选项
            depotTrigger: '.J_depot',
            // 编辑触发器
            editBillTrigger: '.J_edit',
            // 删除触发器
            delBillTrigger: '.J_del',
            // 查看触发器
            viewBillTrigger: '.J_view',
            // 审核触发器
            checkTrigger: '.J_checkStatus',
            // 数据容器
            dataContainer: '#J_template',
            // 添加、编辑表单
            addForm: '.J_addForm',
            //审核表单
            checkForm: '.J_checkForm',
            // 添加、编辑表单模板
            addFormTemp: '#dlg',
            // 入库单
            inStoreBillTrigger: '.J_inStoreBill',
            // 出库单
            outStoreBillTrigger: '.J_outStoreBill',
            // 盘盈单
            getStoreBillTrigger: '.J_getStoreBill',
            // 盘亏单
            loseStoreBillTrigger: '.J_loseStoreBill',
            // 单价输入框
            priceEl: '.J_price',
            // 订货单位显示区
            orderUnitNameEl: '.J_orderUnitName',
            // 数量输入框
            quantityEl: '.J_quantity',
            // 小计金额
            moneyEl: '.J_money',
            // 添加单据触发器
            addTrigger: '.J_addInStoreBill',
            //非入库单据添加至表单触发器
            addCheckTrigger: '.J_addBillIncludeCheck',
            // 删除单据触发器
            delTrigger: '.J_delInStoreBill',
            // 清空当前添加的物品
            emptyTrigger: '.J_emptyInStoreBill',
            // 总金额
            totalMoneyEl: '.J_totalMoney',
            // 存放点下拉列表
            depotSelectEl: '.J_depotSelect',
            // 调离存放点列表
            depotOutSelectEl: '.J_depotOutSelect',
            // 调出存放点列表
            depotInSelectEl: '.J_depotInSelect',
            // 经手人下拉列表
            handlerSelectEl: '.J_handlerSelect',
            // 操作人下拉列表
            createSelectEl: '.J_createSelect',
            // 审核状态下拉列表
            checkSelectEl: '.J_checkSelect',
            // 审核状态容器
            checkContainer: '#check',
            // 存放点容器
            depotContainer: '#depot',
            // 调离存放点容器
            depotInContainer: '#depotIn',
            // 调出存放点容器
            depotOutContainer: '#depotOut',
            // 经手人容器
            handlerContainer: '#handler',
            // 操作人容器
            createContainer: '#create',
            // 导出excel
            exportTrigger: '.J_export',
            // 单据容器
            billListContainer: '.J_billList',
            // 单据备注
            commentEl: '.J_comment',
            // 查看模板
            viewDlgTemp: '#viewDlg',
            // 查看item模板
            viewBillTplTemp: '#viewBillTpl',
            // 审核模板
            checkDlgTemp: '#checkDlg',
            //成本卡数量
            costCardQuantityEl: '.J_costCardQuantity',
            //成本卡单位
            costCardUnitNameEl: '.J_costCardUnitName'
        },
        DATA_START_TIME = 'data-start-time',
        DATA_END_TIME = 'data-end-time',
        DATA_START_TIME = 'data-start-time',
        DATA_END_TIME = 'data-end-time',
        typeMap = {
            1: '入库单',
            2: '出库单',
            3: '盘盈单',
            4: '盘亏单'
        };

    function List(param){
        this.opts = param,
        this.data = {};  //声明data对象
        this.lock = true;
        this.pagination;
        this.billType;
        this.bill = null;
        this.alreadySearch = false;
        this._init(param);
    }

    S.augment(List, S.EventTarget, {
        _init: function(){
            this._initPagi();
            // this._initSelect();
            this._initDate();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            // 点击搜索进行搜索操作
            on(el.searchForm, 'submit', function(){
                that._search();
                that.alreadySearch = true;
                return false;
            });
            // 点击本月/上月进行快速搜索
            on(el.shortCutEl, 'click', function(){
                that._fastSearch(this);
            });

            // 编辑库存单据
            delegate(el.dataContainer, 'click', el.editBillTrigger, function(e){
                that._getStoreBill(e.target);
                that.isEdit = true;
                that._openDlg();
            });

            // 删除库存单据
            delegate(el.dataContainer, 'click', el.delBillTrigger, function(e){
                that._delBill(e.target);
            });

            // 添加入库单
            on(el.inStoreBillTrigger, 'click', function(){
                that.title= '添加入库单';
                that.isEdit = false;
                that.billType = 1;
                that._openDlg();
            });

            // 添加出库单
            on(el.outStoreBillTrigger, 'click', function(){
                that.title= '添加出库单';
                that.isEdit = false;
                that.billType = 2;
                that._openDlg();
            });

            // 添加盘盈单
            on(el.getStoreBillTrigger, 'click', function(){
                that.title= '添加盘盈单';
                that.isEdit = false;
                that.billType = 3;
                that._openDlg();
            });

            // 添加盘亏单
            on(el.loseStoreBillTrigger, 'click', function(){
                that.title= '添加盘亏单';
                that.isEdit = false;
                that.billType = 4;
                that._openDlg();
            });

            // 查看库存单据
            delegate(el.dataContainer, 'click', el.viewBillTrigger, function(e){
                that.title = '查看库存单据';
                that._getStoreBill(e.target);
                that._viewStoreBill(e.target);
            });

            //审核库存单据
            delegate(el.dataContainer, 'click', el.checkTrigger, function(e){
                that.title = '审核库存单据';
                that._checkStoreBill(e.target);
            });

            // 导出excel
            on(el.exportTrigger, 'click', function(){
                that._export();
            });
        },
        /**
         * 审核库存单据
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _checkStoreBill: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                checkDlgTemp = DOM.html(el.checkDlgTemp),
                type = DOM.attr(tr, 'data-store-bill-type'),
                settings,
                dlgStr,
                checkeBillData = DOM.serialize(tr);
            
            that.title = '审核' + typeMap[type];
            settings= {
                title: that.title,
                header: true,
                height: 200,
                width: 600,
                hasAutoScroll: true,
                footer: {
                    btns: [
                        {
                            text: '确定',
                            clickHandler: function(e, me){
                                that._afterClickOk(tr, me);
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
                afterOpenHandler: function(){
                    that._renderSelect();
                },
                afterCloseHandler: function(){
                    that._resetSelect();
                }
            };
            dlgStr = Juicer.client(checkDlgTemp, checkeBillData);
            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 点击审核对话框中的确定后的响应
         * @param  {[type]} me [description]
         * @return {[type]}    [description]
         */
        _afterClickOk: function(tr, me){
            var 
                that = this,
                storeInputData = DOM.serialize(el.checkForm);
                S.mix(storeInputData, {
                    id: $(tr).attr('data-store-bill-id')
                });

            //storeInputData：id, isAudited;
            StoreBillManagementIO.checkStoreBill(storeInputData, function(rs, errMsg){
                if(rs){
                    Dialog.alert('审核成功!');
                    that.pagination.reload(that.opts);
                }else{
                    Dialog.alert(errMsg);
                }
                me.close();
            });
        },
        /**
         * 查看库存单据
         * @param e
         * @private
         */
        _viewStoreBill: function(e){

            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                viewDlgTemp = DOM.html(el.viewDlgTemp),
                billObj = DOM.serialize(tr),
                type = DOM.attr(tr, 'data-store-bill-type'),
                settings,
                dlgStr;

            S.mix(that.bill, {
                depotName: billObj.depotName,
                handlerName: billObj.handlerName,
                createdName: billObj.createdName
            });
            settings= {
                title: '查看' + typeMap[type],
                header: true,
                height: 400,
                width: 1000,
                hasAutoScroll: true,
                afterOpenHandler: function(){
                    if(that.bill){
                        that._renderViewItem();
                    }
                }    
            };
            dlgStr = Juicer.client(viewDlgTemp, that.bill);
            //S.log(that.bill);
            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 渲染该单据的物品到单据对话框中
         * @private
         */
        _renderViewItem: function(){
            var
                that = this,
                viewBillTplTemp = DOM.html(el.viewBillTplTemp),
                viewBillStr = '',
                viewBillDOM;
            
            S.each(that.bill.reportList, function(item){
                S.mix(item, {
                    billType: that.billType
                }) 
                viewBillStr += Juicer.client(viewBillTplTemp, item);
            });
            viewBillDOM = DOM.create(viewBillStr);
            DOM.append(viewBillDOM, el.billListContainer);
        },
        /**
         * 导出excel
         * @private
         */
        _export: function(){
            var
                that = this,
                href = DOM.attr(el.exportTrigger, 'href'),
                data,
                newHref;

            if( that.alreadySearch == false ){
                DOM.val(el.startTimeEl, '');
                DOM.val(el.endTimeEl, '');
            }
            data = S.io.serialize(el.searchForm);
            newHref = href.split('?')[0] + "?" + data;
            DOM.attr(el.exportTrigger, 'href', newHref);
        },
        /**
         * 删除库存单据
         * @param e
         * @private
         */
        _delBill: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, 'data-store-bill-id');

            Dialog.confirm('确定删除此库存单据吗?', function(){
                StoreBillManagementIO.delStoreBill({
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
         * 打开对话框
         * @private
         */
        _openDlg: function(){
            var
                that = this,
                dlgStr = '',
                addFormTemp = DOM.html(el.addFormTemp),
                settings = {
                    title: that.title,
                    header: true,
                    height: 400,
                    width: 1000,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validAddForm(me);
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
                        // 对下拉列表进行渲染,放入对话框
                        that._renderSelect();
                        // 对物品项操作进行绑定
                        that.oper = new Oper();
                        S.mix(that.oper, {billType: that.billType});
                        that.defender = Defender.client(el.addForm, {});
                        // 对搜索物品进行调用
                        that._searchSelect();
                        // 绑定事件
                        that._addEvt();
                        // 如果是编辑单据,渲染详细单据和选中项
                        if(that.bill && that.isEdit){
                            that.oper._renderItem(that.bill.reportList);
                            that._selectedEl(that.bill);
                        }
                    },
                    afterCloseHandler: function(){
                        that._resetSelect();
                    }
                };

            if(!that.isEdit){
                dlgStr = Juicer.client(addFormTemp, {
                    createdTime: that.opts.date,
                    billType: that.billType
                });
            }else{
                S.mix(that.bill, {
                    billType: that.billType
                });
                dlgStr = Juicer.client(addFormTemp, that.bill);

            }
            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 打开对话框之后,绑定相应事件操作
         * @private
         */
        _addEvt: function(){
            var
                that = this;

            on(el.addForm, 'submit', function(){
                return false;
            });
            on(el.moneyEl, 'focusin', function(){
                that._getMoney(function(){
                    that._unlockAddTrigger();
                });
            });
            on(el.costCardQuantityEl, 'keyup', function(){
                //若成本卡数量未输入，则无法将数据添加到单据中
                if (DOM.val(el.costCardQuantityEl) == '') {
                    that._lockAddTrigger();
                }else{
                    that._unlockAddTrigger();
                }
            });

            //入库单据的添加触发
            on(el.addTrigger, 'click', function(){
                if(DOM.text(get('.J_renderTo')) == ''){
                    Dialog.alert('您没有选择物品,请您先选择物品!', function(){
                        that.searchSelect.unfold();
                    });
                    return false;
                }
                if(!that.lock && that.data != null ){
                    if(DOM.val(el.moneyEl) != '' || DOM.val(el.moneyEl).length != 0){
                        that.oper.fire('addStoreBill', that.data);
                        that.oper.fire('addTotalMoney', {
                            money: that.data.money
                        });
                        that.oper.fire('emptyStoreBill', {
                            defender: that.defender
                        });
                        that._lockAddTrigger();
                    }
                }
            });
            //除入库单据外，添加触发（带验证是否添加合理的功能）
            on(el.addCheckTrigger, 'click', function(){
                if(DOM.text(get('.J_renderTo')) == ''){
                    Dialog.alert('您没有选择物品,请您先选择原材料!', function(){
                        that.oper.fire('unfold');
                    });
                    return false;
                }else{
                    //发送ajax，并验证是否能合理添加
                    StoreBillManagementIO.checkEnableAdd({
                        type: that.billType,
                        id: DOM.attr('.J_renderTo', 'data-result-id'),
                        costCardQuantity: DOM.val(el.costCardQuantityEl)
                    }, function(rs, data, errMsg){
                        if(rs){
                            that.oper.fire('addStoreBill', {
                                storageUnitName: data.storageUnitName,
                                storageQuantity: data.storageQuantity
                            });
                            that.oper.fire('emptyStoreBill', {
                                defender: that.defender
                            });
                            that._lockAddTrigger();
                        }else{
                            Dialog.alert(errMsg);
                        }
                    });
                }
            });
            
            on(el.delTrigger, 'click', function(){
                that.oper.fire('delStoreBill', {billType: that.billType});
            });

            on(el.emptyTrigger, 'click', function(){
                that.oper.fire('emptyStoreBill', {
                    defender: that.defender
                });
            });
        },
        /**
         * 将经手人\操作人\存放点下拉列表实时渲染到对话框中
         * @privateJ_edit
         */
        _renderSelect: function(){
            var
                that = this,
                depotEl = DOM.clone(el.depotSelectEl, true),
                depotOutEl = DOM.clone(el.depotOutSelectEl, true),
                depotInEl = DOM.clone(el.depotInSelectEl, true),
                handlerEl = DOM.clone(el.handlerSelectEl, true),
                checkedEl = DOM.clone(el.checkSelectEl, true);
                // createEl = DOM.clone(el.createSelectEl, true);
                
            DOM.append(depotOutEl, el.depotOutContainer);
            DOM.append(depotEl, el.depotContainer);
            DOM.append(depotInEl, el.depotInContainer);
            DOM.append(handlerEl, el.handlerContainer);
            DOM.append(checkedEl, el.checkContainer);
            // DOM.append(createEl, el.createContainer);
            DOM.removeClass(depotOutEl, 'hidden');
            DOM.removeClass(depotInEl, 'hidden');
            DOM.removeClass(depotEl, 'hidden');
            DOM.removeClass(handlerEl, 'hidden');
            DOM.removeClass(checkedEl, 'hidden');
            // DOM.removeClass(createEl, 'hidden');
        },
        /**
         * 选中下拉列表
         * @param obj
         * @private
         */
        _selectedEl: function(obj){
            var
                that = this,
                depotId = obj.depotId,
                handlerPartyId = obj.handlerPartyId,
                createdPartyId = obj.createdPartyId;
                
            S.each(query('option', el.depotSelectEl), function(option){
                if(DOM.attr(option, 'selected') == 'selected'){
                    DOM.removeAttr(option, 'selected');
                }
                if(DOM.attr(option, 'value') == depotId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
            S.each(query('option', el.handlerSelectEl), function(option){
                if(DOM.attr(option, 'selected') == 'selected'){
                    DOM.removeAttr(option, 'selected');
                }
                if(DOM.attr(option, 'value') == handlerPartyId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
            S.each(query('option', el.createSelectEl), function(option){
                if(DOM.attr(option, 'selected') == 'selected'){
                    DOM.removeAttr(option, 'selected');
                }
                if(DOM.attr(option, 'value') == createdPartyId){
                    DOM.attr(option, 'selected', 'selected');
                }
            });
        },
        /**
         * 验证对话框
         * @param me
         * @private
         */
        _validAddForm: function(me){
            var
                that = this,
                dialog = me,
                data,
                trs,
                length,
                itemObj = {},
                items = [],
                sendObj = {};
    
            DOM.attr(el.quantityEl, 'disable', 'disabled');
            data = DOM.serialize(el.addForm);
            trs = query('tr', el.billListContainer);
            length = trs.length;

            // 点击确认，若没有添加任何单据项时提示
            if(length == 0){
                Dialog.alert('您没有为此单据添加任何物品!', function(){
                    that.searchSelect.unfold();
                });
            }else{
                S.each(trs, function(tr){
                    itemObj = DOM.serialize(tr);
                    //根据类型拼接单据中的子数据
                    if(that.billType == 1){
                        items.push(S.mix({}, {
                            itemId: Number(itemObj.itemId),
                            itemNumber: itemObj.itemNumber,
                            costCardQuantity: Number(itemObj.costCardQuantity),
                            costCardUnitName: itemObj.costCardUnitName,
                            orderQuantity: Number(itemObj.orderQuantity),
                            orderUnitName: itemObj.orderUnitName,
                            price: Number(itemObj.price),
                            count: Number(itemObj.count),
                            comment: itemObj.comment
                        }));
                    }else{
                        items.push(S.mix({}, {
                            ingredientId: Number(itemObj.ingredientId),
                            ingredientNumber: itemObj.ingredientNumber,
                            costCardQuantity: Number(itemObj.costCardQuantity),
                            costCardUnitName: itemObj.costCardUnitName,
                            storageQuantity: Number(itemObj.storageQuantity),
                            storageUnitName: itemObj.storageUnitName,
                            comment: itemObj.comment
                        }));
                    }
                });
                // 拼接单据公共部分数据：总金额/存放点/经手人/单据类型(针对不同的单据会有多余数据)
                //id：0 表单据为添加状态
                if(that.billType == 1){
                    S.mix(sendObj, {
                        storageReport: {
                            money: Number(DOM.text(el.totalMoneyEl)),
                            depotId: Number(data.depotId),
                            handlerPartyId: Number(data.handlerPartyId),
                            type: Number(that.billType),
                            id: Number(data.id),
                            comment: DOM.val(el.commentEl)
                        },
                        storageReportItemList: items
                    });
                }else{
                    S.mix(sendObj, {
                        storageReport: {
                            money: Number(DOM.text(el.totalMoneyEl)),
                            depotId: Number(data.depotId),
                            handlerPartyId: Number(data.handlerPartyId),
                            type: Number(that.billType),
                            id: Number(data.id),
                            comment: DOM.val(el.commentEl)
                        },
                        storageReportIngredientList: items
                    });
                }
                
                if(that.isEdit){
                    StoreBillManagementIO.editStoreBill(S.JSON.stringify(sendObj), function(rs, errMsg){
                        //S.log(S.JSON.stringify(sendObj));
                        if(rs){
                            Dialog.alert('编辑成功!');
                            that.pagination.reload(that.opts);
                        }else{
                            Dialog.alert(errMsg);
                        }
                        dialog.close();
                        that.data = null;
                    });
                }else{
                    StoreBillManagementIO.addStoreBill(S.JSON.stringify(sendObj), function(rs, errMsg){
                        //S.log(S.JSON.stringify(sendObj));
                        if(rs){
                            Dialog.alert('添加成功!');
                            that.pagination.reload(that.opts);
                        }else{
                            Dialog.alert(errMsg);
                        }
                        dialog.close();
                        that.data = null;
                    });
                }
            }
        },
        /**
         * 重置下拉列表
         * @private
         */
        _resetSelect: function(){
            var
                that = this,
                check = query('option', el.checkSelectEl),
                depot = query('option', el.depotSelectEl),
                handler = query('option', el.handlerSelectEl),
                create = query('option', el.createSelectEl);

            for(var p = 0; p < check.length; p ++){
                if(p == 0){
                    DOM.attr(check[p], 'selected', 'selected');
                }else{
                    DOM.removeAttr(check[p], 'selected');
                }
            }

            for(var i = 0; i < depot.length; i ++){
                if(i == 0){
                    DOM.attr(depot[i], 'selected', 'selected');
                }else{
                    DOM.removeAttr(depot[i], 'selected');
                }
            }
            for(var j = 0; j < handler.length; j ++){
                if(j == 0){
                    DOM.attr(handler[j], 'selected', 'selected');
                }else{
                    DOM.removeAttr(handler[j], 'selected');
                }
            }
            for(var k = 0; k < create.length; k ++){
                if(k == 0){
                    DOM.attr(create[k], 'selected', 'selected');
                }else{
                    DOM.removeAttr(create[k], 'selected');
                }
            }
        },
        /**
         * 加锁
         * @private
         */
        _lockAddTrigger: function(){
            var
                that = this;

            DOM.attr(el.addTrigger, 'disabled', 'disabled');
            DOM.attr(el.addCheckTrigger, 'disabled', 'disabled');
            that.lock = true;
        },
        /**
         * 解锁
         * @private
         */
        _unlockAddTrigger: function(){
            var
                that = this;

            DOM.removeAttr(el.addTrigger, 'disabled');
            DOM.removeAttr(el.addCheckTrigger, 'disabled');
            that.lock = false;
        },
        /**
         * 调用selectpicker组件
         * @private1
         */
        _searchSelect: function(){
            var
                that = this,
                price;

            that.searchSelect = PW.module.SearchSelect.client({
                selectPicker: '.selectpicker',
                liveSearch: true,
                root: '#basic',
                multiple: false,
                inDlg: true,
                urlCoreParam: 'getGoodsName' 
            });
            that.searchSelect.on('selectAfter', function(e){
                itemNumber  = e.extendParam.itemNumber;
                price = e.extendParam.price;
                orderUnitName = e.extendParam.orderUnitName;
                DOM.val(el.priceEl, price);
                DOM.val(el.orderUnitNameEl, orderUnitName);
                DOM.val(el.quantityEl, '');
                DOM.val(el.moneyEl, '');
            });
        },
        /**
         * 获取小计
         * @param cb
         * @private
         */
        _getMoney: function(cb){
            var
                that = this,
                price = DOM.val(el.priceEl),
                quantity = DOM.val(el.quantityEl),
                orderUnitName = DOM.val(el.orderUnitNameEl),
                renderTo = get('.J_renderTo', '#basic');

            //点击小计input, send：orderUnitName和orderQuantity,
            //               return: costCardUnitName和costCardQuantity
            if(price != '' && quantity != '' && that.defender.getItemResult(el.quantityEl)){
                StoreBillManagementIO.getMoney({
                    type: that.billType,
                    price: price,
                    orderUnitName: orderUnitName,
                    orderQuantity: quantity,
                    id: DOM.attr(renderTo, 'data-result-id')
                }, function(rs, data, errMsg){
                    if(rs){
                        DOM.val(el.moneyEl, data.money);
                        that.data = data;
                        if(S.isFunction(cb)){
                            cb();
                        }
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            }
        },
        /**
         * 获取当前的库存单据对象
         * modified:
         * @param e
         * @private
         */
        _getStoreBill: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                type = DOM.attr(tr, 'data-store-bill-type'),
                billObj = DOM.serialize(tr),
                itemEl = get('.J_reportItem', tr),
                itemObj = [],
                itemPs = query('p', itemEl),
                itempObj,
                bill = {};
            
            // 获取该单据下的所有明细
            S.each(itemPs, function(itemp){
                itempObj = DOM.serialize(itemp);
                if(type == 1){
                    S.mix(itempObj, {
                        itemId: DOM.attr(itemp, 'data-item-id')
                    });      
                }else{
                    S.mix(itempObj, {
                        ingredientId: DOM.attr(itemp, 'data-item-id')
                    });
                }
                itemObj.push(itempObj);
            });

            // 拼凑该单据的所有信息
                S.mix(bill, {
                    createdTime: DOM.attr(tr, 'data-store-bill-createdTime'),
                    depotId: billObj.depotId,
                    auditPartyId: billObj.auditPartyId,
                    createdName: billObj.createdName,
                    auditName: billObj.auditName,
                    isSettlemented: billObj.isSettlemented,
                    isAudited: billObj.isAudited,
                    handlerPartyId: billObj.handlerPartyId,
                    createdPartyId: billObj.createdPartyId,
                    serialNumber: billObj.serialNumber,
                    money: billObj.money,
                    reportList: itemObj,
                    id: DOM.attr(tr, 'data-store-bill-id'),
                    comment: DOM.attr(tr, 'data-store-bill-comment'),
                    type: type,
                    isEdit: true       //判断是否出于编辑状态
                });
        
            that.bill = bill;
            that.billType = type;
            //S.log(that.bill);
            //向bill对象中添加billType属性，以便之后判断编辑状态的不同
            S.mix(that.bill, {
                billType: that.billType
            })
            that.title = '编辑' + typeMap[type];
        },
        /**
         * 快速搜索
         * @param e
         * @private
         */
        _fastSearch: function(e){
            var
                that = this,
                startTime = DOM.attr(e, DATA_START_TIME),
                endTime = DOM.attr(e, DATA_END_TIME),
                data = DOM.serialize(el.searchForm);

            that._renderCalendar(startTime, endTime);
            S.mix(data, {
                startTime: startTime,
                endTime: endTime
            });
            that.pagination.reload(S.mix(that.opts, {
                extraParam: data
            }));
        },
        /**
         * 渲染时间段
         * @param startTime
         * @param endTime
         * @private
         */
        _renderCalendar: function(startTime, endTime){
            var
                that = this;

            DOM.val(el.startTimeEl, startTime);
            DOM.val(el.endTimeEl, endTime);
        },
        /**
         * 初始化存放点复选框
         * @private
         */
        // _initSelect: function(){
        //     var
        //         that = this;

        //     SelectAll.client({
        //         root: el.searchForm,
        //         toggleTrigger: el.selectAllTrigger,
        //         select: el.depotTrigger
        //     });
        // },
        /**
         * 搜索
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
        /**
         * 初始化分页
         * @private
         */
        _initPagi: function(){
            var
                that = this;

            S.mix(that.opts, {
                extraParam: {
                    depotId: '',
                    createdPartyId: '',
                    handlerPartyId: '',
                    auditPartyId: '',
                    isSettlemented: '',
                    isAudited: '',
                    startTime: '',
                    endTime: ''
                }
            });
            that.pagination = Pagination.client(that.opts);
        },
        /**
         * 默认选中时间段
         * @private
         */
        _initDate: function(){
            var
                that = this,
                startTime = DOM.attr(el.startTimeEl, DATA_START_TIME),
                endTime = DOM.attr(el.endTimeEl, DATA_END_TIME);

            Calender.client({
                renderTo: el.startTimeEl,
                select: {
                    selected: startTime,
                    showTime: false
                }
            });
            Calender.client({
                renderTo: el.endTimeEl,
                select: {
                    selected: endTime,
                    showTime: false
                }

            });
        }
    });

    return List;
},{
    requires: [
        'store-bill-management/oper',
        'module/search-select',
        'mod/pagination',
        'mod/calendar',
        'mod/selectall',
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/store-management/store-bill-management'
    ]
});

KISSY.add('store-bill-management/oper', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        SelectAll = PW.mod.Selectall,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        StoreBillManagementIO = PW.io.StoreManagement.StoreBillManagement,
        el = {
            // 添加、编辑表单
            addForm: '.J_addForm',
            //审核表单
            checkForm: '.J_checkForm',
            // 单据存放容器
            billList: '.J_billList',
            // 单据模板
            billTemp: '#billTpl',
            // 物品名称
            nameEl: '.J_renderTo',
            //全选触发器
            selectAllTrigger: '.J_selectAll1',
            // 单据多选
            checkbox: '.J_check',
            // 搜索物品
            searchRenderEl: '.J_renderTo',
            // 单价
            priceEl: '.J_price',
            // 订货单位显示区
            orderUnitNameEl: '.J_orderUnitName',
            //订货数量
            orderQuantityEl: '.J_orderQuantity',
            //成本卡单位显示区
            costCardUnitNameEl: '.J_costCardUnitName',
            //成本卡数量
            costCardQuantityEl: '.J_costCardQuantity',
            // 数量
            quantityEl: '.J_quantity',
            // 小计金额
            moneyEl: '.J_money',
            // 总金额
            totalMoneyEl: '.J_totalMoney',
            // 每一条的成本金额
            countMoneyEl: '.J_countMoney',
            // 擦除触发器
            emptyTrigger: '.J_emptyInStoreBill',
            // 删除触发器
            delTrigger: '.J_delInStoreBill',
            // 单据备注
            commentEl: '.J_comment',
            // 物品备注
            itemCommentEl: '.J_itemComment',
            //select
            searchGoodsSelect: '.J_searchGoodsSelect',
            //渲染的div
            goodsRenderTo: '#goodsInstore .J_renderTo',
            //物品的div
            goodsInstoreEl: '#goodsInstore',
            //弹出层中搜索列表中的li
            renderLi: '#goodsInstore .J_render-list',
            //搜索原材料input：
            ingredientSearchInp: '.J_ingredientSearchInp',
            //菜品名称搜索的El
            renderToEl: '.J_renderTo',
            // 搜索原材料模板
            selectTpl: '#selectTpl'
        };

    function Oper(){
        this.billType;
        // 选中的复选框节点
        this.checkBox = [];
        // 物品项列表的个数
        this.billNumber;
        // 选中的复选框的个数
        this.count = 0;
        var
            totalMoney = DOM.text(el.totalMoneyEl);
        if(totalMoney == '' || totalMoney.length == 0){
            this.totalMoney = 0;
        }else{
            this.totalMoney = totalMoney;
        }
        this._init();
    }

    S.augment(Oper, S.EventTarget, {
        _init: function(){
            this._buildEvt();
            this.list = this._getSearchList();
            this._renderList(this.list);
        },
        _buildEvt: function(){
            var
                that = this;

            that.on('addStoreBill', function(e){
                that._addStoreBill(e);
            });

            that.on('delStoreBill', function(e){
                that._delStoreBill(e);
            });

            that.on('addTotalMoney', function(e){
                that._addTotalMoney(e);
            });

            that.on('emptyStoreBill', function(e){
                that._emptyStoreBill(e);
            });

            that.on('unfold', function(e){
                that._unfold(e);
            });

            // 全选物品项
            delegate(el.addForm, 'click', el.selectAllTrigger, function(e){
                that._selectAll(e.target);
            });

            // 点击物品项中的复选框操作
            delegate(el.addForm, 'click', el.checkbox, function(e){
                that._checkBox(e.target);
            });

            //点击物品搜索框时，去除错误的样式
            delegate(document, 'click', el.renderToEl, function(e){
                $(e.currentTarget).removeClass('error');
            })
            
            //点击原材料搜索框时，显示菜单
            delegate(document,'click', el.goodsRenderTo, function(e){
                e.stopPropagation();
                that._openMenu(e.currentTarget);
            });
            //点击原材料的li
            delegate(document, 'click', el.renderLi, function(e){
                that._selectLi(e.currentTarget);
            });
            //阻止冒泡
            delegate(document, 'click', el.ingredientSearchInp, function(e){
                e.stopPropagation();
            });
            //关闭菜单
            on(document, 'click', function(){
                that._closeMenu();
            });
            //搜索原材料
            delegate(document, 'keyup', el.ingredientSearchInp, function(e){
                that._openMenu(e.currentTarget);
                that._getIngredient(DOM.val(e.currentTarget), e.currentTarget);
            });     
        },

        _unfold: function(e){
            var 
                menuUl = DOM.get('.menu');

            DOM.removeClass(menuUl, 'hidden');
        },
        /**
         * 输入搜索原材料关键字，返回原材料信息
         * @param  {[type]} value [description]
         * @param  {[type]} e     [description]
         * @return {[type]}       [description]
         */
        _getIngredient: function(value, e){
            var 
                that = this,
                newElement = '',
                ulEl = DOM.parent(e, 'ul');
                lis = DOM.query('li', ulEl);

            StoreBillManagementIO.sendIngredientKeyword({keyword: value}, function(rs, list, errMsg){
                if(rs){
                    S.log(list);
                    S.each(list, function(item){
                        newElement += '<li class="J_render-list" data-id="'+ item.ingredientId +'" data-costCardUnitName="'
                                + item.costCardUnitName +'" data-name="' + item.name + '" data-ingredientNumber="' 
                                + item.ingredientNumber +'" data-code="' + item.code+ '">'
                                +'<a href="javascript:;">'+ '[' +item.code + ']' +''+item.ingredientNumber + '&nbsp;'+ item.name +'</a>'
                                +'</li>' ;
                    })  
                    DOM.remove(lis);
                    $(ulEl).append(newElement);
                }
            })
          
        },
        /**
         * 获取自定义搜索组件中下拉列表的初始数据
         * @return {[type]} [description]
         */
        _getSearchList: function(){
            var 
                that = this,
                list = [],
                itemId,
                ingredient,
                code,
                name;

            S.each($(el.searchGoodsSelect).children(), function(item){
                data = {
                    ingredientId : $(item).attr('value'),
                    code : $(item).attr('data-code'),
                    name : $(item).text(),
                    costCardUnitName: $(item).attr('data-costCardUnitName'),
                    ingredientNumber: $(item).attr('data-ingredientNumber')
                };
                list.push(data);
            })
            return list;
        },
        /**
         * 渲染搜索框下方的ul
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _renderList: function(data){

             var 
                that = this,
                selectTpl = $(el.selectTpl).html(),
                selectTplStr = Juicer.client(selectTpl, {list: data});
            $(selectTplStr).insertAfter($(el.goodsRenderTo));
        },
        /**
         * 打开搜索列表
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _openMenu: function(e){
            var
                that = this,
                ulEl = DOM.get('ul', e);

            $(ulEl).removeClass('hidden');
        },
        /**
         * 关闭搜索列表
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _closeMenu: function(){
            var
                that = this,
                menuEl = DOM.get('ul', el.goodsInstoreEl);
            
            DOM.addClass(menuEl, 'hidden');
        },
        /**
         * 选中li后，把内容渲染到div中，并且关闭ul
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _selectLi: function(e){
            var 
                that = this,
                id = $(e).attr('data-id'),
                code = $(e).attr('data-code'),
                name = $(e).attr('data-name'),
                costCardUnitName = $(e).attr('data-costCardUnitName'),
                ingredientNumber = $(e).attr('data-ingredientNumber');
            // 将select的li数据显示到div中，显示数据格式：[code]name
            $(el.goodsRenderTo).html('['+code+']&nbsp;'+ingredientNumber + '&nbsp;'+ name+ '<span class="caret"></span>');
            
            //显示选中原材料的成本卡单位
            $(el.costCardUnitNameEl).val(costCardUnitName);
            
            //给渲染到J_renderTo中的div添加属性
            DOM.attr(DOM.get(el.goodsRenderTo), "data-result-id", id);
            DOM.attr(DOM.get(el.goodsRenderTo), 'data-result-name', name);
            DOM.attr(DOM.get(el.goodsRenderTo), 'data-result-ingredientNumber', ingredientNumber);
        },
        /**
         * 渲染添加的物品项
         * @param obj
         * @private
         */
        _renderItem: function(obj){
            var
                that = this,
                billTemp = DOM.html(el.billTemp),
                billStr = '',
                billDOM;
            //S.log(obj);
            S.each(obj, function(item){
                S.mix(item, {
                    billType: that.billType
                })
                billStr += Juicer.client(billTemp, item);
            }); 
            billDOM = DOM.create(billStr);
            DOM.append(billDOM, el.billList);
            that.billNumber = query('tr', el.billList).length;
        },
        /**
         * 计算总金额
         * @param e
         * @private
         */
        _addTotalMoney: function(e){
            var
                that = this,
                money = e.money;

            that._countTotalMoney('add', money);
        },
        /**
         * 计算总金额
         * @param type
         * @private
         */
        _countTotalMoney: function(type, money){
            var
                that = this;

            if(type == 'add'){
                that.totalMoney = parseFloat(that.totalMoney) + parseFloat(money);
            }else if(type == 'sub'){
                that.totalMoney = parseFloat(that.totalMoney) - parseFloat(money);
            }
            DOM.text(el.totalMoneyEl, that.totalMoney);
        },
        /**
         * 清空对话框中输入框内容,并重载验证
         * @param e
         * @private
         */
        _emptyStoreBill: function(e){
            var
                that = this,
                searchRenderEl = get(el.searchRenderEl, el.addForm),
                priceEl = get(el.priceEl, el.addForm),
                orderUnitNameEl = get(el.orderUnitNameEl, el.addForm),
                costCardUnitNameEl = get(el.costCardUnitNameEl, el.addForm),
                quantityEl = get(el.quantityEl, el.addForm),
                moneyEl = get(el.moneyEl, el.addForm),
                itemCommentEl = get(el.itemCommentEl, el.addForm);

            DOM.val(priceEl, '');
            DOM.val(quantityEl, '');
            DOM.val(moneyEl, '');
            DOM.val(itemCommentEl, '');
            DOM.val(orderUnitNameEl, '');
            DOM.val(costCardUnitNameEl, '');
            DOM.removeAttr(searchRenderEl, 'data-result-id');
            DOM.removeAttr(searchRenderEl, 'data-result-name');
            DOM.removeAttr(searchRenderEl, 'data-result-price');
            DOM.removeAttr(searchRenderEl, 'data-result-itemNumber');
            DOM.removeAttr(searchRenderEl, 'data-result-ingredientNumber');
            DOM.removeAttr(searchRenderEl, 'data-result-orderUnitName');
            DOM.html(searchRenderEl, '<span class="caret"></span>');
            e.defender.refresh();
        },
        /**
         * 选中复选框,
         * @param e
         * @private
         */
        _checkBox: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr');

            if(DOM.attr(e, 'checked') == 'checked'){
                DOM.addClass(tr, 'selected');
                that.count ++;
            }else{
                DOM.removeClass(tr, 'selected');
                that.count --;
            }

            if(that.count == that.billNumber){
                DOM.attr(el.selectAllTrigger, 'checked', 'checked');
            }else{
                DOM.removeAttr(el.selectAllTrigger, 'checked');
            }

            if(that.count > 0){
                DOM.removeAttr(el.delTrigger, 'disabled');
            }else{
                DOM.attr(el.delTrigger, 'disabled', 'disabled');
            }
        },
        /**
         * 全选复选框
         * @param e
         * @private
         */
        _selectAll: function(e){
            var
                that = this,
                checkbox = query('input[type="checkbox"]', el.billList),
                tr = query('tr', el.billList);

            if(DOM.attr(e, 'checked') == 'checked'){
                DOM.attr(checkbox, 'checked', 'checked');
                DOM.addClass(tr, 'selected');
                that.count = tr.length;
            }else{
                DOM.removeAttr(checkbox, 'checked');
                DOM.removeClass(tr, 'selected');
                that.count = 0;
            }
            DOM.removeAttr(el.delTrigger, 'disabled');
        },
        /**
         * 添加物品项
         * @param e
         * @private
         */
        _addStoreBill: function(e){
            var
                that = this,
                billTpl = DOM.html(el.billTemp),
                renderTo = get('.J_renderTo', el.addForm),
                billStr,
                billDOM,
                renderToItemName = DOM.attr(renderTo, 'data-result-name'),
                startWord = renderToItemName.indexOf(']') + 1,
                itemName = renderToItemName.slice(startWord, startWord.length);

            if (that.billType == 1) {
                // 获取入库物品当前添加物品项的数据
                S.mix(e, {
                    itemName: itemName,
                    price: DOM.val(el.priceEl),
                    itemId: DOM.attr(renderTo, 'data-result-id'),
                    count: DOM.val(el.moneyEl),
                    itemNumber: DOM.attr(renderTo, 'data-result-itemNumber'),
                    orderQuantity: DOM.val(el.orderQuantityEl),
                    orderUnitName: DOM.val(el.orderUnitNameEl),
                    storageUnitName: e.storageUnitName,
                    comment: DOM.val(el.itemCommentEl),
                    billType: that.billType
                });
            }else{
                //获取除入库物品外，当前添加物品项的数据
                S.mix(e, {         
                    ingredientName: itemName,
                    ingredientId: DOM.attr(renderTo, 'data-result-id'),
                    ingredientNumber: DOM.attr(renderTo, 'data-result-ingredientNumber'),
                    costCardQuantity: DOM.val(el.costCardQuantityEl),
                    costCardUnitName: DOM.val(el.costCardUnitNameEl),
                    storageUnitName: e.storageUnitName,
                    storageQuantity: e.storageQuantity,
                    comment: DOM.val(el.itemCommentEl),
                    billType: that.billType
                });
            }
            billStr = Juicer.client(billTpl, e);
            billDOM = DOM.create(billStr);
            DOM.append(billDOM, el.billList);
            that.billNumber = query('tr', el.billList).length;
            DOM.removeAttr(el.selectAllTrigger, 'checked');
        },
        /**
         * 删除物品项
         * @private
         */
        _delStoreBill: function(e){
            var
                that = this,
                checkbox = query('input[type="checkbox"]', el.billList),
                tr,
                selectTr = query('tr.selected', el.billList),
                countMoneyEl,
                countMoney,
                subTotalMoney = 0;
            //如果是入库单，删除物品项的同时也改变金额
            if(that.billType == 1){
                S.each(selectTr, function(tr){
                    countMoneyEl = get(el.countMoneyEl, tr);
                    countMoney = parseFloat(S.trim(DOM.text(countMoneyEl)));
                    subTotalMoney += countMoney;
                });
                that._countTotalMoney('sub', subTotalMoney);
            }
            that._renderCheckbox();
            DOM.attr(el.delTrigger, 'disabled', 'disabled');
        },
        /**
         * 渲染复选框勾选与否
         * @private
         */
        _renderCheckbox: function(){
            var
                that = this,
                checkbox = query('input[type="checkbox"]', el.billList),
                tr,
                selectTr = query('tr.selected', el.billList);

            if(that.count == 0){
                return;
            }else{
                DOM.remove(selectTr);
                that.billNumber -= selectTr.length;
            }

            DOM.removeAttr(el.selectAllTrigger, 'checked');
            tr = query('tr', el.billList);
            if(tr.length == 0){
                that.billNumber = 0;
            }

            that.count = 0;
        }
    });
    return Oper;
},{
    requires: [
        'mod/selectall',
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'pio/store-management/store-bill-management'
    ]
});