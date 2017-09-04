/*-----------------------------------------------------------------------------
 * @Description:     本店特色
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.06.02
 * ==NOTES:=============================================
 * v1.0.0(2016.06.02):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('pio/rest-specials', function(S){
 	var
 		urls,
 		conn = PW.mod.Connector(_pw_apiData);

 	try{
 		urls = conn.RestSpecials;
 	}catch(e){
 		S.log('地址信息错误');
 		return;
 	}

 	PW.namespace('io.RestSpecials');
 	S.mix(PW.io.RestSpecials,{
 		conn: urls,
 		/**
 		 * 顾客点“点餐”按钮，发送dishId
 		 * @param {[type]}   data     [description]
 		 * @param {Function} callback [description]
 		 */
 		sendDishInfo: function(data, callback){
 			var
 				RestSpecialsIO = urls.sendDishInfo;

 			RestSpecialsIO.io(data, function(rs){
 				callback(
 					rs.code == 0,
 					rs.errMsg
 				);
 			});
 		},
 		/**
 		 * 获取本店特色的菜品列表
 		 * @param  {[type]}   data     [description]
 		 * @param  {Function} callback [description]
 		 * @return {[type]}            [description]
 		 */
 		getRestSpecialsDishList: function(data, callback){
 			var
 				RestSpecialsIO = urls.getRestSpecialsDishList;

 			RestSpecialsIO.io(data, function(rs){
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