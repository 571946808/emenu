/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-菜品口味管理
 * @Version:         2.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2015.11.09
 * ==NOTES:=============================================
 * v1.0.0(2015.11.25):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/dish-management/dish-taste-management', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.DishManagement.DishManagement');
    S.mix(PW.io.DishManagement.DishManagement, {
        conn: urls,
        /**
         * 发送新添加的菜品口味
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        saveAddTaste: function(data, callback){
            var
                dishManagementIO = urls.saveAddTaste;

            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                )
            });
        },
        /**
         * 发送编辑菜品信息
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        saveEditTaste: function(data, callback){
            var
                dishManagementIO = urls.saveEditTaste;

            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                )
            });
        },
        /**
         * 删除菜品口味
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        deleteTaste: function(data, callback){
            var
                dishManagementIO = urls.deleteTaste;

            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                )
            });
        }
    })
},{
    requires:[
        'mod/ext',
        'mod/connector'
    ]
})