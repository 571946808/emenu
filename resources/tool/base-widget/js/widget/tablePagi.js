/*-----------------------------------------------------------------------------
* @Description:     管理员-表格排序分页
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.11
* ==NOTES:=============================================
* v1.0.0(2015.9.11):
     初始生成
  v1.0.1(2016.01.04)
  修复排序时没有表单参与时的bug
* ---------------------------------------------------------------------------*/

KISSY.add('widget/tablePagi', function(S, Core){
	PW.namespace('widget.TablePagi');
	PW.widget.TablePagi = {
		client: function(param){
			return new Core(param);
		}
	}
},{
	requires: [
		'tablePagi/core'
	]
});

KISSY.add('tablePagi/core', function(S){
	var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, 
        Pagination = PW.mod.Pagination,
        Juicer = PW.mod.Juicer,
        // Dialog = PW.widget.Dialog,
        config = {
        	pagi: {
        		renderTo: '',
        		renderTo: '',
				juicerRender: '',
				dataRender: '',
				url: '',
				pageSize: 10
        	},
        	formSet: {
        		hasForm: false,
        		formRender: ''
        	}
        },
        el = {
        	// 搜索表单
        	searchForm: '.J_searchForm',
        	// 操作表单
        	operForm: '.J_operForm',
        	// 排序
        	orderEl: '.order'
        },
        DATA_ORDER_KEY = 'data-order-key',
        ORDER = {
        	ASC: 1,
        	DESC: 0
        },
        PAGINATION_REORDER_ASC = 'pagination-reorder-asc',
        PAGINATION_REORDER_DESC = 'pagination-reorder-desc',
        PAGINATION_REORDER_DEFAULT = 'pagination-reorder';
        
    function Core(param){
    	this.opts = S.merge(config, param);
    	this.tablePagi;
    	this._init();
    }
    S.augment(Core, {
        /**
         * 对外接口，表格内重刷分页
         * @return {[type]} [description]
         */
        reloadPagi: function(){
            var
                that = this,
                formSet = that.opts.formSet,
                extraParam,
                pagi = that.opts.pagi;
            if(formSet.hasForm){
                extraParam = DOM.serialize(formSet.formRender);
                S.mix(pagi, {
                    extraParam: extraParam
                });
            }
            that._resetOrderClass();
            that.tablePagi.reload(pagi);
            return false;
        },
    	_init: function(){
    		this._pagination();
    		this._bulidEvt();
    	},
    	_bulidEvt: function(){
    		var
    			that = this,
    			ths = query(el.orderEl, el.operForm);
    		on(el.searchForm, 'submit', function(){
    			that.reloadPagi();
    			return false;
    		});
    		on(ths, 'click', function(e){
    			that._reorder(e.target);
    		});
    	},
    	_reorder: function(e){
    		var
    			that = this,
    			key = DOM.attr(e, DATA_ORDER_KEY);
    		if(DOM.hasClass(e, PAGINATION_REORDER_DEFAULT)){
    			that._resetOrderClass();
    			that._orderByAsc(e, PAGINATION_REORDER_ASC, key, ORDER.ASC);
    		}else if(DOM.hasClass(e, PAGINATION_REORDER_DESC)){
    			that._resetOrderClass();
    			that._orderByAsc(e, PAGINATION_REORDER_ASC, key, ORDER.ASC);
    		}else if(DOM.hasClass(e, PAGINATION_REORDER_ASC)){
    			that._resetOrderClass();
    			that._orderByDesc(e, PAGINATION_REORDER_DESC, key, ORDER.DESC);
    		}
    	},
    	_resetOrderClass: function(){
    		var
    			that = this,
    			ths = query(el.orderEl, el.operForm);
    		DOM.removeClass(ths, PAGINATION_REORDER_ASC);
    		DOM.removeClass(ths, PAGINATION_REORDER_DESC);
    		DOM.removeClass(ths, PAGINATION_REORDER_DEFAULT);	
    		DOM.addClass(ths, PAGINATION_REORDER_DEFAULT);
    	},
        _tableOrder: function(e, key, order, orderClass){
            var
                that = this,
                pagi = that.opts.pagi,
                formSet = that.opts.formSet,
                extraParam;
            if(formSet.hasForm){
                extraParam = DOM.serialize(formSet.formRender);
                S.mix(extraParam, {
                    orderBy: key,
                    orderType: order
                });
                S.mix(pagi, {
                    extraParam: extraParam
                });
            }else{
				S.mix(pagi, {
					extraParam:{
						orderBy: key,
						orderType: order
					}
				});
			}
            that.tablePagi.reload(pagi);
        },
    	_orderByDesc: function(e, orderClass, key, order){
    		var
    			that = this;
            that._orderClass(e, orderClass);
            that._tableOrder(e, key, order, orderClass);
    	},
    	_orderByAsc: function(e, orderClass, key, order){
    		var
    			that = this;
            that._orderClass(e, orderClass);
            that._tableOrder(e, key, order, orderClass);
    	},
    	_orderClass: function(e, orderClass){
    		var
    			that = this;
    		DOM.addClass(e, orderClass);
    		DOM.removeClass(e, PAGINATION_REORDER_DEFAULT);
    	},
        
    	_pagination: function(){
    		var
    			that = this,
    			pagi = that.opts.pagi,
    			formSet = that.opts.formSet,
    			extraParam;
    		if(formSet.hasForm){
    			extraParam = DOM.serialize(formSet.formRender);
    			S.mix(pagi, {
    				extraParam: extraParam
    			});
    		}
    		that.tablePagi = Pagination.client(pagi);
    	}
    });
    return Core;
},{
	requires: [
		'mod/pagination',
		'mod/juicer'
	]
});