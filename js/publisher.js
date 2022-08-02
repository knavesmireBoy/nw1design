class Publisher {
		constructor(h = []) {
			this.handlers = this.handlers || h;
		}
		notify(...args) {
            //console.log(args)
			this.handlers.forEach((handler) => handler(...args));
		}
		attach(handler, v) {
			this.handlers = [...this.handlers, handler];
		}
		static from(h = []) {
			return new Publisher(h);
		}
	}