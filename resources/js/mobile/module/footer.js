/*-----------------------------------------------------------------------------
 * @Description:     尾部相关操作
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.22
 * ==NOTES:=============================================
 * v1.0.0(2016.01.22):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('module/footer', function(S, Core){
    var
        Footer = {
            client: function(){
                new Core();
            }
        };

    S.ready(function(){
        Footer.client();
    });
    PW.namespace('module.Footer');
    PW.module.Footer = Footer;
    return Footer;
},{
    requires: [
        'footer/core'
    ]
});

KISSY.add('footer/core', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        commonIO = PW.io.Common,
        Cover = PW.page.Cover,
        el = {
            // 菜单触发器
            menuTrigger: '.J_subMenuListTrigger',
            // 子菜单
            subMenuListEl: '.J_subMenuList',
            //获取呼叫列表触发器
            getServiceTrigger: '.J_getServiceList',
            //呼叫服务触发器,li元素,
            callServiceTrigger: '.J_callService',
            //存放tableId的隐藏input，后端后期做session时可能会去掉这个，暂时模拟
            tableIdInp: '.J_tableId'
        };

    function Core(){
        this.common = PW.module.Common.promptUser();
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this.common.initPromptUser();
            this._initPosition();
            this._buildEvt();
        },
        _initPosition: function(){
            var
                that = this,
                subMenuListEl = query(el.subMenuListEl, '.footer'),
                lis,
                length,
                bottom;

            S.each(subMenuListEl, function(subMenu){
                lis = query('li', subMenu);
                length = lis.length;
                bottom = -Math.round(54/75*length) + 'rem';
                DOM.css(subMenu, {bottom: bottom});
                DOM.attr(subMenu, 'data-bottom', bottom);
            });
        },
        _buildEvt: function(){
            var
                that = this;

            on(el.menuTrigger, 'tap', function(e){
                e.stopPropagation();
                that._foldMenu(this);
                that._toggleMenu(this);
            });

            on(document, 'tap', function(){
                that._foldAllMenu();
                that._removeClass();
            });

            on(el.getServiceTrigger, 'tap', function(e){
                e.stopPropagation();
                that._getServiceList(e.currentTarget);
            })
            delegate(el.getServiceTrigger, 'tap', el.callServiceTrigger,  function(e){
                e.stopPropagation();
                that._callService(e.currentTarget);
            })
        },
        _removeClass: function(){
            var
                that = this,
                activeMenuTrigger = get(el.menuTrigger, '.footer');

            DOM.removeClass(activeMenuTrigger, 'active');
        },
        _foldAllMenu: function(){
            var
                that = this,
                subMenuEl = query(el.subMenuListEl),
                bottom;

            S.each(subMenuEl, function(menu){
                bottom = DOM.attr(menu, 'data-bottom');
                DOM.css(menu, {bottom: bottom});
            });

        },
        _foldMenu: function(target){
            var
                otherMenuTrigger = $(target).siblings(),
                subMenuEl,
                bottom;
            S.each(otherMenuTrigger, function(menuTrigger){
                subMenuEl = get(el.subMenuListEl, menuTrigger);
                bottom = DOM.attr(subMenuEl, 'data-bottom');
                if(DOM.hasClass(menuTrigger, 'active')){
                    DOM.removeClass(menuTrigger, 'active');
                    if(subMenuEl != null){
                        DOM.removeClass(subMenuEl, 'in');
                        DOM.css(subMenuEl, {bottom: bottom});
                    }
                }
            });
        },
        _toggleMenu: function(target){
            var
                that = this,
                subMenuEl = get(el.subMenuListEl, target),
                isOpen = DOM.hasClass(target, 'active') ? true : false,
                bottom = DOM.attr(subMenuEl, 'data-bottom');

            if(isOpen){
                DOM.removeClass(subMenuEl, 'in');
                DOM.removeClass(target, 'active');
                DOM.css(subMenuEl, {bottom: bottom});
            }else{
                DOM.addClass(subMenuEl, 'in');
                DOM.addClass(target, 'active');
                DOM.removeAttr(subMenuEl, 'style');
            }
        },
        /**
         * 获取呼叫服务列表
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _getServiceList: function(e){
            var
                that = this,
                lis = S.one(el.callServiceTrigger),
                ulEl = DOM.children(e, 'ul');
                
            if(!lis){
                commonIO.getService({}, function(rs, data, errMsg){
                    if(rs){
                        that._renderServiceList(data, ulEl);
                    }else{
                        Dialog.alert(errMsg);
                    }
                })
            }
        },
        /**
         * 渲染呼叫服务列表
         * @param  {[type]} data [description]
         * @param  {[type]} ul   [description]
         * @return {[type]}      [description]
         */
        _renderServiceList: function(data, ul){
            var 
                that = this,
                newLis = '',
                bottom = -Math.round(54/75*data.length) + 'rem';

            S.each(data, function(item){
                newLis += '<li class="J_callService">'+item.name+'</li>';
            });
            $(ul).append(newLis);
            DOM.attr(ul,'data-bottom', bottom);
        },
        /**
         * 呼叫服务
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _callService: function(e){
            var
                that = this,
                tableId = $(el.tableIdInp).val(),
                name = S.trim($(e).text()),
                ul = DOM.parent(e, 'ul'),
                menuLi = DOM.parent(ul,'li'),
                bottom = DOM.attr(ul, 'data-bottom');

            commonIO.callService({tableId:tableId, name:name}, function(rs,errMsg){
                if(rs){
                    Cover.client();
                    //菜单收回
                    DOM.removeClass(ul, 'in');
                    DOM.removeClass(menuLi, 'active');
                    DOM.css(ul, {bottom: bottom});
                }else{
                    Dialog.alert(errMsg);
                }
            });
        }
    });
    return Core;
},{
    requires: [
        'module/common',
        'core',
        'pio/common',
        'module/cover'
    ]
});