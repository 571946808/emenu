(function(){

    var site ={
        website:'/', //站点地址
        staticWebsite: '/', // 前端服务器地址
        puiWebsite: '/resources/tool/pui2/'
    }


    _pw_env = {
        status: 0, //0-前端调试，1-后端调试, 2-后端部署
        website: site.website,
        staticWebsite: site.staticWebsite,
        puiWebsite: site.puiWebsite,
        tag: '',
        pkgs:[
            {
                name: 'pio',
                path: site.staticWebsite + 'resources/js/admin/'
            },
            {
                name: 'widget',
                path: site.staticWebsite + 'resources/tool/base-widget/js/'
            },
            {
                name: 'module',
                path: site.staticWebsite + 'resources/js/admin/'
            },
            {
                name: 'page',
                path: site.staticWebsite + 'resources/js/admin/'
            }
        ],
        //对pui各个组件的一个
        modSettings:{
            notifier: {
                top: 100
            },
            dialog:{
                opacity: 0.5,
                position: 'fixed',
                theme: 'white',
                title: '提示信息',
                width: 600,
                top : 10,
                zIndex: 1001,
                content: '暂无内容！',
                themeUrl: site.staticWebsite + 'resources/tool/base-widget/css/core.css'
            },
            defender:{
                themeUrl: site.staticWebsite + 'resources/tool/base-widget/css/core.css'
            },
            scroll:{
                cursorborderradius: 0,
                cursorcolor: '#3d3d3d'
            },
            pagination: {
                themePackage: {
                    layout: ['first','num','last'],
                    //默认分页样式（定义了五种）
                    themeCss: 'pagination-white',
                    //首页按钮内容显示
                    firstPageTip: '<i class="fa fa-angle-left"></i>',
                    //尾页按钮内容显示
                    lastPageTip: '<i class="fa fa-angle-right"></i>'
                },
                themeUrl: site.staticWebsite + 'resources/tool/base-widget/css/pagination.css'
            },
            tooltip:{
                position: {
                    my: 'tc',
                    at: 'bc' //options: tl,tc,tr, rt,rc,rb, bl,bc,br,lt,lc,lb
                }
            },
            select:{
                themeUrl: site.staticWebsite + 'resources/tool/base-widget/css/select.css'
            },
            // 文件上传swf路径
            upload: {
                swfUrl: site.staticWebsite + 'resources/tool/webuploader/swf/Uploader.swf'
            }
        },
        //统一错误信息入口
        msg:{
            0: '网络加载错误'
        },
        //地址信息
        url:{

        }
    }
})();
