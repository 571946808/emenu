/*-----------------------------------------------------------------------------
* @Description:     更适合本项目额外添加的一些操作
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.10
* ==NOTES:=============================================
* v1.0.0(2015.9.10):
     初始生成
* v1.0.1(2015.9.16):
* 	将异步加载“加载样式skylo”放在S.loadCSS中
v1.0.2(1015.10.18)
将正在加载放在head中，使得整个页面加载完成之后才会继续执行
* ---------------------------------------------------------------------------*/

KISSY.add('widget/ext', function(S, LoadingClient){
	var
		MOD_SETTINGS = PW.Env.modSettings.skylo || {};
	// new LoadingClient({
	// 	url: MOD_SETTINGS.themeUrl
	// });
},{
	requires: [
		'loading/client',
		'client-height/core',
		'core'
	]
});
KISSY.add('loading/client', function(S){
	var
		DOM = S.DOM,
		config = {
			url: ''
		};
	function LoadingClient(param){
		this.opts = S.merge(config, param);
		this.loading;
		this._init();
	}
	S.augment(LoadingClient, {
		_init: function(){
			var 
				that = this;
			that.loading = PW.widget.Loading.client({
				hint: '正在加载，请稍候...',
				width: 200,
				zIndex: 1000
			});
			that.loading.show();
			that._loading();
		},
		_loading: function(){
			var
				that = this;
			
			S.loadCSS(that.opts.url, {
				success: function(){
					that._hideLoading();
				},
				error: function(){
					S.log('异步加载失败！');
				}
			});
		},
		_hideLoading: function(){
			var
				that = this;
			
			S.timer(function(){
				that.loading.hide();
			}, 0.2, 1);
		}
	});
	return LoadingClient;
},{
	requires: [
		'widget/loading',
		'mod/ext'
	]
});
/**
 *	计算窗口大小，使得窗口可以铺满整个屏幕
 * @param  {[type]} S){	var		$       [description]
 * @param  {[type]} options.requires: [		'thirdparty/jquery'	] [description]
 * @return {[type]}                   [description]
 */
KISSY.add('client-height/core', function(S){
	;(function($){
		function extendHeight(){
			var
				windowHeight = $(document).height() - 71;
				sidebarHeight = $('.sidebar').height();
			if(sidebarHeight < windowHeight){
				$('.sidebar').height(windowHeight);
			}
		}
		extendHeight();
		$(window).on('resize', function(){
			extendHeight();

		});
	})(jQuery);
},{
	requires: [
		'thirdparty/jquery',
		'core'
	]
});
