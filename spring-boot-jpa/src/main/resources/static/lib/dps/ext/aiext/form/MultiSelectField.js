Ext.form.MultiSelectField = Ext.extend(Ext.form.TriggerField, {
    readOnly : true,
    defaultAutoCreate : {
        tag : "input",
        type : "text",
        size : "40",
        autocomplete : "off"
    },
    displayField : 'text',
    contextArray : undefined, 
    valueField : undefined,
    hiddenName : undefined,
    listWidth : undefined,
    minListWidth : 50,
    defaltValueArray:undefined,
    layerHeight : 120,
    minLayerHeight : 60,
    value : undefined,
    baseParams : {},
    checkpanel : undefined,
    initComponent : function() {
        Ext.form.MultiSelectField.superclass.initComponent.call(this);
        this.addEvents('select', 'expand', 'collapse', 'beforeselect');
        
        if (this.transform) {
            this.allowDomMove = false;
            var s = Ext.getDom(this.transform);
            if (!this.hiddenName) {
                this.hiddenName = s.name;
            }
            s.name = Ext.id();
            if (!this.lazyRender) {
                this.target = true;
                this.el = Ext.DomHelper.insertBefore(s, this.autoCreate
                        || this.defaultAutoCreate);
                Ext.removeNode(s);
                this.render(this.el.parentNode);
                
            } else {
                Ext.removeNode(s);
            }

        }
    },
    onRender : function(ct, position) {
        Ext.form.MultiSelectField.superclass.onRender.call(this, ct, position);
        if (this.hiddenName) {
            this.hiddenField = this.el.insertSibling({
                tag : 'input',
                type : 'hidden',
                name : this.hiddenName,
                id : (this.hiddenId || this.hiddenName)
            }, 'before', true);
            this.hiddenField.value = this.hiddenValue !== undefined
                    ? this.hiddenValue
                    : this.value !== undefined ? this.value : '';
            this.el.dom.removeAttribute('name');
        }
        if (Ext.isGecko) {
            this.el.dom.setAttribute('autocomplete', 'off');
        }
        this.initList();
    },
    initList : function() {
        if (!this.list) {
            var cls = 'x-multiselectfield-list';
            this.list = new Ext.Layer({
                shadow : this.shadow,
                cls : [cls, this.listClass].join(' '),
                constrain : false
            });
            var lw = this.listWidth
                    || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.list.setWidth(lw);
            this.list.swallowEvent('mousewheel');
            this.innerList = this.list.createChild({
                cls : cls + '-inner'
            });
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
            this.innerList.setHeight(this.layerHeight || this.minLayerHeight);
            if (!this.checkpanel) {
                this.checkpanel = this.CheckPanel(this.innerList);
            }
            this.checkpanel.render();
        }
    },
    onSelect : function(id, text, checked) {
        this.setValue(id, text, checked);
    },
    CheckPanel : function(el) {
        var checkpanel = new Ext.Panel({
            el : el,
            autoScroll : true
        });
        var multiselectField = this;
        if (typeof this.contextArray != 'undefined') {

            for (var i = 0; i < this.contextArray.length; i++) {
            
                var contArry = this.contextArray[i];
                var auto_field = new Ext.form.Checkbox({
                    boxLabel : contArry[1],
                    id : contArry[0],
                    name : contArry[0],
                    cls : 'x-multiselectfield-list'
                });
                auto_field.on('check', function(auto_field) {
                    multiselectField.onSelect(auto_field.id,auto_field.boxLabel, auto_field.checked);
                });

                if(typeof this.defaltValueArray != 'undefined'){
                    for (var j = 0; j < this.defaltValueArray.length; j++) {
                        var defvalArry =  this.defaltValueArray[j];

                        if(defvalArry[0]==contArry[0]){
                            auto_field.checked=true;
                        }
                    }
                }

                checkpanel.add(auto_field);
            }
        }
        return checkpanel
    },
    getValue : function() {
        if (typeof this.value != 'undefined') {
            return this.value;
        } else {
            return Ext.form.MultiSelectField.superclass.getValue.call(this);
        }
    },
    setValue : function(id, text, ischecked) {
        var text = text;
        var value = id;
        var return_text_string;
        var return_value_string;

        var text_temp = Ext.form.MultiSelectField.superclass.getValue.call(this);
        var ids_temp = typeof this.value != 'undefined' ? this.value : '';
        var text_arrtemp = text_temp.split(",");
        var ID_arrtemp = ids_temp.split(",");
        if(ischecked)   
        {         
           text_arrtemp.push(text); 
            ID_arrtemp.push(value);
        }   
        else  
        {   
            text_arrtemp.remove(text);
            ID_arrtemp.remove(value);
        }   

        return_text_string = text_arrtemp.toString();
        return_value_string = ID_arrtemp.toString();
        var first_text_str = return_text_string.substr(0, 1);
        var first_value_str = return_value_string.substr(0, 1);
        if (first_text_str == ",") {
            return_text_string = return_text_string.substr(1);
        }
        if (first_value_str == ",") {
            return_value_string = return_value_string.substr(1);
        }
        Ext.form.MultiSelectField.superclass.setValue.call(this,return_text_string);
        
        this.value = return_value_string;

        if (this.hiddenField) {
            this.hiddenField.value = return_value_string;
        }

    },
    onDestroy : function() {
        if (this.list) {
            this.list.destroy();
        }
        Ext.form.MultiSelectField.superclass.onDestroy.call(this);
    },
    collapseIf : function(e) {
        if (!e.within(this.wrap) && !e.within(this.list)) {
            this.collapse();
        }
    },
    expand : function() {
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        this.list.alignTo(this.wrap, this.listAlign);
        this.list.show();
        Ext.getDoc().on('mousewheel', this.collapseIf, this);
        Ext.getDoc().on('mousedown', this.collapseIf, this);
        this.fireEvent('expand', this);
    },
    collapse : function() {
        if (!this.isExpanded()) {
            return;
        }
        this.list.hide();
        Ext.getDoc().un('mousewheel', this.collapseIf, this);
        Ext.getDoc().un('mousedown', this.collapseIf, this);
        this.fireEvent('collapse', this);
    },
    isExpanded : function() {
        return this.list && this.list.isVisible();
    },
    onTriggerClick : function() {
        if (this.disabled) {
            return;
        }
        if (this.isExpanded()) {
            this.collapse();
        } else {
            this.onFocus({});
            this.expand();
        }
        this.el.focus();
    }
});
Ext.reg('multiselectfield', Ext.form.MultiSelectField);
Array.prototype.remove=function(str)
{
    var tmp=this;
    for(i=0;i<tmp.length;i++)
    {
        if(tmp[i].toString()==str){
            tmp.splice(i,1);
            break;
        }
    }
} 