/*-----------------------------------------------------------------------------
* @Description: 新版更新遮罩，添加根据页面的dom，实现遮罩 (overlay.js)
* @Version:     V1.0.0
* @author:      simon(406400939@qq.com)
* @date         2013.05.16
* ==NOTES:=============================================
* v2.0.0(2013.05.16):
*     在保证原有api不变的情况下，进行了重构
*     为了保证时间，先使用jquery作为开发核心，因为要集成firefox的resize事件
*     而原生js对此不支持（包括kissy）
*    新增visibleChange事件
*    新增renderTo,
*    新增showAfterReady ,如果为true，则初始化完成后自动打开
*    新增div覆盖，可以再loadingTip时调用
* v2.0.1(2013.07.19):
*     修复ie6下遮罩不透明问题
*     修复ie6下iframe置于顶层，无法再次添加层的问题
* ---------------------------------------------------------------------------*/


KISSY.add('mod/overlay', function(S,Core){
    var
        EMPTY_FUNCTION = function(){},
        CONFIG = {
            //渲染的父亲节点
            renderTo: '',
            //overlay中可能存在的内容
            content: '',
            elCls:'',
            elStyle: '',
            //暂不设置
            //elAttrs: null,
            //层
            zIndex: 101,
            //透明度
            opacity: 0.6,
            //背景颜色
            bgColor: '#000',
            //指明要显示的页面的iframe的嵌套层级
            topLayer: 0,
            //鼠标移上去
            cursor:'wait',
            //当初始化完成时，显示遮罩
            showAfterReady: false,
            onClick: EMPTY_FUNCTION,
            beforeRender: EMPTY_FUNCTION,
            afterRender: EMPTY_FUNCTION,
            onVisibleChange: EMPTY_FUNCTION,
            beforeDestroy: EMPTY_FUNCTION,
            afterDestroy: EMPTY_FUNCTION,
            //============================弃用属性，为了跟老版本兼容================
            //鼠标的点击事件
            clickHandler : EMPTY_FUNCTION,
            //生成遮罩之前的操作
            beforeCreateHandler:EMPTY_FUNCTION,
            //生成mask之后的操作
            afterCreateHandler: EMPTY_FUNCTION,
            //销毁遮罩之前的操作
            beforeDestroyHandler: EMPTY_FUNCTION,
            //销毁遮罩之后的操作
            afterDestroyHandler : EMPTY_FUNCTION
            //======================================================================
        };


    Overlay = {
        version: '2.0',
        client: function(param){
            var 
                opts = S.merge(CONFIG, param);
            return new Core(opts)
                        .on('click', function(e){
                            if(S.isFunction(opts.onClick)){
                                opts.onClick(e,this);
                            }else if(S.isFunction(opts.clickHandler)){
                                opts.clickHandler(e, this);
                            }
                        })
                        .on('beforeRender', function(e){
                            if(S.isFunction(opts.beforeRender)){
                                opts.beforeRender(e, this);
                            }else if(S.isFunction(opts.beforeCreateHandler)){
                                opts.beforeCreateHandler(e, this);
                            }
                        })
                        .on('afterRender', function(e){
                            if(S.isFunction(opts.afterRender)){
                                opts.afterRender(e, this);
                            }else if(S.isFunction(opts.afterCreateHandler)){
                                opts.afterCreateHandler(e, this);
                            }
                        })
                        .on('beforeDestroy', function(e){
                            if(S.isFunction(opts.beforeDestroy)){
                                opts.beforeDestroy(e ,this);
                            }else if(S.isFunction(opts.beforeDestroyHandler)){
                                opts.beforeDestroyHandler(e, this);
                            }
                        })
                        .on('afterDestroy', function(e){
                            if(S.isFunction(opts.afterDestroy)){
                                opts.afterDestroy(e, this);
                            }else if(S.isFunction(opts.afterDestroyHandler)){
                                opts.afterDestroyHandler(e, this);
                            }
                        })
                        .on('visibleChange', function(e){
                            if(S.isFunction(opts.onVisibleChange)){
                                opts.onVisibleChange(e,this);
                            }
                        });
        },
        mask: function(zIndex,color,topLayer,clickFn){
            return this.client({
                zIndex: zIndex,
                bgColor: color,
                topLayer: topLayer,
                onClick: clickFn
            })
        }
    }
    S.Overlay = Overlay;
    PW.namespace('mod.Overlay');
    PW.mod.Overlay = Overlay;
    return Overlay
},{
    requires:['overlay/core']
})

