nameSpace('AI.VeJsonStore');

AI.VeJsonStore = AI.JsonStore.$extend({
  __init__: function(options) {
    //this.$super(options);
    this._listeners = {};
    ai.registerCmp(options.id || (new Date().getTime()), this);
    this.start = 0;
    this.init(options);
  }
});
AI.VeJsonStore.prototype.init = function(options){
    var contextUrl = window.location['pathname'].split('/')[1];
    this.config = $.extend({},{}, options);
    this.service = this.config.service||'newrecordService';
    this.config.url = '/'+contextUrl+'/'+this.service;
    this.sql=this.sql||this.config.sql;
    this.filters = this.config.filters;
    this.dataSource=this.dataSource||this.config.dataSource;
    this.table=this.table||this.config.table;
    this.secondTable=this.secondTable||this.config.secondTable;
    this.key =this.key|| this.config.key;
    this.map=this.config.map ||null;
    this.userName = this.config.userName||null;
    this.password = this.config.password||null;

    this.pageSize =this.pageSize||( this.config.pageSize || 20);
    this.IgnoreChange=false;///是否忽略修改，如果设置为true，则此期间的修改不会保存到缓存，也不会提交到数据库 

    this.count=0;
    this.totalCount=0;
    this.cache={
        save:[],
        remove:[],
        update:[]
    };
    /*可以根据传入jsondata来实现，如果是sql，则从服务端查询*/

    if(this.config.data){
        this.root=this.config.data;
        this.dataSet = TAFFY(this.config.data);
        this.count=this.config.data.length;
        this.totalCount = this.config.data.length;
    }else{
        var data = {
          limit:this.pageSize,
          start:this.start||0,
        },content='';
        if(this.sql&&this.sql.length>0){
            data = {
                initSql:ai._sqlEncrypt(this.sql),
                command:'init',
                dataSource:this.dataSource,
                root:'root',
                userName:this.userName,
                password:this.password
            };
        }else if(this.filters){
            data = $.extend(data, this.filters);
        }
        var response = $.ajax({
            type: this.config.type||"POST",
            url:this.config.url,
            async:this.config.async||false,
            dataType: "json",
            data:data
        }).responseText;

        if(_debugLevel==="debug") ai.registerSqlLog(JSON.stringify(data),"select");

        var dataJson = jQuery.parseJSON(response);

        if(dataJson.message && dataJson.message.indexOf('有错误')>=0){
            alert('sql语句有错误,dataSource='+this.dataSource+',sql='+this.sql+',详细信息:\r\n'+dataJson.message);
        }
        var getKeys = function(obj) {
            if(obj !== Object(obj))
                throw new TypeError('Invalid object');
            var keys = [];
            // 记录并返回对象的所有属性名


            for(var key in obj){
                keys[keys.length] = key;
            }
            return keys;
        };
        if(!dataJson){
            this.fields=[];
            this.totalCount = 0;
            this.root=[];
            this.columnModel=[];
            this.dataSet = [];
            this.count = 0;
        }else if(dataJson&&dataJson.root){
            this.fields=dataJson.fields;
            this.totalCount = dataJson.count;
            this.root=dataJson.root;
            this.columnModel=dataJson.columnModel;
            this.dataSet = TAFFY(dataJson.root);
            this.count=dataJson.root.length;
        }else{
          if(dataJson.length>0){
            this.fields=getKeys(dataJson[0]);
          }
              
            this.totalCount = dataJson.length;
            this.root=dataJson;
            this.columnModel=[];
            this.dataSet = TAFFY(dataJson);
            this.count=dataJson.length;
        }
    }

    this.dataSet.settings({
        onUpdate:function (){},
        onInsert:function(){}
    });
    this.curRecord = this.getAt(0);
    this.fireEvent('dataload');
};

AI.VeJsonStore.prototype.select = function(newSqlId, conditions) {
  this.start = 0;
  this.init($.extend({}, this.config, {'sqlId':newSqlId, 'conditions': conditions}));
};

