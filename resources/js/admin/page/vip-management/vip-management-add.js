/*-----------------------------------------------------------------------------
* @Description:     后台管理-用户信息管理-会员管理添加
* @Version:         1.0.0
* @author:          daiql(1649500603@qq.com)
* @date             2015.10.23
* ==NOTES:=============================================
* v1.0.0(2015.10.23):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/vip-management/vip-management-add', function(S, Add){
	PW.namespace('page.VipManagement.VipManagementAdd');
	PW.page.VipManagement.VipManagementAdd = function(param){
		new Add(param);
	}
},{
	requires: [
		'vip-management-add/add'
	]
});
/*---------------------------------------------------------------------------*/
KISSY.add('vip-management-add/add', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        Defender = PW.mod.Defender,
        Dialog = PW.widget.Dialog,
        Calendar = PW.mod.Calendar,
        VipManagementIO = PW.io.VipManagement,        
        el = {     
        	//表单
        	operForm: '.J_addForm',
        	//手机号字段
        	phoneEl: '.J_phone',
        	//保存按钮
        	submitBtn :'.J_submitBtn',
        	//会员id元素
        	vipIdEl: '.J_vipId',
        	//提示元素
        	tipEl: '.J_tip'
        };

	function Add(param){
		this.opts = S.merge(config, param);
        this.btn = DOM.data(el.submitBtn,'btn');
		this.defender;
		this._init();
	}

	S.augment(Add, {
		_init: function(){
			this._defender();
			this._addEventListener();
			this._hideTip();
		},
		/**
		 * 添加事件监听
		 */
		_addEventListener: function(){
			var
				that = this;

			S.each(query('.date'),function(i){
				Calendar.client({
					renderTo: i, //默认只获取第一个
	                select: {
	                    rangeSelect: false, //是否允许区间选择
	                    dateFmt: 'YYYY-MM-DD',
	                    showTime: false //是否显示时间
	                }
				});
			});

			that.btn.on("loading",function(){
				that._valid();
                return false;
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
		 * 表单验证
		 */
		_defender: function(){
			var
				that = this;
			   
			that.defender = Defender.client(el.operForm, {
                theme:'inline',
				items: [
					//验证员工手机号码
                   	{
                        queryName: el.phoneEl,
                        pattern: function(input,shell,form){
                        	var
                        		phoneInp = DOM.val(el.phoneEl),
                        		tipEl = DOM.next(el.phoneEl, '.pw-tip'),
                        		vipId = DOM.val(el.vipIdEl);
                        	
                           	if(this.test('isMobile', phoneInp)){
                           		VipManagementIO.hasVip({
                           			id: vipId,
                           			phone: phoneInp
                           		}, function(rs, errMsg){
                           			if(rs){
                                        shell.updateState('success');
                           			}else{
                           				shell.updateState('error');
                           				DOM.text(tipEl, '该电话已经存在，请重新输入');
                           			}
                           		});
                            }else{
                                return false;
                            }
                            return 'loading';
                        },
                        showEvent:'focus',
                        vldEvent:'blur',
                        tip:'请输入员工电话|电话输入有误，请重新输入',
                        async: true
                    }
				]
			});
		},
		/**
		 * 表单验证成功后，提交表单
		 */
		_valid: function(){
			var 
				that = this,
                form = get(el.operForm);

			that.defender.validAll(function(rs){
				if(rs){
					setTimeout(function(){
                        form.submit();
                    }, 1000); 
				}else{
					that.btn.reset();
					return false;
				}
			});
		}
	});
	return Add;
},{
	requires: [
		'mod/defender',
		'widget/dialog',
		'pio/vip-management/vip-management',
        'widget/btn',
		'mod/calendar'
	]
});