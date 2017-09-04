/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-原配料管理-列表
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2016.05.17
* ==NOTES:=============================================
* v1.0.0(2016.05.17):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/ingredients-management-list', function(S, List){
	PW.namespace('page.StoreManagement.IngredientsManagementList');
	PW.page.StoreManagement.IngredientsManagementList = function(param){
		new List(param);
	}
}, {
	requires: [
		'ingredients-management/list'
	]
});
/***************************************************************************/
KISSY.add('ingredients-management/list', function(S){
	var
		$ = S.all, DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		Pagination = PW.mod.Pagination,
		Selectall = PW.mod.Selectall,
		Dialog = PW.widget.Dialog,
		IngredientsManagementIO = PW.io.StoreManagement.IngredientsManagement,
		config = {},
		el = {
			//搜索表单
			searchForm: '.J_searchForm',
			//导出excel
			exportTrigger: '.J_export',
			//删除触发器
			delTrigger: '.J_del'
		},
		DATA_INGREDIENT_ID = 'data-ingredient-id',
		TIP = [
			'确认要删除此原配料吗？',
			'删除成功！'
		];

	function List(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this.init();
	}

	S.augment(List, {
		init: function(){
			this._initPagi();
			this._select();
			this._addEventListener();
		},
		/**
		 * 初始化分页
		 * @return {[type]} [description]
		 */
		_initPagi: function(){
			var
				that = this,
				opts = that.opts;

			that.pagination = Pagination.client(opts);
		},
		/**
		 * 原配料分类选择
		 * @return {[type]} [description]
		 */
		_select: function(){
			var
				that = this;

			Selectall.client({
				root: el.searchForm,
				select: '.J_ingredientType',
				toggleTrigger: '.J_selectAll'
			});
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			on(el.searchForm, 'submit', function(){
				that._search();
				return false;
			});

			on(el.exportTrigger, 'click', function(){
				that._exportExcel();
			});

			delegate(document, 'click', el.delTrigger, function(e){
				that._delIngredient(e.currentTarget);
			});
		},
		/**
		 * 搜索，刷新分页
		 * @return {[type]} [description]
		 */
		_search: function(){
			var
				that = this,
				extraParam = DOM.serialize(el.searchForm);
				opts = S.mix(that.opts,{
					extraParam: extraParam
				});

			that.pagination.reload(opts);
		},
		/**
		 * 导出excel
		 * @return {[type]} [description]
		 */
		_exportExcel: function(){
			var
				that = this,
				href = DOM.attr(el.exportTrigger, 'href').split('?')[0],
				extraParam = S.IO.serialize(el.searchForm),
				newHref = href + '?' + extraParam;

			DOM.attr(el.exportTrigger, 'href', newHref);
		},
		_delIngredient: function(e){
			var
				that = this,
				tr = DOM.parent(e, 'tr'),
				id = DOM.attr(tr, DATA_INGREDIENT_ID),
				info = {
					id: id
				};

			Dialog.confirm(TIP[0], function(){
				IngredientsManagementIO.delIngredient(info, function(rs, errMsg){
					if(rs){
						Dialog.alert(TIP[1]);
						that.pagination.reload(that.opts);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		}
	});

	return List;
}, {
	requires: [
		'mod/pagination',
		'mod/selectall',
		'widget/dialog',
		'pio/store-management/ingredients-management'
	]
});