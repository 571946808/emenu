KISSY.add('pio/base-info-management/index-management', function(S){

    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.BaseInfoManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.BaseInfoManagement.IndexManagement');

    S.mix(PW.io.BaseInfoManagement.IndexManagement, {
        conn: urls,
        /**
         * 删除图片
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {Boolean}           [description]
         */
        delImg: function(data, callback){
            var
                indexImgIO = urls.delImg;
            indexImgIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 设置图片为首页
         * @param data
         * @param callback
         */
        setImg: function(data, callback){
            var
                indexImgIO = urls.setImg;
            indexImgIO.io(data, function(rs){
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
});