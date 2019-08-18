Ext.namespace("Asiainfo.widget.Graph");

Asiainfo.widget.Graph=function (config){
	//baseFun.loadScript('../asiainfo/form/uxmedia.js');
	//baseFun.loadScript('../asiainfo/form/uxflash.js');
	//baseFun.loadScript('../asiainfo/form/uxfusion.js');
	this.graphBaseXml = {};
	this.graphBaseXml['FCF_Line']="<graph caption='' subcaption='' xAxisName=''   showNames='1' showValues='0' rotateNames='0' showColumnShadow='1' animation='1' showAlternateHGridColor='1' AlternateHGridColor='ff5904' divLineColor='ff5904' divLineAlpha='20' alternateHGridAlpha='5' canvasBorderColor='666666' baseFontColor='666666'>";
	this.graphBaseXml['FCF_Column2D']="<graph graphtype='单柱状图' bgcolor='e1f5ff' caption='' subCaption=''  yaxisname='' xaxisname='' hovercapbg='FFFFDD' showValues='0' hovercapborder='000000' numdivlines='4' >";
	this.graphBaseXml['FCF_Area2D']="<graph graphtype='单面积图' caption='' subCaption='' yaxisname='' xaxisname='' showAlternateHGridColor='1' alternateHGridAlpha='10' alternateHGridColor='AFD8F8' numDivLines='4' decimalPrecision='0' canvasBorderThickness='1' canvasBorderColor='114B78' baseFontColor='114B78' hoverCapBorderColor='114B78' hoverCapBgColor='E7EFF6'>";
	
	this.graphBaseXml['FCF_MSLine']="<graph graphtype='多条线'  caption='{Caption}' subcaption='' xAxisName='xName' yAxisName='{yName}' hovercapbg='FFECAA' hovercapborder='F47E00' formatNumberScale='0' decimalPrecision='0' showvalues='0' animation='1' numdivlines='3' numVdivlines='0' yaxisminvalue='1000' yaxismaxvalue='1800' lineThickness='3' rotateNames='1'>";
	this.graphBaseXml['FCF_MSArea2D']="<graph graphtype='多面积'  caption='Sales Volume' subcaption='For the month of Aug 2004' divlinecolor='F47E00' numdivlines='4' showAreaBorder='1' areaBorderColor='000000' numberPrefix='$' showNames='1' numVDivLines='29' vDivLineAlpha='30' formatNumberScale='1' rotateNames='1'>";
	this.graphBaseXml['FCF_MSColumn2D']="<graph graphtype='多柱状图' xaxisname='Continent' yaxisname='Export' hovercapbg='DEDEBE' hovercapborder='889E6D' rotateNames='0' animation='1' yAxisMaxValue='100' numdivlines='9' divLineColor='CCCCCC' divLineAlpha='80' decimalPrecision='0' showAlternateHGridColor='1' AlternateHGridAlpha='30' AlternateHGridColor='CCCCCC' caption='Global Export' subcaption='In Millions Tonnes per annum pr Hectare' >";
	
	this.graphBaseXml['FCF_MSColumn2DLineDY']="<graph PYAxisName='Amount' SYAxisName='Quantity' shownames='1' showvalues='0' showLegend='1' rotateNames='0' formatNumberScale='1' decimalPrecision='2' limitsDecimalPrecision='0' divLineDecimalPrecision='1' formatNumber='1' chartTopMargin='15'>";
	
	this.config=config||{};	
	if(config.cfgcode)
	this.loadcfg(config.cfgcode);
	if(this.config.store) this.store=this.config.store;
	alert(!this.store.cmps);
	if(!this.store.cmps) this.store.cmps = [];
	
	this.store.cmps.push(this);	
	if(this.config)this.create();	
	
	return this;	
};
Asiainfo.widget.Graph.prototype={
	
	loadcfg:function (COMCODE){
		var obj_cfg=_main.CompMgr.getCfgRecord(this.layrec.get('COMCODE'));		
		if(!obj_cfg){
			alert('分组报表没有正确配置:');			
			return null
		};		
		this.cfg.store=_main.CompMgr.GetDatastore(obj_cfg.get('PARANAME'));		
		this.cfg={
			region:this.layrec.get('ALIGN'),
			rootVisible:false,
			autoScroll:true,
			expandable:false,
			enableDD:true,
			id:obj_cfg.get("OBJCODE"),
			split:obj_cfg.get("DEFAULT")=='Y'?true:false,
			title:obj_cfg.get("OBJNAME"),
			root:new Ext.tree.AsyncTreeNode({
				allowChildren:true
			}),
			width:parseInt(this.layrec.get('WIDTH')),
			height:parseInt(this.layrec.get('HEIGHT'))
			
		};		
		this.cfg.fieldname=obj_cfg.get("REMARK");		
		this.cfg.fieldwidths=obj_cfg.get("LISTVALUE").split(',');		
		this.cfg.keyname=obj_cfg.get("CNNAME");		
		this.cfg.pkeyname=obj_cfg.get("PARENTCODE");		
		this.cfg.titlename=obj_cfg.get("AWHERE").split(',');		
		this.cfg.subtype=this.cfg.subtype;		
		
	},
	dealGraphBaseXml:function(){
	    
	},
	create:function (){
	        this.dealGraphBaseXml();
		this.config.style='margin-bottom: 10px;';
		this.config.fusionCfg={id:'chv_'+this.config.id };
		 
		this.config.swfname=this.config.graphtype || 'Line';  
                this.config.chartURL='../FusionCharts/Charts/'+this.config.swfname+'.swf';
		this.control=new  Ext.ux.FusionPanel(this.config);     
		//this.control.clickfun=obj_cfg.get("CLICKFUN");
                //this.control.clickfunpara=obj_cfg.get("CLICKFUNPARA"); 
                // alert(this.config.chartURL);
                this.control.mgrCmp=this;
                if(this.config.dataUrl){
                	 
                	 this.control.setDataURL(this.config.dataUrl);
                }
                else {
                	var xml=this.getFunsionXml(this.store,this.config.xfield,this.config.yfield,this.config.zbfield);
                	 
                	this.control.setDataXML(xml,true);
                };
                
                //alert(this.config.chartURL);
                ////if('FCF_MSColumn2DLineDY'==this.config.swfname)this.control.setDataURL("aa.xml")
               // if('FCF_Line'==this.config.swfname)this.control.setDataURL("bb.xml")
              
	},
	getFunsionXml:function(ds,xfield,yfield,zbfield){
		 
	  if(('Line,Pie3D,Bar2D,Column2D,Area2D,Doughnut2D,FCF_Area2D,FCF_Line,FCF_Column2D').indexOf(this.config.swfname)!=-1)
	      return this.getSimpleSerXml(ds,xfield,zbfield)
	  else if(('MSLine,MSColumn2D,MSArea,StackedColumn2D,StackedArea2D,FCF_MSColumn2DLineDY').indexOf(this.config.swfname)!=-1) 
	      return this.getMulitiSerXml(ds,xfield,yfield,zbfield)
	  else if('AngularGauge'==this.config.swfname) 
	      return this.getgaugeXml(ds,xfield,yfield,zbfield)
	  else if('HLinearGauge'==this.config.swfname)
	  	 return this.getHLinearGaugeXml(ds,zbfield);
	  else { return null};
	},
	getSimpleSerXml:function(ds,xfield,zbfield){
    	    var data={};
			this.xMembers=null;
			
			for(var i=0;i<ds.getCount();i++){
				var r=ds.getAt(i);
				if(data[r.get(xfield)]) data[r.get(xfield)] += r.get(zbfield)
				else data[r.get(xfield)] = r.get(zbfield);
			};
			var xml=this.graphBaseXml[this.config.swfname] || '<graph caption="'+this.config.caption+'"  xAxisName="'+xfield+'" yAxisName="'+zbfield+'" >';
			var i=0;
			for(var member in data){
				var clickpara=this.objcode+','+i;
				xml+='<set name="'+member+'" value="'+data[member]+'","color"="'+10000+'" link=\"JavaScript:fusionclick(\''+clickpara+'\')" />';
			};
			this.xMembers=data;
			if(this.config.trendlines && this.config.trendlines.length>0){
			xml+="<trendlines>";
			for(var i=0;i<this.config.trendlines.length;i++){
			  var startValue=0;
                          if(this.config.trendlines[i].startValue) startValue=parseInt(Asiainfo.widget.DealSql(this.config.trendlines[i].startValue))|| 0; 
                          xml+="<line startValue='"+startValue+"' color='91C728' displayValue='"+this.config.trendlines[i].displayValue+"' showOnTop='1'/>"
                        }
                        xml+="</trendlines>";
                       }

      xml+='</graph>';
      return xml;
        },	
	getMulitiSerXml:function(ds,xfield,yfield,zbfield){
	  if(xfield && !yfield) return this.getSimpleSerXml(ds,xfield,zbfield); 
	  var objcode=this.objcode;
          this.data=null;this.xMembers=null;this.yMembers=null;
	 var xMembers=[],yMembers=[];
	 var data=[];
	 var color=['1D8BD1','F1683C','2AD62A','DBDC25','FF5904','99cc99'];
	  getDimmebers();
	  getData();
	  this.xMembers=xMembers;
    this.yMembers=yMembers;
    this.data=data;
	  
	  function getDimmebers(){
			var xPos=0;yPos=0;
			for(var i=0;i<ds.getCount();i++){
				var r=ds.getAt(i);
				if(xfield){
				  var nowXMember=r.get(xfield)?r.get(xfield):'未知';
				  if(!xMembers[nowXMember]){xMembers[nowXMember]=xPos;xPos+=1;}
			  };
			  if(yfield){
				  var nowYMember=r.get(yfield)?r.get(yfield):'未知';
				  if(!yMembers[nowYMember]){yMembers[nowYMember]=yPos;yPos+=1;}
			  };
			};
			for(var i=0;i<=xPos;i++){
				var row=[];
				for(var j=0;j<=yPos;j++) {row.push(0);}
				data.push(row); 
		  }
		  var i=0;
		  for(var label in xMembers){
		  	if(label=='indexOf' || label=='remove') continue;
		    data[i][yPos-1]=label;
		    i++;
		  }
     
		};
	 function getData(){
		 for(var i=0;i<ds.getCount();i++){
			 var r=ds.getAt(i);
			 
			 var xPos=xMembers[r.get(xfield)?r.get(xfield):'未知'];
			 var yPos=yMembers[r.get(yfield)?r.get(yfield):'未知'];
			 data[xPos][yPos]+=r.get(zbfield);
			}
		};
 
	 	
	},
	getgaugeXml:function(ds,zbfield){
	  var lowerLimit=0,upperLimit=100,scopeNum=4,dialVal=0,pointVal=0;
	  
	  if(this.config.lowerLimit) lowerLimit=parseInt(Asiainfo.widget.DealSql(this.config.lowerLimit))|| 0; 
	  if(this.config.upperLimit) upperLimit=parseInt(Asiainfo.widget.DealSql(this.config.upperLimit)) || 0; 
	  if(this.config.scopeNum) scopeNum=this.config.scopeNum; 
	  if(this.config.zbfield) dialVal=parseInt(Asiainfo.widget.DealSql(this.config.zbfield)) || 0;
	  if(this.config.pointVal) pointVal=parseInt(Asiainfo.widget.DealSql(this.config.pointVal)) || 0;
	  
	  //alert(this.config.upperLimit+","+Asiainfo.widget.DealSql(this.config.upperLimit));
	  var colorcode=['B41527','E48739','399E38','299A38']
	  var xml="<graph lowerLimit='"+lowerLimit+"' upperLimit='"+upperLimit+"' lowerLimitDisplay='差' upperLimitDisplay='好' gaugeStartAngle='180' gaugeEndAngle='0' palette='1' numberSuffix='' tickValueDistance='20' showValue='1'>";

	 // var xml="<Chart bgColor='AEC0CA,FFFFFF' fillAngle='45' upperLimit='2500000' lowerLimit='1600000' majorTMNumber='10' majorTMHeight='8' showGaugeBorder='0' gaugeOuterRadius='140'  gaugeInnerRadius='2' formatNumberScale='1'   displayValueDistance='30' decimalPrecision='2' tickMarkDecimalPrecision='1' pivotRadius='17' showPivotBorder='1' pivotBorderColor='000000' pivotBorderThickness='5' pivotFillMix='FFFFFF,000000'>";
	  xml+="<colorRange>";
	  for(var i=0;i<scopeNum;i++){
	    xml+="<color minValue='"+lowerLimit+i*(upperLimit-lowerLimit)/scopeNum+"/' maxValue='"+lowerLimit+(i+1)*(upperLimit-lowerLimit)/scopeNum+"' code='"+colorcode[i]+"'/> ";	
	  }
	 
	  xml+="</colorRange>";
	  xml+="<dials>";
	  xml+="<dial value='"+dialVal+"' borderAlpha='0' bgColor='000000' showValue='0'  baseWidth='12' topWidth='1'  />";
	 // xml+="<dial value='2500000' borderAlpha='0' bgColor='FFAA000' showValue='0'  baseWidth='12' topWidth='1' />";
	  xml+="</dials>";
	  xml+="<trendpoints>";
          xml+='<point value="'+pointVal+'" displayValue="目标" fontcolor="FF4400" useMarker="1" dashed="1" dashLen="2" dashGap="2" valueInside="1" /> '
          xml+='</trendpoints>';
           

          xml+="</graph>";
         // alert(xml);
          return xml;	
	},
	getHLinearGaugeXml:function(ds,zbfield){
	  var xml='<Chart upperLimit="9" lowerLimit="0" bgColor="FFFFFF" gaugeRoundRadius="7" borderColor="DCCEA1" chartTopMargin="17" chartBottomMargin="10" ticksBelowGauge="0" valuePadding="0" majorTMColor="323433" majorTMNumber="10" minorTMNumber="4" minorTMHeight="-4" majorTMHeight="-8" placeValuesInside="1" showShadow="0" pointerRadius="5" pointerBgColor="E00000" pointerBorderColor="E00000" showGaugeBorder="0" baseFontColor="FFFFFF" gaugeFillMix="" gaugeFillAlpha="0,0,0,0,0,0" sgaugeFillMix="{09DBFE},{32A6CF},{C1DFEA}" gaugeFillRatio="20,40,40" gaugeFillAngle="90" chartLeftMargin="30" chartRightMargin="30" animation="0">'+
                  '<colorRange>'+
                  '<color minValue="0" maxValue="9" alpha="0" /> '+
                  '</colorRange>'+
                  '<value>6.7</value> '+
                  "<annotations> <annotationGroup id='Grp1' showBelow='1' > <!--The gradient rectangle which replaces the gauge--> <annotation type='rectangle' x='13' y='15' toX='367' toY='70' radius='8' color='004D69' /> <!--Border arund the gauge--> <annotation type='rectangle' x='13' y='54' toX='367' toY='70' radius='8' color='055472,1D89AF' fillAngle='90'/> <!--The extended deep blue rectangle--> <annotation type='rectangle' x='13' y='13' toX='367' toY='52' radius='8' color='09DBFE,32A6CF,0177A7' fillRatio='20,40,40' fillAngle='90'/> <!--Gauge reflection--> <annotation type='rectangle' x='15' y='15' toX='365' toY='50' radius='8' color='09DBFE,32A6CF,C1DFEA' fillRatio='20,40,40' fillAngle='90'/> </annotationGroup> <!--The text Richter Scale--> <annotationGroup id='Grp2' showBelow='1'> <annotation type='text' label='Richter Scale' color='004D69' bold='1' x='190' y='43'/> </annotationGroup> </annotations> <styles> <definition> <style name='TTipFont' type='Font' color='FFFFFF' bgColor='004D69' borderColor='004D69'/> </definition> <application> <apply toObject='TOOLTIP' styles='TTipFont' /> </application> </styles>"+
                  '</Chart>';
          return xml;
	}, 
	getwhere:function(){
		var where='';
		if(this.xfield && this.xfieldvalue) where = this.xfield+" = '"+this.xfieldvalue+"'";
		if(this.yfield && this.yfieldvalue) where += 'and '+this.yfield+" = '"+this.yfieldvalue+"'";
		if(!where) where='1=1';
		 
		return where;
	},  
	RefreshView:function (){
	   
	  var xml=this.getFunsionXml(this.store,this.config.xfield,this.config.yfield,this.config.zbfield);
          this.control.setDataXML(xml,true);
          this.control.syncSize();
		
	}
};
