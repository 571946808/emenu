/*-----------------------------------------------------------------------------
* @Description: 模式匹配函数 (pattern.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.05.15
* ==NOTES:=============================================
* v1.0.0(2013.05.15):
* 	模式匹配通常用在一些常用的匹配，验证中
* ---------------------------------------------------------------------------*/

//根据表单验证内容修改，用于各处验证
KISSY.add('mod/pattern', function(S){

	var 
		RULE_SET = {
			isCommonUser: function(str){
				return /^[a-zA-Z]{1}([a-zA-Z0-9]|[._-]){5,19}$/.test(str);
			},
			isPassword: function(str){
				return /^(\w){6,20}$/.test(str);
			},
			isEmail:function(str){
                return /^[0-9a-zA-Z_\-\.]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+)+$/.test(str);
			},
			isNull: function(str){
				return str.length == 0;
			},
			notNull:function(str){
                return !/^\s*$/.test(str);
			},
			isNumber:function(str){
                return /^\d+$/.test(str);
			},
			isTelephone:function(str){
                return /^\d{3,4}-\d{7,8}(-\d{3,4})?$/.test(str);
			},
			isImage:function(str){
                return /^.+(\.jpg|\.JPG|\.gif|\.GIF|\.png|.PNG|\.x\-png|\.bmp|\.BMP)$/.test(str);
			},
			isEnglish:function(str){
                return /^[a-z]*$/.test(str);
			},
			isHttp:function(str){
                return /^http\:\/\/([^\s]+)$/.test(str);
			},
			isFlv:function(str){
                return /^.+(\.flv|\.FLV|\.Flv)$/.test(str);
			},
			isFloat:function(str){
                return /^(-?\.?\d+)(\.\d+)?$/.test(str);
			},
			isQQ:function(str){
                return /^[1-9]\d{4,13}$/.test(str);
			},
			isMobile:function(str){
                return /^[1]{1}[3458]{1}[0-9]{9}$/.test(str);
			},
			isChinese:function(str){
				return /^[\u4e00-\u9faf]+$/.test(str);
			},
			isUrl: function(str){
				return /[a-zA-z]+:\/\/[^\s]*/.test(str);
			},
			isZipCode: function(str){
				return /^[1-9][0-9]{5}$/.test(str);
			},
			isIP: function(str){
				return /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/.test(str);
			},
			scale: function(str,s,l,equal){
				if(!/^(-?\.?\d+)(\.\d+)?$/.test(str)) return false;
				//按照10进制来转换数字
				str = parseFloat(str,10);
				s = parseFloat(s,10);
				l = parseFloat(l,10);
				return (equal && parseInt(equal,10) == 1)?(str >= s && str <= l):(str > s && str < l);
			},
			length:function(str,s,l,equal){//s代表最小值，l代表最大值
				var
					lg = str.length;
				s = parseInt(s,10);
				l = parseInt(l,10);	
				return (equal && parseInt(equal,10) == 1) ?
						(lg >= s) && (lg <= l):
						(lg > s) && (lg < l);
			},
			isStartWith: function(){},
			isEndWith: function(){},
			has: function(){},
			notin: function(search, str){}
		};


	Pattern = {
		test: function(ptn,val){
			var
				that = this;
			try{
				//如果ptn是is开头，且RULE_SET中存在该验证项则测试
				if(S.isRegExp(ptn)) return ptn.test(val);
				return (S.isString(ptn) && /^[is](\w)*$/.test(ptn) && RULE_SET[ptn]) ?
						that.valid(ptn,val) :
						false;
			}catch(err){
				S.log(err);
				return false;
			}
		},
		//验证函数
		valid: function(rules,str){
			var
				that = this,tks,rpn,
				val = '';
			tks = that.cutToken(rules);
			rpn = that.getRPN(tks);
			return that.doValid(rpn,str)
		},
		//根据逆波兰式rpn，计算，得到最终的验证结果值
		doValid: function(rpn,str){
			var
				that = this,
				tkStack = [];

			S.each(rpn,function(tk){
				if(tk != '|' &&　tk != '&' ){
					tkStack.push(tk)
				}else{
					var
						t1 = tkStack.pop(), 
						t2 = tkStack.pop();
					if(tk == '&'){
						tkStack.push(that.subValid(t1,str) && that.subValid(t2,str));
					}else{
						tkStack.push(that.subValid(t1,str) || that.subValid(t2,str));
					}
				}
			});
			if(tkStack.length != 1) throw('计算错误，请检查传入样式是否争取');

			//最后一次计算，避免出现用户只输入了一个验证条件的情况，如[isEmail]
			return that.subValid(tkStack[0],str);
		},
		//切分表达式为token
		cutToken: function(txt){
			var
				reg = /\[|\]|\||&|[a-zA-Z0-9,()_-]+/ig,
				tks;
			tks = txt.match(reg);
			tks = S.filter(tks,function(o){
				return /^\s*$/.test(o) ? false : true;
			});
			return tks == null ? '' : tks;
		},
		//将token序列转换成逆波兰式
		getRPN: function(tks){
			var
				that = this,
				opStack =['#'], 
				rpnStack = [],
				t,opST;

			S.each(tks,function(tk){
				//tk是某项操作时
				if(tk !='[' && tk!=']' && tk != ' ' && tk != '|' && tk != '&'){
					rpnStack.push(tk);
				}
				else{
					if(tk == '['){
						opStack.push(tk);
					}
					else if(tk == ']'){
						while((t = opStack.pop()) != '['){
							rpnStack.push(t)
						}
					}else if(tk == '|' || tk == '&'){
						opST = opStack[opStack.length - 1];
						if(opST == '[' || opST == '#'){
							opStack.push(tk);
						}else if(opST == '|' || opST == '&'){
							do{
								t = opStack.pop();
								rpnStack.push(t);
							}while(opStack[opStack.length - 1] != '#' && opStack[opStack.length - 1] != '[');
							opStack.push(tk);
						}
					}
				}
			});	
			while((t = opStack.pop()) != '#'){
				rpnStack.push(t);
			}
			return rpnStack;
		},
		//传入一个token进行解析，返回bool值
		subValid: function(tk,str){
			if(S.isBoolean(tk)) return tk;
			var
				ruleName = tk,
				ruleArg = [str],
				lb = tk.search('\\('),
				rb = tk.search('\\)');

			if(lb >0 && rb > 0){
				ruleName = tk.substr(0,lb);
				ruleArg = ruleArg.concat(tk.substr(lb+1,rb-lb-1).split(','));
			}
			//将当前验证的域压入参数栈
			return (RULE_SET[ruleName]) ? RULE_SET[ruleName].apply(this,ruleArg) : 'false';
		}
	};
	S.Pattern = Pattern;
	return Pattern;
})