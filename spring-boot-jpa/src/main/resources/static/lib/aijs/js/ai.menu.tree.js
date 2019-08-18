/**
* 菜单树组件,目前使用在数据门户，支持通过配置关联展现的数据，支持数节点的基本操作包括添加根节点，添加子节点，删除节点，编辑节点名称，拖拽方式移动节点
* 节点内容新增或编辑时候的弹出窗口内容和回调函数也可配置
* 需要引用jquery.ztree.all-3.5.min.js和jquery-contextMenu.js
*
*     参数说明：
*         sql                   : 传入的sql,查询的字段必须包含table_key,parent_field,title_field,child_field,seq_field
*         table_key             : 表技术主键，不能为编码字段
*         table_name            : 表名
*         parent_field          : 上级编码字段
*         child_field           : 编码字段
*         title_field           : 显示名称字段
*         seq_field             : 节点序号字段，默认为"SEQ"
*         parent_code           : 上级编码前缀，用于生成根节点编码,不传入默认为"dacp-tree",
*         containerId           : 展现tree容器id
*         max_level             : 允许树最大的层级,默认-1不限制
*         formcfg               : 编辑，修改树基本信息的窗口，内容自定义，组件的fieldName名必须包含在sql查询语句中
*         onClickCallBack       : 树节点点击事件处理函数
*         deleteNodeCallBack    : 树节点删除事件处理函数
*         createNodeStoreHandle : 新增树节点时回调处理store
*         updateNodeStoreHandle : 修改树节点时回调处理store  
*/

