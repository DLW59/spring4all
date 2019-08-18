Ext.namespace("Asiainfo.widget.PivotGrid");
Asiainfo.widget.PivotGrid = function(config){
	this.cfg= config||{};
	if(this.cfg) this.store=this.cfg.store;
	
	this.cfg.rootVisible  = false;
	this.create();
	return this;
};
Asiainfo.widget.PivotGrid.prototype={
	create:function(){
        var _columns=[];
      	var _readerArray=[];
      	var ds_dept;
      	var editDataIndex='';
      	var oldstroeId=this.cfg.store.storeId;
      	var store = this.store;
      	var rowfield=store.rowfield;
      	var colfield=store.colfield;
      	var _username=store.collect(colfield);
      	 //动态生成多表头
      	
      	//生成新的列名      		
      	for(var i=0;i<this.cfg.columns.length;i++){
      		var r=this.cfg.columns[i];
      		if(r.caltype != 'pivot'){
      			_columns.push(r);
      			_readerArray.push("{name:'"+this.cfg.columns[i].dataIndex+"'}");	
      		}else{
      			ds_dept = Asiainfo.getStore(r.transsql);  
      			editDataIndex= this.cfg.columns[i].dataIndex;  			
      		}
      	}
      	var storeKeys=ds_dept.fields.keys;
      	for(var i=0;i<_username.length;i++){
      		var usercname,usercnameIndex;
      		usercnameIndex=ds_dept.findBy(function(record){
      				return record.get(storeKeys[0])==_username[i];
      				});
      		if(usercnameIndex != -1){
      			usercname=ds_dept.getAt(usercnameIndex).get(storeKeys[1]);
      		}else{
      			usercname=_username[i];
      		}
      		_columns.push({header:usercname,width:100,sortable:true,dataIndex:_username[i],editor:new Ext.form.TextField()});
      		_readerArray.push("{name:'"+_username[i]+"'}");
      	}
      	_readerArray=Ext.decode("["+_readerArray+"]");

      	var TopicRecord = Ext.data.Record.create(_readerArray);
      	var reader = new Ext.data.ArrayReader({},_readerArray);
		var initData=[];
      	var pivotStore=new Ext.data.Store({
      		reader:reader,
      		loadDataWhenInit:false,
      		pageSize:-1,
      		parent_id_field_name:this.cfg.store.parent_id_field_name,
		key_field_name:this.cfg.store.key_field_name,
		leaf_field_name:this.cfg.store.leaf_field_name,
      		storeId:this.cfg.store.storeId+'_pivot',
      		data:initData
      	});
      	
      	pivotStore.recordFields=_readerArray;
      	store.sort(rowfield,'ASC');
      	var prerow='';
      	for(var i=0;i<store.getCount();i++){
      		var r=store.getAt(i);
      		if(prerow!=r.get(rowfield)){
      			var newr= new TopicRecord({});
      			
      			for(var j=0;j<this.cfg.columns.length;j++){
      				var g=this.cfg.columns[j];
      				if(g.caltype != 'pivot'){
      					newr.set(g.dataIndex,r.get(g.dataIndex));
      				}else{
      					newr.set(r.get(colfield),r.get(g.dataIndex));
      				}
      			}
      			//pivotStore.add(newr);
      		}else{
      			for(var j=0;j<this.cfg.columns.length;j++){
      				var g=this.cfg.columns[j];
      				if(g.caltype == 'pivot'){
      					newr.set(r.get(colfield),r.get(g.dataIndex));
      				}
      			}
      		}
      		pivotStore.add(newr);
      		prerow=r.get(rowfield);
   		};
      	pivotStore.commitChanges();
        this.cfg.subtype='gridtree';
        this.cfg.columns=_columns;
        this.cfg.store=pivotStore;
       
      	var gd_result = new Asiainfo.widget.TreeGrid(this.cfg);
      	
      	this.control=gd_result.control;
      	this.control.on('afteredit',function(e){
	var oldstore=Ext.StoreMgr.get(oldstroeId);
	  var oldstoridx=oldstore.findBy(function(record){
      		 return record.get(rowfield)== e.record.get(rowfield) && record.get(colfield) == e.field;
      	  });
      	 oldstore.getAt(oldstoridx).set(editDataIndex,e.value);
	 });
   	}
};