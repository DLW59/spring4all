/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */
Ext.override(Ext.form.Label, {
    setText: function(t){
        this.text = t;
        if(this.rendered){
            this.el.update(t);
        }
    }
});
Ext.form.Label.prototype.afterRender = Ext.form.Label.prototype.afterRender
     .createSequence(function() {
        this.relayEvents(this.el, ['click']);
       }); 
 
function myaddfile(parentObj){
     var dialog = new Ext.ux.UploadDialog.Dialog({
        url: '/'+contextPath+'/fileupload',
    	  modal: true,
    	   reset_on_hide: false
        });
        
        dialog.setBaseParams({
			   cmd:'upload',
			   uploadPath:Ext.getCmp(parentObj).serverPath,
			    over_write:true
		     });
        dialog.parentObj=parentObj;
	dialog.on('uploadsuccess', Ext.getCmp(parentObj).onUploadSuccess); 
        dialog.show();
     
};
function mydelfile(parentObj,fileName){
  Ext.getCmp(parentObj).onDelFile(fileName);
};
Ext.form.FileField = Ext.extend(Ext.form.TextField,  {
    buttonText: 'Select...',
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to false).  If true, all inherited TextField members will still be available.
     */
    buttonOnly: true,
    /**
     * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
     * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
     */
    buttonOffset: 2,
    /**
     * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
     */

    // private
    readOnly: false,
     
    /**
     * @hide 
     * @method autoSize
     */
    autoSize: Ext.emptyFn,
    
    /**serpath*/
    serverPath:'',
    onDelFile:function(fileName){
    	
      var allfile =this.getValue() ;
     
      allfile=allfile.replace(';'+fileName,'');
      this.setValue(allfile);
      this.fileInfo.setText(this.getDisplayHtml());
    },
    onUploadSuccess:function(dialog, filename, resp_data, record){
    	 var _filefield=Ext.getCmp(dialog.parentObj);
    	 if(!_filefield) return;
       var _fileName = filename.substring(filename.lastIndexOf('\\')+1);
        var allfile =_filefield.getValue() ;
        allfile+=';'+_fileName;
        _filefield.setValue(allfile);
        _filefield.fileInfo.setText(_filefield.getDisplayHtml());
        _filefield.fireEvent('change', _filefield, allfile,'');  
    },
    getDisplayHtml:function(){
    	 var attHtml='';
         var attachs=[];
         if(this.getValue()) attachs =this.getValue().split(';');
         for(var i=0;i<attachs.length;i++){
	  if (attachs[i].length>=2){
	       attHtml+='<a href=/'+contextPath+'/fileMgr?cmd=download&filepath='+this.serverPath+'&filename='+encodeURIComponent(attachs[i])+'>'+attachs[i]+'</a>'
	       if(!this.readOnly)attHtml+='<a href=# ><img  onclick="mydelfile(\''+this.getId()+'\',\''+attachs[i]+'\')" alt="ɾ��" src="../images/file-remove.gif"></a>'+';';
	  }
         }; 
       
       if(!this.readOnly) attHtml+='<a href=# ><img onclick="myaddfile(\''+this.getId()+'\')" alt="add" src="../images/file-add.gif"></a>';
       return attHtml;
    },
    // private
    initComponent: function(){
    	 
        Ext.form.FileField.superclass.initComponent.call(this);
        
        this.addEvents(
            /**
             * @event fileselected
             * Fires when the underlying file input field's value has changed from the user
             * selecting a new file from the system file selection dialog.
             * @param {Ext.form.FileField} this
             * @param {String} value The file value returned by the underlying file input field
             */
            'fileselected'
        );
    },
    setValue:function(value){
    	 Ext.form.FileField.superclass.setValue.call(this,value);
    	 if(this.fileInfo) 
    	 this.fileInfo.setText(this.getDisplayHtml());
    },
    // private
    
 
    onRender : function(ct, position){
    	 
        Ext.form.FileField.superclass.onRender.call(this, ct, position);
       
        this.wrap = this.el.wrap({cls:'x-form-field-wrap x-form-file-wrap'});
        this.el.addClass('x-form-file-text');
        this.el.dom.removeAttribute('name');
         
        this.fileInput = this.wrap.createChild({
            id: this.getFileInputId(),
            name: this.name||this.getId(),
            cls: 'x-form-file',
            tag: 'input', 
            type: 'file',
            width:30,
            size: 1
        });
        
        
       this.fileInfo=new Ext.form.Label({renderTo:this.wrap,html:this.getDisplayHtml()});
       
        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText
        });
        
        if(this.buttonOnly){
            this.el.hide();
           // this.wrap.setWidth(this.button.getEl().getWidth());
        }
        
        this.fileInput.on('change', function(){
            var v = this.fileInput.dom.value;
            this.setValue(v);
            this.fileInfo.setText(v);
            this.fireEvent('fileselected', this, v);
        }, this);
    },
    
    // private
    getFileInputId: function(){
        return this.id+'-file';
    },
    
    // private
    onResize : function(w, h){
        Ext.form.FileField.superclass.onResize.call(this, w, h);
        
        this.wrap.setWidth(w);
        
        if(!this.buttonOnly){
           // var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
           // this.el.setWidth(w);
        }
    },
    
    // private
    preFocus : Ext.emptyFn,
    
    // private
    getResizeEl : function(){
        return this.wrap;
    },

    // private
    getPositionEl : function(){
        return this.wrap;
    },

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }
    
});
Ext.reg('FileField', Ext.form.FileField);
 
