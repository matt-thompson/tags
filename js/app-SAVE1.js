(function($) {
  'use strict';

  var Utils = {
  
    store: function (namespace, data) {
      if (arguments.length > 1) {
        var jsonText = JSON.stringify(data);
        return localStorage.setItem(namespace, jsonText);
      } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    }
  };

  Tags.extend({
    tag:'newTodoInput',
    htmlTag:'input',
    extend:'view',
    
    activate: function() {
      this._super();
      var self = this;
      self.el.on('keyup',function(e) {
        var val = $.trim(self.el.val());
        if (e.which != app.ENTER_KEY || !val) return;
        app.addTodo(val);
        self.el.val("");
      });
      return self;
    }
  
  });
    
  Tags.extend({
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
      
  Tags.extend({
    tag:'todoFooter',
    htmlTag:'footer',
    extend:'view',
    
    activate: function() {
      this._super();
      app.todoFooter = this;
      this.countEl = $("span",this.el);
      this.buttonEl = $("button",this.el);
      var self = this;
      this.buttonEl.on("click",function() {
        app.removeCompleted();
        self.update();
      });
    },

    update: function() {
      var todoCount = app.todoList.length;
      var activeTodoCount = app.countActiveTodos();
      this.countEl.html("<strong>"+todoCount+"</strong> item"+(activeTodoCount == 1 ? "" : "s")+" left");
      this.el.toggle(!!todoCount);
      app.save();
    }
    
  });

  Tags.extend({
    tag:'todo',
    htmlTag:'div',
    extend:'view',
          
    toggle: function(checked) {
      this.completed = checked;
      this.checkbox.prop('checked',checked);
      if (checked) {
        this.el.addClass('completed'); 
      } else {
        this.el.removeClass('completed');
      }
      app.save();
    },
  
    // This version renders the HTML without creating any Javascript internal structure.
    // It will access any controls it needs using DOM operations. Look at
    // _ALT1 and _ALT2 for versions that create internal structure and then
    // use that internal structure to render HTML.
    renderText: function() {
      return "<li"+(this.completed ? " class='completed'" : "")+">"
           +   "<div class='view'>"
           +     "<input class='toggle' type='checkbox'"+(this.completed ? " checked" : "")+">"
           +     "<label>"+this.title+"</label>"
           +     "<button class='destroy'></button>"
           +   "</div>"
           +   "<input class='edit' value='"+this.title+"'>"
           + "</li>";
    },

    renderText_ALT1: function() {
      this.addContent(
        {tag:'div',class:'view', content: [
          {tag:'input', class:'toggle', type:'checkbox', checked:this.completed ? "checked" : ""},
          {tag:'label', content:this.title},
          {tag:'button', class:'destroy'} ] },
        {tag:'input', class:'edit',value:this.title}
      );
      this.class = this.completed ? "completed" : "";
      return this.renderAs('li');
    },
            
    renderText_ALT2: function() {
      this.addContent(
               "<div class='view'>"
           +     "<input class='toggle' type='checkbox'"+(this.completed ? " checked" : "")+">"
           +     "<label>"+this.title+"</label>"
           +     "<button class='destroy'></button>"
           +   "</div>",
               "<input class='edit' value='"+this.title+"'>"
      );
      this.class = this.completed ? "completed" : "";
      return this.renderAs('li');
    },
            
    serialize: function() {
      return {tag:'todo',
              completed:this.completed,
              title:this.title
             };
    },
    
    remove: function() {
      this.el.remove();
    },
        
    activate: function() {
      this._super();
      this.checkbox = $("input.toggle",this.el);
      this.label = $("label",this.el);
      var self = this;
      this.checkbox.on("click",function(e) {
         self.toggle(!self.completed);
      });
      $("button",this.el).on("click",function() {
        app.removeTodo(self);
      });
      this.label.on("dblclick",function() {
        self.el.addClass('editing').find('.edit').focus();
      });
      $("input.edit",this.el).on("keypress",function(e) {
        if (e.which === app.ENTER_KEY) {
          e.target.blur();
        }
      }).on("blur",function() {
        self.title = $(this).val();
        self.el.removeClass('editing');
        self.label.html(self.title);
        app.save();
      });
    }    
      
  });

  var app = {

    ENTER_KEY: 13,    
    todoList: [],

    save: function() {
      var savedData = [];
      for (var n=0; n<this.todoList.length; n++) {
        savedData.push(this.todoList[n].serialize());
      }
      Utils.store("todos-mytodo",savedData);
    },
          
    toggleAllTodos: function(checked) {
      for (var n=0; n<this.todoList.length; n++) {
        this.todoList[n].toggle(checked);
      }
      app.todoFooter.update();
    },
    
    countActiveTodos: function() {
      var activeCount = 0;
      for (var n=0; n<this.todoList; n++) {
        if (!this.todoList[n].completed) activeCount += 1;
      }
      return activeCount;
    },
    
    removeTodo: function(todo) {
      var n = 0;
      while (n < this.todoList.length) {
        if (this.todoList[n] === todo) {
          todo.remove();
          this.todoList.splice(n,1);
          app.todoFooter.update();
          if (this.todoList.length == 0) $("#main").css('display','none');
          return;
        }
        n += 1;
      }
    },
      
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
      if (this.todoList.length == 0) $("#main").css('display','none');
    },
    
    addTodo: function(val) {
      var newTodo = Tags.build({
        tag:'todo',
        title:val,
        completed:false
      });
      this.todoList.push(newTodo);
      $("#main").css('display','block');
      this.todoListEl.append(newTodo.render());
      newTodo.activate();
      app.todoFooter.update();
    },

    init: function() {
      log.debug("app.INIT");
      var todoItems = Utils.store("todos-mytodo");
      var first = true;
      this.todoListEl = $("#todo-list");
      for (var n=0; n<todoItems.length; n++) {
        var item = todoItems[n];
        if (!item || !item.tag || !item.title || item.el) {
          continue;
        }
        if (first) {
          $("#main").css('display','block');
          first = false;
        }
        var todo = Tags.build(todoItems[n]);
        this.todoList.push(todo);
        this.todoListEl.append(todo.render());
        todo.activate();
      }
      app.todoFooter.update();
    }

  };
  
  $(document).ready(function() {
    app.init();
  });  

})(jQuery);
