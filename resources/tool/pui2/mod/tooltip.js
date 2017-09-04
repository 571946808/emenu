/*-----------------------------------------------------------------------------
* @Description:     气泡提示框
* @Version:         3.0.0
* @author:          Nina(1284663246@qq.com)
* @date             2015.01.04
* ==NOTES:=============================================
* 修改代码结构，将原tooltip组件平滑升级到kissy-1.4版本
* 以下为组件各版本修改信息：
*   v1.0.0(2013-9-3):
*     初始开发tip提示类，主要目的是实现powerTip的功能
*     notice：此处解决了一个css问题，当content.text查找页面中的元素时，
*           append效果在ie7下无法隐藏。解决方案为在juicer模版中加入style隐藏，
*           而不是在css中添加隐藏，因为css的异步加载问题导致其可能在ie7下失效
*     需要考虑事件:
*           1.动画效果以及相应的自动机处理 done
*           2.鼠标移动过快延迟 done
*           3.在什么情况下允许鼠标移入到tip上，然后进行处理 done
*           4.添加title和添加删除操作
*           5.各类事件还没有添加
*           6.    ...
*       
*   解决了在host上添加data项目查找的问题
*   v1.0.1(2013-11-12):
*         修改了data设置的问题
*         修改了宿主被删除或者位置变动导致的获取位置出错的bug
*         添加getById方法
*         需要设置refresh --done
*    
*    v1.0.2（2014.5.27）:
*         新增config.styles.arrow = true|false 是否显示箭头
*         
*    v1.0.3 (2014.11.10): 
*        by wangjing: 添加了disable和enable两个方法的实现，支持某一个tip的显示与隐藏
* ---------------------------------------------------------------------------*/

KISSY.add('mod/tooltip', function(S, Core){
    var
        Tooltip = {
            version: '3.0',
            client: function(param){
                return new Core(param);
            }
        }
    PW.namespace('mod.Tooltip');
    PW.mod.Tooltip = Tooltip;
    return Tooltip;
},{
    requires:[
        'tooltip/core'
    ]
})


KISSY.add('tooltip/core', function(S, TipBase){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, detach = S.Event.detach,
        IO = S.IO,
        MOD_SETTINGS = PW.Env.modSettings.tooltip || {};
        CONFIG = {
            renderTo: '',
            styles:{
                uri: '' //相对资源定位符，希望可以找到相对本页面的路径
            }
        },
        //宿主的data数据中tooltip的索引key
        TIP_DATA_KEY = 'pw_tooltip',
        DEFAULT_THEME_URI = PW.Env.puiWebsite + 'assets/tooltip/css/style.css';

    var Core = function(param){
        //当前实例数量
        this.length;
        //当前配置
        this.options;
        //当前实例栈
        this.instances;
        this._init(param);
    }

    S.augment(Core, {
        _init: function(param){
            var that = this,
                tmp = {};
            S.mix(tmp, CONFIG, true, undefined, true);
            S.mix(tmp, MOD_SETTINGS, true, undefined, true);
            S.mix(tmp, param, true, undefined, true);
            this.options = tmp;
            this.instances = S.xArray([]);
            this.length = 0;
            that._createTips();
            that._loadCss();
        },
        /**
         * 根据renderTo选项，初始化所有的tip
         */
        _createTips: function(){
            var
                that = this,
                hosts;
            hosts = query(that.options.renderTo);
            if(hosts.length > 0){
                S.each(hosts, function(host){
                    var 
                        tip,
                        tmp ={},
                        hostData = DOM.data(host).tooltip;

                    //如果当前host存在tooltip，则以当前tooltip直接返回
                    //否则新生成tip，并且返回
                    if(that.get(host)){
                        S.log('已经存在tip对象');
                    }

                    tip = (!that.get(host))?
                            new TipBase(host, S.clone(that.options)):
                            that.get(host);
                    that.instances.push(tip);
                    tmp[tip.tid] = tip;
                    S.mix(hostData, tmp);
                    that.length ++;
                })
            }
        },
        //load css file
        _loadCss: function(){
            var
                that = this,
                options = that.options,
                cssURI;
            if(options.styles && S.isString(cssURI = options.styles.uri) && cssURI.length != ''){
                S.loadCSS(cssURI);
            }else{
                S.loadCSS(DEFAULT_THEME_URI);
            }
        },
        /**
         * 根据节点获取tip数据，以选择到的第一个为准
         * @param  {kissy selector} selector kissy选择器
         * @return {obj}  如果不存在，则返回null 存过存在tooltip，则返回tooltip
         */
        get: function(selector){
            var
                that = this,
                host,
                tip;
            host = get(selector);
            tip = DOM.data(host, TIP_DATA_KEY);
            return tip || null;
        },
        getById: function(tid){
            var
                that = this,
                ret = null;
            that.each(function(tip){
                if(tip.tid == tid){
                    ret = tip;
                }
            })
            return ret;
        },
        //循环获取当前对象所注册的tip
        each: function(callback){
            var 
                that = this;
            S.each(that.instances, function(tip,i){
                callback.call(tip,tip,i);
            })
        },
        refresh: function(param){
            var
                that = this;
            that.each(function(tip){
                tip.destroy();
            });
            if(!param || S.isEmptyObject(param)){
                param = that.options;
            }
            that._init(param);
        }
    })
    return Core;

},{
    requires: [
        'tooltip/base',
        'mod/ext'
    ]
})


