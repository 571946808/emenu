/*-----------------------------------------------------------------------------
 * @Description:     用户管理--员工管理io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.02
 * ==NOTES:=============================================
 * v1.0.0(2015.11.02):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/user-management/employee-management', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.UserManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.UserManagement');
    S.mix(PW.io.UserManagement, {
        /**
         * 删除员工
         * @param data
         * @param callback
         */
        delEmployee: function(data, callback){
             var
                 employeeIO = urls.delEmployee;
             employeeIO.io(data, function(rs){
                 callback(
                     rs.code == 0,
                     rs.errMsg
                 );
             });
        },
        /**
         * 发送当前用户名id，获取其服务员管辖餐台, 为气泡所用
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        sendEmployeeId: function(data, callback){
            var
                employeeIO = urls.sendEmployeeId;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 搜索相应角色的员工,获取当前角色下的员工列表
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        searchEmployee: function(data, callback){
            var
                employeeIO = urls.searchEmployee;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 转换员工的状态
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        convertEmployeeStatus: function(data, callback){
            var
                employeeIO = urls.convertEmployeeStatus;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送员工号码，检验是否重复
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendEmployeePhone: function(data, callback){
            var
                employeeIO = urls.sendEmployeePhone;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送员工用户名，检验是否重复
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendEmployeeUserName: function(data, callback){
            var
                employeeIO = urls.sendEmployeeUserName;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送员工编号,验证是否重复
         * @param data
         * @param callback
         */
        sendEmployeeNo: function(data, callback){
            var
                employeeIO = urls.sendEmployeeNo;
            employeeIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        }
    });

},{
    requires: [
        'mod/ext',
        'mod/connector'
    ]
});