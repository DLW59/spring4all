
Ext.ux.ComboBoxTree = function(){
	this.treeId = Ext.id()+'-tree';
	this.maxHeight = arguments[0].maxHeight || arguments[0].height || this.maxHeight;
	this.tpl = new Ext.Template('<tpl for="."><div style="height:'+this.maxHeight+'px"><div id="'+this.treeId+'"></div></div></tpl>');
	this.store = new Ext.data.SimpleStore({fields:[],data:[[]]});
	this.selectedClass = '';
	this.mode = 'local';
	this.triggerAction = 'all';
	this.onSelect = Ext.emptyFn;
	this.editable = false;
	this.baseUrl="/"+contextPath+"/newrecordService?command=init&initSql=";
	//this.sql=arguments[0].sql;
	this.sql=arguments[0].sql || arguments[0].storesql; 
	this.rootNode=  new Ext.tree.TreeNode({id:arguments[0].rootid,text:arguments[0].roottext});
	 
 
	var myloader = new Ext.tree.TreeLoader({keyfield:arguments[0].keyfield,pkeyfield:arguments[0].pkeyfield,titlefield:arguments[0].titlefield,sql:this.sql,dataUrl:this.baseUrl+this.sql.replace('{PARENT}',this.rootNode.id)});
  myloader.on("beforeload", function(treeLoader, pnode) { 
             myloader.dataUrl=this.baseUrl+"select * from ("+this.sql+" ) a where "+this.pkeyfield+" in('"+pnode.id+"')" 
    },this); 
        myloader.on("load",function(tree, pnode, response ){
        	 var strID="";
                 var result = eval('('+response.responseText+')');
				 
                 for(var i=0;i<result.root.length;i++){
                 	if(strID) strID+=",'"+result.root[i][this.keyfield]+"'"
			else strID ="'"+result.root[i][this.keyfield]+"'"

	         };
	        
	         var tmpStore=Asiainfo.getStore('select distinct  '+this.pkeyfield+ ' from ('+this.sql+' ) a where '+this.pkeyfield+' in('+strID+')');
	         strID='';
	         for(var i=0;i<tmpStore.getCount();i++)
	           strID+=','+tmpStore.getAt(i).get(this.pkeyfield);
	          
		 for(var i=0;i<result.root.length;i++){
		 	if(strID.indexOf(result.root[i][this.keyfield])==-1) isLeaf=true
		 	else  isLeaf=false;
			 var tmpNode=  new Ext.tree.AsyncTreeNode({id:result.root[i][this.keyfield],text:result.root[i][this.titlefield],leaf:isLeaf});
			 pnode.appendChild(tmpNode);
	         }
        }); 
	this.tree ={ xtype:'treepanel', loader:myloader, root : this.rootNode,rootVisible:false},
	//all:所有结点都可选中
	//exceptRoot：除根结点，其它结点都可选
	//folder:只有目录（非叶子和非根结点）可选
	//leaf：只有叶子结点可选
	
	this.selectNodeModel = arguments[0].selectNodeModel || 'exceptRoot';
	
	Ext.ux.ComboBoxTree.superclass.constructor.apply(this, arguments);
	this.on('render',function(){
		this.setValue(this.rootNode);
	});
}

Ext.extend(Ext.ux.ComboBoxTree,Ext.form.ComboBox, {
	 
	expand : function(){
		Ext.ux.ComboBoxTree.superclass.expand.call(this);
		if(!this.tree.rendered){
			this.tree.height = this.maxHeight;
			this.tree.border=false;
			this.tree.autoScroll=true;
	        if(this.tree.xtype){
				this.tree = Ext.ComponentMgr.create(this.tree, this.tree.xtype);
				var _sql="select * from ("+this.sql+" ) a where "+this.keyfield+" in('"+this.rootNode.id+"')";
				var tmpStore=Asiainfo.getStore(_sql);
				for(var i=0;i<tmpStore.getCount();i++){
				var r=tmpStore.getAt(i);
				var rootNode1=  new Ext.tree.AsyncTreeNode({id:r.get(this.keyfield),text:r.get(this.titlefield)});
	                        this.rootNode.appendChild(rootNode1);
	                       }
			}
			this.tree.render(this.treeId);
	        var combox = this;
	        this.tree.on('click',function(node){
	        	var isRoot = (node == combox.tree.getRootNode());
	        	var selModel = combox.selectNodeModel;
	        	var isLeaf = node.isLeaf();
	        	 
	        	if(isRoot && selModel != 'all'){
	        		return;
	        	}else if(selModel=='folder' && isLeaf){
	        		return;
	        	}else if(selModel=='leaf' && !isLeaf){
	        		return;
	        	}
	        	 
	        	combox.setValue(node);
	        	combox.collapse();
	        });
	         
			var root = this.tree.getRootNode();
			//if(!root.isLoaded())
				//root.reload();
		}
    },
    
	setValue : function(node){
	if(!node || !node.text) return;
        var text = node.text;
        this.lastSelectionText = text;
        if(this.hiddenField){
            this.hiddenField.value = node.id;
        };
        
        Ext.form.ComboBox.superclass.setValue.call(this, text);
        this.value = node.id;
    },
    
    getValue : function(){
    	return typeof this.value != 'undefined' ? this.value : '';
    }
});

Ext.reg('combotree', Ext.ux.ComboBoxTree);