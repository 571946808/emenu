/*-----------------------------------------------------------------------------
* @Description:     后台管理-用户信息管理-会员管理消费详情
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.10.24
* ==NOTES:=============================================
* v1.0.0(2015.10.24):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-management-consumption-details', function(S, Consumption){
	PW.namespace('page.VipManagement.VipManagementConsumptionDetails');
	PW.page.VipManagement.VipManagementConsumptionDetails = function(param){
		new Consumption(param);
	}
},{
	requires: [
		'vip-management-consume-details/consume'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('vip-management-consume-details/consume', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,     
        Pagination = PW.mod.Pagination,  
        Calendar = PW.mod.Calendar,
        config = {},
        el = {     
        	//表单
        	searchForm: '.J_searchForm',
        	//partyId元素
        	partyIdEl: '.J_partyId'
        };

	function Consumption(param){
		this.opts = S.merge(config, param);
		this.pagination;
		this._init();
	}

	S.augment(Consumption, {
		_init: function(){
			this._pagination();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
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

			on(el.searchForm,"submit",function(){
				that._reloadPagi();
                return false;
            });
		},
		/**
		 * 分页实现
		 * @return {[type]} [description]
		 */
		_pagination: function(){
			var
				that = this,
				opts = S.mix(that.opts, {
					extraParam:{
						partyId: DOM.val(el.partyIdEl)
					}
				});

			that.pagination = Pagination.client(opts);
		},
		/**
		 * 重新刷新分页
		 * @return {[type]} [description]
		 */
		_reloadPagi: function(){
			var
				that = this,
				info = DOM.serialize(el.searchForm);
				opts = S.mix(that.opts, {extraParam:info});

			that.pagination.reload(opts);
		}
	});
	return Consumption;
},{
	requires: [
		'mod/pagination',
		'mod/calendar'
	]
});