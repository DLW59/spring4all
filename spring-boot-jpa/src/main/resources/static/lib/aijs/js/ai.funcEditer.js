/**
* 函数(PROC_FUNC_DEF_JAVA)编辑组件
*/

AI.FuncEditer = Event.$extend({
    win: null, ///显示的窗口
    sourceTarget:null,
    __init__: function(options){
        this.init(options);
    }
});
/**
* 组件初始化函数
* @param  config 配置参数
*/
AI.FuncEditer.prototype.init = function(config) {
    this.appendHtml();
    this.config = config;
    this.sql = config.sql;

    /*
     *重载mxWindow的show/hide方法,添加通过display还实现隐藏和显示
     */
     if(true){
      mxWindow.prototype.hide=function(){
        this.div.style.visibility="hidden";
        this.div.style.display="none";
        this.fireEvent(new mxEventObject(mxEvent.HIDE));
      };
      mxWindow.prototype.show=function(){
        this.div.style.visibility="";
        this.div.style.display="block";
        this.activate();var a=mxUtils.getCurrentStyle(this.contentWrapper);
        if(!mxClient.IS_IE&&(a.overflow=="auto"||this.resize!=null))this.contentWrapper.style.height=this.div.offsetHeight-this.title.offsetHeight-2+"px";
        this.fireEvent(new mxEventObject(mxEvent.SHOW));
      };
     }
    
    if(this.win) {
        this.win.setTitle(config.title);
    }else{
        this.win = new mxWindow('函数编辑', functionEditerWin, 120, 150, 520, 400, true, true);
        // wnd = new mxWindow('Scrollable, resizable, auto height', content, 300, 50, 200, null, true, true);
		//	wnd.setVisible(true);
        this.win.setMaximizable(true);
        this.win.setMinimizable(true);
        this.win.setScrollable(true);

        this.win.setClosable(true);
        this.win.setResizable(true);
        this.win.addListener(mxEvent.MAXIMIZE, function(evt) {
            console.log("");
        });
    };
     
    var self = this;
    $("#cancelcell").click(function() {
        self.win.hide();
    });
    $("#okcell").click(function() {
        var formVals = self.from.getAllFieldValue();
            if (self.config.callback){
                if (self.config.callback(formVals) == false) return;
            }
        self.win.hide();
    });

    $('#helpInfo').on('shown.bs.tab', function(e) {
        if(self.config.showHelpInfo) self.config.showHelpInfo(self,$("div#funcHelpInfo"));
    })
};

