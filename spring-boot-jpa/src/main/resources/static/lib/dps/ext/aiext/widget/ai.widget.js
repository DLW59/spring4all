Ext.namespace("Asiainfo.widget");
Asiainfo.widget = function() {
 return {
   DealSqlWithStore:function(cfgsql){
      var sql=cfgsql;
      if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
     
      var i=0;
      
      while(i<5){
        var oldstr=sql.substring(sql.indexOf("{")+1, sql.indexOf("}"));
        var strArray=oldstr.split('.');
          
        if(strArray.length>=2){
          var tmpStore=Ext.StoreMgr.get(strArray[0]);
          if(tmpStore && tmpStore.curRecord)
            sql=sql.replaceAll('{'+oldstr+'}',tmpStore.curRecord.get(strArray[1]));
        }
        i++;
     };
 
     return sql;
   },
   DealSql:function(cfgsql,paraname){
   	
	  var sql=cfgsql;
	  if(sql.indexOf("{")==-1 || sql.indexOf("}")==-1) return sql;
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
	  
	  sql=this.DealSqlWithStore(sql);
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
		if(this.maintbar){
			 
		var tbfields= this.maintbar.tbfields;
		
		for(var i=0;i<tbfields.length;i++){
			var fdVal = tbfields[i].getValue();
     	if(fdVal && tbfields[i].getXType()=='datefield') fdVal=Ext.util.Format.date(fdVal, 'Y-m-d');
     	// /增加where条件
     	 
     	if(fdVal && tbfields[i].where && fdVal!='all' && tbfields[i].name &&(paraname=='all' || paraname.indexOf(tbfields[i].name)!=-1))
			    caluse.push(tbfields[i].where.replace('{'+tbfields[i].name+'}',fdVal));
			// /替换sql中的变量
	    if(sql.indexOf("{"+tbfields[i].getId()+".")!=-1 && tbfields[i].getXType()=='datefield'){
				var iPos=sql.indexOf("{"+tbfields[i].getId()+".");
				var dt=tbfields[i].getValue();
				var format=sql.substr(iPos+("{"+tbfields[i].getId()+".").length);
				format=format.substr(0,format.indexOf('}'));
				sql=sql.replaceAll("{"+tbfields[i].getId()+"."+format+"}",dt.format(format));
		  }
	   else if(sql.indexOf("{"+tbfields[i].getId()+"}")!=-1){
			  var replaceVal=tbfields[i].getValue();
			  if(replaceVal && tbfields[i].getXType()=='datefield') replaceVal=Ext.util.Format.date(replaceVal, 'Y-m-d');
			  if(!replaceVal && tbfields[i].getRawValue) replaceVal = tbfields[i].getRawValue();
			  if(!replaceVal || replaceVal=="") replaceVal=-999999999;
			  sql=sql.replace("{"+tbfields[i].getId()+"}",replaceVal);
		 }
		}
		if(caluse.length!=0) where +=' where '+  caluse.join(' and ')
		if(paraname) sql+= where ;
	 
	        }
	        // return sql;
	        
		
		
		// /组件对象的参数处理
		while(sql.indexOf("{")!=-1 && sql.indexOf("}")!=-1){
		  var newStr=-99999;
		  var oldstr=sql.substring(sql.indexOf("{")+1, sql.indexOf("}"));
		   
		  var strArray=oldstr.split('.');
		  var record=null;
		  if(strArray[1]=='getwhere'){
		   
		  	// if(this.allObjs[strArray[0]] &&
			// this.allObjs[strArray[0]].getwhere)
			// newStr=this.allObjs[strArray[0]].getwhere()
		  	// else
		  	newStr=' 1=1 '
		  }
		  else{
		     
		    var store=Ext.StoreMgr.get(strArray[0]);
		    if(store){
		    	 if(store.curRecord) record=store.curRecord
		    	 else if(store.getCount()>0) record=store.getAt(0);
		    }
		    else if(this.allObjs[strArray[0]] && this.allObjs[strArray[0]].store && this.allObjs[strArray[0]].store.curRecord)
		  	record=this.allObjs[strArray[0]].store.curRecord; 
		    
		    if(record) newStr=record.get(strArray[1]);
		 }
		  sql=sql.replace("{"+oldstr+"}",newStr);
		}
		 
		return sql;
   },
   actfun:function(clickfun,clickpara,befoeSaveFn,cfg,afterSaveFn){
   	 	 
	var objs= clickpara.split(',');
	
	if( clickfun=='refresh'){

	   for(var i=0;i<=objs.length;i++){
	   	this.RefreshView(objs[i]); 
	   } 
	}
	else if( clickfun=='openform'){
	     var formid=objs[0];
	     var storeId=objs[1];
	     var acttype=objs[2]?objs[2]:'view';
	     
	     var fm=Ext.getCmp(formid);
	     
	     if(!fm && cfg){
	     	fm = new Asiainfo.widget.Form(cfg).control; 
	     };
	     
	      
	     if(fm){// /清空fm的值
	       function eachItem(item,index,length) {   
                      if(item.getName && item.setValue) item.setValue(""); 
                      if (item.items && item.items.getCount() > 0) {   
                      item.items.each(eachItem, this);   
                     }   
                    } 
	       if(fm.items)    fm.items.each(eachItem, this);
	     } 
	     var store=null;
	    
	     if(fm &&  fm.store) store=fm.store
	     else if(storeId) store = Ext.StoreMgr.get(storeId);

	     var record=null;
	       
	     if(acttype=='add' && store ){
	     	  
	     	record=store.getNewRecord();
	     	store.curRecord=record;
	     	 
	     }
	     else if(store){
	     	   
	     	  if(!store.curRecord && store.getCount()!=0) {store.curRecord=store.getAt(0);store.itemindex=0};
	     	  record=store.curRecord;  
	     }
	     var fmwin = Ext.getCmp('win_'+formid);
	     
	    function onOKSave(){
	     	    
	    	    function eachItem(item,index,length) {   
                      if(item.getName && item.getValue && item.getName() != '') record.set(item.getName(),item.getValue()); 
                      if (item.items && item.items.getCount() > 0) {   
                      item.items.each(eachItem, this);   
                     }   
                    }; 
                    var record=fmwin.record;
                    var acttype=fmwin.acttype;
                    if(record) fm.items.each(eachItem, this);
	    	    
	    	    if(befoeSaveFn){
	    	    	if(!befoeSaveFn(fm,acttype)) return;
	    	    };  
	    	    if (fm.fireEvent('befoeSave', fm,record,acttype) == false) {
               return
            };
	    	    if(acttype=='add' && store && record){
	    	    	 store.add(record);
	    	    }
	    	    if(store) store.commit(true); 
	    	    
	    	    if(afterSaveFn){
	    	    	if(!afterSaveFn(fm,acttype)) return;
	    	    };
	    	    if (fm.fireEvent('afterSave', fm,record,acttype) == false) {
               		return
            	};
	    	    record=null;  
	    	    fmwin.hide();
	    	};
	     function closeWin(){
	    		fmwin.hide();
	    	};
	    	
	     if(!fmwin){
	     	    
	     	    var winWidth=600;
                var _title = "信息";
	     	    if(fm.width) winWidth=fm.width;
                if(fm.ptitle) _title = fm.ptitle;
	     	    else if(cfg && cfg.width) winWidth=cfg.width;
	     	    var winHeight=400;
	     	    if(fm.height) winHeight=fm.height
	     	    else if(cfg && cfg.height) winHeight=cfg.height;
	     	    		
	     	    fmwin = new Ext.Window({id:'win_'+formid, title: _title, width:winWidth, height:winHeight, layout: 'fit', plain:true,
                      modal: true, bodyStyle:'padding:1px;', buttonAlign:'center',closable:fm.winClosable || false,
                      items: [fm],   
                      buttons: [{ text: "确定",  handler: onOKSave,    scope: this }, 
                                { text: "退出",  handler: closeWin,  scope: this   }
                               ]  
                  });
                  
         }  
             fmwin.record=record;
             fmwin.acttype=acttype;
	     
	    fmwin.show();
	   
	    if(record) fm.getForm().loadRecord(record);
	    fm.fireEvent('aftershow', fm,record,acttype)  
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
	else if( clickfun=='query'){
	   var _aitbar=Ext.getCmp(objs[0]).Mgr;
	   var _ds=Ext.StoreMgr.get(objs[1]);
	   if(!_aitbar || !_ds){return false};
	    _ds.updateSql("select * from ("+_ds.oldSql+" ) a where "+_aitbar.getwhere());
	    _ds.select();
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
		//var commitFlag = objs[1];

		if(!_ds)return ;
		Ext.Msg.confirm('信息','确定要删除当前记录吗?',function (btn){

			if(btn=='yes'){
				var rec=_ds.curRecord;
				 
				if(rec){
				 	_ds.remove(rec);
					// if(commitFlag && commitFlag=='true')
					 _ds.commit(false);
					_ds.itemindex=0;
					try{
					   dataManager.fresh(_ds,null,_ds.itemindex);
				   }catch(error){
					
				   };
				}
	
			}

		})
	}
	else if( clickfun=='help'){
	   Asiainfo.ShowWin('帮助信息','../forum/help.html?MODELCODE='+Asiainfo.GerUrlInfo(window.location,'Pathname'))
	}
	else if( clickfun=='pickobj'){

		baseFun.loadScript('/'+contextPath+'/dacp-li/ext/aiext/form/searchWin4.js');

		try{

			eval(this.clickpara);

		}catch(e){

			alert('按钮配置错误'+this.text+','+this.clickpara);

		}
		mywin=searchWin.init(funAftPickTo,_main.CompMgr.DealSql(this.listvalue))

	}
	else if( clickfun=='expdata'){
           if(Ext.getCmp(objs[0])) this.expData(Ext.getCmp(objs[0]));
	} 
   },
   getField:function (c,store){
    	 
	     var fd=null;
	     // c.anchor='90%';
	     c.listeners={ change:fieldChang };			
	     	
	     c.ds=store; 		
	     c.scope=this;	

	     if(c.xtype=='label' || c.xtype=='标签')
		     fd=new  Ext.form.Label(c); 
	     else if (c.xtype=='textfield')  
	     	fd=new Ext.form.TextField(c)	
	     else if((c.xtype=='combo' || c.xtype=='下拉框')&&c.storesql)
		     fd=Asiainfo.widget.getComboxField(c)
	     else if((c.xtype=='combotree' || c.xtype=='下拉树')&& c.storesql){
	     	baseFun.loadScript('/'+contextPath+'/dacp-li/ext/aiext/form/ComboBoxTree.js');
	     	
		    fd=new Ext.ux.ComboBoxTree(c)
	     }
	     else if(c.xtype=='textarea') 
	     	fd=new Ext.form.TextArea(c)
	     else if(c.xtype=='datefield'){
	     	if(!c.format) c.format='Y-m-d'; 
	        fd=new Ext.form.DateField(c)
	     }
	     else if(c.xtype=='timefield'){
	     	 if(!c.format) c.format="H:i";
	        fd=new Ext.form.TimeField(c)
	     }
	    else if(c.xtype=='filefield')
	        fd=Asiainfo.widget.getFileField(c)
	    else if(c.xtype=='fileupload'){
	    	c.fileUpload=true ;
	    	baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/FileUploadField.js');
	    	fd=new  Ext.form.FileUploadField(c)
	    }
	    else if(c.xtype=='muliselect')
	        fd=Asiainfo.widget.getMuliseleField(c)
	    else if(c.xtype=='htmleditor')
	    	 fd=new Ext.form.HtmlEditor(c)
	    else if(c.xtype=='checkbox')
	    	 fd=new Ext.form.Checkbox(c)
	   	else if(c.xtype=='checkboxGroup'){
	   		fd = Asiainfo.widget.getCheckBoxGroupField(c);
	    }
	    else if(c.xtype=='radio')
	    	 fd=new Ext.form.Radio(c)
	    	 
	    else if(c.xtype=='trigger'){
	    	baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/searchWin4.js');
	    	c.triggerClass= 'x-form-search-trigger';
	    	fd=new Ext.form.TriggerField(c);
	    	if(!c.storesql) return ;
	    	searchWin.AddTrigfield(fd,c.storesql,c.call_back,null,c.storeId);
	        if(c.parent){
	    	fd.on('focus',function(){
	    		var cmp=Ext.getCmp(c.parent);
	    		
	    		fd.store.templateSQL='select 111 values1,222 values2 from metauser';
	    		 
	    	   });
	        }
	    } 
	    else if(c.xtype=='pick'){
	    	baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/widget/ai.pickobj.js');
	    	c.triggerClass= 'x-form-search-trigger';
	    	if(!c.onTriggerClick){
	    		c.onTriggerClick=function(){
	    			var win=new Asiainfo.widget.PickObj({subtype:c.subtype,width:600,height:400, title:'选择对象',bindCmp:this,selsql:c.storesql});
	    			win.show();
	    		};
	    	};
	     fd=new Ext.form.TriggerField(c); 
	    }  
	    else if(c.xtype=='button')
	    	 fd=new Ext.Button(c)	
	    var needBind=false;
	   if(c.xtype=='textfield' ||c.xtype=='combo' ||c.xtype=='textarea' ||c.xtype=='datefield' ||c.xtype=='timefield' ||c.xtype=='filefield' ||c.xtype=='muliselect' || c.xtype=='htmleditor' ||c.xtype=='trigger'||c.xtype=='pick')
	    needBind=true;
	  
	  if(needBind  && typeof(dataManager)!='undefined' && typeof(dataManager)!=null && store){
	   	fd.ds=store;
	   	dataManager.bindCmp(store,fd,'Field'); 
	  }
	  // /if(fd)this.control.add({colspan:config.fields[i].colspan,width:config.fields[i].width?config.fields[i].width:_perWidth*config.fields[i].colspan,items:[fd]});
	  	
	 return fd;		
	
		},
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
   getComboxField:function (c){
	    var combostore;
    	var vfield,dfield;
      if(c.storename && c.storesql){// ///201112，增加storename的配置支持
        var data=[];
    		var items=c.storesql.split(',');
    		var itemVals = c.storename.split(',');
    		for(var j=0;j<items.length;j++){
    			if(j<=2)alert(items[j]+","+itemVals[j])
    			if(itemVals.length>j)
    			   data.push([items[j],itemVals[j]])
    			else
    			   data.push([items[j],items[j]]);
    		};
    		combostore = new Ext.data.SimpleStore({ fields: ['ID','VALUE'], data :data });
    	  vfield='ID';dfield='VALUE';
    	  c.mode= 'local';
    	  c.editable=true;
      }
    	else if(c.storesql.substr(0,1)=='['){
    	  var data=Ext.decode('['+c.storesql+']');
        combostore = new Ext.data.SimpleStore({fields: ['ID', 'VALUE'],data : data});
        vfield='ID';dfield='VALUE';
        c.mode= 'local';
        c.editable=false;
    	}
    	else if(c.storesql.indexOf('select ')!=-1 && c.storesql.indexOf(' from ')!=-1){
    	  combostore= new Asiainfo.data.AsiaInfoJsonStore({
           sql:c.storesql,
           root:'root',
           initUrl:'/'+contextPath+'/newrecordService',
           url:'/'+contextPath+'/newrecordService',
           dataSource:c.dataSource || "",
           loadDataWhenInit:true});
           if(combostore.recordFields.length==1) {vfield=combostore.recordFields[0].name;dfield=combostore.recordFields[0].name;c.editable=true;}
           else if(combostore.recordFields.length==2){vfield=combostore.recordFields[0].name;dfield=combostore.recordFields[1].name;c.editable=false;}
           else if(combostore.recordFields.length==3){vfield=combostore.recordFields[0].name;dfield=combostore.recordFields[1].name;c.editable=true;}
           else{vfield=combostore.recordFields[0].name;dfield=combostore.recordFields[1].name;c.editable=false;}
           c.mode= 'local';
           // c.editable=true;
    	}
    	else if(c.storesql){
    		var data=[];
    		var items=c.storesql.split(','); 
    		for(var j=0;j<items.length;j++){
    			data.push([items[j],items[j]]);
    		};
    		combostore = new Ext.data.SimpleStore({ fields: ['ID','VALUE'], data :data });
    	 vfield='ID';dfield='VALUE';
    	 c.mode= 'local';
    	 c.editable=true;
       };
     
      c.triggerAction='all';
      c.store=combostore;
      c.valueField=vfield;
      c.displayField=dfield;
      if(!c.editable) c.listeners={change:fieldChang}
      else c.listeners={change:fieldChang,blur:fieldChang};
      	
      var combox=new Ext.form.ComboBox(c);
      
      combox.parentmgr=this; 
        // /增加联动事件绑定
      
       if(c.storesql.indexOf('{')!=-1 && c.storesql.indexOf('}')!=-1 ){
       	   
       	     
			       c.oldsql=c.storesql;
			        combox.oldsql=c.oldsql;
			   /*
				 * c.storesql=this.dealParaSql(c.storesql);
				 * combox.oldsql=c.oldsql;
				 */
			        var paras=this.getSQLParas(c.oldsql);
		          for(var j=0;j<paras.length;j++){
		             var pfd=this.getFieldByName(paras[j]);
		             if(pfd){
		                    	if(!pfd.child) pfd.child=[];
		                    
		                     pfd.child.push(combox);
		                       pfd.on('collapse',this.paraChang);
		             }  
		        };
		     
          
		}; 
    
     // combox.editable=true;//c.editable;
		// 由于这个地方改成true后，combo组建里面的key,value形式的值，只能返回value的值，无法返回key值。故屏蔽
     combox.editable=c.editable;
      if(c.rawvalue){
      	combox.rawvalue=c.rawvalue;
      	combox.on('render',function(){
        this.setRawValue(this.rawvalue);
        })
       };
     
      // 增加模糊查询
      combox.on('beforequery',function(e){
        var combo = e.combo;
        if(!e.forceAll){
            var value = e.query;
            combo.store.filterBy(function(record,id){
                var text = record.get(combo.displayField);
                return (text.indexOf(value)!=-1);
            });
            combo.expand();
            return false;
        }
   	  });
      
      // combox下拉框点击事件
      combox.on('select',function(combo, record,index){
     
      // alert(combo.id);
    	// if(e.valueField == "XMLID"){
    	// document.getElementById(e.id).value = e.lastSelectionText + "-"
		// +e.value;
    	 // };
    	  console.log(combo.store.sql);
      });
     
	  return combox;  	 
	},
	getCheckBoxGroupField:function(c){
		baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/CheckboxGroup.js');
		// var items=[];
   		// if(!c.columns || c.columns > c.boxLabels.length) c.columns =
		// c.boxLabels.length;
   		// for(var i=0;i<c.boxLabels.length;i++){
   		// items.push({name:c.name,boxLabel:c.boxLabels[i].boxLabel,inputValue:c.boxLabels[i].value,checked:c.boxLabels[i].checked});
   		// }
   		// c.items = items;
    	// fd=new Ext.form.CheckboxGroup(c);

    	var checkValues = typeof(c.value) == 'object' && c.value.length ? c.value : (typeof(c.value) == 'string' ? c.value.split(',') : []);
    	var items=[];
    	var itemArray=[];
    	if(c.storesql.indexOf('select') != -1){
    		var vfield,dfield;
			var arrayStore= new Asiainfo.data.AsiaInfoJsonStore({
			   sql:c.storesql,
			   loadDataWhenInit:true,
			   root:'root',
			   initUrl:'/'+contextPath+'/newrecordService',
			   url:'/'+contextPath+'/newrecordService' 
			});

			if(arrayStore.recordFields.length==1) {
					vfield=arrayStore.recordFields[0].name;
					dfield=arrayStore.recordFields[0].name;
				}
			else {
				vfield=arrayStore.recordFields[0].name;
				dfield=arrayStore.recordFields[1].name;
			}

			c.columns = arrayStore.getCount();
			for(var i=0;i<arrayStore.getCount();i++){
				var _itemArray = [];
				var r=arrayStore.getAt(i);
				_itemArray.push(r.get(vfield));
				_itemArray.push(r.get(dfield));
				itemArray.push(_itemArray);
			}
    	}else if(c.storesql.substr(0,1) == '['){ // "['dwdb','仓库'],['meta','元数据库']"
    		itemArray=Ext.decode('['+c.storesql+']');
    	}else {
    		itemArray = c.storesql.split(",");
    	}

    	for(var i=0;i<itemArray.length;i++){
			var _item = {};

			if(typeof(itemArray[i])=='object'){
				_item.inputValue = itemArray[i][0];
				_item.boxLabel = itemArray[i][1];
			}else if(typeof(itemArray[i])=='string'){
				_item.inputValue = itemArray[i];
				_item.boxLabel = itemArray[i];
			}

			
			if(checkValues.indexOf(_item.inputValue) != -1){
				_item.checked = true;
			}

			items.push(_item);
		}

		if(!c.columns || c.columns > itemArray.length) c.columns = itemArray.length
    	c.items = items;
    	return new Ext.form.CheckboxGroup(c);
	},
	getFileField:function(c){
		
	   baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/UploadDialog/Ext.ux.UploadDialog.js');
	   baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/UploadDialog/css/Ext.ux.UploadDialog.css','css');
	   baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/FileUploadField.js');
	   return new Ext.form.FileField( c ); 
	},
	getMuliseleField:function(c){
		 
	   baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/form/MultiSelectField.js');
	   var itemArray=[],valArray=[];
	   if(c.storesql.substr(0,1)=='['){
    	     itemArray=Ext.decode('['+c.storesql+']');
            }
     else if(c.storesql.indexOf('select')!=-1){
    	   var vfield,dfield;
    	   var arrayStore= new Asiainfo.data.AsiaInfoJsonStore({
           sql:c.storesql,
           loadDataWhenInit:true,
           root:'root',
           initUrl:'/'+contextPath+'/newrecordService',
           url:'/'+contextPath+'/newrecordService' });
           if(arrayStore.recordFields.length==1) {vfield=arrayStore.recordFields[0].name;dfield=arrayStore.recordFields[0].name;}
           else{vfield=arrayStore.recordFields[0].name;dfield=arrayStore.recordFields[1].name;}
           
           for(var i=0;i<arrayStore.getCount();i++){
             var r=arrayStore.getAt(i);
             itemArray.push([r.get(vfield),r.get(dfield)]);	
           }
    	}
    	else if(c.storesql){
    		var items=c.storesql.split(','); 
    		for(var j=0;j<items.length;j++){
    			itemArray.push([items[j],items[j]]);
    		};
    	};	 
    	if(c.value){
    	  var items=c.value.split(','); 
    	  for(var i=0;i<items.length;i++){
    	        valArray.push([items[i],items[i]]);
    	   }
    	};
    	c.hiddenName='hid';
    	c.contextArray=itemArray;
    	c.defaltValueArray=valArray; 
	return new Ext.form.MultiSelectField(c);
        },
   dealParaSql:function (cfgsql){
		// /工具栏联动查询
		if(cfgsql.indexOf("{")==-1||cfgsql.indexOf("}")==-1)return cfgsql;
		var paras=this.getSQLParas(cfgsql);
		for(var i=0;i<paras.length;i++){
		   var fd=this.getFieldByName(paras[i]);
		   if(fd) cfgsql=cfgsql.replace('{'+paras[i]+'}',fd.getValue());
		};
		return cfgsql;
	},
   getSQLParas:function(sqlstring){
	 var paras=[];
	 while (true) {
	    var stPos,edPos;
	    stPos=sqlstring.indexOf('{');
	    edPos=sqlstring.indexOf('}');
	    if(stPos==-1 || edPos==-1 || stPos > edPos) break;
	    var para=sqlstring.substr(stPos+1,edPos-stPos-1);
	    paras.push(para);
	    
	    sqlstring = sqlstring.substr(edPos+1);
	  }
          return(paras);
        },
    getFieldByName:function(fieldName){
        	var cmp=Ext.getCmp(fieldName);
        	return cmp;
 
     },
	paraChang:function (field,newValue,oldValue){
		if(!field.child){
			return ;
		};
		for(var i=0;i<field.child.length;i++){
			var sql=field.parentmgr.dealParaSql(field.child[i].oldsql);
			field.child[i].store.updateSql(sql);
			field.child[i].store.select();
			field.child[i].setValue("");
			field.parentmgr.paraChang(field.child[i]);
		};

	},
  getWin:function(){
  	this.myTextarea=new Ext.form.TextArea({height:400});
	this.editwin = new Ext.Window({ title: "信息", width: 600, height:400, minWidth: 300, minHeight: 200, layout: 'fit', plain:true,
                      modal: true, bodyStyle:'padding:1px;', buttonAlign:'center',
                      items: [new Ext.FormPanel({layout: 'fit',items:[this.myTextarea]})],   
                      buttons: [{ text: "确定",  handler: onOKSave,    scope: this }, 
                                { text: "退出",  handler: closeWin,  scope: this   }
                               ]  
                  });
	    	 function onOKSave(){
	    	      var recs = _main.propertyGrid.getSelections();
    	              if(recs.length==0) return; 
    	              recs[0].set('value',this.myTextarea.getValue());
                      this.editwin.hide();
	    	};
	    	function closeWin(){
	    		this.editwin.hide();
	    	}
	 
  },
  bindWorkFlow:function (tbbar,mainStore,subStore,CheckFun){
	 // baseFun.loadScript('/'+contextPath+'/sysmgr/asiainfo/form/workflow.js');
	  if(!tbbar) return;
	  var wkdriver = new flowdriver(mainStore.getAt(0).get('MODELFLOWCODE'),mainStore,subStore,tbbar);
          wkdriver.SetStateInfo(mainStore.getAt(0).get('MODELFLOWCODE'),mainStore.getAt(0).get('REQCODE'),mainStore.getAt(0).get('STATE'),tbbar);	 	
	  wkdriver.CheckReqForm=CheckFun;
	  return wkdriver; 	
  },
   
  bindFormtoRecord:function(fm,ds,record){
      if(!fm || !ds || !record) {alert('function para error!!');return false};
      function ExistsRecordField(fieldName){
      	for(var i=0;i<ds.recordFields.length;i++){
      	   if(ds.recordFields[i].name==fieldName) return true;
      	}
      	return false;
      };
      function eachItem(item,index,length) {   
         if(item.getName && item.getValue){
            if(ExistsRecordField(item.getName())) record.set(item.getName(),item.getValue())
          }; 
         if (item.items && item.items.getCount() > 0) {   
             item.items.each(eachItem, this);   
         }   
     } 
     fm.items.each(eachItem, this);
     return true;
  },
  expData:function(gd_result){
  	var cm = gd_result.getColumnModel();
	var cmLen = cm.getColumnCount();
	var cmHeader = [],dataIndex=[];
	var start=1;
	var exportSql = gd_result.exportSql || gd_result.getStore().sql.replace(/@/g,'+').replace(/\$/g,'&'); 
	var dataSource = gd_result.getStore().dataSource || '';
	var fieldmap=gd_result.getStore().map;
	var fieldmapStr="";
	if(fieldmap) fieldmapStr = Ext.encode(fieldmap);
 
	if(cm.getColumnHeader(0).indexOf('x-grid3-hd-checker') == -1) start=0;
	for(var i=start;i<cmLen;i+=1){
		if(!cm.isHidden(i)){
			// cmHeader.push(cm.getColumnHeader(i));
			// dataIndex.push(cm.getDataIndex(i));
			var header ={};
			header["dataIndex"] = cm.getDataIndex(i);
			header["label"] = cm.getColumnHeader(i);
			cmHeader.push(header);
		}
	};
	// Ext.util.FormSubmit('/'+contextPath+'/export',{
	// sql:exportSql,
	// dataSource:dataSource,
	// columnsLabel:dataIndex,
	// columnsName:cmHeader,
	// map:fieldmapStr
	// });
		Ext.util.FormSubmit("/"+contextPath+"/ve/download",{
			sql:exportSql,
			header:Ext.encode(cmHeader),
			fileName:"DATA_"+new Date().format("yyyymmddhhmmss"),
			fileType:"excel",
			dataSource:dataSource
		});
  }
}}();
Ext.util.FormSubmit = function(url,params){
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
};
function dateRender(data, cell, record, rowIndex, columnIndex, store){
   var format = format || "Y-m-d";   
   return Ext.util.Format.dateRenderer('Y-m-d').apply(this, [data, cell, record, rowIndex, columnIndex, store]);
};