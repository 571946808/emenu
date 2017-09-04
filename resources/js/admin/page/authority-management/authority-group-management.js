/*-----------------------------------------------------------------------------
* @Description:     管理员-权限管理-权限组管理
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.10.29
* ==NOTES:=============================================
* v1.0.0(2015.10.29):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/authority-management/authority-group-management', function(S, List){
	PW.namespace('page.AuthorityGroupManagement');
	PW.page.AuthorityGroupManagement.AuthorityGroup = function(param){
		new List(param);
	}
},{
	requires: [
		'authority-group/list'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('authority-group/list', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,        
        Pagination = PW.mod.Pagination,  
        AuthorityGroupManagementIO = PW.io.authorityManagement,
        Dialog = PW.widget.Dialog,
        config = {
        },
        el = {
        	//添加表单
        	addForm: '.J_addForm',
        	//数据渲染模板
        	templateTemp: '#J_template',
        	//添加触发器
        	addTrigger: '.J_add',
        	//删除触发器
        	delTrigger: '.J_del'
        },
        DATA_GROUP_ID = 'data-group-id',
        TIP = [
        '确定删除此权限组吗？',
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
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this,
				opts = that.opts,
				form = get(el.addForm);

			on(el.addForm, "submit",function(){
				form.submit();
			});			

			delegate(el.templateTemp,'click',el.delTrigger,function(e){
				that._delAuthorityGroup(e.target);				
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
		 * 删除权限组
		 * @param  {[type]} evt [description]
		 * @return {[type]}    [description]
		 */
		_delAuthorityGroup: function(evt){
			var 
        		that = this,
        		tr = $(evt).parent('tr'),
        		input = tr.parent('table').parent().prev().children().children('input'),
        		groupId = tr.attr(DATA_GROUP_ID),
        		userId = input.attr('value'),
        		info = {
        			userId: userId,
        			id: groupId
        		};
        	
        	Dialog.confirm(TIP[0], function(){
	            AuthorityGroupManagementIO.delAuthorityGroup(info, function(rs, errMsg){
	                if(rs){
	                    Dialog.alert(TIP[1]);
	                    that._reloadPagi();
	                }else{
	                	Dialog.alert(TIP[2]);
	                }
	            });
	        });
		},
		/**
		 * 删除成功之后，重新加载分页
		 * @return {[type]} [description]
		 */
		_reloadPagi: function(){
			var
				that = this,
				opts = that.opts;

			that.pagination.reload(opts);
		}
	});
	return List;
},{
	requires: [
		'mod/pagination',
		'widget/dialog',
		'pio/authority-management/authority-group-management'
	]
});