/*-----------------------------------------------------------------------------
* @Description:     权限管理-权限组配置
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.10.30
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/authority-management/authority-group-config', function(S, Config){
	PW.namespace('page.AuthoritGroupConfig');
	PW.page.AuthoritGroupConfig = function(param){
		new Config(param);
	};
},{
	requires:[
		'authority-group/config'
	]
})
/* ---------------------------------------------------------------------------*/
KISSY.add('authority-group/config', function(S){
	var 
		DOM = S.DOM, $=S.all, on = S.Event.on, Pagination = PW.mod.Pagination, 
		get = DOM.get, delegate = S.Event.delegate, Dialog = PW.widget.Dialog,
		AuthorityManagementIO = PW.io.AuthorityManagement,
		config = {},
		el = {
			//添加触发器
			addTrigger: '.J_add',
			//权限下拉列表
			authoritySelect: '.J_select',
			//权限添加表单
			addForm: '.J_addForm',
			//删除触发器
			delTrigger: '.J_del',
			//操作表单
			operForm: '.J_operForm',
			//存放权限ID的隐藏INP
			authorityIdInp: '.J_authorityId',
			//提示信息
            msgEl: '.J_msg'
		},
		TIP = ['确定删除该权限？','删除成功','请选择权限！'],
		DATA_AUTHORIYT_ID = 'data-authority-id';

	function Config(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this.hasValid;
		this._init();
	}

	S.augment(Config, {
		_init: function(){
			this._initPagi();
			this._bulidEvt();
			this._Msgclear();
		},
		_initPagi: function(){
			var 
				that = this,
				opts = that.opts;
			that.pagination = Pagination.client(opts);
		},
		/**
    	 * 提示信息消失
    	 * @return {[type]} [description]
    	 */
    	_Msgclear: function(){
    		var that = this;
    			msg = S.one(el.msgEl);
    		if(msg){
    			window.setTimeout(function(){
    				$(el.msgEl).remove();
    			},2000);
    		}
    	},
		_bulidEvt: function(){
			var 
				that = this;
			//添加权限
			on(el.addTrigger, 'click', function(){
				that._validSelect(el.authoritySelect);
				that._submitForm();
				return false;
			});
			//删除权限
			delegate(document, 'click', el.delTrigger, function(e){
				that._delAuthority(e.target);
			})
		},
		/**
		 * 添加权限时，提交表单
		 * @return {[type]} [description]
		 */
		_submitForm: function(){
			var
				that = this,
				addForm = get(el.addForm);
			if(that.hasValid){
				addForm.submit();
			}else{
				Dialog.alert(TIP[2]);
			}
		},
		/**
		 * 添加权限时，验证select是否选择
		 * @param  {[type]} trigger [description]
		 * @return {[type]}         [description]
		 */
		_validSelect: function(trigger){
			var that = this;
			if($(trigger).val() == -1){
				DOM.addClass(trigger, 'error-field');
				that.hasValid = false;
			}else{
				DOM.removeClass(trigger, 'error-field');
				that.hasValid = true;
			}
		},
		/**
		 * 删除权限时，发送权限ID
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_delAuthority: function(ev){
			var 
				that = this,
				id = $(ev).parent('tr').attr(DATA_AUTHORIYT_ID);
			Dialog.confirm(TIP[0], function(){
				that._sendId(id);
			})
		},
		/**
		 * ajax发送权限ID
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_sendId: function(id){
			var that = this;
			AuthorityManagementIO.delAuthorityOfGroup({
				id: id
			}, function(rs, errMsg){
				if(rs){
					Dialog.alert(TIP[1]);
					that.pagination.reload(that.opts);
				}else{
					Dialog.alert(errMsg);
				};
			});
		}
	});
	return Config;
},{
	requires:[
		'mod/pagination',
		'widget/dialog',
		'pio/authority-management/authority-management'

	]
})