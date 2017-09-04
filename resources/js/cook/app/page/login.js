/*-----------------------------------------------------------------------------
* @Description:     控制登录的一些操作
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013/12/24 09:35:38
* ==NOTES:=============================================
* v1.0.0(2013/12/24 09:35:40):
*     后厨登录逻辑
* ---------------------------------------------------------------------------*/

KISSY.add(function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        IO = S.IO, on = S.Event.on,
        Defender = PW.mod.Defender,
        el = {
            loginForm: '#J_loginForm',
            userNameField: '#J_userName',
            pwdField: '#J_password'
        },
        LoginIO = PW.io.Login;
    function Login(){
        this._valid;
        this._init();
    }

    S.augment(Login, {
        _init: function(){
            this._setLoginValid();
            this._addEvtDispatcher();
        },
        _addEvtDispatcher: function(){
            var
                that = this;
            on(el.loginForm, 'submit', that._loginSubmitHandler, that);
        },
        _loginSubmitHandler: function(ev){
            var
                that = this,
                t = ev.target,
                v = that._valid,
                data = DOM.serialize(el.loginForm);
            v.validAll();
            v.getValidResult('type', function(rs){
                if(rs){
                    LoginIO.login(data, function(code, errMsg){
                        if(code){
                            t.submit();
                        }else{
                            alert(errMsg);
                        }
                    });
                    return false;
                }else{
                    alert('请确认输入!');
                }
            });
            return false;
        },
        _setLoginValid: function(){
            var
                that = this;
            this._valid = PW.mod.Defender(el.loginForm, {
                showTip: false
            });
        }
    });

    PW.namespace('page.login');
    PW.page.login = function(){
        new Login();
    }

},{
    requires:[
        'io/login',
        'core',
        'page/common/bootstrap',
        'mod/defender',
        'page/common/placeholder'
    ]
})