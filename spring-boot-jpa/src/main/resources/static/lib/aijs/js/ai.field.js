/*
 * jQuery store - 基本元数据组件
 * 
 * Authors: wangqs
 * Web: http://wangqs/visizemodel/
 * 
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */
  

nameSpaceDef("AI.Field");
nameSpaceDef("AI.ToolBar");
nameSpaceDef("AI.Form");
nameSpaceDef("AI.Action");// 常用操作
nameSpaceDef("AI.FilterBar");

// 重写collapse的hide函数,可以控制收缩的最小高度
if($.fn.collapse){
	$.fn.collapse.Constructor.prototype.setMinHeight = function(height){
		this.minHeight = height;
	};
	$.fn.collapse.Constructor.prototype.hide = function () {
		if (this.transitioning || !this.$element.hasClass('in')) return
		var startEvent = $.Event('hide.bs.collapse')
		this.$element.trigger(startEvent)
		if (startEvent.isDefaultPrevented()) return
		
		
		var dimension = this.dimension()
		
		this.$element[dimension](this.$element[dimension]())[0].offsetHeight
		
		this.$element
		.addClass('collapsing')
		.removeClass('collapse in')
		.attr('aria-expanded', false)
		
		this.$trigger
		.addClass('collapsed')
		.attr('aria-expanded', false)
		
		this.transitioning = 1
		
		var complete = function () {
			this.transitioning = 0
			this.$element
			.removeClass('collapsing')
			.addClass('collapse')
			.trigger('hidden.bs.collapse')
		}
		
		if (!$.support.transition) return complete.call(this)
		
		this.$element
		[dimension](this.options.minHeight || 0)
		.one('bsTransitionEnd', $.proxy(complete, this))
		.emulateTransitionEnd($.fn.collapse.Constructor.TRANSITION_DURATION)
	}
}

/**
 * 常用操作函数封装
 */ 
AI.Action = function() {
 return {
 	 /**
		 * 将带store参数的sql转换为可执行的sql，例如,将select * from tab where id={store1.id}'
		 * and name={store2.area}，转换为select * from tab where id='123' and
		 * name='tab123'
		 * 
		 * @param cfgsql
		 *            待处理的sql语句
		 * @returns 处理后的sql语句
		 */
   dealSqlWithStore:function(cfgsql){
      var sql=cfgsql;
      if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
     
      var i=0;
      while(i<5){
        var oldstr=sql.substring(sql.indexOf("{")+1, sql.indexOf("}"));
        var strArray=oldstr.split('.');
          
        if(strArray.length>=2){
          var tmpStore=ai.getCmp(strArray[0]);
          if(tmpStore && tmpStore.curRecord)
            sql=sql.replaceAll('{'+oldstr+'}',tmpStore.curRecord.get(strArray[1]));
        }
        i++;
     };
 
     return sql;
   },
   /*
	 * select * from tab where id={store1.id}' and name={store2.area}
	 * 某个store的当前记录的值 {username},当前用户 {userarea},当前用户归属的地市
	 * {today},当前日期,{today-1m} {CMPID},对象的ID，如{CITY}
	 */
   /**
	 * 复杂的参数替换，形成最终的运行sql
	 * 
	 * @param cfgsql
	 *            待处理的sql语句
	 * @param paraname
	 *            参数名称
	 * @returns 处理后的sql语句
	 */
   dealSql:function(cfgsql,paraname){// /复杂的参数替换，形成最终的运行sql
   	
	  var sql=cfgsql;
	  if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
	  var strTemp=AI.Action.extractSqlObj(sql);
	  if(!strTemp) return;
	  var containObjs = strTemp.split(",");
	  if(!containObjs && containObjs.length==0) return;
	  for(var i=0;i<containObjs.length;i++){
	  	var objstr=containObjs[i];
	  	if(objstr.indexOf(".")==-1){
	  		  var cmp=ai.getCmp(objstr);
	  		  if(cmp && cmp.getValue()){
	  		  	sql = sql.replace("{"+objstr+"}",cmp.getValue());  
	  		  };
	  	};
	  	 
	  };
	  if(!paraname) paraname='';
	  // /外部参数替换
	  
	  // /用户身份信息替换处理
	     paramMap={};// /外部参数
	     paramUser={};// /用户相关的身份信息
	     paramUser['USERNAME']=_UserInfo.username ||'sys';
	     paramUser['USERCNNAME']=_UserInfo.usercnname || '系统管理员';
	     for(paraname in paramMap){
	  	    sql=sql.replace(new RegExp('{PARAM.'+paraname+'}',"gm"),paramMap[paraname]); 
	     };
	     for(paraname in paramUser){
	        sql=sql.replace(new RegExp('{USER.'+paraname+'}',"gm"),paramUser[paraname]); 
	     };
	    if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
	  // /根据数据对象的参数处理
	  
	  sql=this.dealSqlWithStore(sql);
	  if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
	  
		// /工具栏参数替换
		var caluse = [];
		var where=" ";
		// if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
		while(sql.indexOf("{now.")!=-1){
				var iPos=sql.indexOf("{now.");
				var dt=new Date();
				var format=sql.substr(iPos+5);
				format=format.substr(0,format.indexOf('}'));
				 
			  sql=sql.replaceAll("{now."+format+"}",dt.format(format));
			   
			};
    
		// /组件对象的参数处理
		while(sql.indexOf("{")!=-1 && sql.indexOf("}")!=-1){
		  var newStr=-99999;
		  var oldstr=sql.substring(sql.indexOf("{")+1, sql.indexOf("}"));
		   
		  if(oldstr.indexOf(".")<0){  // 某个组件对象的值
		  	var cmp=ai.getCmp(oldstr);
		  	if(cmp && cmp.getValue){
		  		 newStr=cmp.getValue();
		  	};
		  }
		  else{
				  var strArray=oldstr.split('.');
				  if(strArray[1]=='getwhere'){
				     var cmp=ai.getCmp(strArray[0]);
				     if(cmp && cmp.getValue)newStr=cmp.getwhere();
		  	     else newStr=' 1=1 '
				  }
				  else{
				    var store=ai.getCmp(strArray[0]);
				    if(store){// //store
				    	 if(store.curRecord) record=store.curRecord
				    	 else if(store.getCount()>0) record=store.getAt(0);
				    	 if(record){
				    	 	 newStr=record.get(strArray[1]);
				    	};
				    }
				 }
		   }
		  sql=sql.replace("{"+oldstr+"}",newStr);
		}
		return sql;
   },
   /**
	 * 检查字符串是否含有中文
	 * 
	 * @param str
	 *            待检查的字符串
	 * @returns 包含中文true/不包含false
	 */
   checkChina:function(str){ // /检查是否含有中文，存在则返回false
		 
			if(/.*[\u4e00-\u9fa5]+.*$/.test(str)) 
			{ 
			   return true; 
			} 
			return false; 
   }, 
   /**
	 * 根据输入字符串中,提取{}内的变量，变量之前用逗号分隔：输入ssss{aaa}agdsa{bbb}，输出aaa,bbb
	 * 
	 * @param sql
	 *            待处理的sql语句
	 * @returns 提取的结果
	 */
   extractSqlObj:function(sql){  // /根据脚本中,提取{}的变量
	    var i=0;
	    var result="";
      while(i<10){
        var oldstr=sql.substring(sql.indexOf("{")+1, sql.indexOf("}"));
        if(oldstr){ 
        	if(!result) result=oldstr
        	else result+=","+oldstr;
          sql=sql.replaceAll('{'+oldstr+'}',"");
       }
        i++;
     };
     return result;
   },
   /**
	 * 按钮点击时候根据输入函数类型和函数参数进行处理
	 * 
	 * @param clickfun
	 *            按钮点击时函数类型
	 * @param clickpara
	 *            按钮点击函数执行参数
	 * @param befoeSaveFn
	 *            暂时没有用
	 * @param cfg
	 *            暂时没有用
	 */
   actFun:function(clickfun,clickpara,befoeSaveFn,cfg){
   	 	 
	  var objs= clickpara.split(',');
	  if( clickfun=='refresh'){
    for(var i=0;i<=objs.length;i++){
	   	this.RefreshView(objs[i]); 
	   } 
	  }
 
	else if( clickfun=='openmodel'){
		var _url=this.DealSql(clickpara);
		 
		_url=_url.replaceAll('%&',',');
		Asiainfo.ShowWin('信息',_url)
	}
	else if( clickfun=='openwin'){
		var _url=this.DealSql(clickpara);
		var paras=_url.split(',')
		for(var i=0;i<paras.length;i++){
			if(typeof paras[i] == 'string')
				paras[i]=paras[i].replaceAll('%&',',');
		}
		if(paras.length==3)Asiainfo.addTabSheet(paras[0],paras[1],paras[2])
		else if(paras.length==1)Asiainfo.addTabSheet(this.getId(),'详细',_url)
	}
	else if( clickfun=='openoutwin'){
		var _url=this.DealSql(clickpara);
		window.open(_url); 
	}
	else if( clickfun=='wizard'){
		var paras=clickpara.split(',')
		var wizCmp=Ext.getCmp(paras[0]);
		if(!wizCmp) return;
		if(paras[1]=='next') wizCmp.onNextClick()
		else if(paras[1]=='pre') wizCmp.onPreviousClick()
		else if(paras[1]=='finish') wizCmp.onFinish()
		else wizCmp.setActiveStep(parseInt(paras[1]));
	}
	else if( clickfun=='save'){
		for(var i=0;i<objs.length;i++){
		  if(Ext.StoreMgr.get(objs[i]))
		  Ext.StoreMgr.get(objs[i]).commit() ;
			// if(_main.CompMgr.dsArray[objs[i]])_main.CompMgr.dsArray[objs[i]].commit();
		}
	}
	
	else if( clickfun=='upstore'){
		 
		 var _ds=minderGraph.allWidget[objs[0]].getStore();
	   
	  var newSql = AI.Action.dealSql(_ds.oldsql);
	  if(newSql!=_ds.oldsql){
	   
	  	_ds.select(newSql);
	  };
	  
	}
	else if( clickfun=='query'){
		 var _ds=ai.getCmp(objs[0]);
		 if(!_ds){alert("查询参数第一个变量storeID,找不到对象或没有指定");return false};
	   
	   var newSql = _ds.oldsql ;
	   
	   var _aitbar=ai.getCmp(objs[1]);
	   
	   if(_aitbar){ 
	   	var where = _aitbar.getWhere()+"";
	   	// alert("查询参数第二个变量为工具栏ID,找不到对象或没有指定");
	   	
	   	if(where && where.length>5){
	   	   if(newSql.toLowerCase().indexOf(" where ")>0) 
	   	     newSql = newSql+" and " +where
         else 
         	 newSql =newSql+" where "+where;
      };
	   };
	   
	   
	  newSql = AI.Action.dealSql(newSql);
	   
	 
	  if(newSql!=_ds.oldsql){
	  	_ds.select(newSql);
	  };
	  
	}
	else if( clickfun=='add'){
		var _ds=Ext.StoreMgr.get(objs[0]);
		if(!_ds) return ;
		var rec=_ds.getNewRecord();
		_ds.add(rec);
		// dataManager.fresh(_ds,null,_ds.itemindex);
	}
	else if( clickfun=='delete'){
		 
		var _ds =  Ext.StoreMgr.get(objs[0]);
		var commitFlag = objs[1];

		if(!_ds)return ;
		Ext.Msg.confirm('信息','确定要删除当前记录吗?',function (btn){

			if(btn=='yes'){
				var rec=_ds.curRecord;
				if(rec){
					_ds.remove(rec);
					if(commitFlag && commitFlag=='true') _ds.commit(false);
					dataManager.fresh(_ds,null,_ds.itemindex);

				}
	
			}

		})
	}
	else if( clickfun=='help'){
	   Asiainfo.ShowWin('帮助信息','../forum/help.html?MODELCODE='+Asiainfo.GerUrlInfo(window.location,'Pathname'))
	}
	else if( clickfun=='pickobj'){

		baseFun.loadScript("../asiainfo/form/searchWin4.js");

		try{

			eval(this.clickpara);

		}catch(e){

			alert('按钮配置错误'+this.text+','+this.clickpara);

		}
		mywin=searchWin.init(funAftPickTo,_main.CompMgr.DealSql(this.listvalue))

	}
	else if( clickfun=='expdata'){
           if(ai.getCmp(objs[0])) this.expData(ai.getCmp(objs[0]));
	} 
   },
   /**
	 * 刷新视图函数
	 * 
	 * @param objcode
	 *            需要刷新的对象，可以是store，也可以是组件
	 */
   RefreshView : function(objcode){
   	 
   	   if(!objcode) return;
   	   
   	   var store = Ext.StoreMgr.get(objcode);
   	   
    	   if(store){
    	  
    	    var newsql=this.DealSql(store.oldSql,store.paraname);
	       
	    if (newsql!=store.sql){
		     store.updateSql(newsql);
		     store.select();
	     };
	     if(store.cmps && store.cmps.length>0){
		   
		   for(var i=0;i<store.cmps.length;i++){
		   	if(store.cmps[i].RefreshView) store.cmps[i].RefreshView(); 
		   }
		}
	   }
	   else {
	   var cmp=Ext.getCmp(objcode);
	   if(cmp && cmp.RefreshView){
	      cmp.RefreshView();
	   }
	   else if(cmp && cmp.mgrCmp &&  cmp.mgrCmp.RefreshView){
	   	cmp.mgrCmp.RefreshView();
	   }
	}
   },
  /**
	 * 将查询结果集导出成execl文件
	 * 
	 * @param gd_result
	 *            查询结果集
	 */
  expData:function(gd_result){
  	
  	var cm = gd_result.config.columns;
	var cmLen = cm.length;
	var cmHeader = [];
	var dataIndex=[];
	var start=0;
	var exportSql = gd_result.exportSql || gd_result.store.sql.replace(/@/g,'+').replace(/\$/g,'&'); 
	var dataSource = gd_result.store.dataSource || '';
	var fieldmap=gd_result.store.map;
	var fieldmapStr="";
	if(fieldmap) fieldmapStr = ai.encode(fieldmap);
 
	// if(cm.getColumnHeader(0).indexOf('x-grid3-hd-checker') == -1) start=0;
	// for(var i=start;i<cmLen;i+=1){
	// dataIndex.push(cm[i].name);
	// };
	for(var i=start;i<cmLen;i+=1){
		if(cm[i].display != 'none'){
			var header ={};
			header["dataIndex"] = cm[i].dataIndex;
			header["label"] = cm[i].header;
			cmHeader.push(header);
		}
	};
 	
	this.FormSubmit('/'+contextPath+'/ve/download',{
		sql:exportSql,
		dataSource:dataSource,
		header:ai.encode(cmHeader),
		fileName:"DATA_"+new Date().format("yyyymmddhhmmss"),
		fileType:"excel"
	});
  },
  /**
	 * 模拟表单提交，经常用于下载所用
	 * 
	 * @param url
	 *            提交地址
	 * @param params
	 *            表单参数
	 */
  FormSubmit : function(url,params){ // /模拟表单提交，经常用于下载所用
	// 手工创建form表单
	var submitForm = document.createElement("FORM");
	// 手工放置在body中
	document.body.appendChild(submitForm);
	// 设置提交方式
	submitForm.method = "POST";
	// 在表单中设置参数
	for(var key in params){
		var value = params[key];
		var arr = [];
		if(typeof value=='string'){
			arr.push(value);
		}else{
			arr = value;
		}
		for(var i=0,l=arr.length;i<l;i+=1){
			var newElement = document.createElement("input"); 
			newElement.type='hidden';
			newElement.name = key;
		 	submitForm.appendChild(newElement);
		 	newElement.value = (arr[i]);
		}
	}
	// 手工设置提交地址
	submitForm.action=url;
	// 手工提交
 	submitForm.submit();
  }
}}();
 
 /**
	 * 工具栏组件
	 * 
	 * @param config
	 *            工具栏界面配置参数
	 * 
	 * 参数说明： id : html元素id containerId : 容器id items :
	 * 工具栏items配置，每个item均为FormField类型，具体参数参见AI.FORM说明
	 * 
	 * 使用例子： var toolbar = new AI.Toolbar({ id:'toolbar',
	 * containerId:'toolbarDiv', items:[
	 * {type:'combox',labelHidden:true,label:'数据库名',fieldName:"DBNAME",id:'T_DBNAME',width:100,checkItems:'DATANAME',storesql:"select
	 * distinct dbname,cnname from metadbcfg",where:" dbname = '{T_DBNAME}'"},
	 * {type:'text',placeholder:'占位符',label:'表名',id:'T_DATANAME',fieldName:"F_DBNAME",caseType:'upper',where:"
	 * DATANAME like '%{T_DATANAME}%'"},
	 * {type:'button',label:'查询',id:'query',clickfun:ruleQuery} ] });
	 */
AI.Toolbar=function(config){
// ai.registerCmp(config.id||(new Date().getTime()),this);
	this.config=config;
	this.fields=[];
	var containerId = config.containerId;
	$('#'+containerId).addClass("toolbar");
	$('#'+containerId).append('<ul id="ul_'+containerId+'" class="nav navbar-nav"></ul>'); 
	for(var i=0;i<config.items.length;i++){
		var item = config.items[i];
		item.containerId ='ul_'+ containerId;
		item.parent = this;
		item.parenttype='toolbar';
		if(!item.width) item.width = 150;
		this.fields.push(new AI.FormField(item));
	};
	//$('#'+containerId).append('<br><div class="line line-dashed b-b line-lg pull-in" style="margin-left:20px;margin-right:20px;"></div>');
};
 
/**
 * 获取某个字段的值
 * 
 * @param fieldName
 *            字段名称
 */
AI.Toolbar.prototype.getFieldVal=function(fieldName){
	var result = "";
	for(var i=0;i<this.fields.length;i++){
		var field = this.fields[i];
		if(field.id == fieldName){
			 result = field.getValue();
		}
	}
	return result;
};
/**
 * 调用字段值变化的回调函数
 * 
 * @param fieldName
 *            字段名称
 * @param newVal
 *            新的值
 */
AI.Toolbar.prototype.fieldChange=function(fieldName,newVal){
	 if(this.config.fieldChange){
	 	this.config.fieldChange(fieldName,newVal);
	 };
};
/**
 * 获取所有字段的值
 * 
 * @param fieldName
 *            字段名称
 * @returns 包含所有字段值的对象数组
 */
AI.Toolbar.prototype.getAllFieldValue=function(){// /得到当前所有字段的值
	var result={};
	for(var i=0;i<this.fields.length;i++){
		 var field=this.fields[i];
		 var id = field.id || field.fieldName;
		 if(field.config.type=='button') continue;
		 result[id]=field.getValue();
		 if((field.type == 'daterange' || field.type == 'fulldaterange') && field.val){
			 var values = field.val.split(' - ');
			 result[id+"_MIN"]=values[0];
			 result[id+"_MAX"]=values[1];
		 }
	};
	return result;
};
/**
 * 得到当前所有字段的where语句
 * 
 * @returns 拼接后的where语句
 */
