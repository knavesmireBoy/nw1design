/*jslint nomen: true */
/* eslint-disable indent */
/*global Modernizr: false */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function (Mod, brk, path) {
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

  function exitMobile(el) {
    if (el) {
      meta.$("innerwrap").classList = "";
      el.parentNode.removeChild(el);
      //needs to be created on exit before loading again
      //don't forget the first call to doAlternate, creates the predicate
      //which alternates returning true/false so failure to supply a fresh predicate on entry
      //will throw things outta sync
      //STATE PATTERN
      cb = meta.doAlternate()([exec, undo]);
    }
  }

  const meta = nW1.meta,
    utils = nW1.utils,
    pApply = meta.pApply;
  let getDesktop = pApply(Modernizr.mq, brk),
    throttlePause,
    cb = null;
  const pass = meta.pass,
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    curry4 = meta.curryRight(4),
    defer = meta.doPartial(1),
    isDesktop = function (alternators) {
      if (!getDesktop()) {
        alternators.forEach((f) => {
          return f();
        });
        getDesktop = pApply(meta.negate, getDesktop);
      }
    },
    preMethod = meta.mittelFactory(),
    mypath = meta.$("home") ? "./" : "../",
    setAttr = meta.pApply(preMethod, meta.invokePair, 'setAttribute'),
    setId = curry2(setAttr('id'))('circle'),
    setHref = curry2(setAttr('href'))('.'),
    setAlt = curry2(setAttr('alt'))('icon'),
    setSrc = curry2(setAttr('src'))(mypath + path),
    setAside = curry2(setAttr('title'))("link to secondary content"),
    setMain = curry2(setAttr('title'))("link to main content"),
    doAlt = meta.doAlternate(),
    anc = meta.$Q("main > section"),
    //link was(is) a reference to an element that had an event listener attached
    //so despite removing the element on resize it remained in memory.
    //SO make sure the element is created on the fly: utils.doMakeDefer('a'), keep forgetting this
    [img, link] = ["img", "a"].map((el) => document.createElement(el)),
    doExitMobile = compose(exitMobile, meta.$$("circle")),
    outbound = utils.prepend(meta.$Q("main > aside")),
    inbound = utils.prepend(anc),
    func = defer(meta.setterBridge(), meta.$("innerwrap"), "classList"),
    exec = compose(setMain, meta.$$("circle"), func("alt"), outbound),
    undo = compose(setAside, meta.$$("circle"), func(""), inbound);

  window.addEventListener("load", function () {
    getDesktop = Mod.mq(brk) ? getDesktop : pApply(meta.negate, getDesktop);

    cb = meta.doAlternate()([exec, undo]);

    const callback = function (e) {
        e.preventDefault();
        cb(this);
      },
      listen = curry4(meta.invokePair)(callback)("click")("addEventListener"),
      sidebar = compose(
        utils.getParent,
        setSrc.wrap(pass),
        setAlt.wrap(pass),
        utils.append(img),
        listen.wrap(pass),
        setAside.wrap(pass),
        setHref.wrap(pass),
        setId.wrap(pass),
        utils.prepend(anc),
        //MUST be created on-the-fly, no reference
        utils.doMakeDefer("a")
      ),
      loaderActions = doAlt([pApply(sidebar), doExitMobile]);

    if (!Mod.mq(brk)) {
      loaderActions();
    }
    window.addEventListener(
      "resize",
      pApply(throttle, compose(pApply(isDesktop, [loaderActions])), 222)
    );
  });
}(Modernizr, "(min-width: 821px)", "assets/img/misc/circle.png"));
