/*-----------------------------------------------------------------------------
 * @Description:     历史消费记录
 * @Version:         1.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.04.14
 * ==NOTES:=============================================
 * v1.0.0(2016.04.14):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/history-record', function(S){
    var 
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    
    try{
        urls = conn.HistoryRecord;
    }catch(e){
        S.log('地址信息错误')
        return;
    }

    PW.namespace('io.HistoryRecord');
    S.mix(PW.io.HistoryRecord, {
        conn: urls,
        /**
         * 得到残品列表
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getDishList: function(data, callback){
            var 
                dishIO = urls.getDishList;
            
            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送菜品id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendDishId: function(data, callback){
            var
                dishIO = urls.sendDishId;

            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        }
    })
}, {
    requires: [
        'mod/ext',
        'mod/connector'
    ]
})