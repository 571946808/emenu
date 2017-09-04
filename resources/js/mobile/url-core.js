/*-----------------------------------------------------------------------------
 * @Description:    客户手机端--配置url地址 (url-core.js)
 * @Version: 	    V2.0.0
 * @author: 		cuiy(361151713@qq.com)
 * @date			2016.01.07
 * ==NOTES:=============================================
 * v1.0.0(2016.01.07)
 * ---------------------------------------------------------------------------*/
(function(){
    var
        site ={
            website:'/', //站点地址
            staticWebsite: '/', // 前端服务器地址
            puiWebsite: '/resources/tool/pui2/'
        };


    _pw_apiData = {
        // 菜品分类图片版
        Classify: [
            ['getDishList', site.staticWebsite + 'mock/mobile/classfy-img-list.json', 'get', '获取菜品'],
            ['addDish', site.staticWebsite + 'mock/mobile/add-dish.json', 'get', '添加菜品'],
            ['sendActiveDishId', site.staticWebsite + 'mock/mobile/add-dish.json', 'get', '点赞']
        ],
        // 搜索
        Search: [
            ['search', site.staticWebsite + 'mock/mobile/search-list.json', 'get', '搜索获取菜品列表']
        ],
        //菜品分类文字版
        ClassifyText: [
            ['addDish', site.staticWebsite + 'mock/mobile/add-dish.json', 'get', '添加菜品'],
            ['getDishList', site.staticWebsite + 'mock/mobile/dish-list.json', 'get', '获取菜品']
        ],
        //订单
        Order: [
            ['getOrderList', site.staticWebsite + 'mock/mobile/order-list.json', 'get', '获取订单列表'],
            ['deleteOrderingDish', site.staticWebsite + 'mock/mobile/delete-order-dish.json', '删除订单中菜品id'],
            ['sendConfirmOrderInfo', site.staticWebsite + 'mock/mobile/two-return-value.json', 'get', '发送确认订单信息'],
            ['sendDishNumChangeInfo', site.staticWebsite + 'mock/mobile/two-return-value.json', 'get', '发送菜品数量改变状态和菜品id'],
            ['sendOrderStatus', site.staticWebsite + 'mock/mobile/return-price.json', 'get', '发送用户下单状态，后端返回计算当前下单的消费金额'],
            ['sendDeblockingStatus', site.staticWebsite + 'mock/mobile/two-return-value.json', 'get', '发送用户取消下单状态']
            
        ],
        //测试
        Test: [
            ['getOrderList', site.staticWebsite + 'mock/mobile/test1.json', 'get', '获取订单列表']
        ],
        //为您推荐
        Recommend: [
            ['sendDishInfo', site.staticWebsite + 'mock/mobile/send-dish-info.json', 'get', '发送菜品id'],
            ['getRecommendDishList', site.staticWebsite + 'mock/mobile/get-dish-list.json', 'get', '获取推荐的菜品列表']
        ],
        //销量排行
        SalesRank: [
            ['sendDishInfo', site.staticWebsite + 'mock/mobile/send-dish-info.json', 'get', '发送菜品id'],
            ['getSalesRankDishList', site.staticWebsite + 'mock/mobile/get-dish-list.json', 'get', '获取销量排行的菜品列表']
        ],
        //今日特价
        TodaySpecial: [
            ['sendDishInfo', site.staticWebsite + 'mock/mobile/send-dish-info.json', 'get', '发送菜品id'],
            ['getTodaySpecialDishList', site.staticWebsite + 'mock/mobile/get-dish-list.json', 'get', '获取今日特价的菜品列表']
        ],
        //本店特色
        RestSpecials: [
            ['sendDishInfo', site.staticWebsite + 'mock/mobile/send-dish-info.json', 'get', '发送菜品id'],
            ['getRestSpecialsDishList', site.staticWebsite + 'mock/mobile/get-dish-list.json', 'get', '获取本店特色的菜品列表']
        ],
        //历史记录
        HistoryRecord: [
            ['getDishList', site.staticWebsite + 'mock/mobile/history-dish-list.json', 'get','获取历史记录中的菜品列表'],
            ['sendDishId', site.staticWebsite + 'mock/mobile/send-dish-info.json', 'get', '发送菜品id']
        ],
        //公共部分，header,footer
        Common: [
            ['getService', site.staticWebsite + 'mock/mobile/service-list.json', 'get', 'footer获取呼叫服务列表'],
            ['callService', site.staticWebsite + 'mock/mobile/add-dish.json', 'get','footer呼叫服务']
            // ['sendClassifyId', site.staticWebsite + 'mock/mobile/dish-list.json','get', 'header发送分类Id']
        ]
    };
})();