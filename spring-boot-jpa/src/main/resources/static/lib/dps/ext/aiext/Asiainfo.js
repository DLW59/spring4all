/**
 * Asiainfo 功能函数定义
 * @author jason.cheng
 */
Ext.namespace("Asiainfo");
contextPath = window.location['pathname'].split('/')[1];
//defaultPrj='';
///******全局变量配置，由于在服务端liuux服务端没有装图形界面，在采用客户端布局实现。具体配置包括服务端的meta包配置layout_at_serv=false，和进行下面配置：//
layout_at_serv=false;
//layout_at_serv=true; 
//声明使用的数据库sql类型
var DatadbType = 'mysql'; 

Asiainfo = function() {
	return {
		init : function() {
			var contextUrl = window.location['pathname'].split('/')[1];
			
		},
		addTabSheet: function(id,title,inUrl){
			var contextPath = window.location['pathname'].split('/')[1];
      var srcUrl=inUrl.replace('{contextPath}',contextPath);
      if(srcUrl.indexOf('./')==0) srcUrl = srcUrl.replace('./','/'+contextPath+'/') ;
      
			var pg_index;
			var showtitle=title;
			if(title.length>10) title=title.substr(0,10)+'...';
		 
			var QoDesk;
			if (parent.pg_index)
			    pg_index=parent.pg_index;
			else if(parent.parent.pg_index)
					pg_index=parent.parent.pg_index
			else if(!pg_index && parent.mainFrame && parent.mainFrame.pg_index) {
				   pg_index=parent.mainFrame.pg_index ;
		 
			 }
			else if(!pg_index && parent && parent.QoDesk && parent.QoDesk.App ){
				QoDesk=parent.QoDesk;  
			}
			else if(!pg_index && parent && parent.parent && parent.parent.QoDesk && parent.parent.QoDesk.App){
				QoDesk =parent.parent.QoDesk; 	  
			};
			 
			//if(!pg_index && !QoDesk){this.ShowWin(title,'../'+srcUrl);return;}
			if(!pg_index && !QoDesk){
				var newwin=window.open(srcUrl,"","top=0, left=0, toolbar=yes, menubar=yes, scrollbars=yes, resizable=yes,location=yes, status=yes");
				newwin.resizeTo(window.screen.availWidth,window.screen.availHeight);
				return;
			}
			else if(pg_index){
			   var n = pg_index.getComponent(id);	
		     if(!n){
			   var n = pg_index.add({
				    'id' : id,
				    'title' : title,
				    tabTip:showtitle,
				    closable:true,
				    html:'<iframe src='+srcUrl+' width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>'
				  })
			   };
			  pg_index.setActiveTab(n); 
		}
		else if(QoDesk){
			var m=new  QoDesk.IfWin({
	                moduleType : 'ifwin',
	                moduleId : id,
	                menuPath : 'StartMenu',
	                moduleUrl:'../'+srcUrl,
	               launcher : {
		              iconCls: 'acc-icon',
		              shortcutIconCls: 'demo-acc-shortcut',
		              text: title,
		              tooltip: '<b>'+title+'</b>'
	               }
           });
	          QoDesk.App.registerModule(m);
	          QoDesk.App.createWindow(m.moduleId,m.launcher.text);
	         
		}},
		
		URLEncode:function(url){
			if(url.indexOf('?') != -1){
				var urlpath = url.substr(0,url.indexOf('?')+1);
				var urlparas = url.substr(url.indexOf('?')+1).split('&');
				for(var i=0;i<urlparas.length;i++){
					//var paras=urlparas[i].split('=');  //传递的参数中只可能包含=,改用substr
					var idx = urlparas[i].indexOf('=');
					urlparas[i] = encodeURI(urlparas[i].substr(0,idx+1))+encodeURIComponent(urlparas[i].substr(idx+1));
				}
				url = encodeURI(urlpath) + urlparas.join('&');
			}else{
				url = encodeURI(url);
			}
			return url;
		},
 
		
		/**
		 * 用户的个性化参数，保存在metauser的profile，用于记录最近访问的各模块信息，背景图片信息等
		 * @paraname 参数名
		 * @paravalue 参数值
		 * 本函数是记录参数值
		 */
		rigisterProfile: function(paraname,paravalue){
		  if(!_UserInfo.profile){
		  	_UserInfo.profile={};
		  };
		  if(_UserInfo.profile[paraname]==paravalue) return;
		  if(!paravalue) return;
		  //更新到数据库
		  if(_UserInfo.profile[paraname])
		    var sql="update METAUSER_PROFILE set PARAVALUE='"+paravalue+"' where USERNAME='"+_UserInfo.username+"' and PARANAME='"+paraname+"'"
		  else 
		  	var sql="insert into METAUSER_PROFILE(USERNAME,PARANAME,PARAVALUE) values('"+_UserInfo.username+"','"+paraname+"','"+paravalue+"')"; 
		  Asiainfo.executeSQL(sql);
     _UserInfo.profile[paraname]=paravalue;
    }, 
    /**
		 * 读取用户个性化参数
		 */
		readProfile: function(paraname){
		  if(!_UserInfo.profile){
		  	_UserInfo.profile = {};
		  	var tmpstore=  Asiainfo.getStore("select * from METAUSER_PROFILE where USERNAME='"+_UserInfo.username+"'");
			  for(var i=0;i<tmpstore.getCount();i++){
		  	   var r=tmpstore.getAt(i);
		  	   _UserInfo.profile[r.get('PARANAME')]=r.get('PARAVALUE');
		    }
		  };
      return _UserInfo.profile[paraname];
    }, 
    
    /**
 
		 * 从服务端取回数据,依赖于EXT的包
		 * @param url 请求路径，包含请求的参数 
		 * @param popTips 是否弹出提示信息
		 * @return 服务端返回的值
		 */
		 
		remoteData : function (url,popTips,callback,isEncode){
			
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			var result = '';
		        if(!isEncode){
			    url = encodeURI(url);
			}
			
			
			var re = /%5C/g;
   			url = url.replace(re, "/");
   			 
			conn.open('POST',url,false);
			conn.send(null);
			//conn.send();
			
			if (conn.responseText) {
				try {
					result = conn.responseText;
					if(callback){
						callback(result);
					}
					if(popTips){
						var resultOBJ = Ext.util.JSON.decode(result);
						var msg = "在"+(resultOBJ.dataSource ? resultOBJ.dataSource : "默认")+"数据库,"+resultOBJ.msg+"<br>"+resultOBJ.SQL;
						if (result.success == true)
							Ext.Msg.alert("提示", msg);
						else 
							Ext.Msg.alert("错误", msg);
					}
						
				} catch (e) {
					Ext.Msg.alert("Exception", "远程操作出错:"+ conn.responseText);
				};
			} else {
				Ext.Msg.alert("Exception", "远程无结果返回:");
			}
			return result;
		},
		/**
		 * 从服务端取回数据,依赖于EXT的包
		 * @param url 请求路径，包含请求的参数 
		 * @param popTips 是否弹出提示信息
		 * @return 服务端返回的值
		 */
		remoteData1 : function (url,popTips){
			
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			var result = '';
			url = encodeURI(url);
			
			var re = /%5C/g;
   			url = url.replace(re, "/");
   			
			conn.open('GET',url,false);
			conn.send(null);
			
			if (conn.responseText) {
				try {
					var result = conn.responseText;
					if(popTips){
						var result = Ext.util.JSON.decode(conn.responseText);
						if (result.success == true)
							Ext.Msg.alert("提示", result.msg);
						else 
							Ext.Msg.alert("错误", result.msg);
					}
						
				} catch (e) {
					Ext.Msg.alert("Exception", "远程操作出错:"+ conn.responseText);
				};
			} else {
				Ext.Msg.alert("Exception", "远程无结果返回:");
			}
			
			return result;
			
		},
		/*
		remoteData : function (url,popTips,callback){
			var result = '';
			url = encodeURI(url);
			var result = '';
			var re = /%5C/g;
   			url = url.replace(re, "/");
      var   xmlHttp;
      if(window.ActiveXObject)   {
           xmlHttp   =   new   ActiveXObject( 'Microsoft.XMLHTTP');
        }   else   if(window.XMLHttpRequest)   {
               xmlHttp   =   new   XMLHttpRequest();
          }  
      xmlHttp.open( 'POST',url,false);
           xmlHttp.send(null); 
      if (xmlHttp.responseText) {
				try {
					var result = xmlHttp.responseText;
					if(callback){
						callback(result);
					}
					if(popTips){
						var result = Ext.util.JSON.decode(xmlHttp.responseText);
						if (result.success == true)
							Ext.Msg.alert("提示", result.msg);
						else 
							Ext.Msg.alert("错误", result.msg);
					}
						
				} catch (e) {
					Ext.Msg.alert("Exception", "远程操作出错:"+ xmlHttp.responseText);
				};
			} else {
				Ext.Msg.alert("Exception", "远程无结果返回:");
			}
			return result;
		},*/
		/**
		 * 获得表的主键值,依赖于EXT的包
		 * @param url 请求路径，包含请求的参数 表名
		 * @return 服务端返回的值
		 */
		getPrimaryKey : function (tableName){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/newrecordService'+'?command=primaryKey&table='+tableName;
			return Asiainfo.remoteData1(url,false);
		},
		/**
		 * 获得当前用户在流程中的角色信息
		 * @param record 流程实例记录
		 * @param flowcode 流程模板号
		 * @return 返回当前用户流程模板中的角色信息
		 */
		getCurrentUserRole : function (record,flowcode){
			
			var contextUrl = window.location['pathname'].split('/')[1];
			var sql = "select rolename,rolefield from devwkflow_role where flowcode = '"+ flowcode + "'";
			var url = '/' + contextUrl + '/newrecordService'+ '?command=query&initSql=' + sql;
			
			var flowRole = Ext.decode(Asiainfo.remoteData1(url,false));
			
			currentUser = Asiainfo.currentUser();
			
			var roles =[];
			
			for (var i = 0; i < flowRole.root.length; i++) {
				if(record.get(flowRole.root[i].ROLEFIELD) == currentUser)
					roles.push(flowRole.root[i].ROLENAME);
			}
			return roles;
		},
		
		/**
		 * 执行SQL语句,依赖于EXT的包
		 * @param sql语句
		 * @return 服务端执行信息
		 */
    getQueryResult:function(sql,dataSource){
       var  ds_tmp = new Asiainfo.data.AsiaInfoJsonStore({
					sql :sql,
					initUrl : '/' + contextPath + '/newrecordService', url : '/' + contextPath + '/newrecordService',
					root : 'root', pageSize:20, loadDataWhenInit : true,dataSource:dataSource 
		   });
		   var result=null;
		   if(ds_tmp.getCount()!=0) {
		    	var result=ds_tmp.getAt(0).data;
		   };
		  ds_tmp=null;
		  return result;
    },
    getStore:function(sql,dataSource){
        contextPath = window.location['pathname'].split('/')[1];
       	var  ds_tmp = new Asiainfo.data.AsiaInfoJsonStore({
						sql :sql,
						initUrl : '/' + contextPath + '/newrecordService', url : '/' + contextPath + '/newrecordService',
						root : 'root', pageSize:-1, loadDataWhenInit : true,dataSource:dataSource 
		    });
		    return ds_tmp;
    },
		executeSQL : function (sql,popTips,dataSource,callback){
			sql = sql.replace(/\+/g,'@');
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/newrecordService'+'?command=executeSQL&initSql='+sql+'&dataSource='+dataSource;
			var result = Ext.util.JSON.decode(Asiainfo.remoteData(url,popTips,callback,true));
		  return result;
		},
		getArrayData : function (sql, start, limit,dataSource){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/newrecordService'+'?command=arrayQuery&initSql='+sql+'&dataSource'+dataSource+'&start'+start+'&limit'+limit;
			return Ext.decode(Asiainfo.remoteData1(url,false));
		
		},
		/**
		 * 执行多条SQL语句,依赖于EXT的包
		 * @param json格式的多条sql语句 [{sql},{sql}]
		 * @return 服务端执行信息
		 */
		executeMultiSql : function (sql,popTips){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/newrecordService'+'?command=executeMultiSql&MultiSql='+sql;
			//alert(url);
			return Ext.util.JSON.decode(Asiainfo.remoteData(url,popTips,null));
			
		},
	
		/**
		 * 获得登录用户信息
		 * @return 服务端执行信息
		 */
		 currentUserInfo : function (){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentUser'+'?command=currentUser';
			 
			var userInfo  = Ext.util.JSON.decode(Asiainfo.remoteData1(url,false));
			return userInfo 
		},
		currentUser : function (){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentUser'+'?command=currentUser';
			 
			var userInfo  = Ext.util.JSON.decode(Asiainfo.remoteData1(url,false));
			return userInfo.id;
			//return Ext.decode(Asiainfo.remoteData(url,false));
		},
		userCnName:function(){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentUser'+'?command=currentUser';
			var userInfo  = Ext.util.JSON.decode(Asiainfo.remoteData1(url,false));
			return userInfo.name;
		},
		currentTime : function (){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentTime';//+'?command=currentTime';
			var currentTime  = Asiainfo.remoteData1(url,false);
			return currentTime;
			//return Ext.decode(Asiainfo.remoteData(url,false));
		},
		/**
		 * 特定资源进行权限管理，
		 * @param 资源标识
		 * @return 是否可以操作资源 true 有权限 false 无权限
		 */
		allowHandle : function(resourceId){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentUser'+'?command=currentUser';
			var userInfo  = Ext.util.JSON.decode(Asiainfo.remoteData1(url,false));
			var handleResource = userInfo.handleResource;
			var allow = false;
			for(var i = 0;i<handleResource.length;i++){
				if(handleResource[i].URL ==resourceId ) {
					allow = true;
					break;
				}
			}
			return allow;
		},
		/**
		 * 打开窗口
		 */
		ShowWin : function (title,src){
		 var win = new Ext.Window({ 
	         title:title, 
	         layout:'fit',
	         id:'g_tmpwin',
	         width:800, 
	         height:500, 
	         border:false,
	         maximizable:true,
	         minimizable :true,
	         //closeAction:'close', 
	         modal: false, // <-- 设置为 模式窗口,    
	         html:'<iframe src="'+src+'" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>'
	           
         });
         win.on('minimize',function(e) { 
         	alert('kkkk');
           this.hide(); 
          })
         win.show();
         
 
         return win;
		},
		ShowDialog : function (title,src,width,height,modelWin){
			if(!modelWin) modelWin=true;
			var win = new Ext.Window({ 
         title:title, 
         layout:'fit',
         id:'g_tmpwin',
         width:width, 
         height:height, 
         border:false,
         maximizable:true,
	       minimizable :true,
         closeAction:'close', 
         modal: modelWin, // <-- 设置为 模式窗口,    
         html:'<iframe src="'+src+'" width="100%" height="100%" frameborder="0"></iframe>'
           
         });
         win.show();
         return win;
		},
		/**获取数据库字段类型
		 * 
		 */
		fieldDataTypesStore : new Ext.data.JsonStore({
			url : '/'+window.location['pathname'].split('/')[1]+'/newrecordService'+'?command=types',
			root : 'types',
			fields : ['typeName', 'resetLength', 'resetScale']
		}),
	  
		/**
		 * 数据迁移管理，从一个数据库导数据到另外一个数据库，应用于小数据量的实时调用数据迁移
		 * @param sourceDB    源数据源名
		 * @param targetDB    目标数据源名
		 * @param transferSql 从源数据查询需要迁移数据的SQL
		 * @param targetTable 迁入数据库表名
		 * @param dataColumn  源数据字段与目标数据表字段对应关系 如:[{"exportField":"param_name","importField":"ID"},{"exportField":"param_remark","importField":"VALUE"}]
		 * @return 返回迁移是否成功 {success:'true',msg:'数据迁移成功!'}
		 */
		DataTransfer: function(sourceDB,targetDB,transferSql,targetTable,dataColumn){
			
			return Ext.decode(Asiainfo.remoteData('/'+contextPath+'/dataMigration?sourceDs='+sourceDB+'&targetDs='+targetDB+'&migInTabname='+targetTable+'&migInColumns='+dataColumn+'&migDataSql='+transferSql));
		},
		 /**
		 * 数据迁移管理，从一个数据库导数据到另外一个数据库，应用于小数据量的实时调用数据迁移
		 * @param sourceDB    源数据源名
		 * @param targetDB    目标数据源名
		 * @param transferSql 从源数据查询需要迁移数据的SQL
		 * @param targetTable 迁入数据库表名
		 * @param exportColumn  导出数据对应导入数据的顺序,列从1开始计数 如: 5,1,2,4,3  表示第5列导入到导入表的第一列，依次
		 * @param importColumn  导入的列名 如:[{"exportField":"param_name","importField":"ID"},{"exportField":"param_remark","importField":"VALUE"}]
		 * @return 返回迁移是否成功 {success:'true',msg:'数据迁移成功!'}
		 */
 
		DataColumnTransfer: function(sourceDB,targetDB,transferSql,targetTable,exportColumn,importColumn,targetFlag){
      return  Asiainfo.remoteData('/'+contextPath+'/dataMigration?migDataSql='+transferSql+'&migInTabname='+targetTable+'&isTrancateSourceTable='+targetFlag+'&sourceDs='+sourceDB+'&targetDs='+targetDB+'&migInColumns='+importColumn);
 
		},
		saveChangeLog: function(logtype,reobjid,opname,remark,opstroe,content){
      var ds_log = new Asiainfo.data.AsiaInfoJsonStore({
	     sql:"select LOGTYPE, REFOBJID, OPTIME, OPNAME, OPTYPE, EXCUTER, CONTENT, REMARK,RESULT from OP_LOG where 1>2",
	     initUrl:'/'+contextPath+'/newrecordService',
	     url:'/'+contextPath+'/newrecordService',
	     root:'root',
	     dataSource:'defaultDB',
	     table:'OP_LOG',
	     loadDataWhenInit:true,
	     key:'REFOBJID'
      });
if(!opstroe){
	var rec = ds_log.newRecord();
				rec.set('LOGTYPE',logtype);
        rec.set('REFOBJID',reobjid);
        rec.set('EXCUTER',_UserInfo.username);
        rec.set('CONTENT',content);
        rec.set('OPNAME',opname);
        rec.set('REMARK',remark);
        ds_log.add(rec);
        ds_log.commit(true);
        return; 
}
if(opstroe.cache.remove.length>0){
			var command = 'delete';
			//alert('delete'+opstroe.cache.remove.length);
			
			for(var i=0;i<opstroe.cache.remove.length;i++){
				var r=opstroe.cache.remove[i];
				//记录日志
				var rec = ds_log.newRecord();
				rec.set('LOGTYPE',logtype);
        rec.set('REFOBJID',reobjid);
        rec.set('EXCUTER',_UserInfo.username);
        rec.set('OPTYPE',command);
        rec.set('OPNAME',opname);
        rec.set('REMARK',remark);
        rec.set('CONTENT','key='+r[opstroe.key]);     
        ds_log.add(rec); 
		  };   
		 
		}
if(opstroe.cache.save.length>0){
			var command  = 'insert';
			for(var i=0;i<opstroe.cache.save.length;i++){
				var r=opstroe.cache.save[i];
				//alert('op='+command+' key='+r[opstroe.key]); 
		  };
		  //记录日志
				var rec = ds_log.newRecord();
				rec.set('LOGTYPE',logtype);
        rec.set('REFOBJID',reobjid);
        rec.set('EXCUTER',_UserInfo.username);
        rec.set('OPTYPE',command);
        rec.set('OPNAME',opname);
        rec.set('REMARK',remark);
        rec.set('CONTENT','key='+r[opstroe.key]);     
        ds_log.add(rec); 
		}
if(opstroe.getModifiedRecords().length>0){
	   var command  = 'edit'; 
	   var chgdetail = '';
     for(var i=0;i<opstroe.getModifiedRecords().length;i++){
     	  var r=opstroe.getModifiedRecords()[i];
     	  
     	  r.fields.each(function(f) {
				if (r.isModified(f.name))
			    {
			    	chgdetail = chgdetail+' field='+f.name+' value='+r.data[f.name] +';';
			    };
			 });
			 
			 var rec = ds_log.newRecord();
				rec.set('LOGTYPE',logtype);
        rec.set('REFOBJID',reobjid);
        rec.set('EXCUTER',_UserInfo.username);
        rec.set('OPTYPE',command);
        rec.set('OPNAME',opname);
        rec.set('REMARK',remark);
        rec.set('CONTENT','key='+r.get(opstroe.key)+';'+chgdetail);     
        ds_log.add(rec);  
			}
  }
  //alert('reobjid='+reobjid+'key='+opstroe.key+' key='+r.get(opstroe.key)+chgdetail);
  ds_log.commit();
  //alert('kkk');
		}, 
		GerUrlInfo:function(_url,_paraName){
		  var _fields = {'Username':4,'Password':5,'Port':7,'Protocol':2,'Host':6,'Pathname':8,'URL':0,'Querystring':9,'Fragment':10};
		  var _regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;
		  var r = _regex.exec(_url);  
                  if (!r) throw "DPURLParser::_parse -> Invalid URL"; 
                  return r[_fields[_paraName]] 
		},
		RightSet:function(){
		  baseFun.loadScript('/'+contextPath+'dacp-lib/ext/aiext/form/searchWin4.js');
		  baseFun.loadScript('/'+contextPath+'dacp-lib/ext/aiext/form/RightSet.js');
		  ShowRightSet();
		},
	 
		GetNewCode:function(store,fieldname,pre,tabname){
		  if(store){///根据store取的新编码
		    var seq=0;
		    for(var i=0;i<store.getCount();i++){
		    	var str=store.getAt(i).get(fieldname);
		    	
		    	if(str && pre && str.indexOf(pre)==-1) continue;
		    
		    str=pre?str.substring(pre.length):str;
		    var _seq=parseInt(str);
		    if(isNaN(_seq)) continue;
		    if(seq<_seq) seq=_seq;
		   };
		   seq++;
		   return pre+seq 	
		  }
		 else if(tabname){
		   
                   var cycle=new Date().format("YYMM");
                   var _tmpsql ="";
                   if(DatadbType=='oracle'){
                	   _tmpsql="select max(to_number(substr("+fieldname+","+(pre.length+5)+",3))) as seq from "+tabname+" where "+fieldname+" like '%"+pre+cycle+"%'";
                   }else if (DatadbType=='mysql'){
                	   _tmpsql="select max(cast(substr("+fieldname+","+(pre.length+5)+",3) as SIGNED INTEGER)) as seq from "+tabname+" where "+fieldname+" like '%"+pre+cycle+"%'"
                   }
                   var ds_code=new Asiainfo.data.AsiaInfoJsonStore({
                   	sql:_tmpsql,
                   	initUrl:'/'+contextPath+'/newrecordService',
                   	url:'/'+contextPath+'/newrecordService',
                   	root:'root',
                   	loadDataWhenInit:true
                   });
                   var seq=0;
                   if(ds_code.getCount()>0){
                   	seq=ds_code.getAt(0).get('SEQ')+1;	
                   }
                   seq=seq+'';
                   if(seq.length==1)seq='00'+seq
                   else if(seq.length==2)seq='0'+seq;
                    
                   var newcode=pre +cycle+seq;
                   return newcode;
		 }
		 else {alert('Asiainfo.getNewCode(),error')};
		} 	
	};
}();
var paramMap = {};
temp = window.location.search;
temp= decodeURIComponent(temp);
if(temp.length != 0) {
    temp = temp.substr(1).split('&');
    for(i = 0; i < temp.length; ++i) {
        f = temp[i].split('=');
        paramMap[f[0]] = f[1];
    }
}

