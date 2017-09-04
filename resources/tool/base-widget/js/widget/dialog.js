/*-----------------------------------------------------------------------------
* @Description:     更适合本项目的dialog
* @Version:         2.0.0
* @author:          cuiy(361151713@qq.com)
* @date             2015.9.6
* ==NOTES:=============================================
* v1.0.0(2015.9.6):
     初始生成
* ---------------------------------------------------------------------------*/
KISSY.add('widget/dialog', function(S){
	var 
		Dialog = PW.mod.Dialog;
	PW.namespace('widget.Dialog');
	PW.widget.Dialog = S.merge(Dialog, {
		alert: function(text, callback, settings){
			var
				that = this,
				html =  '<div class="dlg-alert">';
                html += '<div>'+ ((text) ? text : '暂无内容！') +'</div>',
                html += '</div>',
                cfg = {
                	icon: true,
                	content: html,
                	footer:{
                		btns: [{
                			text: '确定',
                			clickHandler: function(e,me){
                                me.close();
                            }
                		}]
                	},
                	afterClose: function(e, me){
                        if(S.isFunction(callback)){
                            callback.call(me,e,me);
                        }
                    }
                };

            S.mix(cfg, settings);
            return Dialog.client(cfg);
		},
		confirm: function(str, okCb, cancelCb, settings){
            var
                that = this,
                cfg = {
                    header:true, 
                    theme: 'white-confirm', 
                    icon: true
                };
            S.mix(cfg, settings);
            return Dialog.confirm(str, okCb, cancelCb, cfg);
        }
	});
	return Dialog;
},{
	requires: [
		'mod/dialog'
	]
});