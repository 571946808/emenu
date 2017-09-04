/*-----------------------------------------------------------------------------
 * @Description:     我的订单
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.03.21
 * ==NOTES:=============================================
 * v1.0.0(2016.03.21):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('page/order', function(S, Core, CalDishPrice, ConfirmOrderDish){
    PW.namespace('page.orderList');
    PW.page.orderList = function(param){
        new Core(param);
        new CalDishPrice();
        new ConfirmOrderDish();
    }
 },{
    requires:[
        'my-order/core',
        'my-order/calDishPrice',
        'my-order/confirmOrderDish'
    ]
 });

//核心功能
KISSY.add('my-order/core', function(S, Common){
    var
        $ = S.all,
        DOM = S.DOM,
        query = DOM.query,
        on = S.Event.on,
        fire = S.Event.fire,
        delegate = S.Event.delegate,
        orderListIO = PW.io.orderList,
        el = {
            //header
            headerArea: ".header",
            //页面container
            wrapperEl: "#wrapper",
            //上菜方式悬浮条
            orderServiceEl: ".order-service",
            //订单菜品li
            orderingDishEl: ".ordering-dish",
            //订单菜品列表
            dishListEl: ".ordering-list",
            //菜品数量input
            dishNumEl: ".ordering-dish-number",
            //菜品价格(sale)
            orderingDishSaleEl: ".ordering-dish-sale",
            //本单消费金额
            customPriceEl: ".J_customPrice",
            //消费记录模板
            customTemp: "#customTpl",
            //显示当前消费金额
            currentCustomEl: ".curren-custom",
            //备注
            remarksEl: ".J_remarks",
            //绑定滑动事件模块
            swipeEventEl: ".J_swipeEvent",
            swipeImgEventEl: ".ordering-dish-img",
            swipeInfoEventEl:".ordering-dish-info",
            //删除按钮
            deleteTrigger: ".J_delete",
            //radio
            radioTrigger: ".J_serviceWay",
            //存储serviceWay的input
            restoreValueInp: ".J_restoreValue" ,
            //点击向左滑动按钮
            slideLeftTrigger: '.J_slideLeft'
        },
        DATA_ORDERING_DISH_ID = 'data-ordering-dish-id',
        DATA_BUTTON_TYPE = 'data-button-type';

    function Core(){
        this.common = new Common();
        // this.common.changeDishNum();
        this._init();
        // this._requestCustomAjax();
    }
    S.augment(Core, {
        _init: function(){
            this._buildEvt();
            this._remarksShow();
            this._positionOrderService();
            this._initNumChangeTrigger();
            //this._isShowCurrentCustom();
        },
        /**
         * 是否显示消费金额
         * @private
         */
        _isShowCurrentCustom: function () {
            var
                currentCustomDOM = DOM.get(el.currentCustomEl),
                dishListUlEl = DOM.get(el.dishListEl),
                dishLiEl = DOM.get(el.orderingDishEl);
            if(DOM.contains(dishListUlEl, dishLiEl)){
                DOM.show(currentCustomDOM);
            }else{
                DOM.hide(currentCustomDOM);
            }
        },
        /**
         * 初始化点菜数量的触发器，若菜品首次刷页的数量为小数，则限制用户的增减操作
         * @private
         */
        _initNumChangeTrigger: function () {
            var
                that = this,
                reg,
                regInt,
                itemSiblings,
                itemNextNode,
                itemPrevNode,
                dishNumEls = DOM.query(el.dishNumEl, el.swipeInfoEventEl);

            S.each(dishNumEls, function (item, ele) {
                reg = new RegExp("^[0-9]*[1-9][0-9]*$"),   //验证是否是正整数
                regInt = reg.test(item.value);
                if(item.value > 1 && regInt == false){
                    itemSiblings = DOM.siblings(item, 'button');
                    DOM.addClass(itemSiblings, 'to-grey');
                    itemPrevNode = DOM.prev(item, 'button');
                    DOM.removeClass(itemPrevNode, 'J_redudeButton');
                    itemNextNode = DOM.next(item, 'button');
                    DOM.removeClass(itemNextNode, 'J_plusButton');
                }
            });
        },
        _buildEvt: function(){
            var
                that = this;

            on(el.swipeEventEl, 'swipeInit', function(e){
                that._swipeInit();
            });

            // delegate(document, 'swipe', el.swipeEventEl, function(e){
            //     fire(e.target, 'swipeInit');   //如果触发的是el.swipeEventEl，就会执行n次
            //     that._swipeDelete(e);
            // });
            
            delegate(document, 'tap', el.slideLeftTrigger, function (e){
                fire(e.target, 'swipeInit');   //如果触发的是el.swipeEventEl，就会执行n次
                that._swipeDelete(e);
            });

            delegate(document, 'click', el.deleteTrigger, function(e){
                that._deleteOrderingDish(e);
            });

            delegate(document, 'change', el.radioTrigger, function(e){
                that._changeServiceWay(e);
            });
        },
        /**
         * 选择上菜方式时，记录选择结果并使用hiddenInput存储
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _changeServiceWay: function(e){
            var
                that = this,
                targetInpVal = DOM.attr(DOM.get(e.target), 'value'),
                restoreValueInpDOM = DOM.get(el.restoreValueInp);

            if(targetInpVal == 0){
                DOM.attr(restoreValueInpDOM, 'value', '即起');
            }else{
                DOM.attr(restoreValueInpDOM, 'value', '叫起');
            };
        },
        /**
         * 选择上菜方式悬浮条定位
         * @return {[type]} [description]
         */
        _positionOrderService: function(){
            var
                that = this,
                //上菜方式悬浮条
                orderServiceEl = DOM.get(el.orderServiceEl),
                //header
                headerEl = DOM.get(el.headerArea);

            orderServiceEl.style.top = headerEl.clientHeight + 'px';
        },
        /**
         * 向左滑动时，先将之前所有已向左滑动的菜品列表自动收起
         * @return {[type]} [description]
         */
        _swipeInit: function(){
            var
                swipeEventEls = DOM.query(el.swipeEventEl),
                swipeOneEl,
                swipeTwoEl,
                swipeOneStatus,
                swipeTwoStatus;

            S.each(swipeEventEls,function(item){
                swipeOneEl = DOM.children(item, el.swipeImgEventEl);
                swipeTwoEl = DOM.children(item, el.swipeInfoEventEl);
                swipeOneStatus = DOM.hasClass(swipeOneEl, 'swipe-left-translate');
                swipeTwoStatus = DOM.hasClass(swipeTwoEl, 'swipe-left-translate');

                if(swipeOneStatus || swipeTwoStatus){
                    $(swipeOneEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
                    $(swipeTwoEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
                }
            })
        },
        /**
         * 备注提示省略效果
         * @return {[type]} [description]
         */
        _remarksShow: function(){
            var
                str = "……",
                remarksInfo = query(el.remarksEl, el.wrapperEl),
                remarksItem,
                remarksContent,
                remarksAfterOmiting;

            S.each(remarksInfo, function(item){
                remarksItem = DOM.text(item);
                //判断备注有无内容
                if(remarksItem == ''){
                    DOM.text(item, '无');
                }else{
                    remarksContent = remarksItem.substr(0, 22),
                    remarksAfterOmiting =  remarksContent + str;
                    DOM.text(item, remarksAfterOmiting);
                }
            })
        },
        /**
         * 滑动删除
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _swipeDelete: function(e){
            var
                swipeOrderingDivEl = DOM.parent(e.target, el.swipeEventEl),
                swipeOneEl = DOM.children(swipeOrderingDivEl, el.swipeImgEventEl),
                swipeTwoEl = DOM.children(swipeOrderingDivEl, el.swipeInfoEventEl),
                delButtonEl = DOM.children(swipeOrderingDivEl, el.deleteTrigger);
            // e.stopPropagation();

            //原滑动触发可用代码：
            // if(e.direction == 'left' && e.distance>0){
            //     $(delButtonEl).fadeIn();
            //     $(swipeOneEl).removeClass("swipe-right-translate").addClass("swipe-left-translate");
            //     $(swipeTwoEl).removeClass("swipe-right-translate").addClass("swipe-left-translate");
            // }
            // if(e.direction == 'right' && e.distance>0){
            //     $(swipeOneEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
            //     $(swipeTwoEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
            // }
            if(DOM.hasClass(e.target, '.fa-angle-double-left')){
                $(delButtonEl).fadeIn();
                $(swipeOneEl).removeClass("swipe-right-translate").addClass("swipe-left-translate");
                $(swipeTwoEl).removeClass("swipe-right-translate").addClass("swipe-left-translate");
                DOM.replaceClass(e.target, '.fa-angle-double-left', '.fa-angle-double-right');
            }else{
                DOM.replaceClass(e.target, '.fa-angle-double-right', '.fa-angle-double-left');
                $(swipeOneEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
                $(swipeTwoEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
            }
        },
        /**
         * 删除订单中的菜品
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _deleteOrderingDish: function(e){
            var
                that = this,
                orderingDishLi = DOM.parent(e.target, el.orderingDishEl),
                dishId = DOM.attr(orderingDishLi, DATA_ORDERING_DISH_ID),
                confirmOrder;

            //调用原生js的confirm
            confirmOrder = confirm('确定从未完成的订单中删除此菜品？');
                //ok callback
            if(confirmOrder == true){
                orderListIO.deleteOrderingDish({
                    deleteDishId: dishId
                }, function(rs, errMsg){
                    if(rs){
                        DOM.attr(el.dishListEl, DATA_BUTTON_TYPE, 0);
                        //更新价格
                        that._updateDeleteDishPrice(e);
                        // ok callback
                        $(orderingDishLi).slideUp(0.2, function(){
                            // if(DOM.siblings(orderingDishLi) == []){
                            //    console.log(DOM.siblings(orderingDishLi));
                            //     that._isShowCurrentCustom();
                            // }
                            DOM.remove(orderingDishLi);
                        });
                    }else{
                        alert(errMsg);
                    }
                });
            }else{
                //cancel callback
                that._rendDeleteList(e);
            }
        },
        /**
         * 更新删除菜品后的订单总价格
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _updateDeleteDishPrice: function(e){
            var
                targetParentEl = DOM.parent(e.target, el.orderingDishEl),
                dishNumEl = DOM.get(el.dishNumEl, targetParentEl),
                dishNum = dishNumEl.value;

            this.common.getChangeAndCurrentPrice(e, dishNum);
        },
        /**
         * 提示框点击取消删除后渲染
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _rendDeleteList: function(e){
            var
                swipeOrderingDivEl = DOM.parent(e.target, el.swipeEventEl),
                swipeOneEl = DOM.children(swipeOrderingDivEl, el.swipeImgEventEl),
                swipeTwoEl = DOM.children(swipeOrderingDivEl, el.swipeInfoEventEl),
                rightStatus,
                childrenEl,
                childrenArrary=[];

            $(swipeOneEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
            $(swipeTwoEl).removeClass("swipe-left-translate").addClass("swipe-right-translate");
            //改变删除后，fa-angle-double的方向标识
            childrenEl = DOM.children(DOM.parent(e.target, 'li'));
            childrenArrary = DOM.children(childrenEl[1]);
            rightStatus = DOM.get('i', childrenArrary[1]);
            DOM.replaceClass(rightStatus, '.fa-angle-double-right', '.fa-angle-double-left');
        }

        /**
         * 页面载入时发送Ajax请求
         * @return {[type]} [description]
         */
        // _requestCustomAjax: function(){
        //     var 
        //         that = this;
        //       orderListIO.getOrderList({
        //         pageSize: 10,
        //         userId: 112233,
        //     }, function(rs, list, errMsg){
        //         if(rs){
        //             dishTemp = DOM.html(el.customTemp);
        //             dishStr = Juicer(dishTemp, {
        //                 list: list
        //             });
        //             dishDOM = DOM.create(dishStr);
        //             DOM.replaceWith(el.currentCustomEl, dishDOM);
        //         }
        //     });
        // }
    });
    return Core;
}, {
    requires: [
        'my-order/common',
        'pio/order',
        'module/dialog',
        'widget/dialog',
        'core'
    ]
});

