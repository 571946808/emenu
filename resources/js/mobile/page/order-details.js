/*----------------------------------------------------------------------
 * @Description:     菜品分类点餐--图片版
 * @Version:         1.0.0
 * @author:          daiql(1649500603@qq.com)
 * @date             2016.01.27
 * ==NOTES:=============================================
 * v1.0.0(2016.01.27):
 初始生成
 * ---------------------------------------------------------------------*/
 KISSY.add('page/order-details', function(S, Core){
 	PW.namespace('page.OrderDetails');
 	PW.page.OrderDetails = function(param){
 		new Core();
 	}
 }, {
 	requires: [
 		'details/core'
 	]
 });
 /*---------------------------------------------------------------------*/
 KISSY.add('details/core', function(S){
 	var
 		DOM = S.DOM, get = DOM.get, query = DOM.query,
 		on = S.Event.on, delegate = S.Event.delegate,
 		Carousel = PW.mod.Carousel,
 		Ellipsis = PW.mod.Ellipsis,
 		config = {},
 		el = {
 			//轮播节点元素
 			carouselEl: '#carousel',
 			//轮播指示器元素
 			indicatorsEl: '.carousel-indicators',
 			//菜品简介元素
 			introEl: '.J_intro',
 			//提交表单
 			submitForm: '.J_form',
 			//上菜方式、口味元素
 			typeEl: '.J_type',
 			//减少触发器
 			minusTrigger: '.J_minus',
 			//增加触发器
 			plusTrigger: '.J_plus',
 			//备注元素
 			remarksEl: '.J_remarks',
 			//提交触发器
 			submitTrigger: '.J_submit'
 		},
 		DATA_TYPE = 'data-type';

 	function Core(param){
 		this.opts = S.merge(config , param);
 		this.introAbbrStatus = true;
 		this._init();
 	}

 	S.augment(Core, {
 		_init: function(){
 			this._setDefaultIndicator();
 			this._initCarousel();
 			this._addEventListener();
 		},
 		/**
 		 * 设置轮播默认指示器
 		 */
 		_setDefaultIndicator: function(){
 			var
 				that = this,
 				activeEl = DOM.first(el.indicatorsEl);

 			DOM.addClass(activeEl, 'active');
 		},
 		/**
 		 * 初始化轮播
 		 * @return {[type]} [description]
 		 */
 		_initCarousel: function(){
 			var
 				that = this;
 				
 			that.carousel = Carousel.client({
 				renderTo: el.carouselEl,
 				interval: 10000
 			});
 		},
 		/**
 		 * 添加事件监听
 		 */
 		_addEventListener: function(){
 			var
 				that = this,
 				opts = that.opts,
 				typeEls = query('span', el.typeEl),
 				remarkLabels = query('span', el.remarksEl);

 			on(el.introEl, 'click', function(e){
 				if(that.introAbbrStatus == true){
 					Ellipsis.remove(e.target);
 					that.introAbbrStatus = false;
 				}else{
 					Ellipsis.refresh(e.target);
 					that.introAbbrStatus = true;
 				}
 			});

 			S.each(typeEls, function(elem){
	 			on(elem, 'click', function(e){
	 				that._setType(e.currentTarget);
	 			});
 			});

 			on(el.minusTrigger, 'click', function(e){
 				that._decNum(e.currentTarget);
 			});

 			on(el.plusTrigger, 'click', function(e){
 				that._incNum(e.currentTarget);
 			});

 			S.each(remarkLabels, function(elem){
 				on(elem, 'click', function(e){
 					that._setRemarksLabel(e.target);
 				});
 			});

 			on(el.submitTrigger, 'click', function(e){
 				that._submit(e.target);
 			});
 		},
 		/**
 		 * 设置上菜方式或口味
 		 * @param {[type]} ev [description]
 		 */
 		_setType: function(clickTarget){
 			var
 				that = this,
 				sibling = DOM.siblings(clickTarget),
 				dataType = DOM.attr(clickTarget, DATA_TYPE),
 				input = DOM.prev(clickTarget, 'input');

 			if(!DOM.hasClass(clickTarget, 'selected')){
 				DOM.addClass(clickTarget, 'selected');
 				DOM.removeClass(sibling, 'selected');
 				DOM.attr(input, 'value', dataType);
 			}else{
 				DOM.removeClass(clickTarget, 'selected');
 				DOM.attr(input, 'value', '');
 			}
 		},
 		/**
 		 * 减少菜品数量
 		 * @param  {[type]} clickTarget [description]
 		 * @return {[type]}             [description]
 		 */
 		_decNum: function(clickTarget){
 			var
 				that = this,
 				input = DOM.next(clickTarget),
 				value = DOM.val(input);

 			if(value > 1){
 				value --;
 				DOM.val(input, value);
 			}
 		},
 		/**
 		 * 增加菜品数量
 		 * @param  {[type]} clickTarget [description]
 		 * @return {[type]}             [description]
 		 */
 		_incNum: function(clickTarget){
 			var
 				that = this;
 				input = DOM.prev(clickTarget),
 				value = DOM.val(input);

 			value ++;
 			DOM.val(input, value);
 		},
 		/**
 		 * 设置备注标签
 		 * @param {[type]} ev [description]
 		 */
 		_setRemarksLabel: function(ev){
 			var
 				that = this,
 				remarkLabel = DOM.text(ev),
 				pos,
 				onlyFirst,
 				input = DOM.prev(ev, 'input'),
 				value = DOM.val(input);

 			DOM.toggleClass(ev, 'selected');

 			if(DOM.hasClass(ev, 'selected')){
 				if(value == ''){
 					value = remarkLabel;
 				}else{
	 				value = value + ',' + remarkLabel;
	 			}				
 			}else{
 				pos = value.indexOf(',' + remarkLabel);//判断是否为第一个label
 				if(pos == -1){//若是
 					onlyFirst = value.indexOf(remarkLabel + ',');//判断是否仅有一个label
 					if(onlyFirst == -1){//若是
 						value = value.replace(remarkLabel, "");
 					}else{//否则，需将其后的逗号一并去掉
 						value = value.replace(remarkLabel + ',', "");
 					}
 				}else{
 					value = value.replace(',' + remarkLabel, "");
 				}
 			}
 			DOM.val(input, value);
 		},
 		_submit: function(e){
 			var
 				that = this,
 				textarea = DOM.prev(e, 'textarea'),
 				input = DOM.prev(e, 'input'),
 				textareaValue = DOM.val(textarea),
 				inputValue = DOM.val(input),
 				form = get(el.submitForm);

 			if(inputValue){
	 			if(textareaValue == ''){
	 				textareaValue = inputValue;
	 			}else{
	 				textareaValue = textareaValue + ',' + inputValue;
	 			}
 			}
 			DOM.val(textarea, textareaValue);
 			form.submit();
 		}
 	});

 	return Core;
 }, {
 	requires: [
 		'mod/carousel',
 		'module/iscroll',
 		'mod/ellipsis'
 	]
 });