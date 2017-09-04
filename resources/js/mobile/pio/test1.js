/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.03.24
 * ==NOTES:=============================================
 * v1.0.0(2016.03.24):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/test1', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Test;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.test1');

    S.mix(PW.io.test1, {
        conn: urls,
        /**
         * 获取订单列表
         * @param data
         * @param callback
         */
        getOrderList: function(data, callback){
            var
                orderListIO = urls.getOrderList;

            orderListIO.io(data, function(rs){
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