//计算相关模块
KISSY.add('my-order/calDishPrice', function(S, Common){
    var
        DOM = S.DOM,
        get = DOM.get,
        delegate = S.Event.delegate,
        orderListIO = PW.io.orderList,
        el = {
            //订单菜品列表
            dishListEl: ".ordering-list",
            //filter DOM
            orderingNumContainerEl: ".ordering-number",
            //信息展示区域
            infoTextFilter: ".info-text",
            //菜品数量input
            dishNumEl: ".ordering-dish-number",
            //减少菜品数量触发器
            reduceDishTrigger: ".J_redudeButton",
            //增加菜品数量触发器
            plusDishTrigger: ".J_plusButton",
            //正在下单列表容器
            orderingListContainer: ".ordering-list",
            //本单消费金额
            customPriceEl: ".J_customPrice",
            //菜品价格(sale)
            orderingDishSale: ".ordering-dish-sale" 
        },
        DATA_BUTTON_TYPE = 'data-button-type';

        function CalDishPrice(){
            this._init();
            this.common = new Common();
        }
        S.augment(CalDishPrice, {
            _init: function(){
                this._buildEvt();
            },

            _buildEvt: function(){
                var
                    that = this;

                delegate(document, 'click', el.reduceDishTrigger, function(e){
                    // that.changeStatus = 0; //标志减少菜品
                    DOM.attr(el.dishListEl, DATA_BUTTON_TYPE, 0);
                    that._getOperateDishType(e);
                });

                delegate(document, 'click', el.plusDishTrigger, function(e){
                    DOM.attr(el.dishListEl, DATA_BUTTON_TYPE, 1);
                    // that.changeStatus = 1; //标志增加菜品
                    that._getOperateDishType(e);
                });
            },
            /**
             * 获取操作菜品数量的类型
             * @param  {[type]} e [description]
             * @return {[type]}   [description]
             */
            _getOperateDishType: function(e){
                var
                    that = this,
                    inputEl = get(el.dishNumEl, DOM.parent(e.target, el.orderingNumContainerEl)),
                    changeStatus = DOM.attr(el.dishListEl, DATA_BUTTON_TYPE),
                    dishLiEl = DOM.parents(e.target, 'li'),
                    dishId = DOM.attr(dishLiEl, 'data-ordering-dish-id');
                    // buttonEl = DOM.parent(e.target, 'button'),
                    // //点击button中的i
                    // targetIsIcon = DOM.attr(buttonEl, 'class') == 'J_redudeButton',
                    // //点击button
                    // targetIsButton = DOM.attr(e.target, 'class') == 'J_redudeButton',
                    // //value用于判断触发的是操作的按钮类型
                    // value = (targetIsIcon || targetIsButton);

                //发送当前触发操作状态-0：触发“-”；1：触发“+”
                orderListIO.sendDishNumChangeInfo({
                    id: dishId,
                    changeStatus:changeStatus
                }, function(rs, errMsg){
                    if(rs){
                       if(changeStatus == 0){
                            that._reduceDishNum(e, inputEl, changeStatus);//触发“-”
                        }else{
                            that._plusDishNum(e, inputEl, changeStatus);//触发“+”
                        }
                    }else{
                        alert(errMsg);
                    }
                });
            },
            /**
             * 减少菜品数量
             * @param  {[type]} inputEl [description]
             * @return {[type]}         [description]
             */
            _reduceDishNum: function(e, inputEl, changeStatus){
                // 判断是否是正整数,若为真，可执行-1操作，若为假，按钮变灰并禁用。
                // if(regInt){
                if(inputEl.value > 1){
                    inputEl.value -= 1;
                    this.common.showDishNum(changeStatus, inputEl);
                    this.common.getChangeAndCurrentPrice(e, null);
                }
            },
            /**
             * 增加菜品数量
             * @param  {[type]} inputEl [description]
             * @return {[type]}         [description]
             */
            _plusDishNum: function(e, inputEl, changeStatus){
                var
                    addResult;

                if(inputEl.value >= 1){
                    addResult = parseInt(inputEl.value);
                    addResult += parseInt(1);
                    inputEl.value = addResult;
                }
                this.common.showDishNum(changeStatus, inputEl);
                this.common.getChangeAndCurrentPrice(e, null);
            }
        });
        return CalDishPrice;
}, {
    requires: [
        'my-order/common',
        'pio/order',
        'core'
    ]
});

