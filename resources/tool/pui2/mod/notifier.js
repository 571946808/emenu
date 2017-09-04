/*-----------------------------------------------------------------------------
 * @Description:     提示器
 * @Version:         2.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.4.11
 * ==NOTES:=============================================
 * v3.0.0(2015-4-11):
 	升级为kissy1.4版本，取消sizzle.js
 * ---------------------------------------------------------------------------*/
 
KISSY.add('mod/notifier', function(S, Core){
	var
		Notifier = {
			store:[],
			version: '2.0.0',
			client: function(param){
				return new Core(param);
			}
		}
	PW.namespace('mod.Notifier');
	PW.mod.Notifier = Notifier;
	return Notifier;
},{
	requires:[
		'notifier/core'
	]
});

KISSY.add('notifier/core', function(S){
	var
		DOM =S.DOM, get = DOM.get, query = DOM.query,  $ = S.all
		on = S.Event.on, delegate = S.Event.delegate, detach = S.Event.detach,
		Overlay = Overlay.client, Juicer = S.juicer,
		MS_NOTIFIER = PW.Env.modSettings.notifier,
		NTF_TEMP = '<div class="pw-notifier theme-&{theme}" style="width: &{width}px; z-index: &{zIndex};">'+
					'{@if close}'+
					'    <a href="javascript:;" class="notifier-close">&times;</a>'+
					'{@/if}'+
					'{@if title}'+
					'    <h2 class="notifier-top">'+
					'        &{title}'+
					'    </h2>'+
					'{@/if}'+
					'    <div class="notifier-content">'+
					'         &{content}'
					'    </div>'+
					'</div>',
		el = {
			closeTrigger: '.notifier-close'
		},
		config = {
			width: 200,
			title: '',
			content:'',
			region: 'm',  //n, ne, e, se, s, sw, s, nw, middle
			slideIn: 'down',
			slideOut: 'up',
			close: true,
			zIndex: 100,
			themeUrl: PW.Env.puiWebsite + 'assets/notifier/css/style.css',
			theme: 'red'
		};

	function Notifier(param){
		this.opts = S.merge(config, MS_NOTIFIER, param);
		this.ntfEl;
		this._init();
	}

	S.augment(Notifier, S.EventTarget, {
		_init: function(){
			var
				that = this,
				opts = that.opts;
			that._loadStyle();
			that._buildNtfEl();
			that._buildNtfEvt();
		},
		_loadStyle: function(){
			var
				that = this,
				url = that.opts.themeUrl;
			S.loadCSS(url);
		},
		refresh: function(param){
			var
				that = this;
			that.opts = S.merge(that.opts, param);
			that.remove();
			that._init();
		},
		refreshContent: function(str){
			var
				that = this,
				ntfEl = that.ntfEl
			$(ntfEl).one('.notifier-content').html(str || '');
		},
		refreshTitle: function(){
			var
				that = this,
				ntfEl = that.ntfEl
			$(ntfEl).one('.notifier-top').html(str || '');
		},
		show: function(cb, inDirect){
			var
				that = this,
				opts = that.opts,
				ntfEl = that.ntfEl,
				inPos, pos;

			that.fire('beforeShow',{});
			pos = that._fixPos();
			inPos = that._getSlideInPos(inDirect);

			$(ntfEl).css({
				opacity: 0,
				left: inPos.left,
				top: inPos.top,
				display: 'block'
			}).animate({
				opacity: 1,
				left: pos.left,
				top: pos.top
			}, .3, 'easeOut', function(){
				if(S.isFunction(cb)){
					cb.call(that);
				}
			})

			that.fire('afterShow',{});
		},
		hide: function(cb, outDirect){
			var
				that = this,
				ntfEl = that.ntfEl,
				opts = that.opts,
				pos, outPos;
			that.fire('beforeHide',{});
			pos = that._fixPos();
			outPos = that._getSlideOutPos(outDirect);

			$(ntfEl).animate({
				opacity: 0,
				left: outPos.left,
				top: outPos.top
			}, .3, 'easeOut', function(){
				$(ntfEl).css({
					display: 'none'
				})
				if(S.isFunction(cb)){
					cb.call(that);
				}
			})

			that.fire('afterHide',{});
		},
		flashShow: function(wait, cb, inDirect, outDirect){
			var
				that = this;
			 that.show(function(){
			 	setTimeout(function(){
			 		that.hide(cb);
			 	},wait || 200);
			 })
		},
		remove: function(){
			var
				that = this;
			DOM.remove(that.ntfEl);
		},
		_buildNtfEl: function(){
			var
				that = this,
				opts = that.opts;
			that.ntfEl = DOM.create(Juicer(NTF_TEMP, opts));
			DOM.append(that.ntfEl, 'body');
		},
		_buildNtfEvt: function(){
			var
				that = this,
				ntfEl = that.ntfEl,
				$ntfEl = $(ntfEl);
			if(!ntfEl) return;
			$ntfEl.one(el.closeTrigger).on('click', that._closeHandler, that);
			$ntfEl.on('click', that._clickHandler, that);
		},
		_closeHandler: function(ev){
			var
				that = this;
			that.hide();
		},
		_clickHandler: function(ev){
			var
				that = this;
			that.fire('click',{});
		},
		_fixPos: function(){
			var
				that = this,
				ntfEl = that.ntfEl,
				region = that.opts.region,
				pw = DOM.width(window),
				ph = DOM.height(window),
				nw = DOM.width(ntfEl),
				nh = DOM.height(ntfEl),
				l, t;

			switch(region){
			    case 'n':
			    	l = (pw - nw ) / 2;
			    	t = 50;
			        break;
			    case  'ne':
			        l = pw - nw - 50;
			        t = 50;
			        break;
			    case 'e':
			    	l = pw - nw - 50;
			    	t = ( ph - nh )/2;
			    	break;
			    case 'se':
			    	l = pw - nw - 50;
			    	t = ph - nh - 50;
			    	break;
			    case 's':
			    	l = (pw - nw ) / 2;
			    	t = ph - nh - 50;
			    	break;
			    case 'sw':
			    	l = 50;
			    	t = ph - nh - 50;
			    	break;
			    case 'w':
			    	l = 50;
			    	t = ( ph - nh )/2;
			    	break;
			    case 'nw':
			    	l = 50;
			    	t = 50;
			    	break;
			    case 'm':
			    default:
			    	l = (pw - nw ) / 2;
			    	t = ( ph - nh )/2;
			}

			// DOM.css(ntfEl, {
			// 	left: l,
			// 	top: t
			// });

			return {
				left: l,
				top: t
			}
		},
		_getSlideInPos: function(inDirect){
			var
				that = this,
				opts = that.opts,
				ntfEl = that.ntfEl,
				nw = DOM.width(ntfEl),
				nh = DOM.height(ntfEl);
			pos = that._fixPos();

			switch(inDirect || opts.slideIn){
			    case 'up':
			        pos.top = pos.top + nh;
			        break;
			    case 'left':
			    	pos.left = pos.left - nw;
			    	break;
			    case 'right':
			    	pos.left = pos.left + nw;
			    	break;
			    default:
			    	pos.top = pos.top - nh;
			}
			return pos;
		},
		_getSlideOutPos: function(outDirect){
			var
				that = this,
				opts = that.opts,
				ntfEl = that.ntfEl,
				nw = DOM.width(ntfEl),
				nh = DOM.height(ntfEl),
				pos = {};

			pos = that._fixPos();
			
			switch(outDirect || opts.slideOut){
			    case 'up':
			        pos.top = pos.top - nh;
			        break;
			    case 'left':
			    	pos.left = pos.left - nw;
			    	break;
			    case 'right':
			    	pos.left = pos.left + nw;
			    	break;
			    case 'down':
			    default:
			    	pos.top = pos.top + nh;
			}
			return pos;
		}
	})
	return Notifier;
},{
	requires:[
		'core',
		'mod/sniffer',
		'mod/juicer',
		'mod/overlay'
	]
})
