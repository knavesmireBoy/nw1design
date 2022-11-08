/*jslint nomen: true */
/* eslint-disable indent */

if (!window.nW1) {
  window.nW1 = {};
}
window.nW1.utils = (function() {

if (typeof Function.prototype.wrap === "undefined") {
  Function.prototype.wrap = function (wrapper, ..._vs) {
	//console.log(wrapper, _vs);
    let _method = this; //the function
    return function (...vs) {
      return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
    };
  };
}

function gtThanEq(a, b) {
	return a >= b;
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
function pApply (fn, ...cache) {
	return function (...args) {
		const all = cache.concat(args);
		return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
}

const tagTester = (name) => {
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
  deferPTL = doPartial(true),
  ptL = doPartial(),
  pass = (ptl, o) => {
    ptl(getResult(o));
    return o;
  },
  //con = (v) => console.log(v),
  /*
  compose = (...fns) =>
    fns.reduce(
      (f, g) =>
        (...vs) =>
          f(g(...vs))
    ),
	*/
	compose = (...fns) => {
		return fns.reduce((f, g) => {
			return (...vs) => {
				return f(g(...vs));
			};
		});
	},
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
  always = (arg) => () => arg,
  setAttribute = ptL(lazyVal, "setAttribute"),
  curry2 = (fun) => (b) => (a) => fun(a, b),
  curry22 = (fun) => (b) => (a) => () => fun(a, b),
  curry3 = (fun) => (c) => (b) => (a) => fun(a, b, c),
  curryL3 = (fun) => (a) => (b) => (c) => fun(a, b, c),
  curryL3x = (fun) => (a) => (y) => (x) => fun(a, y, x),
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
  getLength = curry2(getter)("length"),
  compare = (pred) => (p, a, b) => {
	return typeof p === 'string' ? pred(a[p], b[p]) : p ? pred(p[a], p[b]) : pred(a, b);
  },
  eitherOr = (a, b, pred) => pred ? a : b;

return {
always: always,
curry2: curry2,
curry22: curry22,
curry3: curry3,
curryL3: curryL3,
curryL3x: curryL3x,
pApply: pApply,
getResult: getResult,
ptL: ptL,
pass: pass,
compose: compose,
deferPTL: deferPTL,
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
  $: $,
  $$: (str) => () => $(str),
  $q: $q,
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
  getAttrs: curryL3x(invokeMethodBridge)("getAttribute"),
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
  setter: setter,
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
  getZero:  getZero,
  doCompare: compose(ptL(eitherOr, 'add', 'remove'), curry3(compare(gtThanEq))('naturalWidth')('naturalHeight'))
};
}());