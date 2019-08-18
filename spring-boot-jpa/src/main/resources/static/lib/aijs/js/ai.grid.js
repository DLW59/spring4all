/**
 * 网格组件
 *
 *     参数说明：
 *         store       : 定义表格数据的来源
 *         id          : 组件在html中的id，不配置则使用默认值
 *         containerId : 组件在html中的父节点id
 *         pageSize    : 分页行数
 *         nowrap      : 单元格内容是否可以换行（true表示不换行，false表示换行）
 *         showCheck   : 勾选框是否显示（true显示，false不显示）
 *         rowclick    : 定义行单击事件触发的方法
 *         celldbclick : 定义单元格双击事件触发的方法
 *         columns     : 定义表格列
 *
 *     column包含参数说明：
 *         header     : 定义列名称
 *         label      : 定义列名称，与header是同样的含义，这里是做冗余处理
 *         width      : 宽度
 *         dataIndex  : 字段名称
 *         sortable   : 是否通过点击字段名称进行排序true/false
 *         render     : 自定义渲染方法,参数为(rec, cellVal)
 *         display    : 是否显示true/false
 *         maxLength  : 显示最大字符长度
 *
 *     参考例子：
 *     var _rowdblClickFunc = function(val,record){
 *         ......
 *     };
 *     var _rowClickFunc = function(val,record){
 *         ......
 *     };
 *     var config={
 *         store:ds_mydata,                //数据源
 *         pageSize:15,                    //分页记录数，不传入默认30
 *         id,                             //组件在html中的id，不配置则使用默认值
 *         containerId:'tabpanel',         //归属容器ID
 *         nowrap:false,                   //单元格内容是否可以换行（true表示不换行，false表示换行）
 *         showcheck:true,                 //是否显示勾选框
 *         celldblclick:_rowdblClickFunc,  //双击回调函数
 *         cellclick：_rowClickFunc,       //单击回调函数
 *         rightclick：_rightClickFunc,    //行右键点击回调函数
 *         rowclick : _rowClickFunc,       //定义行单击事件触发的方法
 *         columns:[   
 *             {header: "词语", width:100,dataIndex: 'SEG_WORD', sortable: true },
 *             {header: "类型", width:250, dataIndex: 'SIMI_ENWORD', sortable: true,render:function(a,b){if(b=='1') return 'IKAnalyzer';else if(b == '2')return'SmartChineseAnalyzer'; else return '其他';}},
 *             {header: "状态", width:120, dataIndex: 'STATUE', sortable: true,render:function(a,b){if(b=='1') return '有效';else if(b == '2')return'无效';else return b;}},
 *             {header: "更新时间", width:120, dataIndex: 'UPDATE_TIME', sortable: true},
 *             {header: "创建时间", width:120, dataIndex: 'CREATE_TIME', sortable: true}
 *         ]
 *     };
 *     var grid =new AI.Grid(config);
 */
AI.Grid = Event.$extend({
	 __init__ : function(options) {
	 	 this.init(options);
	}
});
/**
* 组件初始化函数
* @param  config 组件初始化参数
*
*     参数说明：
*         store       : 定义表格数据的来源
*         id          : 组件在html中的id，不配置则使用默认值
*         containerId : 组件在html中的父节点id
*         pageSize    : 分页行数
*         freezeHead  : true为冻结表头
*         nowrap      : 单元格内容是否可以换行（true表示不换行，false表示换行）
*         showCheck   : 勾选框是否显示（true显示，false不显示）
*         rowclick    : 定义行单击事件触发的方法
*         celldbclick : 定义单元格双击事件触发的方法
*         buttons	  ：定义操作按钮，数组，每个button者是以Json的形式配置
*         columns     : 定义表格列
*
*     column包含参数说明：
*         header     : 定义列名称
*         label      : 定义列名称，与header是同样的含义，这里是做冗余处理
*         width      : 宽度
*         dataIndex  : 字段名称
*         sortable   : 是否通过点击字段名称进行排序true/false
*         render     : 自定义渲染方法,参数为(rec, cellVal)
*         display    : 是否显示true/false
*         maxLength  : 显示最大字符长度
*     
*     button包含参数说明：
*         id		 ：按钮的ID
*     	  label      ：按钮的名称
*         class      ：图标的样式，推荐使用fontawesome的字体图标，写入字体图标的class即可
*         clickfun   ：单击事件，参数为index:按钮的序号，button：按钮自身
*/
AI.Grid.prototype.init = function(config) {
    this.config = config;

    this.placeholder = config.placeholder==false?false:true;
    this.placeholderRender = config.placeholderRender||null;
    
    this.store = config.store;
    this.remoteModel = config.remoteModel || false;
    this.sort = {};

     
    if(this.store){
    	if(!this.store.limit) this.store.limit=this.pageSize;
    	if(this.store.limit<this.pageSize){
    		this.store.limit = this.pageSize;
    		this.store.select();
    	};
    }
    
    var container = $("#" + config.containerId);
    container.append('<div class="ai-grid-container" style="position:relative;height:'+$("#" + config.containerId).height()+'px;"></div>');
    this.containerEl = $("#" + config.containerId+" .ai-grid-container") //容器Element
    
    this.id = config.id || config.containerId+"-table";
    this.beginpage=0;
    this.endpage=0;
    this.pageSize = config.pageSize || this.store.pageSize || 30;
    this.heightFixed =  (this.containerEl.height() > 0) ? true : false;
   
    this.showPageNum=config.showPageNum||6;
    if(typeof this.config.cellclick != 'function')
        this.config.cellclick = function() {
        };
    var self=this;
   
    this.store.addEvent('dataload',function(){
    	
    	self.build();
    	 
    });
    if(this.store){
    	this.store.on('addrow',function(r){
    		self.AddRow(r);
      });
    	this.store.on('delrow',function(r){
    		self.DelRow(r);
     });
    }; 
    this.build();
    if(this.config.buttons && this.config.buttons.length > 0) this.buildButtonBar();
    if(this.pageSize!=-1) this.buildPageTool(); 
    
    //重新算下table的高度
    if(this.heightFixed) this.tabwap.height(this.getTableHeight());
    
    $(window).resize( function(){
    	$(self.containerEl).find(".ai-table-freezHeader").remove();
    	if(self.config.freezeHead) self.buildFreezeHeader();
    });
};
/**
* Grid组件页面渲染
*/
AI.Grid.prototype.build = function() {
	var that = this;
	 this.start = this.start||0;  ///开始页面数
    this.curPage = this.curPage||1; ///当前页号
    this.totalCount = this.store.getTotalCount();
    this.count=this.store.getCount();
    this.strip = this.config.strip||false;
    
    var containerHeight = '';
    
    if(this.heightFixed){
    	containerHeight = 'height:'+this.getTableHeight()+'px;';
    }
    
    $(this.containerEl).find(".ai-table-container").remove();
    $(this.containerEl).find(".ai-table-freezHeader").remove();
    
    this.tabwap = $("<div class='ai-table-container' style='position:relative;width:100%;overflow: auto;"+containerHeight+"'></div>");
    
    //在查询和点击分页下一步的时候会重新build表格,分页是不重新build
    var pageContainer = $(this.containerEl).find("div.pageContainer");
    if(pageContainer.length == 1){
    	pageContainer.before(this.tabwap);
    }else{
    	$(this.containerEl).append(this.tabwap);
    }

    if(this.strip){
      this.tableEl = $('<table class="table table-striped table-condensed datatables ai-grid" id="' + this.id + '" ></table>').appendTo($(this.tabwap));
    }else{
      this.tableEl = $('<table class="table  table-condensed datatables ai-grid" id="' + this.id + '" ></table>').appendTo($(this.tabwap));
    }
    this.buildHead();
    this.buildBody();
    
    if(this.containerEl.height() == 0){
    	this.containerEl.height(this.tableEl.height()+42);
    };
    
    if(this.config.nowrap&&this.config.nowrap==true){
    	this.tableEl.find("th").css({"overflow": "hidden","white-space": "nowrap","text-overflow": "ellipsis"});
    	this.tableEl.find("td").css({"overflow": "hidden","white-space": "nowrap","text-overflow": "ellipsis"});
    };
   //  if(!this.store.start || this.store.start==0)  this.buildPageTool();
    this.fireEvent("gridload");
    
    if(this.config.freezeHead) this.buildFreezeHeader();   
};

