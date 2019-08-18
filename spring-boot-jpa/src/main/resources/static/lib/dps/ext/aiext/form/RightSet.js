 function ShowRightSet(){
  var modelcode= Asiainfo.GerUrlInfo(window.location,'Pathname');
  function CheckComExists(objid){
   var result=false;
    for(var i=0;i<ds_temp.getCount();i++){
      var r=ds_temp.getAt(i);
      if(r.get('PARANAME')==objid) {result= true;break;}
    }
    return result;
  };
  function ImportViewComp(){
    var all = Ext.ComponentMgr.all.items;
    var tip='';
    Ext.each(all,function(o,i,all){
	 var xtype=o.getXType();
	 var cnname='';
	 if(o.fieldLabel) cnname=o.fieldLabel
	 else if(o.text) cnname=o.text
	 else if(o.title) cnname=o.title;
	 if((o.isXType('field') || xtype=='button' ||o.isXType('editorgrid'))&& o.id.indexOf('_searwin_')==-1 && !CheckComExists(o.id)){
	 if(o.id.indexOf('ext-comp')!=-1) tip+='['+o.id+','+cnname+','+xtype+']'
	 else{
	 var rec = ds_temp.newRecord();
	 rec.set('MODELCODE',modelcode);
	 rec.set('PARANAME',o.id);
	 rec.set('REMARK',o.rightrule);
	 rec.set('TYPE',xtype);
	 rec.set('CNNAME',cnname);
	 rec.set('DEFAULT',o.disabled);
	 ds_temp.add(rec);
	}
	}
    });
    fd_tip.setValue('以下对象没有设置ID,无法设置权限:'+ tip);
  };
  function SetPara(){
    var para="";
    for( var i=0;i<Ext.StoreMgr.getCount();i++){
    	var store=Ext.StoreMgr.itemAt(i);
    	if(!store.storeId) continue;
    	for(var j=0;j<store.recordFields.length;j++){
    	  para+="'{"+store.storeId+'.'+store.recordFields[j].name+"}', "
    	}
    	para+='\n';  
    }
    fd_para.setValue(para);
  };
  var ds_temp = new Asiainfo.data.AsiaInfoJsonStore({
	     sql:"select MODELCODE, PARANAME,CNNAME,TYPE,DEFAULT1,VAL,REMARK from METAMODELCFG where modelcode='"+modelcode+"'",
	     initUrl:'/'+contextPath+'/newrecordService',
	     url:'/'+contextPath+'/newrecordService',
	     root:'root',
	     table:'METAMODELCFG',
	     loadDataWhenInit:true,
	     key:'MODELCODE,PARANAME'
      });
 var sm_gd_control = new Ext.grid.RowSelectionModel({listeners: {rowselect: function(sm, row, rec) {dataManager.fresh(null,gd_control,row)}}});
  var gd_control = new Ext.grid.EditorGridPanel({
  	     id:'_searwin_rightgrid',
	     store:ds_temp,
	     sm:sm_gd_control,	
             region:'center', 
	     clicksToEdit:1, 
	     columns: [
	     {id:'PARANAME',header: "参数名称", width:100,sortable:true,dataIndex: 'PARANAME'},
	     {header: "中文名称", width:100,sortable:true, dataIndex: 'CNNAME'},
	     {header: "类型", width:100,sortable:true, dataIndex: 'TYPE'},
	     {header: "默认只读", width:100,sortable:true, dataIndex: 'DEFAULT'},
	     {header: "赋权对象", width:100,sortable:true, dataIndex: 'VAL'},
	     {header: "赋权规则", width:100,sortable:true, dataIndex: 'REMARK'}
	             ] 
	     });
   
 var fd_val= new Ext.form.TriggerField({
   id:'_searwin_rightto1',ds:ds_temp,name:'VAL',listeners:{change:fieldChang}, fieldLabel:'指派给', name:'VAL', anchor:'95%', height:21, triggerClass : 'x-form-search-trigger',  allowBlank:false 
 });
searchWin.AddTrigfield(fd_val,"SELECT USECNNAME AS VALUES1,USERNAME as VALUES2  FROM METAUSER WHERE 1=1");

var fd_remark = new Ext.form.TextArea({
	     fieldLabel:'权限规则',
	      id:'_searwin_rightrule',
	      ds:ds_temp,name:'REMARK',
	      listeners:{change:fieldChang},
	     anchor:'95%',
	     height:80,
	     allowBlank:true
 }); 
 var fd_tip = new Ext.form.TextArea({
	     fieldLabel:'提示',
	      id:'_searwin_righttip', 
	     anchor:'95%',
	     height:80,
	     allowBlank:true
 }); 
  var fd_para = new Ext.form.TextArea({
	     fieldLabel:'可用变量',
	      id:'_searwin_rightpara', 
	     anchor:'95%',
	     height:120,
	     allowBlank:true
 });
  SetPara();
  var fm=new Ext.FormPanel({split:true,height:200,width:350,labelWidth:60,region:'east', items:[fd_val,fd_remark,fd_tip,fd_para]});	
  var controlwin = new Ext.Window({   
        title: "信息",    
        width: 800,
        height:400,
        layout: 'border',
        plain:true,
        modal: true,
        bodyStyle:'padding:1px;',
        buttonAlign:'center',
             items: [gd_control,fm],   
             buttons: [
             {   
                text: "删除当前记录",
                id:'_searwin_import', 
                handler:function(){
                  Ext.Msg.confirm('信息','确定要删除当前记录吗?',function(btn){
		   if(btn=='yes'){
                   var rec = ds_temp.curRecord;
                   ds_temp.remove(rec);
                   dataManager.fresh(ds_temp,null,ds_temp.itemindex);
                   ds_temp.commit();
                }   
                  })
                },   
                scope: this  
            },{   
                text: "导入界面元素",
                id:'_searwin_import', 
                handler:function(){ImportViewComp()},   
                scope: this  
            },
            {   
                text: "确定", 
                id:'_searwin_rok',
                handler:function(){ds_temp.commit(); fm.destroy();controlwin.destroy()},   
                scope: this  
            }, {   
                text: "退出",   
                id:'_searwin_rcancel',
                handler: function(){ fm.destroy();controlwin.destroy()},   
                scope: this  
            }]   
     });
  dataManager.bindCmp(ds_temp,fd_val,'Field');
  dataManager.bindCmp(ds_temp,fd_remark,'Field');
  dataManager.bindCmp(ds_temp,gd_control,'Grid');
  controlwin.show();  
};
 
