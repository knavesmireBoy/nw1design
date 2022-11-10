/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
//nW1.utils = (function() {
//"use strict";

function pApply (fn, ...cache) {
return (...args) => {
  const all = cache.concat(args);
  return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
}
function makePortrait(el) {
  if (this.naturalHeight && this.naturalHeight > this.naturalWidth) {
    el.classList.add("portrait");
    $("navigation").classList.add("portrait");
  } else if (this.naturalHeight && this.naturalHeight < this.naturalWidth) {
    el.classList.remove("portrait");
    $("navigation").classList.remove("portrait");
  }
}

function getNextElement(node, type = 1) {
	if (node && node.nodeType === type) {
		return node;
	}
	if (node && node.nextSibling) {
		return getNextElement(node.nextSibling);
	}
	return null;
}

function getTargetNode(node, reg, dir = 'firstChild') {
	if (!node) {
		return null;
	}
	node = node.nodeType === 1 ? node : getNextElement(node);
	let res = node && node.nodeName.match(reg);
	if (!res) {
		node = node && getNextElement(node[dir]);
		return node && getTargetNode(node, reg, dir);
	}
	return node;
}

nW1.ops = (function () {
  const utils = nW1.utils,
    $Q = utils.$q,
    tagTester = utils.tagTester,
    isFunction = tagTester("Function"),
    getRes = function (arg) {
      if (isFunction(arg)) {
        return arg();
      }
      return arg;
    },
    invokeMethod = utils.invokeMethod,
    invokeMethodBridge = utils.invokeMethodBridge,
    invokeMethodBridgeCB = utils.invokeMethodBridgeCB,
    deferPTL = utils.doPartial(true),
    ptL = utils.doPartial(),
    pass = (ptl, o) => {
      ptl(getRes(o));
      return o;
    },
    compose = utils.compose,
    getter = (o, p) => getRes(o)[p],
    setter = (o, k, v) => {
      let obj = getRes(o);
      obj[k] = v;
    },
    curry2 = utils.curryRight(2),
    curry3 = utils.curryRight(3),
    curryL3 = utils.curryLeft(3),
    curryL33 = utils.curryLeft(3, true),
    getTarget = curry2(getter)("target"),
    getParent = curry2(getter)("parentNode"),
    getClassList = curry2(getter)("classList"),
    doTextNow = ptL(invokeMethod, document, "createTextNode"),
    getAttribute = ptL(invokeMethodBridge, "getAttribute"),
    setAttribute = ptL(utils.lazyVal, "setAttribute"),
    setLink = curry2(setAttribute("href")),
    getImgSrc = curryL3(invokeMethodBridge)("getAttribute")("src"),
    addKlas = ptL(invokeMethodBridge, "add"),
    remKlas = ptL(invokeMethodBridge, "remove"),
    undoActive = compose(remKlas("active"), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getRes))("forEach"),
    getZero = curry2(getter)(0),
    getLength = curry2(getter)("length"),
    getKey = compose(getZero, curryL3(invokeMethod)(window.Object)("keys")),
    modulo = (n, i) => i % n,
    increment = (i) => i + 1,
    doInc = (n) => compose(ptL(modulo, n), increment),
    matchImg = compose(
      curry3(invokeMethod)(/^img/i)("match"),
      curry2(getter)("nodeName"),
      getTarget
    ),
    hover = (e) => {
      const preview = $Q("#slidepreview img");
      if (matchImg(e) && e.target !== preview) {
        replacePath(preview, getAttribute("src")(e.target));
        makePortrait.call(e.target, $("navigation"));
      }
    },
    replacePathSimple = (o, src) => {
      getRes(o).setAttribute(
        "src",
        src.replace("thumbs", "fullsize").replace("tmb", "fs")
      );
    },
    replacePath = (ob, src) => {
      let o = getRes(ob),
        binder = makePortrait.bind(o, $("wrapper"));
      //binder = () => {};
      o.removeEventListener("load", binder);
      if ($Q(".inplay")) {
        if (o.id === "base") {
          $("slide").addEventListener("load", binder);
        }
      } else {
        if (o.id === "base") {
          o.addEventListener("load", binder);
        }
      }
      replacePathSimple(o, src);
    };

  return {
    getNextElement: getNextElement,
	getTargetNode: getTargetNode,
	getRes: getRes,
	getParent2: compose(getParent, getParent),
    getText: curry2(getter)("innerHTML"),
    doGet: curry2(getter),
    doMake: curryL33(invokeMethod, document, "createElement"),
    //doText: deferPTL(invokeMethod, document, "createTextNode"),
    doText: curryL33(invokeMethod)(document)("createTextNode"),
    doTextCBNow: curryL3(invokeMethod)(document)("createTextNode"),
    prepend: curry2(ptL(invokeMethodBridgeCB(getRes), "appendChild")),
    append: ptL(invokeMethodBridgeCB(getRes), "appendChild"),
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
    addClickHover: curry2(ptL(utils.lazyVal, "addEventListener", "mouseover"))(
      hover
    ).wrap(pass),
    setter: setter,
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
    undoActiveCB: doEach(undoActive),
    getKeys: compose(doTextNow, getKey),
    doTest: function (x) {
      console.log(x);
      return x;
    },
    log: (v) => console.log(v),
    getLast: (array) => array[array.length - 1],
    incrementer: compose(doInc, getLength),
	pApply: pApply,
	replacePath: replacePath,
	replacePathSimple: replacePathSimple,
	pass: pass
  };
}());
