/*-----------------------------------------------------------------------------
 * @Description:     菜品管理---菜品管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.12.12
 * ==NOTES:=============================================
 * v1.0.0(2015.12.12):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/dish-management/package-dish-management', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.DishManagement.PackageDishManagement');
    S.mix(PW.io.DishManagement.PackageDishManagement, {
        conn: urls,
        /**
         * 删除套餐
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delPackageDish: function(data, callback){
            var
                dishManagementIO = urls.delPackageDish;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑套餐状态
         * @param data
         * @param callback
         */
        changePackageDishStatus: function(data, callback){
            var
                dishManagementIO = urls.changePackageDishStatus;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 获取套餐的总金额
         * @param data
         * @param callback
         */
        getPackageDishTotalMoney: function(data, callback){
            var
                dishManagementIO = urls.getPackageDishTotalMoney;
            dishManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        ///**
        // * 删除套餐中的菜品
        // * @param data
        // * @param callback
        // */
        // delDishInPackage: function(data, callback){
        //    var
        //        dishManagementIO = urls.delDishInPackage;
        //    dishManagementIO.io(data, function(rs){
        //        callback(
        //            rs.code == 0,
        //            rs.data,
        //            rs.errMsg
        //        );
        //    });
        // },
        /**
        * 保存套餐中的菜品
        * @param data
        * @param callback
        */
        // addDishInPackage: function(data, callback){
        //    var
        //        dishManagementIO = urls.addDishInPackage;
        //    dishManagementIO.io(data, function(rs){
        //        callback(
        //            rs.code == 0,
        //            rs.data,
        //            rs.errMsg
        //        );
        //    });
        // },
        /**
         * 更新当前套餐中已选菜品的总金额和数量
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getPackagePriceAndQuantity: function(data, callback){
            var
               getPackagePriceAndQuantityIO = urls.getPackagePriceAndQuantity;
           getPackagePriceAndQuantityIO.io(data, function(rs){
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