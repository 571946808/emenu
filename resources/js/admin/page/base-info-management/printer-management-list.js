/*-----------------------------------------------------------------------------
* @Description:     基本信息管理-打印机管理列表
* @Version:         1.0.0
* @author:          daiqiaoling(1649500603@qq.com)
* @date             2015.11.09
* ==NOTES:=============================================
* v1.0.0(2015.11.09):
     初始生成删除打印机功能
* ---------------------------------------------------------------------------*/
KISSY.add('page/base-info-management/printer-management-list', function(S, List){
	PW.namespace('page.BaseInfoManagement.PrinterManagementList');
	PW.page.BaseInfoManagement.PrinterManagementList = function(param){
		new List(param);
	}
},{
	requires: [
		'printerManagementList/list'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('printerManagementList/list', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, on = S.Event.on, $ = S.all,
        Dialog = PW.widget.Dialog,
        printerManagementIO = PW.io.baseInfoManagement.printerManagement,
		config = {},
		el = {		
			// 删除触发器
			delTrigger: '.J_del',
			//打印机元素
			printerEl: '.printer-classify',
        	//提示元素
        	tipEl: '.J_tip'
		},
		TIP = [
        '确定删除此打印机吗？',
        '删除成功！'
        ];

	function List(param){
		this.opts = S.mix(config, param);
		this._init();
	}

	S.augment(List, {
		_init: function(){
			this._addEventListener();
			this._hideTip();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;
			
			on(el.delTrigger, 'click', function(e){
				that._delPrinter(e.target);
			});			
		},

		/**
		 * 隐藏提示信息
		 * @return {[type]} [description]
		 */
		_hideTip: function(){
			var
				that = this,
				msg = S.one(el.tipEl);
			
			if( msg ){
				setTimeout(function(){
					DOM.remove(el.tipEl);
				}, 2000);
			}
		},
        /**
         * 删除打印机
         * @return {[type]} [description]
         */
        _delPrinter:function(ev){
        	var 
        		that = this,
        		printer = DOM.parent(ev,el.printerEl),
        		id = $(printer).attr('id');
        		info = {
        			id: id
        		};
        	
        	Dialog.confirm(TIP[0], function(){
	            printerManagementIO.delPrinter(info, function(rs, errMsg){
	                if(rs){
	                    Dialog.alert(TIP[1]);
	                    DOM.remove(printer);
	                }else{
	                	Dialog.alert(errMsg);
	                }
	            });
	        });
        }
	});

	return List;
},{
	requires: [
		'widget/dialog',
		'pio/base-info-management/printer-management'
	]
});