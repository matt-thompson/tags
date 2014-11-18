
//
// Extend the View type to have an additional method used by some of 
// the following types.
//
Tags.extend('view', {
  
  //### method updateModel(model)
  //
  // Allow a structured model to be handled by a structured View.
  // Each call to this method recursively calls itself on each element
  // of its content, optionally modifying the model by using 'modelKey'
  // to select an element from model.
  //
  updateModel: function(model) {
    var content = this.content;
    if (model && this.modelKey) model = model[this.modelKey];
    if (content) {
      if (!jQuery.isArray(content)) content = [content];
      for (var n=0; n<content.length; n++) {
        var item = content[n];
        if (!Tags.isTag(item) || !item.updateModel) continue;
        item.updateModel(model);
      }
    }
    return model;
  }

});

//## type PhoneView
//
// Instantiate one of these for every phone displayed in the PhoneList view.
//
Tags.define({tag:'phoneView', extend:'view', htmlTag:'li',
  
  render:function() {
    var model = this.model;
    this.addClass("thumbnail");
    this.addContent([
      {tag:'a', href:'#/phones/'+model.id, 'class':'thumb', content: {tag:'img', src:model.imageUrl}},
      {tag:'a', href:'#/phones/'+model.id, content: model.name},
      {tag:'p', content:model.snippet}
    ]);
    return this.super();
  }
  
});

//## type SearchField
//
// The search field. Refilter the target on every keyup.
// 
Tags.define({tag:'searchField', extend:'view', htmlTag:'input', type:'text',
  on:{
    keyup: function(event) {
      this.target.filter(this.$el.val());
    }
  }
});
  
//## type ModeField
//
// The mode field. Change the sort mode when this changes. 
Tags.define({tag:'modeField', extend:'view', htmlTag:'select', type:'text',
  on:{
    change: function(event) {
      this.target.changeMode(this.$el.val());
    }
  }
});

//## type PhoneModel
//
// Hold information about a single Phone.
//
Tags.define({tag:'phoneModel', extend:'root'});

//## type Router
//
// Use path.js to implement Routing.
//
Tags.define({tag:'router', extend:'root',

  activate: function() {
    this.initRoutes();
  },
  
  initRoutes: function() {
    var self = this;
    
    Path.map("#/phoneList").to(function() {
      if (self.phoneView) self.phoneView.$el.toggle(false);
      self.phoneListView.$el.toggle(true);
      self.phoneView = self.phoneListView;
    });
    
    Path.map("#/phones/:phone").to(function() {
      if (self.phoneView) self.phoneView.$el.toggle(false);
      self.phoneDetailView.update(this.params.phone);
      self.phoneDetailView.$el.toggle(true);
      self.phoneView = self.phoneDetailView;
    });
    
    Path.root("#/phoneList");
   
    Path.listen();
  }
});

//## type PhoneList
//
// Implement the list of Phones.
//
Tags.define({tag:'phoneList', extend:'view', htmlTag:'ul', 'class':'phones',
  
  // On activation, load the list of phones and create a PhoneModel
  // and PhoneView for each one.
  //
  activate:function() {
    this.super();
    var self = this;
    jQuery.getJSON(this.url,function(data) {
      self.$el.empty();
      self.content = [];
      for (var n=0; n<data.length; n++) {
        var phone = data[n];
        var model = Tags.create({tag:'phoneModel', age:phone.age, id:phone.id, imageUrl:phone.imageUrl, name:phone.name, snippet:phone.snippet},this);
        var phoneTag = self.addContent({tag:'phoneView', model:model});
      }
      self.refresh();
    });
  },
  
  // Implement filtering for the `<searchField>` tag.
  //
  filter:function(text) {
    var re = new RegExp(".*"+text+".*");
    for (var n=0; n<this.content.length; n++) {
      var item = this.content[n];
      item.$el.toggle(re.test(item.model.snippet));
    } 
  },
  
  // Implement the mode change for the `<modeField>` tag.
  // To change mode, we just resort this.content, detach all of
  changeMode:function(mode) {
    // the tag DOM elements and attach them again in the new order. 
    if (mode === 'age') {
      this.content.sort(function(x,y) {
        return x.model.age - y.model.age;
      });
    } else {
      this.content.sort(function(x,y) {
        var xx = x.model.name.toUpperCase();
        var yy = y.model.name.toUpperCase();
        return xx < yy ? -1 : xx > yy ? 1 : 0;
      });
    }
    for (var n=0; n<this.content.length; n++) {
      this.content[n].$el.detach();
    }
    for (var n=0; n<this.content.length; n++) {
      this.$el.append(this.content[n].$el);
    }
  }
  
});

