/*-----------------------------------------------------------------------------
 * @Description:     搜索下拉组件
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.12.02
 * ==NOTES:=============================================
 * v1.0.0(2015.12.02):
 * 目前有已下几种方式：搜索下拉、多选tag、ajax搜索下拉
 * 注意：后台套页时要把搜索物品的id渲染到option的value里面
 * (2016.4.19)
 * 实现功能：可根据搜索的具体情况，返回不同的json数据 by hujun
 *     1.增加了config中的urlCoreParam参数，该参数的值应与url-core中的第一个参数的值相同
 *     2.搜索后会必须要返回相应的json数据，因此该参数为必配参数
 * ---------------------------------------------------------------------------*/
KISSY.add('module/search-select-new', function(S, Core){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        $ = S.all,
        el = {
            // 搜索下拉触发器
            selectTrigger: '.selectpicker'
        },
        Select = {
            client: function(param){
                return new Core(param);
            },
            refresh: function(){
                var
                    that = this;
            }
        };
    S.ready(function(){
        Select.refresh();
    });
    PW.namespace('module.SearchSelect');
    PW.module.SearchSelect = Select;
    return Select;
},{
    requires: [
        'select/core'
    ]
});

KISSY.add('select/core', function(S, TagEdit){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        SelectIO = PW.io.Module.SearchSelect,
        config = {
            // 是否带有搜索输入框
            liveSearch: true,
            // 搜索输入框中的提示信息
            liveSearchPlaceholder: null,
            // 搜索时是否发送给后台进行查找
            sendAjax: true,
            // 是否多选
            multiple: false,
            // 模拟的下拉列表渲染处
            root: undefined,
            // 是否渲染选中项时,将input隐藏域也渲染上
            hasHiddenInput: false,
            // input隐藏域的name值
            inputName: '',
            // 是否在对话框中进行操作
            inDlg: false,
            // 多选情况下,是否存在已经有tag,即编辑情况下
            isEdit: false,
            //urlList为url-core中第一个参数 --add by hujun
            urlCoreParam: '',
            index:0
        },
        el = {
            //搜索输入框
            inputEl: '.focusedInput'
        };
        opts = [];

    function Plugin(param){
        opts[param.index] = S.merge(config, param);
        // this.opts = opts[];
        S.log(opts);
        this.$element = opts[param.index].selectPicker;
        S.mix(opts[param.index], {
            selectStyle: PW.Env.modSettings.select,
            loadCss: true
        });
        this._init(param);
    }

    S.augment(Plugin, S.EventTarget, {
        _init: function(param){
            if(opts[param.index].loadCss){
                this._loadCSS(param.index);
            }
            this.newElement = this._getOptions(param.index);
            this._createView(param.index);
            this._buildEvt(param.index);
        },
        _loadCSS: function(index){
            var
                that = this,
                linkEl = S.one('#J_selectCSS', 'html');

            if(!linkEl){
                that._loadStyle(index);
            }
        },
        _buildEvt: function(index){
            var
                that = this;

            delegate(document, 'click', '.J_renderTo', function(e){
                index = $(e.currentTarget).attr('data-index');
                e.stopPropagation();
                that.currentTarget = e.currentTarget;
                that._openMenu(e.currentTarget, index);
                if(!opts[index].multiple){
                    that._selectLi();
                }else{
                    that._selectMulLi(index);
                }
                that._selectLi(index);
            });

            delegate(document, 'click', el.inputEl, function(e){
                e.stopPropagation();
            });

            on(document, 'click', function(){
                if(opts[index].multiple){
                    that._collectActiveLi(index);
                }
                that._closeMenu(index);
            });

            delegate(document, 'click', '.render-list', function(e){
                var divEl = $(e).parent('.drop'),
                    renderTo = $(divEl).children('.J_renderTo');
                //index = $(renderTo).attr('data-index');
                e.stopPropagation();
                that._renderSearchResult(index, e.currentTarget);

            });

            delegate(document, 'click', '.J_delSelectTag', function(e){
                e.stopPropagation();
                that._delSelectTag(e.target,index);
            });

            if(opts[index].sendAjax){
                delegate(document, 'keyup', el.inputEl, function(e){
                    that._sendAjax(DOM.val(e.currentTarget), e.currentTarget, opts[index].urlCoreParam, index);
                });
            }

            if(opts[index].inDlg){
                delegate(document, 'click', '[data-dlg-btn="btn"], .dlg-icon', function(e){
                    S.Event.undelegate(document, 'keyup', el.inputEl);
                    e.stopPropagation();
                });
            }
        },
        /**
         * 点击触发器且多选时,在下拉列表中选中已经渲染过的
         * @private
         */
        _selectMulLi: function(index){
            var
                that = this,
                renderListTag = query('.select-tag', '.J_renderTo'),
                ulEl = get('ul', opts[index].root),
                lisEl = query('li', ulEl);

            S.each(renderListTag, function(item){
                S.each(lisEl, function(li){
                    if(DOM.attr(item, 'data-result-id') == DOM.attr(li, 'data-id')){
                        DOM.addClass(li, 'active');
                    }
                });
            });
        },
        /**
         * 对外接口,可以重新加载多选组件
         */
        reload: function(){
            var
                that = this;

            if(that.currentTarget == null || that.currentTarget == undefined){
                that.currentTarget = get('.J_renderTo', that.opts.root);
            }
            that._detachEvt();
            that._init(S.mix(that.opts, {
                loadCss: false
            }));
        },
        /**
         * 对外接口,展开搜索下拉列表
         */
        unfold: function(){
            var
                that = this;
            if(that.currentTarget == null || that.currentTarget == undefined){
                that.currentTarget = get('.J_renderTo', that.opts.root);
            }
            that._openMenu(that.currentTarget, index);
        },
        /**
         * 解绑事件
         * @private
         */
        _detachEvt: function(){
            var
                that = this,
                event = S.Event;

            event.undelegate(document, 'click', '.J_renderTo');
            event.undelegate(document, 'click', el.inputEl);
            event.undelegate(document, 'click', '.render-list');
            event.detach(document, 'click');
            event.undelegate(document, 'click', '.J_delSelectTag');
            event.undelegate(document, 'keyup', el.inputEl);
        },
        /**
         * 如果是多选,点击"x"删除
         * @param e
         * @private
         */
        _delSelectTag: function(e, index){
            var
                that = this,
                tagEl = DOM.parent(e, '.select-tag'),
                id = DOM.attr(tagEl, 'data-result-id'),
                ulEl = get('ul', opts[index].root),
                lisEl = query('li', ulEl),
                liEl;

            DOM.remove(tagEl);
            for(var i = 0; i < lisEl.length; i ++){
                liEl = lisEl[i];
                if(DOM.attr(liEl, 'data-id') == id){
                    DOM.removeClass(liEl, 'active');
                    break;
                }
            }
        },
        /**
         * 如果是多选,收集所有选中项
         * @private
         */
        _collectActiveLi: function(index){
            var
                that = this,
                ulEl = get('ul', opts[index].root),
                lisEl = query('li', ulEl),
                activeLi = [];

            S.each(lisEl, function(li){
                if(DOM.hasClass(li, 'active')){
                    activeLi.push({
                        id: DOM.attr(li, 'data-id'),
                        name: DOM.attr(li, 'data-name'),
                        price: DOM.attr(li, 'data-price'),
                        unit: DOM.attr(li, 'data-unit')
                    });
                }
            });
            // 将选中项渲染到展示区
            that._renderMul(activeLi, index);
        },
        /**
         * 渲染选中项到展示区
         * @param e
         * @private
         */
        _renderSearchResult: function(index,e){
            var
                that = this,
                text = DOM.text(e),
                id = DOM.attr(e, 'data-id'),
                price = DOM.attr(e, 'data-price'),
                unit = DOM.attr(e, 'data-unit'),
                renderTo = get('.J_renderTo', opts[index].root);

            if(!opts[index].multiple){
                DOM.html(renderTo, text + '<span class="caret"></span>');
                DOM.attr(renderTo, 'data-result-name', text);
                DOM.attr(renderTo, 'data-result-id', id);
                DOM.attr(renderTo, 'data-result-price', price);
                DOM.attr(renderTo, 'data-result-unit', unit);
                that._closeMenu(index);
                that.fire('selectAfter', {
                    extendParam: {
                        price: DOM.attr(renderTo, 'data-result-price'),
                        unit: DOM.attr(renderTo, 'data-result-unit')
                    }
                });
            }else{
                DOM.addClass(e, 'active');
            }
        },
        /**
         * 多选时,渲染选中项到展示区
         * @param activeLiArray
         * @private
         */
        _renderMul: function(activeLiArray, index){
            var
                that = this,
                text = '',
                renderListTag = query('.select-tag', '.J_renderTo'),
                // 已经渲染过的taglist的长度
                renderListLength = renderListTag.length,
                // 下拉列表中选中项的长度
                activeListLength = activeLiArray.length,
                renderTo = get('.J_renderTo', opts[index].root),
                renderList,
                activeList,
                mergeList;

            renderList = that._getRenderList(renderListTag);
            activeList = that._getActiveList(activeLiArray);
            mergeList = that._getMergeList(renderList, renderListLength, activeList, activeListLength);

            if(opts[index].hasHiddenInput){
                for(var k = 0; k < mergeList.length; k ++){
                    text += '<div class="select-tag" data-result-id="' + mergeList[k].id +'" data-result-name="' + mergeList[k].name +'" data-result-price="' + mergeList[k].price +'" data-result-unit="' + mergeList[k].unit + '">' + mergeList[k].name +'<i class="fa fa-times J_delSelectTag"></i><input type="hidden" name="' + opts[index].inputName + '" value="' + mergeList[k].id + '" /></div>&nbsp;';
                }
            }else{
                for(var m = 0; m < mergeList.length; m ++){
                    text += '<div class="select-tag" data-result-id="' + mergeList[m].id +'" data-result-name="' + mergeList[m].name +'" data-result-price="' + mergeList[m].price +'" data-result-unit="' + mergeList[m].unit + '">' + mergeList[m].name +'<i class="fa fa-times J_delSelectTag"></i></div>&nbsp;';
                }
            }

            text += '<span class="caret"></span>';
            DOM.html(renderTo, text);
        },
        /**
         * 获取已经渲染好的tag列表
         * @param renderListTag
         * @private
         */
        _getRenderList: function(renderListTag){
            var
                that = this,
                renderList = [];

            S.each(renderListTag, function(item){
                renderList.push({
                    id: DOM.attr(item, 'data-result-id'),
                    name: DOM.attr(item, 'data-result-name'),
                    price: DOM.attr(item, 'data-result-price'),
                    unit: DOM.attr(item, 'data-result-unit')
                });
            });
            return renderList;
        },
        /**
         * 获取下拉列表中选中的项
         * @param activeLiArray
         * @private
         */
        _getActiveList: function(activeLiArray){
            var
                that = this,
                activeList = [];

            S.each(activeLiArray, function(item){
                activeList.push({
                    id: item.id,
                    name: item.name
                });
            });
            return activeList;
        },
        /**
         * 合并最终得到的项
         * @param renderList
         * @param renderListLength
         * @param activeList
         * @param activeListLength
         * @returns {Array}
         * @private
         */
        _getMergeList: function(renderList, renderListLength, activeList, activeListLength){
            var
                that = this,
                mergeList = [],
                i = 0, j = 0;

            while(i < renderListLength && j < activeListLength){
                if(renderList[i].id == activeList[j].id){
                    mergeList.push(renderList[i]);
                    i ++;
                    j ++;
                }else if(renderList[i].id < activeList[j].id){
                    mergeList.push(activeList[j]);
                    j ++;
                }else{
                    mergeList.push(renderList[i]);
                    i ++;
                }
            }
            while (i < renderListLength) {
                mergeList.push(renderList[i++]);
            }
            while(j < activeListLength){
                mergeList.push(activeList[j++]);
            }

            return mergeList;
        },
        /**
         * 如果是输入搜索,进行ajax发送,如果不是与后端交互,即采用map搜索功能(后面再开发)
         * @param text
         * @param e
         * @private
         */
        _sendAjax: function(text, e, urlCoreParam,index){
            var
                that = this,
                ulEl = DOM.parent(e, 'ul');
            that._tip(ulEl);

            // //initial code:
            // SelectIO.getName({keyword: text}, function(rs, list, errMsg){
            //     if(rs){
            //         that._renderList(list, e);
            //     }else{
            //         S.log('系统异常!');
            //     }
            // });
            
            if(urlCoreParam){
                SelectIO.getName({keyword: text}, function(rs, list, errMsg){
                    if(rs){
                        that._renderList(list, e, index);
                    }else{
                        S.log('系统异常');
                    }
                }, urlCoreParam);
            }else{
                S.log('未配置组件的urlCoreParam参数');
            }
        },
        /**
         * 将接收到的结果渲染到模拟列表中,即渲染到搜索框下方区域
         * @param list
         * @param e
         * @private
         */
        _renderList: function(list, e,index){
            var
                that = this,
                ulEl = DOM.parent(e, 'ul'),
                tipEl = get('.J_searchTip', ulEl),
                lisEl = query('li', ulEl),
                lis = '',
                listDOM,
                searchBoxInput;

            DOM.remove(tipEl);
            DOM.remove(lisEl);
            S.each(list, function(it){
                lis += '<li class="render-list" data-price="' + it.price + '" data-name="' + it.name + '" data-id="' + it.id + '" data-code="' + it.assistantCode + '" data-unit="' + it.unit + '"><a href="javascript:;">'+ '[' + it.assistantCode + '] ' + it.name + '</a></li>';
            });
            listDOM = DOM.create(lis);
            searchBoxInput = get('.search-box-input', opts[index].root);
            DOM.insertAfter(listDOM, searchBoxInput);
        },
        /**
         * 搜索提示
         * @param ul
         * @private
         */
        _tip: function(ul){
            var
                that = this,
                lisEl = query('li', ul),
                pEls = query('p', ul),
                tip = DOM.create('<p class="J_searchTip margin-top-15 padding-left-15 padding-right-15 margin-top-15">正在加载,请稍后...</p>');
            
            DOM.empty(pEls);
            DOM.remove(lisEl);
            DOM.append(tip, ul);
        },
        /**
         * 关闭搜索列表
         * @private
         */
        _closeMenu: function(index){
            var
                that = this,
                menuEl = get('ul', opts[index].root);
            S.log(index);

            DOM.addClass(menuEl, 'hidden');
        },
        /**
         * 打开搜索列表
         * @param e
         * @private
         */
        _openMenu: function(e, index){
            var
                that = this,
                menuEl = DOM.next(e, 'ul'),
                searchInput;

            DOM.removeClass(menuEl, 'hidden');
            searchInput = get(el.inputEl, opts[index].root);
            if(searchInput){
                searchInput.focus();
            }
        },
        /**
         * 动态加载selectpicker的css
         * @private
         */
        _loadStyle: function(index){
            var
                that = this;
            S.loadCSS(opts[index].selectStyle.themeUrl, {id: 'J_selectCSS'});
        },
        /**
         * 初始化时,将列表全部收集,转换为li进行模拟
         * @returns {string}
         * @private
         */
        _getOptions: function(index){
            var
                that = this,
                text,id,price,assistantCode, unit,
                newElement = '<div class="drop clearfix">' +
                                '<div class="J_renderTo render-div clearfix" data-index="' + index+ '">' +
                                    '<span class="caret"></span>' +
                                '</div>' +
                                '<ul class="menu hidden">';

            S.each($(that.$element).children(), function(item){
                text = $(item).html();
                id = $(item).attr('value');
                price = $(item).attr('data-price');
                assistantCode = $(item).attr('data-code');
                unit = $(item).attr('data-unit');
                newElement += '<li class="render-list" data-price="' + price + '" data-id="' + id + '" data-name="' + text + '" data-code="' + assistantCode + '" data-unit="' + unit + '"><a href="javascript:;">' + '[' + assistantCode + '] ' +  text + '</a></li>';
            });
            newElement += '</ul></div>';
            return newElement;
        },
        /**
         * 创建出下拉列表
         * @private
         */
        _createView: function(index){
            var
                that = this,
                newElementDOM = DOM.create(that.newElement),
                searchBoxDOM,
                ulEl;

            DOM.append(newElementDOM, opts[index].root);
            DOM.addClass(that.$element, 'hidden');
            if(opts[index].isEdit){
                that._renderEditTag(index);
            }
            if(!opts[index].multiple){
                DOM.css('.J_renderTo', 'min-height', '32px');
            }
            // 如果带有输入框搜索,添加搜索输入框
            if(opts[index].liveSearch){
                var
                    searchBox = '<div class="search-box-input"><input type="text" class="form-control focusedInput"><span class="fa fa-search search-box" aria-hidden="true"></span></div>';
                if(that.currentTarget == null || that.currentTarget == undefined){
                    that.currentTarget = get('.J_renderTo', opts[index].root);
                }
                searchBoxDOM = DOM.create(searchBox);
                ulEl = DOM.next(that.currentTarget, 'ul');
                DOM.prepend(searchBoxDOM, ulEl);
            }
        },
        _renderEditTag: function(index){
            var
                that = this;

            new TagEdit(opts[index]);
        },
        /**
         * 搜索时显示上次选中的项
         * @private
         */
        _selectLi: function(index){
            var
                that = this,
                ulEl = DOM.next(that.currentTarget, 'ul'),
                renderToEl = get('.J_renderTo', opts[index].root),
                id = DOM.attr(renderToEl, 'data-result-id'),
                lis = query('li', ulEl);

            DOM.removeClass(lis, 'active');
            S.each(lis, function(li){
                if(DOM.attr(li, 'data-id') == id){
                    DOM.addClass(li, 'active');
                }
            });
        }
    });

    return Plugin;
},{
    requires: [
        // 'search-select/tag-edit',
        'pio/module/search-select',
        'mod/ext'
    ]
});
/**
 * 处理在编辑的情况下,对多选时的操作,
 * 菜品管理-口味有用过
 */
KISSY.add('search-select/tag-edit', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        config = {
            // 是否渲染隐藏域
            hasHiddenInput: false
        },
        el = {
            tagEditEl: '.J_tagEdit'
        };

    function TagEdit(param){
        this.opts = param;
        //S.log(this.opts)
        this._init();
    }

    S.augment(TagEdit, {
        _init: function(){
            this._getEditTag();
        },
        _getEditTag: function(){
            var
                that = this,
                spansEl = query(el.tagEditEl, that.opts.root),
                html = '';

            if(that.opts.hasHiddenInput){
                S.each(spansEl, function(span){
                    var
                        id = DOM.attr(span, 'data-result-id'),
                        name = DOM.attr(span, 'data-result-name'),
                        price = DOM.attr(span, 'data-result-price');
                    html += '<span class="select-tag" data-result-id="' + id +'" data-result-name="' + name +'" data-result-price="' + price +'">' + name +'<i class="fa fa-times J_delSelectTag"></i><input type="hidden" name="' + that.opts.inputName + '" value="' + id + '"/></span>&nbsp;';
                });
            }

            html += '<span class="caret"></span>';
            DOM.html('.J_renderTo', html);
        }
    });

    return TagEdit;
});