KISSY.add('tooltip/base', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all, Anim = S.Anim,
        on = S.Event.on, delegate = S.Event.delegate, detach = S.Event.detach,
        IO = S.IO, Juicer = S.juicer,
        EMPTY_FN = function(){},
        //tip的html模版
        TIP_TEMP = '<div class="pw-tooltip theme-&{theme} {@if !arrow}no-arrow{@/if}" style="display: none; position: &{position}">' + 
                        '<i class="tip-arrow &{arrowPos}"></i>' +
                        '<div class="tip-content">'+
                        '</div>'+
                    '</div>',
        //tip箭头的宽度
        ARROW_WIDTH = 8,
        //tip箭头的高度
        ARROW_HEIGHT = 8,
        //宿主的data数据中tooltip的索引key
        TIP_DATA_KEY = 'pw_tooltip',
        CONFIG = {
            content:{ //maybe a HTMLElement
                text: '暂无内容', //text in the tip
                uri: ''
            },
            position: {
                page: 'absolute',
                my: 'lc',
                at: 'rc', //options: tl,tc,tr, rt,rc,rb, bl,bc,br,lt,lc,lb 
                adjust: {
                    x: 0,
                    y: 0,
                    resize: false,  //reposition the tip by the window size automatically
                    mouse: false    // reposition the tip by Mouse position automatically
                }
            },
            styles:{
                theme: '', //default style
                width: '',
                height: '',
                arrow: true
            },
            show: {
                ready: false,
                event: 'mouseover',
                effect: null,
                //显示等待时间
                delay: .1,
                duration: .1,
                easing: 'easeIn'
            },
            hide: {
                event: 'mouseout',
                effect: null,
                delay: .1,  //关闭等待时间
                duration: .1,
                easing: 'easeOut'
            }
        };


    var Tip = function(host, param){
        //根据配置进行处理
        this.options = S.mix(S.clone(CONFIG), param, true, undefined, true);
        //tip唯一标识
        this.tid = S.now();
        //宿主对象
        this.host = host;
        //tip节点
        this.tipDOM;
        //当前显示属性
        this.visible = false;
        //是否已经销毁
        this.hasDestroyed = false;
        //tip指示位置坐标
        this.showCoord = {};
        //--以下是关于有限自动机的相关属性--

        //等待显示计时器
        this.showTimer = -1;
        //等待关闭计时器
        this.hideTimer = -1;
        //是否允许移动
        this.isMoveEnable = this.options.position.adjust.mouse || false;
        //显示动画
        this.showAnim;
        //关闭动画
        this.hideAnim;

        this._init();
    }

    S.augment(Tip, S.FSM, S.EventTarget, {
        _init: function(){
            var that = this,
                options = that.options;
            //初始化tipDOM
            this._initTipDOM();
            //渲染tip节点
            this.render();
            //设置初始化指示位置坐标
            this.showCoord = this._getArrowPointerCoord();
            //设置自动机
            this._setATFStates();
            //设置显示动画
            that._setShowAnim();
            //设置关闭动画
            that._setHideAnim();
            //添加事件分发
            this._addEvtDispatcher();
            //置入tid到host的data 数据中
            this._embedTip2Host();
        },
        //配置事件分发函数
        _addEvtDispatcher: function(){
            var
                that = this,
                host = that.host,
                tipDOM = that.tipDOM,
                options = that.options;
            on(host, options.show.event, that._showHandler, that);
            on(host, options.hide.event, that._hideHandler, that);
            on(tipDOM, 'mouseover', that._mouseoverHandler, that);
            on(tipDOM, 'mouseout', that._mouseoutHandler, that);
            on(host, 'x-resize', that._xResizeHandler, that);
            if(options.position.adjust.mouse){
                on(host, 'mousemove', that._mousemoveHandler, that);
            }
        },
        _removeEvtDispatcher: function(){
            var
                that = this,
                host = that.host,
                tipDOM = that.tipDOM,
                options = that.options;
            detach(host, options.show.event, that._showHandler, that);
            detach(host, options.hide.event, that._hideHandler, that);
            detach(tipDOM, 'mouseover', that._mouseoverHandler, that);
            detach(tipDOM, 'mouseout', that._mouseoutHandler, that);
            detach(host, 'x-resize', that._xResizeHandler, that);
            if(options.position.adjust.mouse){
                detach(host, 'mousemove', that._mousemoveHandler, that);
            }
        },
        _showHandler: function(ev){
            var
                that = this;
            that.drive(S.mix(ev, {type: 'open'}));
        },
        _hideHandler: function(ev){
            var
                that = this;
            that.drive(S.mix(ev, {type: 'close'}));
        },
        _mouseoverHandler: function(ev){
            var
                that = this;
            that.drive(S.mix(ev, {type: 'over'}));
        },
        _mouseoutHandler: function(ev){
            var
                that = this;
            that.drive(S.mix(ev, {type: 'out'}));
        },
        _xResizeHandler: function(ev){
            var
                that = this;
            that.showCoord = that._getArrowPointerCoord();
            that._adjustTipPos();
        },
        _mousemoveHandler: function(ev){
            var
                that = this;
            that.drive(S.mix(ev, {type: 'move'}));
        },
        //设置有限自动机
        _setATFStates: function(){
            var
                that = this,
                options = that.options;
            this.setATF({
                //未激活状态
                inactive: {
                    open: function(ev){
                        that._addShowTimer();
                        return 'spause';
                    },
                    close: function(){
                        that._clearShowTimer();
                        return 'inactive';
                    },
                    move: function(ev){
                        if(that.isMoveEnable){
                            that._updateInitCoord({x: ev.pageX, y: ev.pageY});
                        }
                        return 'inactive';                        
                    },
                    out: function(ev){
                        return that.currentState;
                    }
                },
                //准备显示等待状态
                spause: {
                    open: function(ev){
                        if(that.isMoveEnable){
                            that._updateInitCoord({x: ev.pageX, y: ev.pageY});
                        }
                        return 'spause';
                    },
                    close: function(ev){
                        that._clearShowTimer();
                        return 'inactive';
                    },
                    move: function(ev){
                        if(that.isMoveEnable){
                            that._updateInitCoord({x: ev.pageX, y: ev.pageY});
                        }
                        return 'spause';
                    },
                    timeout: function(ev){
                        that.showAnim.run();
                        that._adjustTipPos();
                        that._adjustArrowPos();
                        return 'fadein';
                    }
                },
                //淡入显示效果状态
                fadein: {
                    open: function(ev){
                        that.repositon(ev);    
                        return that.currentState;
                    },
                    close: function(ev){
                        that._addHideTimer();
                        return 'hpause';
                    },
                    move: function(ev){
                        that.repositon(ev);
                        return this.currentState;
                    },
                    timeout: function(ev){
                        return 'display';
                    },
                    over: function(ev){
                        that.hideAnim.stop();
                        that.showAnim.run();
                        return 'fadein';
                    },
                    out: function(ev){
                        that._addHideTimer();
                        return 'hpause';
                    }
                },
                //正常显示状态
                display: {
                    open: function(ev){
                        that.repositon(ev);
                        return that.currentState;
                    },
                    close: function(ev){
                        that._addHideTimer();
                        return 'hpause';
                    },
                    move: function(ev){
                        that.repositon(ev);
                        return that.currentState;
                    },
                    timeout: function(ev){
                        return that.currentState;
                    },
                    over: function(ev){
                        return that.currentState;
                    },
                    out: function(ev){
                        that._addHideTimer();
                        return 'hpause';
                    }
                },
                //淡出关闭效果状态
                fadeout: {
                    open: function(ev){
                        that.hideAnim.stop();
                        that.showAnim.run();
                        that.repositon(ev);
                        return 'fadein';
                    },
                    close: function(ev){
                        return that.currentState;
                    },
                    move: function(ev){
                        that.repositon(ev);
                        return that.currentState;
                    },
                    timeout: function(ev){
                        return 'inactive';
                    },
                    over: function(ev){
                        that.hideAnim.stop();
                        that.showAnim.run();
                        return 'fadein';
                    },
                    out: function(ev){
                        return that.currentState;
                    }
                },
                //等待关闭暂停状态
                hpause: {
                    open: function(ev){
                        that._clearHideTimer();
                        that.repositon(ev);
                        //如果显示动画正在运行，则返回fadein否则display
                        return (that.showAnim.isRunning())?
                                'fadein':
                                'display';
                    },
                    close: function(ev){
                        that._addHideTimer();
                        return that.currentState;
                    },
                    move: function(ev){
                        that._clearHideTimer();
                        that.repositon(ev);
                        return that.currentState;
                    },
                    timeout: function(ev){
                        that.showAnim.stop();
                        that.hideAnim.run();
                        return 'fadeout';
                    },
                    over: function(ev){
                        that._clearHideTimer();
                        //如果显示动画正在运行，则为fadein否则返回display
                        return (that.showAnim.isRunning()) ?
                            'fadein':
                            'display';
                    },
                    out: function(){
                        return that.currentState;
                    }
                }
              });
        },
        //配置显示动画
        _setShowAnim: function(){
            var
                that = this,
                options = that.options,
                tipDOM = that.tipDOM;
            //设置显示tip动画
            that.showAnim = Anim(
                tipDOM,
                {
                    'opacity': 'show'
                },
                options.show.duration,
                options.show.easing,
                function(){
                    that.drive({type: 'timeout'});
                    that.visible = true;
                    that.fire('show', {tip: that})
                    that.fire('visibleChange', {tip: that, visible: true});
                }
            );
        },
        //配置关闭动画
        _setHideAnim: function(){
            var
                that = this,
                options = that.options,
                tipDOM = that.tipDOM;
            //设置隐藏tip动画
            that.hideAnim = Anim(
                tipDOM,
                {
                    'opacity': 'hide'
                },
                options.hide.duration,
                options.hide.easing,
                function(){
                    that.drive({type: 'timeout'});
                    that.visible = false;
                    that.fire('hide', {tip: that});
                    that.fire('visibleChange', {tip: that, visible: false});
                }
            );
        },
        //为自动机添加关闭计时器
        _addHideTimer: function(){
            var
                that = this,
                options = that.options;
            if(that.hideTimer <= -1){
                that.hideTimer = S.timer(function(){
                    that.drive({type: 'timeout'});
                    that.hideTimer = -1;
                },options.hide.delay,1);
            }
        },
        //清除关闭计时器
        _clearHideTimer: function(){
            var
                that = this;
            S.clearTimer(that.hideTimer);
            that.hideTimer = -1;
        },
        //添加显示计时器
        _addShowTimer: function(){
            var
                that = this,
                options = that.options;
            if(that.showTimer <= -1){
                that.showTimer = S.timer(function(){
                    that.drive({type: 'timeout'});
                    that.showTimer = -1;
                },options.show.delay, 1);
            }
        },
        //清除显示计时器
        _clearShowTimer: function(){
            var
                that = this;
            S.clearTimer(that.showTimer);
            that.showTimer = -1;
        },
        //更新初始化箭头指示坐标
        _updateInitCoord: function(coord){
            var
                that = this;
            coord.x = coord.x || 0;
            coord.y = coord.y || 0;
            
            that.showCoord = coord;
        },
        /**
         * 显示tip
         * 之后添加调整事件，并且立即执行，包括resize和mosue跟随
         * show是由隐藏到打开的操作，此操作执行的时候需要更新arrow位置
         */
        show: function(){
            var
                that = this,
                options = that.options;
            that.drive({type: 'open'});
        },
        /**
         * 隐藏tip
         */
        hide: function(){
            var
                that = this,
                options = that.options;
            that.drive({type: 'close'});
        },
        destroy: function(){
            var
                that = this,
                host = that.host;
            that.hide();
            that._removeEvtDispatcher();
            this.tid = null;
            this.host = null;
            DOM.remove(this.tipDOM);
            that._removeTipFromHost();
            that.hasDestroyed = true;
        },
        render: function(){
            var
                that = this;
            //开始更新
            that.fire('beforeRender', {tip: that});
            DOM.append(that.tipDOM,'body');
            //更新tip的content数据
            that._updateContent();
            that.fire('beforeRender', {tip: that});
        },
        refresh: function(){
            var
                that = this,
                host = that.host;
            that._removeEvtDispatcher();
        },
        /**
         * 禁用tooltip事件
         * by wangjing 2014-11-10添加
         * @return {[type]} [description]
         */
        disable: function(){
            var
                that = this,
                host = that.host;
            that.hide();
            that._removeEvtDispatcher();
        },
        /**
         * 启用tooltip事件
         * by wangjing 2014-11-10 添加
         * @return {[type]} [description]
         */
        enable: function(){
            var
                that = this,
                host = that.host;
            that._addEvtDispatcher();
        },
        toggle: function(){},
        /**
         * 重新ev定位位置
         */
        repositon: function(ev){
            var
                that = this,
                options = that.options,
                x, y,
                offset;
            x = ev.pageX || 0;
            y = ev.pageY || 0;

            //如果允许移动才会根据事件调整tip位置
            if(that.isMoveEnable){
                that._adjustTipPos({x: x, y: y });
                that.fire('move', {tip: that, x: x, y: y});
            }
        },
        /**
         * 重新设置content内容
         * 并且更新arrow位置和tip位置
         */
        setContent: function(content){
            var
                that = this;
            that._updateContent(content);
            //更新数据之后涉及到各项位置的调整，所以需要执行重定位箭头和tip
            //根据options.positionat的位置进行初始定位
            that._adjustTipPos();
            //根据options.position.my的位置调整arrow位置
            that._adjustArrowPos();
        },
        /**
         * 设置tip的文本
         */
        setHtml: function(txt){
            var
                that = this;
            that.setContent({text: txt});
        },
        /**
         * 初始化tip的dom节点，完善相关链接数据
         */
        _initTipDOM: function(){
            var
                that = this,
                options = that.options,
                tipHTML = '',
                tipDOM,
                pos;
            tipHTML = Juicer(TIP_TEMP, {
                theme: options.styles.theme,
                arrowPos: options.position.my,
                arrow: options.styles.arrow,
                position: options.position.page
            });
            //完成dom
            that.tipDOM = DOM.create(tipHTML);
            DOM.css(that.tipDOM,{
                width: options.styles.width,
                height: options.styles.height
            })
        },
        /**
         * 输入content，更新tip内容
         */
        _updateContent: function(content){

            var
                that = this,
                options = that.options,
                tipDOM = that.tipDOM,
                iframe,
                cntText,
                contentDOMArr = [],
                fnReturn;

            //如果content存在
            if(!content || !S.isObject(content)) {
                content = options.content;
            }else{
                options.content = content;
            }
            if(content.uri){
                //如果是链接，则生成iframe容纳
                iframe = DOM.create('<iframe>',{
                    src: content.uri,
                    css:{
                        width: '100%',
                        height: '100%'
                    }
                })
                contentDOMArr.push(iframe);
            }else if(content.text){
                cntText = content.text;
                if(S.isString(cntText)){
                    //如果是文本
                    try{
                        //试图通过选择器选择到节点
                        contentDOMArr = query(cntText);
                    }catch(err){
                        S.log('通过文本方式处理');
                    }finally{
                        //如果是选择器，则已经选中到容器中
                        if(contentDOMArr.length <= 0){
                            //如果不是选择器，则直接将文本放入tip容器中
                            contentDOMArr.push(DOM.create(cntText));
                        }
                    }
                }else if(S.isObject(cntText)){
                    //如果是一个对象
                    if(cntText.jquery){
                        //如果是jquery
                        contentDOMArr = cntText.get();
                    }else if(cntText.addStyleSheet){
                        //如果是kissy 的nodes对象,通过 stylesheet函数判断
                        contentDOMArr = cntText.getDOMNodes();
                    }
                    else if(query(cntText) > 0){
                        //如果能够通过query获取到节点
                        contentDOMArr = query(cntText);
                    }else if(DOM.isHTMLElement(cntText)){
                        //如果是一个纯节点，应该用不着，怕出意外
                        contentDOMArr.push(cntText);
                    }else{
                        //什么特殊对象都不是，直接toString
                        contentDOMArr.push(DOM.create('<p>'+ cntText.toString() +'</p>'))
                    }
                }else if(S.isFunction(cntText)){
                    fnReturn = cntText.call(that, that, that.host) || '正在加载';
                    if(S.isString(fnReturn)){
                        contentDOMArr.push(DOM.create(fnReturn));
                    }else if(DOM.isHTMLElement(fnReturn)){
                        that._updateContent({text: fnReturn})
                        return;
                    }
                    
                }else if(S.isArray(cntText)){
                    //如果是数字，认为是一个节点数组<HTMLElement>Array
                    contentDOMArr = cntText;
                }
            }else{
                //如果什么都不是，直接输出无效数据
                contentDOMArr.push(DOM.create('<p>无效数据</p>'));
            }

            //更新数据
            $(tipDOM).one('.tip-content').html('');
            S.each(contentDOMArr, function(content){
                $(tipDOM).one('.tip-content').append(content);
            })
        },
        /**
         * 定位tip的位置，以绝对定位的方式，相对于body定位
         * @param coord.x,coord.y 分别代表需要定位的x坐标和y坐标，此坐标以arrow的定点设置
         */
        _adjustTipPos: function(coord){
            var
                that = this,
                options = that.options,
                tipDOM = that.tipDOM,
                tw = DOM.outerWidth(tipDOM),
                th = DOM.outerHeight(tipDOM),
                arrowPointerCoord,
                pos = {};

            
            if(!coord || !coord.x || !coord.y){
                //如果传入的定位坐标(coord)不存在, 自动获得重新初始化coord
                //此处不能以首次获取的位置为准，怕出现位置变动
                arrowPointerCoord = that._getArrowPointerCoord();
            }else{
                //coord存在，以coord为准
                arrowPointerCoord = coord;
                that.showCoord = coord;
            }
            arrowPointerCoord.x += options.position.adjust.x;
            arrowPointerCoord.y += options.position.adjust.y;

            switch(options.position.my){
                case 'tl':
                    pos.left = arrowPointerCoord.x - ARROW_WIDTH/2;
                    pos.top = arrowPointerCoord.y + ARROW_HEIGHT;
                    break;
                case 'tc':
                    pos.left = arrowPointerCoord.x - tw/2;
                    pos.top = arrowPointerCoord.y + ARROW_HEIGHT;
                    break;
                case 'tr':
                    pos.left = arrowPointerCoord.x - tw + ARROW_WIDTH/2;
                    pos.top = arrowPointerCoord.y + ARROW_HEIGHT;
                    break;
                case 'rt':
                    pos.left = arrowPointerCoord.x - tw - ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y;
                    break;
                case 'rc':
                    pos.left = arrowPointerCoord.x - tw - ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y - th/2;
                    break;
                case 'rb':
                    pos.left = arrowPointerCoord.x - tw - ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y - th;
                    break;
                case 'bl':
                    pos.left = arrowPointerCoord.x - ARROW_WIDTH/2;
                    pos.top = arrowPointerCoord.y - ARROW_HEIGHT - th;
                    break;
                case 'bc':
                    pos.left = arrowPointerCoord.x -  tw/2
                    pos.top = arrowPointerCoord.y - ARROW_HEIGHT - th;
                    break;
                case 'br':
                    pos.left = arrowPointerCoord.x - tw + ARROW_WIDTH/2;
                    pos.top = arrowPointerCoord.y - ARROW_HEIGHT - th;
                    break;
                case 'lt':
                    pos.left = arrowPointerCoord.x + ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y;
                    break;
                case 'lc':
                    pos.left = arrowPointerCoord.x + ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y - th/2;
                    break;
                case 'lb':
                    pos.left = arrowPointerCoord.x + ARROW_WIDTH;
                    pos.top = arrowPointerCoord.y - th;　
                    break;
                default:
                    S.log('定位错误');
            }
            DOM.css(tipDOM, pos);
        },
        /**
         * 获取初始化arrow坐标点
         * @return {x: arrow_x y: arrow_y}
         */
        _getArrowPointerCoord: function(){
            var
                that = this,
                host = that.host,
                at = that.options.position.at,
                off = DOM.offset(host),
                l = off.left, 
                t = off.top,
                hw = DOM.outerWidth(host),
                hh = DOM.outerHeight(host),
                pos = {};
            switch(at){
                case 'tc':
                case 'bc':
                    pos.x = l + hw/2;
                    break;
                case 'tr':
                case 'rt':
                case 'rc':
                case 'rb':
                case 'br':
                    pos.x = l + hw;
                    break;
                default: //include lt, lc,lb,tl,bl
                    pos.x = l;

            }

            switch(at){
                case 'lc':
                case 'rc':
                    pos.y = t + hh/2;
                    break;
                case 'lb':
                case 'bl':
                case 'bc':
                case 'br':
                case 'rb':
                    pos.y = t + hh;
                    break;
                default: // include lt, tl, tc, tr, rt
                    pos.y = t;
            }
            return pos;
        },
        /**
         * 获取arrow的定位值并进行定位
         */
        _adjustArrowPos: function(){
            var
                that = this,
                options = that.options,
                tipDOM = that.tipDOM,
                arrowDOM = get('i', tipDOM),
                // tip width
                tw = DOM.width(tipDOM),
                th = DOM.outerHeight(tipDOM),
                pos = {};
                
            switch(options.position.my){
                case 'lt':
                case 'lc':
                case 'lb':
                    pos.left = -1 * ARROW_WIDTH;
                    break;
                case 'tl':
                case 'bl':
                    pos.left = 0;
                    break;
                case 'tc':
                case 'bc':
                    pos.left = (tw - ARROW_WIDTH)/2;
                    break;
                case 'tr':
                case 'br':
                    pos.right = 0;
                    break;
                case 'rt':
                case 'rc':
                case 'rb':
                    pos.right = -1 * ARROW_WIDTH;
                    break;
                default: 
                    S.log('arrow x方向定位错误');
                    pos.left = 0;
            }

            switch(options.position.my){
                case 'tl':
                case 'tc':
                case 'tr':
                    pos.top = -1 * ARROW_HEIGHT;
                    break;
                case 'lt':
                case 'rt':
                    pos.top = 0;
                    break;
                case 'lc':
                case 'rc':
                    pos.top = (th - ARROW_HEIGHT)/2;
                    break;
                case 'lb':
                case 'rb':
                    pos.bottom = 0;
                    break;
                case 'bl':
                case 'bc':
                case 'br':
                    pos.bottom = -1 * ARROW_HEIGHT;
                    break;
                default:
                    S.log('arrow y方向定位错误');
                    pos.top = 0;
            }
            DOM.css(arrowDOM, pos);
        },
        /**
         * 将当前tip对象置入data中
         */
        _embedTip2Host: function(){
            var
                that = this,
                host = that.host;
            DOM.data(host, TIP_DATA_KEY, this);
        },
        /**
         * 从当前宿主节点中移除tip
         */
        _removeTipFromHost: function(){
            var
                that = this,
                host = that.host;   
            DOM.removeData(host, TIP_DATA_KEY);
        }
    })

    return Tip;
},{
    requires: [
        'core',
        'mod/ext',
        'mod/juicer',
        'mod/fsm'
    ]
})