KISSY.add('overlay/core', function(S){
    var 
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = jQuery,
        on = S.Event.on,
        nodeName = DOM.nodeName,
        CONFIG = {},
        COUNTER = 0,
        ID_ATTR = 'data-overlay-id';


    function Overlay(param){
        this.opts = S.merge(CONFIG, param);
        this.id = COUNTER++;
        this.opts;
        this.prtEl;
        this.w;
        this.h;
        this.win;
        this.doc;
        this.olyEl;
        this.visibleStatus = false;
        this.init(param);
    }

    S.augment(Overlay, S.EventTarget, {
        init: function(param){
            var 
                that = this,
                opts = that.opts;
            that._getWin();
            that.prtEl = that._getPrtEl();
            that._setPos();
            that._render();
            if(opts.showAfterReady){
                that.show();   
            }
        },
        //旧版接口，执行现在的refresh方法,如果遮罩隐藏则显示
        render: function(){
            var
                that = this;
            that.refresh();
            that.show();
        },
        //刷新显示节点
        refresh: function(){
            var
                that = this;
            //重新获取prtel的高并且将其更改到olyEl中
            if(that.olyEl){
                //更新节点展示
                that._refreshProp();
            }else{
                that._render();
            }
        },
        //展示overlay
        show: function(){
            var
                that = this,
                olyEl = that.olyEl;
            if(!that.visibleStatus){
                DOM.show(olyEl);
                that.visibleStatus = true;
                //添加切换显示事件
                that.fire('visibleChange', that._getEvtProp());
            }
        },
        //关闭overlay
        hide: function(){
             var
                that = this;
            if(that.visibleStatus){
                DOM.hide(that.olyEl);
                that.visibleStatus = false;
                //添加切换显示事件
                that.fire('visibleChange', that._getEvtProp());
            }
        },
        //移除
        destroy: function(){
            var
                that = this,
                olyEl = that.olyEl;
            that.fire('beforeDestroy',that._getEvtProp());
            DOM.remove(olyEl);
            that.fire('afterDestroy',that._getEvtProp());
        },
        //将content 内容放进遮罩,只接受html代码和DOM节点
        setContent: function(el){
            var
                that = this,
                olyEl = that.olyEl;
            that.removeContent();
            if(S.isString(el)){
                DOM.html(olyEl, el);
            }else{
                DOM.append(el, olyEl);
            }
            
        },
        removeContent: function(){
            var
                that = this,
                olyEl = that.olyEl;
            DOM.html(olyEl, '');
        },
        //将olyEl添加进
        _render: function(){
            var
                that = this,
                doc = that.doc;
            //创建新的
            that._createOlyEl();
            //自定义渲染之前事件
            that.fire('beforeRender', that._getEvtProp());
            DOM.append(that.iframeEl, that.olyEl)
            DOM.append(that.olyEl, that.prtEl);
            that._bindEvt();   
            //自定义渲染之后事件
            that.fire('afterRender', that._getEvtProp())
        },
        //绑定click事件
        _bindEvt: function(){
            var
                that = this,
                olyEl = that.olyEl;
            on(olyEl, 'click', function(ev){
                var obj = that._getEvtProp();
                that.fire('click', S.mix(obj, ev))
            })
        },
        //更新节点展示
        _refreshProp: function(){
            var
                that = this,
                olyEl = that.olyEl,
                p = that._getPrtProp();
            DOM.height(olyEl, p.h);
            DOM.width(olyEl, p.w);
            that.w = p.w;
            that.h = p.h;
        },
        //获取父节点长宽信息
        _getPrtProp: function(){
            var
                that = this,
                prtEl = that.prtEl,
                r = {};
            r.w = DOM.width(prtEl);
            if(nodeName(prtEl,'body')){
                var 
                    //窗口高度
                    wh = $(that.win).height(),
                    //body高度
                    bh,
                    //doc 高度
                    dh = $(that.doc).height(),
                    div1 = $('<div style="height: 0;"></div>');
                $(prtEl).append(div1);
                bh = parseInt(div1.offset().top);
                div1.remove();
                if(dh >= wh && dh >= bh){
                    r.h = dh;
                }else if(wh >= dh && wh >= bh){
                    r.h = wh;
                }else{
                    r.h = dh;
                    // S.log('高度混乱');
                }
            }else{
                r.h = DOM.innerHeight(prtEl);
            }
            return r;
        },
        //创建遮罩节点和ifarme节点
        _createOlyEl: function(){
            var
                that = this,
                opts = that.opts,
                doc = that.doc,
                win = that.win,
                el,
                p = that._getPrtProp();
            that.olyEl = DOM.create(
                '<div>',
                {
                    'class': opts.elCls,
                    'html': opts.content,
                    'data-overlay-id': that.id,
                    'css': S.mix({
                            display:'none',
                            position:'absolute',
                            left: 0,
                            top: 0,
                            width: p.w,
                            height: p.h,
                            cursor: opts.cursor,
                            background: opts.bgColor,
                            opacity: opts.opacity,
                            filter: 'alpha(opacity=' + opts.opacity*100 + ')',
                            zIndex: opts.zIndex
                        },opts.elStyle)
                },
                that.doc
            );
            that.w = p.w;
            that.h = p.h;
            if($.browser.msie && $.browser.version == 6.0){
                that.iframeEl = DOM.create(
                    '<iframe>',
                    {
                        frameborder: 0,
                        css: {
                           position: "absolute",
                           top: 0, 
                           left: 0,
                           opacity: 0,
                           zIndex: -1,
                           height: p.h,
                           width: p.w,
                           border: 0
                        }
                    },
                    that.doc
                );
            }
        },
        //获取mask显示父节点，如果为空或者失败，返回body
        _getPrtEl: function(){
            var
                that = this,
                opts = that.opts,
                doc = that.doc,
                p;
            p = get(opts.renderTo, doc) || get('body', doc);
            if(!nodeName(p) == 'body'){
                DOM.css(p, {
                    position: 'relative',
                    zoom:'1'
                })
            }

            on(p,'x-resize', function(){
                that.refresh();
                that.fire('resize',that._getEvtProp()); 
            })
            
            return p;
        },
        //根据topLayer属性获取指定的窗口对象window
        _getWin: function(){
            var
                that = this,
                opts = that.opts,
                topLayer = opts.topLayer,
                win = window;
            for(var i = 0; i < topLayer;i++){
                win = win.parent;
            }
            that.win = win;
            that.doc = win.document;
        },
        //获取事件接口需要属性
        _getEvtProp: function(){
            var
                that = this;
            return {
                pEl: that.prtEl,
                el: that.olyEl,
                iframeEl: that.iframeEl,
                win: that.win,
                doc: that.doc,
                //以下为了保证旧版本兼容而设置
                ol: that.olyEl,
                ob: that,
                tw: that.win,
                o: that
            };
        },
        //设置样式
        //  1.如果父节点没有position属性，则自动加上relative
        _setPos: function(){
            var
                that = this,
                prtEl = that.prtEl;
            // if(DOM.css(prtEl, 'position') != 'absolute'){
            //     DOM.css(prtEl, 'position', 'relative');
            // }//原始的代码在这没有删
            // 因为给body加relative属性后，在手机端的样式会出现问题，所以这里判断了是否为body
            if((DOM.css(prtEl, 'position') != 'absolute') && prtEl.nodeName != 'BODY'){
                DOM.css(prtEl, 'position', 'relative');
            }
        }
    });
    return Overlay;
},{
    requires:[
        'core',
        'thirdparty/jquery',
        'mod/ext'
    ]
})