/* =========================================================
 * bootstrap-treeview.js v1.0.0
 * =========================================================
 * Copyright 2013 Jonathan Miles 
 * Project URL : http://www.jondmiles.com/bootstrap-treeview
 *	
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

;(function($, window, document, undefined) {

	/*global jQuery, console*/

	'use strict';

	var pluginName = 'treeview';

	var Tree = function(element, options) {

		this.$element = $(element);
		this._element = element;
		this._elementId = this._element.id;
		this._styleId = this._elementId + '-style';

		this.tree = [];
		this.nodes = [];
		this.selectedNode = {};
		
		this._init(options);
	};

	Tree.defaults = {

		injectStyle: true,

		levels: 2,

		expandIcon: 'glyphicon glyphicon-plus',
		collapseIcon: 'glyphicon glyphicon-minus',
		emptyIcon: 'glyphicon',
		nodeIcon: 'glyphicon glyphicon-stop',

		color: undefined, // '#000000',
		backColor: undefined, // '#FFFFFF',
		borderColor: undefined, // '#dddddd',
		onhoverColor: '#F5F5F5',
		selectedColor: '#FFFFFF',
		selectedBackColor: '#428bca',

		enableLinks: false,
		highlightSelected: true,
		showBorder: true,
		showTags: false,

		// Event handler for when a node is selected
		onNodeSelected: undefined
	};

	Tree.prototype = {

		remove: function() {

			this._destroy();
			$.removeData(this, 'plugin_' + pluginName);
			$('#' + this._styleId).remove();
		},

		_destroy: function() {

			if (this.initialized) {
				this.$wrapper.remove();
				this.$wrapper = null;

				// Switch off events
				this._unsubscribeEvents();
			}

			// Reset initialized flag
			this.initialized = false;
		},
	   _getGroupTreeData:function(_config){
	  
		var groupfields=_config.groupfield?_config.groupfield.split(','):[];
		var titlefields=_config.titlefield?_config.titlefield.split(','):[];
		// var _store=ai.getJsonStore(_config.sql);
		var _store=_config.store;
		if(!_store && _config.sql){
		 	var _store = new AI.JsonStore({
		 			 dataSource:_config.dataSource,
               		 sql:_config.sql,
                		 pageSize:-1
         	});
       };
      	 var treeData=[];
      	 
		  var levelCateNode={};
		 function loopCateLeveTree(levelTreeNode,fieldSeq){
		 	   if(fieldSeq>=groupfields.length) return;
 
		 	   var levelCateNode={};
		 	  for(var i=0;i<levelTreeNode.collects.length;i++){
		 	  	   var item=levelTreeNode.collects[i];
		 	  	  var cateCode=item[groupfields[fieldSeq]]||'未知';
		 	      var cateName=item[groupfields[fieldSeq]]||'未知';
		 	      if(titlefields.length>=groupfields.length){
          	 		cateName = item[titlefields[fieldSeq]]||'未知';
          	 }
		 	      var cateNode=levelCateNode[cateCode];
		 	      if(!cateNode){
          	    var cateNode={id:levelTreeNode.id+'>'+groupfields[fieldSeq]+":"+cateCode,text:cateName,collects:[],num:0,nodes:[]};
          	    levelCateNode[cateCode]=cateNode;
          	     levelTreeNode.nodes.push(cateNode);
          	  }
          	  cateNode.collects.push(item);
          	  cateNode.num+=item['NUM']||1  
		 	  };
		 	  var nextFieldSeq = fieldSeq+1;
		 	  for(var i=0;i<levelTreeNode.nodes.length;i++){
		 	  	  var cateNode = levelTreeNode.nodes[i];
		 	  	   cateNode.tags=[cateNode.num+""];
		 	  	  loopCateLeveTree(cateNode, nextFieldSeq);
		 	  };
		};
		 for(var i=0;i<_store.getCount();i++){
          	 var r=_store.getAt(i);
           
          	 var cateCode=r.get(groupfields[0])||'未知';
          	 var cateName=r.get(groupfields[0])||'未知';
          	 if(titlefields.length>=groupfields.length){
          	 		cateName = r.get(titlefields[0])||'未知';
          	 }
          	 
          	 var cateNode=levelCateNode[cateCode];
          	 if(!cateNode){
          	 	
          	    var cateNode={id:groupfields[0]+":"+cateCode,text:cateName,collects:[],num:0,nodes:[]};
          	    levelCateNode[cateCode]=cateNode;
          	     treeData.push(cateNode);
          	  }
          	  cateNode.collects.push(r.data);
          	  cateNode.num+=r.get('NUM')||1
        }
         for(var i=0;i<treeData.length;i++){
         	  var cateNode = treeData[i];
         	  treeData[i].tags=[treeData[i].num+""];
		 	  loopCateLeveTree(cateNode, 1);
        }
        
       return treeData; 
      },
      _getSimpleTreeData:function(cfg){
      	 var _store;
      	 if(cfg.store) _store = cfg.store
      	  else _store=ai.getJsonStore(cfg.sql);
      	  var treeData=[];
      	   
      	  function getChilds(pNode,level,parentValue){
  	
  						if(parentValue=='null')parentValue=''
  						else if(!parentValue) parentValue=pNode.id;
  						  	
  						for(var i=0,cnt=_store.getCount();i<cnt;i+=1){
  						  var r=_store.getAt(i);
  						 
  						  if(r.get( cfg.pkeyfield)!=parentValue) continue;
  						  var node={id:r.get(cfg.keyfield), text:r.get(cfg.titlefield),icon:''};
  						  if(!pNode.tags) pNode.tags=0; 
  						  pNode.tags++;
  						  if(!pNode.nodes) pNode.nodes=[];
  						  pNode.nodes.push(node);
						  getChilds(node,level++,node.id);  
  					   }
        };
        
        var rootval=cfg.rootval||"";
        for(var i=0;i<_store.getCount();i++){
          	 var r=_store.getAt(i);
          	 if((rootval && r.get(cfg.pkeyfield)==rootval) || (!rootval && !r.get(cfg.pkeyfield))){
          	    var node={id:r.get(cfg.keyfield), text:r.get(cfg.titlefield),icon:'fa fa-gears'};
          	    treeData.push(node);
          	   
          	    getChilds(node,1,node.id);
          	 }
          }; 
          
         
          return treeData;
      	    
      },
		_init: function(options) {
		   
		   if(options.subtype=='simpletree' && (options.sql||options.store)){
		   	   options.data=this._getSimpleTreeData(options);
		  }else  if(options.subtype=='grouptree'&& options.sql ){
		  	  options.data=this._getGroupTreeData(options); 
		  	 
		  }
		 if (options.data) {
				if (typeof options.data === 'string') {
					options.data = $.parseJSON(options.data);
				}
				this.tree = $.extend(true, [], options.data);
				delete options.data;
			}
          
			this.options = $.extend({}, Tree.defaults, options);

			this._setInitialLevels(this.tree, 0);

			this._destroy();
			this._subscribeEvents();
			this._render();
		},

		_unsubscribeEvents: function() {

			this.$element.off('click');
		},

		_subscribeEvents: function() {

			this._unsubscribeEvents();

			this.$element.on('click', $.proxy(this._clickHandler, this));

			if (typeof (this.options.onNodeSelected) === 'function') {
				this.$element.on('nodeSelected', this.options.onNodeSelected);
			}
		},

		_clickHandler: function(event) {

			if (!this.options.enableLinks) { event.preventDefault(); }
			
			var target = $(event.target),
				classList = target.attr('class') ? target.attr('class').split(' ') : [],
				node = this._findNode(target);
			 
			if ((classList.indexOf('click-expand') != -1) ||
					(classList.indexOf('click-collapse') != -1)) {
				// Expand or collapse node by toggling child node visibility
				this._toggleNodes(node);
				this._render();
			}
			else if (node) {
				if (this._isSelectable(node)) {
					this._setSelectedNode(node);
				} else {
					this._toggleNodes(node);
					this._render();
				}
			}
		},

		// Looks up the DOM for the closest parent list item to retrieve the 
		// data attribute nodeid, which is used to lookup the node in the flattened structure.
		_findNode: function(target) {

			var nodeId = target.closest('li.list-group-item').attr('data-nodeid'),
				node = this.nodes[nodeId];

			if (!node) {
				console.log('Error: node does not exist');
			}
			return node;
		},

		// Actually triggers the nodeSelected event
		_triggerNodeSelectedEvent: function(node) {

			this.$element.trigger('nodeSelected', [$.extend(true, {}, node)]);
		},

		// Handles selecting and unselecting of nodes, 
		// as well as determining whether or not to trigger the nodeSelected event
		_setSelectedNode: function(node) {

			if (!node) { return; }
			
			if (node === this.selectedNode) {
				this.selectedNode = {};
			}
			else {
				this._triggerNodeSelectedEvent(this.selectedNode = node);
			}
			
			this._render();
		},

		// On initialization recurses the entire tree structure 
		// setting expanded / collapsed states based on initial levels
		_setInitialLevels: function(nodes, level) {

			if (!nodes) { return; }
			level += 1;

			var self = this;
			$.each(nodes, function addNodes(id, node) {
				
				if (level >= self.options.levels) {
					self._toggleNodes(node);
				}

				// Need to traverse both nodes and _nodes to ensure 
				// all levels collapsed beyond levels
				var nodes = node.nodes ? node.nodes : node._nodes ? node._nodes : undefined;
				if (nodes) {
					return self._setInitialLevels(nodes, level);
				}
			});
		},

		// Toggle renaming nodes -> _nodes, _nodes -> nodes
		// to simulate expanding or collapsing a node.
		_toggleNodes: function(node) {

			if (!node.nodes && !node._nodes) {
				return;
			}

			if (node.nodes) {
				node._nodes = node.nodes;
				delete node.nodes;
			}
			else {
				node.nodes = node._nodes;
				delete node._nodes;
			}
		},

		// Returns true if the node is selectable in the tree
		_isSelectable: function (node) {
			return node.selectable !== false;
		},

		_render: function() {

			var self = this;

			if (!self.initialized) {

				// Setup first time only components
				self.$element.addClass(pluginName);
				self.$wrapper = $(self._template.list);

				self._injectStyle();
				
				self.initialized = true;
			}

			self.$element.empty().append(self.$wrapper.empty());

			// Build tree
			self.nodes = [];
			self._buildTree(self.tree, 0);
		},

		// Starting from the root node, and recursing down the 
		// structure we build the tree one node at a time
		_buildTree: function(nodes, level) {

			if (!nodes) { return; }
			level += 1;

			var self = this;
			$.each(nodes, function addNodes(id, node) {

				node.nodeId = self.nodes.length;
				self.nodes.push(node);

				var treeItem = $(self._template.item)
					.addClass('node-' + self._elementId)
					.addClass((node === self.selectedNode) ? 'node-selected' : '')
					.attr('data-nodeid', node.nodeId)
					.attr('data-itemid', node.id)
					.attr('style', self._buildStyleOverride(node));

				// Add indent/spacer to mimic tree structure
				for (var i = 0; i < (level - 1); i++) {
					treeItem.append(self._template.indent);
				}

				// Add expand, collapse or empty spacer icons 
				// to facilitate tree structure navigation
				if (node._nodes) {
					treeItem
						.append($(self._template.expandCollapseIcon)
							.addClass('click-expand')
							.addClass(self.options.expandIcon)
						);
				}
				else if (node.nodes&&node.nodes.length>0) {
					treeItem
						.append($(self._template.expandCollapseIcon)
							.addClass('click-collapse')
							.addClass(self.options.collapseIcon)
						);
				}
				else {
					treeItem
						.append($(self._template.expandCollapseIcon)
							.addClass(self.options.emptyIcon)
						);
				}

				// Add node icon
				treeItem
					.append($(self._template.icon)
						.addClass(node.icon ? node.icon : self.options.nodeIcon)
					);

				/*
				 *控制缩进
				 *实现自定义render
				 */
				node.shownText=node.text;
				var shorten = function(text,maxLength){
					var m = maxLength||4;
					return text&&text.length>(m+1)?(text.slice(0,m)+"..."):text;
				};
				if(self.options.maxLength){
					node.shownText=shorten(node.text,self.options.maxLength);
				}
				if(self.options.renderer){
					if(typeof self.options.renderer=='string'){
						node.shownText=self.options.renderer;
					}else if(typeof self.options.renderer=='function'){
						node.shownText=self.options.renderer(node.text, node);
					}
				}

				// Add text
				if (self.options.enableLinks) {
					// Add hyperlink
					treeItem
						.append($(self._template.link)
							.attr('href', node.href)
							.append(node.shownText)
						);
						if(node.text&&self.options.maxLength
							&&node.text.length>self.options.maxLength){
							$(self._template.link)
							.attr('title', node.text);
						}
				}
				else {
					// otherwise just text
					treeItem
						.append(node.shownText);
					if(node.text&&self.options.maxLength
						&&node.text.length>self.options.maxLength){
							treeItem.attr('title', node.text);
						}
				}

				// Add tags as badges
				if (self.options.showTags && node.tags) {
					$.each(node.tags, function addTag(id, tag) {
						treeItem
							.append($(self._template.badge)
								.append(tag)
							);
					});
				}

				// Add item to the tree
				self.$wrapper.append(treeItem);

				// Recursively add child ndoes
				if (node.nodes) {
					return self._buildTree(node.nodes, level);
				}
			});
		},

		// Define any node level style override for
		// 1. selectedNode
		// 2. node|data assigned color overrides
		_buildStyleOverride: function(node) {

			var style = '';
			if (this.options.highlightSelected && (node === this.selectedNode)) {
				style += 'color:' + this.options.selectedColor + ';';
			}
			else if (node.color) {
				style += 'color:' + node.color + ';';
			}

			if (this.options.highlightSelected && (node === this.selectedNode)) {
				style += 'background-color:' + this.options.selectedBackColor + ';';
			}
			else if (node.backColor) {
				style += 'background-color:' + node.backColor + ';';
			}

			return style;
		},

		// Add inline style into head 
		_injectStyle: function() {

			if (this.options.injectStyle && !document.getElementById(this._styleId)) {
				$('<style type="text/css" id="' + this._styleId + '"> ' + this._buildStyle() + ' </style>').appendTo('head');
			}
		},

		// Construct trees style based on user options
		_buildStyle: function() {

			var style = '.node-' + this._elementId + '{';
			if (this.options.color) {
				style += 'color:' + this.options.color + ';';
			}
			if (this.options.backColor) {
				style += 'background-color:' + this.options.backColor + ';';
			}
			if (!this.options.showBorder) {
				style += 'border:none;';
			}
			else if (this.options.borderColor) {
				style += 'border:1px solid ' + this.options.borderColor + ';';
			}
			style += '}';

			if (this.options.onhoverColor) {
				style += '.node-' + this._elementId + ':hover{' +
				'background-color:' + this.options.onhoverColor + ';' +
				'}';
			}

			return this._css + style;
		},

		_template: {
			list: '<ul class="list-group"></ul>',
			item: '<li class="list-group-item"></li>',
			indent: '<span class="indent"></span>',
			expandCollapseIcon: '<span class="expand-collapse"></span>',
			icon: '<span class="icon"></span>',
			link: '<a href="#" style="color:inherit;"></a>',
			badge: '<span class="badge"></span>'
		},

		_css: '.list-group-item{cursor:pointer;}span.indent{margin-left:10px;margin-right:10px}span.expand-collapse{width:1rem;height:1rem}span.icon{margin-left:10px;margin-right:5px}'
		// _css: '.list-group-item{cursor:pointer;}.list-group-item:hover{background-color:#f5f5f5;}span.indent{margin-left:10px;margin-right:10px}span.icon{margin-right:5px}'

	};

	var logError = function(message) {
        if(window.console) {
            window.console.error(message);
        }
    };

	// Prevent against multiple instantiations,
	// handle updates and method calls
	$.fn[pluginName] = function(options, args) {
		return this.each(function() {
			var self = $.data(this, 'plugin_' + pluginName);
			if (typeof options === 'string') {
				if (!self) {
					logError('Not initialized, can not call method : ' + options);
				}
				else if (!$.isFunction(self[options]) || options.charAt(0) === '_') {
					logError('No such method : ' + options);
				}
				else {
					if (typeof args === 'string') {
						args = [args];
					}
					self[options].apply(self, args);
				}
			}
			else {
				if (!self) {
					$.data(this, 'plugin_' + pluginName, new Tree(this, $.extend(true, {}, options)));
				}
				else {
					self._init(options);
				}
			}
		});
	};

})(jQuery, window, document);


