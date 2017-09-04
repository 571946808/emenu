/*-----------------------------------------------------------------------------
 * @Description:     会员管理--会员价方案管理io
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2015.11.25
 * ==NOTES:=============================================
 * v1.0.0(2015.11.25):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-dish-price-plan', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.VipManagement.VipDishPricePlan');
    S.mix(PW.io.VipManagement.VipDishPricePlan, {
        conn: urls,
        /**
         * 保存编辑后的方案
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendEditPlan: function(data, callback){
            var planIO = urls.sendEditPlan;
            planIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
             });
        },
        /**
         * 删除时发送ID
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delPlan: function(data, callback){
            var planIO = urls.delPlan;
            planIO.io(data, function(rs){
                callback(
                    rs.code == 0,
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