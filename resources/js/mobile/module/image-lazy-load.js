/*-----------------------------------------------------------------------------
 * @Description:     图片懒加载
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.19
 * ==NOTES:=============================================
 * v1.0.0(2016.01.19):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('module/image-lazy-load', function(S){
    var
        DOM = S.DOM,
        query = DOM.query,
        LAZY_LOAD = 'lazy-load',
        el = {
            lazyRender: '.lazy-load'
        },
        ImageLazyLoad = {
            client: function(param){
                var
                    that = this;

                $(param.renderTo).lazyload({
                    effect: "fadeIn",
                    container: param.container ? $(param.container) : $('window'),
                    effectspeed: 1500,
                    event : "sporty"
                });

                //$(window).on('load', function(){
                //    setTimeout(function(){
                //        $(param.renderTo).trigger('sporty');
                //    }, 2000);
                //});
            },
            refresh: function(){
                var
                    that = this;

                S.each(query(el.lazyRender), function(o){
                    DOM.data(o, LAZY_LOAD, that.client({
                        renderTo: o,
                        container: DOM.attr(o, 'data-lazy-container')
                    }));
                });
            }
        };

    S.ready(function(){
        ImageLazyLoad.refresh();
    });
    PW.namespace('module.ImageLazyLoad');
    PW.module.ImageLazyLoad = ImageLazyLoad;
    return ImageLazyLoad;
},{
    requires: [
        'image-lazy-load/core'
    ]
});

KISSY.add('image-lazy-load/core', function(S){
    /*
     * Lazy Load - jQuery plugin for lazy loading images
     *
     * Copyright (c) 2007-2012 Mika Tuupola
     *
     * Licensed under the MIT license:
     *   http://www.opensource.org/licenses/mit-license.php
     *
     * Project home:
     *   http://www.appelsiini.net/projects/lazyload
     *
     * Version:  1.7.2
     *
     */
    (function($, window) {

        $window = $(window);

        $.fn.lazyload = function(options) {
            var elements = this;
            var settings = {
                threshold       : 0,
                failure_limit   : 0,
                event           : "scroll",
                effect          : "show",
                container       : window,
                data_attribute  : "original",
                skip_invisible  : true,
                appear          : null,
                load            : null
            };

            function update() {
                var counter = 0;

                elements.each(function() {
                    var $this = $(this);
                    if (settings.skip_invisible && !$this.is(":visible")) {
                        return;
                    }
                    if ($.abovethetop(this, settings) ||
                        $.leftofbegin(this, settings)) {
                        /* Nothing. */
                    } else if (!$.belowthefold(this, settings) &&
                        !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                    } else {
                        if (++counter > settings.failure_limit) {
                            return false;
                        }
                    }
                });

            }

            if(options) {
                /* Maintain BC for a couple of versions. */
                if (undefined !== options.failurelimit) {
                    options.failure_limit = options.failurelimit;
                    delete options.failurelimit;
                }
                if (undefined !== options.effectspeed) {
                    options.effect_speed = options.effectspeed;
                    delete options.effectspeed;
                }

                $.extend(settings, options);
            }

            /* Cache container as jQuery as object. */
            $container = (settings.container === undefined ||
            settings.container === window) ? $window : $(settings.container);

            /* Fire one scroll event per scroll. Not one scroll event per image. */
            if (0 === settings.event.indexOf("scroll")) {
                $container.bind(settings.event, function(event) {
                    return update();
                });
            }

            this.each(function() {
                var self = this;
                var $self = $(self);

                self.loaded = false;

                /* When appear is triggered load original image. */
                $self.one("appear", function() {
                    if (!this.loaded) {
                        if (settings.appear) {
                            var elements_left = elements.length;
                            settings.appear.call(self, elements_left, settings);
                        }
                        $("<img />")
                            .bind("load", function() {
                                $self
                                    .hide()
                                    .attr("src", $self.data(settings.data_attribute))
                                    [settings.effect](settings.effect_speed);
                                self.loaded = true;

                                /* Remove image from array so it is not looped next time. */
                                var temp = $.grep(elements, function(element) {
                                    return !element.loaded;
                                });
                                elements = $(temp);

                                if (settings.load) {
                                    var elements_left = elements.length;
                                    settings.load.call(self, elements_left, settings);
                                }
                            })
                            .attr("src", $self.data(settings.data_attribute));
                    }
                });

                /* When wanted event is triggered load original image */
                /* by triggering appear.                              */
                if (0 !== settings.event.indexOf("scroll")) {
                    $self.bind(settings.event, function(event) {
                        if (!self.loaded) {
                            $self.trigger("appear");
                        }
                    });
                }
            });

            /* Check if something appears when window is resized. */
            $window.bind("resize", function(event) {
                update();
            });

            /* Force initial check if images should appear. */
            update();

            return this;
        };

        /* Convenience methods in jQuery namespace.           */
        /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

        $.belowthefold = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.height() + $window.scrollTop();
            } else {
                fold = $container.offset().top + $container.height();
            }

            return fold <= $(element).offset().top - settings.threshold;
        };

        $.rightoffold = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.width() + $window.scrollLeft();
            } else {
                fold = $container.offset().left + $container.width();
            }

            return fold <= $(element).offset().left - settings.threshold;
        };

        $.abovethetop = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.scrollTop();
            } else {
                fold = $container.offset().top;
            }

            return fold >= $(element).offset().top + settings.threshold  + $(element).height();
        };

        $.leftofbegin = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.scrollLeft();
            } else {
                fold = $container.offset().left;
            }

            return fold >= $(element).offset().left + settings.threshold + $(element).width();
        };

        $.inviewport = function(element, settings) {
            return !$.rightofscreen(element, settings) && !$.leftofscreen(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
        };

        /* Custom selectors for your convenience.   */
        /* Use as $("img:below-the-fold").something() */

        $.extend($.expr[':'], {
            "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0, container: window}); },
            "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0, container: window}); },
            "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0, container: window}); },
            "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0, container: window}); },
            "in-viewport"    : function(a) { return !$.inviewport(a, {threshold : 0, container: window}); },
            /* Maintain BC for couple of versions. */
            "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0, container: window}); },
            "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0, container: window}); },
            "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0, container: window}); }
        });

    })(jQuery, window);

}, {
    requires: [
        'thirdparty/jquery'
    ]
});