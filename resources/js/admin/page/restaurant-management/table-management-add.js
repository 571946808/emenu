/*-------------------------------------------------------------
* @Description:     餐台管理-餐台添加
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.10.26
* ==NOTES:=============================================
* v1.0.0(2015.10.26):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/restaurant-management/table-management-add', function(S, Add){
	PW.namespace('page.TableManagement.Add');
	PW.page.TableManagement.Add = function(param){
		new Add(param);
	};
},{
	requires:[
		'table-management/add'
	]
});
/* -----------------------------------------------------------------*/
KISSY.add('table-management/add', function(S){
	var 
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, 
		Defender = PW.mod.Defender,
        TableManagementIO = PW.io.TableManagement,
        SelectAll = PW.mod.Selectall,
		config = {},
		el = {
			//餐台信息表单
			tableForm: '.J_tableForm',
			//保存按钮
			saveBtn: '.J_save',
            //餐台区域下拉列表
            tableAreaSelect: '.J_tableArea',
            //餐台名称input
            tableNameInp: '.J_tableName',
            //餐台Id的隐藏input
            tableIdInp: '.J_tableId',
            //餐段checkbox
            mealPeriod: '.J_mealPeriod',
            //提示信息
            msgEl: '.J_msg',
            //充值按钮
            resetBtn: '.J_reset'
		};
	function Add(param){
    	this.opts = S.merge(config, param);
        this.btn = DOM.data(el.saveBtn, 'btn');
        this.hasSelected = false;
    	this.defender;
    	this._init();
    };
    S.augment(Add, {
    	_init: function(){
    		this._defender(); 
    		this._buildEvt(); 
            this._msgClear();
    	},
        /**
         * 定时清除提示信息
         * @return {[type]} [description]
         */
        _msgClear: function(){
            var 
                that = this,
                msg = S.one(el.msgEl);
            if(msg){
                window.setTimeout(function(){
                    $(el.msgEl).remove();
                }, 2000);
            }
        },
    	_buildEvt: function(){
    		var 
                that = this;
            that.btn.on("loading",function(){
				that._submitForm();
                return false;
            });
            on(el.tableAreaSelect, 'change', function(){
                that._validSelect(this);
            });
            on(el.tableAreaSelect, 'blur', function(){
                that._validSelect(this);
            });
            on(el.resetBtn, 'click', function(){
                that._reset();
            })
    	},
    	_defender: function(){
    		var that = this;
    		that.defender = Defender.client(el.tableForm, {
                theme:'inline',
                items: [
                    //验证餐台名称
                    {
                        queryName: el.tableNameInp,
                        pattern: function(input,shell,form){
                            var
                                tableNameInp = DOM.val(el.tableNameInp),
                                tableId = DOM.val(el.tableIdInp),
                                tipEl = DOM.next(el.tableNameInp, '.pw-tip');
                            if(tableNameInp!=""){
                                TableManagementIO.sendTableName({
                                    id: tableId,
                                    name: tableNameInp
                                }, function(rs, errMsg){
                                    if(rs){
                                        shell.updateState('success');
                                    }else{
                                        shell.updateState('error');
                                        DOM.text(tipEl, '该餐台名称已经存在，请重新输入');
                                    }
                                });
                            }else{
                                return false;
                            }
                            return 'loading';
                        },
                        showEvent:'focus',
                        vldEvent:'blur',
                        tip:'请输入餐台名称|餐台名称有误，请重新输入',
                        async: true
                    }
                ]
    		});
    	},
    	/**
    	 * 提交表单
    	 * @return {[type]} [description]
    	 */
    	_submitForm: function(){
            var that = this,
            	form = get(el.tableForm),
                tableAreaSelect = get(el.tableAreaSelect);
            that._validSelect(tableAreaSelect);
            that.defender.validAll(function(rs){
                if(rs&&that.hasSelected){
                    setTimeout(function(){
                        form.submit();
                    }, 1000);
                }else{
                    that.btn.reset();
                }
            })
    	},
    	/**
    	 * 验证餐台区域的下拉列表是否选择
    	 * @param  {[type]} trigger [description]
    	 * @return {[type]}         [description]
    	 */
        _validSelect: function(trigger){
            var that = this,
            errorMsg = '<span class="pw-tip error-state" data-tipid="0">请选择餐台区域</span>'
            $(trigger).siblings('span').remove();
            if($(trigger).val()==-1){
                DOM.addClass(trigger, 'error-field');
                $(errorMsg).insertAfter($(trigger));
                that.hasSelected = false;
            }else{
                DOM.removeClass(trigger, 'error-field');
                that.hasSelected = true;
            }
        },

        /**
         * 重置
         * @return {[type]} [description]
         */
        _reset: function(){
            DOM.removeClass(el.tableAreaSelect, 'error-field');
            $(el.tableAreaSelect).siblings('span').remove();
        }
    });
    return Add;
},{
	requires:[
 		'mod/defender',
		'widget/btn',
        'mod/selectall',
        'pio/restaurant-management/table-management'
	]
});