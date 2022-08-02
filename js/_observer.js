/*jslint browser: true*/
/*global $, jQuery, alert*/
if (!window.gAlp) {
    window.gAlp = {};
}

gAlp.Publish = (function () {
    "use strict";

    function getfunction(fn, cn) {
        var context = typeof cn === "undefined" ? null : cn || this,
            func = typeof fn === 'function' ? fn : context ? context[fn] : undefined;
        return func;
    }

    function visitSubscribers(action, type, arg, context) {

        var pubtype = type || 'any',
            subscribers,
            i,
            current,
            max;
        
        subscribers = this.subscribers[pubtype];
        max = subscribers ? subscribers.length : 0;

        for (i = 0; i < max; i += 1) {
            current = subscribers[i];
            if (action === 'publish') {
                current.func.call(current.context, arg, current.type);

            } else {
                if (current.func === arg && current.context === context) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }

    return {

        subscribers: {
            set: function (prop, arg) {
                this[prop] = arg || [];
            },

            get: function (prop) {
                return this[prop];
            },

            any: []
        },

        on: function (Type, fn, context) {

            var subs = this.subscribers,
                type = Type || 'any',
                func = getfunction.call(this, fn, context);

            if (typeof func === "undefined") { return; }
            if (typeof subs[type] === "undefined") { subs[type] = []; }

            subs[type] = subs[type].filter(function (member) {
                return member.func !== func;
            });

            subs[type].push({
                func: func,
                context: context
            });
            
        },

        remove: function (type, func, context) {
            context = context || this;
            visitSubscribers.call(this, 'unsubscribe', type, func, context);
        },

        fire: function (type, data) {
            visitSubscribers.call(this, 'publish', type, data);
        },


        publish: function (object) {
            var prop;
            //effectively init BUT we're mixing in this properties to incoming object which should possess an init method
            if (object && object.subscribers) {
                return;
            }
            for (prop in this) {
                if (this.hasOwnProperty(prop)) {
                    object[prop] = this[prop];
                }
            }
        }
    };//returned

}()); //gAlp.Publish