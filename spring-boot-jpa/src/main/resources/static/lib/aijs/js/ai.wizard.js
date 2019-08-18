/**
* 向导界面组件
* @author soon
*/
AI.Wizard = Event.$extend({
	 __init__ : function(options) {
	 	 this.init(options);
	}
});
/**
* 组件初始化
* @param  config 配置参数{containerId,id,items,activestep}
*/
AI.Wizard.prototype.init = function(config){
	if(!config.containerId){console.log("没有容器，组件无法渲染！请检查配置containerId");return;}

	this.config = config;
	this.containerEl = $("#" + config.containerId);//容器Element
	this.id = config.id;
	this.items = config.items;
	this.activestep = config.activestep||1;//初始化显示step
	this.build();
	this.initEvents();
};
/**
* 向导界面创建
*/
AI.Wizard.prototype.build = function(){
	this.$el = $('<div id="'+this.id+'" class="wizard" data-initialize="wizard"></div>');
	this.$steps = $('<ul class="steps"></ul>');
	this.$actions = $('<div class="actions"></div>');
	this.$stepContent = $('<div class="step-content"></div>');
	this.buildWizardSteps();
	this.buildWizardActions();
	this.buildWizardStepContent();
	this.containerEl.empty().append(this.$el);
};
/**
* 根据items配置创建向导步骤
*/
AI.Wizard.prototype.buildWizardSteps = function(){
	var tabTmpl = '<li data-step="{no}" class="{class}">'
		+'<span class="badge">{no}</span>{label}<span class="chevron"></span>'
		+'</li>';
	for(var i=0;i<this.items.length;i++){
		var _item = this.items[i];
		var _isActive = i==0?'active ':'';
		this.$steps.append(tabTmpl.replace(/{no}/g,i+1)
			.replace('{class}',_isActive+_item['class'])
			.replace('{label}',_item['label']));
	}
	this.$el.append(this.$steps);
};
/**
* 创建向导操作按钮
*/
AI.Wizard.prototype.buildWizardActions = function(){
	this.$actions.append(
		'<button class="btn btn-default btn-prev">'
		+'<span class="glyphicon glyphicon-arrow-left"></span>上一步</button>'
		+'<button class="btn btn-default btn-next" data-last="完成">下一步 '
		+'<span class="glyphicon glyphicon-arrow-right"></span></button>');
	this.$el.append(this.$actions);
};
/**
* 根据items配置创建向导步骤内容
*/
AI.Wizard.prototype.buildWizardStepContent = function(){
	var contentTmpl = '<div class="step-pane {class} sample-pane" data-step="{no}">{content}</div>';
	for(var i=0;i<this.items.length;i++){
		var _item = this.items[i];
		var _isActive = i==0?'active ':'';
		this.$stepContent.append(
			contentTmpl.replace(/{no}/g,i+1)
			.replace('{class}',_isActive+_item['class'])
			.replace('{content}',_item['content']));
	}
	this.$el.append(this.$stepContent);
};
/**
* 事件绑定
*/
AI.Wizard.prototype.initEvents = function(){
	 $("#" + this.config.id).wizard('selectedItem', {
            step: this.activestep
   });
  var items  =this.items
	$("#" + this.config.id).on('actionclicked.fu.wizard', function(event, stepInfo) {
			if (stepInfo.direction == 'next'){
					var _item = items[stepInfo.step-1];
					if(_item.next){
							return _item.next.call(this);
					}
				}else if(stepInfo.direction == 'previous'){
					var _item = items[stepInfo.step-1];
					if(_item.previous){
							return _item.previous.call(this);
					}
				} 
	});		
};


 