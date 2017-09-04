/*-------------------------------------------------------------
* @Description:     会员管理-会员等级管理
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.12.12
* ==NOTES:=============================================
* v1.0.0(2015.12.12):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-grade-management', function(S, List, Add){
    PW.namespace('page.VipManagement.VipGradeManagement');
    PW.page.VipManagement.VipGradeManagement.List = function(param){
    	new List(param);
    };
    PW.page.VipManagement.VipGradeManagement.Add = function(param){
        new Add(param);
    };
}, {
	requires:[
    	'vip-grade-management/list',
    	'vip-grade-management/add'
    ]
});
/*--------------------------------------------------------------------*/
KISSY.add('vip-grade-management/list', function(S){
	var 
		DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all, Dialog = PW.widget.Dialog,
        VipGradeManagementIO = PW.io.VipManagement.VipGradeManagement,
        config={},
        el={
            //提示信息alert
            msgAlert: ".J_msg",
            //数据渲染位置
            dataRender: "#J_template",
            //删除触发器
            delTrigger: ".J_delete",
            //卡片政策触发器
            cardPolicyTrigger: ".J_detail",
            //卡片政策隐藏td
            cardPolicyInp: ".J_cardPolicy"
        },
        TIP= ['确定删除该会员等级？', '删除会员等级成功！'],
        DATA_GRADE_ID = 'data-grade-id';

    function List(param){
        this.opts = S.merge(config, param);
        this._init();
    };

    S.augment(List, {
        _init: function(){
            this._msgClean();
            this._tip();
            this._buildEvt();
        },
        /**
         * 自动清除提示信息
         * @return {[type]} [description]
         */
        _msgClean: function(){
            var
                that = this,
                msg = S.one(el.msgAlert);
            if(msg){
                window.setTimeout(function(){
                    $(el.msgAlert).remove();
                }, 2000)
            };
        },
        /**
         * 提示暂无内容
         * @return {[type]} [description]
         */
        _tip: function(){
            var 
                that = this,
                tr = S.one('tr', el.dataRender);
                tipStr = '<tr class="J_tip"><td class="text-center" colspan="7">暂无内容</td></tr>';
            if(!tr){
                $(el.dataRender).prepend(tipStr);
            }else{
                $('.J_tip').remove;
            }
        },
        _buildEvt: function(){
            var that = this;
            delegate(document, 'click', el.delTrigger, function(e){
                that._delete(e.target);
            })

            delegate(document, 'click', el.cardPolicyTrigger, function(e){
                that._cardPolicyAlert(e.target);
            })
        },
        /**
         * 删除等级
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delete: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                id = $(tr).attr(DATA_GRADE_ID);
            Dialog.confirm(TIP[0], function(){
                VipGradeManagementIO.delGrade({id: id},function(rs, errMsg){
                    if(rs){
                        Dialog.alert(TIP[1], function(){
                            window.location.reload();
                        })
                    }else{
                        Dialog.alert(errMsg);
                    }
                })
            });
        },
        
        /**
         * 查看卡片政策
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _cardPolicyAlert: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                cardPolicy = S.one(el.cardPolicyInp, tr).text();
            Dialog.alert(cardPolicy);
        }
    })
	return List;
}, {
	requires:[
        'widget/dialog',
        'pio/vip-management/vip-grade-management'
	]
})
/*--------------------------------------------------------------------*/
KISSY.add('vip-grade-management/add', function(S){
    var 
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Defender = PW.mod.Defender,
        VipGradeManagementIO = PW.io.VipManagement.VipGradeManagement;
        config={},
        el={
            //提示信息alert
            msgAlert: ".J_msg",
            //添加等级的表单
            gradeForm: ".J_gradeForm",
            //保存按钮
            saveBtn: ".J_save",
            //会员价方案下拉列表
            planSelect: ".J_PlanSelect",
            //重置按钮
            resetBtn: ".J_reset",
            //信用额度Inp
            creditAmountInp: '.J_creditAmount',
            //结算周期Inp
            settlementCycleInp: '.J_settlementCycle',
            //最低消费Inp
            minConsumptionInp: '.J_minConsumption',
            //等级id
            gradeIdInp: '.J_gradeId'
        };
    function Add(param){
        this.btn = DOM.data(el.saveBtn, 'btn');
        this.opts = S.merge(config, param);
        this.defender;
        this._init();
    };

    S.augment(Add, {
        _init: function(){
            this._msgClean();
            this._validForm();
            this._buildEvt();
            this._initSettlementCycle();
        },
        /**
         * 初始化表单验证
         * @return {[type]} [description]
         */
        _validForm: function(){
            var
                that = this,
                id,
                minConsumption;

            that.defender = Defender.client(el.gradeForm, {
                theme: 'inline',
                items: [
                    //验证最低消费是否重复
                    {
                    queryName: el.minConsumptionInp,
                        pattern: function(input,shell,form){
                            var
                                minConsumption = DOM.val(el.minConsumptionInp),
                                id = DOM.val(el.gradeIdInp),
                                tipEl = DOM.next(el.minConsumptionInp, '.pw-tip');

                            if(this.test('isFloat', minConsumption)){
                                VipGradeManagementIO.sendMinConsumption({
                                    minConsumption: minConsumption,
                                    id: id
                                }, function(rs, errMsg){
                                    if(rs){
                                        shell.updateState('success');
                                    }else{
                                        shell.updateState('error');
                                        DOM.text(tipEl, errMsg);
                                    }
                                });
                            }else{
                                return false;
                            }
                            return 'loading';
                        },
                        showEvent:'focus',
                        vldEvent:'blur',
                        tip:'请输入最低消费金额|最低消费金额输入有误，请重新输入',
                        async: true
                    }
                ]
            });
        },
        /**
         * 自动清除提示信息
         * @return {[type]} [description]
         */
        _msgClean: function(){
            var
                that = this,
                msg = S.one(el.msgAlert);
            if(msg){
                window.setTimeout(function(){
                    $(el.msgAlert).remove();
                }, 2000)
            };
        },

        _buildEvt: function(){
            var 
                that = this;

            on(el.resetBtn, 'click', function(){
                that._reset();
            });

            that.btn.on("loading",function(){
                that._submitForm();
                return false;
            });
            //信用额度inp失去焦点判断,refresh()导致blur不可用，所以使用focusout
            on(el.creditAmountInp, 'focusout', function(){
                if(DOM.val(el.creditAmountInp) > 0){
                     that._openSettlementCycle();
                }else{
                    that._closeSettlementCycle();
                }
            });
        },
        /**
         * 表单提交
         * @return {[type]} [description]
         */
        _submitForm: function(){
            var 
                that = this,
                form = get(el.gradeForm);
            that.defender.validAll(function(rs){
                if(rs){
                    setTimeout(function(){
                        form.submit();
                    }, 1000);
                }else{
                    that.btn.reset();
                }
            })
        },

        /**
         * 重置
         * @return {[type]} [description]
         */
        _reset: function(){
            DOM.removeClass(el.planSelect, 'error-field');
            $(el.planSelect).siblings('span').remove();
        },
        /**
         * 初始化计算周期input
         * @return {[type]} [description]
         */
        _initSettlementCycle: function(){
            var
                that = this,
                creditAmount = DOM.val(el.creditAmountInp);

            if(creditAmount == 0){
                 DOM.attr(el.settlementCycleInp, 'disabled', 'disabled');
            }else{
                DOM.attr(el.settlementCycleInp, 'disabled', false);
                DOM.attr(el.settlementCycleInp, 'data-valid-rule', 'isPositiveIngeter');
                that.defender.refresh();
            }
        },
        /**
         * 打开结算周期input（disabled为false）
         * @return {[type]} [description]
         */
        _openSettlementCycle: function(){
            var 
                that = this;

            DOM.attr(el.settlementCycleInp, 'disabled', false);
            DOM.attr(el.settlementCycleInp, 'data-valid-rule', 'isPositiveIngeter');
            that.defender.refresh();
        },
        /**
         * 关闭结算周期（disabled为true）
         * @return {[type]} [description]
         */
        _closeSettlementCycle: function(){
            var 
                that = this;

            DOM.removeAttr(el.settlementCycleInp, 'data-valid-rule');
            that.defender.refresh();
            DOM.attr(el.settlementCycleInp, 'disabled', 'disabled');
            DOM.val(el.settlementCycleInp, "");
        }
    })
	return Add;
}, {
	requires:[
        'widget/dialog',
        'mod/defender',
        'widget/btn',
        'pio/vip-management/vip-grade-management'
	]
})