var _UserInfo=null;

try{
	if(!_UserInfo){
		var _par = parent||top;
		do{
			_UserInfo = _UserInfo||_par.UserInfo;
			if(_UserInfo){
				break;
			}
			_par = _par.parent||top;
		}while(_par!=top);
	}
	if(!_UserInfo){
		_UserInfo = new Object();
		var userinfo = Asiainfo.currentUserInfo();
		_UserInfo.username = userinfo.id;
	    _UserInfo.usercnname = userinfo.name;
	    _UserInfo.phone = userinfo.phone;
	    _UserInfo.dbname = userinfo.dbname;
 
	    _UserInfo.OwnGroup="";
        _UserInfo.groupname = userinfo.groupName;
	}
	
	_UserInfo.OwnGroup=[];
	var contextUrl = window.location['pathname'].split('/')[1];
	var url = "/" + contextUrl + "/newrecordService?command=query&initSql=SELECT GROUPCODE FROM METAGROUPUSER WHERE USERNAME = '"+_UserInfo.username+"'";
	
	var usergroup = Ext.decode(Asiainfo.remoteData1(url,false));
	for(var i=0;i<usergroup.root.length;i++){
		_UserInfo.OwnGroup.push(usergroup.root[i].GROUPCODE);
	}
	   
}catch(e){
}
_UserInfo.OwnGroup="";
  

