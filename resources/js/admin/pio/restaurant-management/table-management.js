KISSY.add('pio/restaurant-management/table-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.RestaurantManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.TableManagement');
    
    S.mix(PW.io.TableManagement, {
        conn: urls,
        /**table-management-list.js
         * [停用/恢复餐台时发送餐台ID]
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        changeStatus: function(data, callback){
            var
                tableManagementIO = urls.changeTableStatus;
            tableManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**table-management-list.js
         * 删除一个餐台，发送id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delOneTable: function(data, callback){
            var 
                tableManagementIO = urls.delOneTable;
            tableManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 搜索table-management-list.js
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        searchTable: function(data, callback){
            var 
                tableManagementIO = urls.searchTable;
            tableManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**table-management-list.js
         * 批量删除，发送的是ID的数组
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        batchDelete: function(data, callback){
            var 
                tableManagementIO = urls.batchDelete;
            tableManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        
        /**
         * table-management-add.js 添加餐台时，验证名称是否重复
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendTableName: function(data, callback){
            var 
                tableAddIO = urls.sendTableName;
            tableAddIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * table-management-list.js 编辑时发送餐台id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        editSendId: function(data,callback){
            var 
                tableListIO = urls.editSendId;
            tableListIO.io(data, function(rs){
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