/*-------------------------------------------------------------
 * @Description:     营业分析--退菜明细
 * @Version:         2.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.08.03
 * ==NOTES:=============================================
 * v1.0.0(2016.08.03):
 * 	初始生成
 * --------------------------------------------------------------*/
 KISSY.add('page/business-analysis/retreat-details', function(S, Core){
 	PW.namespace('page.BusinessAnalysis.RetreatDetails');
 	PW.page.BusinessAnalysis.RetreatDetails = function(param){
 		new Core(param);
 	}
 }, {
 	requires: [
 		'retreat-details/core'
 	]
 });
 /* --------------------------------------------------------------*/
 KISSY.add('retreat-details/core', function(S){
 	var
 		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
 		on = S.Event.on, delegate = S.Event.delegate,
 		Pagination = PW.mod.Pagination,
 		Juicer = PW.mod.Juicer,
 		Calendar = PW.mod.Calendar,
 		Selectall = PW.mod.Selectall,
 		config = {},
 		el = {
 			//搜索表单
 			searchForm: '.J_searchForm',
 			//大类触发器
 			bigTagTrigger: '.J_bigTag',
 			//全选触发器
 			selectAllTrigger: '.J_selectAll',
 			//搜索触发器
 			searchTrigger: '.J_searchBtn',
 			//快捷搜索触发器
 			fastSearchTrigger: '.J_shortcut',
 			//开始日期元素
 			startTimeEl: '.J_startTime',
 			//结束日期元素
 			endTimeEl: '.J_endTime',
 			//导出触发器
 			exportTrigger: '.J_export'
 		},
 		DATA_START_TIME = 'data-start-time',
 		DATA_END_TIME = 'data-end-time';

 	function Core(param){
 		this.opts = S.merge(config, param);
 		this.pagination;
 		this._init();
 	}

 	S.augment(Core, {
 		_init: function(){
 			this._selectAll();
 			this._initPagi();
 			this._initCalendar();
 			this._addEventListener();
 		},
 		/**
 		 * 添加事件监听
 		 */
 		_addEventListener: function(){
 			var
 				that = this;

 			on(el.searchTrigger, 'click', function(){
 				that._reloadPagi();
 			});

 			on(el.fastSearchTrigger, 'click', function(e){
 				that._fastSearch(e.target);
 			});

 			on(el.exportTrigger, 'click', function(e){
 				that._export(e.target);
 			});
 		},
 		/**
 		 * 初始化分页
 		 * @return {[type]} [description]
 		 */
 		_initPagi: function(){
 			var
 				that = this,
 				extraParam = DOM.serialize(el.searchForm),
 				opts = S.mix(that.opts, {
 					extraParam: extraParam
 				});

 			that.pagination = Pagination.client(opts);
 		},
 		/**
 		 * 初始化日历
 		 * @return {[type]} [description]
 		 */
 		_initCalendar: function(){
 			var
 				that = this;

 			S.each(query('.date'),function(i){
				Calendar.client({
					renderTo: i, //默认只获取第一个
	                select: {
	                    rangeSelect: false, //是否允许区间选择
	                    dateFmt: 'YYYY-MM-DD',
	                    showTime: false //是否显示时间
	                }
				});
			});
 		},
 		/**
 		 * 初始化全选
 		 * @return {[type]} [description]
 		 */
 		_selectAll: function(){
			var
				that = this;

			Selectall.client({
				root: el.searchForm,
                select: el.bigTagTrigger,
                toggleTrigger: el.selectAllTrigger
			});
		},
 		/**
 		 * 重新加载分页
 		 * @return {[type]} [description]
 		 */
 		_reloadPagi: function(){
 			var
 				that = this,
 				extraParam = DOM.serialize(el.searchForm),
 				opts = S.mix(that.opts, {
 					extraParam: extraParam
 				});

 			that.pagination.reload(opts);
 		},
 		/**
 		 * 便捷搜索
 		 * @param  {[type]} e [description]
 		 * @return {[type]}   [description]
 		 */
 		_fastSearch: function(e){
 			var
 				that = this,
 				startTime = DOM.attr(e, DATA_START_TIME),
 				endTime = DOM.attr(e, DATA_END_TIME),
 				extraParam,
 				opts;

 			DOM.val(el.startTimeEl, startTime);
 			DOM.val(el.endTimeEl, endTime);
 			extraParam = DOM.serialize(el.searchForm);
 			opts = S.mix(that.opts, {
 				extraParam: extraParam
 			});
 			that.pagination.reload(opts);
 		},
 		/**
 		 * 导出Excel表格
 		 * @param  {[type]} e [description]
 		 * @return {[type]}   [description]
 		 */
 		_export: function(e){
 			var
 				that = this,
 				href = DOM.attr(e, "href").split('?')[0],
 				extraParam = S.IO.serialize(el.searchForm),
 				newHref = href + '?' + extraParam;

 			DOM.attr(e, "href", newHref);
 		}
 	});
 	return Core;
 }, {
 	requires: [
 		'mod/selectall',
 		'mod/calendar',
 		'mod/pagination',
 		'mod/juicer'
 	]
 });