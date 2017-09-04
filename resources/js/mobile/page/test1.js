/*-----------------------------------------------------------------------------
 * @Description:     我的订单
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.03.21
 * ==NOTES:=============================================
 * v1.0.0(2016.03.21):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('page/test1', function(S, Core){
    PW.namespace('page.Test1');
    PW.page.Test1 = function(param){
        new Core(param);
    }
 },{
    requires:[
        'my-order/core'
    ]
 });
 KISSY.add('my-order/core', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        get = DOM.get,
        query = DOM.query,
        on = S.Event.on,
        testIO = PW.io.test1,
        Juicer = PW.mod.Juicer.client,
        // ImageLazyLoad = PW.module.ImageLazyLoad,
        el = {
            dishTemp: "#dishTpl",
            //本单消费
            currenCustomEl: ".curren-custom",
            //餐桌信息
            tabelInfoEl: ".table-info",
            //订单菜品列表容器
            dishListEl: ".ordering-list",
            // // 
            extraEl: ".order-service",
            // //订单记录
            // orderRecordEl: ".order-record"
        };

    function Core(param){
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            core = {};
            S.mix(core, {
                page: 1
            });
            //this._initIscroll();
            // this._load();
            this._buildEvt();  
        
        },

        _buildEvt: function(){
            var
                that = this;
                // common = core.common;
        },
        /**
         * 初始化滚动条
         * @return {[type]} [description]
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
                extraNode: [el.extraEl],
                // 是否懒加载
                isLazyLoad: false
                // 参与懒加载的节点class
                // lazyLoadRenderTo: 'lazy-load'
            }).iscroll;
        },
        _refresh: function(){
            var
                that = this;

            window.location.reload();
        },  
        _load: function(){
            var
                // this指向iscroll
                that = this,
                orderTemp,
                dishStr,
                dishDOM,
                iscroll = this.iscroll,
                page = core.page;

            S.mix(core, {
                page: page + 1
            });

            // 发送请求
            testIO.getOrderList({
                page: core.page,
                pageSize: 10,
                userId: 112233,
            }, function(rs, data, errMsg){
                if(rs){
                    dishTemp = DOM.html(el.dishTemp);
                    dishStr = Juicer(dishTemp, {
                        data: data
                    });
                    dishDOM = DOM.create(dishStr);
                    DOM.append(dishDOM, el.dishListEl);
                   
                    // ImageLazyLoad.client({
                    //     renderTo: '.lazy-load',
                    //     container: '.ordering-list'
                    // });
                    // 如果新添加的菜品有被点过,则显示数量
                    // common.fire('showDishNumber');
                    iscroll.refresh();
                }else{
                    // var
                    //     pullUpEl = get('#pullUp', 'body'),
                    //     pullUpLabel = get('.pullUpLabel', pullUpEl),
                    //     loader = get('.loader', pullUpEl);

                    // DOM.css(loader, 'display', 'none');
                    // DOM.removeClass(pullUpEl, 'loading');
                    // DOM.text(pullUpLabel, '亲,您已经看完了!');
                }
            });
        }
        
    });

    return Core;
},{
    requires:[
        'mod/juicer',
        'pio/test1',
        'module/iscroll',
        'core'
    ]
});
 