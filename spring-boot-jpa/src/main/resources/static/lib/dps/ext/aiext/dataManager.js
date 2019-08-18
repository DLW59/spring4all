
Ext.namespace("Asiainfo.data");

Asiainfo.data.dataManager = function(debugLevel){

	this.cache = [];//一个关于store和各个组件的缓存，格式类似于这样: {store:store , cmps:[{cmp:cmp,xtype:xtype},....]}
	
	_dtmgr = this;//当前类的自指针
	
	this.rule=[];
	
	this.log4j = new Ext.util.log4j('Asiainfo.data.dataManager',debugLevel || 'error');	/**
		私有方法，给定store，返回它在数组中的位置，如果没有则返回-1
	*/
	this.getBindingPosition = function(store){
		i = 0;
		if(!store){
			_dtmgr.log4j.error('store为空，store='+store);
			return null;
		}
		for(l=_dtmgr.cache.length;i<l;i+=1){//开始遍历cache
			if(_dtmgr.cache[i].store == store){//如果数组中已有store
				break;
			}
		}
	 
		return i;
	},
	
	/**
		private method,given Component,return the binding store.
	*/
	this.getBindcmpType=function(cmp){
		for(i=0,l=_dtmgr.cache.length;i<l;i+=1){//遍历cache数组
				_dtmgr.log4j.debug('i='+i);
				for(k=0,len=_dtmgr.cache[i].cmps.length;k<len;k+=1){//遍历每一个单元的cmps数组
					if(cmp == _dtmgr.cache[i].cmps[k].cmp){
							_dtmgr.log4j.debug('所在位置:['+i+']'+'['+k+']');
							
							return _dtmgr.cache[i].cmps[k].xtype;
						}
				}
		}
	};
	this.getBindingStore=function(cmp){
		for(i=0,l=_dtmgr.cache.length;i<l;i+=1){//遍历cache数组
				_dtmgr.log4j.debug('i='+i);
				for(k=0,len=_dtmgr.cache[i].cmps.length;k<len;k+=1){//遍历每一个单元的cmps数组
					if(cmp == _dtmgr.cache[i].cmps[k].cmp){
							_dtmgr.log4j.debug('所在位置:['+i+']'+'['+k+']');
							return _dtmgr.cache[i].store;
						}
				}
		}
	};
	
	/**
		绑定store和组件，一个store可能绑定多个组件
	*/
	this.bindCmp = function(store,cmp,xtype){
		if(!store || !cmp){
			_dtmgr.log4j.error('store或cmp为空，store='+store+' , cmp='+cmp);
			return;
		}
		pos = _dtmgr.getBindingPosition(store);//得到位置
		if(!_dtmgr.cache[pos]){//如果store在数组中不存在
			_dtmgr.cache.push({store:store,cmps:[]});
		}
		_dtmgr.cache[pos].cmps.push({cmp:cmp,xtype:xtype});
	},
	
	/**
		刷新store和组件的方法，参数orignCmp可选
	*/
	this.fresh = function(store,orignCmp,newItemIndex){//orignCmp：发起人
		 
		if(!store){
			store = this.getBindingStore(orignCmp);
		  if(!store) return;
		};
		 
		if (newItemIndex != store.itemindex){
		 
		store.curRecord=store.getAt(newItemIndex);
		 
		store.itemindex=newItemIndex;
		store.fireEvent('onselectchange',store);
	        }
		pos = _dtmgr.getBindingPosition(store);//得到位置
    
    if(!_dtmgr.cache || !_dtmgr.cache[pos] ) return; 
    
		cmps = _dtmgr.cache[pos].cmps;
	
		for(var i=cmps.length-1;i>=0;i-=1){
			
		  var orignCmptype=_dtmgr.getBindcmpType(orignCmp);
		   
		  if ( orignCmptype== cmps[i].xtype) continue;
		  if ( orignCmptype== 'Field' && cmps[i].xtype=='Grid') continue;
		   // alert('发起者'+_dtmgr.getBindcmpType(orignCmp)+'受响者'+cmps[i].xtype);
			if(cmps[i].cmp!=orignCmp){//如果此组件不是源发起人
				
				_dtmgr.cmpFresh(cmps[i].cmp,store,cmps[i].xtype,orignCmp,orignCmptype);
			}
		}
	},
	this.SetRight=function(store,level){  ///设置数据集的权限 0:只读,1:disable,2:readonly 3:edit
		if(!store) return;
		var pos = _dtmgr.getBindingPosition(store);//得到位置
		var cmps = _dtmgr.cache[pos].cmps;
		 
		for(var i=cmps.length-1;i>=0;i-=1){ 
			 
		  if(cmps[i].xtype=='Field'){
		  	if(level==3){
		  		cmps[i].cmp.enable()
		  	}
		  	else {
		  		cmps[i].cmp.disable()
		  		}
		  };
	}
	},
	/**
		单个组件的刷新方法，
	*/
	this.cmpFresh = function(cmp,store,cmptype,orignCmp,orignCmptype){
		if(cmptype=='Field'){
			//if(this.isPropEmpty(store,'curRecord.data.'+cmp.name))
			if(store && store.curRecord && store.curRecord.data && (store.curRecord.data[cmp.name] || store.curRecord.data[cmp.name] == 0) && cmp && cmp.setValue)
				cmp.setValue(store.curRecord.get(cmp.name))
			else if(cmp.setValue)  
			   cmp.setValue('')
		}
		else if (cmptype=='Grid'){
			//cmp.startEditing(store.itemindex, 0);
			var sm = cmp.getSelectionModel();//get the seletion model
			if(this.isPropEmpty(store,'curRecord'))
				sm.selectRecords(store.curRecord);
		}
		else if (cmptype=='Form'){
			if(this.isPropEmpty(store,'curRecord'))
				cmp.form.loadRecord(store.curRecord);
		}
		else if (cmptype=='Tree'){
			if (orignCmp && orignCmptype=='Field' ){///节点名称更新
	 
				if (cmp.TitleName==orignCmp.name){///节点名称更新
					var sm = cmp.getSelectionModel();
          var updatenode = sm.getSelectedNode();
          if (updatenode) updatenode.setText(orignCmp.getValue());
		     }
		  }
		  else if (!orignCmp && store){
		  	var r = store.curRecord;
		  	if (!r) return;
		  	var pNode=cmp.getNodeById(r.get(cmp.pKeyName));
		  	if (!pNode) return;
		  	var cNode=cmp.getNodeById(r.get(cmp.KeyName));
		  	if (cNode) {cNode.select();return;}; ///子节点已经存在
		  	cNode=new Ext.tree.TreeNode({id:r.get(cmp.KeyName),text:r.get(cmp.TitleName),checked:true,allowDrag:true,allowDelete:true,allowEdit:true});
				cNode.ItemIndex=store.itemindex;	 
        pNode.appendChild(cNode);
        cNode.select();
		  } 
		}
		else if (cmptype=='TreeGrid'){
			if (orignCmp && orignCmptype=='Field' ){///节点名称更新
				if (cmp.TitleName==orignCmp.name){///节点名称更新
					var sm = cmp.getSelectionModel();
          var updatenode = sm.getSelectedNode();
          if (updatenode) updatenode.setText(orignCmp.getValue());
		     }
		    else{
		    	cmp.SetCurNodeField(orignCmp.name,orignCmp.getValue());
		   } 
		  }
		  else if (!orignCmp && store){
		  	var r = store.curRecord;
		  	if (!r) return;
		  	var pNode=cmp.getNodeById(r.get(cmp.pKeyName));
		  	if (!pNode) return;
		  	var cNode=cmp.getNodeById(r.get(cmp.KeyName));
		  	if (cNode) {cNode.select();return;}; ///子节点已经存在
		  	var fieldNames=cmp.FieldNames;
		  	var nodejson="id:'"+r.get(cmp.KeyName)+"',text:'"+r.get(cmp.TitleName)+"'";
			  for(var j=0;j<=fieldNames.length-1;j++){
				      nodejson+=",'"+fieldNames[j]+"':'"+r.get(fieldNames[j])+"'";
			    };
			     nodejson+=",leaf:false,allowChildren:false,uiProvider:Ext.tree.ColumnNodeUI";
			      
			     var obj=Ext.util.JSON.decode("{"+nodejson+"}");
						var cNode=new Ext.tree.TreeNode(obj);
 
						cNode.ItemIndex=store.itemindex;	 
						pNode.appendChild(cNode);
					   
        cNode.select();
		  } 
		}
		else if (cmptype=='Graph'){
	          
		} 
	},
	
	/**
		store特有的refresh方法
	*/
	this.storeRefresh = function(store){
		if(store)
			_dtmgr.fresh(store);
		else
			_dtmgr.log4j.error('传进来的store竟然为空');
	},
	

	/**
		在权限控制时用，增加一条规则，参数rule类似这样："if (store.get('NANE')=='sys')return true; else return false;"，它必须写的象函数内的语句，
		ruleObject则是按钮、输入框或表单以及更多其它的组件，在rule返回true时ruleObject内所有的组件(ruleObject格式象这样：{buttons:[btn1,btn2],textFields:[txf1,txf2]})
		全部为隐藏或灰色，具体由程序员定
		着重要说明的时AddRule只是将规则放入缓存，等待this.Effect被调用后统一执行
	*/
	this.AddRule = function(rule,ruleObject,args){
		r = {rule:rule,obj:ruleObject,args:args};	
		this.rule.push(r);	
	},
	
	/**
		private，跨浏览器eval操作，是一个全局eval，执行后的结果变量是全局的
	*/
	this.Eval = function(code){		var result;		if(!!(window.attachEvent && !window.opera)){
			//ie
			result = execScript(code);
		}else{
			//not ie
			result = window.eval(code);
		}
	},
	/**
		private，简单的将rule语句拼凑成一个fun，并且运行结果为result
	*/
	this.combineFun = function(rule){
		return "var result=function(){"+rule+"}()";
	}, 
	/**
		执行缓存中的所有规则，一般在AddRule之后调用
	*/
	this.Effect = function(){
		len = this.rule.length;
		for(i=1;i<=len;i+=1)
 
			 this.exeRule(i);
	},
	/**
		具体调用第几条规则
	*/
	this.exeRule = function(index){
	
		index-=1;
		len = this.rule.length;
		if(index<0 || index>=len){
			alert('第'+(index-(-1))+'条规则无效');
			return;
		};
		objAll = ['buttons','textFields'];
		buttons = ['',this.btn_hide,this.btn_disable,this.btn_show];
		textFields = ['',this.txf_hide,this.txf_disable,this.txf_show];
		for(l=0;l<objAll.length;l+=1){
			_objs = this.rule[index].obj[objAll[l]];
 
			if(!_objs)continue;
			_rule = this.rule[index].rule; 
			
			for(s in this.rule[index].args) {		
					t = (s+" = this.rule[index].args."+s);
					eval(t);			
			}
			
			this.Eval(this.combineFun(_rule)); 
			for(f=0,_objs_len=_objs.length;f<_objs_len;f+=1){ 
				_obj = _objs[f];//具体某个组件，比如：具体某个button
				operate_func = eval(objAll[l]+'['+result+']'); //得到了所需的操作，比如hide还是disable
				operate_func(_obj);
			}
		}
	},
	this.btn_hide = function(_btn){
		_btn.hide();
	},
	this.btn_disable = function(_btn){
		_btn.disable();
	},
	this.btn_show = function(_btn){
		_btn.enable();_btn.show();
	},
	this.txf_hide = function(_txf){
		_txf.hide();
		//_txf.setVisible(false);
	},
	this.txf_disable = function(_txf){
		_txf.disable();
	},
	this.txf_show = function(_txf){
		_txf.enable();_txf.show();
	},
	
	this.isPropEmpty = function(_m,_p){
		var ap = _p.split(".");
		for(i=0;i<ap.length;i+=1){
			var _t = _m;
			for(k=0;k<=i;k+=1){
				_t = _t[ap[k]];
			}
			if(!_t)
				return false;
		}
		return true;
	}
}
Asiainfo.RightMgr = function(){
  var modelcode= Asiainfo.GerUrlInfo(window.location,'Pathname');
  this.ds_right = new Asiainfo.data.AsiaInfoJsonStore({
	     sql:"select MODELCODE, PARANAME,CNNAME,TYPE,DEFAULT1,VAL,REMARK from METAMODELCFG where modelcode='"+modelcode+"' and (VAL is not null or REMARK is not null)",
	     initUrl:'/'+contextPath+'/newrecordService',
	     url:'/'+contextPath+'/newrecordService',
	     root:'root',
	     table:'METAMODELCFG',
	     loadDataWhenInit:true,
	     key:'MODELCODE,PARANAME'
      });
   
  this.rowRight=function(store){
     if(!store || !store.storeId ||  !store.curRecord ) return; 
     var dataRecord=store.curRecord;
    for(var i=0;i<this.ds_right.getCount();i++){
     var r=this.ds_right.getAt(i);
     if(! r.get('REMARK')) continue;
     var comp=Ext.getCmp(r.get('PARANAME'));
     if(!comp || !comp.disable) continue;
     
     var   rightrule=r.get('REMARK');
     if(rightrule.indexOf('{user')!=-1 || rightrule.indexOf('{group}')!=-1){
            rightrule=rightrule.replaceAll('{username}',_UserInfo.username);
            rightrule=rightrule.replaceAll('{usercnname}',_UserInfo.usercnname);
            rightrule=rightrule.replaceAll('{group}',_UserInfo.OwnGroup);
          }
      
     var rule=false;
     if(rightrule.indexOf('{')!=-1 && rightrule.indexOf('}')!=-1){
     	 for(var j=1;j<store.recordFields.length;j++) 
     	   rightrule=rightrule.replaceAll('{'+store.storeId+'.'+store.recordFields[j].name+'}',dataRecord.get(store.recordFields[j].name));
     };
     try{
          eval( rightrule+";");
     	  if(rule && comp.disable) comp.enable()
     	     else comp.disable();
     } catch(e){
	 	 alert(comp.text+','+ rightrule+',配置错误');
     }
   //alert(r.get('REMARK')+','+rightrule);
    }; 
  };
  this.initSet=function(){///初始化设置
     for(var i=0;i<this.ds_right.getCount();i++){
     	  var rightrule=false;
          var r=this.ds_right.getAt(i);
          if( r.get('VAL')){///结构化设置
           	//if(_UserInfo.username=='sys') rightrule=true
                if(r.get('VAL').indexOf(_UserInfo.usercnname)!=-1) rightrule= true 
           	else rightrule=false;
           	var comp=Ext.getCmp(r.get('PARANAME'));
                if(comp && comp.disable){
           	   if(rightrule) comp.enable()
           	   else comp.disable()
                };//结构化设置完成	
           };
           
           
          if(!r.get('REMARK'));
          rightrule=r.get('REMARK'); 
          for( var j=0;j<Ext.StoreMgr.getCount();j++){///注册store事件
            var store=Ext.StoreMgr.itemAt(j);
            
            if(!store.storeId) continue;
            //alert('store:'+Ext.StoreMgr.itemAt(i).storeId+','+Ext.StoreMgr.itemAt(i).sql);
            if(rightrule.indexOf('{'+store.storeId+'.')!=-1){
              this.rowRight(store);
              store.addListener('onselectchange',this.rowRight,this); 
             
            }
          } 
        }
   };	
  this.initSet();
}
Ext.util.log4j = function(clazz,debugLevel){

	this.level = debugLevel || 'info'; //error debug warn info只有这四种级别,分别对应0 1 2 3
	this.clazz = clazz || '';
	this._history = [];
	
	_log4j = this;
	
	this.levelArray = {error:0,warn:1,debug:2,info:3};
	
	this.reset = function(clazz,debugLevel){
		if(clazz)
			_log4j.clazz = clazz;
		if(debugLevel)
			_log4j.debugLevel = debugLevel;
	},
	
	this.info = function(msg){
		_log4j._common('info',msg);
	},
	
	this.warn = function(msg){
		_log4j._common('warn',msg);
	},
	
	this.debug = function(msg){
		_log4j._common('debug',msg);
	},
	
	this.error = function(msg){
		_log4j._common('error',msg);
	},
	
	this.privilegeReady = function(level){
		if( _log4j.levelArray[level] <= _log4j.levelArray[_log4j.level] )//当前级别低于传进来的级别
			return true;
		else
			return false;
		//return ( _log4j.levelArray[level] <= _log4j.levelArray[_log4j.level] );
	},
	
	this._common = function(level,msg){
		if(_log4j.privilegeReady(level)){//如果够级别,可以输出
			str = '['+_log4j.clazz+']:'+msg;
			_log4j._history.push(str);
			alert(str);
		}
	},
	
	this.clearCache = function(){
		_log4j._history.length = 0;
	},
	
	this.showHistroy=function(){
		alert(_log4j._history.join('\n'));
	}
}
