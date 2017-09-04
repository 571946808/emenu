/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.15
 * ==NOTES:=============================================
 * v1.0.0(2016.01.15):
 * 初始生成
 * v1.1.0(2016.05.31):
 * 添加设置轮播图片的默认背景图的功能  --hj
 * ---------------------------------------------------------------------------*/

KISSY.add('page/classify-img', function(S, Core, Like, Order){
    PW.namespace('page.ClassifyImg');
    PW.page.ClassifyImg = function(param){
        new Core(param);
        new Like();
        new Order();
    }
},{
    requires: [
        'classify-img/core',
        'classify-img/like',
        'classify-img/order'
    ]
});
/**
 * 顾客轻点"点餐"的相关操作
 */
KISSY.add('classify-img/order', function(S, Common){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        fire = S.Event.fire,
        ClassifyIO = PW.io.Classify,
        el = {
            //轮播div
            carouselDivEl: '.carousel-inner',
            // 菜品列表
            dishListEl: '.dish-list',
            // 点餐触发器
            addDishTrigger: '.J_addDishTrigger',
            // 菜品数量
            dishNumberEl: '.J_dishNumber',
            // 菜品总数量
            dishTotalNumberEl: '.J_dishTotalNumber',
            // 页脚--"我的订单"触发器
            myOrderEl: '.J_myOrder',
            //轮播默认图
            carouselDefaultImg: '.J_carouselDefaultImg'
        },
        // 菜品数量
        DATA_DISH_NUMBER = 'data-dish-number',
        // 菜品的总数量
        DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number',
        // 菜品id
        DATA_DISH_ID = 'data-dish-id';

    function Order(){
        this.common = new Common();
        this._init();
    }
    S.augment(Order, S.EventTarget, {
        _init: function(){
            // 如果每个菜品已经点过,显示数量
            this.common.showDishNumber('body');
            this._showDishTotalNumber();
            this._buildEvt();
            this._setCarouselDefaultImg();
        },  
        _buildEvt: function(){
            var
                that = this,
                common = that.common;

            delegate(document, 'click', el.addDishTrigger, function(e){
                that._addDish(e);
            });

            common.on('promptUser', function(e){
                common.promptUser();
            });
        },
        /**
         * 设置轮播区域的默认背景图
         */
        _setCarouselDefaultImg: function(){
            var 
                that = this,
                carouselDivEl = DOM.get(el.carouselDivEl),
                carouselDivs = DOM.query('div.item', carouselDivEl),
                carouselImgs = DOM.query('.carouselImg', carouselDivs),
                carouselDefaultImgsrc = DOM.attr(el.carouselDefaultImg, 'href');

            S.each(carouselImgs, function(item){
                var imgSrc = DOM.attr(item, 'src');
                if (imgSrc == '') {
                    DOM.attr(item, 'src', carouselDefaultImgsrc);
                    DOM.attr(item, 'width', '100%');
                };
            });
        },
        /**
         * 如果"我的订单"有菜品,则把菜品总数显示出来
         * @private
         */
        _showDishTotalNumber: function(){
            var
                that = this,
                totalNumber = DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER);

            if(totalNumber != ''){
                DOM.removeClass(el.dishTotalNumberEl, 'hidden');
                DOM.text(el.dishTotalNumberEl, totalNumber);
            }
        },
        /**
         * 添加菜品
         * @param e
         * @private
         */
        _addDish: function(e){
            var
                that = this,
                target = e.currentTarget,
                numberEl = get(el.dishNumberEl, target),
                number = DOM.text(numberEl),
                dishNumber = number == '' ? 1 : parseInt(number) + 1;

            that._sendDishInfo(target, numberEl, dishNumber);
        },
        /**
         * 发送用户id\菜品id,添加菜品
         * @param target
         * @param numberEl
         * @param dishNumber
         * @private
         */
        _sendDishInfo: function(target, numberEl, dishNumber){
            var
                that = this,
                dishEl = DOM.parent(target, '.dish'),
                dishId = DOM.attr(dishEl, DATA_DISH_ID);

            ClassifyIO.addDish({
                dishId: dishId
            }, function(rs, errMsg) {
                if (rs) {
                    that._renderDishNumber(target, numberEl, dishNumber);
                    that._renderDishTotalNumber();
                } else {
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染菜品点的数量
         * @param target
         * @param numberEl
         * @param dishNumber
         * @private
         */
        _renderDishNumber: function(target, numberEl, dishNumber){
            var
                that = this;

            // 修改当前菜品的数量
            DOM.removeClass(numberEl, 'hidden');
            DOM.text(numberEl, dishNumber);
            DOM.attr(target, DATA_DISH_NUMBER, dishNumber);
        },
        /**
         * 渲染"我的订单"的菜品总数
         * @private
         */
        _renderDishTotalNumber: function(){
            var
                that = this,
                // 修改菜品总数量
                totalNumber = DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER),
                common = that.common;

            if(totalNumber != ''){
                totalNumber = parseInt(totalNumber) + 1;
                DOM.text(el.dishTotalNumberEl, totalNumber);
                DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, totalNumber);
            }else{
                DOM.text(el.dishTotalNumberEl, 1);
                DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, 1);
            }
            // 如果有点菜,就在"我的订单"处提示用户
            common.fire('promptUser');
        }
    });

    return Order;
},{
    requires: [
        'classify-img/common',
        'pio/classify-img'
    ]
});
/**
 * 点赞操作
 */
