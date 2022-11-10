/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

nW1.utils = (function () {
  "use strict";
  const getResult = (o) => {
      if (typeof o === "function") {
        return o();
      }
      return o;
    },
    tagTester = (name) => {
      const tag = "[object " + name + "]";
      return function (obj) {
        return toString.call(obj) === tag;
      };
    },
    $ = (str) => document.getElementById(str),
    $q = (str, flag = false) => {
      const m = flag ? "querySelectorAll" : "querySelector";
      return document[m](str);
    },
    doPartial = (flag) => {
      return function p(f, ...args) {
        if (f.length === args.length) {
          return flag ? () => f(...args) : f(...args);
        }
        return (...rest) => p(f, ...args, ...rest);
      };
    },
    compose = (...fns) =>
      fns.reduce(
        (f, g) =>
          (...vs) =>
            f(g(...vs))
      ),
    invokeMethod = (o, m, v) => o[m](v),
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
    },
    curryRight = (i, defer = false) => {
      const once = {
          imm: (fn) => (a) => fn(a),
          def: (fn) => (a) => () => fn(a),
        },
        twice = {
          imm: (fn) => (b) => (a) => fn(a, b),
          def: (fn) => (b) => (a) => () => fn(a, b),
        },
        thrice = {
          imm: (fn) => (c) => (b) => (a) => fn(a, b, c),
          def: (fn) => (c) => (b) => (a) => () => fn(a, b, c),
        },
        quart = {
          imm: (fn) => (d) => (c) => (b) => (a) => fn(a, b, c, d),
          def: (fn) => (d) => (c) => (b) => (a) => () => fn(a, b, c, d),
        },
        options = [null, once, twice, thrice, quart],
        ret = options[i];
      return ret && defer ? ret.def : ret ? ret.imm : function () {};
    },
    curryLeft = (i, defer = false) => {
      const once = {
          imm: (fn) => (a) => fn(a),
          def: (fn) => (a) => () => fn(a),
        },
        twice = {
          imm: (fn) => (a) => (b) => fn(a, b),
          def: (fn) => (a) => (b) => () => fn(a, b),
        },
        thrice = {
          imm: (fn) => (a) => (b) => (c) => fn(a, b, c),
          def: (fn) => (a) => (b) => (c) => () => fn(a, b, c),
        },
        quart = {
          imm: (fn) => (a) => (b) => (c) => (d) => fn(a, b, c, d),
          def: (fn) => (a) => (b) => (c) => (d) => () => fn(a, b, c, d),
        },
        options = [null, once, twice, thrice, quart],
        ret = options[i];
      return ret && defer ? ret.def : ret ? ret.imm : function () {};
    };

  return {
    $: $,
    $$: (str) => () => $(str),
    $Q: $q,
    $$Q:
      (str, flag = false) =>
      () =>
        $q(str, flag),
    compose: compose,
    tagTester, tagTester,
    doWhenFactory: doWhenFactory,
    doPartial: doPartial,
    always: (a) => () => a,
    curryRight: curryRight,
    curryLeft: curryLeft,
    invoke: (f, v) => f(v),
    invokeMethod: invokeMethod,
    invokeMethodBind: (o, m, v) => {
      return getResult(o)[m].call(o, v);
    },
    invokeMethodV: (o, p, m, v) => {
      return getResult(o)[p][v](m);
    },
    invokePair: (o, m, k, v) => getResult(o)[m](k, v),
    lazyVal: (m, p, o, v) => getResult(o)[m](p, v),
    invokeMethodBridge: (m, v, o) => {
      return invokeMethod(getResult(o), m, v);
    },
    invokeMethodBridgeCB: (cb) => (m, v, o) => {
      return invokeMethod(cb(o), m, v);
    },
    invokeClass: (o, s, m, v) => getResult(o)[s][m](v),
    negate: (f, ...args) => !f(...args),
};
}());
