KISSY.add('pio/store-management/store-classify-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.StoreManagement;
    }catch(e){
        S.log('地址有误!');
        return;
    }

    PW.namespace('io.StoreManagement.StoreClassifyManagement');
    S.mix(PW.io.StoreManagement.StoreClassifyManagement, {
        conn: urls,
        /**
         * 添加库存分类
         * @param data
         * @param callback
         */
        addStoreClassify: function(data, callback){
            var
                storeClassifyManagementIO = urls.addStoreClassify;
            storeClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑库存分类
         * @param data
         * @param callback
         */
        editStoreClassify: function(data, callback){
            var
                storeClassifyManagementIO = urls.editStoreClassify;
            storeClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除库存分类
         * @param data
         * @param callback
         */
        delStoreClassify: function(data, callback){
            var
                storeClassifyManagementIO = urls.delStoreClassify;
            storeClassifyManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
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
