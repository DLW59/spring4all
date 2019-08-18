Ext.namespace("Asiainfo.widget.Formula");

Asiainfo.widget.Formula=function(config){
	this.cfg=config||{id:Ext.getId(),para:"参数1,参数2"};
	this.create();

};
Asiainfo.widget.Formula.prototype={
   create:function (){
    this.canCollapse=false;   
     
    var tpl='<tpl for="."><div style="height:200px;width:400px"><div id="grd'+this.cfg.id+'"></div></div></tpl>'  
    var Formula = new Ext.form.ComboBox({     
    store:new Ext.data.SimpleStore({fields:['value','text'],data:[['1','1']]}),     
    editable:false, 
    id:this.cfg.id,  
    mode: 'local',   
    listWidth:this.cfg.width||430,   
    triggerAction:'all',    
    maxHeight: this.cfg.height||300,   
    valueField:'value',   
    displayField:'text',   
    tpl: tpl,   
    selectedClass:'',     
    onSelect:Ext.emptyFn
    });
    var fd_f1 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:'(,((,(((' });
    var fd_para1 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:this.cfg.para });
    var fd_op1 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:'+,-,*,/' }); 
    var fd_para2 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:this.cfg.para });
    var fd_f2 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:'(,((,(((' });
    var fd_op2 = Asiainfo.widget.getComboxField({listeners:{collapse:Ext.emptyFn,change:fieldChang,blur:fieldChang},storesql:'+,-,*,/' }); 
     
    var Formulacm = new Ext.grid.ColumnModel([   
        {header:'括号',dataIndex:'f1',width:40,editor:new Ext.grid.GridEditor(fd_f1)},   
        {header:'变量',dataIndex:'para1',width:100,editor:new Ext.grid.GridEditor(fd_para1)},   
        {header:'运算符',dataIndex:'op1',width:40,editor:new Ext.grid.GridEditor(fd_op1)},   
        {header:'变量',dataIndex:'para2',width:100,editor:new Ext.grid.GridEditor(fd_para2)}, 
        {header:'括号',dataIndex:'f2',width:40,editor:new Ext.grid.GridEditor(fd_f2)},
        {header:'运算符',dataIndex:'op2',width:40,editor:new Ext.grid.GridEditor(fd_op2)}
    ]);
   var reader = new Ext.data.ArrayReader({}, [
       {name: 'f1'},
       {name: 'para1'},
       {name: 'op1' },
       {name: 'para2'},
       {name: 'f2'},
       {name: 'op2' }
    ]);
   var initData = [ [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,],[,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,]];
   var Formulads = new Ext.data.Store({
            reader: reader,
            pageSize:-1,
            data:initData
        }) 
    var formulaCancel=function(){
    	canCollapse=true;   
    	Formula.collapse();
    }; 
    var formulaOk=function(){
    	var val='';
    	for(var i=0;i<Formulads.getCount();i++){
    	  var r=Formulads.getAt(i);
    	  var row=r.data;
    	   
    	  for(var key in row){
    	    if(row[key]) val+=row[key];
    	  }  
    	}
    	Formula.setValue(val);
    	canCollapse=true;   
    	Formula.collapse();
    }; 
    var tbar = new Ext.Toolbar({ autoWidth:true,autoShow:true,
	     items:['->',{cls:'x-btn-text-icon',text:'ok',icon:'../images/commit.png',handler:formulaOk},{cls:'x-btn-text-icon',text:'cancel',icon:'../images/cross.gif',handler:formulaCancel}]
});
    var FormulaPanel=new Ext.grid.EditorGridPanel({
    	    clicksToEdit:1,   
            ds: Formulads,   
            cm: Formulacm,   
            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),   
            title:'',   
            region:'center',   
            height:200,
            width:420,
            bbar:tbar   
    }); 
    FormulaPanel.on('afteredit',function(){
       Formulads.commitChanges();
    });  
    Formula.on("expand",function(){
    	canCollapse=false;   
  
        FormulaPanel.render('grd'+this.id);   
    });   
    Formula.on("collapse",function(){  
    	if(!canCollapse) Formula.expand()
    	else this.fireEvent('change',this,this.getRawValue(),''); 
    });  
    Formula.on("beforedestroy",function(){
     
    	tbar.destroy();  
    	FormulaPanel.destroy();
    }); 
    this.control = Formula;   
    return this;
   }

};

