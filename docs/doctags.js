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
      var signature = "";
      if (this.kind) signature += "<span class='faded'>&lt;"+this.kind+"&gt>;</span>";
      var signature += this.name + "(";
      var content = Utils.asArray(this.content);
      var paramsTable = {tag:'table', class='params', content:[
                          {tag:'tr', content:[
                            {tag:'th',content:'Name'},
                            {tag:'th',content:'Type'},
                            {tag:'th',content:'Description'}
                          ]}
                        };
                        
      var first = true;
      for (var n in content) {
        var item = content[n];
        if (Tags.isTag(item,"arg")) {
          paramsTable.addContent({tag:'tr',content:[
                                   {tag:'td',content:item.name},
                                   {tag:'td',content:item.type},
                                   {tag:'td',content:item.description}
                                 ]});
          if (first) first = false; else signature += ', ';
          signature += item.name;
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