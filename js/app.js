/*global define, App */
/*jshint unused:false */



(function($) {
  'use strict';

  // Define a custom tag for the new Todo input field
  Tags.define({
    tag:'newTodoInput',
    htmlTag:'input',
    extend:'view',
    
    activate: function() {
      this._super();
      var self = this;
      self.el.on('keyup',function(e) {
        var val = $.trim(self.el.val());
        if (e.which !== app.ENTER_KEY || !val) return;
        app.addTodo({tag:'todo', title:val, completed:false});
        app.todoFooter.update();
        self.el.val("");
      });
    }
  
  });
    
  // Define a custom tag for the new ToggleAll input field
  Tags.define({
    tag:'toggleAllInput',
    htmlTag:'input',
    extend:'view',
        
    activate: function() {
      this._super();
      var self = this;
      self.el.on('change',function() {
        app.toggleAllTodos($(this).prop('checked'));
      });
    }
  });

  // Define a custom tag for the Footer      
  Tags.define({
    tag:'todoFooter',
    htmlTag:'footer',
    extend:'view',
    
    activate: function() {
      this._super();
      app.todoFooter = this;
      var self = this;
      $("button",this.el).on("click",function() {
        app.removeCompleted();
        self.update();
      });
    },

    // Update the state of the App based on completed Todo records.
    update: function() {
      var todoCount = app.todoList.length;
      var activeTodoCount = app.countActiveTodos();
      $("span",this.el).html("<strong>"+todoCount+"</strong> item"+(activeTodoCount === 1 ? "" : "s")+" left");
      this.el.toggle(!!todoCount);
      app.save();
    }
    
  });

  // Define a Custom Tag for the Todo records.
  Tags.define({
    tag:'todo',
    htmlTag:'div',
    extend:'view',

    // Set the completed state of this Todo.          
    setCompleted: function(checked) {
      this.completed = checked;
      this.content[0].content.checkbox.el.prop('checked',checked);
      if (checked) {
        this.addClass('completed'); 
      } else {
        this.removeClass('completed');
      }
      app.save();
    },
  
    // Render the Todo item, but first, create its HTML content with event handlers.
    renderText: function() {
      if (this.completed) {
        this.addClass("completed");
      }
      var self = this;
      this.addContent([
        {tag:'div', class:'view', content: {
          checkbox: {tag:'input', class:'toggle', type:'checkbox', checked:(this.completed ? "checked" : null), on: {
            click: function() {
              log.debug("checkbox.CLICK");
              self.setCompleted(!self.completed);
            }
          }},
          label: {tag:'label', content:this.title, on: {
            dblclick: function() {
              log.debug("label.DBL-CLICK");
              self.el.addClass('editing').find('.edit').focus();
            }
          }},
          destroyButton: {tag:'button', class:'destroy', on: {
            click: function() {
              log.debug("destroyButton.CLICK");
              app.removeTodo(self);
            }
          }}
        }},
        {tag:'input', class:'edit', value:this.title, on: {
          keypress: function(e) {
            log.debug("input.KEYPRESS="+e.which);
            if (e.which === app.ENTER_KEY) {
              e.target.blur();
            }
          },
          blur: function() {
            log.debug("input.BLUR val="+$(this).val());
            self.title = $(this).val();
            self.el.removeClass('editing');
            self.content[0].content.label.el.html(self.title);
            app.save();
          }
        }}
      ]);
      var text = this.renderAs('li');
      log.debug("todo.renderText TEXT="+text);
      return text;
    },
    
    // Create the serialized form of this Todo item for storage.
    serialize: function() {
      return {tag:'todo',
              completed:this.completed,
              title:this.title
             };
    },
    
    // Remove this Todo entry from the DOM.
    remove: function() {
      this.el.remove();
    }
        
  });

  // Context for the App. This is where the list of todo entries is maintained.
  var app = {

    ENTER_KEY: 13,    
    todoList: [],

    // Load/Save data from/to LocalStorage  
    store: function (namespace, data) {
      if (arguments.length > 1) {
        var jsonText = JSON.stringify(data);
        return localStorage.setItem(namespace, jsonText);
      } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    },

    // Save App data to LocalStorage
    save: function() {
      var savedData = [];
      for (var n=0; n<this.todoList.length; n++) {
        savedData.push(this.todoList[n].serialize());
      }
      app.store("todos-mytodo",savedData);
    },
          
    // Set all Todo items to the given state. Used by the ToggleAll button.
    toggleAllTodos: function(checked) {
      for (var n=0; n<this.todoList.length; n++) {
        this.todoList[n].setCompleted(checked);
      }
      app.todoFooter.update();
    },
    
    // Count all the Todo entries that are not completed.
    countActiveTodos: function() {
      var activeCount = 0;
      for (var n=0; n<this.todoList; n++) {
        if (!this.todoList[n].completed) {
          activeCount += 1;
        }
      }
      return activeCount;
    },
    
    // Remove the specified Todo entry.
    removeTodo: function(todo) {
      for (var n=0; n<this.todoList.length; n++) {
        if (this.todoList[n] === todo) {
          todo.remove();
          this.todoList.splice(n,1);
          app.todoFooter.update();
          if (this.todoList.length === 0) {
            $("#main").css('display','none');
          }
          return;
        }
      }
    },
      
    // Remove all the completed Todo entries.
    removeCompleted: function() {
      var n = 0;
      while (n < this.todoList.length) {
        var item = this.todoList[n];
        if (item.completed) {
          item.remove();
          this.todoList.splice(n,1);
        } else {
          n += 1;
        }
      }
      if (this.todoList.length === 0) {
        $("#main").css('display','none');
      }
    },
    
    // Add a Todo entry.
    addTodo: function(config) {
      var newTodo = Tags.create(config);
      this.todoList.push(newTodo);
      $("#main").css('display','block');
      this.todoListEl.append(newTodo.render());
      newTodo.activate();
    },

    // Load the initial state from localStorage
    init: function() {
      var todoItems = Utils.store("todos-mytodo");
      var first = true;
      this.todoListEl = $("#todo-list");
      for (var n=0; n<todoItems.length; n++) {
        var item = todoItems[n];
        if (!item || !item.tag || !item.title || item.el) continue;
        if (first) {
          $("#main").css('display','block');
          first = false;
        }
        this.addTodo(todoItems[n]);
      }
      app.todoFooter.update();
    }

  };
  
  $(document).ready(function() {
    app.init();
  });  

})(jQuery);