AI.MenuTree = Event.$extend({
		defaultOptions:{
			zNodes:null,//此store查询的节点只读
			sql:"",//传入的sql
			table_key:"",//表技术主键，不能为编码字段
			table_name:"",//表名
			parent_field:"",//上级编码字段
			child_field:"",//编码字段
			title_field:"",//显示名称字段
			seq_field:"SEQ",//节点序号字段
			menu_type:"MENU_TYPE",//树节点类型
			parent_code:"dacp-tree",//默认上级编码前缀，用于生成根节点编码
		    containerId:'',//展现tree容器id
		    itemStore : null,//树结构对应store
		    max_level:"-1",//允许树最大的层级,-1不限制
		    formcfg:null,//编辑，修改树基本信息的窗口，内容自定义，组件的fieldName名必须包含在sql查询语句中
		    onClickCallBack:null,
		    deleteNodeCallBack:null,
		    createNodeStoreHandle:null,//新增节点时回调出来store
		    updateNodeStoreHandle:null,//修改节点时回调处理store
		    ztree:null,
		    setting : {
			    	view:{showLine: false, showIcon: true, selectedMulti: false, dblClickExpand: false}, 
			    	data:{simpleData:{enable: true} }, 
			    	edit:{enable: true,showRemoveBtn: false,removeTitle: "删除节点",showRenameBtn: false,renameTitle: "编辑节点名称",
			    	dray:{isCopy: false}},
		            callback:{
		                beforeRemove:function( treeId, treeNode){
		                	if(window.confirm("你确定要删除名为：’"+treeNode.name+"'的项目吗？")){
		                        deleteItems( treeNode);
		                    }
		                	else return false;
		                },
		                beforeRename:function(treeId, treeNode, newName, isCancel){
		                	if (newName.length > 8)
                      {
                        alert("节点名称太长，请重新输入！");
                        return false ;
                      }
		                	var r = _this.itemStore.getRecordByKey(treeNode.key);
		                	_this.itemStore.curRecord = r ;
		                	_this.itemStore.curRecord.set(_this.title_field,newName);
		                	return _this.itemStore.commit();
		                },
		            	onClick:function(event,treeId,treeNode){
		            		if(_this.onClickCallBack){
		            			_this.onClickCallBack.call(this,treeNode);
		            		}
		                    var r=_this.itemStore.getRecordByKey(treeNode.key);
		                    if(!r) return false;
		                    _this.itemStore.curRecord=r;
		                },
		                beforeRightClick:function(treeId, treeNode) {
		                	zTree.cancelSelectedNode();
		                	zTree.selectNode(treeNode);
		                	var r=_this.itemStore.getRecordByKey(treeNode.key);
		                    if(!r) return false;
		                    _this.itemStore.curRecord=r;
		                	$(".context-menu-active").removeClass("context-menu-active");
		                	return false;
		                },
		                onDrop:function(event, treeId, treeNodes, targetNode, moveType) {
			               	 if (moveType=="inner"){
			               		self.refreshTree(targetNode);
			                 }
			            	 else {
			            		 self.refreshTree(targetNode.getParentNode());
			            	 }
		               },
		               beforeDrop:function(treeId, treeNodes, targetNode, moveType){
		            	 //debugger;
		          		 if ((moveType=="inner")&&(_this.max_level>0)){
		          			 if (targetNode.level >= (_this.max_level - 1)) return false;
		                 }
      			         //根节点不允许拖动
                         if (treeNodes[0].level==0) {
                             return false;
                         }
                         //不允许拖动变为根节点
                         if ((targetNode.level == 0)&&(moveType!="inner")) {
                             return false;
                         }
		               }
		           }
		        }
		 },
	    __init__ : function(configs){
	    	var options = $.extend(true,{},this.defaultOptions,configs); ///扩展对象属性
	        options.parent_code=options.parent_code||"dacp-tree";
	        self = this;
	        this.init(options);
	    },
	    /**
			* 菜单树组件初始化
			* @param  options 初始化参数集
			*/
	    init: function(options) {
	    	_this = options ;
	        if(options.zTree) options.zTree.destroy();  
	        
	        if(!options.zNodes) {
	        	zNodes = [];
	        }else{
	        	zNodes = options.zNodes;
	        }
	       
	        options.itemStore=new  AI.JsonStore({
	            sql:options.sql,
	            key:options.table_key,
	            table:options.table_name,
	            pageSize:-1
	        });
	        for(var i=0;i<options.itemStore.getCount();i++){
	            var r=options.itemStore.getAt(i);
	            var pId=r.get(options.parent_field);
	            if(!r.get(options.parent_field))  pId="0";
	            var node={ id:r.get(options.child_field), pId:pId, name:r.get(options.title_field),key:r.get(options.table_key),type:r.get(options.menu_type),readonly:false};
	            if(i==0) node.open=true;
	            zNodes.push(node);    
	        }

	        $.fn.zTree.init($("#"+options.containerId), options.setting,zNodes);
	        zTree = $.fn.zTree.getZTreeObj(options.containerId);

	        var treeObj = $("#"+options.containerId);
	        treeObj.hover(function () {
	            if (!treeObj.hasClass("showIcon")) {
	                treeObj.addClass("showIcon");
	            }
	        }, function() {
	            treeObj.removeClass("showIcon");
	        });
	        this.buildTreeContextMenu();
	    },
	    /**
			* 修改子节点的ID和上级ID，用于子节点拖拽移动时候
			* @param  curNode 当前节点
			* @param  new_parent_id 新的父节点ID
			*/
		modifyChildItems : function(curNode,new_parent_id) {
			//递归修改子节点的id和pid
			var old_parent_id = curNode.pId ;
			var old_child_id  = curNode.id ;
			var new_child_id  = curNode.id.replace(old_parent_id,new_parent_id) ;
			curNode.id = new_child_id;
	    	curNode.pId = new_parent_id;
	    	var r = _this.itemStore.getRecordByKey(curNode.key);
	    	_this.itemStore.curRecord = r ;
	    	_this.itemStore.curRecord.set(_this.child_field,new_child_id);
	    	_this.itemStore.curRecord.set(_this.parent_field,new_parent_id);
	    	_this.itemStore.commit();
	    
	    	if (curNode.isParent){
	        	for(var i = 0; i < curNode.children.length; i++){
	        		self.modifyChildItems(curNode.children[i],new_child_id);
	            };
	        }
	    },
	    /**
			* 更新某个节点下子节点的id,pid,seq并同步到数据库。
			* @param  treeNode 要刷新的节点
			*/
	    refreshTree:function(treeNode){
	    	//根节点seq刷新
			if (treeNode == null){
				var this_tree = $.fn.zTree.getZTreeObj(_this.containerId);
				var nodes = this_tree.getNodes();
				for(var i = 0; i < nodes.length; i++){
					var r = _this.itemStore.getRecordByKey(nodes[i].key);
		        	_this.itemStore.curRecord = r ;
		        	var newItemCode= _this.parent_code + "-" + (i+1);
		        	nodes[i].id = newItemCode;
		        	nodes[i].pId = 0;
		        	_this.itemStore.curRecord.set(_this.child_field,newItemCode);
		        	_this.itemStore.curRecord.set(_this.parent_field,"");
		        	_this.itemStore.curRecord.set(_this.seq_field,i+1);
		        	_this.itemStore.commit();
		        	
		        	if (nodes[i].isParent){
		            	for(var j = 0; j < nodes[i].children.length; j++){
		            		self.modifyChildItems(nodes[i].children[j],newItemCode);
		                };
		            }
		        	
	            };
			}
			//非根节点seq刷新
			else {
				for(var i = 0; i < treeNode.children.length; i++){
					var r = _this.itemStore.getRecordByKey(treeNode.children[i].key);
		        	_this.itemStore.curRecord = r ;
		        	var newItemCode= treeNode.id + "-" + (i+1);
		        	treeNode.children[i].id = newItemCode;
		        	treeNode.children[i].pId = treeNode.id;
		        	_this.itemStore.curRecord.set(_this.child_field,newItemCode);
		        	_this.itemStore.curRecord.set(_this.parent_field,treeNode.id);
		        	_this.itemStore.curRecord.set(_this.seq_field,i+1);
		        	_this.itemStore.commit();
		            
		        	if (treeNode.children[i].isParent){
		            	for(var j = 0; j < treeNode.children[i].children.length; j++){
		            		self.modifyChildItems(treeNode.children[i].children[j],newItemCode);
		                };
		            }
		        	
	            };
			}
	    },
	    /**
			* 节点拖拽移动处理
			* @param  curNode 当前节点
			* @param  parent_id 新的父节点ID
			*/
	    moveItems:function(curNode,parent_id){
	    	//修改本节点的id和pId
	    	var newItemCode=ai.getNewCode(_this.itemStore,child_field,parent_id+"-");
	    	curNode.id = newItemCode;
	    	curNode.pId = parent_id;
	    	var r = _this.itemStore.getRecordByKey(curNode.key);
	    	_this.itemStore.curRecord = r ;
	    	_this.itemStore.curRecord.set(_this.child_field,newItemCode);
	    	_this.itemStore.curRecord.set(_this.parent_field,parent_id);
	    	_this.itemStore.commit();
	        
	    	if (curNode.isParent){
	        	for(var i = 0; i < curNode.children.length; i++){
	        		self.modifyChildItems(curNode.children[i],newItemCode);
	            };
	        }
	    },
	    /**
			* 删除节点，包含所有子节点
			* @param  treeNode 要删除的节点
			*/
	    deleteItems:function(treeNode){
	        if (treeNode.isParent){
	        	for(var i = 0; i < treeNode.children.length; i++){
	        		this.deleteItems(  treeNode.children[i]);
	            };
	            treeNode.isParent = false
	            this.deleteItems(treeNode);
	        }
	        else {
	        	//alert("正在删除"+treeNode.tId + ", " + treeNode.name);
	        	var r = _this.itemStore.getRecordByKey(treeNode.key);
	        	_this.itemStore.curRecord = r ;
	        	_this.itemStore.remove(_this.itemStore.curRecord);
	        	_this.itemStore.commit();
	        }
	    },
	    /**
			* 根据子节点在父节点中的位置更新数据库SEQ字段
			* @param  treeNode 要更新的节点
			*/
	 	updateItemSeq:function(treeNode) {
			//根节点seq刷新
			if (treeNode == null){
				var this_tree = $.fn.zTree.getZTreeObj(containerId);
				var nodes = this_tree.getNodes();
				for(var i = 0; i < nodes.length; i++){
					var r = _this.itemStore.getRecordByKey(nodes[i].key);
		        	_this.itemStore.curRecord = r ;
		        	_this.itemStore.curRecord.set(_this.seq_field,i+1);
		        	_this.itemStore.commit();
	            };
			}
			//非根节点seq刷新
			else {
				for(var i = 0; i < treeNode.children.length; i++){
					var r = _this.itemStore.getRecordByKey(treeNode.children[i].key);
		        	_this.itemStore.curRecord = r ;
		        	_this.itemStore.curRecord.set(_this.seq_field,i+1);
		        	_this.itemStore.commit();
	            };
			}
		},
		/**
			* 显示节点编辑对话框
			* 
			*/
		showEditDialog:function(){
			if (zTree.getSelectedNodes().length == 0) return false;
	        var node = zTree.getSelectedNodes()[0];
	        var newRecord = _this.itemStore.getRecordByKey(node.key);
	        if (!newRecord) return;
	        var fromedit = _this.formcfg ;
			for(var i = 0; i < fromedit.items.length; i++){
				fromedit.items[i].value = newRecord.get(fromedit.items[i].fieldName);
			}
		    ai.showDialogForm(fromedit, this.afterOk, null);
		},
		/**
			* 显示节点信息对话框
			* 
			*/
		 showInfoDialog:function(){
			if (zTree.getSelectedNodes().length == 0) return false;
	        var node = zTree.getSelectedNodes()[0];
	        var newRecord = _this.itemStore.getRecordByKey(node.key);
	        if (!newRecord) return;
	        var fromInfo = _this.formcfg ;
			for(var i = 0; i < fromInfo.items.length; i++){
				fromInfo.items[i].value = newRecord.get(fromInfo.items[i].fieldName);
				//fromInfo.items[i].isReadOnly = "y";
			}
		    ai.showDialogForm(fromInfo, null, null);
		},
		/**
			* 编辑对话框确认按钮回调函数
			* 
			*/
		afterOk : function(fieldVals) {
	        if (zTree.getSelectedNodes().length == 0) return false;
	        var node = zTree.getSelectedNodes()[0];
	        var newRecord = _this.itemStore.getRecordByKey(node.key);
	        if (!newRecord) return;
	        
	        for(var i = 0; i < _this.formcfg.items.length; i++){
	        	if ((_this.formcfg.items[i].notNull)&&(_this.formcfg.items[i].notNull.toLowerCase()=="n")&&(fieldVals[_this.formcfg.items[i].fieldName].trim()=="")){
	        		alert(_this.formcfg.items[i].fieldName+"不允许为空！");
	        		return false;
	        	}
	         	newRecord.set(_this.formcfg.items[i].fieldName, fieldVals[_this.formcfg.items[i].fieldName]);
	         	_this.itemStore.commit();
	         	if (fieldVals[_this.child_field]) node.id = fieldVals[_this.child_field];
	         	if (fieldVals[_this.title_field]) node.name = fieldVals[_this.title_field];
	            zTree.updateNode(node);
	        }
	        
	      },
	    /**
			* 编辑对话框确认按钮回调函数
			* 
			*/
	    beforeOk : function(fieldVals) {
	          for (key in fieldVals) {
	              //if(!fieldVals[key]){alert(key+"值不允许为空");return false;}
	          };
	    },
	    /**
			* 树组件右键菜单初始化
			* 
			*/
		 buildTreeContextMenu:function() {
		    var treeNodeAction = function(key) {
		    	var nodes = zTree.getSelectedNodes();
		    	if (key != 'create'){
		    		if (nodes.length == 0) {
			            alert("请先选择一个节点");
			            return;
			        };
			        
		    	}
		    	treeNode = nodes[0];
		        if (key == 'rname') {
		            zTree.editName(treeNode);
		        } else if (key == "info") {
		        	self.showInfoDialog();
		        } else if (key == "edit") {
		        	self.showEditDialog();
		        }else if (key == "delete" || key == "remove") {
		        	if(treeNode.pId == undefined || treeNode.pId == '' || treeNode.pId == '-1' || treeNode.pId == '0'){
		        		alert('根节点不能删除');
		        		return;
		        	}
		        	if(window.confirm("你确定要删除名为：’"+treeNode.name+"'的项目吗？")){
		        		if(_this.deleteNodeCallBack){
		        			canDelete = _this.deleteNodeCallBack.call(this,treeNode);
		        		}
	        			self.deleteItems( treeNode);
	        			var parentNode = treeNode.getParentNode();
	        			zTree.removeNode(treeNode);
	        			self.refreshTree(parentNode);
		           }
		        	else return false;
		        } else if (key == "create") {//创建根节点保存
					var newRecord= _this.itemStore.getNewRecord();
					//var newItemCode=ai.getNewCode(_this.itemStore,_this.child_field,_this.parent_code+"-");
					//newRecord.set(_this.child_field,newItemCode);
					newRecord.set(_this.parent_field,'');
					//支持回调函数,可增加保存其他属性
					if(_this.createNodeStoreHandle){
						_this.createNodeStoreHandle.call(this,newRecord);
					}
					var newCount = 1;
					if (!zTree){
						newCount = 1;
					}else{
						//var nodes =  zTree.getNodes();
						//if (nodes.length>0) newCount = nodes.length + 1
						//else newCount = 1
						var newItemCode=ai.getNewCode(_this.itemStore,_this.child_field,"other_");
            newCount = newItemCode.replace("other_","");
					}
					newRecord.set(_this.child_field,'other_'+newCount);
					newRecord.set(_this.seq_field,newCount);
					newRecord.set(_this.title_field,_this.parent_code+"_"+newCount);
					//newRecord.set(table_key,ai.guid());
					var key = uuid();
					newRecord.set(_this.table_key,key);
					_this.itemStore.add(newRecord);
					_this.itemStore.commit();
					_this.itemStore.curRecord = newRecord;
					zTree.addNodes(null, {id:newRecord.get(_this.child_field), pId:0, name:newRecord.get(_this.title_field),key:key});
					var tempNode = zTree.getNodeByParam("key", key, null);
					zTree.editName(tempNode);	            
		        } else if (key == "createItem") {//创建子节点保存
					var newRecord= _this.itemStore.getNewRecord();
					var newItemCode=ai.getNewCode(_this.itemStore,_this.child_field,treeNode.id+"-");
					newRecord.set(_this.child_field,newItemCode);
					newRecord.set(_this.parent_field,treeNode.id);
					var newCount = 1;
					if (treeNode.isParent) newCount = treeNode.children.length + 1;
					newRecord.set(_this.title_field,treeNode.name+"_"+newCount);
					newRecord.set(_this.seq_field,newCount);
					newRecord.set(_this.menu_type,treeNode.type);
					//支持回调函数,可增加保存其他属性
					if(_this.createNodeStoreHandle){
						_this.createNodeStoreHandle.call(this,newRecord);
					}
					//newRecord.set(table_key,ai.guid());
					var key = uuid();
					newRecord.set(_this.table_key,key);
					_this.itemStore.add(newRecord);
					_this.itemStore.commit();
					_this.itemStore.curRecord = newRecord;
					zTree.addNodes(treeNode, {id:newRecord.get(_this.child_field), pId:treeNode.id, name:newRecord.get(_this.title_field),key:key,type:treeNode.type});
					var tempNode = zTree.getNodeByParam("key", key, null);
					zTree.editName(tempNode);	
		        }
		    };
		    
		    ///树的绑定
		    $.contextMenu({
		        zIndex: 9999,
		        selector: ".curSelectedNode",
		        className: ".menufolder",
		        callback: function(key, options) {
		            treeNodeAction(key);
		        },
		        items:_this.treeOperations||{
		        	"rname":{name: '重命名', className: "rname", icon: "pencil", accesskey: "r"}, 
		        	"remove":{name: '删除', className: "remove", icon: "trash", accesskey: "d"}, 
		        	"edit":{name: '编辑', className: "edit", icon: "edit", accesskey: "e"}, 
		        	"sep1": "--------", 
		        	"create":{name: "创建根节点", className: "create", icon: "create", accesskey: "c"}, 
		        	"createItem":{name: "创建子节点", className: "createItem", icon: "createItem", accesskey: "s",disabled:function(key, opt){
		        		//debugger;
	                    var node =zTree.getSelectedNodes();
	                    if (_this.max_level>0){
	                    	if(node[0].level>=(_this.max_level-1)){
		                        return true;
		                    } 
	                    }
	                }}, 
		        	"sep2": "--------", 
		        	"info":{name: "查看", className: "info", icon: "info", accesskey: "i"} 
		        }
		    });
		    
		    $("html").bind("click", function() {
		    	$('.context-menu-list').filter(':visible').trigger('contextmenu:hide');
		    });
		  }
		
	});