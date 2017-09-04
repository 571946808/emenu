/*-----------------------------------------------------------------------------
* @Description:     后厨部分交互接口
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-11
* ==NOTES:=============================================
* v1.0.0(2013-12-11):
*    后厨交互接口初始生成
* ---------------------------------------------------------------------------*/
KISSY.add(function(S){
    var
        //定义api数据
        apiData = {
            table:[
                ['getTablesVersion', 'cook/ordermanage/ajax/tables/version', 'get', '获取所有桌的版本号'],
                ['getTableInfoById', 'cook/ordermanage/ajax/&{tableId}', 'get', '根据桌id获取桌的详细信息'],
                ['getPrintInfo', 'cook/ordermanage/ajax/check/printer', 'get', '获取打印机信息，是否可用']
            ],
            dish:[
                ['printDish', 'cook/ordermanage/ajax/print', 'post', '根据id将才打印至厨房'],
                ['scanBarCode', 'cook/ordermanage/ajax/wipe', 'post', '根据条形码上菜']
            ],
            ingredient: [
                ['search', 'cook/ingredient/ajax', 'get', '根据关键字获取原配料'],
                ['movein', 'cook/ingredient/ajax/movein', 'post', '将原配料标记为标缺'],
                ['moveout', 'cook/ingredient/ajax/moveout ', 'post', '将原配料恢复']
            ],
            login: [
                ['login', 'mock/login.json','get', '后厨登录验证']
            ]
        };
    //定义常用失败数据错误码，方便处理
    PW.namespace('conn');
    PW.conn = PW.mod.Connector(apiData);
},{
    requires:[
        'mod/connector'
    ]
})

