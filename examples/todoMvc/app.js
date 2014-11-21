/*jshint unused:false */

//# todoMvc.js
//
// See <a href='showsource.html?source=examples/todoMvc/index.html'>HTML source</a>.
//
// See <a href='showsource.html?source=examples/todoMvc/app.css'>CSS source</a>.
//
// The app is implemented as a set of custom-tag definitions.
// Each call to Tags.define() creates and registers a Tags Type.
// A Type is a prototype that can be used to instatiate new
// objects by calling Tags.create().
//

//

var ENTER_KEY = 13;

//## Todo Type
//
//See <a href='showsource.html?source=examples/todoMvc/app.js'>HTML source</a>.
//
//See <a href='showsource.html?source=examples/todoMvc/app.css'>CSS source</a>.
//
// The Todo type is used to instantiate a Todo record. It will
// be invoked manually each time a new Todo entry is needed.
//
Tags.define({tag : 'todo', extend : 'view', htmlTag : 'li', 'class' : 'edit',
  
  //### method setCompleted
  //
  // Set the Completed state of the entry, update related controls
  // and save the new state.
  //
  setCompleted : function (checked) {
    this.model.completed = checked;
    this.checkbox.$el.prop('checked', checked);
    if (checked) {
      this.$el.addClass('completed');
    } else {
      this.$el.removeClass('completed');
    }
    Tags.ns.todoapp.countActiveTodos();
    Tags.ns.todoapp.save();
  },
  
  //### method render
  //
  // Render the HTML for the Todo item.
  render : function () {
    this.model || (this.model = {});
    if (this.model.completed) {
      this.addClass('completed');
    }
    var self = this;
    //
    // Add content to the Todo entry. We use a Javascript
    // structure that mimimics XML (HTML) functionality.
    // This is similar to using a template but with better
    // encapsulation and without the complexity of supporting
    // and maintaining a separate template mechanism.
    //
    this.addContent([{
      tag:'div', 'class':'view', content:[
        {tag:'input', id:this.dot('checkbox'), 'class':'toggle', type:'checkbox', checked:(this.model.completed ? 'checked' : null)}, 
        {tag:'label', id:this.dot('label'), content:this.model.title}, 
        {tag:'button', id:this.dot('destroyButton'),'class':'destroy'}
      ]},
      {tag:'input', type:'text', id:this.dot('editField'), 'class':'edit', value:this.model.title}
    ]);
    return this.super();
  },
  
  //### method activate
  //
  // Implement the event handlers needed by this entry.
  activate : function() {
    var self = this;
    
    // We refer to objects instantiated in the render()
    // method. Using this.dot() to create the 'id'
    // attribute names these objects in 'this' object
    // so we can easily find them here.
    //
    this.checkbox.$el.on('click', function () {
      self.setCompleted(!self.model.completed);
      Tags.ns.todoapp.checkHash();
    });
    this.label.$el.on('dblclick', function() {
      self.$el.addClass('editing');
      self.editField.$el.focus();
      
    });
    this.destroyButton.$el.on('click',function() {
      Tags.ns.todoapp.removeTodo(self);
    });
    this.editField.$el.on('keypress', function(e) {
      if (e.which == ENTER_KEY) {
        this.$el.trigger('blur');
      }
    });
    this.editField.$el.on('blur', function(e) {
      self.model.title = $(this).val();
      self.$el.removeClass('editing');
      self.label.$el.html(self.model.title);
      Tags.ns.todoapp.save();
    });
  }
  
});

//## AppSection Type
//
// Define a custom tag for the main static section of the App.
// Map the ID value of each nested tag into this object for
// easy access. Bind the event handlers for nested static
// tags here so they have access to the shared context
// provided by this object. A singleton instance of this
// object will be automatically created and activated by
// the framework.
Tags.define({tag : 'appSection', extend : 'view', htmlTag : 'section', 

  // Count all the Todo entries that are not completed.
  countActiveTodos : function () {
    var activeCount = 0;
    for (var n = 0; n < this.todoList.content.length; n++) {
      if (!this.todoList.content[n].model.completed) {
        activeCount += 1;
      }
    }
    this.clearCompleted.$el.toggle(activeCount < this.todoList.content.length);
    this.toggleAll.$el.prop('checked', activeCount === 0);
    return activeCount;
  },
  
  update : function () {
    var activeTodoCount = this.countActiveTodos();
    var totalTodoCount = this.todoList.content.length;
    this.todoCount.$el.html('<strong>' 
             + totalTodoCount
             + '</strong> item' 
             + (activeTodoCount === 1 ? '' : 's') + ' left');
    this.footer.$el.toggle(!!totalTodoCount);
    this.main.$el.toggle(totalTodoCount !== 0);
    this.save();
    this.checkHash();
  },
  
  addTodo : function (model) {
    var todo = Tags.create({tag:'todo', model:model});
    this.todoList.content.push(todo);
    this.todoList.$el.append(todo.render(this));
    Tags.ns['new-todo'].$el.val('');
    todo.activate(this);
  },
  
  // Remove the specified Todo entry.
  removeTodo : function (todo) {
    var list = this.todoList.content;
    for (var n = 0; n < list.length; n++) {
      if (list[n] === todo) {
        todo.$el.remove();
        list.splice(n, 1);
        this.update();
        break;
      }
    }
   },
  
    // Save App data to LocalStorage
   save : function () {
     var savedData = [];
     var list = this.todoList.content;
     for (var n = 0; n < list.length; n++) {
       savedData.push(list[n].model);
     }
     localStorage.setItem('todos-mytodo', JSON.stringify(savedData));
   },
       
   activate : function () {
     var self = this;
     this.super();
     Tags.ns['new-todo'].$el.on('keyup', function (e) {
       var val = $.trim($(this).val());
       if (e.which !== ENTER_KEY || !val) {
         return;
       }
       self.addTodo({title : val, completed : false});
       self.update();
       $(this).val('');
     });
  
     this.toggleAll.$el.on('change', function (e) {
       var checked = $('#toggle-all').prop('checked');
       $('#toggle-all').prop('checked',checked);
       var list = self.todoList.content;
       for (var n = 0; n < list.length; n++) {
         list[n].setCompleted(checked);
       }
       self.update();
     });
   
     this.clearCompleted.$el.on('click', function () {
       var n = 0;
       var list = self.todoList.content;
       while (n < list.length) {
         var item = list[n];
         if (item.model.completed) {
           item.$el.remove();
           list.splice(n, 1);
         } else {
           n += 1;
         }
       }
       self.update();
     });
  
     // Load the initial state from localStorage
     
     var todoItems = JSON.parse(localStorage.getItem('todos-mytodo')) || [];
     for (var n = 0; n < todoItems.length; n++) {
       this.addTodo(todoItems[n]);
     }
     this.update();
     var self = this;
     window.addEventListener('hashchange', function () {
       self.checkHash();
     });
   },
  
   checkHash : function () {
     var hash = document.location.hash;
     var option = hash.split('/')[1];
     var list = this.todoList.content;
     for (var n = 0; n < list.length; n++) {
       var item = list[n];
       item.$el.toggle((item.model.completed && option !== 'active') || (!item.model.completed && option !== 'completed'));
     }
  }

});

