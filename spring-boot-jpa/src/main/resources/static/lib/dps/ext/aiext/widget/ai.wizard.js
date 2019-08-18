Ext.namespace("Asiainfo.widget.Wizard");
 Asiainfo.widget.Wizard  = Ext.extend(Ext.Panel, {
  	cards : null,
  	previousButtonText : '&lt; Previous',
  	nextButtonText : 'Next &gt;',
  	cancelButtonText : 'Cancel',	
  	finishButtonText : 'Finish',
  	steps :[],	
  	previousButton : null,
  	nextButton : null,
  	cancelButton : null,
  	cardPanel : null,
  	currentCard : -1,
  	headPanel : null,
  	canHeadWizard:false,
  	initComponent : function()
	{   
	    baseFun.loadScript('/'+contextPath+'/public/css/wizard.css','css'); 
	    this.initButtons();
	    this.initPanels();
	    
	    var title = this.title || '';   
	    Ext.apply(this, {
	        title     : title,
	        layout    : 'border',    
	        cardCount : this.cards.length,
		      /*buttons   : [
		        this.previousButton,
			    this.nextButton,
			    this.cancelButton
		    ],*/  
		    items : [
		        this.headPanel,
			this.cardPanel
		    ]  
	    });
	    
	    this.addEvents(
            'cancel',
            'finish'
	    );
	    
		Asiainfo.widget.Wizard.superclass.initComponent.call(this);
	},
	initEvents : function()
	{
	    Asiainfo.widget.Wizard.superclass.initEvents.call(this);
	    
		var cards = this.cards;
		
		for (var i = 0, len = cards.length; i < len; i++) {
			cards[i].on('show', this.onCardShow, this);
			cards[i].on('hide', this.onCardHide, this);
			cards[i].on('clientvalidation', this.onClientValidation, this);
		}
	},
       initPanels : function()  {
        var cards           = this.cards;
        var cardPanelConfig = this.cardPanelConfig;
        
        if(this.steps.length==0){
	    	for(var i=0;i<this.cards.length;i++)
	    	  this.steps.push(this.cards[i].title || '第'+i+'步');
	    };
	 
        this.headPanel = new Asiainfo.widget.Wizard.Header({steps:this.steps,ownct:this,canHeadWizard:this.canHeadWizard});	
            
        this.cardPanel = new Ext.Panel({
           region:'center',
           layout:'card',
            activeItem: 0, // make sure the active item is set on the container config!
           bodyStyle: 'padding:0px',
           defaults: { border:false },
           items: cards
      });  
    }, 
    initButtons	: function()
    {
		this.previousButton = new Ext.Button({
			text 	 : this.previousButtonText,
			disabled : true,
			minWidth : 75,
			handler  : this.onPreviousClick,
			scope	 : this
		});
		
		this.nextButton = new Ext.Button({
			text	 : this.nextButtonText,
			minWidth : 75,
			handler  : this.onNextClick,
			scope	 : this
		});
		
		this.cancelButton = new Ext.Button({
			text	 : this.cancelButtonText,
			handler  : this.onCancelClick,
			scope	 : this,
			minWidth : 75		
		});
    },
    onClientValidation : function(card, isValid)
	{
		if (!isValid) {
			this.nextButton.setDisabled(true);	
		} else {
			this.nextButton.setDisabled(false);	
		}
	},
   onCardHide : function(card)
	{
	    if (this.cardPanel.layout.activeItem.id === card.id) {
	        this.nextButton.setDisabled(true);	
	    }
	},
   onCardShow : function(card)
	{
		var parent = card.ownerCt;
		this.ActiveCard=card;
		var items = parent.items;
		
		for (var i = 0, len = items.length; i < len; i++) {
			if (items.get(i).id == card.id) {
				break;	
			}	
		}
		
		this.currentCard = i;
		this.headPanel.updateStep(i,card.tip||card.title);
		 
		if (i == len-1) {
			this.nextButton.setText(this.finishButtonText);	
		} else {
			this.nextButton.setText(this.nextButtonText);
		}
		 
		this.nextButton.setDisabled(false);
		if (i == 0) {
			this.previousButton.setDisabled(true);
			this.nextButton.setDisabled(false);
		} else {
			this.previousButton.setDisabled(false);	
		}
		
	},
    onCancelClick : function()
	{
	    var d = document.getElementById('wizhead');

     var olddiv = document.getElementById("fa_0");

     d.removeChild(olddiv);

	},
	onFinish : function()
	{
	    var result = this.ActiveCard.fireEvent('finish', this.ActiveCard,1); 
	    if(result!=false) {
             
            }
            if (this.fireEvent('finish', this) !== false) {
                
            }
	},	
	onPreviousClick : function()
	{
		if (this.currentCard > 0) {
			this.cardPanel.getLayout().setActiveItem(this.currentCard - 1);	
		}
	},
        setActiveStep:function(curStep){
           if(curStep<this.cardCount)
           this.cardPanel.getLayout().setActiveItem(curStep)    
        },
	onNextClick : function()
	{       var result = this.ActiveCard.fireEvent('next', this.ActiveCard,1); 
		if(result!=false){
		if (this.currentCard == this.cardCount-1) {
			this.onFinish();
		} else {
			this.cardPanel.getLayout().setActiveItem(this.currentCard+1);
		}
	      }
	}
 })
 
