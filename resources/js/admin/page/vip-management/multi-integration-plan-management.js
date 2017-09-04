/*-------------------------------------------------------------
* @Description:     会员管理-多倍积分方案管理
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.12.14
* ==NOTES:=============================================
* v1.0.0(2015.12.14):
     初始生成
* -----------------------------------------------------------------*/
KISSY.add('page/vip-management/multi-integration-plan-management', function(S,Plan){
	PW.namespace('page.VipManagement.MultiIntegrationPlanManagement');
	PW.page.VipManagement.MultiIntegrationPlanManagement = function(param){
		new Plan(param);
	}
}, {
	requires: [
		'multi-integration/plan'
	]
});
/* -----------------------------------------------------------------*/
KISSY.add('multi-integration/plan', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
		Defender = PW.mod.Defender,
		Dialog = PW.widget.Dialog,
		Calendar = PW.mod.Calendar,
		Juicer = PW.mod.Juicer,
		VipManagementIO = PW.io.VipManagement,
		config = {},
		el = {
			//操作表单
			operForm: '.J_operForm',
			//删除触发器
			delTrigger: '.J_del',
			//改变状态触发器
			changeTrigger: '.J_change',
			//添加触发器
			addTrigger: '.J_add',
			//编辑触发器
			editTrigger: '.J_edit',
			//添加/编辑时的数据模板
			beforeSaveTpl: '#beforeSaveTpl',
			//保存完成后的数据模板
			afterSaveTpl: '#afterSaveTpl',
			//保存触发器
			saveTrigger: '.J_save',
			//取消触发器
			cancelTrigger: '.J_cancel'
		},
		DATA_PLAN_ID = 'data-plan-id',
		DATA_STATUS = 'data-status',
		DATA_TYPE = 'data-type',
		newVal = {
        	0: 1,
        	1: 0
        },
        nowStatus = {
        	0: '启用',
        	1: '停用'
        },
        nowValues = {
        	0: ['停用','fa-circle','启用'],
        	1: ['启用','fa-check','停用']
        },
		TIP = [
			'确定要删除该方案吗？',
			'删除成功！',
			'删除失败！',
			'保存成功！',
			'保存失败！'
		],
		operTip = [
			'操作失败：已存在编辑项，请保存或取消后再操作！'
		];

	function Plan(param){
		this.opts = S.merge(config, param);
		this.defender;
		this.operType;
		this.isEditable = 1;
		this._init();
	}

	S.augment(Plan, {
		_init: function(){
			this._defender();
			this._addEventListener();
		},
		_addEventListener: function(){
			var
				that = this;

			on(el.addTrigger, 'click', function(){
				if( that.isEditable == 1 ){
					that.operType = 0;
					that.isEditable = 0;
					that._insertTemplate(null, {});
				}else{
					Dialog.alert(operTip[0]);
				}
			});

			delegate(el.operForm, 'click', el.saveTrigger, function(e){
				that._valid(e.target);
				that.isEditable = 1;
			});

			delegate(el.operForm, 'click', el.editTrigger, function(e){
				if( that.isEditable == 1 ){
					that.operType = 1;
					that.isEditable = 0;
					that._getCurrentData(e.target);
				}else{
					Dialog.alert(operTip[0]);
				}
			});

			delegate(el.operForm, 'click', el.cancelTrigger, function(e){
				that._cancelEdit(e.target);
				that.isEditable = 1;
			});

			delegate(el.operForm, 'click', el.delTrigger, function(e){
				that._delPlan(e.target);
			});

			delegate(el.operForm, 'click', el.changeTrigger, function(e){
				that._changePlanStatus(e.target);
			});
		},
		/**
		 * 将表单加入验证池
		 * @return {[type]} [description]
		 */
		_defender: function(){
			var
				that = this;

			that.defender = Defender.client(el.operForm, {
				showTip: false
			});
		},
		/**
		 * 点击编辑时，获取当前方案的数据
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_getCurrentData: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				currentid = tr.attr(DATA_PLAN_ID),
				currentStatus = tr.attr(DATA_STATUS);
				tds = tr.children(),
				content = [],
				currentData = {};

			S.each(tds, function(td, i){
				if( i < 4 ){
					content[i] = $(td).text();
				}
			});
			currentData = {
				id: currentid,
				status: currentStatus,
				name: content[0],
				integralMultiples: content[1],
				startTime: content[2],
				endTime: content[3]
			};
			that._insertTemplate(ev, currentData);
		},
		/**
		 * 插入将要进行编辑/添加数据的模板
		 * @param  {[type]} ev          [description]
		 * @param  {[type]} currentData [description]
		 * @return {[type]}             [description]
		 */
		_insertTemplate: function(ev, currentData){
			var
				that = this,
				tr = $(ev).parent('tr'),
				beforeSaveHtml = $(el.beforeSaveTpl).html(),
				renderedHtml = Juicer.client(beforeSaveHtml, {data: currentData});

			if( that.operType == 1 ){
				$(renderedHtml).insertBefore(tr);
				tr.hide();
			}else{
				$('tbody').prepend(renderedHtml);
			}
			that._selectDate();
			that.defender.refresh();
		},
		/**
		 * 选择日期
		 * @return {[type]} [description]
		 */
		_selectDate: function(){
			var
				that = this;

			S.each(query('.date'),function(i){
				Calendar.client({
					renderTo: i, //默认只获取第一个
					select: {
						rangeSelect: false, //是否允许区间选择
						dataFmt: 'YY-MM-DD',
						showTime: false //是否显示时间
					}
				});
			});
		},
		/**
		 * 点击保存时，验证表单
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_valid: function(ev){
			var
				that = this,
				form = get(el.operForm);
			
			that.defender.validAll(function(rs){
				if(rs){
					that._submitForm(ev);
				}
			});
		},
		/**
		 * 验证通过后，将所填的信息发送ajax
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_submitForm: function(ev){
			var
				that = this,
				info = DOM.serialize(el.operForm);

			if( that.operType == 0 ){
				VipManagementIO.sendAddedPlan(info, function(rs, data, errMsg){
					if(rs){
						info = S.mix(info, data);
						that._renderData(ev, info);
						Dialog.alert(TIP[3]);
					}else{
						Dialog.alert(TIP[4]);
					}
				});
			}else{
				VipManagementIO.sendEditedPlan(info, function(rs, errMsg){
					if(rs){
						that._renderData(ev, info);
						Dialog.alert(TIP[3]);
					}else{
						Dialog.alert(TIP[4]);
					}
				});
			}			
		},
		/**
		 * 将数据渲染到模板中，插入到页面
		 * @param  {[type]} ev   [description]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_renderData: function(ev, data){
			var
				that = this,
				tr = $(ev).parent('tr'),
				afterSaveHtml = $(el.afterSaveTpl).html(),
				renderedHtml = Juicer.client(afterSaveHtml, {data: data});

			if( that.operType == 1 ){
				$(renderedHtml).insertAfter(tr);
			}else{
				$('tbody').prepend(renderedHtml);
			}
			DOM.remove(tr);
		},
		/**
		 * 取消
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_cancelEdit: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				hiddenEl = tr.next();
			
			if( that.operType == 1 ){
				hiddenEl.show();
			}
			DOM.remove(tr);
		},
		/**
		 * 删除
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_delPlan: function(ev){
			var 
        		that = this,
        		tr = $(ev).parent('tr'),
        		PlanId = tr.attr(DATA_PLAN_ID),
        		info = {
        			id: PlanId
        		};
        	
        	Dialog.confirm(TIP[0], function(){
	            VipManagementIO.delExsitedPlan(info, function(rs, errMsg){
	                if(rs){
	                    Dialog.alert(TIP[1]);
	                    DOM.remove(tr);
	                }else{
	                	Dialog.alert(TIP[2]);
	                }
	            });
	        });
		},
		/**
		 * 点击停用、启用时，改变方案状态
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_changePlanStatus: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				changeId = tr.attr(DATA_PLAN_ID),
				statusEl = get(el.changeTrigger, tr),
				status = S.trim(DOM.text(statusEl)),
				statusVal = tr.attr(DATA_STATUS),
				info = {
					id: changeId,
					status: newVal[statusVal]
				};

			Dialog.confirm('确定' + status + '该方案吗？', function(e,me){
				VipManagementIO.sendModifiedPlan(info,function(rs, errMsg){
					if(rs){
						Dialog.alert(nowStatus[statusVal] + '成功！');
						that._update(ev,statusVal);
					}else{
	                   Dialog.alert(errMsg); 
	                }
				});
			});
		},
		/**
		 * 改变状态后，更新当前方案的数据
		 * @param  {[type]} ev        [description]
		 * @param  {[type]} statusVal [description]
		 * @return {[type]}           [description]
		 */
		_update: function(ev,statusVal){
			var
				that = this,
				opts = that.opts,
				currentTd = $(ev).parent('td'),
				currentA = get(el.changeTrigger, currentTd),
				vals = nowValues[statusVal],
				prevTd = currentTd.prev(),
				newhtml = '<i class="fa '+ vals[1] +'"></i>&nbsp;' + vals[0];	

			$(ev).parent('tr').attr(DATA_STATUS,newVal[statusVal]);
			$(currentA).html(newhtml);
			prevTd.text(vals[2]);
		}
	});

	return Plan;
}, {
	requires: [
		'mod/defender',
		'widget/dialog',
		'mod/calendar',
		'mod/juicer',
		'pio/vip-management/multi-integration-plan-management'
	]
});