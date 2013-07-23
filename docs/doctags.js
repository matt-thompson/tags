(function($) {

  var Utils = {
    asArray: function(x) {
      var xx = x != false ? (x || []) : x;
      return typeof xx == 'object' ? xx : [xx];
    }
  };
  
  Tags.define({
    tag:'arg',
    extend:'view',
    
    renderText:function() {
      if (!this.description) this.description = this.content;
      this.content = null;
      this.addContent([
        {tag:'div', class:'name', content:this.name},
        {tag:'div', class:'description', content:this.description}
      ]);
      this.addClass('arg');
      return this.renderAs('div');
    }
  });
  
  Tags.define({
    tag:'description',
    extend:'view',
    
    renderText: function() {
      this.addClass('description');
      return this.renderAs('p');
    }
  });
  
  Tags.define({
    tag:'method',
    extend:'view',
    
    renderText:function() {
      var signature = this.name + "(";
      var content = Utils.asArray(this.content);
      var first = true;
      for (var n in content) {
        var item = content[n];
        if (Tags.isTag(item,"arg")) {
          if (first) first = false; else signature += ', ';
          signature += item.name;
          if (item.type) signature += ':'+item.type;
        }
      }
      signature += ")";
      if (this.type) signature += ":"+type;
      this.content.splice(0,0,Tags.create("<div class='signature'>"+signature+"</div>"));
      this.addClass('method');
      return this.renderAs('div');
    }
  });

})(jQuery);