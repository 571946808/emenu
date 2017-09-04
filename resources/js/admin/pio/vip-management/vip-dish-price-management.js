/*-----------------------------------------------------------------------------
 * @Description:     会员管理--会员价管理io
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2015.11.25
 * ==NOTES:=============================================
 * v1.0.0(2015.11.25):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-dish-price-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.VipManagement.VipDishPrice');
    S.mix(PW.io.VipManagement.VipDishPrice, {
        conn: urls,
        /**
         * 搜索
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendSearchInfo: function(data, callback){
            var vipDishPriceIO = urls.sendSearchInfo;
            vipDishPriceIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                )
            })
        },
        /**
         * 保存
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendEditInfo: function(data, callback){
            var vipDishPriceIO = urls.sendEditInfo;
            vipDishPriceIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                )
            })
        },
        /**
         * 自动生成发送数据
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendData: function(data, callback){
            var vipDishPriceIO = urls.sendData;
            vipDishPriceIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                )
            })
        }
    });
},{
    requires: [
        'mod/connector'
    ]
});