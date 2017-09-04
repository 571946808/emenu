KISSY.add('pio/dish-management/cost-card-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.DishManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }
    PW.namespace("io.DishManagement.CostCardManagement");
    S.mix(PW.io.DishManagement.CostCardManagement, {
        conn: urls,
        /**
         * 删除成本卡时发送id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delCostCard: function(data, callback){
            var
                CostCardManagementIO = urls.delCostCard; 
            CostCardManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
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