KISSY.add('pio/module/mul-select', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);
    S.log(conn)
    try{
        urls = conn.Module;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.Module.MulSelect');
    S.mix(PW.io.Module.MulSelect, {
        conn: urls,
        /**
         * 搜索相关项
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        mulSelectSearch: function(data, callback){
            var
                muSelectSearchIO = urls.mulSelectSearch;
            muSelectSearchIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
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