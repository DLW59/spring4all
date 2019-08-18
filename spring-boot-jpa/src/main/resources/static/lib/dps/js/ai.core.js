if(!Array.indexOf){ 
  Array.prototype.indexOf = function(obj){
    for(var i=0; i<this.length; i++){
      if(this[i]==obj){
        return i;
      }
    }
    return -1;
  };
}
;(function(undefined) {
  var
    CLASSY_VERSION = '1.4',
    root = this,
    old_class = root.Class,
    disable_constructor = false;

  /* we check if $super is in use by a class if we can.  But first we have to
     check if the JavaScript interpreter supports that.  This also matches
     to false positives later, but that does not do any harm besides slightly
     slowing calls down. */
  var probe_super = (function(){$super();}).toString().indexOf('$super') > 0;
  function usesSuper(obj) {
    return !probe_super || /\B\$super\b/.test(obj.toString());
  }

  /* helper function to set the attribute of something to a value or
     removes it if the value is undefined. */
  function setOrUnset(obj, key, value) {
    if (value === undefined)
      delete obj[key];
    else
      obj[key] = value;
  }

  /* gets the own property of an object */
  function getOwnProperty(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name)
      ? obj[name] : undefined;
  }

  /* instanciate a class without calling the constructor */
  function cheapNew(cls) {
    disable_constructor = true;
    var rv = new cls;
    disable_constructor = false;
    return rv;
  }

  /* the base class we export */
  var Class = function() {};

  /* restore the global Class name and pass it to a function.  This allows
     different versions of the classy library to be used side by side and
     in combination with other libraries. */
  Class.$noConflict = function() {
    try {
      setOrUnset(root, 'Class', old_class);
    }
    catch (e) {
      // fix for IE that does not support delete on window
      root.Class = old_class;
    }
    return Class;
  };

  /* what version of classy are we using? */
  Class.$classyVersion = CLASSY_VERSION;

  /* extend functionality */
  Class.$extend = function(properties) {
    var super_prototype = this.prototype;

    /* disable constructors and instanciate prototype.  Because the
       prototype can't raise an exception when created, we are safe
       without a try/finally here. */
    var prototype = cheapNew(this);

    /* copy all properties of the includes over if there are any */
    if (properties.__include__)
      for (var i = 0, n = properties.__include__.length; i != n; ++i) {
        var mixin = properties.__include__[i];
        for (var name in mixin) {
          var value = getOwnProperty(mixin, name);
          if (value !== undefined)
            prototype[name] = mixin[name];
        }
      }
 
    /* copy class vars from the superclass */
    properties.__classvars__ = properties.__classvars__ || {};
    if (prototype.__classvars__)
      for (var key in prototype.__classvars__)
        if (!properties.__classvars__[key]) {
          var value = getOwnProperty(prototype.__classvars__, key);
          properties.__classvars__[key] = value;
        }

    /* copy all properties over to the new prototype */
    for (var name in properties) {
      var value = getOwnProperty(properties, name);
      if (name === '__include__' ||
          value === undefined)
        continue;

      prototype[name] = typeof value === 'function' && usesSuper(value) ?
        (function(meth, name) {
          return function() {
            var old_super = getOwnProperty(this, '$super');
            this.$super = super_prototype[name];
            try {
              return meth.apply(this, arguments);
            }
            finally {
              setOrUnset(this, '$super', old_super);
            }
          };
        })(value, name) : value
    }

    /* dummy constructor */
    var rv = function() {
      if (disable_constructor)
        return;
      var proper_this = root === this ? cheapNew(arguments.callee) : this;
      if (proper_this.__init__)
        proper_this.__init__.apply(proper_this, arguments);
      proper_this.$class = rv;
      return proper_this;
    }

    /* copy all class vars over of any */
    for (var key in properties.__classvars__) {
      var value = getOwnProperty(properties.__classvars__, key);
      if (value !== undefined)
        rv[key] = value;
    }

    /* copy prototype and constructor over, reattach $extend and
       return the class */
    rv.prototype = prototype;
    rv.constructor = rv;
    rv.$extend = Class.$extend;
    rv.$withData = Class.$withData;
    rv.$addPrototye = Class.$addPrototye;
    return rv;
  };

  /* instanciate with data functionality */
  Class.$withData = function(data) {
    var rv = cheapNew(this);
    for (var key in data) {
      var value = getOwnProperty(data, key);
      if (value !== undefined)
        rv[key] = value;
    }
    return rv;
  };
  Class.$addPrototye = function(properties) {
    $.extend(this.prototype,properties);
     
  };
  /* export the class */
  root.Class = Class;
})();
var Event= Class.$extend({
     __init__ : function(config) {
     	 
     	this.id=config.id;
      
    },
     _listeners: {},
    // 添加
    on: function(type, fn) {
    	  //if(!this._listeners) this._listeners={};
        if (typeof this._listeners[type] === "undefined") {
            this._listeners[type] = [];
        }
        if (typeof fn === "function") {
            this._listeners[type].push(fn);
        }
        return this;
    },
    addEvent: function(type, fn) {
    	 
    	  //if(!this._listeners) this._listeners={};
        if (typeof this._listeners[type] === "undefined") {
            this._listeners[type] = [];
        }
        if (typeof fn === "function") {
            this._listeners[type].push(fn);
        }
        return this;
    },
    // 触发
    fireEvent: function(type,para1,para2,para3) {
    	  //if(!this._listeners) this._listeners={};
        var arrayEvent = this._listeners[type];
        if (arrayEvent instanceof Array) {
            for (var i=0, length=arrayEvent.length; i<length; i+=1) {
                if (typeof arrayEvent[i] === "function") {
                    arrayEvent[i](para1,para2,para3);
                }
            }
        }
        return this;
    },
    // 删除
    removeEvent: function(type, fn) {
    	var arrayEvent = this._listeners[type];
        if (typeof type === "string" && arrayEvent instanceof Array) {
            if (typeof fn === "function") {
                // 清除当前type类型事件下对应fn方法
                for (var i=0, length=arrayEvent.length; i<length; i+=1){
                    if (arrayEvent[i] === fn){
                        this._listeners[type].splice(i, 1);
                        break;
                    }
                }
            } else {
                // 如果仅仅参数type, 或参数fn邪魔外道，则所有type类型事件清除
                delete this._listeners[type];
            }
        }
        return this;
    }
});
var AI= Class.$extend({});
function nameSpaceDef (name,alias) {
            var arr  = name.split(".");
            var parent = "window";
            for(var i=0;i<arr.length;i++) {
                var next = parent+"."+arr[i];
                if ( typeof eval(next) == "undefined") {
                    eval(next +"= {}");
                    parent = next;
                }
            }
            eval(alias + " = " + name);
 }; 
