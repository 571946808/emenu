/*-----------------------------------------------------------------------------
 * @Description:     搜索
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.25
 * ==NOTES:=============================================
 * v1.0.0(2016.01.25):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('pio/search', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Search;
    }catch (e){
        S.log('地址错误!');
        return;
    }

    PW.namespace('io.Search');
    S.mix(PW.io.Search, {
        conn: urls,
        /**
         * 搜索获取菜品列表
         * @param data
         * @param callback
         */
        search: function(data, callback){
            var
                searchIO = urls.search;

            searchIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.data,
                    rs.errMsg
                );
            });
        }
    });
},{
    requires: [
        'mod/connector'
    ]
});