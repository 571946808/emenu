KISSY.add('pio/store-management/ingredients-management', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.StoreManagement;
	}catch(e){
		S.log('地址有误');
		return;
	}

	PW.namespace('io.StoreManagement.IngredientsManagement');
	S.mix(PW.io.StoreManagement.IngredientsManagement, {
		conn: urls,
		/**
		 * 点击删除时，发送当前原配料id，判断是否可删除
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		delIngredient: function(data, callback){
			var
				IngredientsManagementIO = urls.delIngredient;

			IngredientsManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		},
		/**
		 * 发送名称，判断该名称是否重复
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		hasName: function(data, callback){
			var
				IngredientsManagementIO = urls.hasName;

			IngredientsManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		},
		/**
		 * 提交添加的原配料
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		submitIngredient: function(data, callback){
			var
				IngredientsManagementIO = urls.submitIngredient;

			IngredientsManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				)
			})
		},
		/**
		 * 提交编辑页的原配料
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		submitEditIngredient: function(data, callback){
			var
				IngredientsManagementIO = urls.submitEditIngredient;

			IngredientsManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				)
			})
		},
		/**
		 * 发送原配料id、库存单位和转化关系，获取库存预警、均价、结存、总数量
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		getRelatedSettings: function(data, callback){
			var
				IngredientsManagementIO = urls.getRelatedSettings;

			IngredientsManagementIO.io(data, function(rs, data, errMsg){
				callback(
					rs.code == 0,
					rs.data,
					rs.errMsg
				);
			})
		}
	})
}, {
	requires: [
		'mod/connector'
	]
});