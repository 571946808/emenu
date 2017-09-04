/*-----------------------------------------------------------------------------
* @Description:     原配料管理
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013/12/19 16:58:42
* ==NOTES:=============================================
* v1.0.0(2013/12/19 16:58:43):
*     初始生成
* ---------------------------------------------------------------------------*/


KISSY.add(function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        IngredientIO = PW.io.Ingredient,
        INGREDIENT_ID_ATTR = 'data-ing-id',
        el = {
            //原材料搜索form
            ingSearchForm:  '#J_ingSearch',
            //搜索结果列表容器
            ingSearchList:  '#J_ingSearchList',
            //单条原材料的选择类
            ingItem:        '.list-group-item',
            //已标缺原材料列表容器
            ingWarnedList:  '#J_warnedIngList',
            //原材料搜索结果模版
            searchListTpl:  '#J_searchListTpl',
            //已标缺原材料模版
            ingWarnListTpl: '#J_ingWarnListTpl',
            //原材料模版索引类
            ingNameWrapper: '.ing-name'
        };

    function Ingredient(){
        this._init();
    }

    S.augment(Ingredient, {
        _init: function(){
            this._addEvtDispatcher();
        },
        _addEvtDispatcher: function(){
            var
                that = this;
            //原材料查询
            on(el.ingSearchForm, 'submit', that._ingSearchHandler, that);
            //当点击原材料搜索结果列表项时
            delegate(el.ingSearchList, 'click', el.ingItem, that._ingMoveInHandler, that);
            //当点击已标缺原材料时恢复供应
            delegate(el.ingWarnedList, 'dblclick', el.ingItem, that._ingMoveOutHandler, that);
        },
        /**
         * 原材料查询句柄，用于查询尚未标缺的所有原材料
         * @param  {EvtObject} ev 事件对象
         */
        _ingSearchHandler: function(ev){
            var
                that = this,
                data = DOM.serialize(el.ingSearchForm);
            IngredientIO.search(data, function(rs, data, errMsg){
                if(rs){
                    that._renderIngSearchItem(data);
                }else{
                    alert(errMsg);
                }
            })
            return false;
        },
        /**
         * 原材料标缺句柄
         */
        _ingMoveInHandler: function(ev){
            var 
                that = this,
                t = ev.target,
                li,
                ingId;
            //获得当前点击的li
            li = (!DOM.hasClass(t, el.ingItem.substr(1))) ? 
                    DOM.parents(t, el.ingItem):
                    t;
            //获得配料id
            ingId = DOM.attr(li, INGREDIENT_ID_ATTR);
            //发送标缺请求
            IngredientIO.movein({
                id: ingId
            }, function(rs, data, errMsg){
                if(rs){
                    DOM.remove(li);
                    that._renderIngWarnItem({
                        id: DOM.attr(li, INGREDIENT_ID_ATTR),
                        name: $(li).one(el.ingNameWrapper).text()
                    });        
                }else{
                    alert(errMsg);
                }
            })
        },
        /**
         * 原材料恢复供应标识句柄
         */
        _ingMoveOutHandler: function(ev){
            var
                that = this,
                t = ev.target,
                li,
                ingId;
            //获取当前点击的li element
            li = (!DOM.hasClass(t, el.ingItem.substr(1))) ?
                    DOM.parents(t, el.ingItem):
                    t;
            //获取已标缺原材料
            ingId = DOM.attr(li, INGREDIENT_ID_ATTR);
            IngredientIO.moveout({
                id: ingId
            }, function(rs, data, errMsg){
                if(rs){
                    DOM.remove(li);
                }else{
                    alert(errMsg);
                }
            })
        },
        /**
         * 根据ingData 渲染搜索结果的未标缺原材料组
         * @param  {Obj} ingData ingData.ingredientList
         */
        _renderIngSearchItem: function(ingData){
            var
                that = this,
                html = '';
            html = S.juicer(
                $(el.searchListTpl).html(),
                ingData
            );
            $(el.ingSearchList).html(html);
        },
        /**
         * 根据传入的原材料数据，渲染一条新的已标缺原材料
         * @param  {Obj} ingItemData   包含ingItemData.id  ingItemData.name
         */
        _renderIngWarnItem: function(ingItemData){
            var
                that = this;
            html = S.juicer(
                $(el.ingWarnListTpl).html(),
                ingItemData
            )
            $(el.ingWarnedList).append(html);
        }
    })

    PW.namespace('page.Ingredient');
    PW.page.Ingredient = function(){
        return new Ingredient();
    }
},{
    requires:[
        'io/ingredient',
        'core',
        'mod/juicer',
        'mod/ext'
    ]
});