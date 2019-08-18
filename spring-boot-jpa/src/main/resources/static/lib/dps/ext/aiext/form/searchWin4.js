Ext.namespace("Ext.form");

Ext.form.asiaInfoCombox = function(_singleSelect){

		this.title = 'VALUES1';
		this.content = 'VALUES2';
		this.remark = 'VALUES3'
		this._focus;//当前被挂住的元素
		_this = this;
		this.pageSize = 20;

		this.store = new Ext.data.JsonStore({
			baseParams:{initSql:''},
			url:"/"+window.location['pathname'].split('/')[1]+"/newrecordService?command=query",
			totalProperty:"count",
			root:"root",
			fields:[this.title,this.content,this.remark]
		});

		var input_histroy_store_data = [];

		var input_histroy_store = new Ext.data.SimpleStore({
			autoLoad:false,
		fields: ['keyword'],
		data:input_histroy_store_data
	    });

		this.keyWord = new Ext.form.ComboBox({
			fieldLabel:'搜索关键字',
			name:'keyWord',
			id:'_searwin_keyWord',
			mode: 'local',
			displayField:'keyword',
			store: input_histroy_store,
			forceSelection:false,
			listeners:{
				specialkey:function(f,ent){
					if(ent.getKey() == ent.ENTER){
						searchBtn_handler();
					}
				}
			}
		});

		this.sm = new Ext.grid.CheckboxSelectionModel({
			singleSelect:_singleSelect||false
		});

		this.cm = new Ext.grid.ColumnModel([
			this.sm,
			{
		   header: '编号',
		   dataIndex: this.title,
		   width:230
		},{
		   header: '名称',
		   dataIndex: this.content,
		   width:130
		},{
		   header: '备注',
		   dataIndex: this.remark,
		   hidden:true
		   //width:0
		}
	]);

		this.grid = new Ext.grid.GridPanel({
		    id:'_searwin_grid',
		    store:this.store,
		    cm:this.cm,
		    sm: this.sm,
		    bbar: new Ext.PagingToolbar({
		    pageSize: 20,
		    store: this.store,
		    displayInfo: false,
		    //displayMsg: 'Displaying topics {0} - {1} of {2}',
		    emptyMsg: "No topics to display"
		}),

		//autoHeight:true
		height:310,
		width:400
		});
		/*************************************************************/
		var storeForSelection = new Ext.data.JsonStore({
			autoLoad :false,
			fields: [
				{name:"VALUES1","type":"string"},
				{name:"VALUES2","type":"string"},
				{name:"VALUES3","type":"string"}
			]
		});
		/*
		var sar = [];
		for(i=0;i<1;++i){
			sar.push([]);
		}
		storeForSelection.loadData(sar);
		*/
		this.sm2 = new Ext.grid.CheckboxSelectionModel({
			singleSelect:_singleSelect || false
		});

		this.cm2 = new Ext.grid.ColumnModel([
			this.sm2,
			{
		   header: '编号',
		   dataIndex: this.title,
		   width:200
		},{
		   header: '名称',
		   dataIndex: this.content,
		   width:0
		},{
		   header: '备注',
		   dataIndex: this.remark,
		   hidden:true,
		   width:0
		}
	]);
//
//		this.gridForKeepSelection = new Ext.grid.GridPanel({
//		    store:storeForSelection,
//		    cm:this.cm2,
//		    sm: this.sm2,
//		    bbar: new Ext.PagingToolbar({
//		    pageSize: 8,
//		    store: storeForSelection,
//		    displayInfo: false,
//		    //displayMsg: 'Displaying topics {0} - {1} of {2}',
//		    emptyMsg: ""
//		}),
//		//autoHeight:true
//		height:245,
//		width:'100%'
//		});
	 this.gridForKeepSelection = new Ext.grid.GridPanel({
		store: storeForSelection,
		cm:this.cm2,
		sm: this.sm2,
	       // autoExpandColumn: 'VALUES2',
		bbar: new Ext.PagingToolbar({
		    pageSize: 20,
		    store: storeForSelection,
		    displayInfo: false,
		    //displayMsg: 'Displaying topics {0} - {1} of {2}',
		    emptyMsg: ""
		}),
		stripeRows: true,
		height:310,
		width:400
	});
		/*************************************************************/
		_keyWord = this.keyWord;
		_store = this.store;

		/*
		this.grid.on('cellclick',function(grid,rowIndex,columnIndex,e) {
		var record = grid.getStore().getAt(rowIndex);  // Get the Record
		var fieldName = grid.getColumnModel().getDataIndex(columnIndex); // Get field name
		var data = record.get(fieldName);
		_keyWord.setValue(data);
	})

	this.sm.on('rowselect',function(sm,index,record){
		r = _this.grid.getStore().getAt(index);
		_keyWord.setValue(r.get(_this.title));
	})
		*/

		var searchBtn_handler = function(){
			if(input_histroy_store_data.indexOf(_keyWord.getValue())==-1)
				input_histroy_store_data.push([_keyWord.getValue()]);
			input_histroy_store.loadData(input_histroy_store_data);
			// what the /\s/ mean (in regex) is the any of white invisible character
			v = _keyWord.getValue().replace(/(^\s*)|(\s*$)/g,'').toUpperCase();//remove all white space(just support english space) and to upper case
			tsql = _store.templateSQL;
			tsql='select * from ('+tsql+') a ';
			//s = tsql+" where (UCASE("+tsql.split(/\s+/)[1]+") LIKE '%"+v+"%'";
			s = tsql+" where "+ucase("VALUES1")+" LIKE '%"+v+"%' or "+ucase("VALUES2")+" LIKE '%"+v+"%' ";
			_store.baseParams.initSql = s;

			_store.load({params:{initSql:s,start:0,limit:20}});
		};

		this.searchBtn = new Ext.Button({
			text:'搜索',
			id:'_searwin_query',
			minWidth :40,
			//disabled :true,
			handler:searchBtn_handler
		});

		this.confirmBtn = new Ext.Button({
			text:'确定',
			id:'_searwin_ok',
			minWidth:40,
			//disabled :true,
			handler:function(){
				v = _keyWord.getValue();
				_this.sm2.selectAll();
				rs = _this.sm2.getSelections();

				if(!rs || rs.length==0){
					Ext.Msg.alert('ERROR!!!','必须选择一条记录！');
					return;
				}
				if(!_this._focus)
					alert("this._focus竟然为空");
				else if(_this._focus.onConfirmBtnCallBack){
					_this._focus.onConfirmBtnCallBack(_this._focus,rs,_this.keyWord);
				}
				else if(_this._focus.setValue){
				      var selval=rs[0].get('VALUES1');
				      for(var i=1;i<rs.length;i++)   selval+=","+rs[i].get('VALUES1');
				      fieldChang(_this._focus,selval,'');
				      _this._focus.setValue(selval);
				}
				if(_this.parentStore) _this.parentStore.curRecord.set(_this._focus.dataIndex,_this._focus.getValue());
				_this.win.hide();
			}
		});

		this.store.on('load',function(s,rs,os){
			_this.searchBtn.enable();
			_this.confirmBtn.enable();
		})

		this.store.on('beforeload',function(s,os){
		//	_this.searchBtn.disable();
	  //		_this.confirmBtn.disable();
		})

		this.closeBtn = new Ext.Button({
			text: '关闭',
			id:'_searwin_cancel',
			handler:function(){
				_this.win.hide();
			}
		});
		/********************Start************************/
		var leftBtn = new Ext.Button({
			id:'_searwin_left',
			text:'<',
			minWidth :5,
		    handler:function(button,event){
			rs = _this.sm2.getSelections();
			/*
			if(rs.length==0)
				return;
			*/
			for(i=0,l=rs.length;i<l;++i){
				storeForSelection.remove(rs[i]);
			}
		    }
		});

		var rightBtn = new Ext.Button({
			id:'_searwin_right',
			text:'>',
			minWidth :5,
			handler:function(button,event){
				//rs = _this.sm.getSelections();
				rs = _this.grid.getSelectionModel().getSelections();
				for(i=0,l=rs.length;i<l;++i){
					if(storeForSelection.find('VALUES2',rs[i].get('VALUES2'))==-1 || storeForSelection.find('VALUES1',rs[i].get('VALUES1'))==-1){
						storeForSelection.add(rs[i]);
					}/*
					else
						Ext.Msg.alert('小提示','此记录已有，无需再添加');
					*/
				}
		    }
		});

		var btnGrid = new Ext.Panel({
		    layout:'table',
		    defaults: {
			bodyStyle:'padding:10px'
			//bodyStyle:'margin: 5px 3px 5px 0'
		    },
		    layoutConfig: {
			columns: 1
		    },
		    items: [/*{
			colspan: 1
		    },*/{
			colspan: 2
		    },{
			colspan: 3,
			items:[leftBtn]
		    },{
			colspan: 4
		    },{
			colspan: 5,
			items:[rightBtn]
		    }]
		});
		/********************End************************/

		this.formPanel = new Ext.form.FormPanel({
		id:'_searwin_fm',
			frame:true,
		//title: '查询列表',
		items: [{
		layout:'column',
		items:[{
			columnWidth:.55,
			layout: 'form',
			border:false,
			items: [this.keyWord]
		    },{
			columnWidth:.20,
			layout:'form',
			border:false,
			items:[this.searchBtn]
		    },{
			columnWidth:.20,
			layout:'form',
			border:false,
			items:[this.confirmBtn]
		    }]
	    },{
		layout:'column',
		items:[{
			columnWidth:.5,
			layout:'form',
			border:false,
			items:[this.grid]
		},{
			columnWidth:.09,
			layout:'form',
			border:false,
			items:[btnGrid]
		},{
			columnWidth:.41,
			layout:'form',
			border:false,
			items:[this.gridForKeepSelection]
		}]
	    }],
	    width:'100%'
		});

		this.win = new Ext.Window({
			//el:div_id,
			title:'查询列表',
			layout:'fit',
		    width:850,
		    height:400,
		    closeAction:'hide',
		    plain: true,
			items: [this.formPanel],/*
		    buttons: [this.closeBtn],*/
		    modal:true
		});

		this.win.on('beforeshow',function(w){
			_keyWord.setValue('')
			_this.store.removeAll();
			storeForSelection.removeAll();
		})

		this.e_func = function(trigger_e,sql_second,db,storeId){
			if(db=='undefined') db='';

			//if(_this.store.templateSQL) sql_second=_this.store.templateSQL;
			_this.store.baseParams={initSql:sql_second,dataSource:db};
			_this.store.templateSQL = sql_second;
			_this.store.load( {params:{start:0,limit:20}} );
			console.log(9999);
			_this.win.show(_this);
			_this._focus = trigger_e;
			if(storeId) _this.parentStore = Ext.StoreMgr.get(storeId);
		};

		this.bindEvent = function(trigger_e,event_name,sql_second,type,dataSource,stroeId){
			if( !type || type=='event')
				trigger_e.on(event_name,function(){_this.e_func(trigger_e,sql_second,dataSource,stroeId)});
			else if( type=='property' ){
				trigger_e[event_name] = function(){_this.e_func(trigger_e,sql_second,dataSource,stroeId)};
			};
			trigger_e.store=_this.store;
		}

		//用户自定义方法，当点击确定关闭时会调用func
		this.postCallBack=function(trigger_e,func){
			trigger_e.onConfirmBtnCallBack = func;
		}
};

searchWin = function(){

	return {
		//这是一个单例模式下的属性
	    acx : new Ext.form.asiaInfoCombox(),
	    virtual_trigger_fd : {},
	    /*
		SearchWin封装函数,专做TriggerField的事件触发
	    */
	    //chengdong 加了dataSource属性,为了连接不同的数据库
		AddTrigfield : function(trigger_fd,initSql,call_back,dataSource,storeId){
			acx = searchWin.acx;
			acx.bindEvent(trigger_fd,'onTriggerClick',initSql,'property',dataSource,storeId);
			acx.postCallBack(trigger_fd,call_back);
		},

		init : function(call_back,sql,dataSource){
			acx = searchWin.acx;
			//一旦调用init就e_func了，f_func负责加载远程数据
			acx.e_func(searchWin.virtual_trigger_fd,sql,dataSource);
			acx.postCallBack(searchWin.virtual_trigger_fd,call_back);
			return searchWin.acx;
		}
	}

}();

