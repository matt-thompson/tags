(function($) {
  'use strict';

  var Tags = {
  
    defaultClass: null,
    classMap: {'CLASS':Class},
    sequentialNumber: 1,
    parseTime: 0,
    workTime: 0,
    
    register: function(tag,cls) {
//      log.debug("Tags.register tag="+tag);
      Tags.classMap[tag.toUpperCase()] = cls;
      return cls;
    },

    define: function(proto) {
      var extended = null;
      if (proto.extend) extended = Tags.classMap[proto.extend.toUpperCase()];
      extended = extended || Tags.defaultClass;
      var cls = extended.extend(proto);
      if (proto.tag) Tags.classMap[proto.tag.toUpperCase()] = cls;
//      log.debug("Tags.extend classMap="+JSON.stringify(Tags.classMap));
      return cls;  
    },
        
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
  
    showTag: function(tag) {
      var buf = "TAG:";
      for (var key in tag) {
        var val = tag[key];
        if (typeof val == 'function') {
          buf = buf + " key["+key+"]=function()";
        } else if ($.isArray(val)) {
          buf = buf + " key["+key+"]=array";
        } else {
          buf = buf + " key["+key+"]="+val;
        }
      }
      return buf;
    },
    
    create: function(config) {
      var xmldoc, tag, Cls, child, n;
      var startTime = new Date().getTime();
      if (!config) return null;
      if (typeof config == 'string') {
//        log.debug("BUILD text="+config);
        var trimmed = $.trim(config);
        if (trimmed.length > 0 && trimmed.charAt(0) == '<') {
          var xmlnode;
          if (window.DOMParser) {
            var parser = new DOMParser();
            xmldoc = parser.parseFromString(trimmed,"text/xml");
            xmlnode = xmldoc.documentElement;
          } else {
//            log.debug("Using AxtiveX");
            xmldoc = new ActiveXObject("Microsoft.XMLDOM");
//            log.debug("have xmldoc nodeType="+xmldoc.nodeType);
            xmldoc.async = false;
            xmldoc.loadXML(trimmed);
//            log.debug("XMLDOC.nodeType="+xmldoc.nodeType);
            xmlnode = xmldoc.documentElement;
          }
          var time = new Date().getTime();
          Tags.parseTime += time - startTime;
          startTime = time;
          window.theXmlnode = xmlnode;
//          log.debug("xmlnode.nodeType="+xmlnode.nodeType);
          tag = Tags.create(xmlnode);
//          log.debug("BUILD tag="+tag.tag);
          Tags.workTime += new Date().getTime() - startTime;
          return tag;
        } else {
          return config;
        }
      } else if (config.nodeType == 1) {
        // XML Node element
        var attrs = {tag:config.nodeName};
//        log.debug("BUILD-XML nodeName="+config.nodeName);
        var nodeAttrs = config.attributes;
        for (var m=0; m<nodeAttrs.length; m++) {
          var attr = nodeAttrs[m];
          attrs[attr.name] = attr.value;
        }
//        log.debug("BUILD-XML attrs="+JSON.stringify(attrs));
        Cls = Tags.classMap[attrs.tag.toUpperCase()] || Tags.defaultClass;
        tag = new Cls(attrs);
//        log.debug("BUILD-XML tag="+Tags.showTag(tag));
        tag._isTag = true;
        var children = config.childNodes;
        if (children) {
          tag.content = [];
          var val;
          for (n=0; n<children.length; n++) {
            var childNode = children[n];
            switch (childNode.nodeType) {
            case 1:  // ELEMENT_NODE
              child = Tags.create(childNode);
              if (Tags.isTag(child)) child.parent = tag;
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
        Tags.workTime += new Date().getTime() - startTime;
        return tag;
      } else if ((typeof config) != 'object' || config._isTag) {
        return config;
      } else {
        // Javascript Object
        Cls = Tags.classMap[config.tag.toUpperCase()] || Tags.defaultClass;
        tag = new Cls(config);
        tag._isTag = true;
        if (config.content) {
          if (typeof config.content == 'object') {
            for (n in config.content) {
              child = Tags.create(config.content[n]);
              if (Tags.isTag(child)) child.parent = tag;
              config.content[n] = child;
            }
          } else {
            child = Tags.create(config.content);
            if (Tags.isTag(child)) child.parent = tag;
            tag.content = child;
          }
        }
        Tags.workTime += new Date().getTime() - startTime;
        return tag;
      }
    } // Tags.create()
    
  }; //Tags
  
  window.Tags = Tags;
    
  var View = Tags.define({
    tag:'view',
    extend:'class',

    init:function(config) {
      for (var key in config) {
        this[key] = config[key];
      }     
    },
    
    render: function() {
      this.el = $(this.renderText());
      return this.el;
    },
    
    // Custom tags that inherit from View should override this.
    renderText: function() {
      return this.renderAs(this.htmlTag || this.tag);
    },

    renderAs: function(tag) {
      var context = this.renderOpen(tag);
      this.renderBody(context);
      this.renderClose(context);
      return context.buf;
    },
    
    renderOpen: function(tag) {
      var context = {buf:"<",first:true,tag:tag};    
      context.buf += tag;
      if (!this.id) {
        this.id = "tag-"+Tags.sequentialNumber;
        Tags.sequentialNumber++;
//        log.debug("renderOpen id="+this.id+" seq="+Tags.sequentialNumber);
      }
      for (var key in this) {
        if (!key) continue;
        var ch = key.charAt(0);
        if ((ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) continue;
        var val = this[key];
        if (val === null) continue;
        var type = typeof val;
        if (type == 'string' || type == 'number' || type == 'boolean') {
          context.buf += " "+key+"='"+val+"'";
//          log.debug(" VAL["+key+"]="+val);
        }
      }
      return context;
    },
    
    renderBody: function(context) {
      if (this.content) {
        var content = this.content;
        if (typeof content != 'object') content = [content];
        for (var n in content) {
          this.addContentItem(context,content[n]);
        }
      }
    },
    
    renderClose: function(context) {
      if (context.first) {
        context.buf += "/>";
      } else {
        context.buf += "</"+context.tag+">";
      }
    },
    
    addContentItem: function(context, item) {
      if (context.first) {
        context.first = false;
        context.buf += ">";
      }
      if (Tags.isTag(item)) {
        context.buf += item.renderText();
      } else if (typeof item == 'object') {
      } else {
        context.buf += item;
      }
    },
    
    //
    addContent: function(contentToAdd) {
      if ($.isArray(contentToAdd)) {
        this.content = this.content || [];
        if (!$.isArray(this.content)) this.content = [this.content];
        for (var n=0; n<contentToAdd.length; n++) {
          this.content.push(Tags.create(contentToAdd[n]));
        }
      } else if (typeof contentToAdd == 'object') {
        this.content = this.content || {};
        for (var key in contentToAdd) {
          this.content[key] = Tags.create(contentToAdd[key]);
        }
      } else if (contentToAdd) {
        if ($.isArray(this.content)) {
          this.content.push(Tags.create(contentToAdd));
        } else if (this.content) {
          this.content = [this.content,Tags.create(contentToAdd)];
        } else {
          this.content = Tags.create(contentToAdd);
        }
      }
    },
    
    addClass: function() {
      var n;
      log.debug("addClass args.len="+arguments.length);
      var originalClass = this.class;
      var classes = {};
      if (this.class) {
        var classList = this.class.split(' ');
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
      this.class = classText;
      if (this.el) this.el.attr('class',classText);
      log.debug("addClass "+originalClass+" --> "+this.class);
    },
     
    removeClass: function() {
      var n;
      log.debug("removeClass args.len="+arguments.length);
      var originalClass = this.class;
      var classes = {};
      if (this.class) {
        var classList = this.class.split(' ');
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
      this.class = classText;
      if (this.el) this.el.attr('class',classText);
      log.debug("removeClass "+originalClass+" --> "+this.class);
    },
     
    activate: function() {
//      log.debug("ACTIVATE1 haveEl="+!!this.el+" id="+this.id);
      if (!this.el && this.id) this.el = $("#"+this.id);
//      log.debug("ACTIVATE2 haveEl="+!!this.el+" id="+this.id);
      if (this.on) {
        for (var key in this.on) {
          log.debug("ON key="+key);
          this.el.on(key,this.on[key]);
        }
      }
      if (this.content) {
        for (var n in this.content) {
          var item = this.content[n];
          if (Tags.isTag(item)) item.activate();
        }
      }
    }
    
  });

  Tags.defaultClass = View;
  
  // Apply any custom-tags found in script tags with type='text/custom-tag'  
  
  $(document).ready(function() {
    $("script[type='text/custom-tags']").each(function() {
      var scriptTag = $(this);
      var lastTag = scriptTag;
      var wrapper = Tags.create("<wrapper>"+scriptTag.html()+"</wrapper>");
      for (var n=0; n<wrapper.content.length; n++) {
        var tag = wrapper.content[n];
        if (Tags.isTag(tag)) {
          lastTag.after(tag.render());
          tag.activate();
          log.debug("ACTIVATED id="+tag.id);
          lastTag = tag.el;
        }
      }
    });
    log.debug("PARSE TIME="+Tags.parseTime+" WORK TIME="+Tags.workTime);
  });
  

})(jQuery);
