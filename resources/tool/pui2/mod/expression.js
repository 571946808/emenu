/**
 * @Description:     表情插件模块
 * @Version:         3.0.0
 * @author:          Nina(1284663246@qq.com)
 * @date             2015-3-24
 * ==NOTES:=============================================
 * 版本备注：
 *     以前没有写注释，先添上；
 *     以前是PW.expression调入，但考虑到需要一个直接从文本中转换html代码的功能，所以将PW.expression细分为
 *     PW.expression.shell-主要负责表情的点击渲染外壳
 *     PW.expression.pkg-主要负责表情包的管理
 * ----------------------------------------------------------------------------------*/
KISSY.add('mod/expression', function(S,Core) {
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query;
    var
        Expression = {
            version: '3.0.0',
             client: function(param){
                return new Core(param);
            }
        };
    S.mix(S,{
        expression: Expression
    });
    PW.namespace('mod.Expression');
    PW.mod.Expression = Expression;
    return Expression;
}, {
    requires: ['expression/core']
});

/**
 * 表情组件
 * author:Simon(406400939@qq.com)
 * version: v2.0.1
 * note:
 *  v2.0.0(2012.10.11)
 *      基于以前的表情组件所表现出来的问题进行了重构，主要改进是支持了页面的多表情的情况和主体切换问题
 *  v2.0.1(2012.11.22)
 *      将表情包的外部功能添加到PW上方便后期在不配置表情外壳的时候调用
 *  v.3.0.1(2015.3.24)
 *      将表情组件升级到kissy1.4版本，对外接口为Expresssion.client(param)
 */


