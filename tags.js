// tags.js 0.9.2

var log = log || {debug:function() {}};

//# Tags namespace
//
// The Tags namespace provides the capability to define Tag types using
// Tags.define() and instantiate Tag types using Tags.create().
//
// Tag types mimic XML. They have a 'tag' attribute which holds
// the tag name and a 'content' attribute which holds nested content.
//
//<br/>
//   
var Tags = {

  // Map type names to Constructors which can be used to instatiate the mapped type
  protoMap: {},
  
  // Provide a name space for instantiated objects
  ns: {},
  
  // Provide an a unique ID - increment each time used
  nextId: 0,
  
  // Keeps track of errors
  errors: [],
  
  // Internal - keep track of fixups
  fixups: {},
  
  // Implement _.extend() method so we do not need to depend on underscore.js
  extendProto: function(obj) {
    for (var n=1,len=arguments.length; n<len; n++) {
      var source = arguments[n];
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  },

  // Return the prototype associated with the tagName provided
  proto: function(tagName) {
    return Tags.protoMap[tagName.toUpperCase()].prototype;
  },
  
  // Convenience method to create a unique ID
  uniqueId: function(prefix) {
    Tags.nextId++;
    return (prefix || 'tag-')+Tags.nextId;
  },
  
  // Internal debugging method to display an arbitrary object
  show: function(tag,indent,all) {
    if (typeof tag == 'boolean' || typeof tag == 'number') return ''+tag;
    if (typeof tag == 'string') return '"'+tag.trim()+'"';
    if (tag === null) return 'null';
    if (tag === undefined) return 'undefined';
    if (typeof tag === 'function') return 'FUN';
    if (indent === undefined) indent = null;
    var text = '';
    if (typeof tag === 'object') {
      if (tag.length) {
        text += '[';
        if (indent !== null) {
          for (var n=0; n<tag.length; n++) {
            if (n > 0) text += ',';
            text += Tags.show(tag[n],indent);
          }
        }
        return text + ']';
      }
      text += "{";
      if (tag.tag) text += "tag:'"+tag.tag+"'";
      for (var key in tag) {
        if (key =='tag' || key == 'content') continue;
        var val = tag[key];
        if (typeof val == 'function') {
          if (all) {
            if (text.length > 4) text += ', ';
            text += key+':FUN';
          }
        } else if (typeof val === 'object') {
          if (text.length > 4) text += ', ';
          text += key+':{'+(val.tag ? 'tag:'+val.tag : '')+'}';
        } else {
          if (text.length > 4) text += ', ';
          text += key+':'+Tags.show(val);
        }
      }
      if (indent !== null && tag.content) {
        if (text.length > 4) text += ', ';
        text += 'content:';  
        var content = tag.content;
        if ($.isArray(content)) {
          text += '[\n';
          indent += '  ';
          for (var n=0; n<content.length; n++) {
            text += indent + Tags.show(content[n],indent)+'\n';
          }
          indent = indent.substr(2);
          text += indent + ']';
        } else {
          text += Tags.show(content);
        }
      }
      return text + '}';
    }
  },

  // internal
  addFixup: function(path,fixup) {
    var fixups = Tags.fixups[path];
    if (!fixups) {
      fixups = [];
      Tags.fixups[path] = fixups;
    }
    fixups.push(fixup);
  },
  
  // internal
  resolveFixups: function() {
    for (var key in Tags.fixups) {
      var fixups = Tags.fixups[key];
      delete Tags.fixups[key];
      var tag = Tags.ns[key];
      for (var n=0; n<fixups.length; n++) {
        var fixup = fixups[n];
        if (fixup.callback) {
          Tags.refFrom(tag,fixup.path,fixup.target,fixup.name,fixup.callback);
        } else {
          Tags.assignTo(tag,fixup.path,fixup.val);
        }
      }
    }
  },
        
  // internal
  assignTo: function(root,path,val) {
    var parts = typeof path === 'string' ? path.split('.') : path;
    if (!path || !path.length) throw "Tags.assignTo PATH is REQUIRED";
    var item = root;
    var nextItem;
    var n;
    for (n=0; n<parts.length-1; n++) {
      if (!(nextItem = item[parts[n]])) {
        item.id || (item.id = Tags.uniqueId());
        var nextItemId = parts.slice(0,n).join('.');
        console.log('assignTo ADD-FIXUP path='+path+' val.id='+val.id);
        Tags.addFixup(nextItemId,{path:parts.slice(n),val:val});
        return;
      }
      item = nextItem;
    }
    console.log('assignTo SETTING path='+path+' val.id='+val.id);
    item[parts[n]] = val;
  },

  // internal  
  refFrom: function(root,path,target,name,callback) {
    var parts = typeof path === 'string' ? path.split('.') : path;
    var item = root;
    var nextItem;
    var n;
    if (!target.id) target.id = Tags.uniqueId();
    for (n=0; n<parts.length; n++) {
      if (!(nextItem = item[parts[n]])) {
        var nextItemId = parts.slice(0,n+1).join('.');
        if (callback) {
          var subParts = parts.slice(n+1);
          var fixup = {path:subParts,target:target,name:name,callback:callback};
          Tags.addFixup(nextItemId,fixup);
        }
        return null;
      }
      item = nextItem;
    }
    if (callback) callback.call(target,name,item);
    return item;
  },

  // internal    
  assign: function(path,val) {
    Tags.assignTo(Tags.ns,path,val);
  },
  
  //
  ref: function(path,name,callback) {
    return Tags.refFrom(Tags.ns,path,this,name,callback);
  },
          
//### method Tags.define()
//
// arguments:
//
//* proto a simple object whose attributes will be copied to the prototype
//  of the type being defined.
//
//> Define a new type which extends another type and can be instantiated using Tags.create().
//
// The proto parameter is copied into the prototype of the new type. A 'tag'
// attribute is required and will be used to find the type definition by the Tags.create() method.
//
// An optional 'extend' attribute specifies the name of the type to be extended. It will
// extend the 'ROOT' type if not provided.
//
// An optional 'content' attribute contains nested content.
//
// Additional attributes of the 'proto' parameter will be added to the prototype
// of the class being defined.
//
//<br/>
//   
  define: function(proto) {
    var text = '';
    var superCls = Tags.protoMap[(proto.extend || 'root').toUpperCase()] || Tags.Root;
    var theConstructor = function() {};
    var superProto = new superCls();
    theConstructor.prototype = Tags.extendProto({},superProto,proto);
    theConstructor.prototype.constructor = superCls;
    Tags.protoMap[proto.tag.toUpperCase()] = theConstructor;
    return theConstructor;
  },
      
//### method Tags.isTag()
//
// arguments:
//
//* val the value for which the determination is to be made
//
//* tagName an optional comma seaparated list of tag names
// 
//Convenience function for determining if a value is a Tag, possibly of a specified type.
// 
//The val arguments is the object to be tested
//
//The tagName is an optional list of tagNames - if provided the object's tag must match
//one of the list
//
  isTag: function(val, tagName) {
    if (!val) return false;
    if (typeof val != 'object' || !val._isTag) return false;
    if (!tagName) return true;
    if ($.isArray(tagName)) {
      for (var n=0; n<tagName.length; n++) if (tagName[n] == val.tag) return true;
      return false;
    }
    return val.tag == tagName;
  },

//### method Tags.create()
//
// arguments:
//
//* config the object that specifies the object to be created
//
//* parent an optional reference to the object to contain the created object
//
//Create a new instance of a Tag type
//
//The config argument may be of any type. If it is
//a boolean, number, string not starting with &lt; or evaluates
//to false then the value of the 'config' argument is returned.
//
//If config is an XML DOM object, it will be used to instantiate
//an object where the XML tag name is used to select the type
//and XML attributes are mapped to object attributes. Nested
//content will be evaluated recursively and stored in the 'content'
//attribute.
//
//If config is a string starting with '&lt;', then it will be
//parsed into an XML DOM argument and interpreted as described above.
//
//If config is a plain object, it will be used to instantiate an object
//where the 'tag' attribute selects the type and the optional 'content'
//attribute is interpreted as nested content. Other attributes will be
//copied into the instantiated object.
//
//The optional parent argument specifies the parent of the instantiated
//object and will be store in the 'parent' attribute.
//
  create: function(config,parent) {
    var tag, Cls, child, n;

    if (!config) return config;
      if (typeof config == 'string') {
        var trimmed = $.trim(config);
        if (trimmed.length > 0 && trimmed.charAt(0) == '<') {
          var xmlnode = $.parseXML(trimmed).documentElement;
          window.theXmlnode = xmlnode;
          log.debug("xmlnode.nodeType="+xmlnode.nodeType);
          tag = Tags.create(xmlnode,parent);
          return tag;
        } else {
          return config;
        }
      } else if (config.nodeType == 1) {
        var attrs = {tag:config.nodeName};
        var nodeAttrs = config.attributes;
        for (var m=0; m<nodeAttrs.length; m++) {
          var attr = nodeAttrs[m];
          attrs[attr.name] = attr.value;
        }
        var clsName = attrs.tag.toUpperCase();
        Cls = Tags.protoMap[clsName] || Tags.Root;
        if (!Cls) throw "No class found for tag="+attrs.tag;
        tag = new Cls();
        tag.initialize(attrs,parent);
        tag.tag = attrs.tag;
        tag._isTag = true;
        var children = config.childNodes;
        if (children) {
          tag.content = [];
          var val;
          for (n=0; n<children.length; n++) {
            var childNode = children[n];
            switch (childNode.nodeType) {
            case 1:  // ELEMENT_NODE
              child = Tags.create(childNode,tag);
              tag.content.push(child);
              break;
            case 3:  // TEXT_NODE
              val = childNode.nodeValue;
              tag.content.push(val);
              break;
            case 4:  // CDATA_SECTION_NODE
              val = childNode.nodeValue;
              tag.content.push(val);
              break;
            }
          }
        }
        return tag;
      } else if ($.isArray(config)) {
        var tags = [];
        for (var n=0; n<config.length; n++) {
          tags.push(Tags.create(config[n],parent));
        }
        return tags;
      } else if ((typeof config) != 'object' || config._isTag) {
        return config;
      } else {
        var clsName = config.tag.toUpperCase();
        Cls = Tags.protoMap[clsName] || Tags.Root;
        tag = new Cls();
        tag.initialize(config,parent);
        tag._isTag = true;
        if (config.content) {
          if ($.isArray(config.content)) {
            tag.content = [];
            for (var n in config.content) {
              var child = Tags.create(config.content[n],tag);
              tag.content.push(child);
            }
          } else {
            var child = Tags.create(config.content,tag);
            tag.content = child;
          }
        }
        return tag;
      }
      console.log("Tags.create ERROR="+err);
      Tags.errors.push(err);
      return null;
  } // Tags.create()
   
}; //Tags

var Root = function() {};

//## type Root
//
//This contains the low-level processing shared by all Tag objects. If a define()
//method specifies no 'extend' attribute, it will default to extend this type.
//
//<br/>
//
Tags.extendProto(Root.prototype, {

  tag:'root',
  
//### method root.initialize()
//
//arguments:
//
//* config - the config object specifying attributes to be copied to the instantiated object
//
//* parent - optional parent argument from Tags.create()
//
//Function to initialize the instance from the config value. This is called 
//automatically by the Tags Framework infrastructure when Tags.create() is called. 
//Override this method
//if type-specific initialization is required, but be sure to invoke this.super()
//from the overridding method.
//
  initialize: function(config,parent) {
    if (!this.parent && parent) this.parent = parent;
    for (var key in config) {
      var val = config[key];
      key = key.toString().trim();
      if (key.substr(0,4) === 'ref-') {
        var name = key.substr(4);
        var path = val;
        var self = this;
        if (path.length > 0 && path.charAt(0) === '.') {
          Tags.refFrom(self,path.substr(1),this,name,function(name,val) {self[name] = val;});
        } else {
          Tags.refFrom(Tags.ns,path,this,name,function(name,val) {self[name] = val;});
        }
      } else {
        this[key] = val;
      }
    }
    if (this.id) {
      if (this.id.substr(0,8) === '.parent.') {
        this.id = parent.id+this.id.substr(7);
      }
      Tags.ns[this.id] = this;
      console.log('ID='+this.id+' calling Tags.assignTo ...');
      Tags.assignTo(Tags.ns,this.id,this);
    }
    if (this.expectedAttrs) {
      for (var key in this.expectedAttrs) {
        if (!this[key]) log.debug("Tag "+this.tag+" missing expected attribute '"+key+"'");
      }
    }
  },

  //### method root.getId()
  //
  //Get the ID, creating one if the object does not have one.
  // 
  getId: function() {
    if (!this.id) {
      this.id = Tags.uniqueId();
      Tags.ns[this.id] = this;
      if (this.$el) this.$el.attr("id",this.id);
    }
    return this.id;
  },  
  
  //### method root.dot()
  //
  //Convenience method to define an id relative to a tag.
  //
  dot: function(label) {
    return this.getId()+'.'+label;
  },

  //### method root.super()
  //
  //Invoke the overridden method of the caller.
  //
  super: function() {
    var meth = arguments.callee.caller;
    if (meth._super === undefined) { // check for first super call
      var proto = this;
      outer: while (proto) {
        for (var methName in proto) {
          if (proto[methName] === meth) {
            proto = proto.constructor.prototype;
            meth._super = proto[methName] || null;
            break outer;
          }
        }
        proto = proto.constructor.prototype;
      }
    }
    if (meth._super) return meth._super.apply(this,arguments);
  },


  //internal
  assign: function(path,val) {
    Tags.assignTo(this,path,val);
  },
  
  //internal
  ref: function(path,name,callback) {
    return Tags.refFrom(this,path,this,name,callback);
  }
  
});

//Manually register the 'root' type with the Tags framework.
Root.prototype.constructor = null;
Tags.protoMap['ROOT'] = Root;
Tags.Root = Root;

//## type View
//
//> A built-in type for handling HTML tags. Every HTML5 tag is a Tag type that
//> extends View. This means you can use arbitrary HTML5 tags and use them to
//> generate HTML. You can also define your own View extensions and mix them
//> with the standard HTML5 View objects.
//
//The life cycle of a View object involves:
//
//* Instantiate - Use XML or Tags.create()
//
//* Render - Invoke view.render() - Optional for static HTML
//
//* Attach to the DOM - Use jQuery on the result from view.render() (unless it is static HTML)
//
//* Activate - Attach event handlers - optional if no event handlers needed
//
//<br/>
//

var viewInitCount = 0;

var View = Tags.define({
  tag:'view',
  extend:'root',
  isView: true,
  defaultOptions: {tag:true,content:true},
  
//### method view.initialize()
//
// see root.initialize()
  initialize: function(config,parent) {
    viewInitCount++;
    Tags.proto('root').initialize.apply(this,arguments);
    this.attrs || (this.attrs = {});
    var options = this.options || {};
    for (var key in config) {
      var val = config[key];
      var type = typeof val;
      key = key.toString().trim();
      if (   (type == 'string' || type == 'number' || type == 'boolean') 
          && !this.defaultOptions[key] && !options[key]) {
        this.attrs[key] = val;
      }
    }
  },
  
//### method $()
//
//Convenient short-cut for this.$el.find(selector).
//
  $:function(selector) {
    return this.$el.find(selector);
  },
  
//### method view.render()
//
// Render an HTML DOM representation of the tag and return it as a jQuery object
//
// This method recursively renders nested content. Invoke it as this.prototype._super()
// from the overriding method to painlessly render nested content.
//
  render: function() {
    var el = document.createElement(this.htmlTag || this.tag);
    this.$el = $(el);
    for (var key in this.attrs) {
      el.setAttribute(key,this.attrs[key]);
    }
    if (this.content) {
      if (typeof this.content == 'string') {
        this.$el.append(document.createTextNode(this.content));
      } else if ($.isArray(this.content)) {
        for (var n=0; n<this.content.length; n++) {
          var child = this.content[n];
          if (Tags.isTag(child) && child.isView) {
            this.$el.append(child.render());
          } else if (typeof child == 'string') {
            this.$el.append(document.createTextNode(child));
          }
        }
      } else if (Tags.isTag(this.content)) {
        if (this.content.isView) this.$el.append(this.content.render());
      } else {
        var text = this.content;
        this.$el.text(text);
      }
    }
    return this.$el;
  },
  
  //### method addContent()
  //
  //arguments:
  //
  //* contentToAdd - this is the content to add
  //
  //A single value, object or array is expected. The item (or each item in the
  //array) is passed to Tags.create() and the result is added to the content of
  //the object.
  //
  addContent: function(contentToAdd) {
    this.content = this.content || [];
    if (!$.isArray(this.content)) this.content = [this.content];
    if ($.isArray(contentToAdd)) {
      for (var n=0; n<contentToAdd.length; n++) {
        this.content.push(Tags.create(contentToAdd[n],this));
      }
    } else if (contentToAdd) {
      this.content.push(Tags.create(contentToAdd,this));
    }
    Tags.resolveFixups();
  },

  //### method view.insertContent()  
  //
  //arguments:
  //
  //* index - the index of where in the content, the new content is to be inserted
  //
  //* contentToAdd - this is the content to add
  //
  //This works like addContent() except that an offset into the content[] array can
  //be specified.
  //
  //<br/>
  insertContent: function(index, contentToAdd) {
    this.content = this.content || [];
    if (!$.isArray(this.content)) this.content = [this.content];
    if ($.isArray(contentToAdd)) {
      for (var n=0; n<contentToAdd.length; n++) {
        this.content.splice(index,Tags.create(contentToAdd[n],this),0);
        index++;
      }
    } else if (contentToAdd) {
      this.content.splice(index,Tags.create(contentToAdd,this),1);
    }
    Tags.resolveFixups();
  },    
  
  //### method view.refresh()
  //
  // Go through this.content and make sure every entry has been rendered.
  // Call this method after doing a series of calls to view.addContent()
  // on an object that has already been rendered.
  //
  refresh:function() {
    var content = this.content || [];
    if (! $.isArray(content)) content = [content];
    var base = null;
    for (var n=0; n<content.length; n++) {
      var item = content[n];
      if (!Tags.isTag(item)) continue;
      if (!item.$el) {
        var el = item.render();
        if (base) {
          base.append(el);
        } else {
          this.$el.prepend(el);
        }
        item.activate();
      }
      base = item.$el;
    }
  },
  
  //### method view.hasClass()
  //
  //arguments:
  //
  //* theClass - the class to check for
  //
  //Determine if the specified class string is in the objects 'class' attribute.
  //
  hasClass: function(theClass) {
    if (!this['class']) return false;
    var classList = this['class'].split(' ');
    for (var n=0; n<classList.length; n++) if (classList[n] == theClass) return true;
    return false;
  },
      
//### method view.addClass()
//
//arguments:
//
//* theClass - the class to add to the object's 'class' attribute
//
  addClass: function() {
    var n;
    var classes = {};
    if (this.attrs['class']) {
      var classList = this.attrs['class'].split(' ');
      for (n=0; n<classList.length; n++) classes[classList[n]] = true;
    }
    if (arguments.length > 0) {
      for (n=0; n<arguments.length; n++) {
        classes[arguments[n]] = true;
      }
    }
    var classText = "";
    for (var key in classes) {
      if (classText) classText += ' ';
      classText += key;
    }
    this.attrs['class'] = classText;
    if (this.$el) this.$el.attr('class',classText);
  },
   
//### method view.removeClass()
//
//arguments:
//
//* theClass - the class to remove
//
//Remove the class from the object's 'class' attribute.
//
  removeClass: function() {
    var n;
    var classes = {};
    if (this.attrs['class']) {
      var classList = this.attrs['class'].split(' ');
      for (n=0; n<classList.length; n++) classes[classList[n]] = true;
    }
    if (arguments.length > 0) {
      for (n=0; n<arguments.length; n++) {
        classes[arguments[n]] = false;
      }
    }
    var classText = "";
    for (var key in classes) {
      if (!classes[key]) continue;
      if (classText) classText += ' ';
      classText += key;
    }
    this.attrs['class'] = classText;
    if (this.$el) this.$el.attr('class',classText);
  },
   
  walk: function(callback) {
    for (var n in this.content) {
      var item = this.content[n];
      if (!Tags.isTag(item)) continue;
      callback(item);
      item.walk(callback);
    }
  },
  
  checkEl: function() {
    if (!this.$el && (this.el || this.id)) {
      log.debug("checkEl FIXING tag="+this.tag+" el="+(this.el || this.id));
      this.$el = $(this.el || "#"+this.id);
    }
  },
    
//### method view.activate method
//
//Apply event handlers and take other actions that need to be delayed until the View is added to the DOM.
//
//An overridden activate() method is a good place to define and attach event handlers. This
//View object provides a convenient place to save information used by handlers.
//
//Invoke this function of the View class using this._super() in order to make sure
//that activate() is called on nested content.
//
//A side effect of this function is to make sure that this.$el is set. It will normally
//be set by the render() method, but if render() is not called (i.e., it is being used
//with static HTML), then activate() will attempt to set this.$el and thus associate
//the object with the static HTML by first checking for the this.el attribute. If found,
//it will be used as a jQuery selector to find the DOM object to use. If not found, it
//will check for the this.id attribute. If found, it will be assumed to be the same as
//the ID attribute of the DOM element and used to locate the DOM element by ID.
//
//This function processes the this.on attribute as a plain object containing
//eventName:eventHandler pairs to be attached. The eventName can be any legal event
//name.
//
  activate: function() {
    if (this.on) {
      var self = this;
      for (var key in this.on) {
        if (!this.$el) throw "$el NOT FOUND";
        (function(theKey) {
          var meth = self.on[theKey];
          self.$el.on(theKey,function(event) {
            console.log("on."+theKey);
            meth.call(self,event);
          });
        })(key);
      }
    }
    if (this.content) {
      if ($.isArray(this.content)) {
        for (var n=0; n<this.content.length; n++) {
          var item = this.content[n];
          if (Tags.isTag(item) && item.isView) item.activate();
        }
      }
    } else if (Tags.isTag(this.content)) {
      this.content.activate();
    }
  },
  
  //### method view.update()
  //
  //arguments:
  //
  //* ANY 
  //
  //Recursively invoke the update() method on all contained view tags
  //passing the same arguments passed to this method.
  //
  update:function() {
    if (this.content) {
      if ($.isArray(this.content)) {
        log.debug("update ARRAY");
        for (var n=0; n<this.content.length; n++) {
          var item = this.content[n];
          if (Tags.isTag(item) && item.isView) {
            log.debug("calling item.update tag="+item.tag);
//            item.update(model);
            item.update.apply(item,arguments);
          }
        }
      } else if (Tags.isTag(this.content)) {
        log.debug("update ONE");
        this.content.update.apply(this.content,arguments);
      }
    }
  }
  
});

//This is the list of standard HTML5 tags that will be implemented
//as Tag types that extend the 'view' type.
//
var htmlTags = [
  'a','abbr','acronym','address','applet','area','article','aside','audio',
  'b','base','basefont','bdi','bdo','big','blockquote','body','br','button',
  'canvas','caption','center','cite','code','col','colgroup',
  'datalist','dd','del','details','dfn','dialog','dir','div','dl','dt',
  'em','embeded',
  'fieldset','figcaption','figure','figure','font','footer','form','frame','frameset',
  'head','header','h1','h2','h3','h4','h5','h6','hr','html',
  'i','iframe','img','input','ins',
  'kbd','keygen',
  'label','legend','li','link',
  'main','mark','menu',
  'menuitem','meta','meter',
  'nav','noframes','noscript','object','ol','option','optgroup','output',
  'p','param','pre','progress',
  'q',
  'rp' ,'rt','ruby',
  's','samp','script','section','select','small','source','span','stike','strong','style','sub','summary','sup',
  'table','tbody','td','textarea','tfoot','th','thead','time','title','tr','track','tt',
  'u','ul',
  'var','video',
  'wbr'
];
  
//Define a new type for every HTML5 tag.
for (var n=0; n<htmlTags.length; n++) {
  var htmlTag = htmlTags[n];
  Tags.define({tag:htmlTag, extend:'view'});
}

//Apply any custom-tags found in script tags with type='text/tags'  

$(document).ready(function() {
  log.debug("READY");
  log.debug("TAGS ready script.len="+$("script").length);
  log.debug("TAGS ready LEN="+$("script[type^='text/tags']").length);
  var scriptList = [];
  //Go through script tags and instantiate all of the custom tags
  $("script[type='text/tags']").each(function() {
    var scriptTag = $(this);
    var wrapper = Tags.create("<wrapper>"+scriptTag.html()+"</wrapper>");
    var tagList = [];
    scriptList.push({loc:scriptTag,tags:tagList});
    for (var n=0; n<wrapper.content.length; n++) {
      var tag = wrapper.content[n];
      if (Tags.isTag(tag)) tagList.push(tag);
    }
  });
  
  Tags.resolveFixups();
  
  //Go through all the custom tags and render them.
  for (var n=0; n<scriptList.length; n++) {
    var script = scriptList[n];
    var loc = script.loc;
    for (var m=0; m<script.tags.length; m++) {
      var tag = script.tags[m];
      if (tag.isView) {
        loc.after(tag.render([]));
        loc = tag.$el;
      }
    }
  }
  //Go through all the custom tags and activate any with activate() method.
  for (var n=0; n<scriptList.length; n++) {
    var script = scriptList[n];
    var loc = script.loc;
    for (var m=0; m<script.tags.length; m++) {
      var tag = script.tags[m];
      if (tag.activate) tag.activate();
    }
  }
});

//
