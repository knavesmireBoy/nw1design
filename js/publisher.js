/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */

class Publisher {
    constructor() {
        this.handlers = {"any": []};
    }
    notify(data, type) {
        let mytype = nW1.meta.isString(type) ? type : 'any';
        if(this.handlers[mytype]){
            this.handlers[mytype].forEach((handler) => handler(data));
        }
    }
    attach(handler, type) {
        let mytype = nW1.meta.isString(type) ? type : 'any';
        if(this.handlers[mytype]) {
            this.handlers[mytype] = [...this.handlers[mytype], handler];
        } else {
            this.handlers[mytype] = [handler];
        }
    }
    static from() {
        return new Publisher();
    }
}