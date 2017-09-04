/*-----------------------------------------------------------------------------
 * @Description:     搜索下拉组件io
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.12.02
 * ==NOTES:=============================================
 * v1.0.0(2015.12.02):
 * 目前有已下几种方式：搜索下拉、多选tag、ajax搜索下拉
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/module/search-select', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Module;
    }catch(e){
        S.log('地址有误!');
        return;
    }

    PW.namespace('io.Module.SearchSelect');
    S.mix(PW.io.Module.SearchSelect, {
        conn: urls,
        getName: function(data, callback, extramParam){
            var selectIO;

            if(extramParam){
                selectIO = urls[extramParam];
            }

            selectIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
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