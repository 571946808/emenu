/*-----------------------------------------------------------------------------
* @Description:     header.js
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.10
* ==NOTES:=============================================
* v1.0.0(2015.9.10):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('module/header', function(S, Menu, Admin){
	PW.namespace('module.header');
	PW.module.header = function(){
        new Menu();
		new Admin();
	}	
},{
	requires: [
		'header/menu',
        'header/admin'
	]
});
/**
 * 上方导航栏--管理员部分
 * @param  {[type]} S){                       var        DOM [description]
 * @param  {[type]} _bulidEvt: function(){                   var                          that [description]
 * @return {[type]}            [description]
 */
KISSY.add('header/admin', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, next = DOM.next,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        el = {
            // 管理员
            adminEl: '.J_adminInfo',
            // 管理员横向导航
            adminNav: '.J_admin_nav'

        };
    function Admin(){
        this._init();
    }

    S.augment(Admin, {
        _init: function(){
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
            on(el.adminEl, 'mouseenter', function(){
                that._hiddenMenu();
                that._showAdminInfo();
            });
            on(el.adminEl + '+ul', 'mouseleave', function(){
                that._hiddenAdminInfo();
            });
            on('.holder', 'mouseenter', function(){
            	that._hiddenMenu();
            });
        },
        _hiddenMenu: function(){
            var
                that = this;
            DOM.css('.menu-list + ul', 'display', 'none');
        },
        _foldAdminInfo: function(){
            var
                that = this,
                infoTrigger = get(el.adminEl, el.adminNav),
                infoEl = next(infoTrigger);
            if(DOM.css(infoEl, 'display') == 'block'){
                DOM.css(infoEl, 'display', 'none');
            }
        },
        _hiddenAdminInfo: function(){
            var
                that = this,
                infoTrigger = get(el.adminEl, el.adminNav),
                infoEl = next(infoTrigger);
            DOM.css(infoEl, 'display', 'none');
        },
        _showAdminInfo: function(){
            var
                that = this,
                infoTrigger = get(el.adminEl, el.adminNav),
                infoEl = next(infoTrigger);
            DOM.css(infoEl, 'display', 'block');
        }
    });
    return Admin;
});
/**
 * 菜单的管理
 * 1.点击上方导航栏可修改侧边栏，这里不需要后端的参与
 * 2.如果侧边栏有active的li，就在加载页面时直接打开
 * @param  {[type]} S){    var        DOM [description]
 * @param  {String} DATA_MENU_ID  [description]
 * @return {[type]}               [description]
 */
KISSY.add('header/menu', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, next = DOM.next,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        el = {
            // 横向导航
        	layer_1_menuEl: '.J_layer_1_menu',
            // 横向导航对应的子菜单
        	menuEl: '.J_menu',
        	// 侧边栏菜单
        	firstMenuEl: '.J_firstMenu',
        	// 管理员横向导航
        	adminNav: '.J_admin_nav'
        },
        DATA_MENU_ID = 'data-menu-id';

    function Menu(){
    	this._init();
    }

    S.augment(Menu, {
    	_init: function(){
            // 如果有展开项，加载页面时就展开
            this._unfoldMenu();
    		this._bulidEvt();
    	},
    	_bulidEvt: function(){
    		var
    			that = this;
    		on(el.layer_1_menuEl, 'click', function(e){
                // 隐藏侧边栏导航的菜单
    			that._hiddenMenu();
                // 根据选择的横向导航，渲染侧边栏的菜单
    			that._renderMenu(e.target);
    		});
            // 鼠标移入横向菜单时，显示对应横向导航的子菜单
    		$(el.layer_1_menuEl).on('mouseenter', function(e){
                // 隐藏横向导航子菜单
    			that._hideSubMenu();
                // 显示横向导航对应的子菜单
    			that._showSubMenu(e.target);
    		});
            $(el.layer_1_menuEl + ' + ul').on('mouseleave', function(){
                // 鼠标离开横向导航时，隐藏横向导航子菜单
                DOM.css(this, 'display', 'none');
            });
            $('.admin-nav').on('mouseleave', function(){
                that._hideSubMenu();
            });
            // 为隐藏横向子菜单做的补充
            $('.menu-list-logo').on('mouseenter', function(){
                DOM.css('.arrow', 'display', 'none');
            });
            // 三级菜单的折叠操作
            on('.sidebar > li > ul > li > a', 'click', function(){
                that._toggleThirdMenu(this);
            });
    	},
        _toggleThirdMenu: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                menu = DOM.get('ul', li);
            if(menu){
                if(DOM.hasClass(li, 'open')){
                    DOM.addClass(menu, 'hidden');
                    DOM.removeClass(li, 'open');
                    DOM.removeClass(li, 'active');
                }else{
                    DOM.removeClass(menu, 'hidden');
                    DOM.addClass(li, 'open');
                    DOM.addClass(li, 'active');
                }
            }
        },
        _unfoldMenu: function(){
            var
                that = this,
                activeSidebarLi = $('.sidebar' + '> li > ul > li'),
                item,
                parentDOM;
            for(var i = 0; i < activeSidebarLi.length; i ++){
                item = activeSidebarLi[i];
                if(DOM.hasClass(item, 'active')){
                    parentDOM = DOM.parent(item, 'li');
                    DOM.removeClass(parentDOM, 'hidden');
                    that._unfoldThirdMenu(item);
                    DOM.addClass(item, 'open');
                    break;
                }
            }
        },
        _unfoldThirdMenu: function(item){
            var
                that = this,
                lis = $(item).siblings(),
                li,
                menu;
            for(var i = 0; i < lis.length; i ++){
                li = lis[i];
                menu = DOM.get('ul', li);
                if(menu){
                    DOM.addClass(menu, 'hidden'); 
                    DOM.removeClass(li, 'active');
                }
            }
        },
    	_hideSubMenu: function(){
    		var
    			that = this,
    			layer_1_menuEl = query('.menu-list + ul');
    		DOM.css(layer_1_menuEl, 'display', 'none');
    	},
    	_showSubMenu: function(e){
    		var
    			that = this,
    			nextMenu = DOM.next(e);
    		DOM.css(nextMenu, 'display', 'block');
    	},
    	_hiddenMenu: function(){
    		var
    			that = this,
    			menuEl = query(el.firstMenuEl);
    		DOM.addClass('.sidebar > li', 'hidden');
    	},
    	_renderMenu: function(e){
    		var
    			that = this,
    			id = DOM.attr(e, DATA_MENU_ID),
    			parentEl = DOM.parent(e),
    			layer_1_menuEl = query(el.adminNav + ' > ul > li');
    		DOM.removeClass('#firstMenu' + id, 'hidden');
    		DOM.removeClass(layer_1_menuEl, 'active');
    		DOM.addClass(parentEl, 'active');
    	}
    });
    return Menu;
},{
	requires: [
		'core'
	]
});