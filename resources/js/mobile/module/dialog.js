KISSY.add('module/dialog', function(S, Core){
    var
        Dialog = {
            client: function(param){
                return new Core(param);
            }
        };

    PW.namespace('page.Dialog');
    PW.page.Dialog = Dialog;
},{
    requires: [
        'dialog/core'
    ]
});

KISSY.add('dialog/core', function(S){
    var
        $ = S.all,
        DOM = S.DOM,
        on = S.Event.on,
        el = {
            //header
            headerArea: "#header",
            //footer
            footerArea: "#footer",
            //遮盖层区域
            coverArea: "#dialogCover",
            //遮盖层覆盖区域
            containerArea: '.page'
        };

    function Core(param){
        this._init();
    }

    S.augment(Core, {
        _init: function(){
            this._createCoverDiv();
            this._renderRecoverArea();
            this._commonStyle();
        },
        /**
         * 创建遮盖层div
         * @return {[type]} [description]
         */
        _createCoverDiv: function(){
            containerArea = DOM.get(el.containerArea);
            createHtml = '<div id="dialogCover">' + '</div>';
            $(createHtml).insertAfter(containerArea);
        },
        /**
         * 渲染覆盖区域
         * @return {[type]} [description]
         */
        _renderRecoverArea: function(){
            var
                that = this,
                //cover
                currentCoverHeight = DOM.get(el.coverArea),
                clientViewHeight = DOM.viewportHeight(), //移动端可视区域高度
                clientViewWidth = DOM.viewportWidth(); //移动端可视区域宽度

            that.clientViewHeight = clientViewHeight;
            that.clientViewWidth = clientViewWidth;

            //cover覆盖区域
            coverHeight = that.clientViewHeight;  //计算遮盖层的高度
            //覆盖区域的高度
            currentCoverHeight.style.height = coverHeight + 'px';
            //获取覆盖层的高度
            coverAreaHeight = DOM.get(el.coverArea).clientHeight;
            that.coverAreaHeight = coverAreaHeight;
        },
        _commonStyle: function () {
            var
                coverLayer =  that.clientViewHeight,
                marginTop = coverLayer / 3;

            comfirmDivMarginRight = that.clientViewWidth * 0.112;
            confirmOrderEl.style.marginRight = comfirmDivMarginRight + 'px';
            confirmDivMarginLeft = comfirmDivMarginRight;
            confirmOrderEl.style.marginLeft = confirmDivMarginLeft + 'px';

            comfirmDivMarginTop = that.clientViewHeight / 3;
            confirmOrderEl.style.marginTop = comfirmDivMarginTop + 'px';
            // confirmDivHeight = that.clientViewHeight / 1.549;
            // confirmOrderEl.style.height = confirmDivHeight + 'px';
        }

    });
    return Core;
});