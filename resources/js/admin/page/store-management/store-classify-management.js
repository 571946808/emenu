/*-----------------------------------------------------------------------------
 * @Description:     库存管理--库存分类管理
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.10
 * ==NOTES:=============================================
 * v1.0.0(2015.11.10):
 * 	初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/store-management/store-classify-management',function(S, Core){
    PW.namespace('page.StoreManagement.StoreClassifyManagement');
    PW.page.StoreManagement.StoreClassifyManagement = function(param){
        return new Core(param);
    }
},{
    requires: [
        'store-classify-management/core'
    ]
});

KISSY.add('store-classify-management/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on, delegate = S.Event.delegate,
        $ = S.all,
        Dialog = PW.widget.Dialog,
        Juicer = PW.mod.Juicer,
        Defender= PW.mod.Defender,
        StoreClassifyManagementIO = PW.io.StoreManagement.StoreClassifyManagement,
        el = {
            // 添加库存大类触发器
            addBigTagTrigger: '.J_addBigTag',
            // 编辑库存大类触发器
            editBigTagTrigger: '.J_editBigTag',
            // 删除库存大类触发器
            delBigTagTrigger: '.J_delBigTag',
            // 添加库存小类触发器
            addSmallTagTrigger: '.J_addSmallTag',
            // 编辑库存小类触发器
            editSmallTagTrigger: '.J_editSmallTag',
            //删除库存小类触发器
            delSmallTagTrigger: '.J_delSmallTag',
            // 添加对话框表单
            addForm: '.J_addForm',
            // 操作表单
            operForm: '.J_operForm',
            // 对话框模板
            dlgTemp: '#dlgTpl',
            // 大类渲染模板
            bigClassifyTemp: '#bigTagTpl',
            // 数据容器
            dataContainer: '.J_classify',
            // 隐藏域
            inputGroupEl: '.J_inputGroup',
            // 小类渲染模板
            smallClassifyTemp: '#smallTagTpl',
            // 收起\展开小类触发器
            foldToggleTrigger: '.J_foldToggle',
            // 小类ul
            smallClassifyUl: '.J_smallClassify'
        },
        DATA_ROOT_TAG_NAME = 'data-root-tag-name',
        DATA_ROOT_TAG_ID = 'data-root-tag-id',
        DATA_BIG_TAG_NAME = 'data-big-tag-name',
        DATA_BIG_TAG_ID = 'data-big-tag-id',
        DATA_SMALL_TAG_NAME = 'data-small-tag-name',
        DATA_SMALL_TAG_ID = 'data-small-tag-id';

    function Core(param){
        this.smallCount = 0;
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._showToggle();
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;

            on(el.addBigTagTrigger, 'click', function(){
                that.isEdit = false;
                that.title = '添加';
                that.type = '大';
                that._openDlg();
            });

            delegate(el.dataContainer, 'click', el.editBigTagTrigger, function(e){
                that.isEdit = true;
                that.title = '编辑';
                that.type = '大';
                that._getBigClassify(e.target);
                that._openDlg(e.target);
            });

            delegate(el.dataContainer, 'click', el.addSmallTagTrigger, function(e){
                that.isEdit = false;
                that.title = '添加';
                that.type = '小';
                that._openSmallDlg(e.target);
            });

            delegate(el.dataContainer, 'click', el.editSmallTagTrigger, function(e){
                that.isEdit = true;
                that.title = '编辑';
                that.type = '小';
                that._getSmallClassify(e.target);
            });

            delegate(el.dataContainer, 'click', el.delBigTagTrigger, function(e){
                that._delStoreBigClassify(e.target);
            });

            delegate(el.dataContainer, 'click', el.delSmallTagTrigger, function(e){
                that._delStoreSmallClassify(e.target);
            });

            delegate(el.dataContainer, 'click', el.foldToggleTrigger, function(e){
                that._foldToggle(e.target);
            });

            //delegate(el.addForm, 'submit', function(e){
            //    if(e.keyCode == 13 || e.which == 13){
            //        return false;
            //    }
            //    return false;
            //});
        },
        _showToggle: function(){
            var
                that = this,
                smallUl = query(el.smallClassifyUl, el.operForm),
                length,
                foldEl,
                bigLi;

            S.each(smallUl, function(ul){
                length = query('li', ul).length;
                bigLi = DOM.parent(ul, 'li');
                foldEl = get(el.foldToggleTrigger, bigLi);
                if(length == 0){
                    DOM.text(foldEl, '');
                }
            });
        },
        /**
         * 展开\收起小类
         * @param e
         * @private
         */
        _foldToggle: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                smallUl = get('ul', li),
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
         * 删除库存大类
         * @param e
         * @private
         */
        _delStoreBigClassify: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                id = DOM.attr(li, DATA_BIG_TAG_ID),
                rootId = DOM.attr(li, DATA_ROOT_TAG_ID);

            Dialog.confirm('确定删除此大类吗?', function(){
                StoreClassifyManagementIO.delStoreClassify({
                    id: id
                }, function(rs, errMsg){
                    if(rs){
                        DOM.remove(li);
                        Dialog.alert('删除成功!');
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 删除库存小类
         * @param e
         * @private
         */
        _delStoreSmallClassify: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                id = DOM.attr(li, DATA_SMALL_TAG_ID),
                ul = DOM.parent(li, 'ul'),
                bigTagId = DOM.attr(ul, DATA_BIG_TAG_ID),
                bigLi = DOM.parent(ul, 'li'),
                smallCount;

            Dialog.confirm('确定删除此小类吗?', function(){
                StoreClassifyManagementIO.delStoreClassify({
                    id: id,
                    pId: bigTagId
                }, function(rs, errMsg){
                    if(rs){
                        DOM.remove(li);
                        Dialog.alert('删除成功!');
                        smallCount = query('li', ul).length;
                        if(smallCount == 0){
                            var
                                foldEl = get(el.foldToggleTrigger, bigLi);
                            DOM.text(foldEl, '');
                            DOM.css(ul, 'display', 'none');
                        }
                    }else{
                        Dialog.alert(errMsg);
                    }
                });
            });
        },
        /**
         * 获取小类
         * @param e
         * @private
         */
        _getSmallClassify: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                data = DOM.serialize(li),
                ul = DOM.parent(li, 'ul');

            S.mix(data, {
                pName: DOM.attr(ul, DATA_BIG_TAG_NAME)
            });
            that._openSmallEditDlg(li, data);
        },
        /**
         * 打开编辑小类对话框
         * @param li  当前小类li
         * @param data 当前小类内容
         * @private
         */
        _openSmallEditDlg: function(li, data){
            var
                that = this,
                settings = {
                    title: that.title +  '库存' + that.type + '类',
                    header: true,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validSmallForm(me, null, li);
                                },
                                className: 'J_ok',
                                bType: 'submit'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                },
                                bType: 'button'
                            }
                        ]
                    },
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.addForm, {});
                        on(el.addForm, 'submit', function(){
                            that._validSmallForm(me, null, li);
                            return false;
                        });
                    }
                };

            var
                dlgTemp = DOM.html(el.dlgTemp),
                dlgStr = Juicer.client(dlgTemp, data);
            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 打开添加小类对话框
         * @param e
         * @private
         */
        _openSmallDlg: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'), // 大类的li
                bigTagName = DOM.attr(li, DATA_BIG_TAG_NAME),
                bigTagId = DOM.attr(li, DATA_BIG_TAG_ID),
                smallUl = get('ul', li),
                settings = {
                    title: that.title +  '库存' + that.type + '类',
                    header: true,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validSmallForm(me, smallUl, null);
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
                        on(el.addForm, 'submit', function(){
                            that._validSmallForm(me, smallUl, null);
                            return false;
                        });
                    }
                };

            var
                dlgTemp = DOM.html(el.dlgTemp),
                dlgStr = Juicer.client(dlgTemp, {
                    pId: bigTagId,
                    pName: bigTagName
                });
            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 验证小类添加表单
         * @param me 对话框
         * @param smallUl 大类下面的小类ul列表,用于添加小类使用
         * @param li 小类,用于渲染修改之后的小类
         * @private
         */
        _validSmallForm: function(me, smallUl, li){
            var
                that = this,
                storeData = DOM.serialize(el.addForm),
                errInp;
            that.defender.validAll(function(rs){
                if(rs){
                    if(!that.isEdit){
                        StoreClassifyManagementIO.addStoreClassify(storeData, function(rs, data, errMsg){
                            if(rs){
                                S.mix(storeData, {
                                    id: data.id
                                });
                                me.close();
                                that._renderStoreSmallClassify(storeData, smallUl, null, false);
                                Dialog.alert('添加成功!', function(){}, {
                                    enterHandler: true
                                });
                            }else{
                                Dialog.alert(errMsg);
                            }
                        });
                    }else{
                        StoreClassifyManagementIO.editStoreClassify(storeData, function(rs, errMsg){
                            if(rs){
                                me.close();
                                that._renderStoreSmallClassify(storeData, null, li, true);
                                Dialog.alert('编辑成功!', function(){}, {
                                    enterHandler: true
                                });
                            }else {
                                Dialog.alert(errMsg);
                            }
                        });
                    }
                }else{
                    that._focusErrInp();
                }
            });
        },
        /**
         * 渲染小类
         * @param storeData
         * @param smallUl 添加小类到当前小类列表ul中
         * @param li 编辑小类,用于渲染编辑之后的小类li
         * @param bool
         * @private
         */
        _renderStoreSmallClassify: function(storeData, smallUl, li, bool){
            var
                that = this,
                smallTagTemp = DOM.html(el.smallClassifyTemp),
                smallTagStr = Juicer.client(smallTagTemp, storeData),
                smallTagDOM = DOM.create(smallTagStr),
                bigLi, foldEl,
                smallCount;

            if(!bool){
                DOM.prepend(smallTagDOM, smallUl);
                bigLi = DOM.parent(smallUl, 'li');
                foldEl = get(el.foldToggleTrigger, bigLi);
                DOM.text(foldEl, '收起 >>');
                smallCount = query('li', smallUl).length;
                if(smallCount > 0){
                    DOM.css(smallUl, 'display', 'block');
                }
            }else{
                DOM.insertAfter(smallTagDOM, li);
                DOM.remove(li);
            }
        },
        /**
         * 获取大类
         * @param e
         * @private
         */
        _getBigClassify: function(e){
            var
                that = this,
                li = DOM.parent(e, 'li'),
                inputGroupEl = get(el.inputGroupEl, li),
                storeData = DOM.serialize(inputGroupEl);

            that.storeData = storeData;
        },
        /**
         * 打开添加大类对话框
         * @param target
         * @private
         */
        _openDlg: function(target){
            var
                that = this,
                dlgTemp = DOM.html(el.dlgTemp),
                dlgStr,
                li = DOM.parent(target, 'li'), // 大类li
                settings = {
                    title: that.title +  '库存' + that.type + '类',
                    header: true,
                    width: 800,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validForm(me, li);
                                },
                                className: 'J_ok',
                                bType: 'submit'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                },
                                bType: 'button'
                            }
                        ]
                    },
                    afterOpenHandler: function(e, me){
                        that.defender = Defender.client(el.addForm, {});
                        on(el.addForm, 'submit', function(){
                            that._validForm(me, li);
                            return false;
                        });
                    }
                };

            if(!that.isEdit){
                dlgStr = Juicer.client(dlgTemp, {
                    pName: '顶级分类'
                });
            }else{
                S.mix(that.storeData, {
                    pName: DOM.attr(li, DATA_ROOT_TAG_NAME)
                });
                dlgStr = Juicer.client(dlgTemp, that.storeData);
            }

            Dialog.alert(dlgStr, function(){}, settings);
        },
        /**
         * 验证添加/编辑大类的表单
         * @param me
         * @param li 大类li,用于以后将修改之后的大类li渲染
         * @private
         */
        _validForm: function(me, li){
            var
                that = this,
                storeData = DOM.serialize(el.addForm),
                errInp;

            that.defender.validAll(function(rs){
                if(rs){
                    if(!that.isEdit){
                        S.mix(storeData, {
                            pId: 2
                        });
                        StoreClassifyManagementIO.addStoreClassify(storeData, function(rs, data, errMsg){
                            if(rs){
                                S.log(data.id);
                                S.mix(storeData, {
                                    id: data.id  // data.id
                                });
                                me.close();
                                that._renderStoreBigClassify(storeData, null, false);
                                Dialog.alert('添加成功!', function(){}, {
                                    enterHandler: true
                                });
                            }else{
                                Dialog.alert(errMsg);
                            }
                        });
                    }else{
                        StoreClassifyManagementIO.editStoreClassify(storeData, function(rs, errMsg){
                            if(rs){
                                me.close();
                                that._renderStoreBigClassify(storeData, li, true);
                                Dialog.alert('编辑成功!', function(){}, {
                                    enterHandler: true
                                });
                            }else{
                                Dialog.alert(errMsg);
                            }
                        });
                    }
                }else{
                    that._focusErrInp();
                }
            });
        },
        /**
         * 错误域聚焦
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
         * 渲染大类li
         * @param storeData
         * @param li 当前的大类li
         * @param bool
         * @private
         */
        _renderStoreBigClassify: function(storeData, li, bool){
            var
                that = this,
                bigClassifyTemp = DOM.html(el.bigClassifyTemp),
                bigClassifyStr = Juicer.client(bigClassifyTemp, storeData),
                bigClassifyDOM = DOM.create(bigClassifyStr),
                smallUl = get('ul', bigClassifyDOM);

            if(!bool){
                DOM.prepend(bigClassifyDOM, el.dataContainer);
                DOM.css(smallUl, 'display', 'none');
            }else{
                DOM.insertAfter(bigClassifyDOM, li);
                var
                    smallStoreClassifyEl = get('ul', li),
                    smallLiEl = query('li', smallStoreClassifyEl),
                    newUl = get('ul', bigClassifyDOM);

                if(smallLiEl.length == 0){
                    DOM.css(smallUl, 'display', 'none');
                }
                DOM.append(smallLiEl, newUl);
                DOM.remove(li);
            }
        }
    });

    return Core;
},{
    requires: [
        'widget/dialog',
        'mod/defender',
        'mod/juicer',
        'pio/store-management/store-classify-management'
    ]
});