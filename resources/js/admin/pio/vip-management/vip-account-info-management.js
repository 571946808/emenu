KISSY.add('pio/vip-management/vip-account-info-management', function(S){
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
		 * 点击停用/启用时，发送当前会员账户的id和status
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		changeAccountStatus: function(data, callback){
			var
				VipManagementIO = urls.changeAccountStatus;

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