/*-----------------------------------------------------------------------------
* @Description: 用户环境探测器 (sniffer.js)
* @Version: 	V1.0.0
* @author: 		simon(406400939@qq.com)
* @date			2013.06.25
* ==NOTES:=============================================
* v1.0.0(2013.06.25):
* 	初始生成 
* ---------------------------------------------------------------------------*/

KISSY.add('mod/sniffer', function(S){

	var 
		UA         = S.UA,
		nav        = navigator,
		sUserAgent = nav.userAgent,
		isWin      = nav.platform == "Win32" || nav.platform == "Windows",
		isMac      = nav.platform == "Mac68K" || nav.platform == "MacPPC" || nav.platform == "Macintosh" || nav.platform == "MacIntel", 
		isUnix     = nav.platform == "X11" && !isWin && !isMac,
		isLinux    = (String(nav.platform).indexOf("Linux") > -1),
		isMobile   = !!sUserAgent.match(/AppleWebKit.*Mobile.*/)||!!sUserAgent.match(/AppleWebKit/),
		isIOS      = !!sUserAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
		isAndroid  = sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('Linux') > -1
		isOther    = !isWin && !isMac && !isUnix && !isLinux,
		shell      = UA.shell,
		core       = UA.core,
		version    = UA[shell],
		isIE       = (shell == 'ie');


	/**
	 * 获取系统版本
	 * @return {String} windows相应版本
	 */
	function getOSVersion(){
		var 
			isWin2K    = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1,
			isWinXP    = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1,
			isWin2003  = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1,
			isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1,
			isWin7     = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;

		if(!isWin) return 'other';
		if(isWin2K){
			return 'win2000';
		}else if(isWinXP){
			return 'winXP';
		}else if(isWin2003){
			return 'win2003';
		}else if(isWinVista){
			return 'winVista';
		}else if(isWin7){
			return 'win7';
		}else{
			return 'old windows';
		}
	}

	Sniffer = {
		browser: {
			shell: 		shell,
			core: 		core,
			version: 	version,
			isFF:  		shell === 'firefox',
			isChrome:   shell === 'chrome',
			isSafari:   shell === 'safari',
			isOpera: 	shell === 'opera',
			isIE: 		isIE,
			isIE6: 		isIE &&　version == '6',
			isIE7: 		isIE &&　version == '7',
			isIE8: 		isIE &&　version == '8',
			isIE9: 		isIE &&　version == '9',
			isIE10: 	isIE &&　version == '10',
			isMobile: 	isMobile
		},
		os: {
			version: 	getOSVersion(),
			isWin: 		isWin,
			isMac: 		isMac,
			isLinux: 	isUnix,
			isUnix: 	isLinux,
			isIOS: 		isIOS,
			isAndroid: 	isAndroid,
			isOther: 	isOther
		},
		screen:{
			color: 		window.screen.colorDepth,
			width: 		window.screen.width,
			height: 	window.screen.height
		}

	};
	//写入到PW中
	S.mix(PW.Env, Sniffer);
	S.Sniffer = Sniffer;
	PW.namespace('mod.Sniffer');
	PW.mod.Sniffer = Sniffer;
	return Sniffer;
},{
	requires:[
		'ua'
	]
})