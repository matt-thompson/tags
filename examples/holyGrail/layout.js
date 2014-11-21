//# layout.js File
//
// See <a href='showsource.html?source=examples/holyGrail/index.html'>HTML source</a>.
//
// See <a href='showsource.html?source=examples/holyGrail/layout.css'>Layout CSS source</a>.
//
// See <a href='showsource.html?source=examples/holyGrail/app.css'>App CSS source</a>.
// 
// This implements Border Layout and Tabs.
//

//## Slider type
//
// This is an internal type. It is instantiated as a result of setting one
// of the North, South, East or West elements to be resizeable.
//
Tags.define({tag:'slider', extend:'view', htmlTag:'div',
  activate:function() {
    var self = this;
    var middle;
    if (this.side === 'top') {
      this.$el.css({position:'absolute', top:'0px', height:'5px', width:'100%', 'z-index':1000, cursor:'ns-resize'});
      middle = this.parent.middleBand;
    } else if (this.side === 'bottom') {
      this.$el.css({position:'absolute', bottom:'0px', height:'5px', width:'100%', 'z-index':1000, cursor:'ns-resize'});
      middle = this.parent.middleBand;
    } else if (this.side === 'left') {
      this.$el.css({position:'absolute', left:'0px', width:'5px', height:'100%', 'z-index':1000, cursor:'ew-resize'});
      middle = this.parent.middle;
    } else if (this.side === 'right') {
      this.$el.css({position:'absolute', right:'0px', width:'5px', height:'100%', 'z-index':1000, cursor:'ew-resize'});
      middle = this.parent.middle;
    }
    this.$el.on('mousedown',function() {
      self.parent.$el.on('mousemove',function(e) {
        var anchorPos = self.anchor.$el.offset();
        if (self.side === 'top') {
          var anchorBorderHt = self.anchor.$el.outerHeight(true) - self.anchor.$el.height();
          var anchorMinHt = parseInt(self.anchor.$el.css('min-height'));
          var anchorHt = e.pageY - anchorPos.top; // candidate anchorHt
          if (anchorMinHt > 0 && (anchorMinHt + anchorBorderHt) > anchorHt) anchorHt = anchorMinHt + anchorBorderHt;
          self.anchor.$el.height(anchorHt - anchorBorderHt);
          middle.$el.css('top',anchorHt+'px');
        } else if (self.side === 'bottom') {
          var outerHt = self.anchor.$el.outerHeight(true);
          var anchorBorderHt = outerHt - self.anchor.$el.height();
          var anchorMinHt = parseInt(self.anchor.$el.css('min-height'));
          var anchorHt = anchorPos.top + outerHt - e.pageY;
          if (anchorMinHt > 0 && (anchorMinHt + anchorBorderHt) > anchorHt) anchorHt = anchorMinHt + anchorBorderHt;
          self.anchor.$el.height(anchorHt - anchorBorderHt);
          middle.$el.css('bottom',anchorHt+'px');
        } else if (self.side === 'left') {
          var anchorBorderWd = self.anchor.$el.outerWidth(true) - self.anchor.$el.width();
          var anchorMinWd = parseInt(self.anchor.$el.css('min-width'));
          var anchorWd = e.pageX - anchorPos.left;
          if (anchorMinWd > 0 && (anchorMinWd + anchorBorderWd) > anchorWd) anchorWd = anchorMinWd + anchorBorderWd;
          self.anchor.$el.width(anchorWd - anchorBorderWd);
          middle.$el.css('left',anchorWd+'px');
        } else if (self.side === 'right') {
          var outerWd = self.anchor.$el.outerWidth(true);
          var anchorBorderWd = outerWd - self.anchor.$el.width();
          var anchorMinWd = parseInt(self.anchor.$el.css('min-width'));
          var anchorWd = anchorPos.left + outerWd - e.pageX;
          if (anchorMinWd > 0 && (anchorMinWd + anchorBorderWd) > anchorWd) anchorWd = anchorMinWd + anchorBorderWd;
          self.anchor.$el.width(anchorWd - anchorBorderWd);
          middle.$el.css('right',anchorWd+'px');
        }
      });
      self.parent.$el.on('mouseup',function(e) {
        self.parent.$el.off('mousemove mouseup');
      });
    });
    this.super();
  }
});
  
