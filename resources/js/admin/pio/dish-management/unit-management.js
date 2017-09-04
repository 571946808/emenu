KISSY.add('pio/dish-management/unit-management', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.UnitManagement');
    
    S.mix(PW.io.UnitManagement, {
        conn: urls,
       /** unit-management.js
         * 删除单位时，发送单位id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delUnit: function(data, callback){
            var
                UnitManagementIO = urls.delUnit;
            UnitManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** unit-management.js
         * 保存编辑后的原配料单位时，发送原配料单位id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveUnit: function(data, callback){
            var
                UnitManagementIO = urls.saveUnit;
            UnitManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** unit-management.js
         * 添加-保存原配料单位时，表达式name
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveNewUnit: function(data, callback){
            var
                UnitManagementIO = urls.saveNewUnit;
            UnitManagementIO.io(data, function(rs){
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