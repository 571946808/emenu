/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-结算中心管理
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.11.20
* ==NOTES:=============================================
* v1.0.0(2015.11.20):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/settlement-management', function(S, Core){
	PW.namespace('page.StoreManagement.SettlementManagement');
	PW.page.StoreManagement.SettlementManagement = function(param){
		new Core(param);
	}
}, {
	requires: ['settlement-management/core']
});
/*---------------------------------------------------------------------------*/
KISSY.add('settlement-management/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
		SettlementManagementIO = PW.io.StoreManagement.SettlementManagement,
		Calendar = PW.mod.Calendar,
		Juicer = PW.mod.Juicer,
		config = {},
		el = {
			//搜索触发器
			searchTrigger: '.J_searchBtn',
			//搜索表单
			searchForm: '.J_searchForm',
			//导出触发器
			exportTrigger: '.J_exportExcel',
			//渲染模板
			renderTpl: '#renderTpl',
			//数据渲染位置
			dataRender: '#dataRender',
			//跨行单元格
			rowspan: 'td[rowspan]',
			//提示元素
			tipEl: '.J_tip'
		},
		SUPPLIERS = 'J_supplier';

	function Core(param){
		this.opts = S.merge(config, param);
		this._init();
	}

	S.augment(Core, {
		_init: function(){
			this._hideTip();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this,
				suppliers = $(el.dataRender).children('.J_supplier');
			
			S.each(suppliers, function(elem){
				that._setRowspans(elem);
			});

			S.each(query('.date'), function(i){
				Calendar.client({
					renderTo: i,//默认只获取第一个
					select: {
						rangeSelect: false, //是否允许区间选择
						dataFmt: 'YYYY-MM-DD',
						showTime: false //是否显示时间
					}
				});
			});

			on(el.searchTrigger, 'click', function(){
				that._sendAjax();
				return false;
			});

			on(el.exportTrigger ,'click', function(){
				that._exportExcel();
			});
		},
		/**
		 * 2秒后隐藏提示信息
		 * @return {[type]} [description]
		 */
		_hideTip: function(){
			var
				that = this,
				msg = S.one(el.tipEl);

			if( msg ){
				setTimeout(function(){
					DOM.remove(msg);
				}, 2000);
			}
		},
		/**
		 * 导出excel表格
		 * @return {[type]} [description]
		 */
		_exportExcel: function(){
			var
				that = this,
				href = DOM.attr(el.exportTrigger, 'href').split('?')[0],
				extraParam = S.IO.serialize(el.searchForm),
				newHref = href + '?'+ extraParam;
			
    		DOM.attr(el.exportTrigger, 'href', newHref);
		},
		/**
		 * 按供货商分类显示各个供货商提供的货物
		 * @param {[type]} ev [description]
		 */
		_setRowspans: function(ev){
			var
				that = this,
				next = $(ev).next(),
				rowspans = $(el.rowspan, $(ev)),
				len = 1;

			while( next && !next.hasClass(SUPPLIERS) ){
				next = next.next();
				len ++;
			}
			rowspans.attr('rowspan', len);
		},
		/**
		 * 点击搜索按钮，发送ajax请求
		 * @return {[type]} [description]
		 */
		_sendAjax: function(){
			var
				that = this,
				info = DOM.serialize(el.searchForm);

			SettlementManagementIO.getSettlementList(info, function(rs,list,errMsg){
				if(rs){
					that._renderData(list);
				}
			});
		},
		/**
		 * 渲染页面
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_renderData: function(data){
			var
				that = this,
				renderHtml = $(el.renderTpl).html(),
				len;
				S.each(data, function(it){
					len = it.items.length;
					S.mix(it.items[0], {"status":1,"length":len});
				});
				renderResult = Juicer.client(renderHtml, {
					list:data
				});

			$(el.dataRender).empty();
			$(el.dataRender).append(renderResult);
		} 
	});

	return Core;
}, {
	requires: [
		'mod/calendar',
		'mod/juicer',
		'pio/store-management/settlement-management'
	]
});