Asiainfo.widget.Func=function(config){
	this.cfg=config||{id:Ext.getId(),para:"参数1,参数2"};
	this.create();

};
Asiainfo.widget.Func.prototype={
   create:function (){
    this.canCollapse=false;   
     
    var tpl='<tpl for="."><div style="height:200px;width:400px"><div id="grd'+this.cfg.id+'"></div></div></tpl>'  
    
    var Func = new Ext.form.ComboBox({     
        store:new Ext.data.SimpleStore({fields:['value','text'],data:[['1','1']]}),     
        editable:false, 
        id:this.cfg.id,  
        mode: 'local',   
        listWidth:this.cfg.width||430,   
        triggerAction:'all',    
        maxHeight: this.cfg.height||300,   
        valueField:'value',   
        displayField:'text',   
        tpl: tpl,   
        selectedClass:'',     
        onSelect:Ext.emptyFn
    });
     
    var labelRenderer= function (data, metadata, record, rowIndex, columnIndex, store) { 
       	  //metadata.attr='style="align:right;background-color:#f1f2f4;"';
       	  if(rowIndex>=2)return '<font color=#0011fe  align=right>'+data+'</font>'
       	  else return '<b>'+data
       	
       };
    var remarkRenderer= function (data, metadata, record, rowIndex, columnIndex, store) { 
       	  metadata.attr='style="white-space:normal;background-color:#f1f2f4;"';
       	  return  data ;
       };
        
    var Funccm = new Ext.grid.ColumnModel([   
        { "header":"属性标签","width":81,canEdit:true,"sortable":true,"dataIndex":"LABEL",renderer:labelRenderer },
	{ "header":"名称","width":195,canEdit:false,"sortable":true,"dataIndex":"CNNAME"},
	{ "header":"值","width":291,canEdit:true,"sortable":true,"dataIndex":"VALUE",renderer:remarkRenderer}
	//,{ "header":"",hidden:true,"width":85,"sortable":true,"dataIndex":"KIND"}
    ]);
   var reader = new Ext.data.ArrayReader({}, [
       {name: 'LABEL'},
       {name: 'CNNAME'},
       {name: 'VALUE' },
       {name: 'KIND'} 
    ]);
   var initData = [ ['赋值变量','mypara','设置函数返回值的变量',,,,], ['调用函数',,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,],[,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,], [,,,,,,]];
   var Funcds = new Ext.data.Store({
            reader: reader,
            pageSize:-1,
            data:initData
        }) 
    var FuncCancel=function(){
    	canCollapse=true;   
    	Func.collapse();
    }; 
    var FuncOk=function(){
    	var val='';
    	for(var i=1;i<Funcds.getCount();i++){
    	  var r=Funcds.getAt(i);
    	  val+=r.get('CNNAME');
    	  if(i==1)val +=  '(';
    	  else if(i==Funcds.getCount()-1) val +=')'
    	  else val+=',';
    	}
    	Func.setValue(val);
    	canCollapse=true;   
    	Func.collapse();
    }; 
    var tbar = new Ext.Toolbar({ autoWidth:true,autoShow:true,
	     items:['->',{cls:'x-btn-text-icon',text:'ok',icon:'../images/commit.png',handler:FuncOk},{cls:'x-btn-text-icon',text:'cancel',icon:'../images/cross.gif',handler:FuncCancel}]
    });
    var FuncPanel=new Ext.grid.EditorGridPanel({
    	    clicksToEdit:1,   
            ds: Funcds,   
            cm: Funccm,   
            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),   
            title:'',   
            region:'center',   
            height:200,
            width:420,
            bbar:tbar   
    }); 
    var editers={};
     var getFormulaEditer = function(){
    	var fd_formula=new Asiainfo.widget.Formula({id:'formula',para:paraMgr.getParaCNNames()});
    	return new Ext.grid.GridEditor(fd_formula.control);
    };
    var getParaListEditer =function(){
    	var fd_para = Asiainfo.widget.getComboxField({listeners:{change:fieldChang,blur:fieldChang},storesql:paraMgr.getParaCNNames()})
    	return new Ext.grid.GridEditor(fd_para);
    };
    var getFunListEditer =function(){
      var fd_fn = Asiainfo.widget.getComboxField({listeners:{change:fieldChang,blur:fieldChang},storesql:funMgr.getFunList()})
      fd_fn.on("beforedestroy" ,function( Editor,value,startValue){return false;})
      return new Ext.grid.GridEditor(fd_fn);
    };
    var getCellEditer=function(row){
      if(editers[row]) return editers[row];
      if(row==1)  editers[row]=getFunListEditer()
      else if(row==0)  editers[row]=getFormulaEditer()
      else editers[row] = getParaListEditer();
      return editers[row];	
    };
    FuncPanel.on('afteredit',function(cell){
       Funcds.commitChanges();
        
       if(cell.row!=1 && cell.column!=1) return;
       var fun= funMgr.getFunBycnname(cell.value);
       if(!fun) return;
        
       Funcds.getAt(cell.row).set('VALUE',fun.remark+','+fun.name);
       while(Funcds.getCount()>(fun.param.length+2)){
          var r= Funcds.getAt(Funcds.getCount()-1);
          Funcds.remove(r);
       };
       while(Funcds.getCount()<(fun.param.length+2)){
       	  var r= Funcds.getNewRecord();
       	  r.set('KIND','2.参数信息');
       	  Funcds.add(r);
       };
       for(var i=0;i<fun.param.length;i++){
       	  var r= Funcds.getAt(i+2);
       	   r.set('LABEL',fun.param[i].cnname);
       	   r.set('VALUE',fun.param[i].type);
       };
   
    });
    FuncPanel.on('cellclick',function(grid, rowIndex, columnIndex, e){ 
    	
    	if(columnIndex==0 || columnIndex==2) return false;
        
         
    	grid.colModel.setEditor(columnIndex,getCellEditer(rowIndex));
    	return true;
    	 
    });
    Func.on("expand",function(){
    	canCollapse=false;   
    
        FuncPanel.render('grd'+this.id);   
    });   
    Func.on("collapse",function(){  
    	if(!canCollapse) Func.expand()
    	else this.fireEvent('change',this,this.getRawValue(),''); 
    });  
    Func.on("beforedestroy",function(){
    	alert('kk');
    	tbar.destroy();  
    	FuncPanel.destroy();
    }); 
    
    this.control = Func;   
    return this;
   }
    
};  
    
    
    