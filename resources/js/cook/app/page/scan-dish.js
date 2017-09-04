/*-----------------------------------------------------------------------------
* @Description:     扫描菜品
* @Version:         1.0.0
* @author:          simon(406400939@qq.com)
* @date             2013/12/18 16:56:37
* ==NOTES:=============================================
* v1.0.0(2013/12/18 16:56:41):
*     后厨扫描菜品
* v1.0.1(2013/12/30 15:37:58):
*     加入判断，如果扫码时输入为空，则什么都不处理
* ---------------------------------------------------------------------------*/

KISSY.add(function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on,
        DishIO = PW.io.Dish,
        RESULT_HIDE_TIMER_KEY = 'resultTimer',
        el = {
            scanForm: '#J_scanForm',
            barCode: '#J_barCodeField',
            dishDataContainer: '#J_scanedDishData',
            scanResultContainer: '#J_scanResult',
            scanResultText: '#J_resultReport'
        };

    function ScanDish(){
        this._init();
    }

    S.augment(ScanDish, {
        _init: function(){
            this._addEvtDispatcher();
            this._focusScanField();
        },
        _addEvtDispatcher: function(){
            var
                that =  this;
            //当扫码结束，表单提交交的时候
            on(el.scanForm, 'submit', that._gunScanedHandler, that);
            //当扫空码的时候，即未聚焦到bar code field
            on(window, 'keyup', that._invalidScanHandler, that);
        },
        /**
         * 扫码枪扫描完毕
         */
        _gunScanedHandler: function(ev){
            var
                that = this,
                barCode = $(el.barCode).val();
            //加入判断，如果输入值为空或者空格，则直接返回
            if(!barCode || S.trim(barCode) == ''){
                that._displayScanResult(false, '请扫入菜品条形码！');
                that._focusScanField();
                return false;
            }
            //如果扫到条形码，则进行io处理
            DishIO.scanBarCode({
                orderDishId: barCode
            }, function(rs, data, errMsg){
                if(rs){
                    //扫描成功
                    that._displayScanResult(rs, '['+barCode+']扫描成功');
                }else{
                    //扫描失败
                    that._displayScanResult(rs, '['+barCode+']' + errMsg);
                }
                that._displayNewDishData({
                    barCode: barCode,
                    time: S.moment(S.now()).format('YYYY-MM-DD HH:mm:ss'),
                    result: rs ? '成功' : errMsg
                });
                that._focusScanField();
            });
            return false;
        },
        /**
         * 无效扫码，即为聚焦扫码的时候处理方案
         * @return {[type]} [description]
         */
        _invalidScanHandler: function(ev){
            var
                that = this;
            if(ev.keyCode == '13'){
                that._focusScanField();
            }
        },
        /**
         * 将光标锁定到扫描input
         */
        _focusScanField: function(){
            var
                that = this,
                barCodeField = get(el.barCode);
            DOM.val(barCodeField, '');
            barCodeField.focus();
        },
        /**
         * 显示新的菜品信息
         */
        _displayNewDishData: function(data){
            var
                that = this,
                html = '';
            html += '<tr>';
            html += '<td>' + data.barCode + '</td>';
            html += '<td>' + data.time + '</td>';
            html += '<td>' + data.result + '</td>';
            html += '</tr>';
            $(el.dishDataContainer).prepend(html);
        },
        /**
         * 显示扫描结果
         */
        _displayScanResult: function(rs, msg){
            var
                that = this,
                timer,
                $resultContainer = $(el.scanResultContainer);

            timer = $resultContainer.data(RESULT_HIDE_TIMER_KEY);
            if(timer){
                S.clearTimer(timer);
                $resultContainer.data(RESULT_HIDE_TIMER_KEY, undefined);
            }
            $resultContainer.data(
                RESULT_HIDE_TIMER_KEY, 
                S.timer(function(){
                    $resultContainer.slideUp(.3);
                    $resultContainer.removeData(RESULT_HIDE_TIMER_KEY);
                },2,1)
            )
            $resultContainer.slideDown(.3);
            if(rs){
                $resultContainer.replaceClass('alert-danger', 'alert-info');
            }else{
                $resultContainer.replaceClass('alert-info', 'alert-danger');
            }
            $resultContainer.one(el.scanResultText).text(msg);
        }
    })

    PW.namespace('page.ScanDish');
    PW.page.ScanDish = function(){
        return new ScanDish();
    }

},{
    requires:[
        'io/dish',
        'mod/moment',
        'mod/ext',
        'core'
    ]
})