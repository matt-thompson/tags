// This is a Tag to represent a ToDo entry.
Tags.define({
  tag:'todo',
  extend:'view',
  htmlTag:'li',
  
  toggleDone:function() {
    this.done = !this.done;
    if (this.done) {
      this.todoText.$el.addClass("done");
    } else {
      this.todoText.$el.removeClass("done");
    }
    this.controller.updateCount();
  },
  
  render:function() {
    var self = this;
    this.content = [];
    this.content.push(Tags.create({tag:'input', type:'checkbox', as:'todoCheckbox', 
                                   on:{click:function() {self.toggleDone();}}}));
    this.content.push(Tags.create({tag:'span', as:'todoText', content:this.text}));
    this.super();
    this.todoText = info.todoText;
    if (this.done) {
      info.todoCheckbox.$el.prop('checked','checked');
      info.todoText.$el.addClass('done');
    }
    return this.$el;
  }
});

Tags.define({
  tag:'todoController',
  extend:'view',
  htmlTag:'div',
  
  todos:[],
  
  initialTodos:[
    Tags.create({tag:'todo', text:'eat', done:true}),
    Tags.create({tag:'todo', text:'drink', done:false}),
    Tags.create({tag:'todo', text:'be merry', done:false})],
  
  updateCount:function() {
    var count = 0;
    for (var n=0; n<this.todos.length; n++) {
      count += this.todos[n].done ? 0 : 1;
    }
    this.info.numRemaining.$el.text(count);
    this.info.todoCount.$el.text(this.todos.length);
  },
  
  addTodo: function(todo) {
    todo.render(this.info);
    this.todos.push(todo);
    this.info.todoList.$el.append(todo.$el);
    todo.activate(this.info);
  },
      
  activate:function() {
    var self = this;
    this.super();
    this.info = info;
    for (var n=0; n<this.initialTodos.length; n++) {
      this.addTodo(this.initialTodos[n]);
    }
    info.archiveButton.$el.on('click',function() {
      var n = 0;
      while (n < self.todos.length) {
        var todo = self.todos[n];
        if (todo.done) {
          self.todos[n].$el.remove();
          self.todos.splice(n,1);
        } else {
          n++;
        }
      }
      self.updateCount();
    });
    
    info.addTodoButton.$el.on('click',function() {
      self.addTodo(Tags.create({tag:'todo', 
                                text:self.info.todoInput.$el.val(), 
                                done:false}));
      self.info.todoInput.$el.val('');
    });
   
    this.updateCount(); 
  }
});

