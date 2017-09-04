/*-----------------------------------------------------------------------------
 * @Description:     营业分析--菜品大类销售排行
 * @Version:         2.0.0
 * @author:          yud(862669640@qq.com)
 * @date             2016.07.27
 * ==NOTES:=============================================
 * v1.0.0(2016.07.27):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
 
 KISSY.add('page/business-analysis/dish-bigtag-sales-ranking', function(S,List){
 	PW.namespace('page.BusinessAnalysis.DishBigtagSalesRanking');
 	PW.page.BusinessAnalysis.DishBigtagSalesRanking = function(param){
 		new List(param);
 	}
 },{
 	requires: [
        'dish-bigtag-sales-ranking/list'
    ]
 });
/*---------------------------------------------------------------------------*/

KISSY.add('dish-bigtag-sales-ranking/list', function(S){
	var 
 		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
 		on = S.Event.on,
 		TablePagi = PW.widget.TablePagi,
 		Calendar = PW.mod.Calendar,
 		config = {},
 		el = {
            //搜索表单
            searchForm: ".J_searchForm",
            //搜索触发器
            searchTrigger: '.J_search',
            //导出触发器
            exportTrigger: '.J_export',
            // 快捷时间搜索
            shortCutEl: '.J_shortcut',
            // 开始时间
            startTimeEl: '.J_startTime',
            // 结束时间
            endTimeEl: '.J_endTime'
 		},
 		DATA_START_TIME = 'data-start-time',
        DATA_END_TIME = 'data-end-time';

    function List(param){
		this.opts = S.merge(config, param);
		this._init();
		this.pagination;
	}

    S.augment(List, {
        _init: function(){
            this._bulidEvt();
            this._initPagi();
            this._initDate();
        },
        _bulidEvt: function(){
            var that = this;
            //导出excel表
            $(el.exportTrigger).on('click', function(){
                that._exportExcel();
            });
            // 点击本月/上月等按钮进行快速搜索
            $(el.shortCutEl).on('click', function(){
                that._fastSearch(this);
            });
        },
        /**
         * 初始化分页
         * @private
         */
        // _initPagi: function(){
        //     var 
        //         that = this,
        //         startTime = DOM.val(el.startTimeEl),
        //         endTime = DOM.val(el.endTimeEl);

        //     S.mix(that.opts,{
        //         extraParam: {
        //             startTime: startTime,
        //             endTime: endTime,
        //         }
        //     });
        //     that.pagination = Pagination.client(that.opts);
        // },
        /**
         * 点击排行按钮刷新分页
         * @return {[type]} [description]
         */
        _initPagi: function(){
            var that = this;

            that.pagination = TablePagi.client({
                pagi: that.opts,
                formSet: {
                    hasForm: true,
                    formRender: el.searchForm
                }
            });
        },
        /**
         * 导出Excel表
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
         * 快速搜索
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _fastSearch: function(e){
            var
                that = this,
                startTime = DOM.attr(e, DATA_START_TIME),
                endTime = DOM.attr(e, DATA_END_TIME),
                data = DOM.serialize(el.searchForm);

            that._renderCalendar(startTime, endTime);
            S.mix(data, {
                startTime: startTime,
                endTime: endTime
            });
            that.pagination.reloadPagi(S.mix(that.opts, {
                extraParam: data
            }));
        },
        /**
         * 渲染时间段
         * @param  {[type]} startTime [description]
         * @param  {[type]} endTime   [description]
         * @return {[type]}           [description]
         */
        _renderCalendar: function(startTime, endTime){
            var
                that = this;

            DOM.val(el.startTimeEl, startTime);
            DOM.val(el.endTimeEl, endTime);
        },
        /**
         * 选中默认的时间段
         * @return {[type]} [description]
         */
        _initDate: function(){
            var
                that = this,
                startTime = DOM.attr(el.startTimeEl, DATA_START_TIME),
                endTime = DOM.attr(el.endTimeEl, DATA_END_TIME);

            Calendar.client({
                renderTo: el.startTimeEl,
                select: {
                    selected: startTime,
                    showTime: false
                }
            });
            Calendar.client({
                renderTo: el.endTimeEl,
                select: {
                    selected: endTime,
                    showTime: false
                }

            });
        }
    });
    return List;
},{
    requires: [
        'mod/calendar',
        'widget/tablePagi'
    ]
});