AI.VeJsonStore.prototype.filt = function(options){
    this.start=0;
    this.init($.extend(this.config, options));
};

AI.JsonStore.prototype.pageSelect = function(start,pageSize){
  this.init($.extend(this.config, {start:start,limit:pageSize}));
};

/**
 * 根据当前主键返回记录
 */
AI.VeJsonStore.prototype.getRecordByKey = function(keyValue) {
  if(!this.key) {
    alert('没有设置store主键,无法调用此函数: getRecordByKey');
    return false;
  }
  var _keys = this.key.toUpperCase().split(',');
  var _keyValues = keyValue.split(',');
  if(_keys.length === _keyValues.length) {
    for(var i = 0, count = this.getCount(); i < count; i++) {
      var r = this.getAt(i);
      var _flag = true;
      for(var j = 0; j < _keys.length; j++) {
        if(r.get(_keys[j]) != _keyValues[j]) {
          _flag = false;
        }
      }
      if(_flag) {
        return r;
      }
    }
  }
  
  return null;
};

/**
 * 根据当前的store的编码规则获取新的编码，前提是确保store的数据是全部加载，只做客户端运算
 */
AI.JsonStore.prototype.getNewCode = function(fieldname, pre) {
  if(fieldname) fieldname = fieldname.toUpperCase();
  var seq = 0;
  for(var i = 0; i < this.getCount(); i++) {
    var str = this.getAt(i).get(fieldname);
    if(str && pre && str.indexOf(pre) == -1) continue;
    str = pre ? str.substring(pre.length) : str;
    var _seq = parseInt(str);
    if(isNaN(_seq)) continue;
    if(seq < _seq) seq = _seq;
  }
  seq++;
  return pre + seq;
};

// AI.JsonStore.record
AI.JsonStore.record.prototype.get = function(propertyName) {
  if(propertyName) propertyName = propertyName.toUpperCase();
  return this.data[propertyName];
};

AI.JsonStore.record.prototype.set = function(propertyName, value) {
  if(propertyName) propertyName = propertyName.toUpperCase();
  
  //替换注存在xss漏洞，插入有特殊字符的代码，成功弹窗执行<<SCRIPT>alert("XSS");//<</SCRIPT>                                                                  
  var val = '';                                                                                                                       

  if(typeof(value) == 'string') {
    var tmpVal = value.toLowerCase().replace(' ','');
    if(tmpVal.indexOf('<script') > 0 || tmpVal.indexOf('</script>') > 0 || tmpVal.indexOf('<object') > 0 || tmpVal.indexOf('</object>') > 0){
      //特殊字符过滤
      val = value.replace(/<\/?[^>]*>/g, '');
    } else {
      val = value;
    }
  } else {
    val = value;
  }
  
  value = val;
  
  if(!this.data.___id) { //刚刚新增的
    this.data[propertyName] = value;
    return true;
  }
  //新增缓存处理
  for(i = 0; i < this.store.cache.save.length; i += 1) {
    if(this.store.cache.save[i].___id == this.data.___id) {
      this.store.cache.save[i][propertyName] = value;
      return;
    }
  }
  //更新缓存处理
  var inUpdate = false;
  for(i = 0; i < this.store.cache.update.length; i += 1) {
    if(this.store.cache.update[i].___id == this.data.___id) {
      //console.log('已经在缓存中存在,进行更新');
      this.store.cache.update[i][propertyName] = value;
      inUpdate = true;
      break;
    }
  }
  if(!inUpdate) {
    //console.log('不在缓存中存在,进行更新登记');
    this.data[propertyName] = value;
    this.store.cache.update.push(this.data);
  }
  
  if(!this.IgnoreChange && this.data.___id) { //变更真正的数据
    var changeCfg = {};
    changeCfg[propertyName] = value;
    this.store.dataSet(this.data.___id).update(changeCfg); //变更真正的数据 
  }
};
