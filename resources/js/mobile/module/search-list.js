/*-----------------------------------------------------------------------------
 * @Description:     搜索列表头部
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.25
 * ==NOTES:=============================================
 * v1.0.0(2016.01.25):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('module/search-list', function(S, Search){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        el = {
            // 搜索图片节点
            searchIconEl: '.J_searchIcon'
        },
        SEARCH_LIST = 'search-list',
        SearchList = {
            client: function(param){
                new Search(param);
            },
            refresh: function(){
                var
                    that = this;

                // S.each(query(el.searchIconEl), function(o){
                //     DOM.data(o, SEARCH_LIST, that.client({
                //         url: DOM.attr(o, 'data-url')
                //     }));
                // });
                S.each(query(el.searchIconEl), function(o){
                    DOM.data(o, SEARCH_LIST, that.client());
                });
            }
        };

    S.ready(function(){
        SearchList.refresh();
    });
    PW.namespace('module.SearchList');
    PW.module.SearchList = SearchList;
    return SearchList;
},{
    requires: [
        'search-list/core'
    ]
});

KISSY.add('search-list/core', function(S){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer.client,
        SearchIO = PW.io.Search,
        el = {
            // 搜索图片节点
            searchIconEl: '.J_searchIcon',
            // 搜索输入框
            searchInputEl: '.J_searchInput',
            // 搜索结果列表容器
            searchResultListEl: '.J_searchListOverlayer',
            // 搜索结果列表
            searchListEl: '.J_searchList',
            // 每个搜索结果li
            searchResultLi: '.search-result'
        },
        // LIST_TEMP = '{@each list as it}<li class="search-result" data-id="&{it.id}"><a href="#?&{it.id}"><i class="fa fa-clock-o icon"></i>&{it.name}<i class="fa fa-angle-right"></i></a></li>{@/each}',
        RESULT_TEMP = '<div class="search-list-overlayer J_searchListOverlayer">' +
                            '<ul class="search-list J_searchList">' +
                            '</ul>' +
                      '</div>',
        NO_RESULT = '<li class="search-result"><a href="#"><i class="fa fa-search icon"></i>没有匹配项<i class="fa fa-angle-right"></i></a></li>';

    function Search(param){
        this.opts = param;
        this._init();
        this.dishListSrc;
    }
    S.augment(Search, {
        _init: function(){
            this._setOverlayer();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            on(el.searchIconEl, 'tap', function(e){
                if(!S.one(el.searchResultListEl)){
                    that._setOverlayer();
                    that._unFoldSearchInput();
                    that._unFoldSearchList();
                }else{
                    if(DOM.val(el.searchInputEl)){
                        window.location.href = that.dishListSrc + DOM.val(el.searchInputEl);
                    }
                }
            });

            on(el.searchInputEl, 'keyup', function(e){
                if(e.keyCode == "13" && DOM.val(el.searchInputEl)){
                    window.location.href = that.dishListSrc + DOM.val(el.searchInputEl);
                }
            })

            on(document, 'tap', function(){
                that._foldSearchInput();
                that._foldSearchList();
            });

            on('.header', 'tap', function(e){
                e.stopPropagation();
            });

            on(el.searchListEl, 'tap', function(e){
                e.stopPropagation();
            });

            delegate(document, 'tap', el.searchResultLi, function(e){
                e.stopPropagation();
            })
            //搜索聚焦时，添加定时器
            on(el.searchInputEl, 'focusin', function () {
                that._addClock();
            });
            // on(el.searchInputEl, 'keyup', function(S){
            //     that._search();
            // });
            on(el.searchInputEl, 'focusout', function () {
                window.clearInterval(clock);
            });

            $(window).on('resize', function(){
                that._setOverlayer();
                DOM.css(el.searchResultListEl, 'height', that.height);
            });
        },
        _addClock: function () {
            var
                that = this,
                node = DOM.get(el.searchInputEl),
                str = DOM.val(node),
                nowNode,
                now;

            clock = window.setInterval(function(){
                nowNode = DOM.get(el.searchInputEl);
                now = DOM.val(nowNode);
                if (now != null && now != str) {
                    that._search(now);
                    str = now;
                }
            }, 1000);
        },

        _setOverlayer: function(){
            var
                that = this,
                viewportHeight = DOM.viewportHeight(),
                headerHeight = DOM.outerHeight('#header'),
                footerHeight = DOM.outerHeight('#footer');
                height = viewportHeight - headerHeight - footerHeight;

            that.height = height;
        },
        _search: function(now){
            var
                that = this;
            SearchIO.search({key: now}, function(rs, data, errMsg){
                if(rs){
                    that.dishListSrc = data.dishListSrc;
                    that._renderResultList(data);
                }else{
                    //PW.widget.Dialog.alert(123);
                }
            });
        },
        _renderResultList: function(data){
            var
                that = this,
                listStr,
                // url = that.opts.url;
                url = data.dishDetailSrc;

            if(data.list.length > 0){
                LIST_TEMP = that._getTemp(url);
                listStr = Juicer(LIST_TEMP, {data: data});
                DOM.html(el.searchListEl, '');
                DOM.html(el.searchListEl, listStr);
            }else{
                DOM.html(el.searchListEl, '');
                DOM.html(el.searchListEl, NO_RESULT);
            }

        },
        _getTemp: function(url){
            var
                that = this;

            return '{@each data.list as it}<li class="search-result" data-id="&{it.dishId}"><a href="' + url + '&{it.dishId}"><i class="fa fa-clock-o icon"></i>&{it.name}<i class="fa fa-angle-right"></i></a></li>{@/each}';
        },
        _foldSearchList: function(){
            var
                that = this;

            DOM.removeClass(el.searchResultListEl, 'in');
            DOM.remove(el.searchResultListEl);
        },
        _unFoldSearchList: function(){
            var
                that = this,
                listStr = Juicer(RESULT_TEMP, {}),
                listEl = DOM.create(listStr);

            DOM.insertAfter(listEl, '#header');
            DOM.addClass(el.searchResultListEl, 'in');
            DOM.css(el.searchResultListEl, 'height', that.height);
        },
        _foldSearchInput: function(){
            var
                that = this;

            DOM.removeClass(el.searchIconEl, 'in');
            DOM.removeClass(el.searchInputEl, 'in');
        },
        _unFoldSearchInput: function(){
            var
                that = this,
                searchInput = get(el.searchInputEl);

            DOM.addClass(el.searchInputEl, 'in');
            DOM.addClass(el.searchIconEl, 'in');
            searchInput.focus();
            DOM.val(searchInput, '');
        }
    });
    return Search;
},{
    requires: [
        'pio/search',
        'mod/juicer',
        'widget/dialog',
        'core'
    ]
});