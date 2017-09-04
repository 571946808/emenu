/*-----------------------------------------------------------------------------
 * @Description:     基本信息管理-首页欢迎
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.9.21
 * ==NOTES:=============================================
 * v1.0.0(2015.9.21):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('page/base-info-management/index-management', function(S, Core){
	PW.namespace('page.BaseInfoManagement.IndexManagement');
	PW.page.BaseInfoManagement.IndexManagement = function(param){
		new Core(param);
	}
},{
	requires: [
		'index-management/core'
	]
});

KISSY.add('index-management/core', function(S){
	var
		DOM = S.DOM, get = DOM.get, query = DOM.query,
		on = S.Event.on, delegate = S.Event.delegate,
		$ = S.all,
		Upload = PW.widget.Upload,
		Dialog = PW.widget.Dialog,
		Juicer = PW.mod.Juicer,
		IndexManagementIO = PW.io.BaseInfoManagement.IndexManagement,
		config = {
			upload: null
		},
		el = {
			// 文件
			fileItemEl: '.file-item',
			// 删除图片触发器
			delTrigger: '.J_del',
			// 图片容器
			imgContainer: '.J_imgContainer',
			// 设置为首页触发器
			setTrigger: '.J_set',
			// 首页图片模板
			indexImgTemp: '#indexImg',
			// 备选图片模板
			otherImgTemp: '#otherImg',
			// 首页图片
			indexImgEl: '.J_indexImg',
			// 当前图片
			currentIndexImgEl: '.J_currentIndexImg'
		},
		// 图片属性
		DATA_IMG_ID = 'data-img-id',
		IMG_TEMP = '<div class="col-sm-3 text-center">' +
			'	<img class="img-responsive" src="/resources/img/admin/base-info/index3.jpg" alt="顾客点餐平台首页备选图片">' +
			'	<button class="margin-top-15 btn btn-success" type="button"><i class="fa fa-check"></i>&nbsp;点击设置为首页</button>' +
			'</div>';

	function Core(param){
		this.opts = S.mix(config, param);
		this._init();
	}

	S.augment(Core, {
		_init: function(){
			this._uploader();
			this._bulidEvt();
		},
		_bulidEvt: function(){
			var
				that = this;
			delegate('#uploader', 'mouseenter', el.fileItemEl, function(e){
				that._showTools(e.target);
			});
			delegate('#uploader', 'mouseleave', el.fileItemEl, function(e){
				that._hideTools(e.target);
			});
			delegate(document, 'click', el.delTrigger, function(e){
				that._delImg(e.target);
			});
			delegate(document, 'click', el.setTrigger, function(e){
				that._setImg(e.target);
			});
		},
		/**
		 * 设置图片为首页图片
		 * @param e
		 * @private
		 */
		_setImg: function(e){
			var
				that = this,
				imgContainer = DOM.parent(e, el.imgContainer),
				id = DOM.attr(imgContainer, DATA_IMG_ID),
				indexImgTemp = DOM.html(el.indexImgTemp),
				imgEl = DOM.get('img', imgContainer),
				imgSrc = DOM.attr(imgEl, 'src');
			Dialog.confirm('确定将该图片设置为首页吗?', function(){
				IndexManagementIO.setImg({
					id: id
				}, function(rs, errMsg){
					if(rs){
						Dialog.alert('设置成功!');
						that._renderIndexImg(indexImgTemp, id, imgSrc, imgContainer);
						that._renderCurrentIndexImg(imgSrc);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 设置当前首页图片(大图)
		 * @param src
		 * @private
		 */
		_renderCurrentIndexImg: function(src){
			var
				that = this;
			DOM.attr(el.currentIndexImgEl, 'src', src);
		},
		/**
		 * 渲染首页图片
		 * @param indexImgTemp
		 * @param imgSrc
		 * @param imgContainer
		 * @private
		 */
		_renderIndexImg: function(indexImgTemp, id, imgSrc, imgContainer){
			var
				that = this,
				imgStr = Juicer.client(indexImgTemp, {
					img: {
						id: id,
						src: imgSrc
					}
				}),
				imgDOM = DOM.create(imgStr);
			var
				// 原来的首页图片节点
				indexImg = DOM.get(el.indexImgEl);
			DOM.insertAfter(imgDOM, imgContainer);
			DOM.remove(imgContainer);
			that._changeOldIndexImg(indexImg);

		},
		/**
		 * 换掉原来的首页
		 * @param indexImg
		 * @private
		 */
		_changeOldIndexImg: function(indexImg){
			var
				that = this,
				indexImgEl = DOM.get('img', indexImg),
				indexSrc = DOM.attr(indexImgEl, 'src'),
				indexId = DOM.attr(indexImg, DATA_IMG_ID),
				otherImgTemp = DOM.html(el.otherImgTemp),
				otherImgStr = Juicer.client(otherImgTemp, {
					img: {
						id: indexId,
						src: indexSrc
					}
				}),
				otherDOM = DOM.create(otherImgStr);
			DOM.insertAfter(otherDOM, indexImg);
			DOM.remove(indexImg);
		},
		/**
		 * 删除图片
		 * @param e
		 * @private
		 */
		_delImg: function(e){
			var
				that = this,
				imgEl = DOM.parent(e, el.imgContainer),
				id = DOM.attr(imgEl, DATA_IMG_ID);
			Dialog.confirm('确定删除该备选图片吗?', function(){
				IndexManagementIO.delImg({
					id: id
				}, function(rs, errMsg){
					if(rs){
						Dialog.alert('删除成功!');
						var divEl = DOM.parent(imgEl);
						DOM.remove(divEl);
					}else{
						Dialog.alert(errMsg);
					}
				});
			});
		},
		/**
		 * 执行upload
		 * @return {[type]} [description]
		 */
		_uploader: function(){
			var
				that = this,
				setting = {
					accept: {
						title: 'Images',
						extensions: 'gif,jpg,jpeg,bmp,png',
						mimeTypes: 'image/*'
					},
					uploadError: function(file, code){
						that._uploadError(file, code);
					},
					uploadSuccess: function(file, res){
						that._uploadSuccess(file, res);
					}
				};
			S.mix(that.opts, setting);
			Upload.client(that.opts);
		},
		/**
		 * 失败时，进行回调
		 * @param  {[type]} file [description]
		 * @param  {[type]} code [description]
		 * @return {[type]}      [description]
		 */
		_uploadError: function(file, code){
			var
				that = this;
			Dialog.alert('网络错误加载!');
		},
		/**
		 * 成功时，进行回调
		 * @param  {[type]} file [description]
		 * @param  {[type]} res  [description]
		 * @return {[type]}      [description]
		 */
		_uploadSuccess: function(file, res){
			var
				that = this;
			if(res.code == 0){
				window.location.reload();
			}else{
				Dialog.alert('请重新上传图片!');
			}
		},
		/**
		 * 渲染上传成功的图片
		 * @param  {[type]} file [description]
		 * @param  {[type]} res  [description]
		 * @return {[type]}      [description]
		 */
		_renderImg: function(file, res){
			var
				that = this;
			that._renderImg(file, res);
		},
		/**
		 * 显示操作工具
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_showTools: function(e){
			var
				that = this,
				fileItemEl = $(e).parent('.file-item'),
				toolsEl;
			if($(e).hasClass('file-item')){
				toolsEl = $('.tools',e);
			}else if($(fileItemEl).hasClass('file-item')){
				toolsEl = $('.tools',fileItemEl);
			}
			$(toolsEl).slideDown(0.2);
		},
		/**
		 * 隐藏操作工具
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		_hideTools: function(e){
			var
				that = this,
				fileItemEl = $(e).parent('.file-item'),
				toolsEl;
			if($(e).hasClass('.file-item')){
				toolsEl = $('.tools',e);
			}else if($(fileItemEl).hasClass('file-item')){
				toolsEl = $('.tools', fileItemEl);
			}
			$(toolsEl).slideUp(0.4);
		}
	});

	return Core;
},{
	requires: [
		'widget/upload',
		'widget/dialog',
		'pio/base-info-management/index-management',
		'mod/juicer',
		'core'
	]
});