AI.Toolbar.prototype.getWhere=function(){// /得到当前所有字段的值
	  var caluse=[];
		for(var i=0;i<this.fields.length;i++){
			var field=this.fields[i];
			 
      if(!field.config) continue;
      if(!field.config.where) continue;
			var fdVal=field.getValue()||field.getRawValue();
			if(!fdVal)continue;
			fdVal=fdVal.trim();
			if(!fdVal ||fdVal=="") continue;
	  if(fdVal&&field.config.type=='date')fdVal=new Date(fdVal).format('y-m-d');
      if(field.cofing&&field.cofing.caseType=='upper') fdVal=fdVal.toUpperCase()
      if(field.cofing&&field.cofing.caseType=='lower') fdVal=fdVal.toLowerCase();
      	    fdVal=fdVal.trim();
			if(fdVal!='all' && fdVal!='所有')
			  caluse.push(field.config.where.replace('{'+field.id+'}',fdVal).replace('{'+field.id+'}',fdVal).replace('{'+field.id+'}',fdVal));
		}
		var where=" ";
		if(caluse.length!=0)where+=' '+caluse.join(' and ')
	 
	 
		return where;
	  
};
/**
 * 查询筛选条件组件
 * @param config   配置参数
 * 说明:
 * 			id:查询筛选条件组件的唯一编号
 * containerId:页面Dom的Id
 * 		 store:筛选绑定的store
 * 		 items:工具栏items配置，每个item均为FormField类型，是具体参数参见AI.FORM说明
 * 另外说明:
 * 查询筛选组件没有对FormField组件类型做判断,原则是可以配置button,但是此组件主要是为了解决查询条件比较多的时候查询条件与button放在一起影响界面这个问题,
 * 建议不要使用button类的
 * 使用例子:
 * new AI.FilterBar({
 *		id:"grid-filter",
 *		containerId:"filter",
 *		store:store,
 *		items:[
 *			{type:'text',label:'表名',fieldName:'DATANAME'},
 *			{type:'text',label:'表中文名',fieldName:'DATACNNAME'},
 *			{type:'combox',label:'数据库',fieldName:'DBNAME',storesql:"apiService:list_metadb"}
 *		]
 *	});
 */
AI.FilterBar = function(config){
	this.config=config;
	this.store =config.store;
	this.containerId = config.containerId;
	this.containerEl = $("#"+this.containerId);
	this.queryClickFun = config.queryClickFun;
	this.resetClickFun = config.resetClickFun;
	this.id = config.id || containerId+"-filter";
	this.init();
}

AI.FilterBar.prototype.init = function(){
	var that = this;
	var filterBarHtml = '<div id="'+this.id+'" class="filter-contrainer">'+
						'	<div id="'+this.id+'-filterCond" class="filter-select collapse"></div>'+
						'	<div class="filter-button">'+
						'		<span class="fa fa-search query">&nbsp;查询</span>'+
						'		<span class="fa fa-repeat reset">&nbsp;重置</span>'+
						'	</div>'+
						'</div>';
	this.containerEl.append(filterBarHtml);
	this.toolbar = new AI.Toolbar({
		id:this.id+"-toolbar",
		containerId:this.id+"-filterCond",
		items:this.config.items
	});
	
/*	先不实现收缩
 * var filter_select = this.containerEl.find(".filter-select");
	filter_select.data("minHeight",this.containerEl.find(".toolbar ul li").height()+8);
	filter_select.height(this.containerEl.find(".toolbar ul li").height()+8);
	
	if(filter_select[0].scrollHeight/filter_select[0].offsetHeight < 2){
		this.containerEl.find(".filter-collapse").addClass("hidden");
	}
	
	var filter_collapse = this.containerEl.find(".filter-collapse");
	this.containerEl.find(".filter-select").on("show.bs.collapse",function(){
		filter_collapse.removeClass("fa-chevron-circle-down");
		filter_collapse.addClass("fa-chevron-circle-up");
	})
	
	this.containerEl.find(".filter-select").on("hide.bs.collapse",function(){
		filter_collapse.removeClass("fa-chevron-circle-up");
		filter_collapse.addClass("fa-chevron-circle-down");
	})
	
	this.containerEl.find(".filter-select").collapse('show');*/
	
	if(typeof this.resetClickFun != "function"){
		this.containerEl.find(".filter-button .reset").on("click",function(){
			ai.wirteOperationLog("button","重置");
			that.resetFilterValue();
		})
	}else{
		this.containerEl.find(".filter-button .reset").on("click",that.resetClickFun);
		ai.wirteOperationLog("button","重置");
	}
	
	if(typeof this.queryClickFun != "function"){
		this.containerEl.find(".filter-button .query").on("click",function(){
			ai.wirteOperationLog("button","查询");
			var fieldValue = that.toolbar.getAllFieldValue();
			if(fieldValue){
				var _paramValue={};
				//去掉空值
				$.each(fieldValue,function(key,value){
					if(value.trim()!=''&&value!=null){
						_paramValue[key] = value;
					}
				})
				that.store.select({"param":_paramValue});
			}
		})
	}else{
		this.containerEl.find(".filter-button .query").on("click",that.toolbar.getAllFieldValue(),that.queryClickFun);
		ai.wirteOperationLog("button","查询");
	}
}

/*
 * 重置所有的查询条件
 */
AI.FilterBar.prototype.resetFilterValue = function() {
	this.containerEl.find("#"+this.id+"-filterCond").empty();
	this.toolbar = new AI.Toolbar({
		id:this.id+"-toolbar",
		containerId:this.id+"-filterCond",
		items:this.config.items
	});
	this.containerEl.find(".filter-button .query").click();
}

/**
 * 窗口组件
 * 
 * @param config
 *            窗口界面配置参数
 * 
 * 参数说明： id : html元素id containerId : 容器id store : 定义表单操作的数据源 fieldChange :
 * 定义表单中元素的值变化时触发的事件 items : 每个item均为FormField类型
 * 
 * 使用例子： var formcfg = ({ id:"form", store:ds_mydata,
 * containerId:'genaral_modal_content', items:[ {type : 'text',label :
 * 'JOB编号',notNull : 'y',isReadOnly : 'y',storesql : '',fieldName :
 * 'XMLID',width : '350',tip : ''}, {type : 'text',label : 'JOB名称',notNull :
 * 'y',isReadOnly : '',storesql : '',show : !isAdd,fieldName : 'JOBNAME',width :
 * '350',tip : ''}, {type : 'text',label : '类',notNull : 'y',isReadOnly :
 * '',storesql : '',show : !isAdd,fieldName : 'CLAZZ',width : '350',tip : ''},
 * {type : 'text',label : '方法',notNull : 'y',isReadOnly : '',storesql : '',show :
 * !isAdd,fieldName : 'METHOD',width : '350',tip : ''}, {type : 'textarea',label :
 * '参数结构',notNull : 'y',isReadOnly : '',storesql : '',show : !isAdd,fieldName :
 * 'PARAMSTRUCT',width : '350',tip : '定义参数结构'}, {type : 'combox',label :
 * '状态',notNull : 'y',isReadOnly : '',storesql : '1,有效|2,无效',show :
 * !isAdd,fieldName : 'JOBSTATUS',width : '350',tip : ''} ] }); var from = new
 * AI.Form(formcfg); formField配置信息包括： type :
 * 支持类型有text,password,textfield,hidden,text-button,file,radio,radio-custom,checkbox,textarea,combox,mulitselect,mulitLevel,mulitselect2,selectList,selecttree,
 * date,daterange,color,html,imgpicker,button,buttongroup,dropmenu,selbox,mapbox,pick-grid,seltag,card,wysiwyg,label
 * label : 元素名称 notNull : 是否非空值(Y：允许空/N：不允许空) isReadOnly : 定义是否只读，“y”是只读，“n”是可写
 * labelHidden: true|false  true隐藏label
 * placeholder:占位符，暂只修改了text,combox,date,daterange
 * maxDate,minDate:daterange时间区间组件专用，限制时间区间的范围
 * storesql : 定义参数，例如使用combox时需要指定选项，配置形式主要有两个类型，sql语句和常量字符串，例如“select col from
 * tab”只定义了一个字段，对应选项的值和名称都是col； “select col1，col2 from
 * tab“定义了两个字段,那么选项的值为col1，名称为col2；
 * 再看常量字符串的写法，“1,2”,”1,是|0,否”，同样地，前者的值和名称是一致的，而后者，在页面上显示的名称是“是”和“否”，对应表中的值则是“1”和“0”
 * fieldName : 定义字段名称 width : 定义元素的宽度 value ：定义默认值 tip : 定义显示的备注 checkItems
 * ：定义关联字段，通常意义上指本元素发生变化时会影响到的其他元素，通过checkItems的配置，检查本元素的变化会影响到的其他元素，填写其他元素的fieldName，当出现多个影响元素时，使用逗号分割
 * 例如：checkItems:'TABLIST,APILIST' dependencies
 * ：定义关联字段，配置于被影响元素中，表示当其他元素值变化时，本元素是否显示，例如：“｛val｝＝＝1”表示当关联字段的值为“1”时本元素显示否则隐藏。
 * 示例1，A元素的值达到一定条件，则B元素显示，否则B元素不显示，配置A元素的checkItems的值为’B’，配置B元素的dependencies的条件为’｛val｝＝＝1’，意为当A的值为1的时候，B元素显示，否则B元素隐藏，配置如下： {
 * type: 'text', label: 'A', fieldName: 'A', checkItems: 'B' },{ type: 'text',
 * label: 'B', fieldName: 'B', dependencies: '{val}==1', }
 * 示例2，B元素的取值范围受A元素值的影响，A元素的checkItems设置为B，并在B元素的配置中将storesql配置如下，当A值变化时，会替换B元素配置的storesql，从而改变B元素的options（B元素配置为combox），配置如下： {
 * type: 'text', label: 'A', fieldName: 'A', checkItems: 'B' },{ type: 'combox',
 * label: 'B', fieldName: 'B', storesql: "" }
 * 
 * 
 */
AI.Form=function(config){
	this.fields=[];
	this.config = config;
	if(!config.labelColSpan)config.labelColSpan=2;
	this.store=config.store;
	var containerId = config.containerId;
	$('#'+containerId).empty().addClass("form-horizontal");

	if(this.config.itemsSql){
		this.getFieldsFromStoreSql();
	}
	
	if(config.useFieldSets){
		config.fieldsets = this.formatFieldsets();
	}

	if(config.fieldsets && config.fieldsets.length>0){
		for(var i=0;i<config.fieldsets.length;i++){
			var fieldset = config.fieldsets[i];
			var icon = fieldset.defaultShow==false?"plus":"minus";
			var $setBlock = $('<fieldset id="'+containerId+'_set_'+i+'"> '
					+'<legend  style="font-size:15px; color:#788188;cursor:pointer">'
						+'<a href = "#"><span class="glyphicon glyphicon-'+icon+'" aria-hidden="true"></span> </a> '
						+fieldset.legend
					+' </legend>'
					+'<div id="'+containerId+'_items_'+i+'" class="fieldset-ul"></div>'
				+'</fieldset>').appendTo($('#'+containerId));
			for(var j=0;j<fieldset.items.length;j++){
				var item = fieldset.items[j];
				item.containerId = containerId+'_items_'+i;
				item.parenttype='form';
				item.parent = this;
				if(!item.labelColSpan) item.labelColSpan=config.labelColSpan||2;
				this.fields.push(new AI.FormField(item));
			}
			if(fieldset.defaultShow==false){
				$setBlock.find('.fieldset-ul').addClass('hide');
			}
			$("legend",$setBlock).click(function(){
				var $collapseDiv = $("span",$(this));
				$collapseDiv.toggleClass("glyphicon-minus").toggleClass("glyphicon-plus");
				$(this).parent().find('.fieldset-ul').toggleClass('hide');
			});
		};
	}else if(config.rownums && config.rownums.length > 0){
		for(var i=0;i<config.rownums.length;i++){
			var rownum = config.rownums[i];
			
			var $rowhtml = $('<div class="row table-bordered" id="'+containerId+'_row_'+i+'"></div>').appendTo($('#'+containerId));
			var rowWidthAvg = 0;
			if(rownum.items.length > 0){
				rowWidthAvg = (100/rownum.items.length).toFixed(4);
			}
			var rowWidthLast = Number(Number(rowWidthAvg)+(100 -(rowWidthAvg*rownum.items.length))).toFixed(4) ;
			for(var j = 0;j <rownum.items.length;j++){
				if(j == rownum.items.length-1){
					var $rowdiv = $('<div id="row_'+i+'_'+j+'" class="col-sm-2" style="padding-top:10px;border-right: 1px solid #ddd;width:'+rowWidthLast+'%"></div>').appendTo($rowhtml);
				}else{
					var $rowdiv = $('<div id="row_'+i+'_'+j+'" class="col-sm-2" style="padding-top:10px;border-right: 1px solid #ddd;width:'+rowWidthAvg+'%"></div>').appendTo($rowhtml);
				}
				
				var item = rownum.items[j];
				item.containerId = 'row_'+i+'_'+j;
				item.parenttype='form';
				item.parent = this;
				if(!item.labelColSpan) item.labelColSpan=config.labelColSpan||2;
				this.fields.push(new AI.FormField(item));
			}
		}
	}else if(config.isSqlForm){
		for(var i=0;i<config.items.length;i++){
			var item = config.items[i];
			if(!item) continue;
			item.containerId = containerId;
			item.isSqlForm = config.isSqlForm;
			item.parent = this;
			item.parenttype='form';
			if(!item.labelColSpan) item.labelColSpan=config.labelColSpan||2;
			if(config.cardType&&config.cardType==true){item.type='card';}
			this.fields.push(new AI.FormField(item));
		}
	}else{
		var colWidth = 1;
		for(var i=0;i<config.items.length;i++){
			if(Object.prototype.toString.call(config.items[i]) === '[object Array]'
				&&config.items[i].length>colWidth){
				colWidth = config.items[i].length;
			}
		}
		colWidth = parseInt(12/colWidth);
		for(var i=0;i<config.items.length;i++){
			var item = config.items[i];
			if(!item) continue;
			var $row = $('<div class="row" id="'+containerId+"_"+i+'"  style="margin-left:0px;margin-right:0px;"></div>').appendTo($('#'+containerId));
			if(Object.prototype.toString.call(item) === '[object Array]'){
				for(var j=0;j<item.length;j++){
					var colItem = item[j];
					var colId = containerId+"_"+i+"_"+j;
					$row.append('<div class="col-sm-'+colWidth+'" id="'+colId+'"></div>');
					colItem.containerId = colId;
					colItem.parent = this;
					colItem.parenttype='form';
					if(!colItem.labelColSpan) colItem.labelColSpan=config.labelColSpan||2;
					if(config.cardType&&config.cardType==true){colItem.type='card';}
					this.fields.push(new AI.FormField(colItem));
				}
			}
			else{
				var colId = containerId+"_"+i+"_"+0;
				$row.append('<div class="col-sm-'+colWidth+'" id="'+colId+'"></div>');
				item.containerId = colId;
				item.parent = this;
				item.parenttype='form';
				if(!item.labelColSpan) item.labelColSpan=config.labelColSpan||2;
				if(config.cardType&&config.cardType==true){item.type='card';}
				this.fields.push(new AI.FormField(item));
			}
		}
  }
};
/**
 * 格式化fieldset标签元素
 */
AI.Form.prototype.formatFieldsets =function(){
	var items = this.config.items||[],
		sets = [];
	for(var i=0;i<items.length;i++){
		var isLegendExist = false;
		for(var j=0;j<sets.length;j++){
			if(items[i]['fieldset']==sets[j]['legend']){
				sets[j]['items'].push(items[i]);
				isLegendExist = true;
			}
		}
		if(!isLegendExist){
			sets.push({
				legend:items[i]['fieldset'],
				items:[items[i]]
			});
		}
		if(sets.length==0){
			sets.push({
				legend:items[i]['fieldset'],
				items:[items[i]]
			});
		}
	}
	return sets;
};
/**
 * 从数据库获取表单字段配置信息
 */
AI.Form.prototype.getFieldsFromStoreSql =function(){
	var formCfgStore = new AI.JsonStore({
	    sql: this.config.itemsSql,
	    table: this.config.itemsDB||'METAOBJCFG',
	    loadDataWhenInit: true,
	    pageSize:-1
	});
	var attrArray = formCfgStore.root;
	var formItems = [];
	for (var i = 0; i < attrArray.length; i++) {
	    var attrItem = attrArray[i];
	    defaultwidth = 220;
	    var editFlag = '';
	    if (attrItem.INPUTTYPE == 'textarea') defaultwidth = 420;
	    if (attrItem.INPUTTYPE == 'pick-grid') defaultwidth = 320;
	    if (attrItem.INPUTTYPE == 'check') attrItem.INPUTTYPE = 'checkbox';
	    if (attrItem.INPUTTYPE == 'combo') attrItem.INPUTTYPE = 'combox';
	    if (!attrItem.INPUTTYPE) attrItem.INPUTTYPE = 'text';
	    var readonly="";
	    var formItem = {
	    	fieldset:attrItem.ATTRGROUP ||null,
	        type: attrItem.INPUTTYPE || 'text',
	        label: attrItem.ATTRCNNAME,
	        notNull: attrItem.ISNULL || 'Y',
	        isReadOnly:attrItem.SELMODEL=='readOnly'?true:false,
	        storesql: attrItem.INPUTPARA,
	        fieldName: attrItem.ATTRNAME,
	        width: defaultwidth,
	        tip: attrItem.REMARK,
	        isEditable:editFlag,
	        value: attrItem.SELVAL,
	        dependencies: attrItem.DEPENDENCIES,
	        checkItems: attrItem.CHECKITEMS
	    };
	    formItems.push(formItem);
	};
	this.config.items = formItems;
};
/**
 * 重建表单字段
 * 
 * @param fieldName
 *            表单字段名称
 * @param fieldConfig
 *            新的表单字段配置信息
 */
AI.Form.prototype.rebuildField=function(fieldName,fieldConfig){
	for(var j=0;j<this.config.items.length;j++){
		var item = this.config.items[j];
		if(item.fieldName==fieldName){
			item = fieldConfig||item;
			item.containerId = 'set_'+i;
			item.parent = this;
			this.fields[j]=new AI.FormField(item);
		}
	};
};
/**
 * 表单字段值变化处理：更新store中curRecord对应字段的值，并调用回调函数
 * 
 * @param fieldName
 *            表单字段名称
 * @param newVal
 *            新的表单字段值
 */
AI.Form.prototype.fieldChange=function(fieldName,newVal){
	  if(this.store && this.store.curRecord){
	  		if(fieldName.indexOf('--')>-1){
	  			var _fieldname = fieldName.split('--')[0];
	  			var _key = fieldName.split('--')[1];
	  			var _record = this.store.curRecord.get(_fieldname);
	  			var changeVal = {};
	  			changeVal[_key] = newVal;
	  			_record = (typeof _record === 'undefined') ? {} : JSON.parse(_record);
	  			var _value = $.extend(_record,changeVal);
	  			this.store.curRecord.set(_fieldname,JSON.stringify(_value));
	  		}else{
	  			this.store.curRecord.set(fieldName,newVal);
	  		}
	   		
	 	}; 
	 if(this.config.fieldChange){
	 	this.config.fieldChange(fieldName,newVal);
	 };
	
};
/**
 * 获取所有表单字段的值
 * 
 * @returns 包含所有字段值的对象数组
 */
AI.Form.prototype.getAllFieldValue=function(){// /得到当前所有字段的值
	var result={};
	for(var i=0;i<this.fields.length;i++){
		 var field=this.fields[i];
		 try{
		 	field.val=field.getValue();
		 }catch(e){
		 	console.log(e);
		 }
		 if(field.config.type=='button') continue;
		 result[field.fieldName]=field.val;
		 if(field.type == 'daterange'  && field.val){
		 	 alert(field.val);
			 var values = field.val.split(' - ');
			 result[field.fieldName+"_MIN"]=values[0];
			 result[field.fieldName+"_MAX"]=values[1];
		 }
	};
	return result;
};
/**
 * 获取某个表单字段的值
 * 
 * @param fieldName
 *            字段名称
 * @returns 表单字段的值
 */
AI.Form.prototype.getFieldValue=function(fieldName){// /得到当前所有字段的值
	for(var i=0;i<this.fields.length;i++){
		 var field=this.fields[i];
		 if(field.id==fieldName) return field.val;
	};
	return "";
};

/**
 * 刷新Form，根据store.curRecord，刷新所有表单字段值
 */
AI.Form.prototype.refresh = function(){
	for(var i=0;i<this.fields.length;i++){
		this.fields[i].refresh();
	};
};