paramMap={};/*外部传入的全局变量.paramMap.MODELCODE */
contextPath = window.location['pathname'].split('/')[1]; /*当前路径*/
//adapter for chongqing
//contextPath= contextPath+"/"+window.location['pathname'].split('/')[2];
 
_UserInfo=null;
_MainTabs=null;
_debugLevel="";
//_debugLevel="debug";////是否是调试状态，如果是则会把界面的sql保存到数据库

contextUrl = window.location['pathname'].split('/')[1];
var useHasOwn = !!{}.hasOwnProperty;

if (typeof window.AI == "undefined"){
	nameSpaceDef("AI");
}

if (!Array.prototype.indexOf){
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;
    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

ai = function() {
	return {
		config:{kpiservPath:'http://127.0.0.1:8070/core/',uploadPath:'PICDATA'},
		Components:{},////运行态所有组件id,对象
		_global_loadfile:[],////已经动态加载的js,css
		widget:{
			      baseUrl:'/'+contextPath+"/",
			      store:'public/js/ai.jsonstore.js',
			      bootstrap:'../../dacp-lib/bootstrap/js/bootstrap.min.js,../../dacp-lib/bootstrap/css/bootstrap.min.css',
			      jscroll:'widget/jscroll/scripts/jScrollPane.js,widget/jscroll/styles/jScrollPane.css',
			      drillDownMenu:'widget/drillDownMenu/css/dcdrilldown.css,widget/drillDownMenu/css/skins/graphite.css,widget/drillDownMenu/js/jquery.cookie.js,widget/drillDownMenu/js/jquery.dcdrilldown.1.2.min.js',
			      appleTable:'widget/appleTable/js/appleTable.js',
			      aigrid:'view/aijs/js/ai.grid.js',
                 jsonstore:'public/js/ai.jsonstore.js',
			      multiSelect:'/magicsuggest-min.js,/magicsuggest-min.css,ai/ai.multiSelect.js',
			      sheetgrid:'lib/jquery.handsontable/jquery.handsontable.full.js,lib/jquery.handsontable/jquery.handsontable.full.css',
			      dataTables:'lib/jquery.dataTables/js/jquery.dataTables.js,lib/jquery.dataTables/css/jquery.dataTables.css',
			      bootstrapEditable:'lib/bootstrap3-editable/css/bootstrap-editable.css,lib/bootstrap3-editable/js/bootstrap-editable.min.js,lib/bootstrap3-editable/inputs-ext/select2.js,lib/bootstrap3-editable/inputs-ext/select2.css',
			      datepicker:'dacp-lib/datepicker/bootstrap-datepicker.js,dacp-lib/datepicker/datepicker.css',
			      progressbar:'lib/jquery.progressbar.js',
			      wysihtml5:'lib/bootstrap3-editable/inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2.min.js,lib/bootstrap3-editable/inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/wysihtml5-0.3.0.min.js,lib/bootstrap3-editable/inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2.css,lib/bootstrap3-editable/inputs-ext/wysihtml5/wysihtml5.js',
			      colorpicker:'lib/colorpick/css/colorpicker.css,lib/colorpick/colorpicker.js',
			      //datepicker:'lib/twitter/plugin/datepicker/datepicker.css,lib/twitter/plugin/datepicker/bootstrap-datepicker.js',
			      bootbox:'lib/twitter/plugin/bootbox/bootbox.min.js',
			      selectpicker:'lib/twitter/plugin/selectpicker/bootstrap-select.min.css,lib/twitter/plugin/selectpicker/bootstrap-select.js',
			      treeview:'lib/bootstrap-treeview.min.js,public/js/ai.treeview.js',
			      layout:'lib/jquery.layout-latest.js',
			      nestable:'lib/nestable/jquery.nestable.js,lib/nestable/jquery.nestable.css', 
			      contextMenu:'lib/jquery-contextMenu.js',///右键菜单
 
			      /*图形化分析组件*/
			       sparkline:'lib/jquery.sparkline.min.js',
			       piechart:'lib/jquery.easy-pie-chart.js',
			       circliful:'lib/jquery.circle.circliful/jquery.circliful.min.js,lib/jquery.circle.circliful/jquery.circliful.css',
			      dialog:'lib/jquery-artDialog.js',///对话框
			      metaAction:'meta/metaAction.js' ///操作方法
			     },
		init : function() {
			this.initConsole();
			this.initParaMap();
			this.initUserInfo();
			//this.arrayExtend();
		 	this.dateExtend();
			this.stringExtend();
			this.checkClient();
		},
    maskShow:function(){
      $backdrop = $('#loadingBackDrop').length==1?$('#loadingBackDrop'):parent.$('#loadingBackDrop');
      $loadingMask = $('#loadingmask').length==1?$('#loadingmask'):parent.$('#loadingmask');
      $loadingMask.show();
      $backdrop.show();
    },
    maskHide:function(){
      $backdrop = $('#loadingBackDrop').length==1?$('#loadingBackDrop'):parent.$('#loadingBackDrop');
      $loadingMask = $('#loadingmask').length==1?$('#loadingmask'):parent.$('#loadingmask');
      $loadingMask.hide();
      $backdrop.hide();
    },
		checkClient:function(){
	     $(document).ready(function() {
			 
			 	var _ieversion=99;
			 	
				if(/MSIE (\d).0/gi.test(navigator.userAgent)){
					_ieversion=RegExp.$1;
					
					if(_ieversion<8){
						var CFSupport=false;
						try{
							var obj = new ActiveXObject('ChromeTab.ChromeFrame');
						 
							CFSupport=true;
						}catch(e){}
					   
						if(!CFSupport){
					    ai.openDialog("重要提示",ai.widget.baseUrl+"/widget/checkClient.html",function(){},600,300);
					  }
					}
		    }
		   })
		},
    checkAct:function(username,xmlid,objTab){
      return this.checkCurdutyer(username)||this.checkOnline(xmlid,objTab);
    },
    checkCurdutyer:function(name){
      return (_UserInfo['username']==name||_UserInfo['usercnname']==name);
    },
    checkOnline:function(xmlid,objTab){
      var rs;
      try{
        var n = ai.getStoreData("select count(*) num from "+objTab+" where xmlid='"+xmlid+"'");
        if(n&&n[0]['NUM']!=0){
        	rs = n[0]['NUM']!=0;
        }
        
      }catch(e){
        console.log(e.message);
        rs=true;
      }
      return rs;
    },
		loadWidget: function(widgetName) {
			var widgetNames=widgetName.split(",");
			for(var j=0;j<widgetNames.length;j++){
			    var widgetCfg = this.widget[widgetNames[j]];
			    if(!widgetCfg){alert('not fount widget config');continue;};
			    var widgetFiles=widgetCfg.split(",");
			    for(var i=0;i<widgetFiles.length;i++){
			    	var fileName=this.widget.baseUrl+widgetFiles[i];
			    	if(this._global_loadfile.indexOf(fileName)>=0) continue;
			    	if(widgetFiles[i].indexOf(".css")>0)
			    	   $("head").append('<link href="'+fileName+'" rel="stylesheet" type="text/css" />')
			    	else if(widgetFiles[i].indexOf(".js")>0)
			    	   $("head").append('<script type="text/javascript" src="'+fileName+'"></script>');
			      this._global_loadfile.push(fileName);
			    };
			  }
	   },    
		
		initParaMap:function(){///初始化全局变量和外部传入变量
			var contextUrl = window.location['pathname'].split('/')[1];
     		 temp = window.location.search; 
      		if(temp.length!=0){
	       temp = temp.substr(1).split('&');
	       for (i=0;i<temp.length;++i){
		      f = temp[i].split('=');
		      paramMap[f[0]]=decodeURI(f[1]);
	     	 } 
      		};
		},
		registerSqlLog:function(sql,command,dbname){///记录到服务器的sql日志，便于对本系统的数据进行管理
			var _sql="insert into META_FRONT_SQLLOG(USER_NAME,PAGE_TITLE,PAGE_URL,DBNAME,SQL_TEXT,FRAME_VERSION)values('"+
			           _UserInfo.username+"','"+document.title+"','"+window.location['pathname']+"','"+dbname+"','"+sql.replaceAll("'","''")+"','v2')";
			this.executeSQL(_sql);
		},
		initConsole:function(){
			if(!window.console){  
       		window.console={};
       		window.console.log=function(outputValue){
       };
      } 
		},
    arrayExtend:function(){
       
       [].indexOf || (Array.prototype.indexOf = function(v){        for(var i = this.length; i-- && this[i] !== v;);        return i; });
       Array.prototype.insertAt = function( index, value ) {         var part1 = this.slice( 0, index );         var part2 = this.slice( index );         part1.push( value );         return( part1.concat( part2 ) );}; 
       Array.prototype.removeAt = function(from, to){  var rest = this.slice((to || from) + 1 || this.length);  this.length = from < 0 ? this.length + from : from;return this.push.apply(this, rest);  };  
       Array.prototype.remove=function(str){var tmp=this;for(i=0;i<tmp.length;i++){if(tmp[i].toString()==str){tmp.splice(i,1);break;}}};
    },
    stringExtend:function(){
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
    },
    initUserInfo:function(){
     
    },
     /**
		 * 用户的个性化参数，保存在metauser的profile，用于记录最近访问的各模块信息，背景图片信息等
		 * @paraname 参数名
		 * @paravalue 参数值
		 * 本函数是记录参数值
		 */
    getStoreData:function(sql,dbname){
    	var tmpStore = ai.getStore(sql,dbname);
    	if(tmpStore) return  ai.getStore(sql,dbname).root
    	else return null;
    },
    getStore:function(sql,dbname){
	    var contextUrl = window.location['pathname'].split('/')[1];
	    var url = '/'+contextUrl+'/newrecordService'+'?command=init&root=root&start=0&dataSource='+dbname+'&initSql='+sql;
	    url=ai.URLEncode(url);
      var response = $.ajax({ type: "GET",
    		 url:url,
    		 initSql:sql,
    		 root:'root',
    		 start:0,
    		 async: false,
    		 dataType: "json"
    	}).responseText; 
     if(_debugLevel==="debug") this.registerSqlLog(sql,"select");
      var dataJson = jQuery.parseJSON(response);
     return dataJson;
    },
    getJsonStore:function(sql,dbname){
	    var tmpstore = new AI.JsonStore({
                sql:sql,
                pageSize:-1,
                dataSource:dbname
            });
       return tmpstore;
    },
    getJsonAttrName:function(json){
    	var result=[];
    	for(key in json){
    		result.push(key);
    	};
    	return result;
    },
    padNumberLeft:function(number,length){///左边补足位数 (132,5)->00132
    	 var str = '' + number;
       while (str.length < length) {
           str = '0' + str;
       }
       return str;
    },
    dateExtend:function(){
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
        case "yyyymm":
                result =  _year+ _month  ;
                break;
        case "yyyy":
                result =  _year  ;
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
        case "yymmdd":
               result = _year.substr(2,2) + _month + _date ;
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
    },
    timeidToDate: function(str) {///将yyyymmdd转换为日期格式
    	 if(str.length<8) str+='01';
        // validate year as 4 digits, month as 01-12, and day as 01-31 
        if ((str = str.match (/^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/))) {
           // make a date
           str[0] = new Date (+str[1], +str[2] - 1, +str[3]);
           // check if month stayed the same (ie that day number is valid)
           if (str[0].getMonth () === +str[2] - 1)
              return str[0];
        }
        return undefined;
    },
    currentUserInfo:function(){///加载当前用户信息
    	 var contextUrl = window.location['pathname'].split('/')[1];
			 var url = '/'+contextUrl+'/currentUser'+'?command=currentUser';
			 var userInfo  =this.remoteData(url);
			 return userInfo 
    },
    remoteData:function(_url,popTips,callback,method, data){
      var response = $.ajax({ 
  	     type: method||"GET",
    		 url:_url,
    		 async: false,
    		 dataType: "json",
    		 data:data,
    	}).responseText;
    	
    	if(response)
    	try{
    		 return jQuery.parseJSON(response); 
    		}catch(e){
    			return response;
    		};
      return response;
    },
    toJSON: function(object) {
     var type = typeof object;
      if(object==null) return;
     if ('object' == type) {
       if (Array == object.constructor) type = 'array';
       else if (RegExp == object.constructor) type = 'regexp';
       else type = 'object';
     }
     switch (type) {
     case 'undefined':
     case 'unknown':
       return;
       break;
     case 'function':
     case 'boolean':
     case 'regexp':
       return object.toString();
       break;
     case 'number':
       return isFinite(object) ? object.toString() : 'null';
       break;
     case 'string':
       return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function() {
         var a = arguments[0];
         return (a == '\n') ? '\\n': (a == '\r') ? '\\r': (a == '\t') ? '\\t': ""
       }) + '"';
       break;
     case 'object':
       if (object === null) return 'null';
       var results = [];
       for (var property in object) {
         var value = ai.toJSON(object[property]);
         if (value !== undefined) results.push(ai.toJSON(property) + ':' + value);
       }
       return '{' + results.join(',') + '}';
       break;
     case 'array':
       var results = [];
       for (var i = 0; i < object.length; i++) {
         var value = ai.toJSON(object[i]);
         if (value !== undefined) results.push(value);
       }
       return '[' + results.join(',') + ']';
       break;
     }
    },
    executeMultiSql : function (MultiSql, popTips, dataSource, callback) {
    	var contextUrl = window.location['pathname'].split('/')[1];
    	var url = '/' +contextUrl +'/newrecordService'+'?command=executeMultiSql';
    	url = (ai.URLEncode(url));
    	var result = this.remoteData(url, popTips, callback, 'POST', {'MultiSql':MultiSql,'dataSource':dataSource});
    	return result;
    },
    executeSQL : function (sql,popTips,dataSource,callback){
			sql = sql.replace(/\+/g,'@');
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/newrecordService'+'?command=executeSQL&initSql='+sql+'&dataSource='+dataSource;
			url=(ai.URLEncode(url));
			var result = this.remoteData(url,popTips,callback);
		  return result;
		},
		currentTime : function (){
			var contextUrl = window.location['pathname'].split('/')[1];
			var url = '/'+contextUrl+'/currentTime';//+'?command=currentTime';
			var currentTime  = this.remoteData1(url,false);
			return currentTime;
			//return Ext.decode(Asiainfo.remoteData(url,false));
		},
    loadRemotJsCss:function (_url,callback){
      if(_url.indexOf('{contextPath}')>=0){
     		_url=_url.replace('{contextPath}',contextPath);
     	};
      
     	if(this._global_loadfile.indexOf(_url)>=0) return;
     	this._global_loadfile.push(_url);
     	var self=this;
     	
     	var _dataType = 'script';
     	if(_url.indexOf(".html")>0) _dataType="html";
     	if(_url.indexOf(".htm")>0) _dataType="html";
     	if(_url.indexOf(".css")>0) _dataType="html";
     	 $.ajax({
         url : _url,
         async: false,
         dataType :  _dataType,
         success : function(data, textStatus) {
          self._global_loadfile.push(_url);
          if(_url.indexOf('css')>0){
             $("head").append("<style>"+data+"</style>");
          };
          if(_url.indexOf('js')>0){
             eval(data);
          };
          if (callback)
            callback(data);
         }
        });
    },
   getNewCode:function(store,fieldname,pre,tabname){
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
                   var _tmpsql="select max((substr("+fieldname+","+(pre.length+5)+",3))) as seq from "+tabname+" where "+fieldname+" like '%"+pre+cycle+"%'"
                   var ds_code=new  AI.JsonStore({
                   	sql:_tmpsql,
                   	 
                   	root:'root',
                   	loadDataWhenInit:true
                   });
                   var seq=0;
                   if(ds_code.getCount()>0&&ds_code.getAt(0).get('SEQ')!=null){
                   	seq=parseInt(ds_code.getAt(0).get('SEQ'))+1;	
                   }
                   seq=seq+'';
                   if(seq.length==1)seq='00'+seq
                   else if(seq.length==2)seq='0'+seq;
                    
                   var newcode=pre +cycle+seq;
                   return newcode;
		 }
		 else {alert('Asiainfo.getNewCode(),error')};
		}, 
   guid:function(){
   	 /*var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var chars = CHARS, uuid = new Array(36), rnd=0, r;
   	 for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');*/
     return this.md5( _UserInfo.username+new Date().format('yyyymmddhhmmss')+Math.random()*100);
    },
     md5:function(sMessage) {
        function RotateLeft(lValue, iShiftBits) 
        {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); 
        }
        
        function AddUnsigned(lX, lY) 
        {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                if (lX4 | lY4)
                {
                        if (lResult & 0x40000000) 
                                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                        else 
                                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                } 
                else 
                        return (lResult ^ lX8 ^ lY8);
        }
        
        function F(x, y, z) 
        { 
                return (x & y) | ((~x) & z); 
        }
        
        function G(x, y, z) 
        {
                return (x & z) | (y & (~z));
        }
        
        function H(x, y, z)
        {
                return (x ^ y ^ z); 
        }
        
        function I(x, y, z)
        {
                return (y ^ (x | (~z)));
        }
        
        function FF(a, b, c, d, x, s, ac) 
        {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
        }
        
        function GG(a, b, c, d, x, s, ac)
        {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
        }
        
        function HH(a, b, c, d, x, s, ac)
        {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
        }
        
        function II(a, b, c, d, x, s, ac)
        {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
        }
        
        function ConvertToWordArray(sMessage)
        {
                var lWordCount;
                var lMessageLength = sMessage.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while(lByteCount < lMessageLength)
                {
                        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                        lBytePosition = (lByteCount % 4) * 8;
                        lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount) << lBytePosition));
                        lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
        }
        
        function WordToHex(lValue) 
        {
                var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount ++) 
                {
                        lByte = (lValue >>> (lCount * 8)) & 255;
                        WordToHexValue_temp = "0" + lByte.toString(16);
                        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue;
        }

        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9 , S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        
        // Steps 1 and 2. Append padding bits and length and convert to words
        x = ConvertToWordArray(sMessage);

        // Step 3. Initialise
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
        
        // Step 4. Process the message in 16-word blocks
        for (k = 0; k < x.length; k += 16) 
        {
                AA = a; BB = b; CC = c; DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13],S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = AddUnsigned(a, AA);
                b = AddUnsigned(b, BB);
                c = AddUnsigned(c, CC);
                d = AddUnsigned(d, DD);
        }
        
        // Step 5. Output the 128 bit digest
        var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
        return temp.toLowerCase();
	} ,
    addTabSheet: function(id,title,srcUrl,show){
    if(typeof addTabSheet=="object") {addTabSheet(id,title,srcUrl); return;};
       var MainSheet;
       if(parent.MainSheet) MainSheet=parent.MainSheet
       else if(parent && parent.parent && parent.parent.MainSheet) MainSheet=parent.parent.MainSheet
       	else if(parent && parent.parent.parent && parent.parent.parent.MainSheet) MainSheet=parent.parent.parent.MainSheet
    	/*
    	try{
    		if(typeof MainSheet =='undefined'){
	       	var _par = parent||top;
	       	do{
	       	  if(!_par) break;
	       		MainSheet = _par.MainSheet;
	       		if(MainSheet){
	       			break;
	       		}
	       		_par = _par.parent||top;
	       	}while(_par!=top);
	       }
	      
       }catch(e){
      }*/
     
      if(title.length>10) title=title.substr(0,10)+'...';
      if(!MainSheet) {
      	window.open(srcUrl)
      }
	 else{
	 	MainSheet.addTabSheet(id,title,srcUrl,show);
	} 
		  
    },
    openDialogTopParent:function(_url,title,w,h){
    	var topWindow=window;
    	try{
    		 
	       	var _par = parent||top;
	       	do{
	       	  if(!_par) break;
	       		topWindow = _par 
	       		_par = _par.parent||top;
	       	}while(_par!=top);
	       	if(topWindow.ai && topWindow.ai.openDialog)
	        topWindow.ai.openDialog(_url,title,w,h) ;
  
       }catch(e){ }
       	 
		  
    },
    openDialog:function(_url,id,title,w,h,callback){//在url中显示对话框将
     	if(typeof art =='undefined'){
          		 this.loadWidget("dialog");
          		 
          		};
	  var _url=_url.replace("{contextPath}",contextPath);
	  if(_url.indexOf("opener=tabsheet")>0) {
	  		ai.openTabSheetDialog({
	  		title:title,
	  		items:[{id:(id||ai.guid()),title:title,url:_url}]
	  	})
	  }
	  else{
	  $.dialog.open(_url, {
				resize: !0,
				fixed: !0,
				id:2000,
			   zIndex:999999,
			   close:function(){
                 if(callback) callback()
              },
				//ico: core.ico("folder"),
				title:title||"详细信息..." 
				,width: w||880
				,height: h||400
			})
		}
	},  
    openTabSheetDialog :function(config,chkparentFlag){///打开带tab页面的对话框
    	 
    	 if(chkparentFlag!='n'){
    	var topWindow=window;
      	var _par = parent||top;
	    do{
	       	  if(!_par) break;
	       		topWindow = _par 
	       		_par = _par.parent||top;
	       	}while(_par!=top);
	      
	       	if(topWindow.ai && topWindow.ai.openTabSheetDialog) topWindow.ai.openTabSheetDialog(config,'n') ;
         }
    
    	 //if(window.parent) //window.parent.ai.openTabSheetDialog(config);
    	 
    	if(typeof MainTabPanel =='undefined' || !MainTabPanel){
    		 if(window.parent && window.parent.MainTabPanel)  MainTabPanel=window.parent.MainTabPanel;
    		 else  if(window.parent.parent && window.parent.parent.MainTabPanel) MainTabPanel= window.parent.parent.MainTabPanel;
       };
    	if(typeof MainTabPanel =='undefined' || !MainTabPanel){
    	 
		     MainTabPanel ={
				 
				init:function(config){
					var self=this;
				 
					this.tabPanel=art.dialog({
		    			title:"",// config.title||'创建文件夹',
		    			content: '<div class="tab-content" id="_gloabal_tabcontent" style="height: 100%;padding-bottom:12px">',
		    			id:"maintabsheet",
		    			okVal:'确定',
		    			cancelVal:'取消',
		    	 		resize:true,
		    	 		zIndex:999,
		   			 	width:"100%",
		   			 	height:"100%",
		    			init: function () {
		    				var tabHeadContain = $(".aui_title");
		    				tabHeadContain.empty();
		    				var  tabHeadUL=$('<ul class="nav nav-tabs nav-white"  style="margin-top: 0px; position: relative;top: 0px; left: 1px;float: left;"></ul>').appendTo(tabHeadContain);
		    				self.tabHead = tabHeadUL;
		    				//$('<li class="">'+(config.title||"新建")+'</li>').appendTo(tabHeadUL); 
		    			   // $('<li class=""><a href="#teamSystemResource" data-toggle="tab"> 系统资源信息 <i href="javascript:void(0);" class="close  icon-close"></i></a></li>').appendTo(tabHeadUL); 
		    			   var tabcontent = $("#_gloabal_tabcontent");
		    			   tabcontent.parent().css("padding","0px");
		    			   self.tabcontent = tabcontent;
		    			   
		    			   for(var i=0;i<config.items.length;i++){
		    			   	  var tabItem=config.items[i];
		    			   	   self.addTabSheet(tabItem);
		    			  };
		    			  
		    			}
		   			
					});
					
				},
				containerId:"_gloabal_tabcontent",
				addTabSheet:function(tabItem){
          if(this.tabHead.parent().length==0){
            this.tabHead.appendTo($(".aui_title"));
          }
				   tabItem.id=tabItem.id.replaceAll(".","");
			     var id=tabItem.id,title = tabItem.title,canclose = tabItem.canclose,url = tabItem.url;
			       id=id.replace("$","").replace("{","").replace("}");
					var tabcontentId ="tab_"+id; 
					if($(this.tabHead).find('#close_'+id).length>0){
						//$(this.tabHead).find('#close_'+id).parent().click();
            $(this.tabHead).find('#close_'+id).parent().trigger('click');
						return;
					};
					var tabHead=this.tabHead;
					var closeHtml ='<i id="close_'+id+'" class="close  icon-close"></i>';
					if(canclose==false) closeHtml="";
					var tabLi = $('<li><a href="#'+tabcontentId+'" data-toggle="tab">'+title+closeHtml+' </a></li>').appendTo(tabHead);
					
				    //alert('<div class="tab-pane" id="'+tabcontentId+'" style="background: white;height:100%" >我的</div>');
				    var tabcontent = this.tabcontent;
				    $('<div class="tab-pane" id="'+tabcontentId+'" style="background: white;height:100%;margin-bottom:-20px" ></div>').appendTo(tabcontent);
				    
				    tabLi.find("a").click();
				   
				    if(canclose!=false){
				    $("#close_"+id).click(function(){
				    	 var tabId = $(this).attr('id');
				    	 tabId=tabId.replace("close_","");
				    	 $(this).parent().parent().remove();
				    	$("#tab_"+tabId).remove();
				    //	if(TaskTap&&TaskTap.remove){TaskTap.remove(id);}
				    });
				  };
				  
				    $("#"+tabcontentId).append('<iframe id="frm'+id+'" src="'+url+'" width="100%" height="100%" frameborder="0" border="0" marginwidth="0" marginheight="0"></iframe>');
				    //if(TaskTap) TaskTap.add("maintabsheet",title);
				},
				addTabByForm:function(id,title,formcfg){
				},
				removeTab:function(id){
				},
				bindEvent:function(){	
				}
			};
			MainTabPanel.init(config);
		}
		else{
			// MainTabPanel.tabPanel.display(true);
			for(var i=0;i<config.items.length;i++){
			   MainTabPanel.addTabSheet(config.items[i]);
			}
		};
    },
    openFormDialog:function(title,formFieldArray,callback,store,w,h){
    	function insertDlgToBody(){
    	  var tpl='<div id="_global_dlg_form_model" class="modal fade modal-lg">' 
						+'    <div class="modal-dialog">' 
						+'    <div class="modal-content">' 
						+'      <div class="modal-header">' 
						+'        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' 
						+'        <h4 class="modal-title" >Modal title</h4>' 
						+'      </div>'
						+'      <div class="modal-body" id="_global_dlg_form">' 
						+'      </div>' 
						+'      <div class="modal-footer">' 
						+'        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>' 
						+'        <button id="dialog-ok" type="button" class="btn btn-primary">确定</button>' 
						+'      </div>' 
						+'    </div> ' 
						+'  </div>' 
						+' </div> ';
			$("body").append(tpl);
	   };
		if($("#_global_dlg_form").length==0) insertDlgToBody()
		
		$("#_global_dlg_form_model .modal-title").html(title);
		$("#_global_dlg_form_model #_global_dlg_form").empty();
		var formcfg=({
                id:'_global_dlg_form',
                containerId:'_global_dlg_form',
                store:store,
                fieldChange:function(fieldName,newVal){
                },
                items:formFieldArray
        });
       var from = new AI.Form(formcfg);
		if(callback){
			$("#_global_dlg_form_model #dialog-ok").unbind("click").click(function(){
				 var result = callback(from.getAllFieldValue());
				 
				 if(result!=false)  $('#_global_dlg_form_model').modal('hide');
			});
		};
		$('#_global_dlg_form_model').modal({show:true}); 
		
    },
    showDialogForm:function(formcfg,beforeSave,aftSave,w,h){
    				if(!w) w=650;
    	   		if(!h) h=400;
          	if(typeof art =='undefined'){
          		 this.loadWidget("dialog");
          		 
          		}
          	  $("#_global_from").remove();
          	   art.dialog({
						    title: formcfg.title||'创建',
						     //lock:formcfg.lock||false,
						    // id:formcfg.id,
						    id:"createform",
						   // zIndex:999999,//显示最前端
						    width:w,
						    height:h,
						    content: '<div id="_global_from" style="height:'+h+'px;overflow:scroll"></div>',
						    yesText:'确定',
						    noText:'取消',
						    ok: function () {
						    	var fieldVal = _global_from.getAllFieldValue();
						    	if(beforeSave && beforeSave(fieldVal)==false) return false; 
						       if(aftSave) {
						       	  if(aftSave(fieldVal)==false) return false;
						       	};
						        return true;
						    },
						    cancel:function(){
						    	return true;
						    },
						    resize:true,
						    init: function () {
						    	formcfg.containerId="_global_from";
						    	_global_from = new AI.Form(formcfg);
						    
						    }
			 });
    },
    showDialogview:function(viewMetaHtml,w,h){
    	   if(!w) w=800;
    	   if(!h) h=400;
    	   if(typeof art =='undefined'){
          		 this.loadWidget("dialog");
          };
			$("#_global_from").remove();
		  art.dialog({
		    title: '查看',
		    content: '<div id="_global_from" style="height:'+h+'px;overflow:scroll"></div>',
		    resize:true,
		    init: function () {
		    	$("#_global_from").append(viewMetaHtml);
		    },
		    zIndex:99999,
		    width:w,
		    height:h
		});
		},
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
		installShareWidget:function(config){
			if(!config) return;
			var path="/"+contextUrl+"/public/js";
			 /*
			ai.loadRemotJsCss(path+"widget/share.css");
      ai.loadRemotJsCss(path+"widget/share.html",function(data) {
     	  $(document.body).append(data);
       });
       */
      ai.loadRemotJsCss(path+"/ai.share.js"); 
      UJIAN.init(config);
		},
		/*
		echo(getType("abc"));//string
    echo(getType(true));//boolean
    echo(getType(123));//number
    echo(getType([]));//array
    echo(getType({}));//object
    echo(getType(function(){}));//function
    echo(getType(new Date));//date
    echo(getType(new RegExp));//regexp
    echo(getType(Math));//math
		*/
		getObjType:function (o) {
        var _t;
        return ((_t = typeof(o)) == "object" ? Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
    },
    /*在运行态时声明创建的组件,便于引用
    */
    registerCmp:function(id,cmp){
    	this.Components[id]=cmp;
    },
    /*在运行态时声明创建的组件的引用
    */
    getCmp:function(id){
    	return this.Components[id]
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
		ai.executeSQL(sql);
     	_UserInfo.profile[paraname]=paravalue;
    }, 
    /**
		 * 读取用户个性化参数
		 */
	readProfile: function(paraname){
		if(!_UserInfo.profile){
			_UserInfo.profile = {};
			var tmpstore=  ai.getStoreData("select * from METAUSER_PROFILE where USERNAME='"+_UserInfo.username+"'");
			for(var i=0;i<tmpstore.length;i++){
				var r=tmpstore[i];
				_UserInfo.profile[r['PARANAME']]=r['PARAVALUE'];
			}
		};
		return _UserInfo.profile[paraname];
    },
   isArray:function(v){return v&&typeof v.length=='number'&&typeof v.splice=='function';},
    isDate:function(v){return v&&typeof v.getFullYear=='function';},
    pad:function(n) {
        return n < 10 ? "0" + n : n;
    },
    encodeArray:function(o){
        var a = ["["], b, i, l = o.length, v;
            for (i = 0; i < l; i += 1) {
                v = o[i];
                switch (typeof v) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if (b) {
                            a.push(',');
                        }
                        a.push(v === null ? "null" : ai.encode(v));
                        b = true;
                }
            }
            a.push("]");
            return a.join("");
    },
    encodeDate:function(o){
        return '"' + o.getFullYear() + "-" +
                pad(o.getMonth() + 1) + "-" +
                pad(o.getDate()) + "T" +
                pad(o.getHours()) + ":" +
                pad(o.getMinutes()) + ":" +
                pad(o.getSeconds()) + '"';
    },
    encodeString:function(s){
        var m = {  
          "\b": '\\b',  
          "\t": '\\t',  
          "\n": '\\n',  
          "\f": '\\f',  
          "\r": '\\r',  
          '"' : '\\"',  
          "\\": '\\\\'  
      };  
        if (/["\\\x00-\x1f]/.test(s)) {
            return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = m[b];
                if(c){
                    return c;
                }
                c = b.charCodeAt();
                return "\\u00" +
                    Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            }) + '"';
       } 
        return '"' + s + '"';
    },
    encode:function(o){
        if(typeof o == "undefined" || o === null){
            return "null";
        }else if(ai.isArray(o)){
            return ai.encodeArray(o);
        }else if(ai.isDate(o)){
            return ai.encodeDate(o);
        }else if(typeof o == "string"){
            return ai.encodeString(o);
        }else if(typeof o == "number"){
            return isFinite(o) ? String(o) : "null";
        }else if(typeof o == "boolean"){
            return String(o);
        }else {
            var a = ["{"], b, i, v;
            for (i in o) {
                if(!useHasOwn || o.hasOwnProperty(i)) {
                    v = o[i];
                    switch (typeof v) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if(b){
                            a.push(',');
                        }
                        a.push(this.encode(i), ":",
                                v === null ? "null" : this.encode(v));
                        b = true;
                    }
                }
            }
            a.push("}");
            return a.join("");
        }
    },
    decode:function(json){
        return eval("(" + json + ')');
    },
    addgroupcode:function(groupCode,groupName,type,teamCode){//添加、修改用户角色
       /* var tmpstore = new AI.JsonStore({
            sql:"select * from metagroup where groupcode = '"+groupCode+"'",
            pageSize:-1,
            table:'METAGROUP',
            key:"GROUPCODE"
        });
        var _recoerd;
        if(tmpstore.getCount()==0){
          _recoerd=tmpstore.getNewRecord();
          tmpstore.add(_recoerd);
        }
        for (var i = 0; i < tmpstore.getCount(); i++) {
            _recoerd=tmpstore.getAt(i);
            _recoerd.set("GROUPCODE",groupCode);
            _recoerd.set("GROUPNAME",groupName);
            _recoerd.set("TYPE",type);
            _recoerd.set("TEAM_CODE",teamCode);
        }
        tmpstore.commit(true);
        */
    }
  }
}();
ai.init();
 