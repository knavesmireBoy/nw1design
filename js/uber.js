/*jslint nomen: true */
/*global Publisher: false */
/*global window: false */
/*global nW1: false */

/* eslint-disable indent */

if (!window.nW1) {
  window.nW1 = {};
}
window.nW1.utils = (function() {


if (typeof Function.prototype.wrap === "undefined") {
  Function.prototype.wrap = function (wrapper, ..._vs) {
    let _method = this; //the function
    return function (...vs) {
      return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
    };
  };
}

function modulo(n, i) {
  return i % n;
}

function increment(i) {
  return i + 1;
}
function getResult(o) {
  if (typeof o === "function") {
    return o();
  }
  return o;
}

function doPortrait(m, o, v) {
	return o.classList[m](v);
  }

function doPartial(flag) {
  return function p(f, ...args) {
    if (f.length === args.length) {
      return flag ? () => f(...args) : f(...args);
    }
    return (...rest) => p(f, ...args, ...rest);
  };
}
/*
https://gist.github.com/JamieMason/1228339132986291693726d11bd8dd1f
const pApply = (fn, ...cache) => (...args) => {
  const all = cache.concat(args);
  return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
*/
function doInc(n) {
  return compose(ptL(modulo, n), increment);
}

const  tagTester = (name) => {
    const tag = "[object " + name + "]";
    return function (obj) {
      return toString.call(obj) === tag;
    };
  },
  getRes = function (arg) {
    if (this.isFunction(arg)) {
      return arg();
    }
    return arg;
  },
  pApply = (fn, ...cache) =>
    (...args) => {
      const all = cache.concat(args);
      return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
    },
  deferPTL = doPartial(true),
  ptL = doPartial(),
  pass = (ptl, o) => {
    ptl(getResult(o));
    return o;
  },
  //con = (v) => console.log(v),
  compose = (...fns) =>
    fns.reduce(
      (f, g) =>
        (...vs) =>
          f(g(...vs))
    ),
  getter = (o, p) => {
    return getResult(o)[p];
  },
  setter = (o, k, v) => {
    let obj = getResult(o);
    obj[k] = v;
    return obj;
  },
  lazyVal = (m, p, o, v) => o[m](p, v),

  invokeMethod = (o, m, v) => o[m](v),
  invokeMethodBridge =  (m, v, o) => {
    return invokeMethod(getResult(o), m, v);
  },
  invokeMethodBridgeCB = (cb) => (m, v, o) => {
    return invokeMethod(cb(o), m, v);
  },
  setterBridge = (k, o, v) => {
    let obj = getResult(o);
    obj[k] = v;
    return obj;
  },
  always = (arg) => () => arg,
  setAttribute = ptL(lazyVal, "setAttribute"),
  curry2 = (fun) => (b) => (a) => fun(a, b),
  curry22 = (fun) => (b) => (a) => () => fun(a, b),
  curry3 = (fun) => (c) => (b) => (a) => fun(a, b, c),
  curry4 = (fun) => (d) => (c) => (b) => (a) => fun(a, b, c, d),
  curryL3 = (fun) => (a) => (b) => (c) => fun(a, b, c),
  doEach = curryL3(invokeMethodBridgeCB(getResult))("forEach"),
  getZero = curry2(getter)(0),
  setLink = curry2(setAttribute("href")),
  getImgSrc = curryL3(invokeMethodBridge)("getAttribute")("src"),
  addKlas = ptL(invokeMethodBridge, "add"),
  remKlas = ptL(invokeMethodBridge, "remove"),
  getParent = curry2(getter)("parentNode"),
  getTarget = curry2(getter)("target"),
  getClassList = curry2(getter)("classList"),
  undoActive = compose(remKlas("active"), getClassList).wrap(pass),
  getKey = compose(getZero, curryL3(invokeMethod)(window.Object)("keys")),
  doTextNow = ptL(invokeMethod, document, "createTextNode"),
  getLength = curry2(getter)("length");


return {
always: always,
curry2: curry2,
curry22: curry22,
curry3: curry3,
pApply: pApply,
isFunction: tagTester("Function"),
getImgSrc: getImgSrc,
isBoolean: tagTester("Boolean"),
  doGet: curry2(getter),
  invoke: (f, v) => f(v),
  invokeMethod: invokeMethod,
  invokeMethodBind: (o, m, v) => {
    return o[m].call(o, v);
  },
  invokeMethodV: (o, p, m, v) => {
    return getResult(o)[p][v](m);
  },
  invokePair: (o, m, k, v) => getResult(o)[m](k, v),
  lazyVal: lazyVal,
  invokeMethodBridge: invokeMethodBridge,
  invokeMethodBridgeCB: invokeMethodBridgeCB,
  invokeClass: (o, s, m, v) => getResult(o)[s][m](v),
  negate: (f, ...args) => !f(...args),
  $: (str) => document.getElementById(str),
  $$: (str) => () => $(str),
  $q: (str, flag = false) => {
    const m = flag ? "querySelectorAll" : "querySelector";
    return document[m](str);
  },
  $$q: (str, flag = false) => () => $q(str, flag),
  getTarget: getTarget,
  getParent: getParent,
  getParent2: compose(getParent, getParent),
  getText: curry2(getter)("innerHTML"),
  getClassList:   getClassList,
  doMake: deferPTL(invokeMethod, document, "createElement"),
  doText: deferPTL(invokeMethod, document, "createTextNode"),
  doTextNow: doTextNow,
  doTextCBNow: curryL3(invokeMethod)(document)("createTextNode"),
  prepend: curry2(ptL(invokeMethodBridgeCB(getResult), "appendChild")),
  append: ptL(invokeMethodBridgeCB(getResult), "appendChild"),
  appendCB: curryL3(invokeMethodBridgeCB(getResult))("appendChild"),
  getAttribute: ptL(invokeMethodBridge, "getAttribute"),
  getAttrs: curryL3(invokeMethodBridge)("getAttribute"),
  setAttribute: ptL(lazyVal, "setAttribute"),
  matchLink: compose(
    curry3(invokeMethod)(/^a$/i)("match"),
    curry2(getter)("nodeName"),
    getTarget
  ),
 
  matchPath: compose(
    curry3(invokeMethod)(/jpe?g/i)("match"),
    curryL3(invokeMethodBridge)("getAttribute")("href")
  ),

  setId: curry2(setAttribute("id")),
  setKlas: curry2(setAttribute("class")),
  setSrc: curry2(setAttribute("src")),
  setAlt: curry2(setAttribute("alt")),
  setVal: curry2(setAttribute("value")),
  setMin: curry2(setAttribute("min")),
  setMax: curry2(setAttribute("max")),
  setType: curry2(setAttribute("type")),
  clearInnerHTML: curry3(setter)("")("innerHTML"),
  setNavId: curry2(setAttribute("id"))("navigation").wrap(pass),
  setHref: setLink(".").wrap(pass),
  doActive: compose(addKlas("active"), getClassList).wrap(pass),
  undoActive: compose(remKlas("active"), getClassList).wrap(pass),
  undoActiveCB: doEach(undoActive),
  getLength:  getLength,
  getKey:  getKey,
  getKeys: compose(doTextNow, getKey),
  doTest: function (x) {
    console.log(x);
    return x;
  },
  incrementer: compose(doInc, getLength),
  applyPortait: curry3(doPortrait)('portrait'),
  getResult: getResult

};
}());

