/*-----------------------------------------------------------------------------
* @Description: 表单验证 (defender.js)
* @Version: 	V3.0.0
* @author: 		Nina(1284663246@qq.com)
* @date			2014.12.30
* ==STRUCTURE:=============================================
* mod/defender
* defender/core
* validation/shell
* validation/pattern
* validation/id-card
* validation/tip/core
* validation/tip/inline-tip
* validation/tip/float-tip
* validation/tip/?
* validation/tip/base
* ==NOTES:=============================================
* v3.0.0(2014.12.30):
* 	根据原验证配置，升级到kissy1.4版本：
* 	TODO: 对验证组件进行重构,修复存在的隐藏的bug,以及某些函数调用报错。
* 以下为原组件的各版本详情： 
* 
* 	包括一下几个大的模块：
* 		core-合成部分;
* 		shell-验证的外壳程序，主要负责调取各个部分以完成工作;
* 		valid-核心验证部分，此处是验证的核心，主要负责对用户传入的验证字符串进行解析;
* 		rule-主要是配置规则包的管理;
* 		tip-提示功能 -如果tip中不包含|或&，则调用默认提示，否则要用户自己输入提示，否则调用默认提示;
* v2.1.1(2013.2.27):
* 	对整个表单验证的内容进行了重构，将验证事件写在了Shell里面;
* 	添加了require;
* 	添加了验证事件;
* 	添加了自定义验证处理函数;
* 	添加isNull验证，不允许输入，或输入空格;
* v2.1.2
* 	对scale和length添加第三个参数,判断是否包含等号，如length(24,30,1),即
* 	判断长度在24到30（可以等于24和30）的树，如果第三个参数不存在或者不为一则不等,
* 	同理对scale有效
* v2.1.3
* 	对isNull正则更改为长度0
* v2.1.4:
* 	对loading做了一个修改，只有等到所有异步请求完毕的时候，再点击提交方可成功
* 	对reset功能进行了修改，方便执行rest操作，在reset操作执行时，会自动调取再验证函数
* 	添加onStateChange函数支持
* 	对pattern的回调参数进行了更改，删除了tip，添加了shell，注意后期规避此问题
* 	虽然有点儿残留，但是showEvent已经默认为focus或click，这点不允许用户控制，如果配置了也基本无效了,
*  	后期会将showEvent移除
*  	添加删除功能，移除表单的所有验证内容
*  	添加重载功能
*  	bugfix: require在重载之后出错
* v2.1.5:
* 	对focus是提示中的isNull进行了配置，如果input为空且当前focus，那么现实focus提示，否则错误提示
* 	添加showTip属性于自定义js属性中
* v2.1.6(2013.04.23):
* 	将原来的tip模块设置为float-tip(悬浮提示)
* 	将float-tip模块和idCard模块从核心模块中分离，只有当需要时才引入
* 	bug-fix：当input存在padding时会出错(由于计算的是内部宽度)
* 	添加在表单内预置错误提示容器的模块，名为inside-tip.js
* 	对于isNull的校验，如果内容为空则根据焦点智能显示提示信息和错误信息
* 	getValidResult获取表单验证结果，如果传入'bool'作为参数则返回boolean值
* 	添加removeTip函数，用于清除所有验证提示
* 	bug-fix:异步加载问题
* v2.1.7(2013.04.26):
* 	添加validItem方法，支持根据验证选择器验证单个选项
* v2.1.8(2013.05.02):
* 	将用户名验证由5-20位改成6-20位
* v2.1.9(2013.05.06):
* 	添加valid.test()方法，用于快速验证
* 	添加valid.getItemResult()方法，用于快速获取单个域的验证结果
* 	修改tip的加载，如果在大的配置中没有配置显示tip，那么在items中设置showTip: true,仍然不显示
* v2.1.10(2013.05.10)：
* 	bug fix
* v2.1.11(2013.05.24):
* 	修复scale验证数值不能为小数的bug
* 	修复isFloat验证可以输入两个点的问题
* 	大改动：将js完全写入mod中，即便是后期通过ksp合并，也需要这么做
* 	新增：将inlinetip类型添加
* v2.1.12(2013.06.08):
* 	在配置属性中增加filter
* 	对非异步表单验证项添加blur事件验证
* v2.1.13(2013.07.11):
* 	
* 	1.如果已经在一个form上添加了验证，那么下一次将不允许添加
* 	2.验证事件考虑通过valuechange实现，特例：select通过change实现，不变
* 	3.添加not验证，以前所有带有is开头的验证都可以换成not，比如isNull表命一个表单域可以为空，那么notNull则表示不可为空
* 	  isNumber代表为数字，那么notNumber代表不能是纯数字，
* 	  至于包含验证，放在后期做，比如不能一个字符串不能含有数字，可以通过pattern函数或者正则添加验证
* 	4.添加serialize方法，想要获得表单的序列化数据，只需要通过defender.serialize()就可以
* 	5.为getValidResult()方法添加异步回调，并且添加wait等待配置项，控制配置时长
* 	6.如果一个域添加了验证，后期验证的时候又得排除它，只需要将其设为hidden或disabled
* 	undone
* 	在api保证不变的情况下修改tip代码格式
* v2.1.14(2013-09-24):
* 	1.添加正则
* 	2.修改getValidRule(),将第一个参数（制定函数直接返回格式）删除
* v2.1.15(2013-10-14):
* 	如果选择器无法选择到任何表单，则给出log提示
* v.2.1.16(2013-11-12):
* 	todo:
* 		1.shell的removeValid重写，里面的detach删除了所有的事件，不对
* v2.1.17(2013/12/30 20:43:26):
* 	对表单重置bug进行修复：
* 		如果input含有value属性，则在reset的时候，将val设置为value值
* 		如果不含有value属性，则将val设置为''
* v2.1.18(2014/01/11 11:10:07):
* 	将css根据modsettings ，智能加载
* v2.1.19(2014/01/12 16:43:31):
* 	更新配置，对于所有的验证状态，都在相应的filed上有添加了对应的class
* 		分别为 loading-field, error-field, success-field, focus-field
* v2.1.20(2014.5.23):
* 	对form reset之后进行refresh操作
* v2.1.21(2014.6.10):
* 	在validAll上，直接添加获取结果回调函数
* v2.1.22(2014.10.10):
* 	1.实现blur事件后触发验证操作;
* 	2.form reset操作后，去除所有验证样式;
* v2.1.22(2015.1.26):
* 	修复表单reset之后，重复绑定valuechange事件： by wangjing
* 	1、添加移除绑定事件函数： detachEvt
* 	2、refresh时移除事件valuechange (PS: removeValid()中)
* v2.1.23(2015.1.28):
* 	(1)新增updateErrTip(selector, tip)，可以动态更新更新错误信息：by wangjing(PS:现只在inline模块中添加该方法)
* 		1、tip为数字时，为提示信息配置项数组的索引号;
*   	2、如果为字符串时，直接作为提示错误信息
*   配置items时，则可以直接调用shell.updateErrTip()更新错误提示信息
*   (2)增添验证条件：验证整数isInteger (PS: 限制大小，小于2147483647)
* v2.1.24(2015.9.14)by:cuiy
* 修复不能通过属性选择器选择节点的情况
* v2.1.25(2016.7.29)by:jiangx
* 增加正整数的验证
* ---------------------------------------------------------------------------*/

KISSY.add('mod/defender',function(S,Validation){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		DEFENDER_ATTR = 'data-valid-form',
		DEFENDER_KEY = 'form',
		DEFENDER_FORM = query('form[' + DEFENDER_ATTR + ']'),
		Defender = {
			version: '3.0',
			client: function(container,param){
				var
					DefenderObj = DOM.data(container, DEFENDER_KEY)
				if(DefenderObj){
					DefenderObj.destroy();
					DOM.removeData(container, DEFENDER_KEY);
				} 
				return new Validation(container, param);
			},
			refresh: function(param){
				var
					that = this;
				S.each(DEFENDER_FORM, function(f){
					DOM.data(f, DEFENDER_KEY, that.client(f, param));
				});
			}
		};
	S.ready(function(){
		Defender.refresh();
	});
	PW.namespace('mod.Defender');
	PW.mod.Defender = Defender;
	return Defender;
},{
	requires:['defender/core']
});


/**
 * 验证核心类,主要功能是提供对外的验证api方法
 * author: Simon
 */
