/*-----------------------------------------------------------------------------
 * @Description:     公共的功能
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.27
 * ==NOTES:=============================================
 * v1.0.0(2016.01.27):
 初始生成
 1.footer我的订单处有菜品已点,就闪烁我的订单图标
 * ---------------------------------------------------------------------------*/

KISSY.add('module/common', function(S, PromptUser){
    PW.namespace('module.Common');
    PW.module.Common = {
        promptUser: function(){
            return new PromptUser();
        }
    };
},{
    requires: [
        'common/prompt-user'
    ]
});

KISSY.add('common/prompt-user', function(S){
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

    function PromptUser(){
        this._init();
    }

    S.augment(PromptUser, S.EventTarget, {
        _init: function(){
        },
        /**
         * 闪烁"我的订单"
         */
        promptUser: function(){
            var
                that = this;

            DOM.addClass(el.myOrderEl, 'in');
        },
        /**
         * 初始化时,如果菜品总数目是否显示和我的订单是否闪烁
         */
        initPromptUser: function(){
            var
                that = this,
                dishTotalNumberEl = get(el.dishTotalNumberEl, '.footer'),
                dishTotalNumber = DOM.attr(dishTotalNumberEl, DATA_DISH_TOTAL_NUMBER);

            if(dishTotalNumber){
                DOM.addClass(el.myOrderEl, 'in');
                DOM.removeClass(el.dishTotalNumberEl, 'hidden');
                DOM.text(dishTotalNumberEl, dishTotalNumber);
            }else{
                DOM.removeClass(el.myOrderEl, 'in');
                DOM.addClass(el.dishTotalNumberEl, 'hidden');
                DOM.text(dishTotalNumberEl,'');
            }
        }
    });

    return PromptUser;
},{
    requires: [
        'core'
    ]
});