//## type PhoneDetail
//
// Implement the phone detail view.
//
Tags.define({tag:'phoneDetail', extend:'view', htmlTag:'section',

  // Load information about the phone and update all of the
  // nested content with that information.
  // 
  update:function(phone) {
    var self = this;
    jQuery.getJSON("phones/"+phone+'.json',function(data) {
      self.mainImage.$el.empty().append($("<img class='phone' src='"+data.images[0]+"'/>"));
      self.phoneTitle.$el.text(data.name);
      self.phoneDescription.$el.text(data.description);
      self.phoneThumbs.$el.empty();
      for (var n=0; n<data.images.length; n++) {
        var liTag = Tags.create({tag:'phoneImage', imgSrc:data.images[n]},self.phoneThumbs);
        self.phoneThumbs.$el.append(liTag.render([]));
        liTag.activate();
      }
      self.phoneSpecs.updateModel(data);
    });
  }
});

//## type PhoneImage
//
// Display the image for a phone and if it is clicked, make
// it the Main image.
//  
Tags.define({tag:'phoneImage', extend:'view', htmlTag:'li',
  on: {
    click:function(e) {
      $("img",Tags.ns['router.phoneDetailView.mainImage'].$el).attr('src',this.imgSrc);
    }
  },
  render:function() {
    this.content = Tags.create({tag:'img', src:this.imgSrc},this);
    return this.super();
  }
});

//## type PhoneImage
//
// Display the image for a phone and if it is clicked, make
// it the Main image.
//  
Tags.define({tag:'phoneImage', extend:'view', htmlTag:'li',
  on: {
    click:function(e) {
      $("img",Tags.ns['router.phoneDetailView.mainImage'].$el).attr('src',this.imgSrc);
    }
  },
  render:function() {
    this.content = Tags.create({tag:'img', src:this.imgSrc},this);
    return this.super();
  }
});

//## type DetailGroup
//
// Implement a visual grouping of detail information.
// If this.key exists, it may also be a logical grouping of the
// data.
//
Tags.define({tag:'detailGroup', extend:'view', htmlTag:'li',
  render:function() {
    var originalContent = this.content;
    this.content = [];
    this.addContent([
      {tag:'span', content:this.label},
      {tag:'dl', content:originalContent}
    ]);
    return this.super();
  }});

//## type Detail
//
// Extract and display information from the model.
//
Tags.define({tag:'detail', extend:'view', htmlTag:'div',
  render:function() {
    this.addContent([
      {tag:'dt', content:this.label},
      {tag:'dd', id:this.dot('target'), content:''}
    ]);
    return this.super();
  },
  updateModel:function(model) {
    model = this.super(model);
    this.target.$el.text(model);
  }
});

//## type DetailCheckmark
//
// Extract and display boolean information as a check mark or X.
Tags.define({tag:'detailCheckmark', extend:'detail', htmlTag:'div',
  updateModel:function(model) {
    this.target.$el.text(this.super(model) ? '\u2713' : '\u2718');
  }
});
    
//## type DetailList
//
// Extract and display a list of items.
//
Tags.define({tag:'detailList', extend:'detail', htmlTag:'div',
  updateModel:function(model) {
    model = this.super(model);
    if (!model) return null;
    if (!jQuery.isArray(model)) model = [model];
    this.target.$el.empty();
    for (var n=0; n<model.length; n++) {
      this.target.$el.append($("<div>"+model[n]+"</div>"));
    }
  }
});
  
//## type DetailJoin
//
// Extract and display a list of items as a comma-separated list.
//  
Tags.define({tag:'detailJoin', extend:'detail', htmlTag:'div',
  update:function(model) {
    model = this.super(model);
    this.target.$el.text(model.join(','));
  }
});
  
  