/**
 * 表单字段初始化处理
 * 
 * @param config
 *            表单字段配置信息
 * 
 * 配置信息包括： type :
 * 支持类型有text,password,textfield,hidden,text-button,file,radio,radio-custom,checkbox,textarea,combox,mulitselect,mulitLevel,mulitselect2,selectList,selecttree,
 * date,daterange,color,html,imgpicker,button,buttongroup,dropmenu,selbox,mapbox,pick-grid,seltag,card,wysiwyg,label
 * label : 元素名称 notNull : 是否非空值(Y：允许空/N：不允许空) isReadOnly : 定义是否只读，“y”是只读，“n”是可写
 * storesql : 定义参数，例如使用combox时需要指定选项，配置形式主要有三个类型，sql语句、常量字符串及apiService，
 * 			sql语句：“select col from tab”只定义了一个字段，对应选项的值和名称都是col； 
 * 					“select col1，col2 from tab“定义了两个字段,那么选项的值为col1，名称为col2；
 *         常量字符串：“1,2”,”1,是|0,否”，同样地，前者的值和名称是一致的，而后者，在页面上显示的名称是“是”和“否”，对应表中的值则是“1”和“0”
 *         apiService："apiService:apiId",apiId为tbl_api_conf.api_code的值
 * fieldName : 定义字段名称 width : 定义元素的宽度 value ：定义默认值 tip : 定义显示的备注 checkItems
 * ：定义关联字段，通常意义上指本元素发生变化时会影响到的其他元素，通过checkItems的配置，检查本元素的变化会影响到的其他元素，填写其他元素的fieldName，当出现多个影响元素时，使用逗号分割
 * 例如：checkItems:'TABLIST,APILIST' dependencies
 * ：定义关联字段，配置于被影响元素中，表示当其他元素值变化时，本元素是否显示，例如：“｛val｝＝＝1”表示当关联字段的值为“1”时本元素显示否则隐藏。
 * 示例1，A元素的值达到一定条件，则B元素显示，否则B元素不显示，配置A元素的checkItems的值为’B’，配置B元素的dependencies的条件为’｛val｝＝＝1’，意为当A的值为1的时候，B元素显示，否则B元素隐藏，配置如下： {
 * type: 'text', label: 'A', fieldName: 'A', checkItems: 'B' },{ type: 'text',
 * label: 'B', fieldName: 'B', dependencies: '{val}==1', }
 * 示例2，B元素的取值范围受A元素值的影响，A元素的checkItems设置为B，并在B元素的配置中将storesql配置如下，当A值变化时，会替换B元素配置的storesql，从而改变B元素的options（B元素配置为combox），配置如下： {
 * type: 'text', label: 'A', fieldName: 'A', checkItems: 'B' },{ type: 'combox',
 * label: 'B', fieldName: 'B', storesql: "" }
 * 
 * 
 */
AI.FormField=function(config){
	this.val=config.value||"";// 当前值
	this.rawVal=(config.valname||config.value)||"";// /当前值对应的名称，适应于select,combox,checkbox,radio
	if(config.fieldName) config.fieldName = config.fieldName.replace('.','--');
	if(!config.id) config.id=config.fieldName;
	this.id=config.id||config.fieldName;
	this.type =config.type;
	this.fieldName = config.fieldName;
	this.config = $.extend({}, this.defaults, config);
	this.checkItems = config.checkItems;
	this.parentItems = config.parent.config.items;
	this.parentFieldsets = config.parent.config.fieldsets;
	this.dependencies = config.dependencies;

	/*
	 * 配置联动取值时，当被关联字段为空，关联字段取全部还是取空，
	 * 在这里加一个配置项，DEFAULT_ALL_SELECT为true时表示取空，false为取全部
	 * 允许在配置表单item时制定allSelect的值来修改
	 */
	this.DEFAULT_ALL_SELECT = config.allSelect||true; 
	
	// //分析依赖对象
	if(config.storesql){
	var parentCmp = AI.Action.extractSqlObj(config.storesql);
	 if(parentCmp){
	    	 config.dependParent=parentCmp;
	    	 var parentCmps=parentCmp.split(",")
	    	 for(var i=0;i<parentCmps.length;i++){
	    	    var parentCmp=ai.getCmp(parentCmps[i]);
	    	    if(parentCmp){
	    	    	 if(!parentCmp.config.child) parentCmp.config.child=this.id
	    	    	 else if(parentCmp.config.child.indexOf(this.id)<0) parentCmp.config.child+=","+this.id;
	    	    	}
	    	 };
	 };
	};
	if(this.config.parent && this.config.parent.store){
		var store = this.config.parent.store;
		if(!store.curRecord && store.getCount()>0) store.curRecord=store.getAt(0);
		if(store.curRecord && store.curRecord.get(this.id)!= undefined){
			this.config.value=store.curRecord.get(this.id);
		}
	};
	this.init();
// ai.registerCmp(config.id,this);
};
/**
 * 获取表单字段的parent属性值
 * 
 * @returns parent属性值
 */
AI.FormField.prototype.getParent =function(){
	return this.config.parent;
}; 
/**
 * 表单字段处理
 * 
 * @param item
 *            表单字段配置信息
 * @param val
 *            表单字段值
 */
AI.FormField.prototype.fieldInfluence = function(item,val){
	var self=this;
	var flag;
	
	if(item.dependencies){
		val = val&&val.toString().length>0?val:undefined;
		flag = eval(item.dependencies.replace(/{val}/g,val));
	}else{
		flag = true;
	}
	if(flag){
		if(item.type&&item.type == 'radio'){
			$("input[name='"+item.id+"']").parents('.form-group').show();
		}else if(item.type&&item.type == 'checkbox'){
			$("label[for='"+item.id+"']").parents('.form-group').show();
		}else{
			$("#"+item.id).parents('.form-group').show();
		}
	}else{
		if(item.type&&item.type == 'radio'){
			$("input[name='"+item.id+"']").parents('.form-group').hide();
		}else if(item.type&&item.type == 'checkbox'){
			$("label[for='"+item.id+"']").parents('.form-group').hide();
		}else{
			$("#"+item.id).parents('.form-group').hide();
		}
	}
	if(item.type=="combox"){
		var allOptions=this.getOptions(self.rebuildSQL(item.storesql,val),item.value);
		var optionsHtml='<option value=""> </option>';
		for(var i=0;i<allOptions.length;i++){
			var option=allOptions[i];
			var isChecked=option.selected?'selected=true':'';
			optionsHtml+='<option value="'+option.id+'" '+isChecked+'>'+option.name+'</option>';
		}
		$("#"+item.containerId).find("select#"+item.id).empty().append(optionsHtml);
	}else if(item.type=="selbox"){
		function afterSelect(records){
			var val="";
			for(var i=0;i<records.length;i++){
				var valTmp = records[i].get('KEYFIELD')||records[i].get('VALUES1');
				val += ((i==0?"":",")+valTmp);
			};
			$("#"+item.containerId).find("input#"+item.id).val(val);
			var fields = self.config.parent.fields;
			for(var j=0;j<fields.length;j++){
				var field = fields[j];
				if(field.id==item.id){
						field.triggerFieldChage(val);
				}
			}
		}; 
		$("#"+item.containerId).find("input#"+item.id).parent().find(".input-group-addon").off("click").on("click",
			function(){
			debugger
				var selectedValue = $("#"+item.containerId).find("input#"+item.id).val();// 选中的值
				var selBox=new SelectBox({sql:self.rebuildSQL(item.storesql,val),callback:afterSelect,selectedValue:selectedValue});
				selBox.show();
				return true;
			});
	}else if(item.type=="mapbox"){
		function afterSelect(records){
			var keyval="";
			var valueval ="";
			for(var i=0;i<records.length;i++){
				var keyvalTmp = records[i].get('KEYFIELD')||records[i].get('VALUES4');
				keyval += ((i==0?"":",")+keyvalTmp);
				var valuevalTmp = records[i].get('VALUEFIELD')||records[i].get('VALUES1');
				valueval += ((i==0?"":",")+valuevalTmp);
			};
			var val = keyval+"|"+valueval;
			$("#"+item.containerId).find("input#"+item.id).val(valueval);
			var fields = self.config.parent.fields;
			for(var j=0;j<fields.length;j++){
				var field = fields[j];
				if(field.id==item.id){
						field.triggerFieldChage(val);
				}
			}
		}; 
		$("#"+item.containerId).find("input#"+item.id).parent().find(".input-group-addon").off("click").on("click",
			function(){
			debugger
				var selectedValue = $("#"+item.containerId).find("input#"+item.id).val();// 选中的值
				var selBox=new SelectBox({sql:self.rebuildSQL(item.storesql,val),callback:afterSelect,selectedValue:selectedValue});
				selBox.show();
				return true;
			});
	}else if(item.type=="label"){
		var kVal = {key:item.val,value:item.val};
		if(item.storesql){
			var allOptions=this.getOptions(self.rebuildSQL(item.storesql,val),item.value);
			for(var i=0;i<allOptions.length;i++){
				var option=allOptions[i];
				kVal={key:option.name,value:option.id};
			}
		}
		
		$("#"+item.containerId).find("#"+item.id).attr('value', kVal.value).empty().append(kVal.key);
		var fields = self.config.parent.fields;
		for(var j=0;j<fields.length;j++){
			var field = fields[j];
			if(field.id==item.id){
				field.triggerFieldChage(kVal.value);
			}
		}
	}else if(item._fieldInfluence){
		item._fieldInfluence(item,val);
	}
};
/**
 * 根据变量值，替换sql中的{val}字符串
 * 
 * @param sql
 *            sql语句
 * @param val
 *            变量值
 * @returns 替换后的sql
 */
AI.FormField.prototype.rebuildSQL = function(sql,val){
	var rs="";
	if(this.DEFAULT_ALL_SELECT||val){
		if(sql){
			rs = sql.replace(/{val}/g,val);
		}
	}else{
		var sqlArr = sql.split(/\swhere\s|\sand\s/i);
		for(var i=0;i<sqlArr.length;i++){
			var _sqlSplit = sqlArr[i];
			if(/{val}/g.test(_sqlSplit)){
				sqlArr[i] = " 1=1 "
			}
			rs += (sqlArr[i]+(i==0&&sqlArr.length!=1?" where ":i==sqlArr.length-1?"":" and "));
		}
	}
	return rs;
};
/**
 * 表单字段初始化函数
 */
AI.FormField.prototype.init = function(){
	this.control = this.getElement(this.config);
	var self=this;
	for(var i=0;i<self.config.parent.fields.length;i++){
		var _item = self.config.parent.fields[i].config;
		if(_item.checkItems&&_item.checkItems.indexOf(self.config.fieldName)!=-1){
			self.config.dep = _item.fieldName;
			if(_item.type&&_item.type=='mapbox'){
				self.fieldInfluence(self.config,_item.value&&_item.value.toString().length>0?_item.value.substring(0,_item.value.indexOf("|")):_item.value);
			}else{
				self.fieldInfluence(self.config,_item.value);
			}
		}
	}
	$("#"+this.id,this.control).change(function(){
		self.triggerFieldChage(self.getValue());
	});
};
/**
 * 向父窗口通知数据变化
 * 
 * @param newVal
 *            新的表单字段值
 * @param newRawVal
 *            新的名称值，适用于select,combox,checkbox,radio
 */
AI.FormField.prototype.triggerFieldChage = function(newVal,newRawVal){// /向父窗口通知数据变化
	this.val=newVal;
	this.rawVal=newRawVal;
	var self = this;
	if(self.checkItems&&self.checkItems.length>0){
		if(self.parentItems&&self.parentItems.length > 0){
			for(var i=0;i<self.parentItems.length;i++){
				var _item = self.parentItems[i];
				if(self.checkItems.indexOf(_item.fieldName)!=-1){
					_item.dep = self.fieldName;
					if(self.type&&self.type=='mapbox'){
						self.fieldInfluence(_item,newVal&&newVal.toString().length>0?newVal.substring(0,newVal.indexOf("|")):newVal);
					}else{
						self.fieldInfluence(_item,newVal);	
					}
					
				}
			}
		}
		if(self.parentFieldsets&&self.parentFieldsets.length >0){
			for(var j=0;j<self.parentFieldsets.length;j++){
				var _fieldset = self.parentFieldsets[j];
				for(var k=0;k<_fieldset.items.length;k++){
					var _item = _fieldset.items[k];
					if(self.checkItems.indexOf(_item.fieldName)!=-1){
						_item.dep = self.fieldName;
						if(self.type&&self.type=='mapbox'){
							self.fieldInfluence(_item,newVal&&newVal.toString().length>0?newVal.substring(0,newVal.indexOf("|")):newVal);
						}else{
							self.fieldInfluence(_item,newVal);	
						}
					}
				}
			}
		}
		
	}
	if(this.config.fieldChage){
		this.config.fieldChage(newVal);
	};
	if(this.config.parent && this.config.parent.fieldChange){
		this.config.parent.fieldChange(this.id,newVal,newRawVal);
	}
	// 更新依赖对象
	if(this.config.child){
		var cmp = ai.getCmp(this.config.child);
		cmp.chageOptions(); 
	}
	var cmpId = this.id;
	if(typeof(minderGraph)!='undefined' && minderGraph && minderGraph.allWidget){
		var thisWidget = minderGraph.allWidget[cmpId];
		if(thisWidget) thisWidget.publish("fieldchange",newVal,newRawVal);
	}
};
/**
 * 获取表单字段对应名称值：attr("name")
 */
AI.FormField.prototype.getRawValue = function(){
	this.getValue();
	return this.rawVal||this.value;
};
/**
 * 获取表单字段值
 * 
 * @returns 表单字段值
 */
AI.FormField.prototype.getValue = function(){
	var $this = $("#"+this.id)

	var itemcfg=this.config;
	var fieldName=itemcfg.fieldName;
	var type=itemcfg.type;

	var newVal="",newRawVal="";
	var $inputField=this.control.find("#"+this.id);

	if(type=='checkbox' || type=='mulitselect'){
		var newVal="",newValName="";
		var containerId="container_"+(this.id);
		var $inputField = $("#"+containerId).find(":checkbox");

		for(var i=0;i<$inputField.length;i++){
			var item = $inputField[i];
			if($(item).is(':checked')){
				if(newVal){
					newVal+=","+$(item).attr('value');
					newValName+=","+$(item).attr("name");
				}else {
					newVal=$(item).attr('value');
					newValName=$(item).attr("name");
				};
			}
		};
		$("#"+this.id).val(newValName);
		this.val=newVal;
		this.rawVal = newValName;
	}else if(type=='radio'){
		$inputField = $("input:radio[name="+itemcfg.id+"]");
		for(var i=0;i<$inputField.length;i++){
			var item = $inputField[i];
			var result = $(item).attr('checked');
			if($(item).is(':checked')){
				newVal=$(item).attr('value');
				newValName=$(item).attr("name")
				this.val=newVal;
				this.rawVal = newValName;
			};
		};
	}else if(type=='combox'){
		var $select = $("select#"+this.id);
		var newVal = $select.val();
		var newRawVal = $("select#"+this.id+" option[value='"+newVal+"']").text();
		if($select.hasClass('custom-val')){
			newVal = newRawVal = $("input[name='"+this.id+"']").val();
		}
		this.val=newVal;
		this.rawVal = newRawVal;
	}else if(type=='textarea'){
		newVal=$inputField.val();
	}else if(type=='seltag'){
		// 初始化对象
		var tagEle=$("#"+this.id+" .tag-list").tags();
		// 取值
		newVal=tagEle.tagsArray1;
	}else if(type=='mapbox'||type=='wysiwyg'){
		newVal = this.val;
	}else if(type=='label'){
		newVal = this.val;
	}else if ((type=='date')&&(itemcfg.format)&&(itemcfg.format=='yyyymmdd')){// 20160608
		if ($inputField.val()) newVal=ai.timeidToDate($inputField.val()).format('yyyymmdd');
	}else if(type == 'fulldaterange'){
		newVal = $("input#"+this.id+"_min").val().trim()+' - '+$("input#"+this.id+"_max").val().trim() ;
	}else{
		newVal=$inputField.val();
	};
	this.val=newVal;
	return newVal;
};
/**
 * 设置表单字段值
 * 
 * @param newVal
 *            新的表单字段值
 */
AI.FormField.prototype.setValue = function(newVal){
	$("#"+this.config.id).val(newVal);
	if(this.config.type=="checkbox"){
	}else if(this.config.type=="radio"){
		// radio的选中状态不好控制，用的方法是通过单击事件来改变radio的状态
		$("input[name='"+this.config.id+"']#"+newVal).click();
	}else if(this.config.type=="seltag"){
		// 初始化对象
		 var tagEle=  $("#"+this.id+" .tag-list").tags();
		 for(var i=0;i<newVal.length;i++){
		 	// 添加新的tag
		 	var option=newVal[i];
		 	 tagEle.addTag(option);
	 	}
	};
};


/**
 * 根据store.curRecord,刷新FormField字段值
 */
AI.FormField.prototype.refresh = function(){
	var store = this.config.parent.store;
	if(!store.curRecord && store.getCount()>0) store.curRecord=store.getAt(0);
	if(store.curRecord && store.curRecord.get(this.id)!= undefined){
		this.config.value=store.curRecord.get(this.id);
	}
	this.setValue(this.config.value);
};
/**
 * 获取Label标签值
 */
AI.FormField.prototype.getLabel=function(elmentcfg){
   return (elmentcfg.label||elmentcfg.fieldLabel)+(elmentcfg.notNull=='N'?'<b><font color=red ">*</font></b>':'');
};
/**
 * 根据配置返回一个数组，包含key,value,当前选中的值
 * 
 * @param storesql
 *            查询语句
 * @param selVal
 *            选择值
 * @param elementType
 *            表单字段类型
 * @returns 数组，包含key,value,当前选中的值
 */
AI.FormField.prototype.getOptions=function (storesql,selVal,elementType){  // /根据配置返回一个数组，包含key,value,当前选中的值
	var self=this;
	var allOptions=[];// {id,name}
	var isSelVal=function(optionsId){
		optionsId = typeof optionsId =='number'?(optionsId+''):optionsId;
		if(selVal&&elementType&&elementType=='checkbox'){
			var checkVals = selVal.toString().split(",");
			var checkSel = false;
			for(var m in checkVals){
				if(checkVals[m]&&optionsId&&(checkVals[m].toString().trim()==optionsId.trim())){
					checkSel = true;
					break;
				}
			}
			return checkSel;
		}else{
			return selVal&&optionsId?(selVal.toString().trim()==optionsId.trim()):false;
		}
	};
	if(storesql){
		if(storesql.toLowerCase().indexOf('select ')!=-1 && storesql.toLowerCase().indexOf(' from ')!=-1){
			var store=ai.getStoreData(self.rebuildSQL(storesql));
			var attrNames=store&&store.length>0?ai.getJsonAttrName(store[0]):'';
			for(var i=0;store&&i<store.length;i++){
				var r=store[i];var optionRec={};
				for(var k in r){
					optionRec[k.toLowerCase()]=r[k];
				}
				optionRec.id=r[attrNames[0]];
				optionRec.name=r[attrNames.length==1?attrNames[0]:attrNames[1]];
				optionRec.selected=isSelVal(r[attrNames[0]]);
				allOptions.push(optionRec);
			}
		}else if(storesql.indexOf("|")>=1){ // 1,中国|2,美国
			var tmpArray=storesql.split("|");
			for(var i=0;i<tmpArray.length;i++){
				var option=tmpArray[i];
				allOptions.push({
					id:option.split(",")[0]
					,name:option.split(",")[1]
					,selected:isSelVal(option.split(",")[0])
				});
			}
		}else if($.isArray(storesql)||(storesql.indexOf('[')!=-1&&storesql.indexOf(']')!=-1)){
			var _arr = storesql;
			if(typeof storesql=='string'){
				_arr = JSON.parse(storesql);
			}
			for(var i=0;i<_arr.length;i++){
				var _a = _arr[i],
					_k,_v;
				if($.isArray(_a)){
					_k = _a[0],_v=_a[1];
				}else{
					_k = _v = _a;
				}
				allOptions.push({
					id:_k
					,name:_v
					,selected:isSelVal(_k)
				});
			}
		} else if(storesql.indexOf("apiService:") != -1){
			var _apiService = storesql.split(":")[1];
			var store = new AI.JsonStore({
				apiService: _apiService,
				pageSize:-1,
				param: {
					delFlag: 0
				}
			});
			
			var storeData = store.root;
			
			var attrNames=storeData&&storeData.length>0?ai.getJsonAttrName(storeData[0]):'';
			for(var i=0;storeData&&i<storeData.length;i++){
				var r=storeData[i];var optionRec={};
				for(var k in r){
					optionRec[k.toLowerCase()]=r[k];
				}
				optionRec.id=r[attrNames[0]];
				optionRec.name=r[attrNames.length==1?attrNames[0]:attrNames[1]];
				optionRec.selected=isSelVal(r[attrNames[0]]);
				allOptions.push(optionRec);
			}
		}else if(storesql){
			var tmpArray=storesql.split(",");
			for(var i=0;i<tmpArray.length;i++){
				allOptions.push({
					id:tmpArray[i]
					,name:tmpArray[i]
					,selected:isSelVal(tmpArray[i])
				});
			}
		}
	}
	return allOptions;
};
/**
 * 获取表单字段值
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 表单字段值
 */
