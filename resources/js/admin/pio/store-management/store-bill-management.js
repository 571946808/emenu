/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存单据管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.12.04
 * ==NOTES:=============================================
 * v1.0.0(2015.12.04):
 * 	初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('pio/store-management/store-bill-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.StoreManagement;
    }catch(e){
        S.log('地址错误');
        return;
    }

    PW.namespace('io.StoreManagement.StoreBillManagement');
    S.mix(PW.io.StoreManagement.StoreBillManagement, {
        conn: urls,
        /**
         * 获取物品小计
         * @param data
         * @param callback
         */
        getMoney: function(data, callback){
            var
                storeBillManagementIO = urls.getMoney;

            storeBillManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 删除库存单据
         * @param data
         * @param callback
         */
        delStoreBill: function(data, callback){
            var
                storeBillManagementIO = urls.delStoreBill;

            storeBillManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 添加库存单据
         * @param data
         * @param callback
         */
        addStoreBill: function(data, callback){
            var
                storeBillManagementIO = urls.addStoreBill;

            storeBillManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 编辑库存单据
         * @param data
         * @param callback
         */
        editStoreBill: function(data, callback){
            var
                storeBillManagementIO = urls.editStoreBill;

            storeBillManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 审核库存单据
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        checkStoreBill: function(data, callback){
            var
                storeBillManagementIO = urls.checkStoreBill;

            storeBillManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送搜索的原材料关键字，返回原材料信息
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendIngredientKeyword: function(data, callback){
            var
                sendIngredientKeywordIO = urls.sendIngredientKeyword;

            sendIngredientKeywordIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 验证是否能合理添加
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        checkEnableAdd: function(data, callback){
            var
                checkEnableAddIO = urls.checkEnableAdd;

            checkEnableAddIO.io(data, function(rs){
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