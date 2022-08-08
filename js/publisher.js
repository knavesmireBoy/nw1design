class Publisher {
		constructor(h = []) {
            this.handlers = h;
		}
		notify(...args) {
			this.handlers.forEach((handler) => handler(...args));
		}
		attach(handler, v) {
			this.handlers = [...this.handlers, handler];
		}
		static from(h = []) {
			return new Publisher(h);
		}
	}

class State {
    constructor($command) {
			this.command = $command
		}
    execute () {
        this.command.execute();
        
    }
    undo () {
        this.command.undo();
    }
}