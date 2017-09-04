/*-------------------------------------------------------------
* @Description:     餐台管理-餐段管理
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.11.7
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/restaurant-management/meal-period-management', function(S,Management){
	PW.namespace('page.MealPeriod.Management');
	PW.page.MealPeriod.Management =function(param){
		new Management(param);
	}
},{
	requires:[
		'meal-period/management'
	]
});
/* -----------------------------------------------------------------*/
KISSY.add('meal-period/management', function(S){
	var 
		DOM = S.DOM, get = DOM.get,$ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        MealPeriodIO = PW.io.MealPeriodManagement, 
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
        	//设置当前餐段触发器
        	currentPeriodTrigger:'.J_set',
        	//餐段select
        	periodEl:'.J_period',
        	//编辑模板
        	editTpl: '#editTpl',
        	//数据渲染位置
        	dataRender: '#J_template',
            //td 餐段名字
            nameTd: '.J_name',
            //td 餐段状态
            statusTd: '.J_status',
            //td 餐段排序
            weightTd: '.J_weight',
            //存放id的隐藏input
            periodIdInp: '.J_hidden',
            //添加或编辑时的表单
            dataform:'.J_operForm',
            //提示信息
            msgEl: '.J_msg'
        },
        TIP = ['设置当前餐段成功！', '删除餐段成功！', '操作失败：已存在编辑项，请保存或取消后再操作！',
        '确定删除该餐段？', '确定保存该餐段吗？', '保存餐段成功！'],
        DATA_PERIOD_ID = 'data-period-id',
        DATA_PERIOD_OPER='data-period-oper',
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
    		var 
                that = this,
    			msg = S.one(el.msgEl);

    		if(msg){
    			window.setTimeout(function(){
    				$(el.msgEl).remove();
    			},2000);
    		}
    	},
    	_buildEvt: function(){
    		var that = this;
    		//设置当前餐段
    		on(el.currentPeriodTrigger,'click', function(){
    			that._setCurrentPeriod();
    		});
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
                    that._editPeriod(e.target);
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
                    that._delPeriod(e.target);
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
            var 
                that = this,
                editEl = S.one(el.saveTrigger);

            if(editEl){
                return false;
            }else{
                return true;
            }
        },
        /**
         * 设置当前餐段
         */
    	_setCurrentPeriod: function(){
    		var 
    			that = this,
    			id = $(el.periodEl).val();

    		MealPeriodIO.setCurrentPeriod({id: id}, function(rs, errMsg){
    			if(rs){
    				Dialog.alert(TIP[0]);
    			}else{
    				Dialog.alert(errMsg);
    			}
    		});
    	},
    	/**
    	 * 添加时获取默认排序
    	 * @return {[type]} [description]
    	 */
    	_getWeight: function(){
    		var that = this;

    		MealPeriodIO.getWeight({},function(rs, data, errMsg){
    			if(rs){
                    that._addPeriod(data);
    			}else{
    				Dialog.alert(errMsg);
    			}
    		});
    	},
    	/**
    	 * 添加餐段
    	 * @param {[type]} weight [description]
    	 */
        _addPeriod: function(weight){
            var 
                that = this,
                editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {
                    mealPeriod:{
                    	weight:weight,
                        oper: 0
                    }
                });

            $(el.dataRender).prepend(editTplStr);
            that.defender.refresh();
            that._tip();
        },
        /**
         * 编辑餐段
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editPeriod: function(e){
            var 
                that = this,
                tr = $(e).parent('tr'),
                name = $(tr).children(el.nameTd).text(),
                status = $(tr).children(el.statusTd).text(),
                weight = $(tr).children(el.weightTd).text(),
                id = $(tr).attr(DATA_PERIOD_ID),
                statusVal = statusMap[status],
                mealPeriod = {
                    id: id,
                    name: name,
                    status: statusVal,
                    weight: weight,
                    oper: 1 
                };//oper 编辑1 添加0

            that._renderEdit(mealPeriod, tr);
        },
        /**
         * 编辑时给input渲染数据
         * @param  {[type]} mealPeriod [description]
         * @param  {[type]} tr         [description]
         * @return {[type]}            [description]
         */
        _renderEdit: function(mealPeriod, tr){
        	var that = this,
        		editHtml = $(el.editTpl).html(),
                editTplStr = Juicer.client(editHtml, {mealPeriod:mealPeriod});

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

        	Dialog.confirm('确定'+ status + '该餐段？', function(){
        		that._sendInfo(status, changeTrigger);
        	});
        },
        /**
         * ajax 改变状态时，发送餐段id和修改状态
         * @return {[type]} [description]
         */
        _sendInfo: function(status, changeTrigger){
        	var 
        		that = this,
        		Tr = $(changeTrigger).parent('tr'),
        		id = $(Tr).attr(DATA_PERIOD_ID),
        		statusVal = statusMap[status];

        	MealPeriodIO.changeStatus({id: id, status: statusVal}, function(rs, errMsg){
        		if(rs){
    				Dialog.alert('餐段'+ status + '成功！', function(){
                        window.location.reload();
                    });
    			}else{
    				Dialog.alert(errMsg);
    			}
        	});
        },
        /**
         * 删除餐段
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
    	_delPeriod: function(e){
    		var 
    			that = this,
    			tr = $(e).parent('tr'),
    			id = $(tr).attr(DATA_PERIOD_ID);

    		Dialog.confirm(TIP[3],function(){
    			that._sendDelId(id, tr);
    		});
    	},
    	/**
    	 * 删除时发送餐段id
    	 * @param  {[type]} id [description]
    	 * @return {[type]}    [description]
    	 */
    	_sendDelId: function(id, tr){
            var     
                that = this;

    		MealPeriodIO.delPeriod({id: id}, function(rs, errMsg){
    			if(rs){
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
        		id = $(e).parent('tr').attr(DATA_PERIOD_ID),
                oper = $(e).parent('tr').attr(DATA_PERIOD_OPER),
                data;

            $(el.periodIdInp).val(id);
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
            MealPeriodIO.saveEditItem(data, function(rs, errMsg){
                if(rs){
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
		'pio/restaurant-management/meal-period-management'
	]
});
