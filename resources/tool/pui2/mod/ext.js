/*-----------------------------------------------------------------------------
* @Description: 对kissy现有功能的一些扩展
* 				主要补充一些kissy没有的通用函数 (ext.js)
* @Version: 	V1.0.3
* @author: 		simon(406400939@qq.com)
* @date			2013.06.17
* ==NOTES:=============================================
* v1.0.0(2013.06.17):
* 	初始生成
* v1.0.1(2013.08.01):
* 	对DOM.serialize()函数进行修改，支持div节点获取数据
* v1.0.2(2013-11-02)：
* 	bug fix: 对于 serialize无法获取非form节点的数据的bug给出了修复：
* 		方案为：累死与kissy的serializer重新写了一套方法
* v1.0.3(2013/12/26 09:56:46)
* 	修改serialize部分的返回，增加配置，如果是数组，则改成 加入，的字符串返回
* v1.0.4(2014/01/11 11:07:25)
* 	新增 S.isInteger()
* 	新增 S.isFloat()
* 	新增 S.toFixed()
* 	对S.timer内部新增 this.stop, 和 this.restart函数，用于函数内部自控制
* v1.0.5(2014.5.16):
* 	增加serialize对于input[type="file"]的支持
*	增加DOM.index()函数支持
* v1.0.6(2014.5.22):
* 	增加S.toJSON()方法，强制转换为json
* 	PIO默认dataType为JSON
*  	S.timer，默认如果没有配置times,则默认为1
* ---------------------------------------------------------------------------*/

KISSY.add('mod/ext', function(){
	//nothing，默认调取
},{
	requires:[
		'ext/lang',
		'ext/dom',
		'ext/event/x-resize',
		'ext/event/one',
		'ext/Event/dispatcher',
		'ext/css-loader',
		'ext/ajax/qio'
	]
})

KISSY.add('ext/lang', function(S){
	S.mix(S, {
		/**
		 * 设置一次时间轮询
		 * @param  {Function} fn       	轮询函数
		 * @param  {Number}   slice   	每次轮询间隔时间
		 * @param  {Number}   times  	轮询次数 0为一直执行
		 * @param  {Object}   context 	上下文
		 * @return {Number}           	轮询时间片返回值
		 */
		timer: function(fn, slice, times, context){
			var
				index = 0;
			//如果轮询函数不存在，则返回	
			if(!S.isFunction(fn)) return -1;
			if(!S.isNumber(slice) || slice < 0) return -1;
			if(!S.isNumber(times) || times <0) times = 1;
			if(!context) context = {};
			
			S.mix(context, {
				_timerId: window.setInterval(function(){
						if(times > 0 && index >= times - 1) {
							S.clearTimer(context._timerId);
						}
						
						//设置回调函数，用于调取用户设定轮询逻辑，参数为轮询次数，停止函数
						fn.call(context,index, (function(){return function(){S.clearTimer(context._timerId)}})());
						index++;
					},slice*1000),
				stop: function(){
					S.clearTimer(this._timerId);
				},
				restart: function(){
					this.stop();
					this._timerId = S.timer(fn, slice, times, context);
					return this._timerId;
				}
			})
			return  context._timerId;
		},
		clearTimer: function(timer){
			window.clearInterval(timer);
		},
		/**
		 * 判断传入内容是否为一个整数
		 * @param  {Number}  number 需要验证的数字
		 * @return {Boolean}        判断结果
		 */
		isInteger: function(number){
			return S.isNumber(number) &&
					Math.ceil(number) - number == 0;
		},
		/**
		 * 判断传入内容是否为一个浮点数
		 * @param  {Number}  number 需要验证的数字
		 * @return {Boolean}        判断结果
		 */
		isFloat: function(number){
			return S.isNumber(number) &&
					Math.ceil(number) - number != 0;
		},
		/**
		 * 将一个数字按小数点儿后几位取小数
		 * @param  {Number|String} number 需要操作的数字
		 * @param  {Number} digits 精确的位数
		 * @param {Boolean} round 是否进行四舍五入
		 * @return {String} 计算后的数值字符串
		 * @example
		 * 		S.toFixed(20, 2)  -> 20.00
		 * 		S.toFixed(20.234, 2) -> 20.23
		 * 		S.toFixed(20.235, 2) -> 20.23
		 * 		S.toFixed(20.235, 2, true) -> 20.24
		 * 		S.toFixed(.234, 2) -> 0.23
		 */
		toFixed: function(number, digits, round){
			var
				ret;
			try{
				if(S.isString(number)) number = parseFloat(number);
				if(!S.isNumber(number)){
					S.log('未传入有效数据');
					return;
				}
				if(round == false){
					ret = Math.floor(number * Math.pow(10, digits)) / Math.pow(10, digits);
				}else{
					//notice: 如果为round，不处理，tofiexed函数自动进行四舍五入
					ret = Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);
				}
				ret = ret.toFixed(digits);
			}catch(err){
				S.log(err);
			}
			return ret;
		},
		/**
		 * 强制转化为json格式
		 * @param  {String} jsonstr json字符串
		 * @return {Object}         符合标准的js对象
		 */
		toJSON: function(jsonstr){
			var
				JSON = S.JSON,
				ret;
			try{
				if(S.isString(jsonstr) && jsonstr != ''){
					ret = JSON.parse(jsonstr);
				}else if(S.isObject(jsonstr) && !S.isEmptyObject(jsonstr)){
					ret = jsonstr;
				}
			}catch(e){
				S.log(e);
				ret = null;
			}

			return ret;
		},
		//判断对象是否为document对象
		isDocument: function(o){
			return S.type(o) === 'object' &&
					'styleSheets' in o &&
					o.lastChild &&
					o.lastChild.nodeName.toLowerCase() == 'html';
		},
		//数组增强内容，主要对数组增添常用但是js没有的方法
		xArray: function(arr){
			arr = arr || [];
			return S.mix(arr,{
				//获取数组的第一项
				first: function(){
					return this[0];
				},
				last: function(){
					return this[this.length-1];
				},
				//在第index位之前插入，如果index为负值，则从倒数第|index|位插入
				insert: function(index, val1/*optional:,val2,val3,...*/){
					var
						l = this.length,
						index = parseInt(index);
					if(l == 0){
						index =0;
					}
					
					if(arguments.length <2){
						this.splice(index, 0,val1)
					}else{
						for(var i = arguments.length-1; i >=1; i--){
							this.splice(index,0, arguments[i]);
						}
					}
					return this;
				},
				//返回搜索得到item的第一个下标值，如无，则为-1
				search: function(item){
					var
						l = this.length;
					for(var i = 0; i < l; i++){
						if(this[i] == item){
							return i;
						}
					}
					return -1;
				},
				each: function(callback){
					S.each(this, callback)
				}
				
				//暂时不处理
				/*dim: function(){},
				reduce: function(){},
				matrix: function(){}*/
			})
		}
	})
},{
	requires:[
		'json'
	]
})

