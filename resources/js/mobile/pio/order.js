/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.03.24
 * ==NOTES:=============================================
 * v1.0.0(2016.03.24):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/order', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Order;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.orderList');

    S.mix(PW.io.orderList, {
        conn: urls,
        /**
         * 获取订单列表
         * @param data
         * @param callback
         */
        getOrderList: function(data, callback){
            var
                orderListIO = urls.getOrderList;

            orderListIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        deleteOrderingDish: function(data, callback){
            var
                deleteOrderingDishIO = urls.deleteOrderingDish;

            deleteOrderingDishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        sendConfirmOrderInfo: function(data, callback){
            var
                sendConfirmOrderInfoIO = urls.sendConfirmOrderInfo;

            sendConfirmOrderInfoIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        sendDishNumChangeInfo: function(data, callback){
            var
                sendDishNumChangeInfoIO = urls.sendDishNumChangeInfo;

            sendDishNumChangeInfoIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送用户下单状态，后端返回计算当前下单的消费金额
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendOrderStatus: function(data, callback){
            var
                sendOrderStatusIO = urls.sendOrderStatus;

            sendOrderStatusIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送用户取消下单状态
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendDeblockingStatus: function(data, callback){
            var
                sendDeblockingStatusIO = urls.sendDeblockingStatus;

            sendDeblockingStatusIO.io(data, function(rs){
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