AI.Grid.prototype.getTableHeight = function(){
	 var height = this.containerEl.height();
	//如果有按键区，表格的高度要减去按键区的高度  
	if(this.containerEl.find(".ai-grid-button")){
		height = height - this.containerEl.find(".ai-grid-button").height();
	}
	  
	//如果有分页，表格的高度要减去分页的高度
	if(this.containerEl.find(".pageContainer")){
		height = height - this.containerEl.find(".pageContainer").height();
	}
	
	return height;
}

/**
 * GridButtonbar渲染
 */
AI.Grid.prototype.buildButtonBar = function(){
	var buttonContain = $('<div id="'+this.id+'-buttons" class="ai-grid-button"></div>').prependTo(this.containerEl)
	var elmentcfgs = this.config.buttons;
	for(var i=0;i<elmentcfgs.length;i++){
		var elmentcfg = elmentcfgs[i];
		var elmentId = elmentcfg.id || this.id+'-buttons'+i;
		var button = $('<span id="'+elmentId+'"><i class="'+elmentcfg.class+'"></i><span class="button-label">'+elmentcfg.label+'</span></span>');
		
		buttonContain.append(button);
		
		if(elmentcfg.clickfun){
			button.on('click',{index:i},function(){
				var self = this;
				var index = arguments[0].data.index;
				if (typeof elmentcfgs[index].clickfun == "function"){
					return elmentcfgs[index].clickfun(index,$(self));
				}
			});
		}
	}
}
/**
* Grid组件页头渲染
*/
AI.Grid.prototype.buildHead = function() {
    var cfg = this.config;
    var self = this;
    var $thead = $('<thead ></thead>').appendTo(this.tableEl);
    if(cfg.showcheck) {
        $('<th class="ai-grid-head-th" style="width:20px"><input class="ai-grid-head-check" type="checkbox"></th>').appendTo($thead);
    }
    
    for(var i = 0; i < cfg.columns.length; i++) {
        var column = cfg.columns[i];
        if(column){
	        var datatype = column.type || "";
	        var showSortIcon = '';
	        var sortClass = '';
	        if(column.sortable){
	        	showSortIcon = '<span class="fa fa-sort carat"></span>';
	        	sortClass ='sortable ';
	        }
	        var $th = $('<th class="'+sortClass + datatype + ' " width="' + column.width + 'px" dataIndex="' + column.dataIndex + '"><span>' + column.header + '</span>'+ showSortIcon +'</th>');
	        if(column.display)$th.css('display',column.display);
	        $th.appendTo($thead);
	        if(column.sortable){
	            $th.on('click', function(){
	            	//console.log(111);
	            	var sort = $(this).attr('name');
	                var sortDir = typeof sort == "undefined" ? "" : (sort == "desc" ? "" : "desc");
	                var dataindex = $(this).attr('dataindex');
	                
	                /*
	                var sort = {};
	                sort[dataindex] = sortDir;
	                $.extend(self.sort,sort);
	                */
	                
	                var newSql = self.store.sql;
	                if(newSql){ //sql存在,可以确定store里传的是SQL
	                	// .replace('order by',' order by '+dataindex +sortDir+',');
		                if(newSql.indexOf('order by')==-1){
		                    newSql += (' order by '+ dataindex +" " +sortDir);
		                }else if(newSql.indexOf(dataindex)==-1){
	                		newSql = newSql.replace('order by',' order by '+dataindex +" " +sortDir+',');
		                }else{
		                	var start = newSql.indexOf('order by');
		                	start = newSql.indexOf(dataindex,start);
		                	if (start == -1) {
								newSql = newSql.replace('order by',' order by '+dataindex +" " +sortDir+',');
		                	} else{
			                	var end = newSql.indexOf(',',start);
			                	if (end == -1) {
			                		newSql = newSql.substring(0,start) + dataindex +" " + sortDir;
			                	} else{
			                		newSql = newSql.substring(0,start) + dataindex +" " + sortDir + newSql.substring(end);
			                	};
		                	};
		                }
		                self.store.select(newSql);
		                // $(this).attr('name',flag?'desc':'');
		                
	                }else{
	                	var param = self.store.param;
	                	var orderBy = "";
	                	/* 多个字段排序，先留着
	                	$.each(self.sort,function(key,value) {
	                		orderBy += ","+key+" "+value;
						})	
	                	orderBy = orderBy.substring(1);
	                	*/
	                	orderBy = dataindex +" "+sortDir;
	                	$.extend(param,{"orderBy":orderBy});
	                	self.store.select({param:param});
	                }
	                
	                $('.sortable[dataindex=' + dataindex + ']:visible').attr('name',(sortDir=='desc'?'desc':''));
	                self.containerEl.find('[dataindex=' + dataindex + '].sortable .carat')
    				.removeClass("fa fa-sort fa-sort-desc fa-sort-asc")
    				.addClass(sortDir ? 'fa fa-sort-desc' : 'fa fa-sort-asc');
	                
	                /*多个字段排序，先留着
	                $.each(self.sort,function(key,value) {
	                	self.containerEl.find('[dataindex=' + key + '].sortable .carat')
        				.removeClass("fa fa-sort fa-sort-desc fa-sort-asc")
        				.addClass(value ? 'fa fa-sort-desc' : 'fa fa-sort-asc');
					})*/	                
	            });
	        }
        }
    }

    //多选框选择事件
    this.tableEl.find(".ai-grid-head-check",self.containerEl).off("click").on("click",function() {
        if($(this).prop("checked")) {
            //全选
            $(".ai-grid-body-check",self.containerEl).each(function() {
                $(this).prop("checked",true);
            })
        } else {
            //全部取消
            $(".ai-grid-body-check",self.containerEl).each(function() {
            	 $(this).prop("checked",false);
            })
        }
    });
};
/**
* 创建进度条表格
* @param  cellEl 归属容器ID
* @param  cellVal 目前没用
*/
AI.Grid.prototype.buildProgressbarCell = function(cellEl, cellVal) {///创建进度条表格
    //$span = $('<span class="progressBar">'+cellVal+'</span>').appendTo(cellEl);
    $span = $('<span class="progressBar" id="spaceused1">75%</span>').appendTo(cellEl);

    $("#spaceused1").progressBar();
};
AI.Grid.prototype.buildSparklineCell = function(cellEl) {///创建进度条表格
   
};
AI.Grid.prototype.buildFreezeHeader = function(){ //标题冻结
	var that = this;
	var freezeHeight = $("#"+this.id).find("thead").height();
	this.containerEl.find(".ai-table-container").before("<div class='ai-table-freezHeader' style='position:relative;margin-bottom:-"+freezeHeight+"px;height:"+freezeHeight+"px;overflow:hidden;z-index:99' id='"+this.id+"-freezeHeader'></div>");
	var cloneHeader = $("#"+this.id).clone(true);
    $("#"+this.id+"-freezeHeader").append(cloneHeader[0]);
    //减去滚动条的宽度
    $("#"+this.id+"-freezeHeader").width(this.containerEl.find(".ai-table-container")[0].clientWidth);
    
    this.containerEl.find(".ai-table-container").on("scroll",function(){
    	if(that.containerEl.find(".ai-table-freezHeader")){
    		that.containerEl.find(".ai-table-freezHeader").scrollLeft($(this).scrollLeft());
    	}
    })
}
/**
* Grid组件主体渲染
*/
AI.Grid.prototype.buildBody = function() {
    var buildInput = function(column){
      var defaults = {
        type:"text",
        storesql:"",
        value:""
      };
      var options = $.extend(defaults,column);

      var getOptions=function (storesql,selVal,elementType){
        var allOptions=[];
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
            var store=ai.getStoreData(storesql);
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
      };
      var html = '<input type="'+options.type+'" class="form-control input-sm value-editor" value="'+options.value+'" >';

      if(options.type=='combox'){
        var _optionHtml = '<option > </option>';
        if(options.storesql){
          var _optionValues = getOptions(options.storesql,options.value,options.type);
          for (var i =0; i< _optionValues.length; i++) {
            _optionHtml += ('<option value="'+_optionValues[i]['id']+'" '+(_optionValues[i]['selected']?'selected':'')+' >'+_optionValues[i]['name']+'</option>');
          };
        }
        html = '<select id="" class="form-control input-sm value-editor" >'+_optionHtml+'</select>';
      }else if(options.type=='checkbox'){
        html = '<input type="'+options.type+'" class="value-editor" '+(options.value==1?'checked':'')+' >';
      }else if(options.type=='radio'){}

      return html;
    };
    var cfg = this.config;
    var self = this;
    var $tbody = $('<tbody class="ai-grid-body"></tbody>').appendTo(this.tableEl);
    var keyFieldName =   this.store.key;
    var allSelected = true;
    for(var iRow = 0; iRow < this.store.getCount(); iRow++) {
    	 
        if(iRow > this.end) break;
        var rec = this.store.getAt(iRow);
         var rowKey = iRow;
    	 if(keyFieldName) rowKey =this.getRowKey(rec);
       var _keyword='';
       var _keys = this.store.key?this.store.key.split(','):'';
       for(var m=0;m<_keys.length;m++){
        _keyword += ((m===0?"":",")+rec.get(_keys[m]));
       }
        var $tr = $('<tr id="'+rowKey+'" class="ai-grid-body-tr" rowindex="'+iRow+'" keyword="'+_keyword+'"></tr>').appendTo($tbody);
        if(cfg.showcheck) {
            $('<td class="ai-grid-body-td showcheck"><input class="ai-grid-body-check" type="checkbox" rowindex="' + iRow +'" '+ (rec.get('SELECTED')&&rec.get('SELECTED')==1?'checked':'')+'></td>').appendTo($tr);
            allSelected = rec.get('SELECTED')&&rec.get('SELECTED')==1;
        }
        for(var i = 0; i < cfg.columns.length; i++) {
        	
            var column = cfg.columns[i];
            var cellVal = rec.get(column.dataIndex.trim())!=undefined||rec.get(column.dataIndex.trim())!=null?rec.get(column.dataIndex.trim()):'';
            var td_class = typeof column.cls == 'undefine' ? "" : column.cls;
            var cellValShorten = cellVal != '' ?cellVal:'--';
            var title = cfg.showTip == true ? ('title="'+cellVal.toString().replaceAll('"','&quot;')+'"') : '';
            if(column.editable){
              if(column.render)cellVal = column.render(rec, cellVal);
              cellValShorten = buildInput({type:column.editType,storesql:column.storesql,value:cellVal});
            }else{
              if(column.maxLength&&cellVal&&cellVal.length>(column.maxLength+3)) cellValShorten = cellValShorten.slice(0,column.maxLength)+"...";
              if(column.render) cellValShorten = column.render(rec, cellVal);
            }
            $td = $('<td class="ai-grid-body-td ai-td-nowrap ' + td_class + '" id="ai-grid-' + iRow + '-' + i + '" rowindex="' + iRow + '" dataIndex="' + column.dataIndex + '"'+ title +'">' + cellValShorten + ' </td>').appendTo($tr);
            if(column.width) $td.css("width", column.width + "px");
            if(column.display) $td.css("display", column.display);
            if(column.align) $td.css("text-align", column.align);
        }
    }
    if(this.store&&this.store.getCount()==0&&this.placeholder==true){
      var _width = (parseInt($tbody.width()||2)-2)+'px';
      var _contextPath = window.location['pathname'].split('/')[1];
      var _colspan = this.config.columns.length||0;
      if(this.config.showcheck) _colspan += 1;
      $tbody.append('<tr style="padding:0" class="placeholder-img-tr"><td colspan="'+_colspan+'" style="padding:20px;text-align:center;width="'+_width+'" class="placeholder-img-td"><img id="placeholder-img" style="width:50%;" src="/'+_contextPath+'/dacp-view/aijs/images/table-placeholder-c.png" /></td></tr>');
      if(this.placeholderRender&& typeof this.placeholderRender =='function'){
        this.placeholderRender($tbody, this.config, this);
      }
    }
    if(allSelected){
      this.tableEl.find(".ai-grid-head-check").prop('checked',true);
    }
    //行单击选择事件
    $("tr.ai-grid-body-tr",this.tableEl).off("click").on("click", function(e){
      	 var rowIndex=$(this).attr("rowindex");
         var record = self.config.store.getAt($(this).attr("rowindex"));
         // $(this).find('input[type="checkbox"]').off();
         
         $("tr.active",$tbody).removeClass("selec");
         $("tr.active",$tbody).removeClass("active");
         $(this).addClass("active");
         if(self.config.rowclick){
      			self.config.rowclick(rowIndex,record);
    	   }
         e.stopPropagation();
      });
    
    //单元格单击
    if(self.config.cellclick) {
        this.tableEl.find(".ai-grid-body-td").off("click").on("click", function() {
            var dataIndex = $(this).attr("dataIndex");
            var rowIndex = $(this).attr("rowindex");
            if($(this).is(":not(.showcheck)")){
                var checked = $(this).parent().find('.showcheck input[type="checkbox"]').is(':checked');
                $(this).parent().find('.showcheck input[type="checkbox"]').prop('checked',checked?false:true);
            }
            var record = self.config.store.getAt(rowIndex);
            self.config.store.curRecord = self.config.store.getAt(rowIndex);
            self.dataIndex=dataIndex;
            self.rowIndex=rowIndex;
            self.config.cellclick(dataIndex,rowIndex, record);
        });
    }
    
    //行右键点击事件
    if(self.config.rightclick) {
        $("tr.ai-grid-body-tr",this.containerEl).off("mousedown").on("mousedown", function (e) {
            if (e.which == 3) {
                var rowIndex=$(this).attr("rowindex");
                var record = self.config.store.getAt($(this).attr("rowindex"));
                $("tr.active", this.containerEl).removeClass("select");
                $("tr.active", this.containerEl).removeClass("active");
                $(this).addClass("active");
                if($(this).is(":not(.showcheck)")){
                  $(".ai-grid-body-check").each(function() {
                    $(this).prop("checked",false);
                  });
                  var checked = $(this).find('.showcheck input[type="checkbox"]').is(':checked');
                  $(this).find('.showcheck input[type="checkbox"]').prop('checked',checked?false:true);
                }
                self.config.rightclick(rowIndex,record);
            }
        });
    }
    //修改、删除 操作事件
    if(self.config.bindEvent){
    	self.config.bindEvent();
    }

    //单元格双击
  //  if(self.config.celldblclick) {
        $(".ai-grid-body-td",this.containerEl).off("dblclick").on("dblclick", function() {
            var dataIndex = $(this).attr("dataIndex");
            var rowIndex = $(this).attr("rowindex");
            var record = self.config.store.getAt($(this).attr("rowindex"));
            if( self.config.celldblclick) self.config.celldblclick(record.get(dataIndex), record);
            self.fireEvent("dblclick",rowIndex,record,dataIndex);
        });
  //  }

    $(".ai-grid-body-check",this.containerEl).off("click").on("click",function() {
        if(typeof $(this).attr("checked") == 'undefined') {
            //当某一行取消选择后，全选取消
            $(".ai-grid-head-check",this.containerEl).removeAttr("checked");
        } else {
            //当所有行选中后，全选为选择状态
            if($(".ai-grid-body-check",this.containerEl).length == $(".ai-grid-body-check:checked",this.containerEl).length) {
                $(".ai-grid-head-check",this.containerEl).attr("checked", "true");
            }
        }
    })

     $('.value-editor', this.containerEl).not('input[type="checkbox"]').off('change').on('change', function(e){
        var dataIndex = $(e.currentTarget).parent().attr("dataIndex");
        var rowIndex = $(e.currentTarget).parent().parent().attr("keyword")||'';
        var record = self.config.store.getRecordByKey(rowIndex);
        var oldval = record.get(dataIndex);
        var newVal = $(e.currentTarget).val();
        if(newVal != oldval){
          var config = self.getColConfigByDataIndex(dataIndex);
          if(config.beforeUpdate&&typeof config.beforeUpdate=='function'){
            config.beforeUpdate(dataIndex,newVal,record);
          }
          record.set(dataIndex, newVal);
          if(config.afterUpdate&&typeof config.afterUpdate=='function'){
            config.afterUpdate(dataIndex,oldVal,record);
          }
        }
     });
     $('input[type="checkbox"].value-editor', this.containerEl).off('click').on('click', function(e){
        var dataIndex = $(e.currentTarget).parent().attr("dataIndex");
        var rowIndex = $(e.currentTarget).parent().parent().attr("keyword");
        var record = self.config.store.getRecordByKey(rowIndex);
        var oldval = record.get(dataIndex);
        var newVal = $(e.currentTarget).prop('checked')?1:0;
        if(newVal != oldval){
          var config = self.getColConfigByDataIndex(dataIndex);
          if(config.beforeUpdate&&typeof config.beforeUpdate=='function'){
            config.beforeUpdate(dataIndex,newVal,record);
          }
          record.set(dataIndex, newVal);
          if(config.afterUpdate&&typeof config.afterUpdate=='function'){
            config.afterUpdate(dataIndex,oldVal,record);
          }
        }
     });
};
/**
* 根据store.key获取表行ID
* @param  dataIndex 字段索引
* @returns  字段配置信息
*/
AI.Grid.prototype.getRowKey = function(r){
	var rowkeys = [];
	if(this.store.key){
		var keyFields = this.store.key.split(",");
		$.each(keyFields,function(index,fieldName){
			rowkeys.push(r.get(fieldName));
		})
	}
	
	return rowkeys.length>0 ? rowkeys.join('-') : '';
};
/**
* 根据索引获取字段配置信息
* @param  dataIndex 字段索引
* @returns  字段配置信息
*/
AI.Grid.prototype.getColConfigByDataIndex = function(dataIndex) {///单元格内事件由于td，所以必须做个处理
  var columns = this.config.columns;
  for(var i=0;i<columns.length;i++){
    if(columns[i]['dataIndex']==dataIndex){
      return columns[i];
    }
  };
  return null;
};
/**
* 获取行索引值
* @param  tdelement td元素
* @returns  行索引值
*/
AI.Grid.prototype.getRowIndex = function(tdelement) {///单元格内事件由于td，所以必须做个处理
	var result = this.rowIndex;
	
	for(var i=0;i<3;i++){
		if(!tdelement || tdelement.length==0) break;
		if(tdelement.attr("rowIndex")) result=tdelement.attr("rowIndex")
		else{
			tdelement = tdelement.parent();
		}; 
	};
 return result;
};
/**
* 创建分页工具栏
*/
AI.Grid.prototype.buildPageTool=function(){
	  
	  if(!this.config.pageContainer) {
	  var fixedClass = this.heightFixed ? "fixedBotton" : "";
      var _pageContainerHtml = "<div class='pageContainer "+fixedClass+"'>"+
        "<ul id='"+this.id+"_page' class='padder pagination' ></ul></div>";

	  	 $(_pageContainerHtml).appendTo($(this.containerEl));

	  	 this.config.pageContainer=this.id+"_page";
	  };


	  new AI.Pagination({
  			pageContainer:this.config.pageContainer,
  	      store:this.store,
  	      showPageType:this.config.showPageType,
         maxPageButton:4
     });
   /*
    var self=this;
  
	this.footEl.jBootstrapPage({
            pageSize :self.store.pageSize,
            total : self.store.getTotalCount(),
            maxPageButton:4,
            onPageClicked: function(obj, pageIndex) {
              
            	self.store.start=pageIndex*self.store.pageSize;
            	self.store.pageSelect();
            	//self.store.start=0;
            	 return false;
             // alert('您选择了第<font color=red>'+(pageIndex+1)+'</font>页');
            }
        });
       
   */
 };
