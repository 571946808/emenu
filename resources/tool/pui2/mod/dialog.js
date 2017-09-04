/*-----------------------------------------------------------------------------
* @Description: 弹出窗口组件的模块部分
* @Version: V1.0.1
* @author: simon(406400939@qq.com)
* @date 2012.7.1
* ==NOTES:=============================================
* v1.0.0(2012-7-1):
*   初始生成。
* v1.0.1(2012-11-23):
*   修改prompt,使参数可以达到可配置和扩展性-但是代码逻辑后期需要做一定的调整，现在有一些繁杂
* v2.0.1(2013.05.25):
*   进行合成操作，调整一些dailog以前的问题
* v2.0.2(2013.06.09):
*   将dailog的alert confirm prompt三种便捷窗口的遮罩值调高
* v2.0.3(2013.07.19):
*   修复dialog在ie6下的fixed问题
*   修复了双调用css的情况
* v2.0.4(2013.08.09)：
*    修复open操作不继承MOD_SETTINGS 的bug
* v2.0.5(2013-12-05):
*     将open返回的dialogID改成dialog，以前改过，svn出现了不同程度的回退
* v2.0.6(2014/01/11 10:22:06):
*     根据theme名称将theme-名 写进dlgEl的class属性值中
* v2.0.7(2014/07/11):
*     by wangjing 添加hasAutoScroll 属性动态添加滚动条
* v2.0.8(2014/07/23):
*     by wangjing 去掉了footer中按钮的class配置项（720行处），在ie8下会报错，等待后续解决
* v2.0.7(2015/01/12):
*     by kongting  升级到kissy1.4，统一接口，去掉全局变量PW
      alert：添加了clickClose配置项，默认点击遮罩不关闭弹出框
  v2.0.8 (2015/11/13)
  by cuiy: 添加preventMulTrigger函数,防止按回车多次触发触发器
  by cuiy: 为创建button添加bType属性,默认为button,可以还有submit等
  by cuiy: 释放button的className属性,暂不考虑ie8,如果需求再进行修改
* ---------------------------------------------------------------------------*/


/**
 * dialog核心控制逻辑，负责管理所有的dailog
 */
