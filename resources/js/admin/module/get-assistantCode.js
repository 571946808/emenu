/*-----------------------------------------------------------------------------
 * @Description:     get-assistantCode.js获取助记码
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.17
 * ==NOTES:=============================================
 * v1.0.0(2015.11.17):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('module/get-assistantCode', function(S, Core){
    PW.namespace('module.GetAssistantCode');
    PW.module.GetAssistantCode = {
        client: function(param){
            return new Core(param);
        }
    };
},{
    requires: [
        'get-assistantCode/core'
    ]
});

KISSY.add('get-assistantCode/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        GetAssistantCodeIO = PW.io.Module.GetAssistantCode,
        config = {
            // 触发器
            trigger: '',
            // 渲染节点
            renderTo: ''
        },
        el = {

        };

    function Core(param){
        this.opts = S.merge(config, param);
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._sendName();
        },
        /**
         * 发送名称
         * @private
         */
        _sendName: function(){
            var
                that = this,
                trigger = that.opts.trigger,
                sendName = that.opts.name,
                sendInp = DOM.val(trigger);

            GetAssistantCodeIO.getAssistantCode({
                str: sendInp
            }, function(rs, data, errMsg){
                if(rs){
                    that._renderAssistantCode(data.pinyin);
                }else{
                }
            });

        },
        /**
         * 获取名称的拼音
         * @param pinyin
         * @private
         */
        _renderAssistantCode: function(pinyin){
            var
                that = this,
                renderTo = that.opts.renderTo;
            if(DOM.nodeName(renderTo) == 'input'){
                DOM.val(renderTo, pinyin);
            }else{
                DOM.text(renderTo, pinyin);
            }
        }
    });

    return Core;
},{
    requires: [
        'widget/dialog',
        'pio/module/get-assistantCode'
    ]
});