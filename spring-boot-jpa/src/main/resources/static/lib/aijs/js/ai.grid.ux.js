/**
* Ux网格组件,除了可设置网格字段信息之外，还可以自定义工具栏，卡片或列表展现形式。
*
*     使用例子：
*     var columns=[
*         {header:'上级名称',dataIndex:'PARENTNAME', headerAlign: "center", dataAlign: "center", width: "150" ,sortable:true},
*         {header:'项目简称',dataIndex:'REF_MODELCODE', headerAlign: "center", dataAlign: "center", width: "150" ,sortable:true}
*     ];
*     var toolbarconfig=[ 
*         {type:'text',fieldLabel:'关键字',name:'QRY_KEYNAME',where:"(PRJ_NAME like '%{QRY_KEYNAME}%' )",width:120},
*         {type:'button',fieldLabel:'查询',id:"qrymetaobj",actionId:'queryMetaObj',width:120}
*     ];
*     var priList = new AI.GridUx({
*         containerId:'frame-right-main',
*         title:'帮助项目列表',
*         store:prjListStore,
*         show:true,
*         bodyHtml:'<div class="repeater-canvas col-md-12" style="padding-left:1px;padding-right:1px;height:100%;overflow:auto"></div> ',
*         card:{},
*         columns: columns,
*         toolbarconfig: toolbarconfig,
*     });
*     gridux具体参数说明：
*         containerId    : 表格容器ID
*         store          : 定义表格数据的来源
*         title          : 表格名称
*         columns        : 表格列配置项
*         card           : 卡片类型显示配置
*         toolbarconfig  : 工具栏配置项
*     column参数说明：
*         header    		 : 列名
*         dataIndex      : 对应store中的字段，注意要大写
*         headerAlign    : 表头排序方式：left，right，center
*         dataAlign      : 数据排序方式：left，right，center
*         width          : 字段显示宽度
*         sortable       : 是否允许点击排序true/false
*         render         : 自定义渲染函数
*     toolbarconfig参数说明：
*         type    			 : 目前支持类型有text,search,combox,selectlist,date,button,buttongroup,html
*         id             : html元素对应ID
*         value          : html元素当前值
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 标题
*         width          : 宽度
*         storesql       : combox,selectlist中，选择项查询语句
*         where          : 根据变量值更新where查询条件，通常与name参数配合使用
*         actionId       : button或buttongroup中设置按钮点击事件名称
*         clickfun       : 点击回调函数，可以是回调函数，也可以是‘query’字符串
*         fn             : search,button或buttongroup点击回调函数，可以是回调函数，也可以是‘query’字符串
*/
AI.GridUx = Event.$extend({
    __init__ : function(options) {
 	this.selectItems=null;
 	this._listeners={};
	//this.options= $.extend(true, this.default, options);
	this.init( options);
    },
    /**
    * 组件初始化函数
    * @param  options 组件初始化参数
    *
    *     具体参数说明：
    *         containerId    : 表格容器ID
    *         store          : 定义表格数据的来源
    *         title          : 表格名称
    *         columns        : 表格列配置项
    *         card           : 卡片类型显示配置
    *         toolbarconfig  : 工具栏配置项
    */
    init:function(options){
 	var self=this;
	this.store=options.store;
	this.queryKey = "select";
	this.sql =options.sql;
	this.preParaDataStore=options.preParaDataStore;
	this.storageView = options.storageView||true;
	this.onReady=options.onReady;
	this.showcheck=options.showcheck;
	this.selectedItems = [];//复选框选中时存放store的记录
  	var tpl=this._getTpl(options);
   	$(tpl).appendTo("#"+options.containerId);
   	
	var columns=this.columns=[]; 
	var fields=options.columns;
	if (this.showcheck == true){
	    columns.push({label:'<input class=\"datarow-check-all\" type=\"checkbox\" />',property:"_CHECKBOXID", 'sortable': false ,width:50
			  ,render:function(rowData,data){
			      return data;
			  }
			  ,titleRender:function(rowData,data){
			      return "";
			  }});
	}
	for(var i=0;i<fields.length;i++){
		var column = {label:fields[i].header,property:fields[i].dataIndex, 'sortable': fields[i].sortable ,width:fields[i].width||120,render:fields[i].render,dimStore:fields[i].dimStore,maxLength:fields[i].maxLength};
		var title = fields[i].title;
		if("undefined"!= typeof title )column.titleRender = function(rowData,data){
	    	return title;
		  };
		columns.push(column);
	};
	function dynamicDataSource(options, callback) {
	    // set options
	    var pageIndex = options.pageIndex;
	    var pageSize = options.pageSize;
	    
	    var options = {
		'pageIndex': pageIndex,
		'pageSize': pageSize,
		'sortDirection': options.sortDirection,
		'sortBy': options.sortProperty,
		'filterBy': options.filter.value || '',
		'searchBy': options.search || '',
		initSql:self.sql,
		command:"init",
		limit:options.pageSize,
		start:options.pageIndex*options.pageSize
	    };
	    
	    // call API, posting options
	    $.ajax({
		'type': 'post',
		'url': '/dacp/newrecordService',
		'data': options
	    }).done(function(data) {
		    
		var items = data.root;
		if(self.showcheck==true){
		    for(var _rowId = 0 ; _rowId < items.length; _rowId++){
			items[_rowId]["_CHECKBOXID"] = '<input type="checkbox" value="'+_rowId+'" />';
		    }
		}
		    var totalItems = data.count;
		    var totalPages = Math.ceil(totalItems / pageSize);
		    var startIndex = (pageIndex * pageSize) + 1;
		    var endIndex = (startIndex + pageSize) - 1;
		    
		    if(endIndex > items.length) {
			endIndex = items.length;
		    }
		    
		    // configure datasource
		    var dataSource = {
			'page':    pageIndex,
			'pages':   totalPages,
			'count':   totalItems,
			'start':   startIndex,
			'end':     endIndex,
			'columns': columns,
			'items':   items
		    };
		    
		    // pass the datasource back to the repeater
		    callback(dataSource);
		    bindEvent();
		});
	};
	function customColumnRenderer(helpers, callback) {
	    if($(helpers.container).hasClass("datarow")){
		// return;
	    }
	    else{ 
		$(helpers.container).addClass("datarow");
		
		// if(self.store.key) $(helpers.container).attr("id",helpers.rowData[self.store.key]);
	    }
	    //  console.log(helpers);
	    var columnName = helpers.columnAttr;
	    var rowData = helpers.rowData;
	    var column = _.find(columns, function(col){
		if(col.property == columnName){return col;}
	    });
	    var customMarkup  = helpers.item.text();
	    if(!_.isUndefined(column.titleRender)&&column.titleRender){
		helpers.item.attr('title',column.titleRender(rowData,rowData[columnName]));
	    }else{
		helpers.item.attr('title',customMarkup);
	    }
	    helpers.item.attr('dataIndex',column.property||'');
	    if(!_.isUndefined(column.render)&&column.render){
	    	var colVal = column.render(rowData,rowData[columnName],$(helpers.container));
	    	customMarkup = colVal||customMarkup;
	    }
	    if(column.maxLength&&customMarkup.length>column.maxLength){
	    	helpers.item.html(customMarkup.substr(0,column.maxLength)+"...");;
	    }
	    else{
	    	helpers.item.html(customMarkup);
	    }

	    callback();
	};
	function customRowRenderer(helpers, callback) {
	    var rowIndex = $(helpers.container).find('.datarow').size()-1;
	    var item = helpers.item;
	    item.attr('rowindex',rowIndex);
	    if(options.rowRender){
		options.rowRender(item,helpers.rowData);
	    }

	    callback();
	}
	function bindEvent(){///在渲染完重新绑定事件
	    self.control.find('.dacptiles,.datarow').off();
	    self.control.find('.dacptiles').on("click",function(e){
		$(".thumbnail .dacptiles").removeClass("selected");
		$(this).addClass("selected");
         	self.store.curRecord = self.store.getAt($(this).attr("rowindex"));
	 	self.fireEvent("click",e);
	    });

	    self.control.find('.datarow').on("click",function(e){
		$(".repeater-list tr.datarow.active").removeClass("active");
		$(this).addClass("active");
		self.store.curRecord = self.store.getAt($(this).attr("rowindex"));
		self.fireEvent("click",e);
	    });

	    self.control.find('.dacptiles,.datarow').on("dblclick",function(e){
		self.store.curRecord = self.store.getAt($(this).attr("rowindex"));
		self.fireEvent("dblclick",e);
	    });

	    self.control.find('.datarow-check-all').on("click",function(e){
		if($(this).is(":checked")){
		    self.control.find('.datarow-check').each(function(){
			if($(this).is(":checked") == false){
			    $(this).click();
			}
		    });
		}else{
		    self.selectedItems  = [];
		    self.control.find('.datarow-check').each(function(){
			$(this).attr("checked",false);
		    });
		}
	    });

	    self.control.find('.datarow-check').on("click",function(e){
		var rowindex = $(this).val() - 0;
		if($(this).is(":checked")){
		    self.selectedItems[rowindex] = self.store.getAt(rowindex);
		}else{
		    delete self.selectedItems[rowindex];
		}
	    });
	    
	};
	function staticDataSource(options,callback){
	    self.control.find('.clearfix').remove();
	    var oldsql = self.store.sql;
	    var items=[];
	    var pageIndex = options.pageIndex;
	    var pageSize = options.pageSize;
	    if(self.store.sql!=self.store.oldsql){
	  		pageIndex=0;
	  	}
	    self.store.start=pageIndex*pageSize;
	    self.store.pageSize = pageSize;
	    self.store.pageSelect();
	    self.store.oldsql = oldsql;
	    items=self.store.root;
	    if(self.showcheck==true){
		for(var _rowId = 0 ; _rowId < items.length; _rowId++){
		    items[_rowId]["_CHECKBOXID"] = '<input class="datarow-check" type="checkbox" value="'+_rowId+'" />';
		}
	    }
	    if(self.preParaDataStore) self.preParaDataStore(self.store);  
	    
	    var totalItems =self.store.totalCount;
	    var totalPages = Math.ceil(totalItems / pageSize);
	    var startIndex = (pageIndex * pageSize) + 1;
	    var endIndex = (startIndex + pageSize) - 1;
	    
	    if(endIndex > totalItems) {
		endIndex = totalItems;
	    }
	    var dataSource = {
		'page':    pageIndex,
		'pages':   totalPages,
		'count':   totalItems,
		'start':   startIndex,
		'end':     endIndex,
		'columns': columns,
		'items':   items,
		'sortBy': 'OBJNAME'
	    };
	    self.control.find('.repeater-title .total').remove();
	    self.control.find('.repeater-title').append('<b class="total">共'+totalItems+'个</b>');
	    callback(dataSource);
	    // bindEvent(options.view);  
	    if(self.onReady) self.onReady();
	};
	var cardWidth=options.card.width||200;
	var cardHeight=options.card.height||120;
	var cardTpl=options.card.tpl||"";
	var repeaterStyle='style="background: {{color}};width:'+cardWidth+'px;height:'+cardHeight+'px"';
	var repeaterConf = {
	    dataSource:options.store?staticDataSource:dynamicDataSource,
	    list_selectable:false,//'multi',//true,
	    list_columnSizing:true,
	    list_frozenColumns:0,
	    //staticHeight:500,
	    //list_infiniteScroll:true,
	    thumbnail_selectable:true,
	    list_columnRendered:customColumnRenderer,
	    list_rowRendered: customRowRenderer,
	    list_sortClearing:false,
	    thumbnail_template: '<div class="thumbnail repeater-thumbnail" >'+cardTpl+'</div>'
	};
	this.control = $('#'+options.containerId+'_myRepeater');
	var self=this;
	this.control.on('selected.fu.repeaterList', function (event,param) {
	    var items=  $(this).repeater('list_getSelectedItems');
	    self.selectItems = items;
	    self.fireEvent("click",self.selectItems);
	});	 
	this.control.on('rendered.fu.repeater', function (para1,para2) {
	    bindEvent();
	    self.fireEvent("loaded");
	});
	this.control.on('viewChanged.fu.repeater', function (currentView ) {
	    if(!self.storageView) return;
	    if($(currentView.currentTarget).attr('data-currentview')=="list"){
		localStorage.viewtype = "list";
	    }
	    else{
		localStorage.viewtype = "card";
	    }
	    // self.control.trigger("loadMetaObjRightMemu");
	});
	//查询后触发
	this.control.on('filtered.fu.repeater', function (dataSource) {
	    $(this).repeater('render');
	});
	this.control.on('pageSizeChanged.fu.repeater', function (dataSource) {
	    console.log('pageSizeChanged.fu.repeater');
	});
	this.control.repeater(repeaterConf);
	this.initDynamicToolbar(options);
//	this.initStaticToolbar(options);
	
    },
    /**
    * 动态工具栏初始化
    * @param  options 组件初始化参数
    */
    initDynamicToolbar:function(options){
	this.toolbars=new Array();
	var self = this;
	for(var i=0;i<options.toolbarconfig.length;i++){
    	    var itemConfig=options.toolbarconfig[i];
    	    itemConfig.container = $('#'+options.containerId+' .toolbar');
    	    var item = null;
    	    switch(itemConfig.type){
    	    case 'text':item = new AI.GridToolTextUx(itemConfig);break;
    	    case 'search':item = new AI.GridToolSearchUx(itemConfig);break;
    	    case 'combox':item = new AI.GridToolComboxUx(itemConfig);break;
    	    case 'selectlist':item = new AI.GridToolSelectlistUx(itemConfig);break;
    	    case 'date':item = new AI.GridToolDateUx(itemConfig);break;
    	    case 'button':item = new AI.GridToolButtonUx(itemConfig);break;
    	    case 'buttongroup':item = new AI.GridToolButtonGroupUx(itemConfig);break;
    	    case 'html':item = itemConfig.container.append(itemConfig.html);break;
    	    }
    	    item.on('toolbarclick',function(clickfun){
    		if(typeof clickfun === "string"){
	    	    if(clickfun=="query"){
			var where = " where 1=1 ";
			for(var i=0;i<self.toolbars.length;i++){
			    var itemUx = self.toolbars[i];
			    if(itemUx&&itemUx.getValue()&&itemUx.config.where){
				where += " and "+itemUx.config.where.replace(eval('/{'+itemUx.config.name+'}/g'),itemUx.getValue());
			    }
			}
			//判断是否包装,没有包装就包装加上查询条件
			if(self.store.sql.indexOf(self.queryKey +' * from (') > -1 && self.store.sql.indexOf(" ) abc ") > -1){
			}else{
				self.store.sql = self.queryKey + " * from ("+self.store.sql+" ) abc ";
			}
			
			if(!self.store.orginsql){
				self.store.orginsql = self.store.sql;
			}
			self.store.sql = self.store.orginsql + where ;
			self.control.find('.cur-page-text').val(1);
			self.control.trigger('filtered.fu.repeater');
		    }
		    else{
			self.fireEvent('toolbarclick',clickfun);
		    }
		}
		if(typeof clickfun === "function"){
		    clickfun(self.toolbars,self.store);
		}
    	    })
    	    this.toolbars.push(item);
    	}
    },
    /**
    * 静态工具栏初始化
    * @param  options 组件初始化参数
    */
    initStaticToolbar:function(options){
	var sortItems = options.sortItems||[];
	if(sortItems.length == 0){
	    var fields=options.columns;
	    for(var i=0;i<fields.length;i++){
		sortItems.push({attrcnname:fields[i].header,attrname:fields[i].dataIndex});
	    }
	}
	
	var template = _.template('<div class="btn-group sortbar">'
				  +'  <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
				  +'    排序方式 <span class="caret"></span>'
				  +'  </button>'
				  +'  <ul class="dropdown-menu">'
				  +'	  <%for(var i=0;i<sortItems.length;i++){%>'
				  +'    	<li class="sortitem"><a href="#" name="<%=sortItems[i].attrname%>"><%=sortItems[i].attrcnname%></a></li>'
				  +'      <%}%>'
				  +'	  <li role="separator" class="divider"></li>'
				  +'    <li class="sorttype"><a href="#" name="asc">递增</a></li>'
				  +'    <li class="sorttype"><a href="#" name="desc">递减</a></li>'
				  +'  </ul>'
				  +'</div>');
	$('#'+options.containerId+' .repeater-header-right .repeater-views').prepend(template({sortItems:sortItems}));
	var self = this;
	$('#'+options.containerId+' .sortbar li a').click(function(e){
	    if($(this).parent('li').hasClass('sortitem')){
		$('#'+options.containerId+' .sortbar .sortitem a').removeClass('glyphicon glyphicon-ok');
	    }
	    else{
		$('#'+options.containerId+' .sortbar .sorttype a').removeClass('glyphicon glyphicon-ok');
	    }
	    $(this).addClass('glyphicon glyphicon-ok');
	    if($('#'+options.containerId+' .sortbar .sortitem .glyphicon-ok').size()>0){
		if(self.store.sql.toLowerCase().indexOf('order by') != -1){
		    var sqls = self.store.sql.toLowerCase().split('order by');
		    var sql = "";
		    for(var i=0;i<sqls.length-1;i++){
			sql += sqls[i];
		    }
		    self.store.sql = sql+" order by "+($('.sortbar .sortitem .glyphicon-ok').attr('name')||'')
			+" "+($('.sortbar .sorttype .glyphicon-ok').attr('name')||'');
		}
		else{
		    self.store.sql += " order by "+($('.sortbar .sortitem .glyphicon-ok').attr('name')||'')
			+" "+($('.sortbar .sorttype .glyphicon-ok').attr('name')||'');
		}
		self.control.trigger('filtered.fu.repeater');
	    }
	});
    },
    /**
    * 页面渲染代码模板生成
    * @param  options 组件初始化参数
    */
    _getTpl:function(options){
	var viewtype = options.viewtype||'card,list';
	viewtype = viewtype.split(',');
	var cardClass="",gridClass="";
	if(viewtype=='card'){
	    cardClass="";
	    gridClass="hide";
	}
	if(viewtype=='list'){
	    cardClass="hide";
	    gridClass="";
	}
	var curViewtype = localStorage.viewtype||'list';
	if(viewtype.length==1){
	    curViewtype = viewtype[0];
	}
	var cardActive="",gridActive="active";
	if(curViewtype=='card'){
	    cardActive='active';
	    gridActive='';
	} ;
	var headerLeftHtml=options.headerLeftHtml ||'<div class="repeater-header-left toolbar">'
    										   +'        <div class="repeater-title"><i class="icon-grid"></i>&nbsp;&nbsp;'+(options.title||'列表信息')+'</div>    '
    										   +'</div> ';
	var headerRightHtml=options.headerRightHtml ||'';
	var bodyHtml=options.bodyHtml||'<div class="repeater-canvas">  ';
	var pageHtml = '<li data-value="10"><a href="#">10</a></li>'
		+'<li data-value="50" data-selected="true"><a href="#">50</a></li>'
	    +'<li data-value="100"><a href="#">100</a></li>';
	if(options.pageSize&&options.pageSize>0){
		pageHtml = '<li data-value="'+options.pageSize+'" data-selected="true"><a href="#">'+options.pageSize+'</a></li>'
		+'<li data-value="'+options.pageSize*2+'"><a href="#">'+options.pageSize*2+'</a></li>'
		+'<li data-value="'+options.pageSize*3+'"><a href="#">'+options.pageSize*3+'</a></li>';
	}
	return '<div class="repeater" id="'+options.containerId+'_myRepeater">                                                                                            '
	    +'    <div class="repeater-header">                                                                                                 '
	    +		headerLeftHtml
	    +'      <div class="repeater-header-right">'
        +          headerRightHtml                                                                              
	    +'         <div class="btn-group repeater-views" data-toggle="buttons">  '
	    +'          <label class="btn btn-default btn-sm '+gridActive+''+gridClass+'">                                                                   '
	    +'            <input name="repeaterViews" type="radio" value="list"><span class="glyphicon glyphicon-list"></span>                  '
	    +'          </label>                                                                                                                '
	    +'          <label class="btn btn-default btn-sm '+cardActive+' '+cardClass+'"> '
	    +'            <input name="repeaterViews" type="radio" value="thumbnail"><span class="glyphicon glyphicon-th"></span>               '
	    +'          </label>                                                                                                                '
	    +'        </div>                                                                                                                    '
	    +'      </div>                                                                                                                      '
	    +'    </div>                                                                                                                        '
	    +'    <div class="repeater-viewport">                                                                                               '
	    +       bodyHtml
	    +'      <div class="loader repeater-loader"></div>                                                                                  '
	    +'    </div>                                                                                                                        '
	    +'    <div class="repeater-footer">                                                                                                 '
	    +'      <div class="repeater-footer-left">                                                                                          '
	    +'        <div class="repeater-itemization">                                                                                        '
	    +'          <span><span class="repeater-start"></span> - <span class="repeater-end"></span> of <span class="repeater-count"></span> 条数</span>'
	    +'          <div class="btn-group selectlist dropup" data-resize="auto" >                                                                   '
	    +'            <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">                          '
	    +'              <span class="selected-label">&nbsp;</span>                                                                          '
	    +'              <span class="caret"></span>                                                                                         '
	    +'              <span class="sr-only">Toggle Dropdown</span>                                                                        '
	    +'            </button>                                                                                                             '
	    +'            <ul class="dropdown-menu" role="menu">                                                                                '
	    +			  pageHtml
	    +'            </ul>                                                                                                                 '
	    +'            <input class="hidden hidden-field" name="itemsPerPage" readonly="readonly" aria-hidden="true" type="text"/>           '
	    +'          </div>                                                                                                                  '
	    +'          <span>每页</span>                                                                                                       '
	    +'        </div>                                                                                                                    '
	    +'      </div>                                                                                                                      '
	    +'      <div class="repeater-footer-right">                                                                                         '
	    +'        <div class="repeater-pagination">                                                                                         '
	    +'          <button type="button" class="btn btn-default  btn-sm repeater-prev">                                                    '
	    +'            <span class="glyphicon glyphicon-chevron-left"></span>                                                                '
	    +'            <span class="sr-only">Previous Page</span>                                                                            '
	    +'          </button>                                                                                                               '
	    +'          <label class="page-label" id="myPageLabel">Page</label>                                                                 '
	    +'          <div class="repeater-primaryPaging active">                                                                             '
	    +'            <div class="input-group input-append dropup combobox">                                                              '
	    +'              <input type="text" class="form-control cur-page-text" aria-labelledby="myPageLabel">                                              '
	    +'              <div class="input-group-btn">                                                                                       '
	    +'                <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">                      '
	    +'                  <span class="caret"></span>                                                                                     '
	    +'                  <span class="sr-only">Toggle Dropdown</span>                                                                    '
	    +'                </button>                                                                                                         '
	    +'                <ul class="dropdown-menu dropdown-menu-right"></ul>                                                               '
	    +'              </div>                                                                                                              '
	    +'            </div>                                                                                                                '
	    +'          </div>                                                                                                                  '
	    +'          <input type="text" class="form-control repeater-secondaryPaging" aria-labelledby="myPageLabel">                         '
	    +'          <span>of <span class="repeater-pages"></span></span>                                                                    '
	    +'          <button type="button" class="btn btn-default btn-sm repeater-next">                                                     '
	    +'            <span class="glyphicon glyphicon-chevron-right"></span>                                                               '
	    +'            <span class="sr-only">Next Page</span>                                                                                '
	    +'          </button>                                                                                                               '
	    +'        </div>                                                                                                                    '
	    +'      </div>                                                                                                                      '
	    +'    </div>                                                                                                                        '
	    +'</div>                                                                                                                            ';
    },
    /**
     * 页面刷新
     * @param  store
     */
    reload:function(store){
    	if(store && typeof(store)=="object"){
    		this.store = store;
    	}else if(store && typeof(store) == "string"){
    		this.store.sql = store;
    	}
    	this.control.trigger('filtered.fu.repeater');
    },
    /**
     * 返回复选框选中的记录的items数组
     * @returns  记录的items数组
     */
    getSelectedItems:function(){
		var result = [];
		for(var i = 0; i < this.selectedItems.length; i++){
		    if(this.selectedItems[i] != undefined){
			result.push(this.selectedItems[i]);
		    }
		}
		return result;
    }
});
/**
* 工具栏基础组件，定义基本的操作函数，工具栏各种类型的组件均由此扩展
*/
AI.GridToolBaseUx = Event.$extend({
    __init__ : function(item) {
 	this._listeners={};
 	this.config = item;
	this.container = item.container;
	this.init(item);
    },
    init:function(item){
    },
    /**
     * 根据配置返回一个数组，包含key,value,当前选中的值
     * @param  storesql 查询语句
     * @param  selVal 选中的值
     * @param  elementType item元素类型
     */
    _getOptions_:function (storesql,selVal,elementType){  ///根据配置返回一个数组，包含key,value,当前选中的值
	var self=this;
	var allOptions=[];//{id,name}
	var isSelVal=function(optionsId){
	    if(selVal&&elementType&&elementType=='checkbox'){
		var checkVals = selVal.split(",");
		var checkSel = false;
		for(var m in checkVals){
		    if(checkVals[m]&&optionsId&&(checkVals[m].toString().trim()==optionsId.trim())){
			checkSel = true;
			break;
		    }
		}
		return checkSel;
	    }else{
		return selVal&&optionsId?(selVal.toString().trim()==optionsId.trim()):false;
	    }
	};
	if(storesql){
	    if(storesql.toLowerCase().indexOf('select ')!=-1 &&
	       storesql.toLowerCase().indexOf(' from ')!=-1){
		var store=ai.getStoreData( storesql );
		var attrNames=store&&store.length>0?ai.getJsonAttrName(store[0]):'';
		for(var i=0;store&&i<store.length;i++){
		    var r=store[i];var optionRec={};
		    for(var k in r){
			optionRec[k.toLowerCase()]=r[k];
		    }
		    optionRec.id=r[attrNames[0]];
		    optionRec.name=r[attrNames.length==1?attrNames[0]:attrNames[1]];
		    optionRec.selected=isSelVal(r[attrNames[0]]);
		    allOptions.push(optionRec);
		}
	    }else if(storesql.indexOf("|")>=1){ //1,中国|2,美国
		var tmpArray=storesql.split("|");
		for(var i=0;i<tmpArray.length;i++){
		    var option=tmpArray[i];
		    allOptions.push({
			id:option.split(",")[0]
			,name:option.split(",")[1]
			,selected:isSelVal(option.split(",")[0])
		    });
		}
	    }else if(storesql){
		var tmpArray=storesql.split(",");
		for(var i=0;i<tmpArray.length;i++){
		    allOptions.push({
			id:tmpArray[i]
			,name:tmpArray[i]
			,selected:isSelVal(tmpArray[i])
		    });
		}
	    }
	}
	return allOptions;
    },
    /**
     * 获取工具栏中项目的值
     * @returns  项目的值
     */
    getValue:function(){
 	return this.value;
    },
    /**
     * 设置工具栏中项目的值
     * @param  value 工具栏中项目的值
     */
    setValue:function(value){
 	this.value = value;
    }
});          
/**
* 工具栏文本组件
*
*     参数说明：
*         type           : 固定为text
*         id             : html元素对应ID
*         value          : html元素value属性
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 文本框默认文字
*/                                                                                                                      
AI.GridToolTextUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏文本组件初始化
  * @param  item 配置信息
  *
	*     配置参数说明：
  *         type           : 固定为text
  *         id             : html元素对应ID
  *         value          : html元素value属性
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 文本框默认文字
  */           
    init:function(item){
 	var id = item.id||item.name;
 	var value = this.value = item.value||'';
 	var className = item.className||''; 
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
	var html = '<div class="btn-group '+className+'" style="margin-left:10px;'+display+'">'
	    +'	<div class="text input-group">'
	    +'		<input type="text" id="'+id+'" class="form-control" placeholder="'+item.fieldLabel+'" value="'+value+'" '+readOnly+'/>'
	    +'	</div></div>';
	this.container.append(html);
	var self = this;
	$('#'+id).on('focusout',function(e){
	    self.setValue($(e.currentTarget).val());
	});
    }
});
/**
* 工具栏下拉框组件
*
*     参数说明：
*         type           : 固定为combox
*         id             : html元素对应ID
*         value          : html元素当前选中的选项值
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 默认文本
*         width          : 宽度
*         storesql       : 选择项查询语句
*/
AI.GridToolComboxUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏下拉框组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         type           : 固定为combox
  *         id             : html元素对应ID
  *         value          : html元素当前选中的选项值
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 默认文本
  *         width          : 宽度
  *         storesql       : 选择项查询语句
  */
    init:function(item){
 	var html = '';
	var id = item.id||item.name;
	var value = this.value = item.value||'';
 	var className = item.className||''; 
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':'';
	var width = 'width:'+(item.width?item.width+'px;' : '120px;');
	var allOptions=this._getOptions_(item.storesql,value);
	var optionsHtml='<li data-value="all" ><a href="#">全部</a></li>';
	var selIndex = 0;
	for(var j=0;j<allOptions.length;j++){
	    var dataValue = allOptions[j].id||allOptions[j].name;
	    optionsHtml+='<li data-value="'+dataValue+'"><a href="#">'+allOptions[j].name+'</a></li>';
	    if(item.val&&dataValue == item.val){
		selIndex = j;
	    }
	};  
	html+= '<div class="btn-group '+className+'" style="'+display+width+'"><div id="'+id+'" class="input-group input-append dropdown combobox" data-initialize="combobox" style="margin-left:10px"><input type="text" class="form-control" placeholder="'+item.fieldLabel+'" '+readOnly+'><div class="input-group-btn"><button class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" '+readOnly+'><span class="caret"></span></button> <ul class="dropdown-menu dropdown-menu-right"  role="menu">'+optionsHtml+' </ul></div></div></div>'   ;
	this.container.append(html);
	$('#'+id).combobox('selectByValue', value);
	var self = this;
	$('#'+id).on('changed.fu.combobox', function (event, data) {
	    console.log(data);
	    self.value = data.value == 'all'?'':data.value;
	});
    }
});
/**
* 工具栏选择列表组件
*
*     参数说明：
*         type           : 固定为selectlist
*         id             : html元素对应ID
*         value          : html元素当前值
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 默认标题
*         width          : 宽度
*         storesql       : selectlist选择项查询语句
*/  
AI.GridToolSelectlistUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏选择列表组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         type           : 固定为selectlist
  *         id             : html元素对应ID
  *         value          : html元素当前值
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 默认标题
  *         width          : 宽度
  *         storesql       : selectlist选择项查询语句
  */
    init:function(item){
 	var html = '';
	var id = item.id||item.name;
	var value = this.value = item.value||'';
 	var className = item.className||''; 
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
	var allOptions=this._getOptions_(item.storesql,value);
	var optionsHtml='<li data-value="all" ><a href="#">全部</a></li>';
	for(var j=0;j<allOptions.length;j++){
	    // console.log(allOptions[j]);
	    optionsHtml+='<li data-value="'+(allOptions[j].id||allOptions[j].name)+'"><a href="#">'+allOptions[j].name+'</a></li>';
	};  
	html+= '<div id="'+id+'" class="btn-group selectlist '+className+'" data-resize="auto" style="margin-left:10px;'+display+'"> <button class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" '+readOnly+'><span id="'+item.name+'" class="selected-label">'+item.fieldLabel+'</span> <span class="caret"></span></button> <ul class="dropdown-menu"  role="menu">'+optionsHtml+' </ul> </div>'   ;
	this.container.append(html);
	$('#'+id).selectlist('selectByValue', item.val);
	var self = this;
	$('#'+id).on('changed.fu.selectlist', function (event, data) {
	    console.log(data);
	    self.value = data.value == 'all'?'':data.value;
	});
    }
});
/**
* 工具栏日期组件
*
*     参数说明：
*         type           : 固定为date
*         id             : html元素对应ID
*         value          : html元素当前值
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*/  
AI.GridToolDateUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏日期组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         typ            : 固定为date
  *         id             : html元素对应ID
  *         value          : html元素当前值
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  */
    init:function(item){
 	var id = item.id||item.name;
 	var value = this.value = item.value||'';
 	var className = item.className||''; 
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
	var html='<div class="datepicker btn-group '+className+'" data-initialize="datepicker" id="'+id+'" style="margin-left:10px;width:150px;'+display+'">'+
    		'<div class="input-group" ><input class="form-control" id="myDatepickerInput" type="text" '+readOnly+'/><div class="input-group-btn"><button type="button" class="btn btn-default  btn-sm  dropdown-toggle" data-toggle="dropdown" '+readOnly+'><span class="glyphicon glyphicon-calendar"></span><span class="sr-only">Toggle Calendar</span></button><div class="dropdown-menu dropdown-menu-right datepicker-calendar-wrapper" role="menu"><div class="datepicker-calendar"><div class="datepicker-calendar-header"><button type="button" class="prev"><span class="glyphicon glyphicon-chevron-left"></span><span class="sr-only">Previous Month</span></button><button type="button" class="next"><span class="glyphicon glyphicon-chevron-right"></span><span class="sr-only">Next Month</span></button><button type="button" class="title"><span class="month"><span data-month="0">January</span><span data-month="1">February</span><span data-month="2">March</span><span data-month="3">April</span><span data-month="4">May</span><span data-month="5">June</span><span data-month="6">July</span><span data-month="7">August</span><span data-month="8">September</span><span data-month="9">October</span><span data-month="10">November</span><span data-month="11">December</span></span><span class="year"></span></button></div><table class="datepicker-calendar-days"><thead><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead><tbody></tbody></table><div class="datepicker-calendar-footer"><button type="button" class="datepicker-today">Today</button></div></div><div class="datepicker-wheels" aria-hidden="true"><div class="datepicker-wheels-month"><h2 class="header">Month</h2><ul><li data-month="0"><button type="button">Jan</button></li><li data-month="1"><button type="button">Feb</button></li><li data-month="2"><button type="button">Mar</button></li><li data-month="3"><button type="button">Apr</button></li><li data-month="4"><button type="button">May</button></li><li data-month="5"><button type="button">Jun</button></li><li data-month="6"><button type="button">Jul</button></li><li data-month="7"><button type="button">Aug</button></li><li data-month="8"><button type="button">Sep</button></li><li data-month="9"><button type="button">Oct</button></li><li data-month="10"><button type="button">Nov</button></li><li data-month="11"><button type="button">Dec</button></li></ul></div><div class="datepicker-wheels-year"><h2 class="header">Year</h2><ul></ul></div><div class="datepicker-wheels-footer clearfix"><button type="button" class="btn datepicker-wheels-back"><span class="glyphicon glyphicon-arrow-left"></span><span class="sr-only">Return to Calendar</span></button><button type="button" class="btn datepicker-wheels-select">Select<span class="sr-only">Month and Year</span></button></div></div></div></div></div>'+
    		'</div>';
	this.container.append(html);
    	$('#'+id).datepicker({ momentConfig:{format:'L'},allowPastDates: true});
		var self = this;
		$('#'+id).on('dateClicked.fu.datepicker',function(evt,date){
		    var date = $(this).datepicker('getDate');
		    self.value = date;
		});
    }
});
/**
* 工具栏搜索栏组件
*
*     参数说明：
*         type           : 固定为search
*         id             : html元素对应ID
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 搜索输入框默认文本
*         fn             : 点击回调函数，可以是回调函数，也可以是‘query’字符串
*/   
AI.GridToolSearchUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏搜索栏组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         type           : 固定为search
  *         id             : html元素对应ID
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 搜索输入框默认文本
  *         fn             : 点击回调函数，可以是回调函数，也可以是‘query’字符串
  */   
      init:function(item){
 	var id = item.id||item.name;
 	var className = item.className||''; 
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
	var html = '<div class="repeater-search '+className+'" style="'+display+'">'
	    +'	<div class="search input-group" role="search" id="'+id+'">'
	    +'		<input type="search" class="form-control" placeholder="'+item.fieldLabel+'"/>'
	    +'		<span class="input-group-btn">'
	    +'			<button class="btn btn-default btn-sm" type="button" '+readOnly+'>'
	    +'				<span class="glyphicon glyphicon-search"></span>'
	    +'              <span class="sr-only">查找</span>'
	    +'          </button>'
	    +'		</span>'
	    +'	</div>'
	    +'</div>';
	this.container.append(html);
	$('#'+id).search();
	var self = this;
	$('#'+id+' input').on('focusout',function(e){
	    self.setValue($(e.currentTarget).val());
	});
	$('#'+id).on('searched.fu.search', function (event,data) {
		var clickfun = item.fn;
	    if(!clickfun){
	    	clickfun = 'query';
	    }
	    self.fireEvent('toolbarclick',clickfun);
	});
	$('#'+id).on('cleared.fu.search', function (event,data) {
		var clickfun = item.cfn;
	    if(!clickfun){
	    	clickfun = 'query';
	    }
	    self.fireEvent('toolbarclick',clickfun);
	});
    }
});
/**
* 工具栏按钮组件
*
*     参数说明：
*         type           : 固定为button
*         id             : html元素对应ID
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 按钮标题文本
*         actionId       : button按钮actionId属性值，对应点击事件函数名称，若为queryMetaObj，系统自动调用query
*/  
AI.GridToolButtonUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏按钮组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         type           : 固定为button
  *         id             : html元素对应ID
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 按钮标题文本
  *         actionId       : button按钮actionId属性值，对应点击事件函数名称，若为queryMetaObj，系统自动调用query
  */  
    init:function(item){
 	var id = item.id = item.id||item.name;
 	item.className = item.className||'';
 	item.buttonClass = item.buttonClass || "btn-default";
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
	var template = _.template('<div class="repeater-button btn-group <%=item.className%>" style="'+display+'">'
				  +'	<div class="text input-group">'
				  +'		<button type="button" id="<%=item.id%>" actionId="<%=item.actionId%>" class="btn <%=item.buttonClass%> btn-sm"  style="margin-left:10px" '+readOnly+'>&nbsp;<%=item.fieldLabel%></button>'
				  +'	</div></div>');
	var $button = $(template({item:item}));
	this.container.append($button);
	var self = this;
	$button.find('button').click(function(e){
	    // item.container.control.trigger('toolbarclick',$(e.currentTarget).attr('actionId'));
	    var clickfun = item.fn||item.clickfun||$(e.currentTarget).attr('actionId');
	    if(!clickfun){
		alert('未配置action,请指定actionId或fn');
		return;
	    }
	    if(clickfun == 'queryMetaObj') clickfun = 'query';
	    self.fireEvent('toolbarclick',clickfun);
	});
    }
});
/**
* 工具栏按钮组组件
*
*     参数说明：
*         type           : 固定为buttongroup
*         id             : html元素对应ID
*         display        : html元素display属性
*         ClassName      : html元素需要添加的样式class名
*         isReadOnly     : 是否只读y/n
*         name           : 当id属性未配置时，用于作为元素html对应ID
*         fieldLabel     : 标题
*         dropIndex      : 下拉菜单按钮开始的索引值：例如，dropIndex=3，索引值为0，1，2的按钮直接显示在工具栏，3开始之后的显示为下拉列表
*         actionId       : 每个button按钮actionId属性值，对应点击事件函数名称
*         clickfun       : 点击回调函数,优先级fn>clickfun>actionId
*         fn             : 点击回调函数,优先级fn>clickfun>actionId
*/
AI.GridToolButtonGroupUx = AI.GridToolBaseUx.$extend({
	/**
  * 工具栏按钮组组件初始化
  * @param  item 配置信息
  *
  *     参数说明：
  *         type           : 固定为buttongroup
  *         id             : html元素对应ID
  *         display        : html元素display属性
  *         ClassName      : html元素需要添加的样式class名
  *         isReadOnly     : 是否只读y/n
  *         name           : 当id属性未配置时，用于作为元素html对应ID
  *         fieldLabel     : 标题
  *         dropIndex      : 下拉菜单按钮开始的索引值：例如，dropIndex=3，索引值为0，1，2的按钮直接显示在工具栏，3开始之后的显示为下拉列表
  *         actionId       : 每个button按钮actionId属性值，对应点击事件函数名称
  *         clickfun       : 点击回调函数,优先级fn>clickfun>actionId
  *         fn             : 点击回调函数,优先级fn>clickfun>actionId
  */
    init:function(item){
 	var rowFields = [];
 	var dropdownFields = [];
 	if(item.dropIndex){
 	    var dropIndex = parseInt(item.dropIndex);
 	    dropIndex = dropIndex<0?0:dropIndex;
 	    dropIndex = dropIndex>item.fields.length?item.fields.length:dropIndex;
 	    for(var i=0;i<dropIndex;i++){
 		rowFields.push(item.fields[i]);
 	    }
 	    for(var i=dropIndex;i<item.fields.length;i++){
 		dropdownFields.push(item.fields[i]);
 	    }
 	    item.fieldLabel = dropIndex>0?'更多':item.fieldLabel;
 	}
 	else{

 	}
 	item.rowFields = rowFields;
 	item.dropdownFields = dropdownFields;
 	var id = item.id||item.name;
 	item.className = item.className||'';
	var readOnly = item.isReadOnly&&item.isReadOnly==='y' ? 'disabled' : '';
 	var display = item.display?'display:'+item.display+';':''; 
 	var template = _.template('<div id="<%=(item.id||item.name)%>" class="btn-group <%=item.className%>" style="margin-left:10px;'+display+'">'
				  +'    <%for(var i=0;i<item.rowFields.length;i++){%>'
				  +'      <button type="button" class="btn btn-default" actionId="<%=item.rowFields[i].actionId%>" '+readOnly+'><%=item.rowFields[i].fieldLabel%></button>'
				  +'    <%}%>'
				  +'<%if(item.dropdownFields.length>0){%>'
				  +'<div class="btn-group">'
				  +'  <button type="button" class="btn btn-default dropdown-toggle btn-more" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" '+readOnly+'>'
				  +'     <%=item.fieldLabel%><span class="caret"></span>'
				  +'  </button>'
				  +'  <ul class="dropdown-menu">'
				  +'    <%for(var i=0;i<item.dropdownFields.length;i++){%>'
				  +'      <li><a href="#" actionId="<%=item.dropdownFields[i].actionId%>"><%=item.dropdownFields[i].fieldLabel%></a></li>'
				  +'    <%}%>'
				  +'  </ul>'
				  +'</div>'
				  +'<%}%>'
				  +'</div>');
 	this.container.append(template({item:item}));
	var self = this;
	var _click = function(e){
	    var clickfun = item.fn||item.clickfun||$(e.currentTarget).attr('actionId');
	    if(!clickfun){
		alert('未配置action,请指定actionId或fn');
		return;
	    }
	    self.fireEvent('toolbarclick',clickfun);
	}
	$('#'+id).find('li a').click(function(e){
	    _click(e);
	});
	$('#'+id).find('button').not($('#'+id+' .btn-more')[0]).click(function(e){
	    _click(e);
	});
    }
});

