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
  pass = (ptl, o, b) => {
    ptl(o);
    return getResult(o);
  },
  remove = function () {
    const tgt = this.parentNode;
    tgt.parentNode.removeChild(tgt);
  },
  deferPTL = meta.doPartial(true),
  ptL = meta.doPartial(),
  //con = (v) => console.log(v),
  compose = meta.compose,
  getter = meta.getter,
  curry2 = meta.curryRight(2),
  lightbox = document.querySelector(".lightbox"),
  invoke = (f, v) => f(v),
  invokeMethod = meta.invokeMethod,
  lazyInvoke2 = (m, p, o, v) => o[m](p, v),
  invokeMethodBridge = (m, v, o) => {
    return invokeMethod(getResult(o), m, v);
  },
  invokeMethodBridgeCB = (cb) => (m, v, o) => {
    return invokeMethod(cb(o), m, v);
  },
  getParent = utils.getParent,
  doMake = deferPTL(invokeMethod, document, "createElement"),
  doText = ptL(invokeMethod, document, "createTextNode"),
  doMakeNow = ptL(invokeMethod, document, "createElement"),
  getClassList = curry2(getter)("classList"),
  getAttribute = ptL(invokeMethodBridge, "getAttribute"),
  getParentAttribute = ptL(invokeMethodBridgeCB(getParent), "getAttribute"),
  setAttribute = ptL(lazyInvoke2, "setAttribute"),
  addListener = curry2(ptL(lazyInvoke2, "addEventListener", "click"))(remove),
  setSrc = curry2(setAttribute("src")),
  setAlt = curry2(setAttribute("alt")),
  doOverlay = ptL(invokeMethodBridge, "add", "overlay"),
  doDiv = doMake("div"),
  doImg = doMake("img"),
  prepend = curry2(ptL(invokeMethodBridge, "appendChild")),
  append = ptL(invokeMethodBridge, "appendChild"),
  doClose = append(doText("CLOSE")),
  doRender = prepend(document.body),
  /*puzzled as to why figure was being created with an extra image on every click; the argument
  to prepend was an element and was being extended on every call, it requires a fresh instance per click*/
  //doFig = prepend(doMakeNow('figure')),
  doFig = prepend(doMake("figure")),
  doCap = append(doMakeNow("figcaption")),
  //doTest = ptL(invokeMethod, console, 'log'),
  makeDiv = compose(doRender, doDiv),
  git = ptL((m, fns, o) => fns[m]((f) => f(getResult(o))), "map", [
    getParentAttribute("href"),
    getAttribute("alt")
  ]),
  zip = (m, funs, vals) => vals[m]((v, i) => funs[i](v)),
  sit = ptL(zip, "map", [setSrc, setAlt]),
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
  doGit = compose(
    step,
    fig,
    curry2(invoke)(doImg),
    ptL(cb, "forEach"),
    sit,
    git
  );
lightbox.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  let el = e.target.src ? e.target : utils.getTargetNode(e.target, /img/i);
  el && doGit(el);
});
