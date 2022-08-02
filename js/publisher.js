class Publisher {
		constructor(h = []) {
			this.handlers = h;
		}
		notify(...args) {
            console.log(args)
			this.handlers.forEach((handler) => handler(...args));
		}
		attach(handler) {
			this.handlers = [...this.handlers, handler];
		}
		static from(h = []) {
			return new Publisher(h);
		}
	}