/*-------------------------------------------------------------
* @Description:     餐台管理-呼叫类型管理
* @Version:         1.0.0
* @author:          yudan(862669640@qq.com)
* @date             2016.5.26
* ==NOTES:=============================================
* v1.0.0(2016.5.26):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/restaurant-management/call-type-management', function(S, Management){
	PW.namespace('page.restManagement.CallType.Management');
	PW.page.restManagement.CallType.Management =function(param){
		new Management(param);
	}
},{
	requires:[
		'call-type/management'
	]
});
/* -----------------------------------------------------------------*/
KISSY.add('call-type/management', function(S){
	var 
		DOM = S.DOM, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        CallTypeIO = PW.io.CallTypeManagement, 
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
		Defender = PW.mod.Defender,
        config = {},
        el = {
        	//添加触发器
        	addTrigger: '.J_add',
        	// 编辑触发器
        	editTrigger: '.J_edit',
        	//删除触发器
        	delTrigger: '.J_del',
        	//保存触发器
        	saveTrigger: '.J_save',
        	//取消触发器
        	cancelTrigger: '.J_cancel',
        	//启用，停用触发器
        	changeStatus: '.J_change',
        	//编辑模板
        	editTpl: '#editTpl',
        	//数据渲染位置
        	dataRender: '#J_template',
            //td 呼叫类型名字
            nameTd: '.J_name',
            //td 呼叫类型状态
            statusTd: '.J_status',
            //td 呼叫类型排序
            weightTd: '.J_weight',
            //存放id的隐藏input
            callIdInp: '.J_hidden',
            //添加或编辑时的表单
            dataform:'.J_operForm',
            //提示信息
            msgEl: '.J_msg'
        },
        TIP = [
            '设置当前呼叫类型成功！', 
            '删除呼叫类型成功！', 
            '操作失败：已存在编辑项，请保存或取消后再操作！',
            '确定删除该呼叫类型？', '确定保存该呼叫类型吗？', 
            '保存呼叫类型成功！'
        ],
        DATA_CALL_ID = 'data-call-id',
        DATA_CALL_OPER = 'data-call-oper',
        statusMap = {
        	'启用': 1,
        	'停用': 0
        },
        STATUS = ['启用','停用'];

    function Management(param){
    	this.opts = S.merge(config, param);
		this.defender = Defender.client(el.dataform, {
			showTip: false
		});
		this._init();
    }

    S.augment(Management, {
    	_init: function(){
    		this._buildEvt();
    		this._tip();
    		this._Msgclear();
    	},
    	/**
    	 * 提示信息自动消失
    	 * @return {[type]} [description]
    	 */
    	_Msgclear: function(){
    		var that = this,
    			msg = S.one(el.msgEl);

    		if(msg){
    			window.setTimeout(function(){
    				$(el.msgEl).remove();
    			},2000);
    		}
    	},

    	_buildEvt: function(){
    		var that = this;
    		
    		//添加
    		on(el.addTrigger, 'click', function(){
                if(that._hasEdit()){
                    that._getWeight();
                }else{
                    Dialog.alert(TIP[2]);
                }
    		});

    		//编辑
    		delegate(document, 'click', el.editTrigger, function(e){
                if(that._hasEdit()){
                    that._editCall(e.target);
                }else{
                    Dialog.alert(TIP[2]);
                }
    		});

    		//启用停用
    		delegate(document, 'click', el.changeStatus, function(e){
                if(that._hasEdit()){
                    that._changeStatus(e.target);
                }else{
                    Dialog.alert(TIP[2]);
                }
    		});

    		//删除
    		delegate(document, 'click', el.delTrigger, function(e){
    			if(that._hasEdit()){
                    that._delCall(e.target);
                }else{
                    Dialog.alert(TIP[2]);
                }
    		});

            //取消
            delegate(document, 'click', el.cancelTrigger, function(e){
                that._cancel(e.target);
            });

            //保存
            delegate(document, 'click', el.saveTrigger, function(e){
            	that._save(e.target);
            })
    	},

    	/**
    	 * 当前是否存在编辑项
    	 * @return {Boolean} [description]
    	 */
        _hasEdit: function(){
            var that = this,
                editEl = S.one(el.saveTrigger);

            if(editEl){
                return false;
            }else{
                return true;
            }
        },
       
    	/**
    	 * 添加时获取默认排序
    	 * @return {[type]} [description]
    	 */
    	_getWeight: function(){
    		var that = this;

    		CallTypeIO.getWeight({},function(rs, data, errMsg){
    			if(rs){
                    that._addCall(data);
    			}else{
    				Dialog.alert(errMsg);
    			}
    		});
    	},

    	/**
    	 * 添加呼叫类型
    	 * @param {[type]} weight [description]
    	 */
        _addCall: function(weight){
            var 
                that = this,
                editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {
                    callType:{
                    	weight:weight,
                        oper: 0
                    }
                });

            $(el.dataRender).prepend(editTplStr);
            that.defender.refresh();
            that._tip();
        },

        /**
         * 编辑呼叫类型
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editCall: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                name = $(tr).children(el.nameTd).text(),
                status = $(tr).children(el.statusTd).text(),
                weight = $(tr).children(el.weightTd).text(),
                id = $(tr).attr(DATA_CALL_ID),
                statusVal = statusMap[status],
                callType = {
                    id: id,
                    name: name,
                    status: statusVal,
                    weight: weight,
                    oper: 1 
                };//oper 编辑1 添加0

            that._renderEdit(callType, tr);
        },

        /**
         * 编辑时给input渲染数据
         * @param  {[type]} callType [description]
         * @param  {[type]} tr         [description]
         * @return {[type]}            [description]
         */
        _renderEdit: function(callType, tr){
        	var 
                that = this,
        		editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {callType:callType});

            $(editTplStr).insertAfter($(tr));
            $(tr).hide();
            that.defender.refresh();
        },
        /**
         * 启用停用
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _changeStatus: function(e){
        	var 
                that =this,
        		changeTrigger = $(e).parent('td').children(el.changeStatus),
        		status = S.trim($(changeTrigger).text());

        	Dialog.confirm('确定' + status + '该呼叫类型？', function(){
        		that._sendInfo(status, changeTrigger);
        	});
        },
        /**
         * ajax 改变状态时，发送呼叫类型id和修改状态
         * @return {[type]} [description]
         */
        _sendInfo: function(status, changeTrigger){
        	var 
                that = this,
        		Tr = $(changeTrigger).parent('tr'),
        		id = $(Tr).attr(DATA_CALL_ID),
        		statusVal = statusMap[status];

        	CallTypeIO.changeStatus({
        		id: id,
        		status: statusVal
        	}, function(rs, errMsg){
        		if(rs){
    				//that._renderStatus(status, statusVal, changeTrigger, Tr);
    				Dialog.alert('呼叫类型' + status + '成功！', function(){
                        window.location.reload();
                    });
    			}else{
    				Dialog.alert(errMsg);
    			}
        	});
        },
 
        /**
         * 删除呼叫类型
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
    	_delCall: function(e){
    		var 
                that = this,
    			tr = $(e).parent('tr'),
    			id = $(tr).attr(DATA_CALL_ID);

    		Dialog.confirm(TIP[3],function(){
    			that._sendDelId(id, tr);
    		});
    	},
    	/**
    	 * 删除时发送呼叫类型id
    	 * @param  {[type]} id [description]
    	 * @return {[type]}    [description]
    	 */
    	_sendDelId: function(id, tr){
            var 
                that = this;

    		CallTypeIO.delCall({
    			id: id
    		}, function(rs, errMsg){
    			if(rs){
                    //$(tr).remove();
                    //that._tip();
    				Dialog.alert(TIP[1], function(){
                        window.location.reload();
                    });
    			}else{
    				Dialog.alert(errMsg);
    			}
    		});
    	},
    	/**
    	 * 判断当前是否有内容
    	 * @return {[type]} [description]
    	 */
    	_tip: function(){
    		var 
                that = this,
	    		trArray = DOM.query('tr', el.dataRender),
	    		count = $(trArray).length,
	    		tr = '<tr class="J_tip"><td class="text-center" colspan="4">暂无内容</td></tr>';

    		if(count == 0){
    			DOM.append($(tr), el.dataRender);
    		}else{
    			DOM.remove('.J_tip');
    		}
    	},
    	/**
    	 * 取消编辑
    	 * @param  {[type]} e [description]
    	 * @return {[type]}   [description]
    	 */
        _cancel: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                prevTr = $(tr).prev('tr');

            $(tr).remove();
            $(prevTr).show();
            that._tip();
        },
        /**
         * 保存
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _save: function(e){
        	var 
                that = this,
        		form = DOM.get(el.dataform),
        		id = $(e).parent('tr').attr(DATA_CALL_ID),
                oper = $(e).parent('tr').attr(DATA_CALL_OPER),
                data;

            $(el.callIdInp).val(id);
            data = DOM.serialize(el.dataform);
        	that.defender.validAll(function(rs){
        		if(rs){
                    Dialog.confirm(TIP[4], function(){
                        if(oper == 0 ){
                            form.submit();
                        }else{
                            that._sendEditInfo(data, e);
                        }
                    });
        		};
        	});
        },
        /**
         * 编辑后点击保存，发ajax
         * @param  {[type]} data [description]
         * @param  {[type]} e    [description]
         * @return {[type]}      [description]
         */
        _sendEditInfo: function(data, e){
            var that = this;

            CallTypeIO.saveEditItem(data, function(rs, errMsg){
                if(rs){
                    //渲染数据
                    window.location.reload();
                }else{
                    Dialog.alert(errMsg);
                }
            })
        },
    });
    return Management;
}, {
	requires:[
		'widget/dialog',
		'mod/juicer',
		'mod/defender',
		'pio/restaurant-management/call-type-management'
	]
});

      