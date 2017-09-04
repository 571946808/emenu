KISSY.add('pio/authority-management/authority-group-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.authorityManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.authorityManagement');
    
    S.mix(PW.io.authorityManagement, {
        conn: urls,
        /**删除权限组时，发送权限组id和用户id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delAuthorityGroup: function(data, callback){
            var
                AuthorityGroupManagementIO = urls.delAuthorityGroup;

            AuthorityGroupManagementIO.io(data, function(rs){
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