/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.3.18
 * ==NOTES:=============================================
 * v1.0.0(2016.3.18):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/classify-text', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.ClassifyText;
    }catch(e){
        S.log('地址信息错误');
        return;
    }


    PW.namespace('io.ClassifyText');

    S.mix(PW.io.ClassifyText, {
        conn: urls,
        /**
         * 获取菜品
         * @param data
         * @param callback
         */
        _addDish: function(data, callback){
            var
                dishIO = urls.addDish;

            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        _getDishList: function(data, callback){
            var 
                dishIO = urls.getDishList;

            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                )
            })
        }
    });
}, {
    requires:[
        'mod/ext',
        'mod/connector'
    ]
})