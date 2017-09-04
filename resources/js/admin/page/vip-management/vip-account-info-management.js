/*-----------------------------------------------------------------------------
* @Description:     管理员-会员管理-会员账户信息管理
* @Version:         2.0.0
* @author:          daiql(361151713@qq.com)
* @date             2015.12.31
* ==NOTES:=============================================
* v1.0.0(2015.12.31):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-account-info-management', function(S, List){
	PW.namespace('page.VipManagement.VipAccountInfoManagement');
	PW.page.VipManagement.VipAccountInfoManagement = function(param){
		new List(param);
	}
},{
	requires: [
		'vip-account-info-management/list'
	]
});
/* ---------------------------------------------------------------------------*/
KISSY.add('vip-account-info-management/list', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
        TablePagi = PW.widget.TablePagi,
        Dialog = PW.widget.Dialog,
        Selectall = PW.mod.Selectall,
        VipManagementIO = PW.io.VipManagement,
		config = {},
		el = {
			//改变触发器
			changeTrigger: '.J_change',
			//数据渲染模板
			template: '#J_template',
			// 搜索表单
        	searchForm: '.J_searchForm',
        	//分类全选
            selectAllTrigger: ".J_selectAll",
            //分类选项
            checkboxEl: ".J_selectType"
		},
		DATA_ACCOUNT_ID = 'data-account-id',
		DATA_ACCOUNT_STATUS = 'data-account-status',
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
		];

	function List(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this._init();
	}

	S.augment(List, {
		_init: function(){
			this._initPagi();
			this._initSelect();
			this._addEventListner();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListner: function(){
			var
				that = this;

			delegate(el.template, 'click', el.changeTrigger, function(e){
				that._changeAccountStatus(e.target);
			});		
		},
		/**
		 * 初始化分页
		 * @private
         */
		_initPagi: function(){
			var
				that = this;
				
			that.pagination = TablePagi.client({
				pagi: that.opts,
				formSet: {
					hasForm: true,
					formRender: el.searchForm
				}
			});
		},
		/**
		 * 点击全选
		 * @return {[type]} [description]
		 */
		_initSelect: function(){
			var that = this;

			Selectall.client({
				root : el.searchForm, 
				select : el.checkboxEl,
                toggleTrigger: el.selectAllTrigger
			});
		},
		/**
		 * 点击停用、启用时，改变会员账户状态
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_changeAccountStatus: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				changedId = tr.attr(DATA_ACCOUNT_ID),
				statusEl = get(el.changeTrigger, tr),
				status = S.trim(DOM.text(statusEl)),
				statusVal = tr.attr(DATA_ACCOUNT_STATUS),
				info = {
					id: changedId,
					status: newVal[statusVal]
				};

			Dialog.confirm('确定' + status + '该方案吗？', function(e,me){
				VipManagementIO.changeAccountStatus(info,function(rs, errMsg){
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
		 * 更新会员账户状态
		 * @param  {[type]} ev        [description]
		 * @param  {[type]} statusVal [description]
		 * @return {[type]}           [description]
		 */
		_update: function(ev,statusVal){
			var
				that = this,
				currentTd = $(ev).parent('td'),
				currentA = get(el.changeTrigger, currentTd),
				vals = nowValues[statusVal],
				prevTd = currentTd.prev(),
				newhtml = '<i class="fa '+ vals[1] +'"></i>&nbsp;' + vals[0];	

			$(ev).parent('tr').attr(DATA_ACCOUNT_STATUS,newVal[statusVal]);
			$(currentA).html(newhtml);
			prevTd.text(vals[2]);
		}
	});
	return List;
},{
	requires: [
		'widget/tablePagi',
		'widget/dialog',
		'mod/selectall',
		'pio/vip-management/vip-account-info-management'
	]
});