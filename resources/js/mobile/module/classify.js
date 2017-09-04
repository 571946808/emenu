/*-----------------------------------------------------------------------------
 * @Description:     头部分类
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.21
 * ==NOTES:=============================================
 * v1.0.0(2016.01.21):
 初始生成
 可以作为相同情况下直接来使用
 * v1.0.1(2016.06.09)
 * 增加了的搜索功能Search   ---by jiangx
 * ---------------------------------------------------------------------------*/

KISSY.add('module/classify', function(S, Core, Search){
    var
        DOM = S.DOM,
        query = DOM.query,
        el = {
            // 分类触发器
            classifyTrigger: '.J_classify'
        },
        CLASSIFY = 'classify',
        Classify = {
            client: function(){
                new Core();
                new Search();
            },
            refresh: function(){
                var
                    that = this;

                S.each(query(el.classifyTrigger), function(trigger){
                    DOM.data(trigger, CLASSIFY, that.client());
                });
            }
        };
    S.ready(function(){
        Classify.refresh();
    });
    PW.namespace('module.Classify');
    PW.module.Classify = Classify;
    return Classify;
},{
    requires: [
        'classify/core',
        'classify/search'
    ]
});

/**
 * 头部分类核心操作
 */
KISSY.add('classify/core', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer.client,
        commonIO = PW.io.Common,
        el = {
            // 分类触发器
            classifyTrigger: '.J_classify',
            // 分类信息
            classifyInfoEl: '.J_classifyInfo',
            // 分类容器
            classifyContainer: '.J_classifyContainer',
            // 每个分类标签
            classifyCeilTrigger: '.J_classifyCeil',
            // 分类标签列表
            classifyListEl: '.classify-list',
            // 分类标签模板
            classifyTpl: '#tpl'
        },
        // 分类id
        DATA_CLASSIFY_ID = 'data-classify-id',
        // 分类name
        DATA_CLASSIFY_NAME = 'data-classify-name';

    function Core(){
        this.info = [];
        core = {};
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this._getClassify();
            this._getClassifyId();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this,
                iconEl = get('i', el.classifyTrigger);

            on(el.classifyTrigger, 'tap', function(e){
                e.stopPropagation();
                that._toggleMenu();
            });

            on(document, 'tap', function(){
                that._foldMenu();
                that._removeClass(iconEl);
            });

            delegate(document, 'tap', el.classifyListEl, function(e){
                e.stopPropagation();
            });

            delegate(document, 'tap', '#header', function(e){
                e.stopPropagation();
            });

            delegate(document, 'tap', el.classifyCeilTrigger, function(e){
                that._setClassify(e.currentTarget);
            });

        },
        /**
         * 初始获取标签id
         * @private
         */
        _getClassifyId: function(){
            var
                that = this,
                classifyId = DOM.attr(el.classifyTrigger, DATA_CLASSIFY_ID);

            S.mix(core, {
                classifyId: classifyId
            });
            that.classifyId = classifyId;
        },
        /**
         * 触发分类标签,发ajax
         * @param e
         * @private
         */
        _setClassify: function(e){
            var
                that = this,
                classifyId = DOM.attr(e, DATA_CLASSIFY_ID),
                href = DOM.attr(e, 'href').split('?')[0] + '?classifyId=' + classifyId;

            DOM.attr(e, 'href', href);
        },
        /**
         * 获取分类
         * @private
         */
        _getClassify: function(){
            var
                that = this,
                classifyInfoEl = query(el.classifyInfoEl, el.classifyTrigger),
                infoEl,
                classifyName,
                classifyId;

            S.each(classifyInfoEl, function(info){
                infoEl = query('input[type="hidden"]', info);
                classifyName = DOM.val(infoEl[0]);
                classifyId = DOM.val(infoEl[1]);
                that.info.push({
                    classifyName: classifyName,
                    classifyId: classifyId
                });
            });
        },
        /**
         * 展开\收起分类菜单
         * @private
         */
        _toggleMenu: function(){
            var
                that = this,
                iconEl = get('i', el.classifyTrigger),
                isOpen = DOM.hasClass(el.classifyTrigger, 'active') ? true : false;

            if(isOpen){
                that._removeClass(iconEl);
                that._foldMenu();
            }else{
                that._addClass(iconEl);
                that._unfoldMenu();
            }
        },
        /**
         * 展开分类菜单,添加效果
         * @param iconEl
         * @private
         */
        _addClass: function(iconEl){
            var
                that = this;

            DOM.addClass(iconEl, 'in');
            DOM.addClass(el.classifyTrigger, 'active');
        },
        /**
         * 收起分类菜单,删除效果
         * @param iconEl
         * @private
         */
        _removeClass: function(iconEl){
            var
                that = this;

            DOM.removeClass(iconEl, 'in');
            DOM.removeClass(el.classifyTrigger, 'active');
        },
        /**
         * 收起分类菜单
         * @private
         */
        _foldMenu: function(){
            var
                that = this;

            DOM.remove(el.classifyContainer);
        },
        /**
         * 展开分类菜单
         * @private
         */
        _unfoldMenu: function(){
            var
                that = this,
                classifyTpl = $(el.classifyTpl).html(),
                listStr = Juicer(classifyTpl, {
                    list: that.info
                }),
                listDOM = DOM.create(listStr);

            DOM.append(listDOM, 'body');
        }
    });
    return Core;
},{
    requires: [
        'core',
        'mod/juicer',
        'pio/common'
    ]
});

