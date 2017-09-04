/*-----------------------------------------------------------------------------
 * @Description:     营业分析--账单稽核
 * @Version:         2.0.0
 * @author:          yud(862669640@qq.com)
 * @date             2016.08.01
 * ==NOTES:=============================================
 * v1.0.0(2016.08.01):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
 
 KISSY.add('page/statistics/bill-audit', function(S, List){
 	PW.namespace('page.Statistics.BillAudit');
 	PW.page.Statistics.BillAudit = function(param){
 		new List(param);
 	}
 },{
 	requires: [
        'bill-audit/list'
    ]
});

/*---------------------------------------------------------------------------*/

KISSY.add('bill-audit/list', function(S){
	var 
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, 
        Pagination = PW.mod.Pagination,  Juicer = PW.mod.Juicer,
        Calendar = PW.mod.Calendar,
        Dialog = PW.widget.Dialog,
        BillAuditSumIO = PW.io.Statistics.BillAuditSum,
        config = {},
        el = {
        	//开始时间
        	startTimeEl: '.J_startTime',
        	//结束时间
        	endTimeEl: '.J_endTime',
        	//搜索表单
            searchForm: ".J_searchForm",
             //搜索触发器
            searchTrigger: '.J_search',
            //导出触发器
            exportTrigger: '.J_export',
            // 快捷时间搜索
            shortCutEl: '.J_shortcut',
            //渲染模板
            renderTpl: '#renderSumTpl',
            //数据渲染位置
            dataRender: '#dataRenderSum'
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
    		this._initDate();
    		this._bulidEvt();
    		this._initPagi();
    	},
    	_bulidEvt: function(){
			var that = this;

            //导出excel表
            $(el.exportTrigger).on('click', function(){
                that._exportExcel();
            });
            // 点击本月/上月等按钮进行快速搜索
            $(el.shortCutEl).on('click', function(e){
                that._fastSearch(e.target);
                that._sendAjax();
            });
            //点击搜索
            $(el.searchTrigger).on('click', function(){
                that._reloadPagi();
                that._sendAjax();
                return false;
            });
		},
		/**
         * 初始化分页
         * @private
         */
        _initPagi: function(){        
            var 
                that = this,
                startTime = DOM.val(el.startTimeEl),
                endTime = DOM.val(el.endTimeEl);

            S.mix(that.opts,{
                extraParam: {
                    startTime: startTime,
                    endTime: endTime
                }
            });
            that.pagination = Pagination.client(that.opts);
            that._sendAjax();
        },
    	/**
	     * 选中默认的时间段
	     * @return {[type]} [description]
	     */
	    _initDate: function(){	
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
         * 快速搜索
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
            data = DOM.serialize(el.searchForm);
            opts = S.mix(that.opts, {
                extraParam: data
            });
            that.pagination.reload(opts);
        },
        /**
         * 点击搜索，刷新分页
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _reloadPagi: function(){
            var
                that = this,
                data = DOM.serialize(el.searchForm);

            that.pagination.reload(
                S.mix(that.opts, {
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
         * 点击搜索按钮，发送ajax请求
         * @return {[type]} [description]
         */
        _sendAjax: function(){
            var
                that = this,
                info = DOM.serialize(el.searchForm);

            BillAuditSumIO.billAuditSum(info, function(rs,data,errMsg){
                if(rs){
                    that._renderData(data);
                }else{
                    Dialog.alert(errMsg);
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
                renderTemp = $(el.renderTpl).html(),
                renderStr = Juicer.client(renderTemp, {
                    data: data 
                });
            $(el.dataRender).html(renderStr);
        }
    });
    return List;
},{
	requires: [
        'mod/calendar',
        'mod/pagination',
        'mod/juicer',
        'widget/dialog',
        'pio/statistics/bill-audit'
    ]
});