KISSY.add('defender/core',function(S,Pattern,Shell,Tip,FormErrorTip,FloatTip, InsideTip, InlineTip){
	var
		DOM = S.DOM ,get = DOM.get, query = DOM.query, Event = S.Event, on = Event.on, detach = Event.detach,
		delegate = Event.delegate, IO = S.IO, JSON = S.JSON, $ = S.all, $j = jQuery,
		EMPTY_FUNCTION      = function(){},
		ITEM_SELECTOR       = 'input,select,textarea',
		VALID_TAG_NAME      = 'data-valid-rule',
		VALID_PATTERN_ATTR  = 'data-valid-pattern',
		TIPS_TAG_NAME       = 'data-valid-tip',
		VALID_FIELD_ATTR    = 'data-valid-id',
		VALID_STATE_KEY     = 'vs',
		FIELD_ERROR_CLASS   = 'error-field',
		FORM_VALID_CLASS    = 'pw-validation',
		NO_TARGET_ERROR_MSG = "错误：没有找到指定的表单！",
		//时间询问间隔时间
		TIMER_INTERVAL      = .2,
		CONFIG 				= {
			showEvent:'focus',
			//对于select,input, ta都采用valueChange事件，后期考虑效率优化
			//注意,此处即便是用户配置了，也会按照valuechange执行
			vldEvent:'valuechange',
			showTip: true,
			formErrorContainer: '',
			fieldErrorContainer: '',
			tip: '请正确输入(default) | 输入错误(default)',
			filter: '',
			/*items: [
				{
					queryName:'',
					pattern: function(){},
					tip:'',
					showEvent:'click',
					showTip: 'true',
					vldEvent:'blur',
					onStateChange: function(type){}
				}
			]*/
			zIndex:101,
			theme:'inline',
			width: 400,
			direction: 'right',
			alignY:'center',
			alignX:'center',
			showTimeout:.3,
			hideTimeout: .2,
			trace:false,
			//智能模式，开启后当表单验证错误时将自动拦截提交操作,还会做其他处理，
			//智能模式意味着表单验证会尽可能少地减少用户操作，直接按照常规模式处理
			smartMode: true,
			//聚焦时是否显示样式
			loadingStyle: true,
			focusStyle: true,
			errorStyle: true,
			successStyle: true,
			//设置获取验证结果等待时间，单位是秒，默认为2s, 若为0，则一直询问，直到返回错误，或者浏览器死
			wait: 2, 
			//各个默认的change
			onStateChange: EMPTY_FUNCTION,
			themeUrl: PW.Env.puiWebsite + 'assets/defender/styles/style.css'
		},
		MOD_DEFENDER_SETTINGS = PW.Env.modSettings.defender || {};

	function Validation(container,param){

		var
			c = this._getContainer(container, param);
		if(c == null) {
			S.log('注意:配置错误，当前找不到任何可配置表单，请检查选择器!', 'warn', 'pui/mod/defender');
			return;
		}

		//得到验证容器
		this.container = c;
		//模式匹配验证对象
		this.pattern = new Pattern(this.container);
		//用户配置的表单
		this.form = this.container;
		//合并后配置参数(如果container是一个对象，则合并container，否则合并param)
		this.opts = (S.isObject(container) && container.container)?
					S.merge(CONFIG,MOD_DEFENDER_SETTINGS,container):
					S.merge(CONFIG,MOD_DEFENDER_SETTINGS,param);
		//表单提交时错误显示容器
		this.fec = new FormErrorTip(c,this.opts);
		//所有表单验证项的id
		this.nextFieldId;
		//所有配置的验证项目集合
		this.fieldSet = [];
		//对shell按照fieldIndex进行存储，方便后期查找
		this.shellIndex = {};
		if(!S.one('#J_defenderCSS', 'html')){
			//加载css样式
			this._loadStyles();
		}
		this.init();
	}

	S.augment(Validation,S.EventTarget,{
		init: function(){
			var
				that = this,
				opts = that.opts;

			if(!PW.GLOBAL_VALID_FIELD_ID) PW.GLOBAL_VALID_FIELD_ID = 0;
			that.nextFieldId = PW.GLOBAL_VALID_FIELD_ID;
			
			//为form添加默认的验证样式
			that._renderFormStyle();
			//写入data验证规则
			that._embedTagRule();
			that._embedCustomRule();

			if(opts.showTip){
				that._getTip(function(){
					//得到添加了验证项目的表单域，并执行初始化方法
					this.fieldset = S.filter(
						query(ITEM_SELECTOR,that.form),
						function(field){
							return that._initFormField(field);
						}
					);
					//未验证组件加载css样式
					that.addEvtDispatcher();
				});
			}else{
				this.fieldset = S.filter(
					query(ITEM_SELECTOR, that.form),
					function(field){
						that._initFormField(field);
					}
				);
				//未验证组件加载css样式
				that.addEvtDispatcher();
			}
			
		},
		//事件分发函数
		addEvtDispatcher: function(){
			var
				that       = this,
				form       = that.form,
				opts       = that.opts,
				fec        = that.fec,
				shellArray = that._getShellArray(),
				$form      = $(form);
			//表单重置时，清空tip
			$form.on('reset',function(evt){
				S.each(shellArray,function(shell){
					var 
						attrs = shell.field.attributes,
						defaultValue = !attrs.value ? '' : attrs.value.value;
					//如果input设置了value属性值为空，则置空
					//否则置为默认值
					(!defaultValue)?
						$(shell.field).val(''):
						$(shell.field).val(defaultValue);

					//shell.doValid();
				})

				that.refresh();
				return true;
			})

			//添加拦截事件
			if(opts.smartMode){
				$form.on('submit',function(evt){
					var	
						stateCode, 
						rs = false;
					//检查所有表单域
					that._checkFields();
					try{
						stateCode = that.getValidResult();
						rs = (stateCode != 'success') ? false : true;
						if(!rs){
							throw('表单验证未通过');
						}
					}catch(err){
						S.log(err);
					}finally{
						that.fire('submit', {rs:rs, stateCode:stateCode,form: that.form});
						if(!rs){
							fec.showFormError();
						}else{
							fec.hideFormError();
						}
						return rs;
					}				})
			}
		},
		/**
		 * 去掉form添加事件
		 * by wangjing
		 * time: 2015.01.26
		 * @return {[type]} [description]
		 */
		detachEvt: function(){
			var
				that       = this,
				form       = that.form,
				opts       = that.opts,
				fec        = that.fec,
				shellArray = that._getShellArray(),
				$form      = $(form);
			Event.detach($form, 'reset');
			if(opts.smartMode){
				Event.detach($form, 'submit');
			}
		},
		/**
		 * 根据选择器获取表单内单个域的验证结果
		 * @param  {kissy选择器} selector 
		 * @return {Boolean}     验证结果
		 */
		getItemResult: function(selector){
			var
				that    = this,
				form    = that.form,
				field   = get(selector, form),
				data    = $(field).data() || {},
				ptn     = data.pattern,
				pattern = that.pattern;
			if(field == null){
				S.log('不存在要查找的项目');
				return false;
			}
			return pattern.valid(ptn,field)
		},
		/**
		 * 根据传入验证模式，验证验证模式是否正确
		 * @param  {String} ptn 验证模式
		 * @param  {String} val 验证字符串
		 * @return {Boolean}     验证结果
		 */
		test: function(ptn, val){
			var
				that = this,
				pattern = that.pattern;
			return pattern.test(ptn, val);
		},
		/**
		 * 立即验证单个表单项
		 */
		validItem: function(selector){
			var
				that     = this,
				f        = that.form,
				shellArr = that._getShellArray(),
				fieldId,
				field,
				targetShell;
			field = get(selector,f);
			if(field == null) {
				S.log('你要验证的内容找不到');
				return;
			}
			fieldId = DOM.attr(field,VALID_FIELD_ATTR);
			targetShell = that.shellIndex[fieldId];
			if(fieldId == '' || !targetShell){
				S.log('找不到验证项');
			}else{
				targetShell.doValid();
			}
		},
		//立刻执行一次验证
		validAll: function(cb){
			var
				that       = this,
				shellArray = that._getShellArray();
			S.each(shellArray, function(shell){
				shell.doValid();
			});
			if(S.isFunction(cb)){
				that.getValidResult(cb);
			}
		},
		//获取验证集合
		getValidSet: function(){
			var
				that = this,
				shellArray = that._getShellArray(),
				passedFields = [],errorFields = [];
			S.each(shellArray, function(shell){
				if(shell.validState != true){
					errorFields.push(shell);
				}else{
					passedFields.push(shell);
				}
			});
			return {
				pass: passedFields,
				error: errorFields
			};
		},
		//获取当前所有的shell的验证结果，只要有一个不为true，那么验证失败
		//notice: 此处不建议使用type，建议直接传递返回值
		getValidResult: function(type, callback){
			var
				that        = this,
				wait        = that.opts.wait,
				shellArray  = that._getShellArray(),
				stateCode   = 'success',
				asyncShells = [];
			//判断type，如果type是fn，那么callback = type
			if(S.isFunction(type)){
				callback = type;
				type = 'bool';
			}
			//判断所有验证域中如果非异步域有错误，则不验证异步域
			for(var i = 0; i < shellArray.length; i++){
				var myShell = shellArray[i];
				if(that._isInvalidField(myShell.field)) continue;
				//如果为错误
				if( (myShell.validState != true && myShell.validState != 'success' )&& !myShell.async){
					stateCode = 'error';
					break;
				}
				if(myShell.async){
					asyncShells.push(myShell);
				}
			}
			if(stateCode == 'error'){
				if(S.isFunction(callback)) callback(false);
				return (type == 'bool') ? false : stateCode;
			}

			//如果其他域都没有问题，现在验证异步域，设置验证失效时间
			if(asyncShells.length > 0){
				S.timer(function(k, stop){
					var hasError = false, hasLoading = false;
					for(var i = 0, l = asyncShells.length; i < l; i++){
						var ashell = asyncShells[i];
						if(ashell.validState == 'success'){
							continue;
						}else if(ashell.validState == 'loading'){
							hasLoading = true;
						}else if(ashell.validState == 'error'){
							hasError = true;
							break;
						}
					}
					if(hasError){
						if(S.isFunction(callback)) callback(false);
						stop();
					}else if(!hasLoading){
						if(S.isFunction(callback)) callback(true);
						stop();
					}
					//超时处理
					if(k == 19){
						S.log('表单异步验证超时，目前的验证时间为')
						if(S.isFunction(callback)) callback(false);
						stop();
					}
				}, TIMER_INTERVAL, Math.floor(wait / TIMER_INTERVAL), that);
				//todo: 这是为了旧版本支持此处，下一个版本删去
				return (type == 'bool') ? false : 'loading';
			}else{
				if(S.isFunction(callback)) callback(true);
				return (type == 'bool') ? true : 'success';
			}
		},
		//为当前标案返回序列化后的对象数据，如果传入true，则返回字符串，效果和serialize一样
		getFormData: function(type){
			var
				that = this;
			return DOM.serialize(that.form, type);
		},
		//为当前表单序列化，默认返回字符串
		serialize: function(){
			var
				that = this;
			return that.getFormData(true);
		},
		/**
		 * 重新载入表单验证
		 * @param  {Object} param     参数对象
		 * @return {Object}           验证核心对象
		 */
		refresh: function(param){
			var
				that = this,
				ctn;

			//如果移除事件失败，抛出错误，然后返回，不执行更新请求
			if(!that.removeValid()){
				S.log('移除事件失败');
				return;
			}
			that.removeTip();
			//如果param存在
			if(!param) param = that.opts;
			this.form = this.container;
			this.opts = S.merge(CONFIG,param);
			//所有表单验证项的id
			this.nextFieldId = undefined;
			//所有配置的验证项目集合
			this.fieldSet = [];
			//对shell按照fieldIndex进行存储，方便后期查找
			this.shellIndex = {};
			this.init();
		},
		destroy: function(){
			var
				that = this,
				ctn;

			//如果移除事件失败，抛出错误，然后返回，不执行更新请求
			if(!that.removeValid()){
				S.log('移除事件失败');
				return;
			}
			that.removeTip();
			//删除验证标识
			DOM.removeData(that.container, 'hasValid');
			this.form = {};
			this.container = {};
			//所有表单验证项的id
			this.nextFieldId = undefined;
			//所有配置的验证项目集合
			this.fieldSet = [];
			//对shell按照fieldIndex进行存储，方便后期查找
			this.shellIndex = {};
		},
		/**
		 * 删除所有注册的表单验证项
		 * 	1.会一并删除所有tip，然后删除evt,data属性
		 * 	2.删除错误提示(如果存在)
		 * @return {Boolean} 删除结果
		 */
		removeValid: function(){
			var
				that       = this,
				opts       = that.opts,
				shellArray = that._getShellArray();
			try{
				S.each(shellArray,function(shell){
					shell.removeValid();
				});
				$(that.form).removeClass(FORM_VALID_CLASS);
				return true;
			}catch(err){
				S.log(err);
				return false;
			}
		},
		/**
		 * 用于清除所有的验证提示
		 */
		removeTip: function(){
			var
				that = this,
				shellArray = that._getShellArray();
			S.each(shellArray, function(shell){
				shell.destroyTip();
			})
		},
		/**
		 * 更新提示信息
		 * @param  {[type]} selector [验证域选择器]
		 * @param  {[type]} tip      [更新验证域提示信息, 
		 *                            1、tip为数字时，为提示信息配置项数组的索引号;
		 *                            2、如果为字符串时，直接作为提示错误信息]
		 * @return {[type]}          [description]
		 */
		updateErrTip: function(selector, tip){
			var
				that     = this,
				f        = that.form,
				shellArr = that._getShellArray(),
				fieldId,
				field,
				targetShell;
			field = get(selector,f);
			if(field == null) {
				S.log('你要验证的内容找不到');
				return;
			}
			fieldId = DOM.attr(field,VALID_FIELD_ATTR);
			targetShell = that.shellIndex[fieldId];
			if(fieldId == '' || !targetShell){
				S.log('找不到验证项');
			}else{
				targetShell.updateErrTip(tip);
			}
		},
		/**
		 * 获取用户配置的表单数据
		 * @return {DOM} 表单节点 | null
		 */
		_getContainer: function(container,param){
			var
				that = this,
				rs   = null;
			if(S.isString(container) || DOM.isHTMLElement(container)){
				rs = get(container);
			}else if(S.isObject(container) && container.container){
				rs = get(container.container)
			}
			//考虑添加验证标识，如果后期再有验证进入，返回空’
			if(DOM.data(rs, 'hasValid') == true){
				S.log('您所设置的节点已经添加了表单验证，请检查！');
				rs = null;
			}else{
				DOM.data(rs, 'hasValid', true);
			}
			return rs;
		},
		/**
		 * 渲染表单样式
		 * @return {[type]} [description]
		 */
		_renderFormStyle: function(){
			var
				that = this,
				opts = that.opts,
				f = that.form;
			$(f).addClass(FORM_VALID_CLASS);
			if(opts.theme != ''){
				$(f).addClass(opts.theme);
			}
		},
		/**
		 * 初始化每个域
		 * @param  {DOM} field 单个表单域
		 */
		_initFormField: function(field){
			var
				that = this,
				opts = that.opts,
				myShell;
			//todo:如果为无效域，则忽略
			//S.log(that._isInvalidField(field));
			if(that._isInvalidField(field)) return;
			if(!$(field).data('pattern')) return false;

			//为每个验证项目创建验证对象shell
			myShell = new Shell(field,opts,that);
			that.shellIndex[myShell.fieldId] = myShell;
			//添加获取tip事件
			if(opts.showTip){
				myShell.setTip(that.FormTip);
			}
			//添加验证时间
			myShell.on('valid',function(evt){
				var
					myField = $(evt.target.field),
					req = myField.data('req'),
					cb = myField.data('onStateChange');

				//此处对于require进行联动更改
				if(!req) {
					//nothing
				}else{
					S.each(req,function(fieldId){
						var
							field = $j('['+VALID_FIELD_ATTR+'='+fieldId+']',that.form);
						that.shellIndex[fieldId].doValid(field);
					});
				}

				//如果onstateChagne存在
				if(S.isFunction(cb)){
					cb.call(this,
						evt.lastState,
						evt.currentState,
						myField.getDOMNode(),
						this,
						that);
				}
			});
			return true;
		},
		_getTip: function(callback){
			var
				that = this,
				opts = that.opts;
			if(opts.showTip == true){
				if(opts.fieldErrorContainer != ''){
					that.FormTip = InsideTip;
				}else if(opts.theme == 'inline'){
					that.FormTip = InlineTip;
				}else{
					that.FormTip = FloatTip;
				}
				if(S.isFunction(callback))	callback();
			}
		},
		/**
		 * 检查所有表单域
		 * @return {[type]} [description]
		 */
		_checkFields: function(){
			var
				that = this,
				shellArray = that._getShellArray();
			S.each(shellArray, function(shell){
				if(!shell.async){
					shell.doValid();
				}else{
					if(shell.validState == 'inactive') shell.doValid();
					if(shell.validState == 'focus') shell.doValid();
				}
			});
			return that.getValidSet();
		},
		//获取验证控件中所有的验证外壳（即每个验证项目）
		_getShellArray: function(){
			var
				that = this,
				shellIndex = that.shellIndex,
				r = [];
			for(var i in shellIndex){
				r.push(shellIndex[i]);
			}
			return r;
		},
		//扫描所有表单验证项的attr,将验证规则写入data属性
		_embedTagRule: function(){
			var
				that  = this,
				opts  = that.opts,
				form  = that.form,
				$form = $(form),
				allItems;
			//选择合适的表单域并且过滤掉diabled和hidden
			allItems = DOM.filter(ITEM_SELECTOR,function(item){
				return !that._isInvalidField(item);
			},form)
			//执行过滤方法，将内容过滤
			if(opts.filter != ''){
				allItems = DOM.filter(allItems, function(field){
					var p = DOM.parent(field, opts.filter);
					return !(p && get(p, form));
				},form)
			}

			allItems = S.filter(allItems,function(o){
				var 
					field = $(o),
					rule = field.attr(VALID_TAG_NAME),
					patternStr = field.attr(VALID_PATTERN_ATTR),
					type = field.attr('type'),
					vt = field.attr(TIPS_TAG_NAME);
				if(type == 'reset' || type == 'button' || type == 'submit') return false;
				if (
					(!rule || rule ==  '' ||  rule == 'none') &&
					(!patternStr || patternStr == '')
				){
					return false;
				}
				if(rule && (!vt || vt == '')){
					if(
						rule.search('\\[') >= 0 ||
						rule.search('\\]') >= 0 ||
						rule.search('\\|') >= 0 ||
						rule.search('\\&') >= 0
					){
						vt = opts.tip;
					}else{
						vt = that._getMatchTip(rule);
					}
				}
				//如果有pattern设置，以pattern为准
				if(patternStr){
					if(!vt || vt == '')	vt = opts.tip;
					rule = function(input, shell, form){
						return new RegExp(S.unEscapeHTML(patternStr), 'g').test($(input).val());
					}
				}
				$(o).data({
					pattern: rule,
					tip: vt,
					showEvent: opts.showEvent,
					vldEvent: opts.vldEvent,
					showTip: opts.showTip,
					vs: "inactive",
					onStateChange: opts.onStateChange
				})
				return true;
			});
		},
		//写入用于自定义规则到验证项
		_embedCustomRule: function(){
			var
				that = this,
				opts = that.opts;
			S.each(opts.items,function(o){
				var
					cfg = S.clone(opts);
				S.mix(cfg,o);
				if(S.isFunction(cfg.pattern)){
					$(o.queryName).each(function(field){
						if(that._isInvalidField(field)) return;
						$(this).data({
							tip: (cfg.tip != '') ? cfg.tip : opts.tip,
							pattern: cfg.pattern,
							showEvent: (cfg.showEvent != '') ? cfg.showEvent : opts.showEvent,
							vldEvent: (cfg.vldEvent != '') ? cfg.vldEvent : opts.vldEvent,
							vs: "inactive",
							showTip: (!cfg.showTip) ? false: true,
							async: (!cfg.async) ? false : true,
							onStateChange: (!S.isFunction(cfg.onStateChange)) ? undefined : cfg.onStateChange
						});
					});
				}
			})
		},
		//获取智能Tip提示
		_getMatchTip: function(rule){
			var
				that = this,
				opts = that.opts,
				tip = Tip.getTipByRule(rule);
			return (tip && tip != '') ? tip : opts.tip;
		},
		//判断一个域是否无效 条件：
		//域disabled
		//域的type值为hidden
		//域或者域的父亲节中有display属性为none
		_isInvalidField: function(field){
			//临时解决方案，后期需要调整
			return 	field.disabled ||
					DOM.hasClass(field, 'hidden') || 
					DOM.attr(field,'type') == 'hidden' ||
					DOM.css(field, 'display') == 'none' ||
					DOM.parents(field, function(item){
						return DOM.css(item, 'display') == 'none'
					}).length != 0;
		},
		/**
		 * 加载css
		 * 	1.如果modsettings没有设置，那么加载默认的数据
		 */
		_loadStyles: function(){
			var
				that = this,
				opts = that.opts;
			S.loadCSS(opts.themeUrl, {id: 'J_defenderCSS'});
		}
	});
	return Validation;
},{
	requires: [
		'validation/pattern',
		'validation/shell',
		'validation/tipText',
		'validation/form-error-tip',
		'validation/float-tip',
		'validation/inside-tip',
		'validation/inline-tip',
		'mod/ext',
		'core',
		'thirdparty/jquery'
	]
})


