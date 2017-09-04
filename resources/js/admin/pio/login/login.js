KISSY.add('pio/login/login', function(S){

    var 
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Login;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.Login');
    
    S.mix(PW.io.Login, {
        conn: urls,
        /**
         * 发送用户登录的用户名和密码
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getLogin:function(data,callback){
            var
                loginIO = urls.getLogin;

            loginIO.io(data,function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        }    
    })
},{
    requires:[
        'mod/ext',
        'mod/connector'
    ]
})