/**
 * 对dom进行扩展,对于一些常用的jquery方法
 */
KISSY.add('ext/dom',function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all;

	S.mix(DOM, {
		/**
		 * 判断传入的对象是否是一个DOM原生节点
		 * @param  {HTMLElement} node 节点对象
		 * @return {Boolean}   结果
		 */
		isHTMLElement: function(el){
			var d = document.createElement("div");
            try {
                d.appendChild(el.cloneNode(true));
                return el.nodeType == 1 ? true : false;
            } catch(e) {
                return false;
            }
		},
		/**
		 * 将一段html代码写入源节点
		 */
		appendHtml: function(r,htmlStr,ownerDoc){
			var
				ownerDoc = ownerDoc || window.document,
				parents = query(r, ownerDoc);
			if(parents == null) return;

			if(!S.isString(htmlStr)) return;

			S.each(parents, function(p){
				var
					d = DOM.create(htmlStr, ownerDoc);
					DOM.append(d, p);
			})
		},
		/**
		 * 同appendHtml
		 */
		appendHTML: function(selector,htmlStr,ownerDoc){
			return this.appendHtml(selector,htmlStr,ownerDoc);
		},
		/**
		 * 扩展获取到的第一个节点的标签名(小写)
		 */
		nodeName: function(selector){
			var el = get(selector);
			//如果没有查询到结果，则返回空字符串
			return (!el) ? '' : get(selector).nodeName.toLowerCase();
		},
		/**
		 * 根据选择的节点过滤内容
		 * @param {selector} selector 
		 * @param {selector} elm 筛选选择器
		 * @param {} contenxt 上下文
		 */
		elim: function(selector,elm,context){
			return query(selector, context).filter(function(el){
				var p = DOM.parent(el, elm);
				return !(p && DOM.parent(p,context))
			});
		},
		/**
		 * 根据传入的孩子节点，确认它是否有指定的祖先节点
		 * @param  {selector} child  选择第一个节点
		 * @param  {selector} filter 筛选条件
		 * @return {boolean}        结果
		 */
		hasParent: function(child, filter){
			var
				child = get(child),
				target;
			//如果没有则终止
			if(child == null) return false;
			return DOM.parent(child, filter) != null;
		},
		/**
		 * 获取选择器第一个元素的所有祖先节点
		 * 此方法获取的是r源节点所能够选择到的第一个节点的所有祖先，知道html为止
		 * @return {Array(HTMLElement)} 祖先数组
		 */
		parents: function(r, filter){
			var
				child = get(r),
				prts = [],
				lastPrt;
			if(child == null) return null;
			lastPrt = DOM.parent(r,filter);
			while( lastPrt != null){
				prts.push(lastPrt);
				lastPrt = DOM.parent(lastPrt, filter);
			}
			return prts;
		},
		/**
		 * 对源节点以新节点代替, s只能是dom节点或者html字符串
		 * @param  {selector} r 源节点
		 * @param  {DOMElement || String} s 新节点
		 */
		replace: function(r, s){
			var
				or = query(r),
				su;
			if(or == null) return;

			if(this.isHTMLElement(s)){
				su = s;
			}else if(S.isString(s)){
				su = DOM.create(s);
			}
			if(su){
				or.reverse();
				or.each(function(el){
					DOM.insertBefore(su, el);
					DOM.remove(el);
				})
			}
		},
		/**
		 * 对源节点内的所有表单元素序列化
		 * @param  {selector} r 表单节点或者其他包含表单元素的节点
		 * @param {Boolean} isString 返回值状态
		 * @return {Object | String}   序列化字符串或者对象
		 */
		serialize: function(r, isString, transformArray){
			var
				rselectTextarea = /^(?:select|textarea)/i,
		        rCRLF = /\r?\n/g,
		        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week|file)$/i,
				elements = [],
				data = {},
				clone,
				fmSelector = 'input, select, textarea',
				str;
			//获得r节点
			r = get(r);
			//如果不是form,则将其放在form中获取数据
			//如果是form，直接获取
			elements = S.filter(query(fmSelector,r), function(el){
				return el.name &&
					!el.disabled &&
					(
						el.checked ||
						rselectTextarea.test(el.nodeName) ||
						rinput.test(el.type)
					)
			})
			S.each(elements, function(el) {
                var val = DOM.val(el),vs;
                // 字符串换行平台归一化
                val = S.map(S.makeArray(val), function(v) {
                    return v.replace(rCRLF, "\r\n");
                });
                // 全部搞成数组，防止同名
                vs = data[el.name] = data[el.name] || [];
                vs.push.apply(vs, val);
            });

			//将里面的数组全部用','连接起来
			if(transformArray != false){
				for(var p in data){
					if(S.isArray(data[p])){
						data[p] = data[p].join(',');
					}
				}
			}


			str = S.param(data, undefined, undefined, false);
			return (isString == true) ? str : S.unparam(str);
		},
		/**
		 * 反序列化工具，将一组json信息按照key-name， value-value 对应到表单中
		 * 	由于表单数据环境多种多样，特在此预定一下规则：
		 * 		1.如果是文本类型，如input[text, password, file, img], textarea等，建议name只有一个
		 * 		2. 如果val为数组，那么只针对 input[checkbox， radio]生效，如果是其他的节点，不能保证出现什么情况
		 * 		3. 如果val为数组，而查询到key匹配上input[checkbox, radio], 会先将所有的name为key的域都置空，之后val在数组中的域会被选中
		 * 		切记！切记！
		 * @param {kissy selector} form 表单选择器
		 * @param {Obj|string} data 需要置入表单的数据
		 */
		antiSerialize: function(form, data){
			var
				f = get(form);
			if(!f || !S.isObject(data)){
				S.log('cannot render data');
				return;
			}

			S.each(data, function(v, k){
				S.log(k + "," + v);
				S.log(f);
				$(f).all('input[name="'+ k +'"], select[name="'+ k +'"], textarea[name="'+ k +'"]').each(function($field){
					var
						field = $field.getDOMNode(),
						nn = DOM.nodeName(field),
						nt = field.type;
					//如果域 disabled 直接返回
					//if(field.disabled) return;
					//如果节点为radio 或者checkbox
					if(nn == 'input' && (nt == 'radio' || nt == 'checkbox')){
						if(S.isArray(v)){
							field.checked = false;
							for(var i in v){
								if(v[i] == $field.val()){
									field.checked = true;
									break;
								}
							}
						}else{
							field.checked = ($field.val() == v);
						}
					}
					//如果是select
					else if(nn == 'select'){
						$field.all('option').each(function($opt){
							if($opt.attr('value') == v){
								$opt.attr('selected', 'selected');
							}
						})
					}
					//其他情况当文本处理				
					else{
						$field.val(v);
					}
				})
			})
		},
		/**
		 * 实现类似于jquery的index()函数功能
		 * 判断节点在其兄弟节点的排序
		 * @param  {EL} s      需要查找的原始节点
		 * @param {context} parent 上下文查找
		 * @param  {X} filter 过滤条件
		 * @return {Number}    查找节点在其兄弟节点之间的排序值，以0开始
		 */
		index: function(s, parent, filter){
			var 
				s = get(s,parent), p, clds;
			if(!s) {
				S.log('要查找的节点不存在');
				return false;
			}
			p = DOM.parent(s);
			clds = DOM.children(p, filter);
			return S.indexOf(s, clds);
		}
	})
},{
	requires:['dom', 'node']
})

