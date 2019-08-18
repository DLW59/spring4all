/**
 * 说明:loadDataWhenInit设置为true表示在初始化的时候加载数据，pageSize设置加载数据的条数,
 * 想加载数据库所有的数据，将loadDataWhenInit设置为true，pageSize设置为0或者不设置
 *
 * @author jason.cheng
 *
 * @param dataSource 数据库别名,表示连接那个数据库,与数据源配置的ID一致
 * @param table 表名
 * @param root 返回数据的根节点名称
 * @param sql 初始化store时所用的sql
 * @param url 请求路径，包含请求的参数
 * @param loadDataWhenInit 在初始化的时候是否加载数据
 * @param key 表的主键
 * @map 编码转换字段
 *  jsonstore在load函数时，如果有data,则忽略了url,否则必须配置url参数 完整的url = initUrl+
 */

Ext.namespace("Asiainfo.data");
Ext.Ajax.syncRequest = function(method, uri, callback, postData, showTips) {
    var conn = Ext.lib.Ajax.getConnectionObject().conn;
    conn.open("POST", uri, false);

// 这里的conn对象其实就是 xmlHttpRequest 对象。 

    conn.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    //Ext.urlEncode(postData);

    conn.send(Ext.urlEncode(postData));

    if(conn.responseText) {
        try {
            var result = conn.responseText;
            if(callback) {
                callback(result);
            }
            result = Ext.util.JSON.decode(conn.responseText);
            if(result.success == true) {
                if(showTips != false) Ext.Msg.alert("提示", postData.sMsg || result.msg);
            }
            else
                alert("错误, " + (postData.fMsg || result.msg));
        } catch(e) {
            alert("Exception,远程操作出错:");
        }
        ;
    } else {
        Ext.Msg.alert("Exception", "远程无结果返回:");
    }

    return result.success;
}
Asiainfo.data.AsiaInfoJsonStore = function(c) {

    this.cache = {
        sql:[],
        save:[],
        remove:[],
        update:[]
    };
    this.curRecord;
    this.itemindex;
    store = this;
    this.config = c;
    key = '';
    this.map = c.map || null;
    this.pageSize = c.pageSize || 20;
    this.defaultValue = c.defaultValue;

    recordFields = '';
    this.oldSql = '';
    //c.sql = encodeURIComponent(c.sql);
    //为了解决URL中文传递问题，用了encodeURI函数，但传递+号变空格,先将SQL中的+号转换为@，在服务端替换回+
    //c.sql = c.sql.replace(/\+/g,'@');

    //为了解决URL中文传递问题，用了encodeURI函数，但传递&号截断sql的问题,先将SQL中的&号转换为$，在服务端替换回&
    //c.sql = c.sql.replace(/\&/g,'$');


    if(c.dataservice == "webservice")
        this.JsonStoreFromWebservice(c.initUrl)
    else {
        this.JsonStoreInit();
    }
    ;
    //定位到当前第一条记录
    if(this.getCount() > 0) {
        var record = this.getAt(0);
        this.curRecord = record;
        this.itemindex = this.indexOfId(record.id);
    }

}

