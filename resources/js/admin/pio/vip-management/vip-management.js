KISSY.add('pio/vip-management/vip-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.VipManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.VipManagement');
    
    S.mix(PW.io.VipManagement, {
        conn: urls,
        /**
         * 发送会员手机号
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        hasVip: function(data, callback){
            var
                VipManagementIO = urls.hasVip;

            VipManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 点击启用或停用时，发送会员id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        sendVipId: function(data, callback){
            var
                VipManagementIO = urls.sendVipId;

            VipManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 点击删除时，发送当前会员id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delVip: function(data, callback){
            var
                VipManagementIO = urls.delVip;

            VipManagementIO.io(data, function(rs){
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