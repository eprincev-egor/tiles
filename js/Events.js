'use strict';

	class Events {
		on(events, handler, once) {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}

			if (!(events+='') || typeof handler !== 'function')
				return this;

			var name = '', event;
			events = events.split(/\s+/);
			for (var i=0, n= events.length; i<n; i++) {
				name = events[i];
				if (!(name+=''))
					continue;

				event = this._events[name] || [];

				event.push({
					once : !!once,
					callback : handler
				});
				this._events[name] = event;
			}

			return this;
		}
		
		once(events, handler) {
			return this.on(events, handler, true);
		}
		
		off(events, handler) {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}

			if (!(events+=''))
				return this;

			var name = '',
				event,
				isFunc = typeof handler === 'function',
				toSave;

			events = events.split(/\s+/);

			for (var i=0, n= events.length; i<n; i++) {
				name = events[i];
				if (!name)
					continue;

				event = this._events[name] || [];
				if ( !isFunc ) {
					toSave = [];
				} else {
					toSave = [];
					for (var j=0, m=event.length; j<m; j++) {
						if (event[j].callback === handler)
							continue;

						toSave.push(event[j]);
					}
					event = toSave;
				}
				if ( toSave.length ) {
					this._events[name] = toSave;
				} else {
					delete this._events[name];
				}
			}

			return this;
		}
		
		trigger(events) {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}

			if (typeof events != 'string')
				return this;

			var name = '',
				event,
				saves = [],
				result,
				args = [].slice.call(arguments, 1);

			events = events.split(/\s+/);

			for (var i=0, n = events.length; i<n; i++) {
				name = events[i];
				if ( name === '' ) {
					continue;
				}

				if ( name != '*' ) {
					Events.callStack(this, '*', [name].concat(args));
				}
				Events.callStack(this, name, args);
			}

			return this;
		}
		
		triggerAll() {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}
			
			for (var name in this._events) {
				if ( name == '*' ) {
					continue;
				}
				Events.callStack(this, name, arguments);
			}
			return this;
		}
		
		clearEvents() {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}
			
			this._events = {};
			this._eventsListeners.forEach(function(listener) {
				if ( listener && listener.obj ) {
					listener.obj.off(listener.event, listener.handler);
				}
			});
			this._eventsListeners = [];
			return this;
		}
		
		listenTo(listenObj, events, handler) {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}
			
			if ( events == 'all' ) {
				events = 'all *';
			}

			var context = this;

			if ( typeof handler != 'function' ) {
				handler = function(){};
			}
			
			var listener = {
				obj: listenObj,
				event: events,
				handler: handler.bind(context)
			};
			
			if ( listenObj.addEventListener ) {
				listenObj.addEventListener(events, listener.handler);
			} else {
				listenObj.on(events, listener.handler);
			}
			
			this._eventsListeners.push(listener);
		}

		destroy() {
			this.clearEvents();
		}
		
		stopListening(obj, event) {
			if ( !this._events ) {this._events={};}
			if ( !this._eventsListeners ) {this._eventsListeners=[];}
			
			if ( f.isString(obj) ) {
				event = obj;
				obj = false;
			}
			
			this._eventsListeners.forEach(function(listener) {
				// @see ckeditor.destroy
				if ( !listener || !listener.obj ) {
					return;
				}
				
				if ( !obj ) {
					listener.obj.off(event, listener.handler);
				} else
				if ( listener.obj == obj ) {
					listener.obj.off(event, listener.handler);
				}
			});
		}
	}
	
	Events.callStack = function(context, name, args) {
		var newStack = [],
			data,
			stack = context._events[name],
			result;

		if ( !stack ) {
			return;
		}

		for (var i=0, n=stack.length; i<n; i++) {
			data = stack[i];

			if ( typeof data.callback != 'function' ) {
				continue;
			}

			if ( !data.once ) {
				newStack.push(data);
			}

			result = data.callback.apply(context, args);
			if ( result === false ) {
				break;
			}
		}

		if ( newStack.length ) {
			context._events[name] = newStack;
		} else {
			delete context._events[name];
		}
	};
