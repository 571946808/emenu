KISSY.add('pio/store-management/depot-management', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.StoreManagement;
	}catch(e){
		S.log('地址有误！');
		return;
	}

	PW.namespace('io.StoreManagement.DepotManagement');
	S.mix(PW.io.StoreManagement.DepotManagement, {
		conn: urls,
		/**
		 * 删除存放点时，发送存放点id
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		delDepot: function(data, callback){
			var 
				DepotManagementIO = urls.delDepot;

			DepotManagementIO.io(data, function(rs){
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