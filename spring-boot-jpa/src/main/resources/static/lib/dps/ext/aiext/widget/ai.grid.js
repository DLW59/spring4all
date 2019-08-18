Ext.namespace("Asiainfo.widget.Grid");
Asiainfo.widget.Grid = function(config) {
    this.cfg = config || {};
    if(config.cfgcode)
        this.loadcfg(config.cfgcode);
    if(this.cfg) {

        this.store = this.cfg.store;
        this.create();
    }
    return this;

};

Asiainfo.widget.Grid.prototype = {
    loadcfg:function(COMCODE) {
        var obj_cfg = _main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));
        //var str="function columnRenderer(v, metadata, record, rowIndex, colIndex, store) {var code = '<span style=\"color:'; if(v<='25'){ code += '#008000';}else if(v>'25' && v<='30'){code += '#CC6600';}else if(v>'30'){code += '#804000';}return code+';\">'+v+'</span>'; } ";
        if(!obj_cfg || !obj_cfg.get('CFG')) {
            alert('表格配置错误');
            return
        }
        ;
        var subtype = obj_cfg.get('TYPE');
        this.store = _main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));
        if(!this.store) {
            alert('表格配置错误');
            return
        }
        ;

        var str = obj_cfg.get('CFG').substr(4);

        colModel = Ext.decode(str);
    },
    create:function() {
        this.cfg.clicksToEdit = 1;

        for(var i = 0; i < this.cfg.columns.length; i++) {

            if(this.cfg.columns[i].renderfun) {
                var fun = this.cfg.columns[i].renderfun;
                try {
                    var obj = Ext.decode(this.cfg.columns[i].renderfun);
                    fun = obj.render;
                }
                catch(e) {
                }
                ;
                var funstr = "this.cfg.columns[i].renderer=function my_renderer(v,  metadata, record, rowIndex, colIndex, store){" + fun + "}";
                try {

                    eval(funstr);

                }
                catch(e) {
                    alert('字段转换函数错误:' + funstr)
                }
            }
            ;

            for(var j = 0; j < this.store.recordFields.length; j++) {

                if(this.cfg.columns[i].dataIndex == this.store.recordFields[j].name && this.store.recordFields[j].type == 'date') {
                    //begin add by wangc 实现对时间格式的可配置
                    if(this.cfg.columns[i].dateformat)
                        this.cfg.columns[i].renderer = Ext.util.Format.dateRenderer(this.cfg.columns[i].dateformat);
                    else
                    //end add by wangc
                        this.cfg.columns[i].renderer = Ext.util.Format.dateRenderer('Y-m-d');
                    if(this.cfg.subtype == 'edgrid' && this.cfg.columns[i].canEdit) this.cfg.columns[i].editor = new Ext.form.DateField({format:'Y-m-d'})
                }

                else if(!this.cfg.columns[i].editor && this.cfg.columns[i].dataIndex == this.store.recordFields[j].name && this.cfg.columns[i].canEdit)
                    this.cfg.columns[i].editor = this.getcolEditor(this.cfg.columns[i]);
            }
        }
        ;


        var sm_gd_result = new Ext.grid.RowSelectionModel({listeners:{rowselect:function(sm, row, rec) {
                if(typeof(dataManager) != 'undefined' && typeof(dataManager) != null)
                    dataManager.fresh(null, this.control, row);

                if(this.control.clickfun && this.control.clickpara)
                    Asiainfo.widget.actfun(this.control.clickfun, this.control.clickpara)
            }
            }}
        );

        this.cfg.sm = sm_gd_result;

        if(this.cfg.showcheck) {
            var singselect = false;
            if(this.cfg.showcheck == 'y') var singselect = false
            var smck_gd = new Ext.grid.CheckboxSelectionModel({singleSelect:singselect, listeners:{rowselect:function(sm, row, rec) {
                    if(typeof(dataManager) != 'undefined' && typeof(dataManager) != null)
                        dataManager.fresh(null, this.control, row);
                    if(this.control.clickfun && this.control.clickpara)
                        Asiainfo.widget.actfun(this.control.clickfun, this.control.clickpara)
                }
                }}
            );
            this.cfg.columns = this.cfg.columns.insertAt(0, smck_gd);
            this.cfg.sm = smck_gd;

        }
        ;
        if(this.cfg.store.pageSize != -1 && !this.cfg.bbar) this.cfg.bbar = new Ext.PagingToolbar({width:360, border:false, pageSize:this.store.pageSize, store:this.store, displayInfo:true, displayMsg:'共<b><font color=red>{2}</font></b>条', emptyMsg:"<b><font color=red>没有数据</font></b>"})
        if(this.cfg.subtype == 'ghgrid') {
            baseFun.loadScript('/'+contextPath+'/sysmgr/asiainfo/grid/GroupHeaderPlugin.css', 'css');
            baseFun.loadScript('/'+contextPath+'/sysmgr/asiainfo/grid/GroupHeaderPlugin.js');
            this.cfg.colModel = new Ext.grid.ColumnModel({columns:this.cfg.columns});
            this.cfg.colModel.rows = this.cfg.rows;
            //this.cfg.viewConfig={forceFit:true};
            this.cfg.plugins = new Ext.ux.plugins.GroupHeaderGrid();
            this.cfg.columns = null;

        }
        else if(this.cfg.subtype == 'expandgrid' ||this.cfg.subtype =='group-expand-grid') {
        	
            baseFun.loadScript('/'+contextPath+'/sysmgr/asiainfo/grid/RowExpander.js');

            var expander = new Ext.grid.RowExpander({
                tpl:new Ext.Template(this.cfg.expandFieldText)   })
            this.cfg.columns.splice(0, 0, expander);
            this.cfg.plugins = expander;
            this.expander=expander;
        }
        else if(this.cfg.subtype == 'groupgrid' || this.cfg.subtype == 'edgroupgrid' || this.cfg.subtype =='group-expand-grid') {
            this.ExtendToGroupStroe();
            if(!this.cfg.view) {
                this.cfg.view = new Ext.grid.GroupingView({
                    //forceFit:true,
                    enableRowBody:true,
                    groupTextTpl:'{text} ({[values.rs.length]} {[values.rs.length > 1 ? "items" : "Item"]})'
                })
            }

        }


        if(this.cfg.subtype == 'edgrid' || this.cfg.subtype == 'edgroupgrid') var gd_result = new Ext.grid.EditorGridPanel(this.cfg)
        else  var gd_result = new Ext.grid.GridPanel(this.cfg);
        if(sm_gd_result) sm_gd_result.control = gd_result;
        if(smck_gd) smck_gd.control = gd_result;
        gd_result.clickpara = this.cfg.clickpara;
        gd_result.clickfun = this.cfg.clickfun;
        if(this.cfg.clickfun) {
            gd_result.clickpara = this.cfg.clickpara;
            gd_result.clickfun = this.cfg.clickfun;
        }
        ;
        if(this.cfg.dblclickfun) {
            gd_result.dblclickpara = this.cfg.dblclickpara;
            gd_result.dblclickfun = this.cfg.dblclickfun;
            gd_result.on("dblclick", this.dblClick);
        }
        ;

        if(this.store.pageSize != -1) {

            var pa = {params:{start:0, limit:this.store.pageSize}};
            this.store.load(pa);
        }
        ;
        ///远程排序功能
        gd_result.on('headerdblclick', function(Grid, Number, e) {
            var cm = Grid.getColumnModel();
            Grid.store.select();
        });
        if(dataManager) dataManager.bindCmp(this.store, gd_result, 'Grid');
        this.control = gd_result;

    },
    getcolEditor:function(c) {
        var fd = new Ext.form.TextField();

        if(c.editcfg) {
            fd = Asiainfo.widget.getField(c.editcfg);
            return fd
        }
        ;
        if(!this.cfg.editers) return fd;
        for(var i = 0; i < this.cfg.editers.length; i++) {
            if(this.cfg.editers[i].dataIndex == c.dataIndex) {
                fd = Asiainfo.widget.getField(this.cfg.editers[i]);
                return fd
            }
        }
        ;
        return new Ext.form.TextField();
    },
    requery:function(sql, fieldname, dbname) {
        if(!sql) return;
        this.store.sql = sql;
        if(dbname) this.store.dataSource = dbname;
        this.store.select();
        fieldNames = fieldname.split(',');
        var cm = new Ext.grid.ColumnModel(this.store.columnModel.config);
        this.control.reconfigure(this.store, cm);
        this.control.colModel.setHidden(0, true);
        for(var i = 1; i < this.control.colModel.getColumnCount(); i++) {

            this.control.colModel.setColumnWidth(i, 150);
            if(i > 0 && i <= fieldNames.length)  this.control.colModel.setColumnHeader(i, fieldNames[i - 1]);
            if(this.store.recordFields[i].type == 'date') {
                this.control.colModel.setRenderer(i, dateRender);
            }
        }
    },
    ExtendToGroupStroe:function() {
        Asiainfo.data.AsiaInfoJsonStore.prototype.clearGrouping = function() {
            this.groupField = false;
            if(this.remoteGroup) {
                if(this.baseParams) {
                    delete this.baseParams.groupBy;
                }
                this.reload();
            } else {
                this.applySort();
                this.fireEvent('datachanged', this);
            }
        };
        Asiainfo.data.AsiaInfoJsonStore.prototype.groupBy = function(field, forceRegroup) {
            if(this.groupField == field && !forceRegroup) {
                return;
            }
            this.groupField = field;
            if(this.remoteGroup) {
                if(!this.baseParams) {
                    this.baseParams = {};
                }
                this.baseParams['groupBy'] = field;
            }
            if(this.groupOnSort) {
                this.sort(field);
                return;
            }
            if(this.remoteGroup) {
                this.reload();
            } else {
                var si = this.sortInfo || {};
                if(si.field != field) {
                    this.applySort();
                } else {
                    this.sortData(field);
                }
                this.fireEvent('datachanged', this);
            }
        };
        Asiainfo.data.AsiaInfoJsonStore.prototype.applySort = function() {
            Ext.data.GroupingStore.superclass.applySort.call(this);
            if(!this.groupOnSort && !this.remoteGroup) {
                var gs = this.getGroupState();
                if(gs && gs != this.sortInfo.field) {
                    this.sortData(this.groupField);
                }
            }
        };
        Asiainfo.data.AsiaInfoJsonStore.prototype.applyGrouping = function(alwaysFireChange) {
            if(this.groupField !== false) {
                this.groupBy(this.groupField, true);
                return true;
            } else {
                if(alwaysFireChange === true) {
                    this.fireEvent('datachanged', this);
                }
                return false;
            }
        };
        Asiainfo.data.AsiaInfoJsonStore.prototype.getGroupState = function() {
            return this.groupOnSort && this.groupField !== false ?
                (this.sortInfo ? this.sortInfo.field : undefined) : this.groupField;
        };

        this.store.sortInfo = {field:this.cfg.groupField, direction:'ASC'};
        this.store.groupField = this.cfg.groupField;
        this.store.groupBy(this.cfg.groupField, true);
    },

    dblClick:function() {
        var para = this.dblclickpara;

        if(this.store && this.store.curRecord) {
            var data = this.store.curRecord.data;
            for(var key in data) {
                var _data = data[key];
                if(typeof _data == 'string')
                    _data = _data.replaceAll(',', '%&');
                para = para.replaceAll('{' + key + '}', _data);
            }
        }
        ;
        Asiainfo.widget.actfun(this.dblclickfun, para)
    },
    RefreshView:function() {
        if(this.store.getCount() > 0)
            this.comobj.getSelectionModel().selectFirstRow();
    }
};
 