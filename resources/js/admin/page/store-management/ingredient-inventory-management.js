/*-----------------------------------------------------------------------------
* @Description:     库存管理--原配料盘点
* @Version:         2.0.0
* @author:          jiangx(631724595@qq.com)
* @date             2016.6.20
* ==NOTES:=============================================
* v1.0.0(2016.6.20):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/ingredient-inventory-management', function(S,Core){
    PW.namespace('page.StoreManagement.IngredientInventoryManagement');
    PW.page.StoreManagement.IngredientInventoryManagement = function(param){
        new Core(param);
    }
}, {
    requires: [
        'ingredient-inventory-management/manage'
    ]
});
/*---------------------------------------------------------------------------*/
KISSY.add('ingredient-inventory-management/manage', function(S){
    var
        DOM = S.DOM, query = DOM.query, $ = S.all,
        on = S.Event.on, 
        Pagination = PW.mod.Pagination,
        Calendar = PW.mod.Calendar,
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
            //提示信息
            MsgAlert : ".J_msg"
        };

        function Core(param){
            this.opts = S.merge(config, param);
            this.pagination;
            this._init();
            this._MsgClear();
        }

        S.augment(Core, {
            _init: function(){
                this._initPagi();
                this._bulidEvt();
            },
            _initPagi: function(){
                var that = this,
                opts = that.opts;
                that.pagination = Pagination.client(opts);
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

                $(el.exportTrigger).on('click', function(){
                    that._exportExcel();
                })
            },
            /**
             * 刷新分页
             * @return {[type]} [description]
             */
            _reloadPagi: function(){
                var that = this;
                    data = DOM.serialize(el.searchForm),
                    opts = S.mix(that.opts, {extraParam:data});
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
            }
        });
    return Core;
}, {
    requires:[
        'mod/calendar',
        'mod/pagination'
    ]
});