//var _UserInfo=null;
//if (parent.UserInfo)
//	_UserInfo=parent.UserInfo
//else if(!_UserInfo && parent.parent.UserInfo)
//		 _UserInfo=parent.parent.UserInfo
//else if(!_UserInfo && parent.parent.parent.UserInfo)
//		 _UserInfo=parent.parent.parent.UserInfo;
// 
//if(!_UserInfo && parent.mainFrame) 
//		 _UserInfo=parent.mainFrame.UserInfo ;
//if(!_UserInfo){
//	_UserInfo = new Object();
//	var userinfo = Asiainfo.currentUserInfo();
//	_UserInfo.username = userinfo.id;
//    _UserInfo.usercnname = userinfo.name;
//    _UserInfo.phone = userinfo.phone;
//    _UserInfo.dbname = userinfo.dbname;
//};
if(!_UserInfo.dbname) _UserInfo.dbname='';

baseFun = function() {
    hasLoadfiles='';
    return {
    
     buildfun:function(script){
		 var oScript= document.createElement("script");  
     oScript.type = "text/javascript";  
     oScript.text = script;
     
     var oHead = document.getElementsByTagName('HEAD').item(0);
     oHead.appendChild(oScript);     
		},
		getXMLHttpObj:function(){   
        if(typeof(XMLHttpRequest)!='undefined')   
            return new XMLHttpRequest();   
  
        var axO=['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.4.0',   
            'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], i;   
        for(i=0;i<axO.length;i++)   
            try{   
                return new ActiveXObject(axO[i]);   
            }catch(e){}   
        return null;   
     },
  loadScript:function(scriptpath,filetype){
  	 
  	if(hasLoadfiles.indexOf(scriptpath)!=-1) return;
  	 hasLoadfiles+=scriptpath;
 	 if(!filetype)filetype='javascript';
 	 var oHead = document.getElementsByTagName('HEAD').item(0);
   if(filetype=='javascript'){ 
    var oXML = baseFun.getXMLHttpObj();   
    oXML.open('GET', scriptpath, false);   
    oXML.send('');   
    
     var oScript= document.createElement("script");  
     oScript.type = "text/"+filetype;  
     oScript.text = oXML.responseText
      
   }
  else if(filetype=='css'){
  	var oScript = document.createElement("link");
        oScript.rel="stylesheet";
        oScript.type = "text/css";
        oScript.href = scriptpath;  
  }
  oHead.appendChild(oScript);     
}
}
}();

baseFun.loadScript('/'+contextUrl+'/dacp-lib/ext/resources/css/xtheme-gray.css','css'); 
function CheckObjExists(objtype,objname){
	var _tmpsql;
	if(objtype=='流程' || objtype=='数据流程') _tmpsql="select flowcode  from transflow where ucase(flowcode)='"+objname.toUpperCase()+"'"
	else if(objtype=='表') _tmpsql="SELECT  1 FROM TABLEFILE where ucase(DATANAME)='"+objname.toUpperCase()+"'"
	else if(objtype=='程序') _tmpsql="SELECT  1 FROM PROC where ucase(PROC_NAME)='"+objname.toUpperCase()+"'"
	else if(objtype=='应用') _tmpsql="select  1 from portal  where ucase(portalcode)='"+objname.toUpperCase()+"'"
	else if(objtype=='主题') _tmpsql="select  1 from topic  where ucase(TOPICCODE)='"+objname.toUpperCase()+"'"
	else return false;
	var _ds = new Asiainfo.data.AsiaInfoJsonStore({
	     sql:_tmpsql,
	     initUrl:'/'+contextPath+'/newrecordService',
	     url:'/'+contextPath+'/newrecordService',
	     root:'root',
	     table:'DEVFLOWOBJ',
	     pageSize:3,
	     loadDataWhenInit:true,
	     key:'FLOWCODE,OBJNAME'
      });
  if (_ds.getCount()>0) return true
  else return false;
};
//获得自动编号
function getIdFlow(objname){
	var _tmpsql = "select table_name,current_value,value_length,perfix_word from DB2ADMIN.FLOW_IDMANAGER where ucase(table_name)='"+objname.toUpperCase()+"'";
//	var date = new Date();
//	var _year=date.getFullYear().toString()+"";
//		var _month=(date.getMonth()+1)+"";
//		_month = (_month.length==1?"0":"")+_month;
//		var _date = date.getDate()+"";
//		_date = (_date.length==1?"0":"")+_date;
//		var _cpix = _year+_month+_date ;
	var date = Asiainfo.currentTime();
	date = date.replaceAll('年','');
	date = date.replaceAll('月','');
	date = date.replaceAll('日','');
	//alert(date);
	var _year = date.substr(0,4);
	var _month = date.substr(4,2);
	var _date = date.substr(6,2);
	var _cpix = _year+_month+_date ;
	var _ds = new Asiainfo.data.AsiaInfoJsonStore({
	     sql:_tmpsql,
	     initUrl:'/'+contextPath+'/newrecordService',
	     url:'/'+contextPath+'/newrecordService',
	     root:'root',
	     table:'DB2ADMIN.FLOW_IDMANAGER',
	     pageSize:3,
	     loadDataWhenInit:true,
	     key:'TABLE_NAME'
      });
    if (_ds.getCount()>0){
       var rec = _ds.getAt(0);
       var current_value = rec.get('CURRENT_VALUE');
       //alert('current_value:'+current_value);
       var value_length = rec.get('VALUE_LENGTH');
       //alert('value_length:'+value_length);
       var perfix_word = rec.get('PERFIX_WORD');
       //alert('perfix_word:'+perfix_word);
       var _current = "" ;
       if (perfix_word == _cpix){
       	  _current = Number(current_value) + 1 +"" ;
       }else{
       	  _current = 1+ "";
       }
       
       var _sql = "update DB2ADMIN.FLOW_IDMANAGER set current_value='"+_current+"' ,perfix_word='"+_cpix+"' where table_name='"+objname+"'" ;
       Asiainfo.executeSQL(_sql);
       while(true){
          if (_current.length < value_length){
              _current = "0"+_current;
          }else{
             break;
          }
        }
        return objname+_cpix+_current;
     }else{
       return null;
    }
	
};
function SetRight(eventtype,scope,level){
var all = Ext.ComponentMgr.all.items;

Ext.each(all,function(o,i,all){
	 // alert(o.innerHTML+','+o.id);
	 var xtype=o.getXType();
	 var rightrule='';
//alert(xtype+',is:'+o.isXType('field'));
 
	 if(scope=='all'){
	 	if((xtype=='button') || o.isXType('field'))
	 	    
	      if(o.rightrule){
	      	rightrule=o.rightrule;
	      	try{
	 	  	rightrule=rightrule.replace('{eventtype}',eventtype);
	 	  	while (rightrule.indexOf('{username}')!=-1)
	 	  	  rightrule=rightrule.replace('{username}',_UserInfo.username);
	 	  	while (rightrule.indexOf('{group}')!=-1)
	 	    	rightrule=rightrule.replace('{group}',_UserInfo.OwnGroup);
	 	     
	 	  	var b=eval(rightrule);
	 	    }
	 	    catch(e){
	 	    	alert('error');
	 	    }
	 	    finally {
	 	    	if (b) o.enable();
	 	    	else o.disable();
        } 
	      }
	 	  	else if (level==3) o.enable();
	 	    else o.disable();
	 }
	 if(xtype=='button'){
	 	  if(o.rightrule){
	 	  	//if(eventtype)alert('event dirver');
	 	  	//if(!eventtype) alert('no event driver');
	 	    
	 	    if(eventtype && o.rightrule.indexOf('eventtype')!=-1){//有事件只更改规则包含了事件
	 	    rightrule=o.rightrule;
	 	    
	 	   }
	 	   else if(!eventtype){//没有事件 或者有
	 	   	rightrule=o.rightrule;
	 	   };
	 	   if(rightrule!=''){
	 	  	try{
	 	  	rightrule=rightrule.replace('{eventtype}',eventtype);
	 	  	while (rightrule.indexOf('{username}')!=-1)
	 	  	  rightrule=rightrule.replace('{username}',_UserInfo.username);
	 	  	while (rightrule.indexOf('{group}')!=-1)
	 	    	rightrule=rightrule.replace('{group}',_UserInfo.OwnGroup);
	 	     
	 	  	var b=eval(rightrule);
	 	    }
	 	    catch(e){
	 	    	alert('error');
	 	    }
	 	    finally {
	 	    	if (b) o.enable();
	 	    	else o.disable();
     } }
	 	}
	}
 })
};
function TimeCom(dateValue)
 {
  var newCom;
   if (dateValue=="")
   {
     newCom = new Date();
   }else
   {
    newCom = new Date(dateValue);
   }
        this.year = newCom.getYear();
        this.month = newCom.getMonth()+1;
        this.day = newCom.getDate();
        this.hour = newCom.getHours();
        this.minute = newCom.getMinutes();
        this.second = newCom.getSeconds();
        this.msecond = newCom.getMilliseconds();
        this.week = newCom.getDay();
 };
  
function DateDiff(interval,date1,date2) {
    	  
        var TimeCom1 = new TimeCom(date1);
        var TimeCom2 = new TimeCom(date2);
        var result;
        switch(String(interval).toLowerCase())
        {
            case "y":
            result = TimeCom1.year-TimeCom2.year;
            break;
            case "m":
            result = (TimeCom1.year-TimeCom2.year)*12+(TimeCom1.month-TimeCom2.month);
            break;
            case "d":
            result = Math.round((Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day))/(1000*60*60*24));
            break;
            case "h":
            result = Math.round((Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day,TimeCom1.hour)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day,TimeCom2.hour))/(1000*60*60));
            break;
            case "min":
            result = Math.round((Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day,TimeCom1.hour,TimeCom1.minute)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day,TimeCom2.hour,TimeCom2.minute))/(1000*60));
            break;
            case "s":
            result = Math.round((Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day,TimeCom1.hour,TimeCom1.minute,TimeCom1.second)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day,TimeCom2.hour,TimeCom2.minute,TimeCom2.second))/1000);
            break;
            case "ms":
            result = Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day,TimeCom1.hour,TimeCom1.minute,TimeCom1.second,TimeCom1.msecond)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day,TimeCom2.hour,TimeCom2.minute,TimeCom2.second,TimeCom1.msecond);
            break;
            case "w":
            result = Math.round((Date.UTC(TimeCom1.year,TimeCom1.month-1,TimeCom1.day)-Date.UTC(TimeCom2.year,TimeCom2.month-1,TimeCom2.day))/(1000*60*60*24)) % 7;
            break;
            default:
            result = "invalid";
        }
        return(result);
 };
