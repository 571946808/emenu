/*-----------------------------------------------------------------------------
* @Description:     餐台区域管理
* @Version:         1.0.0
* @author:          hujun(435043636@qq.com)
* @date             2015.10.21
* ==NOTES:=============================================
* v1.0.0(2015.10.21):
     初始生成
  v1.0.0(2015.10.24):
     完成增加、删除、保存、取消功能的实现
* ---------------------------------------------------------------------------*/
KISSY.add('page/restaurant-management/table-area-management', function(S, List){
	PW.namespace('page.AreaManagement');
	PW.page.AreaManagement = function(param){
		new List(param);
	};
},{
	requires: [
		'table-area-management/list'
	]
});

KISSY.add('table-area-management/list',function(S){
	var	
		DOM = S.DOM, $=S.all, 
		on = S.Event.on, delegate = S.Event.delegate,
		Juicer = PW.mod.Juicer,Dialog = PW.widget.Dialog,Defender = PW.mod.Defender,
		RestaurantManagementIO = PW.io.RestaurantManagement,
		config = {
		},
		el = {
			//操作表单
			form: '.J_operForm',
			//表单显示tbody
			tbodyEl: '.data-show-tbody',
			//添加
			addTrigger: '.J_addBtn',
			//编辑
			editTrigger: '.J_editBtn',
			//取消
			cancelTrigger: '.J_cancelBtn',
			//删除
			delTrigger: '.J_delBtn',
			//保存
			saveTrigger: '.J_saveBtn',
			//编辑模板
			editTemp: '#editTpl',
			//保存模板
			saveTemp: '#saveTpl',
			//隐藏id的输入框
			hiddenIdInp: '#J_hiddenId',
			//餐台区域名称
			descEl: '.J_desc',
			//餐台区域权重
			weightEl:'.J_weight'
		},
		TABLE_AREA_ID = 'table-area-id',
		// 操作类型:添加、编辑
		OPER_TYPE = 'oper-type',
		BAN_OPERATION_TIP= ['操作失败：已存在编辑项，请保存或取消后再操作！'],
		OPERATION_TIP = ['确定删除该餐台区域吗？',
						 '确定保存该餐台区域吗？',
						 '确定添加该餐台区域吗？'],
		SUCCESS_TIP = ['删除成功！',
					   '保存成功！',
					   '添加成功！'];
		
	function List(param){
		//阻止验证的提示行为
		this.defender = Defender.client(el.form, {
			showTip: false
		});
		this._init();
	}

	S.augment(List, {
		_init: function(){
			this._buildEvt();
		},
		_buildEvt: function(){
			var 
				that = this;
			//添加
			on(el.addTrigger, 'click', function(){
				if(that._hasEdit()){
					that._add();
				}else{
					Dialog.alert(BAN_OPERATION_TIP[0]);
				}
			});	
			//编辑
			delegate(document, 'click', el.editTrigger, function(e){
				if(that._hasEdit()){
					that._getArea(e.target);
					that._renderEditArea(e.target);
				}else{
					Dialog.alert(BAN_OPERATION_TIP[0]);
				}
			});
			//保存当前操作
			delegate(document, 'click', el.saveTrigger, function(e){
				that._save(e.target);
			});
			//删除
			delegate(document, 'click', el.delTrigger, function(e){
				if(that._hasEdit()){
					that._del(e.target);
				}else{
					Dialog.alert(BAN_OPERATION_TIP[0]);
				}
			});
			//取消当前操作
			delegate(document, 'click', el.cancelTrigger ,function(e){
				that._cancel(e.target);
			});
		},
		/**
		 * 判断是否存在编辑项
		 * @return {Boolean} [description]
		 */
		_hasEdit: function(){
			var 
				that = this;

			if ($(el.saveTrigger).length == 0){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * 添加餐台区域
		 * @return {[type]} [description]
		 */
		_add: function(){
			var 
				that = this;
				editTemp = $(el.editTemp).html(),
				editTpl = Juicer.client(editTemp, {
					area: {
						weight: "1"
					}	
				});	
			
			$(el.tbodyEl).prepend(editTpl);
			that.defender.refresh();  //刷新后验证
		},
		/**
		 * 获取餐台区域信息
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_getArea: function(e){
			var 
				that = this,
				tr = $(e).parent('tr'),
				id = $(tr).attr(TABLE_AREA_ID),
				desc = $(tr).children(el.descEl).text(),
				weight = $(tr).children(el.weightEl).text(),
				area = {
					id: id,
					desc: desc,
					weight: weight,
					type: 'edit'
				};
			that.area = area;
		},
		/**
		 * 编辑时渲染
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_renderEditArea: function(e){
			var 
		 		that = this,
		 		tr = $(e).parent('tr'),
		 		editTemp = $(el.editTemp).html(),
		 		editTpl = Juicer.client(editTemp, {
		 			area:that.area
		 		});

	 		$(editTpl).insertAfter($(tr));
	 		$(tr).hide();
	 		that.defender.refresh();//刷新后验证
		},
		/**
		 * 保存当前编辑的餐台区域信息
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_save: function(e){
			var	
				that = this,
				tr = $(e).parent('tr'),
				id = $(tr).attr(TABLE_AREA_ID),
				type = $(tr).attr(OPER_TYPE);//用于判断处于编辑状态		
			$(el.hiddenIdInp).val(id); //存放当前编辑数据的id
			var formData = DOM.serialize(el.form);
			//保存前验证
			that.defender.validAll(function(rs){
				if(rs){
					if(type == 'edit'){
						that._saveEdit(formData,tr);
					}else{
						that._saveAdd(formData,tr);
					}
				}
			});
		},
		/**
		 * 保存餐台区域信息的编辑结果
		 * @param  {[type]} formData [description]
		 * @param  {[type]} tr   	 [description]
		 * @return {[type]}      	 [description]
		 */
		_saveEdit: function(formData, tr){
			var 
				that = this;
			Dialog.confirm(OPERATION_TIP[1], function(){
				RestaurantManagementIO.saveEditArea(formData, function(rs, errMsg){
					if(rs){
						Dialog.alert(SUCCESS_TIP[1]);
						that._renderSaveArea(formData, tr);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 编辑后保存的渲染效果
		 * @param  {[type]} formData [description]
		 * @param  {[type]} tr       [description]
		 * @return {[type]}          [description]
		 */
		_renderSaveArea: function(formData,tr){
			var 
				that = this,
				prevTr = $(tr).prev(),
				saveTemp = $(el.saveTemp).html(),
				saveTpl = Juicer.client(saveTemp,{
					area:{
						id: formData.id,
						desc: formData.name,
						weight: formData.weight
					}
				});
			$(prevTr).replaceWith(saveTpl);
			$(tr).remove();
		},
		/**
		 * 保存新添加餐台区域信息
		 * @param  {[type]} formData [description]
		 * @param  {[type]} tr       [description]
		 * @return {[type]}          [description]
		 */
		_saveAdd: function(formData,tr){
			var 
				that = this;
	
			Dialog.confirm(OPERATION_TIP[2], function(){
				RestaurantManagementIO.saveNewArea(formData,function(rs,data,errMsg){
					if(rs){	
						Dialog.alert(SUCCESS_TIP[2]);
						that._renderSaveAddArea(formData.name,formData.weight,data,tr);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 *添加信息后保存的渲染效果
		 * @param  {[type]} name   [description]
		 * @param  {[type]} weight [description]
		 * @param  {[type]} data   [description]
		 * @param  {[type]} tr     [description]
		 * @return {[type]}        [description]
		 */
		_renderSaveAddArea: function(name,weight,data,tr){
			var 	
				that = this,
				saveTemp = $(el.saveTemp).html(),
				saveTpl = Juicer.client(saveTemp,{
					area:{
						id: data.id,
						desc: name,
						weight: weight
					}
				});
			$(saveTpl).insertAfter($(tr));
 			$(tr).remove();
		},
		/**
		 * 删除区域信息
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_del: function(e){
			var
				that = this;
				tr = $(e).parent('tr');
				id = $(tr).attr(TABLE_AREA_ID);
			Dialog.confirm(OPERATION_TIP[0],function(){
				RestaurantManagementIO.delArea({
					id: id
				},function(rs,errMsg){
					if(rs){
						$(tr).remove();
						Dialog.alert(SUCCESS_TIP[0]);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 取消当前操作
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
		}
	});
	return List;
},{
	requires:[
		'mod/juicer',
		'widget/dialog',
		'mod/defender',
		'pio/restaurant-management/table-area-management'
	]
});

