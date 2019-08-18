Ext.namespace("Asiainfo.widget.Form");
 
Asiainfo.widget.Form=function (config){
	this.cfg=config||{};	
	if(config.cfgcode)
	this.loadcfg(config.cfgcode);
	if(this.cfg.store) this.store=this.cfg.store;	
	if(this.cfg)this.create();	
	return this;	
};
Asiainfo.widget.Form.prototype={
	loadcfg:function (COMCODE){
		var obj_cfg=_main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));		
		if(!obj_cfg){
			alert('分组报表没有正确配置:');			
			return null
		};		
		this.cfg.store=_main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));		
		this.cfg={
			region:this.layrec.get('ALIGN'),
			rootVisible:false,
			autoScroll:true,
			expandable:false,
			enableDD:true,
			id:obj_cfg.get("OBJCODE"),
			split:obj_cfg.get("DEFAULT")=='Y'?true:false,
			title:obj_cfg.get("OBJNAME"),
			root:new Ext.tree.AsyncTreeNode({
				allowChildren:true
			}),
			width:parseInt(this.layrec.get('WIDTH')),
			height:parseInt(this.layrec.get('HEIGHT'))
			
		};		
		this.cfg.fieldname=obj_cfg.get("REMARK");		
		this.cfg.fieldwidths=obj_cfg.get("LISTVALUE").split(',');		
		this.cfg.keyname=obj_cfg.get("CNNAME");		
		this.cfg.pkeyname=obj_cfg.get("PARENTCODE");		
		this.cfg.titlename=obj_cfg.get("AWHERE").split(',');		
		this.cfg.subtype=this.cfg.subtype;		
		
	},
	create:function (){
	  if(this.cfg.subtype=='exttabform') this.createTableForm();	
	  //if(this.cfg.workflowcode) this.bindWorkFlow(this.cfg.workflowcode);	
	},	
	createHtmlForm:function (){
		var obj_cfg=_main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));		
		if(!obj_cfg||!obj_cfg.get('XML')){
			alert('表单配置错误');
			return 
		};
		
		this.cfgsql=obj_cfg.get("VAL");
		
		if(!obj_cfg||!obj_cfg.get('CFG')){
			alert('表格配置错误');
			return 
		};		
		var str=obj_cfg.get('CFG').substr(4);		
		config=Ext.decode(str);		
		if(obj_cfg.get('PARANAME'))
		this.store=_main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));		
		if(this.store){
			
			if(this.store.getCount()==0)(this.store.AddNewRec());			
			var rec=this.store.getAt(0);
			///当前记录
			
		}
		//  if(obj_cfg.get('AWHERE')) baseFun.loadScript('../asiainfo/form/workflow.js'); //是否需要加载工作流控制
		
		var html=obj_cfg.get('XML');		
		html=html.replace('border=1 ','border=0 ');		
		html=html.replace('BORDER-BOTTOM: 1px solid;','');		
		html=html.replace('lightgrey','white');		
		for(var i=0;i<config.fields.length;i++){
			if(config.fields[i].xtype!='标签'&&config.fields[i].fieldname)
			html=html.replace(new RegExp('{'+config.fields[i].fieldname+'}',"gm"),"<div id='div_"+this.COMCODE+'_'+config.fields[i].fieldname+"' />");			
		};		
		if(this.store){
			
			for(var i=0;i<this.store.recordFields.length;i++){
				
				html=html.replace(new RegExp('{'+this.store.recordFields[i].name+'}',"gm"),rec.get(this.store.recordFields[i].name)?rec.get(this.store.recordFields[i].name):'--');
				
				
			};			
			
		};		
		var botomBar;		
		if(config.bbar){
			
			var bbarbtns=[];			
			for(var i=0;i<config.bbar.length;i++){
				
				var btn=new Ext.Button({
					scope:this,text:config.bbar[i].text,cls:'x-btn-text-icon',icon:config.bbar[i].icon
				});
				
				bbarbtns.push(btn);				
				var funstr="btn.handler=function(button,event){"+config.bbar[i].clickfun+"}";				
				try{
					
					eval(funstr);
					
					
				}
				catch(e){
					
					alert('按钮函数有错误:'+funstr)
					
				}
				html=html.replace(new RegExp(config.bbar[i].text,"gm"),"");				
				
			}
			var botomBar=new Ext.Toolbar({
				items:bbarbtns
			});			
			
		};		
		var d=document.createElement("DIV");
		
		
		d.id='tabform'+this.COMCODE;		
		d.innerHTML=html;		
		document.body.appendChild(d);		
		var form_result=new Ext.Panel({
			id:this.layrec.get('OBJNAME'),region:this.layrec.get('ALIGN'),title:obj_cfg.get("OBJNAME"),
			border:false,
			width:parseInt(this.layrec.get('WIDTH')),height:parseInt(this.layrec.get('HEIGHT')),split:obj_cfg.get("DEFAULT")=='Y'?true:false,
			contentEl:'tabform'+this.COMCODE,bbar:botomBar?botomBar:null
			
			
		});		
		
	},
	createTableForm:function (){
	   this.cfg.items=[];
	   for(var i=0;i<this.cfg.fields.length;i++){
       	     this.cfg.items.push(this.GetRowLay(this.cfg.fields[i]));
           };
           this.cfg.fields=null;
           
	   this.control=new Ext.FormPanel(this.cfg);
	   this.control.width=this.cfg.width;
	   this.control.height=this.cfg.height;
	   	
	},
	GetRowLay :function(c){
	   var cfg;
	    
           if(c.length==1 ){
             
             var fd=Asiainfo.widget.getField(c[0],this.store);
            
             cfg=Asiainfo.widget.getField(c[0],this.store)
           }
           else {
            cfg={layout:'column', border:false,items:[]}
            for(var i=0;i<c.length;i++){
             
      	      var col={ columnWidth:c[i].w, layout: 'form', border:true, items: [Asiainfo.widget.getField(c[i],this.store)] };
      	      cfg.items.push(col);
            }
           }
           return cfg;
	},
 
	bindWorkFlow:function (){
	  baseFun.loadScript('../asiainfo/form/workflow.js');
	  var tbbar=this.cfg.bbar;
	  if(!tbbar) tbbar=this.cfg.tbar;
	  if(!tbbar) return;
	  var wkdriver = new flowdriver(this.store.getAt(0).get('MODELFLOWCODE'),this.store,null,tbbar);
          wkdriver.SetStateInfo(this.store.getAt(0).get('MODELFLOWCODE'),this.store.getAt(0).get('REQCODE'),this.store.getAt(0).get('STATE'),tbbar);	 	
		
	},
	
	save:function (){
			 
		if(!this.store)return ;		
		this.store.commit();		
		
	},
	RefreshView:function (){
		
		
		if(this.store&&this.store.itemindex){
			
			dataManager.fresh(this.store,null,this.store.itemindex);			
			
		};		
		if(this.wkdriver)this.wkdriver.SetStateInfo();		
		
	}
	
};