//确认订单弹出框相关模块
KISSY.add('my-order/confirmOrderDish', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        get = DOM.get,
        delegate = S.Event.delegate,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        orderListIO = PW.io.orderList,
        el = {
            containerArea: '.container',
            //header
            headerArea: '#header',
            //footer
            footerArea: '#footer',
            //遮盖层区域
            coverArea: '#createCover',
            //订单li
            dishLi: '.ordering-dish',
            //订单列表ul
            dishListUl: '.ordering-list',
            //confirm Ul
            confirmUl: ".confirm-dish-list",
            //菜品数量input
            dishNumEl: ".ordering-dish-number",
            //记录上菜方式的Inp
            restoreValueInp: '.J_restoreValue',
            //确认订单对话框div
            confirmOrderContainer: '#confirmOrderContainer',
            //点菜触发器
            orderDishTrigger: ".J_orderDish",
            //确认订单对话框中菜品信息模板
            confirmDishTemp: '#confirmDishTpl',
            //确认订单对话框中其它主要信息模板
            orderMainInfoTemp: '#orderMainInfoTpl',
            //餐台主要信息Ul
            tableInfoUl: '.table-info',
            //整单备注
            orderRemarkText: ".J_orderRemarkText",
            //返回触发器
            cancelTrigger: '.J_butttnCancel',
            //确认下单触发器
            confirmTrigger: '.J_butttnConfirm',
            //confirm-header
            confirmHeaderEl: '.confirm-header',
            //confirm-content
            confirmContentEl: '.confirm-content',
            //confirm-footer
            confirmFooterEl: '.confirm-footer',
            //备注元素区域
            remarkBlocksAreaEl: '.J_remarkBlocks',
            //备注元素块
            remarkBlocksTrigger: '.J_remarkBlocks span',
            //后端刷菜品备注元素区域
            remarkHidden: '.J_remarkHidden',
            //存储备注隐藏域
            saveRemarksEl: '.J_saveRemarks',
            //存放后端返回的订单价格Inp
            returnPriceInp: '.J_returnPrice',
            //上菜方式
            serviceWay: '.choosed-service'
        },
        DATA_DISH_ID = 'data-ordering-dish-id';
    function ConfirmOrderDish(){
        this._init();
    }

    S.augment(ConfirmOrderDish, {
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            delegate(document, 'click', el.orderDishTrigger, function(e){
                that._sendBlockingStatus(e.target);
            });
            delegate(document, 'click', el.cancelTrigger, function(e){
                that._sendDeblockingStatus(e.target);
            });
            delegate(document, 'click', el.confirmTrigger, function(e){
                that._sendOrderInfo(e.target);
                that._closeCoverDiv();
            });
            delegate(document, 'tap', el.remarkBlocksTrigger, function(e){
                that._setRemarksLabel(e.target);
            });
        },
        /**
         * 点击确认下单后，给后端发送用户已下单的状态标识，便于后端加锁，并返回订单消费价格
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _sendBlockingStatus: function(e){
            var
                that = this,
                orderStatus = {
                    orderStatus: 1
                };

            orderListIO.sendOrderStatus(orderStatus, function(rs, data, errMsg){
                if(rs){
                    //将返回的总计金额显示在确认页面
                    DOM.val(el.returnPriceInp, data.customPrice);
                    that._createCoverDiv();
                    that._getDishList(data.orderList);
                }else{
                    alert(errMsg);
                }
            });
        },
        /**点击返回后，给后端发送用户取消下单的状态标识，便于后端解锁
         * [_sendDeblockingStatus description]
         * @return {[type]} [description]
         */
        _sendDeblockingStatus: function(){
            var
                that = this,
                orderStatus = {
                    orderStatus: 0
                };

            orderListIO.sendDeblockingStatus(orderStatus, function(rs, errMsg){
                if(rs){
                    that._closeCoverDiv();
                }else{
                    alert(errMsg);
                }
            });
        },
        /**
         * 设置备注元素效果
         * @param {[type]} e [description]
         */
        _setRemarksLabel: function(e){
            //实现可备注可多次重复点的功能：
            // var
            //     that = this,
            //     remarkLabel = DOM.text(e),
            //     text = '',
            //     length,
            //     textareaEl = DOM.next(e, 'textarea'),
            //     remark = DOM.val(textareaEl);

            // //S.log(textareaEl.value);
            // DOM.addClass(e, 'selected');

            // if(remark == ''){
            //     text = remarkLabel;
            // }else{
            //     text = textareaEl.value + '，' + remarkLabel;
            // }
            // textareaEl.value = text;
            // setTimeout(function(){
            //     DOM.removeClass(e, 'selected');
            // },200);

            var
                that = this,
                remarkLabel = DOM.text(e),
                pos,
                input = DOM.next(DOM.parent(e, 'div'), 'input'),
                value = DOM.val(input);

            DOM.toggleClass(e, 'selected');

            if(DOM.hasClass(e, 'selected')){
                if(value == ''){
                    value = remarkLabel;
                }else{
                    value = value + ',' + remarkLabel;
                }
            }else{
                pos = value.indexOf(',' + remarkLabel);//判断是否为第一个label
                if(pos == -1){
                    //是input存的第一个label
                    onlyFirst = value.indexOf(remarkLabel + ',');//判断是否仅有一个label
                    if(onlyFirst == -1){
                        //input中仅有一个label
                        value = value.replace(remarkLabel, "");
                    }else{//否则，需将其后的逗号一并去掉
                        value = value.replace(remarkLabel + ',', "");
                    }
                }else{
                    value = value.replace(',' + remarkLabel, "");
                }
            }
            DOM.val(input, value);
        },
        _positionConfirmContentHeight: function(){
            var
                that = this,
                //confirm-content
                confirmContentEl = get(el.confirmContentEl),
                //confirm-header
                confirmHeaderEl = get(el.confirmHeaderEl),
                confirmHeaderHeight = confirmHeaderEl.clientHeight,
                //confirm-footer
                confirmFooterEl = get(el.confirmFooterEl),
                confirmFooterHeight = confirmFooterEl.clientHeight,
                //confirm
                confirmOrderContainerEl = get(el.confirmOrderContainer),
                confirmOrderContainerHeight = confirmOrderContainerEl.clientHeight,
                //confirm-content高度
                confirmContentHeight = confirmOrderContainerHeight - confirmHeaderHeight - confirmFooterHeight;

            confirmContentEl.style.height =  (confirmContentHeight -50 ) + 'px';   //50为估计值
        },
        /**
         * 创建遮罩层
         * @return {[type]} [description]
         */
        _createCoverDiv: function(){
            var
                that = this,
                containerArea = DOM.get(el.containerArea),
                createHtml = '<div id="createCover">'+
                            '<div id="confirmOrderContainer">'+
                                '<div class="confirm-header">'+'请确认本次订单'+
                                '</div>'+
                                '<div class="confirm-content">'+
                                    '<ul class="confirm-dish-list">'+
                                    '</ul>'+
                                '</div>'+
                                '<div class="confirm-footer">'+
                                    '<button class="J_butttnCancel">返回</button>'+
                                    '<button class="J_butttnConfirm">确认订单</button>'+
                                '</div>'+
                            '</div>'+
                         '</div>';

            $(createHtml).insertAfter(containerArea);
            that._getCurrentClientSize();
        },
        /**
         * 关闭遮罩层
         * @return {[type]} [description]
         */
        _closeCoverDiv: function(){
            var
                that = this;

            DOM.remove(el.coverArea);
        },
        /**
         * 获取当前客户端的屏幕宽高
         * @return {[type]} [description]
         */
        _getCurrentClientSize: function(){
            var
                that = this,
                clientViewHeight = DOM.viewportHeight(), //移动端可视区域高度
                clientViewWidth = DOM.viewportWidth(); //移动端可视区域宽度

            that.clientViewHeight = clientViewHeight;
            that.clientViewWidth = clientViewWidth;
            that._defineCoverArea();
            that._defineComfirmOrder();
            that._positionConfirmContentHeight();
        },
        /**
         * 定义遮盖区域的宽高
         * @return {[type]} [description]
         */
        _defineCoverArea: function(){
            var
                that = this,
                //header
                headerHeight = get(el.headerArea),
                //cover
                currentCoverEl = get(el.coverArea),
                //计算遮盖层的高度
                coverHeight = that.clientViewHeight - headerHeight.clientHeight;

            currentCoverEl.style.height =  coverHeight + 'px';
            currentCoverEl.style.width = that.clientViewWidth + 'px';
        },
        /**
         * 定义确认对话框的位置
         * @return {[type]} [description]
         */
        _defineComfirmOrder: function(){
            var
                that = this,
                comfirmDivMarginRight,
                confirmDivMarginLeft,
                comfirmDivMarginTop,
                confirmDivHeight,
                confirmOrderEl = DOM.get(el.confirmOrderContainer);

            comfirmDivMarginRight = that.clientViewWidth * 0.112;
            confirmOrderEl.style.marginRight = comfirmDivMarginRight + 'px';
            confirmDivMarginLeft = comfirmDivMarginRight;
            confirmOrderEl.style.marginLeft = confirmDivMarginLeft + 'px';
            comfirmDivMarginTop = that.clientViewHeight * 0.068;
            confirmOrderEl.style.marginTop = comfirmDivMarginTop + 'px';
            confirmDivHeight = that.clientViewHeight / 1.549;
            confirmOrderEl.style.height = confirmDivHeight + 'px';
        },
        /**
         * 从返回的数据中获取菜品详情
         * @param orderList
         * @private
         */
        _getDishList: function(orderList){
            var
                that = this,
                tableInfoEl = get(el.tableInfoUl),
                tableMainInfoData = DOM.serialize(tableInfoEl);

            S.each(orderList, function(index){
                that._renderConfirmDishList(index);
            });
            that._renderConfirmMainInfo(tableMainInfoData);
        },
        /**
         * 确认对话框中渲染菜品列表
         * @param  {[type]} dishData [description]
         * @return {[type]}          [description]
         */
        _renderConfirmDishList: function(dishData){
            var
                that = this,
                confirmUlDOM = get(el.confirmUl),
                confirmDishHtml = DOM.html(el.confirmDishTemp),
                listStr = Juicer.client(confirmDishHtml, {
                    dialog: dishData
                }),
                listDOM = DOM.create(listStr);
            $(confirmUlDOM).append(listDOM);
        },
        /**
         * 确认对话框中渲染其他信息
         * @param  {[type]} tableMainInfoData [description]
         * @return {[type]}                   [description]
         */
        _renderConfirmMainInfo: function(tableMainInfoData){
            var
                serviceWayValue,
                confirmUlDOM,
                orderMainInfoHtml,
                dishRemarksCloneDOM,
                listStr,
                listDOM,
                remarkBlocksAreaEl,
                remarkRenderEl;

            serviceWayValue = DOM.attr(el.restoreValueInp, 'value');
            confirmUlDOM = get(el.confirmUl);
            dishRemarksCloneDOM = S.one(el.remarkHidden).clone(true);
            orderMainInfoHtml = DOM.html(el.orderMainInfoTemp);
            listStr = Juicer.client(orderMainInfoHtml, {
                serviceWay: serviceWayValue,
                order: tableMainInfoData
            });
            listDOM = DOM.create(listStr);
            $(confirmUlDOM).append(listDOM);
            remarkBlocksAreaEl = get(el.remarkBlocksAreaEl);
            remarkRenderEl = DOM.children(remarkBlocksAreaEl, 'label');
            //进行深度复制，避免页面中的已存在元素被插入到 DOM 树的其他位置，会从原来的位置移除
            $(dishRemarksCloneDOM).insertAfter(remarkRenderEl);
            DOM.css(dishRemarksCloneDOM, 'display', 'block');
        },
        /**
         * 确认订单后，发送订单信息
         * @return {[type]} [description]
         */
        _sendOrderInfo: function(e){
            var
                sendDishData,
                confirmUlDOM = DOM.get(el.confirmUl),
                textarea = DOM.get(el.orderRemarkText),
                input = DOM.get(el.saveRemarksEl),
                textareaValue = DOM.val(textarea),
                inputValue = DOM.val(input),
                serviceWaySpanEl = DOM.get('span', el.serviceWay),
                serviceWayText = DOM.text(serviceWaySpanEl),
                serviceWay;

            //上菜方式：即起-1；叫起-2
            (serviceWayText == "即起") ? serviceWay = 1 : serviceWay = 2 ;

            if(textareaValue == ''){
                textareaValue = inputValue;
            }else{
                textareaValue = textareaValue + ',' + inputValue;
            }
            DOM.val(textarea, textareaValue);
            //序列化发送的数据
            sendDishData = DOM.serialize(confirmUlDOM);
            S.mix(sendDishData, {
                serviceWay: serviceWay
            });
            //sendDishData = {confirmDishId: "1,2,3", confirmDishNumber: "4,5,6", confirmOrderRemark: "顶顶,多放辣,加醋",serviceWay:0},
            //发送数据的格式：Object {confirmDishId: "1,2,3", confirmDishNumber: "4,6,6", confirmOrderRemark:"备注内容",serviceWay:0}
            orderListIO.sendConfirmOrderInfo(sendDishData, function(rs, errMsg){
                if(rs){
                    alert('您已下单成功！');
                        //下单点击确定后刷新
                        window.location.reload();
                    // }
                }else{
                    alert(errMsg);
                }
            });
        }
    });
    return ConfirmOrderDish;
}, {
    requires: [
        'mod/juicer',
        'widget/dialog',
        'pio/order',
        'core'
    ]
});