/**
 * 树形表格组件
 *
 *     参数说明：
 *         id           : TreeGrid对象ID
 *         width        : 宽度
 *         renderTo     : TreeGrid父容器ID
 *         headerAlign  : 表头内容位置，"left"，"right"，"center"
 *         headerHeight : 表头高度
 *         dataAlign    : 表格数据内容位置"left"，"right"，"center"
 *         itemClick    : 单元格点击事件,参数(id, index, data)
 *         showcheck    : 是否显示行选择框true,false
 *         columns      : 表格列配置项
 *         keyfield     : 二级主键字段
 *         pkeyfield    : 一级主键
 *         titlefield   : 对应主键字段的显示字段
 *         store        : 定义表格数据的来源
 *         subtype      : treegrid,grouptree,grouptreegrid,jsontreegrid
 *     column参数说明：
 *         headerText  : 表头名称
 *         dataField   : 字段名称
 *         headerAlign : 表头内容位置，"left"，"right"，"center"
 *         width       : 列宽度
 *         dataAlign   : 列数据位置
 *         handler     : 自定义Render函数
 *     使用参考例子：
 *     var TreeGrid = new TreeGrid({
 *         {id : "ruleinfo",
 *         width : "900",
 *         renderTo : "rulecfginfo",
 *         headerAlign : "left",
 *         headerHeight : "30",
 *         dataAlign : "left",
 *         indentation : "8",
 *         hoverRowBackground : "true",
 *         folderColumnIndex : "0",
 *         itemClick : this.itemClickEvent,
 *         showcheck:true,
 *         columns : [ 			
 *             {headerText : "名称", dataField : "RULENAME", headerAlign : "center", width : "120", dataAlign : "center",handler:function(row, col){
 *             	return "";
 *             }}, 
 *             {headerText : "操作", dataField : "ACT", headerAlign : "center", width : "100", dataAlign : "center" },												
 *             {headerText : "规则配置", dataField : "RULECFG", headerAlign : "center", dataAlign : "center", width : "350"}
 *         ],
 *         keyfield : "RULECODE",
 *         pkeyfield : "PARENTCODE",
 *         titlefield : "RULENAME",
 *         iconfield : "",
 *         store:null,
 *         subtype : 'treegrid'
 *         }
 *     });
 */
