Ext.namespace("Ext.form");

Ext.form.asiaInfoCombox = function(_singleSelect){
		
		this.title = 'VALUES1';
		this.content = 'VALUES2';
		this.remark = 'VALUES3'
		this._focus;//当前被挂住的元素
		_this = this;
		this.pageSize = 8;
		
		this.store = new Ext.data.JsonStore({
			baseParams:{initSql:''},
			url:"/"+window.location['pathname'].split('/')[1]+"/newrecordService?command=query",
			totalProperty:"count",
			root:"root",
			fields:[this.title,this.content,this.remark]
		});
		
		
		this.keyWord = new Ext.form.TextField({
			fieldLabel:'搜索关键字',
			name:'keyWord',
			id:'keyWord'
		});

		this.sm = new Ext.grid.CheckboxSelectionModel({
		    	singleSelect:_singleSelect
		});
		
		this.cm = new Ext.grid.ColumnModel([
			this.sm,
			{
	           header: 'NAME',
	           dataIndex: this.title,
	           width:150
        	},{
	           header: 'CNNAME',
	           dataIndex: this.content,
	           width:150
        	},{
	           header: 'REMARK',
	           dataIndex: this.remark,
	           width:150
        	}
        ]);
		
		this.grid = new Ext.grid.GridPanel({
		    store:this.store,
		    cm:this.cm,
		    sm: this.sm,
		    bbar: new Ext.PagingToolbar({
	            pageSize: 8,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Displaying topics {0} - {1} of {2}',
	            emptyMsg: "No topics to display"
	        }),
	        
	        autoHeight:true
	       
		});
		
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
		
		this.searchBtn = new Ext.Button({
			text:'搜索',
			minWidth :40,
			disabled :true,
			handler:function(){
				// what the /\s/ mean (in regex) is the any of white invisible character
				v = _keyWord.getValue().replace(/(^\s*)|(\s*$)/g,'');//remove all white space(just support english space)
				tsql = _store.templateSQL;
				s = tsql+" AND ("+tsql.split(/\s+/)[1]+" LIKE '%"+v+"%'";
				sec_s = tsql.split(",")[1];//如果原始SQL中包含逗号
				if(sec_s)
					s = s+" OR "+sec_s.replace(/(^\s*)|(\s*$)/g,'').split(/\s+/)[0]+" LIKE '%"+v+"%'";
				s+=")";
				_store.baseParams.initSql = s;
				_store.load({params:{initSql:s,start:0,limit:8}});
			}
		});
		
		this.confirmBtn = new Ext.Button({
			text:'确定',
			minWidth:40,
			disabled :true,
			handler:function(){
				v = _keyWord.getValue();
				rs = _this.sm.getSelections();
				if(!rs || rs.length==0){
					Ext.Msg.alert('ERROR!!!','必须选择一条记录！');
					return;
				}
				if(!_this._focus)
					alert("this._focus竟然为空");
				else if(_this._focus.onConfirmBtnCallBack){
					_this._focus.onConfirmBtnCallBack(_this._focus,rs,_this.keyWord);
				}
				else
					_this._focus.setValue(v);
				_this.win.hide();
			}
		});
		
		this.store.on('load',function(s,rs,os){
			_this.searchBtn.enable();
			_this.confirmBtn.enable();
		})
		
		this.store.on('beforeload',function(s,os){
			_this.searchBtn.disable();
			_this.confirmBtn.disable();
		})
		
		this.closeBtn = new Ext.Button({
			text: '关闭',
			handler:function(){
				_this.win.hide();
			}
		});
		
		this.formPanel = new Ext.form.FormPanel({
			frame:true,
     		title: '查询列表',
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
            },this.grid]
		});
		
		this.win = new Ext.Window({
			//el:div_id,
			layout:'fit',
		    width:500,
		    height:330,
		    closeAction:'hide',
		    plain: true,
			  items: [this.formPanel],/*
		    buttons: [this.closeBtn],*/
		    modal:true
		});
		
		this.win.on('beforeshow',function(w){
			_this.store.removeAll();
		})
		
		this.e_func = function(trigger_e,sql_second){
			_this.store.baseParams={initSql:sql_second};
			_this.store.templateSQL = sql_second;
			_this.store.load( {params:{start:0,limit:8}} );
			_this.win.show(_this);
			_this._focus = trigger_e;
		};
		
		this.bindEvent = function(trigger_e,event_name,sql_second,type){
			if( !type || type=='event')
				trigger_e.on(event_name,function(){_this.e_func(trigger_e,sql_second)});
			else if( type=='property' ){
				trigger_e[event_name] = function(){_this.e_func(trigger_e,sql_second)};
			}
		}
		
		//用户自定义方法，当点击确定关闭时会调用func
		this.postCallBack=function(trigger_e,func){
			trigger_e.onConfirmBtnCallBack = func;
		}
};

searchWin = function(){
	
	return {
		//这是一个单例模式下的属性
	    acx : new Ext.form.asiaInfoCombox(true),
	    /*
	    	SearchWin封装函数,专做TriggerField的事件触发
	    */
		AddTrigfield : function(trigger_fd,initSql,call_back){
			acx = searchWin.acx;
			acx.bindEvent(trigger_fd,'onTriggerClick',initSql,'property');
			acx.postCallBack(trigger_fd,call_back);
		}
	}
}();