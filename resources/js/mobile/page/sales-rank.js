/*-----------------------------------------------------------------------------
 * @Description:     销量排行
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.06.02
 * ==NOTES:=============================================
 * v1.0.0(2016.06.02):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/sales-rank', function(S, Order, Core){
	PW.namespace('page.SalesRank');
	PW.page.SalesRank = function(param){
		new Core(param);
		new Order();
	}
},{
	requires: [
		'sales-rank/order',
		'sales-rank/core'
	]
});
/**
 * 顾客点“点餐”的相关操作
 */
KISSY.add('sales-rank/order', function(S, Common){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		fire = S.Event.fire,
		SalesRankIO = PW.io.SalesRank,
		el = {
			//菜品列表
			dishListEl: '.dish-list',
			//点餐触发器
			addDishTrigger: '.J_addDishTrigger',
			//菜品数量
			dishNumberEl: '.J_dishNumber',
			//菜品总数量
			dishTotalNumberEl: '.J_dishTotalNumber',
			//页脚--“我的订单”触发器
			myOrderEl: '.J_myOrder'
		},
		//菜品数量
		DATA_DISH_NUMBER = 'data-dish-number',
		//菜品的总数量
		DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number',
		//菜品id
		DATA_DISH_ID = 'data-dish-id';

	function Order(){
		this.common = new Common();
		this._init();
	}

	S.augment(Order, {
		_init: function(){
			//如果菜品已经点过，则显示对应的数量
			this.common.showDishNumber('body');
			this._addEventListner();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListner: function(){
			var
				that = this,
				common = that.common;

			delegate(document, 'click', el.addDishTrigger, function(e){
				that._addDish(e);
			});

			common.on('promptUser', function(e){
				common.promptUser();
			});
		},
		/**
		 * 添加菜品，发送ajax
		 * @param {[type]} e [description]
		 */
		_addDish: function(e){
			var
				that = this,
				target = e.currentTarget,
				dishEl = DOM.parent(target, '.dish'),
				dishId = DOM.attr(dishEl, DATA_DISH_ID),
				info = {
					dishId: dishId
				};

			SalesRankIO.sendDishInfo(info, function(rs,errMsg){
				if(rs){
					that._renderDishNumber(target);
					that._renderDishTotalNumber();
				}else{
					Dialog.alert(errMsg);
				}
			});
		},
		/**
		 * 渲染所点菜品的数量
		 * @param  {[type]} target [description]
		 * @return {[type]}        [description]
		 */
		_renderDishNumber: function(target){
			var
				that = this
				numberEl = get(el.dishNumberEl, target),
				number = DOM.text(numberEl),
				dishNumber = number == '' ? 1 : parseInt(number) + 1;

			DOM.removeClass(numberEl, 'hidden');
			DOM.text(numberEl, dishNumber);
			DOM.attr(target, DATA_DISH_NUMBER, dishNumber);
		},
		/**
		 * 渲染“我的订单”的菜品总数
		 * @return {[type]} [description]
		 */
		_renderDishTotalNumber: function(){
			var
				that = this,
				totalNumber = DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER),
				common = that.common;

			if(totalNumber != ''){
				totalNumber = parseInt(totalNumber) + 1;
				DOM.text(el.dishTotalNumberEl, totalNumber);
				DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, totalNumber);
			}else{
				DOM.text(el.dishTotalNumberEl, 1);
				DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, 1);
			}
			//如果有点菜操作，则在“我的订单”处提示用户
			common.fire('promptUser');
		}
	});

	return Order;
},{
	requires: [
		'sales-rank/common',
		'pio/sales-rank'
	]
});
/**
 * 为您推荐的核心操作
 */