TreeGrid = function(_config){
	 
	_config = _config || {};
	
	var s = "";
	var rownum = 0;
	var __root;
	
	var __selectedData = null;
	var __selectedId = null;
	var __selectedIndex = null;

	var folderOpenIcon = (_config.folderOpenIcon || TreeGrid.FOLDER_OPEN_ICON);
	var folderCloseIcon = (_config.folderCloseIcon || TreeGrid.FOLDER_CLOSE_ICON);
	var defaultLeafIcon = (_config.defaultLeafIcon || TreeGrid.DEFAULT_LEAF_ICON);
	

	/**
  * 分组表格数据结算
  */
	 _getGroupTreeData=function(){
		var groupfields=_config.groupfield.split(',');
		// var _store=ai.getJsonStore(_config.sql);
		var _store = _config.store;
		if(!_store){
		   _store = new AI.JsonStore({
                sql:_config.sql,
                pageSize:-1
         });
       };
    
      	 var treeData=[];
      	 
		  var levelCateNode={};
		 function loopCateLeveTree(levelTreeNode,fieldSeq){
		 	   if(fieldSeq>=groupfields.length) return;
		 	   console.log(fieldSeq);
		 	   var levelCateNode={};
		 	  for(var i=0;i<levelTreeNode.collects.length;i++){
		 	  	   var item=levelTreeNode.collects[i];
		 	      var cateName=item[groupfields[fieldSeq]]||'未知';
		 	      var cateNode=levelCateNode[cateName];
		 	      if(!cateNode){
          	    var cateNode={indexName:cateName,collects:[],num:0,children:[]};
          	    levelCateNode[cateName]=cateNode;
          	     levelTreeNode.children.push(cateNode);
          	  }
          	  cateNode.collects.push(item);
          	  cateNode.num+=item['NUM']||1  
		 	  };
		 	  var nextFieldSeq = fieldSeq+1;
		 	  for(var i=0;i<levelTreeNode.children.length;i++){
		 	  	  var cateNode = levelTreeNode.children[i];
		 	  	  loopCateLeveTree(cateNode, nextFieldSeq);
		 	  };
		};
		 for(var i=0;i<_store.getCount();i++){
          	 var r=_store.getAt(i);
           
          	 var cateName=r.get(groupfields[0])||'未知';
          	 
          	 var cateNode=levelCateNode[cateName];
          	 if(!cateNode){
          	 	
          	    var cateNode={indexName:cateName,collects:[],num:0,children:[]};
          	    levelCateNode[cateName]=cateNode;
          	     treeData.push(cateNode);
          	  }
          	  cateNode.collects.push(r.data);
          	  cateNode.num+=r.get('NUM')||1
        }
         for(var i=0;i<treeData.length;i++){
         	  var cateNode = treeData[i];
		 	  loopCateLeveTree(cateNode, 1);
        }
        _config.data=treeData;
         
  };
   /**
  * 计算扁平数据到树状结构数据
  */
     _getTreeGridData=function(){
     	 var _store=_config.store;
     	 if(!_store)   _store=ai.getJsonStore(_config.sql);
      	   
      	  var treeData=[];
      	   
      	  function getChilds(pNode,level,parentValue){
  	
  						if(parentValue=='null')parentValue=''
  						else if(!parentValue) parentValue=pNode.id;
  						  	
  						for(var i=0,cnt=_store.getCount();i<cnt;i+=1){
  						  var r=_store.getAt(i);
  						  if(r.get( _config.pkeyfield)!=parentValue) continue;
  						  var node=r.data;
  						  node.id=r.get(_config.keyfield);
  						  node.text=r.get(_config.titlefield);
  						  if(_config.iconfield) node.icon=r.get(_config.iconfield);
  						 
  						  if(!pNode.children) pNode.children=[];
  						  pNode.children.push(node);
						  getChilds(node,level++,node.id);  
  					   }
        };
        
        var rootval=_config.rootval||"";
        for(var i=0;i<_store.getCount();i++){
          	 var r=_store.getAt(i);
          	 if((rootval && r.get(_config.pkeyfield)==rootval) || (!rootval && !r.get(_config.pkeyfield))){
          	    //var node={id:r.get(_config.keyfield), text:r.get(_config.titlefield),icon:'fa fa-gears'};
//          	     var node=r.data;
          		var node = $.extend(true,{},  r.data );
  					  node.id=r.get(_config.keyfield);
  					  node.text=r.get(_config.titlefield);
  					  if(_config.iconfield) node.icon=r.get(_config.iconfield);
  						 
          	     treeData.push(node);
          	   
          	    getChilds(node,1,node.id);
          	 }
          }; 
          
          _config.data=treeData;
      	    
      };
    /**
  	* 计算扁平数据到树状结构数据
  	*/
  	_getGroupTreeGridData=function(){
  	var codemap={};
	var code=0;
	var sql=_config.sql;
	if(!_config.groupfields){alert('必须配置:groupfields,eg:field,filed2');return;};
	var groupfields=_config.groupfields.split(",");
	var leaveFieldName = groupfields[groupfields.length-1];
	//修改支持传入store和datasource参数
	//var tmpstore = ai.getJsonStore(sql);
	var tmpstore=_config.store;
  if (!tmpstore) {
  	var dataSource = _config.dataSource;
	  if (dataSource){
	  	tmpstore=ai.getJsonStore(sql,dataSource);
	  }
	  else {
	  	tmpstore=ai.getJsonStore(sql);
	  }
	}
	
	function getJoinLevelFieldVal(joinlevel,record){
		 	var val="",parentVal="",result="";
		 	for(var i=0;i<=joinlevel;i++){
		 		val+=record.get(groupfields[i])+"-";
		  
		 		if(i>0) parentVal+=record.get(groupfields[i-1])+"-";
		 	};
		 	result = codemap[val];
		 	if(!result){
				code++;
				codemap[val]=code;
				result=code;
				var r=tmpstore.getNewRecord();
				r.set('ITEMID',code+"");
				r.set('TYPE','DYGROUPROW');
				r.set('TITLE',record.get(groupfields[joinlevel])+"");
				if(joinlevel>0) r.set('PARENTCODE',codemap[parentVal]+"");
				console.log("add:,"+val+",code:"+code+",title:"+record.get(groupfields[joinlevel])+",parnet:"+codemap[parentVal]);
				console.log(r.data);
				tmpstore.add(r);
			}
			return result;
	};
	var gerGroupRow=function(level){
		
		for(var i=0;i<tmpstore.getCount();i++){
			var r=tmpstore.getAt(i);
			if(r.get('TYPE')=='DYGROUPROW')continue;
			var rowval = getJoinLevelFieldVal(level,r);
			
		}
	};
 
	for(var level=0;level<groupfields.length;level++){
		gerGroupRow(level);
	};
 	for(var i=0;i<tmpstore.getCount();i++){
		var r=tmpstore.getAt(i);
		if(r.get('TYPE')=='DYGROUPROW')continue;
		r.set('ITEMID',r.get('OBJ_PHY_SEQ'));
		console.log(r.get('OBJ_PHY_SEQ'));
		r.set('TITLE',r.get(leaveFieldName));
		r.set('PARENTCODE',getJoinLevelFieldVal(groupfields.length-1,r));
	 
	};
	_getTreeGridByJson(tmpstore.root);
  };
    /**
  	* 从json数据获取树状结构数据
  	*/
     _getTreeGridByJson=function(jsonData){
      	 
      	   
      	  var treeData=[];
      	   
      	  function getChilds(pNode,level,parentValue){
  	
  						if(parentValue=='null')parentValue=''
  						else if(!parentValue) parentValue=pNode.id;
  						  	
  						for(var i=0,cnt=jsonData.length;i<cnt;i+=1){
  						  var r=jsonData[i];
  						  if(r[ _config.pkeyfield]!=parentValue) continue;
  						  var node=r;
  						  node.id=r[_config.keyfield];
  						  node.text=r[_config.titlefield];
  						  if(_config.iconfield) node.icon=r[_config.iconfield];
  						 
  						  if(!pNode.children) pNode.children=[];
  						  pNode.children.push(node);
						  getChilds(node,level++,node.id);  
  					   }
        };
        
        var rootval=_config.rootval||"";
        for(var i=0;i<jsonData.length;i++){
          	 var r=jsonData[i];
          	 if((rootval && r[_config.pkeyfield]==rootval) || (!rootval && !r[_config.pkeyfield])){
          	    //var node={id:r.get(_config.keyfield), text:r.get(_config.titlefield),icon:'fa fa-gears'};
          	     var node=r;
  					  node.id=r[_config.keyfield];
  					  node.text=r[_config.titlefield];
  					  if(_config.iconfield) node.icon=r[_config.iconfield];
  						 
          	     treeData.push(node);
          	   
          	    getChilds(node,1,node.id);
          	 }
          }; 
          
          _config.data=treeData;
      	    
      };
    
	/**
  * 显示表头行
  */
	drowHeader = function(){
		s += "<tr class='header' height='" + (_config.headerHeight || "25") + "'>";
		if(_config.showcheck){
			s +="<td align='center' width='20px'></td>";
		}
		var cols = _config.columns;
		for(i=0;i<cols.length;i++){
			var col = cols[i];
			s += "<td align='" + (col.headerAlign || _config.headerAlign || "center") + "' width='" + (col.width || "") + "'  dataField='"+col.dataField+"'>" + (col.headerText || "") + "</td>";
		}
		s += "</tr>";
	};
	
	/**
  * 递归显示所有数据行
  */
	drowData = function(){
		var rows = _config.data;
		var cols = _config.columns;
		drowRowData(rows, cols, 1, _config.renderTo);
	};
	
	/**
  * 显示行数据,局部变量i、j必须要用 var 来声明，否则，后续的数据无法正常显示
  * @param  _rows 节点数据
  * @param  _cols 字段列表
  * @param  _level 节点层级
  * @param  _pid 上级节点id
  */
	drowRowData = function(_rows, _cols, _level, _pid){
		var folderColumnIndex = (_config.folderColumnIndex || 0);

		for(var i=0;i<_rows.length;i++){
			var id = _pid + "_" + i; //行id
			var row = _rows[i];
		 
				var newobj={};
				for(var key in row){
				if(row[key] && row[key].length>32){
					 newobj[key]="";
				} 
				else newobj[key]=row[key];
			};
	 
			s += "<tr id='TR" + id + "' pid='" + ((_pid=="")?"":("TR"+_pid)) + "' expand='Y' data=\""+TreeGrid.json2str(newobj).replaceAll('"',"\\\'")+"\" rowIndex='" + rownum + "'>";
			if(_config.showcheck){
				s +="<td align='center' width='20px'><input type='checkbox'  class='treegrid_check' /></td>";
			}
			for(var j=0;j<_cols.length;j++){
				var col = _cols[j];
				s += "<td align='" + (col.dataAlign || _config.dataAlign || "left") + "' dataField='"+col.dataField+"'";

				//层次缩进
				if(j==folderColumnIndex){
					s += " style='text-indent:" + (parseInt((_config.indentation || "20"))*(_level-1)) + "px;'> ";
				}else{
					s += ">";
				}

				//节点图标
				if(j==folderColumnIndex){
					if(row.children){ //有下级数据
						//s += "<img folder='Y' trid='TR" + id + "' src='" + folderOpenIcon + "' class='image_hand'>";
						s +='<a href="javascript:void(0);" ><i trid="TR' + id +'" class="expand glyphicon glyphicon-unchecked"></i></a>'
					}else{
						s += '<i class="glyphicon glyphicon-user"></i>';
					}
				}
				
				//单元格内容
				if(col.editable){
					buildEditField(row,col);
				}else if(col.handler){
					s += col.handler(  row, col) || "" + "</td>";
				}else{
					s += (row[col.dataField] || "") + "</td>";
				}
			}
			s += "</tr>";
			 
			//递归显示下级数据
			if(row.children){
		 		drowRowData(row.children, _cols, _level+1, id);
			}
		}
	};
	/**
  * 创建可编辑的文本框
  * @param  row 节点数据
  * @param  col 字段名称
  */
	buildEditField=function(row,col){
		if(!row[_config.pkeyfield]) return;
		s +='<input type="text" id="'+(row[_config.keyfield]||"")+col.dataField+'" style="float:'+(col.dataAlign||"left")+';width:'+(col.width||120)+'px" keyField="'+(getStoreKeyValue(row)||"")+'" dataField="'+col.dataField+'" value="'+(row[col.dataField]||"")+'">';
	};
	/**
  * 获取store的键值
  * @param  row 节点数据
  */
	getStoreKeyValue = function(row){
		var _storeKey = _config.store.key;
		if(!_storeKey) return;
		var _storeKeys = _storeKey.split(",");
		var _storeKeyValue ="";
		for(var i=0;i<_storeKeys.length;i++){
			if(i==0){
				_storeKeyValue=row[_storeKeys[i]];
			}else{
				_storeKeyValue+=","+row[_storeKeys[i]];
			}
		}
		return _storeKeyValue;
	};
	
	/**
  * 组件显示处理(主函数)
  */
	this.show = function(){
		  if(_config.subtype=='grouptree' ) _getGroupTreeData()
		  else if(_config.subtype=='grouptreegrid' && _config.sql) _getGroupTreeGridData()
		  else if(_config.subtype=="jsontreegrid" && _config.data) _getTreeGridByJson(_config.data) 
         else if(_config.sql || _config.store)  _getTreeGridData();
       	
		this.id = _config.id || ("TreeGrid" + TreeGrid.COUNT++);

		s += "<table id='" + this.id + "' cellspacing=0 cellpadding=0 width='" + (_config.width || "100%") + "' class='TreeGrid table'>";
		drowHeader();
		drowData();
		s += "</table>";
		
		__root = jQuery("#"+_config.renderTo);
		__root.append(s);
		
		//初始化动作
		init();
	};
	/**
  * 获取所有选中的行数据
  * @returns  选中的数据数组
  */
    this.getAllCheck=function(){
    	var checks =  jQuery("#" + this.id+" tr td input:checkbox.treegrid_check");
    	var checkArray=[];
    	for(var i=0;i<checks.length;i++){
    		if($(checks[i]).is(':checked')){
    			var _rowdata=$(checks[i]).parent().parent().attr("data");
    			var selectedData = TreeGrid.str2json(_rowdata);
    			checkArray.push(selectedData);
    		};
    	};
    	return checkArray;
    };
  /**
  * 组件初始化函数
  */
	init = function(){
		//以新背景色标识鼠标所指行
		if((_config.hoverRowBackground ) == "true"){
			__root.find("tr").hover(
				function(){
					if(jQuery(this).attr("class") && jQuery(this).attr("class") == "header") return;
					jQuery(this).addClass("row_hover");
				},
				function(){
					jQuery(this).removeClass("row_hover");
				}
			);
		}
       var self=this;
		//将单击事件绑定到tr标签
		__root.find("tr").bind("click", function(e){
			__root.find("tr").removeClass("row_active");
			jQuery(this).addClass("row_active");
			var checkElement = jQuery(this).find("td input:checkbox.treegrid_check");
			var isCheck=$(checkElement).is(':checked');
	 
			//获取当前行的数据
			__selectedData = this.data || this.getAttribute("data");
			 
			__selectedId = this.id || this.getAttribute("id");
			__selectedIndex = this.rownum || this.getAttribute("rowIndex");
			var selectedData = TreeGrid.str2json(__selectedData);
		 
			if(_config.store) {
				//_config.store.curRecord=_config.store.getRecordByKey(selectedData[_config.keyfield]);
				_config.store.curRecord=getRecordByKey(selectedData[_config.keyfield]);
 				if(_config.store.curRecord) _config.store.curRecord.isCheck=true;
			};
			if(checkElement.length>0){
				var selItem=new TreeGridItem(__root, __selectedId, __selectedIndex, TreeGrid.str2json(__selectedData));
				var parentItem=selItem.getParent();
				var times=0;
				while(parentItem.id){
					if(isCheck==true) parentItem.setCheck(true);
					parentItem=parentItem.getParent();
					times++;
					if(times>10) break;
				};
				var childrenArray = selItem.getChildren();
				 
				for(var i=0;i<childrenArray.length;i++){
					var cItem = childrenArray[i];
					cItem.setCheck(isCheck);
				};
				 
				 
			};
			//行记录单击后触发的事件
			if(_config.itemClick){
				 _config.itemClick  (__selectedId, __selectedIndex, TreeGrid.str2json(__selectedData));
			}
		});
		 
		//展开、关闭下级节点
		__root.find("tr>td>a>i.glyphicon").bind("click", function(){
			
			var trid = this.trid || this.getAttribute("trid");
			 
			var isOpen = __root.find("#" + trid).attr("expand");
			 
			isOpen = (isOpen == "Y"||isOpen == "open") ? "N" : "Y";
			__root.find("#" + trid).attr("expand", isOpen);
			showHiddenNode(trid, isOpen,__root);
		});
		var _rows = _config.data;
		var _cols = _config.columns;
		saveEditField(_rows,_cols);
	};
	/**
  * 根据主键值获取记录
  * @param  keyval 主键值
  * @returns 记录
  */
	getRecordByKey=function(keyval){
		var _store= _config.store;
		for(var i=0;i<_store.getCount();i++){
			var r=_store.getAt(i);
			if(r.get(_config.keyfield)==keyval) return r;
		};
		return null;
	};
	/**
  * 保存编辑字段值
  * @param  _rows 节点数据
  * @param  _cols 字段列表
  */
	saveEditField = function(_rows,_cols){
		
		for(var i=0;i<_rows.length;i++){
			var row = _rows[i];
			for(var j=0;j<_cols.length;j++){
				var col = _cols[j];
				if(row[_config.pkeyfield]&&col.editable){
					$('#'+row[_config.keyfield]+col.dataField,'#'+_config.renderTo).change(function(){
						var _obj = $(this);
						var _record = getRecordByKey(_obj.attr("keyField"));
						//var _record = _config.store.getRecordByKey(_obj.attr("keyField"));
						_record.set(_obj.attr("dataField"),_obj.val());
					});
				}
			}
			if(row.children){
				saveEditField(row.children, _cols);
			}
		}
	};

	/**
  * 显示或隐藏子节点数据
  * @param  _trid 子节点ID
  * @param  _open 显示或隐藏子节点标志(N:隐藏/Y:显示)
  * @param  __root 父节点
  */
	showHiddenNode = function(_trid, _open,__root){
		if(_open == "N"){ //隐藏子节点
			__root.find("#"+_trid).find("td>a>i.glyphicon").removeClass("glyphicon-unchecked").addClass("glyphicon-stop");
			//__root.find("#"+_trid).find("img[folder='Y']").attr("src", folderCloseIcon);
			__root.find("tr[id^=" + _trid + "_]").css("display", "none");
		}else{ //显示子节点
			__root.find("#"+_trid).find("td>a>i.glyphicon").removeClass("glyphicon-stop").addClass("glyphicon-unchecked");
			//__root.find("#"+_trid).find("img[folder='Y']").attr("src", folderOpenIcon);
			showSubs(_trid,__root);
		}
	};

	/**
  * 递归检查下一级节点是否需要显示
  * @param  _trid 子节点ID
  * @param  __root 父节点
  */
	showSubs = function(_trid,__root){
		var isOpen = __root.find("#" + _trid).attr("expand");
		if(isOpen == "Y"){
			var trs = __root.find("tr[pid=" + _trid + "]");
			trs.css("display", "");
			
			for(var i=0;i<trs.length;i++){
				showSubs(trs[i].id,__root);
			}
		}
	};

	/**
  * 展开或收起所有节点
  * @param  isOpen 展开或收起标志(N:收起/Y:展开)
  */
	this.expandAll = function(isOpen){
		var trs = __root.find("tr[pid='']");
		for(var i=0;i<trs.length;i++){
			var trid = trs[i].id || trs[i].getAttribute("id");
			showHiddenNode(trid, isOpen);
		}
	};
	
	/**
  * 取得当前选中的行记录
  * @returns 选中的行记录数据
  */
	this.getSelectedItem = function(){
		return new TreeGridItem(__root, __selectedId, __selectedIndex, TreeGrid.str2json(__selectedData));
	};

};

