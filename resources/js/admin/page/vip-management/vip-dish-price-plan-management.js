/*-------------------------------------------------------------
* @Description:     会员管理-会员价方案管理
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.11.24
* ==NOTES:=============================================
* v1.0.0(2015.11.24):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-dish-price-plan-management', function(S,Core){
    PW.namespace('page.VipDishPricePlan.Core');
    PW.page.VipDishPricePlan.Core = function(param){
        new Core(param);
    }
}, {
    requires:[
        'vip-dish-price-plan/core'
    ]
})
/* -----------------------------------------------------------------*/
KISSY.add('vip-dish-price-plan/core', function(S){
    var 
        DOM = S.DOM, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        VipDishPricePlanIO = PW.io.VipManagement.VipDishPricePlan,
        config = {},
        el = {
            //提示信息
            MsgAlert : ".J_msg",
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
            //查看详情触发器
            detailTrigger: ".J_detail",
            //数据渲染的位置
            dataRender: "#J_template",
            //编辑模板
            editTpl: "#editTpl",
            //表单
            operForm: ".J_operForm",
            //名字的td
            nameTd: ".J_name",
            //描述td
            descTd: ".J_desc",
            //隐藏input
            hiddenInp: ".J_hidden"
        },
        TIP=['操作失败：已存在编辑项，请保存或取消后再操作！', '确定保存该会员价方案?',
        '确定删除该会员价方案？', '添加会员价方案成功！',
         '删除会员价方案成功！','修改会员价方案成功！'],
        DATA_OPER_TYPE = 'data-oper-type',
        DATA_PLAN_ID = 'data-plan-id';

    function Core(param){
        this.opts = S.merge(config, param);
        this.defender = Defender.client(el.operForm, {
            showTip:false
        });
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._buildEvt();
            this._MsgClear();
            this._tip();
        },
        /**
         * 清除提示信息
         * @return {[type]} [description]
         */
        _MsgClear: function(){
            var 
                that = this,
                msg = S.one(el.MsgAlert);
            if(msg){
                window.setTimeout(function(){
                    $(el.MsgAlert).remove();
                }, 2000);
            }
        },
        /**
         * 判断当前是否存在编辑项
         * @return {Boolean} [description]
         */
        _hasEdit: function(){
            var 
                that = this,
                save = S.one(el.saveTrigger);
                if(save){
                    return false;
                }else{
                    return true;
                }
        },
        /**
         * 判断当前是否有数据
         * @return {[type]} [description]
         */
        _tip: function(){
            var 
                that = this,
                tr = S.one('tr', el.dataRender),
                tipStr = '<tr class="J_tip"><td class="text-center" colspan="3">暂无内容</td></tr>';
            if(!tr){
                $(el.dataRender).prepend(tipStr);
            }else{
                $('.J_tip').remove;
            }
        },
        _buildEvt: function(){
            var 
                that = this;
            //添加
            on(el.addTrigger, 'click', function(){
                if(that._hasEdit()){
                    that._addPlan();
                }else{
                    Dialog.alert(TIP[0]);
                }
            });

            //保存
            delegate(document, 'click', el.saveTrigger, function(e){
                that._savePlan(e.target);
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
                     Dialog.alert(TIP[0]);
                }
            });

            //删除
            delegate(document, 'click', el.delTrigger, function(e){
                if(that._hasEdit()){
                    that._delPlan(e.target);
                }else{
                    Dialog.alert(TIP[0]);
                }
            });

            //查看详情
            delegate(document, 'click', el.detailTrigger, function(e){
                if(that._hasEdit()){
                    that._detail(e.target);
                }else{
                    Dialog.alert(TIP[0]);
                }
            });
        },

        /**
         * 添加方案
         */
        _addPlan: function(){
            var 
                that = this,
                editTplHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editTplHtml, {
                    type: 0,
                    plan:{}
                });
            $(el.dataRender).prepend(editTplStr);
            that.defender.refresh();
        },

        /**
         * 编辑方案
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _editPlan: function(ev){
            var 
                that = this,
                tr = $(ev).parent('tr'),
                name = $(tr).children(el.nameTd).text(),
                description = $(tr).children(el.descTd).text(),
                editTplHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editTplHtml, {
                    type: 1,
                    plan: {
                        name: name,
                        description: description
                    }
                });
            $(editTplStr).insertAfter($(tr));
            that.defender.refresh();
            $(tr).hide();
        },

        /**
         * 保存方案
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _savePlan: function(ev){
            var 
                that = this,
                tr = $(ev).parent('tr'),
                oper = $(tr).attr(DATA_OPER_TYPE),
                form = DOM.get(el.operForm);
            that.defender.validAll(function(rs){
                if(rs){
                    Dialog.confirm(TIP[1], function(){
                        if(oper == 0){
                            form.submit();
                        }else{
                            that._editSave(tr);
                        };
                    });
                };
            });
        },

        /**
         * 保存编辑后的方案
         * @param  {[type]} tr [description]
         * @return {[type]}    [description]
         */
        _editSave: function(tr){
            var
                that = this,
                prevTr = tr.prev(),
                id = prevTr.attr(DATA_PLAN_ID);
            $(el.hiddenInp).val(id);
            var data = DOM.serialize(el.operForm);
            that._sendEditPlan(data, prevTr, tr);
        },

        /**
         * ajax 发送编辑后的数据
         * @param  {[type]} data   [description]
         * @param  {[type]} prevTr [description]
         * @param  {[type]} tr     [description]
         * @return {[type]}        [description]
         */
        _sendEditPlan: function(data, prevTr, tr){
            var 
                that = this,
                name = data.name,
                desc = data.description;
            VipDishPricePlanIO.sendEditPlan(data, function(rs, errMsg){
                if(rs){
                    Dialog.confirm(TIP[5], function(){
                        prevTr.children(el.nameTd).text(name);
                        prevTr.children(el.descTd).text(desc);
                        tr.remove();
                        prevTr.show();
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },

        /**
         * 取消
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _cancel: function(ev){
            var 
                that = this,
                Tr = $(ev).parent('tr')
                prevTr = $(Tr).prev();
            $(Tr).remove();
            $(prevTr).show();
        },

        /**
         * 删除方案
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _delPlan: function(ev){
            var 
                that = this,
                tr = $(ev).parent('tr'),
                id = $(tr).attr(DATA_PLAN_ID);
            Dialog.confirm(TIP[2], function(){
                VipDishPricePlanIO.delPlan({id: id}, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(TIP[4], function(){
                            $(tr).remove();
                            that._tip();
                        })
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        
        /**
         * 查看详情
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _detail: function(ev){
            var   
                that = this,
                td = $(ev).parent('td'),
                src = $(td).children(el.detailTrigger).attr('src');
            $(td).children(el.detailTrigger).attr('href', src);
        }
    });
    return Core
}, {
    requires:[
        'widget/ext',
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/vip-management/vip-dish-price-plan'
    ]
})