/**
* 获取选中的记录集
* @returns  记录集
*/
AI.Grid.prototype.getCheckedRows = function() {
    var self = this;
    var records = [];
    if(self.config.showcheck){
        $(".ai-table-container .ai-grid-body-check:checked",self.containerEl).each(function(){
            records.push(self.store.getAt($(this).attr("rowindex")));
        });
    }else{
        $(".ai-table-container .ai-grid-body-tr.active",self.containerEl).each(function(){
            records.push(self.store.getAt($(this).attr("rowindex")));
        });
    }
    
    return records;
};
/**
* 选择框向左向右移动时，重新初始化rowindex属性
*/
AI.Grid.prototype.resetCheckRowindex = function(){
	  var self = this;
	  var iRow = 0;
	  $(".ai-grid-body-tr",self.containerEl).each(function() {
	      $(this).attr("rowindex",iRow);
	      var tdId = 0;
	      
	      $(this).find(".ai-grid-body-td").each(function(){
	      		$(this).attr("id","ai-grid-"+iRow+"-"+tdId);
	      		$(this).attr("rowindex",iRow);
	      		tdId ++;
	      });
	      $(this).find(".ai-grid-body-check").each(function(){
	      		$(this).attr("rowindex",iRow);
	      })
	      iRow++;
	  })	
	
};
/**
* 记录行添加高亮显示
* @param  row 行索引
* @param  color 颜色，目前没用
*/
AI.Grid.prototype.addRowHightLight =function(row,color){
	 	  var trArray = $("tr.ai-grid-body-tr","#"+this.id||this.config.id);
	 	  $(trArray).contents('td').css({padding:"",'border': '', 'border-left': '', 'border-right': ''});
      $(trArray).contents('td:first').css('border-left', '');
      $(trArray).contents('td:last').css('border-right', '');
	 	  var tr = trArray[row];
	 	  
	 	  $(tr).contents('td').css({padding:"0px",'border': '4px dashed red', 'border-left': 'none', 'border-right': 'none'});
      $(tr).contents('td:first').css('border-left', '4px dashed red');
      $(tr).contents('td:last').css('border-right', '4px dashed red');
	 };