/**
 * 事件优化，添加reset事件,
 * 一般的resize事件在ff下只对window对象有效，一般div无法检测
 * 此处采用一种变通写法，加强resize事件对于div等元素的支持
 */
KISSY.add('ext/event/x-resize', function(S,Event,DOM){
	var
		X_RESIZE = 'x-resize',
		nodeName = DOM._nodeName,
		KEY = 'event/x-resize',
        POLL_KEY = KEY + "/poll",
        SIZE_KEY = KEY + "/size",
        interval = 100;
    /**
     * 获取目标节点的长宽
     * @return {Object} 长宽信息
     */
    function getSize(target){
    	return {
    		w: DOM.width(target),
    		h: DOM.height(target)
    	}
    }
    /**
     * 开始测验
     */
    function startPoll(target){
    	//如果检测存在，则不执行
    	if(DOM.hasData(target, POLL_KEY)) return;
    	//初始化size
    	DOM.data(target, SIZE_KEY, getSize(target));
    	//开始循环
    	DOM.data(target, POLL_KEY, setTimeout(function(){
    		var s = getSize(target),
    			hs = DOM.data(target, SIZE_KEY);
    		//处理一个比较特殊的情况: 在执行过程中，此节点被删掉了，那么终止
    		if(!hs || !hs.w){
    			return;
    		} 
    		if(s.w != hs.w || s.h != hs.h){
    			Event.fire(target, X_RESIZE, {
    				pw: hs.w,
    				ph: hs.h,
    				w: s.w,
    				h: s.h
    			},false)
    			DOM.data(target, SIZE_KEY,getSize(target))
    		}
    		DOM.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
    	}, interval));


    }
    /**
     * 停止测验
     */
    function stopPoll(target){
    	DOM.removeData(target, POLL_KEY);
    	DOM.removeData(target, SIZE_KEY);
    }
    /**
     *  开始监视
     */
    function monitor(target){
    	unmonitored(target);
    	startPoll(target);
    }
    /**
     * 终止监视
     */
    function unmonitored(target){
    	stopPoll(target);
    }
    Event.Special[X_RESIZE] = {
    	setup: function(){
   			monitor(this);
    	},
    	tearDown: function(){
    		unmonitored();
    	}
    }
    return Event;
},{
	requires:[
		'event',
		'dom'
	]
})


