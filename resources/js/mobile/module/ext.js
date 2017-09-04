/*-----------------------------------------------------------------------------
 * @Description:     模块--设置页面的基数字体大小,设置最小高度
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2016.01.13
 * ==NOTES:=============================================
 * v1.0.0(2016.01.13):
 初始生成
 v1.0.1(2016.01.15)
 设置最小高度min-height
 * ---------------------------------------------------------------------------*/

KISSY.add('module/ext', function(S, FontSize, MinHeight){
    var
        Ext = {
            FontSize: {
                client: function(param){
                    new FontSize(param);
                }
            },
            MinHeight: {
                client: function(param){
                    new MinHeight(param);
                }
            }
        };

    S.ready(function(S){
        Ext.FontSize.client();
        //Ext.MinHeight.client();
    });
    PW.namespace('module.Ext');
    PW.module.Ext = Ext;
},{
    requires: [
        'ext/font-size',
        'ext/min-height'
    ]
});
/**
 * 计算页面字体大小
 */
KISSY.add('ext/font-size', function(S){
    var
        $ = S.all,
        $j = jQuery;

    function Core(param){
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            $(window).on('resize', function(){
                that._setFontSize();
            });
        },
        _setFontSize: function(){
            var
                that = this,
                scale = 1 / devicePixelRatio,
                dd = document.documentElement,
                clientWidth = dd.clientWidth;

            document.querySelector('meta[name="viewport"]').setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
            if(clientWidth > 1080){
                clientWidth = 1080;
            }
            dd.style.fontSize = dd.clientWidth / 10 + 'px';
            fontSize = dd.style.fontSize;
            rootFontSize = dd.clientWidth / 10;
        }
    });
    return Core;
},{
    requires: [
        'core',
        'thirdparty/jquery'
    ]
});
/**
 * 计算最小高度
 */
KISSY.add('ext/min-height', function(S){
    var
        $ = S.all,
        $j = jQuery;

    function Core(param){
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            this._setMinHeight();
            this._buildEvt();
        },
        _buildEvt: function(){
            var
                that = this;

            $j(window).on('resize', function(){
                that._setMinHeight();
            });
        },
        _setMinHeight: function(){
            var
                that = this,
                dd = document.documentElement,
                clientHeight = dd.clientHeight,
                height = clientHeight + 113 + 95;

            $j('.container').height(height);
        }
    });
    return Core;
},{
    requires: [
        'thirdparty/jquery'
    ]
});