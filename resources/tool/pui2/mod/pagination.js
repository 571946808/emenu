/*-----------------------------------------------------------------------------
* @Description: 分页组件
* @Version:     V3.0.0
* @author:      cuiy(361151713@qq.com)
* @date         2014.12.23
* ==NOTES:=============================================
* v3.0.0(2014.12.23):
*     初始生成 
* v3.0.0(2015.10.23):
*     传入后台时，添加页面大小的参数
* ---------------------------------------------------------------------------*/
KISSY.add('mod/pagination', function(S, Oper){
	var
		Pagination = {
			client: function(param){
				return new Oper(param);
			}
		};
    PW.namespace('mod.Pagination');
    PW.mod.Pagination = Pagination;
	return Pagination;
},{
	requires: [
		'pagination/oper'
	]
});

/**
 * 分页操作
 */
KISSY.add('pagination/oper', function(S, Pctrl, Juicer){
	var
		$ = S.all, DOM = S.DOM, get = DOM.get, on = S.Event.on, delegate = S.Event.delegate, JSON = S.JSON, IO = S.IO,
		EMPTY_FUNCTION = function(){},
		Juicer = Juicer.client,
		ErrMsg = [
			'服务器响应失败，没有获取到数据！', 
			'加载失败', '暂无数据！', 
			'抛异常，主题包获取失败，使用默认配置！', 
			'加载延时,主题包获取失败,直接使用默认配置！', 
			'抛异常,JSON数据出错'
		],
		// 默认分页主题配置
		DEFAULT_THEME_PKG = {
			//分页按钮布局,真实呈现与顺序有关
            layout: ['first','prev','num','next','last','counter','gotoNum'],
            //计数部分样式
            themeCounter: '{page}/{pageCount}',
            //跳转部分样式
            themeJump: '跳到第{input}页{button}',
            //默认分页样式（定义了五种）
            themeCss: 'pageThemeDefault',
            //首页按钮内容显示
            firstPageTip: '<<',
            //尾页按钮内容显示
            lastPageTip: '>>',
            //上一页按钮内容显示
            prevPageTip:'上一页',
            //下一页按钮内容显示
            nextPageTip:'下一页'
		},
		el = {
            firstPage: '#J_firstPage',  //首页按钮
            prevPage: '#J_prevPage',    //上一页按钮
            nextPage: '#J_nextPage',    //下一页按钮
            lastPage: '#J_lastPage',    //尾页按钮
            numPage: '.J_page',         //点击数字按钮
            btnGo: '.J_btnGo'           //页面跳转按钮
        },
        // 参数配置列表
        CONFIG = {
        	// 页码渲染
            renderTo:'',
            // 渲染模板
            juicerRender:'#tpl',
            juicerContent:'',
            // 数据渲染
            dataRender:'#J_template',
            //当前页码
            page: 1,
            //每页显示的记录数
            pageSize: 10000,
            //总记录数
            dataCount: 0,
            //总页码数
            pageCount: 0,
            //主题包访问地址
            themePackageURL: '',
            //主题样式,取消PW
            themeUrl: PW.Env.puiWebsite + 'assets/pagination/css/default.css',
            //主题名
            themeName: 'default',
            type: 'get',
            url:'',
            //清理ie下get请求缓存问题
            cache: false,
            //加载数据ajax延时
            timeout: 10,
            loadingText: '加载中...',
            //获取分页内容的额外参数
            extraParam: null,
            // 重新reload时,是否回到第一页,true表示回到第一页,false表示回到上一次操作页
            reloadToFirstPage: false,
            configUrl: function(url,page,me,prevPaginationData){},
            initCompleted: EMPTY_FUNCTION,//初始化对象完成后的回调函数
            beforeSendAJAX: EMPTY_FUNCTION,//获取数据ajax发送之前的回调函数
            errorFun: EMPTY_FUNCTION,//ajax发送失败后的回调函数
            beforeDataLoad: EMPTY_FUNCTION,//数据加载之前的回调函数
            afterDataLoad: EMPTY_FUNCTION//数据加载之后的回调函数
        },
        // 取消PW
        MOD_DIALOG_SETTINGS = PW.Env.modSettings.pagination || {};

    function Oper(param){
    	// MOD_DIALOG_SETTINGS = this._useDefaultTheme();
        S.mix(CONFIG, MOD_DIALOG_SETTINGS,true,undefined,true);
        var opts = S.clone(CONFIG);
        S.mix(opts, param ,true,undefined,true);
        this.opts = opts;
        this.lock = false;
        //是否有下一页
        this.hasNext = false;
        //是否有上一页
        this.hasPre = false;
        // 上一次的分页数据，初始化为null
        this.prevPaginationData = null;
        this.currentPage = this.opts.page;
        this.init();
        S.getScript(this.opts.themeUrl, {
        	charset: 'utf-8'
        });
    }
    
    S.augment(Oper, S.EventTarget, {
    	init: function(){
    		var
    			that = this,
    			opts = that.opts,
    			icFun = opts.initCompleted;

    		if(icFun) {
    			opts.initCompleted(that);
    		}
    		that._getThemePackage();
    	},
    	/**
         * 对外的一个方法，可以实现指定页码的跳转
         * @param  {[type]} page [要跳转到第几页]
         */
        toPage: function(page){
            var
                isChange = this._checkPage(page);
            if(isChange) this._sendAjax();
        },
        /**
         * 对外的一个方法，可以实现重新加载分页
         */
        reload: function(param){
            // by:cuiy 2016.01.22 修改重新刷页默认跳转到哪一页
            if(param){
                if(!this.opts.reloadToFirstPage){
                    S.mix(param, {page: 1}); // 默认重刷分页时进入第一页
                }else{
                    S.mix(param, {page: this.opts.page}); // 回到上一次操作页
                }
            }
            S.mix(this.opts, param); //改用mix不重新创建参数对象
            this.init();
        },
        /**
         * 对外的一个方法，可以实现获取下一页的数据，如果下一页存在的话
         * @return {[type]} [description]
         */
        nextPage: function(){
            var
                opts     = this.opts,
                page     = opts.page,
                isChange = this._checkPage(page + 1);
            if(isChange && page !== opts.page) this._sendAjax();
        },
        /**
         * 对外的一个方法，可以实现获取上一页的数据，如果上一页存在的话
         * @return {[type]} [description]
         */
        prevPage: function(){
            var
                opts     = this.opts,
                page     = opts.page,
                isChange = this._checkPage(page - 1);
            if(isChange && page !== opts.page) this._sendAjax();
        },
    	/**
         * 对外的一个方法，可以实现获取首页数据
         * @return {[type]} [description]
         */
        firstPage: function(){
            var
                opts = this.opts,
                page = opts.page;

            if(page !== 1) {
                opts.page = 1;
                this._sendAjax();
            }
        },
    	/**
         * 对外的一个方法,可以实现获取尾页数据
         * @return {[type]} [description]
         */
        lastPage: function(){
            var
                opts = this.opts,
                page = opts.page,
                pageC = opts.pageCount;

            if(page !== pageC) {
                opts.page = pageC;
                this._sendAjax();
            }
        },
    	/**
         * 获取分页主题包
         */
    	_getThemePackage: function(){
    		var
    			that = this,
    			opts = that.opts,
    			// 要访问的主题包地址
    			tpUrl = opts.themePackageURL,
    			xhr,
    			themeName;

    		if(!!tpUrl){
    			xhr = IO.getJSON(tpUrl, function(tpData){
    				try{
    					tpData = (S.isString(tpData))? JSON.parse(tpData): tpData;
    					themeName = opts.themeName || 'default';
    					opts.themePackage = tpData.pagination[themeName];
    					that._loadPagination();
    				}catch(err){
    					S.log(ErrMsg[3]);
    				}
    			});

                //2秒之内没有获取到主题包信息，则使用默认配置
                window.setTimeout(function(){
                	if(xhr.status !== 200){
                		S.log(ErrMsg[4]);
                		that._loadPagination();
                	}
                }, 2000);
    		}else{
                that._loadPagination();
    		}
    	},
    	/**
         * 使用默认主题
         * @return {[type]} [description]
         */
    	_useDefaultTheme: function(){
    		var
    			that = this,
    			opts = {},
    			themeName;

    		if(PW.Env && PW.Env.modSettings.pagination && PW.Env.modSettings.pagination.themePackage){
    			themeName = opts.themeName || 'default';
    			opts.themePackage = S.mix(DEFAULT_THEME_PKG, PW.Env.modSettings.pagination.themePackage);
    		}else{
    			opts.themePackage = DEFAULT_THEME_PKG;
    		}
    		return opts;
    	},
    	/**
         * 加载分页数据以及分页页码信息
         */
    	_loadPagination: function(){
    		var
    			that = this,
    			opts = that.opts;
    		// 分页页码信息
    		that.pctrl = new Pctrl(opts);
    		if(!that.lock) that._sendAjax();
    	},
    	/**
         * 加载分页数据
         */
        _sendAjax: function(){
        	var	
        		that = this,
        		opts = that.opts,
                sendParam = {};
        	// 加锁
        	that.lock = true;
        	// 数据显示前，显示“加载中...”的字样
        	that._renderLoadingInfo();
        	// 获取数据ajax发送之前的回调函数
        	if(opts.beforeSendAJAX) opts.beforeSendAJAX(that);
            // 2015.10.23 by:cuiy 添加页面大小
            S.mix(sendParam, {_: S.now()});
            S.mix(sendParam, opts.extraParam);
            S.mix(sendParam, {pageSize: opts.pageSize});
        	S.IO({
        		type: opts.type,
        		url: opts.configUrl(opts.url, opts.page, that, that.prevPaginationData),
        		data: sendParam,
        		timeout: opts.timeout,
        		cache: opts.cache,
        		success: function(data){
        			try{
        				that._renderData(data);
        				// 关锁
        				that.lock = false;
        			}catch(errMsg){
        				S.log(ErrMsg[5]);
        				that._tipHandel(ErrMsg[1]);
        				if(opts.errorFun) opts.errorFun(that, errMsg);
        				// 关锁
        				that.lock = false;
        			}
        		},
        		error: function(){
        			S.log(ErrMsg[0]);
        			that._tipHandel(ErrMsg[1]);
        			if(opts.errorFun) opts.errorFun(that, ErrMsg[0]);
        			// 关锁
        			that.lock = false;
        		}
        	});
        },
        /**
         * ajax相应过程中，数据显示区域显示提示信息
         * @return {[type]} [description]
         */
        _renderLoadingInfo: function(){
            var
                that = this,
                opts = that.opts;
            
            if(!!opts.loadingText){
                that._tipHandel(opts.loadingText);
            }
        },
        /**
         * 内容提示
         * @param  {[type]} tip [要提示的内容]
         */
        _tipHandel:function(tip){
            var
                that = this, opts = that.opts,
                name = get(opts.dataRender).nodeName.toLowerCase(),
                tdom, cells, html = '', dataRenderDOM = $(opts.dataRender);

            if(name == 'tbody'){
                tdom = dataRenderDOM.parent();
                cells = (tdom.one('thead'))? tdom.one('thead').all('td').length || tdom.one('thead').all('th').length: 1;
                html = '<tr><td colspan="'+cells+'" align="center">'+ tip +'</td></tr>';
                
            }else{
                html = '<p style="text-align: center">'+ tip +'</p>';
            }

            dataRenderDOM.html(html);
        },
        /**
         * 渲染分页数据
         * @param  {[type]} data [分页数据]
         */
        _renderData: function(data){
            var
                that = this, opts = that.opts, dataList = [], len, i,
                juicerTemplate, dataHtml = '';

            data = (S.isString(data)) ? JSON.parse(data): data;
            //以下情况，显示暂无数据
            if(S.isEmptyObject(data) || !data || data.dataCount == 0) {
                that._tipHandel(ErrMsg[2]);
                $(opts.renderTo).html('');
            }else {
                data.page = opts.page;
                opts.dataCount = data.dataCount || opts.dataCount;
                
                //数据加载之前的回调函数
                if(opts.beforeDataLoad) opts.beforeDataLoad(that, data);
                opts.pageCount = Math.ceil(opts.dataCount/opts.pageSize);
                that._checkNum(opts.page);
                for(i in data){
                    if(S.isArray(data[i])) dataList = data[i];
                }
                len = dataList.length;
                if(len == 0) {
                    that._tipHandel(ErrMsg[2]);
                    $(opts.renderTo).html('');

                    if(!(S.isEmptyObject(that.prevPaginationData))){
                        that.pctrl.refresh(opts.page, opts.dataCount);    
                    }
                    
                }else {

                    that.prevPaginationData = data;
                    juicerTemplate = opts.juicerContent || $(opts.juicerRender).html();
                    dataHtml = Juicer(juicerTemplate, {list: data.list});
                    $(opts.dataRender).html(dataHtml);

                    that.pctrl.refresh(opts.page, opts.dataCount);
                }
                if(opts.afterDataLoad) opts.afterDataLoad(that, data, opts.page);
                that._addEventListener();
            }
        },
        /**
         * 页码事件监听
         */
        _addEventListener: function(){
            var
                that = this, opts = that.opts, num;

            that.tDOM = $(opts.renderTo);

            //点击首页
            delegate(opts.renderTo, 'click', el.firstPage, function(e) {
                var spanEl = DOM.parent(e.target, 'span');
                if(!(DOM.hasClass(spanEl, 'disabled')) && !that.lock){
                    opts.page = 1;
                    that.currentPage = opts.page;
                    that._sendAjax();
                }    
            });
            //点击上一页
            delegate(opts.renderTo, 'click', el.prevPage, function(e) {
                var spanEl = DOM.parent(e.target, 'span');
                if(!(DOM.hasClass(spanEl, 'disabled')) && !that.lock){
                    opts.page = opts.page - 1;
                    that.currentPage = opts.page;
                    that._sendAjax();
                }   
            });
            //点击下一页
            delegate(opts.renderTo, 'click', el.nextPage, function(e) {
                var spanEl = DOM.parent(e.target, 'span');
                if(!(DOM.hasClass(spanEl, 'disabled')) && !that.lock){
                    opts.page = opts.page + 1;
                    that.currentPage = opts.page;
                    that._sendAjax();
                }    
            });
            //点击尾页
            delegate(opts.renderTo, 'click', el.lastPage, function(e) {
                var spanEl = DOM.parent(e.target, 'span');
                if(!(DOM.hasClass(spanEl, 'disabled')) && !that.lock){
                    opts.page = opts.pageCount;
                    that.currentPage = opts.page;
                    that._sendAjax();
                }
            });
            //点击指定的页码
            delegate(opts.renderTo, 'click', el.numPage, function(e) {
                if(!($(this).hasClass('check')) && !that.lock){
                    opts.page = parseInt($(e.target).text());
                    that.currentPage = opts.page;
                    that._sendAjax();
                }    
            });
            //点击按钮进行跳转
            delegate(opts.renderTo, 'click', el.btnGo, function(evt) {
                num = $(evt.target).prev().val();
                if(!!num && !that.lock){
                    that._checkPage(num);
                    that._sendAjax();
                }    
            });
        },
        /**
         * 验证跳转页码
         */
        _checkPage: function(p){
            var
                that = this,
                opts = that.opts,
                isChange = false;

            if(isNaN(parseInt(p)) || p < 1) {
                p = 1;
            }else if(p > opts.pageCount) {
                p = opts.pageCount;
            }
            if(opts.page !== p) isChange = true;
            opts.page = p;
            that.currentPage = p;
            return isChange;
        },
        /**
         * 对当前页码和总页码进行验证
         */
        _checkNum: function(){
            var
                that = this,
                opts = that.opts,
                page = opts.page,
                pageCount = opts.pageCount;
            
            page = parseInt(page);
            pageCount = parseInt(pageCount);
            
            if(isNaN(page) || page < 1) page = 1;
            if(isNaN(pageCount) || pageCount < 1) pageCount = 1;
            if(page > pageCount) page = pageCount;

            if(page == 1 && page < pageCount) {
                this.hasPre = false;
                this.hasNext = true;
            }else if(page == pageCount && page > 1) {
                this.hasPre = true;
                this.hasNext = false;
            }else if(page > 1 && page < pageCount) {
                this.hasPre = true;
                this.hasNext = true;
            }else {
                this.hasPre = false;
                this.hasNext = false;
            }

            opts.page = page;
            that.currentPage = page;
            opts.pageCount = pageCount;
        }
    });
	return Oper;
},{
	requires:[
		'pagination/pctrl',
		'mod/juicer'
	]
});

