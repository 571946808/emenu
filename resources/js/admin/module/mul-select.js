/*-----------------------------------------------------------------------------
* @Description:     多选组件
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.29
* ==NOTES:=============================================
* v1.0.0(2015.9.29):
* 1. 实现返回渲染串
* ---------------------------------------------------------------------------*/
KISSY.add('module/mul-select', function(S, Core){
	PW.namespace('module.MulSelect');
	var
		MulSelect = {
			client: function(param){
				return new Core(param);
			}
		};
	PW.module.MulSelect = MulSelect;
	return MulSelect;
},{
	requires: [
		'mulselect/core'
	]
});

KISSY.add('mulselect/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all, $j = jQuery,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach, undelegate = S.Event.undelegate,
		Dialog = PW.widget.Dialog,
		Juicer = PW.mod.Juicer.client,
		MulSelectIO = PW.io.Module.MulSelect,
		config = {
			// 备选标题
			beforeTitle: '',
			// 已选标题
			afterTitle: '',
			// 模板
			temp: '',
			// 已选模板
			afterTemp: '',
			// 数据
			data: null,
			// 表单
			form: '',
			// 选择触发器
			selectTrigger: '',
			// 对话框配置
			settings: undefined,
			// 是否有验证
			hasDefender: true,
			// 宽度
			width: 1000,
			// 高度
			height: 300,
			// 是否有滚动条
			hasAutoScroll: true
		},
		el = {};

	function Core(param){
		this.opts = S.merge(config, param);
		// 存取所有的备选项
		this.trs = [];
		// 存放在菜品管理编辑中已选的tag标签信息
		this.tags = [];
		// 存放在菜品管理编辑中已选的tag标签信息：id
		this.ids = [];
		// 存放“备选栏”中的项
		this.beforeItems;
		// 在“备选栏”中，填入数量的项的总数
		this.batchSelectItems = 0;
		S.mix(this.opts.settings, {
			width: this.opts.width,
			height: this.opts.height,
			hasAutoScroll: this.opts.hasAutoScroll
		});
		this._init();
	}	

	S.augment(Core, {
		_init: function(){
			this.getBeforeHtml();
			this._renderTags();
			this._filterBeforeItems();
			this._getBeforeItems();
			this._undelegate();
			this._bulidEvt();
			DOM.attr(this.opts.batchSelectTrigger, 'disabled', 'disabled');
		},
		/**
		 * 去除多余的绑定
		 * @return {[type]} [description]
		 */
		_undelegate: function(){
			var
				that = this;
			undelegate(document, 'click', that.opts.selectTrigger);
            undelegate(document, 'click', that.opts.cancelSelectTrigger);	
            undelegate(that.opts.beforeRender, 'focusout', 'input[type="text"]');	
            undelegate(that.opts.beforeRender, 'keyup', 'input[type="text"]');	
            undelegate(document, 'click', that.opts.batchSelectTrigger);
		},
		_bulidEvt: function(){
			var
				that = this,
				hasDefender = that.opts.hasDefender;
			// “已选栏”中的回退操作
			delegate(document, 'click', that.opts.cancelSelectTrigger, function(e){
				if(hasDefender){
					that._cancelSelectItem(e.target);
				}
			});
			// “备选栏”中的选择操作
			delegate(document, 'click', that.opts.selectTrigger, function(e){
				if(hasDefender){
					that._selectItem(e.target);
				}
			});
			// “备选栏”中，每条选项中的输入框失去焦点时的操作
			delegate(that.opts.beforeRender, 'focusout', 'input[type="text"]', function(e){
				if(DOM.val(e.target) == '' && DOM.hasClass(e.target, 'error-field')){
					that._updateStatus('focus', e.target);
				}
			});
			// “备选栏”中，每条选项中的输入框焦点时的操作
			delegate(that.opts.beforeRender, 'keyup', 'input[type="text"]', function(e){
				that._checkForm(e.target);
				that._updateBatchTrigger();
				
			});
			// “备选栏”中，批量选择批量添加
			delegate(document, 'click', that.opts.batchSelectTrigger, function(e){
				that._batchSelectItem();
			});
		},
		/**
		 * 更新“批量选择”触发器状态
		 * @return {[type]} [description]
		 */
		_updateBatchTrigger: function(){
			var
				that = this,
				inputEl,
				inputVal,
				batch = [];
			that._getBeforeItems();
			S.each(that.trs, function(tr){
				inputEl = get('input[type="text"]', tr);
				inputVal = DOM.val(inputEl);
				batch.push(inputVal);
			});
			for(var i = 0; i < batch.length; i ++){
				if(batch[i] != '' && that._checkForm(batch[i])){
					DOM.removeAttr(that.opts.batchSelectTrigger, 'disabled');break;
				}else{
					DOM.attr(that.opts.batchSelectTrigger, 'disabled', 'disabled');
				}
			}
		},
		/**
		 * 在“备选栏”中，筛选出有值的项，渲染到“已选栏”中
		 * @return {[type]} [description]
		 */
		_batchSelectItem: function(){
			var
				that = this,
				tds,
				inputEl,
				inputVal,
				data = {},
				batchSelectStr = '',
				batchSelectDOM,
				selectTrs;
			that._getBeforeItems();	
			S.each(that.trs, function(tr){
				inputEl = get('input[type="text"]', tr);
				inputVal = DOM.val(inputEl);
				tds = query('td', tr);
				id = DOM.attr(tr, that.opts.attr);
				if(that._checkForm(inputVal)){
					S.each(tds, function(td, i){
						if(i == 1){
							data[i] = inputVal;
						}else{
							data[i] = S.trim(DOM.text(td));
						}
					});
					S.mix(data, {
						id: id
					});
					batchSelectStr += Juicer(that.opts.afterTemp, {
						data: data
					});
					DOM.remove(tr);
				}
			});
			batchSelectDOM = DOM.create(batchSelectStr);
			DOM.append(batchSelectDOM, that.opts.afterRender);
		},
		/**
		 * 在“已选栏”中，渲染在菜品管理编辑页面中已经选过的项
		 * @return {[type]} [description]
		 */
		_renderTags: function(){
			var
				that = this,
				tagsDOM = DOM.create(that.opts.tagsTemp);
			DOM.append(tagsDOM, that.opts.afterRender);
		},
		/**
		 * 在“备选栏”中，去除那些在菜品编辑页面中已经选过的项，只保留没有选中的项
		 * @return {[type]} [description]
		 */
		_filterBeforeItems: function(){
			var
				that = this,
				trs = query('tr', that.opts.afterRender),
				ids = [],
				id,
				beforeItems = query('tr', that.opts.beforeRender);
			S.each(trs, function(tr){
				id = DOM.attr(tr, that.opts.attr);
				ids.push(id);
				that.tags.push(tr);
			});
			that.ids = ids;
			S.each(beforeItems, function(item){
				S.each(that.ids, function(id){
					if(DOM.attr(item, that.opts.attr) === id){
						DOM.remove(item);
					}
				});
			});
		},
		/**
		 * 获取所有的备选项
		 * @return {[type]} [description]
		 */
		_getBeforeItems: function(){
			var
				that = this,
				beforeTemp = that.opts.beforeRender,
				trs = query('tr', beforeTemp);
			that.trs = trs;
			that.beforeItems = trs.length;
		},
		/**
		 * 获取所有的项，并渲染在对话框中
		 * @return {[type]} [description]
		 */
		getBeforeHtml: function(){
			var
				that = this,
				mutSelectHtml = that._createHtml(),
				settings = that.opts.settings,
				form = that.opts.form;
			DOM.create(mutSelectHtml);
			// 我想变为表头可以固定不动的那种表格
			Dialog.alert(mutSelectHtml, function(){}, settings);
			on(form, 'submit', function(){
                that._searchTip('正在搜索，请稍后……');
				that._searchItem();
				return false;
			});
			return mutSelectHtml;
		},
		/**
		 * 快速搜索出符合条件的项
		 * @return {[type]} [description]
		 */
		_searchItem: function(){
			var
				that = this,
				data = DOM.serialize(that.opts.form);
			MulSelectIO.search(data, function(rs, data, errMsg){
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
				searchDOM,
				item,
				ids = that.ids,
				i, j, id;
			DOM.empty(that.opts.beforeRender);
			for(j = 0; j < items.length; j ++){
				i = 0;
				item = items[j];
				for(var prop in item){
					data[i ++] = item[prop];
				}
				
				if(ids.indexOf(String(data[0])) != -1 || ids.indexOf(data[0]) != -1){
					continue;
				}
				searchStr += Juicer(that.opts.searchRender, {
					data: data
				});
			}
			if(searchStr === ''){
				that._searchTip();
				// “备选栏”中项的总数
				that.beforeItems = 0;
			}
			searchDOM = DOM.create(searchStr);
			DOM.append(searchDOM, that.opts.beforeRender);
		},
		/**
		 * 在“备选栏”中的搜索结果提示
		 * @return {[type]} [description]
		 */
		_searchTip: function(string){
			var
				that = this,
				thead = get('thead', that.opts.form),
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
			$(that.opts.beforeRender).html(loadTip);
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
				tipEl = get('td[colspan]', that.opts.beforeRender);
				if(!tipEl){
					return false;
				}else{
					DOM.remove(tipEl);
				}
			}
		},
		/**
		 * 检查“备选栏”中，输入框的内容
		 * @param  {[type]} input [description]
		 * @return {[type]}       [description]
		 */
		_checkForm: function(input){
			var
				that = this,
				form = that.opts.form,
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
		/**
		 * 在“已选栏”中渲染从“备选栏”中选择过来的项，单个渲染
		 * @param  {[type]} id  [description]
		 * @param  {[type]} tds [description]
		 * @param  {[type]} tr  [description]
		 * @return {[type]}     [description]
		 */
		_renderSelectItem: function(id, tds, tr){
			var
				that = this,
				afterTemp = that.opts.afterTemp,
				data = {},
				inputEl,
				selectStr = '',
				selectDOM;
		
			S.each(tds, function(td, i){
				if(i == 1){
					inputEl = get('input[type="text"]', td);
					data[i] = DOM.val(inputEl);
				}else{
					data[i] = S.trim(DOM.text(td));
				}
			});
			S.mix(data, {
				id: id
			});
			selectStr = Juicer(afterTemp, {
				data: data
			});
			selectDOM = DOM.create(selectStr);
			DOM.append(selectDOM, that.opts.afterRender);
			DOM.remove(tr);
		},
		/**
		 * 在“备选栏”中，选择项，如果有错误，则进行提示并聚焦
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_selectItem: function(e){
			var
				that = this,
				tr = DOM.parent(e, 'tr'),
				numberInp = get('input[type="text"]', tr),
				tds = query('td', tr),
				id = DOM.attr(tr, that.opts.attr),
				trs = that.trs;
			
			// 如果通过验证
			if(that._checkForm(numberInp)){
				that.beforeItems --;
				that._selectTip();
				that._renderSelectItem(id, tds, tr);
			}else{
				// 我想换成警告框提示
				Dialog.alert(that.opts.tip, function(){
					inputEl = get('input', tr);
					inputEl.focus();
				});
			}
		},
		/**
		 * 在“已选栏”中，撤销选中的项，渲染回“备选栏”中
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_cancelSelectItem: function(e){
			var
				that = this,
				hasDefender = that.opts.hasDefender,
				tr = DOM.parent(e, 'tr'),
				id = DOM.attr(tr, that.opts.attr),
				resetTemp = that.opts.resetTemp,
				resetStr = '',
				resetDOM,
				inputVal,
				tds = query('td', tr),
				data = {};
			that.beforeItems ++;
			that._selectTip();
			S.each(tds, function(td, i){
				data[i] = S.trim(DOM.text(td));
			});
			S.mix(data, {
				id: id
			});
			resetStr = Juicer(resetTemp, {
				data: data
			});
			resetDOM = DOM.create(resetStr);
			DOM.append(resetDOM, that.opts.beforeRender);
			DOM.remove(tr);
		},
		/**
		 * 拼凑对话框内容
		 * @return {[type]} [description]
		 */
		_createHtml: function(){
			var
				that = this,
				temp = that.opts.temp,
				data = that.opts.data,
				mutSelectHtml = Juicer(temp, {
					beforeTitle: that.opts.beforeTitle,
					afterTitle: that.opts.afterTitle,
					list: data
				});
				
			return mutSelectHtml;
		}
	});

	return Core;
},{
	requires: [
		'mod/juicer',
		'widget/dialog',
		'pio/module/mul-select'
	]
});