AI.FormField.prototype.getItemValue=function (elementcfg){
	var result =  elementcfg.value;
	if(this.config.store){
		var curRecord=this.config.store.getAt(0);
		var fieldName=elementcfg.fieldName;
		result = curRecord.get(fieldName)||elementcfg.value;
	}
  return  result;
};
/**
 * 根据表单字段配置生成对应表单字段标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的表单字段标签元素
 */
AI.FormField.prototype.getElement=function(elementcfg){
	elementcfg.value=this.getItemValue(elementcfg) ;
	var formField=null;
	switch (elementcfg.type) {
		case 'text' :formField= this.buildTextElement(elementcfg);break;
		case 'password' :formField= this.buildTextElement(elementcfg);break;
		case 'textfield' :formField= this.buildTextElement(elementcfg);break;
		case 'hidden' :formField= this.buildTextElement(elementcfg);break; 
		case 'text-button' :formField= this.buildTextButtonElement(elementcfg);break; 
		case 'file' :formField= this.buildFileElement(elementcfg);  break;
		case 'radio' :formField= this.buildRadioElement(elementcfg); break;
		case 'radio-custom' :formField= this.buildRadioElement1(elementcfg); break;
		case 'checkbox' :formField= this.buildCheckBoxElement(elementcfg);break;
		case 'textarea' :formField= this.buildRemarkElement(elementcfg); break;
		case 'combox' :formField= this.buildComboxElement(elementcfg); break;
		case 'mulitselect' :formField= this.buildMulitselectElement(elementcfg); break;
		case 'mulitLevel' :formField= this.buildMulitLevelElement(elementcfg); break;
		case 'mulitselect2' :formField= this.buildMulitselectElement2(elementcfg); break;
		case 'selectList' :formField= this.buildSelectListElement(elementcfg); break;
		case 'selecttree' :formField= this.buildSelectTreeElement(elementcfg); break;
		case 'date' :formField= this.buildDateElement(elementcfg);break;
		case 'daterange' :formField= this.buildDateRangeElement(elementcfg);break;
		case 'fulldaterange' :formField= this.buildFullDateRangeElement(elementcfg);break;
		case 'color':formField= this.buildColorElement(elementcfg);break;
		case 'html' :formField= this.buildHtmlElement(elementcfg);break;
		case 'imgpicker' :formField= this.buildImgPicker(elementcfg);break;
		case 'button':formField= this.buildButton(elementcfg);break;
		case 'buttongroup':  formField= this.buildButtonGroup(elementcfg);break;
		case 'dropmenu': formField = this.buildDropMenu(elementcfg);break;
		case 'selbox' : formField= this.buildSelBoxElement(elementcfg);break;
		case 'mapbox' : formField= this.buildMapBoxElement(elementcfg);break;
		case 'pick-grid' : formField= this.buildSelBoxElement(elementcfg);break;
		case 'seltag' : formField= this.buildSelTagElement(elementcfg);break;
		case 'card' : formField= this.buildCard(elementcfg);break;
		case 'wysiwyg' : formField= this.buildWysiwyg(elementcfg);break;
		case 'label' : formField= this.buildLabel(elementcfg);break;
		
		default:
			alert('未知组件类型:'+elementcfg.type);break;
	}
	return formField;
};
/**
 * 根据表单字段配置生成卡片类型表单字段标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的卡片类型表单字段标签元素
 */
AI.FormField.prototype.buildCard=function(elementcfg){
	var html = '<div class="col-md-6"><h4><strong>'+ (elementcfg.value||'未知') +'</strong><p><a>'+this.getLabel(elementcfg)+'</a></p></h4></div>';
	var $that=$(html).appendTo($("#"+elementcfg.containerId));
	return $that;
};
/**
 * 根据表单字段配置生成label标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的label标签元素
 */
AI.FormField.prototype.buildLabel=function(elementcfg){
	var label=elementcfg.label||elementcfg.fieldLabel;
	var label =this.getLabel(elementcfg);
	var value=elementcfg.value;
	var fieldName=elementcfg.fieldName||label;
	var labelColSpan = elementcfg.labelColSpan||2;
	var storesql=elementcfg.storesql;
	var kVal = {key:value,value:value};

	if(storesql){
		var allOptions=this.getOptions(storesql,value);
		for(var i=0;i<allOptions.length;i++){
			var option=allOptions[i];
			if(option.selected==true){isDefaultValInOptions = true;kVal={key:option.name,value:option.id};}
		};
	}
	
	var html= '<div class="form-group form-group-sm">'
	+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
	+  '<div class="col-sm-'+(12-labelColSpan)+'">'
	+  '   <div id="'+this.id+'" class="form-control" style="width:'+(elementcfg.width||220)+'px;float:left;background-color:#cbd5dd;" value='+kVal.value+'>'+kVal.key+'</div>&nbsp;'
	+ '</div>'
	+'</div>';

	this.val = kVal.value||value;

	var $that=$(html).appendTo($("#"+elementcfg.containerId));
	return $that;
};
/**
 * 根据表单字段配置生成文本标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的文本标签元素
 */
AI.FormField.prototype.buildTextElement=function(elmentcfg){
    	var label =this.getLabel(elmentcfg);
    	var value=elmentcfg.value;
    	var tip = elmentcfg.tip;
    	var popover = elmentcfg.popover;
    	var notNullValue=elmentcfg.notNull;
    	var fieldName=elmentcfg.fieldName||label;
    	var elementType = elmentcfg.type || "text";
    	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
    	var labelColSpan = elmentcfg.labelColSpan||2;
    	var elementPlaceholder = elmentcfg.placeholder || elmentcfg.label;
    	var popoverHtml = "";
    	if(popover)popoverHtml = '<span id="popover-btn" class="glyphicon glyphicon-question-sign" style="cursor:pointer;padding:10px;" data-toggle="popover" data-content="'+popover+'" data-placement="right"  aria-hidden="true"></span>';
    	var tipHtml="";
    	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>';
    	if(elmentcfg.parenttype=='form'){
    		if(elmentcfg.isSqlForm){
    			var html = '<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' :'col-sm-1 control-label')+'">'+label+'</label>' 
	    				+'<div class="col-sm-3">'
						+	'<input type="text" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+this.id+'" style="float:left;width:220px" notNull="'+notNullValue+'" value="'+(value||"")+'" '+readOnly+'>'
						+'</div>';
    		}else{
    			var html= '<div class="form-group form-group-sm">'
    				   +	'<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : ('col-sm-'+labelColSpan+' control-label'))+'">'+label+'</label>' 
    				   +  '<div class="col-sm-'+(12-labelColSpan)+'">'
    				   +  '   <input type="'+elementType+'" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+this.id+'" style="float:left;width:'+(elmentcfg.width||220)+'px" type="text" notNull="'+notNullValue+'" value="'+(value||"")+'" '+readOnly+'>'
    				   + popoverHtml+tipHtml
    				   + '</div>'
    				   +'</div>';
    		}
	    	
	   }else{
	    	if(elmentcfg.subtype && elmentcfg.subtype=='inline'){
	   		var html= '<li style="margin-left:3px"> <input type="'+elementType+'" placeholder="'+elementPlaceholder+'" class="form-control" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'" placeholder="'+label+'"></li>'
	 	 	}
	 	else {var html= '<li >'
	 	  +'<label class="'+(elmentcfg.labelHidden == true ? 'sr-only' :'navbar-label')+'">'+label+'</label>'
	 	  + '   <input type="'+elementType+'" placeholder="'+elementPlaceholder+'" class="form-control" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'">'
	 	  +'</li>'
	 	 }
	   };
		var $that=$(html).appendTo($("#"+elmentcfg.containerId));
		$that.find("#popover-btn").popover();
		$that.find("#popover-btn").on('click',function(){
			$that.find('#popover-btn').toggleClass('glyphicon-question-sign').toggleClass('glyphicon-info-sign');
		});
		if(elmentcfg.type==='hidden'){
			$that.hide();
		}
		return $that;
 };
/**
 * 根据表单字段配置生成富文本编辑框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的富文本编辑框
 */
 AI.FormField.prototype.buildWysiwyg=function(elmentcfg){
	 ai.loadWidget("wysiwyg");
	 var label =this.getLabel(elmentcfg);
	 var value=elmentcfg.value;
	 var tip = elmentcfg.tip;
	 var popover = elmentcfg.popover;
	 var notNullValue=elmentcfg.notNull;
	 var fieldName=elmentcfg.fieldName||label;
	 var elementType = elmentcfg.type || "text";
	 var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	 var labelColSpan = elmentcfg.labelColSpan||2;
	 var popoverHtml = "";
	 if(popover)popoverHtml = '<span id="popover-btn" class="glyphicon glyphicon-question-sign" style="cursor:pointer;padding:10px;" data-toggle="popover" data-content="'+popover+'" data-placement="right"  aria-hidden="true"></span>';
	 var tipHtml="";
	 if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>';
	 if(elmentcfg.parenttype=='form'){
		 
		 var html= '<div class="form-group form-group-sm">'
			 +	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
			 +  '<div class="col-sm-'+(12-labelColSpan)+'">'
			 
			 +  '<div data-target="#editor" data-role="editor-toolbar" class="btn-toolbar">'
			 +  '<div class="btn-group">'
			 +  '<a title="" data-toggle="dropdown" class="btn dropdown-toggle" data-placement="bottom" data-original-title="字体"><i class="fa fa-font"></i><b class="caret"></b></a>'
			 +  '<ul class="dropdown-menu">'
			 +  '<li><a style="font-family:\'Serif\'" data-edit="fontName Serif">Serif</a></li><li><a style="font-family:\'Sans\'" data-edit="fontName Sans">Sans</a></li><li><a style="font-family:\'Arial\'" data-edit="fontName Arial">Arial</a></li><li><a style="font-family:\'Arial Black\'" data-edit="fontName Arial Black">Arial Black</a></li><li><a style="font-family:\'Courier\'" data-edit="fontName Courier">Courier</a></li><li><a style="font-family:\'Courier New\'" data-edit="fontName Courier New">Courier New</a></li><li><a style="font-family:\'Comic Sans MS\'" data-edit="fontName Comic Sans MS">Comic Sans MS</a></li><li><a style="font-family:\'Helvetica\'" data-edit="fontName Helvetica">Helvetica</a></li><li><a style="font-family:\'Impact\'" data-edit="fontName Impact">Impact</a></li><li><a style="font-family:\'Lucida Grande\'" data-edit="fontName Lucida Grande">Lucida Grande</a></li><li><a style="font-family:\'Lucida Sans\'" data-edit="fontName Lucida Sans">Lucida Sans</a></li><li><a style="font-family:\'Tahoma\'" data-edit="fontName Tahoma">Tahoma</a></li><li><a style="font-family:\'Times\'" data-edit="fontName Times">Times</a></li><li><a style="font-family:\'Times New Roman\'" data-edit="fontName Times New Roman">Times New Roman</a></li><li><a style="font-family:\'Verdana\'" data-edit="fontName Verdana">Verdana</a></li></ul>'
			 +  '</div>'
			 +  '<div class="btn-group">'
			 +  '<a title="" data-toggle="dropdown" class="btn dropdown-toggle" data-placement="bottom" data-original-title="字体大小"><i class="fa fa-text-height"></i>&nbsp;<b class="caret"></b></a>'
			 +  '<ul class="dropdown-menu">'
			 +  '<li><a data-edit="fontSize 5"><font size="5">大</font></a></li>'
			 +  '<li><a data-edit="fontSize 3"><font size="3">中</font></a></li>'
			 +  '<li><a data-edit="fontSize 1"><font size="1">小</font></a></li>'
			 +  '</ul>'
			 +  '</div>'
			 +  '<div class="btn-group">'
			 +  '<a title="" data-edit="bold" class="btn" data-placement="bottom" data-original-title="加粗 (Ctrl/Cmd+B)"><i class="fa fa-bold"></i></a>'
			 +  '<a title="" data-edit="italic" class="btn" data-placement="bottom" data-original-title="斜体 (Ctrl/Cmd+I)"><i class="fa fa-italic"></i></a>'
			 +  '<a title="" data-edit="strikethrough" class="btn" data-placement="bottom" data-original-title="删除线"><i class="fa fa-strikethrough"></i></a>'
			 +  '<a title="" data-edit="underline" class="btn" data-placement="bottom" data-original-title="下划线 (Ctrl/Cmd+U)"><i class="fa fa-underline"></i></a>'
			 +  '</div>'
			 +  '<div class="btn-group">'
		        +  '<a title="" data-edit="insertunorderedlist" class="btn" data-placement="bottom" data-original-title="项目符号"><i class="fa fa-list-ul"></i></a>'
		        +  '<a title="" data-edit="insertorderedlist" class="btn btn-info" data-placement="bottom" data-original-title="编号"><i class="fa fa-list-ol"></i></a>'
		        +  '<a title="" data-edit="outdent" class="btn" data-placement="bottom" data-original-title="减少缩进 (Shift+Tab)"><i class="fa fa-outdent"></i></a>'
		        +  '<a title="" data-edit="indent" class="btn" data-placement="bottom" data-original-title="增加缩进 (Tab)"><i class="fa fa-indent"></i></a>'
		      +  '</div>'
		      +  '<div class="btn-group">'
		        +  '<a title="" data-edit="justifyleft" class="btn btn-info" data-placement="bottom" data-original-title="左对齐 (Ctrl/Cmd+L)"><i class="fa fa-align-left"></i></a>'
		        +  '<a title="" data-edit="justifycenter" class="btn" data-placement="bottom" data-original-title="文字居中 (Ctrl/Cmd+E)"><i class="fa fa-align-center"></i></a>'
		        +  '<a title="" data-edit="justifyright" class="btn" data-placement="bottom" data-original-title="右对齐 (Ctrl/Cmd+R)"><i class="fa fa-align-right"></i></a>'
		        +  '<a title="" data-edit="justifyfull" class="btn" data-placement="bottom" data-original-title="对齐文本 (Ctrl/Cmd+J)"><i class="fa fa-align-justify"></i></a>'
		      +  '</div>'
		      +  '<div class="btn-group hide">'
				  +  '<a title="" data-toggle="dropdown" class="btn dropdown-toggle" data-placement="bottom" data-original-title="超链接"><i class="fa fa-link"></i></a>'
				    +  '<div class="dropdown-menu input-append">'
					    +  '<input type="text" data-edit="createLink" placeholder="URL" class="span2">'
					    +  '<button type="button" class="btn">添加</button>'
		        +  '</div>'
		        +  '<a title="" data-edit="unlink" class="btn" data-placement="bottom" data-original-title="去掉超链接"><i class="fa fa-cut"></i></a>'
		      +  '</div>'
		      +'<div class="btn-group">'
		      +  '<div class="dropdown">'
				+'	  <a title="" data-toggle="dropdown" class="btn dropdown-toggle" data-placement="bottom" data-original-title="超链接" aria-expanded="false"><i class="fa fa-link"></i></a>'
				+'	  <a title="" data-edit="unlink" class="btn" data-placement="bottom" data-original-title="去掉超链接"><i class="fa fa-cut"></i></a>'
				+'	  <div class="dropdown-menu" aria-labelledby="dropdownMenu1">'
						+ '<input type="text" data-edit="createLink" placeholder="URL" class="span2">'
						+ '<button type="button" class="btn">添加</button>'
				+'	  </div>'
				+'	</div>'
		      +'</div>'
		      +  '<div class="btn-group">'
		        +  '<a id="pictureBtn" title="" class="btn" data-placement="bottom" data-original-title="插入图片 (or just drag &amp; drop)"><i class="fa fa-file"></i></a>'
		        +  '<input type="file" data-edit="insertImage" data-target="#pictureBtn" data-role="magic-overlay" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 39px; height: 30px;">'
		      +  '</div>'
		      +  '<div class="btn-group">'
		        +  '<a title="" data-edit="undo" class="btn" data-placement="bottom" data-original-title="撤消 (Ctrl/Cmd+Z)"><i class="fa fa-undo"></i></a>'
		        +  '<a title="" data-edit="redo" class="btn" data-placement="bottom" data-original-title="重复 (Ctrl/Cmd+Y)"><i class="fa fa-repeat"></i></a>'
		      +  '</div>'
		      +  '<input type="text" x-webkit-speech="" id="voiceBtn" data-edit="inserttext" style="display: none;">'
		    +  '</div>'
			+  '<div id="editor" contenteditable="true">'
			+  '</div>'
			
			 + popoverHtml+tipHtml
			 + '</div>'
			 +'</div>';
		 
	 }else{
		 // 针对grid
		 if(elmentcfg.subtype && elmentcfg.subtype=='inline'){
			 var html= '<li style="margin-left:3px"> <input type="'+elementType+'" class="form-control" id="'+fieldName+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'" placeholder="'+label+'"></li>'
		 }
		 else {
			 var html= '<li >'
			 +'<label class="navbar-label">'+label+'</label>'
			 + '   <input type="'+elementType+'" class="form-control" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'">'
			 +'</li>'
		 }
		 
	 };
	 var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	 $that.find("#popover-btn").popover();
	 $that.find("#popover-btn").on('click',function(){
		 $that.find('#popover-btn').toggleClass('glyphicon-question-sign').toggleClass('glyphicon-info-sign');
	 });
	 if(elmentcfg.type==='hidden'){
		 $that.hide();
	 }
	 
	 function initToolbarBootstrapBindings() {
	      var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
	            'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
	            'Times New Roman', 'Verdana'],
	      fontTarget = $that.find('[title=Font]').siblings('.dropdown-menu');
	      $.each(fonts, function (idx, fontName) {
	          fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
	      });
	      $that.find('a[title]').tooltip({container:'body'});
	      $that.find('.dropdown-menu input').click(function() {return false;})
			    .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
	        .keydown('esc', function () {this.value='';$(this).change();});

	      $that.find('[data-role=magic-overlay]').each(function () { 
	        var overlay = $(this), target = $(overlay.data('target')); 
	        overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
	      });
	      if ("onwebkitspeechchange"  in document.createElement("input")) {
	        var editorOffset = $('#editor').offset();
	        $that.find('#voiceBtn').css('position','absolute').offset({top: editorOffset.top, left: editorOffset.left+$('#editor').innerWidth()-35});
	      } else {
	    	$that.find('#voiceBtn').hide();
	      }
	};
	function showErrorAlert (reason, detail) {
		var msg='';
		if (reason==='unsupported-file-type') { msg = "Unsupported format " +detail; }
		else {
			console.log("error uploading file", reason, detail);
		}
	};
	initToolbarBootstrapBindings();

	var self = this;
	self.val = '';

	$that.find('#editor').append(value);
	$that.find('#editor').wysiwyg({ fileUploadError: showErrorAlert} );
	$that.find('#editor').on("mouseout",function(e){
		var newVal = $(e.currentTarget).html();
		if(self.val != newVal){
			self.triggerFieldChage(newVal);
			self.val = newVal;
		}
    });
	 
	 return $that;
 };
