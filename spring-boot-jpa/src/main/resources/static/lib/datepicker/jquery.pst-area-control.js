/**
 * 
 * grouping:增加分组按钮，会在返回数组中获得细分的级别
 * disableLevel:如果传入有默认值，是否开启控制禁止选择上级菜单
 * disableLevelOffset: 可以向上偏移权限
 * _userSetGrouping:false 用户设置隐藏单选按钮的值为不参与分组运算
 *
 * @Author: MeiKefu
 * @2013-11
 * @2014-11-23 修复bug，增加细分，增加默认值限制选项用作权限控制
 */
(function($) {
    $.fn.extend({
	areaControl:function(options) {
	    //参数和默认值,index为索引
	    var defaults = {datas:{},cacheLevel:99,areaLevelName:[],grouping :false,disableLevel :false,disableLevelOffset:0};
	    var options = $.extend(defaults, options);
	    return this.each(function() {
		var $selectDiv = $('<div/>',{'class':'selectDivContainer'}).hide().appendTo('body');
		$selectDiv.click(function(e){
		    e.stopPropagation();
		}).dblclick(function(){
		    $(this).hide(200);
		});
		var $ipt = $(this).click(function(e){
		    e.stopPropagation();
		    $('.selectDivContainer').hide();
		    var o2 = $(this).offset();
		    var l2 = o2.left;var t2 = o2.top;var h2 = $(this).height();
		    $selectDiv.css("top", t2 + h2 + 7).css("left", l2).toggle();
		    $selectDiv.show(200);
		});
		
		$('body').click(function() {$selectDiv.hide(200);});
		if($selectDiv.find("ul").length===0){
		    //options.datas.unshift({id:'',name:'隐藏',pid:'0',children:[]});
		    
		    recursionCreateSelectDom(options.datas,0);
		    $selectDiv.find('.area-group:eq(0) .area-content .area-text:eq(0) a').trigger('click');
		    var _val = options.value;
		    if(_val && _val.length>0){//有默认值
			var _disableLevelOffset = -1;
			if(_.isNumber(options.disableLevelOffset)){
			    _disableLevelOffset=parseInt(options.disableLevelOffset,10);
			}
			var findOne = $selectDiv.find('.area-group .area-content .area-text a[rid="'+_val+'"]');
			if(findOne.length>0){//能在第一层中找到
			    findOne.trigger('click');
			    //控制权限，选择地市权限没有向上偏移，删除其他选项
			    if((options.disableLevel === true || options.disableLevel==="true") && _disableLevelOffset<1){
				findOne.parents('.area-content').find('li').each(function(){
				    if($(this).find('a').attr('rid')!==_val){
					$(this).remove();
				    }
				});
			    }
			}else{//找到datas中的那个元素，遍历整个数组
			    var parentIds=[];
			    var isHit = false;//因为涉及到数据库加载，所以需要记录是否在缓存中是否命中
			    var setDefaultVal = function(parentIds,defaultVal){
				var defaultValLvl = parentIds.length-1;
				parentIds[defaultValLvl]=defaultVal;
				_.each(parentIds,function(pid){
				    $selectDiv.find('.area-group .area-content .area-text a[rid="'+pid+'"]').trigger('click')
				});
				//控制权限
				if(options.disableLevel === true || options.disableLevel==="true"){
				    for(var j=defaultValLvl-2-_disableLevelOffset; j>=0; j--){
					$selectDiv.find('.area-group[level='+j+'] .area-title i').hide();
				    }
				    if(_disableLevelOffset>0){//向上偏移时，需要删除不是父级的其他的选项
					var curLvl = defaultValLvl - 1 - options.disableLevelOffset;
					var curRid = parentIds[1 + curLvl];
					$selectDiv.find('.area-group[level='+curLvl+'] .area-content li').each(function(){
					    if($(this).find('a').attr('rid')!==curRid){
						$(this).remove();
					    }
					});
				    }else{//没有向上偏移删除其他节点
					$selectDiv.find('.area-group[level='+(defaultValLvl-1)+'] .area-content li').each(function(){
					    if($(this).find('a').attr('rid')!==_val){
						$(this).remove();
					    }
					});
				    }
				}
			    };
			    
			    var recursionFind = function(children,parentId,level){
				parentIds[level]=parentId;
				_.each(children,function(child){
				    if(child.id===_val){
					isHit = true;
					setDefaultVal(parentIds,child.id);
				    }else if(child.children){
					recursionFind(child.children,child.id,level+1);
				    }
				});
			    }
			    recursionFind(options.datas,'',0);
			    
			    if( options.cacheLevel!==99 && !isHit ){//启用片段缓存，需要重数据库中加载
				var recursionFind2 = function(id){
				    var res = options.loaderDefVal(id);
				    parentIds[res.level]=res.id;
				    if(parentIds[res.level-1]!==res.pid && res.level>1){
					recursionFind2(res.pid)
				    }
				}
				recursionFind2(_val);
				setDefaultVal(parentIds,_val);
			    }
			}
		    }
		}
         
		function recursionCreateSelectDom(regionDatas,levelId){
		    var areaGroup = $selectDiv.find('.area-group[level="'+levelId+'"]').length>0?
			    $selectDiv.find('.area-group[level="'+levelId+'"]').empty():
			    $('<div/>',{level:levelId,'class':'area-group'}).appendTo($selectDiv);
		    
		    var areaTitle = $('<div/>',{'class':'area-title'}).appendTo(areaGroup);
		    areaTitle
			.append($('<span></span>',{text: ((options.areaLevelName[levelId]||{}).label||levelId)+':'}))
			.append($('<span class="val"></span>'))
			.append($('<i class="pull-right glyphicon glyphicon-minus-sign" style="color:#999;cursor:pointer;"/>').click(function(){
			    if(/minus/.test($(this).attr('class'))){
				var $this = $(this);
				setTimeout(function(){
				    $this.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign').parents('.area-group').find('.area-content').hide(200);
				},300);
			    }else{
				$(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign').parents('.area-group ').find('.area-content').show(200);
			    }
			}));
		    
		    if((options.grouping===true||options.grouping==="true") && levelId===0){//设置细分按钮
			var groupingEl = $('<span class="pull-right" style="padding-right:10px;"/>').append($('<span />',{text:'细分：'}));
			for(var i=0; i<options.areaLevelName.length; i++){
			    var label = options.areaLevelName[i].label||i;
			    
			    groupingEl.append($('<span/>',{text:label}));
			    $('<input type="radio" name="grouping"/>').val(i).click(function(e){
				var areaDatas = $ipt.data('areaDatas');
				var _grpIdx = $(this).parent().find('input[name="grouping"]:checked').val();
				if(_.isNumber(_grpIdx)){
				    areaDatas._grouping=parseInt(_grpIdx,10)
				}else{
				    areaDatas._grouping=_grpIdx
				}
				
				$ipt.data('areaDatas',areaDatas);
			    }).appendTo(groupingEl);
			}
			areaTitle.append(groupingEl);
		    }
		    
		    //				if (levelId == 0) {
		    //					//增加隐藏单选按钮
		    //					var hideEl = $('<span class="pull-right" style="padding-right:10px;"/>').append($('<span />',{text:'隐藏：'}));
		    //					$('<input type="checkbox" name="_userSetGrouping"/>').click(function(e){
		    //						var areaDatas = $ipt.data('areaDatas');
		    //						var _grpIdx = $(this).parent().find('input[name="_userSetGrouping"]:checked').val();
		    //						areaDatas._userSetGrouping=_grpIdx;
		    //						$ipt.data('areaDatas',areaDatas);
		    //					}).appendTo(hideEl);
		    //					areaTitle.append(hideEl);
		    //				}

		    var _ul = $('<ul/>',{'class':'area-content clearfix'}).appendTo(areaGroup);
		    _.each(regionDatas,function(element){
			var _elementName = element.name;
			if(element.name === undefined || element.name===null || element.name.length===0){
			    _elementName = element.id;
			}
			var _a = $('<a/>',{rid:element.id,pid:element.pid,href:'javascript:',title:_elementName})
				.data('area',{id:element.id,name:element.name,pid:element.pid,areaLevelName: options.areaLevelName[levelId]||levelId})
				.click(function(e){
				    var parentAreaGroup = $(this).parents('.area-group');
				    //$(this).parents('.area-group').find('input[name=_userSetGrouping]').attr('checked',false);//去除隐藏
				    parentAreaGroup.find('.area-text .label.label-success').removeClass('label label-success');
				    //$selectDiv.find('.area-text .label.label-success').removeClass('label label-success');
				    $(this).addClass("label label-success");

				    var levelId = parseInt(parentAreaGroup.attr('level'),10);
				    //隐藏上级的area-grou>area-content
				    for(var i=levelId-1;i>=0;i--){
					parentAreaGroup.parent().find('.area-group[level="'+i+'"] .area-title .glyphicon-minus-sign').trigger('click');
				    }

				    //设置属性
				    var thisAreaData = $(this).data('area');
				    parentAreaGroup.find('.area-title .val').data('area',thisAreaData).text(thisAreaData.name);
				    $ipt.val(thisAreaData.name);

				    var areaDatas = [];
				    areaDatas.push(thisAreaData);
				    for(var i=levelId-1;i>=0;i--){
					areaDatas.push(parentAreaGroup.parent().find('.area-group[level="'+i+'"] .area-title .val').data('area'));
				    }

				    $ipt.data('areaDatas',areaDatas);

				    //创建下属的area-group
				    var fetchChildren =function(pid,level,$el){
					if(level+1>=options.cacheLevel && options.loader){
					    return options.loader(pid,level);
					}else if( $el && $el.data){
					    return $el.data('children');
					}
					return null;
				    }
				    
				    var _children = fetchChildren(thisAreaData.id,levelId,$(this));
				    if(_children && _children.length>0){
					recursionCreateSelectDom(_children, levelId+1);
				    }else {
					$selectDiv.find('.area-group[level='+(levelId+1)+']').remove();
				    }
				    //清理其他下属的area-group
				    // $selectDiv.find('.area-group[level>'+levelId+']').remove();
				    _.each($selectDiv.find('.area-group'),function(areaGroup){
					if($(areaGroup).attr('level')>levelId+1){
					    $(areaGroup).remove();
					}
				    });
				})
				.append($('<span/>',{'class':'area-label',text:_elementName.length>6?_elementName.substring(0,6)+'..':_elementName}));
			if(element.children && element.children.length>0){
			    _a.data('children',element.children);
			}
			_ul.append($('<li/>',{'class':'area-text'}).append(_a));
		    });
		}
	    });
	},
	
	areaControlSele:function(options) {
	    //参数和默认值,index为索引
	    var defaults = {datas:{},cacheLevel:99,areaLevelName:[],grouping :false,disableLevel :false,disableLevelOffset:0};
	    var options = $.extend(defaults, options);
	    return this.each(function() {
		var $container = $(this);
		var fetchChildren =function(pid,level,$el){
		    if(level+1>=options.cacheLevel && options.loader){
			return options.loader(pid,level);
		    }else if( $el ){
			setOptionData($el);
			if($el.data){
			    return $el.data('children');
			}
		    }
		    return null;
		};
		function setAreaDatas($container){
		    var areaDatas = [];
		    for(var i=options.areaLevelName.length-1;i>=0;i--){
			var opt = $container.find('select.acSelect-'+i+' option:selected');
			setOptionData(opt);
			areaDatas.push($(opt).data('area'));
		    }
		    $container.data('areaDatas',areaDatas);
		}
		function setOptions(regionDatas,levelId,$contSelect){
		    $contSelect.empty();
		    var _tmpl = _.template('<option value="<%=id%>"><%=name%></option>');
		    var _newDatas = _.clone(regionDatas);
		    _newDatas.unshift({id:'',name:'全部',pid:'0',children:[],_userSetGrouping:false});
		    if(options.isHiddenLabel == undefined || options.isHiddenLabel != "hidden"){
		    	_newDatas.unshift({id:'',name:'隐藏',pid:'0',children:[],_userSetGrouping:false});
		    }
		    // _.each(_newDatas,function(element){
		    // 	var $opts = $(_tmpl(element)).appendTo($contSelect);
		    // 	$opts.data('area',{id:element.id,name:element.name,pid:element.pid,areaLevelName: options.areaLevelName[levelId]||levelId});
		    // 	if(element.children && element.children.length>0){
		    // 	    $opts.data('children',element.children);
		    // 	}
		    // },this);
		    // 改用后台拼接，去掉循环，避免某些浏览器提示js运行缓慢
		    $.ajax({
			url: ve.CONTEXT_PATH+'/ve/html/option',
			data:JSON.stringify({"keyName":"id","valueName":"name","options":_newDatas})
			,dataType: 'text',async:false
			,type:"POST",contentType:"application/json"
			,success:function(data, textStatus){			   
			    $contSelect.append(data);
			    $contSelect.data("_newDatas",_newDatas);
			    $contSelect.data("_levelId",levelId);
			    $contSelect.data("_options",options);
			}
		    });
		    
		    $contSelect.off();
		    $contSelect.change(function(){
			var $childSelect = $container.find('select.acSelect-'+(levelId+1));
			var $opts = $(this.options[this.options.selectedIndex]);
			//清理下下级
			$container.find('select.acSelect:gt('+levelId+')').each(function(){
			    $(this).find('option:gt(1)').remove();
			});
			var children = fetchChildren($opts.val(),levelId,$opts);
			if($childSelect.length>0 && children && children.length>0){
			    setOptions(children,(levelId+1),$childSelect);
			    //areaDatas.push($childSelect.find('option:selected').data('area'));
			}
			/* var thisAreaData = $opts.data('area');
			 areaDatas.push(thisAreaData);
			 for(var i=levelId-1;i>=0;i--){
			 areaDatas.push($container.find('select.acSelect-'+i+' option:selected').data('area'));
			 } */
			setAreaDatas($container);
		    });
		}
		var _tmpl = _.template('<select class="form-control acSelect acSelect-<%=level%>" lvl="<%=level%>" placeholder="<%=label%>" ></select>');
		var areaLevelName = options.areaLevelName;
		for(var i=0;i<areaLevelName.length;i++){
                    $("<span>"+areaLevelName[i].label+"</span>").appendTo($(this));
		    var $contSelect = $(_tmpl({level:i,label:areaLevelName[i].label})).appendTo($(this));
		    if(i===0){
			setOptions(options.datas,0, $contSelect);
		    }else{
			setOptions([],i,$contSelect);
		    }
		}

		var _val = options.value;
		if(_val && _val.length>0){//有默认值
		    var _disableLevelOffset = -1;
		    if(/[0-9]/.test(options.disableLevelOffset)){
			_disableLevelOffset=parseInt(options.disableLevelOffset,10);
		    }
		    var findOne = $container.find('select.acSelect-0 option[value="'+_val+'"]');
		    if(findOne.length>0){//能在第一层中找到
			findOne.attr("selected",true).parent().trigger('change');
			var $needSetAll = findOne.parent().nextAll('[class*="acSelect"]:first');
			if($needSetAll.length>0) {//默认选中地市后，县市就选择全部
			    $needSetAll.find(':contains("全部")').attr("selected", true);
			}
			//控制权限，选择地市权限没有向上偏移，删除其他选项
			if((options.disableLevel === true || options.disableLevel==="true") && _disableLevelOffset<1){
			    findOne.parent().find('option').each(function(){
				if($(this).val()!==_val){
				    $(this).remove();
				}
			    });
			}
		    }else{//找到datas中的那个元素，遍历整个数组
			var parentIds=[];
			var isHit = false;//因为涉及到数据库加载，所以需要记录是否在缓存中是否命中
			var setDefaultVal = function(parentIds,defaultVal){
			    var defaultValLvl = parentIds.length-1;
			    //parentIds[defaultValLvl]=defaultVal;
			    var $lastSetDefault;
			    _.each(parentIds,function(pid){
				$lastSetDefault = $container.find('select option[value="' + pid + '"]').attr("selected",true).parent().trigger('change');
			    });
			    //某个地区控件选中了默认值后，下一级的地区控件选择全部
			    if($lastSetDefault && $lastSetDefault.length>0){
				var $needSetAll = $lastSetDefault.nextAll('[class*="acSelect"]:first');
				if($needSetAll.length>0){
				    $needSetAll.find(':contains("全部")').attr("selected", true);
				}
			    }
			    //控制权限
			    if(options.disableLevel === true || options.disableLevel==="true"){
				for(var j=defaultValLvl-2-_disableLevelOffset; j>=0; j--){
				    $container.find('select.acSelect-'+j+' option:not(:selected)').remove();
				}
				if(_disableLevelOffset>0){//向上偏移时，需要删除不是父级的其他的选项
				    var curLvl = defaultValLvl - 1 - options.disableLevelOffset;
				    var curRid = parentIds[1 + curLvl];
				    $container.find('select.acSelect-'+curLvl+' option').each(function(){
					if($(this).val()!==curRid){
					    $(this).remove();
					}
				    });
				}else{//没有向上偏移删除其他节点
				    $container.find('select.acSelect-'+(defaultValLvl-1)+' option').each(function(){
					if($(this).val()!==_val){
					    $(this).remove();
					}
				    });
				}
			    }
			};
			
			var recursionFind = function(children,parentId,level){
			    parentIds[level]=parentId;
			    _.each(children,function(child){
				if(child.id===_val){
				    isHit = true;
				    parentIds[level+1]=child.id;
				    parentIds.length=level+2;
				    setDefaultVal(parentIds,child.id);
				    return;
				}else if(child.children){
				    recursionFind(child.children,child.id,level+1);
				}
			    });
			};
			recursionFind(options.datas,'',0);
			
			if( options.cacheLevel!==99 && !isHit ){//启用片段缓存，需要重数据库中加载
			    var recursionFind2 = function(id){
				var res = options.loaderDefVal(id);
				parentIds[res.level]=res.id;
				if(parentIds[res.level-1]!==res.pid && res.level>1){
				    recursionFind2(res.pid);
				}
			    };
			    recursionFind2(_val);
			    setDefaultVal(parentIds,_val);
			}
		    }
		    
		} else {
		    //如果url不带regionId参数，那么地市select默认选择全部
		    var $firstRegionSelect = $container.find('select.acSelect-0[placeholder="地市"]');
		    if($firstRegionSelect.length > 0) {
			$firstRegionSelect.find(':contains("全部")').attr("selected", true);
		    }
		}
		/* var areaDatas = [];
		 areaDatas.push($container.find('select.acSelect-0 option:selected').data('area'));
		 $container.data('areaDatas',areaDatas); */
		setAreaDatas($container);
	    });
	}

	,areaControlSeleSplit:function(options) {
	    //参数和默认值,index为索引
	    var defaults = {datas:{},cacheLevel:99,areaLevelName:[],grouping :false,disableLevel :false,disableLevelOffset:0};
	    var options = $.extend(defaults, options);
	    return this.each(function() {
		var $container = $(this);
		var fetchChildren =function(pid,level,$el){
		    if(level+1>=options.cacheLevel && options.loader){
			return options.loader(pid,level);
		    }else if( $el ){
			setOptionData($el);
			if($el.data){
			    return $el.data('children');
			}
		    }
		    return null;
		}
		function setAreaDatas(begin,container){
		    var areaDatas = [];
		    var selects = $(begin).nextUntil($(container).parent());
		    
		    for(var i = selects.length-1;i >=0 ; i--){
			var opt = $(selects[i]).find("select.acSelect-"+(i+1)+" option:selected");
			setOptionData(opt);
		    	areaDatas.push($(opt).data("area"));
		    }
		    var beginOpt = $(begin).find("select.acSelect-0 option:selected");
		    setOptionData(beginOpt);
		    areaDatas.push($(beginOpt).data("area"));
		    $container.data('areaDatas',areaDatas);
		}
		function setOptions(regionDatas,levelId,$contSelect){
		    $contSelect.empty();
		    var _tmpl = _.template('<option value="<%=id%>"><%=name%></option>');
		    var _newDatas = _.clone(regionDatas);
		    _newDatas.unshift({id:'',name:'全部',pid:'0',children:[],_userSetGrouping:false});
		    if(options.isHiddenLabel == undefined || options.isHiddenLabel != "hidden"){
		    	_newDatas.unshift({id:'',name:'隐藏',pid:'0',children:[],_userSetGrouping:false});
		    }
		    // _.each(_newDatas,function(element){
		    // 	var $opts = $(_tmpl(element)).appendTo($contSelect);
		    // 	$opts.data('area',{id:element.id,name:element.name,pid:element.pid,areaLevelName: options.areaLevelName[levelId]||levelId});
		    // 	if(element.children && element.children.length>0){
		    // 	    $opts.data('children',element.children);
		    // 	}
		    // },this);
		    //改用后台拼接，去掉循环，避免某些浏览器提示js运行缓慢
		    $.ajax({
		    	url: ve.CONTEXT_PATH+'/ve/html/option',
		    	data:JSON.stringify({"keyName":"id","valueName":"name","options":_newDatas})
		    	,dataType: 'text',async:false
		    	,type:"POST",contentType:"application/json"
		    	,success:function(data, textStatus){		
			    $contSelect.append(data);
			    $contSelect.data("_newDatas",_newDatas);
			    $contSelect.data("_levelId",levelId);
			    $contSelect.data("_options",options);
		    	}
		    });
		    
		    $contSelect.off();
            $contSelect.change(function () {
                var $childSelect = $contSelect.parent().next().find('select.acSelect-' + (levelId + 1));
                var $opts = $(this.options[this.options.selectedIndex]);
                //清理下下级
                $contSelect.parent().next().next().find('select.acSelect:gt(' + levelId + ')').each(function () {
                    $(this).find('option:gt(1)').remove();
                });
                var children = fetchChildren($opts.val(), levelId, $opts);
                if ($childSelect.length > 0 && children && children.length > 0) {
                    setOptions(children, (levelId + 1), $childSelect.is("select") ? $childSelect : $childSelect.parent());
                }
                /* var thisAreaData = $opts.data('area');
                 areaDatas.push(thisAreaData);
                 for(var i=levelId-1;i>=0;i--){
                 areaDatas.push($container.find('select.acSelect-'+i+' option:selected').data('area'));
                 } */

                var beginSelect = levelId == 0 ? $contSelect.parent() : findPrev($contSelect.parent(), "select.acSelect-0",0);
                var multSelect = findUntil($contSelect.parent(), "div[selectlevel]", levelId).find(".formElement");
                setAreaDatas(beginSelect, multSelect);
            });

		}
		var _tmpl = _.template('<select class="form-control acSelect acSelect-<%=level%>" lvl="<%=level%>" placeholder="<%=label%>" ></select>');
		var areaLevelName = options.areaLevelName;
		for(var i=0;i<areaLevelName.length;i++){
                    $("<span>"+areaLevelName[i].label+"</span>").appendTo($(this));
		    var $contSelect = $(_tmpl({level:i,label:areaLevelName[i].label})).appendTo($(this));
		    if(i===0){
			setOptions(options.datas,0, $contSelect.is("select")?$contSelect:$contSelect.parent());
		    }else{
			setOptions([],i,$contSelect.is("select")?$contSelect:$contSelect.parent());
		    }
		}

		var _val = options.value;
		if(_val && _val.length>0){//有默认值
		    var _disableLevelOffset = -1;
		    if(/[0-9]/.test(options.disableLevelOffset)){
			_disableLevelOffset=parseInt(options.disableLevelOffset,10);
		    }
		    var findOne = $container.find('select.acSelect-0 option[value="'+_val+'"]');
		    if(findOne.length>0){//能在第一层中找到
			findOne.attr("selected",true).parent().trigger('change');
			var $needSetAll = findOne.parent().nextAll('[class*="acSelect"]:first');
			if($needSetAll.length>0) {//默认选中地市后，县市就选择全部
			    $needSetAll.find(':contains("全部")').attr("selected", true);
			}
			//控制权限，选择地市权限没有向上偏移，删除其他选项
			if((options.disableLevel === true || options.disableLevel==="true") && _disableLevelOffset<1){
			    findOne.parent().find('option').each(function(){
				if($(this).val()!==_val){
				    $(this).remove();
				}
			    });
			}
		    }else{//找到datas中的那个元素，遍历整个数组
			var parentIds=[];
			var isHit = false;//因为涉及到数据库加载，所以需要记录是否在缓存中是否命中
			var setDefaultVal = function(parentIds,defaultVal){
			    var defaultValLvl = parentIds.length-1;
			    //parentIds[defaultValLvl]=defaultVal;
			    var $lastSetDefault;
			    _.each(parentIds,function(pid){
				$lastSetDefault = $container.find('select option[value="' + pid + '"]').attr("selected",true).parent().trigger('change');
			    });
			    //某个地区控件选中了默认值后，下一级的地区控件选择全部
			    if($lastSetDefault && $lastSetDefault.length>0){
				var $needSetAll = $lastSetDefault.nextAll('[class*="acSelect"]:first');
				if($needSetAll.length>0){
				    $needSetAll.find(':contains("全部")').attr("selected", true);
				}
			    }
			    //控制权限
			    if(options.disableLevel === true || options.disableLevel==="true"){
				for(var j=defaultValLvl-2-_disableLevelOffset; j>=0; j--){
				    $container.find('select.acSelect-'+j+' option:not(:selected)').remove();
				}
				if(_disableLevelOffset>0){//向上偏移时，需要删除不是父级的其他的选项
				    var curLvl = defaultValLvl - 1 - options.disableLevelOffset;
				    var curRid = parentIds[1 + curLvl];
				    $container.find('select.acSelect-'+curLvl+' option').each(function(){
					if($(this).val()!==curRid){
					    $(this).remove();
					}
				    });
				}else{//没有向上偏移删除其他节点
				    $container.find('select.acSelect-'+(defaultValLvl-1)+' option').each(function(){
					if($(this).val()!==_val){
					    $(this).remove();
					}
				    });
				}
			    }
			};

			var recursionFind = function(children,parentId,level){
			    parentIds[level]=parentId;
			    _.each(children,function(child){
				if(child.id===_val){
				    isHit = true;
				    parentIds[level+1]=child.id;
				    parentIds.length=level+2;
				    setDefaultVal(parentIds,child.id);
				    return;
				}else if(child.children){
				    recursionFind(child.children,child.id,level+1);
				}
			    });
			};
			recursionFind(options.datas,'',0);

			if( options.cacheLevel!==99 && !isHit ){//启用片段缓存，需要重数据库中加载
			    var recursionFind2 = function(id){
				var res = options.loaderDefVal(id);
				parentIds[res.level]=res.id;
				if(parentIds[res.level-1]!==res.pid && res.level>1){
				    recursionFind2(res.pid);
				}
			    };
			    recursionFind2(_val);
			    setDefaultVal(parentIds,_val);
			}
		    }

		} else {
		    //如果url不带regionId参数，那么地市select默认选择全部
		    var $firstRegionSelect = $container.find('select.acSelect-0[placeholder="地市"]');
		    if($firstRegionSelect.length > 0) {
			$firstRegionSelect.find(':contains("全部")').attr("selected", true);
		    }
		}

		setAreaDatas($container);
	    });
	}
	,areaControlSeleSplitFixIE:function(options) {
	    //参数和默认值,index为索引
	    var defaults = {datas:{},cacheLevel:99,areaLevelName:[],grouping :false,disableLevel :false,disableLevelOffset:0};
	    var options = $.extend(defaults, options);

		var $container = $(this);
		var fetchChildren =function(pid,level,$el){
		    if(level+1>=options.cacheLevel && options.loader){
			return options.loader(pid,level);
		    }else if( $el ){
			setOptionData($el);
			if($el.data){
			    return $el.data('children');
			}
		    }
		    return null;
		}
		function setAreaDatas(begin,container){
		    var areaDatas = [];
		    var selects = $(begin).nextUntil($(container).parent());

		    for(var i = selects.length-1;i >=0 ; i--){
			var opt = $(selects[i]).find("select.acSelect-"+(i+1)+" option:selected");
			setOptionData(opt);
		    	areaDatas.push($(opt).data("area"));
		    }
		    var beginOpt = $(begin).find("select.acSelect-0 option:selected");
		    setOptionData(beginOpt);
		    areaDatas.push($(beginOpt).data("area"));
		    $container.data('areaDatas',areaDatas);
		}

            function setOptions(regionDatas, levelId, $contSelect) {
                $contSelect.empty();
                var _tmpl = _.template('<option value="<%=id%>"><%=name%></option>');
                var _newDatas = _.clone(regionDatas);
                _newDatas.unshift({id: '', name: '全部', pid: '0', children: [], _userSetGrouping: false});
                if (options.isHiddenLabel == undefined || options.isHiddenLabel != "hidden") {
                    _newDatas.unshift({id: '', name: '隐藏', pid: '0', children: [], _userSetGrouping: false});
                }

                //改用后台拼接，去掉循环，避免某些浏览器提示js运行缓慢
                $.ajax({
                    url: ve.CONTEXT_PATH + '/ve/html/option',
                    data: JSON.stringify({"keyName": "id", "valueName": "name", "options": _newDatas})
                    , dataType: 'text', async: false
                    , type: "POST", contentType: "application/json"
                    , success: function (data, textStatus) {
                        $contSelect.append(data);
                        $contSelect.data("_newDatas", _newDatas);
                        $contSelect.data("_levelId", levelId);
                        $contSelect.data("_options", options);

                        $contSelect.off();
                        $contSelect.change(function () {
                            var $childSelect = $contSelect.parent().next().find('select.acSelect-' + (levelId + 1));
                            //上面取childSelect的设计有严重问题, 首次加载报表预览时change事件会被触发一次, 那时候上面的选择器无法选择到childselect
                            if ($childSelect.length === 0) {
                                $childSelect = $contSelect.parent().find('select.acSelect-' + (levelId + 1));
                            }
                            var $opts = $(this.options[this.options.selectedIndex]);
                            //清理下下级
                            $contSelect.parent().next().next().find('select.acSelect:gt(' + levelId + ')').each(function () {
                                $(this).find('option:gt(1)').remove();
                            });
                            var children = fetchChildren($opts.val(), levelId, $opts);
                            if ($childSelect.length > 0 && children && children.length > 0) {
                                setOptions(children, (levelId + 1), $childSelect.is("select") ? $childSelect : $childSelect.parent());
                            }

                            var beginSelect = levelId == 0 ? $contSelect.parent() : findPrev($contSelect.parent(), "select.acSelect-0",0);
                            var multSelect = findUntil($contSelect.parent(), "div[selectlevel]", levelId).find(".formElement");
                            setAreaDatas(beginSelect, multSelect);
                        });
                    }
                });
            }

            var _tmpl = _.template('<select class="form-control acSelect acSelect-<%=level%>" lvl="<%=level%>" placeholder="<%=label%>" ></select>');
            var areaLevelName = options.areaLevelName;
            for (var i = 0; i < areaLevelName.length; i++) {
                $("<span>" + areaLevelName[i].label + "</span>").appendTo($(this));
                var $contSelect = $(_tmpl({level: i, label: areaLevelName[i].label})).appendTo($(this));
                if (i === 0) {
                    setOptions(options.datas, 0, $contSelect.is("select") ? $contSelect : $contSelect.parent());
                } else {
                    setOptions([], i, $contSelect.is("select") ? $contSelect : $contSelect.parent());
                }
            }
            var _val = options.value;
            if (_val && _val.length > 0) {//有默认值
                var _disableLevelOffset = -1;
                if (/[0-9]/.test(options.disableLevelOffset)) {
                    _disableLevelOffset = parseInt(options.disableLevelOffset, 10);
                }
                var findOne = $container.find('select.acSelect-0 option[value="' + _val + '"]');
                if (findOne.length > 0) {//能在第一层中找到
                    findOne.attr("selected", true).parent().trigger('change');
                    var $needSetAll = findOne.parent().nextAll('[class*="acSelect"]:first');
                    if ($needSetAll.length > 0) {//默认选中地市后，县市就选择全部
                        $needSetAll.find(':contains("全部")').attr("selected", true);
                    }
                    //控制权限，选择地市权限没有向上偏移，删除其他选项
                    if ((options.disableLevel === true || options.disableLevel === "true") && _disableLevelOffset < 1) {
                        findOne.parent().find('option').each(function () {
                            if ($(this).val() !== _val) {
                                $(this).remove();
                            }
                        });
                    }
                } else {//找到datas中的那个元素，遍历整个数组
                    var parentIds = [];
                    var isHit = false;//因为涉及到数据库加载，所以需要记录是否在缓存中是否命中
                    var setDefaultVal = function (parentIds, defaultVal) {
                        var defaultValLvl = parentIds.length - 1;
                        //parentIds[defaultValLvl]=defaultVal;
                        var $lastSetDefault;
                        _.each(parentIds, function (pid) {
                            $lastSetDefault = $container.find('select option[value="' + pid + '"]').attr("selected", true).parent().trigger('change');
                        });
                        //某个地区控件选中了默认值后，下一级的地区控件选择全部
                        if ($lastSetDefault && $lastSetDefault.length > 0) {
                            var $needSetAll = $lastSetDefault.nextAll('[class*="acSelect"]:first');
                            if ($needSetAll.length > 0) {
                                $needSetAll.find(':contains("全部")').attr("selected", true);
                            }
                        }
                        //控制权限
                        if (options.disableLevel === true || options.disableLevel === "true") {
                            for (var j = defaultValLvl - 2 - _disableLevelOffset; j >= 0; j--) {
                                $container.find('select.acSelect-' + j + ' option:not(:selected)').remove();
                            }
                            if (_disableLevelOffset > 0) {//向上偏移时，需要删除不是父级的其他的选项
                                var curLvl = defaultValLvl - 1 - options.disableLevelOffset;
                                var curRid = parentIds[1 + curLvl];
                                $container.find('select.acSelect-' + curLvl + ' option').each(function () {
                                    if ($(this).val() !== curRid) {
                                        $(this).remove();
                                    }
                                });
                            } else {//没有向上偏移删除其他节点
                                $container.find('select.acSelect-' + (defaultValLvl - 1) + ' option').each(function () {
                                    if ($(this).val() !== _val) {
                                        $(this).remove();
                                    }
                                });
                            }
                        }
                    };

                    var recursionFind = function (children, parentId, level) {
                        parentIds[level] = parentId;
                        _.each(children, function (child) {
                            if (child.id === _val) {
                                isHit = true;
                                parentIds[level + 1] = child.id;
                                parentIds.length = level + 2;
                                setDefaultVal(parentIds, child.id);
                                return;
                            } else if (child.children) {
                                recursionFind(child.children, child.id, level + 1);
                            }
                        });
                    };
                    recursionFind(options.datas, '', 0);

                    if (options.cacheLevel !== 99 && !isHit) {//启用片段缓存，需要重数据库中加载
                        var recursionFind2 = function (id) {
                            var res = options.loaderDefVal(id);
                            parentIds[res.level] = res.id;
                            if (parentIds[res.level - 1] !== res.pid && res.level > 1) {
                                recursionFind2(res.pid);
                            }
                        };
                        recursionFind2(_val);
                        setDefaultVal(parentIds, _val);
                    }
                }

            } else {
                //如果url不带regionId参数，那么地市select默认选择全部
                var $firstRegionSelect = $container.find('select.acSelect-0[placeholder="地市"]');
                if ($firstRegionSelect.length > 0) {
                    $firstRegionSelect.find(':contains("全部")').attr("selected", true);
                }
            }
            setAreaDatas($container);

        }
	,areaControlSeleSplitFixIE1:function(options) {
	    //参数和默认值,index为索引
	    var defaults = {datas:{},cacheLevel:99,areaLevelName:[],grouping :false,disableLevel :false,disableLevelOffset:0};
	    var options = $.extend(defaults, options);
	    
	    var $container = $("#ac-"+options.id+'-0');
	    var fetchChildren =function(pid,level,$el){
		var val = $el;
		var value = "";
		if(val.length > 0){
		    if($(val).val() != "全部" && $(val).val() != "隐藏"){
			value = $(val).val();
		    }
		}
		return options.loader(pid,level,value);
	    };

            var fetchCurrent =function(pid,level,$el){
		return options.loader(pid,level,"");
	    };
    
	    function setAreaDatas(begin,container){
		var areaDatas = [];
				
		for(var i = options.selectLevel-1;i >=0 ; i--){
		    var opt = $("#" + options.areaLevelName[i].id).find(".ac-areacontrol-value");
		    areaDatas.push($(opt).data("area"));
		}
		
		$container.data('areaDatas',areaDatas);
	    }
	    function setOptions(regionDatas,levelId,$contSelect){
		$contSelect.empty();
		var _tmpl = _.template('<p value="<%=id%>"><%=name%></p>');
		var _newDatas = _.clone(regionDatas);
		var input = $contSelect.prev("input");
		_newDatas.unshift({id:'',name:'全部',pid:'0',children:[],_userSetGrouping:false});
		if(options.isHiddenLabel == undefined || options.isHiddenLabel != "hidden"){
		    _newDatas.unshift({id:'',name:'隐藏',pid:'0',children:[],_userSetGrouping:false});
		}

		_.each(_newDatas,function(element){
		    var $opts = $(_tmpl(element)).appendTo($contSelect);
		    $opts.data('area',{id:element.id,name:element.name,pid:element.pid,areaLevelName: options.areaLevelName[levelId]||levelId});
		    if(element.children && element.children.length>0){
			$opts.data('children',element.children);
		    }
		},this);
		
		$contSelect.hide();
		
		input.attr({"idvalue":_newDatas[0].id}).val(_newDatas[0].name).data("area",$contSelect.find("p:first").data("area"));
		
		$contSelect.find("p").click(function(){
		    var $childSelect = $('.ac-'+options.id+'-'+(levelId+1)).find(".ac-areacontrol-content");
		    var $opts = $contSelect.parent().find(".ac-areacontrol-value");
		    //清理下下级
		    $('div[id^="ac-'+options.id+'"]:gt('+levelId+')').find(".ac-areacontrol-content").each(function(){
			$(this).find('p:gt(1)').remove();
		    });
		    $opts.data("area",$(this).data("area"));
		    $opts.data("children",$(this).data("children"));
		    $opts.val($(this).html()).attr({"idvalue":$(this).attr("value")});
		    $contSelect.hide();
		    var children = fetchChildren($opts.attr("idvalue"),levelId,$('.ac-'+options.id+'-'+(levelId+1)).find(".ac-areacontrol-value"));
		    if($childSelect.length>0 && children && children.length>0){
			setOptions(children,(levelId+1),$childSelect);
		    }
		    setAreaDatas($container);
		});
	    }

	    function setInputOptions(regionDatas,levelId,$contSelect){
		$contSelect.empty();
		var _tmpl = _.template('<p value="<%=id%>"><%=name%></p>');
		var _newDatas = _.clone(regionDatas);
		_newDatas.unshift({id:'',name:'全部',pid:'0',children:[],_userSetGrouping:false});
		if(options.isHiddenLabel == undefined || options.isHiddenLabel != "hidden"){
		    _newDatas.unshift({id:'',name:'隐藏',pid:'0',children:[],_userSetGrouping:false});
		}

		_.each(_newDatas,function(element){
		    var $opts = $(_tmpl(element)).appendTo($contSelect);
		    $opts.data('area',{id:element.id,name:element.name,pid:element.pid,areaLevelName: options.areaLevelName[levelId]||levelId});
		    if(element.children && element.children.length>0){
			$opts.data('children',element.children);
		    }
		},this);
		
		// $contSelect.hide();
		
		// $contSelect.prev("input").attr("idvalue",_newDatas[0].id).val(_newDatas[0].name);
		
		$contSelect.find("p").click(function(){
		    var $childSelect = $('.ac-'+options.id+'-'+(levelId+1)).find(".ac-areacontrol-content");
		    var $opts = $contSelect.parent().find(".ac-areacontrol-value");
		    //清理下下级
		    $('div[id^="ac-'+options.id+'"]:gt('+levelId+')').find(".ac-areacontrol-content").each(function(){
			$(this).find('p:gt(1)').remove();
		    });
		    $opts.data("area",$(this).data("area"));
		    $opts.data("children",$(this).data("children"));
		    $opts.val($(this).html()).attr({"idvalue":$(this).attr("value")});
		    $contSelect.hide();
		    var children = fetchChildren($opts.attr("idvalue"),levelId,$('.ac-'+options.id+'-'+(levelId+1)).find(".ac-areacontrol-value"));
		    if($childSelect.length>0 && children && children.length>0){
			setOptions(children,(levelId+1),$childSelect);
		    }
		    setAreaDatas($container);
		});
	    }
	    function listenChange(el,levelId,isAll){
		var parentInput = $('.ac-'+options.id+'-'+($(el).attr("level")-2)).find(".ac-areacontrol-value");
		
		var pid = "";
		
		if(parentInput.length > 0){
		    pid = $(parentInput).attr("idvalue");
		}else{
		    pid = "0";
		}
		var level = levelId;
		var children = [];
		if(isAll == false){
		    children = fetchChildren(pid,level,$('.ac-'+options.id+'-'+(levelId+1)).find(".ac-areacontrol-value"));
		}else{
		    children = fetchCurrent(pid,level);
		}
		setInputOptions(children,$(el).attr("level")-1,$("#"+areaLevelName[$(el).attr("level")-1].id).find(".ac-areacontrol-content"));
	    }
	    var areaLevelName = options.areaLevelName;
	    for(var i=0;i<areaLevelName.length;i++){
		//ie的propertychange触发规则和其他浏览器的input触发规则不同，采用keypress keyup事件判断
		$("#"+areaLevelName[i].id).find(".ac-areacontrol-value").on("keydown keyup",function(){
		    var levelId = $(this).attr("level")-2;
		    listenChange($(this),levelId,false);
		}).on("click",function(){
		    var levelId = 99;
		    listenChange($(this),levelId,true);
		});
		
		
		if(i===0){
		    setOptions(options.datas,0, $("#"+areaLevelName[i].id).find(".ac-areacontrol-content"));
		}else{
		    setOptions([],i,$("#"+areaLevelName[i].id).find(".ac-areacontrol-content"));
		}
	    }
	    
	    var _val = options.value;
	    if(_val && _val.length>0){ //有默认值
		var _disableLevelOffset = -1;
		if(/[0-9]/.test(options.disableLevelOffset)){
		    _disableLevelOffset=parseInt(options.disableLevelOffset,10);
		}
		// var findOne = $container.find('select.acSelect-0 option[value="'+_val+'"]');
		var findOne = $('.ac-'+options.id+'-0 .ac-areacontrol-content p[value="'+_val+'"]');
		if(findOne.length>0){ //能在第一层中找到
		    findOne.parent().prev("input").val(findOne.html()).attr({"idvalue":findOne.attr("value")}).data("area",findOne.data("area"));
		    var $needSetAll = findOne.parent().parent().nextAll('[class*="ac-'+options.id+'"]:first');
		    if($needSetAll.length>0) { //默认选中地市后，县市就选择全部
			$needSetAll.find('ac-areacontrol-value').attr({"idvalue":"全部"}).val("全部");
		    }
		    //控制权限，选择地市权限没有向上偏移，删除其他选项
		    if((options.disableLevel === true || options.disableLevel==="true") && _disableLevelOffset<1){
			findOne.parent().find('p').each(function(){
			    if($(this).attr("value")!==_val){
				$(this).remove();
			    }
			});
		    }
		}else{ //找到datas中的那个元素，遍历整个数组
		    var parentIds=[];
		    var isHit = false; //因为涉及到数据库加载，所以需要记录是否在缓存中是否命中
		    var setDefaultVal = function(parentIds,defaultVal){
			var defaultValLvl = parentIds.length-1;
			//parentIds[defaultValLvl]=defaultVal;
			var $lastSetDefault;
			_.each(parentIds,function(pid){
			    var p = $('p[value="' + pid + '"]');
			    p.parent().prev("input").attr({"idvalue":p.attr("value")}).val(p.html());
			    $lastSetDefault = p.parent().parent();
			});
			//某个地区控件选中了默认值后，下一级的地区控件选择全部
			if($lastSetDefault && $lastSetDefault.length>0){
			    var $needSetAll = $lastSetDefault.nextAll('[class*="ac-' +options.id+ '"]:first');
			    if($needSetAll.length>0){
				$needSetAll.find('.ac-areacontrol-value').attr({"idvalue":"全部"}).val("全部");
			    }
			}
			//控制权限
			if(options.disableLevel === true || options.disableLevel==="true"){
			    for(var j=defaultValLvl-2-_disableLevelOffset; j>=0; j--){
				$(".ac-"+options.id+"-"+j).find(".ac-areacontrol-content p").remove();
				$(".ac-"+options.id+"-"+j).find(".ac-areacontrol-value").attr("disabled",true);
				// $container.find('select.acSelect-'+j+' option:not(:selected)').remove();
			    }
			    if(_disableLevelOffset>0){ //向上偏移时，需要删除不是父级的其他的选项
				var curLvl = defaultValLvl - 1 - options.disableLevelOffset;
				var curRid = parentIds[1 + curLvl];
				$(".ac-"+options.id+"-"+curLvl+' .ac-areacontrol-content p').each(function(){
				    if($(this).val()!==curRid){
					$(this).remove();
				    }
				});
			    }else{ //没有向上偏移删除其他节点
				$(".ac-"+options.id+"-"+(defaultValLvl-1)+' .ac-areacontrol-content p').each(function(){
				    if($(this).val()!==_val){
					$(this).remove();
				    }
				});
			    }
			}
		    };
		    
		    var recursionFind = function(children,parentId,level){
			parentIds[level]=parentId;
			_.each(children,function(child){
			    if(child.id===_val){
				isHit = true;
				parentIds[level+1]=child.id;
				parentIds.length=level+2;
				setDefaultVal(parentIds,child.id);
				return;
			    }else if(child.children){
				recursionFind(child.children,child.id,level+1);
			    }
			});
		    };
		    recursionFind(options.datas,'',0);
		    
		    if( options.cacheLevel!==99 && !isHit ){ //启用片段缓存，需要重数据库中加载
			var recursionFind2 = function(id){
			    var res = options.loaderDefVal(id);
			    parentIds[res.level]=res.id;
			    if(parentIds[res.level-1]!==res.pid && res.level>1){
				recursionFind2(res.pid);
			    }
			};
			recursionFind2(_val);
			setDefaultVal(parentIds,_val);
		    }
		}
		
	    } else {
		//如果url不带regionId参数，那么地市select默认选择全部
		var p = $("#ac-"+options.id+"-0 .ac-areacontrol-content p:contains('全部')");
		$("#ac-"+options.id+'-0 .ac-areacontrol-value').attr({"idvalue":p.attr("value")}).val(p.html()).data("area",p.data("area"));
	    }
	    setAreaDatas($container);
	    
	}
    });



})(jQuery);

function setOptionData(option){
    if($(option).parent().data && $(option).parent().data("_newDatas")){

	var _newDatas = $(option).parent().data("_newDatas");
	var levelId = $(option).parent().data("_levelId");
	var options = $(option).parent().data("_options");

    //设置值权限后,下拉列表中只剩下一个选项,而_newDatas里是全部的地区数据.两者index不匹配,不能直接通过$(option).index()来处理
    var selectedAreaData;
    for(var i = 0; i < _newDatas.length; i++ ) {
        if(_newDatas[i].name === $(option).text()){
            selectedAreaData = _newDatas[i];
            break;
        }

    }
    if(!selectedAreaData) {
        selectedAreaData = _newDatas[$(option).index()];
    }
	$(option).data('area',{id:selectedAreaData.id,name:selectedAreaData.name,pid:selectedAreaData.pid,areaLevelName: options.areaLevelName[levelId]||levelId});
	if(selectedAreaData.children && selectedAreaData.children.length>0){
	    $(option).data('children',selectedAreaData.children);
	}
    }
}

$(document).on("click",".ac-areacontrol-value",function(){
    var _self = $(this);
    var div = $(this).next(".ac-areacontrol-content");
    if(div.is(':hidden')==true){
	
    	var pos = $(this).offset();
	
    	div.css({"top":pos.top+29,"left":pos.left,"width":$(this).width()+15}).show();
    }else{
    	div.hide();
    }
});

function findUntil(el, expr, num) {
    if (num > 15) {
        return $(el);
    }
    num++;
    return $(el).next(expr).length > 0 ? $(el).next(expr) : findUntil($(el).next(), expr, num);
}

function findPrev(el, expr, num) {
    if (num > 15) {
        return $(el);
    }
    num++;
    return $(el).prev().find(expr).length > 0 ? $(el).prev() : findPrev($(el).prev(), expr, num);
}
