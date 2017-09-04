KISSY.add('pio/store-management/settlement-management', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.StoreManagement;
	}catch(e){
		S.log('地址有误！');
		return;
	}

	PW.namespace('io.StoreManagement.SettlementManagement');
	S.mix(PW.io.StoreManagement.SettlementManagement, {
		conn: urls,
		/**
		 * 点击搜索按钮，发送搜索条件，获取结算列表
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		getSettlementList: function(data, callback){
			var
				SettlementManagementIO = urls.getSettlementList;

			SettlementManagementIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.list,
					rs.errMsg
				);
			});
		}
	});
},{
	requires:[
		'mod/connector'
	]
});