/**
 * 根据表单字段配置生成文本加按钮标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的文本加按钮标签元素
 */
 AI.FormField.prototype.buildTextButtonElement=function(elmentcfg){
	 
	 var label=elmentcfg.label||elmentcfg.fieldLabel;
	 var label =this.getLabel(elmentcfg);
	 var value=elmentcfg.value;
	 var tip = elmentcfg.tip;
	 var notNullValue=elmentcfg.notNull;
	 var fieldName=elmentcfg.fieldName||label;
	 var elementType = elmentcfg.type || "text";
	 var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	 var labelColSpan = elmentcfg.labelColSpan||2;
	 var tipHtml="";
	 if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>'
	 var html= '<div class="form-group form-group-sm">'
       +	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
       +  '<div class="col-sm-'+(12-labelColSpan)+'">'
       +  '   <input type="text" class="form-control input-sm" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px;float:left" notNull="'+notNullValue+'" value="'+(value||"")+'" disabled/>&nbsp;'
       +  tipHtml
       + '<input type="button" style="width:40px;" id="'+this.id+'_1"  name="'+this.id+'" value="生成"/>';
       + '</div>'
       +'</div>';

	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	return $that;
 };
/**
 * 根据表单字段配置生成文件选择标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的文件选择标签元素
 */
AI.FormField.prototype.buildFileElement = function(elmentcfg){
	var label=elmentcfg.label||elmentcfg.fieldLabel;
	var label =this.getLabel(elmentcfg);
	var value=elmentcfg.value;
	var tip = elmentcfg.tip;
	var notNullValue=elmentcfg.notNull;
	var fieldName=elmentcfg.fieldName||label;
  var elementType = elmentcfg.type || "file";
  var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
  var labelColSpan = elmentcfg.labelColSpan||2;
  var tipHtml="";
  var tipHtml="";
  if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>';
  var self = this;
  var html = '<div class="form-group form-group-sm">'
  	+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
  	+ '<div class="col-sm-'+(12-labelColSpan)+'">'
  	+  '<input type="'+elementType+'"  id="'+this.id+'FILE" name ="file" style="position: fixed; left: -500px;width:'+(elmentcfg.width||220)+'px;"></input>'
  	+	 '<div style="display: inline;">'
  	+   '<input type="text" id="'+this.id+'" class="form-control inline v-middle input-s" style="width:'+(elmentcfg.width||220)+'px" value="'+(value||"")+'" readonly>'
  	+		'<label for="'+this.id+'FILE" class="btn btn-default">'
  	+			'<span class="glyphicon glyphicon-folder-open" style="cursor:pointer;" aria-hidden="true"> 浏览</span>'
  	+		'</label>'
  	+  '</div>'
  	+ '</div>'
		+'</div>';
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	$that.find('#'+this.id+'FILE').on('change',function(){
		var _val = $(this).val();
		$that.find(":text").val(_val.split("\\").pop());
		self.triggerFieldChage(_val.split("\\").pop());
	})	
	return $that;
};
/**
 * 根据表单字段配置生成textarea标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的textarea标签元素
 */ 
AI.FormField.prototype.buildRemarkElement=function(elmentcfg){
	if(elmentcfg.isSqlForm)return;
	var label=elmentcfg.label;
	var value=elmentcfg.value || "";
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var tip = elmentcfg.tip;
	var popover = elmentcfg.popover;
	
	var popoverHtml = "";
	if(popover)popoverHtml = '<span id="popover-btn" class="glyphicon glyphicon-question-sign" style="cursor:pointer;padding:10px;" data-toggle="popover" data-content="'+popover+'" data-placement="right"  aria-hidden="true"></span>';
	var tipHtml="";
	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>'
	// var label =this.getLabel(elmentcfg);
 
	var labelColSpan = elmentcfg.labelColSpan||2;
	var label =this.getLabel(elmentcfg);
 
	var html='<div class="form-group form-group-sm">'
 
		+'<label for="'+this.id+'" class="col-sm-'+elmentcfg.labelColSpan+' control-label">'+label+'</label>'
		+'<div class="col-sm-'+(12-elmentcfg.labelColSpan)+'"> <textarea class="form-control" style="float:left;width:'+elmentcfg.width+'px;height:'+(elmentcfg.height||150)+'px" cols='+(elmentcfg.cols||60)+' rows='+(elmentcfg.rows||5)+' id="'+this.id+'" name="'+fieldName+'" '+readOnly+'>'+value+'</textarea>'
		+ popoverHtml + tipHtml
		+'</div>';
    	// var html='<div>'+label+'<'+elementType+'
		// style="width:'+elmentcfg.width+'px" cols='+(elmentcfg.cols||60)+'
		// rows='+(elmentcfg.rows||5)+' id="'+fieldName+'"
		// name="'+fieldName+'">'+value+'</textarea></div>';
     
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	$that.find("#popover-btn").popover();
	$that.find("#popover-btn").on('click',function(){
		$that.find('#popover-btn').toggleClass('glyphicon-question-sign').toggleClass('glyphicon-info-sign');
	});
  return $that;
 };
/**
 * 根据表单字段配置生成html代码
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的html代码
 */ 
AI.FormField.prototype.buildHtmlElement=function(elmentcfg){
	var label=elmentcfg.label||'';
    	var value=elmentcfg.value;
    	var fieldName=elmentcfg.fieldName;
    	var elementType = elmentcfg.type;
    	// var label =this.getLabel(elmentcfg);
    	var html="";
   	if(elmentcfg.parenttype=='form')
      	html= 	'<a>' + (label||'') +  (elmentcfg.html||elmentcfg.value) +  '</a>'
    else 
    	   html= 	'<li>' + (label||'') +  (elmentcfg.html||elmentcfg.value) +  '</li>';
    	
     var $that=$(html).appendTo($("#"+elmentcfg.containerId));
			return  $that;
};
/**
 * 根据表单字段配置生成选项提示Tip代码
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @param optionId
 *            选项ID
 * @param optionName
 *            选项名称
 * @returns 生成的选项提示Tip代码
 */
AI.FormField.prototype.getOptionTip=function(elementcfg,optionId,optionName){
	if(!elementcfg.tips) return optionName;
	if(!elementcfg.tips[optionId]) return optionName;
	return '<a class="tooltip" href="#">'+optionName+'<span class="info">'+elementcfg.tips[optionId]+'</span></a>'
};
/**
 * 当依赖的条件值发生变化时，对下拉框选择内容变更
 */
AI.FormField.prototype.chageOptions=function(){
	$("select#"+this.id).empty();
	var storesql=this.config.storesql;
	var storesql = AI.Action.dealSql(storesql);
  
	var allOptions=this.getOptions(storesql,this.val)
  var self=this;
     
  var optionsHtml='<option></option>';
  for(var i=0;i<allOptions.length;i++){
    		 var option=allOptions[i];
    		 var isChecked="";
    		 if(option.selected) isChecked='selected=true'; 
    		 // var optionHtml
				// =self.getOptionTip(elmentcfg,option.id,option.name);
				 optionsHtml+='<option value="'+option.id+'" '+isChecked+'>'+option.name+'</option>';
	};
	$(optionsHtml).appendTo($("select#"+this.id));
	
};
/**
 * 根据表单字段配置生成radio标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的radio标签元素
 */
AI.FormField.prototype.buildRadioElement=function(elmentcfg){
	    var label=elmentcfg.label;
    	var value=elmentcfg.value;
    	var storesql=elmentcfg.storesql;
    	var fieldName=elmentcfg.fieldName;
    	var elementType = elmentcfg.type;
    	var notNull = elmentcfg.notNull;
    	var label =this.getLabel(elmentcfg); 
    	var allOptions=this.getOptions(storesql,value)
      	var self=this;
      	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
      	var labelColSpan = elmentcfg.labelColSpan||2;
      
    	var optionsHtml='';
    	for(var i=0;i<allOptions.length;i++){
    		 var option=allOptions[i];
    	      // optionsHtml+='<input type="radio" name="'+fieldName+'"
				// value="'+option.id+'"/>'+option.name+"&nbsp&nbsp;";
    	       optionsHtml+='<label class="radio-inline"> <input type="radio" name="'+fieldName+'" id="'+option.id+'" value="'+option.id+'" '+(option.selected ? 'checked="checked"':'')+' '+readOnly+'> '+option.name+'</label>'
			};
			
		  var label='<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>';
		  var html=  '<div class="form-group form-group-sm">' +label+'<div class="col-sm-'+(12-labelColSpan)+'">'+optionsHtml +  '</div></div>';
			var $that=$(html).appendTo($("#"+elmentcfg.containerId));
			 
      var $checks = $that.find(":radio");
      var self=this;
      $checks.bind("click",function(e){
     	  self.triggerFieldChage($(e.currentTarget).attr('value'));
     });
	 return  $that;
 };
/**
 * 根据表单字段配置生成radio标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的radio标签元素
 */
 AI.FormField.prototype.buildRadioElement1=function(elmentcfg){
 	var label=elmentcfg.label;
 	var value=elmentcfg.value;
 	var storesql=elmentcfg.storesql;
 	var fieldName=elmentcfg.fieldName;
 	var elementType = elmentcfg.type;
 	var notNull = elmentcfg.notNull;
 	var label =this.getLabel(elmentcfg); 
 	var allOptions=this.getOptions(storesql,value)
   	var self=this;
   	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
   	var labelColSpan = elmentcfg.labelColSpan||2;
   
 	var optionsHtml='';
 	for(var i=0;i<allOptions.length;i++){
 		 var option=allOptions[i];
 	      // optionsHtml+='<input type="radio" name="'+fieldName+'"
			// value="'+option.id+'"/>'+option.name+"&nbsp&nbsp;";
 	       optionsHtml+='<label class="radio-inline"> <input type="radio" name="'+fieldName+'" id="'+option.id+'" value="'+option.id+'" '+(option.id == value ? 'checked="checked"':'')+'" '+readOnly+'> '+option.name+'</label>'
			};
			
		  var label='<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>';
		  var html=  '<div class="form-group form-group-sm">' +label+'<div class="col-sm-'+(12-labelColSpan)+'">'+optionsHtml +  '</div></div>';
			var $that=$(html).appendTo($("#"+elmentcfg.containerId));
			 
   var $checks = $that.find(":radio");
   var self=this;
   $checks.bind("click",function(e){
  	  self.triggerFieldChage($(e.currentTarget).attr('value'));
  });
   return  $that;
};
/**
 * 根据表单字段配置生成复选框标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的复选框标签元素
 */
AI.FormField.prototype.buildCheckBoxElement=function(elmentcfg){
	var label=elmentcfg.label||elmentcfg.fieldLabel;
	var label=this.getLabel(elmentcfg);
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var height=elmentcfg.height||180;
	var elementType=elmentcfg.type;
	var readOnly=elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var isEditable=elmentcfg.isEditable||"";
	var labelColSpan = elmentcfg.labelColSpan||2;
// var label =this.getLabel(elmentcfg);
	var editHtml = '<input id="custom-input" type="text" class="form-control input-sm hide" style="float:left;width:220px;"/>'
		+'<span id="edit-btn" class="glyphicon glyphicon-edit" style="cursor:pointer;padding:10px;" aria-hidden="true"></span>';
	var allOptions=this.getOptions(storesql,value,elementType);

	var optionsHtml='<span id="container_'+this.id+'" style="border:1px;margin-top:2px">';
	for(var i=0;i<allOptions.length;i++){
		var option=allOptions[i];
		var isChecked="";
		if(option.selected) isChecked='checked';
		// var optionHtml =self.getOptionTip(elmentcfg,option.id,option.name);
		var option=allOptions[i];
		var isChecked=option.selected?"checked=true":"";
		// optionsHtml+='<span><input type="checkbox" name="'+option.name+'"
		// value="'+option.id+'" '+isChecked+'
		// '+readOnly+'/>'+option.name+"&nbsp;</span>";
		optionsHtml+='<span><input type="checkbox" name="'+this.id+'" value="'+option.id+'" '+isChecked+' '+readOnly+'/>'+option.name+"&nbsp;</span>";
	}
	optionsHtml+="</span>";
	if(isEditable){optionsHtml +=editHtml};
	if(elmentcfg.parenttype=='form'){
		var html= '<div class="form-group form-group-sm">'
		+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
		+	'<div class="col-sm-'+(12-labelColSpan)+'">'
		+	optionsHtml
		+	'</div>'
		+'</div>';
	}else{
		var html= '<li style="margin-left:2px;margin-top:12px>'
		+'<label class="navbar-label">'+label+'</label>'
		+ optionsHtml
		+'</li>';
	}
	// var html= '<li style="float:left;overflow:hidden;">'+label+ optionsHtml
	// +'</li>';

	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	var $checks = $that.find(":checkbox");
	var self=this;
	$checks.each(function(index,el){
		$(el).click(function(){
			self.triggerFieldChage(self.getValue());
		});
	});

	$that.find('#edit-btn').on('click',function(){
		$that.find('#edit-btn').toggleClass('glyphicon-edit').toggleClass('glyphicon-check');
		$that.find('#custom-input').toggleClass('hide');
		$that.find(':checkbox').parent('span').toggleClass('hide');
	});
	$that.find('#custom-input').on('change',function(){
		var _val = $(this).val();
		if($that.find(':checkbox[value="'+_val+'"]').length==0){
			$that.find(':checkbox').parent('span').append('<input type="checkbox" name="'+_val+'" value="'+_val+'" checked/>'+_val+'&nbsp;');
		}else{
			$that.find(':checkbox[value="'+_val+'"]').attr("checked","checked");
		}
		self.triggerFieldChage(_val);
	});	
	return $that;
};
/**
 * 根据表单字段配置生成下拉框标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的下拉框标签元素
 */
AI.FormField.prototype.buildComboxElement=function(elmentcfg){
	var label=elmentcfg.label||elmentcfg.fieldLabel;
	var label=this.getLabel(elmentcfg);
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var notNull = elmentcfg.notNull;
	var tip = elmentcfg.tip||"";
	var labelColSpan = elmentcfg.labelColSpan||2;
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var editable=elmentcfg.editable||"Y";
	var attr=elmentcfg.attr||'';
	var width = elmentcfg.width || '100';
	var elementPlaceholder = elmentcfg.placeholder || "请选择....";
	// var tipHtml=tip&&tip.length>0?('<span class="help-block
	// text-warning">'+tip+'</span>'):"";
	var tipHtml = '<input id="custom-input" name="'+this.id+'" type="text" class="form-control input-sm hide" style="float:left;width:'+width+'px;" />';
	if(elmentcfg.parenttype=='form') 
	    tipHtml += '<span id="edit-btn" class="glyphicon glyphicon-edit" style="cursor:pointer;padding:10px;" aria-hidden="true"></span>';
	tipHtml=readOnly=='disabled'?"":tipHtml;
	// tipHtml=editable?tipHtml:"";

	// tip标注
	tipHtml+=(tip&&tip.length>0?('<span class="help-block text-warning">'+tip+'</span>'):"");
	var self=this;
	var allOptions=this.getOptions(storesql,value);
	
	
	var optionsHtml='<option value="">'+elementPlaceholder+'</option>';
	var isDefaultValInOptions = false;
	for(var i=0;i<allOptions.length;i++){
		var option=allOptions[i];
		var isChecked=option.selected?'selected=true':'';
		optionsHtml+='<option value="'+option.id+'" '+isChecked+'>'+option.name+'</option>';
		if(option.selected==true){isDefaultValInOptions = true;}
	};
	if(!isDefaultValInOptions&&value){
		optionsHtml+='<option value="'+value+'" selected=true>'+value+'</option>';
	}
	var label =this.getLabel(elmentcfg);
	if(elmentcfg.parenttype=='form'){
		if(elmentcfg.isSqlForm){
			var html = '<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' :'col-sm-1 control-label')+'">'+label+'</label>' 
			+'	<div class="col-sm-4">'
			+'		<select id="'+this.id+'" data-placeholder="'+elementPlaceholder+'" class="form-control input-sm"  style="float:left;width:'+(elmentcfg.width||220)+'px" '+readOnly+'>'
			+		optionsHtml
			+'		</select>'
			+		tipHtml
			+'	</div>';
		}else{
			var html= '<div class="form-group form-group-sm">'
				+'<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : 'col-sm-'+labelColSpan+' control-label')+'">'+label+'</label>' 
				+'	<div class="col-sm-'+(12-labelColSpan)+'">'
				+'		<select id="'+this.id+'" data-placeholder="'+elementPlaceholder+'" class="form-control input-sm"  style="float:left;width:'+(elmentcfg.width||220)+'px" '+readOnly+'>'
				+		optionsHtml
				+'		</select>'
				+		tipHtml
				+'	</div>'
				+'</div>';
		}
		
	}else{
		var html= '<li style="margin-left:2px;margin-right:2px;" '+attr+'>'
		+'<label class="'+(elmentcfg.labelHidden == true ? 'sr-only' : 'navbar-label')+'">'+label+'</label>'
		+'	<select id="'+this.id+'" data-placeholder="'+elementPlaceholder+'" class="form-control" style="width:'+(elmentcfg.width||220)+'px" placeholder="'+label+'" '+readOnly+'>'
		+	optionsHtml
		+'	</select>'
		+	tipHtml
		+'</li>';
	}
	var $that = $(html).appendTo($("#"+elmentcfg.containerId));
	var editBtnSwitch = function(){
		$that.find('#edit-btn').toggleClass('glyphicon-edit').toggleClass('glyphicon-check');
		$that.find('#custom-input').toggleClass('hide');
		$that.find('select').toggleClass('hide').toggleClass('custom-val');
	};
	$that.find('#edit-btn').on('click',function(){
		editBtnSwitch();
	});
	$that.find('#custom-input').on('change',function(){
		var _val = $(this).val();
		if($that.find('select option[value="'+_val+'"]').length==0){
			$that.find('select').append('<option value="'+_val+'" selected>'+_val+'</option>');
		}else{
			$that.find('select').val(_val);
		}
		self.triggerFieldChage(_val);
	});
	// if(!isDefaultValInOptions&&value){
	// editBtnSwitch();
	// $that.find('#custom-input').val(value);
	// }
	if(editable == "N") {
		$that.find('#edit-btn').hide();
	}
	return $that;
};
/**
 * 根据表单字段配置生成多选下拉框标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的多选下拉框标签元素
 */
 AI.FormField.prototype.buildMulitselectElement2=function(elmentcfg){
     var label=elmentcfg.label;
    	var value=elmentcfg.value;
    	var storesql=elmentcfg.storesql;
    	var fieldName=elmentcfg.fieldName;
    	var height=elmentcfg.height||180;
    	var width=elmentcfg.width||200;	 
    	var elementType = elmentcfg.type;
    	var elId = this.id||elmentcfg.fieldName;
      var label =this.getLabel(elmentcfg);
      var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
      var labelColSpan = elmentcfg.labelColSpan||2;

       ai.loadWidget("multiSelect");
   	 
    	var self=this;
    	
    	var allOptions=this.getOptions(storesql,value,'checkbox');
    	
    	var optionsHtml = '';
    	for(var i=0;i<allOptions.length;i++){
    		var option=allOptions[i];
    		optionsHtml+='<option value="'+option.id+'" '+(option.selected?'selected':'')+' >'+option.name+'</option>';
    	}
    	
		  var html= '<div class="form-group form-group-sm">'
			   +	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
			   +  '<div class="col-sm-'+(12-labelColSpan)+'">'
			   +      '<select id="'+elId+'" multiple="multiple"  style="width:'+(elmentcfg.width||220)+'px" '+readOnly+'>'
			   +         optionsHtml
			   +      '</select>'
			   + '</div>'
			   +'</div>';
		  
		  var $that = $(html).appendTo($("#"+elmentcfg.containerId));
    	
		  $that.find("#"+elId).multiselect({
	              includeSelectAllOption: true,
	              enableFiltering: true,
	              maxHeight:500,
	              selectAllText:"全部",
	              nSelectedText:"项选中",
	              onChange: function(option, checked, select) {
	            	  self.triggerFieldChage(self.getMulitSelectValue($that));
	              }
	      });
		  
		  return  $that;	
 };
 
