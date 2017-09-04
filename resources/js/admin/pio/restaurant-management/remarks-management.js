KISSY.add('pio/restaurant-management/remarks-management', function(S){

    var 
        urls,
        conn = PW.mod.Connector(_pw_apiData);
  
    try{
        urls = conn.RestaurantManagement;
    }catch(e){
        S.log('地址信息错误');
        return;
    }

    PW.namespace('io.RestManagement.RemarksManagement');
    
    S.mix(PW.io.RestManagement.RemarksManagement, {
        conn: urls,
    /**
     * 选择备注大类
     * @param  {[type]}   data     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    chooseRemarkBigTag: function(data, callback){
        var 
            chooseIO = urls.chooseRemarkBigTag;

        chooseIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.list,
                rs.errMsg
            );
        });
    },
    /**
     * 删除备注小类
     * @param  {[type]}   data     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    delSmallClassify: function(data, callback){
        var 
            delSmallTagIO = urls.delSmallClassify;

        delSmallTagIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.errMsg
            );
        });
    },
    /**
     * 增加备注小类
     * @param {[type]}   data     [description]
     * @param {Function} callback [description]
     */
    addSmallClassify: function(data, callback){
        var
            addSmallTagIO = urls.addSmallClassify;

        addSmallTagIO.io(data, function(rs){
            callback(
                rs.code ==0,
                rs.data,
                rs.errMsg
            );
        });
    },
    /**
     * 编辑备注小类
     * @param  {[type]}   data     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    editSmallClassify: function(data, callback){
        var 
            editSmallTagIO = urls.editSmallClassify;

        editSmallTagIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.errMsg
            );
        });
    },
    /**
     * 添加备注内容
     * @param {[type]}   data     [description]
     * @param {Function} callback [description]
     */
    addRemarkContent:function(data, callback){
        var
            addRemarkContentIO = urls.addRemarkContent;

        addRemarkContentIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.data,
                rs.errMsg
            );
        });
    },
    /**
     * 编辑备注内容
     * @param  {[type]}   data     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    editRemarkContent:function(data, callback){
        var
            editRemarkContentIO = urls.editRemarkContent;

        editRemarkContentIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.errMsg
            );
        });
    },
    /**
     * 删除备注内容
     * @param  {[type]}   data     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    delRemarkContent: function(data, callback){
        var
            delRemarkContentIO = urls.delRemarkContentId;

        delRemarkContentIO.io(data, function(rs){
            callback(
                rs.code == 0,
                rs.errMsg
            );
        });
    }
    })
},{
    requires:[  
        'mod/ext',
        'mod/connector'
    ]
})