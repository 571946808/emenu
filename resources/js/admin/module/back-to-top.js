/*-----------------------------------------------------------------------------
 * @Description:     back-to-top.js
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.9.10
 * ==NOTES:=============================================
 * v1.0.0(2015.9.10):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('module/back-to-top', function(S, Core) {
    PW.namespace('module.BackToTop');
    PW.module.BackToTop = function () {
        new Core();
    }
},{
    requires: [
        'back-to-top/core'
    ]
});
KISSY.add('back-to-top/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        el = {
            // 触发器
            backToTopTrigger: '#back-to-top'
        };

    function BackToTop(){
        this._init();
    }

    S.augment(BackToTop,{
        _init: function(){
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            on(el.backToTopTrigger, 'click', function(){
                that._backToTop();
            });
        },
        _backToTop: function(){
            var
                that = this;

            $("html,body").animate({scrollTop:0}, 0.2);
        }
    });

    return BackToTop;
});