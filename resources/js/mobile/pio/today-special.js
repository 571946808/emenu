/*-----------------------------------------------------------------------------
 * @Description:     今日特价
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.06.02
 * ==NOTES:=============================================
 * v1.0.0(2016.06.02):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/today-special', function(S){
 	var
 		urls,
 		conn = PW.mod.Connector(_pw_apiData);

 	try{
 		urls = conn.TodaySpecial;
 	}catch(e){
 		S.log('地址信息错误');
 		return;
 	}

 	PW.namespace('io.TodaySpecial');
 	S.mix(PW.io.TodaySpecial,{
 		conn: urls,
 		/**
 		 * 顾客点“点餐”按钮，发送dishId
 		 * @param {[type]}   data     [description]
 		 * @param {Function} callback [description]
 		 */
 		sendDishInfo: function(data, callback){
 			var
 				TodaySpecialIO = urls.sendDishInfo;

 			TodaySpecialIO.io(data, function(rs){
 				callback(
 					rs.code == 0,
 					rs.errMsg
 				);
 			});
 		},
 		/**
 		 * 获取今日特价的菜品列表
 		 * @param  {[type]}   data     [description]
 		 * @param  {Function} callback [description]
 		 * @return {[type]}            [description]
 		 */
 		getTodaySpecialDishList: function(data, callback){
 			var
 				TodaySpecialIO = urls.getTodaySpecialDishList;

 			TodaySpecialIO.io(data, function(rs){
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