/*-----------------------------------------------------------------------------
* @Description: 有限自动机组件，用于继承到别的对象中以实现自动功能 (fsm.js)
* @Version: 	V3.0.0
* @author: 		Nina(1284663246@qq.com)
* @date			2015.01.04
* ==NOTES:=============================================
* v3.0.0(2015.01.04):
* 	将原组件平滑升级到kissy1.4
* ---------------------------------------------------------------------------*/

KISSY.add('mod/fsm', function(S){

	var	FSM = function(){

		}

	S.augment(FSM, {
			atf: {
				inactive: {}
			},
			currentState: 'inactive',
			unexpetedEvent: 'inactive',
			undefinedState: 'inactive',
			trace: false,
			//设置有限自动机
			setATF: function(o){
				if(S.isObject(o)){
					//todo: 此處喲一個非常嚴重的問題 Important
					//如果我使用S.mix(this.atf, o) 則會出現錯誤
					this.atf = o;
				}
			},
			//设置trace
			setTrace: function(open){
				this.trace = !!open || false;
			},
			drive: function(evt){
				if(S.isString(evt)){
					//避免直接出入type类型的情况
					this.handleEvent({type: evt});
				}
				this.handleEvent(evt);
			},
			handleEvent: function(evt){
				var atf = this.atf[this.currentState][evt.type],
					nextState;
				if(!atf) {	
					S.log('未知事件' + evt.type);		
					atf = this.unexpetedEvent;
				}
				//进行状态转换
				nextState = atf.call(this,evt);
				if(!nextState) {
					S.log('没有下一个状态');
					S.log(evt.type)
					nextState = this.currentState;
				}
				if (!this.atf[nextState]) {
					S.log('状态机无法判断下一个状态');
					nextState = this.undefinedState(evt, nextState);
				}
				if(this.trace){
					S.log(this.currentState + '----[' + evt.type + ']--->' + nextState);
				}
				this.currentState = nextState;
			},
			unexpetedEvent: function(evt){
				return this.initState;
			},
			undefinedState: function(){
				return this.initState;
			},
			doActionTransition: function(anotherState,anotherEventType,evt){
				return this.actionTransitionFunctions[anotherState][anotherEventType].call(this,evt);
			}
		})


	S.FSM = FSM;
	return FSM;


})