/**
* 函数显示
* @param  funcId 函数编码ID
* @param  title 标题
* @param  curValObj 函数配置参数
* @param  teamCode 团队编码
* @param  graphCell 界面元素
*/
AI.FuncEditer.prototype.show = function(funcId, title, curValObj, teamCode,graphCell) {
    
    this.win.setTitle("步骤号:"+graphCell.id+","+title || '节点编辑');
    var _sql = this.sql||"select * from PROC_FUNC_DEF_PARA where FUNC_CODE='{id}' order by PARA_SEQ"
    var funParaStore = new AI.JsonStore({
        sql: _sql.replace('{id}', funcId),
        table: "PROC_FUNC_DEF_PARA",
        loadDataWhenInit: true,
        key: "FUNC_CODE"
    });

    if (funParaStore.getCount() == 0) {
        alert('没有找到函数配置:' + funcId);
        return;
    };
    var defaultwidth = 220;
    var formItems = [];
    var defaultTitle = {type: 'text',label: '步骤名',value: title,notNull: 'N',fieldName: 'name',width: defaultwidth};
    formItems.push(defaultTitle);
    var nodeInfo={type:'hidden',label: '节点序号',value:graphCell.getId(),fieldName: 'nodeId',width: defaultwidth};
    formItems.push(nodeInfo);
    for (var i = 0; i < funParaStore.getCount(); i++){
        var attrItem = funParaStore.getAt(i).data;
        var storesql = attrItem.INPUTPARA;
        if (storesql && storesql.indexOf('{') > -1 && storesql.indexOf('}') > -1) {
            if (typeof teamCode == "undefined") {
            //storesql = $.parseJSON(storesql).team_sql.replace('${TEAM_CODE}', teamCode);
                storesql=storesql.replace('${TEAM_CODE}', teamCode);
            }else {
                if(attrItem.PARA_NAME == 'dsName'||attrItem.PARA_NAME == 'sourceDsName'||attrItem.PARA_NAME == 'targetDsName'){
                	storesql="select dbname,cnname from metadbcfg";
                }
            }
        }
        attrItem.INPUTTYPE = attrItem.INPUTTYPE.split(",")[0];
        if (attrItem.INPUTTYPE == 'pick') attrItem.INPUTTYPE = 'pick-grid';
        if (attrItem.INPUTTYPE == 'textarea') defaultwidth = 420;
        if (attrItem.INPUTTYPE == 'pick-grid') defaultwidth = 320;
        if (attrItem.INPUTTYPE == 'check') attrItem.INPUTTYPE = 'checkbox';
        if (attrItem.INPUTTYPE == 'combo') attrItem.INPUTTYPE = 'combox';
        if (attrItem.INPUTTYPE == 'label') continue; //attrItem.inputtype='html';
        if (attrItem.INPUTTYPE == 'button'){
          attrItem.CLICKFUN = attrItem.INPUTPARA;
          /*attrItem.CLICKFUN=function(obj,field){
            var x=ai.getStoreData("select sql_text from proc_step where proc_name='"+paramMap['PROCNAME']+"' and step_seq='"+obj['nodeId']+"'");
            var y=JSON.parse(x[0]['SQL_TEXT']);
            $('#sql').text(y['sql']);
            field.getParent().fieldChange('sql',y['sql']);
            //field.triggerFieldChage($('#sql'),y['sql']);
          }*/
        }
        if (attrItem.INPUTTYPE == 'buttongroup'){
          attrItem.buttons = attrItem.INPUTPARA;
        }

        if (!attrItem.INPUTTYPE) attrItem.INPUTTYPE = 'text';

        var formItem = {
            type: attrItem.INPUTTYPE || 'text',
            label: attrItem.PARA_CNNAME,
            notNull: attrItem.ISNULL || 'Y',
            storesql: storesql,
            fieldName: attrItem.PARA_NAME,
            width: defaultwidth,
            dependencies: attrItem.DEPENDENCIES,
            checkItems: attrItem.CHECKITEMS,
            clickfun:attrItem.CLICKFUN,
            buttons:attrItem.buttons,
            tip: attrItem.REAMRK
        };

        if (attrItem.INPUTTYPE == 'rulegrid'){///逻辑规则判断条件
            function getIfExpression(targetStepId){
                var result ="";
                if(curValObj.statements){
                    for(var i=0;i<curValObj.statements.length;i++){
                        if(curValObj.statements[i].stepId==targetStepId){
                            result=curValObj.statements[i].expression;
                            break;
                        }
                    }
                }else{
                    result = curValObj["goto_"+targetStepId];
                }
                return result;
            };
            if(!this.sourceTarget) {alert('请先设置分支的目标节点')};
            var targets=this.sourceTarget.target.split(",");
            var targetNames = this.sourceTarget.targetName.split(",");
        	 
            if(targets.length<=1) {alert('请先设置并连接分支的目标节点')};

            for(var ruleIndex = 0;ruleIndex < targets.length; ruleIndex++){
                formItems.push({
                    type:   'text',
                    label: ""+targetNames[ruleIndex]+"("+targets[ruleIndex]+")条件",
                    value:getIfExpression(targets[ruleIndex])||"",
                    fieldName:"goto_"+targets[ruleIndex],
                    width: defaultwidth+30,
                    dependencies: attrItem.DEPENDENCIES,
                    checkItems: attrItem.CHECKITEMS,
                    tip:attrItem.REAMRK||attrItem.PARA_REMARK
                });
            }
       /* }else if(attrItem.PARA_NAME=="stepname"){///步骤的标题
            formItem.value = title||curValObj[attrItem.PARA_NAME];
            formItems.push(formItem);*/
        }else{
            formItem.value = curValObj[attrItem.PARA_NAME]||attrItem.SELVAL;
            formItems.push(formItem);
        };
     };

    $("#nodeform").empty();
    var formcfg = ({
        id: 'nodeform',
        store: null,
        containerId: 'nodeform',
        fieldChange: function(fieldName, newVal) {
            //alert(fieldName+","+newVal);
        },
        items: formItems
    });
    console.log(this.sourceTarget);
    this.from = new AI.Form(formcfg);
    //this.win.show();
    this.win.setVisible(true);
    $(this.win.div).css('z-index',99999);
    this.showHelpInfo();
    if($("#sql").length>0){
    	$("#sql").css("width","100%");	 
      $("#sql").css("height","100%");	
      $("#sql").parent().parent().css({"height":"100%","padding-bottom":"200px"});	//同时设置字体大小和背景色   
    }
    
    if($("#script").length>0){
    	$("#script").css("width","100%");	 
      $("#script").css("height","100%");	
      $("#script").parent().parent().css({"height":"100%","padding-bottom":"200px"});	//同时设置字体大小和背景色   
    }
 };
