/*-------------------------------------------------------------
* @Description:     会员管理-充值方案管理
* @Version:         1.0.0
* @author:          hujun(435043636@qq.com)
* @date             2015.12.14
* ==NOTES:=============================================
* v1.0.0(2015.12.14):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-recharge-plan-management', function(S,Core){
    PW.namespace('page.VipRechargePlan.Core');
    PW.page.VipRechargePlan.Core = function(param){
        new Core(param);
    }
}, {
    requires:[
        'vip-recharge-plan/core'
    ]
})
/* -----------------------------------------------------------------*/
KISSY.add('vip-recharge-plan/core', function(S){
    var 
        DOM = S.DOM, 
        $ = S.all,
        on = S.Event.on, 
        delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        VipRechargePlanIO = PW.io.VipManagement.VipRechargePlan,
        config = {},
        el = {
            //添加触发器
            addTrigger: ".J_add",
            //编辑触发器
            editTrigger: ".J_edit",
            //删除触发器
            delTrigger: ".J_del",
            //保存触发器
            saveTrigger:".J_save",
            //取消触发器
            cancelTrigger: ".J_cancel",
            //改变状态触发器
            changeStatus: ".J_change",
            //数据渲染位置
            dataRender: '#J_template',
            //编辑模板
            editTpl: "#editTpl",
            //保存模板
            saveTpl:"#saveTpl",
            //表单
            operForm: ".J_operForm",
            //方案名称
            name: ".J_name",
            //实付金额
            payAmount: ".J_payAmount",
            //充值金额
            rechargeAmount: ".J_rechargeAmount",
            //暂无内容提示
            tip:".J_tip",
            //启用状态
            status: ".J_status",
            //隐藏input
            hiddenInp: ".J_hidden"
        },
        DATA_OPER_TYPE = 'data-oper-type',
        DATA_PLAN_ID = 'recharge-plan-id',
        STATUS = ['停用', '可用'],
        STATUSMAP = {
            '停用': 0,
            '可用': 1
        },
        BAN_OPERATION_TIP= ['操作失败：已存在编辑项，请保存或取消后再操作！'],
        OPERATION_TIP = ['确定删除该充值方案吗？',
                         '确定保存该充值方案吗？',
                         '确定添加该充值方案吗？'],
        SUCCESS_TIP = ['删除成功！',
                       '保存成功！',
                       '添加成功！'];

    function Core(param){
        //阻止表单验证提示
        this.defender = Defender.client(el.operForm, {
            showTip:false
        });
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._buildEvt();
            this._tip();
        },
        _buildEvt: function(){
            var 
                that = this;

            //添加
            on(el.addTrigger, 'click', function(){
                if(that._hasEdit()){
                    that._addPlan();
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });

            //保存
            delegate(document, 'click', el.saveTrigger, function(e){
                that._save(e.target);
            });

            //取消
            delegate(document, 'click', el.cancelTrigger, function(e){
                that._cancel(e.target);
            });

            //编辑
            delegate(document, 'click', el.editTrigger, function(e){
                if(that._hasEdit()){
                    that._editPlan(e.target);
                }else{
                     Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });

            //启用停用
            delegate(document, 'click', el.changeStatus, function(e){
                if(that._hasEdit()){
                    that._changeStatus(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });

            //删除
            delegate(document, 'click', el.delTrigger, function(e){
                if(that._hasEdit()){
                    that._delPlan(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });
        },

        /**
         * 判断当前是否有数据
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
         * 判断当前是否存在编辑项
         * @return {Boolean} [description]
         */
        _hasEdit: function(){
            var 
                that = this;

            if ($(el.saveTrigger).length == 0){
                return true;
            }else{
                return false;
            }
        },

       /**
        * 添加方案
        */
        _addPlan: function(){
            var 
                that = this,
                tip = S.one(el.tip),
                editTplHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editTplHtml, {
                    plan:{
                        type: 0,  //添加状态
                    }
                });

            //如果存在暂无内容，则删除提示后再添加
            if(tip){
                DOM.remove(el.tip);
            }

            $(el.dataRender).prepend(editTplStr);
            that.defender.refresh();
        },

        /**
         * 编辑方案
         * @param  {[type]} e [description]
         * @return {[type]}    [description]
         */
        _editPlan: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                id = $(tr).attr(DATA_PLAN_ID),
                name = $(tr).children(el.name).text(),
                payAmount = $(tr).children(el.payAmount).text(),
                rechargeAmount = $(tr).children(el.rechargeAmount).text(),
                status = $(tr).children(el.status).text(),
                statusVal = STATUSMAP[status];  //将获取到的状态转换成值
                planData = {
                    id: id,
                    name: name,
                    payAmount: payAmount,
                    rechargeAmount: rechargeAmount,
                    status: statusVal,
                    type: 1  //编辑状态
                }
            that._renderEdit(planData, tr);
        },

        /**
         * 渲染编辑模板
         * @param  {[type]} planData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _renderEdit: function(planData, tr){
            var 
                that = this,
                editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {plan:planData});

            $(editTplStr).insertAfter($(tr));
            $(tr).hide();
            that.defender.refresh();
        },

        /**
         * 保存
         * @param  {[type]} e  [description]
         * @return {[type]}    [description]
         */
        _save: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_PLAN_ID),
                type = DOM.attr(tr, DATA_OPER_TYPE),
                editData;
      
            $(el.hiddenInp).val(id);  //将id保存在隐藏input中

            editData = DOM.serialize(el.operForm);
            that.defender.validAll(function(rs){
                if(rs){
                    if(type == 1){
                        //若是编辑，需要发送id
                        that._sendEditRechargePlan(editData, tr);
                    }else{
                        that._sendAddRechargePlan(editData, tr);
                    }
                }
            });   
        },

        /**
         * ajax 发送编辑后的数据
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _sendEditRechargePlan: function(editData, tr){
            var 
                that = this;

            Dialog.confirm(OPERATION_TIP[1], function(){
                VipRechargePlanIO.sendEditPlan(editData, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[1]);
                        that._renderAfterEditPlan(editData, tr);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },

        /**
         * ajax 发送添加后的数据
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _sendAddRechargePlan: function(editData, tr){
            var 
                that = this;

            Dialog.confirm(OPERATION_TIP[2], function(){
                VipRechargePlanIO.sendAddPlan(editData, function(rs, data, errMsg){
                    if(rs){
                        //返回id
                        S.mix(editData, {
                            id: data.id
                        });
                        Dialog.alert(SUCCESS_TIP[2]);
                        that._renderAfterEditPlan(editData, tr);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },

        /**
         * 编辑后渲染保存模板
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _renderAfterEditPlan: function(editData, tr){
            var 
                that = this,
                type = DOM.attr(tr, DATA_OPER_TYPE),
                prevTr = $(tr).prev(),
                saveTemp = $(el.saveTpl).html(),
                saveTpl = Juicer.client(saveTemp,{
                    plan:{
                        id: editData.id,
                        name: editData.name,
                        payAmount: editData.payAmount,
                        rechargeAmount: editData.rechargeAmount,
                        status: STATUS[editData.status]
                    } 
                });

            if(type == 0){
                //添加渲染
                $(saveTpl).insertAfter($(tr));
                $(tr).remove();
            }else{
                //编辑渲染
                $(prevTr).replaceWith(saveTpl);
                $(tr).remove();
            }       
        },

        /**
         * 取消
         * @param  {[type]} e  [description]
         * @return {[type]}    [description]
         */
        _cancel: function(e){
            var 
                that = this,
                tr = $(e).parent('tr')
                prevTr = $(tr).prev();

            $(tr).remove();
            $(prevTr).show();
        },

        /**
         * 删除方案
         * @param  {[type]} e  [description]
         * @return {[type]}    [description]
         */
        _delPlan: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                id = $(tr).attr(DATA_PLAN_ID);

            Dialog.confirm(OPERATION_TIP[0], function(){
                VipRechargePlanIO.sendDelPlan({id: id}, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[0], function(){
                            $(tr).remove();
                            that._tip();  //全部删除提示暂无内容
                        })
                    }
                });
            });
        },

        /**
         * 改变启用/停用状态
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _changeStatus: function(e){
            var 
                that =this,
                changeTrigger = $(e).parent('td').children(el.changeStatus),
                tr = $(changeTrigger).parent('tr'),
                status = S.trim($(changeTrigger).text());

            Dialog.confirm('确定'+ status + '该充值方案？', function(){
                that._sendChangeStatus(changeTrigger, status, tr);
            });
        },
        /**
         * 发送改变状态信息
         * @param  {[type]} changeTrigger [description]
         * @param  {[type]} status        [description]
         * @param  {[type]} tr            [description]
         * @return {[type]}               [description]
         */
        _sendChangeStatus: function(changeTrigger, status, tr){
            var 
                that = this,
                id = $(tr).attr(DATA_PLAN_ID),
                statusVal = STATUSMAP[status];

            VipRechargePlanIO.changeStatus({
                id: id,
                status: statusVal
            }, function(rs, errMsg){
                if(rs){
                    that._renderStatus(changeTrigger, tr, status, statusVal);
                    Dialog.alert('充值方案'+ status + '成功！', function(){
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染状态
         * @param  {[type]} changeTrigger [description]
         * @param  {[type]} tr            [description]
         * @param  {[type]} status        [description]
         * @param  {[type]} statusVal     [description]
         * @return {[type]}               [description]
         */
        _renderStatus: function(changeTrigger, tr, status, statusVal){
            var
                that = this,
                statusInfo = DOM.get(el.status, tr);

            if(statusVal == 0){
                DOM.text(statusInfo, "停用");
                $(changeTrigger).html('<i class="fa fa-check"></i>&nbsp;启用')
            }else{
                DOM.text(statusInfo, "可用");
                $(changeTrigger).html('<i class="fa fa-circle"></i>&nbsp;停用')
            }
        }
    });
    return Core;
}, {
    requires:[
        'widget/ext',
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/vip-management/vip-recharge-plan-management'
    ]
})
