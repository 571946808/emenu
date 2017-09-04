/*-----------------------------------------------------------------------------
 * @Description:     会员管理--会员卡管理io
 * @Version:         2.0.0
 *  @author:         hujun(435043636@qq.com)
 * @date             2016.1.20
 * ==NOTES:=============================================
 * v1.0.0(2016.1.20):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-card-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.VipManagement.VipCardInfo');
    S.mix(PW.io.VipManagement.VipCardInfo, {
        conn: urls,
        /**
         * 发送改变的会员卡id、状态
         * @param {[type]}   data     [description]
         * @param {Function} callback [description]
         */
        changeStatus: function(data, callback){
            var
                changeStatusIO = urls.changeStatus;

            changeStatusIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );   
            });
        },
        /**
         * 发送删除的会员卡id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delCardId: function(data, callback){
            var
                delCardIdIO = urls.delCardId;

            delCardIdIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送会员卡id,修改的有效期和是否永久有效
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendSaveInfo: function(data, callback){
            var
                sendSaveInfoIO = urls.sendSaveInfo;

            sendSaveInfoIO.io(data, function(rs){
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