Ext.extend(Asiainfo.data.AsiaInfoJsonStore, Ext.data.JsonStore, {
    JsonStoreInit:function() {
        var c = this.config;
        var method = 'POST';
        var initurl = c.initUrl + '?command=init&start=0&limit=' + c.pageSize + '&root=' + c.root + '&dataSource=' + c.dataSource + '&initSql=' + c.sql;

        var conn = Ext.lib.Ajax.getConnectionObject().conn;
        var hasWhere = initurl.match(/where/i) != null;

        var loadData = c.loadDataWhenInit;

        var orderCondtion = '';

        var orderIndex = initurl.lastIndexOf('order');

        if(orderIndex != -1)
            orderCondtion = initurl.substring(orderIndex, initurl.length);

        if((hasWhere) && (!loadData)) {
            if((orderIndex != -1))
                initurl = initurl.substring(0, orderIndex) + ' and 1=2 ' + orderCondtion;
            else
                initurl = initurl + ' and 1=2 ' + orderCondtion;
        }

        if((!hasWhere) && (!loadData)) {
            if((orderIndex != -1))
                initurl = initurl.substring(0, orderIndex) + ' where 1=2 ' + orderCondtion;
            else
                initurl = initurl + ' where 1=2 ' + orderCondtion;
        }

        if(this.map) {
            initurl += "&map=" + Ext.encode(this.map);
        }

        initurl = Asiainfo.URLEncode(initurl);

        conn.open(method, initurl, false);
        conn.send(null);

        if(conn.responseText == 'null') {
            alert('执行sql出错:' + c.sql);
            return
        }
        ;
        //if(conn.responseText.indexOf("错误")>0) {alert('执行sql出错:'+c.sql);return };
        if(conn.responseText && conn.responseText != 'null') {
            try {
                result = eval('(' + conn.responseText + ')');
            } catch(e) {
                Ext.Msg.alert("Exception", "在初始化store都时候发生错误:：" + conn.responseText);
                this.InitSuccess({fields:[]});
            }
            ;

            this.InitSuccess(result);

        }
        else
            this.InitFailure();
    },
    InitSuccess:function(result) {
        var c = this.config;
        _root = c.root || 'root';
        _totalProperty = c.totalProperty || 'count';
        _data = {};
        _data = result;

        if(this.oldSql == '')
            this.oldSql = c.sql;

        this.recordFields = result.fields;

        try {
            Asiainfo.data.AsiaInfoJsonStore.superclass.constructor.call(this, Ext.apply(c, {
                fields:result.fields || [],
                url:c.url,
                root:_root,
                totalProperty:_totalProperty,
                topicRecord:new Ext.data.Record.create(result.fields),
                columnModel:result.columnModel ? new Ext.grid.ColumnModel(result.columnModel) : null,
                data:_data,
                sql:this.sql || c.sql,
                map:this.map,
                dataSource:c.dataSource,
                table:c.table || c.sql.toUpperCase().split('FROM')[1].split(' ')[1]
            }));
        } catch(e) {
            alert('superclass.constructor. error:' + e + ",sql=" + c.sql);
        }
        return true;
    },
    InitFailure:function() {
        if(this && this.sql)
            Ext.Msg.alert('store初始化错误', 'sql语句： ' + this.sql);
    },
    JsonStoreFromWebservice:function(initurl, method) {
        var result = Asiainfo.remoteData(initurl);
        if(result && result != 'null') {
            try {

                result = eval('(' + result + ')');
            } catch(e) {
                Ext.Msg.alert("Exception", "在初始化store都时候发生错误:：" + initurl);
                this.InitSuccess({fields:[]});
            }
            ;
            this.InitSuccess(result);
        }
    },
    //把curRecord设置为store中的第index条
    locateRecord:function(index) {
        this.curRecord = Asiainfo.data.AsiaInfoJsonStore.superclass.getAt.call(this, index);
    },

    //新建一个record对象
    newRecord:function() {
        var TopicRecord = new Ext.data.Record.create(this.recordFields);

        var record = new TopicRecord({});

        return record;

    },

    load:function(options) {
        //在调用父类的load之前先将一些默认属性设置进config中

        var c = this.config;

        if(!options)
            options = {};
        var qrySql = this.sql;

        if(this.sortInfo && this.sortInfo.field) qrySql = "select * from (" + qrySql + " ) QryTab order by " + this.sortInfo.field + " " + this.sortInfo.direction;

        if((options.params)) {
            if(options.params.limit > 0) {
                options.params = Ext.apply(options.params, {command:'query',
                    initSql:qrySql,
                    tableName:this.tableName,
                    root:this.root,
                    dataSource:this.dataSource,
                    map:Ext.encode(this.map),
                    totalProperty:this.totalProperty,
                    start:options.params.start,
                    limit:options.params.limit});
            }
            else {
                options.params = Ext.apply(options.params, {command:'query',
                    initSql:qrySql,
                    tableName:this.tableName,
                    map:Ext.encode(this.map),
                    dataSource:this.dataSource,
                    root:this.root,
                    totalProperty:this.totalProperty});
            }

        }
        //options.params = Ext.apply(options.params,this.baseParams);
        Asiainfo.data.AsiaInfoJsonStore.superclass.load.call(this, options, false);


    },

    //保存记录到缓存
    add:function(r) {
        this.cache.save.push(r.data);
        Asiainfo.data.AsiaInfoJsonStore.superclass.add.call(this, r);
        this.curRecord = r;
        this.itemindex = this.indexOfId(r.id);
    },

    updateSql:function(sql) {
        //为了解决URL中文传递问题，用了encodeURI函数，但传递+号变空格,先将SQL中的+号转换为@，在服务端替换回+
        //this.sql = sql.replace(/\+/g,'@');
        //为了解决URL中文传递问题，用了encodeURI函数，但传递&号截断sql的问题,先将SQL中的&号转换为$，在服务端替换回&
        //this.sql = this.sql.replace(/\&/g,'$');
        this.sql = sql;
    },

    select:function() {

        //alert(this.sortInfo.field+','+this.sortInfo.direction);
        var qrySql = this.sql;
        if(this.sortInfo && this.sortInfo.field) qrySql = "select * from (" + qrySql + " ) QryTab order by " + this.sortInfo.field + " " + this.sortInfo.direction;

        var url = this.url + "?command=query&start=0&limit=" + this.pageSize + "&root=" + this.root + "&dataSource=" + this.dataSource + '&initSql=' + qrySql + '&taskid=' + new Date();
        if(this.map) {
            url += "&map=" + Ext.encode(this.map);
        }
        url = Asiainfo.URLEncode(url);

        var conn = Ext.lib.Ajax.getConnectionObject().conn;
        conn.open('GET', url, false);

        conn.send(null);

        if(conn.responseText && conn.responseText != 'null') {
            try {
                result = eval('(' + conn.responseText + ')');
            } catch(e) {
                Ext.Msg.alert("Exception", "在初始化store都时候发生错误，返回都字符串为：" + conn.responseText);
                this.InitSuccess({fields:[]});
            }
            ;
            this.InitSuccess(result);

            //定位到当前第一条记录
            if(this.getCount() > 0) {
                var record = this.getAt(0);
                this.curRecord = record;
                this.itemindex = this.indexOfId(record.id);
            }
        }
        else
            this.InitFailure();
    },

    select2:function() {
        var url = this.url + "?command=query&start=0&limit=" + this.pageSize + "&root=" + this.root + "&dataSource=" + this.dataSource;
        var conn = Ext.lib.Ajax.getConnectionObject().conn;
        conn.open('POST', url, false);
        conn.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        conn.send('initSql=' + encodeURIComponent(this.sql));
        if(conn.responseText && conn.responseText != 'null') {
            try {
                result = eval('(' + conn.responseText + ')');
            } catch(e) {
                Ext.Msg.alert("Exception", "在初始化store都时候发生错误，返回都字符串为：" + conn.responseText);
                this.InitSuccess({fields:[]});
            }
            ;
            this.InitSuccess(result);

            //定位到当前第一条记录
            if(this.getCount() > 0) {
                var record = this.getAt(0);
                this.curRecord = record;
                this.itemindex = this.indexOfId(record.id);
            }
        }
        else
            this.InitFailure();
    },

    remove:function(r) {
        //jason.cheng add 2009-5-8
        var isDelete;
        var isDeleteUpdate;

        //删除的时候，同步save,update缓存中的数据
        isDelete = this.synchronizeData(r, this.cache.save, false);
        isDeleteUpdate = this.synchronizeData(r, this.cache.update, false);

        //add end

        if(!isDelete && !isDeleteUpdate) {
            this.cache.remove.push(r.data);
        }

        //从store中删除

        Asiainfo.data.AsiaInfoJsonStore.superclass.remove.call(this, r);

        if(this.getCount() > 0) {

            var record = this.getAt(this.getCount() - 1);
            this.curRecord = record;
            this.itemindex = this.indexOfId(record.id);
        }


    },

    //更新方法，如果r存在于save缓存中则替换缓存中r，如果没有则直接调用store本身的修改方法
    update:function(r) {

        //jason.cheng 2009-5-8
        var isSave = false;
        var isUpdate = false;

        //同步缓存数据
        isSave = this.synchronizeData(r, this.cache.save, false);
        isUpdate = this.synchronizeData(r, this.cache.update, false);

        //end

        var keys = this.key;

        var tableKey = keys.split(',');

        if(!isSave && !isUpdate) {
            for(var i = 0; i < tableKey.length; i++) {
                r.modified[tableKey[i]] = r.data[tableKey[i]];
            }
            r.fields.each(function(f) {
                if(r.isModified(f.name)) {
                    r.modified[f.name] = r.data[f.name];
                }
                ;
            });
            this.cache.update.push(r.modified);
        }
        this.curRecord = r;
        this.itemindex = this.indexOfId(r.id);
        r.modified = {};
    },
    getNewRecord:function() {/*根据store的defautlValue来生成新的记录*/

        var rec = this.newRecord();
        if(!this.defaultValue) return rec;
        var defVals = this.defaultValue.split(',');
        var num = this.recordFields.length <= defVals.length ? this.recordFields.length : defVals.length;
        for(var i = 0; i < num; i++) {
            rec.set(this.recordFields[i].name, defVals[i]);
        }
        return rec;
    },
    /**
     * 数据提交方法
     * @param {} async 表示是否异步提交, async = false为同步提交 默认为异步提交
     */
    commit:function(async,sMsg,fMsg) {
        var result = true;
        var isAsync = true;
        if(async == false) {
            isAsync = false;
        }

        var _r = { params:{ } };
        _r.params.isAsync = isAsync;
        //jason.cheng dblist
        _r.params.dataSource = this.dataSource;
        if(this.cache.remove.length > 0) {
            _r.params.command = 'delete';
            _r.params.records = Ext.encode(this.cache.remove);
            _r.params.table = this.table;
            _r.params.sMsg = sMsg;
            _r.params.fMsg = fMsg;
            _r.params.key = this.key;

            _r.success = this.clearDelete;
            result = this.sendAjax(_r);
        }

        if(this.cache.save.length > 0) {

            _r.params.command = 'insert';
            _r.params.records = Ext.encode(this.cache.save);
            _r.params.table = this.table;
            _r.params.sMsg = sMsg;
            _r.params.fMsg = fMsg;
            _r.success = this.clearSave;
            result = this.sendAjax(_r);
        }
        if(this.getModifiedRecords().length > 0) {

            for(var i = 0; i < this.getModifiedRecords().length; i++) {
                this.update(this.getModifiedRecords()[i]);
            }

            if(this.cache.update.length > 0) {
                _r.params.command = 'update';
                _r.params.records = Ext.encode(this.cache.update);
                _r.params.table = this.table;
                _r.params.key = this.key;
                _r.params.sMsg = sMsg;
                _r.params.fMsg = fMsg;
                _r.success = this.clearUpdate;
                result = this.sendAjax(_r);
            }
        }
        this.cache.save.length = 0;
        this.cache.remove.length = 0;
        this.cache.update.length = 0;
        this.commitChanges();
        return result;
    },
    /**
     * 私有方法，用来同步客户端的缓存数据，如：在update的时候查看数据是否存在与save缓存中
     * @param {} r 操作的记录
     * @param {} cache  缓存 如：this.cache.save
     * @param {} isReplace 是否用当前记录替换缓存中的记录
     */
    synchronizeData:function(r, cache, isReplace) {
        var keys = this.key;
        var tableKey = keys.split(',');
        var isExist = true;
        var isFind = false;

        var isEnter = false;
        //判断记录是否在缓存中，如果在则进行替换，避免重复提交
        for(i = 0; i < cache.length; i += 1) {
            for(var j = 0; j < tableKey.length; j++) {
                isEnter = true;
                isExist = isExist && (cache[i][tableKey[j]] == r.data[tableKey[j]]);
            }
            if(isExist && isEnter) {
                isFind = true;
                if(isReplace == true)
                    cache.splice(i, 1, r.data);
                else
                    cache.splice(i, 1);
            }
        }

        return isFind;

    },

    sendAjax:function(_r) {
        //_r.params.table = _r.params.table;

        var result = Ext.Ajax.syncRequest('POST', Asiainfo.URLEncode(this.url), null, _r.params, _r.params.isAsync);

        return result;
        var requestObject = Ext.Ajax.request({
            method:'POST',
            isAsync:_r.params.isAsync,
            url:Asiainfo.URLEncode(this.url),
            //success:_r.success || function(o,r){},
            success:function(r, o) {
                var result = Ext.util.JSON.decode(r.responseText);
                if(result.success == true)
                    Ext.Msg.alert("提示", result.msg);
                else {
                    Ext.Msg.alert("错误", result.msg);
                }
            },
            failure:_r.failure || function(o, r) {
                Ext.Msg.alert("错误", r.responseText);
            },
            params:_r.params
        });
        //if(_r.params.isAsync == false)
        //  alert(requestObject.conn.responseText);
    },

    clearSave:function() {
        this.cache.save.length = 0;
    },

    clearDelete:function() {
        this.cache.remove.length = 0;
    },

    clearUpdate:function() {
        this.cache.update.length = 0;
    },
    clearSql:function() {
        this.cache.sql.length = 0;
    },
    clearAll:function() {
        this.clearSave();
        this.clearDelete();
        this.clearUpdate();
        this.clearSql();
    },
    //判断是否有子结点
    isHaveLeafRecord:function(r, code, parentcode) {
        return this.findBy(function(record) {
            return record.get(parentcode) == r.get(code);
        })
    }
})
