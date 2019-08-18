Ext.namespace("Asiainfo.widget.TreeGrid");
Asiainfo.widget.TreeGrid =function (config) {
	baseFun.loadScript('../sysmgr/asiainfo/widget/ai.treegridex/css/TreeGrid.css','css');
	baseFun.loadScript('../sysmgr/asiainfo/widget/ai.treegridex/css/TreeGridLevels.css','css');
        baseFun.loadScript('../sysmgr/asiainfo/widget/ai.treegridex/TreeGrid.js'); 
	this.cfg = config || {};
	if (config.cfgcode)
		this.loadcfg(config.cfgcode);
	if (this.cfg) this.create();
	return this;
};
Asiainfo.widget.TreeGrid.prototype = {
   loadcfg : function(COMCODE) {
		var obj_cfg = _main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));
		if (!obj_cfg) {
			alert('分组报表没有正确配置:');
			return null
		};
		this.cfg.initStore = _main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));
		this.cfg = {
			region : this.layrec.get('ALIGN'),
			rootVisible : false,
			autoScroll : true,
			expandable : false,
			enableDD : true,
			id : obj_cfg.get("OBJCODE"),
			split : obj_cfg.get("DEFAULT") == 'Y' ? true : false,
			title : obj_cfg.get("OBJNAME"),
			root : new Ext.tree.AsyncTreeNode({
						allowChildren : true
					}),
			width : parseInt(this.layrec.get('WIDTH')),
			height : parseInt(this.layrec.get('HEIGHT'))
		};
		this.cfg.fieldname = obj_cfg.get("REMARK");
		this.cfg.fieldwidths = obj_cfg.get("LISTVALUE").split(',');
		this.cfg.keyname = obj_cfg.get("CNNAME");
		this.cfg.pkeyname = obj_cfg.get("PARENTCODE");
		this.cfg.titlename = obj_cfg.get("AWHERE").split(',');
		this.cfg.subtype = this.cfg.subtype;
	},
   create : function() {
	var fields=this.cfg.store.recordFields;
	fields.push({name: 'IS_LEAF', type: 'bool'});
	this.record = Ext.data.Record.create(fields);
         var data = [];
      this.store = new Ext.ux.maximgb.treegrid.AdjacencyListStore({
      storeId:this.cfg.store.storeId.replace("_tree",""),
　　   autoLoad : true    
　　  ,reader: new Ext.data.JsonReader({root:'root',  id: this.cfg.keyname}, this.record)
     ,proxy: new Ext.data.MemoryProxy(data)
     ,leaf_field_name: "IS_LEAF"
    // ,root : 'ROOT'
    ,parent_id_field_name: this.cfg.pkeyname
    ,loadDataWhenInit : false
    ,table : this.cfg.store.table
    ,key : this.cfg.store.key
    ,sql : this.cfg.store.sql
    ,initUrl : this.cfg.store.initUrl
    ,url : this.cfg.store.url
    ,root : this.cfg.store.root
    ,defaultValue : this.cfg.store.defaultValue
    });
    
    this.AddChild();
    this.store.cache.save.length = 0;
    this.store.cache.remove.length = 0;
    this.store.cache.update.length = 0;
    this.store.commitChanges();
    this.cfg.store.destroy();
    Ext.StoreMgr.removeKey(this.cfg.store.storeId );
    //alert(Ext.StoreMgr.get(this.cfg.store.storeId));
    Ext.StoreMgr.add(this.store.storeId,this.store);
   // alert(Ext.StoreMgr.get(this.cfg.store.storeId)); 
     var sm_gd = new Ext.grid.RowSelectionModel({listeners: {rowselect: function(sm, row, rec) {
     	if(typeof(dataManager)=='undefined' || typeof(dataManager)==null ) return;
     	dataManager.fresh(null,this.control,row);
        //  alert(Ext.StoreMgr.get("ds_2").get('ZBNAME'));
     	 //alert(Ext.encode( Ext.StoreMgr.get("ds_2").curRecord.data));
     }}});
    
     
     this.buildRender();
     this.cfg.root_title= this.cfg.columns[0].header;
      this.cfg.sm=sm_gd;
     this.cfg.master_column_id=this.cfg.columns[0].dataIndex;
     this.cfg.viewConfig= { enableRowBody : true };
     if(this.cfg.expandFieldText){
        baseFun.loadScript('../asiainfo/grid/RowExpander.js');
	var expander = new Ext.grid.RowExpander({ tpl : new Ext.Template(this.cfg.expandFieldText)})
        this.cfg.columns.splice(0,0,expander);
        this.cfg.plugins=expander;
        this.cfg.autoExpandColumn= 'ZBNAME';
     };
     this.cfg.store=this.store;
     this.cfg.clicksToEdit=1;
     this.control= new Ext.ux.maximgb.treegrid.GridPanel(this.cfg);
     this.control.on("cellclick",function(grid, rowIndex, columnIndex, e){
        if(typeof(dataManager)=='undefined' || typeof(dataManager)==null ) return;
         
     	dataManager.fresh(null,this,rowIndex);
     	 
     });
    if(this.cfg.dblclickfun){
    	 
  	 this.control.dblclickpara=this.cfg.dblclickpara;
  	 this.control.dblclickfun=this.cfg.dblclickfun;
         this.control.on("dblclick",this.dblClick);
    };
    if(dataManager) dataManager.bindCmp(this.store,this.control,'Grid');
    var r=this.store.getAt(10);
    var myNewRecord = new this.record(r.data,r.get("ZBCODE"));
    this.store.add(myNewRecord);
    this.store.commit();
   },
   SortData :function (pRecord){
  	if(!pRecord){
  	   for(var i=0,cnt= this.store.getCount();i<cnt;i+=1){
  	       var r=this.store.getAt(i);
  	       if(r.get(this.cfg.pkeyname))continue;
                r.set('IS_LEAF',true);
                 
                this.seq++;
               
                r.set('SEQ',this.seq);
                this.SortData(r); 
           }
  	}
  	else{
  	  
  	   for(var i=0,cnt= this.store.getCount();i<cnt;i+=1){
  	       var r=this.store.getAt(i);
  	       if(r.get(this.cfg.pkeyname)!=pRecord.get(this.cfg.keyname)) continue;
  	       pRecord.set('IS_LEAF',false);
                r.set('IS_LEAF',true);
                this.seq++;
                r.set('SEQ',this.seq);
                this.SortData(r); 
           }
  	};
  
  },
  AddChild :function (pRecord){
  	if(!pRecord){
  	   for(var i=0,cnt= this.cfg.store.getCount();i<cnt;i+=1){
  	       var r=this.cfg.store.getAt(i);
  	       if(r.get(this.cfg.pkeyname))continue;
                var myNewRecord = new this.record(r.data,r.get(this.cfg.keyname)); // 实际的一条记录
                myNewRecord.set('IS_LEAF',true);
                this.store.add(myNewRecord);
                this.AddChild(myNewRecord); 
           }
  	}
  	else{
  	  
  	   for(var i=0,cnt= this.cfg.store.getCount();i<cnt;i+=1){
  	       var r=this.cfg.store.getAt(i);
  	       if(r.get(this.cfg.pkeyname)!=pRecord.get(this.cfg.keyname)) continue;
  	       pRecord.set('IS_LEAF',false);
  	       var rdata={};
  	         for  ( var  field  in  r.data) {
  	           rdata[field]=r.data[field]; 
  	         };  
  	        var myNewRecord = new this.record(r.data,r.get(this.cfg.keyname)); // 实际的一条记录
                myNewRecord.set('IS_LEAF',true);
                this.store.add(myNewRecord);
                this.AddChild(myNewRecord);
           }
  	};
  
  },
  dblClick:function(){
    
    Asiainfo.widget.actfun(this.dblclickfun,this.dblclickpara)	
  },
  buildRender:function (){
    for(var i=0;i<this.cfg.columns.length;i++){
    	this.cfg.columns[i].id=this.cfg.columns[i].dataIndex;
	if(this.cfg.columns[i].renderfun){///render fun str to funtion
		var fun=this.cfg.columns[i].renderfun;		
		try{
			var obj=Ext.decode(this.cfg.columns[i].renderfun);			
			fun=obj.render;			
		}
		catch(e){	
		};		
		var funstr="this.cfg.columns[i].renderer=function my_renderer(v,  metadata, record, rowIndex, colIndex, store){"+fun+"}";		
		try{
			eval(funstr);				
		}
		catch(e){
			alert('字段转换函数错误:'+funstr)
		}
	};	
	for(var j=0;j<this.store.recordFields.length;j++){/// set column editer
		if(this.cfg.columns[i].dataIndex==this.store.recordFields[j].name&&this.store.recordFields[j].type=='date'){			
			this.cfg.columns[i].renderer=Ext.util.Format.dateRenderer('Y-m-d');			
			if(this.cfg.candEdit==true)this.cfg.columns[i].editor=new Ext.form.DateField({ format:'Y-m-d' })
		}
		else if(this.cfg.columns[i].dataIndex==this.store.recordFields[j].name&& this.cfg.candEdit && !this.cfg.columns[i].editor ){
		   this.cfg.columns[i].editor=this.getcolEditor(this.cfg.columns[i]);//new Ext.form.TextField();
	        }
	};
	
    }
  },
  getcolEditor:function(c){
    var fd=null;
    if(c.editcfg){fd=Asiainfo.widget.getField(c.editcfg);return fd};
    if(!this.cfg.editers) return fd;
    for(var i=0;i<this.cfg.editers.length;i++){
    	if(this.cfg.editers[i].dataIndex==c.dataIndex){
    	  fd=Asiainfo.widget.getField(this.cfg.editers[i]);return fd
    	} 
    };
    return fd;	
  },
   RefreshView : function() {
	}
};

 