/**
 * 获取多选框选中的值
 * 
 * @param temlp
 *            多选框组件html代码
 * @returns 多选框选中的值
 */
 AI.FormField.prototype.getMulitSelectValue = function(temlp){

   	   var newVal="",newValName="";
        var $inputField = temlp.find(":checkbox");
        for(var i=0;i<$inputField.length;i++){
        	  var item = $inputField[i];
        	  if($(item).attr('value') == 'multiselect-all') continue;
        	  if($(item).is(':checked')){
        	     if(newVal){
        	     	 newVal+=","+$(item).attr('value');
        	     	 newValName+=","+$(item).attr("name");
        	     	}else {
        	     		newVal=$(item).attr('value');
        	     		newValName=$(item).attr("name");
        	     	};
        	  }
        };
        this.val=newVal;
        this.rawVal = newValName;
        return newVal;
};
/**
 * 根据表单字段配置生成多选下拉框标签元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的多选下拉框标签元素
 */
AI.FormField.prototype.buildMulitselectElement=function(elmentcfg){
	var label=elmentcfg.label||elmentcfg.fieldLabel;
	var label =this.getLabel(elmentcfg);
	var value=elmentcfg.value;
	var tip = elmentcfg.tip;
	var fieldName=elmentcfg.fieldName||label;
	var elementType = elmentcfg.type || "text";
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;

	var tipHtml="";
	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>'
	if(elmentcfg.parenttype=='form'){
    	var html= '<div class="form-group form-group-sm">'
			+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
			+  '<div class="col-sm-'+(12-labelColSpan)+'">'
			+  '   <div   id="'+this.id +'"></div>'
			+  tipHtml
			+ '</div>'
			+'</div>';
	}else if(elmentcfg.subtype && elmentcfg.subtype=='inline'){
   		var html= '<li style="margin-left:3px"> <input type="'+elementType+'" class="form-control" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'" placeholder="'+label+'" '+readOnly+'></li>'
	}else {
 		var html= '<li >'
			+'<label class="navbar-label">'+label+'</label>'
			+ '   <input type="'+elementType+'" class="form-control" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'" '+readOnly+'>'
			+'</li>'
	}
   var $that=$(html).appendTo($("#"+elmentcfg.containerId));
   ai.loadWidget("multiSelect");
   
   var field = new  AI.MultiSelect({
	    name : '程序名',
 		cls : 'form-element input-sm',
 		id : 'wrap'+fieldName,
 		containerId :fieldName,// /容器
 		sql : "",
 		storesqlId:'queryMetaUserNameOnly',
 		placeholder : '请选择...',
 		style : 'width : 200px;',
 		text : '没找到相关数据！',	// 警告内容
 		duplicates : true,	// 允许重复值
 		required : false,	// 允许为空
 		defaultValue :[{id:'sys',name:'王'}],// 默认选中值
 		minlen:0,	// 输入搜索字符的最小长度
 	});
    	
    return field;	
 };
/**
 * 根据表单字段配置生成多选下拉框标签元素,暂时无用
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的多选下拉框标签元素
 */
AI.FormField.prototype.buildMulitselectElement1=function(elmentcfg){
     var label=elmentcfg.label||elmentcfg.fieldLabel;
     var label=this.getLabel(elmentcfg);
    	var value=elmentcfg.value;
    	var storesql=elmentcfg.storesql;
    	var fieldName=elmentcfg.fieldName;
    	var height=elmentcfg.height||180;
    	var width=elmentcfg.width||200;	 
    	var elementType = elmentcfg.type;
    	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
       // var label =this.getLabel(elmentcfg);
    	var self=this;
    	
    	var allOptions=this.getOptions(storesql,value)
      
      var optionsHtml='<option></option>';
    	for(var i=0;i<allOptions.length;i++){
    		 var option=allOptions[i];
    		 var isChecked="";
    		 if(option.selected) isChecked='checked';
    		 // var optionHtml
				// =self.getOptionTip(elmentcfg,option.id,option.name);
    		  var option=allOptions[i];
    		 var isChecked="";
    		 if(option.selected) isChecked='checked=true'; 
				 optionsHtml+='<li ><a href="#"><input type="checkbox" name="'+option.name+'" value="'+option.id+'" '+isChecked+' '+readOnly+'/>'+option.name+'</a></li>';
			};
	 var containerId="container_"+(elmentcfg.id||elmentcfg.fieldName);
	 var elId = (elmentcfg.id||elmentcfg.fieldName);
	 var containerHtml='<li style="float:left;overflow:hidden;">&nbsp;&nbsp;</li>'
		 +'<div id="'+containerId+'" class="datepicker  dropdown-menu" style="top:130px;left:871px;width:'+(width+10)+'px;display: none;">'
     +'<li>'
     + '  <ul style="list-style:none;margin-left:1px;height:'+height+'px;overflow:scroll;">'
     +       optionsHtml       
     +'   </ul>'
    +'</li>'
    +'<li class="divider"></li>'
    +'<li style="display:inline; float:right; margin-right:8px; white-space:nowrap; line-height:25px; ">'
    +'    <span id="ok" class="btn btn-danger btn-small" href="#">OK</span>'
    +'    <span id="cancel" class="btn btn-small" href="#">Cancel</span>'
    +'</li>'
    +'</div>';
		$(containerHtml).appendTo("body");
		
		$("#"+containerId+" #ok").click(function () {
			 
          self.triggerFieldChage(self.getValue());
          $("#"+containerId).css({  display:"none" }); 
     });
     
		$("#"+containerId+" #cancel").click(function () {
          $("#"+containerId).css({  display:"none" });    
     });
     var $checks = $("#"+containerId).find(":checkbox");
     $checks.bind("click",function(){
     	  self.getValue();

     });
 
     var html='<li>'+label
              +'<input id="'+elId+'" type="text" placeholder="Type something…" value="'+(elmentcfg.value||'')+'" style="width:'+width+'px" '+readOnly+'/>'
              +'<span class="add-on" '+readOnly+'><i class="icon-glass"></i></span>' 
              +'</li>';
     var $that=$(html).appendTo($("#"+elmentcfg.containerId));
      
     $that.find("#"+elId).focus(function(){
     	   var offset = $(this).offset();
           $("#"+containerId).css({
               display:"block",
               top:offset.top + $(this).height() + 2,
               left:offset.left
           });
      });
     $triggers = $that.find(".icon-glass");
     $triggers.each(function () {
     	 $(this).click(function(){
     	 	   var offset = $(this).offset();
           $("#"+containerId).css({
               display:"block",
               top:offset.top + $(this).height() + 2,
               left:offset.left
           });
     	});
     });
    
	  return  $that;	
 };
/**
 * 根据表单字段配置生成bootstrap-tag编辑组件
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的bootstrap-tag组件
 */
AI.FormField.prototype.buildSelTagElement=function(elmentcfg){
	var label=elmentcfg.label;
	var storesql=elmentcfg.storesql;
	var value=elmentcfg.value;    
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var label =this.getLabel(elmentcfg);
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;

	ai.loadWidget("bootstraptags");

	var html='<div class="form-group form-group-sm">'
		+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>'
		+'<div class="col-sm-'+(12-labelColSpan)+'">'
		+'<div id="'+this.id+'" class="tag-list"></div>'
		+'</div>';
	var self=this;
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	var allOptions=this.getOptions(storesql,value);
	var tagEle = $("#"+this.id+".tag-list").tags({
		tagData : []
	});
	var arrnames=[]; 

	for(var i=0;i<allOptions.length;i++){
		var option=allOptions[i];
		var suggestion=option.name;
		arrnames.push(suggestion);
	}

	tagEle.suggestions=arrnames;
	tagEle.allOptions=allOptions;
	$("#"+this.id+" input").mouseout(function(){
		self.triggerFieldChage(tagEle.tagsArray1);
	});

	$("#"+this.id+" input").blur(function(){
		self.triggerFieldChage(tagEle.tagsArray1);
	});
	return $that;
};
/**
 * 根据表单字段配置生成日期输入框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的日期输入框
 */
AI.FormField.prototype.buildDateElement=function(elmentcfg){
	    ai.loadWidget("datepicker");
      var label=elmentcfg.label;
    	var value=elmentcfg.value;
    	var fieldName=elmentcfg.fieldName;
    	var elementType = elmentcfg.type;
    	// 修改支持yyyymmdd格式 20160608
    	var dateformat = 'yyyy-mm-dd';// songlh
    	if (elmentcfg.format&&(elmentcfg.format=='yyyymmdd')){
    		dateformat = 'yyyymmdd';
    		if (value) value=ai.timeidToDate(value).format('yyyy-mm-dd');
    	}
    	// end
    		var tip = elmentcfg.tip;
      var label =this.getLabel(elmentcfg);
    	var elId = elmentcfg.id||elmentcfg.fieldName;
    	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
    	var labelColSpan = elmentcfg.labelColSpan||2;
    	var elementPlaceholder = elmentcfg.placeholder || elmentcfg.label;
    	var tipHtml="";
    	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>'
    	if(elmentcfg.parenttype=='form'){
	    	var html= '<div class="form-group form-group-sm">'
		   +	'<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : 'col-sm-'+labelColSpan+' control-label')+'">'+label+'</label>' 
		   +  '<div class="col-sm-'+(12-labelColSpan)+'">'
		   +  '   <input type="text" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(value||"")+'" '+readOnly+'>'
		   +  tipHtml
		   + '</div>'
		   +'</div>'
		 }
		 if(elmentcfg.parenttype=='toolbar'){
			 var html= '<li><div class="form-group form-group-sm">'
				   +	'<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : '') +' style="position: relative;min-height: 1px;float: left;padding-top:8px;">'+label+'</label>' 
				   +  '   <input type="text" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+this.id+'" style="width:'+(elmentcfg.width||120)+'px" type="text" value="'+(value||"")+'" '+readOnly+'>'
				   +  tipHtml
				   +'</div></li>'
		 }
    	var self=this;         
     var $that=$(html).appendTo($("#"+elmentcfg.containerId));
     $that.find("#"+elId).datepicker({
                format:'yyyy-mm-dd'
      }).on('changeDate',function(newDate){
      	 self.triggerFieldChage(newDate.date.format(dateformat));// 20160608
      }); 
    
    	$that.find(".icon-th").datepicker({
                format:'yyyy-mm-dd'
       }).on('changeDate',function(newDate){
      	 self.triggerFieldChage(fieldName,newDate.date.format(dateformat));// 20160608
      }); 
         
		  return $that;
    };
/**
 * 根据表单字段配置生成日期范围输入框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的日期范围输入框
 */
AI.FormField.prototype.buildDateRangeElement=function(elmentcfg){
	   ai.loadWidget("daterangepicker");
    /*  $.extend(Date.CultureInfo,{
    	  dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
    	  abbreviatedDayNames:["日","一","二","三","四","五","六"],
    	  shortestDayNames:["日","一","二","三","四","五","六"],
    	  firstLetterDayNames:["日","一","二","三","四","五","六"],
    	  monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
    	  abbreviatedMonthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
      }); */
      var label=elmentcfg.label;
    	var value=elmentcfg.value || "";
    	var fieldName=elmentcfg.fieldName;
    	var elementType = elmentcfg.type;
    	var elementPlaceholder = elmentcfg.placeholder || elmentcfg.label;
      // var label =this.getLabel(elmentcfg);
    	var elId = this.id;
    	var labelColSpan = elmentcfg.labelColSpan||2;
    	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
    	var daterangeConfig = {"autoUpdateInput":false};
    	var now = new Date().format('Y-M-D');

    	if(elmentcfg.minDate) {
    		daterangeConfig.minDate = elmentcfg.minDate;
    		if(now < elmentcfg.minDate){
    			daterangeConfig.startDate = elmentcfg.minDate;
    			daterangeConfig.endDate = elmentcfg.minDate;
    		}
    	}
    	
    	if(elmentcfg.maxDate) {
    		daterangeConfig.maxDate = elmentcfg.maxDate;
    		if(now > elmentcfg.maxDate){
    			daterangeConfig.startDate = elmentcfg.maxDate;
    		}
    	}
    	 
    	daterangeConfig.locale = {
                    "format": "YYYY-MM-DD",
                    "separator": " - ",
                    "applyLabel": "确定",
                    "cancelLabel": "清除",
                    "fromLabel": "从",
                    "toLabel": "到",
                    "customRangeLabel": "Custom",
                    "weekLabel": "W",
                    "daysOfWeek": ["日", "一", "二", "三", "四", "五", "六"],
                    "monthNames": ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
                    "firstDay": 0
    	}
    	
    	if(elmentcfg.parenttype=='form'){
	    	var html= '<div class="form-group form-group-sm">'
		   +	'<label for="'+elId+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : 'col-sm-'+labelColSpan+' control-label')+'">'+label+'</label>' 
		   +    '<div class="col-sm-'+(12-labelColSpan)+'">'
		   +    '   <input type="text" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+elId+'" placeholder="请选择时间段…" style="width:'+(elmentcfg.width||220)+'px" value="'+value+'" '+readOnly+'>'
		   + '</div>'
		   +'</div>'
		 }
		 if(elmentcfg.parenttype=='toolbar'){
			 var html= '<li><div class="form-group form-group-sm">'
				   +	'<label for="'+elId+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : '') +' style="position: relative;min-height: 1px;float: left;padding-top:8px;">'+label+'</label>' 
				   +  '   <input type="text" placeholder="'+elementPlaceholder+'" class="form-control input-sm" id="'+elId+'" style="width:'+(elmentcfg.width||120)+'px" type="text" value="'+value+'" '+readOnly+'>'
				   +'</div></li>'
		 }
/*    	var html='<li style="float:left;overflow:hidden;">&nbsp;&nbsp;</li>'
        +'<li style="list-style: none;">'
        +'    <div class="controls">'
        +'        <div class="input-prepend">'
        +			'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>'
       // +'          <span data-date-format="yyyy-mm-dd" data-date="2012-12-02" id="'+elId+'_date" class="input-append date" '+readOnly+'>'
        +'          <input id="'+elId+'" type="text" class="form-control input-sm span2" placeholder="请选择时间段…" value="'+value+'" style="width:'+(elmentcfg.width||160)+'px"  '+readOnly+'/>'
       // +' <span class="add-on"><i class="icon-th"></i></span>'
        +'    </div>'
        +'</li>';*/
     var self=this;   
     var $that=$(html).appendTo($("#"+elmentcfg.containerId));
     
     $that.find("#"+elId).daterangepicker(daterangeConfig);
     $that.find('#'+elId).on('apply.daterangepicker', function(ev, picker) {
         $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
     });
     
     $that.find('#'+elId).on('cancel.daterangepicker', function(ev, picker) {
         $(this).val('');
     });
		  return $that;
    };
/**
 * 根据表单字段配置生成日期范围输入框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的日期范围输入框
 */

AI.FormField.prototype.buildFullDateRangeElement=function(elmentcfg){
  ai.loadWidget("datepicker");
    var label=elmentcfg.label;
	var value=elmentcfg.value;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	// 修改支持yyyymmdd格式 20160608
	var dateformat = 'yyyy-mm-dd';// songlh
	if (elmentcfg.format&&(elmentcfg.format=='yyyymmdd')){
		dateformat = 'yyyymmdd';
		if (value) value=ai.timeidToDate(value).format('yyyy-mm-dd');
	}
	// end
	var daterangeConfig = {
		format:'yyyy-mm-dd',
	    autoclose: true
	 } ;
	var tip = elmentcfg.tip;
    var label =this.getLabel(elmentcfg);
	var elId = elmentcfg.id||elmentcfg.fieldName;
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
	var elementPlaceholder = elmentcfg.placeholder || elmentcfg.label;
	var tipHtml="";
	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>'
	 var html= '<li><div class="form-group form-group-sm">'
		   +	'<label for="'+this.id+'" class="'+(elmentcfg.labelHidden == true ? 'sr-only' : '') +' style="position: relative;min-height: 1px;float: left;padding-top:8px;">'+label+'</label>' 
		   +  '<input type="text" placeholder="开始日期" class="form-control input-sm" id="'+this.id+'_min" style="width:100px" type="text" value="'+(value||"")+'" '+readOnly+'>'
		    +  '<span>至</span><input type="text" placeholder="结束日期" class="form-control input-sm" id="'+this.id+'_max" style="width:100px" type="text" value="'+(value||"")+'" '+readOnly+'>'
		   +  tipHtml
		   +'</div></li>'
	var self=this;         
	 var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	 $that.find("#"+elId+"_min").datepicker(daterangeConfig).on('changeDate',function(newDate){
	  	 self.triggerFieldChage(newDate.date.format(dateformat));// 20160608
	  	  $that.find("#"+elId+"_max").datepicker('setStartDate',newDate.date)
	  }).on('change',function(){
	  	if($(this).val().trim()=='') $that.find("#"+elId+"_max").datepicker('setStartDate',null);
	  }); 
	 $that.find("#"+elId+"_max").datepicker(daterangeConfig).on('changeDate',function(newDate){
	  	 self.triggerFieldChage(newDate.date.format(dateformat));// 20160608
	  	 $that.find("#"+elId+"_min").datepicker('setEndDate',newDate.date)
	  }).on('change',function(){
	  	if($(this).val().trim()=='') $that.find("#"+elId+"_min").datepicker('setEndDate',null);
	  });; 
	   return $that;
}
/**
 * 根据表单字段配置生成调色板输入框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的调色板输入框
 */

AI.FormField.prototype.buildColorElement=function(elmentcfg){
	    ai.loadWidget("colorpicker");
      var label=elmentcfg.label;
    	var value=elmentcfg.value;
    	var fieldName=elmentcfg.fieldName;
    	var elementType = elmentcfg.type;
      var label =this.getLabel(elmentcfg);
    	var elId = elmentcfg.id||elmentcfg.fieldName;
    	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
    	var html="<li>"+label
    	         +'<input id="'+elId+'" type="text" placeholder="请选择颜色…" value="'+value+'" style="width:'+(elmentcfg.width||220)+'px" '+readOnly+'/>'
    	       // +'<span class="add-on"><i class="icon-th"></i></span>'
    	         +"</li>"
     
     var $that=$(html);
     $that.appendTo($("#"+elmentcfg.containerId));
     var self=this;
     $that.find("#"+elId).colorpicker({
            format: 'hex'    
      }).on('hide', function(ev){
        self.triggerFieldChage(ev.color.toHex()); 
     }); 
 
		  return $that;
    };
/**
 * 根据表单字段配置生成图片选择框
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的图片选择框
 */
