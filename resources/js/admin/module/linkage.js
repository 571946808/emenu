/*-----------------------------------------------------------------------------
* @Description:     linkage.js联动
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.22
* ==NOTES:=============================================
* v1.0.0(2015.9.22):
     初始生成，初步分为二级联动、三级联动、对话框中的二级三级联动
* ---------------------------------------------------------------------------*/
KISSY.add('module/linkage', function(S, Core){
	PW.namespace('module.Linkage');
	PW.module.Linkage = {
		client: function(param){
			return new Core(param);
		}
	}
},{
	requires: [
		'linkage/core'
	]
});
KISSY.add('linkage/core', function(S){
	var
		DOM = S.DOM, $ = S.all, get = DOM.get,
		on = S.Event.on,
		config = {
			linkage: 3,
			firstLinkage: '',
			secondLinkage: '',
			thirdLinkage: '',
			manageIO: {

			}
		};
	function Core(param){
		// 这里有问题需要需要需要处理
		this.opts = S.merge(config, param);
		// 0为根分类，1为大类
		this.tagClass;
		// 联动级别，2为二级联动，3为三级联动
		this.linkage;
		this._init();
	}
	S.augment(Core, S.EventTarget, {
		_init: function(){
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this,
				linkage = that.opts.linkage,
				firstLinkageTrigger = that.opts.firstLinkage,
				secondLinkageTrigger = that.opts.secondLinkage;
			if(linkage == 3){
				on(firstLinkageTrigger, 'change', function(){
					that.tagClass = 0;
					that._validSelect(DOM.val(this));
				});
				on(secondLinkageTrigger, 'change', function(){
					that.tagClass= 1;
					that._validSelect(DOM.val(this));
				});
			}else if(linkage == 2){
				on(firstLinkageTrigger, 'change', function(){
					that.tagClass = 0;
					that._validSelect(DOM.val(this));
				});
			}
			that.linkage = linkage;
		},
		_validSelect: function(val){
			var
				that = this;

			if(val != -1){
				that._sendLinkage();
			}else{
				//nothing
			}
		},
		/**
		 * 发送联动id
		 * @return {[type]} [description]
		 */
		_sendLinkage: function(){
			var
				that = this,
				firstLinkageTrigger = that.opts.firstLinkage,
				secondLinkageTrigger = that.opts.secondLinkage,
				thirdLinkageTrigger = that.opts.thirdLinkage,
				id,
				triggerId,
				renderEl,
				trigger;
			if(that.linkage == 3){
				if(that.tagClass == 0){
					triggerId = DOM.val(firstLinkageTrigger);
					renderEl = secondLinkageTrigger;
				}else if(that.tagClass == 1){
					triggerId = DOM.val(secondLinkageTrigger);
					renderEl = thirdLinkageTrigger;
				}
			}else if(that.linkage == 2){
				if(that.tagClass == 0){
					triggerId = DOM.val(firstLinkageTrigger);
					renderEl = secondLinkageTrigger;
				}
			}

			that.opts.manageIO.sendLinkage({
				pId: triggerId
			}, function(rs, data, errMsg){
				if(rs){
					that._renderLinkage(triggerId, data, renderEl);
				}else{
					S.log('获取子分类失败！');
				}
			});
		},
		/**
		 * 渲染下拉框
		 * @param  {[type]} id       [description]
		 * @param  {[type]} list     [description]
		 * @param  {[type]} renderEl [description]
		 * @return {[type]}          [description]
		 */
		_renderLinkage: function(id, list, renderEl){
			var
				that = this,
				options = '<option value="-1" selected="selected">请选择</option>';

			if(id == -1){
			}else{
				S.each(list, function(item){
					options = options + '<option value="' + item.id + '">' + item.name + '</option>'
				});
			}

			$(renderEl).empty();
			$(renderEl).append(options);
			that.fire('afterAppend');
		}
	});
	return Core;
},{
	requires: [
		
	]
});