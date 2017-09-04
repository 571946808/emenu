/*-----------------------------------------------------------------------------
 * @Description:     会员管理--充值方案管理io
 * @Version:         2.0.0
 *  @author:         hujun(435043636@qq.com)
 * @date             2015.12.14
 * ==NOTES:=============================================
 * v1.0.0(2015.12.14):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-recharge-plan-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.VipManagement.VipRechargePlan');
    S.mix(PW.io.VipManagement.VipRechargePlan, {
        conn: urls,
        /**
         * 保存新添加的方案
         * @param {[type]}   data     [description]
         * @param {Function} callback [description]
         */
        sendAddPlan: function(data, callback){
            var
                planIO = urls.sendAddInfo;

            planIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );   
            });
        },
        /**
         * 保存编辑后的方案
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendEditPlan: function(data, callback){
            var 
                planIO = urls.sendEditInfo;

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
        sendDelPlan: function(data, callback){
            var 
                planIO = urls.delPlanId;

            planIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 改变启用/停用状态
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        changeStatus: function(data, callback){
            var 
                planIO = urls.changeStatus;

            planIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
    });
},{
    requires: [
        'mod/connector'
    ]
});