KISSY.add('expression/core',function(S,juicer,pkgManage,Overlay){
    
    var 
        DOM = S.DOM, get = DOM.get, query = DOM.query, on = S.Event.on, delegate = S.Event.delegate, detch = S.Event.detch, IO = S.IO, Juicer = juicer.client, JSON = S.JSON,
        EXP_HOLDER_TEMP = '' +
                          '<div class="exp-layer theme-a">' +
                            '<div class="exp-tgl"></div>' +
                            '<div class="exp-holder">' +
                                '<div class="exp-close clearfix">' +
                                    '<a href="javascript:;">X</a>' +
                                '</div>' +
                                '<div class="exp-group-tab">' + 
                                     '<ul>' +
                                        '{@each groups as group,index}' +
                                        '<li gid="&{index}"><a href="javascript:;">&{group.name}</a></li>' +
                                        '{@/each}'+
                                     '</ul>' +
                                     '<div class="exp-tab-btn">'+
                                        '<a class="exp-pre-group disable" href="javascript:;">&lt;</a>' +
                                        '<a class="exp-next-group" href="javascript:;">&gt;</a>'+
                                     '</div>'+
                                '</div>'+
                                '<div class="exp-icons-holder">' + 
                                '</div>' +
                            '</div>' +
                          '</div>',
                     
        ICONS_TEMP = '' +
                         '<div class="exp-icons-wrapper">' +
                         '<ul class="exp-icon-list clearfix">' + 
                             '{@each icons as icon,index}' + 
                             ' <li title="&{icon.title}"><img src="&{icon.src}" alt="&{icon.title}" /></li>' + 
                             '{@/each}' + 
                         '</ul>' + 
                         '<p>' + 
                             '<a class="exp-pre-page disable" href="javascript:;">上一页</a>' + 
                             '<a class="exp-next-page" href="javascript:;">下一页</a>' + 
                         '</p>' + 
                         '</div>', 
        EXP_TRIGGER = '.exp-trigger',
        EXP_TEXTAREA = '.exp-textarea',
        //固定组件的宽度
        FIXED_WIDTH_VALUE = 385,
        //单页允许的总图标页数
        PAGE_MAX_ICONS_COUNT = 60,
        //正常显示时，小三角的偏移距离
        TRI_CORRECTION = 80,
        CONFIG = {
            renderTo:'',
            type:'popup',
            theme:'a',
            zIndex:100,
            expPkgName  :'common',
            closeAfterSelect: true,
            olStyle:{
                zIndex: 101,
                bgColor:'#fff',
                opacity: 0.4,
                topLayer:0,
                cursor: 'pointer'
            }
        },
        //表亲管理对象
        pm = new pkgManage(),
        THEME_URL = PW.Env.puiWebsite + 'assets/expression/style.css';
    Juicer.set({
        'tag::operationOpen': '{@',
        'tag::operationClose': '}',
        'tag::interpolateOpen': '&{',
        'tag::interpolateClose': '}',
        'tag::noneencodeOpen': '$${',
        'tag::noneencodeClose': '}',
        'tag::commentOpen': '{#',
        'tag::commentClose': '}'
    });
    
    function Exp(param){
        this.opts = S.merge(CONFIG,param);
        //每个表情组件的唯一id值
        this.expId = 'exp-' + S.guid();
        //弹出表情面板的HTML代码
        this.panelHTML;
        //弹出表情窗口的HtmlElement对象
        this.panelDOM;
        //表情组数据块
        this.pkgData = pm.getPkgDataByName(this.opts.expPkgName);
        //icons
        this.iconsDOM;
        //当前显示组序号
        this.currentGroup;
        //页面中渲染元素中的触发器
        this.trigger;
        //页面中的文本输入框
        this.textArea;
        //当前组的分页显示数
        this.curGroupPg; 
        //当前图标的分页显示数
        this.curIconPg;
        
        //触发trigger的遮罩
        this.mask = Overlay.client(this.opts.olStyle);
        this.__constructor();
    }
    
    S.augment(Exp,S.EventTarget);
    
    S.augment(Exp,{
        __constructor:function(){
            var
                that = this,
                opts = that.opts,
                trigger = get(EXP_TRIGGER,opts.renderTo),
                textArea = get(EXP_TEXTAREA,opts.renderTo) || get('textarea',opts.renderTo);
            //配置页面的css
            S.getScript(THEME_URL,{
                charset:'utf-8'
            })

            //判断页面的renderTo元素中是否具有合法的触发器和文本输入框
            if(trigger && textArea){
                that.trigger = trigger;
                that.textArea = textArea;
                //生成panelDOM，但暂时不添加到DOM树上
                that._createExpDOM();
                that.curGroupPg = 0; 
                that.curIconPg = 0;
                that._addTriggerEvt();
            }

        },
        /**
         * 显示表情
         */
        show: function(){
            var
                that = this,
                trigger = that.trigger,
                offset, l, t, tw, th,dw,bw,
                panelDOM = that.panelDOM,
                triDOM = get('.exp-tgl',panelDOM),
                hasRendered = false,
                cssOpts = {};
                
            if(trigger){
                offset = DOM.offset(trigger);
                l = offset.left;
                t = offset.top;
                tw = DOM.width(trigger);
                th = DOM.outerHeight(trigger);
                dw = DOM.width(document);
                bw = DOM.outerWidth(panelDOM);
                cssOpts.left = (l + tw/2 + bw > dw) ? dw - bw : l + tw/2 - TRI_CORRECTION
                cssOpts.top = t + th ;
                DOM.css(panelDOM,cssOpts);

                DOM.css(triDOM,{
                    left: (l + tw/2 + bw > dw) ? l + tw/2 -dw + bw :  TRI_CORRECTION
                })
                
                that.mask.render();
                hasRendered = (DOM.parent(panelDOM))? true : false;
                if(hasRendered){
                    DOM.show(panelDOM);
                }else{
                    DOM.append(panelDOM,'body');
                }
            }
        },
        /**
         * 隐藏dom
         */
        hide: function(){
            var
                that = this,
                panelDOM = that.panelDOM;
            DOM.hide(panelDOM);
            that.mask.destroy();
        },
        
        /**
         * 根据刷新表情数据，如果pkgName存在，则在pkgManage中找寻，如果pkgName传入的是一个表情包数据，则 重新刷新表情，如果找不到，则默认显示第一个，如果pkgName没有定义，则默认使用当前pkgName对应的表情
         * param: pkg-表情代号，对应的表情区块信息。pkg为obj，则直接刷新，如果是代号，则调取表情，如果是空，则默认获取存在第一组表情
         * return: 重新加载数据的boolean结果
         */
        reload: function(pkg){
            var 
                that = this;
            try{
                that.pkgData = (S.isString(pkg) || !pkg || pkg == '') ? pm.getPkgDataByName(pkg) : pkg;
                that.__constructor();
                return true;
            }catch(err){
                S.log(err);
                return false;
            }
        },
        
        //将当前配置的表情组件中的textarea中的数据格式化后输出
        
        textFormat:function(){
            var
                that = this,
                t;
            t = DOM.val(that.textArea);
            return  pm.textFormat(t,that.opts.expPkgName);
        },
        /**
         * 关闭页面中所有的弹出表情
         */
        closeAllExpPanel: function(){
            
        },    
        //主要是根据初始化的内容添加各个事件
        _addTriggerEvt: function(){
            var
                that = this,
                trigger = that.trigger,
                mask = that.mask;
            
              on(trigger,'click',function(evt){
                that.show();
                mask.on('click',function(me){
                    that.hide();
                });
            })
        },
        /**
         * 为expDOM添加一个点击事件，包括关闭事件和组点击事件
         */
        _addExpDOMEvt: function(){
             var
                that = this,
                panelDOM = that.panelDOM,
                pkgData = that.pkgData,
                closeTrigger = get('.exp-close a',panelDOM),
                groupLists = query('.exp-group-tab li',panelDOM),
                preGroupPgBtn = get('.exp-pre-group',panelDOM),
                nextGroupPgBtn = get('.exp-next-group',panelDOM),
                prePageSelector = '.exp-pre-page',
                nextPageSelector = '.exp-next-page';
             
             
             that._tabSwitchBtnCheck();
             //添加closede的点击事件
             on(closeTrigger,'click',function(evt){
                 that.hide();
             });
             
             //添加组切换事件
             on(groupLists,'click',function(evt){
                 var gid = DOM.attr(this,'gid'),
                     group;
                 group = pm.getGroupInfo(gid,pkgData);
                 that._switch2Tab(gid);
             })
             
             //添加组分页事件
             on(nextGroupPgBtn,'click',function(evt){
                 var
                    cgp = that.curGroupPg,
                    panelDOM = that.panelDOM,
                    tabHolder = get('.exp-group-tab ul',panelDOM),
                    curFirstLi = query('.exp-group-tab li',panelDOM)[cgp],
                    curFirstLi_w = DOM.width(curFirstLi),
                    tabHolder_left = parseInt(DOM.css(tabHolder,'left'));
                 if(that._hasNextGroup()){
                    DOM.css(tabHolder,{
                        left : tabHolder_left - curFirstLi_w - 5
                    });
                    that.curGroupPg ++;
                    that._tabSwitchBtnCheck();
                 }
             })
             on(preGroupPgBtn,'click',function(evt){
                var
                    cgp = that.curGroupPg,
                    panelDOM = that.panelDOM,
                    tabHolder = get('.exp-group-tab ul',panelDOM),
                    preCurFirstLi ,
                    preCurFirstLi_w ,
                    tabHolder_left;
                if(that._hasPreGroup()){
                    preCurFirstLi = query('.exp-group-tab li',panelDOM)[cgp-1],
                    preCurFirstLi_w = DOM.width(preCurFirstLi),
                    tabHolder_left = parseInt(DOM.css(tabHolder,'left'));
                    DOM.css(tabHolder,{
                        left : tabHolder_left + preCurFirstLi_w +5
                    });
                    that.curGroupPg --;
                    that._tabSwitchBtnCheck();
                }
             })
             
             //表情分页事件
            delegate(panelDOM, 'click',prePageSelector, function(evt) {
                if(!DOM.hasClass(prePageSelector,'disable')){
                    that._reloadIcons(that.curIconPg - 1); 
                }
            });
            delegate(document, 'click', nextPageSelector, function(){
                if(!DOM.hasClass(nextPageSelector,'disable')){
                    that._reloadIcons(that.curIconPg+1);    
                }
                
            });
        },
        /**
         * 添加图标的点击事件
         */
        _addIconsEvt: function(){
            var 
                that = this,
                iconsDOM = that.iconsDOM,
                iconsLists = query('li',iconsDOM.childNodes[0]),
                textarea = that.textArea;
            on(iconsLists, 'click',function(evt){
                var
                    opts = that.opts,
                    sourceText,iconTitle;
                sourceText = DOM.val(textarea);
                iconTitle = DOM.attr(this,'title');
                DOM.val(textarea,sourceText + '[' +iconTitle +']');
                if(opts.closeAfterSelect){  
                    that.hide();
                }
            })
        },
        
        /**
         * 生成弹出层dom,此处写入了html
         */
        _createExpDOM:function(){
            var
                that = this,
                pkgData = that.pkgData,
                html;
                
            html = Juicer(EXP_HOLDER_TEMP,pkgData);
            that.panelHTML = html;
            that.panelDOM = DOM.create(html);
            //样式修正，宽度必须为385px
            
            DOM.css(that.panelDOM,{
                width: FIXED_WIDTH_VALUE
            });
            
            that._addExpDOMEvt();
            //默认添加切换到第一组表情
            that._switch2Tab(0);
        },
        /**
         * 输入需要显示的图标数据，更新面版
         */
        _createIconsDOM: function(icons){
            var
                that = this,
                html = Juicer(ICONS_TEMP,{icons:icons});
            that.iconsDOM = DOM.create(html);
            that._addIconsEvt();
            return that.iconsDOM;
        },
        /**
         * 切换到傲第i组表情
         */
        _switch2Tab: function(i){
            var
                that = this,
                groups = that.pkgData.groups,
                currentGroup = that.currentGroup,
                panelDOM = that.panelDOM;
                
            if(i >= 0 && i < groups.length){
                that.currentGroup = i;
                that._refreshGroupStyle(i);
                that._reloadIcons(0); 
            }else{
                return;
            }    
        },
        
        _refreshGroupStyle:function(i){
            var
                that = this,
                panelDOM = that.panelDOM,
                groupLists = query('.exp-group-tab li',panelDOM);
            DOM.removeClass(groupLists,'current');
            DOM.addClass(groupLists[i],'current');
        },
        
        /**
         * 获取当前组的第i页表情数据
         */
        _reloadIcons: function(i){
            var
                that = this,
                panelDOM = that.panelDOM,
                currentGroup = that.currentGroup,
                groups = that.pkgData.groups,
                iconsData = groups[currentGroup].icons,
                curPageIcons = [],
                iconDOM,
                iconsDOMHolder = get('.exp-icons-holder',panelDOM),
                prePageBtn , nextPageBtn ,
                pageCount,
                startIndex,endIndex;
            
            
            pageCount =  Math.ceil(iconsData.length / PAGE_MAX_ICONS_COUNT);
            //判断i合不合法
            i = (i >= 0 && i <= pageCount - 1) ? i : 0;
            
            try{
                startIndex = i * PAGE_MAX_ICONS_COUNT;
                endIndex = (i + 1) * PAGE_MAX_ICONS_COUNT -1;
                endIndex = (endIndex > iconsData.length-1) ? iconsData.length-1 : endIndex; 
                
                for(var k = startIndex ; k <= endIndex; k++){
                      curPageIcons.push(iconsData[k]);
                }
                
                iconDOM = that._createIconsDOM(curPageIcons);
                
                prePageBtn = get('.exp-pre-page',iconDOM);
                nextPageBtn = get('.exp-next-page',iconDOM);
                
                
                //添加disable
                if(i == pageCount - 1){
                    DOM.addClass(nextPageBtn,'disable');
                }else{
                    DOM.removeClass(nextPageBtn,'disable');
                }
                if(i == 0){
                    DOM.addClass(prePageBtn,'disable');
                }else{
                    DOM.removeClass(prePageBtn,'disable');
                }
                DOM.html(iconsDOMHolder,'');
                DOM.append(iconDOM,iconsDOMHolder); 
                that.curIconPg = i;  
            }catch(err){
                S.log(err);
            }            
        },
        
        /**
         * 判断组分页下一组是否可以点击
         */
        _hasNextGroup: function(){
            var
                that = this,
                panelDOM = that.panelDOM,
                groupData = that.pkgData.groups,
                groupHolder = get('.exp-group-tab',panelDOM),
                tabHolder = get('ul',groupHolder),
                groups = query('li',tabHolder),
                gpOff = DOM.offset(groupHolder),
                lastLiOff = DOM.offset(groups[groupData.length-1]),
                gp_w = DOM.width(groupHolder),
                last_w = DOM.width(groups[groupData.length-1]);
            return lastLiOff.left - gpOff.left + last_w > gp_w;                
        },
        /**
         * 判断组分上一组是否存在
         */
        _hasPreGroup: function(){
             var
                that = this,
                panelDOM = that.panelDOM,
                groupData = that.pkgData.groups,
                groupHolder = get('.exp-group-tab',panelDOM),
                tabHolder = get('ul',groupHolder),
                groups = query('li',tabHolder),
                gpOff = DOM.offset(groupHolder),
                firstLiOff = DOM.offset(groups[0]);
             return firstLiOff.left - gpOff.left < 0;
        },
        /**
         * 检测分组的上一组，下一组按钮是否具有可点击功能，如果没有，则给加上disable样式
         */
        _tabSwitchBtnCheck: function(){
            var
                that = this,
                panelDOM = that.panelDOM,
                preGroupPgBtn = get('.exp-pre-group',panelDOM),
                nextGroupPgBtn = get('.exp-next-group',panelDOM);
                
            if(!that._hasNextGroup()){
                DOM.addClass(nextGroupPgBtn,'disable');
            }else{
                DOM.removeClass(nextGroupPgBtn,'disable');
            }
            if(!that._hasPreGroup()){
                DOM.addClass(preGroupPgBtn,'disable');
            }else{
                DOM.removeClass(preGroupPgBtn,'disable');
            }
        }
    });
    
    return Exp;
},{
    requires:['mod/juicer','expression/pkgManage','mod/overlay','core']
});