KISSY.add('classify-img/like', function(S){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        delegate = S.Event.delegate,
        ClassifyIO = PW.io.Classify,
        el = {
            // 菜品列表
            dishListEl: '.dish-list',
            // 点赞触发器
            likeTrigger: '.dish-like',
            // 喜欢数目
            likeNumberEl: '.dish-like-number'
        };

    function Like(){
        this._init();
    }

    S.augment(Like, {
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            delegate(el.dishListEl, 'click', el.likeTrigger, function(e){
                that._sendActiveInfo(e);
            });
        },
        /**
         * 点赞数+1
         * @param e
         * @private
         */
        // _activeDish: function(e){
        //     var
        //         that = this,
        //         target = e.currentTarget,
        //         numberEl = get(el.likeNumberEl, target),
        //         number = parseInt(DOM.text(numberEl)) + 1,
        //         dishLi = DOM.parent(e.target, 'li');
        //         dishId = DOM.attr(dishLi, 'data-dish-id');

        //     if(!DOM.hasClass(target, 'active')){
        //         DOM.addClass(target, 'active');
        //         DOM.text(numberEl, number);
        //     }
        //     that.sendActiveInfo();
        // },
        _sendActiveInfo: function(e){
            var 
                that = this,
                target = e.currentTarget,
                numberEl = get(el.likeNumberEl, target),
                number = parseInt(DOM.text(numberEl)) + 1,
                dishLi = DOM.parent(e.target, 'li');
                dishId = DOM.attr(dishLi, 'data-dish-id');

            ClassifyIO.sendActiveDishId({
                dishId: dishId
            }, function(rs, errMsg) {
                if (rs) {
                   if(!DOM.hasClass(target, 'active')){
                        DOM.addClass(target, 'active');
                        DOM.text(numberEl, number);
                    }
                } else {
                    Dialog.alert(errMsg);
                }
            });
        }
    });

    return Like;
},{
    requires: [
        'pio/classify-img'
    ]
});
/**
 * 菜品分类选择的核心操作
 */
KISSY.add('classify-img/core', function(S, Common){
    var
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        fire = S.Event.fire,
        ClassifyIO = PW.io.Classify,
        ImageLazyLoad = PW.module.ImageLazyLoad,
        Juicer = PW.mod.Juicer.client,
         Cover = PW.page.Cover,
        el = {
            // 轮播节点
            carouselEl: '#carousel',
            // 菜品模板
            dishTemp: '#dishTpl',
            // 菜品容器
            dishListEl: '.dish-list',
            // 点餐触发器
            addDishTrigger: '.J_addDishTrigger',
            // 菜品数量
            dishNumberEl: '.J_dishNumber',
            // 存放搜索keyword的Inp
            keywordInp: '.J_keyword'
        },
        DATA_DISH_NUMBER = 'data-dish-number';

    function Core(param){
        S.mix(core, {
            page: 0,
            common: new Common()
        });
        this._init();
    }

    S.augment(Core, S.EventTarget, {
        _init: function() {
            this._initCarousel();
            this._initIscroll();
            this._load();
            this._buildEvt();
            //this._testd();
        },
        // _testd: function(){
        //     Cover.client();
        //     S.log(1111);
        // },
        _buildEvt: function(){
            var
                that = this,
                common = core.common;

            common.on('showDishNumber', function(e){
                common.showDishNumber(el.dishListEl);
            });
        },
        /**
         * 初始化轮播
         * @private
         */
        _initCarousel: function(){
            var
                that = this;

            that.carousel = PW.mod.Carousel.client({
                renderTo: el.carouselEl,
                interval: 10000
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
                extraNode: [el.carouselEl],
                // 是否懒加载
                isLazyLoad: true,
                // 参与懒加载的节点class
                lazyLoadRenderTo: 'lazy-load'
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
                common = core.common,
                page = core.page,
                // 头部已经修改classifyId
                classifyId = core.classifyId,
                //搜索跳页时使用到的关键字
                keyword = DOM.val(el.keywordInp);

            S.mix(core, {
                page: page + 1
            });
            // 发送请求
            ClassifyIO.getDishList({
                page: core.page,
                pageSize: 10,
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
                    ImageLazyLoad.client({
                        renderTo: '.lazy-load',
                        container: '.dish-list'
                    });
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
        }
    });

    return Core;
},{
    requires: [
        'classify-img/common',
        'mod/carousel',
        'module/iscroll',
        'module/image-lazy-load',
        'mod/juicer',
        'pio/classify-img',
        'module/cover',
        'core'
    ]
});

KISSY.add('classify-img/common', function(S){
    var
        DOM = S.DOM,
        on = S.Event.on,
        get = DOM.get,
        query = DOM.query,
        el = {
            // 菜品容器
            dishListEl: '.dish-list',
            // 点餐触发器
            addDishTrigger: '.J_addDishTrigger',
            // 菜品数量
            dishNumberEl: '.J_dishNumber',
            // 我的订单
            myOrderEl: '.J_myOrder',
            // 菜品总数量
            dishTotalNumberEl: '.J_dishTotalNumber'
        },
        DATA_DISH_NUMBER = 'data-dish-number',
        DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number';

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
                addDishEl = query(el.addDishTrigger, container),
                numberEl,
                number;

            S.each(addDishEl, function(dish){
                number = DOM.attr(dish, DATA_DISH_NUMBER);
                if(number != ''){
                    numberEl = get(el.dishNumberEl, dish);
                    DOM.removeClass(numberEl, 'hidden');
                    DOM.text(numberEl, number);
                }
            });
        },
        /**
         * 提醒用户,"我的订单"里有已点的菜品
         */
        promptUser: function(){
            var
                that = this;

            DOM.addClass(el.myOrderEl, 'in');
            DOM.removeClass(el.dishTotalNumberEl, 'hidden');
        }
    });

    return Common;
},{
    requires: [
        'core'
    ]
});
