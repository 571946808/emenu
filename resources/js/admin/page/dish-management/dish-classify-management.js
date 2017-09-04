/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-菜品分类管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.03
 * ==NOTES:=============================================
 * v1.0.0(2015.11.03):
 初始生成
 * v1.0.1(2015.11.09)
 * 添加是否下单立即打印验证和打印机验证
 * ---------------------------------------------------------------------------*/
KISSY.add('page/dish-management/dish-classify-management', function(S, AddBigTag, AddSmallTag, Search){
    PW.namespace('page.DishManagement.DishClassifyManagement');
    PW.page.DishManagement.DishClassifyManagement = function(param){
        new AddBigTag(param);
        new AddSmallTag(param);
        new Search(param);
    };
},{
    requires: [
        'dish-classify-management/add-big-tag',
        'dish-classify-management/add-small-tag',
        'dish-classify-management/search'
    ]
});
/**
 * 搜索分类,帮助用户可以快速查找
 */
KISSY.add('dish-classify-management/search', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        DishClassifyManagementIO = PW.io.DishManagement.DishClassifyManagement,
        el = {
            // 搜索表单
            searchForm: '.J_searchForm',
            // 列表模板
            listTemp: '#listTpl',
            // 数据容器
            listContainer: '.J_classify',
            // 展开\收起触发器
            foldToggleTrigger: '.J_foldToggle',
            // 小类列表
            smallUl: '.J_smallClassify'
        };

    function Search(param){
        this._init();
    }

    S.augment(Search, {
        _init: function(){
            this._showToggle();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            on(el.searchForm, 'submit', function(){
                that._search();
                return false;
            });
        },
        /**
         * 展开收起子分类
         * @private
         */
        _showToggle: function(){
            var
                that = this,
                smallUl = query(el.smallUl, el.listContainer),
                length,
                foldEl,
                bigLi;

            S.each(smallUl, function(ul){
                length = query('li', ul).length;
                bigLi = DOM.parent(ul, 'li');
                foldEl = get(el.foldToggleTrigger, bigLi);
                if(length == 0){
                    DOM.text(foldEl, '');
                }else{
                    DOM.text(foldEl, '展开 <<');
                }
            });
        },
        /**
         * 搜索分类
         * @private
         */
        _search: function(){
            var
                that = this,
                data = DOM.serialize(el.searchForm);

            DOM.html(el.listContainer, '正在加载,请稍后...');

            DishClassifyManagementIO.search(data, function(rs, list, errMsg){
                if(rs){
                    that._renderList(list);
                    that._showToggle();
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染分类列表
         * @param list
         * @private
         */
        _renderList: function(list){
            var
                that = this,
                listTemp = DOM.html(el.listTemp),
                listStr = Juicer.client(listTemp, {
                    list: list
                });
            DOM.html(el.listContainer, listStr);
        }
    });

    return Search;
},{
    requires: [
        'mod/juicer',
        'widget/dialog',
        'pio/dish-management/dish-classify-management'
    ]
});
/**
 * 添加菜品小类
 */
KISSY.add('dish-classify-management/add-small-tag', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        DishClassifyManagementIO = PW.io.DishManagement.DishClassifyManagement,
        el= {
            // 添加小类触发器
            addSmallTagTrigger: '.J_addSmallTag',
            // 编辑小类触发器
            editSmallTagTrigger: '.J_editSmallTag',
            // 删除小类触发器
            delSmallTagTrigger: '.J_delSmallTag',
            // 添加小类对话框模板
            addTemp: '#dlgTpl',
            // 添加大类表单
            addForm: '.J_addForm',
            // 菜品分类数据容器
            dishClassifyContainer: '.J_classify',
            // 添加菜品大类--上级分类
            rootClassifyEl: '.J_rootClassify',
            // 菜品小类数据容器
            smallClassifyContainer: '.J_smallClassify',
            // 菜品总分类下拉列表隐藏节点
            bigClassifyHiddenEl: '.J_bigClassifyHidden',
            // 菜品大类隐藏节点
            bigTagHiddenEl: '.J_bigTagHidden',
            // 菜品大类input
            bigTagInp: '.J_bigTagInp',
            // 小类模板
            smallTagTemp: '#smallTagTpl',
            // 对话框中打印机节点
            printEl: '.J_print',
            // 模板中打印机隐藏域节点
            printIdEl: '.J_printId',
            // 下单是否立即打印单选框隐藏域节点
            printAfterConfirmOrderInpEl: '.J_printAfterConfirmOrderSmall',
            // 展开\收起触发器
            foldToggleTrigger: '.J_foldToggle'
        },
        // 大类id
        DATA_BIG_TAG_ID = 'data-big-tag-id',
        // 总分类id
        DATA_ROOT_TAG_ID = 'data-root-tag-id',
        // 大类名称
        DATA_BIG_TAG_NAME = 'data-big-tag-name',
        // 小类id
        DATA_SMALL_TAG_ID = 'data-small-tag-id',
        // 小类名称
        DATA_SMALL_TAG_NAME = 'data-small-tag-name',
        // 为当前编辑的小类添加该类名
        EDIT_SMALL_TAG = 'J_small';

    function SmallTag(param){
        this.title;
        this.isEdit;
        this.defender;
        this._init();
    }

    S.augment(SmallTag, {
        _init: function(){
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            delegate(el.dishClassifyContainer, 'click', el.addSmallTagTrigger , function(e){
                that.isEdit = false;
                that.title = '添加';
                that._openDlg(e.target);
            });
            delegate(el.dishClassifyContainer, 'click', el.delSmallTagTrigger, function(e){
                that._delSmallTag(e.target);
            });
            delegate(el.dishClassifyContainer, 'click', el.editSmallTagTrigger, function(e){
                that.isEdit = true;
                that.title = '编辑';
                that._editSmallTag(e.target);
            });
        },
        /**
         * 编辑菜品小类
         * @param e
         * @private
         */
        _editSmallTag: function(e){
            var
                that = this,
                liEl = DOM.parent(e, 'li'),
                lis = query('li', el.dishClassifyContainer),
                printIdEl = get(el.printIdEl, liEl),
                printId = DOM.val(printIdEl),
                printAfterConfirmOrderInpEl = get(el.printAfterConfirmOrderInpEl, liEl),
                printAfterConfirmOrderInp = DOM.val(printAfterConfirmOrderInpEl),
                data;
            DOM.removeClass(lis, EDIT_SMALL_TAG);
            DOM.addClass(liEl, EDIT_SMALL_TAG);
            data = DOM.serialize('.' + EDIT_SMALL_TAG);
            that._openSmallDlg(liEl, data, printId, printAfterConfirmOrderInp);
        },
        /**
         * 编辑菜品小类--打开对话框
         * @param li
         * @param classifyData
         * @private
         */
        _openSmallDlg: function(li, classifyData, printId, printAfterConfirmOrderInp){
            var
                that = this,
                tipTemp = DOM.html(el.addTemp),
                tipStr,
                settings = {
                    title: that.title +  '菜品小类',
                    header: true,
                    height: 400,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validAddForm(li, me);
                                },
                                bType: 'submit',
                                className: 'J_ok'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                }
                            }
                        ]
                    },
                    afterOpenHandler: function(me){
                        that._renderBigTagNameAndBigTagId(li, true);
                        that._selected(printId, printAfterConfirmOrderInp);
                        that.defender = Defender.client(el.addForm, {});
                        on(el.addForm, 'submit', function(){
                            that._validAddForm(li, me);
                            return false;
                        });
                    }
                };

            tipStr = Juicer.client(tipTemp, classifyData);
            Dialog.alert(tipStr, function(){}, settings);
        },
        /**
         * 在编辑对话框中渲染菜品大类名称和菜品大类id
         * @param li
         * @private
         */
        _renderBigTagNameAndBigTagId: function(li, bool){
            var
                that = this,
                bigTagLi,
                bigTagName,
                bigTagId,
                rootTagEl,
                bigTagEl;

            if(bool){ //如果为编辑小类,则li表示小类
                bigTagLi = DOM.parent(li, 'ul');
                bigTagName = DOM.attr(bigTagLi, DATA_BIG_TAG_NAME);
                bigTagId = DOM.attr(bigTagLi, DATA_BIG_TAG_ID);
            }else{  // 如果为添加小类,则li表示大类
                bigTagName = DOM.attr(li, DATA_BIG_TAG_NAME);
                bigTagId = DOM.attr(li, DATA_BIG_TAG_ID);
            }
            DOM.text(el.bigTagHiddenEl, bigTagName);
            rootTagEl = DOM.parent(el.rootClassifyEl, '.form-group');
            bigTagEl = DOM.parent(el.bigTagHiddenEl, '.form-group');
            DOM.removeClass(bigTagEl, 'hidden');
            DOM.addClass(rootTagEl, 'hidden');
            // 赋值给pId,将大类变为可用,用于表单提交
            DOM.val(el.bigTagInp, bigTagId);
            DOM.removeAttr(el.bigTagInp, 'disabled');
        },
        /**
         * 编辑菜品小类时,选中打印机id和是否下单立即打印
         * @param printId
         * @param printAfterConfirmOrderInp
         * @private
         */
        _selected: function(printId, printAfterConfirmOrderInp){
            // 选中打印机id
            var
                that = this,
                printOptions = query('option', el.printEl),
                printOption;
            for(var i = 0; i < printOptions.length; i ++){
                printOption = printOptions[i];
                if($(printOption).attr('value') == printId){
                    $(printOption).attr('selected', 'selected');
                    break;
                }
            }
            // 选中是否下单立即打印单选
            var
                radioEls = query('input[type="radio"]', el.addForm),
                radio;
            for(var j = 0; j < radioEls.length; j ++){
                radio = radioEls[j];
                if($(radio).attr('value') == printAfterConfirmOrderInp){
                    $(radio).attr('checked', 'checked');
                    break;
                }
            }
        },
        /**
         * 删除菜品小类
         * @param e
         * @private
         */
        _delSmallTag: function(e){
            var
                that = this,
                liEl = DOM.parent(e, 'li'),
                ulEl = DOM.parent(liEl, 'ul'),
                id = DOM.attr(liEl, DATA_SMALL_TAG_ID),
                bigId = DOM.attr(ulEl, DATA_BIG_TAG_ID);

            Dialog.confirm('确定删除该菜品小类吗?', function(){
                DishClassifyManagementIO.delClassify({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        that._removeSmallTag(id, liEl, ulEl);
                        Dialog.alert('删除成功!');
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 去掉删除掉的菜品小类
         * @param id
         * @param li
         * @private
         */
        _removeSmallTag: function(id, smallLi, smallUl){
            var
                that = this,
                smallCount,
                foldEl,
                bigLi = DOM.parent(smallUl, 'li');
            DOM.remove(smallLi);
            foldEl = get(el.foldToggleTrigger, bigLi);
            smallCount = query('li', smallUl).length;
            if(smallCount == 0){
                DOM.text(foldEl, '');
                DOM.css(smallUl, 'display', 'none');
            }
        },
        /**
         * 添加菜品小类--打开对话框
         * @param e
         * @private
         */
        _openDlg: function(e){
            var
                that = this,
                liEl = DOM.parent(e, 'li'),
                tipTemp = DOM.html(el.addTemp),
                tipStr,
                bigTagId = DOM.attr(liEl, DATA_BIG_TAG_ID),
                rootTagId = DOM.attr(liEl, DATA_ROOT_TAG_ID),
                settings = {
                    title: that.title +  '菜品小类',
                    header: true,
                    height: 400,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validAddForm(liEl, me);
                                },
                                className: 'J_ok',
                                bType: 'submit'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                }
                            }
                        ]
                    },
                    afterOpenHandler: function(e, me){
                        that._renderBigTagNameAndBigTagId(liEl, false);
                        that.defender = Defender.client(el.addForm, {});
                        on(el.addForm, 'submit', function(){
                            that._validAddForm(liEl, me);
                            return false;
                        });
                    }
                };

            tipStr = Juicer.client(tipTemp, {});
            Dialog.alert(tipStr, function(){}, settings);
        },
        /**
         * 验证表单
         * @param li
         * @param me
         * @private
         */
        _validAddForm: function(li, me){
            var
                that = this,
                errorTip,
                data = DOM.serialize(el.addForm);

            that.defender.validAll(function(rs){
                if(rs){
                    if(!that.isEdit){
                        that._addSmallTag(li, data, me);
                    }else{
                        that._editSmallClassify(li, data, me);
                    }
                }else{
                    that._focusErrInp();
                }
            });
        },
        /**
         * 聚焦到错误域
         * @private
         */
        _focusErrInp: function(){
            var
                that = this,
                errInp;

            errInp = get('.error-field', el.addForm);
            if(errInp){
                errInp.focus();
            }
        },
        /**
         * 编辑菜品小类,发送菜品小类id
         * @param li
         * @param classifyData
         * @private
         */
        _editSmallClassify: function(li, classifyData, me){
            var
                that = this,
                id = DOM.attr(li, DATA_SMALL_TAG_ID),
                bigTagId = DOM.attr(li, DATA_BIG_TAG_ID),
                data = DOM.serialize(el.addForm);

            S.mix(data, {
                id : id
            });
            DishClassifyManagementIO.editClassify(data, function(rs, errMsg){
                if(rs){
                    S.mix(classifyData, {
                        id: id
                    });
                    me.close();
                    that._renderEditSmallTag(li, classifyData);
                    Dialog.alert('编辑成功!', function(){}, {
                        enterHandler: true
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染编辑后的菜品小类
         * @private
         */
        _renderEditSmallTag: function(li, classifyData){
            var
                that = this,
                smallTagTemp = DOM.html(el.smallTagTemp),
                smallTagStr = Juicer.client(smallTagTemp, classifyData),
                smallTagDOM = DOM.create(smallTagStr);
            DOM.insertAfter(smallTagDOM, li);
            DOM.remove(li);
        },
        /**
         * 添加菜品小类
         * @param li
         * @param classifyData
         * @private
         */
        _addSmallTag: function(li, classifyData, me){
            var
                that = this;
            DishClassifyManagementIO.addClassify(classifyData, function(rs, data, errMsg){
                if(rs){
                    S.mix(classifyData, {
                        id: data.id  //返回该小类的id {data.id}
                    });
                    me.close();
                    that._renderSmallTag(li, classifyData);
                    Dialog.alert('添加成功!', function(){}, {
                        enterHandler: true
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 添加渲染菜品小类
         * @param li
         * @param data
         * @private
         */
        _renderSmallTag: function(li, data){
            var
                that = this,
                smallTagTemp = DOM.html(el.smallTagTemp),
                smallTagStr = Juicer.client(smallTagTemp, data),
                smallTagDOM = DOM.create(smallTagStr),
                smallUl = get(el.smallClassifyContainer, li),
                smallCount, foldEl;
            DOM.prepend(smallTagDOM, smallUl);
            DOM.addClass(smallUl, 'open');
            smallCount = query('li', smallUl).length;
            foldEl = get(el.foldToggleTrigger, li);
            if(smallCount > 0){
                DOM.css(smallUl, 'display', 'block');
                DOM.text(foldEl, '收起 >>');
            }
        }
    });

    return SmallTag;
},{
    requires: [
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'pio/dish-management/dish-classify-management'
    ]
});
/**
 * 添加菜品大类
 */
KISSY.add('dish-classify-management/add-big-tag', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        SelectAll = PW.mod.Selectall,
        DishClassifyManagementIO = PW.io.DishManagement.DishClassifyManagement,
        el= {
            // 添加大类触发器
            addBigTagTrigger: '.J_addBigTag',
            // 修改大类触发器
            editBigTagTrigger: '.J_editBigTag',
            // 删除大类触发器
            delBigTagTrigger: '.J_delBigTag',
            // 添加大类对话框模板
            addTemp: '#dlgTplBig',
            // 大类模板
            bigTagTemp: '#bigTagTpl',
            // 添加大类表单
            addForm: '.J_addForm',
            // 操作表单
            operForm: '.J_operForm',
            // 菜品分类数据容器
            dishClassifyContainer: '.J_classify',
            // 添加菜品总分类--上级分类
            rootClassifyEl: '.J_rootClassify',
            // 隐藏菜品大类
            bigClassifyHiddenEl: '.J_bigClassifyHidden',
            // 下单立即打印隐藏域
            printAfterConfirmOrderInp: '.J_printAfterConfirmOrder',
            // 对话框打印机下拉列表节点
            printEl: '.J_print',
            // 隐藏域组
            inputGroupEl: '.J_inputGroup',
            // 渲染模板的打印机隐藏域
            printIdEl: '.J_printId',
            // 渲染模板的备注隐藏域
            remarkInp: '.J_remarkIds',
            // 展开\收起触发器
            foldToggleTrigger: '.J_foldToggle',
            //存放备注的隐藏div
            remarkHiddenEl: '.J_remarkHidden',
            //备注全选触发器
            selectAllTrigger: '.J_selectAll',
            //备注触发器
            remarkTrigger: '.J_select'
        },
        // 总分类名称
        DATA_ROOT_TAG_NAME = 'data-root-tag-name',
        // 总分类id
        DATA_ROOT_TAG_ID = 'data-root-tag-id',
        // 大类名称
        DATA_BIG_TAG_NAME = 'data-big-tag-name',
        // 大类id
        DATA_BIG_TAG_ID = 'data-big-tag-id',
        // 为当前正在编辑的大类添加类名
        EDIT_BIG_TAG = 'J_big';

    function BigTag(param){
        this.isEdit;
        this.rootClassify;
        this.remark;
        this.defender;
        this._init();
    }
    S.augment(BigTag, {
        _init: function(){
            this._getRootClassify();
            this._getRemark();
            this._bulidEvt();
        },
        /**
         * 获取(后台刷的)总分类的下拉列表
         * @private
         */
        _getRootClassify: function(){
            var
                that = this,
                bigClassifyEl = DOM.clone(el.bigClassifyHiddenEl, true);
            DOM.empty(el.rootClassifyEl);
            that.rootClassify = bigClassifyEl;
        },
        /**
         * 获取（后台刷的）备注列表
         * @return {[type]} [description]
         */
        _getRemark: function(){
            var
                that = this,
                remarkEl = DOM.clone(el.remarkHiddenEl, true);

            DOM.empty(el.remarkHiddenEl);
            that.remark = remarkEl;
        },
        /**
         * 初始化全选
         * @return {[type]} [description]
         */
        _remarkSelectAll: function(){
            var
                that = this;

            SelectAll.client({
                root: el.addForm,
                select: el.remarkTrigger,
                toggleTrigger: el.selectAllTrigger
            });
        },
        _bulidEvt: function(){
            var
                that = this;
            on(el.addBigTagTrigger, 'click', function(){
                that.isEdit = false;
                that.title = '添加';
                that._openDlg();
            });
            delegate(el.dishClassifyContainer, 'click', el.editBigTagTrigger, function(e){
                that.isEdit = true;
                that.title = '编辑';
                that._editBigTag(e.target);
            });
            delegate(el.dishClassifyContainer, 'click', el.delBigTagTrigger, function(e){
                that._delBigTag(e.target);
            });
            delegate(el.dishClassifyContainer, 'click', el.foldToggleTrigger, function(e){
                that._foldToggle(e.target);
            });
        },
        _foldToggle: function(e){
            var
                that = this,
                bigLi = DOM.parent(e, 'li'),
                smallUl = get('ul', bigLi),
                isOpen = DOM.hasClass(smallUl, 'open');

            if(!isOpen){
                $(smallUl).slideDown(0.2, function(){
                    $(smallUl).addClass('open');
                    $(e).text('收起 >>');
                });
            }else{
                $(smallUl).slideUp(0.2, function(){
                    $(smallUl).removeClass('open');
                    $(e).text('展开 <<');
                });
            }
        },
        /**
         * 删除菜品大类
         * @param e
         * @private
         */
        _delBigTag: function(e){
            var
                that = this,
                liEl = DOM.parent(e, 'li'),
                id = DOM.attr(liEl, DATA_BIG_TAG_ID),
                rootId = DOM.attr(liEl, DATA_ROOT_TAG_ID);

            Dialog.confirm('确定删除该菜品大类吗?', function(){
                DishClassifyManagementIO.delClassify({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        Dialog.alert('删除成功!');
                        that._removeBigTag(id, liEl);
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 移除删除掉的菜品大类
         * @param id
         * @param li
         * @private
         */
        _removeBigTag: function(id, li){
            var
                that = this;
            DOM.remove(li);
        },
        /**
         * 编辑菜品大类
         * @param e
         * @private
         */
        _editBigTag: function(e){
            var
                that = this,
                lis = query('li', el.dishClassifyContainer),
                liEl = DOM.parent(e, 'li'),
                divEl = get(el.inputGroupEl, liEl),
                // 获取总分类id
                rootTagId = DOM.attr(liEl, DATA_ROOT_TAG_ID),
                // 获取是否立即打印值
                printAfterConfirmOrderInpEl = get(el.printAfterConfirmOrderInp, divEl),
                printAfterConfirmOrderInp = DOM.val(printAfterConfirmOrderInpEl),
                // 获取打印机id
                printIdEl = get(el.printIdEl, divEl),
                printId = DOM.val(printIdEl),
                // 获取备注列表id
                remarkEl = get(el.remarkInp, divEl),
                remarkIds = DOM.val(remarkEl),
                divEls = query(el.inputGroupEl, el.dishClassifyContainer);
                
            DOM.removeClass(divEls, EDIT_BIG_TAG);
            DOM.addClass(divEl, EDIT_BIG_TAG);
            that._openDlg(rootTagId, printAfterConfirmOrderInp, printId, remarkIds, liEl);
        },
        /**
         * 打开添加对话框
         * @private
         */
        _openDlg: function(rootTagId, printAfterConfirmOrderInp, printId, remarkIds, li){
            var
                that = this,
                tipTemp = DOM.html(el.addTemp),
                tipStr,
                classifyObj,
                settings = {
                    title:  that.title + '菜品大类',
                    header: true,
                    height: 400,
                    width: 800,
                    hasAutoScroll: true,
                    afterOpenHandler: function(e, me){
                        that._addBigClassify();
                        that._addRemark();
                        that._remarkSelectAll();
                        // 如果是修改菜品大类,需要进一步将已经选好的总分类和下单是否立即打印渲染出来
                        if(rootTagId){
                            that._selectedRootClassify(rootTagId, printAfterConfirmOrderInp, printId,remarkIds);
                        }else{
                            //添加时，清空浏览器对checkbox的缓存
                            that._clearCheckbox();
                        }
                        that.defender = Defender.client(el.addForm, {});
                        on(el.addForm, 'submit', function(){
                            that._validAddForm(li, me);
                            return false;
                        });
                    }
                };
            // 如果是添加,对话框为空,如果是编辑就填好内容
            if(!that.isEdit){
                tipStr = Juicer.client(tipTemp, {});
            }else{
                classifyObj = DOM.serialize('.' + EDIT_BIG_TAG);
                tipStr = Juicer.client(tipTemp, classifyObj);
            }
            Dialog.confirm(tipStr, function(e, me){
                that._validAddForm(li, me);
            }, function(){}, settings);
        },
        /**
         * 添加菜品大类
         * @private
         */
        _addBigClassify: function(){
            var
                that = this;
            // 如果是添加菜品大类
            // 将最新的总分类加入对话框中总分类节点处
            DOM.append(that.rootClassify, el.rootClassifyEl);
            DOM.removeClass(that.rootClassify, 'hidden');
            DOM.removeAttr(that.rootClassify, 'disabled');
        },
        /**
         * 添加备注
         */
        _addRemark: function(){
            var
                that = this;

            DOM.append(that.remark, '.J_remarkContainer');
            DOM.removeClass(that.remark, 'hidden');
        },
        _clearCheckbox: function(){
            var
                that = this,
                remarkEls = query('input[type="checkbox"]', el.addForm),
                remarkEl;
            for(var i = 0; i < remarkEls.length; i++){
                remarkEl = remarkEls[i];
                DOM.removeAttr(remarkEl, 'checked');
            }
        },
        /**
         * 编辑状态下,选中下拉列表和单选框
         * @param rootTagId
         * @param printAfterConfirmOrderInp
         * @private
         */
        _selectedRootClassify: function(rootTagId, printAfterConfirmOrderInp, printId, remarkIds){
            // 选中总分类下拉列表
            var
                that = this,
                classifySelectEl = get(el.bigClassifyHiddenEl, el.addForm),
                classifyOptions = query('option', classifySelectEl),
                classifyOption;
            for(var i = 0; i < classifyOptions.length; i ++){
                classifyOption = classifyOptions[i];
                if($(classifyOption).attr('value') == rootTagId){
                    $(classifyOption).attr('selected','selected');
                    break;
                }
            }
            // 选中打印机下拉列表
            var
                printSelectEl = get(el.printEl, el.addForm),
                printOptions = query('option', printSelectEl),
                printOption;
            for(var k = 0; k < printOptions.length; k ++){
                printOption = printOptions[k];
                if($(printOption).attr('value') == printId){
                    $(printOption).attr('selected', 'selected');
                    break;
                }
            }

            // 选中是否下单立即打印
            var
                radioEls = query('input[type="radio"]', el.addForm),
                radioEl;

            for(var j = 0; j < radioEls.length; j ++){
                radioEl = radioEls[j];
                if(DOM.val(radioEl) == printAfterConfirmOrderInp){
                    DOM.attr(radioEl, 'checked', 'checked');
                    break;
                }
            }
            // 选中备注
            var
                remarkEls = query('input[type="checkbox"]', el.addForm),
                remarkEl,
                hasChecked,
                remarkIdArr =[];
                
            if(remarkIds){
                remarkIdArr = remarkIds.split(',');
                for(var a = 0; a < remarkEls.length; a++){
                    remarkEl = remarkEls[a];
                    isChecked = S.inArray(DOM.val(remarkEl), remarkIdArr);
                    if(isChecked){
                        DOM.attr(remarkEl, 'checked', 'checked');
                    }else{
                        DOM.attr(remarkEl, 'checked', false);
                    }
                }
            }else{
                for(var b = 0; b < remarkEls.length; b++){
                    DOM.attr(remarkEls[b], 'checked', false);
                }
            }
        },
        /**
         * 验证对话框内容
         * @param me
         * @private
         */
        _validAddForm: function(li, me){
            var
                that = this,
                data = DOM.serialize(el.addForm),
                errInp,
                selectEl = get(el.bigClassifyHiddenEl, el.addForm),
                options = query('option', selectEl),
                option,
                rootClassifyName,
                rootClassifyId;
            for(var i = 0; i < options.length; i ++){
                option = options[i];
                if(option.selected){
                    rootClassifyName = DOM.text(option);
                    rootClassifyId = DOM.attr(option, 'value');
                    break;
                }
            }
            S.mix(data, {
                rootClassifyName: rootClassifyName,
                pId: rootClassifyId
            });
            that.defender.validAll(function(rs) {
                if(rs){
                    // 如果是添加,直接在容器里增加li
                    if(!that.isEdit){
                        that._addClassify(data, me);
                    }else{
                        // 如果是编辑,将重新渲染新的节点li到容器中
                        S.mix(data, {
                            id: DOM.attr(li, DATA_BIG_TAG_ID)
                        });
                        that._sendEditBigTag(li, data, me);
                    }
                    me.close();
                }else{
                    that._focusErrInp();
                }
            });
        },
        /**
         * 渲染编辑之后的大类
         * @param li
         * @param data
         * @private
         */
        _renderEditBigClassify: function(li, data){
            var
                that = this,
                smallUl = get('ul', li),
                bigTagTemp = DOM.html(el.bigTagTemp),
                bigTagStr = Juicer.client(bigTagTemp, data),
                bigTagDOM = DOM.create(bigTagStr),
                newSmallUl = get('ul', bigTagDOM),
                smallLi = query('li', smallUl),
                foldEl = get(el.foldToggleTrigger, bigTagDOM);
            DOM.insertBefore(bigTagDOM, li);
            DOM.append(smallLi, newSmallUl);
            DOM.remove(li);
            if(smallLi.length > 0){
                DOM.text(foldEl, '展开 <<');
            }
        },
        /**
         * 发送编辑后的菜品大类信息
         * @param li
         * @param classifyData
         * @private
         */
        _sendEditBigTag: function(li, classifyData, me){
            var
                that = this;
            DishClassifyManagementIO.editClassify(classifyData, function(rs, errMsg){
                if(rs){
                    me.close();
                    that._renderEditBigClassify(li, classifyData);
                    Dialog.alert('编辑成功!', function(){}, {
                        enterHandler: true
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 添加分类
         * @param classifyData
         * @private
         */
        _addClassify: function(classifyData, me){
            var
                that = this;
            DishClassifyManagementIO.addClassify(classifyData, function(rs, data ,errMsg){
                if(rs){
                    S.mix(classifyData, {
                        id: data.id //{id: data.id}
                    });
                    me.close();
                    that._renderBigTag(classifyData);
                    Dialog.alert('添加成功!', function(){}, {
                        enterHandler: true
                    });
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染分类到分类容器中
         * @param data
         * @private
         */
        _renderBigTag: function(data){
            var
                that = this,
                bigTagTemp = DOM.html(el.bigTagTemp),
                bigTagStr = Juicer.client(bigTagTemp, data),
                bigTagDOM = DOM.create(bigTagStr),
                smallUl;

            DOM.prepend(bigTagDOM, el.dishClassifyContainer);
            smallUl = get('ul', bigTagDOM);
            DOM.css(smallUl, 'display', 'none');
        }
    });
    return BigTag;
},{
    requires: [
        'widget/dialog',
        'mod/juicer',
        'mod/defender',
        'mod/selectall',
        'pio/dish-management/dish-classify-management'
    ]
});