//添加一次性事件
KISSY.add('ext/event/one', function(S,Event){
	S.mix(Event, {
		one: function(targets, type, fn, scope /* optional */, data/*internal usage*/){
			var 
				fns = function(ev){
					fn.apply(this,arguments)
					Event.detach(targets, type, fns)
				}
			Event.on(targets, type, fns);
		}
	})
},{
	requires:[
		'event'
	]
})

KISSY.add('ext/Event/dispatcher', function(S,Event){
	var
		on = S.Event.on;
	S.mix(Event, {
		/**
		 * 用于一次性配置现有节点的事件分发
		 * @param {Array} evTable 事件表
		 */
		dispatcher: function(evTable,scope){
			if(!S.isArray(evTable) || evTable.length < 1) return;
			S.each(evTable, function(cfg){
				var 
					cb,
					scp = scope;
				if(!S.isArray(cfg) || cfg.length < 3) return;
				cb = cfg[2];
				if(!S.isEmptyObject(cfg[3])) scp = cfg[3];
				on(cfg[0], cfg[1], function(ev){
					cb.call(this,ev);
				},scp)
			})
		}
	})
},{
	requires:['event']
})

/**
 * 添加css 加载完成回调
 */
KISSY.add('ext/css-loader', function(S,Event,DOM){
	var
		get = DOM.get, query = DOM.query,
		config = {
			charset:'utf-8',
			tag: '',
			success: function(){},
			error: function(){}
		};

	function load(url,param,context){
		var
			opts,
			context,
			head,
			link,
			isSame = false
		opts = S.merge(config, param);
		//如果地址不存在
		if(!S.isString(url)) return;
		//如果上下文为空
		if(!S.isDocument(context)) context = document;
		//处理css缓存问题
		if(opts.tag != ''){
			url += (/\?[\S]*/.test(url)) ? '&': '?';
			url += 'tag=' + opts.tag;
		}
		link = DOM.create('<link>',{
                        rel:'stylesheet',
                        type:'text/css',
                        href: url,
			            id: opts.id
                    },context);
		head = get('head',context);
		query('link', head).each(function(link){
			if(!isSame && link.href == url){ //if has loaded the same link url
				isSame = true;
			}
		})
		if(isSame){
			return ;
		}
		link.onload = function(){
			opts.success.apply(this,arguments);
			S.log('async css file is loaded.','info');
		}
		link.onerror = function(){
			opts.error.apply(this,arguments)
			S.log('load css file error.','error','mod/ext')
		}
		DOM.append(link, head);
	}

	S.mix(S,{
		loadCSS: load
	})
},{
	requires:[
		'event',
		'dom'
	]
})


