KISSY.add('pio/dish-management/today-specials', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.DishManagement;
	}catch(e){
		S.log('地址信息错误！');
		return;
	}

	PW.namespace('io.DishManagement');
	S.mix(PW.io.DishManagement, {
		conn: urls,
		/**
		 * 点击撤销时，发送菜品id
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		revoteSpecials: function(data, callback){
			var
				TodaySpecialsIO = urls.revoteSpecials;

			TodaySpecialsIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		},
		/**
		 * 选择菜品分类，获取对应分类下的列表
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		selectDishClassify: function(data, callback){
			var
				TodaySpecialsIO = urls.selectDishClassifyOfSpecials;

			TodaySpecialsIO.io(data,function(rs){
				callback(
					rs.code == 0,
					rs.list,
					rs.errMsg
				);
			});
		},
		/**
		 * 点击保存按钮时，发送被选中的菜品的id
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		sendSelectedDish: function(data, callback){
			var
				TodaySpecialsIO = urls.sendSelectedDishOfSpecials;

			TodaySpecialsIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		}
	});
}, {
	requires: [
		'mod/ext',
		'mod/connector'
	]
});