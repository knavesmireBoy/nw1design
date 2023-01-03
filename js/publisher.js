class Publisher {
    constructor() {
        this.handlers = {"any": []};
    }
    notify(data, type = "any") {
        this.handlers[type].forEach((handler) => handler(data));
    }
    attach(handler, type = "any") {

        if(this.handlers[type]){
            this.handlers[type].push(handler);
        } else {
            this.handlers[type] = [];
            this.handlers[type].push(handler);
        }
        //this.handlers[type] = [...this.handlers[type], handler];
    }
    static from() {
        return new Publisher();
    }
}