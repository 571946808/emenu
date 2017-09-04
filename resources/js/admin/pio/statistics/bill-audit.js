KISSY.add('pio/statistics/bill-audit', function(S){
	var
		urls,
		conn = PW.mod.Connector(_pw_apiData);

	try{
		urls = conn.Statistics;
	}catch(e){
		S.log('地址有误！');
		return;
	}

	PW.namespace('io.Statistics.BillAuditSum');
	S.mix(PW.io.Statistics.BillAuditSum, {
		conn: urls,
		/**
		 * 点击搜索按钮，发送搜索条件，获取总计列表
		 * @param  {[type]}   data     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		billAuditSum: function(data, callback){
			var
				BillAuditSumIO = urls.billAuditSum;

			BillAuditSumIO.io(data, function(rs){
				callback(
					rs.code == 0,
					rs.data,
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