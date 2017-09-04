/*-----------------------------------------------------------------------------
 * @Description:     基本信息管理-全局设置
 * @Version:         1.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.8.3
 * ==NOTES:=============================================
 * v1.0.0(2016.8.3):
 初始生成
 * ----------------------------------------------------------------*/
KISSY.add('page/base-info-management/global-settings', function(S, Core){
    PW.namespace('page.BaseInfoManagement.GlobalSettings');
    PW.page.BaseInfoManagement.GlobalSettings = function(param){
        new Core(param);
    }
}, {
     requires:[
        'global-settings/core'
    ]
});

KISSY.add('global-settings/core', function(S){
    var
        DOM = S.DOM, $ = S.all(),
        on = S.Event.on,
        Defender = PW.mod.Defender,
        config = {},
        el = {
            //表单
            operForm: '.J_operForm',
            //提交按钮
            submitBtn: '.J_submitBtn',
            //提示信息
            msgEl: '.J_msg'
        };

    function Core(param){
        this.opts = S.mix(config, param);
        this.submitBtn = DOM.data(el.submitBtn, 'btn');
        this.defender = Defender.client(el.operForm);
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this._builtEvt();
            this._clearTip();
        },
        /**
         * 清除提示信息
         * @return {[type]} [description]
         */
        _clearTip: function(){
            var
                that = this,
                msgTip = S.one(el.msgEl);

            if(msgTip){
                setTimeout(function(){
                    DOM.remove(el.msgEl);
                }, 2000);
            }
        },
        _builtEvt: function(){
            var
                that = this;

            that.submitBtn.on('loading', function(){
                that._submitForm();
                return false;
            });
        },
        _submitForm: function(){
            var
                that = this,
                form = S.get(el.operForm);

            that.defender.validAll(function(rs){
                if(rs){
                    setTimeout(function(){
                        form.submit();
                    }, 1500);
                }else{
                    that.submitBtn.reset();
                }
            });
        }
    });
    
    return Core;
}, {
    requires:[
        'mod/defender',
        'widget/btn',
    ]
})