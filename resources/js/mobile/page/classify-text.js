/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--文字版
 * @Version:         1.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.03.09
 * ==NOTES:=============================================
 * v1.0.0(2016.03.09):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/classify-text', function(S, Order, Scroll){
    PW.namespace('page.Classify');
    PW.page.Classify = function(param){        
        new Order();
        new Scroll(param);
    }
},{
    requires: [
    'classify-text/order',
    'classify-text/scroll'
    ]
})
/*
*滚动条相关操作
 */
KISSY.add('classify-text/scroll', function(S, Common){

    var 
        DOM = S.DOM,
        on = S.Event.on,
        Juicer = PW.mod.Juicer.client,
        ClassifyIO = PW.io.ClassifyText,
        fire = S.Event.fire,
        el = {
            //分类div
            classifyEl: '.J_classify',
            //菜品列表模板
            dishTemp: '#dishTpl',
            //菜品容器
            dishListEl: '.J_scroll',
            //存放搜索关键字的隐藏input，在header中
            keywordInp: '.J_keyword'
        },
        DATA_CLASSIFY_ID = 'data-classify-id';

    function Scroll(){
        // scroll = {
        //     page: 0,
        //     common: new Common()
        // }
        // S.mix(scroll, {
        //     page: 0,
        //     common: new Common()
        // });
        // this.qwe = {
        //     page: 0,
        //     common: new Common()
        // };
        scroll = {
            page: 0,
            common: new Common()
        };
        this._init();
    }
    S.augment(Scroll, {
        _init: function(){
            this._initIscroll();
            this._buildEvt();
            this._load();
        },
        _buildEvt: function(){
            var
                that = this,
                common = scroll.common;

            common.on('showDishNumber', function(e){
                common.showDishNumber(el.dishListEl);
            });
        },
        /**
         * 初始化滚动条
         * @private
         */
        _initIscroll: function(){
            var
                that = this;

            // 滚动条对象
            that.iscroll = PW.module.Iscroll.client({
                // 滚动条所包括的范围
                id: "wrapper",
                pullDownAction: that._refresh,
                pullUpAction: that._load,
                // 除了li之外,其他也要加载滚动内容中的节点
                // extraNode: [],
                // 是否懒加载
                isLazyLoad: false
                // 参与懒加载的节点class
                // lazyLoadRenderTo: 'lazy-load'
            }).iscroll;
        },
        /**
         * 下拉操作,页面刷新
         * @private
         */
        _refresh: function(){
            var
                that = this;

            window.location.reload();
        },
        /**
         * 上拉操作: 请求更多
         * @private
         */
        _load: function(){
            var
                // this指向iscroll
                that = this,
                dishTemp,
                dishStr,
                dishDOM,
                iscroll = this.iscroll,
                common = scroll.common,
                page = scroll.page,
                classifyId = $(el.classifyEl).attr(DATA_CLASSIFY_ID),
                keyword = DOM.val(el.keywordInp);
                 
            S.mix(scroll, {
                page: page + 1
            });
            // 发送请求
            ClassifyIO._getDishList({
                page: scroll.page,
                pageSize: 15,
                classify: classifyId,
                keyword: keyword
            }, function(rs, list, errMsg){
                if(rs){
                    dishTemp = DOM.html(el.dishTemp);
                    dishStr = Juicer(dishTemp, {
                        list: list
                    });
                    dishDOM = DOM.create(dishStr);
                    DOM.append(dishDOM, el.dishListEl);
                    // 如果新添加的菜品有被点过,则显示数量
                    common.fire('showDishNumber');
                    iscroll.refresh();
                }else{
                    var
                        pullUpEl = get('#pullUp', 'body'),
                        pullUpLabel = get('.pullUpLabel', pullUpEl),
                        loader = get('.loader', pullUpEl);

                    DOM.css(loader, 'display', 'none');
                    DOM.removeClass(pullUpEl, 'loading');
                    DOM.text(pullUpLabel, '亲,您已经看完了!');
                }
            });
        },
    })
    return Scroll;
}, {
    requires:
    [
        'classify-text/common',
        'pio/classify-text',
        'module/iscroll',
        'mod/juicer',
        'core'
    ]
})
/*
*顾客点餐相关操作
 */
