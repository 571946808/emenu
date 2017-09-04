/*-----------------------------------------------------------------------------
* @Description: 轮播组件 (carousel.js)
* @Version:     V1.0.0
* @author:      cuiy(965788210@qq.com)
* @date         2015.6.15
* ==NOTES:=============================================
* v1.0.0(2015.6.15):
*  第一次写组件，肯定有很多不好用的地方
* ---------------------------------------------------------------------------*/
KISSY.add('mod/carousel', function(S, Core){
	var
		themeUri = PW.Env.puiWebsite + 'assets/carousel/css/style.css',
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		el = {
			carousel: '[data-ride="carousel"]'
		},
		// 轮播参数
		config = {
			renderTo: '',
			interval: 1000,
			wrap: true,
			pause: 'hover',
			keyboard: true,
			hasBg: false,
			bgColors: '#fff #fff #fff'
		},
		CAROUSEL_KEY = 'carousel',
		DATA_INTERVAL = 'data-interval',
		DATA_WRAP = 'data-wrap',
		DATA_SLIDE = 'data-slide',
		DATA_BG = 'data-bg',
		DATA_BG_COLOR = 'data-bg-color';
	var
		Carousel = {
            version: '1.0.0',
            client: function(param){
            	var
            		that = this,
            		carousel;
            	S.mix(config, param);
            	 //S.log(config)
            	carousel = new Core(config);
            	return carousel;
            },
			refresh: function(){
				var
					that = this;
				S.each(query(el.carousel), function(c){
					that._bulidParam(c);
					DOM.data(c, CAROUSEL_KEY, that.client({
						renderTo: c,
						interval: that.interval,
						hasBg: that.hasBg,
						bgColors: that.bgColors
					}));
				});
			},
			_bulidParam: function(c){
				var
					that = this;
				if(DOM.attr(c, DATA_INTERVAL) == '' || !DOM.hasAttr(c, DATA_INTERVAL)){
					that.interval = 5000;
				}else{
					that.interval = DOM.attr(c, DATA_INTERVAL);
				}
				if(DOM.attr(c, DATA_BG) == '' || !DOM.hasAttr(c, DATA_BG)){
					that.hasBg = false;
					that.bgColors = '#fff #fff #fff';
				}else{
					that.hasBg = true;
					if(DOM.attr(c, DATA_BG_COLOR) == '' || !DOM.hasAttr(c, DATA_BG_COLOR)){
						that.bgColors = '#fff #fff #fff';
					}else{
						that.bgColors = DOM.attr(c, DATA_BG_COLOR);
					}
				}
			}
		};
	S.ready(function(){
		Carousel.refresh();
		S.loadCSS(themeUri);
	});
	PW.namespace('mod.Carousel');
	PW.mod.Carousel = Carousel;
	return Carousel;
},{
	requires:[
		'carousel/core',
		'mod/ext',
		'core'
	]
});
KISSY.add('carousel/core', function(S){
	var
		DOM = S.DOM,
		on = S.Event.on;

	function Core(param){
		this.opts = param;
		//S.log(this.opts)
		this.instances = [];
		this._init();
	}

	S.augment(Core, {
		_init: function(){
			var 
				that = this,
				container = $(that.opts.renderTo),
				ins;
			that.container = container;
			if(!container){
				S.log('找不到轮播节点，请检查','error', 'mod/carousel');
				return;
			}
			ins = container.carousel(that.opts);
			//S.log(ins)
			that.instances.push(ins);
			// S.log(that.instances)
			this._buildEvt();

			return ins;
		},
		_buildEvt: function(){
			var
				that = this;

			//S.log(that.container)
			on(that.opts.renderTo, 'swipe', function(e){
				if(e.direction=='left'){
					e.preventDefault();
					that.container.carousel('next');
				}
				if(e.direction=='right'){
					e.preventDefault();
					that.container.carousel('prev');
				}
			});
		}
	});
	return Core;
},{
	requires:[
		'carousel/bscarousel',
		'core'
	]
});
KISSY.add('carousel/bscarousel', function(S){
	 (function ($) {
		  'use strict';

		  // CAROUSEL CLASS DEFINITION
		  // =========================

		  var Carousel = function (element, options) {
		  	 //S.log(element)
		  	 //S.log(options)
		    this.$element    = $(element)
		    this.$indicators = this.$element.find('.carousel-indicators')
		    this.options     = options
		    this.paused      = null
		    this.sliding     = null
		    this.interval    = null
		    this.$active     = null
		    this.$items      = null
		    this.hasBg = null
		    this.bgColors = null

		    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

		    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
		      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
		      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))

		    //如果data-bg-color属性值为true，初始化背景色，默认为第一个颜色 
		    this.hasBg = this.$element.attr('data-bg') || options.hasBg;
			  //console.log(this.bgColors)
		    var
				bgColor = this.$element.attr('data-bg-color');
			  if(bgColor === null || bgColor === undefined){
			  }else{
				  this.bgColors = options.bgColors.split(' ');
			  }
		    if(this.hasBg){
		    	this.$element.css('backgroundColor', this.bgColors[0]);
		    }
		  }

		  Carousel.VERSION  = '3.3.4'

		  Carousel.TRANSITION_DURATION = 600

		  Carousel.DEFAULTS = {
		    interval: 5000,
		    pause: 'hover',
		    wrap: true,
		    keyboard: true
		  }

		  Carousel.prototype.keydown = function (e) {
		    if (/input|textarea/i.test(e.target.tagName)) return
		    switch (e.which) {
		      case 37: this.prev(); break
		      case 39: this.next(); break
		      default: return
		    }

		    e.preventDefault()
		  }

		  Carousel.prototype.cycle = function (e) {
		    e || (this.paused = false)

		    this.interval && clearInterval(this.interval)

		    this.options.interval
		      && !this.paused
		      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

		    return this
		  }

		  Carousel.prototype.getItemIndex = function (item) {
		    this.$items = item.parent().children('.item')
		    return this.$items.index(item || this.$active)
		  }

		  Carousel.prototype.getItemForDirection = function (direction, active) {
		    var activeIndex = this.getItemIndex(active)
		    var willWrap = (direction == 'prev' && activeIndex === 0)
		                || (direction == 'next' && activeIndex == (this.$items.length - 1))
		    if (willWrap && !this.options.wrap) return active
		    var delta = direction == 'prev' ? -1 : 1
		    var itemIndex = (activeIndex + delta) % this.$items.length
		    return this.$items.eq(itemIndex)
		  }

		  Carousel.prototype.to = function (pos) {
		    var that        = this
		    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

		    if (pos > (this.$items.length - 1) || pos < 0) return

		    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
		    if (activeIndex == pos) return this.pause().cycle()

		    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
		  }

		  Carousel.prototype.pause = function (e) {
		    e || (this.paused = true)

		    if (this.$element.find('.next, .prev').length && $.support.transition) {
		      this.$element.trigger($.support.transition.end)
		      this.cycle(true)
		    }

		    this.interval = clearInterval(this.interval)

		    return this
		  }

		  Carousel.prototype.next = function () {
		    if (this.sliding) return
		    return this.slide('next')
		  }

		  Carousel.prototype.prev = function () {
		    if (this.sliding) return
		    return this.slide('prev')
		  }

		  Carousel.prototype.slide = function (type, next) {
		    var $active   = this.$element.find('.item.active')
		    var $next     = next || this.getItemForDirection(type, $active)
		    var isCycling = this.interval
		    var direction = type == 'next' ? 'left' : 'right'
		    var that      = this
		    var hasBg = null

		    if ($next.hasClass('active')) return (this.sliding = false)

		    var relatedTarget = $next[0]
		    var slideEvent = $.Event('slide.bs.carousel', {
		      relatedTarget: relatedTarget,
		      direction: direction
		    })
		    this.$element.trigger(slideEvent)
		    if (slideEvent.isDefaultPrevented()) return

		    this.sliding = true

		    isCycling && this.pause()

		    if (this.$indicators.length) {
		      this.$indicators.find('.active').removeClass('active')
		      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
		      $nextIndicator && $nextIndicator.addClass('active')
		    }

		    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
		    if ($.support.transition && this.$element.hasClass('slide')) {
		    	
		    	// 如果轮播有背景颜色
		    	if(this.hasBg){
			    	var nextIndex = $next.index();
			    	this.$element.css('backgroundColor',this.bgColors[nextIndex]);
			    }
		    	
			    $next.addClass(type)
			    $next[0].offsetWidth // force reflow
			    $active.addClass(direction)
			    $next.addClass(direction)
			    $active
			        .one('bsTransitionEnd', function () {
			          $next.removeClass([type, direction].join(' ')).addClass('active')
			          $active.removeClass(['active', direction].join(' '))
			          that.sliding = false
			          setTimeout(function () {
			            that.$element.trigger(slidEvent)
			          }, 0)
			        })
			        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
		    } else {
		      $active.removeClass('active')
		      $next.addClass('active')
		      this.sliding = false
		      this.$element.trigger(slidEvent)
		    }

		    isCycling && this.cycle()

		    return this
		  }


		  // CAROUSEL PLUGIN DEFINITION
		  // ==========================

		  function Plugin(option) {
		    return this.each(function () {
		      var $this   = $(this)
		      var data    = $this.data('bs.carousel')
		      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
		      var action  = typeof option == 'string' ? option : options.slide

		      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
		      if (typeof option == 'number') data.to(option)
		      else if (action) data[action]()
		      else if (options.interval) data.pause().cycle()
		    })
		  }

		  var old = $.fn.carousel

		  $.fn.carousel             = Plugin
		  $.fn.carousel.Constructor = Carousel


		  // CAROUSEL NO CONFLICT
		  // ====================

		  $.fn.carousel.noConflict = function () {
		    $.fn.carousel = old
		    return this
		  }


		  // CAROUSEL DATA-API
		  // =================

		  var clickHandler = function (e) {
		    var href
		    var $this   = $(this)
		    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
		    if (!$target.hasClass('carousel')) return
		    var options = $.extend({}, $target.data(), $this.data())
		    var slideIndex = $this.attr('data-slide-to')
		    if (slideIndex) options.interval = false

		    Plugin.call($target, options)

		    if (slideIndex) {
		      $target.data('bs.carousel').to(slideIndex)
		    }

		    e.preventDefault()
		  }

		  $(document)
		    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
		    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

		  // $(window).on('load', function () {
		  //   $('[data-ride="carousel"]').each(function () {
		  //     var $carousel = $(this)
		  //     Plugin.call($carousel, $carousel.data())
		  //   })
		  // })

		})(jQuery);
},{
	requires:[
		'carousel/transition'
	]
});
KISSY.add('carousel/transition', function(S){
	(function ($) {
	  'use strict';

	  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
	  // ============================================================

	  function transitionEnd() {
	    var el = document.createElement('bootstrap')

	    var transEndEventNames = {
	      WebkitTransition : 'webkitTransitionEnd',
	      MozTransition    : 'transitionend',
	      OTransition      : 'oTransitionEnd otransitionend',
	      transition       : 'transitionend'
	    }

	    for (var name in transEndEventNames) {
	      if (el.style[name] !== undefined) {
	        return { end: transEndEventNames[name] }
	      }
	    }

	    return false // explicit for ie8 (  ._.)
	  }

	  // http://blog.alexmaccaw.com/css-transitions
	  $.fn.emulateTransitionEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('bsTransitionEnd', function () { called = true })
	    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
	    setTimeout(callback, duration)
	    return this
	  }

	  $(function () {
	    $.support.transition = transitionEnd()

	    if (!$.support.transition) return

	    $.event.special.bsTransitionEnd = {
	      bindType: $.support.transition.end,
	      delegateType: $.support.transition.end,
	      handle: function (e) {
	        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
	      }
	    }
	  })

	})(jQuery);

},{
	requires: [
		'thirdparty/jquery'
	]
});