AI.FormField.prototype.buildImgPicker=function(elmentcfg){
	var label=elmentcfg.label;
	var value=elmentcfg.value;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var label =this.getLabel(elmentcfg);
	var elId = elmentcfg.id||elmentcfg.fieldName;
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var self=this;
	var dlgHtml ='<div id="_ImgPickerDialog" class="modal hide fade"  tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true" style="overflow:hidden;width:760px">'
        +'<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3>选择图片</h3></div>'
        +'<div class="modal-body">'
        +'<ul class="nav nav-tabs"> <li class="active"><a href="#smallgallery" data-toggle="tab">小图标</a></li> <li class=""><a href="#middlegallery" data-toggle="tab">中图标</a></li><li class=""><a href="#biggallery" data-toggle="tab">大图标</a></li> <li class=""><a href="#largegallery" data-toggle="tab">背景图</a></li></ul>'
        +'<div class="tab-content">'
        +'<div class="tab-pane fade active in" id="smallgallery"> <ul class="gallery small"> </ul></div>'
        +'<div class="tab-pane fade" id="middlegallery"> <ul class="gallery middle"></ul></div>'
        +'<div class="tab-pane fade" id="biggallery"> <ul class="gallery big"> </ul> </div>'
        +'<div class="tab-pane fade" id="largegallery"> <ul class="gallery large"> </ul> </div>'
        +'</div>'
        +'</div>'
        +'<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Close</button><button id="_ImgPickerDialog-ok" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">确定</button></div>'
        +'</div>';
	if($("#_ImgPickerDialog").length==0){
        var $imgDlg = $(dlgHtml).appendTo("body");
        var imgStore = new AI.JsonStore({
			service: 'api/dps/meta/queryMinderWidgetDefaultIcon',
			pageSize: -1,
			key: 'IMG'
		});
        $("#_ImgPickerDialog-ok").attr("selectval","");
        for(var i=0;i<imgStore.length;i++){
        	$('<li><img src="'+imgStore[i].IMG+'"></li>').appendTo("#smallgallery ul" ,$imgDlg);
        	$('<li><img src="'+imgStore[i].IMG+'"></li>').appendTo("#middlegallery ul" ,$imgDlg);
        	$('<li><img src="'+imgStore[i].IMG+'"></li>').appendTo("#biggallery ul" ,$imgDlg);
        	$('<li><img src="'+imgStore[i].IMG+'"></li>').appendTo("#largegallery ul" ,$imgDlg);
		} 
		$(".gallery img",$imgDlg).click(function(){
			$(".gallery li",$imgDlg).removeClass("select");
			$(this).parent().addClass("select");
			$("#_ImgPickerDialog-ok").attr("selectval",$(this).attr("src"));
		});
        $("#_ImgPickerDialog-ok").click(function(){
        	  var imgsrc=$("#_ImgPickerDialog-ok").attr("selectval");
        	  if(!imgsrc){alert("没有选择图片");return false;}
        	  $("#"+elId).val(imgsrc);
        	  self.triggerFieldChage(imgsrc);
        	  return true;
        });
	}
	var html="<li>"+label
		+'<input id="'+elId+'" type="text" placeholder="请选择图片…" value="'+value+'" style="width:'+(elmentcfg.width||220)+'px"  '+readOnly+'/>'
		+'<span class="add-on" '+readOnly+'><i class="icon-th"></i></span>'
		+"</li>";

	var $that=$(html);
	$that.appendTo($("#"+elmentcfg.containerId));
	$(".icon-th",$that).click(function(){
		$("#_ImgPickerDialog").modal().show();
	});
     
	var self=this;

	return $that;
};
/**
 * 表单字段组件显示
 */
AI.FormField.prototype.show = function(){
	this.control.show();
	
};
/**
 * 表单字段组件隐藏
 */
AI.FormField.prototype.hide = function(){
	this.control.hide();
};    
/**
 * 根据表单字段配置生成按钮组件
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的按钮组件
 */
AI.FormField.prototype.buildButton=function(elmentcfg){
	var label=elmentcfg.label||elmentcfg.fieldName;
	var value=elmentcfg.value;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var attr=elmentcfg.attr||'';
	var btnHtml='<li style="float:left;overflow:hidden;"><button id="'+elmentcfg.id+'" '+readOnly+" "+attr;
	var btnClass="btn ";
	var self=this;
	var labelColSpan = elmentcfg.labelColSpan||2;
	if(elmentcfg.elclass) btnClass+="  "+elmentcfg.elclass;
	if(elmentcfg.sizetype) btnClass+="  "+elmentcfg.sizetype;
	btnHtml+=' class="'+btnClass+'" ';
	if(elmentcfg.parenttype=="toolbar") btnHtml+=' style="margin-top:0px" '; 
	if(elmentcfg.style) btnHtml+=' style="'+elmentcfg.style+'" '; 
	if(elmentcfg["data-toggle"]) btnHtml+='data-toggle='+elmentcfg["data-toggle"];
	btnHtml+='>'+(elmentcfg.label||elmentcfg.fieldLabel)+'</button></li>';
	if(elmentcfg.parenttype=='form'){
	 var html= '<div class="form-group form-group-sm">'
		+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label"> </label>' 
		+	'<div class="col-sm-'+(12-labelColSpan)+'"><ul>'
		+	btnHtml
		+	'</ul></div>'
		+	'</div>';
	 }
	 else{
	 	html=btnHtml; 
	}
	var btn=$(html).appendTo($("#"+elmentcfg.containerId));

	if(elmentcfg.clickfun){
		if (typeof elmentcfg.clickfun === "string") {
			elmentcfg.clickfun = (new Function("return " + elmentcfg.clickfun))();
		}
		btn.find('button').bind('click',function(){
			var cmpId = $("button",$(this)).attr("id");
			if(typeof(minderGraph)!='undefined' && minderGraph && minderGraph.allWidget){
				var thisWidget = minderGraph.allWidget[cmpId];
				if(thisWidget) thisWidget.publish("click",this);
			};
			var result={};
			if(elmentcfg.parent && elmentcfg.parent.getAllFieldValue)result =  elmentcfg.parent.getAllFieldValue();
			if (typeof elmentcfg.clickfun == "function"){
				return elmentcfg.clickfun(result,self);
			}else{
				return AI.Action.actFun(elmentcfg.clickfun,elmentcfg.clickpara);
			}
		});
	}else{
		btn.bind('click',function(){
			var cmpId = $("button",$(this)).attr("id") ;
			if(typeof minderGraph != 'undefined' && minderGraph && minderGraph.allWidget){
				var thisWidget = minderGraph.allWidget[cmpId];
				if(thisWidget) thisWidget.publish("click",this);
			};
		});
	};
    	
      return btn;
 };
/**
 * 根据表单字段配置生成按钮组
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的按钮组
 */
AI.FormField.prototype.buildButtonGroup=function(elmentcfg){
	if(!elmentcfg.buttons) return;
	var label=elmentcfg.label;
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var notNull = elmentcfg.notNull;
	var label =this.getLabel(elmentcfg); 
	var allOptions=this.getOptions(storesql,value);
	var onlyone = (elmentcfg.onlyone=='y'? true:false);
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
	var self=this;
	var buttons = (new Function("return "+elmentcfg.buttons))();
	
	var html= '<div class="form-group form-group-sm">'
		+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label"> </label>'
		+	'<div class="col-sm-'+(12-labelColSpan)+'" id="'+this.id+'"><ul>'
		+	'</ul></div>'
		+	'</div>';
	// var html= '<li style="float:left;overflow:hidden;white-space: nowrap;">'
	// +label+'<span id="'+elmentcfg.id+'" class="btn-group"
	// style="margin-top:10px">'+optionsHtml +'</span></li>';
	var $that =$(html).appendTo($("#"+elmentcfg.containerId));
	for(var i=0;i<buttons.length;i++){
		var btn=buttons[i];
		var $btn=$('<button id="btn-'+i+'" type="button" class="btn btn-small">'+btn.label+'</button>');
		$btn.on('click',btn.clickfun);
		var $li=$('<li style="float:left;overflow:hidden;white-space: nowrap;"> <span id="'+elmentcfg.id+'" class="btn-group" style="margin-top:10px"> </span></li>');
		$li.find('span').append($btn);
		$that.find('ul').append($li);
	}
	return $that;
};
/**
 * 根据表单字段配置生成下拉菜单
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的下拉菜单
 */
AI.FormField.prototype.buildDropMenu=function(elmentcfg){
	var label=elmentcfg.label;
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var elementType = elmentcfg.type;
	var notNull = elmentcfg.notNull;
	var label =this.getLabel(elmentcfg); 
	var allOptions=this.getOptions(storesql,value)
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var self=this;
    	var optionsHtml='';
    	for(var i=0;i<allOptions.length;i++){
    		 var option=allOptions[i];
    		 
    		 if(option.selected) isChecked='btn-primary';
    		 // var optionHtml
				// =self.getOptionTip(elmentcfg,option.id,option.name);
    		   
				 optionsHtml+='<li style="float:left;overflow:hidden;"><a id="'+option.id+'" '+readOnly+'>'+option.name+'</a></li>';
			};
			var html=  '<li class="dropdown">' +elmentcfg.label+"&nbsp;"+
			           '<a class="dropdown-toggle" id="'+this.id+'" role="button" data-toggle="dropdown" href="#"><label>Dropdown</label> <b class="caret"></b></a>'+
                '<ul id="'+fieldName+'" class="dropdown-menu" role="menu" aria-labelledby="'+this.id+'">'+
                  optionsHtml
                '</ul></li>';
			var $that =$(html).appendTo($("#"+elmentcfg.containerId));
 
			$('ul a',$that).click(function(){
				  var fieldName = $(this).parent().parent().attr("id");
// alert($(this).text()+","+fieldName);
				  $(".dropdown-toggle#"+fieldName+" label").text($(this).text())
				  self.triggerFieldChage($(this).attr('id'),$(this).text());
			});
			 
			return $that;
 };
/**
 * 根据表单字段配置生成复杂多选框:VALUES1 用于做键值
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的复杂多选框
 */
AI.FormField.prototype.buildSelBoxElement=function(elmentcfg){
	var label=elmentcfg.label;
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var storesqlId = elmentcfg.storesqlId;
	var fieldName=elmentcfg.fieldName;
	var height=elmentcfg.height||180;
	var width=elmentcfg.width||200;	 
	var elementType = elmentcfg.type;
	var label =this.getLabel(elmentcfg);
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
	
	var denpend =elmentcfg.dependen || "";
	
	var self=this;
	var html= '<div class="form-group form-group-sm">'
		+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
		+  '<div class="col-sm-'+(12-labelColSpan)+'">'
		+ '   <div class="input-group input-group-sm" style="width:'+(elmentcfg.width||320)+'px" >'
		+  '   <input type="text" class="form-control input-sm" id="'+this.id+'" value="'+(value||"")+'" '+readOnly+'>'
		+  '   <span class="input-group-addon" '+readOnly+'><i href="#" class="glyphicon glyphicon-zoom-in"></i></span>'
		+ '  </div>'
		+ '</div>'
		+'</div>';
     
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	function afterSelect(records){
		var val="";
		for(var i=0;i<records.length;i++){
			var valTmp = records[i].get('KEYFIELD')||records[i].get('VALUES1');
			val += ((i==0?"":",")+valTmp);
		};
		$("#"+self.id,$that).val(val);
		self.triggerFieldChage(val);
	}; 
	  
	$(".input-group-addon",$that).click(function(){
		var selectedValue = $("#"+self.id,$that).val();// 选中的值
		var storesql2 = storesql;
		if(denpend){
			deps = denpend.split(",");
			for(var i = 0 ; i < deps.length ;i++){
				var dval = $("#"+deps[i]).val();
				var temp = "{"+deps[i]+"}";
				storesql2 = storesql2.replace(temp,dval);
			}
		}
		var selBox=new SelectBox({sql:storesql2,callback:afterSelect,selectedValue:selectedValue,storesqlId:storesqlId});
		selBox.show();
		return true;
	 });
	if(elmentcfg.isReadOnly==='y') $that.find(".input-group-addon").unbind('click');
	return  $that;	
};
/**
 * 根据表单字段配置生成复杂多选框:VALUES1用于显示的值 VALUES4 用于做键值
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的复杂多选框
 */
AI.FormField.prototype.buildMapBoxElement=function(elmentcfg){
	// 键值对显示selbox值格式为key1,key2|value1,value2 sql语句：SELECT dataname VALUES1,
	// datacnname VALUES2,XMLID VALUES4 FROM tablefile WHERE dbname='{val}'
	// VALUES1用于显示的值 VALUES4 用于展示的值
	var label=elmentcfg.label;
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var height=elmentcfg.height||180;
	var width=elmentcfg.width||200;	 
	var elementType = elmentcfg.type;
	var label =this.getLabel(elmentcfg);
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
  
  if(value&&value.indexOf("|")!=-1){
  	value = value.substring(value.indexOf("|")+1);
  }
	var self=this;
	var html= '<div class="form-group form-group-sm">'
		+	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
		+  '<div class="col-sm-'+(12-labelColSpan)+'">'
		+ '   <div class="input-group input-group-sm" style="width:'+(elmentcfg.width||320)+'px" >'
		+  '   <input type="text" class="form-control input-sm" id="'+this.id+'" value="'+(value||"")+'" readOnly>'
		+  '   <span class="input-group-addon" '+readOnly+'><i href="#" class="glyphicon glyphicon-zoom-in"></i></span>'
		+ '  </div>'
		+ '</div>'
		+'</div>';
     
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	function afterSelect(records){
		var keyval="";
		var valueval ="";
		for(var i=0;i<records.length;i++){
			var keyvalTmp = records[i].get('KEYFIELD')||records[i].get('VALUES4');
			keyval += ((i==0?"":",")+keyvalTmp);
			var valuevalTmp = records[i].get('VALUEFIELD')||records[i].get('VALUES1');
			valueval += ((i==0?"":",")+valuevalTmp);
		};
		var val = keyval+"|"+valueval;
		$("#"+this.id,$that).val(valueval);
		self.triggerFieldChage(val);
	}; 
	  
	$(".input-group-addon",$that).click(function(){
		var selectedValue = $("#"+this.id,$that).val();// 选中的值
		var selBox=new SelectBox({sql:storesql,callback:afterSelect,selectedValue:selectedValue});
		selBox.show();
		return true;
	 });
	if(elmentcfg.isReadOnly==='y') $that.find(".input-group-addon").unbind('click');
 
	return  $that;	
};
/**
 * 根据表单字段配置生成多层次元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的多层次元素
 */
AI.FormField.prototype.buildMulitLevelElement=function(elmentcfg){
	if(!elmentcfg.levelSqls){
		alert("请配置levelSqls选项！");return;
	}
	var _self = this;
	var label=elmentcfg.label;
	var value=elmentcfg.value||'';
	value=value.split("|");
	var editable=elmentcfg.editable||"Y";
	var levelSqls=elmentcfg.levelSqls;
	var label=this.getLabel(elmentcfg);
	var fieldName=elmentcfg.fieldName;
	var placeholder=elmentcfg.placeholder||'请选择';
	var readOnly=elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
	var _buildSelect = function(level,sql){
		var changeVal = function(id,val){
			var inputVals = $inputField.val()||[];
			if(inputVals&&inputVals.length>0){inputVals = inputVals.split("|");}
			inputVals[id] = val;
			var valStr='';
			for(var i=0;i<inputVals.length;i++){
				valStr+=("|"+inputVals[i]);
			}
			$inputField.val(valStr.slice(1));
		};
		for(var i=$inputField.find('select').length-1;i>-1;i--){
			if(i>=level){
				$inputField.find('select#'+i).remove();
				changeVal(i,'');
			}
		}
		var optionsLvl=_self.getOptions(sql,value[level]);
		if(optionsLvl.length<1){return;}
		var optionsHtml='<option value="">'+placeholder+'</option>';
		var selVal='';
		for(var i=0;i<optionsLvl.length;i++){
			var option=optionsLvl[i];
			if(option.selected) selVal=option.id;
			optionsHtml+='<option '+readOnly+' value="'+option.id+'" >'+option.name+'</option>';
		};
		$sel = $('<select id="'+level+'" value="'+selVal+'" class="multi-level" '+readOnly+'>'+optionsHtml+'</select>');
		$sel.val(selVal);
		$sel.css('width',(elmentcfg.width||100)).on('change',function(){
			var val = $(this).val();var id = $(this).attr('id');
			changeVal(parseInt(id),val);
			if(levelSqls.length>parseInt(id)+1){
				_buildSelect(parseInt(id)+1,levelSqls[parseInt(id)+1].replaceAll('{parentcode}',val));
			}
		});
		
		$inputField.append($sel);
	};
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var tipHtml = '<input id="custom-input" type="text" class="form-control input-sm hide" style="float:left;width:220px;"/>';
	tipHtml += '<span id="edit-btn" class="glyphicon glyphicon-edit" style="cursor:pointer;padding:10px;" aria-hidden="true"></span>';
	tipHtml=readOnly=='disabled'?"":tipHtml;
	var html= '<div class="form-group form-group-sm">'
		+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>'
		+'<div class="col-sm-'+(12-labelColSpan)+'">'
		+'<div class="input-group input-group-sm" id="'+this.id+'" style="display:inline;">'
		+'</div>'
		+'<div style="display:inline;">'+tipHtml+'</div>'
		+'</div>'
		+'</div>';
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	var $inputField=$that.find("#"+this.id);
	for(var i=0;i<value.length;i++){
		_buildSelect(i,levelSqls[i].replaceAll('{parentcode}',value[(i==0?0:(i-1))]));
	}
	if(value.length==0){_buildSelect(0,levelSqls[0]);}

	$that.find('#edit-btn').on('click',function(){
		$that.find('#edit-btn').toggleClass('glyphicon-edit').toggleClass('glyphicon-check');
		$that.find('#custom-input').toggleClass('hide');
		$that.find("#"+this.id).toggleClass('hide');
	});
	$that.find('#custom-input').on('change',function(){
		if($(this).val()){
			_buildSelect(0,levelSqls[0]+" union select '"+$(this).val()+"','"+$(this).val()+"'");
			$that.find("#"+this.id+" #0").val($(this).val());
			$("#0").trigger("change");
		}else{
			_buildSelect(0,levelSqls[0]);
		}
	});	

	if(editable == "N") {
		$that.find('#edit-btn').hide();
	}

	return $that;
};
/**
 * 根据表单字段配置生成选择列表元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的选择列表元素
 */
AI.FormField.prototype.buildSelectListElement=function(elmentcfg){
	var _self = this;
	var label=elmentcfg.label;
	var value=elmentcfg.value||'';
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var label=this.getLabel(elmentcfg);
	var placeholder=elmentcfg.placeholder||'请选择';
	var readOnly=elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var allowRepeat = elmentcfg.allowRepeat||false;
	var showSelect = storesql&&storesql.length>0;
	var labelColSpan = elmentcfg.labelColSpan||2;

	var options=_self.getOptions(storesql,value);
	var selVal='';var optionsHtml="";
	for(var i=0;i<options.length;i++){
		var option=options[i];
		if(option.selected) selVal=option.id;
		optionsHtml+='<li><a id="'+option.id+'" name="'+option.name+'">'+option.name+'</a></li>'
	};
	var changeVal = function(val){
		var valStr='';
		for(var i=0;i<$that.find('.select-list-item').length;i++){
			var $item = $($that.find('.select-list-item')[i]);
			valStr += ((i==0?"":";")+(showSelect?($item.find(' button').attr('name')+'£'):'')+$item.find('input').val());
		}
		if(elmentcfg.addText){
			elmentcfg.addText(val,null,_self.control);
		}
		if(elmentcfg.resetVal){
			valStr = elmentcfg.resetVal(valStr);
		}
		$that.find('#'+this.id).val(valStr);
		_self.triggerFieldChage(valStr);
	};

	var html= '<div class="form-group form-group-sm">'
		+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>'
		+'<div class="col-sm-'+(12-labelColSpan)+'">'
		+'<span id="plus-btn" class="glyphicon glyphicon-plus" style="cursor:pointer;padding:10px;" aria-hidden="true"></span>'
		+'<div id="select-list-items"></div>'
		+'</div>'
		+'</div>';
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	var shorten = function($el,text,val){
		$el.find('button').attr('title',text).attr('name',val);
		text = text.length>5?(text.slice(0,3)+'...'):text;
		$el.find('button').text(text);
	};
	var _buildItem = function(value){
		var val = value||'';
		var vals = val.split('£');
		var _ph=placeholder;
		for(var i=0;i<options.length;i++){
			if(vals[0]==options[i].id){
				_ph = options[i].name;
			}
		}
		var selectHtml = '';
		if(showSelect){
			selectHtml+='<div class="input-group-btn" style="min-width:28px;">'
			+'<button type="button" class="btn btn-default btn-sm dropdown-toggle" name="'+(vals[0]||'')+'" data-toggle="dropdown" aria-expanded="false" >'+_ph
			+'</button>'
			+'<ul class="dropdown-menu" role="menu">'
			+optionsHtml
			+'</ul>'
			+'</div>';
		}
		var $sel = $('<div class="select-list-item">'
			+'<div class="input-group" style="width:220px;float:left;">'
			+selectHtml
			+'<input type="text" class="form-control" '+readOnly+' value="'+(vals[1]||'')+'">'
			+'</div>'
			+'<span id="remove-btn" class="glyphicon glyphicon-trash" style="cursor:pointer;padding:10px;" aria-hidden="true"></span>'
			+'</div>');
		$sel.find('#remove-btn').on('click',function(){
			$sel.remove();
			changeVal(null);
		});
		$sel.find('a').off('click').on('click',function(){
			shorten($sel,$(this).text(),$(this).attr('id'));
			changeVal($(this).attr('id'));
		});
		$sel.find('input').off('change').on('change',function(){
			changeVal($(this).val());
		});
		$that.find('#select-list-items').append($sel);
	};
	$that.find('#plus-btn').on('click',function(){
		_buildItem();
	});
	if(value&&value.length>0){
		var valArray = value.split(';');
		for(var i=valArray.length-1;i>=0;i--){
			var valCell=valArray[i];
			_buildItem(valCell);
		};
	}
	return $that;
};
/**
 * 根据表单字段配置生成选择列表元素，暂时没有用
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的选择列表元素
 */
