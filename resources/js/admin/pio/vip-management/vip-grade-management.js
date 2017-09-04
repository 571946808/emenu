/*-----------------------------------------------------------------------------
 * @Description:     会员管理--会员等级管理io
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2015.12.13
 * ==NOTES:=============================================
 * v1.0.0(2015.12.14):
 *  初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/vip-management/vip-grade-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.VipManagement.VipGradeManagement');
    S.mix(PW.io.VipManagement.VipGradeManagement, {
        conn: urls,
        /**
         * 删除时发送ID
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delGrade: function(data, callback){
            var gradeIO = urls.delGrade;
            gradeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        sendMinConsumption: function(data, callback){
            var gradeIO = urls.sendMinConsumption;
            gradeIO.io(data, function(rs){
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