/*jslint nomen: true */
/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

(function( window ) {
  'use strict';
  let lastTime = 0,
      prefixes = 'webkit moz ms o'.split(' '),
      requestAnimationFrame = window.requestAnimationFrame,//get unprefixed rAF and cAF, if present
      cancelAnimationFrame = window.cancelAnimationFrame,
      prefix,
      i;
  // loop through vendor prefixes and get prefixed rAF and cAF
  for( i = 0; i < prefixes.length; i++ ) {
    if ( requestAnimationFrame && cancelAnimationFrame ) {
      break;
    }
    prefix = prefixes[i];
    requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
    cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
                              window[ prefix + 'CancelRequestAnimationFrame' ];
  }

  // fallback to setTimeout and clearTimeout if either request/cancel is not supported
  if ( !requestAnimationFrame || !cancelAnimationFrame ) {
      requestAnimationFrame = function( callback, element ) {
      let currTime = new Date().getTime(),
          timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) ),
          id = window.setTimeout( function() {
        callback( currTime + timeToCall );
      }, timeToCall );
      lastTime = currTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function( id ) {
      window.clearTimeout( id );
    };
  }
  // put in global namespace
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
}( window ));


function getNextElement(node, type = 1) {
  if (node && node.nodeType === type) {
    return node;
  }
  if (node && node.nextSibling) {
    return getNextElement(node.nextSibling);
  }
  return null;
}


function getPrevElement(node, type = 1) {
  if (node && node.nodeType === type) {
    return node;
  }
  if (node && node.previousSibling) {
    return getPrevElement(node.previousSibling);
  }
  return null;
}

function getTargetNode(node, reg, dir = "firstChild") {
  if (!node) {
    return null;
  }
  let mynode = node.nodeType === 1 ? node : getNextElement(node),
  res = mynode && mynode.nodeName.match(reg);
  if (!res) {
    mynode = mynode && getNextElement(mynode[dir]);
    return mynode && getTargetNode(mynode, reg, dir);
  }
  return mynode;
}

nW1.utils = (function () {
  const meta = nW1.meta,
    tagTester = meta.tagTester,
    isFunction = tagTester("Function"),
    getRes = function (arg) {
      if (isFunction(arg)) {
        return arg();
      }
      return arg;
    },
    invokeMethod = meta.invokeMethod,
    invokeMethodBridge = meta.invokeMethodBridge,
    invokeMethodBridgeCB = meta.invokeMethodBridgeCB,
    ptL = meta.doPartial(),
    compose = meta.compose,
    pass = meta.pass,
    getter = (o, p) => getRes(o)[p],
    curry2 = meta.curryRight(2),
    curry3 = meta.curryRight(3),
    curryL3 = meta.curryLeft(3),
    curryL33 = meta.curryLeft(3, true),
    getTarget = curry2(getter)("target"),
    getParent = curry2(getter)("parentNode"),
    getClassList = curry2(getter)("classList"),
    doTextNow = ptL(invokeMethod, document, "createTextNode"),
    setAttribute = ptL(meta.lazyVal, "setAttribute"),
    setLink = curry2(setAttribute("href")),
    getImgSrc = curryL3(invokeMethodBridge)("getAttribute")("src"),
    addKlas = ptL(invokeMethodBridge, "add"),
    remKlas = ptL(invokeMethodBridge, "remove"),
    undoActive = compose(remKlas("active"), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getRes))("forEach"),
    getZero = curry2(getter)('0'),
    getLength = curry2(getter)("length"),
    getKey = compose(getZero, curryL3(invokeMethod)(window.Object)("keys")),
    modulo = (n, i) => i % n,
    increment = (i) => i + 1,
    doInc = (n) => compose(ptL(modulo, n), increment);

  return {
    getNextElement: getNextElement,
    getPrevElement: getPrevElement,
    getTargetNode: getTargetNode,
    getTarget: getTarget,
    getRes: getRes,
    getParent: getParent,
    getParent2: compose(getParent, getParent),
    getText: curry2(getter)("innerHTML"),
    doMakeDefer: curryL33(invokeMethod)(document)("createElement"),
    doMake: curryL3(invokeMethod)(document)("createElement"),
    //doText: deferPTL(invokeMethod, document, "createTextNode"),
    doText: curryL33(invokeMethod)(document)("createTextNode"),
    doTextCBNow: curryL3(invokeMethod)(document)("createTextNode"),
    prepend: curry2(ptL(invokeMethodBridgeCB(getRes), "appendChild")),
    append: ptL(invokeMethodBridgeCB(getRes), "appendChild"),
    appendAlt: ptL(meta.mittelFactory()(invokeMethod, "appendChild")),
    appendCB: curryL3(invokeMethodBridgeCB(getRes))("appendChild"),
    getAttrs: curryL3(invokeMethodBridge)("getAttribute"),
    matchLink: compose(
      curry3(invokeMethod)(/^a$/i)("match"),
      curry2(getter)("nodeName"),
      getTarget
    ),
    matchPath: compose(
      curry3(invokeMethod)(/jpe?g/i)("match"),
      curryL3(invokeMethodBridge)("getAttribute")("href")
    ),
    getImgPath: compose(getImgSrc, getTarget),
    setId: curry2(setAttribute("id")),
    setKlas: curry2(setAttribute("class")),
    setSrc: curry2(setAttribute("src")),
    setAlt: curry2(setAttribute("alt")),
    setVal: curry2(setAttribute("value")),
    setMin: curry2(setAttribute("min")),
    setMax: curry2(setAttribute("max")),
    setType: curry2(setAttribute("type")),
    setInnerHTML: meta.mittelFactory()(meta.setter, 'innerHTML'),
    clearInnerHTML: curry3(meta.setter)("")("innerHTML"),
    setNavId: curry2(setAttribute("id"))("navigation").wrap(pass),
    setHref: setLink(".").wrap(pass),
    doActive: compose(addKlas("active"), getClassList).wrap(pass),
    undoActive: undoActive,
    undoActiveCB: doEach(undoActive),
    getKeys: compose(doTextNow, getKey),
    doTextNow: doTextNow,
    getLast: (array) => array[array.length - 1],
    getZero: getZero,
    incrementer: compose(doInc, getLength),
    applyPortrait: curry3((m, o, v) => o.classList[m](v))('portrait'),
    insertNeu: (el, after) => {
      let p = el.parentNode,
      get = getNextElement,
      first = get(p.firstChild),
      node = after ? get(first.nextSibling) : first;
      return p.insertBefore(el, node);
    },
    doTest: function (x) {
      console.log(x);
      return x;
    },
    log: (v) => console.log(v)
  };

}());