/**
 * 分页页码控制
 */
KISSY.add('pagination/pctrl', function(S){
	var
        DOM = S.DOM, get = DOM.get, 
        JSON = S.JSON, on = S.Event.on, IO = S.IO,
        $ = S.all,
        config = {
            pageSize: 10,
            page: 1
        };

    function Pctrl(param){
        this.opts = S.merge(config, param);
    }

    S.augment(Pctrl, S.EventTarget, {
        /**
         * 更新分页页码
         * @param  {[type]} dataCount [数据总数]
         * @param  {[type]} page      [当前页码]
         */
        refresh: function(page, dataCount){
            var
                that = this, opts = that.opts;
            if(!!dataCount) {
                opts.dataCount = dataCount;
                opts.pageCount = Math.ceil(opts.dataCount/opts.pageSize);
            }

            if(!!page) {
                opts.page = page;
            }
            //当前页码和总页数验证
            that._checkPage();
            //配置处理
            that._configHandel();
            //更新分页页码
            that._refreshHTML();
        },
        /**
         * 更新分页页码显示
         */
        _refreshHTML:function(){
            var
                that = this, opts = that.opts,
                temp = that._generateHTML(opts.page);
            $(opts.renderTo).html(temp).addClass(opts.themePackage.themeCss);
        },
        /**
         * 配置处理函数，对配置项里面的主题配置进行处理，提取出需要的内容
         */
        _configHandel:function(){
            var
                that = this, opts = that.opts,
                themePackage = opts.themePackage;
            
            if(themePackage){
                that.themeCounter = S.substitute(themePackage.themeCounter, {
                    page: opts.page,
                    pageCount: opts.pageCount
                });
                that.themeJump    = S.substitute(themePackage.themeJump, {
                    input: '<input type="text" id="pageNum" name="pageNum" class="goTo"/>',
                    button: '<button class="J_btnGo">&nbsp;</button>'
                });
            }
        },
        /**
         * 拼装分页页码html
         */
        _generateHTML: function(){
            var
                that = this, opts = that.opts, endPage = 0,
                page = opts.page, pageCount = opts.pageCount,
                tp = opts.themePackage, layout = tp.layout,
                //上一页的页码
                prevPage = parseInt(opts.page) - 1,
                //下一页的页码
                nextPage = parseInt(opts.page) + 1,
                strHtml = '';

            
            if (pageCount > page + 2) {
                endPage = page + 2;
            } else {
                endPage = pageCount;
            }

            if(pageCount <= 1) {
                strHtml = '';
            }else {
                S.each(layout, function(item) {
                    switch(item) {
                        case 'first':
                            if(prevPage < 1) {
                                strHtml += 
                                    '<span id="J_firstPage" class="disabled">' +
                                        tp.firstPageTip +
                                    '</span>'; 
                            }else {
                                strHtml += 
                                    '<a id="J_firstPage">' +
                                        tp.firstPageTip +
                                    '</a>';    
                            }
                            break;
                        case 'prev':
                            if(prevPage < 1) {
                                strHtml += 
                                    '<span id="J_prevPage" class="disabled">' +
                                        tp.prevPageTip +
                                    '</span>'; 
                            }else {
                                strHtml += 
                                    '<a id="J_prevPage">' +
                                        tp.prevPageTip +
                                    '</a>';   
                            }
                            break;
                        case 'num':
                            if (page != 1) strHtml += '<a class="J_page">1</a>';
                            if (page >= 5) strHtml += '<span class="until">...</span>';
                            for (var i = page - 2; i <= endPage; i++) {
                                if (i > 0) {
                                    if (i == page) {
                                        strHtml += '<span class="check">' + i + '</span>';
                                    }else {
                                        if (i != 1 && i != pageCount) {
                                            strHtml += '<a class="J_page">' + i + '</a>';
                                        }
                                    }
                                }
                            }
                            if (page + 3 < pageCount) strHtml += '<span class="until">...</span>';
                            if (page != pageCount) strHtml += '<a class="J_page">' + pageCount + '</a>';
                            break;
                        case 'next':
                            if(nextPage > pageCount) {
                                strHtml += ''+
                                    '<span id="J_nextPage" class="disabled">'+
                                        tp.nextPageTip+
                                    '</span>';
                            }else {
                                strHtml += ''+
                                    '<a id="J_nextPage">'+
                                        tp.nextPageTip+
                                    '</a>';
                            }
                            break;
                        case 'last':
                            if(nextPage > pageCount) {
                                strHtml += ''+
                                    '<span id="J_lastPage" class="disabled">'+
                                        tp.lastPageTip+
                                    '</span>';    
                            }else {
                                strHtml += ''+
                                    '<a id="J_lastPage">'+
                                        tp.lastPageTip+
                                    '</a>';   
                            }
                            break;
                        case 'counter':
                            strHtml += '<span class="count">'+that.themeCounter+'</span>';
                            break;
                        case 'gotoNum':
                            if(pageCount >= 5) strHtml += that.themeJump;
                            break;
                    }
                });    
            }            
            return strHtml;
        },
        /**
         * 对当前页数和总页数进行验证
         */
        _checkPage: function(){
            var
                opts = this.opts;
            //当前页数为非数字，则当前页数置为1
            if (isNaN(parseInt(opts.page))) opts.page = 1;
            //总页数为非数字，则将总页数置为1
            if (isNaN(parseInt(opts.pageCount))) opts.pageCount = 1;
            if (opts.page < 1) opts.page = 1;
            if (opts.pageCount < 1) opts.pageCount = 1;
            if (opts.page > opts.pageCount) opts.page = opts.pageCount;
            opts.page = parseInt(opts.page);
            opts.pageCount = parseInt(opts.pageCount);
        }       
    }); 

	return Pctrl;
},{
	requires:[
		'core'
	]
});