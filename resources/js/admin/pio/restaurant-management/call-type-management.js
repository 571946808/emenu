KISSY.add('pio/restaurant-management/call-type-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.RestaurantManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }
    PW.namespace('io.CallTypeManagement');
    
    S.mix(PW.io.CallTypeManagement, {
        conn: urls,
        
        /**
         * 删除呼叫类型，发送Id
         * @param  {[type]} data      [description]
         * @param  {[type]} callback [description]
         * @return {[type]}           [description]
         */
        delCall: function(data, callback){
            var
                callTypeIO = urls.delCall;
            callTypeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 添加时获取默认排序
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getWeight: function(data, callback){
            var 
                callTypeIO = urls.getRank;
            callTypeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data.weight,
                    rs.errMsg
                );
            });
        },
        /**
         * 改变呼叫类型状态
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        changeStatus: function(data, callback){
            var 
                callTypeIO = urls.changeState;
            callTypeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 保存编辑项
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        saveEditItem: function(data,callback){
            var 
                callTypeIO = urls.saveEditTerm;
            callTypeIO.io(data, function(rs){
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