//common
KISSY.add('my-order/common', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        get = DOM.get,
        el= {
            dishListEl: '.ordering-list',
            //订单菜品li
            orderingDishEl: '.ordering-dish',
            dishTotalNumberEl: ".J_dishTotalNumber",
            //filter DOM
            orderingNumContainerEl: ".ordering-number",
            //信息展示区域
            infoTextFilter: ".info-text",
            //菜品数量input
            dishNumEl: ".ordering-dish-number",
            //减少菜品数量触发器
            reduceDishTrigger: ".J_redudeButton",
            //增加菜品数量触发器
            plusDishTrigger: ".J_plusButton",
            //正在下单列表容器
            orderingListContainer: ".ordering-list",
            //本单消费金额
            customPriceEl: ".J_customPrice",
            //菜品价格(sale)
            orderingDishSale: ".ordering-dish-sale"
        },
        DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number',
        DATA_BUTTON_TYPE = 'data-button-type';
    function Common(param){
        // this._init();
    }
    S.augment(Common, {
        // _init: function(){
        // },
        /**
         * 显示下栏“我的订单”中的菜品数量
         * @param  {[type]} changeStatus [description]
         * @param  {[type]} inputEl      [description]
         * @return {[type]}              [description]
         */
        showDishNum: function(changeStatus, inputEl){
            var
                that = this,
                value = parseInt(1),
                number = DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER);

            if(changeStatus == 0){
                if(inputEl.value != 1){
                    //触发"-"
                    number = parseInt(number - value);
                }
            }else{
                //触发"+"
                number = parseInt(Number(number) + value);
            }
            DOM.text(el.dishTotalNumberEl, number);
            DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, number);
        },
         /**
         * 获取菜品价格和当前本单消费价格
         * @param  {[type]} e       [description]
         * @param  {[type]} inputEl [description]
         * @return {[type]}         [description]
         */
        getChangeAndCurrentPrice: function(e, dishNum){
            var
                that = this,
                parentsEl,
                salePriceText,
                infoTextArea,
                dishPrice,
                dishEveryPrice,
                orderingCustomPrice,
                changeStatus = DOM.attr(el.dishListEl, DATA_BUTTON_TYPE);

            if(!dishNum){
                parentsEl = DOM.parent(e.target, el.orderingNumContainerEl);
                infoTextArea = DOM.prev(parentsEl, el.infoTextFilter);
                salePriceText = $(DOM.children(infoTextArea, el.orderingDishSale)).text();
                dishPrice = salePriceText.split("￥")[1];
                dishEveryPrice = Number(dishPrice);
                //逐一增减菜品数量时，获取每道菜的金额
                dishSumPrice = dishEveryPrice;
            }else{
                parentsEl = DOM.parent(e.target, el.orderingDishEl);
                salePriceText = $(get(el.orderingDishSale, parentsEl)).text();
                dishPrice = salePriceText.split("￥")[1];
                //直接触发左滑删除按钮时，获取每道菜的总金额
                dishEveryPrice = Number(dishPrice);
                dishSumPrice = Number(dishEveryPrice * dishNum);
            }
            //获取当前正在下单的消费金额
            orderingCustomPrice = Number(($(DOM.get(el.customPriceEl)).text()).split("￥")[1]);
            that.calNewestPrice(dishSumPrice, orderingCustomPrice, changeStatus);
        },
        /**
         * 计算最新本单消费
         * @param  {[type]} priceOne [description]
         * @param  {[type]} priceTwo [description]
         * @return {[type]}          [description]
         */
        calNewestPrice: function(priceOne, priceTwo, changeStatus){
            var
                reg,
                regBool,
                priceArr = [priceOne, priceTwo],
                price = [],
                len = [],
                maxLength,
                priceIntOne,
                priceIntTwo,
                newestSumIntPrice,
                newestSum,
                newestSumPrice;

            //遍历数组中元素，统一转换成小数，加入数组price[]
            S.each(priceArr, function(arr){
                reg = /^[0-9]*[1-9][0-9]*$/; //验证是否是正整数
                regBool = reg.test(arr);
                switch (regBool){
                    case(true):
                        //若为整数，转化成带来两位0的小数
                        price.push(arr.toFixed(2));  //返回值为字符串
                        break;
                    case(false):
                        price.push(arr);
                        break;
                }
            });
            for(var i= 0; i< price.length; i++){
                len.push(price[i].toString().split(".")[1].length);
                price[i] = Number(price[i]);
            }
            //判断小数位数，并取最大值
            (len[0] >= len[1]) ? maxLength = len[0] : maxLength = len[1];
            //同乘倍数
            priceIntOne = price[0] * Math.pow(10, maxLength);
            priceIntTwo = price[1] * Math.pow(10, maxLength);

            //根据触发类型决定使用“-”或“+”
            if(changeStatus == 0){
                newestSumIntPrice = Math.abs(priceIntOne - priceIntTwo);
            }else{
                newestSumIntPrice = priceIntOne + priceIntTwo;
            }
            //同除倍数
            newestSum = newestSumIntPrice / Math.pow(10, maxLength);
            //将计算结果四舍入五，保留两位小数 
            newestSumPrice = "￥" + Number(newestSum.toFixed(2));
            //更新本单消费价格
            DOM.text(el.customPriceEl, newestSumPrice);
        }
    });
    return Common;
}, {
    requires: [
        'core'
    ]
});