/*-----------------------------------------------------------------------------
* @Description:     菜品相关交互逻辑控制
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-11
* ==NOTES:=============================================
* v1.0.0(2013-12-11):
*   初始生成
* ---------------------------------------------------------------------------*/


KISSY.add(function(){
    var
        dishConnector = PW.conn.dish;

    var DishIO = {
        /**
         * 打印菜品到厨房
         * @param  {Obj}   data     data.orderDishId-订单菜品id
         * @param  {Function} callback 回调
         */
        printDish: function(data, callback){
            var
                thisConn = dishConnector.printDish;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.data, serverData.errMsg);
            })
        },
        /**
         * 扫描条形码以上菜
         * @param  {Obj}   data     data.barCode-条形码信息
         * @param  {Function} callback 回调
         */
        scanBarCode: function(data, callback){
            var 
                thisConn = dishConnector.scanBarCode;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.data, serverData.errMsg);
            })
        }
    }

    PW.namespace('io.Dish');
    PW.io.Dish = DishIO;
},{
    requires:[
        'conn/core'
    ]
})