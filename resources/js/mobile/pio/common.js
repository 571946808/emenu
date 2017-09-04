/*-----------------------------------------------------------------------------
 * @Description:     顾客点餐段common的io，头部，尾部
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.5.31
 * ==NOTES:=============================================
 * v1.0.0(2016.5.31):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/common', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Common;
    }catch(e){
        S.log('地址信息错误');
        return;
    }


    PW.namespace('io.Common');

    S.mix(PW.io.Common, {
        conn: urls,
        /**
         * 呼叫服务
         * @param data
         * @param callback
         */
        callService: function(data, callback){
            var
                commonIO = urls.callService;

            commonIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 或去服务列表
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getService: function(data, callback){
            var
                commonIO = urls.getService;
            commonIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        }
        // sendClassifyId: function(data, callback){
        //     var 
        //         commonIO = urls.sendClassifyId;
        //     commonIO.io(data, function(rs){
        //         callback(
        //             rs.code == 0,
        //             rs.list,
        //             rs.errMsg
        //         )
        //     })
        // }
    });
}, {
    requires:[
        'mod/ext',
        'mod/connector'
    ]
})