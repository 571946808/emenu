/*-----------------------------------------------------------------------------
* @Description:     气泡
* @Version:         1.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.17
* ==NOTES:=============================================
* v1.0.0(2015.9.17):
     初始生成
* ---------------------------------------------------------------------------*/
 KISSY.add('widget/tooltip', function(S, Core){
    var
        Tooltip = {
            client: function(param){
                return new Core(param);
            }
        };
    PW.namespace('widget.Tooltip');
    PW.widget.Tooltip = Tooltip;
    return Tooltip;
 },{
    requires: [
        'tooltip/core'
    ]
 });
 KISSY.add('tooltip/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, Event = S.Event, on = Event.on, delegate = Event.delegate,$ = S.all,
        Juicer = PW.mod.Juicer.client,
        config = {
            triggerEl: '',
            placement: 'bottom',
            temp: {
                hasTemp: false,
                tpl: ''
            }
        },
        el = {
            tooltipTemp: '#tooltipTpl',
            triggerEl: '[data-tooltip-toggle="tooltip"]'
        },
        DATA_TOOLTIP_TEXT = 'data-tooltip-text',
        DATA_TOOLTIP_PLACEMENT = 'data-tooltip-placement',
        TOOLTIP_TEMP = '<div class="tooltip &{placement} in hidden" role="tooltip">' +
                       '    <div class="tooltip-arrow"></div>' +
                       '    <div class="tooltip-inner">' + 
                       '        &{tooltipContent}' +
                       '    </div>' +
                       '</div>';

    function Core(param){
        this.opts = S.merge(config, param);
        this.lock = 0;
        this._init();
    }

    S.augment(Core, S.EventTarget, {
        /**
         * 对外函数：拼凑气泡提示框
         * @param {[type]} temp    [description]
         * @param {[type]} data    [description]
         * @param {[type]} trigger [description]
         */
        setHtml: function(temp, data, trigger){
            var
                that = this,
                html = Juicer(temp, {list: data}),
                temp = Juicer(TOOLTIP_TEMP, {
                    placement: that.opts.placement
                });
            var 
                htmlStr = DOM.create(html),
                tempStr = DOM.create(temp);
           
            if(!that.lock){
                DOM.insertAfter(tempStr, trigger);
                $('.tooltip-inner').html('');
                $('.tooltip-inner').append(htmlStr);
                that.lock = 1;
            }
            $(tempStr).removeClass('hidden');
        },
        /**
         * 清除气泡的内容
         * @param  {[type]} trigger [description]
         * @return {[type]}         [description]
         */
        _removeHtml: function(trigger){
            var
                that = this;
            $(trigger).empty();
        },
        _init: function(){
            if(!this.opts.temp.hasTemp){
                this._createTooltip();
            }
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
            on(that.opts.triggerEl, 'mouseenter', function(e){
                that._show(this);
            });
            on(that.opts.triggerEl, 'mouseleave', function(e){
                that._hide(this);
            });
        },
        /**
         * 显示气泡
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _show: function(e){
            var
                that = this,
                content = $(e).next();
            if(that.opts.beforeRender){
                that.opts.beforeRender();
            }
            $(content).removeClass('hidden');
            that.fire('show');
        },
        /**
         * 删除气泡
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _hide: function(e){
            var
                that = this,
                content = $(e).next();
            $(content).addClass('hidden');
        },
        /**
         * 创建气泡
         * @return {[type]} [description]
         */
        _createTooltip: function(){
            var
                that = this,
                tooltipStr,
                tooltip;
            if(!that.opts.temp.hasTemp){
                that._defaultRender();
            }
        },
        /**
         * 如果没有参入气泡模板，就采用默认的模板
         * @return {[type]} [description]
         */
        _defaultRender: function(){
            var
                that = this;
                tooltipStr = Juicer(TOOLTIP_TEMP, {
                    tooltipContent: DOM.attr(that.opts.triggerEl, DATA_TOOLTIP_TEXT),
                    placement: that.opts.placement
                }),
                tooltip = DOM.create(tooltipStr);
            DOM.append(tooltip, that.opts.triggerEl);
        }
    });

    return Core;
 },{
    requires: [
        'mod/juicer',
        'core'
    ]
 });