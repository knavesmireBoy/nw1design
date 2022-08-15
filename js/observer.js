if (!window.nW1) {
    window.nW1 = {};
}
window.nW1.Publish = (function () {
    "use strict";
    //arg either func or arguments to func
    function visitSubscribers(action = 'publish', type = 'any', arg) {
        let subscribers,
            i,
            fn,
            max;
        subscribers = this.subscribers[type];
        max = subscribers ? subscribers.length : 0;
        for (i = 0; i < max; i += 1) {
            fn = subscribers[i];
            if (action === 'publish') {
                fn(arg, type);
            } else {
                if (fn === arg) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }
    return function () {
        const ret = {
            subscribers: {
                set: function (prop, arg = []) {
                    this[prop] = arg;
                    return this;
                },
                get: function (prop) {
                    return this[prop];
                },
                any: []
            },
            attach: function (fn, type = 'any') {
                if (!this.subscribers[type]) {
                    this.subscribers[type] = this.subscribers.set(type).get(type);
                }
                this.subscribers[type] = this.subscribers[type].filter(func => func !== fn);
                this.subscribers[type].push(fn);
            },
            remove: function (func, type = 'any') {
                visitSubscribers.call(this, 'unsubscribe', type, func);
            },
            notify: function (data = null, type = 'any') {
                visitSubscribers.call(this, 'publish', type, data);
            },
            makepublisher: function (object) {
                let prop;
                if (object && object.subscribers) {
                    return;
                }
                for (prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        object[prop] = this[prop];
                    }
                }
                return object;
            }
        };
        return ret;
    };
}());
