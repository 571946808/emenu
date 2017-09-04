/*-----------------------------------------------------------------------------
* @Description: 加载遮罩提示 (loadingTip.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.05.31
* ==NOTES:=============================================
* v1.0.0(2013.05.31):
* 	初始生成 
* v1.0.1(2013.08.19):
* 	bug fix: 修复css加载时的错误
* 	添加show和hide的外部回调函数
* ---------------------------------------------------------------------------*/
	
KISSY.add('widget/loading', function(S, Loading){
	PW.namespace('widget.Loading');
	PW.widget.Loading = { 
		client: function(param){
			return new Loading(param);
	 	}
	}
},{
	requires:['loading/core']
})


KISSY.add('loading/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,  $ = S.all,
		Juicer = PW.mod.Juicer.client,
		CONFIG = {
			renderTo: '',
			hint: '',
			width: 200,
			topLayer: 0,
			bgColor: '#000',
			opacity: .6,
			theme: 'a',
			themeUrl: PW.Env.puiWebsite + 'assets/loading/css/style.css'
		},
		HINT_CONTENT_TPL = ''+
						'<div class="pw-loading-tip theme-&{theme}">'+
							'<i class="loading-icon"></i>'+
							'<div class="loading-content">&{content}</div>'+
						'</div>',
		//站点配置中的内容
		MOD_SETTINGS = PW.Env.modSettings.loadingTip || {},
		//由于异步调取css，所以在加载的时候等待css加载完毕，默认等待500ms
		RENDER_WAIT_TIME = 200,
		//执行过渡动画的时间
		ANIMATE_SPEED = .2;

	function Core(param){
		this.opts = S.merge(CONFIG, MOD_SETTINGS, param); 
		this.overlay;
		this.win;
		this.doc;
		this.tipEl;
		this.init();
	}

	S.augment(Core, S.augment, {
		init: function(){
			var
				that = this;
			//创建overlay
			that._createOverlay();
			//加载样式文件，等待加载完毕之后处理
			that._loadStyle(function(){});
			that.addEvtDispatcher();
		},
		addEvtDispatcher: function(){
			var
				that = this;
			that.overlay.on('resize', function(e){
				that._fixStyle();
			})
		},
		refresh: function(){
			var
				that = this;
			that.remove();
			that.init();
		},
		render: function(){
			var
				that = this;
			that._render();
		},
		show: function(cb){
			var
				that = this;
			that.render();

			//执行外部回调函数
			if(S.isFunction(cb)){
				cb(that);
			}
		},
		hide: function(cb){
			var
				that  = this,
				tipEl = that.tipEl,
				ol    = that.overlay,
				$tip  = $(tipEl),
				t     = parseInt($tip .css('top')),
				h     = $tip.outerHeight();
			$tip.animate(
				{
					top: t - h,
					opacity: 0
				}, 
				ANIMATE_SPEED, 
				'',
				function(){
					ol.hide();
					if(S.isFunction(cb)){
						cb(that);
					}
				}
			);
		},
		remove: function(){
			var
				that  = this,
				tipEl = that.tipEl,
				$tip  = $(tipEl),
				t     = parseInt($tip .css('top')),
				h     = $tip.outerHeight();
			//执行一次动画
			$tip.animate(
				{
					top: t - h,
					opacity: 0
				}, 
				ANIMATE_SPEED, 
				'',
				function(){
					that.overlay.destroy();
				}
			);
		},
		_render:function(){
			var
				that = this,
				opts = that.opts;
			that._createTipEl()
			that.overlay.setContent(that.tipEl);
			that.overlay.render();
			that._fixStyle();
		},
		_createOverlay:function(){
			var
				that = this,
				opts = that.opts;
			that.overlay = PW.mod.Overlay.client({
				renderTo: opts.renderTo,
	            zIndex: opts.zIndex,
	            opacity: opts.opacity,
	            bgColor: opts.bgColor,
	            topLayer: opts.topLayer
			});
			that.win = that.overlay.win;
			that.doc = that.overlay.doc;
		},
		_createTipEl: function(){
			var
				that = this,
				opts = that.opts,
				el,
				html = '',
				c = get(opts.hint);
			
			if(S.isString(opts.hint) && !c){
				html = Juicer(HINT_CONTENT_TPL, {
					theme: opts.theme, 
					content: opts.hint
				})
				el = DOM.create(html, {}, that.doc);
			}
			if(c != null){
				html = Juicer(HINT_CONTENT_TPL, {
					theme: opts.theme, 
					content: ''
				})
				el = DOM.create(html, that.doc);
				DOM.append(opts.hint, el);
			}
			that.tipEl = el;
		},
		_fixStyle: function(){
			var
				that  = this,
				opts  = that.opts,
				tipEl = that.tipEl,
				w     = DOM.width(tipEl),
				h     = DOM.outerHeight(tipEl),
				ol    = that.overlay,
				vw    = ol.w,
				vh    = ol.h;
			DOM.css(tipEl, {
				left: (vw - opts.width)/2,
				top: (vh - h)/2,
				width: opts.width,
				opacity: 1
			})
		},
		_loadStyle: function(cb){
			var
				that = this,
				opts = that.opts,
				themeUrl = opts.themeUrl;

			S.loadCSS(themeUrl,{
				success: function(){
					cb.call(that, true)
				},
				error: function(){
					cb.call(that, false);
				}
			}, that.doc);
		}
	})

	return Core;
},{
	requires:[
		'core',
		'mod/overlay',
		'mod/juicer',
		'mod/ext'
	]
})