/*-----------------------------------------------------------------------------
 * @Description:     菜品管理---菜品管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.17
 * ==NOTES:=============================================
 * v1.0.0(2015.11.17):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/dish-management/dish-management', function(S){

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
         * 删除菜品
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delDish: function(data, callback){
            var
                dishManagementIO = urls.delDish;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑菜品状态
         * @param data
         * @param callback
         */
        changeDishStatus: function(data, callback){
            var
                dishManagementIO = urls.changeDishStatus;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送菜品分类联动id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        sendClassLinkage: function(data, callback){
            var
                dishManagementIO = urls.sendClassLinkage;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除菜品图片
         * @param data
         * @param callback
         */
        delPic: function(data, callback){
            var
                dishManagementIO = urls.delPic;
            dishManagementIO.io(data, function(rs){
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