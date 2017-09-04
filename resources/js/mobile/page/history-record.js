/*-----------------------------------------------------------------------------
 * @Description:     历史消费
 * @Version:         1.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.04.06
 * ==NOTES:=============================================
 * v1.0.0(2016.04.06):
 初始生成
 * -------------------------------------------------------------------------*/
KISSY.add('page/history-record', function(S, Order){
    PW.namespace('page.HistoryRecord');
    PW.page.HistoryRecord = function(){
        new Order();
    }
}, {
    requires:[
        'record/order'
    ]
});
/* -------------------------------------------------------------------------*/
KISSY.add('record/order', function(S){
    var
        DOM = S.DOM, on = S.Event.on, 
        delegate = S.Event.delegate,
        historyIo = PW.io.HistoryRecord,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        el = {
            //下拉收起icon
            toggleEl: '.J_toggle',
            //下拉收起触发器
            unfoldTrigger: '.J_unfoldTrigger',
            //菜品列表
            dishListEl: '.J_dishList',
            //菜品模板
            dishTpl: '#dishTpl',
            //点菜触发器
            orderTrigger: '.J_order',
            //用户id
            userInp: '.J_userInp',
            //foot中菜品总数El
            dishTotalNumberEl: '.J_dishTotalNumber',
            //记录列表
            recordListEl: '.J_recordList'
        },
        DATA_RECORD_ID = 'data-record-id',
        DATA_DISH_ID = 'data-dish-id',
        DATA_DISH_TOTAL_NUMBER = 'data-dish-total-number';

    function Order(){
        this._init();
    }

    S.augment(Order, {
        _init: function(){
            this._buildEvt();
            this._tip();
        },
        _buildEvt: function(){
            var 
                that = this;

            delegate('body', 'tap', el.unfoldTrigger, function(e){
                that._toggleList(e.currentTarget);
            });
            delegate('body', 'tap', el.orderTrigger, function(e){
                Dialog.alert('123');
                that._order(e.currentTarget);
            })
        },
        _tip: function(){
            var 
                that = this,
                haslist = S.one(el.unfoldTrigger),
                tipEl = DOM.create('<li class="tip">暂无内容</li>');
            if(!haslist){
                DOM.insertAfter(tipEl, el.recordListEl);
            }
        },

        /**
         * 订单中菜品列表的开关
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _toggleList: function(ev){
            var 
                that = this,
                dishListEl = $(ev).next(el.dishListEl),
                isOpen = $(ev).hasClass('active') ? true : false;

            if(isOpen){
                //执行折叠操作
                $(ev).removeClass('active');
                that._fold(ev, dishListEl);
            }else{
                //执行打开操作
                $(ev).addClass('active')
                that._unfold(ev, dishListEl);
            }
        },

        /**
         * 展开
         * @param  {[type]} ev         [description]
         * @param  {[type]} dishListEl [description]
         * @return {[type]}            [description]
         */
        _unfold: function(ev, dishListEl){
            var 
                that = this,
                toggleEl = DOM.get(el.toggleEl, ev);

            if(dishListEl.length == 0){
                that._getDishList(ev);
            }else{
                $(dishListEl).removeClass('hidden');
            }
            $(toggleEl).addClass('toggle');            
        },

        /**
         * 折叠
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _fold: function(ev){
            var 
                that = this,
                toggleEl = DOM.get(el.toggleEl, ev),
                dishListEl = $(ev).next(el.dishListEl);

            $(dishListEl).addClass('hidden');
            $(toggleEl).removeClass('toggle');
        },

        /**
         * ajax获取菜品列表
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _getDishList: function(ev){
            var 
                that = this,
                recordId = $(ev).attr(DATA_RECORD_ID);

            historyIo.getDishList({recordId:recordId}, function(rs, list, errMsg){
                if(rs){
                    that._rendDishList(ev, list);
                }else{
                    Dialog.alert(errMsg);
                }
            })
        },

        /**
         * 渲染菜品列表
         * @param  {[type]} ev   [description]
         * @param  {[type]} list [description]
         * @return {[type]}      [description]
         */
        _rendDishList: function(ev, list){
            var 
                that = this,
                templStr = $(el.dishTpl).html(),
                templ = Juicer.client(templStr, {list:list}),
                dishEl = DOM.create(templ);

            DOM.insertAfter(dishEl, ev);
        },

        /**
         * 再来一份，点餐操作
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _order: function(ev){
            var    
                that = this;
                li = DOM.parent(ev,'li');
                dishId = DOM.attr(li, DATA_DISH_ID),
                userId = DOM.val(el.userInp),
                data = {
                    dishId : dishId,
                    userId : userId
                };

            that._sendDishId(data);
        },
        /**
         * ajax,发送菜品id，用户id
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _sendDishId: function(data){
            var 
                that = this;
            historyIo.sendDishId(data, function(rs, errMsg){
                if(rs){
                    that._rendDishNum();
                }else{
                    Dialog.log(errMsg);
                }
            });
        },

        /**
         * 渲染我的订单中的菜品总数
         * @return {[type]} [description]
         */
        _rendDishNum: function(){
            var
                that = this;
                dishTotalNumber = $(el.dishTotalNumberEl).attr(DATA_DISH_TOTAL_NUMBER);

            if(dishTotalNumber == ''){
                DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, 1);
                DOM.val(el.dishTotalNumberEl, 1);
                DOM.removeClass(el.dishTotalNumberEl, 'hidden');
            }else{
                dishTotalNumber = parseInt(dishTotalNumber) + 1;
                DOM.attr(el.dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER, dishTotalNumber);
                DOM.text(el.dishTotalNumberEl, dishTotalNumber);
            }             
        }
    })
    return Order;
}, {
    requires:[ 
        'core',
        'pio/history-record',
        'mod/juicer',
        'widget/dialog'
    ]
})