/**
 * 验证外壳，对于每个注册了的验证域创建验证对象
 * todo: 在shell中如果需要则传入idCard
 */
KISSY.add('validation/shell',function(S){
	var
		DOM = S.DOM ,get = DOM.get, query = DOM.query, Event = S.Event, on = Event.on, detach = Event.detach,
		delegate = Event.delegate, IO = S.IO, JSON = S.JSON, $ = S.all, 
		EMPTY_FUNCTION = function(){},
		ITEM_SELECTOR  = 'input,select,textarea',
		VALID_TAG_NAME = 'data-valid-rule',
		TIPS_TAG_NAME = 'data-valid-tip',
		VALID_FIELD_ATTR = 'data-valid-id',
		VALID_STATE_KEY = 'vs',
		FIELD_FOCUS_CLASS = 'focus-field',
		FIELD_ERROR_CLASS = 'error-field',
		FIELD_SUCCESS_CLASS = 'success-field',
		FIELD_LOADING_CLASS = 'loading-field',
		//用于记录field标识
		nextId = 0,
		Pattern;

	function Shell(field,opts,form){
		this.field      = field;
		this.opts       = opts;
		//父级表单对象（核心验证对象）
		this.prtForm    = form;
		this.pattern    = form.pattern;
		this.fieldData  = $(field).data();
		this.showTip    = ($(field).data('showTip') != true) ? false : true;
		this.async      = ($(field).data('async') != true) ? false: true;
		this.validState = 'inactive';
		this.fieldId    = S.guid();
		//将tip client实例化,仅当配置参数中showTip为真时
		this.tipClient;
		this.disable    = false;
		Pattern         = this.pattern;
		this.init();
	}

	S.augment(Shell,S.EventTarget,{
		init: function(){
			$(this.field).attr(VALID_FIELD_ATTR,this.fieldId);
			this.addEvtDispatcher();
		},
		addEvtDispatcher: function(){
			var 
				that   = this,
				opts   = that.opts,
				field  = that.field,
				$field = $(field),
				ve     = $field.data('vldEvent'),
				fdData = that.fieldData;
			//显示事件触发时，执行验证，此处默认为focus，showEvent将在后期失效
			//todo: 考虑有可能需要页面进入即要求显示验证结果的情况
			on(that.field,'focus',function(evt){
				that.doValid(this, evt);
			});

			//验证事件触发时，执行验证
			//因为valuechange不支持select，所以如果遇到select采用change事件
			if(DOM.nodeName(that.field) == 'select'){
				on(that.field, 'change', function(evt){
					that.doValid();
				})
			}else{
				//可以配置vldEvent来配置验证事件发生事件 by wangjing
				//todo: 这里只做了判断当鼠标失去焦点时出发和valuechange时出发，两种情况
				//		后面将扩充多个触发事件 by wangjing
				switch(ve){
					case 'blur': 
						on(that.field, 'blur',function(evt){
							that.doValid(this,evt);
						});
						break;
					default:
						on(that.field, 'valuechange',function(evt){
							that.doValid(this,evt);
						})
				}
			}
			
			//对于鼠标移除事件，删除焦点提示样式
			//此处暂时省略，因为采用valuechange，用不到这样的方法
			on(that.field, 'blur',function(evt){
				if(!that.async){ 
					//如果不是异步验证，那么在失去焦点时再验证一次
					//此处主要是为了避免为空验证出现的问题
					that.doValid(this,evt);
				}
			})
		},
		/**
		 * 移除当前shell中的所有验证事件，删除步骤：
		 * 		1.删除事件
		 * 		2.删除tip
		 * 		3.清除错误提示样式
		 * 		4.删除验证域属性
		 * 		5.移除所有验证域中的data属性值
		 */
		removeValid: function(){
			var
				that   = this,
				field  = that.field,
				$field = $(field),
				opts   = that.opts,
				se     = $field.data('showEvent'),
				ve     = $field.data('vldEvent'),
				tc     = that.tipClient;
			detach(field,se);
			detach(field,ve);
			detach(field,'focus');
			detach(field,'change');
			detach(field,'blur');
			detach(field,'valuechange'); //移除valuechange事件 by wangjing: 2015.01.26

			//如果存在tip，则删除
			if(tc)	tc.destroyTip();
			if(opts.errorStyle == true){
				$field.removeClass(FIELD_ERROR_CLASS);
			}
			//删除验证域正确样式，by wangjing 10.20
			if(opts.successStyle == true){
				$field.removeClass(FIELD_SUCCESS_CLASS);
			}
			//删除验证域属性
			$field.removeAttr(VALID_FIELD_ATTR);
			//删除所有的data属性，TODO：此处可能有多删的嫌疑，后期处理
			that._removeValidData();
			//打开禁止选项，让后期更新操作（异步操作）失效
			that.disable = true;
		},
		_removeValidData: function(){
			var
				that = this,
				field = that.field;
			DOM.removeData(field, 'tip');
			DOM.removeData(field, 'showEvent');
			DOM.removeData(field, 'vldEvent');
			DOM.removeData(field, 'showTip');
			DOM.removeData(field, 'vs');
			DOM.removeData(field, 'pattern');
			DOM.removeData(field, 'onStateChange');
		},
		doValid: function(input,evt){
			var
				that   = this,
				input  = that.field,
				tc     = that.tipClient,
				pn     = $(input).data('pattern'),
				r,
				//上一个的验证状态
				lastSt = $(input).data(VALID_STATE_KEY),
				//当前的验证状态
				currentSt;
			r = (S.isString(pn)) ? 
				Pattern.valid(pn,input) : 
				pn.call(that,input,that,that.prtForm);

			if($(input).val() == ''){
				//notice:修正为空时，判断是否当前聚焦元素的逻辑
				if(document.activeElement !== input && r == true){
					that.updateState('success');
				}else if(document.activeElement !== input && r == false){
					that.updateState('error');
				}else{
					that.updateState('focus');
				}
				return;
			}
			switch(r){
				case 'true':
				case true:
					that.updateState('success');
					break;
				case 'false':
				case false:
					that.updateState('error');
					break;
				case 'load':
				case 'loading':
					that.updateState('loading');
					break;				
				default:
					S.log('发生内部错误');
					that.updateState('error');
			}
		},
		updateState: function(state){
			if(this.disable == true) {
				S.log('操作拒绝，此验证已经移除');
				return;
			}
			var
				that   = this,
				opts = that.opts,
				field  = that.field,
				//上一个的验证状态
				lastSt = $(field).data(VALID_STATE_KEY),
				currentSt,
				tc     = that.tipClient;
			switch(state){
				case 'success':
				case 'error':
				case 'loading':
				case 'focus':
					currentSt = state;
					if(tc){
						tc.handleEvent({type:state,target:field});
					}
					that.validState = state;
					break;
				default:
					currentSt = 'error';
					if(tc){
						tc.handleEvent({type:'error',target:field});
					}
					that.validState = 'error';
			}

			//更新field的vs内容
			if(currentSt != lastSt){
				$(field).data(VALID_STATE_KEY,currentSt);
				that.updateFieldClass(currentSt);
			}
			that.fire('valid',{
				currentState:currentSt,
				lastState: lastSt
			});
		},
		/**
		 * 更新filed自身的class, 
		 */
		updateFieldClass: function(state){
			var
				that = this,
				field = that.field,
				opts = that.opts;
			//移除四组样式
			DOM.removeClass(
				field, 
				[FIELD_FOCUS_CLASS, FIELD_ERROR_CLASS, FIELD_SUCCESS_CLASS, FIELD_LOADING_CLASS].join(' ')
			)
			switch(state){
				case 'focus':
					if(opts.focusStyle){
						DOM.addClass(
							field, 
							FIELD_FOCUS_CLASS
						);
					}
					break;
				case 'loading':
					if(opts.loadingStyle){
						DOM.addClass(
							field,
						 	FIELD_LOADING_CLASS
						 );	
					}
					break;
				case 'success':
					if(opts.successStyle){
						DOM.addClass(
							field, 
							FIELD_SUCCESS_CLASS
						);	
					}
					break;
				default:
					// error case
					if(opts.errorStyle){
						DOM.addClass(
							field,
							FIELD_ERROR_CLASS
						);	
					}
			}
		},
		/**
		 * 更新错误提示信息
		 * @param  {[type]} errTip [description]
		 * @return {[type]}        [description]
		 */
		updateErrTip: function(errTip){
			var
				that = this,
				tc = that.tipClient;
			if(tc){
				tc.updateErrTip(errTip);
			}
		},
		destroyTip: function(){
			var
				that = this,
				tc = that.tipClient;
			if(tc){
				tc.destroyTip();
			}
		},
		setTip: function(FormTip){
			var
				that  = this,
				field = that.field,
				opts  = that.opts;
			if(!that.showTip) return;
			that.tipClient = new FormTip(field,opts);
		},
		test: function(ptn,val){
			var
				that = this,
				pattern = that.pattern;
			return pattern.test(ptn, val);
		}
	});
	return Shell;
},{
	requires:[
		'core'
	]
});