//## type BorderLayout
//
// This defines a container with elements laid out in above (North),
// below (South), to the left (West) and to the right (East) of a 
// Middle element.
//  
Tags.define({tag:'borderLayout', extend:'view', htmlTag:'div',

  render:function() {
    this.north = null;
    this.south = null;
    this.east = null;
    this.west = null;
    this.middle = null;
    var middleBand = [];
    var content = this.content;
    this.content = [];
    for (var n=0; n<content.length; n++) {
      var item = content[n];
      if (!Tags.isTag(item)) continue;
      if (item.hasClass('north')) {
        this.north = item;
        this.content.push(item);
      } else if (item.hasClass('south')) {
        this.south = item;
        this.content.push(item);
      } else if (item.hasClass('east')) {
        this.east = item;
        middleBand.push(item);
      } else if (item.hasClass('west')) {
        this.west = item;
        middleBand.push(item);
      } else if (item.hasClass('middle')) {
        if (this.middle) this.content.push(this.middle);
        this.middle = item;
      } else if (!this.middle) {
        this.middle = item;
      } else {
        this.content.push(item);
      }
    }
    if (this.east || this.west) {
      middleBand.push(this.middle);
      this.content.push(Tags.create({tag:'div', id:this.dot('middleBand'), content:middleBand}));
    } else {
      this.content.push(this.middle);
      this.middleBand = this.middle;
    }
    if (this.north && this.north.hasClass('resize')) this.middle.addContent({tag:'slider', side:'top', anchor:this.north, parent:this});
    if (this.south && this.south.hasClass('resize')) this.middle.addContent({tag:'slider', side:'bottom', anchor:this.south, parent:this});
    if (this.east && this.east.hasClass('resize')) this.middle.addContent({tag:'slider', side:'right', anchor:this.east, parent:this});
    if (this.west && this.west.hasClass('resize')) this.middle.addContent({tag:'slider', side:'left', anchor:this.west, parent:this});
    return this.super();
  },
  
  activate:function() {
    this.middle.$el.css({position:'absolute'});
    var top = 0;
    var bottom = 0;
    var left = 0;
    var right = 0;
    if (this.north) {
      top = this.north.$el.outerHeight(true);
      this.north.$el.css({position:'absolute', left:'0px', right:'0px', top:'0px', 'overflow':'auto'});
    }
    if (this.south) {
      bottom = this.south.$el.outerHeight(true);
      this.south.$el.css({position:'absolute', left:'0px', right:'0px', bottom:'0px', 'overflow':'auto'});
    }
    if (this.east) {
      right = this.east.$el.outerWidth(true);
      this.east.$el.css({position:'absolute', top:'0px', bottom:'0px', right:'0px', 'overflow':'auto'});
    }
    if (this.west) {
      left = this.west.$el.outerWidth(true);
      this.west.$el.css({position:'absolute', top:'0px', bottom:'0px', left:'0px', 'overflow':'auto'});
    }
    if (this.east || this.west) {
      this.middleBand.$el.css({position:'absolute',top:top+'px',bottom:bottom+'px', width:'100%', overflow:'auto'});
      this.middle.$el.css({position:'absolute',top:'0px', bottom:'0px', left:left+'px', right:right+'px'});
      var el = this.middle.$el;
      console.log('MIDDLE left,right,top,bottom='+el.css('left')+','+el.css('right')+','+el.css('top')+','+el.css('bottom'));
    } else {
      this.middle.$el.css({position:'absolute',top:top+'px',bottom:bottom+'px',left:'0px',right:'0px'});
    }
    this.super();
  }
});

//## type Tabs
//
// This is a container for Tab elements.
//
Tags.define({tag:'tabs', extend:'view', htmlTag:'div',
  render:function() {
    var tabs = [];
    for (var n=0; n<this.content.length; n++) {
      var tab = this.content[n];
      if (!Tags.isTag(tab)) continue;
      tabs.push(Tags.create({tag:'div', 'class':'tabSpacer', style:'width:6px; margin:0 -1px 0 -1px; height:24px;', content:'\xA0'})); 
      tabs.push(tab);
    }
    tabs.push(Tags.create({tag:'div', 'class':'endTab', style:'height:24px;', content:'\xA0'}));
    this.content = [];
    this.addContent([{tag:'div', style:'position:absolute; left:0px; right:0px; top:0px; height:26px;', 
                      id:this.dot('tabButtons'), 'class':'tabRow', content:tabs},
                     {tag:'div', style:'position:absolute; width:100%; top:26px; bottom:0px;', id:this.dot('tabContent')}]);
                    
    return this.super();
  }
});

//## type Tab
//
// This defines a Tab button and the content that can be shown or hidden as
// Tab buttons are clicked.
//
Tags.define({tag:'tab', extend:'view', htmlTag:'div',
  render:function() {
    var nestedContent = this.content;
    this.content = [];
    this.addContent(this.label);
    this.addClass('tab');
    this.parent.tabContent.addContent({tag:'div', style:'width:100%; height:100%;', id:this.dot('tabContent'), content:nestedContent});
    return this.super();
  },
  activate:function() {
    var self = this;
    this.$el.on('click',function() {
      if (self.parent.selectedTab) self.parent.selectedTab.toggle(false);
      self.parent.selectedTab = self;
      self.toggle(true);
    });
    if (this.hasClass('selected')) {
      this.$el.trigger('click');
    } else {
      this.tabContent.$el.toggle(false);
    }
  },
  toggle:function(selected) {
    this.tabContent.$el.toggle(selected);
    if (selected) {
      this.addClass('selected');
    } else {
      this.removeClass('selected');
    }  
  }
});
