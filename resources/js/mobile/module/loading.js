/*-----------------------------------------------------------------------------
 * @Description:     正在加载过渡
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.24
 * ==NOTES:=============================================
 * v1.0.0(2016.01.24):
 初始生成
 v1.0.1(2016.06.09)----by jiangx
 因为项目要求，页面加载完成后发一次ajax获取，获取页面信息，
 因此如果使用onload事件，在ajax发送之前就去掉了遮罩层，是插件没有效果，
 因此去掉了onload事件，改为在各自页面中ajax完成后添加去掉遮罩层的语句。
 * ---------------------------------------------------------------------------*/
//在页面未加载完毕之前显示的loading Html自定义内容
var _LoadingHtml = '<div id="loadingDiv" class="loading" style="background-color: rgba(0,0,0,0.7); position: absolute; left: 0; top: 1.267rem; bottom: 1.52rem; width: 100%; z-index: 1000;">' +
                        '<div class="loading-tip" style="text-align: center; padding: 0.5rem  0 0.133rem 0;">' +
                            '<span style="-webkit-animation-delay: -1s;animation-delay: -1s;background: rgba(255, 136, 34, 0.6);"></span>' +
                            '<span style="-webkit-animation-delay: -0.8s;animation-delay: -0.8s;background: rgba(255, 136, 34,0.8);"></span>' +
                            '<span style="-webkit-animation-delay: -0.26666s;animation-delay: -0.26666s;background: rgba(255, 136, 34,1);"></span>' +
                            '<span style="-webkit-animation-delay: -0.8s; animation-delay: -0.8s; background: rgba(255, 136, 34,0.8);"></span>' +
                            '<span style="-webkit-animation-delay: -1s; animation-delay: -1s;  background: rgba(255, 136, 34,0.4);"></span>' +
                            '<p style="color: #fff; font-size: 0.293rem; margin-top: 0.2667rem;">正在加载,请稍后</p>' +
                        '</div>' +
                    '</div>';
//呈现loading效果
document.write(_LoadingHtml);

//监听加载状态改变
document.onreadystatechange = completeLoading;

// 加载状态为complete时移除loading效果
function completeLoading() {
    if (document.readyState == "complete") {
        var loadingMask = document.getElementById('loadingDiv');
        loadingMask.parentNode.removeChild(loadingMask);
    }
}