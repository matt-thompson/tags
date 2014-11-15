//## form-to-table.js
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
// Override the render() method to represent the
// field as a label inside of a &lt;span&gt; tag next to a &lt;div&gt;
// tag containing an &lt;input&gt; tag. We do it this way because 
// unwrapped &lt;input&gt; tags are not well behaved when resized.
//
// Override the activate() method because we need to implement an event
// handler for the action to be taken when the input changes. We also
// need to do a bit of cleanup to handle the spacing and alignment of the
// label and input parts of the field.
//
// Override the update() method to update the input tag when the
// model changes. We simply use our 'name' attribute to select an
// attribute of the model object and stuff that value into the &lt;input&gt;
// tag.
Tags.define({tag:'field', extend:'view', htmlTag:'div',
  render: function() {
    this.label = this.label || this.name;
    this.content = Tags.create([
      {tag:'span', 'class':'label', id:this.dot("labelPart"), content:this.label},
      {tag:'div', 'class':'field', id:this.dot("fieldPart"), 
             style:'position:absolute; left:0px; right:0px; top:0px; margin-right:14px;', 
             content: {tag:'input', id:this.dot("inputPart"), 
                       type:'text', name:this.name, style:'width:100%;'}}
    ]);
    return this.super();
  },
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
// Override activate() in order to do an initial update().
//
// Override update() to handle the case where a new Person has
// been added. We simply empty out the old data and re-render
// the content. Note how we are using the Tags framework to
// create dynamic &lt;tr&gt; tags using Javascript descriptions.
//
// Implement the add() method which simply sets the newPerson
// property so the new Person record gets added on next update().
//
Tags.define({tag:'personTable', extend:'view', htmlTag:'table',
  activate: function() {
    this.super();
    this.update();
  },
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
  add:function(person) {
    this.newPerson = person;
  }
});