/**
* 删除数据记录对应行
* @param  r 数据记录
*/
AI.Grid.prototype.DelRow = function(r){
	if(!this.store.key){alert('store没有配置主键,无法删掉');return;};
	$("table#"+this.id+" tr#"+this.getRowKey(r)).remove();
	  
};
/**
 * 页面刷新
 * @param  store
 */
AI.Grid.prototype.reload = function(store,nodataTip){
	var refreash = true;
	if(nodataTip && store.root.length==0){
		refreash = confirm("未查询到相关记录,是否继续操作？");
	}
	if(refreash){
		this.store = store;
		this.config.count = this.store.count;
		this.config.store = store;
		this.build();
		if(this.config.buttons && this.config.buttons.length > 0) this.buildButtonBar();
		if(this.pageSize!=-1) this.buildPageTool(); 
		
		//重新算下table的高度
		if(this.heightFixed) this.tabwap.height(this.getTableHeight());
		
		$(window).resize( function(){
			$(this.containerEl).find(".ai-table-freezHeader").remove();
			if(this.config.freezeHead) this.buildFreezeHeader();
		});
	}
},
/**
* 添加一行记录数据
* @param  rec 数据记录
*/
AI.Grid.prototype.AddRow = function(rec){
	var cfg=this.config;
	
	var keyFieldName = this.store.key; 
	var rowKey=this.getRowKey(rec)
	
	var iRow=this.store.getCount()-1;
   var $tr = $('<tr id="'+rowKey+'" class="ai-grid-body-tr" rowindex="'+iRow+'"></tr>');
   if(cfg.showcheck) {
     $('<td class="ai-grid-body-td"><input class="ai-grid-body-check" type="checkbox" rowindex=' + iRow + '></td>').appendTo($tr);
   }
   for(var i = 0; i < cfg.columns.length; i++) {
            var column = cfg.columns[i];
            var cellVal = rec.get(column.dataIndex.trim()) || '--';
            var td_class = typeof column.cls == 'undefine' ? "" : column.cls;
            if(column.render) cellVal = column.render(rec,cellVal);
            $td = $('<td class="ai-grid-body-td"><div class="ai-td-nowrap ' + td_class + '" id="ai-grid-' + iRow + '-' + i + '" rowindex="' + iRow + '" dataIndex="' + column.dataIndex + '">' + cellVal + '</div></td>').appendTo($tr);
            if(column.width) $td.find("div").css("width", column.width + "px");
            if(typeof column.nowrap != "undefined" && !column.nowrap) {
                $td.find("div").removeClass("ai-td-nowrap");
            }
    };
	 // $('table#'+cfg.id+' > tbody > tr:first').before($tr);
 	 if(this.config.nowrap&&this.config.nowrap==true){
    	$tr.find("td").css({"overflow": "hidden","white-space": "nowrap","text-overflow": "ellipsis"});
    };
  
  $tr.appendTo("table#"+cfg.id+' > tbody ')
};
/**
* 刷新字段显示
* @param  columns 字段信息
*/
AI.Grid.prototype.reloadColumns = function(columns){
	var xheader = this.config.columns;
	for(var i=0;i<xheader.length;i++){
		if($.inArray(xheader[i].dataIndex, columns)==-1){
			this.tableEl.find("th[dataIndex='"+xheader[i].dataIndex+"']").addClass("hide");
			this.tableEl.find("td[dataIndex='"+xheader[i].dataIndex+"']").addClass("hide");
		}else{
			this.tableEl.find("th[dataIndex='"+xheader[i].dataIndex+"']").removeClass("hide")
			this.tableEl.find("td[dataIndex='"+xheader[i].dataIndex+"']").removeClass("hide");
		}
	}
};

