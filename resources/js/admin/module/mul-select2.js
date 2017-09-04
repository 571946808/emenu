/*-----------------------------------------------------------------------------
* @Description:     多选组件
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.10.16
* ==NOTES:=============================================
* v1.0.0(2015.10.16):
* 这个组件是在mul-select.js组件的基础上简化出来的，无需进行很多操作，个人认为以后的
* 开发中，可能用这个比较多一些
* ---------------------------------------------------------------------------*/
KISSY.add('module/mul-select2', function(S, Core){
	PW.namespace('module.MulSelect2');
	PW.module.MulSelect2 = {
		client: function(param){
			return new Core(param);
		}
	};
},{
	requires: [
		'mul-select2/core'
	]
});
KISSY.add('mul-select2/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all, $j = jQuery,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach, undelegate = S.Event.undelegate,
		Dialog = PW.widget.Dialog,
		Juicer = PW.mod.Juicer.client,
		MulSelectIO = PW.io.Module.MulSelect,
		config = {
			 // 表单
			form: '',
			 // 模板
			temp: '',
			 // 宽度
			width: 600,
			 // 高度
			height: 300,
			 // 自动产生滚动条
			hasAutoScroll: true
		},
		el = {};

	function Core(param){
		this.opts = S.merge(config, param);
		S.mix(this.opts.settings, {
			width: this.opts.width,
			height: this.opts.height,
			hasAutoScroll: this.opts.hasAutoScroll
		});
		this.form = this.opts.form;
		this.render = this.opts.itemsRender;
		this._init();
	}

	S.augment(Core, S.EventTarget, {
		_init: function(){
			this.getDialogHtml();
			this._filterItems();
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				form = that.form,
				render = that.render;

			delegate(render, 'submit', form, function(){
				that._searchTip('正在搜索，请稍后……');
				that._searchItems();
				return false;
			});
			// “备选栏”中，每条选项中的输入框失去焦点时的操作
			delegate(render, 'focusout', 'input[type="text"]', function(e){
				if(that.checkForm(e.target) && DOM.hasClass(e.target, 'error-field')){
					that._updateStatus('focus', e.target);
				}
			});
			// “备选栏”中，每条选项中的输入框焦点时的操作
			delegate(render, 'keyup', 'input[type="text"]', function(e){
				that.checkForm(e.target);
				
			});
		},
        /**
		 * 检查“备选栏”中，输入框的内容
		 * @param  {[type]} input [description]
		 * @return {[type]}       [description]
		 */
		checkForm: function(input){
			var
				that = this,
				form = that.form,
				value;
			if((typeof input) != 'string'){
				value = DOM.val(input);
			}else{
				value = input;
			}
			if(value == 0 || value == '' || !/^[-]?[0-9]*\.?[0-9]+$/.test(value) || value.length == 0){
				that._updateStatus('error', input);
				return false;
			}else{
				that._updateStatus('success', input);
				return true;
			} 
		},
		/**
		 * 更新“备选栏”中输入框的状态
		 * @param  {[type]} status [description]
		 * @param  {[type]} field  [description]
		 * @return {[type]}        [description]
		 */
		_updateStatus: function(status, field){
			var
				that = this;

			switch(status){
				case 'success':
					DOM.removeClass(field, 'error-field');
					DOM.addClass(field, 'success-field');
					break;
				case 'error':
					DOM.removeClass(field, 'success-field');
					DOM.addClass(field, 'error-field');
					break;
				default:
					DOM.removeClass(field, 'success-field');
					DOM.removeClass(field, 'error-field');
			}
		},
		getDialogHtml: function(){
			var
				that = this,
				settings = that.opts.settings,
				mutSelectHtml = that._createHtml();

			Dialog.alert(mutSelectHtml, function(){}, settings);
		},
		/**
		 * 在“备选栏”中，去除那些在菜品编辑页面中已经选过的项，只保留没有选中的项
		 * @return {[type]} [description]
		 */
		_filterItems: function(){
			var
				that = this,
				beforeItems = query('tr', that.render),
				attr = that.opts.attr,
				tags = that.opts.tags,
				editTemp = that.opts.editRender;

			S.each(beforeItems, function(item){
				S.each(tags, function(tag){
					if(DOM.attr(item, attr) === tag.id){
						var	
							editStr = Juicer(editTemp, {
								data: tag
							}),
							editEl = DOM.create(editStr);
						DOM.insertAfter(editEl, item);
						DOM.remove(item);
					}
				});
			});
		},
		/**
		 * 搜索相关项
		 * @return {[type]} [description]
		 */
		_searchItems: function(){
			var
				that = this,
				data = DOM.serialize(that.form);

			MulSelectIO.mulSelectSearch(data, function(rs, data, errMsg){
				if(rs){
					that._renderSearchResult(data);
				}else{
                    that._searchTip();
				}
			});
		},
		/**
		 * 渲染“备选栏”中，搜索到的结果，
		 * 如果结果项在“已选栏”中已选，则对搜索结果进行过滤
		 * @param  {[type]} items [description]
		 * @return {[type]}       [description]
		 */
		_renderSearchResult: function(items){
			var
				that = this,
				data = [],
				searchStr = '',
				item,
				i, j, 
				searchTemp = that.opts.searchRender;

			$(that.render).html('');
			for(j = 0; j < items.length; j ++){
				i = 0;
				item = items[j];
				for(var prop in item){
					data[i ++] = item[prop];
				}
				searchStr += Juicer(searchTemp, {
					data: data
				});
			}
			if(searchStr === ''){
				that._searchTip();
				that.beforeItems = 0;
			}
			$(that.render).html(searchStr);
		},
		/**
		 * 在“备选栏”中的搜索结果提示
		 * @return {[type]} [description]
		 */
		_searchTip: function(string){
			var
				that = this,
				thead = get('thead', that.form),
				tr = get('tr', thead),
				tds = query('td', tr),
				cols,
				loadTip = '',
                tip = '';
           
            if(!string){
                tip = '暂无内容！';
            }else{
                tip = string;
            }
			cols = tds.length;
			loadTip = '<td class="text-center padding-top-15 padding-bottom-15" colspan="' + cols + '">' + tip + '</td>';
			$(that.render).html(loadTip);
		},
		/**
		 * 在选择中，动态改变“备选栏”中的搜索结果提示
		 * @return {[type]} [description]
		 */
		_selectTip: function(){
			var
				that = this,
				tipEl;
			if(that.beforeItems == 0){
				that._searchTip();
			}else{
				tipEl = get('td[colspan]', that.render);
				if(!tipEl){
					return false;
				}else{
					DOM.remove(tipEl);
				}
			}
		},
		_createHtml: function(){
			var
				that = this,
				temp = that.opts.temp,
				data = that.opts.data,
				html = Juicer(temp, {
					list: data
				});
			return html;
		}
	});

	return Core;
},{
	requires: [
		'widget/dialog',
		'mod/juicer',
		'pio/module/mul-select'
	]
});