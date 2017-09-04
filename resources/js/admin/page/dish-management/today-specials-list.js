/*-----------------------------------------------------------------------------
* @Description:     菜品管理-今日特价-列表
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.11.24
* ==NOTES:=============================================
* v1.0.0(2015.11.24):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/dish-management/today-specials-list', function(S, List){
	PW.namespace('page.DishManagement.TodaySpecialsList');
	PW.page.DishManagement.TodaySpecialsList = function(param){
		new List(param);
	}
}, {
	requires: [
		'today-specials/list'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('today-specials/list', function(S){
	var 
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		on = S.Event.on, delegate = S.delegate,
		Dialog = PW.widget.Dialog,
		TodaySpecialsIO = PW.io.DishManagement,
		config = {},
		el = {
			//撤销触发器
			revoteTrigger: '.J_revoke'
		},
		DATA_DISH_ID = 'data-dish-id',
		TIP = [
			'确定要删除此菜品吗？',
			'删除成功！',
			'删除失败！'
		];

	function List(param){
		this.opts = S.merge(config, param);
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

			on(el.revoteTrigger, 'click', function(e){
				that._revokeDish(e.target);
			});
		},
		/**
		 * 点击撤销按钮时，发送当前菜品id，若成功，则在页面中删除此菜品
		 * @param  {[type]} ev [description]
		 * @return {[type]}    [description]
		 */
		_revokeDish: function(ev){
			var
				that = this,
				tr = DOM.parent(ev, 2),
				id = $(tr).attr(DATA_DISH_ID),
				info = {
					id: id
				};

			Dialog.confirm(TIP[0], function(){
				TodaySpecialsIO.revoteSpecials(info, function(rs,errMsg){
					if(rs){
						DOM.remove(tr);
						Dialog.alert(TIP[1]);
					}else{
						Dialog.alert(TIP[2]);
					}
				});
			});
		}
	});
	return List;
}, {
	requires: [
		'widget/dialog',
		'pio/dish-management/today-specials'
	]
});