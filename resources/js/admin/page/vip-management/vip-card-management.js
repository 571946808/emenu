/*-------------------------------------------------------------
* @Description:     会员管理--会员卡管理io
* @Version:         1.0.0
* @author:          hj(435043636@qq.com)
* @date             2016.1.20
* ==NOTES:=============================================
* v1.0.0(2016.1.20):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-card-management', function(S,Core){
    PW.namespace('page.vipCardManagement.Core');
    PW.page.vipCardManagement.Core = function(param){
        new Core(param);
    }
}, {
    requires:[
        'vip-card-management/core'
    ]
})
/* -----------------------------------------------------------------*/
KISSY.add('vip-card-management/core', function(S){
    var 
        DOM = S.DOM, 
        $ = S.all,
        on = S.Event.on, 
        delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        Calendar = PW.mod.Calendar,
        Pagination = PW.mod.Pagination,
        VipCardInfoIO = PW.io.VipManagement.VipCardInfo,
        config = {},
        el={
            //日期input
            dateInp: '.J_date',
            //编辑状态的有效期
            validityDateInp: '.J_validityDate',
            //会员卡隐藏域
            cardHiddenInp: '.J_card',
            //关键字input
            keyInp: '.J_key',
            //状态
            status: '.J_status',
            //操作人
            operator: ".J_operator",
            //搜索触发器
            searchTrigger: '.J_search',
            //状态改变触发器
            changeTrigger: '.J_changeBtn',
            //删除触发器
            delTrigger: '.J_delBtn',
            //取消触发器
            cancelTrigger: '.J_cancelBtn',
            //编辑触发器
            editTrigger: '.J_editBtn',
            //保存触发器
            saveTrigger: '.J_saveBtn',
            //搜索区域表单
            searchForm: '.J_searchForm',
            //信息显示表单
            form: ".J_operForm",
            //编辑模板
            editTpl: "#editTpl",
            //保存模板
            saveTpl: "#saveTpl"
        },
        DATA_CARD_ID = 'vip-card-id',
        STATUS = ['停用','解挂','挂失'],
        STATUSMAP = {
            '停用': 0,
            '解挂': 1,
            '挂失': 2   
        },
        CARD_CURRENT_STATUS = ['可用','已挂失'];
        BAN_OPERATION_TIP= ['操作失败：已存在编辑项，请保存或取消后再操作！'],
        OPERATION_TIP = ['确定删除该会员卡信息吗？',
                         '确定保存该会员卡信息吗？'],            
        SUCCESS_TIP = ['删除成功！',
                       '保存成功！'];
    function Core(param){
        //分页初始化
        this.opts = S.merge(config, param);
        this.pagination;
        this.cardData;  //会员卡信息
        this.cardEls;  //隐藏域对象
        this.selectedStatus; //下拉列表选中状态
        this.defender = Defender.client(el.form, {
            showTip:false
        });
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this._initPagi();
            this._builtEvt();
            this._tip();
        },
        /**
         * 分页初始化
         * @return {[type]} [description]
         */
         _initPagi: function(){
            var
                that = this,
                opts = that.opts;

            that.pagination = Pagination.client(opts);
        },
        _builtEvt: function(){
            var
                that = this;

            //时间查询
            that._calendar();

            //搜索
            delegate(document, 'click', el.searchTrigger, function(){
                that._searchReloadPagi();
            });

            //改变会员卡状态
            delegate(document, 'click', el.changeTrigger, function(e){
                if(that._hasEdit()){
                    that._changeCardStatus(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });

            //编辑
            delegate(document, 'click', el.editTrigger, function(e){
                if(that._hasEdit()){
                    that._getHiddendInpCard();
                    that._editCardInfo(e.target);
                }else{
                     Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });

            //select选择触发器
            delegate(document, 'click', 'select', function(e){
                that._changepermanentlyDate(e.target);
            });

            //保存
            delegate(document, 'click', el.saveTrigger, function(e){
                that._saveCardInfo(e.target);
            });

            //取消
            delegate(document, 'click', el.cancelTrigger, function(e){
                that._cancelCardInfo(e.target);
            });

            //删除
            delegate(document, 'click', el.delTrigger, function(e){
                if (that._hasEdit()) {
                    that._delCardInfo(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            })
        },
        /**
         * 若无内容，提示暂无内容
         * @return {[type]} [description]
         */
        _tip: function(){
            var 
                that = this,
                tr = S.one('tr', el.dataRender),
                tipStr = '<tr class="J_tip"><td class="text-center" colspan="5">暂无内容</td></tr>';

            if(!tr){
                $(el.dataRender).prepend(tipStr);
            }else{
                $('.J_tip').remove();
            }
        },
        /**
         * 时间选择
         * @return {[type]} [description]
         */
        _calendar: function(){
            var 
                that = this,
                dateInpEl = DOM.query(el.dateInp);

            S.each(dateInpEl, function(dateInp){
                Calendar.client({
                    renderTo: dateInp,
                    select:{
                        rangeSelect: false,
                        dateFmt: 'YYYY-MM-DD',
                        showTime: false
                    }
                })
            }); 
        },
        /**
         * 搜索后刷分页
         * @return {[type]} [description]
         */
        _searchReloadPagi: function(){
            var
                that = this,
                searchFormData = DOM.serialize(el.searchForm),
                opts = S.mix(that.opts, {extraParam: searchFormData});

            that.pagination.reload(opts);
        },
        /**
         * 判断编辑项是否存在
         * @return {Boolean} [description]
         */
        _hasEdit:function(){
            if($(el.saveTrigger).length == 0){
                return true;
            }else{
                return false;
            }
        },
        /**
         * 获取form隐藏域中的值
         * @return {[type]} [description]
         */
        _getHiddendInpCard: function(){
            var
                that = this,
                cardEls = DOM.query(el.cardHiddenInp, el.form);

            that.cardEls = cardEls;
        },
        /**
         * 编辑会员卡信息
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editCardInfo: function(e){
            var
                that = this,
                tr = $(e).parent('tr'),
                id = $(tr).attr(DATA_CARD_ID),
                tds = DOM.query('td', tr),
                cardInfo=[];
                // cardInfo = [{id:""},{name:""},{phone:""},{cardNumber:""},
                // {createdTime:""},{validityTime:""},{permanentlyEffective:""},
                // {operator:""},{status:""}];

            //数组cardInfo存储编辑模板要渲染的值
            cardInfo.push(id);
            S.each(tds, function(td){
                cardInfo.push(S.trim(DOM.text(td)));
            });

            //删除多余元素
            for(var i = cardInfo.length - 2; i < cardInfo.length; i++){
                cardInfo.pop();
            };
            that.cardInfo = cardInfo;

            that._getCardData();
            that._renderEdit(e, cardInfo, tr, cardData);
        },
        /**
         * 获取渲染数据cardData
         * @return {[type]}   [description]
         */
        _getCardData: function(){
            var
                that = this;

            //将数组cardInfo的赋值给隐藏域cardEls对象
            S.each(that.cardEls, function(inputEl, index){
                DOM.val(that.cardEls[index], that.cardInfo[index]);
            });
            cardData = DOM.serialize(el.form);
            that.cardData = cardData;
        },
        /**
         * 编辑后渲染
         * @param  {[type]} e        [description]
         * @param  {[type]} cardInfo [description]
         * @param  {[type]} tr       [description]
         * @param  {[type]} cardData [description]
         * @return {[type]}          [description]
         */
        _renderEdit: function(e, cardInfo, tr, cardData){
            var 
                that = this,
                editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {card:cardData});

            $(editTplStr).insertAfter($(tr));
            $(tr).hide();

            //日期选择
            Calendar.client({
                renderTo: el.validityDateInp,
                select:{
                    rangeSelect: false,
                    dateFmt: 'YYYY-MM-DD',
                    showTime: false,
                    selected: cardData.validityTime
                }
            });
            that.defender.refresh();
            that._changepermanentlyDate(e.target);
        },
        /**
         * 选择是否永久有效时的有效期样式
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _changepermanentlyDate: function(e){
            var
                that = this,
                selectEls = DOM.get('select','tr');

            for(var p = 0; p < selectEls.length; p++){
                if(selectEls[p].selected==true){
                    if(selectEls[p].text == "是"){
                        that.selectedStatus = 1;
                        DOM.hide(el.validityDateInp);
                    }else{
                        that.selectedStatus = 0;
                        DOM.show(el.validityDateInp);
                    }
               }
            };
        },
        /**
         * 保存会员卡信息
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _saveCardInfo: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr');

            $(DOM.get(el.cardHiddenInp, tr)).val(that.cardData.id);
            editData = DOM.serialize(tr);
            
            that.defender.validAll(function(rs){
                if(rs){
                    that._sendSaveInfo(editData, tr);
                }
            });
        },
        /**
         * Ajax发送保存的会员卡信息
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _sendSaveInfo: function(editData, tr){
            var 
                that = this;

            Dialog.confirm(OPERATION_TIP[1], function(){
                VipCardInfoIO.sendSaveInfo(editData, function(rs, data, errMsg){
                    if(rs){
                        //返回修改会员卡的操作人
                        S.mix(that.cardData,{
                            operator:data.operator
                        });
                        Dialog.alert(SUCCESS_TIP[1]);
                        that._renderSave(editData, tr);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 渲染保存模板
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _renderSave: function(editData, tr){
            var
                that = this,
                prevTr = $(tr).prev();

            if(that.selectedStatus == 0){
                //不永久有效，显示validityTime  
                S.mix(that.cardData, {
                    validityTime: editData.validityTime,
                    permanentlyEffective: editData.permanentlyEffective
                });
            }else{
                //永久有效，不显示validityTime
                S.mix(that.cardData, {
                    validityTime: "",
                    permanentlyEffective: editData.permanentlyEffective
                });
            }
            
            saveTemp = $(el.saveTpl).html(),
            saveTpl = Juicer.client(saveTemp,{card: that.cardData});
            $(prevTr).replaceWith(saveTpl);
            $(tr).remove();
        },
        /**
         * 取消
         * @param  {[type]} e  [description]
         * @return {[type]}    [description]
         */
        _cancelCardInfo: function(e){
            var 
                that = this,
                tr = $(e).parent('tr')
                prevTr = $(tr).prev();

            $(tr).remove();
            $(prevTr).show();
        },
        /**
         * 改变会员卡状态
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _changeCardStatus:function(e){
            var
                that = this,
                changeTrigger = $(e).parent('td').children(el.changeTrigger),
                tr = $(changeTrigger).parent('tr'),
                cardStatus = S.trim($(changeTrigger).text());

            Dialog.confirm('确定' + cardStatus + '该会员卡吗？', function(){
                that._sendChangeStatus(changeTrigger, tr, cardStatus);
            });
        },
        /**
         * 发送会员卡改变的状态信息
         * @param  {[type]} changeTrigger [description]
         * @param  {[type]} tr            [description]
         * @param  {[type]} cardStatus    [description]
         * @return {[type]}               [description]
         */
        _sendChangeStatus: function(changeTrigger, tr, cardStatus){
            var 
                that = this,
                id = $(tr).attr(DATA_CARD_ID),
                statusVal = STATUSMAP[cardStatus];

            VipCardInfoIO.changeStatus({
                id: id,
                status: statusVal
            }, function(rs, data, errMsg){
                if(rs){
                        that._renderStatus(changeTrigger, tr, statusVal, data.operator);
                        Dialog.alert('会员卡'+ STATUS[statusVal] + '成功！', function(){
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染改变状态后changeTrigger按钮的样式
         * @param  {[type]} changeTrigger [description]
         * @param  {[type]} tr            [description]
         * @param  {[type]} statusVal     [description]
         * @param  {[type]} operator      [返回的操作人]
         * @return {[type]}               [description]
         */
        _renderStatus: function(changeTrigger, tr, statusVal, operator){
            var
                that = this,
                statusInfo = DOM.get(el.status, tr),
                operatorTd = DOM.get(el.operator, tr);
                
            DOM.text(operatorTd, operator);
            //点击:解挂—1;挂失—2
            if(statusVal == 2){
                $(changeTrigger).html('<i class="fa fa-dot-circle-o"></i>&nbsp;解挂');
                DOM.text(statusInfo, CARD_CURRENT_STATUS[1]);
            }else if(statusVal == 1){
                $(changeTrigger).html('<i class="fa fa-minus-circle"></i>&nbsp;挂失')
                 DOM.text(statusInfo, CARD_CURRENT_STATUS[0]);
            }
        },
        /**
         * ajax发送删除的会员卡id
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delCardInfo: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_CARD_ID);

            Dialog.confirm(OPERATION_TIP[0], function(){
                VipCardInfoIO.delCardId({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[0]);
                        that.pagination.reload(that.opts);
                        that._tip();
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        }
    });
    return Core;
},{
    requires:[
        'mod/calendar',
        'mod/pagination',
        'widget/ext',
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/vip-management/vip-card-management'
    ]
})