KISSY.add('classify-text/order', function(S, Common){
    var 
        DOM = S.DOM, $ = S.all, delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer.client,
        ClassifyIO = PW.io.ClassifyText,
        Dialog = PW.widget.Dialog,
        el = {
            //点餐触发器
            addDishTrigger: '.J_addDish',
            //列表头部的装饰圆圈
            circleEl:'.fa-circle-o',
            //存放点菜总数的El
            dishTotalNumberEl: '.J_dishTotalNumber',
            //我的订单
            myOrder: '.J_myOrder',
        },
        //单个菜品数量
        DATA_DISH_NUMBER = 'data-dish-number',
        //菜品Id          
        DATA_DISH_ID = 'data-dish-id',
        //菜品总数量
        DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number',
        //分类Id
        DATA_CLASSIFY_ID = 'data-classify-id';

    function Order(){
        this.common = new Common();
        this._init();
    }
    
    S.augment(Order, {
        _init: function(){
            this.common.showDishNumber('body');
            this._buildEvt();
        },

        /**
         * 事件绑定
         * @return {[type]} [description]
         */
        _buildEvt: function(){
            var 
                that = this;
            
            delegate(document, 'tap', el.addDishTrigger, function(e){
                that._addDish(e.currentTarget);
            })
            $('#header').on('renderDishList', function(e){
                S.log(123);
            })
        },
        /**
         * 处理点餐事件
         * @param {[type]} e [description]
         */
        _addDish: function(e){
            var 
                that = this,
                number,
                dishNumber = DOM.attr(e, DATA_DISH_NUMBER);
            
            number =  dishNumber == '' ? 1: parseInt(dishNumber) +1;
            that._sendDishInfo(e, number);
        },
        /**
         * 发送菜品Id 用户Id
         * @param  {[type]} e      [description]
         * @param  {[type]} number [description]
         * @return {[type]}        [description]
         */
        _sendDishInfo: function(e, number) {
            var 
                that = this,
                dishId = $(e).parent('li').attr(DATA_DISH_ID),
                data = {
                    dishId: dishId
                };
            
            ClassifyIO._addDish(data, function(rs, errMsg){
                if(rs){
                    that._renderAddNumber(e, number);
                    that._calTotalNumber();
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染单个菜品数量
         * @param  {[type]} target [description]
         * @param  {[type]} number [description]
         * @return {[type]}        [description]
         */
        _renderAddNumber: function(target, number){
            var 
                that = this,
                numberEL = DOM.get('span', target),
                dishLi = $(target).parent('li'),
                circleEl = DOM.get(el.circleEl, dishLi);
            //S.log('circleEl' + circleEl);
            
            DOM.attr(target, DATA_DISH_NUMBER, number);
            DOM.text(numberEL, number);
            DOM.removeClass(numberEL, 'hidden');
            DOM.addClass(circleEl, 'active');
        },
        /**
         * 计算点餐总数
         * @return {[type]} [description]
         */
        _calTotalNumber: function(){
            var 
                that = this,
                dishTotalNumber = DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER);
            if(dishTotalNumber == '' || dishTotalNumber == undefined){
                dishTotalNumber = 1;
            }else{
                dishTotalNumber = parseInt(dishTotalNumber) + 1;
            }
            that._renderTotalNumber(dishTotalNumber);
        },
        /**
         * 渲染点餐总数
         * @param  {[type]} totalNumber [description]
         * @return {[type]}             [description]
         */
        _renderTotalNumber: function(totalNumber){
            var 
                that = this;
            
            DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, totalNumber),
            DOM.text(el.dishTotalNumberEl, totalNumber);
            DOM.removeClass(el.dishTotalNumberEl, 'hidden'),
            DOM.addClass(el.myOrder, 'in');
        },
    })
    return Order;
}, {
    requires:
    [
        'classify-text/common',
        'pio/classify-text',
        'widget/dialog',
        'module/iscroll',
        'mod/juicer',
        'core'
    ]
})



KISSY.add('classify-text/common', function(S){
    var
        DOM = S.DOM,
        on = S.Event.on,
        query = DOM.query,
        el = {
            // 菜品容器
            dishListEl: '.dish-list',
            // 点餐触发器
            addDishTrigger: '.J_addDish',
            //小圆圈i标签
            circleEl:'.fa-circle-o'
        },
        DATA_DISH_NUMBER = 'data-dish-number';

    function Common(){
        this._init();
    }

    S.augment(Common, S.EventTarget, {
        _init: function(){
        },
        /**
         * 如果菜品被点过,显示出已点数量
         * @param container
         */
        showDishNumber: function(container){
            var
                that = this,
                addDishTriggers = query(el.addDishTrigger, container),
                numberEL,
                dishLi,
                circleEl,
                dishNumber;
            //显示菜品数量
            S.each(addDishTriggers, function(item){
                dishNumber = DOM.attr(item, DATA_DISH_NUMBER);
                dishLi = DOM.parent(item , 'li');
                circleEl = DOM.get(el.circleEl, dishLi);
                numberEL = DOM.get('span', item);
                if(dishNumber != ''){
                    DOM.attr(item, DATA_DISH_NUMBER, dishNumber);
                    DOM.text(numberEL, dishNumber);
                    DOM.removeClass(numberEL, 'hidden');
                    DOM.addClass(circleEl, 'active');
                }  
            });
        }
    });

    return Common;
},{
    requires: [
        'core'
    ]
});