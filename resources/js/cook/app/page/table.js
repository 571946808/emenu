/*-----------------------------------------------------------------------------
* @Description:     餐台管理
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013-12-12
* ==NOTES:=============================================
* v1.0.0(2013-12-12):
*   初始生成
* ---------------------------------------------------------------------------*/
KISSY.add(function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        Juicer = S.juicer,
        DishIO = PW.io.Dish,
        TableIO = PW.io.Table,
        DISH_ID_ATTR = 'data-order-dish-id',
        //菜品正在做 样式提示类
        DISH_COOKING_CLASS = 'cooking',
        //餐台自刷新循环等待时间, unit: s
        TABLE_SELF_UPDATE_INTERVAL_TIME = 6,
        //时间轮询data key
        TIME_POLLER_KEY = 'time-update-poller',
        el = {
            tablesContainer: '#J_tablesContainer',
            tableTemp: '#J_tpl',
            printBtnWrapper: '.btn-wrapper',
            printTrigger: '.J_doPrint',
            printedTextWrapper: '.printed'

        };

    function Table(tableId, version){
        //当前table在布局中所对应的Element
        this._tableEl;
        //本地存储的table数据
        this._tableData;
        //布局控制对象
        this._layout = PW.page.Layout();
        //更新锁，如果当前锁住，则不支持更新，目的是防止过于相邻的时间内两次ajax请求冲突
        this._updateLock = false;
        //当前table对应的后台id
        this.id = tableId;
        //当前table的version
        this.version = version;
        //标志当前table是否已经销毁
        this._hasDistroyed = false
        //当前table的订单详情
        this._orders;
        this._init();
    }

    S.augment(Table, {
        /**
         * 初始化构造函数
         */
        _init: function(){
            this._loadTableInfo();
        },
        /**
         * 从服务器加载table信息
         */
        _loadTableInfo: function(){
            var
                that = this,
                fn = arguments.callee;
            if(!that._updateLock){
                that._updateLock = true;
                TableIO.getTableInfoById({
                    tableId: that.id
                }, function(rs, data, errMsg){
                    if(!rs){
                        S.log('加载餐桌信息错误-' + errMsg);
                    }else{
                        that._updateInfo(data);
                    }
                    that._updateLock = false;
                })
            }else{
                S.timer(function(){
                    fn();
                },3)
            }
        },
        /**
         * 更新table信息
         */
        refresh: function(){
            var
                that = this;
            that._loadTableInfo();
        },
        /**
         * 销毁当前table
         * @return {[type]}
         */
        destroy: function(){
            var
                that = this;
            if(that._tableEl){
                DOM.remove(that._tableEl);
                that._hasDistroyed = true;
            }
        },
        /**
         * 更新餐台信息
         * @param  {Obj} data 服务器餐台信息
         */
        _updateInfo: function(data){            
            var
                that = this;
            //更新version信息
            that.version = data.version;
            //存储本地table data信息
            that._tableData = data;
            //渲染table数据
            that._renderTable(data);
            //刷新时间数据
            that._updateTableTime();
            //绑定事件
            that._bindEvt();
            //更新时间（添加时间更新轮询）
            that._refreshTimePoller();
        },
        /**
         * 渲染餐台表现内容
         * @param  {Obj} data 服务器餐台信息
         */
        _renderTable: function(data){
            var
                that = this,
                newTableEl,
                html = '';
            html = Juicer($(el.tableTemp).html(), data);
            newTableEl = DOM.create(html);
            if(!that._tableEl){
                DOM.append(newTableEl, el.tablesContainer);
                that._layout.wfRefresh();
            }else{
                DOM.replace(that._tableEl, newTableEl);
                that._layout.wfRefresh();
            }
            that._tableEl = newTableEl;
        },
        /**
         * 绑定餐台的事件，主要是打印点击事件
         * @return {[type]}
         */
        _bindEvt: function(){
            var
                that = this,
                $tableEl = $(that._tableEl);
            //直接添加打印的点击事件
            $tableEl.all(el.printTrigger).on('click', function(ev){
                var
                    $tr = $(ev.target).parent('tr'),
                    $td = $(ev.target).parent('td'),
                    dishId = $tr.attr(DISH_ID_ATTR);
                if(DISH_ID_ATTR){
                    DishIO.printDish({
                        orderDishId: dishId
                    }, function(rs, data, errMsg){
                        if (rs) {
                            that.refresh(); 
                        }else{
                            alert(errMsg);
                        }
                    })    
                }
            })
            /**
             * 用于鼠标移入单个菜品的时候显示重打按钮
             * 移出隐藏之
             */
            $tableEl.all('tr.' + DISH_COOKING_CLASS)
                .on('mouseover', function(ev){
                    var
                        tr = DOM.parent(ev.target, 'tr');
                    that._showDishPrintBtn(tr, true);
                })
                .on('mouseout', function(ev){
                    var
                        tr = DOM.parent(ev.target, 'tr');
                    that._showDishPrintBtn(tr, false);  
                });
        },
        /**
         * 用于刷新当前订单已经耗去的时间信息
         *     1.每次都执行一次更新时间操作
         *     2.如果table已经销毁，则什么都不执行，下次循环也将无法进行
         */
        _refreshTimePoller: function(){
            var
                that = this,
                $tableEl = $(that._tableEl);

            if($tableEl.length > 0 && !$tableEl.data(TIME_POLLER_KEY)){
                $tableEl.data(
                    TIME_POLLER_KEY, 
                    S.timer(function(){
                        //如果整个table还没有被毁，执行更新
                        if(!that._hasDistroyed){
                            that._updateTableTime();
                            $tableEl.data(TIME_POLLER_KEY, S.timer(arguments.callee, TABLE_SELF_UPDATE_INTERVAL_TIME, 1));
                        }
                    },TABLE_SELF_UPDATE_INTERVAL_TIME, 1)
                )
            }
        },
        /**
         * 更新订单时间显示,将timeEl上的内容更改为分钟数，并且修改背景颜色
         */
        _updateTableTime: function(){
            var
                that = this,
                $tableEl = $(that._tableEl);

            $tableEl.all('.time').each(function($timeEl){
                var time = $timeEl.attr('data-order-time'),
                    minutes = Math.floor( ( S.now() - time ) / 60 /1000 );
                //修改分钟数    
                $timeEl.text(minutes);
                //通过颜色变化，设置已经耗去的分钟数的提示颜色
                //函数式为 y = 400 / (1 + x^1.01),
                //此函数的目的是更改timer显示徽章的背景颜色
                //让其在开始的时候是橙色,在越接近60分的时候越红
                $timeEl.css(
                    'background', 
                    'rgb(255, ' + Math.floor( 400 / (1 + Math.pow(minutes, 1.01))) + ', 0)'
                );
            })  

        },
        /**
         * 展示/隐藏 dish的打印按钮
         * @param {Element} tr dish对应的tr节点
         * @param {Boolean} isShow 是否显示按钮
         */
        _showDishPrintBtn: function(tr, isShow){ 
            var
                that = this,
                $tr = $(tr),
                $btnWrapper = $tr.one(el.printBtnWrapper),
                $printedTextWrapper = $tr.one(el.printedTextWrapper);
            if(!isShow){
                $btnWrapper.hide();
                $printedTextWrapper.show();
            }else{
                $btnWrapper.show();
                $printedTextWrapper.hide();
            }
        }
    });   

    return Table;
},{
    requires:[
        'io/table',
        'io/dish',
        'page/layout',
        'core',
        'mod/juicer',
        'mod/ext'
    ]
})
