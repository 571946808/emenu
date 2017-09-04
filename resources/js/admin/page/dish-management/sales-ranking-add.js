/*-----------------------------------------------------------------------------
* @Description:     菜品管理-销售排行-添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.11.25
* ==NOTES:=============================================
* v1.0.0(2015.11.25):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/dish-management/sales-ranking-add', function(S, Add){
	PW.namespace('page.DishManagement.SalesRankingAdd');
	PW.page.DishManagement.SalesRankingAdd = function(param){
		new Add(param);
	}
}, {
	requires: [
		'sales-ranking/add'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('sales-ranking/add', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
		Dialog = PW.widget.Dialog,
		SelectAll = PW.mod.Selectall,
		SalesRankingIO = PW.io.DishManagement,
		Juicer = PW.mod.Juicer,
		config = {},
		el = {
			//选择菜品分类表单
			selectForm: '.J_selectForm',
			//添加菜品表单
			addForm: '.J_addForm',
			//保存触发器
			saveTrigger: '.J_save',
			//数据渲染模板
			renderTpl: '#renderTpl',
			//数据渲染容器
			dataRender: '#dataRender',
			//菜品全选触发器
			selectallTrigger: '.J_selectAll',
			//菜品分类触发器
			dishClassifyTrigger: '.J_dishClassify',
			//菜品分类标签容器
			labelContainer: '.J_labels'
		},
		TIP = [
			'保存成功！',
			'保存失败！'
		];

	function Add(param){
		this.opts = S.merge(config, param);
		this._init();
	};

	S.augment(Add, {
		_init: function(){
			this._selectALLDishClassify();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this,
				labels = $(el.labelContainer).children(),
				input;
				
			S.each(labels, function(label){
				input = get('input', label);
				on(input, 'click', function(e){
					that._selectDishClassify(e.target);
				});
			});

			on(el.saveTrigger, 'click', function(){
				that._addDish();
				return false;
			});
		},
		/**
		 * 点击全选复选框时，操作各个菜品分类复选框
		 * @return {[type]} [description]
		 */
		_selectALLDishClassify: function(){
			var
				that = this;

			SelectAll.client({
				root: el.selectForm,
				select: el.dishClassifyTrigger,
				toggleTrigger: el.selectallTrigger
			});
		},
		/**
		 * 选择菜品分类时，点击复选框，发送ajax
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_selectDishClassify: function(ev){
			var
				that = this,
				info = DOM.serialize(el.selectForm);

			SalesRankingIO.selectDishClassify(info, function(rs, list, errMsg){
				if(rs){
					that._renderData(list);
				}
			});
		},
		/**
		 * 将获取到的数据渲染到页面上
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_renderData: function(data){
			var
				that = this,
				renderHtml = $(el.renderTpl).html(),
				renderResult = Juicer.client(renderHtml, {list: data});

			$(el.dataRender).empty();
			$(el.dataRender).append(renderResult);
		},
		/**
		 * 点击保存按钮时，发送被选中菜品的id
		 */
		_addDish: function(){
			var
				that = this,
				info = DOM.serialize(el.addForm);

			SalesRankingIO.sendSelectedDish(info, function(rs, errMsg){
				if(rs){
					Dialog.alert(TIP[0]);
				}else{
					Dialog.alert(TIP[1]);
				}
			});
		}
	});
	return Add;
}, {
	requires: [
		'widget/dialog',
		'mod/selectall',
		'mod/juicer',
		'pio/dish-management/sales-ranking'
	]
});