/**
* 函数帮助显示
* @param  funcId 函数编码ID
* @param  title 标题
* @param  curValObj 函数配置参数
* @param  teamCode 团队编码
*/
 AI.FuncEditer.prototype.showHelpInfo = function(funcId, title, curValObj, teamcCode) {
 	function getFieldInfo(dataname){
    	 
        var colsql="select dataname,colname,colcnname from COLUMN_VAL where dataname in('"+dataname+"')"; 
       
        var ds_column = new AI.JsonStore({
                sql:colsql,
                pageSize:-1
            });
           if(!tabInfo[dataname]) tabInfo[dataname]=[];
          	 var result = "";
          	  for(var i=0;i<ds_column.getCount();i++){
          	  	   var r=  ds_column.getAt(i) ;
          	  	  
          	  	   if(!tabInfo[dataname])  tabInfo[dataname]=[];
          	  	 
          	  	 
          	  	   tabInfo[dataname].push(r.get('COLNAME').toLowerCase());
          	  	   
          	  	   var colcnname=r.get('COLCNNAME')||"";
          	  	   if(colcnname) colcnname="("+colcnname+")";
          	  	   if(result) result +="<br>,"+r.get('COLNAME').toLowerCase()+colcnname
          	  	   else result  = r.get('COLNAME').toLowerCase()+colcnname
          	  };
          	  return result;
         
    };
 	  function buildTabList(){
    	var datainfo ='<li  id="tab_{tabnameId}" class="list-group-item"  data-toggle="class:show">'+
		 		'<a  id="{dataname}"  href="#" class="showhideFieldInfo thumb-sm pull-left m-r-sm"> <i class="glyphicon glyphicon-log-in"></i> </a>'+
		 		'<span href="#" class="clear">'+
		   			'<strong class="block">{dataname} </strong>'+
					'<small class="fieldinfo" style="display:none" > {fieldinfo} </small>'+
     			'</span>'+
				'</li>';
		$("#tablelist").empty();
		
    	var dataSourceTargetInfo = this.sourceTarget; 
    	if(!dataSourceTargetInfo) return;
    	if(dataSourceTargetInfo.intabs){
    	for(var i=0;i<dataSourceTargetInfo.intabs.length;i++){
    		var tabname = dataSourceTargetInfo.intabs[i];
    		var tabnameId = tabname.replace(".","_").replace(".","_").replace(".","_");
    		var html = datainfo.replace("{tabnameId}",tabnameId).replace("{tabnameId}",tabnameId).replace("{dataname}",tabnameId);
    		var html = html.replace("{dataname}",tabname).replace("{dataname}",tabname).replace("{dataname}",tabname);
    		html=html.replace('{fieldinfo}',getFieldInfo(tabname));
    		$("#tablist").append(html);
    	};
    };
    if(dataSourceTargetInfo.outtabs){
     for(var i=0;i<dataSourceTargetInfo.outtabs.length;i++){
    		var tabname = dataSourceTargetInfo.outtabs[i];
    		var tabnameId = tabname.replace(".","_").replace(".","_").replace(".","_");
    		var html = datainfo.replace("{tabnameId}",tabnameId).replace("{tabnameId}",tabnameId).replace("{dataname}",tabnameId);
    		var html = html.replace("{dataname}",tabname).replace("{dataname}",tabname).replace("{dataname}",tabname);
    		html=html.replace('{fieldinfo}',getFieldInfo(tabname));
    		$("#tablist").append(html);
    	};
    };
  };
    buildTabList();
};
/**
* htmp页面渲染
*/
 AI.FuncEditer.prototype.appendHtml = function() {
     var html = '<div id="functionEditerWin" style="background:white;overflow:hidden;">     ' +
         ' <ul class="nav nav-tabs header bg-light lt">                                                     ' +
         '                <li class="active"> <a href="#funbaseinfo" data-toggle="tab"> 基本信息 </a> </li>   ' +
         '              <li class=""> <a href="#helpInfoTab" data-toggle="tab" id="helpInfo"> 帮助信息 </a></li>      ' +
         '   </ul>                                                                                                         ' +
         '<div class="tab-content" style="height:100%;overflow-y:auto;overflow-x:hidden;margin-bottom:-100px">      ' +
         '   <div class="tab-pane active" id="funbaseinfo">                                                         ' +
         '         <div id="nodeform" class="form-horizontal" style="margin:20px">                  ' +
         '         <div class="form-group">                                                                                         ' +
         '           <label for="inputTitle" class="col-sm-2 control-label">标题</label>                                                ' +
         '             <div class="col-sm-9">                                                                                           ' +
         '                <input type="text" class="form-control input-sm" id="inputTitle" placeholder="请输入节点的标题">                 ' +
         '          </div>                                                                                                           ' +
         '        </div>                                                                                                             ' +
         '   </div>                                                                                                                ' +
         '       </div>                                                                                                            ' +
         '       <div class="tab-pane " id="helpInfoTab">                                                              ' +
         '          <div id="funcHelpInfo">函数帮助信息</div>            ' +
         '          <div id="tablelist">输入输出信息</div>            ' +
         '       </div>                                                                                                            ' +
         '   </div>                                                                                                                ' +
         '   <div class="modal-footer" style="padding: 4px 10px 10px;position:absolute;bottom:0px;left:300px ">                                                            ' +
         '     <button id="okcell" type="button" class="btn btn-primary pull-right" style="margin-right:20px">保存</button>          ' +
         '     <button id="cancelcell"  type="button" class="btn btn-primary pull-right" style="margin-right:20px">取消</button> ' +
         '   </div> ' + '</div>  ';
     $(html).appendTo("body");
 };
