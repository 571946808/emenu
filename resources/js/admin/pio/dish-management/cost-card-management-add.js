KISSY.add('pio/dish-management/cost-card-management-add', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }
    PW.namespace("io.DishManagement.CostCardManagementAdd");
    S.mix(PW.io.DishManagement.CostCardManagementAdd, {
        conn: urls,
        /**
         * 获取原材料单位
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getUnit: function(data, callback){
            var 
                CostCardManagementIO = urls.getUnit;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        },
        /**
         * 获取菜品列表
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getIngredient: function(data, callback){
            var 
                CostCardManagementIO = urls.getIngredientsName;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                )
            })
        },
        afterAddIngredient: function(data, callback){
            var 
                CostCardManagementIO = urls.afterAddIngredient;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        },
        afterEditIngredient: function(data, callback){
            var 
                CostCardManagementIO = urls.afterEditIngredient;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        },
        delIngredient: function(data, callback){
            var
                CostCardManagementIO = urls.delIngredient;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        },
        submitData: function(data, callback){
            var
                CostCardManagementIO = urls.submitData;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        },
        getPrice: function(data, callback){
            var
                CostCardManagementIO = urls.getPrice;
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                )
            })
        }
    })
},{
    requires:[
        'mod/connector'
    ]
})