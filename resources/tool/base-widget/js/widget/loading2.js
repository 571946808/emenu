//获取浏览器页面可见高度和宽度
var
	_PageHeight = document.documentElement.clientHeight,
    _PageWidth = document.documentElement.clientWidth;
var
	windowHeight = window.innerHeight,
	windowWidth = window.innerWidth;
var
	height,
	width;
if(_PageHeight > windowHeight){
	height = _PageHeight;
}else{
	height = windowHeight;
}
if(_PageWidth > windowWidth){
	width = _PageWidth;
}else{
	width = windowWidth;
}
//计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为61px）
var _LoadingTop = height > 61 ? (height - 61) / 2 : 0,
    _LoadingLeft = width > 215 ? (width - 215) / 2 : 0;

//在页面未加载完毕之前显示的loading Html自定义内容
var _LoadingHtml = '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:' + height + 'px;top:0;background:#000;opacity:0.6;filter:alpha(opacity=80);z-index:10000;"><div style="position: absolute; cursor: wait; left: ' + _LoadingLeft + 'px; top:' + _LoadingTop + 'px; width: auto; height: 50px; line-height: 50px; padding-left: 30px; padding-right: 15px; background: #fff url(' + staticWebsite + 'img/admin/loading.gif) no-repeat scroll 5% 50%; border: 2px solid #95B8E7; color: #696969; ">页面加载中，请等待...</div></div>';

//呈现loading效果
document.write(_LoadingHtml);

//监听加载状态改变
document.onreadystatechange = completeLoading;

//加载状态为complete时移除loading效果
function completeLoading() {
    if (document.readyState == "complete") {
        var loadingMask = document.getElementById('loadingDiv');
        loadingMask.parentNode.removeChild(loadingMask);
    }
}