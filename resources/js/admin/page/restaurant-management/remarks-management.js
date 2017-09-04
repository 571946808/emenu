/*-----------------------------------------------------------------------------
 * @Description:     管理员-饭店管理-常用备注管理
 * @Version:         2.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2015.11.09
 * ==NOTES:=============================================
 * v1.0.0(2015.11.09):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('page/restaurant-management/remarks-management',function(S, ChooseRemarkBigTag, AddRemarkSmallTag, AddRemarkContent){
    PW.namespace('page.restManagement.remarksManagement');
    PW.page.restManagement.remarksManagement = function(param){
        new ChooseRemarkBigTag(param);
        new AddRemarkSmallTag(param);
        new AddRemarkContent(param);
    };  
},{
    requires:[
        'remarks-management/choose',
        'remarks-management/add-remark-small-tag',
        'remarks-management/add-remark-content'
    ]
});
/*
*选择备注大类，渲染大类对应的列表内容
*/
KISSY.add('remarks-management/choose', function(S){
    var 
        $ = S.all,
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer,
        RemarksManagementIO = PW.io.RestManagement.RemarksManagement,
        el = {
            //备注大类容器
            bigRemarkTagEl: ".big-remark-tags",
            //选择大类
            chooseTrigger: '.J_chooseBigRemarkTag',
            //列表模板
            listTemp: '#listTpl',
            //列表显示容器
            listContainer: ".J_classify",
            //表格
            contentTableEl: ".J_contentTable",
            //收起展开触发器
            foldToggleTrigger: ".J_foldToggle",
            //大类名称显示
            bigTagInfoEl: ".J_bigTagInfo",
            //保存大类id的隐藏域
            saveBigTagIdInp: ".J_saveBigTagIdInp"
        },
        //大类id
        DATA_BIG_TAG_ID = 'data-big-tag-id',
        //大类名称
        DATA_BIG_TAG_NAME = 'data-big-tag-name';

    function ChooseRemarkBigTag(param){
        this._init();
    }

    S.augment(ChooseRemarkBigTag, {
        _init: function(){
            this._isShow();
            this._buildEvt();
        },
        /**
         * 展开收起子分类
         * @return {Boolean} [description]
         */
        _isShow: function(){
            var
                that = this,
                tableEl = query(el.contentTableEl, el.listContainer),
                length,
                divEl,
                classifyDivEl,
                pEl,
                foldEl;

            S.each(tableEl, function(table){
                length = query('a', table).length;
                divEl = DOM.prev(table, 'div');
                pEl = DOM.children(divEl, 'p');
                foldEl = get(el.foldToggleTrigger, pEl);
                
                if(length == 0){
                    DOM.text(foldEl, '');
                }else{
                    DOM.text(foldEl, '展开 <<');
                }
            });
        },

        _buildEvt: function(){
            var
                that = this;
            //选择大类
            delegate(el.bigRemarkTagEl, 'click', el.chooseTrigger, function(e){
                that._choose(e.target);
                that._showInhead(e.target);
            });
        },
        /**
         * 选择备注大类
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _choose: function(e){
            var 
                that = this,
                bigTagId = $(e).attr(DATA_BIG_TAG_ID),
                bigTagName = $(e).attr(DATA_BIG_TAG_NAME);

            //使用隐藏域暂存大类id
            $(el.saveBigTagIdInp).val(bigTagId);
            
            DOM.html(el.listContainer, '正在加载,请稍后...');

            RemarksManagementIO.chooseRemarkBigTag({
                //向后台发送大类id
                id: bigTagId
            },function(rs, list, errMsg){
                if(rs){
                    that._renderList(list); 
                    that._isShow();  
                }else{
                    Dialog.alert(errMsg);
                }
            });
        },
        /**
         * 渲染大类对应的内容列表
         * @param  {[type]} list [description]
         * @return {[type]}      [description]
         */
        _renderList: function(list){
            var
                that = this,
                listStr,
                listTemp = DOM.html(el.listTemp);
            //若无list显示暂无内容，若有内容，渲染list
            if(list.length == 0){
                DOM.html(el.listContainer, '暂无内容');
            }else{
                listStr = Juicer.client(listTemp,{
                    list: list
                });
                DOM.html(el.listContainer, listStr);
            } 
        },
        /**
         * 将所选上级分类名称显示在panel-head中
         * @param  {[type]} target [description]
         * @return {[type]}        [description]
         */
        _showInhead: function(target){
            var
                that = this,
                targetEl = DOM.get(target),
                bigTagNameValue = S.trim(DOM.text(targetEl)),
                bigTagInfoEl = DOM.get(el.bigTagInfoEl);

            DOM.text(bigTagInfoEl, bigTagNameValue);
        }
    });
    return ChooseRemarkBigTag;
},{ 
    requires:[
        'mod/juicer',
        'pio/restaurant-management/remarks-management'
    ]
});
/**
 * 备注分类管理，包括添加、编辑、删除功能
 */
