/*-----------------------------------------------------------------------------
 * @Description:     登录首页
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.8.3
 * ==NOTES:=============================================
 * v1.0.0(2016.8.3):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/licence', function (S, Core) {
    PW.namespace('page.Licence');
    PW.page.Licence = function (param) {
        return new Core();
    }
},{
    requires:[
        'licence/core'
    ]
});
KISSY.add('licence/core', function (S) {
    var
        on = S.Event.on,
        Defender = PW.mod.Defender,
        DOM = S.DOM,
        el = {
            adminPwd: '.J_adminPwd',
            form: '.form-horizontal',
            msgEl: '.J_msg'
        };

    function Core() {
        this._validForm;
        this._init();
    }
    S.augment(Core, S.EventTarget, {
        _init: function () {
            this._bulidEvt();
            this._validForm = Defender.client(el.form, {});
            this._msgClear();
        },
        _bulidEvt: function () {
            var
                that = this;

            on(el.adminPwd, 'keyup', function () {
                that._valid();
            });
        },
        _valid: function () {
            var
                that = this;
            that._validForm.validAll(function(rs){
                if(rs){
                    if(S.one('.pw-tip')){
                        DOM.hide('.pw-tip');
                    }
                }else{
                    DOM.show('.pw-tip');
                }
            });
        },
        _msgClear: function(){
            var
                that = this,
                msg = S.one(el.msgEl);

            if(msg){
                window.setTimeout(function(){
                    DOM.remove(el.msgEl);
                }, 2000);
            }
        }
    });
        return Core;
    },{
        requires:[
            'mod/defender'
        ]
    });