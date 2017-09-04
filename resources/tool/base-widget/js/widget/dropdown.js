/*-----------------------------------------------------------------------------
* @Description:     管理员-悬浮显示下拉菜单
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.12
* ==NOTES:=============================================
* v1.0.0(2015.9.12):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('widget/dropdown', function(S, Core){
	PW.namespace('widget.Dropdown');
	var
		DOM = S.DOM, query = DOM.query, 
		el = {
			dropdownTrigger: '.dropdown'
		},
		DATA_DROPDOWN_KEY = 'data-dropdown-key',
		DATA_DROPDOWN_BOX = 'data-dropdown-box',
		DATA_DROPDOWN_EVT = 'data-dropdown-evt',
		Dropdown = {
			client: function(param){
				var
					that = this;
				
				new Core(param);
			},
			refresh: function(){
				var
					that = this;
				S.each(query(el.dropdownTrigger), function(o){
					DOM.data(o, DATA_DROPDOWN_KEY, that.client({
						triggerEl: o,
						menuEl: '#' + DOM.attr(o, DATA_DROPDOWN_BOX),
						showEvt: DOM.attr(o, DATA_DROPDOWN_EVT)
					}));
				});
			}
		};
	S.ready(function(){
		Dropdown.refresh();
	});
	PW.widget.Dropdown = Dropdown;
},{
	requires: [
		'dropdown/core'
	]
});
KISSY.add('dropdown/core', function(S){
	var
		DOM = S.DOM, on = S.Event.on,
		config = {},
		el = {
			dropdownTrigger: '.dropdown'
		},
		DATA_DROPDOWN_KEY = 'data-dropdown-key',
		DATA_DROPDOWN_BOX = 'data-dropdown-box',
		DATA_DROPDOWN_EVT = 'data-dropdown-evt',
		OPEN = 'open';

	function Core(param){
		this.opts = S.merge(config, param);
		// 是否进入菜单
		this.display = 0;
		// 是否触发（进入）触发器
		this.flag = 0;
		this._init();
	}
	S.augment(Core, {
		_init: function(){
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				showEvt = that.opts.showEvt,
				menuEl = that.opts.menuEl;
			if(showEvt == 'click'){
				on(document, showEvt, function(e){
					that._toggleClick(e.target);
					e.stopPropagation();
				});
			}
			if(showEvt == 'hover'){
				on(triggerEl, 'mouseenter', that._triggerMouseEnterHandler, that);
				on(triggerEl, 'mouseleave', that._triggerMouseLeaveHandler, that);
				on(menuEl, 'mouseenter', that._menuMouseEnterHandler, that);
				on(menuEl, 'mouseleave', that._menuMouseLeaveHandler, that);
			}
		},
		_triggerMouseEnterHandler: function(){
			var
				that = this;
			that.flag = 1;
			that._showMenu();
		},
		_triggerMouseLeaveHandler: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				showEvt = that.opts.showEvt,
				menuEl = that.opts.menuEl;
			S.later(function(){
				if(that.display == 0 && that.flag == 1){
					that._hideMenu();
					that.flag = 0;
				}
				if(that.display == 1 && that.flag == 1){
					$(menuEl).show();
					that.flag = 0;
				}
			}, 1000);
		},
		_menuMouseEnterHandler: function(){
			var
				that = this;
			that.display = 1;
		},
		_menuMouseLeaveHandler: function(){
			var
				that = this,
				triggerEl = that.opts.triggerEl,
				showEvt = that.opts.showEvt,
				menuEl = that.opts.menuEl;;
			S.later(function(){
				if(that.display == 1 && that.flag == 0){
					that._hideMenu();
					that.display = 0;
				}
				if(that.display == 1 && that.flag == 1){
					$(this).show();
					that.display = 0;
				}
			}, 1000);
		},
		_hideMenu: function(e){
			var
				that = this,
				menuEl = that.opts.menuEl,
				triggerEl = DOM.hasClass(e, el.dropdownTrigger);
			if(!triggerEl){
				$(menuEl).slideUp(400);
			}
		},
		_showMenu: function(e){
			var
				that = this,
				menuEl = that.opts.menuEl;
			$(menuEl).slideDown(200);
		},
		_toggleClick: function(e){
			var
				that = this,
				menuEl = this.opts.menuEl,
				isOPEN = DOM.css(menuEl, 'display'),
				triggerEl = DOM.hasClass(e, el.dropdownTrigger);
			if(isOPEN == 'none' && triggerEl == true){
				that._show();
			}else if(isOPEN == 'block'){
				that._hide();
			}
		},
		_hide: function(){
			var
				hat = this,
				menuEl = this.opts.menuEl;

			$(menuEl).slideUp(400);
		},
		_show: function(){
			var
				hat = this,
				menuEl = this.opts.menuEl;

			$(menuEl).slideDown(200);
		}
	});	

	return Core;
},{
	requires: [
	]
});