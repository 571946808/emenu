/*-----------------------------------------------------------------------------
 * @Description:     管理员-菜品管理-添加菜品成本卡
 * @Version:         2.0.0
 * @author:          jiangx(631724595@qq.com)
 * @date             2016.5.14
 * ==NOTES:=============================================
 * v1.0.0(2016.5.14):
 初始生成
 * ---------------------------------------------------------------------------*/
 KISSY.add('page/dish-management/cost-card-management-add', function(S,Core){
    PW.namespace("page.DishManagement.CostCardManagementAdd");
    PW.page.DishManagement.CostCardManagementAdd = function(param){
        new Core(param);
    };
 }, {
    requires:[
        'cost-card-management-add/core'
    ]
})
/* ---------------------------------------------------------------------------*/
KISSY.add('cost-card-management-add/core', function(S){
    var 
        DOM = S.DOM, $ = S.all, 
        on = S.Event.on, delegate = S.Event.delegate,
        Juicer = PW.mod.Juicer,
        Dialog = PW.widget.Dialog,
        Defender = PW.mod.Defender,
        SearchSelect = PW.module.SearchSelect,
        CostCardIO = PW.io.DishManagement.CostCardManagementAdd,
        el = {
            //存放菜品名称的隐藏input
            DishIdInp: '.J_dishId',
            //菜品名称搜索的El
            renderToEl: '.J_renderTo',
            //原材料搜索模板
            selectTpl: '#selectTpl',
            //菜品搜索输入框
            ingredientSearchInp: '.J_ingredientSearchInp',
            //tbodyEl
            tbodyEl: '.J_tbody',
            //添加原材料触发器
            addTrigger: '.J_add',
            //弹出框内容模板
            dialogTpl: '#dialogTpl',
            //弹出框中的表单
            dialogForm: '.J_DialogForm',
            //弹出框中原材料div
            ingredientEl: '#ingredient',
            //弹出层中搜索原材料列表中的li
            renderLi: '#ingredient .J_render-list',
            //弹出层中显示单位的span
            unitEl: '.input-group-addon',
            //弹出层中存放原材料id的隐藏inp
            ingredientIdInp:'.J_ingredientId',
            //弹出层中存放原材料name的隐藏inp
            ingredientNameInp:'.J_ingredientName',
            //弹出层中存放原材料unit的隐藏inp
            ingredientUnitInp:'.J_ingredientUnit',
            //列表模板
            listTpl: '#listTpl',
            //主料成本
            mainCostInp: '.J_mainCost',
            //辅料成本
            assistCostInp: '.J_assistCost',
            //调料成本
            deliciousCostInp: '.J_deliciousCost',
            //标准成本
            standardCostInp: '.J_standardCost',
            //保存触发器
            submitTrigger: '.J_submitBtn',
            //删除原材料触发器
            delTrigger: '.J_del',
            //编辑原材料触发器
            editTrigger: '.J_edit',
            //存放原材料的select
            ingredientSelect: '.J_ingredientSelect',
            //原材料渲染的div
            ingredientRenderTo: '#ingredient .J_renderTo',
            //保存所有信息的表单
            operForm :'.J_operForm',
            //存放成本卡id的input
            costCardIdInp :'.J_costCardId',
            //存放成本的inp
            priceInp : '.J_price'
        },
        //选择的物品id，保存在renderToEl上
        DATA_RESULT_ID = 'data-result-id',
        DATA_RESULT_NAME = 'data-result-name',
        DATA_RESULT_UNIT = 'data-result-unit';

    function Core(){
        this._init();
        this.defender = Defender.client(el.operForm, {});
    };

    S.augment(Core,{
        _init: function(){
            this._searchSelect();
            this._noDataTip();
            this._buildEvt();
            this.list = this._getOptions();
        },
        _buildEvt: function(){
            var 
                that = this;
            //添加
            $(el.addTrigger).on('click', function(){
                that._openDialog({});
            });
            //保存
            $(el.submitTrigger).on('click', function(){
                that._submitData();
            });
            //删除
            delegate(document, 'click', el.delTrigger,function(e){
                that._delIngredient(e.currentTarget);
            });
            //编辑
            delegate(document, 'click', el.editTrigger, function(e){
                that._editIngredient(e.currentTarget);
            })
            //点击物品搜索框时，去除错误的样式
            delegate(document, 'click', el.renderToEl, function(e){
                $(e.currentTarget).removeClass('error');
            })
            //点击原材料搜索框时，显示菜单
            delegate(document,'click', el.ingredientRenderTo, function(e){
                e.stopPropagation();
                that._openMenu(e.currentTarget);
            });
            //点击原材料的li
            delegate(document, 'click', el.renderLi, function(e){
                that._selectLi(e.currentTarget);
            });
            //阻止冒泡
            delegate(document, 'click', el.ingredientSearchInp, function(e){
                e.stopPropagation();
            });
            //搜索原材料
            delegate(document, 'keyup', el.ingredientSearchInp, function(e){
                that._getIngredient(DOM.val(e.currentTarget), e.currentTarget);
            });
            //手动修改成本时发送ajax
            on(el.priceInp, 'blur', function(e){
                that._getPrice(e.currentTarget);
            })
            on(document, 'click', function(){
                that._closeMenu();
            });
            //插件中取消和X的事件不一致
            delegate(document, 'click', '.dlg-close', function(){
                $('.J_ingredientInfo').removeAttr('disabled');
                $('.J_isEdit').removeClass('J_isEdit');
            })
        },
        /**
         * 调用searchSelect组件，搜索菜品
         * @return {[type]} [description]
         */
        _searchSelect: function(){
            var 
                that = this,
                id;

            that.SearchSelect = SearchSelect.client({
                selectPicker: '.J_dishSelect',
                liveSearch: true,
                root: '#basic',
                multiple: false,
                inDlg: true,
                urlCoreParam: 'getDish'
            });
            // 把菜品Id放到隐藏的input
            that.SearchSelect.on('selectAfter', function(e){
                id = DOM.attr('#basic .J_renderTo', DATA_RESULT_ID);
                $(el.DishIdInp).val(id);
            });
        },
        /**
         * 暂无数据提示
         * @return {[type]} [description]
         */
        _noDataTip: function(){
            var 
                that = this,
                hasTr = S.one('tr', el.tbodyEl),
                tipStr = '<tr class="J_tip"><td  colspan="7" align="center">暂无数据</td></tr>';

            if(!hasTr){
                $(el.tbodyEl).append(tipStr);
            }else{
                $('.J_tip').remove();
            }
        },
        /**
         * 关闭搜索列表
         * @private
         */
        _closeMenu: function(){
            var
                that = this,
                menuEl = DOM.get('ul', el.ingredientEl);
            
            DOM.addClass(menuEl, 'hidden');
        },
        /**
         * 打开搜索列表
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _openMenu: function(e){
            var
                that = this,
                ulEl = DOM.get('ul', e);

            $(ulEl).removeClass('hidden');
        },
        /**
         * 打开弹出框
         * @return {[type]} [description]
         */
        _openDialog: function(data){
            var 
                that = this,
                dialogTpl = $(el.dialogTpl).html(),
                dialogTplStr = Juicer.client(dialogTpl, {data: data}),
                settings = {
                    title: '添加原材料',
                    header: true,
                    width: 600,
                    hasAutoScroll: true,
                    footer: {
                        btns: [
                            {
                                text: '确定',
                                clickHandler: function(e, me){
                                    that._validDialogForm(me);
                                },
                                bType: 'submit',
                                className: 'J_ok'
                            },{
                                text: '取消',
                                clickHandler: function(e, me){
                                    me.close();
                                    $('.J_ingredientInfo').removeAttr('disabled');
                                    $('.J_isEdit').removeClass('J_isEdit');
                                }
                            }
                        ]
                    },
                    afterOpenHandler: function(e, me){
                        that._renderMenu(that.list);
                        that.dialogDefender = Defender.client(el.dialogForm, {showTip: false});   
                    }
                };
            Dialog.alert(dialogTplStr, function(){}, settings);
        },
        /**
         * 渲染菜单
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _renderMenu: function(data){
            var 
                that = this,
                selectTpl = $(el.selectTpl).html(),
                selectTplStr = Juicer.client(selectTpl, {list:data});

            DOM.insertAfter($(selectTplStr), $(el.ingredientRenderTo));
        },
        /**
         * 选中li后，把内容渲染到div中，并且关闭ul
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _selectLi: function(e){
            var 
                that = this,
                id = $(e).attr('data-id'),
                unit = $(e).attr('data-unit'),
                name = $(e).children().text(),
                unitEls = $(el.unitEl);

            $(el.ingredientRenderTo).html(name+ '<span class="caret"></span>');
            $(el.ingredientIdInp).val(id);
            $(el.ingredientUnitInp).val(unit); 
            $(el.ingredientNameInp).val(name);
            S.each(unitEls, function(item){
                $(item).text(unit);
            });
        },
        /**
         * 点击保存时验证表单
         * @return {[type]} [description]
         */
        _validDialogForm: function(me){
            var   
                that = this,
                data = DOM.serialize(el.dialogForm),
                ingredientId = DOM.val(el.ingredientIdInp),
                operType = $(el.dialogForm).attr('data-oper-type');

            if(ingredientId){
                that.dialogDefender.validAll(function(rs){
                    if(rs){
                        me.close();
                        that._submitIngredient(data, operType);
                    }
                });
            }else{
               $(el.ingredientRenderTo).addClass('error');
            }
        },
        /**
         * 把数据渲染到列表里面
         * @param  {[type]} data     [description]
         * @param  {[type]} operType [description]
         * @return {[type]}          [description]
         */
        _renderList: function(data, operType){
            var
                that = this,
                listTpl = $(el.listTpl).html(),
                listTplStr = Juicer.client(listTpl, {data:data}),
                oldTr = $('.J_isEdit'),
                hasTip = S.one('.J_tip');

            if(hasTip){
                $('.J_tip').remove();
            }
            if(operType == 1){
                //编辑状态,替换编辑前的tr
                DOM.replaceWith($(oldTr), $(listTplStr)); 
            }else{
                $(el.tbodyEl).append($(listTplStr));
            }
        },
        /**
         * 弹出框，提交原材料的操作
         * @param  {[type]} data     [description]
         * @param  {[type]} operType [description]
         * @return {[type]}          [description]
         */
        _submitIngredient: function(data, operType){
            var 
                that = this,
                existData,
                afterRegDataStr,
                dataStr = JSON.stringify(data),
                renderData = S.merge(data, {dataStr: dataStr}),
                sendData;

            if(operType == 1){
                //编辑后的提交, 这里为了把两个数据合在一起，使用了字符串的拼接，又涉及到了截取，正则表达式替换等操作
                existData = DOM.serialize(el.tbodyEl);
                
                if(S.isEmptyObject(existData)){
                    sendData = dataStr;
                }else{
                    existDataStr = JSON.stringify(existData),
                    afterRegDataStr = dataStr.replace(/\"/g,'\\\"'),
                    dataStr = existDataStr.substring(0,existDataStr.length-2) + ',' + afterRegDataStr + '"}';
                    sendData = JSON.parse(dataStr);
                }                               
                that._afterEditIngredient(sendData, renderData, operType);
            }else{
                //添加后的提交
                S.mix(data, {
                    mainCost: $(el.mainCostInp).val(),
                    assistCost: $(el.assistCostInp).val(),
                    deliciousCost: $(el.deliciousCostInp).val()
                });
                that._afterAddIngredient(data, renderData, operType);
            }
        },
        /**
         * 添加时，发送ajax获取成本
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _afterAddIngredient: function(data, renderData, operType){
            var
                that = this;

            CostCardIO.afterAddIngredient(data, function(rs, data, errMsg){
                if(rs){
                    //渲染data中的price
                    that._renderList(renderData, operType);
                    that._renderPrice(data);
                }else{
                    Dialog.alert(errMsg);
                }
            })  
        },
        /**
         * 编辑时发送ajax，获取成本
         * @return {[type]} [description]
         */
        _afterEditIngredient: function(data, renderData, operType){
            var
                that = this;

            CostCardIO.afterEditIngredient(data, function(rs, data, errMsg){
                if(rs){
                    that._renderList(renderData, operType);
                    that._renderPrice(data);
                }else{
                    Dialog.alert(errMsg);
                    $('.J_ingredientInfo').removeAttr('disabled');
                    $('.J_isEdit').removeClass('J_isEdit');
                }
            })
        },
        /**
         * 把成本渲染到页面上
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _renderPrice: function(data){
            var 
                that = this;

            DOM.val($(el.mainCostInp),data.mainCost);
            DOM.val($(el.assistCostInp),data.assistCost);
            DOM.val($(el.deliciousCostInp),data.deliciousCost);
            DOM.val($(el.standardCostInp),data.standardCost);    
        },
        /**
         * 获取第一次的下拉列表内容
         * @return {[type]} [description]
         */
        _getOptions: function(){
            var 
                that = this,
                list = [],
                ingredientId,
                code,
                name,
                unit;

            S.each($(el.ingredientSelect).children(), function(item){
                data = {
                    ingredientId : $(item).attr('value'),
                    code : $(item).attr('data-code'),
                    name : $(item).text(),
                    unit : $(item).attr('data-unit')
                };
                list.push(data);
            })
            return list;
        },
        
        /**
         * ajax 根据搜索内容获取菜品列表，并且渲染到页面上
         * @param  {[type]} value [description]
         * @param  {[type]} e     [description]
         * @return {[type]}       [description]
         */
        _getIngredient: function(value, e){
            var
                that = this,
                newElement = '',
                ulEl = $(e).parent('ul'),
                lis = DOM.query('li', ulEl);

            CostCardIO.getIngredient({keyword: value}, function(rs, data, errMsg){
                if(rs){
                    S.each(data, function(item){
                        newElement += '<li class="J_render-list" data-id="'+ item.id +'" data-unit="'+ item.unit + '">'
                                +'<a href="javascript:;">'+ '[' +item.assistantCode + ']' + '&nbsp;' + item.name +'</a>'
                                +'</li>' ;
                    })
                    DOM.remove(lis);
                    $(ulEl).append(newElement);
                }
            })
        },
        _submitData: function(){
            var
                that = this,
                dishId = $(el.DishIdInp).val(),
                data = DOM.serialize(el.operForm);
            if(dishId){
                that.defender.validAll(function(rs){
                    if(rs){
                        CostCardIO.submitData(data, function(rs, data, errMsg){
                            if(rs){
                                Dialog.alert('保存成功!', function(){
                                    window.location.href = data;
                                });
                            }else{
                                Dialog.alert(errMsg);
                            }
                        })
                    }
                })
            }else{
                $(el.renderToEl).addClass('error');
            }
            
        },
        _delIngredient: function(e){
            var 
                that = this,
                trEl = $(e).parent('tr'),
                data = {
                    ingredientId: $(trEl).attr('data-ingredient-id'),
                    itemType: $(trEl).children('.J_itemType').attr('data-itemType'),
                    otherCount: $(trEl).children('.J_otherCount').text(),
                    mainCost: $(el.mainCostInp).val(),
                    assistCost:$(el.assistCostInp).val(),
                    deliciousCost:$(el.deliciousCostInp).val()
                };
            that._sendDelData(data, trEl);
        },
        /**
         * ajax 删除原材料发送id和3个成本
         * @param  {[type]} data [description]
         * @param  {[type]} trEl [description]
         * @return {[type]}      [description]
         */
        _sendDelData: function(data, trEl){
            var
                that = this;
            CostCardIO.delIngredient(data, function(rs, data, errMsg){
                if(rs){
                    DOM.remove(trEl);
                    that._renderPrice(data); 
                }else{
                    Dialog.alert(errMsg);
                }
            })
        },
        /**
         * 编辑原材料
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _editIngredient: function(e){
            var
                that = this,  
                trEl = $(e).parent('tr'),
                infoInp = DOM.get('.J_ingredientInfo',trEl),
                dataStr = $(infoInp).val(),
                //把字符串转换为对象
                dataObject = JSON.parse(dataStr);

            DOM.attr(infoInp, 'disabled', 'disabled');    
            S.mix(dataObject, {isEdit:1});
            $(trEl).addClass('J_isEdit');
            that._openDialog(dataObject);
        },
        /**
         * 手动添加成本时，失去焦点发ajax
         * @return {[type]} [description]
         */
        _getPrice: function(){
            var
                that = this,
                data = {
                    mainCost: $(el.mainCostInp).val(),
                    assistCost: $(el.assistCostInp).val(),
                    deliciousCost: $(el.deliciousCostInp).val()
                };

            CostCardIO.getPrice(data, function(rs, data, errMsg){
                if(rs){
                    that._renderPrice(data);
                }else{
                    Dialog.alert(errMsg);
                }
            });
        }

    })

    return Core;

 }, {
    requires:[
        'module/search-select',
        'mod/juicer',
        'widget/dialog',
        'mod/defender',
        'pio/dish-management/cost-card-management-add'
    ]
})