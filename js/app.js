/*global define, App */
/*jshint unused:false */

(function($) {
	'use strict';

	var ENTER_KEY = 13;
			
	// Define a Custom Tag for a Todo record.
	Tags.define({tag:'todo', extend:'view',

		// Set the completed state of this Todo.					
		setCompleted: function(checked) {
			this.completed = checked;
			this.content[0].content.checkbox.$el.prop('checked',checked);
			if (checked) {
				this.addClass('completed');
			} else {
				this.removeClass('completed');
			}
			this.todoapp.countActiveTodos();
			this.todoapp.save();
		},
	
		// Render the Todo item, but first, create its HTML content with event handlers.
		renderText: function() {
			if (this.completed) {
				this.addClass('completed');
			}
			var self = this;
			this.addContent([
				{tag:'div', class:'view', content: {
					checkbox: {tag:'input', class:'toggle', type:'checkbox', checked:(this.completed ? 'checked' : null), on: {
						click: function() {
							self.setCompleted(!self.completed);
							self.todoapp.checkHash();
						}
					}},
					label: {tag:'label', content:this.title, on: {
						dblclick: function() {
							self.$el.addClass('editing').find('.edit').focus();
						}
					}},
					destroyButton: {tag:'button', class:'destroy', on: {
						click: function() {
							self.todoapp.removeTodo(self);
						}
					}}
				}},
				{tag:'input', class:'edit', value:this.title, on: {
					keypress: function(e) {
						if (e.which === ENTER_KEY) e.target.blur();
					},
					blur: function() {
						self.title = $(this).val();
						self.$el.removeClass('editing');
						self.content[0].content.label.$el.html(self.title);
						self.todoapp.save();
					}
				}}
			]);
			return this.renderAs('li');
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
			this.$el.remove();
		}
				
	});

	// Define a custom tag for the main static section of the App.
	// Map the ID value of each nested tag into this object for
	// easy access. Bind the event handlers for nested static
	// tags here so they have access to the shared context
	// provided by this object. A singleton instance of this
	// object will be automatically created and activated by
	// the framework.
	Tags.define({tag:'appSection', extend:'view',
	
		todoList: [],
	
		// Load/Save data from/to LocalStorage	
		store: function (namespace, data) {
			return arguments.length > 1 ? localStorage.setItem(namespace, JSON.stringify(data))
																	: JSON.parse(localStorage.getItem(namespace)) || [];
		},
	
		// Count all the Todo entries that are not completed.
		countActiveTodos: function() {
			var activeCount = 0;
			for (var n=0; n<this.todoList.length; n++) {
				if (!this.todoList[n].completed) activeCount += 1;
			}
			this['clear-completed'].$el.toggle(activeCount < this.todoList.length);
			$('#toggle-all').prop('checked',activeCount === 0);
			return activeCount;
		},
		
		update: function() {
			var activeTodoCount = this.countActiveTodos();
			this['todo-count'].$el.html('<strong>'+this.todoList.length+'</strong> item'+(activeTodoCount === 1 ? '' : 's')+' left');
			this.footer.$el.toggle(!!this.todoList.length);
			this.main.$el.toggle(this.todoList.length !== 0);
			this.save();
			this.checkHash();
		},
	
		addTodo: function(config) {
			config.todoapp = this;
			var newTodo = Tags.create(config);
			this.todoList.push(newTodo);
			this['todo-list'].$el.append(newTodo.render());
			this['new-todo'].$el.val('');
			newTodo.activate();
		},

		// Remove the specified Todo entry.
		removeTodo: function(todo) {
			for (var n=0; n<this.todoList.length; n++) {
				if (this.todoList[n] === todo) {
					todo.remove();
					this.todoList.splice(n,1);
					this.update();
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
			this.update();
		},
		
		// Save App data to LocalStorage
		save: function() {
			var savedData = [];
			for (var n=0; n<this.todoList.length; n++) {
				savedData.push(this.todoList[n].serialize());
			}
			this.store('todos-mytodo',savedData);
		},
					
		renderText: function() {
			var self = this;
			this.walk(function(child) {
				if (child.id) self[child.id] = child;
			});

			this['new-todo'].on.keyup = function(e) {
				var val = $.trim($(this).val());
				if (e.which !== ENTER_KEY || !val) return;
				self.addTodo({tag:'todo', title:val, completed:false});
				self.update();
				$(this).val('');
			};

			this['toggle-all'].on.change = function(e) {
				var checked = $(this).prop('checked');
				for (var n=0; n<self.todoList.length; n++) {
					self.todoList[n].setCompleted(checked);
				}
				self.update();
			};
			
			this['clear-completed'].on.click = function() {
				self.removeCompleted();
				self.update();
			};
			
			return this.renderAs('section');
		},
		
		checkHash: function() {

			var hash = document.location.hash;
			var option = hash.split('/')[1];
			for (var n=0; n<this.todoList.length; n++) {
				var item = this.todoList[n];
				item.$el.toggle( (item.completed && option !== 'active') || (!item.completed && option !== 'completed') );
			}
		},
		
		activate: function() {
			this._super();

			// Load the initial state from localStorage
			var todoItems = this.store('todos-mytodo');
			for (var n=0; n<todoItems.length; n++) {
				var item = todoItems[n];
				if (!item || !item.tag || !item.title || item.$el) continue;
				this.addTodo(todoItems[n]);
			}
			this.update();
			self = this;
			window.addEventListener('hashchange',function() {
				self.checkHash();
			});
		}

	});

})(jQuery);