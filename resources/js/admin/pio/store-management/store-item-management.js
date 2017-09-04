/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存物品管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.12
 * ==NOTES:=============================================
 * v1.0.0(2015.11.12):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/store-management/store-item-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.StoreManagement;
    }catch(e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.StoreManagement.StoreItemManagement');
    S.mix(PW.io.StoreManagement.StoreItemManagement, {
        conn: urls,
        /**
         * 删除库存物品
         * @param data
         * @param callback
         */
        delStoreItem:  function(data, callback){
            var
                storeItemManagementIO = urls.delStoreItem;
            storeItemManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑换算比例
         * @param data
         * @param callback
         */
        editStoreItemConversionRatio: function(data, callback){
            var
                storeItemManagementIO = urls.editStoreItemConversionRatio;
            storeItemManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 选择原配料之后，获取其对应的成本卡单位
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getCostCardUnit: function(data, callback){
            var
                StoreItemManagementIO = urls.getCostCardUnit;

            StoreItemManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 提交添加的库存物品
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        submitStorageItem: function(data, callback){
            var
                StoreItemManagementIO = urls.submitStorageItem;

            StoreItemManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            })
        },
        /**
         * 提交编辑的库存物品
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        submitEditedStorageItem: function(data, callback){
            var
                StoreItemManagementIO = urls.submitEditedStorageItem;

            StoreItemManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送库存id、库存单位和转化比例，获取库存预警、总数量
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getRelatedSettings: function(data, callback){
            var
                StoreItemManagementIO = urls.getStorageUnitRelatedSettings;

            StoreItemManagementIO.io(data, function(rs, data, errMsg){
                callback(
                    rs.code == 0,
                    rs.data,
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