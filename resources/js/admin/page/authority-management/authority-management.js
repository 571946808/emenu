/*-----------------------------------------------------------------------------
* @Description:     管理员-权限管理-权限管理
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.9.28
* ==NOTES:=============================================
* v1.0.0(2015.9.28):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/authority-management/authority-management', function(S, Authority){
	PW.namespace('page.AuthorityManagement');
	PW.page.AuthorityManagement.Authority = function(param){
		new Authority(param);
	}
},{
	requires: [
		'authority-management/authority'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('authority-management/authority', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,        
        Pagination = PW.mod.Pagination,     
        AuthorityManagementIO = PW.io.AuthorityManagement,
        Dialog = PW.widget.Dialog,
        config = {
        	pagi: {
        		renderTo: '',
        		renderTo: '',
				juicerRender: '',
				dataRender: '',
				url: '',
				pageSize: 10
        	}
        },
        el = {     
        	// 搜索表单
        	searchForm: '.J_searchForm',   	        	
        	// 搜索触发器
        	searchTrigger: '.J_search',        	
        	// 修改权限触发器
        	changeTrigger: '.J_change',
        	// 数据渲染
        	templateTemp: '#J_template',
        	// 搜索表单-用户状态
        	statusEl: '.J_status'
        },
        DATA_USER_ID = 'data-user-id',
        DATA_STATUS = 'data-status',
        newVal = {
        	0: 1,
        	1: 0
        },
        nowStatus = {
        	0: '启用',
        	1: '禁用'
        },
        nowValues = {
        	0: [' 禁用','fa-check','fa-close','启用'],
        	1: ['启用','fa-close','fa-check','禁用']
        };

	function Authority(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this._init();
	}

	S.augment(Authority, {
		_init: function(){
			this._pagination();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this,
				opts = that.opts;

			on(el.searchForm, "submit",function(){
				that._reloadPagi();
				return false;
			});			

			delegate(el.templateTemp,'click',el.changeTrigger,function(evt){
				that._changeAuthority(evt.target);				
			});	
		},
		/**
		 * 分页实现
		 * @return {[type]} [description]
		 */
		_pagination: function(){
			var
				that = this,
				opts = that.opts;
			that.pagination = Pagination.client(opts);
		}, 
		/**
		 * 点击搜索，重新刷新分页
		 * @return {[type]} [description]
		 */
		_reloadPagi: function(){
			var
				that = this,
				opts = S.mix(that.opts, {
					extraParam: {
						status: DOM.val(el.statusEl)
					}
				});
			that.pagination.reload(opts);
		},	
		/**
		 * 改变权限实现
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_changeAuthority: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				changeId = tr.attr(DATA_USER_ID),
				statusEl = get(el.changeTrigger, tr),
				status = S.trim(DOM.text(statusEl)),
				statusVal = tr.attr(DATA_STATUS);

			Dialog.confirm('确定' + status + '该权限吗？', function(e,me){
				AuthorityManagementIO.sendAuthorityId({
					id: changeId,
					status: newVal[statusVal]
				},function(rs, errMsg){
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
		 * 刷新为最新的状态
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
				newhtml = '<i class="fa '+ vals[2]+'"></i>&nbsp;' + vals[0];	

			$(ev).parent('tr').attr(DATA_STATUS,newVal[statusVal]);
			$(currentA).html(newhtml);
			prevTd.text(vals[3]);
		}
	});
	return Authority;
},{
	requires: [
		'mod/pagination',
		'widget/dialog',
		'pio/authority-management/authority-management'
	]
});