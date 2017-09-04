/*-----------------------------------------------------------------------------
* @Description:     后台管理-库存管理-存放点管理-列表
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.11.19
* ==NOTES:=============================================
* v1.0.0(2015.11.19):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add("page/store-management/depot-management-list", function(S,List){
	PW.namespace("page.StoreManagement.DepotManagementList");
	PW.page.StoreManagement.DepotManagementList = function(param){
		new List(param);
	}
},{
	requires: [
		'depot-management/list'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add("depot-management/list", function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.Event.delegate,
		DelDepotIO = PW.io.StoreManagement.DepotManagement,
		Dialog = PW.widget.Dialog,
		config = {},
		el = {
			//删除触发器
			delTrigger: '.J_del',
			//提示元素
			tipEl: '.J_tip'
		},
		DATA_DEPOT_ID = "data-depot-id",
		TIP = [
			'确定删除此存放点吗？',
			'删除成功！',
			'删除失败！'
		];

	function List(param){
		this.opts = S.merge(config, param);
		this._hideTip();
		this._init();
	}

	S.augment(List, {
		_init: function(){
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			on(el.delTrigger, 'click', function(e){
				that._delDepot(e.target);
			});
		},
		/**
		 * 隐藏提示
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
		 * 删除存放点
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_delDepot: function(ev){
			var
				that = this,
				tr = $(ev).parent('tr'),
				id = tr.attr(DATA_DEPOT_ID),
				info = {
					id: id
				};

			Dialog.confirm(TIP[0],function(){
				DelDepotIO.delDepot(info, function(rs,errMsg){
					if(rs){
						Dialog.alert(TIP[1]);
						DOM.remove(tr);
					}else{
						Dialog.alert(TIP[2]);
					}
				});
			});
		}
	});
	return List;
},{
	requires: [
		'widget/dialog',
		'pio/store-management/depot-management'
	]
});