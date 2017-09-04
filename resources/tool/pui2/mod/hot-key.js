/*-----------------------------------------------------------------------------
* @Description:     添加页面级快捷键
* @Version:         0.0.2
* @author:          simon(406400939@qq.com)
* @date             2014.4.23
* ==NOTES:=============================================
* v0.0.1(2014.4.23):
    基于kissy 1.4.0的js快捷键系统，用于在页面上进行快捷按键操作。
    
    

    注意： 暂时未加入mac os支持，后期将陆续完善
    github地址: https://github.com/shenlm203/hot-key.git
* v0.0.2(2014.5.10):
*     增加getKeysByCode方法
* ---------------------------------------------------------------------------*/

KISSY.add('mod/hot-key', function(S,HK){
    Hotkey ={
        version: '0.0.2',
        client: function(){
            return new HK();
        }
    }
    S.Hotkey = Hotkey;
    return Hotkey;
},{
    requires:[
        'hk/core'
    ]
})


KISSY.add('hk/core', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query;
        on = S.Event.on, 
        config = {

        },
        KEY_MAP = {
            'esc': 27,
            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f11': 122,
            'f12': 123,
            '`': 192,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            '0': 48,
            '-': 189,
            '=': 187,
            'tab': 9,
            '[': 219,
            ']': 221, 
            '\\': 220,
            'caps': 20,
            'enter': 13,
            'home': 36,
            'end': 35,
            'pgup': 33,
            'pgdn': 34,
            'ins': 45,
            'del': 46,
            'up': 38,
            'down': 40,
            'left': 37,
            'right': 39,
            'sem': 186,
            "sqm": 222,
            ',': 188,
            '.': 190,
            '/': 191,
            'space': 32,
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 69,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90,
            '*': 106,
            'n0': 96,
            'n1': 97,
            'n2': 98,
            'n3': 99,
            'n4': 100,
            'n5': 101,
            'n6': 102,
            'n7': 103,
            'n8': 104,
            'n9': 105,
            'n+': 107,
            'n-': 109,
            'n.': 110,
            'n/': 111,
            'shift': 16,
            'ctrl': 17,
            'alt': 18
        };

    
    function HotKey(){
        if(!window._hk_cmds) window._hk_cmds = {};
        this.cmds = window._hk_cmds;
        this._init();
    }

    S.augment(HotKey, {
        _init: function(){
            var
                that =  this;
            that._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;
            //绑定键盘按下时事件
            on(window, 'keydown', that._keyDownHanlder, that);
        },
        _keyDownHanlder: function(ev){
            var
                that =  this
                cmdCode = that._getEvtCmdCode(ev);
            if(that._execute(cmdCode, ev)){
                ev.halt();
                ev.returnValue=false;
            }
        },
        /**
         * 绑定键盘事件
         * @param  {String}   cmdkeys 命令字符串
         * @param  {Function} fn     [description]
         * @param  {[type]}   context  [description]
         * @param  {[type]}   opts   [description]
         * @return {[type]}          [description]
         */
        bind: function(cmdkeys, fn ,context, opts){
            var
                that = this,
                keys = cmdkeys.split(' ') || [],
                cmdCode,
                mainkey,
                extraKey,
                nc;
            S.each(keys, function(cmdKey){
                cmdCode = that._buildCmdCode(cmdKey);
                mainkey = parseInt( cmdCode / 1000 );
                extraKey = (cmdCode + '').slice(-3);
                //如果是cmdKeys中含有*，则单独处理
                if(mainkey === 106){
                    S.each(KEY_MAP, function(v, p){
                        if(v != mainkey){
                            nc = v + extraKey;
                            that._bind(nc, fn ,context, opts);
                        }
                    })
                }else{
                    that._bind(cmdCode, fn ,context, opts);
                }
            })
        },
        _bind: function(cmdCode, fn ,context, opts){
            var
                that = this,
                cmds = that.cmds,
                context = (S.isObject(context)) ? context : undefined,
                cmdObj = {
                    fn: fn,
                    context: context,
                    opts: opts
                }
            //要绑定的按键不合法
            if(cmdCode <= 0) return;
            //如果此cmd不允许共存，则直接将其他cmd删除
            

            //处理*


            if(opts && opts.coexist === false){
                that._unbind(cmdCode);
            }
            if(!cmds[cmdCode]){
                cmds[cmdCode] = [cmdObj];
                return;
            }

            //判断是否已经有此cmdObj的处理内容了
            if(!that._hasConflictCmd(cmdCode, fn, context)){
                if(opts && opts.first === true){
                    cmds[cmdCode].unshift(cmdObj);
                }else{
                    cmds[cmdCode].push(cmdObj);
                }
            }
        },
        unbind: function(cmdkeys, fn, context){
            var
                that = this,
                keys = cmdkeys.split(' ') || [],
                cmdCode;
            S.each(keys, function(cmdKey){
                cmdCode = that._buildCmdCode(cmdKey);
                that._unbind(cmdCode, fn, context);
            })
        },
        _unbind: function(cmdCode, fn , context){
            var
                that = this,
                cmds = that.cmds,
                cmdArr = cmds[cmdCode],
                rs = [];

            //需要解除绑定的key不存在，停止
            if(!cmdKey || !cmdArr || cmdArr.length == 0) return false;
            //直接输入了key， 没有指定fn和上下文
            if(!fn && !context){
                delete cmds[cmdCode];
            }
            if(fn && !context){
                //如果fn存在并且上下文不存在
                cmds[cmdCode] = S.filter(cmdArr, function(cmdObj, i){
                    return cmdObj.fn  !== fn;
                });
            }else if(fn && context){
                //如果回调函数和上下文都存在
                cmds[cmdCode] = S.filter(cmdArr, function(cmdObj, i){
                    return cmdObj.fn !== fn || cmdObj.context !== context;
                })
            }  

            //如果fn和context不存在，或者得到的cmdArr当前长度为0
            //则直接删除此绑定事件
            if(cmds[cmdCode] && cmds[cmdCode].length == 0){
                delete cmds[cmdCode];
            }      
        },
        /**
         * 外部执行 通过cmdKeys
         * @param  {String} cmdkeys 控制键盘字符串
         */
        execute: function(cmdkeys){
            var 
                that = this,
                keyArr = cmdkeys.split(' ') || [];
            S.each(keyArr, function(cmdKey){
                that._execute(cmdKey)
            })
        },
        /**
         * 根据cmdCode，触发相应的注册事件
         * 注意: 
         *     回调函数中的return值处理：
         *         'halt': 禁止默认事件触发
         *         'stop': 排斥其他事件，也就是说，只执行到此函数，后续加入的回调函数不会执行
         *         false: 与halt和only效果同时生效
         * @param  {Number} cmdCode 控制代码
         * @param {Object} ev 可能存在的事件对象
         */
        _execute:function(cmdCode, ev){
            var
                that = this,
                cmds = that.cmds,
                cmdArr,
                retVal,
                cmdObj;
            if(!cmdCode || !cmds[cmdCode]) return false;
            
            cmdArr = cmds[cmdCode];

            for(var i = 0, len = cmdArr.length; i < len; i++){
                cmdObj = cmdArr[i];
                retVal = cmdObj.fn.call(cmdObj.scope, S.merge(ev || {}, cmdObj, {
                    cmdCode: cmdCode,
                    keys: that.getKeysByCode(cmdCode)
                }));
                if(retVal === 'stop' || retVal === false) {break;}
            }
            return retVal === 'halt' || retVal === false;
        },
        /**
         * 根据已知的cmdCode，计算出标准的cmdKey序列
         * @param  {[type]} cmdCode [description]
         * @return {[type]}         [description]
         */
        getKeysByCode: function(cmdCode){
            var
                rs = [],
                mainkey, ctrlKey, shiftKey, altKey;
            //如果cmdCode不合法
            if(cmdCode <= 0) return false;
            //计算key值
            mainkey = parseInt( cmdCode / 1000 );
            ctrlKey = parseInt( cmdCode % 1000 / 100 );
            altKey = parseInt( cmdCode % 100 / 10 );
            shiftKey = parseInt( cmdCode % 10 );
            //查找主key
            S.each(KEY_MAP, function(v, p){
                if(v === mainkey){
                    rs.push(p); 
                    return false;
                }
            })
            //如果主key不存在
            if(!rs.length) return false;
            if(shiftKey) rs.unshift('shift');
            if(altKey) rs.unshift('alt');
            if(ctrlKey) rs.unshift('ctrl');
            return rs;
        },
        /**
         * 根据控制代码，判断当前的事件表中时候含有相同的事件
         * @param  {Number}  cmdCode 控制键盘代码
         * @param  {Function}  fn     控制函数
         * @param  {Obj}  context 运行时上下文
         * @return {Boolean}         冲突结果
         */
        _hasConflictCmd: function(cmdCode, fn, context){
            var
                that = this,
                cmdArr = that.cmds[cmdCode],
                rs = false;

            if(cmdArr && S.isArray(cmdArr)){
                for(var i = 0, cmdObj, len = cmdArr.length; i < len; i++){
                    cmdObj = cmdArr[i];
                    if(cmdObj.fn == fn && cmdObj.context == context){
                        rs = true;
                        break;
                    }
                }
            }
            return rs;
        },
        /**
         * 根据cmd key, 生成唯一的cmd code
         */
        _buildCmdCode: function(cmdkey){
            var
                that = this,
                keyArr,
                tmp,
                kc,
                rs = 0;
            try{
                keyArr = cmdkey.toLowerCase().split('+');
                if(S.isArray(keyArr)){
                    if(KEY_MAP[keyArr[0]]){
                        rs += KEY_MAP[keyArr.pop()] * 1000;
                        while(keyArr.length > 0){
                            tmp = keyArr.pop();
                            switch(tmp){
                                case 'ctrl':
                                    rs += 100;
                                    break;
                                case 'alt':
                                    rs += 10;
                                    break;
                                case 'shift':
                                    rs += 1;
                                default: 
                                    //pass
                            }
                        }
                    }
                }
            }catch(err){
                S.log(err);
            }
            return rs;

        },
        /**
         * 获取事件的控制代码
         * @param  {Object} ev 事件控制代码
         */
        _getEvtCmdCode: function(ev){
            var
                that = this;
            return ev.keyCode * 1000 + 
                    (ev.ctrlKey && ev.keyCode != 17 ? 100: 0) + 
                    (ev.altKey && ev.keyCode != 18? 10 : 0) + 
                    (ev.shiftKey && ev.keyCode != 16 ? 1 : 0);
        }
    });

    return HotKey;
},{
    requires:[
        'core'
    ]
});