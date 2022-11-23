/*jslint nomen: true */
/* eslint-disable indent */
/*global Modernizr: false */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function (Mod, brk) {
    "use strict";

      //https://webdesign.tutsplus.com/tutorials/javascript-debounce-and-throttle--cms-36783
  //initialize throttlePause variable outside throttle function
  function throttle(callback, time) {
    //don't run the function if throttlePause is true
    if (throttlePause) {
      return;
    }
    //set throttlePause to true after the if condition. This allows the function to be run once
    throttlePause = true;
    //setTimeout runs the callback within the specified time
    setTimeout(() => {
      callback();
      //throttlePause is set to false once the function has been called, allowing the throttle function to loop
      throttlePause = false;
    }, time);
  }

  function remove(el){
    let elem = utils.getRes(el);
    if(elem){
       elem.parentNode.removeChild(elem);
       meta.$('innerwrap').classList = "";
    }
  }

let meta = nW1.meta,
  utils = nW1.utils,
  throttlePause,
  pApply = meta.pApply,
  defer = meta.doPartial(true),
  getDesktop = pApply(Modernizr.mq, brk),
  pass = meta.pass,
  compose = meta.compose,
  curry4 = meta.curryRight(4),
  ptl = meta.doPartial(1),
  setAttrs = curry4(meta.invokePair),
  setId = setAttrs("circle")("id")("setAttribute"),
  setHref = setAttrs(".")("href")("setAttribute"),
  setAside = setAttrs("link to secondary content")("title")("setAttribute"),
  setMain = setAttrs("link to main content")("title")("setAttribute"),
  setAlt = setAttrs("")("alt")("setAttribute"),
  setSrc = setAttrs("./assets/img/misc/circle.png")("src")("setAttribute"),
  doAlt = meta.doAlternate(),
  anc = meta.$Q("main > section"),
  [img, link] = ["img", "a"].map((el) => document.createElement(el)),
  doRemove = compose(remove, meta.$$("circle")),
  outbound = utils.prepend(meta.$Q("main > aside")),
  inbound = utils.prepend(anc),
  func = ptl(meta.setterBridge(), meta.$("innerwrap"), "classList"),
  exec = compose(setMain, meta.$$('circle'), func("alt"), outbound),
  undo = compose(setAside, meta.$$('circle'), func(""), inbound),
  doAltCircle = meta.doAlternate(),
  cb = doAltCircle([exec, undo]),
  invokePairDefer = (o, m, k, v) => {
    return utils.getRes(o)[m](k, utils.getRes(v));
  },
  callback2 = function () {
    let f = doAltCircle([exec, undo]);
    return function(e) {
        e.preventDefault();
        f(this);
    };
},
  callback = function (e) {
    e.preventDefault();
    cb(this);
},

listen = curry4(meta.invokePair)(callback)('click')('addEventListener'),
  splat = compose(
    utils.getParent,
    setSrc.wrap(pass),
    setAlt.wrap(pass),
    utils.append(img),
    listen.wrap(pass),
    setAside.wrap(pass),
    setHref.wrap(pass),
    setId.wrap(pass),
    utils.append(link)
  ),
  doMakeSplat = pApply(splat, anc),
  isDesktop = function (alternators) {
    if (!getDesktop()) {
        alternators.forEach((f) => f());
      getDesktop = pApply(meta.negate, getDesktop);
    }
  },
  loaderActions = doAlt([doMakeSplat, doRemove]);
  window.addEventListener('load', function() {
    getDesktop = Mod.mq(brk) ? getDesktop : pApply(meta.negate, getDesktop);
    if(!Mod.mq(brk)) {
        loaderActions();
    }
    });
    window.addEventListener(
        "resize",
       pApply(throttle, compose(pApply(isDesktop, [loaderActions])), 222)
      );

}(Modernizr, "(min-width: 900px)"));