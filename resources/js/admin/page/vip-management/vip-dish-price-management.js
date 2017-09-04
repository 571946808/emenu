/*-------------------------------------------------------------
* @Description:     会员管理-会员价管理
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.11.25
* ==NOTES:=============================================
* v1.0.0(2015.11.25):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-dish-price-management', function(S,Core){
    PW.namespace('page.VipDishPrice.Core');
    PW.page.VipDishPrice.Core = function(param){
        new Core(param);
    }
}, {
    requires:[
        'vip-dish-price/core'
    ]
})
/* -----------------------------------------------------------------*/
KISSY.add('vip-dish-price/core', function(S){
    var 
        DOM = S.DOM, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        SelectAll = PW.mod.Selectall,
        VipDishPriceIO = PW.io.VipManagement.VipDishPrice,
        config = {},
        el = {
            //提示信息alert
            msgAlert: ".J_msg",
            //列表表单
            operForm: ".J_operForm",
            //checkbox触发器
            itemTrigger: ".J_price",
            //全选触发器
            selectAllTrigger: ".J_selectAll",
            //搜索表单
            searchForm: ".J_searchForm",
            //搜索按钮
            searchBtn: ".J_search",
            //数据渲染位置
            dataRender: "#J_template",
            //list模板
            listTpl: "#listTpl",
            //编辑模板
            editTpl: "#editTpl",
            //编辑触发器
            editTrigger: ".J_edit",
            //保存触发器
            saveTrigger: ".J_save",
            //取消触发器
            cancelTrigger: ".J_cancel",
            //会员价td
            vipDishPriceTd: ".J_vipDishPrice",
            //会员价input
            vipDishPriceInp: '.J_vipPriceInp',
            //自动生成触发器
            generateTrigger: ".J_generate",
            //对话框模板
            dialogTpl: "#dialogTpl",
            //对话框中的form 
            addForm: ".J_addForm",
            //减价类型组 div
            typeGroup:".J_type",
            //隐藏的input，方案ID
            planIdHidden: ".J_planIdHidden"
        },
        DATA_DISH_ID = "data-dish-id",
        TIP = ['操作失败：已存在编辑项，请保存或取消后再操作！'];

    function Core(param){
        this.opts = S.merge(config, param);
        this._init();
        this.contentArray;
        this.order;
        this.defender;
    }

    S.augment(Core, {
        _init:function(){
            this._selectAll();
            this._msgClean();
            this._tip();
            this._buildEvt();
        },
        /**
         * 全选
         * @return {[type]} [description]
         */
        _selectAll: function(){
            var
                that = this;
            SelectAll.client({
                root: el.operForm,
                select: el.itemTrigger,
                toggleTrigger: el.selectAllTrigger
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
        /**
         * 提示暂无内容
         * @return {[type]} [description]
         */
        _tip: function(){
            var 
                that = this,
                tr = S.one('tr', el.dataRender);
                tipStr = '<tr class="J_tip"><td class="text-center" colspan="8">暂无内容</td></tr>';
            if(!tr){
                $(el.dataRender).prepend(tipStr);
            }else{
                $('.J_tip').remove();
            }
        },
        /**
         * 是否存在编辑项
         * @return {Boolean} [description]
         */
        _hasEdit: function(){
            var 
                that = this,
                edit = S.one(el.saveTrigger);
            if(edit){
                return false;
            }else{
                return true;
            }
        },
        _buildEvt: function(){
            var
                that = this;
            //搜索
            on(el.searchBtn, 'click', function(){
                var data = DOM.serialize(el.searchForm);
                that._sendSearchInfo(data);
                return false;
            });

            //编辑
            delegate(document, 'click', el.editTrigger, function(e){
                if(that._hasEdit()){
                    that._getEditData(e.target);
                    that._EditRender(e.target);
                }else{
                    Dialog.alert(TIP[0]);
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

            //自动生成
            on(el.generateTrigger, 'click', function(){
                if(that._hasEdit()){
                    that._openDialog();
                }else{
                    Dialog.alert(TIP[0]);
                }
            });

            //弹出框radio选择类型触发器
            delegate(document, 'click', 'input[type=radio]', function(e){
                that._changeType(e.target);
            })
        },

        /**
         * 搜索时发送ajax
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _sendSearchInfo: function(data){
            var 
                that = this;
            VipDishPriceIO.sendSearchInfo(data, function(rs, list, errMsg){
                if(rs){
                    //渲染数据
                    that._ListRender(list);
                    //判断是否有数据
                    that._tip();
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },

        /**
         * 搜索后渲染数据
         * @param  {[type]} list [description]
         * @return {[type]}      [description]
         */
        _ListRender: function(list){
            var 
                that = this,
                listTpl = $(el.listTpl).html(),
                listTplStr = Juicer.client(listTpl, {list:list});
            $(el.dataRender).html(listTplStr);
            that._selectAll();
        },

        /**
         * 点击编辑后拿到tr数据
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _getEditData: function(ev){
            var 
                that = this,
                tdArray = $(ev).parent('tr').children('td'),
                length = tdArray.length,
                contentArray = new Array();
            S.each(tdArray, function(item, index){
                if(index>0 && index<length){
                    var content = S.trim($(item).text());
                    contentArray.push(content);
                };
            });
            that.contentArray = contentArray;

            var 
                price = parseInt(that.contentArray[2]),
                vipDishPrice = parseInt(that.contentArray[4]),
                order;
            if(vipDishPrice < price){
                order = 0;
            }else{
                order = 1;
            };
            that.order = order;
        },

        /**
         * 渲染编辑模板
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _EditRender: function(ev){
            var 
                that = this,
                tr = $(ev).parent('tr'),
                editTpl = $(el.editTpl).html(),
                editTplStr = Juicer.client(editTpl, {
                    dishNumber: that.contentArray[0],
                    dishName: that.contentArray[1],
                    price: that.contentArray[2],
                    salePrice: that.contentArray[3],
                    vipDishPrice: that.contentArray[4],
                    difference: that.contentArray[5],
                    order: that.order
                });
            $(editTplStr).insertAfter($(tr));
            $(tr).hide();
        },

        /**
         * 保存
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _save: function(ev){
            var
                that = this,
                prevTr = $(ev).parent('tr').prev('tr'),
                dishId = $(prevTr).attr(DATA_DISH_ID),
                planId = $(el.planIdHidden).val();
                vipDishPrice = $(el.vipDishPriceInp).val();
            VipDishPriceIO.sendEditInfo({
                dishId: dishId,
                vipDishPricePlanId:planId,
                vipDishPrice: vipDishPrice
            }, function(rs, errMsg){
                if(rs){
                    window.location.reload();
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
                tr =$(ev).parent('tr'),
                prevTr = $(tr).prev('tr');
            $(tr).remove();
            $(prevTr).show();
        },

        /**
         * 打开自动生成的弹出框
         * @return {[type]} [description]
         */
        _openDialog: function(){
            var 
                that = this,
                dialogTpl = $(el.dialogTpl).html(),
                dialogTplStr = Juicer.client(dialogTpl,{});
                settings = {
                    title: '会员价自动生成',
                    header: true,
                    width: 600,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '开始生成',
                                clickHandler: function(e, me){
                                    that.defender.validAll(function(rs){
                                        if(rs){
                                            that._sendData();
                                            return false;
                                        }
                                    });
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
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.addForm, {showTip: false});
                    }
                };
            Dialog.alert(dialogTplStr, function(){}, settings);
        },

        /**
         * 选择会员价生成类型
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _changeType: function(ev){
            var 
                that = this,
                typeGroupDiv = $(ev).parent('div').siblings(el.typeGroup),
                dataInput = DOM.get('input[type=text]',typeGroupDiv);
            $(dataInput).attr('disabled','disabled');
            $(dataInput).removeClass('error-field');
            $(ev).parent('label').next().children('input').removeAttr('disabled');               
            that.defender.refresh();
        },
        
        /**
         * 自动生成发ajax
         * @return {[type]} [description]
         */
        _sendData: function(){
            var that = this,
                operData = DOM.serialize(el.operForm),
                addData = DOM.serialize(el.addForm);
            S.mix(operData, addData);
            VipDishPriceIO.sendData(operData, function(rs, errMsg){
                if(rs){
                    window.location.reload();
                }else{
                    Dialog.alert(errMsg);
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
        'mod/selectall',
        'pio/vip-management/vip-dish-price-management'
    ]
})