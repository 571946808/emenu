/*-----------------------------------------------------------------------------
* @Description: 数据存数 (cache.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			YYYY.MM.DD
* ==NOTES:=============================================
* v1.0.0(YYYY.MM.DD):
* 	初始生成 
* ---------------------------------------------------------------------------*/

KISSY.add('mod/cache', function(S, Core){
	var
		Cache = {
			version: '2.0.0',
			client: function(param){
				return new Core(param);
			}
		}
	S.Cache = Cache;
	return Cache;
},{
	requires:['cache/core']
})

KISSY.add('cache/core', function(S){
	
	function Cache(){
		this.data = {
			length: 0			
		}
		this.length;
		this._init();
	}	

	S.augment(Cache, {
		_init: function(){
			var
				that = this;
		},
		set: function(key,val){
			var
				that = this,
				data = that.data;
			if(S.isString(key) || S.isNumber(key)){
				if(data[key]){
					if(S.isObject(data[key]) && S.isObject(val)){
						S.mix(data[key], val);
					}else{
						data[key] = val;
					}
					
				}else{
					that._addData(key,val);
				}
			}else if(S.isObject(key)){
				for(var p in key){
					that._addData(p, key[p]);
				}
			}
		},
		get: function(key){
			var
				that = this,
				data = that.data,
				rs = null;
			rs = (S.isString(key) || S.isNumber(key))?
				 data[key] : 
				 data;
			return rs;
		},
		val: function(key,val){
			var
				that = this;
			if(	(S.isString(key) || S.isNumber(key)) && !val){
				return that.set(key,val);
			}else if(S.isString(key) || S.isNumber(key)){
				return that.get(key);
			}else if(!key && !val){
				return that.get();
			}else if(S.isObject(key) && !val){
				return that.set(key);
			}else{
				S.log('参数传入错误');
			}
		},
		remove: function(key){
			var
				that = this,
				data = that.data;
			if(S.isString(key) || S.isNumber(key)){
				that._delData(key);
			}else if(!key){
				that._delAll();
			}
		},
		//遍历
		each: function(callback){
			var
				that = this,
				data = that.data;
			for(var p in data){
				if(p != 'length'){
					//key ,val 调用
					callback(p, data[p]);
				}
			}
		},
		_addData: function(key,val){
			var
				that = this,
				data = that.data;
			data[key] = val;
			that.data.length ++;
		},
		_delData: function(key){
			var
				that = this,
				data = that.data;
			if(data[key]){
				delete data[key];
				that.data.length --;
			}else{
				S.log('没有找到相应的数据');
			}
		},
		_delAll: function(){
			var
				that = this;
			that.data = {
				length: 0
			}
		}
	})

	return Cache;
})