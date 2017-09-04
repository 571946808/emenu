/*-----------------------------------------------------------------------------
 * @Description:     遮盖层Test
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.01.26
 * ==NOTES:=============================================
 * v1.0.0(2016.01.26):
    测试遮盖层是否可用
 * ---------------------------------------------------------------------------*/
KISSY.add('page/test', function(S, Core){
    PW.namespace('page.Test');
    PW.page.Test = function(param){
        new Core(param);
    }
},{
    requires: [
        'test/core'
    ]
});

KISSY.add('test/core', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        // on = S.Event.on,
        Cover = PW.page.Cover,
        config = {},
        el = {
            //container
            containerArea: '.container'
        }

    function Core(param){
         this._init();
    }
    
    S.augment(Core, {
         _init: function(){
            this._test();
        },
        _test: function(){
            // if(DOM.get(el.containerArea)){
                Cover.client();
            // }
        }
    });
    return Core;
},{
    requires: [
        'module/cover'
    ]
});