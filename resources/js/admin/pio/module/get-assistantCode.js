/*-----------------------------------------------------------------------------
 * @Description:     公共模块--获取名称所对应的助记码io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.17
 * ==NOTES:=============================================
 * v1.0.0(2015.11.17):
 * 	初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('pio/module/get-assistantCode', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Module;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.Module.GetAssistantCode');
    S.mix(PW.io.Module.GetAssistantCode, {
        conn: urls,
        /**
         * 获取名称所对应的助记码
         * @param data
         * @param callback
         */
        getAssistantCode: function(data, callback){
            var
                getAssistantCodeIO = urls.getAssistantCode;
            getAssistantCodeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        }
    });
},{
    requires: [
        'mod/connector'
    ]
});
