/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */

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

const meta = nW1.meta,
  utils = nW1.utils,
  isFunction = meta.tagTester("Function"),
  getResult = function (arg) {
    if (isFunction(arg)) {
      return arg();
    }
    return arg;
  },
  pass = meta.pass,
  remove = function () {
    const tgt = this.parentNode;
    tgt.parentNode.removeChild(tgt);
  },
  ptL = meta.doPartial(),
  //getResult = ptL(meta.best, isFunction, [x => x(), x => x]),
  lightbox = document.querySelector(".lightbox"),
  compose = meta.compose,
  getter = meta.getter,
  curry2 = meta.curryRight(2),
  invokeMethod = meta.invokeMethod,
  invokeMethodBridge = meta.invokeMethodBridge,
  prepend = utils.prepend,
  append = utils.append,
  getParent = utils.getParent,
  doMakeDefer = utils.doMakeDefer,
  doMake = utils.doMake,
  doText = ptL(invokeMethod, document, "createTextNode"),
  invoke = (f, v) => f(v),
  lazyInvoke = (m, p, o, v) => o[m](p, v),
  getClassList = curry2(getter)("classList"),
  getAttribute = ptL(invokeMethodBridge, "getAttribute"),
  getParentAttribute = ptL(meta.invokeMethodBridgeCB(getParent), "getAttribute"),
  setAttribute = ptL(lazyInvoke, "setAttribute"),
  addListener = curry2(ptL(lazyInvoke, "addEventListener", "click"))(remove),
  setSrc = curry2(setAttribute("src")),
  setAlt = curry2(setAttribute("alt")),
  doOverlay = ptL(invokeMethodBridge, "add", "overlay"),
  doDiv = doMakeDefer("div"),
  doImg = doMakeDefer("img"),
  doClose = append(doText("CLOSE")),
  doRender = prepend(document.body),
  /*puzzled as to why figure was being created with an extra image on every click; the argument
  to prepend was an element and was being extended on every call, it requires a fresh instance per click*/
  //doFig = prepend(doMake('figure')),
  doFig = prepend(doMakeDefer("figure")),
  doCap = append(doMake("figcaption")),
  //doTest = ptL(invokeMethod, console, 'log'),
  makeDiv = compose(doRender, doDiv),
  getAttrs = ptL((m, fns, o) => fns[m]((f) => f(getResult(o))), "map", [
    getParentAttribute("href"),
    getAttribute("alt")
  ]),
  zip = (m, funs, vals) => vals[m]((v, i) => funs[i](v)),
  setAttrs = ptL(zip, "map", [setSrc, setAlt]),
  enhance = compose(doOverlay, getClassList).wrap(pass),
  step = compose(enhance, getParent, curry2(append)(makeDiv)),
  fig = compose(
    addListener.wrap(pass),
    getParent,
    getParent,
    doClose,
    doCap,
    getParent,
    doFig
  ),
  cb = (m, fns) => (o) => {
    let ob = getResult(o);
    fns[m]((f) => f(ob));
    return ob;
  },
  doBuild = compose(
    step,
    fig,
    curry2(invoke)(doImg),
    ptL(cb, "forEach"),
    setAttrs,
    getAttrs
  );
lightbox.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  let el = e.target.src ? e.target : utils.getTargetNode(e.target, /img/i);
  el && doBuild(el);
});
