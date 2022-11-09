/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
    window.nW1 = {};
}



nW1.utils = (function() {
    "use strict";
    const getResult = (o) => {
        if (typeof o === 'function') {
            return o();
        }
        return o;
    },
    doPartial = (flag) => {
        return function p(f, ...args) {
            if (f.length === args.length) {
                return flag ? () => f(...args) : f(...args);
            }
            return (...rest) => p(f, ...args, ...rest);
        };
    },
    doWhenFactory = (n) => {
        const both = (pred, action, v) => {
                if (pred(v)) {
                    return action(v);
                }
            },
            act = (pred, action, v) => {
                if (getResult(pred)) {
                    return action(v);
                }
            },
            predi = (pred, action, v) => {
                if (pred(v)) {
                    return action();
                }
            },
            none = (pred, action) => {
                if (getResult(pred)) {
                    return action();
                }
            },
            all = [none, predi, act, both];
        return all[n] || none;
    }

return {

};
}());