/**
 * pattern，根据传入的字符串，获取验证函数
 * eg: [ isEmail & length(4,18)] | null | [isQQ & length(3, 5) ] 
 */
KISSY.add('validation/pattern',function(S, IdCard){
	var 
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		//用于读取表单项目中的验证结果的key值，在require验证中使用
		VALID_STATE_KEY = 'vs',
		VALID_FIELD_ATTR = 'data-valid-id',
		RULE_SET = {
			isCommonUser: function(input){
				return /^[a-zA-Z]{1}([a-zA-Z0-9]|[._-]){5,19}$/.test(input);
			},
			notCommonUser: function(input){
				return !RULE_SET.isCommonUser(input);
			},
			isPassword: function(input){
				return /^(\w){6,20}$/.test(input);
			},
			notPassword: function(input){
				return !RULE_SET.isPassword(input);
			},
			isEmail:function(input){
                return /^[0-9a-zA-Z_\-\.]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+)+$/.test(input);
			},
			notEmail: function(input){
				return !RULE_SET.isEmail(input);
			},
			isNull: function(input){
				return input.length == 0;
			},
			notNull:function(input){
                return !/^\s*$/.test(input);
			},
			isNumber:function(input){
                return /^\d+$/.test(input);
			},
			notNumber: function(input){
				return !RULE_SET.isNumber(input);
			},
			notNegativeNumber: function(input){
				return (/^(([1-9][0-9]*)|0|([0-9]+\.[0-9]{1,2}))$/).test(input);
			},
			//判断为整数，并限制整数大小
			isInteger: function(input){
                return (/^\d+$/.test(input))&&(parseInt(input) <= 2147483647); //限制整数大小
			},
			isTelephone:function(input){
                return /^\d{3,4}-\d{7,8}(-\d{3,4})?$/.test(input);
			},
			notTelePhone: function(input){
				return !RULE_SET.isTelephone(input);
			},
			isImage:function(input){
                return /^.+(\.jpg|\.JPG|\.gif|\.GIF|\.png|.PNG|\.x\-png|\.bmp|\.BMP)$/.test(input);
			},
			notImage: function(input){
				return !RULE_SET.isImage(input);
			},
			isEnglish:function(input){
                return /^[a-zA-Z]*$/.test(input);
			},
			notEnglish: function(input){
				return !RULE_SET.isEnglish(input);
			},
			isHttp:function(input){
                return /^http\:\/\/([^\s]+)$/.test(input);
			},
			notHttp: function(input){
				return !RULE_SET.isHttp(input);
			},
			isFlv:function(input){
                return /^.+(\.flv|\.FLV|\.Flv)$/.test(input);
			},
			notFlv: function(input){
				return !RULE_SET.isFlv(input);
			},
			isFloat:function(input){
                return /^[-]?[0-9]*\.?[0-9]+$/.test(input);
			},
			notFloat: function(input){
				return !RULE_SET.isFloat(input);
			},
			isQQ:function(input){
                return /^[1-9]\d{4,13}$/.test(input);
			},
			notQQ: function(input){
				return !RULE_SET.isQQ(input);
			},
			isMobile:function(input){
                return /^[1]{1}[34578]{1}[0-9]{9}$/.test(input);//by wangjing 添加手机号码验证加号段‘7’
			},
			notMobile: function(input){
				return !RULE_SET.isMobile(input);
			},
			isChinese:function(input){
				return /^[\u4e00-\u9faf]+$/.test(input);
			},
			notChinese: function(input){
				return !RULE_SET.isChinese(input);
			},
			isUrl: function(input){
				return /[a-zA-z]+:\/\/[^\s]*/.test(input);
			},
			notUrl: function(input){
				return !RULE_SET.isUrl(input);
			},
			isIdCard: function(input){
				var idCard = IdCard,
					ic = new idCard(input);
                return ic.IsValid();
			},
			notIdCard: function(input){
				return !RULE_SET.isIdCard(input);
			},
			isZipCode: function(input){
				return /^[1-9][0-9]{5}$/.test(input);
			},
			notZipCode: function(input){
				return !RULE_SET.isZipCode(input);
			},
			isIP: function(input){
				return /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/.test(input);
			},
			notIp: function(input){
				return !RULE_SET.isIP(input);
			},
			isPositiveIngeter: function(input){
				return /^[1-9]\d*$/.test(input);
			},
			scale: function(input,s,l,equal){
				if(!/^(-?\.?\d+)(\.\d+)?$/.test(input)) return false;
				//按照10进制来转换数字
				input = parseFloat(input,10);
				s     = parseFloat(s,10);
				l     = parseFloat(l,10);
				return (equal && parseInt(equal,10) == 1)?(input >= s && input <= l):(input > s && input < l);
			},
			require: function(input,selector,field){
				var s = $(this.form).one('#'+selector),
					$field = $(field),
					fieldId = $field.attr(VALID_FIELD_ATTR),
					reqStack = s.data('req');
				if(s == null){
					S.log('要查找相等项目不存在，请检查id' + selector + '的项目是否存在');
					return false;
				}else{
					//当首次验证时绑定更改的field，如果此field更改了，将自动修改
					if(!reqStack || reqStack.length == 0){
						s.data('req',[fieldId])
					}else if(!S.inArray(fieldId,reqStack)){
						reqStack.push(fieldId);
						s.data('req',reqStack);
					}
					return s.data(VALID_STATE_KEY) == 'success'
				}
			},
			equal: function(input,selector){
				var s = $(this.form).one('#'+selector);
				if(s == null){
					S.log('要查找相等项目不存在，请检查id' + selector + '的项目是否存在');
					return false;
				}else{
					return s.val() == input;
				}
			},
			length:function(input,s,l,equal){//s代表最小值，l代表最大值
				var
					lg = input.length;
				s = parseInt(s,10);
				l = parseInt(l,10);	
				
				return (equal && parseInt(equal,10) == 1) ?
						(lg >= s) && (lg <= l):
						(lg > s) && (lg < l);
			},
			//此处selector尽量只接受类选择器
			one: function(input,selector){
				var
					els   = query(selector, this.form),
					field = arguments[2],
					rs    = false;
				S.each(els, function(el){
					if(el == field) return;
					if(rs) return;
					if($(el).data('vs') == 'success'){
						rs = true;
					}
				})
				return rs;
			}
		};

	function Pattern(form){
		this.form = form;
	};
	S.augment(Pattern,S.EventTarget,{
		test: function(ptn,val){
			var
				that = this;
			try{
				//如果ptn是is开头，且RULE_SET中存在该验证项则测试
				return (S.isString(ptn) && /^[is](\w)*$/.test(ptn) && RULE_SET[ptn]) ?
						that.valid(ptn,val) :
						false;
			}catch(err){
				S.log(err);
				return false;
			}
		},
		//验证函数
		valid: function(rules,field){
			var
				that = this,tks,rpn,
				val  = '';
			tks = that.cutToken(rules);
			rpn = that.getRPN(tks);
			if(!S.isString(field)){
				val = $(field).val();
			}else{
				val = field;
			}
			return that.doValid(rpn,val,field)
		},
		//根据逆波兰式rpn，计算，得到最终的验证结果值
		doValid: function(rpn,input,field){
			var
				that    = this,
				tkStack = [];

			S.each(rpn,function(tk){
				if(tk != '|' &&　tk != '&' ){
					tkStack.push(tk)
				}else{
					var
						t1 = tkStack.pop(), 
						t2 = tkStack.pop();
					if(tk == '&'){
						tkStack.push(that.subValid(t1,input,field) && that.subValid(t2,input,field));
					}else{
						tkStack.push(that.subValid(t1,input,field) || that.subValid(t2,input,field));
					}
				}
			});
			if(tkStack.length != 1) throw('计算错误，请检查传入样式是否争取');

			//最后一次计算，避免出现用户只输入了一个验证条件的情况，如[isEmail]
			return that.subValid(tkStack[0],input,field);
		},
		//切分表达式为token
		cutToken: function(txt){
			var
				reg = /\[|\]|\||&|[.a-zA-Z0-9,()_-]+/ig,
				tks;
			tks = txt.match(reg);
			tks = S.filter(tks,function(o){
				return /^\s*$/.test(o) ? false : true;
			});
			return tks == null ? '' : tks;
		},
		//将token序列转换成逆波兰式
		getRPN: function(tks){
			var
				that     = this,
				opStack  =['#'], 
				rpnStack = [],
				t,opST;

			S.each(tks,function(tk){
				//tk是某项操作时
				if(tk !='[' && tk!=']' && tk != ' ' && tk != '|' && tk != '&'){
					rpnStack.push(tk);
				}
				else{
					if(tk == '['){
						opStack.push(tk);
					}
					else if(tk == ']'){
						while((t = opStack.pop()) != '['){
							rpnStack.push(t)
						}
					}else if(tk == '|' || tk == '&'){
						opST = opStack[opStack.length - 1];
						if(opST == '[' || opST == '#'){
							opStack.push(tk);
						}else if(opST == '|' || opST == '&'){
							do{
								t = opStack.pop();
								rpnStack.push(t);
							}while(opStack[opStack.length - 1] != '#' && opStack[opStack.length - 1] != '[');
							opStack.push(tk);
						}
					}
				}
			});	
			while((t = opStack.pop()) != '#'){
				rpnStack.push(t);
			}
			return rpnStack;
		},
		//传入一个token进行解析，返回bool值
		subValid: function(tk,input,field){
			if(S.isBoolean(tk)) return tk;
			var
				ruleName = tk,
				ruleArg  = [input],
				lb       = tk.search('\\('),
				rb       = tk.search('\\)');

			if(lb >0 && rb > 0){
				ruleName = tk.substr(0,lb);
				ruleArg = ruleArg.concat(tk.substr(lb+1,rb-lb-1).split(','));
			}
			//将当前验证的域压入参数栈
			ruleArg.push(field);
			return (RULE_SET[ruleName]) ? RULE_SET[ruleName].apply(this,ruleArg) : 'false';
		}
	});

	return Pattern;
},{
	requires:['validation/id-card','core']
});



