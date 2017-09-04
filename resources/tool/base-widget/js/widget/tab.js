/*-----------------------------------------------------------------------------
* @Description:     tab标签页js
* @Version:         1.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.15
* ==NOTES:=============================================
* v1.0.0(2015.9.15):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('widget/tab', function(S, Core){
	PW.namespace('widget.Tab');
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		el = {
			tabTrigger: '.tab'
		},
		DATA_TAB = 'data-tab',
		DATA_TABPANEL = 'data-tabpanel';
	var
		Tab = {
			client: function(param){
				return new Core(param);
			},
			refresh: function(){
				var
					that = this,
					tabs = query(el.tabTrigger),
					href;
				S.each(tabs, function(tab){
					href = that._bulidParam(tab);
					DOM.data(tab, DATA_TAB, that.client({
						triggerEl: tab,
						tabPanelEl: href
					}));
				});
			},
			_bulidParam: function(e){
				var	
					href = DOM.attr(e, DATA_TABPANEL);
				return href;
			}
		};

	S.ready(function(){
		Tab.refresh();
	});
	PW.widget.Tab = Tab;
	return Tab;
},{
	requires: [
		'tab/core'
	]
});

KISSY.add('tab/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		Event = S.Event, on = Event.on, delegate = Event.delegate,
		config = {},
		el = {
			tabTrigger: '.tab',
			liTrigger: '.nav-tabs > li',
			tabContentEl: '.tab-content > .tab-pane'
		},
		DATA_TABPANEL = 'data-tabpanel',
		DATA_TOGGLE = 'data-toggle',
		ACTIVE = 'active';

	function Core(param){
		this.opts = S.merge(config, param);
		this._init();
	}
	S.augment(Core, {
		_init: function(){
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl;

			on(triggerEl, 'click', function(){
				that._show(this);
			});
		},
		/**
		 * 显示标签面板内容
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_show: function(e){
			var
				that = this,
				liEl = DOM.parent(e, 'li'),
				lisEl = that._getAllli(),
				tabContentsEl = that._getAllTabPanel();
			DOM.removeClass(lisEl, ACTIVE);
			DOM.addClass(liEl, ACTIVE);
			DOM.removeClass(tabContentsEl, ACTIVE);
			DOM.addClass(that.opts.tabPanelEl, ACTIVE);
		},
		/**
		 * 获取所有标签触发器
		 * @return {[type]} [description]
		 */
		_getAllli: function(){
			var
				that = this,
				lisEl = query(el.liTrigger);
			return lisEl;
		},
		/**
		 * 获取所有标签内容面板
		 * @return {[type]} [description]
		 */
		_getAllTabPanel: function(){
			var
				that = this,
				tabContentsEl = query(el.tabContentEl);
			return tabContentsEl;
		}
	});
	return Core;
});