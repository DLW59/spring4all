Ext.namespace("Asiainfo.widget.TreeColumn");
 
Asiainfo.widget.TreeColumn=function(config){
	this.cfg= config||{};
  this.cfg.attributs=this.cfg.attributs ? this.cfg.attributs.split(','):[];
         
	if(config.cfgcode) this.loadcfg(config.cfgcode);
	if(this.cfg) this.store=this.cfg.store;
	if(config.rootVisible==true){
	  this.cfg.rootVisible  = true;
	  this.cfg.rootText  = config.rootText;
	}
	else 
	  this.cfg.rootVisible  = false;
	this.create();
	return this;
};
Asiainfo.widget.TreeColumn.prototype={
	loadcfg:function(COMCODE){
	   var obj_cfg=_main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));
	   if(!obj_cfg){alert('分组报表没有正确配置:');return null}; 
	   this.cfg.store=_main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));
	   this.cfg={region:this.layrec.get('ALIGN'), rootVisible:false, autoScroll:true, expandable:false, enableDD:true,
                     id: obj_cfg.get("OBJCODE"),split:obj_cfg.get("DEFAULT")=='Y'?true:false,title:obj_cfg.get("OBJNAME"),root: new Ext.tree.AsyncTreeNode({ allowChildren: true }),
                     width:parseInt(this.layrec.get('WIDTH')),height:parseInt(this.layrec.get('HEIGHT'))
                     };
	   this.cfg.fieldname=obj_cfg.get("REMARK");
	   this.cfg.fieldwidths=obj_cfg.get("LISTVALUE").split(',');
	   this.cfg.keyname=obj_cfg.get("CNNAME") ;
           this.cfg.pkeyname=obj_cfg.get("PARENTCODE");
           this.cfg.titlename=obj_cfg.get("AWHERE").split(',');
           this.cfg.subtype=this.cfg.subtype;
	},
  create:function(){
     
    if(this.cfg.subtype=='gridtree'){
    	baseFun.loadScript('../asiainfo/grid/editable-column-tree.css','css');
		  baseFun.loadScript('../asiainfo/grid/ColumnNodeUI.js'); 
		  baseFun.loadScript('../asiainfo/grid/treeSerializer.js');
		   
       // this.cfg.columns=this.GetTreeColumn();
        this.cfg.loader=new Ext.tree.TreeLoader({ preloadChildren:true, uiProviders:{ 'col': Ext.tree.ColumnNodeUI } });
     };
    if(this.cfg.subtype=='gridtree') this.control = new Ext.tree.ColumnTree(this.cfg)
    else this.control = new Ext.tree.TreePanel(this.cfg);
    
    var root=new Ext.tree.TreeNode({ text: this.cfg.rootText, draggable:false,id:'' });
    this.control.setRootNode(root);
    this.control.clickfun=this.cfg.clickfun;
    this.control.clickfunpara=this.cfg.clickpara;
    if(this.cfg.subtype=='grouptree') this.BuildGroupTree(root)
    else if(this.cfg.subtype=='simpletree') this.AddSimpleChild(root,0,'null')
    else if(this.cfg.subtype=='gridtree') {this.AddGridTreeChild(root,0,'null')};
    this.control.on('click',this.treeClick);
 
    if(this.cfg.subtype=='gridtree'){
    var te = new Ext.tree.ColumnTreeEditor(this.control,{
       completeOnEnter: true,
       autosize: true,
       ignoreNoChange: true
   });
   };
   this.store.on('remove',function(){
   	//alert(this.control.getSelectionModel().getSelectedNode().text) 
   	//alert('remove'+this.control.curNode);
    });
    if(dataManager){ 
    dataManager.bindCmp(this.store, this.control, 'Tree'); 
     
   }
    
  },
  createDyloader:function(){
  	var myloader = new Ext.tree.TreeLoader({keyfield:this.cfg.keyfield,pkeyfield:this.cfg.pkeyfield,titlefield:this.cfg.titlefield,sql:this.cfg.sql,dataUrl:this.baseUrl+this.cfg.sql.replace('{PARENT}',this.rootNode.id)});
        myloader.on("beforeload", function(treeLoader, pnode) { 
             myloader.dataUrl=this.baseUrl+"select * from ("+this.sql+" ) a where "+this.pkeyfield+" in('"+pnode.id+"')" 
         },this); 
        myloader.on("load",function(tree, pnode, response ){
        	 
                 var result = eval('('+response.responseText+')');
                 var strID="";
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
  },
  removeChildrenRecursively:function(node) {
    if (!node) return;
    while (node.hasChildNodes()) {
        this.removeChildrenRecursively(node.firstChild);
        node.removeChild(node.firstChild);
    }
  },
  
  AddSimpleChild:function(pNode,level,parentValue){
  	
  	if(parentValue=='null')parentValue=''
  	else if(!parentValue) parentValue=pNode.id;
  	  	
  	for(var i=0,cnt=this.store.getCount();i<cnt;i+=1){
  	  var r=this.store.getAt(i);
  	 
  	  if(r.get(this.cfg.pkeyname)!=parentValue) continue;
  	  var nodejson={id:r.get(this.cfg.keyname), text:r.get(this.cfg.titlename)};
  	  if(this.cfg.showCheck==true){
  	  	nodejson.checked=false;
  	  	nodejson.uiProvider=Ext.ux.TreeCheckNodeUI;
  	  }
  	  ////iconcls add
  	  if(r.get('ICONCLS')){
  	  	
  	  	nodejson.iconCls=r.get('ICONCLS');
  	  }; 
  	  var node = new Ext.tree.TreeNode(nodejson);
  	  if(this.cfg.attributs){
  	     for(var j=0;j<this.cfg.attributs.length;j++)
  	  	   node.attributes[this.cfg.attributs[j]]=r.get(this.cfg.attributs[j]);
  	  }
  	  
  	  node.ItemIndex = i;
  	   
	  pNode.appendChild(node);
	 if(level<4) this.AddSimpleChild(node,level+1)
     }
  },
  BuildGroupTree:function(root){
		var fields=this.cfg.pkeyname.split(',');
		var preNodes=[];
		 
		preNodes[fields[0]]=root;
		for(var i=0;i<this.store.getCount();i++){
			var r=this.store.getAt(i);
			for(var j=0;j<fields.length;j++){
	 
				if(!preNodes[fields[j]] || preNodes[fields[j]].text!=r.get(fields[j])){
					var nodeText=r.get(fields[j]);
					if(j==fields.length-1 && r.get('NUM') && this.cfg.shownum=='Y') nodeText+='<font color=blue>('+r.get('NUM')+')</font>'
					var cNode=new Ext.tree.TreeNode({text:nodeText });
					cNode.fieldName=fields[j];
					cNode.fieldValue=r.get(fields[j]);
					if(j==0) root.appendChild(cNode)
					else preNodes[fields[j-1]].appendChild(cNode);
					preNodes[fields[j]]=cNode;
					for(var k=j+1;k<fields.length;k++)
					  preNodes[fields[k]]=null;
				}
			};
		};
		 
  },
  AddGridTreeChild:function (pNode,level,parentValue){
  	if(parentValue=='null')parentValue=''
  	else parentValue=pNode.id; 
  	for(var i=0,cnt=this.store.getCount();i<cnt;i+=1){
  		var r = this.store.getAt(i);
  		if(r.get(this.cfg.pkeyname)!=parentValue) continue;
  		r.data.id=r.get(this.cfg.keyname);
  		r.data.text=r.get(this.cfg.titlename);
  		r.data.leaf=false;
  		r.data.allowChildren=false;
  		r.data.uiProvider=Ext.tree.ColumnNodeUI;
  		/*
  		var nodejson="id:'"+r.get(this.cfg.keyname)+"',text:'"+r.get(this.cfg.fieldnames[0])+"'";
  			for(var j=0;j<this.cfg.fieldnames.length-1;j++){
  				nodejson+=",'"+this.cfg.fieldnames[j]+"':'"+r.get(this.cfg.fieldnames[j])+"'";
  			};
  			nodejson+=",leaf:false,allowChildren:false,uiProvider:Ext.tree.ColumnNodeUI";
  		 */
  		//	var obj=Ext.util.JSON.decode("{"+nodejson+"}");
  			 var cNode=new Ext.tree.TreeNode(r.data);
          pNode.appendChild(cNode);
         if(level<2) this.AddGridTreeChild(cNode,level+1); 
   
  	};
  },
  GetTreeColumn:function (){	
     var _columns = new Array();
     
     for(var i=this.cfg.heads.length;i<=this.cfg.fieldnames.length-1;i++){
     	this.cfg.heads.push(this.cfg.fieldnames[i]);
     }
     for(var i=this.cfg.fieldwidths.length;i<=this.cfg.fieldnames.length-1;i++){
     	this.cfg.fieldwidths.push('120');
     }
     for(var i=this.cfg.fieldtypes.length;i<=this.cfg.fieldnames.length-1;i++){
     	this.cfg.fieldtypes.push('string');
     };
 
     for(var i=0;i<=this.cfg.fieldnames.length-1;i++){
      
     	if(this.cfg.fieldtypes[i]=='date'){
     		var obj = {"header": this.cfg.heads[i], "width": parseInt(this.cfg.fieldwidths[i]), "dataIndex":this.cfg.fieldnames[i],"renderer": Ext.util.Format.dateRenderer('Y-m-d'),events:
                     {
                         xtype: 'datefield',
                         editable: true
                     }
     
          };
     	}
     	else if(this.cfg.fieldtypes[i]=='time'){
     		var obj = {"header": this.cfg.heads[i], "width": parseInt(this.cfg.fieldwidths[i]), "dataIndex":this.cfg.fieldnames[i],"renderer": Ext.util.Format.dateRenderer('H:m:i')};
     	}
     	else{
     		var obj = {"header": this.cfg.heads[i], "width": parseInt(this.cfg.fieldwidths[i]), "dataIndex":this.cfg.fieldnames[i]};
     	}
      _columns.push(obj);
     } 
     return _columns;
  },
  treeClick:function(node,e) {
   //alert(node.text+node.getDepth()+node.getOwnerTree().clickfun+','+node.getOwnerTree().clickfunpara);
   if(!node) return;
   node.getOwnerTree().curNode=node;
   if(dataManager) dataManager.fresh(null,node.getOwnerTree(),node.ItemIndex);
  // _main.CompMgr.RefreshView(node.getOwnerTree().clickfunpara);
  },
  getwhere:function(){
  	 
  	var selectedNode= this.control.curNode;
  	if(!selectedNode) return '1=1';
  	var where='';
  	while (selectedNode){
  		if(selectedNode.fieldName && selectedNode.fieldValue){
  			if(where) where +=" and "+ selectedNode.fieldName+" = '"+ selectedNode.fieldValue+"' "
  			else   where  = selectedNode.fieldName+" = '"+ selectedNode.fieldValue+"' "
  		};
  		selectedNode=selectedNode.parentNode;
  	}
  	 
  	 
  	return where;
  },
  RefreshView:function(newParentVal,newTitle){
    var pNode=tr_index.control.getRootNode();
    this.removeChildrenRecursively(pNode);
    this.AddSimpleChild(pNode,0,newParentVal);	
    if(newTitle) this.control.setTitle(newTitle);	 
   }
};
Ext.ux.TreeCheckNodeUI = function() {
 //多选: 'multiple'(默认)
 //单选: 'single'
 //级联多选: 'cascade'(同时选父和子);'parentCascade'(选父);'childCascade'(选子)
 this.checkModel = 'multiple';
 
 //only leaf can checked
 this.onlyLeafCheckable = false;
 
 Ext.ux.TreeCheckNodeUI.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.ux.TreeCheckNodeUI, Ext.tree.TreeNodeUI, {

    renderElements : function(n, a, targetNode, bulkRender){
     var tree = n.getOwnerTree();
  this.checkModel = tree.checkModel || this.checkModel;
  this.onlyLeafCheckable = tree.onlyLeafCheckable || false;
     
        // add some indent caching, this helps performance when rendering a large tree
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        //var cb = typeof a.checked == 'boolean';
  var cb = (!this.onlyLeafCheckable || a.leaf);
        var href = a.href ? a.href : Ext.isGecko ? "" : "#";
        var buf = ['<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">',
            '<span class="x-tree-node-indent">',this.indentMarkup,"</span>",
            '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
            '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',(a.icon ? " x-tree-node-inline-icon" : ""),(a.iconCls ? " "+a.iconCls : ""),'" unselectable="on" />',
            cb ? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked ? 'checked="checked" />' : '/>')) : '',
            '<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" ',
             a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "", '><span unselectable="on">',n.text,"</span></a></div>",
            '<ul class="x-tree-node-ct" style="display:none;"></ul>',
            "</li>"].join('');

        var nel;
        if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
        }
       
        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        var index = 3;
        if(cb){
            this.checkbox = cs[3];
            Ext.fly(this.checkbox).on('click', this.check.createDelegate(this,[null]));
            index++;
        }
        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
    },
   
    // private
    check : function(checked){
        var n = this.node;
  var tree = n.getOwnerTree();
  this.checkModel = tree.checkModel || this.checkModel;
  
  if( checked === null ) {
   checked = this.checkbox.checked;
  } else {
   this.checkbox.checked = checked;
  }
  
  n.attributes.checked = checked;
  tree.fireEvent('check', n, checked);
  
  if(this.checkModel == 'single'){
   var checkedNodes = tree.getChecked();
   for(var i=0;i<checkedNodes.length;i++){
    var node = checkedNodes[i];
    if(node.id != n.id){
     node.getUI().checkbox.checked = false;
     node.attributes.checked = false;
     tree.fireEvent('check', node, false);
    }
   }
  } else if(!this.onlyLeafCheckable){
   if(this.checkModel == 'cascade' || this.checkModel == 'parentCascade'){
    var parentNode = n.parentNode;
    if(parentNode !== null) {
     this.parentCheck(parentNode,checked);
    }
   }
   if(this.checkModel == 'cascade' || this.checkModel == 'childCascade'){
    if( !n.expanded && !n.childrenRendered ) {
     n.expand(false,false,this.childCheck);
    }else {
     this.childCheck(n); 
    }
   }
  }
 },

   
    // private
 childCheck : function(node){
  var a = node.attributes;
  if(!a.leaf) {
   var cs = node.childNodes;
   var csui;
   for(var i = 0; i < cs.length; i++) {
    csui = cs[i].getUI();
    if(csui.checkbox.checked ^ a.checked)
     csui.check(a.checked);
   }
  }
 },
 
 // private
 parentCheck : function(node ,checked){
  var checkbox = node.getUI().checkbox;
  if(typeof checkbox == 'undefined')return ;
  if(!(checked ^ checkbox.checked))return;
  if(!checked && this.childHasChecked(node))return;
  checkbox.checked = checked;
  node.attributes.checked = checked;
  node.getOwnerTree().fireEvent('check', node, checked);
  
  var parentNode = node.parentNode;
  if( parentNode !== null){
   this.parentCheck(parentNode,checked);
  }
 },
 
 // private
 childHasChecked : function(node){
  var childNodes = node.childNodes;
  if(childNodes || childNodes.length>0){
   for(var i=0;i<childNodes.length;i++){
    if(childNodes[i].getUI().checkbox.checked)
     return true;
   }
  }
  return false;
 },
 
    toggleCheck : function(value){
     var cb = this.checkbox;
        if(cb){
            var checked = (value === undefined ? !cb.checked : value);
            this.check(checked);
        }
    }
});