/**
 * 整个表单错误处理提示
 */
KISSY.add('validation/form-error-tip', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all;
	function FormErrorTip(form,opts){
		this.form = form;
		this.opts = opts;
		this.formErrorContainer;
		this.init();
	}

	S.augment(FormErrorTip, {
		init: function(){
			var
				that = this;
			that._getErrorHolder();
		},
		showFormError: function(){
			var
				that = this,
				fec  = that.formErrorContainer;
			$(fec).show();
		},
		hideFormError: function(){
			var
				that = this,
				fec  = that.formErrorContainer;
			$(fec).hide();	
		},
		/*--Todo: 更新错误容器中的数据--*/
		refreshErrorText: function(){},
		/**
		 * 获取参数中表单错误容器显示内容
		 */
		_getErrorHolder: function(){
			var
				that = this,
				f = that.form,
				opts = that.opts,
				errHolder = get(opts.formErrorContainer, f);
			that.formErrorContainer = errHolder;
		}
	});
	return FormErrorTip;
},{
	requires:['core']
});



KISSY.add('validation/tipText', function(S){
	var
		TIP_SET = {
			isCommonUser: '输入以字母开头、可带数字、“_”、“.”、“-”，长度为6-20位 | 输入用户名格式不正确',
			notCommonUser: '输入内容不可是用户名格式(以字母开头、带数字、“_”、“.”、“-”,长度在6-20位) | 格式不正确',
			isPassword: '请输入6-20个字母、数字、下划线 | 输入密码格式错误',
			notPassword: '输如内容不可为密码格式 | 格式不正确',
			isEmail:'请输入正确的邮件格式,形如：XXX@XX.XX | 输入邮件格式不正确',
			notEmail: '输入内容不可为邮件格式 | 格式不正确',
			isNull: '请不要输入 | 输入必须为空',
			notNull:'请输入任意文本 | 输入错误，输入不能为空',
			isNumber:'请输入数字 |输入错误，只能输入数字0-9的数字',
			notNumber: '输入内容不可是数字 | 输入内容是纯数字,错误',
			isTelephone:'输入座机号码，形如XXXX-XXXXXXX(-XXXX)| 输入座机号码错误，请注意加上区号',
			notTelePhone: '输入内容不可是电话号码格式 | 格式不正确',
			isImage:'请输入或者选择图片,图片格式只能是:jpg、gif、png、bmp | 输入或选择图片文件不正确',
			notImage: '输入内容不可是图片地址 | 格式不正确',
			isEnglish:'请输入英文字母 | 输入英文格式不正确',
			notEnglish: '输入内容不可为英文 | 输入内容为纯英文，错误',
			isHttp:'请输入http地址|http地址输入不正确',
			notHttp: '输入内容不可是http地址 | 格式不正确',
			isFlv:'请输入或者选择flv格式文件 | 输入或者选择flv格式文件不正确 ',
			notFlv: '输入内容不可为Flv地址 | 格式不正确',
			isFloat:'请输入一个小数(浮点数) | 格式不正确',
			notFloat: '输入内容不可为浮点数 | 格式不正确',
			isQQ:'请输入qq号码 | 输入qq号码错误，qq号码必须是-12位的数字',
			notQQ: '输入内容不可为QQ号码 | 格式不正确',
			isMobile:'请输入正确的手机号 | 输入手机号码不符合规格',
			notMobile: '输入不可为手机号码 | 格式不正确',
			isChinese:'请输入汉字 | 输入必须是汉字',
			notChinese: '输入不可为汉字 | 格式不正确',
			isUrl: '请输入URL地址，形如XXX://XXXXXX | URL地址错误',
			notUrl: '输入不可为Url地址 | 格式不正确',
			isIdCard: '请输入正确的身份证号 | 输入身份证号错误',
			notIdCard: '输入不可为身份证号码 | 格式不正确',
			isZipCode: '请输入邮政编码 | 邮政编码格式错误，一般为6位数字',
			notZipCode: '输入不可为邮政编码 | 格式不正确',
			isIP: '请输入IP地址，格式如：XXX.XXX.XXX.XXX,XXX代表0-255之间的数字 | 输入IP地址错误',
			notIp: '输入不可为IP地址 | 格式不正确',
			isPositiveIngeter: '请输入正整数 | 格式不正确',
			scale: function(s,l,equal){
				var
					s = parseFloat(s,10),
					l = parseFloat(l,10),
					t = '';
				t += '请输入一个范围在' + s + '到' + l + '的(';
				if(equal && parseInt(equal,10) == 1){
					t += '包';
				}else{
					t += '不';
				}
				t+=	'含'+ s +'和'+ l +')的数字 | 输入数值范围不正确';
				return t;
			},
			require: function(selector){
				return '输入需要id名为'+ selector +'的项目已经验证通过 | '+selector+'输入域没有通过验证'; 
			},
			equal: function(selector){
				return '输入需要和id名为'+ selector +'的项目一致 | 输入内容和selector 项目不同';
			},
			length: function(s,l,equal){
				var t = '' + '请输入长度在'+ s +'-'+ l +'之间(';
				if(equal && parseInt(equal,10) == 1){
					t += '包';
				}else{
					t += '不';
				}
				t += '含'+ s +'和'+ l +')的数|输入内容长度不符合要求,当前输入长度';
				return t;
			}
		};
	Tip = {
		getTipByRule : function(rule){
			if(!rule || rule == '') return '';
			var
				ruleName = rule,
				ruleArg  = [],
				lb       = rule.search('\\('),
				rb       = rule.search('\\)'),
				tip      = '';
			if(lb >0 && rb > 0){
				ruleName = rule.substr(0,lb);
				ruleArg  = ruleArg.concat(rule.substr(lb+1,rb-lb-1).split(','));
			}
			if(tip = TIP_SET[ruleName]){
				if(S.isFunction(tip)) tip = tip.apply(this,ruleArg);
			}
			return (tip) ? tip : '';
		},
		removeTipDOM: function(node){
			var
				tips = query(TIP_CLASS,node);
			$(tips).remove();
		}
	}
	return Tip;
});


/*-----------------------------------------------------------------------------
* @Description: 表单验证-自动提示工具（只有当核心模块需要时才引入） (tip.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.04.24
* ==NOTES:=============================================
* v1.0.0(2013.04.24):
* 	初始生成 
* 	TIP
* 通过有限自动机写出的tip更适合添加表单的提示功能
* tip不只是右侧的小黄条，还包括验证标记和trigger的阴影提示
* 此部分只用于表单的验证tip，更加高级的tip需要后期以更加严格高效的有限状态机写出
* date: 2013.01.18
* ---------------------------------------------------------------------------*/