//公共静态变量
TreeGrid.FOLDER_OPEN_ICON = "images/folderOpen.gif";
TreeGrid.FOLDER_CLOSE_ICON = "images/folderClose.gif";
TreeGrid.DEFAULT_LEAF_ICON = "images/defaultLeaf.gif";
TreeGrid.COUNT = 1;

/**
* 将json对象转换成字符串
* @param  obj json对象
* @returns 转换后的字符串
*/
TreeGrid.json2str = function(obj){

	 
	var arr = [];

	var fmt = function(s){
		if(typeof s == 'object' && s != null){
			if(s.length){
				var _substr = "";
				for(var x=0;x<s.length;x++){
					if(x>0) _substr += ", ";
					_substr += TreeGrid.json2str(s[x]);
				}
				return "[" + _substr + "]";
			}else{
				return TreeGrid.json2str(s);
			}
		}
		return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
	}

	for(var i in obj){
		if(typeof obj[i] != 'object'){ //暂时不包括子数据
			arr.push(i + ":" + fmt(obj[i]));
		}
	}

	return '{' + arr.join(', ') + '}';
};
/**
* 将字符串转换成json对象
* @param  s 字符串
* @returns json对象
*/
TreeGrid.str2json = function(s){
	 
//	if(jQuery.browser.msie){
	//	json = eval("(" + s + ")");
	//}else{
		json = new Function("return " + s)();
	//}
	return json;
};

