/*-----------------------------------------------------------------------------
* @Description:     基本信息管理-搜索风向标
* @Version:         1.0.0
* @author:          daiqiaoling(1649500603@qq.com)
* @date             2015.10.22
* ==NOTES:=============================================
* v1.0.0(2015.10.22):
     初始生成顾客点餐平台和服务员系统的添加、删除菜品功能
* ---------------------------------------------------------------------------*/
KISSY.add('page/base-info-management/search-vane', function(S, Core){
	PW.namespace('page.BaseInfoManagement.SearchVane');
	PW.page.BaseInfoManagement.SearchVane = function(param){
		new Core(param);
	}
},{
	requires: [
		'searchVane/core'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('searchVane/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate, 
		$ = S.all,
        Defender = PW.mod.Defender,
        Dialog = PW.widget.Dialog,
        SearchVaneIO = PW.io.baseInfoManagement.searchVane,
		config = {},
		el = {
			//表单
			operForm: 'form',			
			// 添加触发器
			addTrigger: '.J_add',			
			// 删除触发器
			delTrigger: '.J_del',
			//放菜品标签的容器
			tagsEl: '.J_tags',
			//输入关键字的容器
			inputEl: '.J_input-key'
		},
		DATA_ORDER_ID = 'data-order-id',
		DATA_TYPE = 'data-type',
        TIP = [
        '确定删除此菜品吗？',
        '删除成功！',
        '删除失败！',
        '该关键字已经存在，请重新输入！'
        ];

	function Core(param){
		this.opts = S.mix(config, param);
		this.defender = [];
		this._init();
	}

	S.augment(Core, {
		_init: function(){
			this._defender();
			this._addEventListener();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			on(el.addTrigger,'click',function(e){
				that._valid(e.target);

			});

			on(el.operForm,'submit',function(e){
				if(e.keyCode == 13){
					that._valid(e.target);
				}
				return false;
			});	
			
			delegate(el.tagsEl, 'click', el.delTrigger, function(e){
				that._delOrder(e.target);
			});			
		}, 
		/**
         * 表单验证
         * @return {[type]} [description]
         */  
		_defender: function(){
			var 
				that = this,
				forms = $(el.operForm),
				len = forms.length;
			
			for(var i = 0; i < len; i ++){
				that.defender[i] = Defender.client('.J_addForm'+ i, {});
			}
		},     
		/**
         * 点添加按钮，验证成功后发送ajax
         * @return {[type]} [description]
         */
        _valid: function(ev){
            var
                that = this,
                form = DOM.parent(ev,2),
                type = $(form).attr(DATA_TYPE);

        	that.defender[type].validAll(function(rs){
	            if(rs){
	                that._sendOrderKeyValue(ev,type);
	            }
	        });
        },
        /**
         * 发送新添加菜品关键字的值，并获取该菜品的id
         * @return {[type]} [description]
         */
        _sendOrderKeyValue: function(evt,type){
            var
                that = this,
                input = $(evt).prev().children('input'),
                keyValue = DOM.val(input),
                info = {
                	key: keyValue,
                	type: type
                };

            SearchVaneIO.addOrder(info, function(rs, data, errMsg){
                if(rs){
                    that._addOrder(evt,keyValue,data);
                }else{
                    Dialog.alert(TIP[3]);
                }
            });
        },
        /**
         * 添加新菜品标签
         * @return {[type]} [description]
         */
        _addOrder: function(evt,text,data){
        	var 
        		that = this,
        		form = DOM.parent(evt,2),
        		container = DOM.next(form),
        		input = $(evt).prev().children(),
        		html = '<label data-order-id=' + data.id + ' class="label-info">'
	        		 + '<span>' + text + '</span>'
	        		 + '<i class="fa fa-times J_del"></i>'
	        		 + '</label>';
	        
        	$(container).prepend($(html));
        	input.val('');
        	input.removeClass('success-field');
        },
        /**
         * 删除菜品
         * @return {[type]} [description]
         */
        _delOrder:function(ev){
        	var 
        		that = this,
        		label = $(ev).parent('label'),
        		form = label.parent('div').prev(),
        		id = label.attr(DATA_ORDER_ID),
        		type = form.attr(DATA_TYPE),
        		info = {
        			id: id,
        			type: type
        		};

        	Dialog.confirm(TIP[0], function(){
	            SearchVaneIO.delOrder(info, function(rs, errMsg){
	                if(rs){
	                    Dialog.alert(TIP[1]);
	                    DOM.remove(label);
	                }else{
	                	Dialog.alert(TIP[2]);
	                }
	            });
	        });
        }
	});

	return Core;
},{
	requires: [
		'mod/defender',
		'widget/dialog',
		'pio/base-info-management/search-vane'
	]
});