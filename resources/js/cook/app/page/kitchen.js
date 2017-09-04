/*-----------------------------------------------------------------------------
* @Description:     调度系统总控
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-12
* ==NOTES:=============================================
* v1.0.0(2013-12-12):
*   初始生成
* v1.0.1(2016-8-3):
*   定时发送ajax请求，判断打印机时候可用
* ---------------------------------------------------------------------------*/

KISSY.add(function(S, Layout, Table){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, IO = S.IO,
        TableIO = PW.io.Table, $ = S.all, on = S.Event.on,
        el = {
            //下拉列表
            dropDownTrigger: '.dropdown-toggle',
            //下拉列表项
            dropDownMenu: '.dropdown-menu'
        },
        OPEN_CLASS= "open",
        //轮询间隔时间，单位: s
        POLL_INTERVAL_TIME = 10;

    function Kitchen(param){
        //轮询器
        this._poller = -1;
        //当前已经存在的餐桌数据
        this._curTables = [];
        //布局控制类
        this._layout = PW.page.Layout(param);
        this._init();
    }

    S.augment(Kitchen, S.EventTarget, {
        /**
         * 初始化构造
         */
        _init: function(){
            this.getTablesVersion();
            this._addEvtDispatcher();
            this._firstGetPrintInfo();
            this._getPrintInfo();
        },
        _addEvtDispatcher: function(){
            var
                that = this;
            //当扫码结束时处理控制
            that._layout.on('scanFinished', that.getTablesVersion, that);
            on(el.dropDownTrigger, 'click', that._toggle, that);
        },
        /**
         * 页面加载时第一次获取打印机是否可用的信息
         * @return {[type]} [description]
         */
        _firstGetPrintInfo: function(){
            TableIO.getPrintInfo({}, function(rs, errMsg){
                if(!rs){
                    alert(errMsg);
                    window.location.reload();
                }
            })
        },
        /**
         * 设置轮询
         * 具体逻辑:
         *     1.如果poller存在，则删除当前poller
         *     2.重新加载poller
         */
        _setPoller: function(){
            var
                that = this;

            //移除当前poller
            if(that._poller){
                S.clearTimer(that._poller);
            }
            //设置
            that._poller = S.timer(function(){
                that.getTablesVersion();
            }, POLL_INTERVAL_TIME, 1)
        },
        /**
         * 获取table 的version信息
         * @return {[type]}
         */
        getTablesVersion: function(){
            var
                that = this;
            TableIO.getTablesVersion({},function(rs, data, errMsg){
                if(!rs){
                    S.log('处理信息失败!');
                }else{
                    //成功
                    that._disPatcher(data.tables);
                    that._layout.wfRefresh();
                }
                that._setPoller();
            });
        },
        /**
         * 核心调度逻辑
         * @return {[type]} [description]
         */
        _disPatcher: function(tvs){
            var
                that = this,
                ret = [];
            //删除旧的table
            that._removeOldTables(tvs);
            //更新新的餐桌
            that._createNewTables(tvs);
        },
        /**
         * 创建tables， 根据table的version数据
         *      如果version已经存在，且与上一次版本不一样，则更新
         *      否则新建table
         * @param  {array} tvs table versions
         */
        _createNewTables: function(tvs){
            var
                that = this,
                ret = [];
            S.each(tvs, function(tv){
                var table = that._getTableById(tv.id);
                //如果存在此table
                if(table){
                    //table版本变化，更新table信息
                    if(table.version != tv.version){
                        table.refresh();
                    };
                }else{
                    //创建table
                    table = new Table(tv.id, tv.version);
                }
                ret.push(table);
            });
            that._curTables = ret;
        },
        /**
         * 获取table的信息
         * @param  {[type]} tableId
         * @return {[type]}
         */
        _getTableById: function(tableId){
            var
                that = this,
                curTables = that._curTables,
                ret = null;
            for(var i = 0, l = curTables.length; i < l; i++){
                var curTable = curTables[i];
                if(curTable.id == tableId){
                    ret = curTable;
                }
            }
            return ret;
        },
        /**
         * 移除旧的餐桌信息
         * @param  {Obj} tvs 新的餐桌版本信息
         */
        _removeOldTables: function(tvs){
            var
                that = this,
                curTables = that._curTables;
            S.each(curTables, function(table){
                var 
                    //餐桌是否存在于新版本中
                    flag = false;
                for(var i = 0, l = tvs.length; i < l; i++){

                    if(tvs[i].id ==  table.id){
                        flag = true;
                        break;
                    }
                }
                //如果餐桌不存在于新版本中
                if(!flag){
                    table.destroy();
                }
            })
        },
        /**
         * 展开和关闭下拉列表
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _toggle: function(e){
            var
                that = this;
            if(!DOM.hasClass(el.dropDownTrigger, OPEN_CLASS)){
                that._menuShow();
            }else{
                that._menuHide();
            }
        },
        /**
         * 显示菜单
         * @return {[type]} [description]
         */
        _menuShow: function(){
            $(el.dropDownMenu).slideDown(.4, function(){
                DOM.addClass(el.dropDownTrigger, OPEN_CLASS);    
            }, 'easeInStrong');
        },
        /**
         * 隐藏菜单
         * @return {[type]} [description]
         */
        _menuHide: function(){
            $(el.dropDownMenu).slideUp(.4, function(){
                DOM.removeClass(el.dropDownTrigger, OPEN_CLASS);    
            }, 'easeInStrong');
        },
        /**
         * 定时ajax获取打印机是否可用
         * @return {[type]} [description]
         */
        _getPrintInfo: function(){
            var
                that = this,
                clock;

            clock = window.setInterval(function(){
                TableIO.getPrintInfo({}, function(rs, errMsg){
                    if(!rs){
                        window.clearInterval(clock);
                        alert(errMsg);
                        window.location.reload();
                    }
                })
            },60000);
        }
    })    
    PW.namespace('page.Kitchen')
    PW.page.Kitchen = function(){
        return new Kitchen();
    }
},{
    requires:[
        'page/layout',
        'page/table',
        'io/table',
        // 'mod/loading-tip',
        'mod/ext'
    ]
})