/**
 * 表情包的数据管理
 */
KISSY.add('expression/pkgManage',function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, on = S.Event.on, detch = S.Event.detch, IO = S.IO, JSON = S.JSON,
        BASE_PATH = PW.Env.puiWebsite + 'assets/expression/img/';
        pkgName_COMMON = {
            pkgName: 'common',
            groups:[
                {
                    gid:1,
                    name: '常用表情',
                    icons:[
                        {src:BASE_PATH + "zz2_thumb.gif",title:"织"},
                        {src:BASE_PATH + "horse2_thumb.gif",title:"神马"},
                        {src:BASE_PATH + "fuyun_thumb.gif",title:"浮云"},
                        {src:BASE_PATH + "geili_thumb.gif",title:"给力"},
                        {src:BASE_PATH + "wg_thumb.gif",title:"围观"},
                        {src:BASE_PATH + "vw_thumb.gif",title:"威武"},
                        {src:BASE_PATH + "panda_thumb.gif",title:"熊猫"},
                        {src:BASE_PATH + "rabbit_thumb.gif",title:"兔子"},
                        {src:BASE_PATH + "otm_thumb.gif",title:"奥特曼"},
                        {src:BASE_PATH + "j_thumb.gif",title:"囧"},
                        {src:BASE_PATH + "hufen_thumb.gif",title:"互粉"},
                        {src:BASE_PATH + "liwu_thumb.gif",title:"礼物"},
                        {src:BASE_PATH + "smilea_thumb.gif",title:"呵呵"},
                        {src:BASE_PATH + "tootha_thumb.gif",title:"嘻嘻"},
                        {src:BASE_PATH + "laugh.gif",title:"哈哈"},
                        {src:BASE_PATH + "tza_thumb.gif",title:"可爱"},
                        {src:BASE_PATH + "kl_thumb.gif",title:"可怜"},
                        {src:BASE_PATH + "kbsa_thumb.gif",title:"挖鼻屎"},
                        {src:BASE_PATH + "cj_thumb.gif",title:"吃惊"},
                        {src:BASE_PATH + "shamea_thumb.gif",title:"害羞"},
                        {src:BASE_PATH + "zy_thumb.gif",title:"挤眼"},
                        {src:BASE_PATH + "bz_thumb.gif",title:"闭嘴"},
                        {src:BASE_PATH + "bs2_thumb.gif",title:"鄙视"},
                        {src:BASE_PATH + "lovea_thumb.gif",title:"爱你"},
                        {src:BASE_PATH + "sada_thumb.gif",title:"泪"},
                        {src:BASE_PATH + "heia_thumb.gif",title:"偷笑"},
                        {src:BASE_PATH + "qq_thumb.gif",title:"亲亲"},
                        {src:BASE_PATH + "sb_thumb.gif",title:"生病"},
                        {src:BASE_PATH + "sb_thumb.gif",title:"生病"},
                        {src:BASE_PATH + "mb_thumb.gif",title:"太开心"},
                        {src:BASE_PATH + "ldln_thumb.gif",title:"懒得理你"},
                        {src:BASE_PATH + "yhh_thumb.gif",title:"右哼哼"},
                        {src:BASE_PATH + "yhh_thumb.gif",title:"右哼哼"},
                        {src:BASE_PATH + "zhh_thumb.gif",title:"左哼哼"},
                        {src:BASE_PATH + "x_thumb.gif",title:"嘘"},
                        {src:BASE_PATH + "cry.gif",title:"衰"},
                        {src:BASE_PATH + "wq_thumb.gif",title:"委屈"},
                        {src:BASE_PATH + "t_thumb.gif",title:"吐"},
                        {src:BASE_PATH + "k_thumb.gif",title:"打哈气"},
                        {src:BASE_PATH + "bba_thumb.gif",title:"抱抱"},
                        {src:BASE_PATH + "angrya_thumb.gif",title:"怒"},
                        {src:BASE_PATH + "yw_thumb.gif",title:"疑问"},
                        {src:BASE_PATH + "cza_thumb.gif",title:"馋嘴"},
                        {src:BASE_PATH + "88_thumb.gif",title:"拜拜"},
                        {src:BASE_PATH + "sk_thumb.gif",title:"思考"},
                        {src:BASE_PATH + "sweata_thumb.gif",title:"汗"},
                        {src:BASE_PATH + "sleepya_thumb.gif",title:"困"},
                        {src:BASE_PATH + "sleepa_thumb.gif",title:"睡觉"},
                        {src:BASE_PATH + "money_thumb.gif",title:"钱"},
                        {src:BASE_PATH + "sw_thumb.gif",title:"失望"},
                        {src:BASE_PATH + "cool_thumb.gif",title:"酷"},
                        {src:BASE_PATH + "hsa_thumb.gif",title:"花心"},
                        {src:BASE_PATH + "hatea_thumb.gif",title:"哼"},
                        {src:BASE_PATH + "gza_thumb.gif",title:"鼓掌"},
                        {src:BASE_PATH + "dizzya_thumb.gif",title:"晕"},
                        {src:BASE_PATH + "bs_thumb.gif",title:"悲伤1"},
                        {src:BASE_PATH + "crazya_thumb.gif",title:"抓狂"},
                        {src:BASE_PATH + "h_thumb.gif",title:"黑线"},
                        {src:BASE_PATH + "yx_thumb.gif",title:"阴险"},
                        {src:BASE_PATH + "nm_thumb.gif",title:"怒骂"},
                        {src:BASE_PATH + "hearta_thumb.gif",title:"心"}
                    ]
                },
                {
                    gid:2,
                    name:'特殊表情',
                    icons:[
                        {src:BASE_PATH + "unheart.gif",title:"伤心"},
                        {src:BASE_PATH + "pig.gif",title:"猪头"},
                        {src:BASE_PATH + "ok_thumb.gif",title:"ok"},
                        {src:BASE_PATH + "ye_thumb.gif",title:"耶"},
                        {src:BASE_PATH + "good_thumb.gif",title:"good"},
                        {src:BASE_PATH + "no_thumb.gif",title:"不要"},
                        {src:BASE_PATH + "z2_thumb.gif",title:"赞"},
                        {src:BASE_PATH + "come_thumb.gif",title:"来"},
                        {src:BASE_PATH + "sad_thumb.gif",title:"弱"},
                        {src:BASE_PATH + "lazu_thumb.gif",title:"蜡烛"},
                        {src:BASE_PATH + "clock_thumb.gif",title:"钟"},
                        {src:BASE_PATH + "cake.gif",title:"蛋糕"},
                        {src:BASE_PATH + "m_thumb.gif",title:"话筒"}
                    ]
                }
            ]
        };
        
        
    
    function pkgManage(){
        //表情区块
        this.expPkgStore = [pkgName_COMMON];
        this.__constructor();
    }
    
    S.augment(pkgManage,S.EventTarget);
    
    S.augment(pkgManage,{
        __constructor:function(){
            var that = this;
        },
        getRemoteExp:function(url,data,callback){
            var 
                that = this;
                eps = that.expPkgStore,
                ajaxOpts = {},
                cb;            
            ajaxOpts.url = url;
            
            if(data && S.isString(data)){
                ajaxOpts.data = data;
                if(callback && S.isFunction(callback)){
                    cb = callback;
                }
            }else if(data && S.isFunction(data)){
                cb = data;
            }
            
            ajaxOpts.success = function(rs){
                rs = (S.isString(rs)) ? JSON.parse(rs) : rs;
                eps.push(rs);
                if(cb){
                    cb(rs);
                }
            }
            ajaxOpts.error = function(err){
                S.log('获取远程表情出错');
            }
            //发送ajax请求获取远程数据
            IO(ajaxOpts);
        },
        
        /**
         * 将文本中表情的代号自动格式化为img标签
         * 参数：t-要转换的文本，expPkgName-要转换的文本的表情数据来源代号，如果不写则表示搜索全部表情数据，直到找到第一个匹配数据为止
         * 例如：xx[微笑]xx -> <img src="xxxx/smile.gif" />
         */
        textFormat:function(text,expPkgName){
            var 
                that = this,
                reg = /\[([^\]\[\/ ]+)\]/g,
                rslt,
                temp,
                expBlock = that.getPkgDataByName(expPkgName);
    
            while ( temp = reg.exec(text)) {
                var 
                    src = that._convert2Img(temp[1],expPkgName),
                    creg;

                creg = new RegExp("\\["+temp[1]+"\\]");
                text = text.replace(creg,src);
            }
            return text;
        },
        /**
         * 根据组id和expData，获取图标信息
         */
        getGroupInfo: function(gid,expData){
            var
                that = this,
                eps = that.expPkgStore,
                exp,
                r;
            if(expData){
                for(var i = 0; i < expData.groups.length; i++){
                    var gp = expData.groups[i];
                    if(gp.gid == gid){
                        r = gp;
                        break;
                    }
                }
            }
            return r;
        },
        
        /**
         * 根据表情代号获取表情的相关组信息,如果多组，则返回第一组，否则为空数组
         * 参数: pkgName - 表情代号，如果不写，则默认返回所有表情数据
         */
        getPkgDataByName: function(pkgName){
            var
                that = this,
                eps = that.expPkgStore,
                r = [];
            if(pkgName && pkgName != null && pkgName != ''){
                S.each(eps,function(o){
                    if(o.pkgName == pkgName) {
                        r.push(o);
                    }
                })
            }else{
                r = eps;
            }
            
            return (r.length > 0) ? r[0] : r;
        },
        
        /**
         * 转换图片,如果搜索到，则返回图片地址，否则返回原字符串即图片title
         */
        _convert2Img: function(imgTitle,pkgName){
            var
                that = this,
                expBlock = that.getPkgDataByName(pkgName),
                src;
            for(var i = 0; i < expBlock.groups.length; i++){
                var 
                    //当前的组
                    group =expBlock.groups[i],
                    //当前的表情数据
                    icons = group.icons;
                for(var j = 0; j < icons.length; j++){
                    var icon = icons[j];
                    if(icon.title == imgTitle){
                        src = icon.src;
                        break;
                    }
                }
                if(src) break;
            }
            
            return (src) ? '<img src="'+ src +'" width="20" height="20" />' : imgTitle;
        }
    });
    
    //添加表情包到KISSY上
    S.mix(S.expression,{
        pkg: new pkgManage()
    });
    return pkgManage;
},{
    requires:['core']
});