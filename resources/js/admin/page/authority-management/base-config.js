/*-----------------------------------------------------------------------------
* @Description:     权限管理-权限配置
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.9.29
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('page/authority-management/base-config', function(S, List){
	PW.namespace('page.AuthorityConfig');
	PW.page.AuthorityConfig = function(param){
		new List(param);
	};
},{
	requires:[
		'authority-config/list'
	]
});
/* ---------------------------------------------------------------------------*/
KISSY.add('authority-config/list', function(S){
	var 
		DOM = S.DOM, $=S.all, on = S.Event.on, delegate = S.Event.delegate,
		Pagination = PW.mod.Pagination, Juicer = PW.mod.Juicer,
		AuthorityManagementIO = PW.io.AuthorityManagement,
		Dialog = PW.widget.Dialog,
		Defender = PW.mod.Defender,
		config = {
		},
		el = {
			// 添加权限触发器
			addTrigger: '.J_addBtn',
			//删除权限触发器
			delTrigger: '.J_del',
			//编辑权限触发器
			editTrigger: '.J_edit',
			//保存权限触发器
			saveTrigger: '.J_save',
			//取消编辑触发器
			cancelTrigger: '.J_cancel',
			// 编辑模板
			editTemp: '#editTpl',
			//保存模板
			saveTemp: "#saveTpl",
			// 数据渲染
			dataTemp: '#J_template',
			//表单
			form: '.J_operForm',
			//隐藏input用来放ID
			idInp: '.J_id',
			//表达式td
			expEl:'.J_exp',
			//描述td
			descEl: '.J_desc'
		},
		DATA_AUTHORITY_ID = 'data-authority-id',
		// 操作类型，编辑、添加
		OPER_TYPE = 'oper-type',
		TIP = ['确定删除该权限吗？', '确定保存该权限吗？', '确定添加该权限吗？',
		'删除成功！', '保存成功！', '添加成功！', '操作失败：已存在编辑项，请保存或取消后再操作！'];

	function List(param){
		this.opts = S.merge(config, param);
		this.defender = Defender.client(el.form, {
			showTip: false
		});
		this.pagination;
		this._init();
	}
	S.augment(List, {
		_init: function(){
			this._initPagi();
			this._buildEvt();
		},
		/**
		 * 判断当前是否有编辑项，没有的时候返回true
		 * @return {Boolean} [description]
		 */
		_hasEdit: function(){
			var
				that = this,
				editEl = S.one(el.saveTrigger);
			if(!editEl){
				return true;
			}else{
				return false;
			}
		},
		_buildEvt: function(){
			var 
				that = this;
			//添加新权限
			on(el.addTrigger, 'click', function(){
				if(that._hasEdit()){
					that._add();
				}else{
					Dialog.alert(TIP[6]);
				}
			});
			//编辑权限
			delegate(document, 'click', el.editTrigger,  function(e){
				if(that._hasEdit()){
					that._getAuthority(e.target);
					that._renderEditAuthority(e.target);
				}else{
					Dialog.alert(TIP[6]);
				}
			});
			//删除权限
			delegate(document, 'click', el.delTrigger, function(e){
				if(that._hasEdit()){
					that._del(e.target);
				}else{
					Dialog.alert(TIP[6]);
				}
			});
			//保存权限
			delegate(document, 'click', el.saveTrigger, function(e){
				that._save(e.target);
			});
			//取消权限
			delegate(document, 'click', el.cancelTrigger, function(e){
				that._cancel(e.target);
			});
		},
		_initPagi: function(){
			var
				that = this,
				opts = that.opts;
			that.pagination = Pagination.client(opts);
		},
		/**
		 * 添加新权限
		 */
		_add: function(){
			var
				that = this,
				editTemp = $(el.editTemp).html(),
				editTplStr = Juicer.client(editTemp, {
					authority: {}
				});
			$(el.dataTemp).prepend(editTplStr);
			that.defender.refresh();
		},
		/**
		 * 编辑时，获得权限的数据
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_getAuthority: function(e){
			var 
		 		that = this,
		 		tr = $(e).parent('tr'),
		 		id = $(tr).attr(DATA_AUTHORITY_ID),
		 		exp = $(tr).children(el.expEL).text(),
		 		desc = $(tr).children(el.descEl).text(),
		 		authority = {};
	 		authority = {
	 			id: id,
	 			exp: exp,
	 			desc: desc,
	 			type: 'edit'
	 		};
	 		that.authority = authority;
		},
		/**
		 * 渲染编辑时权限
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		 _renderEditAuthority: function(e){
		 	var 
		 		that = this,
		 		tr = $(e).parent('tr'),
		 		editTemp = $(el.editTemp).html();
		 	editTplStr  = Juicer.client(editTemp, {authority:that.authority});
	 		$(editTplStr).insertAfter($(tr));
	 		$(tr).hide();
	 		that.defender.refresh();
		 },
		/**
		 * 删除权限
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_del: function(e){
			var 
			that =  this,
			tr = $(e).parent('tr'),
			id = $(tr).attr(DATA_AUTHORITY_ID);
			Dialog.confirm(TIP[0], function(){
				//发送id ajax
				AuthorityManagementIO.delAuthority({
					id: id
				}, function(rs, errMsg){
					if(rs){
						Dialog.alert(TIP[3]);
	                    that.pagination.reload(that.opts);
	                }else{
	                   Dialog.alert(errMsg); 
	                }
				});
			})
		},
		/**
		 * 保存权限的编辑
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_save: function(e){
			var 
				that =  this,
				tr = $(e).parent('tr'),
				id =$(tr).attr(DATA_AUTHORITY_ID),
				type = $(tr).attr(OPER_TYPE);
				$(el.idInp).val(id);
			var data = DOM.serialize(el.form);
			that.defender.validAll(function(rs){
				if(rs){
					if(type=='edit'){
						//如果是编辑，需要发送id
						that._saveEdit(data, tr);
					}else{
						//保存新添加的权限时不需要发送id
						that._saveAdd(data);
					}
				}
			});
		},
		/**
		 * 保存编辑项时发送data
		 * @param  {[type]} data [description]
		 * @param  {[type]} tr   [description]
		 * @return {[type]}      [description]
		 */
		_saveEdit: function(data, tr){
			var that = this;
			Dialog.confirm(TIP[1], function(){
				//发ajax
				AuthorityManagementIO.saveAuthority(data, function(rs, errMsg){
					if(rs){
						Dialog.alert(TIP[4]);
						that._renderAfterEditAuthority(data, tr);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 渲染编辑后的权限
		 * @param  {[type]} data [description]
		 * @param  {[type]} tr   [description]
		 * @return {[type]}      [description]
		 */
		_renderAfterEditAuthority: function(data,tr){
			var 
				saveTemp = $(el.saveTemp).html(),
				saveTplStr = Juicer.client(saveTemp, {
					authority:data
				});
			$(saveTplStr).insertAfter(tr);//replaceWith不能用,暂时先用insert
			$(tr).prev('tr').remove();
			$(tr).remove();
		},
		/**
		 * 保存新添加项
		 * @param  {[type]} exp  [description]
		 * @param  {[type]} desc [description]
		 * @return {[type]}      [description]
		 */
		_saveAdd: function(data){
			var that = this;
			Dialog.confirm(TIP[2], function(){
				//发ajax
				AuthorityManagementIO.saveNewAuthority(data, function(rs, errMsg){
					if(rs){
						Dialog.alert(TIP[5]);
						that.pagination.reload(that.opts);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 取消当前编辑项
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_cancel: function(e){
			var tr = $(e).parent('tr'),
				prevTr = $(tr).prev('tr');
			$(tr).remove();
			$(prevTr).show();
		},
	});
		
	return List;
},{
	requires:[
		'mod/pagination',
		'mod/juicer',
		'widget/dialog',
		'pio/authority-management/authority-management',
		'mod/defender'
	]
});

