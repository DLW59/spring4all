/*
* Author:antianlu
* Date:2013-12-05
* Plugin name:jQuery.Contextmenu
* Address：http://www.oschina.net/code/snippet_153403_9880
* Version:0.22
* Email:atlatl333@126.com
* Modify:这次修正了两个问题：1.一个页面支持多个右键菜单，2.在右键菜单上点击右键菜单弹出浏览器菜单问题。
*/
(function(cm){
	jQuery.fn.WinContextMenu=function(options){
		var defaults={
			contextMenuID:'#wincontextMenu',
			offsetX:2,//鼠标在X轴偏移量
			offsetY:2,//鼠标在Y轴偏移量
			speed:300,//特效速度
			flash:!1,//特效是否开启，默认不开启
			flashMode:'',//特效模式,与flash为真时使用
			cancel:!1,//排除不出现右键菜单区域
			items:[],//菜单项
			action:$.noop()//自由菜单项回到事件
		};
		var opt=cm.extend(true,defaults,options);
		function create(e){
			var m=cm('<ul class="WincontextMenu"></ul>').appendTo(document.body);
			cm.each(opt.items,function(i,itm){
				if(itm){
					var row=cm('<li><a class="'+(itm.disable?'cmDisable':'')+'" ref="sitem"><span></span></a></li>').appendTo(m);
					itm.icon?cm('<img src="'+itm.icon+'">').insertBefore(row.find('span')):'';
					itm.text?row.find('span').text(itm.text):'';
					if(itm.action) {
						row.find('a').click(function(){this.className!='cmDisable'?itm.action(e):null;});}
				}
			});
			if(cm(opt.contextMenuID).html()!=null){
				cm(cm(opt.contextMenuID).html().replace(/#/g,'javascript:void(0)')).appendTo(m);}
		
			return m;
		}
		if(opt.cancel){//排除不出现右键菜单区域
				cm(opt.cancel).live('contextmenu',function(e){return false});}
		this.live('contextmenu',function(e){
			var m=create(e).show();
			var WincontextMenus=$(".WincontextMenu");
			var activePanal=$(".sql");
			var activeId=0;
			for(var i=0;i<activePanal.length;i++){
				if($(activePanal[i]).attr("class")=="sql active"){
					activeId=i;
				}else{
					$(WincontextMenus[i]).css("display","none");
				}
			}
			var l = e.pageX + opt.offsetX,
			t = e.pageY+opt.offsetY,
			p={
				wh:cm(window).height(),
				ww:cm(window).width(),
				mh:m.height(),
				mw:m.width()
			}
			t=(t+p.mh)>=p.wh?(t-=p.mh):t;//当菜单超出窗口边界时处理
			l=(l+p.mw)>=p.ww?(l-=p.mw):l;
			m.css({zIndex:1000001, left:l, top:t}).bind('contextmenu', function() { return false; });
			m.find('a').click(function(e){//呼叫新从页面增加的菜单项
				var b=$(this).attr('ref');
			    if(b!='sitem'){this.className!='cmDisable'?opt.action(this):null;}
				e.preventDefault();
			});
			cm(document.body).live('contextmenu click', function() {//防止有动态加载的标签失效问题
			  m.remove();
			});
			return false;
		});
		return this;
	}
})(jQuery);