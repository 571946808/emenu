(function(){
    var   
        $libUrl = 'http://pui.pandawork.net/resources/',
        $staticWebsite = '/',
        $website = '/';
        
    PW_CONFIG = {
        //发布版本的地址域名,通常为http://localhost:8080 || http://emenu.pandawork.net
        website: $website,
        //静态资源地址，通常为此项目的resources文件夹地址，此文件夹多以文件服务器的方式存在
        staticWebsite: $staticWebsite,
        //pui地址，提供一套完整的pandawork 前端组件库
        libUrl : $libUrl,
        libTag: '2013-11-05',
        //appTag: new Date().toString(),
        appTag: '2013-11-07',
        //app配置
        pkgs:[{
            name:'page',
            path: $staticWebsite + 'resources/js/cook/app/',
            charset:'utf-8'
        },{
            name: 'io',
            path: $staticWebsite + 'resources/js/cook/app/',
            charset: 'utf-8'
        },{
            name: 'conn',
            path: $staticWebsite + 'resources/js/cook/app/',
            charset: 'utf-8'
        }],
        //组件库的配置参数
        modSettings:{
            dialog:{
                position: 'fixed',
                _x_: true,
                maskOpaticy: .3,
                icon: null,
                top: 100,
                zIndex: 1300,
                themeUrl: $staticWebsite + 'resources/css/cook/common/dialog.css'
            },
            defender: {
                theme: 'inline'
            },
            connector: {
                debug: true,
                //测试数据的地址前缀
                debugUrlPrefix: $staticWebsite,
                // debugUrlPrefix: $staticWebsite + 'test/api-data/',
                //线上发布数据的地址前缀
                // deployUrlPrefix: $website
            },
            upload: {
                flashUrl: $website + 'resources/flash/swfupload_fp10.swf',
                flash9Url: $website + 'resources/flash/swfupload_fp9.swf',
            }
        }
    };
})()
