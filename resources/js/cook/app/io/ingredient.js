/*-----------------------------------------------------------------------------
* @Description:     后厨部分原材料控制
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013/12/19 16:53:32
* ==NOTES:=============================================
* v1.0.0(2013/12/19 16:53:35):
*   初始生成
* ---------------------------------------------------------------------------*/


KISSY.add(function(){
    var
        ingredientConnector = PW.conn.ingredient;

    var IngredientIO = {
        /**
         * 根据关键字搜索
         * @param  {Ojb}   data     data.keyword 关键字
         * @param  {Function} callback 回调
         */
        search: function(data, callback){
            var
                thisConn = ingredientConnector.search;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.data, serverData.errMsg);
            })
        },
        /**
         * 原配料标缺
         * @param  {Ojb}   data     data.id 配料id
         * @param  {Function} callback 回调
         */
        movein: function(data, callback){
            var 
                thisConn = ingredientConnector.movein;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.data, serverData.errMsg);
            })
        },
        /**
         * 原配料恢复
         * @param  {Ojb}   data     data.id 配料id
         * @param  {Function} callback 回调
         */
        moveout: function(data, callback){
            var 
                thisConn = ingredientConnector.moveout;
            thisConn.send(data, function(serverData){
                callback(serverData.code == '0', serverData.data, serverData.errMsg);
            })
        }
    }

    PW.namespace('io.Ingredient');
    PW.io.Ingredient = IngredientIO;
},{
    requires:[
        'conn/core'
    ]
})