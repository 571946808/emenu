/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存盘点io
 * @Version:         2.0.0
 * @author:          yud(862669640@qq.com)
 * @date             2016.7.21
 * ==NOTES:=============================================
 * v1.0.0(2016.7.21):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/store-management/store-inventory-management', function(S){
 	var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.StoreManagement;
    }catch(e){
        S.log('地址错误');
        return;
    }

    PW.namespace('io.StoreManagement.InventoryManagement');

    S.mix(PW.io.StoreManagement.InventoryManagement, {
    	conn: urls,
        /**
         * 库存盘点
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        inventory: function(data, callback){
            var
                inventoryManagementIO = urls.inventory;

            inventoryManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        }
    });
}, {
	requires: [
		'mod/connector'
	]
});
