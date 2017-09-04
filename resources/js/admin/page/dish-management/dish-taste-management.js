/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-菜品口味管理
 * @Version:         2.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2015.11.09
 * ==NOTES:=============================================
 * v1.0.0(2015.11.24):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/dish-management/dish-taste-management',function(S, List){
    PW.namespace('page.DishManagement.List');
    PW.page.DishManagement.List = function(param){
        new List(param);
    };  
},{
    requires:[
        'dish-taste-management/list'
    ]
});
KISSY.add('dish-taste-management/list', function(S){
    var
        $ = S.all,
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        Pagination = PW.mod.Pagination,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
            //表单
            form: ".J_operForm",
            //隐藏域id
            hiddenId: ".J_id",
            //添加触发器
            addTrigger: ".J_addBtn",
            //编辑触发器
            editTrigger: ".J_editBtn",
            //删除触发器
            delTrigger: ".J_delBtn",
            //保存触发器
            saveTrigger: ".J_saveBtn",
            //取消触发器
            cancelTrigger: ".J_cancelBtn",
            //菜品口味名称
            name: ".J_name",
            //关联收费
            relatedCharge: ".J_relatedCharge",
            //列表渲染模板
            listTemp: "#J_template",
            //编辑模板
            editTemp: "#editTpl",
            //保存模板
            saveTemp: "#saveTpl"
        },
        //操作类型
        DATA_OPER_TYPE = "oper-type",
        //菜品口味id
        DATA_TASTE_ID = "data-taste-id",
        //重复操作提示
        BAN_OPERATION_TIP= ['操作失败：已存在编辑项，请保存或取消后再操作！'],
        OPERATION_TIP = ['确定删除该菜品口味吗？',
                         '确定保存该菜品口味吗？',
                         '确定添加该菜品口味吗？'],
        SUCCESS_TIP = ['删除成功！',
                       '保存成功！',
                       '添加成功！'];

    function List(param){
        this.opts = S.merge(config, param);
        this.pagination;
        this.defender = Defender.client(el.form, {
            showTip: false
        });
        this._init();
    }

    S.augment(List,{
        _init: function(){
            this._initPagi();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;
            //添加
            on(el.addTrigger, 'click', function(){
                if(that._hasEdit()){
                    that._addTaste();
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });
            //删除
            delegate(el.listTemp, 'click', el.delTrigger, function(e){
                if(that._hasEdit()){
                    that._delTaste(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });
            //编辑
            delegate(el.listTemp, 'click', el.editTrigger, function(e){
                if(that._hasEdit()){
                    that._getTasteInfo(e.target);
                }else{
                    Dialog.alert(BAN_OPERATION_TIP[0]);
                }
            });
            //保存
            delegate(el.listTemp, 'click', el.saveTrigger, function(e){
                that._save(e.target);
            });
            //取消
            delegate(el.listTemp, 'click', el.cancelTrigger, function(e){
                that._cancel(e.target);
            });
        },
        /**
         * 分页实现
         * @return {[type]} [description]
         */
        _initPagi: function(){
            var
                that = this,
                opts = that.opts;

            that.pagination = Pagination.client(opts);
        },
        /**
         * 判断当前是否有编辑项，没有的时候返回true
         * @return {Boolean} [description]
         */
        _hasEdit: function(){
            var
                that = this,
                isEdit = S.one(el.saveTrigger);

            if(!isEdit){
                return true;
            }else{
                return false;
            }
        },
        /**
         * 添加菜品口味
         * @return {[type]} [description]
         */
        _addTaste: function(){
            var
                that = this,
                editTemp = $(el.editTemp).html(),
                editTplStr = Juicer.client(editTemp, {
                    taste: {
                        relatedCharge: "0.00" //关联收费默认为0.00
                    }
                });
            $(el.listTemp).prepend(editTplStr);
            that.defender.refresh();   //刷新后验证
        },
        /**
         * 编辑菜品口味
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _getTasteInfo: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_TASTE_ID),
                tasteName = $(tr).children(el.name).text(),
                tasteRelatedCharge = $(tr).children(el.relatedCharge).text(),
                tempData = {};

            //定义模板中的值
            tempData= {
                id: id,
                name: tasteName,
                relatedCharge: tasteRelatedCharge,
                operType: 'edit'
            };
            that._renderEditTaste(tr, tempData);
        },
        /**
         * 点击编辑渲染模板
         * @param  {[type]} tr       [description]
         * @param  {[type]} tempData [description]
         * @return {[type]}          [description]
         */
        _renderEditTaste: function(tr, tempData){
            var
                that = this,
                editTemp = $(el.editTemp).html(),
                editTplStr = Juicer.client(editTemp, {taste: tempData}), 
                editTplStrDOM = DOM.create(editTplStr);
            
            DOM.insertAfter(editTplStrDOM, tr);
            DOM.hide(tr);  
            that.defender.refresh();  //刷新后验证
        },
        /**
         * 保存菜品口味
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _save: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_TASTE_ID),
                type = DOM.attr(tr, DATA_OPER_TYPE);
      
            $(el.hiddenId).val(id);  //将id保存在隐藏input中

            var 
                editData = DOM.serialize(el.form);

            that.defender.validAll(function(rs){
                if(rs){
                    if(type == 'edit'){
                        //若是编辑，需要发送id
                        that._saveEditTaste(editData, tr);
                    }else{
                        that._saveAddTaste(editData);
                    }
                }
            });   
        },
        /**
         * 保存编辑的菜品口味
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _saveEditTaste: function(editData, tr){
            var 
                that = this;

            Dialog.confirm(OPERATION_TIP[1], function(){
                DishManagementIO.saveEditTaste(editData, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[1]);
                        that._renderAfterEditTaste(editData, tr);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 渲染保存编辑后的模板
         * @param  {[type]} editData [description]
         * @param  {[type]} tr       [description]
         * @return {[type]}          [description]
         */
        _renderAfterEditTaste: function(editData, tr){
            var
                that = this,
                prevTr = $(tr).prev(),
                saveTemp = $(el.saveTemp).html(),
                saveTplStr = Juicer.client(saveTemp, {taste: editData});
               
            $(prevTr).replaceWith(saveTplStr);
            $(tr).remove();
            that.defender.refresh();  //刷新后验证
        },
        /**
         * 保存添加的菜品口味
         * @param  {[type]} editData [description]
         * @return {[type]}          [description]
         */
        _saveAddTaste: function(editData){
            var
                that = this;

            Dialog.confirm(OPERATION_TIP[2], function(){
                DishManagementIO.saveAddTaste(editData, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[2]);
                        that.pagination.reload(that.opts);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 删除菜品口味
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delTaste: function(e){
            var
                that = this,
                tr = DOM.parent(e, 'tr'),
                id = DOM.attr(tr, DATA_TASTE_ID);

            Dialog.confirm(OPERATION_TIP[0], function(){
                DishManagementIO.deleteTaste({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert(SUCCESS_TIP[0]);
                        that.pagination.reload(that.opts);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 取消
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _cancel: function(e){
            var 
                that = this,
                tr = DOM.parent(e, 'tr'),
                prevTr = DOM.prev(tr, 'tr');
            $(tr).remove();
            $(prevTr).show();
        }
    });
    return List;
},{
    requires:[
        'mod/pagination',
        'widget/dialog',
        'mod/defender',
        'pio/dish-management/dish-taste-management'
    ]
})