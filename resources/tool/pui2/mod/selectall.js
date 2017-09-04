/*-----------------------------------------------------------------------------
* @Description:  表单全选组件,包含功能：全选、取消、反选、以及根据过滤条件选择
* @Version:     V3.0.0
* @author:      Nina(1284663246@qq.com)
* @date         2014.12.23
* ==NOTES:=============================================
* v3.0.0(2014.12.23):
*     初始生成 
* @param: 
* 	root : '.selectall', //根节点选择器
	select : 'input[value!="1"]', //选择器条件
	filter : '',                  //过滤器条件
	allTrigger : '.J_allClass',   //全选选择器
	cancelTrigger : '.J_removeClass', //取消选择器
	invertTrigger : '.J_invertClass', //反选
	toggleTrigger: '.J_toggleClass'   //切换
	
  Event(提供相应操作事件)：
  'selectAll': 全选
  'unSelectAll': 取消
  'invert': 反选
  'selected': 选择
  'unselected': 取消选择
* ---------------------------------------------------------------------------*/
KISSY.add('mod/selectall', function(S, Core){
	var 
        DOM = S.DOM, query = DOM.query, get = DOM.get, $ = S.all, $j = jQuery,
        SELECT_FILTER = 'data-select-filter',
        SELECT_TYPE = 'data-select-type',
        ALL_EL = 'data-all',
        CANCEL_EL = 'data-cancel',
        INVERT_EL = 'data-invert',
        TOGGLE_EL = 'data-toggle',
        SELECT_KEY = 'selectall',
        el = {
        	root: '.selectAll'
        };
	var
		Selectall = {
			client: function(param){
				var
					root = get(el.root),
					opts = {
						root : el.root,
						// filter: DOM.attr(el.root, SELECT_FILTER),
			            select : DOM.attr(el.root, SELECT_TYPE),
			            allTrigger : '#' + DOM.attr(el.root, ALL_EL),
			            cancelTrigger : '#' + DOM.attr(el.root, CANCEL_EL),
			            invertTrigger : '#' + DOM.attr(el.root, INVERT_EL),
			            toggleTrigger: '#' + DOM.attr(el.root, TOGGLE_EL)
					};
				S.mix(opts, param, true, undefined, true);
				return new Core(opts);
			},
			refresh: function(){
				var
					selectRoot = get(el.root);
				DOM.data(selectRoot, SELECT_KEY, this.client());
			}
		};
	S.ready(function(){
		Selectall.refresh();
	});
	PW.namespace('mod.Selectall');
	PW.mod.Selectall = Selectall;
	return Selectall;
},{
	requires: ['selectall/core']
});
KISSY.add('selectall/core', function(S){
	var 
        DOM = S.DOM, query = DOM.query, get = DOM.get, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = Event.detach,
        CONFIG = {
            root : '',
            select : '',
            filter : '',
            allTrigger : '.pw-select-all',
            cancelTrigger : '.pw-cancel-all',
            invertTrigger : '.pw-invert',
            toggleTrigger: '.pw-toggle'
        },
        el = {
        	root: '.selectAll'
        };
	var
		Core = function(param){

			var that = this;
			this.status = true;
        	this.opts = S.merge(CONFIG, param);
        	this.rootDOM = get(this.opts.root); 
        	this.checkboxs;
        	this.init();
		}
	S.augment(Core, S.EventTarget);
	S.augment(Core, {
		init: function(){
			this._getAllSelect();
			this._buildEvt();
		},
		/**
		 * 启用组件
		 * @return {[type]} [description]
		 */
		enabled: function(){
			if(!this.status){
				this.status = true;
				this._buildEvt();
			}
		},
		/**
		 * 禁用组件
		 * @return {[type]} [description]
		 */
		_disAbled: function(){
			if(this.status){
				this.status = false;
				this._unBuildEvt();
			}
		},
		_buildEvt: function(){
			var
				that = this,
				opts = that.opts,
				allTrigger = opts.allTrigger,
				cancelTrigger = opts.cancelTrigger,
				invertTrigger = opts.invertTrigger,
				toggleTrigger = opts.toggleTrigger,
				selectTrigger =  opts.select;

			on(selectTrigger, 'click', that._ifSelectAll, that);
			on(allTrigger, 'click',that._selectAllHandler, that);
			on(cancelTrigger, 'click', that._cancelHandler, that);
			on(invertTrigger, 'click', that._invertHandler, that);
			on(toggleTrigger, 'click', that._toggleHanlder, that);
		},
		/**
		 * 解绑事件
		 * @return {[type]} [description]
		 */
		_unBuildEvt: function(){
			var
				that = this,
				opts = that.opts,
				allTrigger = opts.allTrigger,
				cancelTrigger = opts.cancelTrigger,
				invertTrigger = opts.invertTrigger,
				toggleTrigger = opts.toggleTrigger,
				selectTrigger =  opts.select;

			detach(allTrigger, 'click');
			detach(cancelTrigger, 'click');
			detach(invertTrigger, 'click');
			detach(toggleTrigger, 'click');
			detach(selectTrigger, 'click');
		},
		_ifSelectAll: function(){
			var
				that = this,
				opts = that.opts,
				root = opts.root,
				toggleTrigger = opts.toggleTrigger,
				toggleTriggerEl = get(toggleTrigger, root),
				selectTrigger =  opts.select,
				checkboxs = that._getAllSelect(),
				length = checkboxs.length,
				selected = 0;
			S.each(checkboxs, function(item){
				if(item.checked){
					selected ++;
				}else{
					selected --;
				}
				if(selected == length){
					DOM.prop(toggleTriggerEl, 'checked', true);
				}else{
					DOM.prop(toggleTriggerEl, 'checked', false);
				}
			});
		},
		/**
		 * 全选操作
		 * @return {[type]} [description]
		 */
		_selectAllHandler: function(){
			var
				that = this,
				// checkboxs = that.checkboxs;
				// by: cuiy2015.5.22:原checkboxs为空
				checkboxs = that._getAllSelect();
			DOM.prop(checkboxs, 'checked', true);
			that.fire('selectAll',{select:that});
		},
		/**
		 * 取消全选
		 * @return {[type]} [description]
		 */
		_cancelHandler: function(){
			var
				that = this,
				checkboxs = that.checkboxs;
			DOM.prop(checkboxs, 'checked', false);
			that.fire('unSelectAll',{select:that});
		},
		/**
		 * 反选
		 * [_invertHandler description]
		 * @return {[type]} [description]
		 */
		_invertHandler: function(){
			var
				that = this,
				checkboxs = that.checkboxs;
			S.each(checkboxs, function(o){
				if(o.checked){
					that._unselectCheckbox(o)
				}else{
					that._selectCheckbox(o);
				}
			});
			that.fire('invert',{select:that});
		},
		/**
		 * [_toggleHanlder description]
		 * @return {[type]} [description]
		 */
		_toggleHanlder: function(e){
			var
				that = this,
				toggleEl = e.target,
				checkboxs = that.checkboxs;
			if(toggleEl.checked){
				that._selectCheckbox(checkboxs);
				that.fire('selected',{select:that});
			}else{
				that._unselectCheckbox(checkboxs);
				that.fire('unSelected',{select:that});
			}
		},
		_unselectCheckbox: function(o){
			DOM.prop(o, 'checked', false);
		},
		_selectCheckbox: function(o){
			DOM.prop(o, 'checked', true);
		},
		/**
		 * 获取所有checkbox节点
		 * @return {[type]} [description]
		 */
		_getAllSelect: function(){
			//获取符合要求的checkbox
            var that = this, tmpArr = $j(that.opts.select, that.rootDOM);
            
            //获取过滤掉的checkbox
            that._getIllegalCheckboxs();
            //筛选
            that.checkboxs = S.filter(tmpArr, that._filter, that);
            return that.checkboxs;
		},
		/**
         * 获取所有过滤掉的checkbox
         */
        _getIllegalCheckboxs : function() {
            var 
            	that = this,
            	opts = that.opts,
            	filter = $j(opts.filter, that.rootDOM);
            that.illegalCheckbox = [];
            S.each(filter, function(o) {
                if (o.nodeName.toLowerCase() == 'input' && DOM.prop(o, 'type') == 'checkbox') {
                    that.illegalCheckbox.push(o);
                } else {
                    var cld = query(opts.select, o);
                    if (cld.length > 0) {
                        S.each(cld,function(o){
                            that.illegalCheckbox.push(o);
                        });
                    }
                }
            })
        },
		/**
		 * 过滤函数
		 * @param  {[type]} o [description]
		 * @return {[type]}   [description]
		 */
		_filter : function(o) {
            var that = this, illegalCheckbox = that.illegalCheckbox, flag = true;
            if (o.nodeName.toLowerCase() == 'input' && DOM.prop(o, 'type') == 'checkbox') {
                 for(var i = 0; i < illegalCheckbox.length; i++){
                     var eo = illegalCheckbox[i];
                     if (eo == o) {
                        flag = false;
                        break;
                    }
                 }
                 return flag;
            }
        }
	});
	return Core;     
},{
	requires: ['core', 'thirdparty/jquery']
});