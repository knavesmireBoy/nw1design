/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

let $wrapper = {};

function makePortrait(el = nW1.utils.$('wrapper')) {

  if (this.naturalHeight && this.naturalHeight > this.naturalWidth) {
    el.classList.add("portrait");
    $wrapper.notify('portrait');
    //nW1.utils.$("navigation").classList.add("portrait");
  } else if (this.naturalHeight && this.naturalHeight < this.naturalWidth) {
    el.classList.remove("portrait");
    $wrapper.notify('');
    //nW1.utils.$("navigation").classList.remove("portrait");
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

function getTargetNode(node, reg, dir = "firstChild") {
  if (!node) {
    return null;
  }
  let mynode = node.nodeType === 1 ? node : getNextElement(node);
  let res = mynode && mynode.nodeName.match(reg);
  if (!res) {
    mynode = mynode && getNextElement(mynode[dir]);
    return mynode && getTargetNode(mynode, reg, dir);
  }
  return node;
}

nW1.ops = (function () {
  const utils = nW1.utils,
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
    ptL = utils.doPartial(),
    compose = utils.compose,
    pass = utils.pass,
    getter = (o, p) => getRes(o)[p],
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
    getZero = curry2(getter)('0'),
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
    replacePath = (o, src, el = utils.$('wrapper')) => {
      let obj = getRes(o),
      f = ptL(utils.invokePair, obj, 'setAttribute', 'src'),
      repl = obj.id === 'base' ? src : src.replace("thumbs", "fullsize").replace("tmb", "fs");
      f(repl);
      obj.onload = obj.onload || makePortrait.bind(obj, el);
    },
    hover = (e) => {
      const preview = utils.$Q("#slidepreview img");
      preview.onload = null;
      if(utils.$('slide').onload){
        return;
      }
      if (matchImg(e) && e.target !== preview) {
        replacePath(preview, getAttribute("src")(e.target), utils.$("navigation"));
      }
    },
    doPortrait = (m, o, v) => {
      return o.classList[m](v);
      },
      m = utils.mittelFactory(),
      f = m(utils.setter, 'classList'),
      //https://stackoverflow.com/questions/49241330/javascript-domtokenlist-prototype
      prepClassList = utils.pApply(f, utils.$$('navigation'));
      $wrapper = nW1.Publish().makepublisher(utils.$('wrapper'));
      $wrapper.attach(prepClassList);

  return {
    getNextElement: getNextElement,
    getTargetNode: getTargetNode,
    getTarget: getTarget,
    getRes: getRes,
    getParent: getParent,
    getParent2: compose(getParent, getParent),
    getText: curry2(getter)("innerHTML"),
    doMake: curryL33(invokeMethod)(document)("createElement"),
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
    setId: curry2(setAttribute("id")),
    setKlas: curry2(setAttribute("class")),
    setSrc: curry2(setAttribute("src")),
    setAlt: curry2(setAttribute("alt")),
    setVal: curry2(setAttribute("value")),
    setMin: curry2(setAttribute("min")),
    setMax: curry2(setAttribute("max")),
    setType: curry2(setAttribute("type")),
    clearInnerHTML: curry3(utils.setter)("")("innerHTML"),
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
    applyPortrait: curry3(doPortrait)('portrait'),
    replacePath: replacePath,
    makePortrait: makePortrait,
    doTest: function (x) {
      console.log(x);
      return x;
    },
    log: (v) => console.log(v)
  };

}());