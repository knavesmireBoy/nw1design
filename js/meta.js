/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

if (typeof Function.prototype.wrap === "undefined") {
  Function.prototype.wrap = function (wrapper, ..._vs) {
    let _method = this; //the function
    return function (...vs) {
      return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
    };
  };
}

nW1.meta = (function () {
  "use strict";

  function pApply(fn, ...cache) {
    return (...args) => {
      const all = cache.concat(args);
      return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
    };
  }

  /*
  function composeVerbose (...fns) {
    return fns.reduce((f, g) => {
      return (...vs) => {
      //console.log(f, g, ...vs);
        return f(g(...vs));
      };
    });
  }
*/

  const getResult = (o) => {
      if (typeof o === "function") {
        return o();
      }
      return o;
    },
    def = (x) => typeof x !== "undefined",
    tagTester = (name) => {
      const tag = "[object " + name + "]";
      return function (obj) {
        return toString.call(obj) === tag;
      };
    },
    isBoolean = tagTester("Boolean"),
    byId = (str) => document.getElementById(str),
    byIdDefer = (str) => () => byId(str),
    byTag = (str, flag = false) => {
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
    mittelFactory = (flag) => {
      if (flag) {
        return (f, o, v = undefined) =>
          (m) =>
            f(o, m, v);
      } else if (isBoolean(flag)) {
        return (f, m, v = undefined) =>
          (o, k) =>
            def(v) ? f(o, m, k, v) : f(o, m, v);
      }
      return (f, m, k = undefined) =>
        (o, v) =>
          def(k) ? f(o, m, k, v) : f(o, m, v);
    },
    curryRight = (i, defer = false) => {
      const once = {
          imm: (fn) => (a) => fn(a),
          def: (fn) => (a) => () => fn(a)
        },
        twice = {
          imm: (fn) => (b) => (a) => {
           // console.log(fn,a,b)
            return fn(a, b);
          },
          def: (fn) => (b) => (a) => () => fn(a, b)
        },
        thrice = {
          imm: (fn) => (c) => (b) => (a) => fn(a, b, c),
          def: (fn) => (c) => (b) => (a) => () => fn(a, b, c)
        },
        quart = {
          imm: (fn) => (d) => (c) => (b) => (a) => fn(a, b, c, d),
          def: (fn) => (d) => (c) => (b) => (a) => () => fn(a, b, c, d)
        },
        options = [null, once, twice, thrice, quart],
        ret = options[i],
        noOp = () => {
          return false;
        };
      return ret && defer ? ret.def : ret ? ret.imm : noOp;
    },
    curryLeft = (i, defer = false) => {
      const once = {
          imm: (fn) => (a) => fn(a),
          def: (fn) => (a) => () => fn(a)
        },
        twice = {
          imm: (fn) => (a) => (b) => fn(a, b),
          def: (fn) => (a) => (b) => () => fn(a, b)
        },
        thrice = {
          imm: (fn) => (a) => (b) => (c) => fn(a, b, c),
          def: (fn) => (a) => (b) => (c) => () => fn(a, b, c)
        },
        quart = {
          imm: (fn) => (a) => (b) => (c) => (d) => fn(a, b, c, d),
          def: (fn) => (a) => (b) => (c) => (d) => () => fn(a, b, c, d)
        },
        options = [null, once, twice, thrice, quart],
        ret = options[i],
        noOp = () => {
          return false;
        };
      return ret && defer ? ret.def : ret ? ret.imm : noOp;
    },
    toArray = (coll, cb = () => true) =>
      Array.prototype.slice.call(coll).filter(cb),
    best = (fun, coll, arg) => {
      return toArray(coll).reduce((champ, contender) =>
        fun(champ, contender) ? champ : contender
      );
    },
    //can't assign i to another variable
    alternate = (i, n) => () => (i += 1) % n,
    doAlternate = () => {
      const f = alternate(0, 2);
      return (actions, ...args) => {
        return () => best(f, [actions[0], actions[1]])();
      };
    },
    invokeMethod = (o, m, v) => {
      try {
        return getResult(o)[m](v);
      } catch (e) {
          return getResult(o)[m](getResult(v));
      }
    },
    soInvoke = (o, m, ...rest) => o[m](...rest);
  return {
    $: byId,
    $$: byIdDefer,
    $Q: byTag,
    $$Q:
      (str, flag = false) =>
      () =>
        byTag(str, flag),
    compose: compose,
    tagTester: tagTester,
    doWhenFactory: doWhenFactory,
    doPartial: doPartial,
    setter: (o, k, v) => {
     // console.log(o,k,v)
      let obj = getResult(o);
      obj[k] = v;
    },
    pApply: pApply,
    pass: (ptl, o) => {
      ptl(getResult(o));
      return o;
    },
    always: (a) => () => a,
    identity: (a) => a,
    curryRight: curryRight,
    curryLeft: curryLeft,
    mittelFactory: mittelFactory,
    invoke: (f, v) => f(getResult(v)),
    invokeMethod: invokeMethod,
    invokeMethodBind: (o, m, v) => {
      return getResult(o)[m].call(o, v);
    },
    invokeMethodV: (o, p, m, v) => {
      return getResult(o)[p][v](m);
    },
    invokePair: (o, m, k, v) => getResult(o)[m](k, v),
    lazyVal: (m, p, o, v) => {
      return getResult(o)[m](p, v);
    },
    invokeMethodBridge: (m, v, o) => invokeMethod(o, m, v),
    invokeMethodBridgeCB: (cb) => (m, v, o) => {
      //console.log(cb(o), m, v);
      return invokeMethod(cb(o), m, v);
    },
    invokeClass: (o, s, m, v) => getResult(o)[s][m](v),
    negate: (f, ...args) => !f(...args),
    zip: (m, funs, vals) => vals[m]((v, i) => funs[i](v)),
    eitherOr: (a, b, pred) => (pred ? a : b),
    compare: (pred) => (p, a, b) => {
      return typeof p === "string"
        ? pred(a[p], b[p])
        : p
        ? pred(p[a], p[b])
        : pred(a, b);
    },
    toArray: toArray,
    doAlternate: doAlternate,
    driller: (o, p) =>  o[p] || o,
    getter: (o, p) => getResult(o)[p],
    getTgt: (str) => byIdDefer(str),
    soInvoke: soInvoke,
    doTest: function (x) {
      console.log(x);
      return x;
    }
  };
}());
