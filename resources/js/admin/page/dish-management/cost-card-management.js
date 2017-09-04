/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-菜品成本卡管理
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.5.13
 * ==NOTES:=============================================
 * v1.0.0(2016.5.13):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('page/dish-management/cost-card-management', function(S,Core){
    PW.namespace('page.DishManagement.CostCardManagement');
    PW.page.DishManagement.CostCardManagement =  function(param){
        new Core(param);
    };
 }, {
    requires:[
        'cost-card-mangement/core'
    ]
})
/* ---------------------------------------------------------------------------*/
KISSY.add('cost-card-mangement/core', function(S){
    var
        DOM = S.DOM,
        $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        Pagination = PW.mod.Pagination,
        Dialog = PW.widget.Dialog,
        SelectAll = PW.mod.Selectall,
        CostCardIO = PW.io.DishManagement.CostCardManagement,
        config={},
        el={
            //删除触发器
            delTrigger: ".J_del",
            //搜索表单
            searchForm: ".J_operForm",
            //分页渲染位置
            dataRender: "#J_template",
            //菜品分类checkbox(除去全选触发器)
            checkboxEl: ".J_bigTag",
            //全选触发器
            selectAllTrigger: ".J_selectAll"
        },
        tip = ['确定删除该菜品的成本卡？']
        DATA_COSTCARD_ID = 'data-costCard-id';

    function Core(param){
        this.opts = S.merge(config, param);
        this._init();
        this.pagination;
        this.selectAll = SelectAll.client({
            root: el.searchForm,
            select: el.checkboxEl,
            toggleTrigger: el.selectAllTrigger
        });
    }

    S.augment(Core, {
        _init: function(){
            this._buildEvt();
            this._noDataTip();
            this._initPagi();
        },
        _buildEvt: function(){
            var 
                that = this;
            //删除操作
            delegate(document, 'click', el.delTrigger, function(e){
                that._deleteCostCard(e.currentTarget);
            })
            //搜索操作
            $(el.searchForm).on('submit', function(){
                that.refreshPagi();
                return false;
            })
        },
        /**
         * "暂无数据"提示
         * @return {[type]} [description]
         */
        _noDataTip: function(){
            var 
                that = this,
                hasTr =S.one('tr',el.dataRender),
                tipStr = '<tr class="J_tip"><td>暂无数据<td></tr>';

            if(!hasTr){
                $(el.dataRender).append(tipStr);
            }else{
                $('.J_tip').remove();
            }
        },

        /**
         * 初始化分页
         * @return {[type]} [description]
         */
        _initPagi:function(){
            var 
                that = this;

            that.pagination = Pagination.client(that.opts); 
        },

        /**
         * 删除成本卡
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _deleteCostCard: function(e){
            var
                that = this,
                trEl = $(e).parent('tr');
                id = DOM.attr(trEl, DATA_COSTCARD_ID);

            Dialog.confirm(tip[0], function(rs){
                if(rs){
                    that._sendCardId(id);
                }
            })
        },

        /**
         * 删除时，ajax发送id
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        _sendCardId: function(id){
            var 
                that =this;

            CostCardIO.delCostCard({id: id},function(rs, errMsg){
                if(rs){
                    that.pagination.reload(that.opts);
                    that._noDataTip();
                }else{
                    Dialog.alert(errMsg);
                }
            })
        },

        /**
         * 搜索后刷新分页
         * @return {[type]} [description]
         */
        refreshPagi: function(){
            var
                that = this,
                data = DOM.serialize(el.searchForm),
                //搜索之后会修改that.opts,导致下次reload的是时候
                //刷新的出的内容还是与搜索有关，如果需要这个效果就用mix，
                //否则改为merge
                opts = S.mix(that.opts, {extraParam:data});

            that.pagination.reload(opts);
            that._noDataTip();
        }   
    })
    return Core;
},{
    requires:[
        'mod/pagination',
        'widget/dialog',
        'mod/selectall',
        'pio/dish-management/cost-card-management'
    ]
})