KISSY.add('mod/dialog', function(S, Base, Cache, Hotkey){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = jQuery, 
        on = S.Event.on, delegate = S.Event.delegate, detach = S.Event.detach,
        EMPTY_FUNCTION = function(){},
        CONFIG = {
            onClick: EMPTY_FUNCTION,
            beforeOpen: EMPTY_FUNCTION,
            afterOpen: EMPTY_FUNCTION,
            beforeClose: EMPTY_FUNCTION,
            afterClose: EMPTY_FUNCTION,
            //-------------------旧的参数接口-----------------------
            maskClickHandler:   EMPTY_FUNCTION,
            beforeOpenHandler: EMPTY_FUNCTION,
            afterOpenHandler: EMPTY_FUNCTION,
            beforeCloseHandler: EMPTY_FUNCTION,
            afterCloseHandler: EMPTY_FUNCTION
            //------------------------------------------------------
        },
        MOD_DIALOG_SETTINGS = PW.Env.modSettings.dialog || {},
        THEME_URL = PW.Env.puiWebsite + 'assets/dialog/css/default.css',
        dlgStore = {
            length: 0
        },
        dlgCache = window.top.DLG_CACHE,
        dataCache = window.top.DATA_CACHE,
        Core = {},
        latestDlgId;

    function init(){
        if(S.isString(MOD_DIALOG_SETTINGS.themeUrl) && MOD_DIALOG_SETTINGS.themeUrl != ''){
            S.getScript(MOD_DIALOG_SETTINGS.themeUrl, {
                charset: 'utf-8'
            })
        }else{
            S.getScript(THEME_URL,{
                charset: 'utf-8'
            })
        }
        if(!dlgCache){
            window.top.DLG_CACHE = Cache.client();
            dlgCache = window.top.DLG_CACHE;
        }
        if(!dataCache){
            window.top.DATA_CACHE = Cache.client();
            dataCache = window.top.DATA_CACHE;
        } 

        buildHotKeyEvt();
    }

    function buildHotKeyEvt(){
        var hk = Hotkey.client();
        hk.bind('esc', function(){
            if(latestDlgId && dlgCache.get(latestDlgId)){
                Dialog.close(latestDlgId);
            }
        })
    }
    function createDlg(param){
        var
            sts = S.merge(CONFIG, param),
            base;
        base =  new Base(param);
        base.on('click', function(e){
            var 
                oc = sts.onClick,
                mch = sts.maskClickHandler;
            if(S.isFunction(oc)){
                oc(e, this);
            }
            if(S.isFunction(mch)){
                mch(e, this);
            }
        })
        base.on('beforeOpen', function(e){
            var 
                bo = sts.beforeOpen,
                boh = sts.beforeOpenHandler;
            if(S.isFunction(bo)){
                bo();
            }
            if(S.isFunction(boh)){
                boh(e,this);
            }
        })
        base.on('afterOpen', function(e){
            var
                ao = sts.afterOpen,
                aoh = sts.afterOpenHandler;

            if(S.isFunction(ao)){
                ao(e,this);
            }
            if(S.isFunction(aoh)){
                aoh(e, this);
            }
        })
        base.on('beforeClose', function(e){
            var 
                bc = sts.beforeClose,
                bch = sts.beforeCloseHandler;
            if(S.isFunction(bc)){
                bc(e, this);
            }
            if(S.isFunction(bch)){
                bch(e, this);
            }
        })
        base.on('afterClose', function(e){
            var
                ac = sts.afterClose,
                ach = sts.afterCloseHandler;

            //从cache中删除
            dlgCache.remove(this.id);

            if(S.isFunction(ac)){
                ac(e, this);
            }
            if(S.isFunction(ach)){
                ach(e, this);
            }
        });
        base.open();
        return base;
    }

    /**
     * 获取当前帧的默认id，如果它是有dialog机制打开，默认有id
     * @return {[type]} [description]
     */
    function getIframeId(){
        var
            search = window.location.search,
            param = S.unparam(search.substr(1));
        return param.dlgId;
    }

    //执行初始方法
    init();
    //设置dialog对象
    var Dialog = {};
    S.mix(Dialog,{
        client: function(param){
            var
                dlg,
                cfg = {};
            S.mix(cfg, MOD_DIALOG_SETTINGS,true,undefined,true);
            S.mix(cfg, param,true,undefined,true);
            dlg = createDlg(cfg);
            dlgCache.set(dlg.id, dlg);
            latestDlgId = dlg.id;
            this._preventMulTrigger();

            return dlg;
        },
        open: function(param){
            return this.client(param);
        },
        close: function(id){
            var
                dlg,
                dc = null;
            if(!id) return;       
            if(dlgCache && (dlg = dlgCache.get(id))){
                dlg.close();
            }else{
                S.log('要关闭的弹出窗口不存在');
            }
        },
        closeAll: function(){
            if(dlgCache && dlgCache.data.length > 0){
                dlgCache.each(function(key,val){
                    val.close();
                })
            }
        },
        //===================================================
        //Func:     为iframe类型窗口提供内部关闭渠道
        //Author:   Simon
        //Date:     2013.05.30
        //===================================================
        closeThis: function(){
            var
                search = window.location.search,
                param = S.unparam(search.substr(1)),
                dlgId = param.dlgId,
                dlgCache = window.top.DLG_CACHE;
            if(!dlgCache || !dlgCache.get(dlgId)) return;
            try{
                dlgCache.get(dlgId).close();
            }catch(err){
                S.log(err);
            }
        },
        /**
         * 根据dlgid()，设置此dialog的相应数据()
           参数缺省时，data可以是字符串
         * @param  {[type]} id   [description]
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        setData: function(id,data){
            var
                dlg,
                did,
                d = data;
            if(id && (parseInt(id) || S.isNumber(id))){
                dlg = dlgCache.get(id);
            }
            //如果未传递id，传递的第一个参数默认为data，id从iframe的地址中寻找
            if(S.isObject(id) || S.isString(id)){
                var d = id;
                id = getIframeId();
                S.log('未找到相应id的弹出层！')
                dlg = dlgCache.get(id);
            }
            if(dlg){
                dataCache.set(dlg.id, d);
            }
        },
        getData: function(id){
            if(!id){
                id = getIframeId();
            }
            if(!id){
                return null;
            }
            return dataCache.get(id);
        },
        /**
         * 提供alert快捷打开方式
         * @param  {String}   str 提示字符串
         * @param  {Function} callback  点击确定按钮的回调函数
         * @param  {obj} settings 额外配置
         * @param {String} type 弹窗类型
         * @return 弹出窗口唯一标识ID
         */
        alert: function(str, callback, settings, type){
            var
                that = this,
                cfg = {
                    left: 'cetner',
                    top: 'center',
                    width: 400,
                    title: '请注意',
                    header: false,
                    zIndex: 1000
                },
                html = '';
            cfg = S.merge(cfg, MOD_DIALOG_SETTINGS);
            if(S.isObject(settings)){
                cfg = S.merge(cfg, settings);
            }
            cfg = S.merge(cfg, {
                 //配置确定按钮及关闭事件
                 footer:{
                    btns:[{
                        text: '确定',
                        clickHandler: function(e,me){
                            me.close();
                        }
                    }]
                },
                onClick: function(e, me){
                    if(cfg.clickClose){
                       me.close(); 
                    }
                },
                afterClose: function(e, me){
                    if(S.isFunction(callback)){
                        callback.call(me,e,me);
                    }
                }
            });
            //生成html
            switch(type){
                case 'success':
                    html += '<div class="dlg-alert success">';
                    break;
                case 'error':
                    html += '<div class="dlg-alert error">';
                    break;
                case 'warn':
                    html += '<div class="dlg-alert warn">';
                    break;
                default:
                    html += '<div class="dlg-alert">';
            }
            html += '<i class="alert-ico"></i>';
            html += '<div>'+ ((str) ? str : 'null') +'</div>';
            html += '</div>';
            cfg.content = html;
            return that.open(cfg);
        },
        success: function(str, callback, settings){
            return this.alert(str, callback, settings, 'success');
        },
        error: function(str, callback, settings){
            return this.alert(str, callback, settings, 'error');
        },
        warn: function(str, callback, settings){
            return this.alert(str, callback, settings, 'warn');
        },
        /**
         * 提示文字
         * @param  {String} str      提示文字
         * @param  {fn} okCb     ok点击回调
         * @param  {fn} cancelCb 取消回调
         * @param  {Obj} settings 配置
         */
        confirm: function(str, okCb, cancelCb, settings){
            var
                that = this,
                cfg = {
                    left: 'cetner',
                    top: 'center',
                    width: 400,
                    title: '确认:',
                    header: false,
                    zIndex: 1000
                },
                html = '';
            cfg = S.merge(cfg, MOD_DIALOG_SETTINGS);
            if(S.isObject(settings)){
                cfg = S.merge(cfg, settings);
            }
            cfg = S.merge(cfg, settings, {
                content: '暂无内容！',
                //配置确定按钮及关闭事件
                footer:{
                    btns:[{
                        text: '确定',
                        clickHandler: function(e,me){
                            if(S.isFunction(okCb)){
                                okCb.call(me, e, me);
                            }
                            me.close();
                        }
                    },{
                        text: '取消',
                        clickHandler: function(e,me){
                            if(S.isFunction(cancelCb)){
                                cancelCb.call(me, e, me);
                            }
                            me.close();
                        }
                    }]
                },
                onClick: function(e, me){
                    me.close()
                }
            });
            
            //生成html
            html += '<div class="dlg-confirm">';
            html += '   <i class="confirm-ico"></i>';
            html += '   <div>'+ ((str) ? str : '暂无内容！') +'</div>';
            html += '</div>';
            cfg.content = html;

            return that.open(cfg);
        },
        /**
         * 快捷取值
         * 默认有三个参数可以传递， tip,orginalTxt, okCallback
         */
        prompt: function(tip, orginalTxt, callback, settings){
            var
                that = this,
                cfg = {
                    left: 'center',
                    top: 'center',
                    width: 400,
                    zIndex: 1000
                },
                html = '';


            cfg = S.merge(cfg, MOD_DIALOG_SETTINGS);
            if(S.isObject(settings)){
                cfg = S.merge(cfg, settings);
            }
            cfg = S.merge(cfg, {
                title: S.isString(tip) ? tip : '输入',
                footer: {
                    btns:[{
                        text: '提交',
                        clickHandler: function(e,me){
                            var
                                d = me.dlgEl,
                                ipt = get('input', d),
                                val = DOM.val(ipt);
                            if(callback && S.isFunction(callback)){
                                 callback(e,me,val);
                            }
                            me.close();
                        }
                    },{
                        text: '取消',
                        clickHandler: function(e,me){
                            me.close();
                        }
                    }]
                },
                onClick: function(e, me){
                    me.close();
                }
            })

            html += '<div class="dlg-prompt">';
            html += '<input name="prompt" type="text" value="';
            html += (orginalTxt)? orginalTxt : '';
            html += '" />'
            html += '</div>';
            cfg.content = html;


            return that.open(cfg);
        },
        _preventMulTrigger: function(){
            var
                that = this,
                // 点击触发之后,取消触发器的焦点,防止多次触发
                focusEl = document.activeElement;

            if(focusEl){
                focusEl.blur();
            }
        }
    });
    S.Dialog = Dialog;
    PW.namespace('mod.Dialog');
    PW.mod.Dialog = Dialog;
    return Dialog;
    
},{
    requires: [
        'dialog/base',
        'mod/cache',
        'mod/hot-key',
        'core'
    ]
})

