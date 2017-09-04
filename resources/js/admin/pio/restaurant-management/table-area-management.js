KISSY.add('pio/restaurant-management/table-area-management', function(S){

    var 
        urls,
        conn = PW.mod.Connector(_pw_apiData);
  
    try{
        urls = conn.RestaurantManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.RestaurantManagement');
    
    S.mix(PW.io.RestaurantManagement, {
        conn: urls,
        /**
         * 删除餐台区域时，发送需删除的id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delArea: function(data, callback){
            var 
                delAreaIO = urls.delAreaId;

            delAreaIO.io(data,function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 保存编辑原有区域信息结果
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        saveEditArea: function(data, callback){
            var
                saveEditAreaIO = urls.saveEditArea;

            saveEditAreaIO.io(data,function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 保存新添加区域信息
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        saveNewArea: function(data, callback){
            var 
                saveNewAreaIO = urls.saveNewArea;

            saveNewAreaIO.io(data,function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
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