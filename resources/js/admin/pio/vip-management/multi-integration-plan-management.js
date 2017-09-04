KISSY.add('pio/vip-management/multi-integration-plan-management', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.VipManagement;
	}catch(e){
		S.log('地址信息错误！');
		return;
	}

	PW.namespace('io.VipManagement');
	S.mix(PW.io.VipManagement, {
		conn: urls,
		/**
		 * 点击删除时，并当前多倍积分方案的id
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		delExsitedPlan: function(data, callback){
			var
				VipManagementIO = urls.delExsitedPlan;

			VipManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		},
		/**
		 * 点击停用、启用时，发送当前方案的id和status
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		sendModifiedPlan: function(data, callback){
			var
				VipManagementIO = urls.sendModifiedPlan;

			VipManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		},
		/**
		 * 点击保存时，发送新添加的方案，并返回该方案的id
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		sendAddedPlan: function(data, callback){
			var
				VipManagementIO = urls.sendAddedPlan;

			VipManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.data,
					rs.errMsg
				);
			});
		},
		/**
		 * 点击保存时，发送修改过的方案
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		sendEditedPlan: function(data, callback){
			var
				VipManagementIO = urls.sendEditedPlan;

			VipManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.errMsg
				);
			});
		}
	});
}, {
	requires: [
		'mod/connector'
	]
});