Asiainfo.widget.Wizard.Header = Ext.extend(Ext.Panel, {
    height : 55, 
    region : 'north', 
    title : null,
    steps : [], 
    lastActiveStep : -1,
    ownct:null,//上级
    canHeadWizard:false,
    initComponent : function(){
    	var   headDiv   =   document.createElement("DIV");  
        headDiv.id='wizhead';
        headDiv.className ="help_step_box fa";
         
        var headboxEl=document.body.appendChild(headDiv);
        
    	for(var i=0;i<this.steps.length;i++){
    	    var stepDiv=document.createElement("DIV");
    	    stepDiv.id="fa_"+i;
    	    if(i==0)stepDiv.className="help_step_set"
    	    else stepDiv.className="help_step_item";
    	    stepDiv.innerHTML='<div class="help_step_num">'+(i+1)+'</div>'+this.steps[i] +'<div class="help_step_right"></div>';
    	    stepDiv.ownct=this;
    	    headboxEl.appendChild(stepDiv);
    	    if(this.canHeadWizard)
    	    stepDiv.onclick=function(){this.ownct.setActiveStep(this.id.substr(3))};
        };
        var tipDiv=document.createElement("DIV");
    	    tipDiv.id="fa_tip"; 
    	    tipDiv.innerHTML='<br><span style="float:right;padding-right:12px;"><font colro=blue size=2>当前操作说明:<br>Required. String that specifies the name of an element. </span> </p> ';
    	     
    	    headboxEl.appendChild(tipDiv);
        this.contentEl='wizhead';
    	Asiainfo.widget.Wizard.Header.superclass.initComponent.call(this);
    	
    },
    setActiveStep:function(currentStep){
    	if(this.ownct && this.ownct.setActiveStep)this.ownct.setActiveStep(currentStep);
    },
    updateStep: function(currentStep, title) {
  	   //alert(this.rendered+','+crentStep);
  	if(!this.rendered)return ;
  	if(document.getElementById("fa_tip")){
  	  if(!title)document.getElementById("fa_tip").innerHTML=''
  	  else
  	  document.getElementById("fa_tip").innerHTML='<br><span style="float:right;padding-right:12px;"><font color=blue size=2>当前操作说明:<br>'+title+' </span> </p> ';	
  	};
	for (i=0;i<this.steps.length;i++){
	   
	  if(document.getElementById("fa_"+i))	document.getElementById("fa_"+i).className='help_step_item';
	}
	if(document.getElementById("fa_"+currentStep)) document.getElementById("fa_"+currentStep).className+=" help_step_set"
 	this.lastActiveStep = currentStep; 
  	}
  });

 