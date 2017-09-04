/*-----------------------------------------------------------------------------
* @Description:     餐桌io
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-11
* ==NOTES:=============================================
* v1.0.0(2013-12-11):
*   初始生成
* ---------------------------------------------------------------------------*/

KISSY.add(function(S){
    var
        tableConnector = PW.conn.table,
        ERR_COUNTER = {
            getTablesVersion: 0,
            getTableInfo: 0
        };

    var TableIO = {
        /**
         * 获取所有餐桌的版本信息
         * @param  {Function} callback 回调   
         */
        getTablesVersion: function(data, callback){
            var
                that = this,
                thisConn = tableConnector.getTablesVersion;
            thisConn.send(data, function(serverData){
                var 
                    args = arguments,
                    rs = (serverData.code == 0);
                if(rs){
                    callback(rs, serverData.data, serverData.errMsg);
                    ERR_COUNTER.getTablesVersion = 0;
                    return;
                }
                if(ERR_COUNTER.getTablesVersion < 2){
                    window.setTimeout(function(){
                        that.getTablesVersion(data, callback);
                        ERR_COUNTER.getTablesVersion++;
                    }, 1000);
                }else{
                    ERR_COUNTER.getTablesVersion = 0;
                    callback(false, serverData.data, serverData.errMsg);
                    //TODO: 如果三次重试仍在失败，考虑此处刷新页面
                    //window.location.reload();
                }
            })
        },
        /**
         * 获取餐桌详细信息
         * @param  {obj}   data     data.tableId-²Í×Àid
         * @param  {Function} callback 回调
         */
        getTableInfoById: function(data, callback){
            var 
                that = this,
                thisConn = tableConnector.getTableInfoById;
            thisConn.send(data, function(serverData){
               var 
                    args = arguments,
                    rs = (serverData.code == 0);
                if(rs){
                    callback(true, serverData.data, serverData.errMsg);
                    ERR_COUNTER.getTableInfo = 0;
                    return;
                }
                if(ERR_COUNTER.getTableInfo < 2){
                    window.setTimeout(function(){
                        that.getTableInfoById(data, callback);
                        ERR_COUNTER.getTableInfo++;
                    }, 1000);
                }else{
                    ERR_COUNTER.getTableInfo = 0;
                    callback(false, serverData.data, serverData.errMsg);
                }
            });
        },
        /**
         * 判断打印机是否可用
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getPrintInfo: function(data, callback){
            var 
                that = this,
                thisConn = tableConnector.getPrintInfo;
            thisConn.send(data, function(serverData){
               var 
                    args = arguments,
                    rs = (serverData.code == 0);
                if(rs){
                    callback(true, serverData.errMsg);
                }else{
                    callback(false, serverData.errMsg);
                }
            });
        }
    }


    PW.namespace('io.Table');
    PW.io.Table = TableIO;
},{
    requires:[
        'conn/core'
    ]
})