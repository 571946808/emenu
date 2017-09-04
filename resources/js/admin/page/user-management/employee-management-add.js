/*-----------------------------------------------------------------------------
* @Description:     员工管理-添加员工
* @Version:         1.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.10.23
* ==NOTES:=============================================
* v1.0.0(2015.10.23):
     初始生成
* ---------------------------------------------------------------------------*/

KISSY.add('page/user-management/employee-management-add', function(S, Add){
	PW.namespace('page.UserManagement.EmployeeManagement.Add');
	PW.page.UserManagement.EmployeeManagement.Add = function(param){
		new Add(param);
	};
},{
	requires: [
		'employee-management-add/core'
	]
});
KISSY.add('employee-management-add/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach, undelegate = S.Event.undelegate,
		Dialog = PW.widget.Dialog,
		Defender = PW.mod.Defender,
		Juicer = PW.mod.Juicer.client,
		UserManagementIO = PW.io.UserManagement,
		config = {
			
		},
		el = {
			// 添加表单
			operForm: '.J_operForm',
			// 保存按钮
			submitBtn: '.J_submitBtn',
			// 员工电话
			phoneInp: '.J_phone',
			// 员工用户名
			usernameInp: '.J_username',
			// 员工编号
			employeeNoInp: '.J_employeeNo',
			// 服务员复选框
			waiterTrigger: '.J_waiter',
			// 餐桌
			waiterTableEl: '.J_waiterTable',
			// 员工id
			idEl: '.J_id',
			// partyId
			partyIdEl: '.J_partyId',
			// 提示信息容器
			tipContainer: '.J_tip',
			//确认密码元素
			confirmPwdEl: '.J_confirmPwd',
			//密码元素
			passwardEl: '.J_passward',
            //角色Inp
            roleEl: '.J_role',
            //角色的自定义错误提示信息
            errorTipEl: '.J_errorTip'
		},
		DATA_OPER_TYPE = 'data-oper-type';

	function Add(param){
		this.opts = S.merge(config, param);
		this.submitBtn = DOM.data(el.submitBtn, 'btn');
		this.isPass = true;
		this.defender;
		this._init();
	}

	S.augment(Add, {
		_init: function(){
			this._hideTip();
			this._validForm();
			this._initTable();
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				operMark = DOM.attr(el.partyIdEl, DATA_OPER_TYPE);

			on(el.waiterTrigger, 'click', function(){
				that._unfoldTable();
			});

			that.submitBtn.on('loading', function(){
				that._submitForm();
				return false;
			});

            on(el.roleEl, 'click', function(){
                $(el.errorTipEl).addClass('hidden');
            });

			//若为编辑页
			if(operMark == 0){
				on(el.passwardEl, 'blur', function(){
					that._isEditPage();
				});
				on(el.confirmPwdEl, 'blur', function(){
					that._isEditPage();
				});
			}
		},
		/**
		 * 若为编辑页，判断密码和确认密码域的值是否一致
		 * @return {Boolean} [description]
		 */
		_isEditPage: function(){
			var
				that = this,
				password = DOM.val(el.passwardEl),
				confirmPwd = DOM.val(el.confirmPwdEl),
				errorTip = DOM.next(el.confirmPwdEl);

			if(confirmPwd == password){
				DOM.addClass(el.confirmPwdEl, 'success-field');
				DOM.removeClass(el.confirmPwdEl, 'error-field');
				DOM.removeClass(errorTip, 'pw-tip');
				DOM.removeClass(errorTip, 'error-state');
				DOM.text(errorTip, '');
				that.isPass = true;
			}else{
				DOM.addClass(el.confirmPwdEl, 'error-field');
				DOM.addClass(errorTip, 'pw-tip');
				DOM.addClass(errorTip, 'error-state');
				DOM.text(errorTip, '两次密码不同，请重新输入');
				that.isPass = false;
			}
		},
		/**
		 * 将提示信息隐藏
		 * @private
         */
		_hideTip: function(){
			var
				that = this,
				tipEl = S.one(el.tipContainer);

			if(tipEl){
				setTimeout(function(){
					DOM.remove(el.tipContainer);
				}, 2000);
			}
		},
		/**
		 * 提交表单
		 * @private
		 */
		_submitForm: function(){
			var
				that = this,
				form = get(el.operForm),
				isPass = that.isPass,
                hasCheck = that._validCheckbox();
			that.defender.validAll(function(rs){
				if(rs && isPass && hasCheck){
					setTimeout(function(){
						form.submit();
					}, 1500);
				}else{
					that.submitBtn.reset();
				}
			});
		},
		/**
		 * 初始化服务员管理餐桌
		 * @private
		 */
		_initTable: function(){
			var
				that = this;
			that._unfoldTable();
		},
		/**
		 * 如果角色包括服务员,则展开餐桌区域选择
		 * @private
		 */
		_unfoldTable: function(){
			var
				that = this,
				inputEl = get(el.waiterTrigger);
			if(inputEl.checked){
				DOM.removeClass(el.waiterTableEl, 'hidden');
			}else{
				DOM.addClass(el.waiterTableEl, 'hidden');
			}
		},
		/**
		 * 验证表单
		 * @private
		 */
		_validForm: function(){
			var
				that = this,
				partyId,
				id = DOM.val(el.idEl);

			if(parseInt(DOM.attr(el.partyIdEl, 'data-oper-type')) == 1){
				partyId = 0;
			}else{
				partyId = DOM.val(el.partyIdEl);
			}

			that.defender = Defender.client(el.operForm, {
                theme:'inline',
				items: [
					//验证员工手机号码是否重复
                   	{
                        queryName: el.phoneInp,
                        pattern: function(input,shell,form){
                        	var
                        		phoneInp = DOM.val(el.phoneInp),
                        		tipEl = DOM.next(el.phoneInp, '.pw-tip');

                           	if(this.test('isMobile', phoneInp)){
                           		UserManagementIO.sendEmployeePhone({
									partyId: partyId,
									phone: phoneInp
                           		}, function(rs, errMsg){
                           			if(rs){
                                        shell.updateState('success');
                           	 		}else{
                           				shell.updateState('error');
                           				DOM.text(tipEl, errMsg);
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
                    },
                    //验证员工用户名是否重复
                   	{
                        queryName: el.usernameInp,
                        pattern: function(input,shell,form){
                        	var
                        		usernameInp = DOM.val(el.usernameInp),
                        		tipEl = DOM.next(el.usernameInp, '.pw-tip');
                        	 
                           	if(usernameInp != '' || usernameInp.length != 0){
                           		UserManagementIO.sendEmployeeUserName({
									partyId: partyId,
									loginName: usernameInp
                           		}, function(rs, errMsg){
                           			if(rs){
                                        shell.updateState('success');
                           			}else{
                           				shell.updateState('error');
                           				DOM.text(tipEl, errMsg);
                           			}
                           		});
                            }else{
                                return false;
                            }
                            return 'loading';
                        },
                        showEvent:'focus',
                        vldEvent:'blur',
                        tip:'请输入员工用户名|用户名不能为空，请重新输入',
                        async: true
                    },
					// 验证员工编号是否重复
					{
						queryName: el.employeeNoInp,
						pattern: function(input,shell,form){
							var
								employeeNoInp = DOM.val(el.employeeNoInp),
								tipEl = DOM.next(el.employeeNoInp, '.pw-tip');

							if(employeeNoInp != '' || employeeNoInp.length != 0){
								UserManagementIO.sendEmployeeNo({
									partyId: partyId,
									employeeNumber: employeeNoInp
								}, function(rs, errMsg){
									if(rs){
										shell.updateState('success');
									}else{
										shell.updateState('error');
										DOM.text(tipEl, errMsg);
									}
								});
							}else{
								return false;
							}
							return 'loading';
						},
						showEvent:'focus',
						vldEvent:'blur',
						tip:'请输入员工编号|员工编号不能为空，请重新输入',
						async: true
					}
				]
			});
		},
        /**
         * 验证员工角色checkbox是否选择
         * @return {[type]} [description]
         */
        _validCheckbox: function(){
            var
                checkboxs = S.query(el.roleEl),
                hasCheck;
            for(var i = 0; i<checkboxs.length; i++){
                hasCheck = DOM.prop(checkboxs[i], 'checked');
                if(hasCheck){
                    $(el.errorTipEl).addClass('hidden');
                    return true;
                } 
            }
            $(el.errorTipEl).removeClass('hidden');
            return false;
        }
	});

	return Add;
},{
	requires: [
		'mod/juicer',
		'widget/dialog',
		'mod/defender',
		'widget/btn',
		'pio/user-management/employee-management'
	]
});