/*-----------------------------------------------------------------------------
 * @Description:     菜品管理-菜品图片编辑管理
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.24
 * ==NOTES:=============================================
 * v1.0.0(2015.11.24):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/dish-management/dish-img-management-edit', function(S, Core){
    PW.namespace('page.DishManagement.DishImgManagementEdit');
    PW.page.DishManagement.DishImgManagementEdit = {
        Core: function(param){
            new Core(param);
        }
    };
},{
    requires: [
        'dish-img-management-edit/core'
    ]
});
/**
 * 编辑菜品核心逻辑
 */
KISSY.add('dish-img-management-edit/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
            // 文件
            fileItemEl: '.file-item',
            // 菜品id
            idEl: '.J_id',
            // 删除图片触发器
            delTrigger: '.J_del',
            //图片容器
            imgContainer: '.J_imgContainer'
        },
        DATA_IMG_ID = 'data-img-id';

    function Core(param){
        this.opts = param;
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            delegate(document, 'click', el.delTrigger, function(e){
                that._delPic(e.target);
            });
        },
        /**
         * 删除菜品图片
         * @param e
         * @private
         */
        _delPic: function(e){
            var
                that = this,
                imgEl = DOM.parent(e, el.imgContainer),
                id = DOM.attr(imgEl, DATA_IMG_ID);

            Dialog.confirm('确定删除此菜品图片吗？', function(){
                DishManagementIO.delPic({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert('删除成功！');
                        DOM.remove(imgEl);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        }
    });

    return Core;
},{
    requires: [
        'widget/dialog',
        'pio/dish-management/dish-management'
    ]
});