AI.FormField.prototype.buildSelectListElement1=function(elmentcfg){
	var _self = this;
	var label=elmentcfg.label;
	var value=elmentcfg.value||'';
	var storesql=elmentcfg.storesql;
	var fieldName=elmentcfg.fieldName;
	var label=this.getLabel(elmentcfg);
	var placeholder=elmentcfg.placeholder||'请选择';
	var readOnly=elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var allowRepeat = elmentcfg.allowRepeat||false;
	var labelColSpan = elmentcfg.labelColSpan||2;

	var options=_self.getOptions(storesql,value);
	var optionsHtml='<option value="">'+placeholder+'</option>';
	var selVal='';
	for(var i=0;i<options.length;i++){
		var option=options[i];
		if(option.selected) selVal=option.id;
		optionsHtml+='<option id="'+option.id+'" '+readOnly+' value="'+option.id+'" name="'+option.name+'" num="'+i+'">'+option.name+'</option>';
	};

	$sel = $('<select id="'+this.id+'-select" value="'+selVal+'" class="select-list form-control input-sm" style="width:220px">'+optionsHtml+'</select>');
	var html= '<div class="form-group form-group-sm">'
		+'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>'
		+'<div class="col-sm-'+(12-labelColSpan)+'">'
		+'<div class="input-group input-group-sm" id="'+this.id+'">'
		+'</div>'
		+'<div id="select-list-items" style=" float: left;max-height:80px;width:220px;overflow-y:auto;"></div>'
		+'</div>'
		+'</div>';
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));

	var changeVal = function(){
		var valStr='';
		for(var i=0;i<$that.find('.select-list-item').length;i++){
			var $item = $($that.find('.select-list-item')[i]);
			valStr += (';'+$item.find('input').val());
			/* valStr += (';'+$item.attr('id')+','+$item.find('input').val()); */
		}
		_self.triggerFieldChage(valStr.indexOf(';')==0?valStr.slice(1):valStr);
	};
	var _buildInput = function(id,value){
		value=value||'';
		var $textEl = $('<div id="'+id+'" class="input-group select-list-item" style="border:1px solid">'
			+'<input type="text" class="form-control input-sm" value="'+value+'" style="border:0 none;background:none;">'
			+'<span class="input-group-btn">'
			+'<button type="button" class="close remove-item"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
			+'</span>'
			+'</div>');
		$textEl.find('.remove-item').off('click').on('click',function(){
			$(this).parents('.select-list-item').remove();
			changeVal();
		})
		$textEl.find('input').off('change').on('change',function(){
			changeVal();
		});
		$that.find('#select-list-items').append($textEl);
		return $textEl;
	};

	if(value&&value.length>0){
		var valArray = value.split(';');
		for(var i=valArray.length-1;i>=0;i--){
			var valCell=valArray[i];
			_buildInput(valCell,valCell);
		};
	}

	$sel.on('change',function(){
		var _val=$(this).val();
		if($that.find('#select-list-items #'+_val).length==0||allowRepeat){
			var $text = _buildInput(_val);
		}
		if(elmentcfg.addText&&$text){
			var num = $that.find('option#'+_val).attr('num');
			elmentcfg.addText(_val,options[parseInt(num)],$text,options);
		}
	});
	$that.find('#'+this.id).append($sel);
	return $that;
};
/**
 * 根据表单字段配置生成树结构元素
 * 
 * @param elementcfg
 *            表单字段元素配置信息
 * @returns 生成的树结构元素
 */
AI.FormField.prototype.buildSelectTreeElement=function(elmentcfg){
	ai.loadRemotJsCss("/{contextPath}/dacp-view/aijs/css/selecttree.css"); 
	var id =elmentcfg.id||elmentcfg.fieldName;
	var label =elmentcfg.label;
	var value=elmentcfg.value;
	var storesql=elmentcfg.storesql;
	var options=this.getOptions(storesql,value);
	var _value = "";
	for(var i=0;i<options.length;i++){
		if(options[i].selected){
			_value = options[i].name;
		}
	}
	// console.log(options);
	var tip = elmentcfg.tip||'';
	var notNullValue=elmentcfg.notNull;
	var fieldName=elmentcfg.fieldName||label;
	var elementType = elmentcfg.type || "text";
	var readOnly = elmentcfg.isReadOnly&&elmentcfg.isReadOnly==='y' ? 'disabled' : '';
	var labelColSpan = elmentcfg.labelColSpan||2;
	var tipHtml="";
	if(tip) tipHtml='<span class="help-block text-warning">'+tip+'</span>';
	var menuContent = '<div class="col-sm-2"></div><div class="col-sm-10"><div id="menuContent" class="menuContent" style="display:none;width:'+(elmentcfg.width||220)+'px;border:1px solid #cbd5dd; height: 100px;overflow:auto;">'+// position:
																																																										// fixed;z-index:9;
					'<ul id="treeDemo" class="ztree-widget" style="margin-top:0; width:'+(elmentcfg.width||220)+'px;"></ul>'+
				'</div></div>';
	if(elmentcfg.parenttype=='form'){
		var html= '<div class="form-group form-group-sm">'
		   +	'<label for="'+this.id+'" class="col-sm-'+labelColSpan+' control-label">'+label+'</label>' 
		   +  '<div class="col-sm-'+(12-labelColSpan)+'">'
		   +  '   <input type="text" class="form-control input-sm" id="_'+id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" notNull="'+notNullValue+'" value="'+(_value||"")+'" '+readOnly+' />'
		   +  '	  <input type="text" id="'+id+'" value="'+(value||"")+' " style="display:none;"/>'
		   +tipHtml
		   + '</div>'+menuContent
		   +'</div>';
	}else{
    	if(elmentcfg.subtype && elmentcfg.subtype=='inline'){
   			var html= '<li style="margin-left:3px"> <input type="'+elementType+'" class="form-control" id="_'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(_value||"")+'" placeholder="'+label+'"/>'
   			+'<input type="text" id="'+id+'" value="'+(value||"")+' " style="display:none;"/></li>'
 	 		}
 			else {var html= '<li >'
		 	  +'<label class="navbar-label">'+label+'</label>'
		 	  + '   <input type="'+elementType+'" class="form-control" id="_'+this.id+'" style="width:'+(elmentcfg.width||220)+'px" type="text" value="'+(_value||"")+' " />'
		 	  + '	<input type="text" id="'+id+'" value="'+(value||"")+' " style="display:none;"/>'
		 	  +menuContent
		 	  +'</li>'
	 	 }
   };
	var $that=$(html).appendTo($("#"+elmentcfg.containerId));
	if(elmentcfg.type==='hidden'){
		$that.hide();
	}
	var setting = {
		check: {
			enable: true,
			chkStyle: "radio",
			radioType: "all"
		},
		view: {
			dblClickExpand: false
		},
		data: {
			simpleData: {
				enable: true,
				idKey: "id",
				pIdKey: "pid",
				rootPId: ""
			}
		},
		callback: {
			// onClick: onClick,
			onCheck: onCheck
		}
	};

	function onClick(e, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		zTree.checkNode(treeNode, !treeNode.checked, null, true);
		return false;
	}

	function onCheck(e, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
		nodes = zTree.getCheckedNodes(true),
		_v = "",v="";
		for (var i=0, l=nodes.length; i<l; i++) {
			_v += nodes[i].name + ",";
			v += nodes[i].id + ",";
		}
		if (_v.length > 0 ) _v = _v.substring(0, _v.length-1);
		if (v.length > 0 ) v = v.substring(0, v.length-1);
		$("#_"+id).attr("value", _v);
		$("#"+id).attr("value", v);
	}

	function showMenu() {
		var cityObj = $("#_"+id);
		var cityOffset = $("#_"+id).offset();
		$("#menuContent").slideDown("fast");// .css({"margin-left":"80px",
											// "margin-top":"5px"})
		$("body").bind("mousedown", onBodyDown);
	}
	function hideMenu() {
		$("#menuContent").fadeOut("fast");
		$("body").unbind("mousedown", onBodyDown);
	}
	function onBodyDown(event) {
		if (!(event.target.id == "menuBtn" || event.target.id == "_"+id || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
			hideMenu();
		}
	}
	$.fn.zTree.init($("#treeDemo"), setting, options);
	$("#_"+id).click(function(){
		showMenu();
	});
	return $that;
};
/**
 * FormField的默认配置
 */
AI.FormField.prototype.defaults = {// 默认配置
	 type:'text',// 字段类型,number,color,date,combox,checkbox,radio,file,
	 lable:'',
	 width:'',
	 labelPositon:'left',// top,
	 container:''// 容器
};
/**
 * pick-grid,selbox,mapbox组件中弹出的选择窗口定义
 */
var  SelectBox = Class.$extend({
    __init__ : function(config) {
	config=config||{};
    this.config=config;
    this.id = "ai.selectbox";
    this.init();
  },
/**
 * pick-grid,selbox,mapbox组件中弹出的选择窗口初始化函数
 */
  init:function() {
  	var selectedValue = this.config.selectedValue;
  	var selectedcon = "";
  	var resultcon = "";
  	if(this.config.sql && !this.config.storesqlId){
  		this.config.resultsql =this.config.sql?"select * from ("+this.config.sql+") resulttab where 1=2":"";
  	  	this.config.selectsql = this.config.sql;
  	}
  	if(selectedValue&&this.config.sql&&!this.config.storesqlId){
  		var valueArr = selectedValue.split(",");
  		var hasKeyfield=/KEYFIELD/.test(this.config.selectsql);
  		for(var i = 0;i < valueArr.length;i++){
  			selectedcon += " AND VALUES1 <>'"+valueArr[i]+"'"+(hasKeyfield?(" and KEYFIELD <>'"+valueArr[i]+"'"):"");
  			if(i == 0){
  				resultcon += " VALUES1 = '"+valueArr[i]+"'"+(hasKeyfield?(" or KEYFIELD='"+valueArr[i]+"'"):"");
  			}else{
  				resultcon += " OR VALUES1 = '"+valueArr[i]+"'"+(hasKeyfield?(" or KEYFIELD='"+valueArr[i]+"'"):"");
  			}
  		}
  		this.config.resultsql = "select * from ("+this.config.sql+") selectedtab where 1=1 and  (" +resultcon+")";
  		this.config.selectsql = "select * from ("+this.config.sql+") selectedtab where 1=1 "+selectedcon;
  	}
  	var self=this;
  	if($("#aiselectBox").length>0){
  		$("#aiselectBox").remove();
  	}
    this.appendHtml();
    
    var data = {
    	"sql" : this.config.sql ||'',
    	"{resultcon}" : encodeURIComponent(resultcon ||'1=2'),
    	"{selectedcon}" : encodeURIComponent(selectedcon ||'1=1')
    }
    
    var _url = 'api/dps/meta/' + (this.config.storesqlId || 'list_api');
    this.selectStore= new AI.JsonStore({
    	 service: _url,
		 dataSource:this.config.dataSource||'',
		 pageSize:12,
		 key:'VALUES1',
		 ignoreNull:false,
		 param: $.extend({}, {"around":"selectsql"}, data, this.config.param)
	});

    this.resultStore= new AI.JsonStore({
    	   service: _url,
		   dataSource:this.config.dataSource,
		   pageSize:12,
		   key:'VALUES1',
		   ignoreNull:false,
		   param: $.extend({}, {"around":"resultsql"}, data)
    });
    this.resultStoreEffect = new AI.JsonStore({
    	   service: _url,
		   dataSource:this.config.dataSource,
		   pageSize:-1,
		   key:'VALUES1',
		   ignoreNull:false,
		   param: $.extend({}, {"around":"resultsql"}, data)
	 });
    
    var gridcfg={
    	id:'selectgrid',
    	title:'可选择对象',
    	containerId:'selectgrid',
    	store:this.selectStore,
    	rownumbers:'n',// y,n
    	pageSize:12,
    	multiselect: true,
    	// shrinkToFit:true,
    	// autowidth:true,
    	nowrap:true,
    	width:'98%',
    	height: 360,
	    placeholder:false,
        showcheck:true,
        columns:[
                 {header:'名称',dataIndex:'VALUES1',key:true, width:60,align:"left"},
                 {header:'中文名',dataIndex:'VALUES2', width:90,align:"left"},
                 {header:'备注',dataIndex:'VALUES3', width:190,align:"left"}
        ]
    };
    ai.loadWidget("aigrid");
    var selectGrid= new    AI.Grid(gridcfg) ;
   
    var gridcfg={
    	id:'resultgrid',
    	containerId:'resultgrid',
    	 showcheck:true,
    	store:this.resultStore,
    	title:'已经选择对象',
    	rownumbers:'n',// y,n
    	pageSize:12,
    	multiselect: true,
    	width:'100%',
    	nowrap:true,
    	height: 260,
    	// shrinkToFit:true,
    	// autowidth:true,
    	placeholder:false,
        columns:[
                 {header:'名称',dataIndex:'VALUES1',key:true,align:"left"},
                 {header:'中文名',dataIndex:'VALUES2', width:120,align:"left"}
        ]
    };
    var resultGrid= new AI.Grid(gridcfg);
   
   	$("#btnSelecboxSearch").click(function(){
  		var keyword= ($("#aiselectboxKeywrod").val());
  		var newsql=self.config.sql;
  		var resultcon = " (upper(VALUES1) like upper('%"+keyword+"%') or upper(VALUES2) like upper('%"+keyword+"%')) ";
		for(var i=0;i<self.resultStore.getCount();i++){
  	      var r=self.resultStore.getAt(i);
  	      resultcon +=" and VALUES1<>'"+r.get("VALUES1")+"' ";
		};
		var data = {
		    	"sql" : self.config.sql ||'',
		    	"{resultcon}" : encodeURIComponent(resultcon),
		    	"{selectedcon}" : encodeURIComponent(selectedcon ||'1=1'),
		    	"around":"resultsql"
		}
		self.selectStore.param = data;
        self.selectStore.select(self.selectStore);
  		return false;
  	});
   $('#movetoright').click(function(){
   	try{
   	  var recordSet=selectGrid.getCheckedRows();
   	  if(!recordSet ||recordSet.length==0) return;
   	  for(var i=0;i<recordSet.length;i++){
  		var r =recordSet[i];
  		var newRec=self.resultStore.getNewRecord();
  		for(var col in r.data){
  			newRec.set(col,r.get(col));
  		}

  		newRec.set('VALUES1',r.get('VALUES1'));
  		newRec.set('VALUES2',r.get('VALUES2'));
  		newRec.set('VALUES3',r.get('VALUES3'));
		newRec.set('VALUES4',r.get('VALUES4'));
    	self.resultStore.add(newRec);
    	self.resultStoreEffect.add(newRec);
        if(r) self.selectStore.remove(r);
   	  }
   	  selectGrid.resetCheckRowindex();
    }catch(E){
    }   
   });
   $('#movetoleft').click(function(){
  	  var resultSet=resultGrid.getCheckedRows();
   	  if(!resultSet ||resultSet.length==0) return;
   	  try{
   	  for(var i=0;i<resultSet.length;i++){
   	  	var r=resultSet[i];
   	  	var rEffect = self.resultStoreEffect.getRecordByKey(r.get("VALUES1"));
		var newRec=self.selectStore.getNewRecord();
		for(var col in r.data){
			newRec.set(col,r.get(col));
		}
		newRec.set('VALUES1',r.get('VALUES1'));
		newRec.set('VALUES2',r.get('VALUES2'));
		newRec.set('VALUES3',r.get('VALUES3'));
		self.selectStore.add(newRec);
		if(r)self.resultStore.remove(r);
		if(r)self.resultStoreEffect.remove(rEffect);
   	  }
   	   resultGrid.resetCheckRowindex();
   	  }catch(E){
    } 
   });
  
  $("#selectOK").click(function(){
	//用户可以移除所选项
	  	var result=[];
	  	for(var i=0;i<self.resultStoreEffect.getCount();i++){
	  		var r=self.resultStoreEffect.getAt(i);
	  		result.push(r);
	  	};
	  	if(self.config.callback){
	  		if(self.config.callback(result)==false) return false;
	  	};
  });
 
	},
/**
 * pick-grid,selbox,mapbox组件中弹出的选择窗口显示函数
 */
	show:function(sql,callback){
		if(callback) this.config.callback=callback;
		if(sql){
			this.config.sql=sql;
			this.config.selectsql=sql
		};
		  this.selectStore.select(this.config.selectsql);
			this.resultStore.select(this.config.resultsql); 	 
		
		$("#aiselectBox").modal({                    // wire up the actual
														// modal functionality
														// and show the dialog
        "backdrop"  : this.config.backdrop ||false,
       "keyboard"  : true,
        height:700,
        "show"      : true,                     // ensure the modal is shown
												// immediately
       }).css({
       	"margin-left":90,
       	"z-index":9999999999
       });
	},
/**
 * pick-grid,selbox,mapbox组件中弹出的选择窗口渲染
 */
	appendHtml:function(){
  
 
	var html='<div id="aiselectBox" class="modal  fade">'
  +'<div class="modal-dialog modal-lg">'
      +' <div class="modal-content" style="padding:0px;width:700px">'
      +'  <nav class="navbar navbar-default" role="navigation" style="min-height:30px;margin-bottom:5px"> <div class="container-fluid">   <div class="collapse navbar-collapse" > <form class="navbar-form navbar-left" > <div class="form-group"> <input id="aiselectboxKeywrod" type="text" class="form-control" placeholder="输入关键字"> </div> <button id="btnSelecboxSearch" class="btn btn-sm">查找</button> </form> </div> </div> </nav>'
      +'  <div class="modal-body" id="aiselectBoxbody" style="padding:0px;height:300px">'
      +'	   <div class="container-fluid" style="padding:0px">'
   
      +'      <div class="row-fluid" style="padding:0px ;" >'
      +'  	   <div id="selectgrid" class="col-md-6" style="height:300px;overflow:scroll ">'
         	   	  
      +'  	   	</div>'
      +'  	   <div class="col-md-1" >'
      +'  	   	   <br><br><br><br>'
      +'              <button id="movetoright" class="btn btn-large btn-primary" type="button">>></button>'
      +'           <br><br><br>'
      +'              <button id="movetoleft" class="btn btn-large" type="button"><<</button>'
      +'            </p>'
      +'  	   	</div>'
      +'  	   <div id="resultgrid" class="col-md-5" style="height:300px;overflow:scroll">'
      	   	   
      +'  	   	</div>'
      +'  </div>'
      +'</div>'
      +'</div>'
      +'<div class="modal-footer" style="padding: 5px 5px 5px">'
      +'  <button id="aiselectBox-cansel" class="btn" data-dismiss="modal" aria-hidden="true">关闭</button>'
      +'  <button id="selectOK" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">确定</button>'
      +'</div>'
      +'</div> ';
    $(html).appendTo("body");
	}
});