function fieldChang(field,newValue,oldValue){
  
  if(field.editable && field.getXType()=='combo' &&  field.editable ){
    newValue=field.getRawValue();
    field.setValue(newValue);
 
  };
 
  if(field.ds && field.ds.curRecord){
    
    field.ds.curRecord.set(field.name,newValue);
    field.ds.curRecord.dirty=true;
    if(dataManager) 
     dataManager.fresh(null,field,field.ds.itemindex);
 }
}
 

//字符串左补齐
String.prototype.charLeftAll = function(bchar, alength) {
	var xchar = '' + this;
	for (var i = 0; i < alength; i++) {
		xchar = bchar + xchar;
		if (xchar.length == alength)
			break;
	}
	return (xchar);
}

String.prototype.trim = function() { return this.replace(/(^\s*)|(\s*$)/g, ""); };
String.prototype.replaceAll=function(fromStr,toStr){
	
	//将fromStr中的属于正则表达式的元字符转换
	var metaChars = ['.','$','^','{','}','+','(',')','*','?','|'];
	for(var i=0;i<metaChars.length;i++){
		if(fromStr.indexOf(metaChars[i]) != -1){
			var re = new RegExp('\\'+metaChars[i],"g");
			fromStr = fromStr.replace(re,"\\"+metaChars[i]);
		}
	}

	return this.replace(new RegExp(fromStr,"gm"),toStr);
};
[].indexOf || (Array.prototype.indexOf = function(v){        for(var i = this.length; i-- && this[i] !== v;);        return i; });
Array.prototype.insertAt = function( index, value ) {         var part1 = this.slice( 0, index );         var part2 = this.slice( index );         part1.push( value );         return( part1.concat( part2 ) );     }; 
Array.prototype.removeAt = function( index) {if(this.length<0 || index<0 || this.length < index) return this; else return this.slice(0,index).concat(this.slice(index+1,this.length))};  
Date.prototype.DateAdd = function(strInterval, Number) {    
    var dtTmp = this;   
    switch (strInterval) {    
        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));   
        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));   
        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));   
        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));   
        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));   
        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());   
        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());   
        case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());   
    }   
};
Date.prototype.format =function(formatstr){
		var result = "";
		var _year=this.getFullYear()+"";
		var _month=(this.getMonth()+1)+"";
		_month = (_month.length==1?"0":"")+_month;
		var _date = this.getDate()+"";
		_date = (_date.length==1?"0":"")+_date;
		_hour = this.getHours()>9?this.getHours().toString():'0' + this.getHours();    
    _minute = this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes();  
    _second = this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds(); 
		var format = arguments[0]||"yyyymmdd";
	 format=format.toLowerCase();
	  
		switch (format) {
        case "yyyy-mm-dd" :
                result = _year + "-" + _month + "-" + _date;
                break;
        case "y-m-d" :
                result = _year + "-" + _month + "-" + _date;
                break;
        case "yyyy-mm":
                result =  _year + "-" + _month;
                break;
        case "dd/mm/yyyy":
                result = _date+ "/" + _month + "/" + _year;
                break;
        case "mm/dd/yyyy":
                result = _month +"/" +  _date + "/" + _year;
                break;
        case "mm/dd/yyyy hh:mm:ss":
                result = _month +"/" +  _date + "/" + _year +" "+_hour+":"+_minute+":"+_second;
                break;
        case "yyyy-mm-dd hh:mm:ss":
                result = _year +"-"+ _month +"-" + _date + " " +_hour+":"+_minute+":"+_second;
                break;
        case "hh:mm:ss":
                result = _hour+":"+_minute+":"+_second;
                break;
        case "yyyymm":
                result =  _year+ _month  ;
                break;
        case "yyyymmddhhmmss":
                result =  _year+ _month +_hour + _minute + _second ;
                break;
        case "yymm":
                result = _year.substr(2,2)+_month;
                break;
        case "yyyymmdd":
               result = _year + _month + _date ;
               break;
        default :
              var str=format;
              var strs=[];tf=null; op='';offtype='';offnum='';
              if(format.indexOf('yyyy-mm-dd')!=-1){offtype='d';tf='yyyy-mm-dd'; format=format.substr(10);  }
              else if (format.indexOf('yyyy-mm')!=-1){offtype='m';tf='yyyy-mm';format=format.substr(7); };
              if(format.indexOf('-')!=-1){op='-'; strs=format.split('-')}
              else if(format.indexOf('+')!=-1){op='+'; strs=format.split('+')};
              if(!tf) tf=strs[0];	
              if(tf=='yyyymm') offtype='m' 
              else if(tf=='yyyymmdd') offtype='d'
              else if(tf=='yymm') offtype='m'
              else if(tf=='yy-mm') offtype='m';
              
              offnum=strs[1]||strs[0];
                
              return this.DateAdd(offtype.trim(),parseInt(op.trim()+offnum.trim())).format(tf.trim())
              
                //result = _year + _month + _date ;
        }
   return result;
	};