KISSY.add('sales-rank/core', function(S, Common){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, fire = S.Event.fire,
		SalesRankIO = PW.io.SalesRank,
        Juicer = PW.mod.Juicer.client,
		ImageLazyLoad = PW.module.ImageLazyLoad,
		core = {},
		el = {
			//菜品容器
			dishListEl: '.dish-list',
			//菜品模板
			dishTemp: '#dishTpl',
			//上拉加载容器
			pullUpEl: '#pullUp',
			//上拉加载标签
			pullUpLabel: '.pullUpLabel',
			//加载元素
			loaderEl: '.loader'
		},
		Tip = ['亲，您已经看完了！'];

	function Core(param){
		S.mix(core, {
			page: 0,
			common: new Common()
		});
		this._init();
	}

	S.augment(Core, {
		_init: function(){
			this._initIscroll();
			this._load();
			this._addEventListner();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListner: function(){
			var
				that = this,
				common = core.common;

			//为common对象绑定showDishNumber事件
			common.on('showDishNumber',function(){
				common.showDishNumber(el.dishListEl);
			});
		},
		/**
		 * 初始化滚动条
		 * @return {[type]} [description]
		 */
		_initIscroll: function(){
			var
				that = this;

			//滚动条对象
			that.iscroll = PW.module.Iscroll.client({
				//滚动条所包括的范围
				id: 'wrapper',
				pullDownAction: that._refresh,
				pullUpAction: that._load,
				//除了li之外，其他也要加载到滚动内容中的节点
				extraNode: [],
				//是否懒加载
				isLazyLoad: true,
				//参与懒加载的节点class
				lazyLoadRenderTo: 'lazy-load'
			}).iscroll;
		},
		/**
		 * 下拉操作，页面刷新
		 * @return {[type]} [description]
		 */
		_refresh: function(){
			var
				that = this;

			window.location.reload();
		},
		/**
		 * 上拉操作，发送请求
		 * @return {[type]} [description]
		 */
		_load: function(){
			var
				that = this,
				common = core.common,
				page = core.page,
                iscroll = this.iscroll,
				dishTemp,
				DishStr,
				dishDOM,
				info;

			S.mix(core, {
				page: page + 1
			});

			info = {
				page: core.page,
				pageSize: 10
			}
			//发送ajax
			SalesRankIO.getSalesRankDishList(info, function(rs, list, errMsg){
				if(rs){
					dishTemp = DOM.html(el.dishTemp);
					DishStr = Juicer(dishTemp, {
						list: list
					});
					dishDOM = DOM.create(DishStr);
					DOM.append(dishDOM, el.dishListEl);
					ImageLazyLoad.client({
						renderTo: '.lazy-load',
						container: '.dish-list'
					});
					//若新添加的菜品有被点过，则显示数量
					common.fire('showDishNumber');
                    iscroll.refresh();
				}else{
					pullUpEl = get(el.pullUpEl, 'body'),
					pullUpLabel = get(el.pullUpLabel, pullUpEl),
					loaderEl = get(el.loaderEl, pullUpEl);

					DOM.css(loaderEl, 'display', 'none');
					DOM.removeClass(pullUpEl, 'loading');
					DOM.text(pullUpLabel, Tip[0]);
				}
			});
		}
	});

	return Core;
},{
	requires: [
		'sales-rank/common',
		'module/iscroll',
		'module/image-lazy-load',
        'mod/juicer',
		'pio/sales-rank',
		'core'
	]
});
/**
 * 公共部分
 */
KISSY.add('sales-rank/common', function(S){
	var
		DOM = S.DOM,
		get = DOM.get,
		query = DOM.query,
		on = S.Event.on,
		el = {
			//菜品容器
			dishListEl: '.dish-list',
			//点餐触发器
			addDishTrigger: '.J_addDishTrigger',
			//菜品数量
			dishNumberEl: '.J_dishNumber',
			//我的订单
			myOrderEl: '.J_myOrder',
			//菜品总数量
			dishTotalNumberEl: '.J_dishTotalNumber'
		},
		DATA_DISH_NUMBER = 'data-dish-number',
		DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number';

	function Common(){
		this._init();
	}

	S.augment(Common, S.EventTarget, {
		_init: function(){},
		/**
		 * 若菜品被点过，则显示出已点的数量
		 * @param  {[type]} container [description]
		 * @return {[type]}           [description]
		 */
		showDishNumber: function(container){
			var
				that = this,
				addDishEl = query(el.addDishTrigger, container),
				numberEl,
				number;

			S.each(addDishEl, function(elem){
				number = DOM.attr(elem, DATA_DISH_NUMBER);
				if(number != ''){
					numberEl = get(el.dishNumberEl, elem);
					DOM.removeClass(numberEl, 'hidden');
					DOM.text(numberEl, number);
				}
			});
		},
		/**
		 * 提醒顾客，“我的订单”里有已点的菜品
		 * @return {[type]} [description]
		 */
		promptUser: function(){
			var
				that = this;

			DOM.addClass(el.myOrderEl, 'in');
			DOM.removeClass(el.dishTotalNumberEl, 'hidden')
		}
	});

	return Common;
},{
	requires: [
		'core'
	]
});