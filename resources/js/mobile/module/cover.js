/*-----------------------------------------------------------------------------
 * @Description:     遮盖层功能
 * @Version:         1.0.0
 * @author:          hujun(435043636@qq.com)
 * @date             2016.01.23
 * ==NOTES:=============================================
 * v1.0.0(2016.01.23):
 初始生成
 * ---------------------------------------------------------------------------*/
KISSY.add('module/cover', function(S, Core){
    var 
        Cover = {
            client: function(param){
                return new Core(param);
            }     
        }

    PW.namespace('page.Cover');
    PW.page.Cover = Cover;
},{
    requires: [
        'cover/core'
    ]
});

KISSY.add('cover/core', function(S){
    var 
        $ = S.all,
        DOM = S.DOM,
        on = S.Event.on,
        config = {},
        el = {
            //header
            headerArea: "#header",
            //footer
            footerArea: "#footer",
            //遮盖层区域
            coverArea: "#createCover",
            //等待呼叫图像border
            waitImg: ".wait-img-border",
            //中心图片
            centerIcon: ".center-icon",
            //等待提示信息
            tipInfo: ".tip_info",
            //container
            containerArea: '.container',
            //footer中cover页的资源地址的暂存域
            coverImgSrcEl: '.J_coverImgSrc'
        };

    function Core(param){
        this._init();
        window.onresize = function(){
            window.location.reload();   //重刷页面
                this._init();
        }
    }
    
    S.augment(Core, {
        _init: function(){
            this._createCoverDiv();
            this._getCurrentClientSize();
            this._recoverArea();
            this._waitImg();
            this._tipInfo();
            this._dynamicDots();
            this._coverClear();
        },
        //2500ms后自动消失
        _coverClear: function(){ 
            setTimeout(function(){
                DOM.remove(el.coverArea);
            },2500);
        },
        _buildEvt: function(){
            window.addEventListener("orientationchange", function(){
                // 宣布新方向的数值
                alert(window.orientation);
            }, false);
        },
        /**
         * 创建遮盖层div
         * @return {[type]} [description]
         */
        _createCoverDiv: function(){
            var
                that = this,
                coverImgSrcEl,
                waitImgEl,
                containerArea,
                createHtml;

            containerArea = DOM.get(el.containerArea);
            createHtml = '<div id="createCover">'+
                            '<p class="wait-img-border">'+
                                '<img class="center-icon fa-spin J_waitImg" src="">'+
                            '</p>'+
                                // '<i class="fa fa-hourglass fa-spin"></i>'+
                            '<p class="tip_info">正在呼叫，请稍后<span class="dots">......</span></p>'+
                        '</div>';
            coverImgSrcEl = DOM.get(el.coverImgSrcEl, el.footerArea);
            $(createHtml).insertAfter(containerArea);
            coverImgSrc = DOM.attr(coverImgSrcEl, 'href');
            waitImgEl = DOM.get('.J_waitImg');
            DOM.attr(waitImgEl, 'src', coverImgSrc);
        },
        /**
         * 获取当前客户端的屏幕宽高
         * @return {[type]} [description]
         */
        _getCurrentClientSize: function(){
            var
                that = this,
                clientViewHeight = DOM.viewportHeight(), //移动端可视区域高度
                clientViewWidth = DOM.viewportWidth(); //移动端可视区域宽度

            that.clientViewHeight = clientViewHeight;
            that.clientViewWidth = clientViewWidth;
        },
        /**
         * 遮盖层背景区域
         * @return {[type]} [description]
         */
        _recoverArea: function(){
            var
                that = this,
                coverAreaHeight,
                //header
                headerHeight = DOM.get(el.headerArea),
                //footer 
                footerHeight = DOM.get(el.footerArea),
                //cover
                currentCoverHeight = DOM.get(el.coverArea),
                //cover覆盖区域
                coverHeight = that.clientViewHeight - headerHeight.clientHeight - footerHeight.clientHeight;  //计算遮盖层的高度

            //覆盖区域的高度
            currentCoverHeight.style.height = coverHeight + 'px';
            //获取覆盖层的高度
            coverAreaHeight = DOM.get(el.coverArea).clientHeight;
            that.coverAreaHeight = coverAreaHeight;
        },

        /**
         * 等待区域图
         * @return {[type]} [description]
         */
        _waitImg: function(){
            var
                that = this,
                imgMarginLeft,
                imgMarginRight,
                waitImgArea,
                imgMarginTop,
                imgBorderwidth,
                imgBorderHeight,
                centerIconHeight,
                centerIconArea,
                centerIconWidth,
                centerIconMarginTop,
                imgMarginLeftAddRight;
            
            //计算中间图外围圆的直径
            waitImgArea = DOM.get(el.waitImg);
            waitImgArea.style.height = (that.clientViewWidth * 0.248) + 'px';
            waitImgArea.style.width = waitImgArea.style.height;

            //计算img区域的margin-left和margin-right
            imgMarginLeftAddRight = (that.clientViewWidth - that.clientViewWidth * 0.248);
            imgMarginLeft = imgMarginLeftAddRight / 2;
            imgMarginRight = imgMarginLeft;
            waitImgArea.style.marginLeft =  imgMarginLeft + 'px';
            waitImgArea.style.marginRight = imgMarginRight + 'px';

            //计算img区域的margin-top
            imgMarginTop = that.coverAreaHeight * 0.267;
            waitImgArea.style.marginTop = imgMarginTop + 'px';
    
            //获取中心图边框高度\宽度
            imgBorderHeight = DOM.get(el.waitImg).clientHeight;
            imgBorderwidth = imgBorderHeight;

            //获取中心图，并计算margin-top
            // centerIcon = DOM.get(el.centerIcon, el.waitImg);
            // centerIconHeight = centerIcon.clientHeight;
            // centerIcon.style.marginTop = ((imgBorderHeight - centerIconHeight) / 2) + 'px';

            //计算中心图的宽高
            centerIconArea = DOM.get(el.centerIcon);
            centerIconWidth = imgBorderwidth * 0.302;
            centerIconArea.style.width = centerIconWidth + 'px';
            centerIconHeight = imgBorderwidth * 0.407;
            centerIconArea.style.height = centerIconHeight + 'px';

            // 计算中心图的margin-left和margin-right(text-align:center可设置居中，这段代码可不要)
            // centerIconWidth = centerIconArea.clientWidth;
            // S.log(centerIconWidth);
            // centerIconMarginLeft = (( imgBorderwidth - centerIconWidth ) / 2) + 'px';
            // centerIconMarginRight = centerIconMarginLeft;
            // S.log(centerIconMarginLeft);
            // S.log(centerIconMarginRight);
            // centerIconArea.style.marginLeft = centerIconMarginLeft + 'px';
            // centerIconArea.style.marginRight = centerIconMarginRight + 'px';

            //计算中心图的margin-top
            centerIconHeight = centerIconArea.clientHeight;
            centerIconMarginTop = ((imgBorderHeight - centerIconHeight) / 2);
            centerIconArea.style.marginTop = centerIconMarginTop + 'px';          
        },
        /**
         * 提示信息
         * @return {[type]} [description]
         */
        _tipInfo: function(){
            var
                that = this,
                tipInfoArea;

            tipInfoArea = DOM.get(el.tipInfo); 
            tipInfoArea.style.width = that.clientViewWidth;
            tipInfoArea.style.marginTop = (that.coverAreaHeight * 0.518) + 'px';
        },
        /**
         * 省略号动态效果
         * @return {[type]} [description]
         */
        _dynamicDots: function(){
            var dotsSpan = DOM.get('.dots'),
                dots = '......',
                length = dots.length,
                index = 0,
                calEl,
                eachDotEl;

            function dotsShow(){
                DOM.text(dotsSpan, '');
                calEl = setInterval(function(){
                    //获取每个dot
                    eachDotEl = dots.charAt(index);
                    $(dotsSpan).append(eachDotEl);
                    if(index ++ === length){
                        clearInterval(calEl);
                        index = 0;
                        dotsShow()
                    }
                },500);
            }
            dotsShow();  
        }  
    })
    return Core;
});