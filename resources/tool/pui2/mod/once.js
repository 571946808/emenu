/*-----------------------------------------------------------------------------
* @Description: 单次提交模块，主要用户避免用户重复/多次提交 (once.js)
* @Version:     V3.0.0
* @author:      Nina(1284663246@qq.com)
* @date         2015.04.13
* ==NOTES:=============================================
* v3.0.0(2015.04.13):
*     初始生成
* 历史版本： create by Simon(406400939@qq.com) 2013.08.02
* ---------------------------------------------------------------------------*/

KISSY.add('mod/once', function(S, OnceAjax){
    var 
        Once = {
            client: function(param){
                return new OnceAjax(param);
            }
        };
    S.mix(S,{
        Once: function(param){
            return new OnceAjax(param);
        }
    });
    return Once;
},{
    requires: [
        'once/ajax',
        'once/form'
    ]
})

/**
 * 主要用于单次ajax提交的情况，此处退出S.once函数
 */
KISSY.add('once/ajax', function(S,Notifier){
    var
        IO = S.IO,
        CONFIG = {
            hint: '正在处理,请稍后...',
            topLayer: 0,
            url: '',
            success: function(){},
            error: function(){}
        };


    var OnceAjax = function (param){
        //用户获取参数
        this.opts = S.merge(CONFIG, param);
        //加载提示
        this.ldt;
        //ajax数据，在success和error上做了特殊处理
        this.ajaxConfig = {};
        this._init();
    }

    S.augment(OnceAjax, {
        _init: function(){
            //生成加载提示
            this.ldt = Notifier.Client(this.opts);
            //获取ajax加载数据
            this._getAjaxConfig();
            //发送
            this._sendXhr();
        },
        _getAjaxConfig: function(param){
            var
                that = this,
                ldt = that.ldt,
                opts = that.opts,
                ajaxConfig = that.ajaxConfig;
            for(var p in opts){
                if(p != 'success' && p != 'error'){
                    ajaxConfig[p] = opts[p];
                }
            }
            ajaxConfig.success = function(data){
                S.timer(function(){
                    ldt.hide(function(){
                        opts.success.call(this, data);
                    });
                },.1,1)
            }
            ajaxConfig.error = function(err){
                S.timer(function(){
                    ldt.hide(function(){
                        opts.error.call(this,err);
                    });
                },.1,1)
            };
        },
        _sendXhr: function(){
            var
                that = this,
                ldt = that.ldt,
                ajaxConfig = that.ajaxConfig;
            //先判断，如果内容url为空，则不处理
            if(!ajaxConfig.url){
                S.log('配置的url地址无效，请检查', 'warn', 'PW/mod/once');
                return;
            }
            ldt.show();
            IO(that.ajaxConfig);
        }
    })
    return OnceAjax;
},{
    requires:[ 
        'mod/notifier'
    ]
})



/**
 * 对于form的重复提交处理，在form上添加属性 data-once-lock='1',视为加锁，一旦锁住，无法二次提交
 */

KISSY.add('once/form', function(S){
    var
        DOM = S.DOM, get = DOM.get,  query = DOM.query, $ = S.all,
        delegate = S.Event.delegate,
        LOCK_ATTR = 'data-once-lock';

    var OnceForm = function(){
        //本页所有添加了lock的项目
        this.forms;
        this._init();
    }

    S.augment(OnceForm, {
        _init: function(){
            this._resetData();
            this._addEvtDispatcher();
        },
        _addEvtDispatcher: function(){
            var
                that = this;
            //添加长生效事件
            delegate(document, 'submit', 'form['+LOCK_ATTR+'="lock"]', that._formLockHandler, that);
        },
        //重置表单数据，刷新时可能一些按钮的disabled的数据还存在，需要清除
        //禁止lock了的form缓存数据
        _resetData: function(){
            var
                that = this;
            DOM.query('form['+LOCK_ATTR+'="lock"]').each(function(f){
                f.autocomplete = 'off';
            })
        },
        //表单提交的锁处理
        //处理方式为：
        //  1.如果form的onceLock属性不存在或者为false，则将onceLock置为true, 并且禁止btns，提交表单
        //  2.如果form的onceLock属性存在，那么直接拦截表单提交
        _formLockHandler: function(ev){
            var
                that = this,
                t = ev.target,
                btns = that._getBtns(t),
                onceLock;
            onceLock = DOM.data(t, 'onceLock');
            if(!onceLock){
                DOM.data(t, 'onceLock', true);
                S.each(btns, function(btn){
                    btn.disabled = true;
                })
                return true;
            }else{
                return false;
            }
        },
        //根据form获取这个form下所有提交button，并且置为disable
        //规则为：
        //  1.查找所有type=submit的button、input标签
        //  2.若未找到，查找type为''的button和input标签，且只有一个
        //  3.若还没有，则放弃
        _getBtns: function(form){
            var
                that = this,
                btns = [];
            btns = query('input[type="submit"],button[type="submit"]', form);
            if(btns.length < 1){
                btns = DOM.filter('button, input', function(btn){
                    S.log(DOM.attr(btn, 'type'))
                    if(DOM.nodeName(btn) == 'button' &&(!DOM.attr(btn, 'type') || DOM.attr(btn, 'type') == '' || DOM.attr(btn, 'type') == 'button')) return true;
                    if(DOM.nodeName(btn) == 'input' && DOM.attr(btn, 'type') == 'button') return true;
                    return false;
                }, form);
                if(btns.length != 1){
                    btns = []
                }
            }
            return btns;
        }
    })
    
    new OnceForm();

},{
    requires:[
        'core'
    ]
})