/**
* 数据行对象
* @param  _root 父节点
* @param  _rowId 行记录ID
* @param  _rowIndex 行记录索引
* @param  _rowData 行记录数据
*/
function TreeGridItem (_root, _rowId, _rowIndex, _rowData){
	var __root = _root;
	
	this.id = _rowId;
	this.index = _rowIndex;
	this.data = _rowData;
	
	this.getParent = function(){
		var pid = jQuery("#" + this.id).attr("pid");
		if(pid!=""){
			var rowIndex = jQuery("#" + pid).attr("rowIndex");
			var data = jQuery("#" + pid).attr("data");
			return new TreeGridItem(_root, pid, rowIndex, TreeGrid.str2json(data));
		}
		return null;
	}
	
	this.getChildren = function(){
		var arr = [];
		var trs = jQuery(__root).find("tr[pid='" + this.id + "']");
		for(var i=0;i<trs.length;i++){
			var tr = trs[i];
			arr.push(new TreeGridItem(__root, tr.id, tr.rowIndex, TreeGrid.str2json(jQuery(tr).attr('data'))));
		}
		return arr;
	}
	this.setCheck=function(trueOrFalse){
		var checkElement = jQuery("#" + this.id+" td input:checkbox.treegrid_check");
		if(checkElement.length>0) {
			if(trueOrFalse==true) jQuery(checkElement).prop("checked",trueOrFalse)
			else jQuery(checkElement).prop("checked",trueOrFalse);
		};
	};
};