KISSY.add('remarks-management/add-remark-small-tag', function(S){
    var
        $ = S.all,
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        RemarksManagementIO = PW.io.RestManagement.RemarksManagement,
        el = {
            //添加小类触发器
            addSmallTagTrigger: ".J_addSmallRemarkTag",
            //编辑小类触发器
            eidtSmallTagTrigger: ".J_editSmallRemarkTag",
            //删除小类触发器
            delSmallTagTrigger: ".J_delSmallRemarkTag",
            //收起展开触发器
            foldToggleTrigger: ".J_foldToggle",
            //小类名称
            classifyNameEl: ".J_classifyName",
            //表单
            operForm: ".J_operForm",
            //保存大类id的隐藏域
            saveBigTagIdInp: ".J_saveBigTagIdInp",
            //包含备注分类名称以及操作按钮的div
            remarkClassifyEl: ".remark-classify",
            //包含备注内容的表格
            contentTableEl: ".J_contentTable",
            //渲染内容显示容器,包含备注名称和备注内容列表的div
            listContainer: ".J_classify",
            //添加备注表单
            addSmallTagForm: ".J_addSmallTagForm",
            //添加备注分类对话框模板
            smallTagDlgTemp: "#smallTagDlgTpl",
            //添加备注分类模板
            smallTagTemp: "#smallTagTpl",
            //编辑备注分类模板
            smallEditTagTemp:"#smallEditTagTpl",
            //备注分类隐藏域
            remarkHiddenInp: ".J_remarkHiddenInp",
            //对话框添加表单
            addForm: ".J_addForm",
             //大类名称显示
            bigTagInfoEl: ".J_bigTagInfo",
            //列表显示容器
            listContainer: ".J_classify",
        },
        //备注大类id
        DATA_BIG_TAG_ID = "data-big-tag-id",
        //备注大类名称
        DATA_BIG_TAG_NAME = "data-big-tag-name",
        //备注小类id
        DATA_SMALL_TAG_ID = "data-small-tag-id",
        //备注小类名称
        DATA_SMALL_TAG_NAME = "data-small-tag-name";

    function AddRemarkSmallTag(param){
        this.defender;
        this.isEdit;
        this.dialogTitle;
        this._init();
    }

    S.augment(AddRemarkSmallTag, {
        _init: function(){
            this._buildEvt();  
        },
        _buildEvt: function(){
            var 
                that = this;
    
            on(el.addSmallTagTrigger, 'click', function(){
                that.isEdit = false;
                that.dialogTitle = "添加";
                that._getBigClassifyName();
            });
            //编辑小类
            delegate(document, 'click', el.eidtSmallTagTrigger, function(e){
                that.isEdit = true;
                that.dialogTitle = "编辑";
                that._editSmallTag(e.target);
            });
            //删除小类
            delegate(document, 'click', el.delSmallTagTrigger, function(e){
                that._delSmallTag(e.target);
            });
            //收起展开
            delegate(document, 'click', el.foldToggleTrigger, function(e){
                that._foldToggleRemarkContent(e.target);
            })
        },
        /**
         * 备注内容的展开和收起
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _foldToggleRemarkContent: function(e){
            var 
                that = this,
                divEl = DOM.parent(e, 'div'),
                tableEl = DOM.next(divEl, 'table'), 
                isOpen = DOM.hasClass(tableEl, 'open');
            //在html中设置table默认为收起，此时无.open
            if(!isOpen){
                $(tableEl).slideDown(0.2, function(){
                    $(tableEl).addClass('open');
                    $(e).text('收起 >>'); 
                });
            }else{
                 $(tableEl).slideUp(0.2, function(){
                    $(tableEl).removeClass('open');
                    $(e).text('展开 <<');
                });
            }
        },
        /**
         * 添加小类时，获取大类信息
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        _getBigClassifyName: function(){
            var
                that = this,
                bigTagId = $(el.saveBigTagIdInp).val();
                divEl = DOM.get(el.remarkClassifyEl),
                bigTagName = DOM.get(el.bigTagInfoEl),//获取panel-head的大类名
                bigTagNameText =  DOM.text(bigTagName),
                remarkHiddenInpEl = DOM.get(el.remarkHiddenInp, divEl),
                data = DOM.serialize(remarkHiddenInpEl);

            //使data对象中包含bigTagName属性
            S.mix(data, {
                id: "",
                name: "",
                pId: bigTagId,
                bigTagName: bigTagNameText
            });
            that._openDialog(data,null,null);
        },
        /**
         * 编辑小类
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editSmallTag: function(e){
            var
                that = this,
                divEl = DOM.parent(e, 'div'),
                tableEl = DOM.next(divEl, 'table'),
                bigTagName = DOM.get(el.bigTagInfoEl),//获取panel-head的大类名
                bigTagNameText =  DOM.text(bigTagName),
                remarkHiddenInpEl = DOM.get(el.remarkHiddenInp, divEl),
                data = DOM.serialize(remarkHiddenInpEl);

            S.mix(data, {
                bigTagName: bigTagNameText
            });
            that._openDialog(data, divEl, tableEl);                   
        },
        /**
         * 添加小类（备注分类）时打开对话框
         * @param  {[type]} data    [description]
         * @param  {[type]} divEl   [description]
         * @param  {[type]} tableEl [description]
         * @return {[type]}         [description]
         */
        _openDialog: function(data, divEl, tableEl){
            var
                that = this,
             
                settings = {
                    title: that.dialogTitle + '备注分类',
                    header: true,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validSmallTagForm(data, me, divEl);
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
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.addForm, {});
                    }
                };

            that._renderDialog(data, settings);    
        },
        /**
         * 编辑后备注分类后，点击确定后，表格无tr，则隐藏展开表格链接
         * @param  {[type]} tbodyEl [description]
         * @return {[type]}         [description]
         */
        _hiddenFoldToggle: function(tableEl){
            var
                that = this,
                classifyDivEl = DOM.prev(tableEl, 'div'),
                foldEl = get(el.foldToggleTrigger, classifyDivEl),
                length = DOM.query('a', tableEl).length,
                isOpen = DOM.hasClass(tableEl, 'open');

            //编辑结束后，判断table中无tr，不显示展开按钮；若有，则显示收起
            if(length == 0){
                $(tableEl).slideUp(0.2, function(){
                    $(tableEl).removeClass('open'); 
                    DOM.text(foldEl, '');
                });
            }else if(!isOpen){  
                DOM.text(foldEl, '展开 <<');
            }else{
                DOM.text(foldEl, '收起 >>');
            }
        },
        /**
         * 将数据渲染在对话框中
         * @param  {[type]} data     [description]
         * @param  {[type]} settings [description]
         * @return {[type]}          [description]
         */
        _renderDialog: function(data, settings){
            var
                that = this,
                dlgTemp = DOM.html(el.smallTagDlgTemp),
                dlgStr;

            if(!that.isEdit){
                dlgStr = Juicer.client(dlgTemp, {
                    bigTagName:data.bigTagName
                });
            }else{
                dlgStr = Juicer.client(dlgTemp, {
                    bigTagName:data.bigTagName,
                    smallTagName:data.name
                });
            }
            Dialog.alert(dlgStr, function(){}, settings);    
        },
        /**
         * 表单验证
         * @param  {[type]} data  [description]
         * @param  {[type]} me    [description]
         * @param  {[type]} divEl [description]
         * @return {[type]}       [description]
         */
        _validSmallTagForm: function(data, me, divEl){
            var 
                that = this,
                dialogData = DOM.serialize(el.addForm);

            S.mix(dialogData, {
                //将页面中隐藏域中的data传给对话框模板中的dialogData
                pId: data.pId,
                id: data.id,
                bigTagName: data.bigTagName  //该数据保留于模板渲染时使用
            });

            that.defender.validAll(function(rs){
                if(rs){
                    if(!that.isEdit){
                        that._sendAddSmallTag(dialogData, me);
                    }else{
                        that._sendEditSmallTag(dialogData, me, divEl);
                    }
                }else{
                    that._focusErrInp();
                }
            });
        },
        /**
         * 发送添加分类备注数据
         * @param  {[type]} dialogData [description]
         * @param  {[type]} me         [description]
         * @return {[type]}            [description]
         */
        _sendAddSmallTag: function(dialogData, me){
            var 
                that = this;

            RemarksManagementIO.addSmallClassify(dialogData, 
                function(rs, data, errMsg){
                    if(rs){
                        //返回备注分类id
                        S.mix(dialogData, {
                            id: data.id
                        });
                        me.close();
                        that._renderAddClassify(dialogData,null);
                        Dialog.alert('添加成功！', function(){}, {
                            enterHandler: true //点击回车按钮确认
                        });
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            },
        /**
         * 发送编辑备注分类数据
         * @param  {[type]} dialogData 对话框中隐藏域数据
         * @param  {[type]} me         [description]
         * @param  {[type]} divEl      [description]
         * @return {[type]}            [description]
         */
        _sendEditSmallTag: function(dialogData, me, divEl){
            var
                that = this;

            RemarksManagementIO.editSmallClassify(dialogData,
                function(rs, errMsg){
                    if(rs){
                        me.close();
                        that._renderAddClassify(dialogData, divEl);
                        Dialog.alert('编辑成功!', function(){}, {
                            enterHandler: true 
                        });
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
        },
        /**
         * 备注分类渲染模板
         * @param  {[type]} dialogData [description]
         * @param  {[type]} divEl      [当前点击按钮所在div]
         * @return {[type]}            [description]
         */
        _renderAddClassify: function(dialogData, divEl){
            var
                that = this;     
                
            if(!that.isEdit){
                var
                    smallTagTpl = DOM.html(el.smallTagTemp),
                    smallTagStr = Juicer.client(smallTagTpl, dialogData),
                    smallTagDOM = DOM.create(smallTagStr),
                    listContainer = DOM.get(el.listContainer),
                    noContainerTip = DOM.text(el.listContainer);

                if(noContainerTip=="暂无内容"){
                    //添加备注分类后，删除暂无内容提示
                    DOM.text(el.listContainer, "");
                }
                DOM.prepend(smallTagDOM, listContainer);
            }else{
                var
                    smallEditTagTpl = DOM.html(el.smallEditTagTemp),
                    smallEditTagStr = Juicer.client(smallEditTagTpl, dialogData),
                    smallEditTagDOM = DOM.create(smallEditTagStr),
                    tableEl = DOM.next(divEl, 'table');

                DOM.insertAfter(smallEditTagDOM, divEl);
                DOM.remove(divEl);
                that._hiddenFoldToggle(tableEl); 
            }
        },
        /**
         * 错误域聚焦
         * @return {[type]}  [description]
         */
        _focusErrInp: function(){
            var
                that = this,
                errInp = get('.error-field', el.addForm);
            if(errInp){
                errInp.focus();
            }
        },
        /**
         * 删除小类
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delSmallTag: function(e){
            var 
                that = this,
                delDivEl = DOM.parent(e, 'div'), 
                contentTableEl = DOM.next(delDivEl, 'table'),
                delEl = DOM.children(delDivEl, 'p'),
                id = DOM.attr(delEl, DATA_SMALL_TAG_ID);

            Dialog.confirm('确定删除该分类吗?',function(){
                RemarksManagementIO.delSmallClassify({
                    //向后台发送所删除的小类id
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        DOM.remove(delDivEl);
                        DOM.remove(contentTableEl);
                        Dialog.alert('删除成功！');
                        that._isTheLastData();
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });        
        },
        /**
         * 若删除的是最后一条数据，显示暂无内容
         * @return {Boolean}  [description]
         */
        _isTheLastData: function(){
            var 
                that = this,
                pEl = DOM.get('p', el.listContainer),
                isHasContainer = S.one(pEl);

            //若为无列表容器中无内容，则显示暂无内容
            if(!isHasContainer){
                DOM.text(el.listContainer, "暂无内容");
            }
        }
    });
    return AddRemarkSmallTag;
},{
    requires:[
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/restaurant-management/remarks-management'
    ]
});
/**
 * 备注内容管理，包括添加、编辑、删除功能
 */
KISSY.add('remarks-management/add-remark-content', function(S){
    var
        $ = S.all,
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender = PW.mod.Defender,
        RemarksManagementIO = PW.io.RestManagement.RemarksManagement,
        el = {
            //添加备注内容触发器
            addContentTrigger: ".J_addRemarkContent",
            //编辑触发器
            editContentTrigger: ".J_editRemarkContent",
            //删除触发器
            delContentTrigger: ".J_delRemarkContent",
            //展开收缩链接触发器
            foldToggleTrigger: ".J_foldToggle",
            //备注内容对话框中表单
            addContentForm: ".J_addContentForm",
            //对话框模板
            contentDlgTemp: "#contentDlgTpl",
            //添加备注内容模板
            addContentTemp: "#addContentTpl",
            //表格head模板
            tableHeadTemp:"#tableHeadTpl"
        },
        //备注分类id
        DATA_SMALL_TAG_ID = "data-small-tag-id",
        //备注分类名称
        DATA_SMALL_TAG_NAME = "data-small-tag-name",
        //备注内容id
        DATA_REMARK_CONTENT_ID = "data-remark-content-id";

    function AddRemarkContent(param){
        this.defender;
        this.isEdit;
        this.title;
        this._init();
    }

    S.augment(AddRemarkContent, {
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var 
                that = this;
            //添加
            delegate(document, 'click', el.addContentTrigger, function(e){
                that.isEdit = false;
                that.title = "添加";
                that._addRemarkContent(e.target);
            })
            //编辑
            delegate(document, 'click', el.editContentTrigger, function(e){
                that.isEdit = true;
                that.title = "编辑";
                that._editRemarkContent(e.target);
            });
            //删除
            delegate(document, 'click', el.delContentTrigger, function(e){
                that._delRemarkContent(e.target);
            });
        },
        /**
         * 添加备注内容时，获取备注分类相关数据
         * @param {[type]} e [description]
         */
        _addRemarkContent: function(e){
            var
                that = this,
                divEl = DOM.parent(e, 'div'),
                pEl = DOM.get('p', divEl),
                tableEl = DOM.next(divEl, 'table'),
                tbodyEl = DOM.children(tableEl, 'tbody'),
                trEl = DOM.children(tbodyEl, 'tr'),
                data = DOM.serialize(trEl);
    
            //获取备注名称，保留于渲染时使用
            S.mix(data, {
                smallTagName: DOM.attr(pEl, DATA_SMALL_TAG_NAME),
                smallTagId: DOM.attr(pEl, DATA_SMALL_TAG_ID)
            });
            that._openDialog(data, tbodyEl, null);
        },
        /**
         * 编辑备注内容时，获取备注分类相关数据
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editRemarkContent: function(e){
            var
                that = this,
                tdEl = DOM.parent(e, 'td'),
                trEl = DOM.parent(tdEl, 'tr'),
                tableEl = DOM.parent(trEl, 'table'),
                divEl = DOM.parent(tableEl, 'div'),
                pEl = DOM.get('p', divEl),
                data = DOM.serialize(trEl);

            S.mix(data, {
                smallTagName: DOM.attr(pEl, DATA_SMALL_TAG_NAME),
                smallTagId: DOM.attr(pEl, DATA_SMALL_TAG_ID)
            });

            that._openDialog(data, null, trEl);
        },
        /**
         * 弹出对话框
         * @param  {[type]} data    [description]
         * @param  {[type]} tbodyEl [description]
         * @param  {[type]} trEl    [description]
         * @return {[type]}         [description]
         */
        _openDialog: function(data, tbodyEl, trEl){
             var
                that = this,
                settings = {
                    title: that.title + '备注内容',
                    header: true,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validContentForm(data, me, tbodyEl, trEl);
                                    that._showFoldToggle(tbodyEl);
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
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.addContentForm, {});
                    }
                };
            that._renderDialog(data, settings); 
        },
        /**
         * 点击确定后，表格中有tr，则显示展开表格链接
         * @param  {[type]} tbodyEl [description]
         * @return {[type]}         [description]
         */
        _showFoldToggle: function(tbodyEl){
            var
                that = this,
                tableEl = DOM.parent(tbodyEl, 'table'),
                classifyDivEl = DOM.prev(tableEl, 'div'),
                foldEl = get(el.foldToggleTrigger, classifyDivEl),
                length = DOM.query('tr', tableEl).length;

            //添加结束后，判断table中有无tr，若有显示时表格open状态和“收起”
            if(length == 0){
                $(tableEl).slideDown(0.2, function(){
                    $(tableEl).addClass('open'); 
                    DOM.text(foldEl, '收起 >>');  //添加备注内容后显示收起
                });
            }else{  
                DOM.text(foldEl, '收起 >>');
            }
        },
        /**
         * 渲染对话框模板
         * @param  {[type]} data     [description]
         * @param  {[type]} settings [description]
         * @return {[type]}          [description]
         */
        _renderDialog: function(data, settings){
            var
                that = this,
                dlgTemp = DOM.html(el.contentDlgTemp),
                dlg,
                dlgStr;

            if(!that.isEdit){
                //模板中只需要渲染备注分类名称
                dlg = {
                    smallTagName: data.smallTagName,
                    weight: "1",
                    relatedCharge: "0.00"
                };
                dlgStr = Juicer.client(dlgTemp, {dlg: dlg});     
            }else{
                dlgStr = Juicer.client(dlgTemp, {dlg: data});
            }
            Dialog.alert(dlgStr, function(){}, settings); 
        },

        /**
         * 表单验证
         * @param  {[type]} data    [description]
         * @param  {[type]} me      [description]
         * @param  {[type]} tableEl [description]
         * @param  {[type]} trEl    [description]
         * @return {[type]}         [description]
         */
        _validContentForm: function(data, me, tbodyEl, trEl){
            var
                that = this,
                dialogData = DOM.serialize(el.addContentForm); 
     
            S.mix(dialogData,{
                smallTagId: data.smallTagId,    
            });

            that.defender.validAll(function(rs){  
               if(rs){
                    if(!that.isEdit){
                        that._sendAddcontent(dialogData, me, tbodyEl, trEl);
                    }else{
                        S.mix(dialogData, { 
                          id: data.id
                        });
                        that._sendEditContent(dialogData, me, tbodyEl, trEl);
                    }
                }else{
                    that._focusErrInp();
                }
            });  
        },
        /**
         * 发送添加备注分类数据
         * @param  {[type]} dialogData [description]
         * @param  {[type]} me         [description]
         * @param  {[type]} tbodyEl    [description]
         * @param  {[type]} trEl       [description]
         * @return {[type]}            [description]
         */
        _sendAddcontent: function(dialogData, me, tbodyEl, trEl){
            var
                that = this;

            RemarksManagementIO.addRemarkContent(dialogData,
                function(rs, data, errMsg){
                    if(rs){
                        //成功发送后，后台返回所添加备注内容id
                        S.mix(dialogData, {
                            id: data.id
                        });
                        me.close();
                        that._renderContent(dialogData, tbodyEl, trEl);
                        Dialog.alert('添加成功！', function(){}, {
                            enterHandler: true
                        });
                    }else{
                        Dialog.alert(errMsg);
                    }
            });    
        },
        /**
         * 发送编辑备注分类数据
         * @param  {[type]} dialogData [description]
         * @param  {[type]} me         [description]
         * @param  {[type]} tbodyEl    [description]
         * @param  {[type]} trEl       [description]
         * @return {[type]}            [description]
         */
        _sendEditContent: function(dialogData, me, tbodyEl, trEl){
            var
                that = this;

            RemarksManagementIO.editRemarkContent(dialogData, 
                function(rs, errMsg){
                    if(rs){
                        me.close();
                        that._renderContent(dialogData, tbodyEl, trEl);
                        Dialog.alert('编辑成功！', function(){}, {
                            enterHandler: true
                        });
                    }else{
                        Dialog.alert(errMsg);
                    }
            });
        },
        /**
         * 备注内容渲染
         * @param  {[type]} dialogData [description]
         * @param  {[type]} tbodyEl    [description]
         * @param  {[type]} trEl       [description]
         * @return {[type]}            [description]
         */
        _renderContent: function(dialogData, tbodyEl, trEl){
            var
                that = this,
                tableEl,
                length,
                classifyDivEl = DOM.prev(tableEl, 'div'),
                foldEl = get(el.foldToggleTrigger, classifyDivEl),
                //获取添加模板
                addContentTpl = DOM.html(el.addContentTemp),
                addContentStr = Juicer.client(addContentTpl, dialogData),
                addContentDOM = DOM.create(addContentStr),
                //表格头部模板
                tableHeadTpl = DOM.html(el.tableHeadTemp),
                tableHeadStr = Juicer.client(tableHeadTpl, {}),
                tableHeadDOM = DOM.create(tableHeadStr);
                
            if(!that.isEdit){
                tableEl = DOM.parent(tbodyEl, 'table');
                length = DOM.query('tr', tableEl).length;

                $(tableEl).slideDown(0.2, function(){
                    $(tableEl).addClass('open');
                    DOM.text(foldEl, '收起 >>'); 
                });
                //判断table中无tr，则添加时先加表头，再添加内容
                if(length == 0){
                    DOM.prepend(tableHeadDOM, tableEl);
                    DOM.prepend(addContentDOM, tbodyEl);
                }else{
                    DOM.prepend(addContentDOM, tbodyEl);
                }
            }else{  
                DOM.insertAfter(addContentDOM, trEl);
                DOM.remove(trEl);
            }
        },
         /**
         * 错误域聚焦
         * @return {[type]} [description]
         */
        _focusErrInp: function(){
             var
                that = this,
                errInp = get('.error-field', el.addContentForm);
            if(errInp){
                errInp.focus();
            }
        },
        /**
         * 删除备注内容
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _delRemarkContent: function(e){
            var 
                that = this,
                td = DOM.parent(e, 'td'),
                trEl = DOM.parent(td, 'tr'),
                tableEl = DOM.parent(trEl, 'table'),
                //获取备注备注分类id
                id = DOM.attr(trEl, DATA_REMARK_CONTENT_ID);

            Dialog.confirm('确定删除该分类内容吗？', function(){
                RemarksManagementIO.delRemarkContent({    
                    id: id
                },function(rs, errMsg){
                    if(rs){ 
                        that.removeOperation(tableEl, trEl);
                        Dialog.alert('删除成功！');
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 删除操作
         * @param  {[type]} tableEl [description]
         * @param  {[type]} trEl    [description]
         * @return {[type]}         [description]
         */
        removeOperation: function(tableEl, trEl){
            var
                that = this,
                theadEl = DOM.get('thead', tableEl),
                length = DOM.query('a', tableEl).length,
                classifyDivEl = DOM.prev(tableEl, 'div'),
                foldEl = get(el.foldToggleTrigger, classifyDivEl);

            DOM.remove(trEl);
            if(length == 2){
                DOM.remove(theadEl);
                $(tableEl).slideUp(0.2, function(){
                    $(tableEl).removeClass('open');
                    DOM.text(foldEl, '');
                });
            }
        }
    });
    return AddRemarkContent;
},{
   requires:[
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/restaurant-management/remarks-management'
    ] 
});