/**
 * dialog基础逻辑，负责打开和渲染dialog
 */
KISSY.add('dialog/base', function(S, Overlay, Pattern, Sniffer){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = jQuery, 
        on = S.Event.on, delegate = S.Event.delegate, detach = S.Event.detach,
        CONFIG = {
            width : 600,
            height : 'auto',
            position : 'absolute',
            left : 'center',
            top : 200,
            zIndex: 200,
            topLayer: 0,
            //表现
            theme : 'a',
            //内容
            _x_:true,
            header: true,
            icon : undefined,
            title : '新建窗口',
            content : '没有任何内容',
            contentFrame : undefined,
            hasAutoScroll: false,  /*by wangjing 内容超出部分是否显示滚动条*/
            frameScroll: 'no',
            footer : undefined,
            _dlgCtrlId:null,
            hasOverlay: true,
            color: '#000',
            opacity: .6,
            cursor: 'wait',
            clickClose:false,
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            enterHandler: false
        },
        FRAME_CLASS = 'dlg-inner-frame';

    function Base(param){
        this.opts = S.merge(CONFIG, param);
        this.overlay;
        this.id = S.now();
        this.win;
        this.doc;
        this.dlgEl;
        //打开状态
        this.openStatus = false;
        this.dataCache = window.top.DATA_CACHE;
        this.init();
    }

    S.augment(Base, S.EventTarget, {
        init: function(){
            var
                that = this;

            if(!that.dataCache){
                window.top.DATA_CACHE = PW.mod.Cache();
                that.dataCache = window.top.DATA_CACHE;
            }
            //参数优化
            that._checkParam();
            //获取窗口
            that._getWin();
            //生成遮罩
            that._createOverlay();
            //生成dialog窗体
            that._createDlgEl();
            //事件分发
            that.addEvtDispatcher();
        },
        addEvtDispatcher: function(){
            var
                that = this,
                opts = that.opts,
                overlay = that.overlay;
            if(opts.hasOverlay){
                //遮罩尺寸改变
                overlay.on('resize', function(){
                    that.fire('resize',{obj: that, cache:that._getData()})
                    that._fixStyle(that.dlgEl);
                })
                //遮罩被点击
                overlay.on('click', function(e){
                    that.fire('click', {obj: that, cache:that._getData()});
                })  

            }
            
        },
        //打开操作，一般只执行一次
        open: function(){
            var
                that = this;
            if(!that.openStatus){
                that._openAction();    
            }else{
                S.log('编号为' + that.id + '的弹出层已经打开');
            }
        },
        //关闭操作，此操作会完全删除overlay和dailog内容
        close: function(){
            var
                that = this;
            if(that.openStatus){
                that._closeAction();
            }else{
                S.log('标号为' + that.id + '的弹出层已经关闭');
            }
        },
        _openAction: function(){
            var
                that = this,
                opts = that.opts;
            that.fire('beforeOpen',{obj: that, cache:that._getData()});
            if(opts.hasOverlay){
                that.overlay.render();
            }
            
            DOM.addClass(that.dlgEl, 'in');
            DOM.append(that.dlgEl, that.doc.body);

            //如果遮罩存在,刷新
            if(opts.hasOverlay){
                that.overlay.refresh();
            }
            that._fixStyle(that.dlgEl);
            that.openStatus = true;
            that.fire('afterOpen', {obj: that, cache:that._getData()})
        },
        _closeAction: function(){
            var
                that = this,
                opts = that.opts;
            that.fire('beforeClose', {obj: that, cache:that._getData()});
            DOM.removeClass(that.dlgEl, 'in');

            if(opts.hasOverlay){
                that.overlay.destroy();
            }
            DOM.remove(that.dlgEl);
            that.openStatus = false;
            that.fire('afterClose', {obj: that, cache:that._getData()});
        },
        _getData: function(){
            var
                that = this,
                dataCache = that.dataCache;
            return dataCache.get(that.id);
        },
        _createOverlay: function(){
            var
                that = this,
                opts = that.opts;
            if(opts.hasOverlay){
                that.overlay = Overlay.client({
                    //默认给window
                    topLayer: opts.topLayer,
                    bgColor: opts.color,
                    zIndex: opts.zIndex - 1,
                    cursor: opts.cursor,
                    opacity: opts.opacity
                });
            }
        },
        _createDlgEl: function(){
            var
                that = this,
                opts = that.opts,
                HTML = '',
                dlgDOM,
                dlgHolder, contentHolder, domStyle = {},innerFrame, headerHolder, footerHolder, closeDOM;
            
            HTML += '<div class="cpt-dlg-outer fade pw-dlg-theme-'+opts.theme+'" theme="theme-'+opts.theme+'" id="dlg-'+that.id+'">';
            HTML += '<div class="dlg-holder">';
            HTML += '<table cellpadding="0" cellspacing="0" border="0" >';
            if(opts.header){
                HTML += '<thead>';
                HTML += '<tr>';
                HTML += '<th class="header-holder">';
                HTML += '<div class="dlg-header">';
               
                if(opts.icon) {
                    HTML += '<i class="dlg-icon fa fa-times"></i>';
                    HTML += '<h2 class="dlg-title">' + opts.title + '</h2>';
                } else {
                    HTML += '<h2 class="dlg-title no-icon">' + opts.title + '</h2>';
                }
                if(opts._x_){
                    HTML += '<a class="dlg-close">×</a>';   
                }
                HTML += '</div>';
                HTML += '</th>';
                HTML += ' </tr>';
                HTML += ' </thead>';
            }
            HTML += ' <tbody>';
            HTML += ' <tr>';
            HTML += ' <td class="content-holder">';
            HTML += '<div class="dlg-content">';
                //content内容
            HTML += '</div>';
            HTML += '</td>';
            HTML += '</tr>';
            HTML += '</tbody>';
            if(opts.footer && opts.footer.btns && S.isArray(opts.footer.btns)) {
                HTML += '<tfoot>';
                HTML += '<td class="footer-holder">';
                HTML += '<div class="dlg-footer clearfix">';
                HTML += '</div>';
                HTML += '</td>';
                HTML += '</tfoot>';
            }
            HTML += '</table>';
            HTML += '</div>';
            HTML += '</div>';

            dlgDOM = DOM.create(HTML, that.win);

            //内容填充
            contentHolder = get('.dlg-content', dlgDOM);
            DOM.height(contentHolder, opts.height);

            /* by wangjing 内容超出部分动态显示滚动条*/
            if(opts.hasAutoScroll) DOM.css(contentHolder,{overflow: 'auto'}); 

            if(opts.isFrame){
                var
                    r = /\?[\S]*/,
                    infix,
                    url = '';
                infix = (r.test(opts.contentFrame)) ? '&' : '?';
                url = opts.contentFrame + infix + 'dlgId=' + that.id + '&top=' + opts.topLayer +'&dlgCtrlId=' + opts._dlgCtrlId;
                innerFrame = DOM.create(
                    '<iframe>',
                    {
                        'class':FRAME_CLASS,
                        'frameborder':'0',
                        'scrolling':opts.frameScroll,
                        'allowtransparency':'true',
                        'frameborder': '0',
                        'src':url,
                        'height': (opts.height == 'auto') ? 400 : '100%'
                    }
                );
                DOM.append(innerFrame,contentHolder);
            }else{
                DOM.append(opts.content, contentHolder);
            }

            //footer及相关事件
            if(opts.footer && opts.footer.btns && S.isArray(opts.footer.btns)){
                fbtns = opts.footer.btns;
                var 
                    footerHolder = get('.dlg-footer', dlgDOM),
                    callback = function(o){
                        this.DO = function(evt){
                            o.clickHandler(evt,that);
                        }
                    };
                if(fbtns.length > 0) {
                    for(var k = 0; k < fbtns.length; k++) {
                        var 
                            btnObj = fbtns[k];
                            if(k == 0){
                                if(!btnObj.className){
                                    btnObj.clasName = 'J_ok'
                                }
                            }
                            tmpBtn = DOM.create('<button>', {
                                type : btnObj.bType || 'button',
                                text : btnObj.text,
                                bid: btnObj.bid,
                                'data-dlg-btn': 'btn',   //by cuiy 加一个属性,为了与其他的button区分开
                                class: btnObj.className  //by wangjing IE8下报错，button属性有待解决
                            });
                        var cb = new callback(btnObj);   
                        on(tmpBtn,'click',cb.DO);
                        DOM.append(tmpBtn, footerHolder);
                        // by cuiy 2015.11.13: 加一个enterHandler属性,帮助可以按回车进行操作
                        if(opts.enterHandler){
                            setTimeout(function(){
                                tmpBtn.focus();
                            }, 100);
                        }
                    }
                }
            }

            //添加 “X(叉叉)”的关闭事件
            closeDOM = get('.dlg-close',dlgDOM);
            on(closeDOM, 'click', function(evt){
                that.fire('clickBtn',{obj:that});
                that._closeAction();
            }) 
            //样式校正
            that._fixStyle(dlgDOM);

            that.dlgEl = dlgDOM;

        },
        //修正弹出节点的样式,resize时更新
        /**
         *  PS：top: center时，弹出框高度小于窗口，否则报错
         */

        _fixStyle: function(el){     
            var
                that = this,
                opts = that.opts,
                domStyle = {},
                fixedHandler = function(top){
                    var st = $(window).scrollTop();
                    $(el).css({
                        top: st + top
                    })
                };

            domStyle = {
                width: opts.width,
                position: opts.position,
                zIndex: opts.zIndex,
                boxShadow: opts.boxShadow,
                transition: opts.transition
            }
            if(S.isNumber(opts.left)){
                domStyle.left = opts.left;
            }else{
                domStyle.left = '50%';
                domStyle.marginLeft = DOM.outerWidth(el) / 2 * -1;
            }
            
            if(S.isNumber(opts.top)){
                domStyle.top = opts.top;
            }else{
                domStyle.top = ($(that.win).outerHeight() - $(el).outerHeight()) /2;
                if(domStyle.top < 0) domStyle.top = 0; //弹出框高度设为0，默认值 by wangjing
            }

            if(opts.position == 'fixed' && Sniffer.browser.isIE6){
                //进行ie6 fixed处理
                domStyle.position = 'absolute';
                //ie6 的无奈之举，暂且写在这儿，后期在调整为更加合理的结构
                $(window).on('scroll', function(){
                    fixedHandler(domStyle.top);
                })
            }

            if(opts.position != 'fixed' && !S.isNumber(opts.top)){
                domStyle.top = (opts.hasOverlay) ?
                                that.overlay.h / 2:
                                $(that.doc).height()/2;
                domStyle.marginTop = $(el).outerHeight()/2 * -1;
            }
            DOM.css(el, domStyle);
        },
        //检查参数，如果有不合格的内容，做一部分只能转换
        _checkParam: function(){
            var
                that = this,
                opts = that.opts,
                pattern = Pattern,
                //数字或者是center
                left = /^\d+[.\d+]?|center/,
                //id选择符或者是类选择符
                selector = /^[#|.]([A-Za-z0-9|-|_]+[A-Za-z0-9|-|_|\s]*)/,
                //css颜色写法
                cssColor = /(^[#]([a-fA-F0-9]{6}|[a-fA-F0-9]{3}))|([a-zA-Z]+)/,
                //正整数
                num = /^\d+$/,
                //浮点数
                flt = /([0-9]*)(.[0-9]+)?/,
                //在0-1之间的小数
                point = /([0]?[.]{1}[0-9]+)|0|1/,
                //判断position的值是否合理
                pos = /absolute|fixed/,
                site = /^(http|https|ftp):\/\/[a-zA-Z0-9|:|\/|-|_]+/,
                //滚动设置
                scrl = /yes|no|auto/,
                //高度
                height = /([0-9]+(.[0-9]+)?)|auto/;
            try{
                //高度
                if(!pattern.test('isNumber', opts.height)) {
                    // S.log('高度自动修正为auto');
                    opts.height = 'auto';
                }
                if(!pattern.test('isNumber', opts.left)){
                    // S.log('左偏移错误，自动修正为center');
                    opts.left = 'center';
                }
                if(!pattern.test('isNumber', opts.top)){
                    // S.log('顶部偏移错误，自动修正为cetner');
                    opts.top = 'center';
                }
                if(opts.position != 'fixed'){
                    opts.position = 'absolute';
                }
                //获得内容
                var ct = opts.content;
                if(pattern.test('isUrl', opts.contentFrame)){
                    opts.isFrame = true;
                }else{
                    if(S.isString(ct)){
                        if(pattern.test(selector, ct) && get(ct) != null){
                            opts.content = query(ct);
                        }else{
                            opts.content = DOM.create(ct);
                        }
                    }else if(that._isHTMLElement(ct)){
                        //nothing
                    }else if(S.isObject(ct) && ct.jQuery != undefined && ct.length > 0){
                        opts.content = ct.get();
                    }else if(S.isObject(ct) && ct.length > 0){
                        opts.content = ct.getDOMNodes();
                    }else{
                        //nothing
                        opts.content = DOM.create(CONFIG.content);
                    }
                }
            }catch(err){
                S.log(err);
            }
        },
        _getWin: function(){
            var
                that = this,
                opts = that.opts,
                win = window;
            for(var i = 0; i < opts.topLayer; i++){
                win = win.parent;
            }
            that.win = win;
            that.doc = win.document;
        },
        _isHTMLElement: function(obj){
            var d = document.createElement("div");
            try {
                d.appendChild(obj.cloneNode(true));
                return obj.nodeType == 1 ? true : false;
            } catch(e) {
                return false;
            }
        }
    })
    return Base;
},{
    requires:[
        'mod/overlay',
        'mod/pattern',
        'mod/sniffer',
        'core'
    ]
})