/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-套餐管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.12.12
 * ==NOTES:=============================================
 * v1.0.0(2015.12.12):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('page/dish-management/package-dish-management-list', function(S, List){
    PW.namespace('page.DishManagement.PackageDishList');
    PW.page.DishManagement.PackageDishList = function(param){
        new List(param);
    }
},{
    requires: [
        'dish-management/list'
    ]
});
/**
 * 菜品管理-菜品列表
 * @param  {[type]} S){	var                         DOM [description]
 * @param  {Object} el           [description]
 * @param  {String} DATA_DISH_ID [description]
 * @return {[type]}              [description]
 */
KISSY.add('dish-management/list', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate,
        TablePagi = PW.widget.TablePagi,
        Dialog = PW.widget.Dialog,
        DishManagementIO = PW.io.DishManagement.PackageDishManagement,
        Dialog = PW.widget.Dialog,
        config = {},
        el = {
            // 大类全选
            selectAllTrigger: '.J_selectAll',
            // 搜索表单
            searchForm: '.J_searchForm',
            // 大类
            bigTagTrigger: '.J_bigTag',
            // 数据渲染
            templateTemp: '#J_template',
            // 删除触发器
            delTrigger: '.J_del',
            // 状态触发器
            statusTrigger: '.J_status'
        },
        DATA_DISH_ID = 'data-package-dish-id',
        DATA_DISH_STATUS = 'data-package-dish-status',
        newStatusMap = {
            0: '恢复',
            1: '停售'
        },
        newStatus = {
            0: 1,
            1: 0
        };

    function List(param){
        this.opts = S.merge(config, param);
        this.pagination;
        this._init();
    }

    S.augment(List, {
        _init: function(){
            this._selectAll();
            this._showTip();
            this._initPagi();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
            delegate(el.templateTemp, 'click', el.delTrigger, function(e){
                that._delDish(e.target);
            });
            delegate(el.templateTemp, 'click', el.statusTrigger, function(e){
                that._changeStatus(e.target);
            });
        },
        /**
         * 显示提示信息
         * @private
         */
        _showTip: function(){
            var
                that = this,
                tipEl = S.one('.J_tip');

            if(tipEl){
                setTimeout(function(){
                    DOM.remove(tipEl);
                }, 2000);
            }
        },
        /**
         * 删除菜品
         * @param e
         * @private
         */
        _delDish: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_DISH_ID);

            Dialog.confirm('确定删除该套餐吗？', function(e,me){
                DishManagementIO.delPackageDish({
                    id: id
                },function(rs, errMsg){
                    if(rs){
                        Dialog.alert('删除成功！');
                        that.pagination.reloadPagi();
                    }else{
                        Dialog.error(errMsg);
                    }
                });
            });
        },
        /**
         * 搜索: 全选曹邹
         * @private
         */
        _selectAll: function(){
            var
                that = this;

            PW.mod.Selectall.client({
                root: el.searchForm,
                select: el.bigTagTrigger,
                toggleTrigger: el.selectAllTrigger
            });
        },
        /**
         * 初始化分页
         * @private
         */
        _initPagi: function(){
            var
                that = this;

            that.pagination = TablePagi.client({
                pagi: that.opts,
                formSet: {
                    hasForm: true,
                    formRender: el.searchForm
                }
            });
        },
        /**
         * 编辑菜品的状态
         * @param e
         * @private
         */
        _changeStatus: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_DISH_ID),
                status = DOM.attr(tr, DATA_DISH_STATUS);

            Dialog.confirm('确定' + newStatusMap[status] + '此套餐吗?', function(){
                DishManagementIO.changePackageDishStatus({
                    id: id,
                    status: newStatus[status]
                }, function(rs, errMsg){
                    if(rs){
                        that.pagination.reloadPagi();
                        Dialog.alert(newStatusMap[status] + '成功!');
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        }
    });
    return List;
},{
    requires: [
        'widget/dialog',
        'widget/tablePagi',
        'mod/selectall',
        'pio/dish-management/package-dish-management'
    ]
});
