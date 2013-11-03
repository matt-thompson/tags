
var log = log || {debug:function() {}};

//(function($) {

var parseCssInt = function(el,key) {
  return parseInt(el.css(key)) || 0;
};

/** Implement a set of Widgets that provide layout capabilities.
 * <p>Implement widgets which
 *    provide the ability to layout and resize components horizontally.
 *    and vertically.</p>
 * <ul>
 *  <li><a href='hbox.html'>&lt;hbox&gt;</a> - Layout components horizontally.</li>
 *  <li><a href='vbox.html'>&lt;vbox&gt;</a> - Layout components vertically.</li>
 *  <li><a href='slider.html'>&lt;slider&gt;</a> - Resize an adjacent component.</li>
 *  <li><a href='tabs.html'>&lt;tabs&gt;</a> - Provide a container for tabs.</li>
 *  <li><a href='tab.html'>&lt;tab&gt;</a> - Labels and holds HTML for a tab.</li>
 * </ul>
 *
 * <p>These widgets all inherit from {@link View}.</p>
 *
 * <p>Widgets defined here can be used like standard HTML tags from
 *    within &lt;style&gt; tags with type of 'text/custom-tags'. They
 *    may also be used with standard View API from Javascript.</p>
 *
 * 
<h3>Example</h3>
<caption>This demonstrates all of the boxlib Widgets (<a href='../examples/holy-grail.html'>Holy Grail Example</a>)</caption>
<pre style='border:solid thin green; overflow:auto; height:500px; padding:3px 4px; background:#efe;'>
&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /&gt;
  &lt;title&gt;The Holy Grail of Layouts: Tags Version&lt;/title&gt;
  &lt;link rel="stylesheet" href="css/boxlib.css"&gt;
  &lt;script src="../../bower_components/jquery/jquery.js"&gt;&lt;/script&gt;
  &lt;script src="../../bower_components/log4javascript/log4javascript.js"&gt;&lt;/script&gt;
  &lt;script&gt;
//    var log = log4javascript.getDefaultLogger();
    log = {debug: function(x) {}};
    log.debug("DEBUG - Enabled");
  &lt;/script&gt;
  &lt;script src="../../js/tags.js"&gt;&lt;/script&gt;
  &lt;script src="../../js/boxlib.js"&gt;&lt;/script&gt;
  &lt;style type="text/css"&gt;
    html {margin:0; width:100%; height:100%;}
    body {margin:0; width:100%; height:100%; overflow:hidden; background-color: #eee;}

    #header, #footer {font-size: large; text-align:center; background-color: #999;}
    #left {padding: 0 8px; text-align: justify; background-color: #66F; margin:0;}
    #center {text-align: justify; background-color:#eee; margin:0;}
    #center p {padding:0 8px;}
    #right {padding: 0 8px; text-align: justify; background-color: #F66; margin:0;}

    .tags-tab-container {height:2.0rem;}
    .tags-tab-button {border:solid thin #222; background-color:#ddd; color:#222;}
    .tags-tab-button.selected {border-bottom: solid thin #eee; background-color:#eee;}
    .tags-tab-spacer {border-bottom:solid thin #222;}
    .tags-tab-choice {background-color:#eee;}

  &lt;/style&gt;
&lt;/head&gt;

&lt;body style='overflow:auto;'&gt;

  &lt;script type='text/custom-tags'&gt;
    &lt;vbox style='left:0; right:0;'&gt;
      &lt;div layout='fixed' id="header" style='padding:20px 0px; left:0; right:0;'&gt;This is the header.&lt;/div&gt;
      
      &lt;hbox layout='extend' style='margin:0; padding:0; width:100%; padding:0; margin:0'&gt;
        &lt;div layout='fixed' id="left" style='width:180px; overflow:auto;'&gt; 
          &lt;h2&gt;This is the left sidebar.&lt;/h2&gt;
          &lt;p&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
        &lt;/div&gt;
        
        &lt;slider/&gt;
      
        &lt;div layout='flex' style='overflow:auto;'  id="center"&gt;
          &lt;h1&gt;This is the main content.&lt;/h1&gt;
          &lt;tabs&gt;
            &lt;tab label='Lorem'&gt;
              &lt;p&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
            &lt;/tab&gt;
            &lt;tab label='Ipsum'&gt;
              &lt;p&gt;Ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
            &lt;/tab&gt;
            &lt;tab label='Dolor'&gt;
              &lt;p&gt;Dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
            &lt;/tab&gt;
            &lt;tab label='Consectetuer'&gt;
              &lt;p&gt;Consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
            &lt;/tab&gt;
          &lt;/tabs&gt;
        &lt;/div&gt;
      
        &lt;slider/&gt;
      
        &lt;div layout='fixed' style='width:140px; overflow:auto;' id="right"&gt;
          &lt;h2&gt;This is the right sidebar.&lt;/h2&gt;
          &lt;p&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/hbox&gt;
        
      &lt;div layout='fixed' id="footer" style='width:100%; padding:10px 0px;'&gt;This is the footer.&lt;/div&gt;
    &lt;/vbox&gt;
    
  &lt;/script&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>
 
 * @module
 * @name boxlib
 */
  'use strict';
  
  var getBorderWidth = function(el) {
    var wd = el.outerWidth(true);
    el.width(wd);
    var borderWidth = el.outerWidth(true) - wd;
    if (borderWidth > 0) el.width(wd - borderWidth);
    return borderWidth;
  };
  
  var getBorderHeight = function(el) {
    var ht = el.outerHeight(true);
    el.height(ht);
    var borderHeight = el.outerHeight(true) - ht;
    if (borderHeight > 0) el.height(ht - borderHeight);
    return borderHeight;
  };
  
 
  /**
   * Define a Widget that makes the component next to it Resizeable.
   *
   * <p>Use Tags.create() to instantiate this class from Javascript or use the &lt;slider&gt; tag to instantiate it as static HTML.</p>
   *
   * <p>A &lt;slider&gt; goes between two components in a &lt;hbox&gt; or &lt;vbox&gt; to
   *    to resize one of the adjacent FIXED size boxes and (if present) the FLEX box.
   *    If the &lt;slider&gt; is placed between two FIXED size boxes, it will resize
   *    the one farthest away from the FLEX box, or the one on the left if there is
   *    no FLEX box present. 
   * </p>
   *
   * <p>This class extends {@link View} - refer to the {@link View} class for inherited methods - including:</p>
   * <ul>
   *  <li>render() - render HTML and return jQuery DOM object (see {@link View#render})</li>
	 *  <li>activate() - do post-DOM attachment processing (see {@link View#activate})</li>
	 *  <li>renderText() - render HTML and return HTML text as string (see {@link View#renderText})</li>
	 *  <li>renderAs(tagName) - render HTML as if it were the indicated tag (see {@link View#renderAs})</li>
	 *  <li>addContent(contentToAdd) - add content prior to rendering (see {@link View#addContent})</li>
	 *  <li>hasClass(theClass) - check to see if the class is present (see {@link View#hasClass})</li>
	 *  <li>addClass(theClass) - add class or classes (see {@link View#addClass})</li>
	 *  <li>removeClass(theClass) - remove class or classes (see {@link View#remove})</li>
   * </ul>
   *
   * @class
   * @name slider
   */
  Tags.define({
    tag:'slider',
    extend:'view',
    htmlTag:'div',

    setTarget: function(pos) {
      if (this.leftTarget) {
        this.leftTarget.$el.css({width:(pos.left - this.leftTarget.$el.position().left - this.borderSize)+'px'});
      } else if (this.rightTarget) {
        var pos_right = this.parent.$el.outerWidth(true) - pos.left;
        var width = pos_right - parseCssInt(this.rightTarget.$el,'right') - this.borderSize;
        this.rightTarget.$el.css({width:width+'px'});
      } else if (this.topTarget) {
        this.topTarget.$el.css({height:(pos.top - this.topTarget.$el.position().top - this.borderSize)+'px'});
      } else if (this.bottomTarget) {
        var pos_bottom = this.parent.$el.outerHeight(true) - pos.top;
        var height = pos_bottom - parseCssInt(this.bottomTarget.$el,'bottom') - this.borderSize;
        this.bottomTarget.$el.css({height:height+'px'});
      }
    },
   
    doMove: function(e) {
      var pos = {left:e.pageX,top:e.pageY};
      this.setTarget(pos);
      if (this.parent.adjustFlex(true)) {
        this.lastGoodPos = pos;
      } else {
        this.setTarget(this.lastGoodPos);
        this.parent.adjustFlex(true);
      }
    },
    
    activate: function() {
      this._super();
      var pos = this.$el.position();
      var parentTag = this.parent.tag.toUpperCase();
      if (parentTag === 'VBOX') {
        this.$el.css({position:'absolute',left:0,right:0,top:pos.top,bottom:null,height:'4px',cursor:'n-resize',opacity:'.01','background-color':'white','z-index':'1000'});
      } else if (parentTag === 'HBOX') {
        this.$el.css({position:'absolute',top:0,bottom:0,left:pos.left,right:null,width:'4px',cursor:'e-resize',opacity:'.01','background-color':'white','z-index':'1000'});
      }
      var self = this;
      this.lastGoodPos = null;
      var startTime = new Date().getTime();
      var moveTimer = null;
      var eventTime = this.eventTime || 20;
      var posFix = 0;
      this.$el.on('mousedown',function(e) {
        if (self.leftTarget) {
          self.borderSize = getBorderWidth(self.leftTarget.$el);
        } else if (self.rightTarget) {
          self.borderSize = getBorderWidth(self.rightTarget.$el);
        } else if (self.topTarget) {
          self.borderSize = getBorderHeight(self.topTarget.$el);
        } else if (self.bottomTarget) {
          self.borderSize = getBorderHeight(self.bottomTarget.$el);
        }
        self.isDown = true;
        self.lastGoodPos = self.$el.position();
        posFix = self.lastGoodPos.left - e.pageX;
        log.debug("DOWN slider x="+self.lastGoodPos.left
                 +" event x="+e.pageX
                 +" posFix="+posFix);
        self.$el.css({left:0,right:0,width:'100%',height:'100%'});
        return false;
      }).on('mouseup',function(e) {
        self.isDown = false;
        if (self.leftTarget) {
          self.$el.css({top:0,bottom:0,left:e.pageX+'px',width:'4px',cursor:'e-resize',opacity:'.01','background-color':'white','z-index':'1000'});
        } else if (self.rightTarget) {
          self.$el.css({top:0,bottom:0,right:(self.parent.$el.outerWidth(true)-e.pageX)+'px',width:'4px',cursor:'e-resize',opacity:'.01','background-color':'white','z-index':'1000'});
        } else if (self.topTarget) {
          self.$el.css({left:0,right:0,top:e.pageY,height:'4px',cursor:'n-resize',opacity:'.01','background-color':'white','z-index':'1000'});
        } else if (self.bottomTarget) {
          self.$el.css({left:0,right:0,bottom:(self.parent.$el.outerHeight(true)-e.pageY)+'px',height:'4px',cursor:'n-resize',opacity:'.01','background-color':'white','z-index':'1000'});
        }
        self.parent.adjustFlex(false);
        self.parent.freezeSize();
        return false;
      }).on('mousemove',function(e) {
        if (!self.isDown) return true;
        var timeNow = new Date().getTime();
        if (timeNow - startTime > eventTime) {
          clearTimeout(moveTimer);
          log.debug("MOV1 delta="+(timeNow - startTime));
          self.doMove(e);
          startTime = timeNow;
        } else {
          clearTimeout(moveTimer);
          moveTimer = setTimeout(function() {
            log.debug("MOV2 delta="+(timeNow - startTime));
            self.doMove(e);
            startTime = timeNow;
          },eventTime);
        }
        return false;
      });
    }
  });
 
  /**
   * Define an &lt;hbox&gt; Widget that implements a container that lays out its content horizontally, left to right.
   *
   * <p>Use Tags.create() to instantiate this class from Javascript or use the &lt;hbox&gt; tag to instantiate it as static HTML.</p>
   *
   * <p>The &lt;hbox&gt; Widget should contain fixed size components and (optionally) one
   *    component that is designated the FLEX component whose size is unspecified. If a FLEX component
   *    is included, it will be expanded to fill all available space not occupied by the fixed components.</p>
   *  
   * <p>The role of contained components as FIXED or FLEX is indicated by the 'layout' attribute of
   *    contained component.</p>
   *  <ul>
   *   <li><span>layout='fixed'</span>
   *     <p>This is a FIXED component. Its size is determined by CSS or by
   *        the component's natural size. Do not use percentage widths as they
   *        will not properly scale as the window is resized.</p>
   *   </li>
   *   <li><span>layout='wrap'</span>
   *     <p>This is a FIXED component. The horizontal size is determined by CSS
   *        or by the natural size like layout='fixed', but the vertical size
   *        is adjusted to the smallest size that will enclose any contained
   *        components.</p>
   *   </li>
   *   <li><span>layout='extend'</span>
   *     <p>This is a FIXED component that works like layout='wrap' except that
   *        all of the extended components child components will be extended
   *        vertically to the size of the largest child component.</p>
   *   </li>
   *   <li><span>layout='flex'</span>
   *     <p>This is a FLEX component. It will be expanded horizonally to
   *        fill all space not consumed by the FIXED child components.</p>
   *   </li>
   *  </ul>
   *
   * <p>In addition to the fixed size components and the one FLEX component for layout, the &lt;hbox&gt; Widget
   *    may also contain a &lt;slider&gt; component between any two of its layout components. These have the effect
   *    of adjusting the size of one of the fixed size components and the FLEX component.</p>
   *
   * <p>This class extends {@link View} - refer to the {@link View} class for inherited methods - including:</p>
   * <ul>
   *  <li>render() - render HTML and return jQuery DOM object (see {@link View#render})</li>
	 *  <li>activate() - do post-DOM attachment processing (see {@link View#activate})</li>
	 *  <li>renderText() - render HTML and return HTML text as string (see {@link View#renderText})</li>
	 *  <li>renderAs(tagName) - render HTML as if it were the indicated tag (see {@link View#renderAs})</li>
	 *  <li>addContent(contentToAdd) - add content prior to rendering (see {@link View#addContent})</li>
	 *  <li>hasClass(theClass) - check to see if the class is present (see {@link View#hasClass})</li>
	 *  <li>addClass(theClass) - add class or classes (see {@link View#addClass})</li>
	 *  <li>removeClass(theClass) - remove class or classes (see {@link View#remove})</li>
   * </ul>
   *
   * @class
   * @name hbox
   */ 
  Tags.define({
    tag:'hbox',
    extend:'view',
    htmlTag:'div',
   
    activate: function() {
      this._super();
      this.adjustFlex();
    },
   
    // Determine the min-width of the container which is the size of all fixed
    // items + the min-size of the flex item.
    freezeSize: function() {
      var gap = parseInt(this.gap) || 0;
      var content = this.content || [];
      var cumulativeWidth = 0;
      for (var n=0; n<content.length; n++) {
        var item = content[n];
        if (!Tags.isTag(item)) continue;
        var itemTag = item.tag.toUpperCase();
        if (itemTag === 'SLIDER') continue;
        var itemLayout = item.layout || 'fixed';
        if (itemLayout == 'free') continue;
        cumulativeWidth += gap;
        if (itemLayout == 'flex') {
          var minWidth = parseCssInt(item.$el,'min-width') || 0;
          if (minWidth < 10) minWidth = 10;
          cumulativeWidth += minWidth;
        } else {
          cumulativeWidth += item.$el.outerWidth(true);
        }
      }
      this.$el.css('min-width',cumulativeWidth+'px');  
    },
    
//    renderText: function() {
//      var content = this.content || [];
//      for (var n=0; n<content.length; n++) {
//        var item = content[n];
//        if (typeof item != 'object' || !item.tag) continue;
//        if (item.wrap) {
//          item.content = [Tags.create({tag:'div', content:item.content})];
//        }
//      }
//      return this._super();
//    },
   
    adjustFlex: function(checkOnly) {
      var gap = 0;
      if (this.gap) gap = parseInt(this.gap) || 0;
      var content = this.content || [];
      if (!$.isArray(content)) content = [content];
      if (this.$el.css('position') != 'absolute') this.$el.css('position','relative');
      var x = 0;
      var lastItem = null;
//      var maxWidth = this.$el.outerWidth(true);
      var cumulativeWidth = 0;
      var self = this;
      var delta = 1;
      // Go forward until we hit a FLEX item then go to the end and go back until
      // we hit the FLEX item again. If we never hit a FLEX item, just stop when we
      // get to the end.
      log.debug("HBOX id="+this.id+" LAYOUT="+(this.layout||'NONE'));
      for (var n=0; n>=0 && n<content.length; n+=delta) {
        var item = content[n];
        if (!Tags.isTag(item)) continue;
        var itemTag = item.tag.toUpperCase();
        if (checkOnly && itemTag === 'SLIDER') continue;
        var itemLayout = item.layout || 'fixed';
        if (itemLayout == 'free') continue;
        if (delta > 0) {
          item.$el.css({position:'absolute',left:x});
        } else {
          item.$el.css({position:'absolute',right:x});
        }
        log.debug("HBOX-"+(delta > 0 ? "LtoR" : "RtoL")+" id="+(item.id || "NONE"));
        if (itemLayout == 'wrap' || itemLayout == 'extend') {
          // Wrap expands horizontally to be large enough to wrap all of the children.
          var itemContent = item.content || [];
          if (!$.isArray(itemContent)) itemContent = [itemContent];
          var myWidth = 0;
          for (var m=0; m<itemContent.length; m++) {
            var child = itemContent[m];
            if (!Tags.isTag(child) || child.layout == 'free') continue;
            log.debug("HBOX child HT="+child.outerHeight(true));
            var childWidth = parseCssInt(child.$el,'left') + child.$el.outerWidth(true);
            if (childWidth > myWidth) myWidth = childWidth;
          }
          item.$el.height(myHeight); // FIXME: Assumes no border, padding, margin - remove assumption later
        } else if (itemLayout == 'flex') {
          log.debug("FLEX delta="+delta);
          if (delta > 0) {
            x = 0;
            n = content.length;
            delta = -1;
            lastItem = null;
            var minWidth = parseCssInt(item.$el,'min-width');
            if (minWidth < 10) minWidth = 10;
            cumulativeWidth += minWidth;
//            if (cumulativeWidth > maxWidth) return false;
            continue;  // Continue from the right
          } else {
            var wd = self.$el.outerWidth(true);
            var lf = parseCssInt(item.$el,'left');
            var rt = x;
            var borderWidth = getBorderWidth(item.$el);
            item.$el.css('width',(wd - lf - rt - borderWidth)+"px");
            item.$el.css('right',0);
//              var startTime = 0;
            log.debug("EXPND id="+item.id+" wd="+wd+" lf="+lf+" rt="+rt+" css.lf/rt/wd="+item.$el.css('left')+'/'+item.$el.css('right')+'/'+item.$el.css('width')+" outerWidth="+item.$el.outerWidth(true)+" width="+item.$el.width()+" borderWidth="+borderWidth);
            if (!checkOnly) {
              $(window).resize(function() {
                  wd = self.$el.outerWidth(true);
                  item.$el.css('width',(wd - lf - rt - borderWidth)+"px");
//                    var timeNow = new Date().getTime();
//                    var delta = timeNow - (startTime || timeNow);
//                    startTime = timeNow;
//                    log.debug("vbox-RESIZE id="+item.id+" delta="+delta+" wd="+wd+" lf="+lf+" rt="+rt+" css.lf/rt/wd="+item.$el.css('left')+'/'+item.$el.css('right')+'/'+item.$el.css('width')+" outerWidth="+item.$el.outerWidth(true)+" width="+item.$el.width()+" borderWidth="+borderWidth);
              });
            }
            item.$el.css({position:'absolute',right:x+'px'});
            log.debug("FLEX x/y/w/h="+item.$el.css('left')+'/'+item.$el.css('top')+'/'+item.$el.width()+'/'+item.$el.height());
            return true;
          }
        }
        if (itemTag === 'SLIDER') {
          if (delta > 0) {
            item.leftTarget = lastItem;
          } else {
            item.$el.css('left','auto');
            item.rightTarget = lastItem;
          }
        } else {
          var width = item.$el.outerWidth(true) + gap;
//          if (item.wrap) width += item.content[0].$el.outerWidth(true);
          x += width;
          cumulativeWidth += width;
          lastItem = item;
//          if (cumulativeWidth > maxWidth) return false;
        log.debug("HBOX-"+(delta > 0 ? "LtoR" : "RtoL")+" id="+(item.id || "NONE")+" layout="+itemLayout+" X="+x+" item.wd="+item.$el.outerWidth(true)+" item.ht="+item.$el.outerHeight(true));
        }
      }
      return true;
    }
   
  });
   
  /**
   * Define a &lt;vbox&gt; Widget that implements a container that lays out its content vertically, top to bottom.
   *
   * <p>Use Tags.create() to instantiate this class from Javascript or use the &lt;vbox&gt; tag to instantiate it as static HTML.</p>
   *
   * <p>The &lt;vbox&gt; Widget should contain fixed size components and (optionally) one
   *    component that is designated the FLEX component whose size is unspecified. If a FLEX component
   *    is included, it will be expanded to fill all available space not occupied by the fixed components.</p>
   *
   * <p>The role of contained components as FIXED or FLEX is indicated by the 'layout' attribute of
   *    contained component.</p>
   *  <ul>
   *   <li><span>layout='fixed'</span>
   *     <p>This is a FIXED component. Its size is determined by CSS or by
   *        the component's natural size. Do not use percentage heights as they
   *        will not properly scale as the window is resized.</p>
   *   </li>
   *   <li><span>layout='wrap'</span>
   *     <p>This is a FIXED component. The height is determined by CSS
   *        or by the natural size like layout='fixed', but the width
   *        is adjusted to the smallest size that will enclose any contained
   *        components.</p>
   *   </li>
   *   <li><span>layout='extend'</span>
   *     <p>This is a FIXED component that works like layout='wrap' except that
   *        all of the extended component's child components will be extended
   *        horizontally to the width of the largest child component.</p>
   *   </li>
   *   <li><span>layout='flex'</span>
   *     <p>This is a FLEX component. It will be expanded vertically to
   *        fill all space not consumed by the FIXED child components.</p>
   *   </li>
   *  </ul>
   *
   * <p>In addition to the fixed size components and the one FLEX component for layout, the &lt;hbox&gt; Widget
   *    may also contain a &lt;slider&gt; component between any two of its layout components. These have the effect
   *    of adjusting the size of one of the fixed size components and the FLEX component.</p>
   *
   * <p>This class extends {@link View} - refer to the {@link View} class for inherited methods - including:</p>
   * <ul>
   *  <li>render() - render HTML and return jQuery DOM object (see {@link View#render})</li>
	 *  <li>activate() - do post-DOM attachment processing (see {@link View#activate})</li>
	 *  <li>renderText() - render HTML and return HTML text as string (see {@link View#renderText})</li>
	 *  <li>renderAs(tagName) - render HTML as if it were the indicated tag (see {@link View#renderAs})</li>
	 *  <li>addContent(contentToAdd) - add content prior to rendering (see {@link View#addContent})</li>
	 *  <li>hasClass(theClass) - check to see if the class is present (see {@link View#hasClass})</li>
	 *  <li>addClass(theClass) - add class or classes (see {@link View#addClass})</li>
	 *  <li>removeClass(theClass) - remove class or classes (see {@link View#remove})</li>
   * </ul>
   *
   * @class
   * @name vbox
   */ 
  Tags.define({
    tag:'vbox',
    extend:'view',
    htmlTag:'div',
   
    activate: function() {
      this._super();
      this.adjustFlex();
    },
   
    freezeSize: function() {
      var cumulativeHeight = 0;
      var gap = parseInt(this.gap) || 0;
      var content = this.content || [];
      for (var n=0; n<content.length; n++) {
        var item = content[n];
        if (!Tags.isTag(item)) continue;
        var itemTag = item.tag.toUpperCase();
        if (itemTag === 'SLIDER') continue;
        var itemLayout = item.layout || 'fixed';
        if (itemLayout == 'free') continue;
        cumulativeHeight += gap;
        if (itemLayout == 'expand') {
          var minHeight = parseCssInt(item.$el,'min-height');
          if (minHeight < 10) minHeight = 10;
          cumulativeHeight += minHeight;
        } else {
          cumulativeHeight += item.$el.outerHeight(true);
        }
      }
      this.$el.css('min-height',cumulativeHeight+'px');     
//      log.debug("FREEZE min-height="+this.$el.css('min-height'));  
    },
   
    adjustFlex: function(checkOnly) {
      var gap = parseInt(this.gap) || 0;
      var content = this.content || [];
      if (!$.isArray(content)) content = [content];
      if (this.$el.css('position') != 'absolute') this.$el.css('position','relative');
      var y = 0;
      var lastItem = null;
      var cumulativeHeight = 0;
//      var maxHeight = this.$el.outerHeight(true);
      log.debug("VBOX id="+(this.id || "NONE")+" layout="+(this.layout || "NONE")+" content.len="+content.length);
      var delta = 1;
      for (var n=0; n<content.length; n+=delta) {
        var item = content[n];
//        log.debug("VBOX["+n+"] isTag="+Tags.isTag(item));
        if (!Tags.isTag(item)) continue;
        var itemTag = item.tag.toUpperCase();
        if (checkOnly && itemTag === 'SLIDER') continue;
        var itemLayout = item.layout || 'fixed';
        log.debug("VBOX-TtoB id="+(item.id || "NONE")+" layout="+itemLayout+" Y="+y+" item.ht="+item.$el.outerHeight(true));
        if (itemLayout == 'free') continue;
        if (delta > 0) {
          item.$el.css({position:'absolute',top:y});
        } else {
          item.$el.css({position:'absolute',bottom:y});
        }
        if (itemLayout == 'wrap' || itemLayout == 'extend') {
          // Wrap expands vertically to be large enough to wrap all of the children.
          var itemContent = item.content || [];
          if (!$.isArray(itemContent)) itemContent = [itemContent];
          var myHeight = 0;
          for (var m=0; m<itemContent.length; m++) {
            var child = itemContent[m];
            if (!Tags.isTag(child) || child.layout == 'free') continue;
            var childHeight = parseCssInt(child.$el,'top') + child.$el.outerHeight(true);
            log.debug("VBOX child["+m+"] id="+(child.id || "NONE")+" HT="+childHeight+" ("+child.$el.css('top')+" plus "+child.$el.outerHeight(true)+") isTag="+Tags.isTag(child));
            if (childHeight > myHeight) myHeight = childHeight;
          }
          item.$el.height(myHeight); // assume no border, padding, margin (BPM)
          if (itemLayout == 'extend') {
            for (var m=0; m<itemContent.length; m++) {
              var child = itemContent[m];
              if (!Tags.isTag(child) || child.layout == 'free') continue;
              child.$el.height(myHeight);
            }
          }
          log.debug("VBOX id="+(this.id || "NONE")+" wrap myHt="+myHeight);
        } else if (itemLayout == 'flex') {
          if (delta > 0) {
            y = 0;
            delta = -1;
            lastItem = null;
            var minHeight = parseCssInt(item.$el,'min-height');
            if (minHeight < 10) minHeight = 10;
            cumulativeHeight += minHeight;
//          if (cumulativeHeight > maxHeight) return false;
          } else {
            item.$el.css({position:'absolute',bottom:y});
            var ht = self.$el.outerHeight(true);
            var tp = parseCssInt(item.$el,'top');
            var bt = y;
///              var startTime = 0;
            var borderHeight = getBorderHeight(item.$el);
            item.$el.css('height',(ht - tp - bt - borderHeight)+"px");
//              log.debug("EXPND ht="+ht+" tp="+bt+" tp="+bt+" height="+item.$el.outerHeight(true)+" borderHeight="+borderHeight);
            if (!checkOnly) {
              $(window).resize(function() {
//                  var timeNow = new Date().getTime();
//                  var delta = timeNow - (startTime || timeNow);
//                  startTime = timeNow;
                ht = self.$el.outerHeight(true);
                item.$el.css('height',(ht - tp - bt - borderHeight)+"px");
//                  log.debug("hbox-RESIZE delta="+delta+" id="+item.id+" self.HT="+ht+" TOP/BOT="+tp+"/"+bt+" HEIGHT="+(ht - tp - bt)+" item.height="+item.$el.height());
              });
            }
            return true;
          }
        }
        if (itemTag === 'SLIDER') {
          if (delta > 0) {
            item.topTarget = lastItem;
          } else {
            item.$el.css('top','auto');
            item.bottomTarget = lastItem;
          }
        } else {
          var height = item.$el.outerHeight(true) + gap;
          y += height;
          cumulativeHeight += height;
//          if (cumulativeHeight > maxHeight) return false;
          lastItem = item;
        }
      }
      return true;
    }
   
  });
  
  /** Provide a container for &lt;tab&gt; components.
   *
   * <p>Use Tags.create() to instantiate this class from Javascript or use the &lt;tabs&gt; tag to instantiate it as static HTML.</p>
   *
   * <p>This class extends {@link View} - refer to the {@link View} class for inherited methods - including:</p>
   * <ul>
   *  <li>render() - render HTML and return jQuery DOM object (see {@link View#render})</li>
	 *  <li>activate() - do post-DOM attachment processing (see {@link View#activate})</li>
	 *  <li>renderText() - render HTML and return HTML text as string (see {@link View#renderText})</li>
	 *  <li>renderAs(tagName) - render HTML as if it were the indicated tag (see {@link View#renderAs})</li>
	 *  <li>addContent(contentToAdd) - add content prior to rendering (see {@link View#addContent})</li>
	 *  <li>hasClass(theClass) - check to see if the class is present (see {@link View#hasClass})</li>
	 *  <li>addClass(theClass) - add class or classes (see {@link View#addClass})</li>
	 *  <li>removeClass(theClass) - remove class or classes (see {@link View#remove})</li>
   * </ul>
   *
   * @class
   * @name tabs
   */
  Tags.define({
    tag:'tabs',
    extend:'view',
    htmlTag:'div',

    renderText: function() {
      var content = this.content;
      this.content = [];
      var buttons = Tags.create({tag:'hbox', 'class':'tags-tab-container', content:[{tag:'div', layout:'free', 'class':'tags-tab-spacer'}]});
      this.content.push(buttons);
      for (var n=0; n<content.length; n++) {
        var item = content[n];
        if (!Tags.isTag(item,'tab')) continue;
        if (!item.id) item.id = 'tab-'+Tags.nextInSequence();
        item.button = Tags.create({tag:'div', href:'#'+item.id, 'class':'tags-tab-button', content:[{tag:'div', style:'position:relative; bottom:.4rem', content:item.label}]});
        buttons.content.push(item.button);
        item.addClass('tags-tab-choice');
        this.content.push(item);
      }
      return this._super();
    }
    
//    activate: function() {
//      // Center the text in the tabs
//      var ht = this.$el.outerHeight();
//      $("a",this.$el).each(function() 
//    }
    
  });
  
  /** Provide the name for a tab and a container for the HTML exposed when the tab is clicked.
   *
   * <p>Use Tags.create() to instantiate this class from Javascript or use the &lt;tab&gt; tag to instantiate it as static HTML.</p>
   *
   * <p>This class extends {@link View} - refer to the {@link View} class for inherited methods - including:</p>
   * <ul>
   *  <li>render() - render HTML and return jQuery DOM object (see {@link View#render})</li>
	 *  <li>activate() - do post-DOM attachment processing (see {@link View#activate})</li>
	 *  <li>renderText() - render HTML and return HTML text as string (see {@link View#renderText})</li>
	 *  <li>renderAs(tagName) - render HTML as if it were the indicated tag (see {@link View#renderAs})</li>
	 *  <li>addContent(contentToAdd) - add content prior to rendering (see {@link View#addContent})</li>
	 *  <li>hasClass(theClass) - check to see if the class is present (see {@link View#hasClass})</li>
	 *  <li>addClass(theClass) - add class or classes (see {@link View#addClass})</li>
	 *  <li>removeClass(theClass) - remove class or classes (see {@link View#remove})</li>
   * </ul>
   *
   * @class
   * @name tab
   * @property {string} label The tab label
   *
   */
  Tags.define({
    tag:'tab',
    extend:'view',
    htmlTag:'div',

    selectTab: function() {
      if (this.parent.selected) {
        this.parent.selected.removeClass('selected');
        this.parent.selected.button.removeClass('selected');
      }
      this.addClass('selected');
      this.button.addClass('selected');
      this.parent.selected = this;
    },
    
    activate: function() {
      this._super();
      var self = this;
      self.button.$el.on('click',function(e) {
        self.selectTab();
        e.preventDefault();
      });
      if (self.hasClass('selected')) self.button.$el.click();
    }
  });

  
   
// })(jQuery);