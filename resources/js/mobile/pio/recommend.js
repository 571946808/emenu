/*-----------------------------------------------------------------------------
 * @Description:     为您推荐
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.03.25
 * ==NOTES:=============================================
 * v1.0.0(2016.03.25):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/recommend', function(S){
 	var
 		urls,
 		conn = PW.mod.Connector(_pw_apiData);

 	try{
 		urls = conn.Recommend;
 	}catch(e){
 		S.log('地址信息错误');
 		return;
 	}

 	PW.namespace('io.Recommend');
 	S.mix(PW.io.Recommend,{
 		conn: urls,
 		/**
 		 * 顾客点“点餐”按钮，发送dishId
 		 * @param {[type]}   data     [description]
 		 * @param {Function} callback [description]
 		 */
 		sendDishInfo: function(data, callback){
 			var
 				RecommendIO = urls.sendDishInfo;

 			RecommendIO.io(data, function(rs){
 				callback(
 					rs.code == 0,
 					rs.errMsg
 				);
 			});
 		},
 		/**
 		 * 获取为您推荐菜品列表
 		 * @param  {[type]}   data     [description]
 		 * @param  {Function} callback [description]
 		 * @return {[type]}            [description]
 		 */
 		getRecommendDishList: function(data, callback){
 			var
 				RecommendIO = urls.getRecommendDishList;

 			RecommendIO.io(data, function(rs){
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