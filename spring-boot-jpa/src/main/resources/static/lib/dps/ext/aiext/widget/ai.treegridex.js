Ext.namespace("Asiainfo.widget.TreeGrid");
Asiainfo.widget.TreeGrid =function (config) {
	baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/widget/ai.treegridex/css/TreeGrid.css','css');
	//baseFun.loadScript('../sysmgr/asiainfo/widget/ai.treegridex/css/TreeGridLevels.css','css');
    baseFun.loadScript('/'+contextPath+'/dacp-lib/ext/aiext/widget/ai.treegridex/TreeGrid.js'); 
	this.cfg = config || {};
	if (config.cfgcode)
		this.loadcfg(config.cfgcode);
	if (this.cfg) this.create();
	return this;
};
function ExtendStoreToTreeStroe(store){
   store.addEvents(
			'beforeexpandnode',
			'expandnode',
			'expandnodefailed',
			'beforecollapsenode',
			'collapsenode',
			'beforeactivenodechange',
			'activenodechange'
		);
  store.addSorted=function(record){
  	var index = this.findInsertIndex(record);
        this.insert(index, record);
        this.cache.save.push(record.data);
 };		
  
  store.remove = function(r){
  var i, len, children = this.getNodeChildren(r);
	for (i = 0, len = children.length; i < len; i++) {
	this.remove(children[i]);
  };
  var isDelete;
  var isDeleteUpdate;
		//删除的时候，同步save,update缓存中的数据
		isDelete = this.synchronizeData(r,this.cache.save,false);
		isDeleteUpdate = this.synchronizeData(r,this.cache.update,false);
		if(!isDelete&&!isDeleteUpdate){
			this.cache.remove.push(r.data);
		}
		
		//从store中删除
		Asiainfo.data.AsiaInfoJsonStore.superclass.remove.call(this,r);
			
		if(this.getCount()>0){
			var record = this.getAt(this.getCount()-1);
			this.curRecord = record;
			this.itemindex = this.indexOfId(record.id);
	}
};
store.loadRecords = function(o, options, success){
	 
   var r = o.records, t = o.totalRecords || r.length;
   
   if (this.pruneModifiedRecords) {
        this.modified = [];
      }
      for (var i = 0, len = r.length; i < len; i++) {
        r[i].join(this);
      }
      if (this.snapshot) {
        this.data = this.snapshot;
        delete this.snapshot;
      }
      this.data.clear();
      this.data.addAll(r);
      
      this.totalLength = t;
      this.applySort();
      this.fireEvent("datachanged", this);	 
};
store.applySort = function()
	{      
		if(this.sortInfo && !this.remoteSort){
			var s = this.sortInfo, f = s.field;
			this.sortData(f, s.direction);
			 
		}
		// ----- Modification start
		else {  
			this.applyTreeSort();
			 
		}
		// ----- End of modification
	};
store.applyTreeSort = function() {
	function addChild(pRecord,scope){
	  for(var i=0,cnt= scope.getCount();i<cnt;i+=1){
  	       var r=scope.getAt(i);
  	       if(r.get(scope.parent_id_field_name)!=pRecord.get(scope.key_field_name)) continue;
  	       pRecord.set('IS_LEAF',false);
  	       r.id= r.get(scope.key_field_name);
  	       r.set('IS_LEAF',true);
               records.push(r);
               addChild(r,scope);
           }	
	}
         var  records = [];
         for(var i=0,cnt= this.getCount();i<cnt;i+=1){
  	       var r=this.getAt(i);
  	       if(this.startroot){
  	        if(r.get(this.key_field_name)==this.startroot){
  	       	r.id=r.get(this.key_field_name);
            r.set('IS_LEAF',true);
            records.push(r);
             
            addChild(r,this); 
          }
  	      }
  	      else if(!r.get(this.parent_id_field_name)){
  	       	r.id=r.get(this.key_field_name);
            r.set('IS_LEAF',true);
            records.push(r);
            addChild(r,this); 
  	        
  	      }
       }
  	  if (records.length > 0) {
  	  	 
		 this.data.clear();
		 this.data.addAll(records);
		 
	  }
          if (this.snapshot && this.snapshot !== this.data) {
			temp = this.data;
			this.data = this.snapshot;
			this.snapshot = null; 
			this.applyTreeSort();
			this.snapshot = this.data;
			this.data = temp;
		}
	};
store.collectNodeChildrenTreeSorted = function(records, rec)
	{
		var i, len,
				child, 
				children = this.getNodeChildren(rec);
				
		for (i = 0, len = children.length; i < len; i++) {
			child = children[i];
			records.push(child);
			this.collectNodeChildrenTreeSorted(records, child); 
		}
	}
store.getRootNodes =function() {      
		
		var i, 
				len, 
				result = [], 
				records = this.data.getRange();
		
		for (i = 0, len = records.length; i < len; i++) {
			if (records[i].get(this.parent_id_field_name) == null || !records[i].get(this.parent_id_field_name)) {
				result.push(records[i]);
			}
		}
		    
		return result;
	};
store.getNodeDepth=function(rc){
   return this.getNodeAncestors(rc).length;	 
};

store.getNodeAncestors = function(rc) {
		var ancestors = [],
				parent;
		
		parent = this.getNodeParent(rc);
		while (parent) {
			ancestors.push(parent);
			parent = this.getNodeParent(parent);	
		}
		
		return ancestors;
	};
store.getNodeParent = function(rc) {
	 return this.getById(rc.get(this.parent_id_field_name));
	}
store.isLeafNode = function(rc) {
	 
	  return rc.get(this.leaf_field_name) == true;
		 
	}
store.isExpandedNode = function(rc)
	{
		return rc.ux_maximgb_treegrid_expanded === true;
	}
store.hasNextSiblingNode = function(rc)
	{
		return this.getNodeNextSibling(rc) !== null;
	}
store.getNodeNextSibling = function(rc)
	{
		var siblings,
				parent,
				index,
				result = null;
				
		parent = this.getNodeParent(rc);
		if (parent) {
			siblings = this.getNodeChildren(parent);
		}
		else {
			siblings = this.getRootNodes();
		}
		
		index = siblings.indexOf(rc);
		
		if (index < siblings.length - 1) {
			result = siblings[index + 1];
		}
		
		return result;
	};
store.getNodeChildren = function(rc)
	{
		var i, 
				len, 
				result = [], 
				records = this.data.getRange();
		
		for (i = 0, len = records.length; i < len; i++) {
			if (records[i].get(this.parent_id_field_name) == rc.get(this.key_field_name)) {
				result.push(records[i]);
			}
		}
		
		return result;
	};
store.isVisibleNode = function(rc)
	{
		var i, len,
				ancestors = this.getNodeAncestors(rc),
				result = true;
		
		for (i = 0, len = ancestors.length; i < len; i++) {
			result = result && this.isExpandedNode(ancestors[i]);
			if (!result) {
				break;
			}
		}
		
		return result;
	};
store.setActiveNode = function(rc)
	{
		if (this.active_node !== rc) {
			if (rc) {
				if (this.data.indexOf(rc) != -1) {
					if (this.fireEvent('beforeactivenodechange', this, this.active_node, rc) !== false) {
						this.active_node = rc;
						this.fireEvent('activenodechange', this, this.active_node, rc);
					}
				}
				else {
					throw "Given record is not from the store.";
				}
			}
			else {
				if (this.fireEvent('beforeactivenodechange', this, this.active_node, rc) !== false) {
					this.active_node = rc;
					this.fireEvent('activenodechange', this, this.active_node, rc);
				}
			}
		}
	};
store.expandNode = function(rc)
	{
		var params;
		
		if (
			!this.isExpandedNode(rc) &&
			this.fireEvent('beforeexpandnode', this, rc) !== false
		) {
			// If node is already loaded then expanding now.
			if (this.isLoadedNode(rc)) {
				this.setNodeExpanded(rc, true);
				this.fireEvent('expandnode', this, rc);
			}
			// If node isn't loaded yet then expanding after load.
			else {
				params = {};
				params[this.paramNames.active_node] = rc.id;
				this.load({
					add : true,
					params : params,
					callback : this.expandNodeCallback,
					scope : this
				});
			}
		}
	};
store.isLoadedNode = function(rc)
	{
		var result;
		
		if (rc.ux_maximgb_treegrid_loaded !== undefined) {
			result = rc.ux_maximgb_treegrid_loaded
		}
		else if (this.isLeafNode(rc) || this.hasChildNodes(rc)) {
			result = true;
		}
		else {
			result = false;
		}
		
		return result;
	};
store.hasChildNodes = function(rc)
	{
		return this.getNodeChildrenCount(rc) > 0;
	};
store.getNodeChildrenCount = function(rc)
	{
		return this.getNodeChildren(rc).length;
	};
store.setNodeExpanded = function(rc, value)
	{
		rc.ux_maximgb_treegrid_expanded = value;
	};
store.collapseNode = function(rc)
	{
		if (
			this.isExpandedNode(rc) &&
			this.fireEvent('beforecollapsenode', this, rc) !== false 
		) {
			this.setNodeExpanded(rc, false);
			this.fireEvent('collapsenode', this, rc);
		}
	}
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
     
    this.store=this.cfg.store;
 
    if(!this.store.parent_id_field_name)this.store.parent_id_field_name=this.cfg.pkeyname;
    if(!this.store.key_field_name)this.store.key_field_name=this.cfg.keyname;
    if(!this.store.leaf_field_name)this.store.leaf_field_name='IS_LEAF';
    if(!this.store.parent_id_field_name || !this.store.key_field_name ){
    	alert('错误提示:没有配置项:pkeyname,keyname,你可以在treegrid cfg中进行配置');
    }
    
    this.store.startroot=this.cfg.startroot;
    
    ExtendStoreToTreeStroe(this.store);
    this.store.applySort();
    this.store.hasLoad=true;
    if(this.store.cache){
   
   };
    this.store.commitChanges();
     
  
   
     var sm_gd = new Ext.grid.RowSelectionModel({listeners: {rowselect: function(sm, row, rec) {
     	if(typeof(dataManager)=='undefined' || typeof(dataManager)==null ) return;
     	dataManager.fresh(null,this.control,row);
     	if(this.control.clickfun && this.control.clickfunpara)
          Asiainfo.widget.actfun(this.control.clickfun,this.control.clickfunpara)
     }}});
    
     
     this.buildRender();
     //this.cfg.root_title= this.cfg.columns[0].header;
      this.cfg.sm=sm_gd;
     this.cfg.master_column_id=this.cfg.columns[0].dataIndex;
     this.cfg.viewConfig= { enableRowBody : true };
     if(this.cfg.expander){
    
      	//baseFun.loadScript('../asiainfo/grid/RowExpander.js');
      	this.cfg.columns.splice(0,0,this.cfg.expander);
        this.cfg.plugins=this.cfg.expander;
     }
     else if(this.cfg.expandFieldText){
        baseFun.loadScript('../asiainfo/grid/RowExpander.js');
	      var expander = new Ext.grid.RowExpander({ tpl : new Ext.Template(this.cfg.expandFieldText)})
        this.cfg.columns.splice(0,0,expander);
        this.cfg.plugins=expander;
       // this.cfg.autoExpandColumn= 'RULECODE';
     };
     
     this.cfg.store=this.store;
     this.cfg.clicksToEdit=1;
     if(this.cfg.showcheck=='y'){
       var smck_gd =new Ext.grid.CheckboxSelectionModel({listeners: {rowselect: function(sm, row, rec) {
  	if(typeof(dataManager)=='undefined' || typeof(dataManager)==null ) return;
     	dataManager.fresh(null,this.control,row);
     	if(this.control.clickfun && this.control.clickfunpara)
          Asiainfo.widget.actfun(this.control.clickfun,this.control.clickfunpara)
        
     }}});
     this.cfg.columns=this.cfg.columns.insertAt(0,smck_gd);
     this.cfg.sm=smck_gd;
    };
    this.cfg.ddGroup='ddgroup';
	//this.cfg.enableDragDrop=true;
    this.cfg.stripeRows=true;
    this.control= new Ext.ux.maximgb.treegrid.GridPanel(this.cfg);
     sm_gd.control=this.control;
     if(smck_gd) smck_gd.control=this.control;
     this.control.on("cellclick",function(grid, rowIndex, columnIndex, e){
        if(typeof(dataManager)=='undefined' || typeof(dataManager)==null ) return;
         
     	dataManager.fresh(null,this,rowIndex);
     	 
     });
      
    
    if(this.cfg.dblclickfun){
  	 this.control.dblclickpara=this.cfg.dblclickpara;
  	 this.control.dblclickfun=this.cfg.dblclickfun;
         this.control.on("dblclick",this.dblClick);
    };
    this.control.on('render',function(){
    
    var targetEl=this.container.dom.parentNode;
			
			var ddSelfRow = new Ext.dd.DropTarget(targetEl,{
				ddGroup:'ddgroup',
				copy:false,
				notifyDrop:function(ddSource, e, data){
					var index = ddSource.getDragData(e).rowIndex;
		   	 		var targetRow= ddSource.grid.store.getAt(index);
		   	 		Ext.Msg.confirm('提示','是否确认此次修改',callbak);
		   	 		function callbak(btn){
		        	 	if(btn == 'yes'){
		        	 
				   			if(!targetRow) return Ext.dd.DropZone.prototype.dropNotAllowed; 
				   			var selRow = data.selections[0];
				   			selRow.set('IS_LEAF',false);
				   			
				   			selRow.set(ddSource.grid.store.parent_id_field_name,targetRow.get(ddSource.grid.store.key_field_name));
				   			ddSource.grid.store.commit(false);
				   			ddSource.grid.getView().refresh()
				   			//location.reload();
				   			return true;
						}
					}
				}
    });
});
    if(dataManager) dataManager.bindCmp(this.store,this.control,'Grid');
   
   },
  dblClick:function(){
    	
  },
  buildRender:function (){
    for(var i=0;i<this.cfg.columns.length;i++){
    	this.cfg.columns[i].id=this.cfg.columns[i].dataIndex;
    	if(this.cfg.columns[i].xtype && this.cfg.columns[i].xtype=='checkbox')
    	 //  this.cfg.columns[i]=new Ext.grid.CheckboxSelectionModel(); 
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
			if(this.cfg.canEdit==true)this.cfg.columns[i].editor=new Ext.form.DateField({ format:'Y-m-d' })
		}
		else if(this.cfg.columns[i].dataIndex==this.store.recordFields[j].name&& this.cfg.columns[i].canEdit  ){
		   
		   this.cfg.columns[i].editor=this.getcolEditor(this.cfg.columns[i]);//new Ext.form.TextField();
	        }
	};
	
    }
  },
  getcolEditor:function(c){
    var fd=new Ext.form.TextField();
    
    if(c.editcfg){fd=Asiainfo.widget.getField(c.editcfg);return fd};
    if(!this.cfg.editers) return fd;
    for(var i=0;i<this.cfg.editers.length;i++){
    	if(this.cfg.editers[i].dataIndex==c.dataIndex){
    	  fd=Asiainfo.widget.getField(this.cfg.editers[i]);return fd
    	} 
    };
    return new Ext.form.TextField();	
  },
   RefreshView : function() {
   	if(this.store.getCount()>0)
	  this.control.getSelectionModel().selectFirstRow();
      
   }
};

 