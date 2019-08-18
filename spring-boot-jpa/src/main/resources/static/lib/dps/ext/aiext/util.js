/*
	返回一个Object内部共有多少属性值
*/
function objectLength(j){
	i=0;
	for(k in j)
		++i;
	return i;
}

/*
	相当于Java里的equals
*/	
function equals(a,b){
	if(objectLength(a) != objectLength(b))
		return false;
	for(i in a){
		if(a[i] != b[i])
			return false;
	}
	return true;
}

/*
	问服务器request或Session或ServletContext索取attribute值
*/
function askForValue(param){
	Ext.Ajax.request({
		url:param.url,
	  	success:param.success || function(response,options){},
		failure:param.failure || function(response,options){},
		params:{key:param.key}
	})
}

/*
	向服务器索取ID主键
*/
function getID(param){
	Ext.Ajax.request({
		url:param.url,
		success:param.success || function(response,options){},
		failure:param.failure || function(response,options){},
		params:{tableName:param.tableName}
	})
}