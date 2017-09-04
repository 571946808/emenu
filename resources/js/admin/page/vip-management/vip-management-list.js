/*-----------------------------------------------------------------------------
* @Description:     后台管理-用户信息管理-会员管理
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.10.23
* ==NOTES:=============================================
* v1.0.0(2015.10.23):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-management-list', function(S, List){
	PW.namespace('page.VipManagement.VipManagementList');
	PW.page.VipManagement.VipManagementList = function(param){
		new List(param);
	}
},{
	requires: [
		'vip-management/list'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('vip-management/list', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,        
        Pagination = PW.mod.Pagination,
        VipManagementIO = PW.io.VipManagement,
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
        	// 修改状态触发器
        	changeTrigger: '.J_change',
        	// 数据渲染模板
        	templateTemp: '#J_template',
        	//输入关键字的input元素
        	inputEl: '.J_key',
        	//删除触发器
        	delTrigger: '.J_del',
        	//提示元素
        	tipEl: '.J_tip'
        },
        DATA_VIP_ID = 'data-vip-id',
        DATA_STATUS = 'data-status',
        newVal = {
        	2: 1,
        	1: 2
        },
        nowStatus = {
        	2: '启用',
        	1: '停用'
        },
        nowValues = {
        	2: ['停用','fa-check','fa-circle','启用'],
        	1: ['启用','fa-circle','fa-check','停用']
        },
        TIP = [
        '确定删除此会员吗？',
        '删除成功！',
        '删除失败！'
        ];

	function List(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this._init();
	}

	S.augment(List, {
		_init: function(){
			this._pagination();
			this._addEventListener();
			this._hideTip();
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
				that._changeVipStatus(evt.target);				
			});	

			delegate(el.templateTemp,'click',el.delTrigger,function(e){
				that._delVip(e.target);				
			});
		},
		/**
		 * 隐藏提示信息
		 * @return {[type]} [description]
		 */
		_hideTip: function(){
			var
				that = this,
				msg = S.one(el.tipEl);
			
			if( msg ){
				setTimeout(function(){
					DOM.remove(el.tipEl);
				}, 2000);
			}
		},
		/**
		 * 分页实现
		 * @return {[type]} [description]
		 */
		_pagination: function(){
			var
				that = this,
				value = DOM.val(el.inputEl),
				param = {
					extraParam: {
						keyword: value
					}
				},
				opts = S.mix(that.opts, param);

			that.pagination = Pagination.client(opts);
		}, 
		/**
		 * 点击搜索，重新刷新分页
		 * @return {[type]} [description]
		 */
		_reloadPagi: function(){
			var
				that = this,
				value = DOM.val(el.inputEl),
				param = {
					extraParam: {
						keyword: value
					}
				},
				opts = S.mix(that.opts, param);

			that.pagination.reload(opts);
		},	
		/**
		 * 改变用户状态实现
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_changeVipStatus: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				changeId = tr.attr(DATA_VIP_ID),
				statusEl = get(el.changeTrigger, tr),
				status = S.trim(DOM.text(statusEl)),
				statusVal = tr.attr(DATA_STATUS),
				info = {
					id: changeId,
					status: newVal[statusVal]
				};

			Dialog.confirm('确定' + status + '该会员吗？', function(e,me){
				VipManagementIO.sendVipId(info,function(rs, errMsg){
					if(rs){
						Dialog.alert(nowStatus[statusVal] + '成功！');
						that._update(ev,statusVal);
						that._reloadPagi();
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
		},
		/**
		 * 删除会员
		 * @param  {[type]} evt [description]
		 * @return {[type]}    [description]
		 */
		_delVip: function(evt){
			var 
        		that = this,
        		tr = $(evt).parent('tr'),
        		VipId = tr.attr(DATA_VIP_ID),
        		info = {
        			id: VipId
        		};
        	
        	Dialog.confirm(TIP[0], function(){
	            VipManagementIO.delVip(info, function(rs, errMsg){
	                if(rs){
	                    Dialog.alert(TIP[1]);
	                    that._reloadPagi();
	                }else{
	                	Dialog.alert(TIP[2]);
	                }
	            });
	        });
		}
	});
	return List;
},{
	requires: [
		'mod/pagination',
		'widget/dialog',
		'pio/vip-management/vip-management'
	]
});