KISSY.add('validation/float-tip',function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, on = S.Event.on, delegate = S.Event.delegate,
		detach = S.Event.detach, IO = S.IO, $ = S.all, Juicer = S.juicer.client,
		
		//箭头的默认偏差
		DEFAULT_ARROW_X_OFFSET = 20,
		DEFAULT_ARROW_Y_OFFSET = 6,
		//箭头的横向宽度
		ARROW_X_WIDTH = 16,
		//箭头的纵向宽度
		ARROW_Y_WIDTH = 9,
		//tip的默认圆角偏差
		TIP_RADIUS_OFFSET = 6,
		//tip的错误状态时的样式名称
		TIP_CLASS = '.pw-tip',
		TIP_ERROR_CLASS = 'error-state',
		TIP_SUCCESS_CLASS = 'success-state',
		TIP_LAODING_CLASS = 'loading-state',
		TIP_FIELD_FOCUS_CLASS = 'focus-state',
		//用于读取表单项目中的验证结果的key值，在require验证中使用
		VALID_STATE_KEY = 'vs',
		//箭头选择
		ARROW_SELECTOR = '.tip-arrow',
		//内容选择
		CONTENT_SELECTOR = '.tip-content',
		//触发器的索引属性值
		TIP_KEY_ATTR = 'data-tk',
		//tip的id属性值
		TIP_ID_ATTR　 = 'data-tipId',
		//自增标签Id
		nextTipId = 0,
		TIP_TEMP = ''+'<div class="pw-tip &{theme}" '+TIP_ID_ATTR　+'="&{tipId}" style="display: none; max-width: &{width}px; z-index: &{zIndex};">'+
						'<div class="tip-arrow tip-arrow-&{direction}"></div>'+
							'<div class="tip-content">&&{content}</div>'+
					'</div>',
		CONFIG = {
			width: 100,
			theme: 'yellow',
			content:'空',
			showTimeout:2,
			hideTimeout:2,
			direction:'top',
			alignX:'center',
			alignY:'center',
			offsetX:0,
			offsetY:0,
			zIndex:101,
			showEvent:'focus',
			vldEvent:'keyup',
			trace: false
		};


		function Tip(trigger,param){
			//设置触发器
			this.trigger = get(trigger);
			this.tipDOM;
			//参数合并
			this.opts = S.merge(CONFIG,param);
			this.errTipTxt  = $(trigger).data('tip').split('|')[1],
			this.focusTipTxt = $(trigger).data('tip').split('|')[0],
			this.loadingTiptxt = '正在加载...';
			this.tipId = -1;
			this.tipType = '';
			this.currentState = '';
			this.initState = '';
			this.trace = this.opts.trace;
			//关系数组，存储有限自动机中的结构
			this.actionTransitionFunctions = {
				inactive:{
					focus: function(evt){
						this.showTip(evt.target);
						this.update('focus');
						return 'fadein';
					},
					error: function(evt){
						this.showTip(evt.target);
						this.update('error');
						return 'fadein';
					},
					success: function(evt){
						this.showTip(evt.target);
						this.update('success');
						return 'fadein';
					},
					loading: function(evt){
						this.showTip(evt.target);
						this.update('loading');
						return 'fadein';
					}
				},
				fadein: {
					timeout: function(evt){
						return 'dsp';
					},
					error: function(evt){
						this.update('error');
						return this.currentState;
					},
					success: function(evt){
						this.update('success');
						return this.currentState;
					},
					loading: function(evt){
						this.update('loading');
						return this.currentState;
					},
					focus: function(evt){
						return this.currentState;
					}
				},
				dsp:{
					error: function(evt){
						this.update('error');
						return this.currentState;
					},
					success: function(evt){
						this.update('success');
						return this.currentState;
					},
					loading: function(evt){
						this.update('loading');
						return this.currentState;
					},
					focus: function(evt){
						this.update('focus');
						return this.currentState;
					}
				},
				fadeout: {
					error: function(evt){
						this.reDsp();
						this.update('error');
						return 'dsp';
					},
					success: function(evt){
						this.reDsp();
						this.update('success');
						return 'dsp';
					},
					loading: function(evt){
						this.reDsp();
						this.update('loading');
						return 'dsp';
					},
					focus: function(evt){
						this.reDsp();
						this.update('focus');
						return 'dsp';
					},
					timeout: function(evt){
						return 'inactive';
					}
				}
			};
			this.init();
		}

		S.augment(Tip,S.EventTarget,{
			init: function(){
				var
					that = this,
					opts = that.opts;

				//设置初始状态
				that.initState = 'inactive';
				//当前状态预置，实际是设置状态机的初始状态
				that.currentState = that.initState; 
			},
			//事件激发函数，通过传入evt中的evt.type，控制自动机从当前状态由事件类型向下走一个状态
			handleEvent: function(evt){
				var atf = this.actionTransitionFunctions[this.currentState][evt.type],
					nextState;
				if(!atf) {			
					atf = this.unexpetedEvent;
				}
				//进行状态转换
				nextState = atf.call(this,evt);
				if(!nextState)  nextState = this.currentState;
				if (!this.actionTransitionFunctions[nextState]) nextState = this.undefinedState(evt, nextState);
				if(this.trace) S.log("tipId:"+ this.tipId +"," + evt.type + " 事件引起自动机转移，从 " + this.currentState + "状态->" + nextState + "状态");
				this.currentState = nextState;
			},
			//无法预料错误，恢复到初始状态
			unexpetedEvent: function(evt){
				S.log('未设定的事件出现');
				return this.initState;
			},
			undefinedState: function(){
				S.log('未定义状态');
				return this.initState;
			},
			//在关系数组中，从当前状态转换到另外一个指定状态，并且执行后者的一次event.type转移
			doActionTransition: function(anotherState,anotherEventType,evt){
				return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,evt);
			},
			//根据传入的文本更新
			update: function(tipType){
				var
					that = this,
					tip = that.tipDOM;
				if(tipType == '') return;
				if(tipType == 'success'){
					that.showSuccessTip();
				}else if(tipType == 'error'){
					that.showErrorTip();
				}else if(tipType == 'focus'){
					that.showFocusTip();
				}else if(tipType == 'loading'){
					that.showLoadingTip();
				}
				that._fixPos(that.trigger,that.tipDOM);
			},
			showSuccessTip: function(){
				var
					that = this,
					trigger = that.trigger,
					tip = that.tipDOM;
				$(tip).removeClass(TIP_FIELD_FOCUS_CLASS)
					.removeClass(TIP_ERROR_CLASS)
					.removeClass(TIP_LAODING_CLASS)
					.addClass(TIP_SUCCESS_CLASS)
					.one(CONTENT_SELECTOR).html('&nbsp;');
				$(trigger).data(VALID_STATE_KEY,'success');
			},
			showErrorTip: function(){
				var
					that = this,
					opts = that.opts,
					trigger = that.trigger,
					tip = that.tipDOM;
				$(tip).removeClass(TIP_FIELD_FOCUS_CLASS)
					.removeClass(TIP_SUCCESS_CLASS)
					.removeClass(TIP_LAODING_CLASS)
					.addClass(TIP_ERROR_CLASS)
					.one(CONTENT_SELECTOR).html(that.errTipTxt);
				$(trigger).data(VALID_STATE_KEY,'error');
			},
			showFocusTip: function(){
				var
					that = this,
					opts = that.opts,
					trigger = that.trigger,
					tip = that.tipDOM;
				$(tip).removeClass(TIP_ERROR_CLASS)
					.removeClass(TIP_SUCCESS_CLASS)
					.removeClass(TIP_LAODING_CLASS)
					.addClass(TIP_FIELD_FOCUS_CLASS)
					.one(CONTENT_SELECTOR).html(that.focusTipTxt);
				$(trigger).data(VALID_STATE_KEY,'focus');
			},
			showLoadingTip: function(){
				var
					that = this,
					opts = that.opts,
					trigger = that.trigger,
					tip = that.tipDOM;
				$(tip).removeClass(TIP_ERROR_CLASS)
					.removeClass(TIP_SUCCESS_CLASS)
					.removeClass(TIP_FIELD_FOCUS_CLASS)
					.addClass(TIP_LAODING_CLASS)
					.one(CONTENT_SELECTOR).html(that.loadingTiptxt);
				$(trigger).data(VALID_STATE_KEY,'focus');
			},

			//显示提示
			showTip: function(trigger){
				var
					that = this,
					d,
					tipId = DOM.attr(trigger,TIP_KEY_ATTR),
					tipDOM;
				if(!tipId || tipId == ''){
					d = that._createTipDOM(trigger);
					DOM.append(d,'body');
					that._fixPos(trigger, d);
					$(d).fadeIn(that.opts.showTimeout,function(){
						that.handleEvent({type:'timeout'});
					});
					//存入对象属性中
					that.tipDOM = d;
				}else{
					S.log('tip已经存在');
				}
				return that;
			},
			//隐藏提示
			hideTip: function(){
				var
					that = this,
					d,
					trigger = that.trigger,
					tipDOM = that.tipDOM;
				
				if(tipDOM != null){
					$(tipDOM).fadeOut(that.opts.hideTimeout,function(){
						$(tipDOM).remove();
						$(trigger).removeAttr(TIP_KEY_ATTR);
						that.handleEvent({type: 'timeout'})
					});
				}else{
					S.log('关闭失败，你要关闭的tip不存在');
				}	
				return that;
			},
			//删除整个tip实例化对象
			destroyTip: function(fn){
				var
					that = this,
					opts = that.opts,
					trigger = that.trigger,
					tipDOM = that.tipDOM;
				if(tipDOM){
					$(tipDOM).fadeOut(that.opts.hideTimeout,function(){
						$(trigger).removeAttr(TIP_KEY_ATTR);
						$(tipDOM).remove();
						if(S.isFunction(fn)) 	fn(trigger);
					})
				}else{
					$(trigger).removeAttr(TIP_KEY_ATTR);
					$(tipDOM).remove();
					if(S.isFunction(fn)) 	fn(trigger);
				}
			},
			_createTipDOM: function(trigger){
				var
					that = this,
					opts = that.opts,
					html = '',
					tipId = nextTipId ++,
					d,
					cnt;
				html = Juicer(TIP_TEMP,{
					tipId: tipId,
					width: opts.width,
					theme: opts.theme,
					direction: opts.direction,
					zIndex: opts.zIndex,
					content: (opts.content && S.isString(opts.content)) ? opts.content.split('|')[0] : ''
				});
				this.tipId = tipId;
				DOM.attr(trigger,TIP_KEY_ATTR,tipId);
				d = DOM.create(html);

				return d;
			},
			//修正tip出现的位置，保证尽可能在页面的可视范围之内
			_fixPos: function(trigger,d){
				var 
					that = this,
					opts = that.opts,
					arrow = get(ARROW_SELECTOR, d),
					sw = DOM.outerWidth(trigger), sh = DOM.outerHeight(trigger),
					of = DOM.offset(trigger),
					sl = of.left,
					st = of.top,
					dw = DOM.width(d), dh = DOM.height(d),
					dl,dt,
					aw_l,aw_t;
				
				switch(opts.direction){
					case 'auto': 
						break;
					case 'top':
						dt = st - dh - ARROW_Y_WIDTH;
						if(opts.alignX == 'left'){
							dl = sl;
							aw_l = (sw > DEFAULT_ARROW_X_OFFSET + ARROW_X_WIDTH) ? 	
									DEFAULT_ARROW_X_OFFSET :
									(sw-ARROW_X_WIDTH)/2;
							if(aw_l < TIP_RADIUS_OFFSET){
								dl = sl + sw/2 - ARROW_X_WIDTH/2 - TIP_RADIUS_OFFSET;
								aw_l = TIP_RADIUS_OFFSET;
							}
							$(arrow).css({
								marginLeft: 0,
								left: aw_l
							});
						}else if(opts.alignX == 'right'){
							dl = sl + sw  - dw;
							aw_l = (sw > DEFAULT_ARROW_X_OFFSET + ARROW_X_WIDTH) ?
								(dw -DEFAULT_ARROW_X_OFFSET- ARROW_X_WIDTH) :
								dw - sw/2 - ARROW_X_WIDTH/2;

							if(sw/2 - ARROW_X_WIDTH/2 < TIP_RADIUS_OFFSET){
								aw_l = dw - TIP_RADIUS_OFFSET - ARROW_X_WIDTH;
								dl = sl + sw/2 + ARROW_X_WIDTH/2 + TIP_RADIUS_OFFSET - dw;
							}
							$(arrow).css({
								marginLeft: 0,
								left: aw_l
							});
						}else if(opts.alignX == 'center'){
							dl = sl + sw/2 - dw /2;
						}
						break;
					case 'bottom':
						dt = st + sh + ARROW_Y_WIDTH;
						if(opts.alignX == 'left'){
							dl = sl;
							aw_l = (sw > DEFAULT_ARROW_X_OFFSET + ARROW_X_WIDTH) ? 	
									DEFAULT_ARROW_X_OFFSET :
									(sw-ARROW_X_WIDTH)/2;
							if(aw_l < TIP_RADIUS_OFFSET){
								dl = sl + sw/2 - ARROW_X_WIDTH/2 - TIP_RADIUS_OFFSET;
								aw_l = TIP_RADIUS_OFFSET;
							}
							$(arrow).css({
								marginLeft: 0,
								left:aw_l
							});
						}else if(opts.alignX == 'right'){
							dl = sl + sw  - dw;
							aw_l = (sw > DEFAULT_ARROW_X_OFFSET + ARROW_X_WIDTH) ?
									(dw -DEFAULT_ARROW_X_OFFSET- ARROW_X_WIDTH) :
									dw - sw/2 - ARROW_X_WIDTH/2;
							if(sw/2 - ARROW_X_WIDTH/2 < TIP_RADIUS_OFFSET){
								aw_l = dw - TIP_RADIUS_OFFSET - ARROW_X_WIDTH;
								dl = sl + sw/2 + ARROW_X_WIDTH/2 + TIP_RADIUS_OFFSET - dw;
							}
							$(arrow).css({
								marginLeft: 0,
								left: aw_l
							});
						}else if(opts.alignX == 'center'){
							dl = sl + sw/2 - dw /2;
						}
						break;
					case 'left':
						dl = sl - dw - ARROW_Y_WIDTH;
						if(opts.alignY == 'top'){
							dt = st;
							aw_t = (sh > DEFAULT_ARROW_Y_OFFSET + ARROW_X_WIDTH) ?
									DEFAULT_ARROW_Y_OFFSET :
									(sh-ARROW_X_WIDTH)/2;
							if(aw_t < TIP_RADIUS_OFFSET){
								aw_t = TIP_RADIUS_OFFSET;
								dt = st + sh/2 - ARROW_X_WIDTH/2 - TIP_RADIUS_OFFSET;
							}
							$(arrow).css({
								top: aw_t
							});
						}else if(opts.alignY == 'bottom'){
							dt = st + sh - dh;
							aw_t = (sh > DEFAULT_ARROW_Y_OFFSET + ARROW_X_WIDTH)?
									(dh -DEFAULT_ARROW_Y_OFFSET- ARROW_X_WIDTH):
									dh - sh/2 - ARROW_X_WIDTH/2;
							if(sh/2 - ARROW_X_WIDTH/2 < TIP_RADIUS_OFFSET){
								dt = st + sh/2 + ARROW_X_WIDTH/2 + TIP_RADIUS_OFFSET - dh;
								aw_t = dh - TIP_RADIUS_OFFSET - ARROW_X_WIDTH;
							}
							$(arrow).css({
								top:  aw_t
							});
						}else if(opts.alignY == 'center'){
							dt = st + sh/2 - dh/2;
							$(arrow).css({
								top: dh/2 - ARROW_X_WIDTH/2
							});
						}
						break;
					case 'right':
						dl = sl + sw + ARROW_Y_WIDTH;
						if(opts.alignY == 'top'){
							dt = st;
							aw_t = (sh > DEFAULT_ARROW_Y_OFFSET + ARROW_X_WIDTH) ?
									DEFAULT_ARROW_Y_OFFSET :
									(sh-ARROW_X_WIDTH)/2;
							if(aw_t < TIP_RADIUS_OFFSET){
								aw_t = TIP_RADIUS_OFFSET;
								dt = st + sh/2 - ARROW_X_WIDTH/2 - TIP_RADIUS_OFFSET;
							}
							$(arrow).css({
								top: aw_t
							});
						}else if(opts.alignY == 'bottom'){
							dt = st + sh - dh;
							aw_t = (sh > DEFAULT_ARROW_Y_OFFSET + ARROW_X_WIDTH)?
									(dh -DEFAULT_ARROW_Y_OFFSET- ARROW_X_WIDTH):
									dh - sh/2 - ARROW_X_WIDTH/2;
							if(sh/2 - ARROW_X_WIDTH/2 < TIP_RADIUS_OFFSET){
								dt = st + sh/2 + ARROW_X_WIDTH/2 + TIP_RADIUS_OFFSET - dh;
								aw_t = dh - TIP_RADIUS_OFFSET - ARROW_X_WIDTH;
							}
							$(arrow).css({
								top: aw_t
							});
						}else if(opts.alignY == 'center'){
							dt = st + sh/2 - dh/2;
							$(arrow).css({
								top: dh/2 - ARROW_X_WIDTH/2
							});
						}
						break;
					default: 
						break;
				}

				$(d).css({
					left: dl,
					top: dt
				});
				return d;
			}
		})


	return Tip;
},{
	requires:['core','mod/juicer']
});

 

 /*-----------------------------------------------------------------------------
* @Description: 表单验证的表单内提示 (inside-tip.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.04.25
* ==NOTES:=============================================
* v1.0.0(2013.04.25):
* 	初始生成 
* ---------------------------------------------------------------------------*/

