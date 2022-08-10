/*jslint nomen: true */
/*global Publisher: false */
/*global window: false */
/*global nW1: false */
if (!window.nW1) {
    window.nW1 = {};
}

if (typeof Function.prototype.wrap === 'undefined') {
    Function.prototype.wrap = function (wrapper, ..._vs) {
        let _method = this; //the function
        return function (...vs) {
            return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
        };
    };
}

function doWhenFactory(n) {

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

function modulo(n, i) {
    return i % n;
}

function increment(i) {
    return i + 1;
}

function getResult(o) {
    if (typeof o === 'function') {
        return o();
    }
    return o;
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
/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/

function replacePath(o, src) {
    o = getResult(o);
    o.setAttribute('src', src.replace('thumbs', 'fullsize').replace('tmb', 'fs'));
}

function hover(e) {
    const preview = $q('#slidepreview img');
    if (matchImg(e) && e.target !== preview) {
        replacePath(preview, getAttribute('src')(e.target));
    }
}

const looper = nW1.Looper(),
    pApply = (fn, ...cache) => (...args) => {
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
    compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
    getter = (o, p) => {
        return getResult(o)[p];
    },
    setter = (o, k, v) => {
        let obj = getResult(o);
        obj[k] = v;
        return obj;
    },
    setterBridge = (k, o, v) => {
        let obj = getResult(o);
        obj[k] = v;
        return obj;
    },
    always = (arg) => () => arg,
    curry2 = fun => b => a => fun(a, b),
    curry22 = fun => b => a => () => fun(a, b),
    curryL2 = fun => a => b => fun(a, b),
    curry3 = fun => c => b => a => fun(a, b, c),
    curryL3 = fun => a => b => c => fun(a, b, c),
    curryL33 = fun => a => b => c => () => fun(a, b, c),
    invoke = (f, v) => f(v),
    invokeMethod = (o, m, v) => o[m](v),
    invokeMethodV = (o, p, m, v) => {
        return getResult(o)[p][v](m);
    },
    lazyVal = (m, p, o, v) => o[m](p, v),
    invokeMethodBridge = (m, v, o) => {
        return invokeMethod(getResult(o), m, v);
    },
    invokeMethodBridgeCB = (cb) => (m, v, o) => {
        return invokeMethod(cb(o), m, v);
    },
    negate = (f, arg) => !f(arg),
    $ = (str) => document.getElementById(str),
    $$ = (str) => () => $(str),
    $q = (str, flag = false) => {
        const m = flag ? 'querySelectorAll' : 'querySelector';
        return document[m](str);
    },
    $$q = (str, flag = false) => () => $q(str, flag),
    getTarget = curry2(getter)('target'),
    getParent = curry2(getter)('parentNode'),
    getParent2 = compose(getParent, getParent),
    getText = curry2(getter)('innerHTML'),
    getClassList = curry2(getter)('classList'),
    doMake = deferPTL(invokeMethod, document, 'createElement'),
    doText = deferPTL(invokeMethod, document, 'createTextNode'),
    doTextNow = ptL(invokeMethod, document, 'createTextNode'),
    doTextCBNow = curryL3(invokeMethod)(document)('createTextNode'),
    prepend = curry2(ptL(invokeMethodBridgeCB(getResult), 'appendChild')),
    append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
    appendCB = curryL3(invokeMethodBridgeCB(getResult))('appendChild'),
    getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
    getAttrs = curryL3(invokeMethodBridge)('getAttribute'),
    setAttribute = ptL(lazyVal, 'setAttribute'),
    matchLink = compose(curry3(invokeMethod)(/^a$/i)('match'), curry2(getter)('nodeName'), getTarget),
    matchImg = compose(curry3(invokeMethod)(/^img/i)('match'), curry2(getter)('nodeName'), getTarget),
    matchPath = compose(curry3(invokeMethod)(/jpe?g/i)('match'), curryL3(invokeMethodBridge)('getAttribute')('href')),
    getImgSrc = curryL3(invokeMethodBridge)('getAttribute')('src'),
    getImgPath = compose(getImgSrc, getTarget),
    addClickHover = curry2(ptL(lazyVal, 'addEventListener', 'mouseover'))(hover).wrap(pass),
    setId = curry2(setAttribute('id')),
    setLink = curry2(setAttribute('href')),
    setSrc = curry2(setAttribute('src')),
    setAlt = curry2(setAttribute('alt')),
    setVal = curry2(setAttribute('value')),
    setMin = curry2(setAttribute('min')),
    setMax = curry2(setAttribute('max')),
    setType = curry2(setAttribute('type')),
    setNavId = curry2(setAttribute('id'))('navigation').wrap(pass),
    setHref = setLink('.').wrap(pass),
    addKlas = ptL(invokeMethodBridge, 'add'),
    remKlas = ptL(invokeMethodBridge, 'remove'),
    doActive = compose(addKlas('active'), getClassList).wrap(pass),
    undoActive = compose(remKlas('active'), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getResult))('forEach'),
    undoActiveCB = doEach(undoActive),
    getZero = curry2(getter)(0),
    getLength = curry2(getter)('length'),
    getKey = compose(getZero, curryL3(invokeMethod)(window.Object)('keys')),
    getKeys = compose(doTextNow, getKey),
    
    doTest = function (x) {
        console.log(x);
        return x;
    },
    
    incrementer = compose(doInc, getLength);