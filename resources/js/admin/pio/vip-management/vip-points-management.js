/*-----------------------------------------------------------------------------
 * @Description:     会员管理--会员积分管理io
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2015.1.20
 * ==NOTES:=============================================
 * v1.0.0(2015.1.20):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-points-management', function(S){
     var 
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.VipManagement.VipPoints');
    
    S.mix(PW.io.VipManagement.VipPoints, {
        conn: urls,
        /**
         * [发送积分设置的状态]
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        _sendStatus: function(data, callback){
            var VipPointsIO = urls.sendStatus;

            VipPointsIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除时发送Id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        _sendId: function(data, callback){
            var
                VipPointsIO = urls.sendId;
            VipPointsIO.io(data, function(rs){
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