KISSY.add('validation/inside-tip', function(S){

	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		FOCUS_CLASS = 'focus-state',
		ERROR_CLASS = 'error-state',
		LOAING_CLASS = 'loading-state',
		SUCCESS_CLASS = 'success-state',
		CONFIG = {
			fieldErrorContainer:''
		};

	function InsideTip(field, param){
		this.field = field;
		this.opts = S.merge(CONFIG,param);
		this.form = this.form;
		//提示元素
		this.tipEl;
		//异步加载提示
		this.loadingTipText = '正在加载...';
		this.errorTipText;
		this.focusTipText;
		this.currentState = '';
		this.initState = '';
		//是否显示追踪信息
		this.trace = this.opts.trace;
		//有限自动机状态表
		this.actionTransitionFunctions = this._getATF();
		this.init();
	}

	S.augment(InsideTip, S.EventTarget, {
		init: function(){
			var that = this;
			//获取状态表
			this.actionTransitionFunctions = this._getATF();
			//获取提示元素
			this.tipEl = this._getTipEelement();
			//错误提示
			this.errorTipText = $(this.field).data('tip').split('|')[1];
			//聚焦提示
			this.focusTipText = $(this.field).data('tip').split('|')[0];
			//设置初始状态
			that.initState = 'inactive';
			//当前状态预置，实际是设置状态机的初始状态
			that.currentState = that.initState; 
		},
		//根据传入的状态吗，更新当前状态
		handleEvent: function(evt){
			var atf = this.actionTransitionFunctions[this.currentState][evt.type],
				nextState;
			if(!atf) {			
				atf = this.unexpetedEvent;
			}
			//进行状态转换
			nextState = atf.call(this,evt);
			if(!nextState)  nextState = this.currentState;
			if (!this.actionTransitionFunctions[nextState]) nextState = this.undefinedState(evt, nextState);
			if(this.trace) S.log("tipId:"+ this.tipId +"," + evt.type + " 事件引起自动机转移，从 " + this.currentState + "状态->" + nextState + "状态");
			this.currentState = nextState;
		},
		//无法预料错误，恢复到初始状态
		unexpetedEvent: function(evt){
			S.log('未设定的事件出现');
			return this.initState;
		},
		undefinedState: function(){
			S.log('未定义状态');
			return this.initState;
		},
		//在关系数组中，从当前状态转换到另外一个指定状态，并且执行后者的一次event.type转移
		doActionTransition: function(anotherState,anotherEventType,evt){
			return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,evt);
		},
		/**
		 * 切换状态
		 * @param  {String} type 状态码 success,focus,error,loading
		 */
		update: function(type){
			var
				that = this,
				$tipEl = $(that.tipEl);
			switch(type){
				case 'focus':
					that._change2Focus();
					break;
				case 'error':
					that._change2Error();
					break;
				case 'success':
					that._chage2Success();
					break;
				case 'loading':
					that._change2Loading();
					break;
				default:
					alert('验证出现错误');
			}
		},
		showTip: function(){
			var
				that = this,
				tipEl = that.tipEl;
			$(tipEl).show();
		},
		hideTip: function(){
			var
				that = this,
				tipEl = that.tipEl;
			$(tipEl).hide();
		},
		destroyTip: function(){
			var
				that = this,
				tipEl = that.tipEl;
			$(tipEl).hide();
		},
		//切换到加载状态
		_change2Loading: function(){
			var
				that = this,
				tipEl = that.tipEl,
				lt = that.loadingTipText;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(ERROR_CLASS)
					.addClass(LOAING_CLASS)
					.text(lt);
		},
		_change2Error: function(){
			var
				that = this,
				tipEl = that.tipEl,
				et = that.errorTipText;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(ERROR_CLASS)
					.text(et);
		},
		_chage2Success: function(){
			var
				that = this,
				tipEl = that.tipEl,
				et = that.errorTipText;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(ERROR_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(SUCCESS_CLASS)
					.html("&nbsp;");
		},
		_change2Focus: function(){
			var
				that = this,
				tipEl = that.tipEl,
				ft = that.focusTipText;
			$(tipEl).removeClass(ERROR_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(FOCUS_CLASS)
					.text(ft);
		},
		//获取field对应的提示框
		_getTipEelement: function(){
			var
				that = this,
				f = that.form,
				opts = that.opts,
				field = that.field,
				fieldId,
				rs = null;
			fieldId = DOM.attr(field, 'id');
			if(fieldId != ''){
				rs = get(
					opts.fieldErrorContainer+'[for="'+fieldId+'"]',
					f
				);
			}
			return rs;
		},
		/**
		 * 更新错误提示信息
		 * 如果传入errTip为数字，错误提示根据tip数组相应数字显示
		 * @param  {[type]} el     [description]
		 * @param  {[type]} errTip [description]
		 * @return {[type]}        [description]
		 */
		updateErrTip: function(errTip){
			var
				that = this;
			if(S.isNumber(errTip)){
				that.errorTipText = that.reserveErrTip[errTip];
			}else{
				that.errorTipText = errTip;
			}
			that.tipFlag = 1;
		},
		_getATF: function(){
			return {
				inactive:{
					focus: function(evt){
						this.showTip(evt.target);
						this.update('focus');
						return 'dsp';
					},
					error: function(evt){
						this.showTip(evt.target);
						this.update('error');
						return 'dsp';
					},
					success: function(evt){
						this.showTip(evt.target);
						this.update('success');
						return 'dsp';
					},
					loading: function(evt){
						this.showTip(evt.target);
						this.update('loading');
						return 'dsp';
					}
				},
				dsp:{
					error: function(evt){
						this.update('error');
						return this.currentState;
					},
					success: function(evt){
						this.update('success');
						return this.currentState;
					},
					loading: function(evt){
						this.update('loading');
						return this.currentState;
					},
					focus: function(evt){
						this.update('focus');
						return this.currentState;
					}
				}
			};
		}
	})

	return InsideTip;
},{
	requires:['core']
});



/*-----------------------------------------------------------------------------
* @Description: inline-tip自动在field后添加 (defender.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.05.24
* ==NOTES:=============================================
* v1.0.0(2013.05.24):
* 	初始生成 
* ---------------------------------------------------------------------------*/

KISSY.add('validation/inline-tip', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
		Juicer = S.juicer,
		FOCUS_CLASS   = 'focus-state',
		ERROR_CLASS   = 'error-state',
		LOAING_CLASS  = 'loading-state',
		SUCCESS_CLASS = 'success-state',
		TIP_ID_ATTR   = '',
		TIP_KEY_ATTR = 'data-tk',
		//tip的id属性值
		TIP_ID_ATTR　 = 'data-tipId',
		TIP_TEMP = ''+
					'<span class="pw-tip" '+TIP_ID_ATTR　+'="&{tipId}" style="display: none;">'+
					'</span>',
		nextTipId = 0,
		CONFIG = {};

	function InlineTip(field, param){
		this.field = field;
		this.opts = S.merge(CONFIG,param);
		this.form = this.form;
		//提示元素
		this.tipEl;
		//异步加载提示
		this.loadingTipText = '正在加载...';
		this.errorTipText;
		this.focusTipText;
		this.currentState = '';
		this.initState = '';
		//是否显示追踪信息
		this.trace = this.opts.trace;
		//有限自动机状态表
		this.actionTransitionFunctions = this._getATF();
		this.init();
	}

	S.augment(InlineTip, {
		init: function(){
			var 
				that = this;
			//获取状态表
			that.actionTransitionFunctions = that._getATF();
			//错误提示
			that.errorTipText = $(that.field).data('tip').split('|')[1];
			//聚焦提示
			that.focusTipText = $(that.field).data('tip').split('|')[0];
			//设置初始状态
			that.initState = 'inactive';
			//当前状态预置，实际是设置状态机的初始状态
			that.currentState = that.initState; 
		},
		handleEvent: function(evt){
			var atf = this.actionTransitionFunctions[this.currentState][evt.type],
				nextState;
			if(!atf) {			
				atf = this.unexpetedEvent;
			}
			//进行状态转换
			nextState = atf.call(this,evt);
			if(!nextState)  nextState = this.currentState;
			if (!this.actionTransitionFunctions[nextState]) nextState = this.undefinedState(evt, nextState);
			if(this.trace) S.log("tipId:"+ this.tipId +"," + evt.type + " 事件引起自动机转移，从 " + this.currentState + "状态->" + nextState + "状态");
			this.currentState = nextState;
		},
		_getATF: function(){
			return {
				inactive:{
					focus: function(evt){
						this.showTip(evt.target);
						this.update('focus');
						return 'dsp';
					},
					error: function(evt){
						this.showTip(evt.target);
						this.update('error');
						return 'dsp';
					},
					success: function(evt){
						this.showTip(evt.target);
						this.update('success');
						return 'dsp';
					},
					loading: function(evt){
						this.showTip(evt.target);
						this.update('loading');
						return 'dsp';
					}
				},
				dsp:{
					error: function(evt){
						this.update('error');
						return this.currentState;
					},
					success: function(evt){
						this.update('success');
						return this.currentState;
					},
					loading: function(evt){
						this.update('loading');
						return this.currentState;
					},
					focus: function(evt){
						this.update('focus');
						return this.currentState;
					}
				}
			};
		},
		//无法预料错误，恢复到初始状态
		unexpetedEvent: function(evt){
			S.log('未设定的事件出现');
			return this.initState;
		},
		undefinedState: function(){
			S.log('未定义状态');
			return this.initState;
		},
		//在关系数组中，从当前状态转换到另外一个指定状态，并且执行后者的一次event.type转移
		doActionTransition: function(anotherState,anotherEventType,evt){
			return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,evt);
		},
		showTip: function(){
			var
				that = this,
				field = that.field;
			if(!that.tipEl){
				that.tipEl = that._getTipEelement();
				$(that.tipEl).insertAfter(field)
							 .show();
			}
		},
		hideTip: function(){
			var
				that = this;
			if(that.tipEl){
				$(that.tipEl).hide();
			}
		},
		destroyTip: function(){
			var
				that = this;
			if(that.tipEl){
				$(that.tipEl).remove();
				that.tipEl = undefined;
			}
		},
		update: function(type){
			var
				that = this;
			switch(type){
				case 'focus':
					that._change2Focus();
					break;
				case 'error':
					that._change2Error();
					break;
				case 'success':
					that._chage2Success();
					break;
				case 'loading':
					that._change2Loading();
					break;
				default:
					alert('验证出现错误');
			}
		},
		_getTipEelement: function(){
			var
				that = this,
				opts = that.opts,
				html,
				t;
			html = Juicer(TIP_TEMP, {
				theme: opts.theme,
				tipId : nextTipId ++,
				direction: opts.direction,
				content: ''
			})
			return DOM.create(html);
		},
		_change2Loading: function(){
			var
				that = this,
				tipEl = that.tipEl,
				lt = that.loadingTipText;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(ERROR_CLASS)
					.addClass(LOAING_CLASS)
					.text(lt);
		},
		_change2Error: function(){
			var
				that = this,
				tipEl = that.tipEl,
				et = that.errorTipText;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(ERROR_CLASS)
					.text(et);
		},
		_chage2Success: function(){
			var
				that = this,
				tipEl = that.tipEl;
			$(tipEl).removeClass(FOCUS_CLASS)
					.removeClass(ERROR_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(SUCCESS_CLASS)
					.html("&nbsp;");
		},
		_change2Focus: function(){
			var
				that = this,
				tipEl = that.tipEl,
				ft = that.focusTipText;
			$(tipEl).removeClass(ERROR_CLASS)
					.removeClass(SUCCESS_CLASS)
					.removeClass(LOAING_CLASS)
					.addClass(FOCUS_CLASS)
					.text(ft);
		}
	})
	return InlineTip;
},{
	requires:['mod/juicer','core']
})



