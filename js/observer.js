/*jslint browser: true*/
/*global $, jQuery, alert*/
if (!window.nW1) {
    window.nW1 = {};
}

nW1.Publish = (function () {
    "use strict";
    
    //arg eithe func or arguments to func
    function visitSubscribers(action = 'publish', type = 'any', arg) {

        var subscribers,
            i,
            fn,
            current,
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

    return {

        subscribers: {
            set: function (prop, arg = []) {
                this[prop] = arg;
            },

            get: function (prop) {
                return this[prop];
            },

            any: []
        },

        attach: function (fn = () => {}, type = 'any') {

            var subs = this.subscribers;

            subs[type] = subs[type].filter(function (func) {
                return func !== fn;
            });
            subs[type].push(fn);
        },

        remove: function (func, type = 'any') {
            visitSubscribers.call(this, 'unsubscribe', type, func);
        },

        notify: function (data = null, type = 'any') {
            visitSubscribers.call(this, 'publish', type, data);
        },

        makepublisher: function (object) {
            var prop;
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
    };//returned

}()); //gAlp.Publish