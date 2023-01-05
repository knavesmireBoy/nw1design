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
            this.handlers[mytype].forEach((handler) => handler(data, type));
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
    static attachAll(observer, subscriber, pairs, all) {
        pairs.forEach((pair) => {
            const [method, mytype] = pair,
            cb = subscriber ? subscriber[method].bind(subscriber) : method,
            type = mytype || all;
            if (nW1.meta.isFunction(cb)) {
                return observer["attach"](cb, type);
            }
        });
    }
}