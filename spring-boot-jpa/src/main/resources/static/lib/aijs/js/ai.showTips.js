/**
 * User: WANGC
 * Date: 12-9-27
 * Time: 下午3:37
 */
AI.showTips = Event.$extend({
	defaultOptions:{
		containerId: 'body>div:first',
		tmpl:'<div class="tip"><div class="char">成功</div><div class="state glyphicon glyphicon-ok"></div><div class="time"></div></div>'
	},
	__init__ : function(options) {
		window.showTips = this;
		var config = $.extend(true,{},  this.defaultOptions,options); ///扩展对象属性
		$(config.tmpl).insertBefore($(config.containerId));
	},
	show:function(count,value,msg){
		$('.tip')[0].style.display = "block";
		$('.tip .time').html(count);
		if(value=="success"){
			$('.tip .char').html(msg);
			$('.tip .state').removeClass("fail");
			$('.tip .state').addClass("success");
		}else{
			$('.tip .char').html(msg);
			$('.tip .state').removeClass("success");
			$('.tip .state').addClass("fail");
		}
		count--;
		if(count==-1){
			$('.tip')[0].style.display = "none";
			return;
		}
		setTimeout(function(){
			window.showTips.show(count,value);
		},1000);
	}
});