/*-----------------------------------------------------------------------------
* @Description:     员工管理-员工列表
* @Version:         1.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.17
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('page/user-management/employee-management-list', function(S, List){
	PW.namespace('page.UserManagement.EmployeeManagement.List');
	PW.page.UserManagement.EmployeeManagement.List = function(param){
		new List(param);
	};
},{
	requires: [
		'employee-management/list'
	]
});

KISSY.add('employee-management/list', function(S){
	var
		DOM = S.DOM, $ = S.all, on = S.Event.on, delegate = S.Event.delegate,
		Tooltip = PW.widget.Tooltip,
		Selectall = PW.mod.Selectall,
		Dialog = PW.widget.Dialog,
		UserManagementIO = PW.io.UserManagement,
		Juicer = PW.mod.Juicer.client,
		config = {
			triggerEl: '',
			placement: ''
		},
		el = {
			// 搜索表单
			searchForm: '.J_searchForm',
			// 搜索结果模板
			searchTemp: '#searchTpl',
			// 数据存放容器
			dataContainer: '#J_template',
			// 气泡触发器
			tooltipEl: '.tool-tip',
			// 气泡模板
			tempStr: '#tooltipTpl',
			// 删除触发器
			delTrigger: '.J_del',
			// 状态转换触发器
			convertTrigger: '.J_convert',
			// 员工状态
			statusEl: '.J_status',
			// 角色为服务员
			waiterEl: '.J_waiter',
			// 信息提示
			tipContainer: '.J_tip'
		},
		// 员工id
		DATA_EMPLOYEE_ID = 'data-employee-id',
		// partyId
		DATA_PARTY_ID = 'data-party-id',
		// 员工状态
		DATA_EMPLOYEE_STATUS = 'data-employee-status',
		TIP = [
			'确定删除此员工吗？',
			'确定启用此员工吗？',
			'确定禁用此员工吗？',
			'暂无数据！'
		],
		SUCCESS_TIP = [
			'删除成功！',
			'启用成功！',
			'禁用成功！'
		];

	function List(param){
		this.opts = S.merge(config, param);
		this._init();
	}	

	S.augment(List, {
		_init: function(){
			this._initSelect();
			this._showTip();
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this;
			// 搜索
			on(el.searchForm, 'submit', function(){
				that._search();
				return false;
			});
			// 删除
			delegate(el.dataContainer, 'click', el.delTrigger, function(e){
				that._delEmployee(e.target);
			});
			// 状态转换
			delegate(el.dataContainer, 'click', el.convertTrigger, function(e){
				that._converEmployee(e.currentTarget);
			});
			// 查看服务员管辖餐桌
			delegate(el.dataContainer, 'click', el.waiterEl, function(e){
				that._sendUserId(e.target);
			});
		},
		/**
		 * 信息提示
		 * @private
         */
		_showTip: function(){
			var
				that = this,
				tipEl = S.one(el.tipContainer);

			if(tipEl){
				setTimeout(function(){
					DOM.remove(tipEl);
				}, 2000);
			}
		},
		/**
		 * 转换员工状态
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_converEmployee: function(e){
			var
				that = this,
				tr = DOM.parent(e, 'tr'),
				id = DOM.attr(tr, DATA_EMPLOYEE_ID),
				partyId = DOM.attr(tr, DATA_PARTY_ID),
				statusEl = DOM.get(el.statusEl, tr),
				status = DOM.attr(statusEl, DATA_EMPLOYEE_STATUS),
				tipObj = that._getTip(status);
			
			Dialog.confirm(tipObj.tip, function(){
				UserManagementIO.convertEmployeeStatus({
					partyId: partyId,
					status: tipObj.newStatus
				}, function(rs, errMsg){
					if(rs){
						Dialog.alert(tipObj.successTip);
						that._updateEmployeeStatus(e, statusEl, tipObj.newStatus);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 获取相应提示和新状态
		 * @param  {[type]} status [description]
		 * @return {[type]}        [description]
		 */
		_getTip: function(status){
			var
				that = this,
				tip,
				successTip,
				newStatus;
			if(status == 1){
				tip = TIP[2];
				successTip = SUCCESS_TIP[2];
				newStatus = 2;
			}else if(status == 2){
				tip = TIP[1];
				successTip = SUCCESS_TIP[1];
				newStatus = 1;
			}
			return {
				// 提示框内容
				tip: tip,
				// 操作成功后的提示内容
				successTip: successTip,
				// 新状态
				newStatus: newStatus
			}
		},
		/**
		 * 更新员工状态
		 * @param  {[type]} e         [description]
		 * @param  {[type]} statusEl  [description]
		 * @param  {[type]} newStatus [description]
		 * @return {[type]}           [description]
		 */
		_updateEmployeeStatus: function(triggerEl, statusEl, newStatus){
			var
				that = this,
				convertText,
				triggerText;
			if(newStatus == 2){
				convertText = '禁用';
				triggerText = '<i class="fa fa-check"></i>&nbsp;启用';
			}else if(newStatus == 1){
				convertText = '启用';
				triggerText = '<i class="fa fa-circle"></i>&nbsp;禁用';
			}
			DOM.html(statusEl, convertText);
			DOM.html(triggerEl, triggerText);
			DOM.attr(statusEl, DATA_EMPLOYEE_STATUS, newStatus);
		},
		/**
		 * 删除员工
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_delEmployee: function(e){
			var
				that = this,
				tr = DOM.parent(e, 'tr'),
				id = DOM.attr(tr, DATA_EMPLOYEE_ID),
				partyId = DOM.attr(tr, DATA_PARTY_ID);

			Dialog.confirm(TIP[0], function(){
				UserManagementIO.delEmployee({
					id: id,
					partyId: partyId
				}, function(rs, errMsg){
					if(rs){
						Dialog.alert(SUCCESS_TIP[0]);
						DOM.remove(tr);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 搜索操作
		 * @return {[type]} [description]
		 */
		_search: function(){
			var
				that = this,
				data = DOM.serialize(el.searchForm),
				checkboxEl = DOM.query('input[type="checkbox"]', el.searchForm),
				n = 0;
			that._searchTip();
			S.each(checkboxEl, function(checkbox){
				if(!checkbox.checked){
					n ++;
				}
				if(n == checkboxEl.length){
					S.mix(data, {
						roles: -1
					})
				}
			});

			UserManagementIO.searchEmployee(data, function(rs, data, errMsg){
				if(rs){
					that._renderSearchResult(data);
				}else{
					that._searchTip('暂无数据！');
				}
			});
		},
		/**
		 * 搜索提示
		 * @return {[type]} [description]
		 */
		_searchTip: function(string){
			var
				that = this,
				thead = DOM.get('thead', 'table'),
				ths = DOM.query('th', thead),
				length = ths.length,
				tip;
			if(!string){
				tip = '加载中，请稍后...';
			}else{
				tip = string;
			}
			DOM.html(el.dataContainer, '<tr><td class="text-center padding-top-15 padding-bottom-15" colspan="' + length + '">' + tip + '</td></tr>');
		},
		/**
		 * 渲染搜索结果
		 * @param  {[type]} list [description]
		 * @return {[type]}      [description]
		 */
		_renderSearchResult: function(list){
			var
				that = this,
				temp = DOM.html(el.searchTemp),
				searchStr = Juicer(temp, {
					list: list
				});
			DOM.html(el.dataContainer, searchStr);
		},
		/**
		 * 初始化复选框
		 * @return {[type]} [description]
		 */
		_initSelect: function(){
			var
				that = this;
			Selectall.client({
				root : '.J_searchForm', 
				select : '.J_roleType',
                toggleTrigger: '.J_selectAll'
			});
		},
		/**
		 * 发送当前用户名id，获取其服务员管辖餐台
		 * @param  {[type]} id      [description]
		 * @param  {[type]} me      [description]
		 * @param  {[type]} trigger [description]
		 * @return {[type]}         [description]
		 */
		_sendUserId: function(e){
			var
				that = this,
				tr = DOM.parent(e, 'tr'),
				id = DOM.attr(tr, DATA_EMPLOYEE_ID),
				partyId = DOM.attr(tr, DATA_PARTY_ID);

			UserManagementIO.sendEmployeeId({
				id: id,
				partyId: partyId
			}, function(rs, data, errMsg){
				if(rs){
					that._openDlg(data);
				}else{
					S.log('获取失败！');
				}
			});
		},
		/**
		 * 查看服务员管理餐桌
		 * @param data
		 * @private
		 */
		_openDlg: function(data){
			var
				that = this,
				tableTemp = DOM.html(el.tempStr),
				tableStr = Juicer(tableTemp, {
					list: data
				});
				
			if(data.length == 0){
				Dialog.alert(TIP[3]);
			}else{
				Dialog.alert(tableStr);
			}
		}
	});

	return List;
},{
	requires: [
		'mod/juicer',
		//'widget/tooltip',
		'mod/selectall',
		'widget/dialog',
		'pio/user-management/employee-management',
		'core'
	]
});