KISSY.add('pio/base-info-management/printer-management', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.BaseInfoManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.baseInfoManagement.printerManagement');
    
    S.mix(PW.io.baseInfoManagement.printerManagement, {
        conn: urls,
        /**
         * 发送所删除打印机的id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delPrinter: function(data, callback){
            var
                printerManagementIO = urls.delPrinter;
                
            printerManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 改变打印机类型时，发送打印机的id和类型值val
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        changePrinterType: function(data, callback){
            var
                changePrinterTypeIO = urls.changePrinterType;
                
            changePrinterTypeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
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