Ext.form.FileUploadField = Ext.extend(Ext.form.TextField,  {
    /**
     * @cfg {String} buttonText The button text to display on the upload button (defaults to
     * 'Browse...').  Note that if you supply a value for {@link #buttonCfg}, the buttonCfg.text
     * value will be used instead if available.
     */
    buttonText: 'Browse...',
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to false).  If true, all inherited TextField members will still be available.
     */
    buttonOnly: false,
    /**
     * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
     * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
     */
    buttonOffset: 3,
    /**
     * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
     */

    // private
    readOnly: true,
    
    /**
     * @hide 
     * @method autoSize
     */
    autoSize: Ext.emptyFn,
    
    /**serpath*/
    serverPath:'',
    // private
    initComponent: function(){
        Ext.form.FileUploadField.superclass.initComponent.call(this);
        
        this.addEvents(
            /**
             * @event fileselected
             * Fires when the underlying file input field's value has changed from the user
             * selecting a new file from the system file selection dialog.
             * @param {Ext.form.FileUploadField} this
             * @param {String} value The file value returned by the underlying file input field
             */
            'fileselected'
        );
    },
    
    // private
    onRender : function(ct, position){
        Ext.form.FileUploadField.superclass.onRender.call(this, ct, position);
        
        this.wrap = this.el.wrap({cls:'x-form-field-wrap x-form-file-wrap'});
        this.el.addClass('x-form-file-text');
        this.el.dom.removeAttribute('name');

        this.fileInput = this.wrap.createChild({
            id: this.getFileInputId(),
            //name: this.name||this.getId(),
            name: 'file',
            cls: 'x-form-file',
            tag: 'input', 
            type: 'file',
            width:30,
            size: 1
        });
        
        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText
        });
        this.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: this.wrap,
            cls: 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
        }));
        
        if(this.buttonOnly){
            this.el.hide();
            this.wrap.setWidth(this.button.getEl().getWidth());
        }
        
        this.fileInput.on('change', function(){
            var v = this.fileInput.dom.value;
            this.setValue(v);
            this.fireEvent('fileselected', this, v);
        }, this);
    },
    
    // private
    getFileInputId: function(){
        return this.id+'-file';
    },
    
    // private
    onResize : function(w, h){
        Ext.form.FileUploadField.superclass.onResize.call(this, w, h);
        
        this.wrap.setWidth(w);
        
        if(!this.buttonOnly){
            var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            this.el.setWidth(w);
        }
    },
    
    // private
    preFocus : Ext.emptyFn,
    
    // private
    getResizeEl : function(){
        return this.wrap;
    },

    // private
    getPositionEl : function(){
        return this.wrap;
    },

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }
    
});
Ext.reg('fileuploadfield', Ext.form.FileUploadField);