/*---------------------------头部搜索操作----------------------*/
KISSY.add('classify/search', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        on = S.Event.on,
        delegate = S.Event.delegate,
        searchIO = PW.io.Search,
        Juicer = PW.mod.Juicer,
        el = {
            //搜索框
            searchInput: '.J_searchInput',
            //搜索按钮
            searchIconEl: '.J_searchIcon',
            // 搜索结果列表容器div
            searchResultListEl: '.J_searchListOverlayer',
            // 搜索结果列表容器ul
            searchListUl: '.J_searchList',
            // 每个搜索结果li
            searchResultLi: '.search-result'
        },
        RESULT_TEMP = '<div class="search-list-overlayer J_searchListOverlayer">' +
                            '<ul class="search-list J_searchList">' +
                            '</ul>' +
                      '</div>',
        LIST_TEMP = '{@each data.list as it}'
                        +'<li class="search-result" data-id="&{it.dishId}">'
                        +'<a href="&{data.dishDetailSrc}&{it.dishId}"><i class="fa fa-clock-o icon"></i>&{it.name}<i class="fa fa-angle-right"></i></a>'
                        +'</li>'
                    +'{@/each}' ,
            NO_RESULT = '<li class="search-result"><a href="#"><i class="fa fa-search icon"></i>没有匹配项<i class="fa fa-angle-right"></i></a></li>';

    function Search(){
        this._init();
        this.dishListSrc;
    }

    S.augment(Search, {
        _init: function(){
            this._buildEvt();
            this._setOverlayer();
        },
        _buildEvt: function(){
            var 
                that = this,
                searchKey;
            on(el.searchInput, 'focus', function(){
                if(!S.one(el.searchResultListEl)){
                    that._unfoldList();
                }
            });

            on(el.searchInput, 'keyup', function(e){
                searchKey = DOM.val(el.searchInput);
                if(e.keyCode == "13" && searchKey){
                    window.location.href = that.dishListSrc + searchKey;
                }
            });
            
            on(el.searchIconEl, 'tap', function(){
                if(!S.one(el.searchResultListEl)){
                    that._unfoldList();
                }else{
                    searchKey = DOM.val(el.searchInput);
                    if(searchKey){
                        window.location.href = that.dishListSrc + searchKey;
                    }
                }
            })

            on(document, 'tap', function(){
                that._foldList();
            })

            // on(el.searchInput, 'keyup', function(){
            //     that._search();
            // });
            //搜索聚焦时，添加定时器
            on(el.searchInput, 'focusin', function () {
                that._addClock();
            });
            on(el.searchInput, 'focusout', function () {
                window.clearInterval(clock);
            });

            delegate(document, 'tap', el.searchResultLi, function(e){
                e.stopPropagation();
            });

            $(window).on('resize', function(){
                that._setOverlayer();
                DOM.css(el.searchResultListEl, 'height', that.height);
            });
        },
        _addClock: function () {
            var
                that = this,
                node = DOM.get(el.searchInput),
                str = DOM.val(node),
                nowNode,
                now;

            clock = window.setInterval(function(){
                nowNode = DOM.get(el.searchInput);
                    now = DOM.val(nowNode);
                if (now != null && now != str) {
                    that._search(now);
                    str = now;
                }
            }, 1000);
        },
        /**
         * 计算遮罩层的高度
         */
        _setOverlayer: function(){
            var
                that = this,
                headerHeight = DOM.outerHeight('#header'),
                footerHeight = DOM.outerHeight('#footer'),
                viewHeight = DOM.viewportHeight(),
                height = viewHeight - headerHeight - footerHeight;

            that.height = height;
        },
        /**
         * 展开列表
         * @return {[type]} [description]
         */
        _unfoldList: function(){
            var
                that = this,
                resultList = DOM.create(RESULT_TEMP);
            DOM.val(el.searchInput, '');
            DOM.insertAfter(resultList, '#header');
            DOM.css(resultList, 'height', that.height);
            DOM.addClass(resultList, 'in');
        },
        /**
         * 收起列表
         * @return {[type]} [description]
         */
        _foldList: function(){
            var
                that = this;
            DOM.val(el.searchInput, '');
            DOM.removeClass();
            DOM.remove(el.searchResultListEl, 'in');
        },
        /**
         * 搜索ajax
         * @return {[type]} [description]
         */
        _search: function(now){
            var
                that = this;

            searchIO.search({key:now}, function(rs, data, errMsg){
                if(rs){
                    that.dishListSrc = data.dishListSrc;
                    that._renderResultList(data);            
                }
            })
        },
        /**
         * 渲染搜索后的结果
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _renderResultList: function(data){
            var
                that = this,
                resultList = Juicer.client(LIST_TEMP, {data:data});
            if(data.list.length != 0){
                resultList = Juicer.client(LIST_TEMP, {data:data});
                DOM.empty(el.searchListUl);
                DOM.append($(resultList), el.searchListUl);
            }else{
                DOM.empty(el.searchListUl);
                DOM.append($(NO_RESULT), el.searchListUl);
            }
        }
    })
    return Search;
}, {
    requires:[
        'core',
        'mod/juicer',
        'pio/search'
    ]
})