Array.prototype.remove=function(str)
{
    var tmp=this;
    for(i=0;i<tmp.length;i++)
    {
        if(tmp[i].toString()==str){
            tmp.splice(i,1);
            break;
        }
    }
};
//添加用于防止sql注入
String.prototype.valueSafe = function(replaceString){
	if (replaceString == null) replaceString = "";
	var result = '';
	  if (this != null){
	  		var regExp = new RegExp("\'","g");
        result = this.replace(regExp , replaceString); 
	  }
	  return result ;
} 
////框架之间的页面交互
function ResponseChildCmd(clickfun,clickpara){
	 
	if(clickfun=='closeMe'){
	   if(pg_index) pg_index.remove(pg_index.getActiveTab())  ;
	   return true
	}
	else if(clickfun=='selfun'){
	   return eval(clickpara);
	}
	else return Asiainfo.widget.actfun(clickfun,clickpara);
};
function SendParentCmd(clickfun,clickpara){
    
   if(parent && parent.ResponseChildCmd)
     parent.ResponseChildCmd(clickfun,clickpara); 
 
};
////解决IE9 createContextualFragment报错的问题
if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment)
{
    Range.prototype.createContextualFragment = function(html)
    {
        var frag = document.createDocumentFragment(), 
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}
///解析firefox的时间选择的问题
Ext.override(Ext.menu.DateMenu, {  
    render : function() {  
        Ext.menu.DateMenu.superclass.render.call(this);  
        if (Ext.isGecko || Ext.isSafari) {  
            this.picker.el.dom.childNodes[0].style.width = '178px';  
            this.picker.el.dom.style.width = '178px';  
        }  
    }  
});

 
Ext.data.GroupingStore.prototype.applySort = function() {
    Ext.data.GroupingStore.superclass.applySort.call(this);
    if (!this.groupOnSort && !this.remoteGroup) {
        var gs = this.getGroupState();
        if (gs && gs != (this.storeInfo ? this.sortInfo.field : 'undefined')) {
            this.sortData(this.groupField);
        }
    }
}

Ext.grid.GridView.prototype.refreshRow = function(record) {
    var ds = this.ds,
        index;
    if (typeof record == 'number') {
        index = record;
        record = ds.getAt(index);
        if (!record) {
            return;
        }
    } else {
        index = ds.indexOf(record);
        if (index < 0) {
            return;
        }
    }
    var cls = [];
    this.insertRows(ds, index, index, true);
    this.getRow(index).rowIndex = index;
    this.onRemove(ds, record, index + 1, true);
    this.fireEvent("rowupdated", this, index, record);
 
};

 
//解决IE9 createContextualFragment报错的问题
if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment)
{
    Range.prototype.createContextualFragment = function(html)
    {
        var frag = document.createDocumentFragment(), 
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}

//解决FireFox，chrome时间选择的问题
Ext.override(Ext.menu.DateMenu, {  
    render : function() {  
        Ext.menu.DateMenu.superclass.render.call(this);  
        if (Ext.isGecko || Ext.isSafari) {  
            this.picker.el.dom.childNodes[0].style.width = '178px';  
            this.picker.el.dom.style.width = '178px';  
        }  
    }  
});

Ext.grid.GridView.prototype.refreshRow = function(record) {
    var ds = this.ds,
        index;
    if (typeof record == 'number') {
        index = record;
        record = ds.getAt(index);
        if (!record) {
            return;
        }
    } else {
        index = ds.indexOf(record);
        if (index < 0) {
            return;
        }
    }
    var cls = [];
    this.insertRows(ds, index, index, true);
    this.getRow(index).rowIndex = index;
    this.onRemove(ds, record, index + 1, true);
    this.fireEvent("rowupdated", this, index, record);
}
//解决IE9 createContextualFragment报错的问题
if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment)
{
    Range.prototype.createContextualFragment = function(html)
    {
        var frag = document.createDocumentFragment(), 
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}

//解决FireFox，chrome时间选择的问题
Ext.override(Ext.menu.DateMenu, {  
    render : function() {  
        Ext.menu.DateMenu.superclass.render.call(this);  
        if (Ext.isGecko || Ext.isSafari) {  
            this.picker.el.dom.childNodes[0].style.width = '178px';  
            this.picker.el.dom.style.width = '178px';  
        }  
    }  
}); 

var currentDatabase, getSysDual, lcase, sysdual, ucase, values ,to_number ,posstr;

currentDatabase = "oracle";

sysdual = {
  db2: "sysibm.sysdummy1",
  oracle: "dual",
  mysql: "dual"
};

getSysDual = function() {
  return sysdual[currentDatabase];
};

values = function(value, val) {
  return {
    db2: "value(" + value + "," + val + ")",
    oracle: "nvl(" + value + "," + val + ")",
    mysql:"ifnull(" + value + "," + val + ")"
  }[currentDatabase];
};

lcase = function(value) {
  return {
    db2: "lcase(" + value + ")",
    oracle: "lower(" + value + ")",
    mysql: "lower(" + value + ")"
  }[currentDatabase];
};

ucase = function(value) {
  return {
    db2: "ucase(" + value + ")",
    oracle: "upper(" + value + ")",
    mysql: "upper(" + value + ")"
  }[currentDatabase];
};
to_number = function(value) {
  return {
    db2: "int(" + value + ")",
    oracle: "to_number(" + value + ")",
    mysql: "cast(" + value + " as decimal(15,5))"
  }[currentDatabase];
};

posstr = function(value){
    return {
    db2: "posstr(" + value + ")",
    oracle: "instr(" + value + ")",
    mysql: "instr(" + value + ")"
  }[currentDatabase];
};
