KISSY.add('pio/authority-management/authority-management', function(S){

    var urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.AuthorityManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.AuthorityManagement');
    
    S.mix(PW.io.AuthorityManagement, {
        conn: urls,
        /**
         * 发送用户id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        sendAuthorityId: function(data, callback){
            var
                AuthorityManagementIO = urls.sendAuthorityId;

            AuthorityManagementIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },        
       /** base-config.js
         * 删除权限时，发送权限id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delAuthority: function(data,callback){
            var 
                baseConfigIO = urls.delAuthority;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** base-config.js
         * 保存编辑后的权限时，发送权限id,表达式exp，描述desc
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveAuthority: function(data, callback){
            var 
                baseConfigIO = urls.saveAuthority;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** base-config.js
         * 添加-保存权限时，表达式exp，描述desc
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveNewAuthority: function(data, callback){
            var 
                baseConfigIO = urls.saveNewAuthority;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** authority-group-list.js
         * 删除权限时，发送权限组id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        deleteAuthorityGroup: function(data, callback){
            var 
                baseConfigIO = urls.deleteAuthorityGroup;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** authority-group-list.js
         * 保存编辑后的权限时，发送权限组id,表达式exp，描述desc
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveAuthorityGroup: function(data, callback){
            var 
                baseConfigIO = urls.saveAuthorityGroup;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /** authority-group-list.js
         * 添加-保存权限组时，表达式exp，描述desc
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        saveNewAuthorityGroup: function(data, callback){
            var 
                baseConfigIO = urls.saveNewAuthorityGroup;
            baseConfigIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**authority-group-config.js
         * 权限组配置页面，删除权限时，发送权限ID
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        delAuthorityOfGroup: function(data, callback){
            var 
                baseConfigIO = urls.delAuthorityOfGroup;
            baseConfigIO.io(data, function(rs){
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