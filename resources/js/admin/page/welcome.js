/*-------------------------------------------------------------
 * @Description:     欢迎页
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.7.29
 * ==NOTES:=============================================
 * v1.0.0(2016.7.29):
 初始生成
 * -----------------------------------------------------------------*/
KISSY.add('page/welcome', function(S, List){
    PW.namespace('page.Welcome.Core');
    PW.page.Welcome.Core = function(param){
        new List(param);
    };
},{
    requires: [
        'welcome/core'
    ]
});

KISSY.add('welcome/core',function(S){
    var
        DOM = S.DOM, $=S.all,
        el = {
            //提示信息
            msgEl: '.J_msg'
        };

    function List(param){
        this._init();
    }

    S.augment(List, {
        _init: function(){
            this._msgClear();
        },
        /**
         * 定时清除提示信息
         * @return {[type]} [description]
         */
        _msgClear: function(){
            var
                that = this,
                msg = S.one(el.msgEl);
            if(msg){
                window.setTimeout(function(){
                    //S.log(DOM.get(el.msgEl));
                    DOM.remove(el.msgEl);
                }, 2000);
            }
        }
    });
    return List;
},{
    requires:[
        'mod/ext'
    ]
});

