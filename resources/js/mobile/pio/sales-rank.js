/*-----------------------------------------------------------------------------
 * @Description:     销量排行
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.06.02
 * ==NOTES:=============================================
 * v1.0.0(2016.06.02):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/sales-rank', function(S){
 	var
 		urls,
 		conn = PW.mod.Connector(_pw_apiData);

 	try{
 		urls = conn.SalesRank;
 	}catch(e){
 		S.log('地址信息错误');
 		return;
 	}

 	PW.namespace('io.SalesRank');
 	S.mix(PW.io.SalesRank,{
 		conn: urls,
 		/**
 		 * 顾客点“点餐”按钮，发送dishId
 		 * @param {[type]}   data     [description]
 		 * @param {Function} callback [description]
 		 */
 		sendDishInfo: function(data, callback){
 			var
 				SalesRankIO = urls.sendDishInfo;

 			SalesRankIO.io(data, function(rs){
 				callback(
 					rs.code == 0,
 					rs.errMsg
 				);
 			});
 		},
 		/**
 		 * 获取销量排行菜品列表
 		 * @param  {[type]}   data     [description]
 		 * @param  {Function} callback [description]
 		 * @return {[type]}            [description]
 		 */
 		getSalesRankDishList: function(data, callback){
 			var
 				SalesRankIO = urls.getSalesRankDishList;

 			SalesRankIO.io(data, function(rs){
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
 		'mod/ext',
 		'mod/connector'
 	]
 })