/*-----------------------------------------------------------------------------
* @Description: 表单验证-身份验证模块，只有当核心模块需要时才引入 (id.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.04.24
* ==NOTES:=============================================
* v1.0.0(2013.04.24):
* 	初始生成 
* ---------------------------------------------------------------------------*/
/**
 * 验证身份证号码的专门附加模块
 */
KISSY.add('validation/id-card', function(S) {
    // 构造函数，变量为15位或者18位的身份证号码
    function clsIDCard(CardNo) {
        this.Valid = false;
        this.ID15 = '';
        this.ID18 = '';
        this.Local = '';
        if (CardNo != null)
            this.SetCardNo(CardNo);
    }

    // 设置身份证号码，15位或者18位
    clsIDCard.prototype.SetCardNo = function(CardNo) {
        this.ID15 = '';
        this.ID18 = '';
        this.Local = '';
        CardNo = CardNo.replace(" ", "");
        var strCardNo;
        if (CardNo.length == 18) {
            pattern = /^\d{17}(\d|x|X)$/;
            if (pattern.exec(CardNo) == null)
                return;
            strCardNo = CardNo.toUpperCase();
        } else {
            pattern = /^\d{15}$/;
            if (pattern.exec(CardNo) == null)
                return;
            strCardNo = CardNo.substr(0, 6) + '19' + CardNo.substr(6, 9)
            strCardNo += this.GetVCode(strCardNo);
        }
        this.Valid = this.CheckValid(strCardNo);
    }
    // 校验身份证有效性
    clsIDCard.prototype.IsValid = function() {
        return this.Valid;
    }
    // 返回生日字符串，格式如下，1981-10-10
    clsIDCard.prototype.GetBirthDate = function() {
        var BirthDate = '';
        if (this.Valid)
            BirthDate = this.GetBirthYear() + '-' + this.GetBirthMonth() + '-' + this.GetBirthDay();
        return BirthDate;
    }
    // 返回生日中的年，格式如下，1981
    clsIDCard.prototype.GetBirthYear = function() {
        var BirthYear = '';
        if (this.Valid)
            BirthYear = this.ID18.substr(6, 4);
        return BirthYear;
    }
    // 返回生日中的月，格式如下，10
    clsIDCard.prototype.GetBirthMonth = function() {
        var BirthMonth = '';
        if (this.Valid)
            BirthMonth = this.ID18.substr(10, 2);
        if (BirthMonth.charAt(0) == '0')
            BirthMonth = BirthMonth.charAt(1);
        return BirthMonth;
    }
    // 返回生日中的日，格式如下，10
    clsIDCard.prototype.GetBirthDay = function() {
        var BirthDay = '';
        if (this.Valid)
            BirthDay = this.ID18.substr(12, 2);
        return BirthDay;
    }
    // 返回性别，1：男，0：女
    clsIDCard.prototype.GetSex = function() {
        var Sex = '';
        if (this.Valid)
            Sex = this.ID18.charAt(16) % 2;
        return Sex;
    }
    // 返回15位身份证号码
    clsIDCard.prototype.Get15 = function() {
        var ID15 = '';
        if (this.Valid)
            ID15 = this.ID15;
        return ID15;
    }
    // 返回18位身份证号码
    clsIDCard.prototype.Get18 = function() {
        var ID18 = '';
        if (this.Valid)
            ID18 = this.ID18;
        return ID18;
    }
    // 返回所在省，例如：上海市、浙江省
    clsIDCard.prototype.GetLocal = function() {
        var Local = '';
        if (this.Valid)
            Local = this.Local;
        return Local;
    }

    clsIDCard.prototype.GetVCode = function(CardNo17) {
        var Wi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
        var Ai = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
        var cardNoSum = 0;
        for (var i = 0; i < CardNo17.length; i++)
            cardNoSum += CardNo17.charAt(i) * Wi[i];
        var seq = cardNoSum % 11;
        return Ai[seq];
    }

    clsIDCard.prototype.CheckValid = function(CardNo18) {
        if (this.GetVCode(CardNo18.substr(0, 17)) != CardNo18.charAt(17))
            return false;
        if (!this.IsDate(CardNo18.substr(6, 8)))
            return false;
        var aCity = {
            11 : "北京",
            12 : "天津",
            13 : "河北",
            14 : "山西",
            15 : "内蒙古",
            21 : "辽宁",
            22 : "吉林",
            23 : "黑龙江 ",
            31 : "上海",
            32 : "江苏",
            33 : "浙江",
            34 : "安徽",
            35 : "福建",
            36 : "江西",
            37 : "山东",
            41 : "河南",
            42 : "湖北 ",
            43 : "湖南",
            44 : "广东",
            45 : "广西",
            46 : "海南",
            50 : "重庆",
            51 : "四川",
            52 : "贵州",
            53 : "云南",
            54 : "西藏 ",
            61 : "陕西",
            62 : "甘肃",
            63 : "青海",
            64 : "宁夏",
            65 : "新疆",
            71 : "台湾",
            81 : "香港",
            82 : "澳门",
            91 : "国外"
        };
        if (aCity[parseInt(CardNo18.substr(0, 2))] == null)
            return false;
        this.ID18 = CardNo18;
        this.ID15 = CardNo18.substr(0, 6) + CardNo18.substr(8, 9);
        this.Local = aCity[parseInt(CardNo18.substr(0, 2))];
        return true;
    }

    clsIDCard.prototype.IsDate = function(strDate) {
        var r = strDate.match(/^(\d{1,4})(\d{1,2})(\d{1,2})$/);
        if (r == null)
            return false;
        var d = new Date(r[1], r[2] - 1, r[3]);
        return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[2] && d.getDate() == r[3]);
    }
    return clsIDCard;
});