/* 基于datatables的表格组件
*/
AI.DataTable= Event.$extend({
	 __init__ : function(options) {
	 	this.init(options);
	 	 
	}
});
/**
* 表格组件初始化函数
* @param  config 组件配置参数
*/
AI.DataTable.prototype.init=function(config){
	  this.config=config;
	   ai.loadWidget("dataTables");///加载组件
  	  var refreshGrid=function(){};
  	 var containerId=config.containerId;
  	 this.control=null;
  	 ///创建兼容的配置格式
  	 var aoColumns=[];
  	 for(var i=0;i<config.columns.length;i++){
  	 	 if(!config.columns[i].data) config.columns[i].data= config.columns[i].dataIndex;
  	 	 if(!config.columns[i].title) config.columns[i].title= config.columns[i].header;
  	 	 if(config.columns[i].renderer) config.columns[i].render= config.columns[i].renderer; 
  	 	 config.columns[i].sWidth=config.columns[i].width+"px";
  	 	 config.columns[i].sWidth=config.columns[i].width+"px";
  	 	 aoColumns.push( { "sWidth":config.columns[i].width+"px" ,"aTargets": i});
  	};
   
   config.store.on("dataload",function(){
   	   var totalCount =config.store.getTotalCount(); 
       var resp={displayStart:1,recordsTotal:totalCount,iTotalRecords:totalCount,iTotalDisplayRecords:totalCount,recordsTotal:totalCount,aaData:config.store.root};
       
       refreshGrid(resp);
   });
   
    $('#'+containerId).html( '<table cellpadding="0" cellspacing="0" border="0" width="100%"  class="table  display" id="tab_'+containerId+'"></table>'  );
   
  	 var table = $("#tab_"+containerId)
         .on( 'order.dt',  function (para,para1,para2) {  } )
         .on( 'search.dt', function () { console.log( 'Search' ); } )
         .on( 'page.dt',   function () { console.log( 'Page' ); } )
         .dataTable( {
         	"sAjaxSource": "/core/recordServiceLocalddd",
         	//"dataSrc": "root",
         	fnServerData:function(sSource,aoData,fnCallback){
         		//alert(sSource);
         	 
         		var store = config.store;
         		for(var i=0;i<aoData.length;i++){
         			if(aoData[i].name=='iDisplayStart')config.store.start=aoData[i].value;
         			if(aoData[i].name=='iDisplayLength')config.store.pageSize=aoData[i].value;
         		};
         		refreshGrid = fnCallback;
         		config.store.select();
         		
         		//var totalCount =config.store.getTotalCount(); 
         	//	var resp={recordsTotal:totalCount,iTotalRecords:totalCount,iTotalDisplayRecords:totalCount,recordsTotal:totalCount,aaData:config.store.root};
         		 
         		//fnCallback(resp);
         		 
         	},
          
         	fnSortListener:function(para){
         		
         	},
         	"fnRowCallback": function( nRow, aData, iDisplayIndex ) {
             // alert(nRow+","+iDisplayIndex);
             // console.log(aData);
           },
         	"initComplete": function () {
            var api = this.api();
            api.$('td').click( function () {
               // api.search( this.innerHTML ).draw();
               // alert(this.innerHTML);
               
            });
         },
         	"bProcessing": true,
		   "bServerSide": true,
         	"dom": 'T<"clear">lfrtip',
       	 //  responsive: true,
       	  
       	  // "data":config.store.root,
       	   "columns":  config.columns ,
          //  aoColumns:aoColumns,
            //"aoColumns": [{"sWidth":"21px"},{"sWidth":"21px"},{"sWidth":"21px"}],
           tableTools: {
        	    sRowSelect: "os",
             sRowSelector: 'td:first-child',
             sSwfPath: "/core/minder/lib/jquery.dataTables/copy_csv_xls_pdf.swf"
            /*, aButtons: [
            { sExtends: "editor_create", editor: editor },
            { sExtends: "editor_edit",   editor: editor },
            { sExtends: "editor_remove", editor: editor }
            
        ] */
        }, 
        "bProcessing": true,
	    "bServerSide": true,
	    "bAutoWidth": false,
	    "bFilter": false,
	    "bInfo": false,
	    'bLengthChange': false,  
		 "iDisplayLength": config.store.pageSize||100,
		 "scrollCollapse": true,
		// "scrollY":    true,//   $('#'+containerId).height()-100,
	  //   "scrollX":     "100%",
		  "scrollX": true,
		// "scrollX":      1200,
		// "sScrollXInner": "200%",
		// "bLengthChange": true,
		 "sPaginationType": "full_numbers",      //翻页界面类型   
		 "oLanguage": {  
                                    "sProcessing": "正在加载数据...",  
                                    'sSearch': '数据筛选:',  
                                    "sLengthMenu": "每页显示 _MENU_ 项记录",  
                                    "sZeroRecords": "没有符合项件的数据...",  
                                    "sInfo": "当前数据为从第 _START_ 到第 _END_ 项数据；总共有 _TOTAL_ 项记录",  
                                    "sInfoEmpty": "显示 0 至 0 共 0 项",  
                                    "sInfoFiltered": "(_MAX_)" ,
                                     "oPaginate": {   
                    "sFirst": "首页",   
                    "sPrevious": "前页",   
                    "sNext": "后页",   
                    "sLast": "尾页"  
                }     
            }
      });
      this.control=table;
      var self=this;
       $("#tab_"+containerId+" tbody").on( 'click', 'tr', function () {
       	 if(self.config.rowclick){
       	 	var rowdata = table.fnGetData(this);
       	   ///todo:bind to datastore
       	 	 
       	  	self.config.rowclick(rowdata);
       	  }; 
         if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');   
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
       });
        $("#tab_"+containerId+" tbody").on( 'dblclick', 'tr', function () {
        	  
       	 if(self.config.dblrowclick){
       	 	var rowdata = table.fnGetData(this);
       	  
       	  	self.config.dblrowclick(rowdata);
       	  }; 
        
       });
       $(window).bind('resize', function() {
           table.fnAdjustColumnSizing();
     });
};
/*
  {
  pageContainer:
  element:
  store:
  maxPageButton:
  
  }
*/
/**
* 分页组件
*/
AI.Pagination = Event.$extend({
	 __init__ : function(options) {
	 	this.config=options;
	 	this.store=options.store;
	 	this.init(options);
	 	 var self=this;
   
      this.store.addEvent('dataload',function(){
    	  self.init();
    	 });
	 	 
	}
});
/**
* 分页组件初始化函数
* @param  config 组件配置参数
*/
AI.Pagination.prototype.init=function(config){
	  
	var self=this;
	if(!config) config={};
	if(!config.buttons) config.buttons="all";
	 if(!self.store.start || self.store.start==0){
	    $("#"+this.config.pageContainer).empty();
	    $("#"+this.config.pageContainer).jBootstrapPage({
            store:this.store,
            pageSize :this.store.pageSize,
            total : this.store.getTotalCount(),
            showPageType : this.config.showPageType || 'normal',
            buttons : this.config.buttons||"all",
            maxPageButton:this.config.maxPageButton||4,
            onPageClicked: function(obj, pageIndex) {
                	self.store.start=pageIndex*self.store.pageSize;
                	self.store.pageNum=pageIndex;
            		self.store.pageSelect();
            		return false;
            }
        });
       
    }
};
 
