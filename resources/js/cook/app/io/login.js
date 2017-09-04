/*-----------------------------------------------------------------------------
* @Description:     后厨登录相关交互逻辑控制
* @Version:         1.0.0
* @author:          wangjing(1284663246@qq.com)
* @date             2014-05-22
* ==NOTES:=============================================
* v1.0.0(2014-05-22):
*   初始生成
* ---------------------------------------------------------------------------*/


KISSY.add('io/login', function(){
    var
        loginConnector = PW.conn.login;

    var LoginIO = {
        /**
         * 用户登录验证
         * @param  {Obj}   data     username , password
         * @param  {Function} callback 回调
         */
        login: function(data, callback){
            var
                thisConn = loginConnector.login;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.errMsg);
            });
        }
    }

    PW.namespace('io.Login');
    PW.io.Login = LoginIO;
},{
    requires:[
        'conn/core'
    ]
})