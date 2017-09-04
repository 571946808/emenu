/*-----------------------------------------------------------------------------
* @Description:     页面布局控制
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-12
* ==NOTES:=============================================
* v1.0.0(2013-12-12):
*   初始生成
* ---------------------------------------------------------------------------*/

KISSY.add(function(S){
   var
        DOM = S.DOM, get = DOM.get, query = DOM.query,
        on = S.Event.on,
        Dialog = PW.mod.Dialog,
        el = {
            //餐台容器
            tablesContainer: '#J_tablesContainer',
            scanModalTrigger: '#J_openScanModal',
            ingredientWarnTrigger: '#J_ingredientWarnModal'
        },
        //瀑布流X轴偏移量
        OFFSET_X = 10,
        //瀑布流Y轴偏移量
        OFFSET_Y = 10,
        //瀑布流元素的基础宽度
        GRID_BASE_WIDTH = 400,
        //布局实例
        LayoutInstance;

    function Layout(){
        //瀑布流控制
        this._waterfall;
        //等待遮罩
        this._ldt = PW.mod.LoadingTip({
            renderTo: '',
            hint: '正在加载餐桌信息，请稍后...'
        });
        if(!this._waterfall){
            this._init();
        }
        
    }

    S.augment(Layout, S.EventTarget, {
        _init: function(){
            this.wfRefresh();
            this._addEvtDispatcher();
            this._bindResizeEvt();
        },
        /**
         * 绑定事件
         */
        _addEvtDispatcher: function(){
            var
                that = this;
            on(el.scanModalTrigger, 'click', that._openScanModalHandler, that);
            //菜品标缺
            on(el.ingredientWarnTrigger, 'click', that._openIngWarnModalHandler, that);
        },
        /**
         * 打开扫描上菜窗口
         * @param  {[type]} ev [description]
         * @return {[type]}    [description]
         */
        _openScanModalHandler: function(ev){
            var
                that = this,
                t = ev.target,
                url = DOM.attr(t, 'href');
            Dialog.open({
                width: 800,
                height: 400,
                title: '上菜扫描',
                contentFrame: url,
                frameScroll: 'auto'
            })
            //绑定关闭之后处理
            .on('afterClose', function(){
                that.fire('scanFinished', {});
            })
            //点击阴影时自关闭
            .on('click', function(){
                this.close();
            })
            return false;
        },
        /**
         * 打开原材料标缺窗口
         * @return {[type]} [description]
         */
        _openIngWarnModalHandler: function(ev){
            var
                that = this,
                t = ev.target,
                url = DOM.attr(t, 'href');
            S.log(123);
            Dialog.open({
                width: 800,
                height: 400,
                title: '原材料标缺',
                contentFrame: url,
                frameScroll: 'auto'
            })
            .on('afterClose', function(){
                that.fire('ingWarnClose', {});
            })
            .on('click', function(){
                this.close();
            })
            return false;
        },
        /**
         * 綁定窗口resize事件
         * @return {[type]} [description]
         */
        _bindResizeEvt: function(){
            var
                that = this;
            $(window).resize(function(ev){
                if(that._waterfall){
                    that.wfRefresh();
                }
            })    
        },
        /**
         * 瀑布流布局更新
         */
        wfRefresh: function(){
            var
                that = this,
                col = that._getColNum();
            that._waterfall = $(el.tablesContainer).BlocksIt({
              numOfCol: col,
              offsetX: OFFSET_X,
              offsetY: OFFSET_Y
            }); 
        },
        /**
         * 计算页面所能显示的列数
         * @return {Number} 列数
         */
        _getColNum: function(){
            var
                that = this,
                cw = $(el.tablesContainer).width();
            return Math.floor(cw /( GRID_BASE_WIDTH + OFFSET_X));

        },
        /**
         * 显示页面提示信息（未使用）
         */
        showLoadingTip: function(){
            var 
                that = this;
            if(that._ldt){
                that._ldt.show();
            }
        },
        /**
         * 隐藏加载提示（未使用）
         */
        hideLoadingTip: function(){
            var 
                that = this;
            if(that._ldt){
                S.timer(function(){
                    that._ldt.hide();
                },.4,1)
            }  
        }
    })

    /**
     * 采用单例模式
     * 如果没有传入param，则判断返回param为参数的Layout实例
     * 如果传入param 返回新的Layout实例
     */
    PW.namespace('page.Layout');
    PW.page.Layout = function(param){
        if(S.isEmptyObject(param) && LayoutInstance){
            return LayoutInstance;
        }else{
            return LayoutInstance = new Layout(param);
        }
    }
    return Layout;
},{
    requires:[
        'core',
        'mod/ext',
        'mod/dialog',
        'thirdparty/jquery'
    ]
})