(function(f) {
  
	$.fn.jBootstrapPage = function(config) {

        if (this.size() != 1)
            $.error('请为这个插件提供一个唯一的编号');
        
        var c = {
        	store:null,
        	pageSize : 10,
        	total : 0,
        	buttons:"all",
        	maxPages : 1,
        	realPageCount : 1,
        	lastSelectedIndex : 1,
        	selectedIndex : 1,
        	maxPageButton: 3,
        	onPageClicked : null
        };
        
        var firstBtn, preBtn, nextBtn, lastBtn;
        
        return this.each(function() {

            var $this = $(this);
            if (config) $.extend(c, config);
            
            init();
            bindALL();
            
            function init() {
            	$this.find('li').remove();
            	if(c.store){
            		c.tota=c.store.getTotalCount();
            		c.pageSize=c.store.pageSize;
            	};
            	c.maxPages = Math.ceil(c.total/c.pageSize);
            	
            	if(c.maxPages < 1) return; 
            	var preText = "上一页";
            	var nextText = "下一页";
            	if(c.showPageType == 'mini'){
            		preText = "&lt;";
            		nextText = "&gt;";
            	}
             
            	if(c.buttons=='all' || c.buttons.indexOf("first")>=0) 
            	    $this.append('<li class="disabled"><a class="first" href="#">&laquo;</a></li>');
            	if(c.buttons=='all' ||c.buttons.indexOf("pre")>=0) 
            	  $this.append('<li class="disabled"><a class="pre" href="#">'+preText+'</a></li>');
        		
        		var pageCount = c.maxPages < c.maxPageButton ? c.maxPages : c.maxPageButton;
        		var pNum = 0;
        		for(var index = 1; index <= pageCount; index++) {
        			pNum++;
        			$this.append('<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>');
        		};
        		if(c.buttons=='all' ||c.buttons.indexOf("next")>=0) 
        		$this.append('<li class="disabled"><a class="next" href="#">'+nextText+'</a></li>');
        		if(c.buttons=='all' ||c.buttons.indexOf("last")>=0) 
        		$this.append('<li><a class="last" href="#">&raquo;</a></li>'); 
        		if(c.showPageType == 'normal' && (c.buttons=='all' || c.buttons.indexOf("suminfo")>=0))
        		 $this.append('<li><a class="">共'+c.maxPages+'页,'+c.total+'项记录</a></li>');
        		
        		if(c.showPageType == 'normal'){
		            var refreshPagesize = "<li><input type='text' class='pageSizeInput' value='"+c.pageSize+"'>"+
		              "<button class='btn btn-default pageSizeButton' type='button'>"+
		              "<span class='glyphicon glyphicon-refresh' aria-hidden='true'></span></button></li> ";
		            $this.append(refreshPagesize);
		
		            $this.find(".pageSizeButton").click(function(){
		              var _pageSize = parseInt($this.find(".pageSizeInput").val(),10);
		              c.store.updatePageSize(_pageSize);
		            })
        		}
        		
        		if(c.maxPages <= 1) {
        			$this.find('li a.next').parent().addClass("disabled");
            		$this.find('li a.last').parent().addClass("disabled");
            	}else {
            		$this.find('li a.next').parent().removeClass("disabled");
            		$this.find('li a.last').parent().removeClass("disabled");
            	}
        		
        		$this.find('li:nth-child(3)').addClass('active');
        		
        		firstBtn = $this.find('li a.first').parent();
        		preBtn = $this.find('li a.pre').parent();
        		lastBtn = $this.find('li a.last').parent();
        		nextBtn = $this.find('li a.next').parent();
            }
            
            function mathPrePage(currButtonNum, currPage, maxPage, showPage) {
            	if(maxPage < 1) return; 
            	
            	//选中的按钮大于中间数，就进一位
            	var middle = Math.ceil(showPage/2); // 4
            	// 4 > 3
            	// 5 - 4 + 3 
            	if( currButtonNum < middle) {
            		$this.find('li.page').remove();
            		
            		//1 2 3 4 5 6 7 8 9 10
            		//   
            		var endPages = currPage + Math.floor(middle/2);
            		if(endPages < c.maxPageButton) endPages = c.maxPageButton+1;
            		
            		var startPages = endPages - c.maxPageButton;
            		
            		if(startPages <= 0)startPages = 1;
            		
            		if(endPages - startPages >= c.maxPageButton) {
            			var d = endPages - startPages - c.maxPageButton;
            			if(d == 0) d = 1;
            			endPages -= d;
            		} 
            		
            		var pNum = 0;
            		var html = '';
            		for(var index = startPages; index <= endPages; index++) {
            			pNum++;
            			html += '<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>';
            		}
            		
            		$this.find('li:nth-child(2)').after(html);
            		
            		bindPages();
            	}
            }
            
            function mathNextPage(currButtonNum, currPage, maxPage, showPage) {
            	if(maxPage < 1) return; 
            	var offsetRight = 2;
            	//选中的按钮大于中间数，就进一位
            	var middle = Math.ceil(showPage/2); // 4
            	// 4 > 3
            	// 5 - 4 + 3 
            	
            	if((currButtonNum != currPage || maxPage > showPage) && currButtonNum > middle) {
            		//显示后面2个按钮
            		var startPages = currPage - offsetRight;
            		var endPages = currPage + middle;
            		
            		endPages = endPages >= maxPage ? maxPage : endPages;
            		
            		if(endPages <= c.maxPageButton) endPages = c.maxPageButton;
            		
            		if(endPages - startPages >= c.maxPageButton) {
            			var d = endPages - startPages - c.maxPageButton;
            			startPages += d;
            		} 
            		
            		if(endPages == maxPage)endPages++;
            		
            		// if(endPages - startPages < c.maxPageButton) {
            		// 	var d = c.maxPageButton - (endPages - startPages); 
            		// 	startPages -= d;
            		// }
            		
            		var pNum = 0;
            		var html = '';
            		for(var index = startPages; index < endPages; index++) {
            			pNum++;
            			html += '<li class="page" pNum="'+pNum+'"><a href="#" page="'+index+'">'+index+'</a></li>';
            		}
            		
            		$this.find('li.page').remove();
            		$this.find('li:nth-child(2)').after(html);
            		
            		bindPages();
            	}
            	 
            }
            
            function onClickPage(pageBtn) {
            	c.lastSelectedIndex = c.selectedIndex;
            	c.selectedIndex = parseInt(pageBtn.text());
            	
            	if(c.onPageClicked) {
            		c.onPageClicked.call(this, $this, c.selectedIndex-1);
            	}
            	
            	$this.find('li.active').removeClass('active');
             var pnum = pageBtn.parent().attr('pnum');
             // console.log();
             $this.find('li[pnum='+pnum+']').addClass('active');
            	// pageBtn.parent().addClass('active');
            	if(c.selectedIndex !=1){
	            	if(c.selectedIndex > 1) {
	            		if(preBtn.hasClass('disabled')) {
		            		firstBtn.removeClass("disabled");
		            		preBtn.removeClass("disabled");
		            		
		            		bindFirsts();
	            		}
	            	}else {
	            		if(!preBtn.hasClass('disabled')) {
	            			firstBtn.addClass("disabled");
	            			preBtn.addClass("disabled");
	            		}
	            	}
	            	
	            	if(c.selectedIndex >= c.maxPages) {
	            		if(!nextBtn.hasClass('disabled')) {
	            			nextBtn.addClass("disabled");
	            			lastBtn.addClass("disabled");
	            		}
	            	}else {
	            		if(nextBtn.hasClass('disabled')) {
	            			nextBtn.removeClass("disabled");
	            			lastBtn.removeClass("disabled");
	            		
	            			bindLasts();
	            		}
	            	}
            	}
            }
            
            function onPageBtnClick($_this) {
            	//var selectedText = $_this.text();
            	var selected = $_this.attr("class");
            	var selectedBtn = $this.find('li.active').find('a');
            	
            	if(selected == 'next') {
            		
            		var selectedIndex = parseInt(selectedBtn.text())+1;
            		var selectNum = parseInt($this.find('li.active').attr('pNum'))+1;
            		if(selectNum > c.maxPageButton) selectNum = c.maxPageButton-1;
            		
            		if(selectedIndex > 0) {
            			mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            			selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex)+'"]');
            		}
            	}
            	else if(selected == 'pre') {
            		var selectedIndex = parseInt(selectedBtn.text())-1;
                          if(selectedIndex<=0) selectedIndex = 1;
            		var selectNum = parseInt($this.find('li.active').attr('pNum'))-1;
            		if(selectNum < 1) selectNum = 1;
            		
            		mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            		selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex)+'"]');
            	}else if(selected == 'last'){
            			var selectedIndex = c.maxPages;
            			var selectNum = c.maxPageButton;
            			if(selectNum>c.maxPages)selectNum = c.maxPages;
            			mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            			selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex)+'"]');
            	}else if(selected == 'first'){
            		var selectedIndex = 1;
            		var selectNum = 1;
            		mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            		selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex)+'"]');
            	}
            	else {
            		selectedBtn = $_this;
            	}
            	
            	onClickPage(selectedBtn);
            }
            
            function bindPages() {     	
            	$this.find("li.page a").each(function(){
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            	
                $this.find("li.page a").click(function(e){
                	e.preventDefault();
                	
                	$(this).trigger('pageClick', e);
                });
            }
            
            function bindFirsts() {
            	$this.find("li a.first,li a.pre").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).unbind('pageClick');
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            }
            
            function bindLasts() {
            	$this.find("li a.last,li a.next").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).unbind('pageClick');
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            }
            
            function bindALL() {
            	$this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            	
                $this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").click(function(e) {
                	e.preventDefault();
                	
                	if($(this).parent().hasClass('disabled')) return;
                	$(this).trigger('pageClick', e);
                });
            }
        });
    };
})(jQuery, window);
