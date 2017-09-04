KISSY.add('pio/dish-management/dish-classify-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.DishManagement.DishClassifyManagement');
    S.mix(PW.io.DishManagement.DishClassifyManagement, {
        conn: urls,
        /**
         * 添加菜品大类
         * @param data
         * @param callback
         */
        addClassify: function(data, callback){
            var
                dishClassifyManagementIO = urls.addClassify;
            dishClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑菜品大类
         * @param data
         * @param callback
         */
        editClassify: function(data, callback){
            var
                dishClassifyManagementIO = urls.editClassify;
            dishClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除菜品大类
         * @param data
         * @param callback
         */
        delClassify: function(data, callback){
            var
                dishClassifyManagementIO = urls.delClassify;
            dishClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 搜索分类
         * @param data
         * @param callback
         */
        search: function(data, callback){
            var
                dishClassifyManagementIO = urls.search;
            dishClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
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