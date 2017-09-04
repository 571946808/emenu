/*-------------------------------------------------------------
* @Description:     会员管理-积分管理
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.1.21
* ==NOTES:=============================================
* v1.0.0(2015.1.21):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-points-management', function(S, Core){
    PW.namespace('page.VipPointsManagement.Core');
    PW.page.VipPointsManagement.Core = function(param){
        new Core(param);
    };
}, {
    requires:[
        'vip-points-management/core'
    ]
})
/* -----------------------------------------------------------------*/
KISSY.add('vip-points-management/core', function(S){
    var
        DOM = S.DOM, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        VipPointsManagementIO = PW.io.VipManagement.VipPoints,
        config = {},
        el = {
            //提示信息
            msgAlert: '.J_msg',
            //提交按钮
            submitBtn: '.J_submitBtn',
            //重置按钮
            resetBtn: '.J_resetBtn',
            //启用积分
            startRadio:'.J_startRadio',
            //停用积分
            stopRadio:'.J_stopRadio',
            //数据表单
            operForm: '.J_operForm',
            //数据渲染位置
            dataRender: '#J_template',
            //编辑模板
            addTpl: '#addTpl',
            //添加按钮
            addBtn: '.J_addBtn',
            //支付方式的容器
            subContainer:'.J_subContainer',
            //删除触发器
            delTrigger: '.J_del',
            //取消触发器
            cancelTrigger: '.J_cancel',
            //gradeId的隐藏inp
            gradeIdInp: '.gradeIdInp'
        },
        DATA_TYPE_NUM = 'data-type-num',
        DATA_POINTPLAN_ID = 'data-pointPlan-id',
        TIP=['当前支付方式已存在，请选择其他支付方式！', '确定删除该条积分规则？', '删除成功！']

    function Core(param){
        this.opts = S.merge(config, param);
        this.btn = DOM.data(el.submitBtn,'btn');
        this.consumeArray = new Array();
        this.storeArray = new Array();
        //是否启用积分 0是不启用，1是启用
        this.status;
        this.defender = Defender.client(el.operForm, {
            showTip:false
        });
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._msgClean();
            this._tip();
            this._pointEnable();
            this._initArr();
            this._buildEvt();
        },
        /**
         * 清除提示信息
         * @return {[type]} [description]
         */
        _msgClean: function(){
            var that = this;
            if(S.one(el.msgAlert)){
                window.setTimeout(function(){
                    $(el.msgAlert).remove();
                },2000)
            }
        },
        /**
         * 表格无数据，提示暂无内容
         * @return {[type]} [description]
         */
        _tip: function(){
            var that = this,
                tr,
                tbodys = DOM.query(el.dataRender, el.operForm),
                tipStr = '<tr class="J_tip"><td class="text-center" colspan="3">暂无内容</td></tr>';
            S.each(tbodys, function(tbody){
                tr = S.one('tr', tbody);
                if(!tr){
                    $(tbody).prepend(tipStr);
                }
            })
        },

        /**
         * 检测是否启用积分
         * @return {[type]} [description]
         */
        _pointEnable: function(){
            var that = this,
                status,
                a = $("input[type ='radio']");
            for(var i = 0; i<a.length; i++){
                if($(a[i]).hasAttr('checked')){
                    status = a[i].value;
                }
            };
            that._changeFormStyle(status);
        },
        /**
         * 初始化数组
         * @return {[type]} [description]
         */
        _initArr: function(){
            var that = this,
                type,
                subContainers = $(el.subContainer);
            S.each(subContainers, function(item){
                type = $(item).attr('type');
                if(type == 0){
                    //消费
                    that._addToArr(item, that.consumeArray);
                }else{
                    //储值
                    that._addToArr(item, that.storeArray);
                }
            })
        },

        /**
         * 将已有的付款方式添加到数组中
         * @param {[type]} container [description]
         * @param {[type]} operArray [description]
         */
        _addToArr: function(container, operArray){
            var that = this,
                payTypeNum,
                trs = DOM.query('tr', container);
            S.each(trs, function(item) {
                payTypeNum = $(item).attr(DATA_TYPE_NUM);
                if(payTypeNum){
                    operArray.push(payTypeNum);
                }
            });
        },

        _buildEvt: function(){
            var that = this,
                status;

            //启用积分
            $(el.startRadio).on('change',function(e){ 
                status = $(e.target).val();
                that._sendStatus(status);
            });

            //停用积分
            $(el.stopRadio).on('change',function(e){
                status = $(e.target).val();
                that._sendStatus(status);
            });

            //添加
            $(el.addBtn).on('click', function(e){
                that._choosePayType(e.target);
            });

            //删除
            $(el.delTrigger).on('click', function(e){
                if(that.status == 1){
                    that._delPayType(e.target);
                } 
            });

            //取消
            delegate(document,'click', el.cancelTrigger , function(e){
                that._cancle(e.target);
            });

            //保存    
            that.btn.on("loading",function(){
                that._submitHandler();
                return false;  
            });
        },
        /**
         * 是否启用积分，发送ajax
         * @param  {[type]} status [description]
         * @return {[type]}        [description]
         */
        _sendStatus:function(status){
            var that = this,
                gradeId = $(el.gradeIdInp).val();
            VipPointsManagementIO._sendStatus({status: status,gradeId: gradeId}, function(rs, errMsg){
                if(rs){
                    that._changeFormStyle(status);
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 改变表单中的样式，禁用或启用
         * @param  {[type]} arr    [description]
         * @param  {[type]} status [description]
         * @return {[type]}        [description]
         */
        _changeFormStyle: function(status){
            var that = this,
                inputs = DOM.query('input', el.operForm),
                selects = DOM.query('select', el.operForm),
                submitBtn = DOM.query(el.submitBtn),
                resetBtn = DOM.query(el.resetBtn),
                addBtn = DOM.query(el.addBtn),
                delTrigger = DOM.query(el.delTrigger),
                objArr = inputs.concat(selects, submitBtn, resetBtn, addBtn, delTrigger);

            if(status == 1){
                S.each(objArr, function(item){
                    $(item).removeAttr('disabled');
                });
            }else{
                S.each(objArr, function(item){
                    $(item).attr('disabled','disabled')
                });
            }
            that.status = status;
        },

        /**
         * 选择支付类型
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _choosePayType: function(e){
            var that = this,
                curSubContainer = $(e).parent(el.subContainer),
                pointType = $(curSubContainer).attr('type');
            if(pointType == 0){
                //type = 0，消费时
                that._addEnable(that.consumeArray, curSubContainer);
            }else{
                //type = 0，储值时
                that._addEnable(that.storeArray, curSubContainer);
            }
        },

        /**
         * 判断是否可以添加当前的支付方式
         * @param {[type]} operArray [description]
         * @param {[type]} Container [description]
         */
        _addEnable: function(operArray, Container){
            var that = this,
                payType,
                inputName,
                typeSelect = DOM.get('select', Container),
                tip = DOM.get('.J_tip', Container),
                payTypeNum = $(typeSelect).val(),
                canAdd =  S.inArray(payTypeNum, operArray);
            //找到被选中的option的text
            for(var i = 0; i< typeSelect.length; i++){
                if(typeSelect[i].selected == true){
                    payType = typeSelect[i].text;
                    inputName = $(typeSelect[i]).attr('name');
                }
            }
            S.log(inputName);
            if(!canAdd){
                //如果有暂无内容的提示tip，就去掉
                $(tip).remove();
                that._addPayType(payType, payTypeNum, inputName, Container);
                operArray.push(payTypeNum);
            }else{
                Dialog.alert(TIP[0]);
            }
        },

        /**
         * 渲染添加模板
         * @param {[type]} payType    [description]
         * @param {[type]} payTypeNum [description]
         * @param {[type]} container  [description]
         */
        _addPayType: function(payType, payTypeNum, inputName,container){
            var that = this,
                dataRender = DOM.get(el.dataRender, container)
                addTpl = $(el.addTpl).html(),
                addTplStr = Juicer.client(addTpl, {payType: payType, payTypeNum: payTypeNum, inputName:inputName});
            $(dataRender).prepend(addTplStr);
            that.defender.refresh();
        },

        /**
         * 删除积分规则
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delPayType: function(e){
            var that = this,
                tr = $(e).parent('tr'),
                id = $(tr).attr(DATA_POINTPLAN_ID);
            Dialog.confirm(TIP[1], function(){
                VipPointsManagementIO._sendId({id: id}, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(TIP[2]);
                        that._delHandler(tr);
                    }else{
                        Dialog.alert(errMsg);
                    }
                })
            })
        },

        /**
         * 取消
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _cancle: function(e){
            var that = this,
                tr = $(e).parent('tr');
            that._delHandler(tr);
        },
        /**
         * 判断积分类型，从而找到对应的数组
         * @param  {[type]} tr [description]
         * @return {[type]}    [description]
         */
        _delHandler: function(tr){
            var that =this,
                payTypeNum = $(tr).attr(DATA_TYPE_NUM),
                //积分类型 1是储值 0是消费
                pointType = $(tr).parent(el.subContainer).attr('type');
            if(pointType == 0){
                that.consumeArray = that._removeArrItem(payTypeNum, that.consumeArray);
            }else{
                that.storeArray = that._removeArrItem(payTypeNum, that.storeArray);
            };
            $(tr).remove();
            that._tip();
            that.defender.refresh();
        },

        /**
         * 把对应的数据从数组中删除
         * @param  {[type]} operArray [description]
         * @return {[type]}           [description]
         */
        _removeArrItem: function(payTypeNum, operArray){
            operArray = S.filter(operArray, function(item) {
                return item !== payTypeNum;
            });
            return operArray;
        },

        /**
         * 表单提交
         * @return {[type]} [description]
         */
        _submitHandler: function(){
            var that = this;
            that.defender.validAll(function(rs){
                if(rs){
                    DOM.get(el.operForm).submit();
                }else{
                    that.btn.reset();
                    return false; 
                }
            })
        }
    });
    return Core;
}, {
    requires:[
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'widget/btn',
        'pio/vip-management/vip-points-management'
    ]
})