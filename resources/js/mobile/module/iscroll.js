/*-----------------------------------------------------------------------------
 * @Description:     滚动条修改
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.15
 * ==NOTES:=============================================
 * v1.0.0(2016.01.15):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('module/iscroll', function(S, Core){
    PW.namespace('module.Iscroll');
    PW.module.Iscroll = {
        client: function(param){
            return new Core(param);
        }
    };
},{
    requires: [
        'iscroll/iscroll-manage'
    ]
});

KISSY.add('iscroll/iscroll-manage', function(S){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        config = {
            info:{
                "pullDownLabel":"下拉刷新...",
                "pullingDownLabel":"松手开始刷新",
                "pullUpLabel":"上拉加载更多...",
                "pullingUpLabel":"松手开始加载...",
                "loadingLabel":"正在加载中..."
            },
            onRefresh: function(){},
            onScrollMove: function(){},
            onScrollEnd: function(){},
            // 是否支持懒加载
            isLazyLoad: true,
            // 参与懒加载的节点class
            lazyLoadRenderTo: '',
            // 除了ul内的li添入iscroll中的其他节点
            extraNode: []
        };
    function Core(param){
        this.opts = S.merge(config, param);
        //S.log(this.opts)
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this.init();
        },
        /**
         * 将scroll添入wrapper中
         * @private
         */
        _scrollIntoWrapper: function(){
            var
                that = this,
                opts = that.opts,
                wrapper = get('#' + opts.id),
                div = DOM.create('<div id="scroller"></div>');

            DOM.append(div, wrapper);
        },
        _listIntoScroll: function(){
            var
                that = this,
                opts = that.opts,
                scroller = get('#' + 'scroller'),
                list = query('#' + opts.id + ' ul.J_scroll'),
                extraNode = that.opts.extraNode,
                length = extraNode.length;

            if(length > 0){
                for(var j = 0; j < length; j ++){
                    var
                        node = get(extraNode[j]);
                    DOM.append(node, scroller);
                }
            }
            DOM.append(list, scroller);
        },
        _pullDownIntoScroll: function(){
            var
                that = this,
                opts = that.opts,
                pullDown = DOM.create('<div id="pullDown"><div class="loader"><span></span><span></span><span></span><span></span></div><div class="pullDownLabel">' + opts.info.pullDownLabel + '</div></div>');

            DOM.prepend(pullDown, scroller);
        },
        _pullUpIntoScroll: function(){
            var
                that = this,
                opts = that.opts,
                pullUp = DOM.create('<div id="pullUp"><div class="loader"><span></span><span></span><span></span><span></span></div><div class="pullUpLabel">' + opts.info.pullUpLabel + '</div></div>');

            DOM.append(pullUp, scroller);
        },
        _getOffset: function(downOffset, upOffset){
            var
                that = this,
                opts = that.opts,
                pullDownEl = get('#pullDown'),
                pullUpEl = get('#pullUp');

            if(downOffset == undefined || upOffset == undefined){
                downOffset = 40 / 75 * rootFontSize;
                upOffset = downOffset;
            }
            that._scroll(opts, pullDownEl, downOffset, pullUpEl, upOffset);
        },
        init: function(){
            var
                that = this,
                opts = that.opts;

            that._scrollIntoWrapper();
            that._listIntoScroll();
            that._pullDownIntoScroll();
            that._pullUpIntoScroll();
            that._getOffset();
            that._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            $(window).on('resize', function(){
                var
                    downOffset = 40 / 75 * rootFontSize,
                    upOffset = downOffset;
                that._getOffset(downOffset, upOffset);
            });
        },
        _scroll: function(param, pullDownEl, pullDownOffset, pullUpEl, pullUpOffset){
            var
                that = this,
                opts = that.opts;

            that.iscroll = new iScroll(param.id, {
                useTransition: true,
                vScrollbar: true,
                hScrollbar: false,
                topOffset: pullDownOffset,
                fixedScrollbar: true,
                onRefresh: function () {
                    that._onRelease(pullDownEl, pullUpEl);
                },
                onScrollMove: function () {
                    that._onScrolling(this, pullDownEl, pullUpEl, pullUpOffset);
                },
                onScrollEnd: function () {
                    that._onPulling(pullDownEl, opts.pullDownAction, pullUpEl, opts.pullUpAction);
                },
                scrollbarClass: 'myScrollbar'
            });

            on(document, 'touchmove', function(e){
                e.preventDefault();
            });
        },
        _onRelease: function(pullDownEl, pullUpEl){
            var
                that = this,
                opts = that.opts;

            if(pullDownEl.className.match('loading')){
                DOM.attr(pullDownEl, 'class', '');
                DOM.html('.pullDownLabel', opts.info.pullDownLabel);
                var
                    loader = DOM.get('.loader', pullDownEl);
                DOM.css(loader, 'display', 'none');
                //DOM.css(pullDownEl, 'line-height', DOM.innerHeight(pullDownEl) / 75 + 'rem');
            }
            if(pullUpEl.className.match('loading')){
                DOM.attr(pullUpEl, 'class', '');
                DOM.html('.pullUpLabel', opts.info.pullUpLable);
                var
                    loader = DOM.get('.loader', pullUpEl);
                DOM.css(loader, 'display', 'none');
                //DOM.css(pullUpEl, 'line-height', DOM.innerHeight(pullUpEl)/ 75 + 'rem');
            }
        },
        _onScrolling: function(e, pullDownEl, pullUpEl, pullUpOffset){
            var
                that = this,
                opts = that.opts;

            if(e.y > -(pullUpOffset)){
                DOM.attr(pullDownEl, 'class', '');
                DOM.text(pullDownEl, opts.info.pullDownLabel);
                e.minScrollY = -pullUpOffset;
            }
            if(e.scrollerH > e.wrapperH && e.y > (e.maxScrollY - pullUpOffset)){
                DOM.attr(pullUpEl, 'class', '');
                DOM.html('.pullUpLabel', opts.info.pullUpLabel);
                if(opts.isLazyLoad){
                    DOM.removeClass('.' + opts.lazyLoadRenderTo, opts.lazyLoadRenderTo);
                }
            }
            if(e.y > 0){
                DOM.addClass(pullDownEl, 'flip');
                DOM.html('.pullDownLabel', opts.info.pullingDownLabel);
                e.minScrollY = 0;
            }
            if(e.scrollerH < e.wrapperH && e.y < (e.minScrollY - pullUpOffset) || e.scrollerH > e.wrapperH && e.y < (e.maxScrollY - pullUpOffset)){
                DOM.css(pullUpEl, 'display', 'block');
                DOM.addClass(pullUpEl, 'flip');
                DOM.html('.pullUpLabel', opts.info.pullingUpLabel);
            }
            if(e.scrollerH < e.wrapperH && e.y > (e.minScrollY - pullUpOffset) && pullUpEl.className.match('flip') || e.scrollerH > e.wrapperH && e.y > (e.maxScrollY - pullUpOffset) && pullUpEl.className.match('flip')){
                DOM.css(pullUpEl, 'display', 'none');
                DOM.attr(pullUpEl, 'class', '');
                DOM.html('.pullUpLabel', opts.info.pullUpLabel);
            }
        },
        _onPulling: function(pullDownEl, pullDownAction, pullUpEl, pullUpAction){
            var
                that = this,
                opts = that.opts;

            if (pullDownEl.className.match('flip')) {
                DOM.attr(pullDownEl, 'class', 'loading');
                DOM.html('.pullDownLabel', opts.info.loadingLabel);
                var
                    loader = get('.loader', pullDownEl);
                DOM.css(loader, 'display', 'block');
                //DOM.css(pullDownEl, 'line-height', 20 / 75  + 'rem');
                if(S.isFunction(pullDownAction)){
                    pullDownAction();
                }
            }
            if (pullUpEl.className.match('flip')) {
                DOM.attr(pullUpEl, 'class', 'loading');
                DOM.html('.pullUpLabel', opts.info.loadingLabel);
                var
                    loader = get('.loader', pullUpEl);
                DOM.css(loader, 'display', 'block');
                //DOM.css(pullUpEl, 'line-height', 20 / 75  + 'rem');
                if(S.isFunction(pullUpAction)) {
                    pullUpAction.call(that);
                }
            }
        }
    });
    return Core;
},{
    requires: [
        'mod/iscroll'
    ]
});