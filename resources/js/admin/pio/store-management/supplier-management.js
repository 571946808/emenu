/*-----------------------------------------------------------------------------
 * @Description:     供货商管理--供货商管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.09
 * ==NOTES:=============================================
 * v1.0.0(2015.11.09):
 * 	初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('pio/store-management/supplier-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    try{
        urls = conn.StoreManagement;
    }catch(e){
        S.log('地址有误!');
        return;
    }
    PW.namespace('io.StoreManagement.SupplierManagement');
    S.mix(PW.io.StoreManagement.SupplierManagement, {
        conn: urls,
        /**
         * 添加供货商
         * @param data
         * @param callback
         */
        addSupplier: function(data, callback){
            var
                supplierManagmetIO = urls.addSupplier;
            supplierManagmetIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑供货商
         * @param data
         * @param callback
         */
        editSupplier: function(data, callback){
            var
                supplierManagementIO = urls.editSupplier;
            supplierManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除供货商
         * @param data
         * @param callback
         */
        delSupplier: function(data, callback){
            var
                supplierManagementIO = urls.delSupplier;
            supplierManagementIO.io(data, function(rs){
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