/**
 * 对于IO进行扩展，增加序列化执行ajax方法QIO
 */

KISSY.add('ext/ajax/qio', function(S,XO){
	
	var
		IO = S.IO,
		lock = false;
		IOStack = S.xArray();


	//入口函数
	//参数中要配置处理逻辑，先进先出或是后进先出
	function init(cfg){
		var  xo = new XO(cfg);
		xo.on('success', function(ev){
			//检查stack，看是否进入下一条
			next();
		})
		xo.on('error', function(ev){
			next();
		})
		if(!lock){
			lock = true;
			xo.start();
		}else{
			IOStack.push(xo);
		}
	}

	//从数组中得到第一个xo,开始相应处理
	function next(){
		var
			nxo = IOStack.shift();
		if(!nxo) {
			lock = false;
			return;
		};
		nxo.start();
	}

	S.mix(S, {
		QIO: init
	})

},{
	requires:['ext/ajax/io']
})

KISSY.add('ext/ajax/io', function(S,Ajax){

	var
		IO = Ajax,
		CONFIG = {
			url:'',
			data: '',
			type: 'post',
			success: undefined,
			error: undefined
		}
	function XhrObj(param){
		this.opts = S.merge(CONFIG, param);
		this.xhr;
		this.status;
	}
	S.augment(XhrObj, S.EventTarget, {
		init: function(){},
		start: function(){
			var
				that = this,
				opts = that.opts;
			that.xhr = IO({
				url: opts.url,
				data: opts.data,
				type: opts.type,
				success: function(d){
					that.status = 'success';
					opts.success.call(this,d);
					that.fire('success', {data: d});
				},
				error: function(err){
					that.status = 'error';
					opts.error.call(this,err);
					that.fire('error',{error: err});
				}
			});
		}
	});
	return XhrObj;
},{	
	requires:['ajax','event']
})

KISSY.add('ext/ajax/pio', function(S){
	var
		IO = S.IO,
		config = {
			when: .5,
			times: 2,
			dataType: 'json',
			url: ''
		};
	function load(param){
		var 
			o = {},
			time = 0,
			opts = S.merge(config, param);
		if(!opts.url || !S.isString(opts.url)) return;
		IO(S.merge(o,opts,{
			sucess: function(){
				opts.sucess(arguments);
			},
			error: function(){
				if(opts.times < 1){
					opts.error();
				}


				S.timer(function(index){
					var tm = this;
					IO(S.merge(opts,{
						success: function(){
							opts.success();
						},
						error: function(){
							if(index == opts.times - 1){
								opts.error()
							}
						}
					}))
				},opts.when, opts.times)
			}		
		}))
	}

	S.mix(S,{
		PIO: load
	})
},{
	requires:[
		'ajax',
	]
})