Ext.namespace("Asiainfo.widget.DataPivot");
var DataPivot=function (ds,xfield,yfield,zbfield){
	this.ds=ds;
	 
	this.data=[];
	this.xfield=xfield;
	this.yfield=yfield;
	this.zbfield=zbfield;
	this.xMembers=null;
	this.yMembers=null;
	this.getDimmebers(ds,xfield,yfield);
	this.getData(ds);
     	 
};
DataPivot.prototype={
	getDimmebers : function(ds,xfield,yfield) { 
		var xPos=0;yPos=0;
		var xMembers=[],yMembers=[];
			for(var i=0;i<ds.getCount();i++){
				var r=ds.getAt(i);
				if(xfield){
				var nowXMember=r.get(xfield)?r.get(xfield):'未知'; 
				if(typeof(xMembers[nowXMember]) =='undefined'){xMembers[nowXMember]=xPos;xPos+=1;}
				};
				if(yfield){
					var nowYMember=r.get(yfield)?r.get(yfield):'未知';
					if(typeof(yMembers[nowYMember]) =='undefined'){yMembers[nowYMember]=yPos;yPos+=1;}
				};
			};
			for(var i=0;i<xPos;i++){
				var row=[];
				for(var j=0;j<yPos;j++) {row.push(0);}
				this.data.push(row); 
			}
			this.xMembers=xMembers;
			this.yMembers=yMembers;
        
	},
	getData:function (ds){
		for(var i=0;i<ds.getCount();i++){
		var r=ds.getAt(i);
			var xPos=this.xMembers[r.get(this.xfield)?r.get(this.xfield):'未知'];
			var yPos=this.yMembers[r.get(this.yfield)?r.get(this.yfield):'未知'];
			this.data[xPos][yPos]+=r.get(this.zbfield)||0;
		}
	},
	addEvent:function(store){
		for(var i=0;i<store.getCount();i++){
			var r=store.getAt(i);
			if(!r.get('ICON')) continue;
				var xPos=this.xMembers[r.get(this.xfield)?r.get(this.xfield):'未知'];
				var yPos=this.yMembers[r.get(this.yfield)?r.get(this.yfield):'未知'];
				this.data[xPos][yPos] = { y: this.data[xPos][yPos], marker: { symbol: 'url(../images/'+r.get('ICON')+')' } };
		}
	}
 }