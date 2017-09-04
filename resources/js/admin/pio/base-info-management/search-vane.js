KISSY.add('pio/base-info-management/search-vane', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.BaseInfoManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.baseInfoManagement.searchVane');
    
    S.mix(PW.io.baseInfoManagement.searchVane, {
        conn: urls,
        /**
         * 发送新添加菜品关键字的值，并获取该菜品的id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        addOrder: function(data, callback){
            var
                searchVaneIO = urls.addOrder;
            searchVaneIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送所删除菜品的id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delOrder: function(data, callback){
            var
                searchVaneIO = urls.delOrder;
            searchVaneIO.io(data, function(rs){
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