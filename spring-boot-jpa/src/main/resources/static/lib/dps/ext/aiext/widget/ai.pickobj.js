Ext.namespace("Asiainfo.widget.PickObj");
///tree: keyfield,valfield,leafflagfield,
 Asiainfo.widget.PickObj  = Ext.extend(Ext.Window, {
  	findGrid : null,///查找内容对象
  	selGrid  : null,////选中的对象
  	findStore:null,
  	selStore:null,
  	subtype:'grid',///界面选择的子类型，grid,tree,grouptree,gridtree
  	selsql:"",//查找的原始sql
    keyfield:"",///关键字段
    pkeyfield:"",
    leafflagfield:"",///叶子字段标识
    valfield:"",///名称字段
    bindCmp:null,///绑定的返回，选择后会自动更新他
    callbak:null,///点确定后的回调函数
    dataSource:null,
 initComponent : function()
	{    
  	 	this.findStore = new Asiainfo.data.AsiaInfoJsonStore({
	            sql:this.selsql,
	            initUrl:'/'+contextPath+'/newrecordService',
	            url:'/'+contextPath+'/newrecordService',
	            root:'root',
	            pageSize:20,
	            dataSource:this.dataSource,
	            loadDataWhenInit:true,
	            key:'QRYCODE'
             });
	    this.selStore = new Asiainfo.data.AsiaInfoJsonStore({
	            //sql:"select * from ("+this.selsql+" ) a where 1=2",
	    		sql:this.pickedsql||"select * from ("+this.selsql+" ) a where 1=2",
	            initUrl:'/'+contextPath+'/newrecordService',
	            url:'/'+contextPath+'/newrecordService',
	            root:'root',
	            pageSize:-1,
	            dataSource:this.dataSource,
	            loadDataWhenInit:true,
	            key:'QRYCODE'
             });
	    this.initButtons();
	    
	    this.initselGrid();
	    
	    var title = this.title||'查询列表'  ;  
	  
	    Ext.apply(this, {
	        title     : title,
	        closeAction:'close', 
          modal: true, 
            
	        layout    : 'fit',    
	        //cardCount : this.cards.length,
		    /* buttons   : [
		        this.previousButton,
			    this.nextButton,
			    this.cancelButton
		    ], */
		    items:[ this.formPanel],
		    buttons:[{ text: "确定",  handler: this.OKClick,    scope: this }, 
                { text: "退出",  handler: this.CancelClick,  scope: this   }
        ] 
	    });
      Asiainfo.widget.PickObj.superclass.initComponent.call(this)
	},
 getSelValue:function(){
    var result={};
    for(var i=0;i<this.selStore.getCount();i++){
    	var r=this.selStore.getAt(i);
    	if(result.keyvalue) result.keyvalue+=","+r.get(this.keyfield)
    	else result.keyvalue=r.get(this.keyfield);
    	if(result.rawvalue) result.rawvalue+=","+r.get(this.valfield)
    	else result.rawvalue=r.get(this.valfield);
    };
    return result;
 },
  OKClick : function(){
  	if(this.bindCmp){
  		
  		var result=this.getSelValue();
  		//console.log(result);
  		this.bindCmp.setValue(result.keyvalue);
/*  		this.bindCmp.keyvalue=result.keyvalue;
  		this.bindCmp.rawvalue=result.rawvalue;
  		if(this.bindCmp.ds   && this.bindCmp.ds.curRecord && this.bindCmp.name){
  			this.bindCmp.ds.curRecord.set(this.bindCmp.name,result.rawvalue);
        this.bindCmp.ds.curRecord.dirty=true;
  		}
  		this.bindCmp.fireEvent('change',result.rawvalue,this.bindCmp.getValue());*/
  		//alert(this.bindCmp.keyvalue+";"+this.bindCmp.getValue());
  	} 
  	if(this.callbak) this.callbak(this.selStore);
  	this.destroy();
  },
  CancelClick : function(){
  	this.destroy();
  },
  initselGrid : function()  {
  	var _columns=[],_groupfield=[];
  	var subtype=this.subtype;
  	
  	this.findStore.columnModel.setColumnWidth(0,200);
  	this.findStore.columnModel.setColumnWidth(1,400);
    for(var i=0;i<this.findStore.columnModel.config.length;i++){
    			//this.findStore.columnModel.
	        _columns.push(this.findStore.columnModel.config[i]);
	        
	 //       alert(this.findStore.columnModel.config[i].value);
	        if(!this.keyfield && i==0) this.keyfield =_columns[i].dataIndex;
	        if(!this.valfield && i==1) this.valfield =  _columns[i].dataIndex;
	        if(!this.pkeyfield && i==2) this.pkeyfield = _columns[i].dataIndex;
	        if(!this.leafflagfield && i==3) this.leafflagfield = _columns[i].dataIndex;
	        _groupfield.push(_columns[i].dataIndex);
     };
     
     if(!this.groupfield && subtype=='grouptree') this.groupfield=_groupfield;
     
     if(!this.valfield) this.valfield = this.keyfield;
     if(subtype=='tree' && !this.pkeyfield) 
       alert('必须配置pkeyfield字段') 
     else if(subtype=='gridtree' && !this.pkeyfield) 
       alert('必须配置pkeyfield字段') 
     else if(subtype=='grouptree' && !this.groupfield) 
       alert('必须配置groupfield字段');
      
     if(subtype=='grid') this.initGridControl(_columns)
     else if(subtype=='tree')this.initTreeControl()
     else if(subtype=='grouptree')this.initGroupTreeControl()
     	
	   this.selGrid = new Asiainfo.widget.Grid({
				store:this.selStore,
				showcheck:'y',
				region:'east',
				bodyBorder:false,border:false,
				//split:true,
				//height:this.height-140,
	      width:250,
				subtype:'grid',
				stripeRows:true,
				columns:[{ header: this.keyfield, dataIndex:this.keyfield, width:200 },
				         {header: this.valfield, dataIndex: this.valfield, width:250 }
				        ],
				layout:'fit'
		}).control; 
	 var northPanel= new Ext.form.FormPanel({region:'north',height:25,items: [this.keyWord]});
	 var leftPanel = new Ext.Panel({region:'center',layout:'border',items:[this.findGrid,this.movetoolGrid],bodyBorder:false,border:false});
	 var mainPanel = new Ext.Panel({layout:'border',region:'center',items:[leftPanel,this.selGrid],bodyBorder:false,border:false});
   this.formPanel= new Ext.Panel({layout:'border',items:[northPanel,mainPanel],bodyBorder:false,border:false});
     
  },
  initGridControl : function(_columns){
  	  this.findGrid = new Asiainfo.widget.Grid({
				store:this.findStore,
				bodyBorder:false,border:false,
				showcheck:'y',
				region:'center',
				subtype:'grid',
				stripeRows:true,
				autoScroll : true,
				columns:_columns,
				columnLines:true,
				viewConfig : {  forceFit : true }
		}).control;
  },
  initTreeControl : function(cfg){
  	this.baseUrl="/"+contextPath+"/newrecordService?command=init&initSql=";
  	var rootNode=  new Ext.tree.TreeNode({id:'root',text:'root'});
  	
  	var myloader = new Ext.tree.TreeLoader({keyfield:this.keyfield,pkeyfield:this.pkeyfield,titlefield:this.valfield,leafflagfield:this.leafflagfield,selsql:this.selsql,baseUrl:this.baseUrl,dataUrl:this.baseUrl+this.selsql.replace('{PARENT}',rootNode.id)});
    myloader.on("beforeload", function(treeLoader, pnode) { 
    	
       myloader.dataUrl=this.baseUrl+"select * from ("+this.selsql+" ) a where "+this.pkeyfield+" in('"+pnode.id+"')"
       
    }) ; 
  	myloader.on("load",function(tree, pnode, response ){
        var strID="";
        var result = eval('('+response.responseText+')');
        if(!this.leafflagfield){
    		  for(var i=0;i<result.root.length;i++){
            if(strID) strID+=",'"+result.root[i][this.keyfield]+"'"
    		 	  else strID ="'"+result.root[i][this.keyfield]+"'"
          };
    	    var tmpStore=Asiainfo.getStore('select distinct  '+this.pkeyfield+ ' from ('+this.selsql+' ) a where '+this.pkeyfield+' in('+strID+')');
    	    for(var i=0;i<tmpStore.getCount();i++)
    	      strID+=','+tmpStore.getAt(i).get(this.pkeyfield);
    	  }
    	  
    	  for(var i=0;i<result.root.length;i++){
    	  	var isLeaf=false;
    	  	if(strID){
    		  	if(strID.indexOf(result.root[i][this.keyfield])==-1) isLeaf=true
    		  	else  isLeaf=false;
    		  }
    		  else if(this.leafflagfield){
    		  	if(result.root[i][this.leafflagfield]=='y') 
    		  	  isLeaf=true
    		  	else isLeaf=false
    		  };
    		 	 var tmpNode=  new Ext.tree.AsyncTreeNode({checked:false,id:result.root[i][this.keyfield],text:result.root[i][this.titlefield],leaf:isLeaf});
    		 	 pnode.appendChild(tmpNode);
    	   }
    }); 
    
    var _sql="select * from ("+this.selsql+" ) a where  "+this.pkeyfield+" ='0'";
				var tmpStore=Asiainfo.getStore(_sql);
				 
				for(var i=0;i<tmpStore.getCount();i++){
				var r=tmpStore.getAt(i);
				var rootNode1=  new Ext.tree.AsyncTreeNode({checked:false,id:r.get(this.keyfield),text:r.get(this.valfield)});
	      rootNode.appendChild(rootNode1);
	   }
   this.findGrid=new Ext.tree.TreePanel({region:'center',bodyStyle:'background-color:white',
   	loader:myloader,width:420,root:rootNode,rootVisible:false,autoScroll:true,bodyBorder:false,border:false}); 
  },
  initGroupTreeControl : function(cfg){
  	var idFields=[],nameFields=[],dataTypes=[];
  	this.baseUrl="/"+contextPath+"/newrecordService?command=init&initSql=";
  	var rootNode=  new Ext.tree.TreeNode({id:'root',text:'root'});
  	
  	var i=this.findStore.columnModel.config.length;
  	while(i>0){
  		i--;
  		nameFields.push(this.findStore.columnModel.config[i].dataIndex);
  		i--;
  		idFields.push(this.findStore.columnModel.config[i].dataIndex);
  		dataTypes.push(this.findStore.columnModel.config[i].type);
  	};
  	 
  	var myloader = new Ext.tree.TreeLoader({scope:this,keyfield:this.keyfield,pkeyfield:this.pkeyfield,titlefield:this.valfield,selsql:this.selsql,baseUrl:this.baseUrl,dataUrl:this.baseUrl+this.selsql.replace('{PARENT}',rootNode.id)});
    myloader.on("beforeload", function(treeLoader, pnode) {
    	 var where ="1=1 ";
    	 var level=pnode.attributes["level"];
    	 var tmpNode=pnode;
    	 while(tmpNode!=null){
    	 	if(pnode.attributes["idfield"]&&tmpNode.id!="root"){
    	 		if(pnode.attributes["datatype"]=='string')
    	  	  where+=" and "+ tmpNode.attributes["idfield"]+" = '"+tmpNode.attributes['value']+"'"
    	  	else 
    	  		where+=" and "+tmpNode.attributes["idfield"]+" = "+tmpNode.attributes['value']+""
    	   }
    	 tmpNode=tmpNode.parentNode;
      };
      
    	 var _sql="select "+idFields[level+1]+",max("+nameFields[level+1]+") as "+nameFields[level+1]+" from ("+this.selsql+" ) a where "+where+" group by "+idFields[level+1];
    	 myloader.dataUrl=this.baseUrl+_sql;
    }) ; 
  	myloader.on("load",function(tree, pnode, response ){
  		   var isLeaf=false;
  		   var level=pnode.attributes["level"];
  		   if(level==idFields.length-2) isLeaf=true;
  		    
        var result = eval('('+response.responseText+')');
    		
    	  for(var i=0;i<result.root.length;i++){
    		 	 var tmpNode=  new Ext.tree.AsyncTreeNode({checked:false, text:result.root[i][nameFields[level+1]],leaf:isLeaf});
    		 	 tmpNode.attributes["value"]=result.root[i][idFields[level+1]];
    		 	 tmpNode.attributes["level"]=level+1;
	         tmpNode.attributes["idfield"]=idFields[level+1];
	         tmpNode.attributes["datatype"]=dataTypes[level+1];
	         tmpNode.attributes["nameField"]=nameFields[level+1];
    		 	 pnode.appendChild(tmpNode);
    	   }
    }); 
    var _sql="select distinct "+idFields[0]+","+nameFields[0]+" from ("+this.selsql+" ) a ";
		var tmpStore=Asiainfo.getStore(_sql);
				 
				for(var i=0;i<tmpStore.getCount();i++){
				var r=tmpStore.getAt(i);
				var rootNode1=  new Ext.tree.AsyncTreeNode({checked:false,text:r.get(nameFields[0])});
				rootNode1.attributes["value"]=r.get(idFields[0]);
	      rootNode1.attributes["level"]=0;
	      rootNode1.attributes["idfield"]=idFields[0];
	      rootNode1.attributes["datatype"]=dataTypes[0];
	      rootNode1.attributes["nameField"]=nameFields[0];
	      rootNode.appendChild(rootNode1);
	   }
   this.findGrid=new Ext.tree.TreePanel({region:'center',bodyStyle:'background-color:white',
   	loader:myloader,width:420,root:rootNode,rootVisible:false,autoScroll:true,bodyBorder:false,border:false}); 
  },
  startSearch : function(){
			// what the /\s/ mean (in regex) is the any of white invisible character
			v = this.keyWord.getValue().replace(/(^\s*)|(\s*$)/g,'').toUpperCase();//remove all white space(just support english space) and to upper case
			var newSql='select * from ('+this.selsql+') a ';
			
			//newSql = newSql+" where UCASE("+this.keyfield+") LIKE '%"+v+"%' or UCASE("+this.valfield+") LIKE '%"+v+"%' order by "+this.keyfield;
			newSql = newSql+" where "+ucase(this.keyfield)+" LIKE '%"+v+"%' or "+ucase(this.valfield)+" LIKE '%"+v+"%'";
			this.findStore.updateSql(newSql);
	    this.findStore.select();
  },
  initButtons	: function() {
	  this.keyWord = new Ext.form.TriggerField({
			fieldLabel:'搜索关键字',
			triggerClass: 'x-form-search-trigger',
			name:'keyWord',
			id:'keyWord',
	    width:200,
	    scope:this,
	    onTriggerClick:function(){
	    	 
	    	this.scope.startSearch();	 
	    },
			listeners:{
				specialkey:function(f,ent){
					if(ent.getKey() == ent.ENTER){
						this.scope.startSearch();
					}
				}
			}
		});
		/********************Start************************/
	 this.leftBtn = new Ext.Button({
			text:'<-',
			minWidth :5,
			scope:this,
		    handler:function(button,event){
		    	var rs = this.selGrid.getSelectionModel().getSelections();
		    	for(i=0,l=rs.length;i<l;++i){
		    		this.selStore.remove(rs[i]);
		    	}
		    }
		});
		
	 this.rightBtn = new Ext.Button({
			text:'->',
			minWidth :5,
			scope:this,
			handler:function(button,event){
				if(this.subtype!='grid'){
					this.selStore.removeAll();
					var checkNodes = this.findGrid.getChecked();
					for(var i=0;i<checkNodes.length;i++){
						var r=this.selStore.getNewRecord();
						var val = checkNodes[i].attributes['value']||checkNodes[i].id;
						r.set(this.keyfield,val);
						r.set(this.valfield,checkNodes[i].text);
						r.set(this.pkeyfield,checkNodes[i].parentNode?checkNodes[i].parentNode.id : "");
						this.selStore.add(r);
					};
				}
				else if(this.subtype=='grid'){
          var rs = this.findGrid.getSelectionModel().getSelections();
				  for(i=0,l=rs.length;i<l;++i){
					if(this.selStore.find(this.keyfield,rs[i].get(this.keyfield))==-1  ){
						this.selStore.add(rs[i]);
					} 
				 }
		    }
		  }
		});
		

		this.confirmBtn = new Ext.Button({
			text:'确定',
			id:'_searwin_ok',
			minWidth:40,
			disabled :true,
			handler:function(){
				v = _keyWord.getValue();
				_this.sm2.selectAll();
				rs = _this.sm2.getSelections();
				
				if(!rs || rs.length==0){
					Ext.Msg.alert('ERROR!!!','必须选择一条记录！');
					return;
				}
				if(!_this._focus)
					alert("this._focus竟然为空");
				else if(_this._focus.onConfirmBtnCallBack){
					_this._focus.onConfirmBtnCallBack(_this._focus,rs,_this.keyWord);
				}
				else if(_this._focus.setValue){
                                      var selval=rs[0].get('VALUES1');
				      for(var i=1;i<rs.length;i++)   selval+=","+rs[i].get('VALUES1');
				      fieldChang(_this._focus,selval,'');
				      _this._focus.setValue(selval);
				}
				_this.win.hide();
			}
		});
		
	  this.movetoolGrid = new Ext.Panel({
	  	region:'east',
	  	width:50,
	  	frame:true,
	  	bodyBorder:false,border:false, 
		    layout:'table',
		    defaults: {
		        bodyStyle:'padding:1px'
		        //bodyStyle:'margin: 5px 3px 5px 0'
		    },
		    layoutConfig: {
		        columns: 1
		    },
		    items: [/*{
		    	colspan: 1
		    },*/{
		    	colspan: 2
		    },{
		        colspan: 3,
		        items:[this.leftBtn]
		    },{
		        colspan: 4
		    },{
		        colspan: 5,
		        items:[this.rightBtn]
		    }]
		});  
	}
 })