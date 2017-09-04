/*-----------------------------------------------------------------------------
 * @Description:    IO层接口 (connector.js)
 * @Version: 	    V2.0.0
 * @author: 		cuiy(361151713@qq.com)
 * @date			2015.11.02
 * ==NOTES:=============================================
 * v1.0.0(2015.11.02):
 * ---------------------------------------------------------------------------*/

KISSY.add('mod/connector', function(S, Core){
    PW.namespace('mod.Connector');
    PW.mod.Connector = function(param){
        return new Core(param);
    }
},{
    requires: [
        'connector/core'
    ]
});
KISSY.add('connector/core', function(S, Module){
    function Core(param){
        this.opts = param;
        this._init();
    }
    S.augment(Core, {
        _init: function(){
            var
                that = this,
                map = that.opts,
                o = {};

            for(var i in map){
                if(!S.isArray(map[i])){
                    continue;
                }
                o = {};
                o[i] = new Module(i, map[i]);
                S.mix(that, o);
            }
        }
    });
    return Core;
},{
    requires: [
        'connector/module'
    ]
});
KISSY.add('connector/module', function(S, Connection){
    function Module(name, mapList){
        this.name = name;
        this.mapList = mapList;
        this._init();
    }
    S.augment(Module, {
        _init: function(){
            var
                that = this,
                mapList = that.mapList,
                type,
                o = {};
            S.each(mapList, function(conn){
                type = conn[2];
                if(type != ''){
                    switch(type){
                        case 'post':
                        case 'put':
                        case 'delete':
                            conn[2] = conn[2].toLowerCase();
                            break;
                        default :
                            conn[2] = 'get';
                    }
                    o = {};
                    o[conn[0]] = new Connection(conn);
                    S.mix(that, o);
                }
            });
        }
    });
    return Module;
},{
    requires: [
        'connector/connection'
    ]
});
KISSY.add('connector/connection', function(S){
    var
        Juicer = PW.mod.Juicer,
        JSON = S.JSON;
    function Connection(conn){
        this.name = conn[0];
        this.url = conn[1];
        this.type = conn[2];
        this.desc = conn[3];
        this.contentType = conn[4];
        //by:cuiy 添加contentType参数
        switch(this.contentType){
            case 'json':
                this.contentType = 'application/json';
                break;
            default:
                this.contentType = 'application/x-www-form-urlencoded';
        }
        this._init();
    }
    S.augment(Connection, {
        _init: function(){

        },
        _getFullPath: function(data){
            var
                that = this,
                path = Juicer.client(that.url, data);
            return path;
        },
        io: function(data, callback){
            var
                that = this;

            S.IO({
                url: that._getFullPath(data),
                type: that.type,
                data: data,
                cache: false,
                contentType: that.contentType,
                success: function(rs){
                    if(S.isString(rs)){
                        rs = JSON.parse(rs);
                    }
                    callback(rs);
                },
                error: function(err){
                    callback({
                        code: false,
                        errMsg: PW.Env.msg[0]
                    });
                }
            });
        }
    });
    return Connection;
},{
    requires: [
        'mod/juicer'
    ]
});