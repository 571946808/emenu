/*-----------------------------------------------------------------------------
 * @Description:     菜品管理-菜品图片添加管理
 * @Version:         1.0.0
 * @author:          cuiy(361151713@qq.com)
 * @date             2015.11.19
 * ==NOTES:=============================================
 * v1.0.0(2015.11.19):
 初始生成
 * ---------------------------------------------------------------------------*/

KISSY.add('page/dish-management/dish-img-management-add', function(S, BigPic, SmallPic, Tool){
    PW.namespace('page.DishManagement.DishImgManagementAdd');
    PW.page.DishManagement.DishImgManagementAdd = {
        BigPic: function(param){
            return new BigPic(param);
        },
        SmallPic: function(param){
            return new SmallPic(param);
        },
        Tool: function(param){
            return new Tool(param);
        }
    };
},{
    requires: [
        'dish-img-management-add/big-pic',
        'dish-img-management-add/small-pic',
        'dish-img-tool-management'

    ]
});

KISSY.add('dish-img-management-add/big-pic', function(S, Tool){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Upload = PW.widget.Upload,
        Defender = PW.mod.Defender,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
            // 文件
            fileItemEl: '.file-item',
            // 菜品id
            idEl: '.J_id'
        };

    function BigPic(param){
        this.opts = param;
        this._init(param);
    }

    S.augment(BigPic, {
        _init: function(){
            this._uploadBigPic();
        },
        _uploadBigPic: function(){
            var
                that = this,
                upload = that.opts.upload,
                settings = {
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    formData: {
                        dishId: DOM.val(el.idEl),
                        imgType: 2
                    }
                };

            S.mix(that.opts, settings);

            that.upload = Upload.client(that.opts);
        }
    });

    return BigPic;
},{
    requires: [
        'dish-img-tool-management',
        'widget/dialog',
        'mod/juicer',
        'widget/upload',
        'pio/dish-management/dish-management'
    ]
});

KISSY.add('dish-img-management-add/small-pic', function(S, Tool){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Upload = PW.widget.Upload,
        Defender = PW.mod.Defender,
        DishManagementIO = PW.io.DishManagement.DishManagement,
        config = {},
        el = {
            // 文件
            fileItemEl: '.file-item',
            // 菜品id
            idEl: '.J_id'
        };

    function SmallPic(param){
        this.opts = param;
        this._init(param);
    }

    S.augment(SmallPic, {
        _init: function(){
            this._uploadSmallPic();
        },
        _uploadSmallPic: function(){
            var
                that = this,
                upload = that.opts.upload,
                settings = {
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    formData: {
                        dishId: DOM.val(el.idEl),
                        imgType: 1
                    },
                    fileNumLimit: 1
                };

            S.mix(that.opts, settings);

            that.upload = Upload.client(that.opts);
        }
    });

    return SmallPic;
},{
    requires: [
        'dish-img-tool-management',
        'widget/dialog',
        'mod/juicer',
        'widget/upload',
        'pio/dish-management/dish-management'
    ]
});

KISSY.add('dish-img-tool-management', function(S){
    var
        DOM = S.DOM, get = DOM.get, query = DOM.query, $ = S.all,
        on = S.Event.on, delegate = S.Event.delegate, fire = S.Event.fire, detach = S.Event.detach,
        Dialog = PW.widget.Dialog,
        Upload = PW.widget.Upload,
        Defender = PW.mod.Defender,
        config = {},
        el = {
            // 文件
            fileItemEl: '.file-item',
            // 菜品id
            idEl: '.J_id',
            // 队列中的图片
            imgEl: '.J_removeImgOfFieldQueue'
        };

    function Tool(param){
        this.upload = param;
        this.uploader = param.uploader;
        this._init();
    }

    S.augment(Tool, S.EventTarget, {
        _init: function(){
            this._bulidEvt();
        },
        _bulidEvt: function(){
            var
                that = this;
            delegate('.uploader', 'mouseenter', el.fileItemEl, function(e){
                that._showTools(e.target);
            });
            delegate('.uploader', 'mouseleave', el.fileItemEl, function(e){
                that._hideTools(e.target);
            });
            delegate('.uploader', 'click', el.imgEl, function(e){
                that._removeImgOfFieldQueue(e.target);
            });
        },
        _showTools: function(e){
            var
                that = this,
                fileItemEl = $(e).parent('.file-item'),
                toolsEl;
            if($(e).hasClass('file-item')){
                toolsEl = $('.tools',e);
            }else if($(fileItemEl).hasClass('file-item')){
                toolsEl = $('.tools',fileItemEl);
            }
            $(toolsEl).slideDown(0.2);
        },
        _hideTools: function(e){
            var
                that = this,
                fileItemEl = $(e).parent('.file-item'),
                toolsEl;
            if($(e).hasClass('.file-item')){
                toolsEl = $('.tools',e);
            }else if($(fileItemEl).hasClass('file-item')){
                toolsEl = $('.tools', fileItemEl);
            }
            $(toolsEl).slideUp(0.4);
        },
        _removeImgOfFieldQueue: function(e){
            var
                that = this,
                imgEl = DOM.parent(e, el.fileItemEl),
                id = DOM.attr(imgEl, 'id');

            //S.log(that.uploader)
            that.uploader.removeFile(id);
            $(imgEl).remove();
        }
    });

    return Tool;
},{
    requires: [
        'core'
    ]
});