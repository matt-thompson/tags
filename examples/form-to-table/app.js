//## form-to-table/app.js
//
// This shows how to use the Tags framework to solve a simple task - use input 
// from a form to populate a table.
//
// Notice that the code consists entirely of calls to
// Tags.define(). Most of what we do with Tags is to define the way extended
// HTML tags work, so mostly we are defining types that extend the 'view'
// type.
//
// Override the render() method to specify how the tag is rendered,
// override the activate() method to define event handlers and do other
// things that need to be done after the tag is rendered and override
// the update() tag to specify what happens to the tag when something changes.
//

//### Field Type
//
// The 'field' type is a custom tag that represents a label with
// an input next to it. There is a bit of complexity in making this
// happen cleanly and this tag type hides all that complexity so we can
// ignore it after we have figured it out.
//
Tags.define({tag:'field', extend:'view', htmlTag:'div',

  //#### method render
  //
  // Override the render() method of the extended 'view' type to represent the
  // field as a label inside of a &lt;span&gt; tag next to a &lt;div&gt;
  // tag containing an &lt;input&gt; tag. We do it this way because 
  // unwrapped &lt;input&gt; tags are not well behaved when resized.
  //
  render: function() {
    this.label = this.label || this.name;
    
    // Use `Tags.create()` to instantiate a Tag object or use this.addContent()
    // as below. The addContent() method is a short cut method for calling Tags.create()
    // and appending the result to `this.content`. An initial value for the `content` attribute
    // was created when Tags.create() was called to instantiate this object. Because of
    // the way it is used, we know that this object will not have any nested content
    // so we create it the way we want it using this.addContent(). Once we get the
    // nested content set up correctly, we rely on the overridden view.render() method
    // to do the actual rendering.
    //
    // Note the use of `this.dot()`. It creates a string that can be used as an 
    // ID by appending a dotted label to the ID of an object. If the object on which
    // it is invoked does not yet have an 'id' attribute, it is created. Using this.dot()
    // in this way insures that the label passed to this.dot() can be used to reference
    // the object being created. Note how the 'fieldPart' and 'inputPart' properties
    // are used later in the activate() method. This technique saves a lot of searching
    // and navigating around using jQuery selectors or other techniques.
    //
    this.addContent([
      {tag:'span', 'class':'label', id:this.dot("labelPart"), content:this.label},
      {tag:'div', 'class':'field', id:this.dot("fieldPart"), 
             style:'position:absolute; left:0px; right:0px; top:0px; margin-right:14px;', 
             content: {tag:'input', id:this.dot("inputPart"), 
                       type:'text', name:this.name, style:'width:100%;'}}
    ]);
    
    // The view.render() method (invoked when this.super() is called) does the
    // actual rendering into HTML. It will create the `this.$el` property (the jQuery
    // representation of a DOM object) and
    // return it.
    //
    return this.super();
  },
  
  //#### method activate
  //
  // Override the activate() method of the 'view' type because we need to implement an event
  // handler for the action to be taken when the input changes. We also
  // need to do a bit of cleanup to handle the spacing and alignment of the
  // label and input parts of the field.
  //
  // Note the the use of $el which is set up by the render() method. We known that
  // by convention, the render() method will have been called before activate() is called
  // so we can rely on $el having been created.
  //
  //
  activate: function() {
    this.super();
    if (this.$el.css('position') !== 'absolute') this.$el.css('position','relative');
    this.fieldPart.$el.css('left',(this.labelPart.$el.width()+10)+'px');
    this.$el.css('height',(this.inputPart.$el.height()+10)+'px');
    var self = this;
    this.inputPart.$el.on('change',function(e) {
      if (self.model) self.model[self.name] = self.inputPart.$el.val();
    });
  },
  
  //#### method update
  //
  // Override the update() method of the 'view' type to update the input tag when the
  // model changes. We simply use our 'name' attribute to select an
  // attribute of the model object and stuff that value into the &lt;input&gt;
  // tag.
  update: function(model) {
    this.model = model;
    $("input",this.$el).val(model[this.name] || '');
  }
});

//### AddPersonButton Type
//
// Define this type just to add an event handler to a button. It may
// seem like overkill, when a simple line of jQuery could do the same thing,
// but this is much clearer. When you see the 'addPersonButton' tag being
// used, you know where to find the code that implements the
// event handler.
//
Tags.define({tag:'addPersonButton',extend:'view',htmlTag:'button',
  activate: function() {
    this.super();
    var self = this;
    this.$el.on('click', function(e) {
      var person = {};
      self.personTable.add(person);
      // We call the update() method of the 'form' tag relying on the default
      // handling by the 'view' type which is to recursively call update() on
      // all of its contained tags using the same arguments. This has the effect of
      // calling update on all of the 'field tags with the 'person' object.
      self.form.update(person);
      self.form.$el.toggle(true);
      self.$el.toggle(false);
    });      
  }
});

//### SaveButton Type
//
// Implement the event handler for the 'saveButton' type.
//
Tags.define({tag:'saveButton', extend:'view', htmlTag:'button',
  activate: function() {
    this.super();
    this.form.$el.toggle(false);
    var self = this;
    this.$el.on('click', function(e) {
      self.personTable.update();
      self.form.$el.toggle(false);
      self.personButton.$el.toggle(true);
    });      
  }
});

//### CancelButton Type
//
// Implement the event handler for the 'cancelButton' type.
//
Tags.define({tag:'cancelButton', extend:'view', htmlTag:'button',
  activate: function() {
    this.super();
    this.form.$el.toggle(false);
    var self = this;
    this.$el.on('click', function(e) {
      self.form.$el.toggle(false);
      self.personButton.$el.toggle(true);
    });      
  }
});

//### PersonTable Type
//
// Implement a custom tag that renders as a `<table>` and
// displays information about each person.
//
Tags.define({tag:'personTable', extend:'view', htmlTag:'table',
  
  //#### method activate
  //
  // Override activate() in order to do an initial update().
  activate: function() {
    this.super();
    this.update();
  },

  //#### method update
  //
  // Override update() to handle the case where a new Person has
  // been added. We simply empty out the old data and re-render
  // the content. Note how we are using the Tags framework to
  // create dynamic &lt;tr&gt; tags using Javascript descriptions.
  //
  update: function() {
    var tbody = $("tbody",this.$el);
    tbody.empty();
    this.people || (this.people = []);
    if (this.newPerson && this.newPerson.name) {
      this.people.push(this.newPerson);
      this.newPerson = null;
    }
    if (this.people.length == 0) {
      var row = Tags.create({tag:'tr', content:{tag:'td', colspan:'4', 'class':'nodata', content:'No Data'}});
      tbody.append(row.render());
    } else {
      for (var n=0; n<this.people.length; n++) {
        var person = this.people[n];
        var row = Tags.create({tag:'tr', content:[
          {tag:'td', content:person.name},
          {tag:'td', content:person.age || ''},
          {tag:'td', content:person.occupation || ''},
          {tag:'td', content:person.email || ''}
        ]});
        tbody.append(row.render());
        row.activate();
      }
    }
  },

  //#### method add
  //
  // Implement the add() method which simply sets the newPerson
  // property so the new Person record gets added on next update().
  add:function(person) {
    this.newPerson = person;
  }
});
