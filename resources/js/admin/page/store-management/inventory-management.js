/*-----------------------------------------------------------------------------
* @Description:     库存管理--库存盘点
* @Version:         1.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2015.11.20
* ==NOTES:=============================================
* v1.0.0(2015.11.20):
     初始生成

* ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/inventory-management', function(S,Core){
    PW.namespace('page.StoreManagement.InventoryManagement');
    PW.page.StoreManagement.InventoryManagement = function(param){
        new Core(param);
    }
}, {
    requires: [
        'inventory-management/manage'
    ]
});
/*---------------------------------------------------------------------------*/
KISSY.add('inventory-management/manage', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, 
        Pagination = PW.mod.Pagination,
        Calendar = PW.mod.Calendar,
        SelectAll = PW.mod.Selectall,
        Dialog = PW.widget.Dialog,
        StoreinventoryManagementIO = PW.io.StoreManagement.InventoryManagement,
        config = {},
        el = {
            //日期input
            date: '.J_date',
            //搜索触发器
            searchTrigger: '.J_search',
            //搜索表单
            searchForm: '.operForm',
            //导出触发器
            exportTrigger: '.J_export',
            //盘点触发器
            inventoryTrigger: '.J_inventory',
            //开始时间
            startTimeEl: '.J_startTime',
            //结束时间
            endTimeEl: '.J_endTime',
            //提示信息
            MsgAlert : ".J_msg",
             //全选触发器
            selectAllTrigger: ".J_selectAll",
            //分类选项
            checkboxEl: ".J_selectType",
            //select渲染上来的元素
            textEl: '.J_text',
            //渲染搜索div
            renderToEl: '.J_renderTo',
            //存放keywordInp
            ingredientInpEl: '.J_ingredientInp'
        };

    function Core(param){
        this.opts = S.merge(config, param);
        this.pagination;
        this._init();
        this._MsgClear();
        this._searchSelect();
        this.selectAll = SelectAll.client({
            root: el.searchForm,
            select: el.checkboxEl,
            toggleTrigger: el.selectAllTrigger
        });
    }

    S.augment(Core, {
        _init: function(){
            this._initPagi();
            this._bulidEvt();
        },
        /**
         * 初始化分页
         * @private
         */
        _initPagi: function(){
            var 
                that = this,
                startTime = DOM.val(el.startTimeEl),
                endTime = DOM.val(el.endTimeEl);

            S.mix(that.opts,{
                extraParam: {
                    startTime: startTime,
                    endTime: endTime,
                    keyWord: '',
                    tagIds: ''
                }
            });
            that.pagination = Pagination.client(that.opts);
        },
        /**
         * 清除提示信息
         * @return {[type]} [description]
         */
        _MsgClear: function(){
            var 
                that = this,
                msg = S.one(el.MsgAlert);
            if(msg){
                window.setTimeout(function(){
                    $(el.MsgAlert).remove();
                }, 2000);
            }
        },
        _bulidEvt: function(){
            var that = this;
            S.each(query(el.date), function(i){
                Calendar.client({
                    renderTo: i,
                    select: {
                        rangeSelect: false,
                        dateFmt: 'YYYY-MM-DD',
                        showTime: false
                    }
                })
            });

            $(el.searchTrigger).on('click', function(){
                that._reloadPagi();
            });
            //导出
            $(el.exportTrigger).on('click', function(){
                that._exportExcel();
            });
            //点击库存盘点
            $(el.inventoryTrigger).on('click', function(e){
                that._inventory(e.target);
            });
        },
        /**
         * 刷新分页
         * @return {[type]} [description]
         */
        _reloadPagi: function(){
            var 
                that = this,
                data = DOM.serialize(el.searchForm),
                opts = S.mix(that.opts, {
                    extraParam: data
                });
            that.pagination.reload(opts);
        },
        /**
         * 导出Excel
         * @return {[type]} [description]
         */
        _exportExcel: function(){
            var
                that = this,
                href = DOM.attr(el.exportTrigger, 'href').split('?')[0],
                extraParam = S.IO.serialize(el.searchForm),
                newHref = href + '?'+ extraParam;
            DOM.attr(el.exportTrigger, 'href', newHref);
        },
        /**
         * 库存盘点成功刷新分页
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _inventory: function(e){
            var 
                that = this;
            
            Dialog.confirm('确定进行库存盘点吗？', function(){
                StoreinventoryManagementIO.inventory({}, function(rs, errMsg){
                    if(rs){
                        Dialog.alert('盘点成功！');
                        that.pagination.reload(that.opts);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
       
        /**
         * 模糊匹配插件的引用
         * @return {[type]} [description]
         */
        _searchSelect: function(){
            var
                that = this;

            that.searchSelect = PW.module.SearchSelect.client({
                selectPicker: '.selectpicker',
                liveSearch: true,
                root: '#basic',
                multiple: false,
                inDlg: true,
                urlCoreParam: 'getIngredient' 
            });
            that.searchSelect.on('selectAfter', function(e){
                var
                    renderToEl = DOM.get(el.renderToEl),
                    text = DOM.attr(renderToEl, 'data-result-name'),
                    startWord = text.indexOf(']') + 1,       
                    keyVulue = text.slice(startWord, text.length);

                DOM.val(el.ingredientInpEl, S.trim(keyVulue)); 
            });
        }          
    });
    return Core;
}, {
    requires:[
        'mod/calendar',
        'mod/pagination',
        'mod/selectall',
        'pio/store-management/store-inventory-management',
        'widget/dialog',
        'module/search-select'
    ]
});
