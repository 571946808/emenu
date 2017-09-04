KISSY.add('pio/restaurant-management/meal-period-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.RestaurantManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.MealPeriodManagement');
    
    S.mix(PW.io.MealPeriodManagement, {
        conn: urls,
        /**
         * 设置当前餐段，发送餐段ID
         * @param {[type]}   data     [description]
         * @param {Function} callback [description]
         */
        setCurrentPeriod: function(data, callback){
            var
                mealPeriodIO = urls.setCurrentPeriod;
            mealPeriodIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除餐段，发送Id
         * @param  {[type]} data      [description]
         * @param  {[type]} callback [description]
         * @return {[type]}           [description]
         */
        delPeriod: function(data, callback){
            var
                mealPeriodIO = urls.delPeriod;
            mealPeriodIO.io(data, function(rs){
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
                mealPeriodIO = urls.getWeight;
            mealPeriodIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data.weight,
                    rs.errMsg
                );
            });
        },
        /**
         * 改变餐段状态
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        changeStatus: function(data, callback){
            var 
                mealPeriodIO = urls.changeStatus;
            mealPeriodIO.io(data, function(rs){
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
                mealPeriodIO = urls.saveEditItem;
            mealPeriodIO.io(data, function(rs){
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