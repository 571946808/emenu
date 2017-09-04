/*-----------------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.19
 * ==NOTES:=============================================
 * v1.0.0(2016.01.19):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('pio/classify-img', function(S){
    var
        urls,
        conn = PW.mod.Connector(_pw_apiData);

    try{
        urls = conn.Classify;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.Classify');

    S.mix(PW.io.Classify, {
        conn: urls,
        /**
         * 获取菜品
         * @param data
         * @param callback
         */
        getDishList: function(data, callback){
            var
                dishIO = urls.getDishList;

            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.list,
                    rs.errMsg
                );
            });
        },
        /**
         * 添加菜品
         * @param data
         * @param callback
         */
        addDish: function(data, callback){
            var
                dishIO = urls.addDish;

            dishIO.io(data, function(rs){
                callback(
                    rs.code == 0,
                    rs.errMsg
                );
            });
        },
        /**
         * 发送点赞的菜品id
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        sendActiveDishId: function(data, callback){
            var
                sendActiveDishIdIO = urls.sendActiveDishId;

            sendActiveDishIdIO.io(data, function(rs){
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