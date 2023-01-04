/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function () {
  "use strict";

  const meta = nW1.meta,
    ptL = meta.doPartial(),
    curry2 = meta.curryRight(2),
    curry22 = meta.curryRight(2, true),
    compose = meta.compose,
    best = (coll, fun) => () => coll.reduce((a, b) => (fun(a, b) ? a : b)),
    invoke = (f) => f(),
    invokeMethod = meta.invokeMethod,
    setter = meta.setter,
    doSliderOutput = ptL(setter, meta.$$("tracked"), "innerHTML"),
    doSliderInput = ptL(setter, meta.$$("myrange"), "value"),
    doSliders = (i) => {
      doSliderInput(i);
      doSliderOutput(i + 1);
    },
    getCurrentIndex = (path) => {
      let mypath = meta.getResult(path),
        members = nW1.Looper.get("members"),
        i = members.findIndex(curry2((a, b) => a === b)(mypath)),
        l = members.length - 1,
        member = members[i],
        //reached end
        j = !member ? 0 : i;
      //looper members zero indexed...
      /*also as it stands looper reverses the array when the back button is pressed
     before counting forwards. may have to fix that but at the moment this undoes that */
      return nW1.Looper.get("rev") ? l - i : j;
    },
    slider = compose(doSliders, getCurrentIndex),
    slidermatch = function (path) {
      const mypath = meta.getResult(path),
        txt = nW1.utils.getLast(meta.$("slide").src.split("/"));
      if (mypath.match(txt)) {
        slider(mypath);
      }
    },
    strategies = [slider, slidermatch],
    displayInplay = ptL(invokeMethod, document.body.classList),
    exec = displayInplay("add"),
    undo = displayInplay("remove"),
    onEnter = curry22(meta.invoke)("inplay")(exec),
    onExit = curry22(meta.invoke)("inplay")(undo),
    noOp = () => undefined,
    defer = best([noOp, onEnter], meta.$$Q(".inplay")),
    setPlayStatus = meta.compose(invoke, defer);

  nW1.Mediator = class {
    constructor(looper, painter, player) {
      this.painter = painter;
      this.player = player;
      this.looper = looper;
      this.run = null;
    }
    next(data, type) {
      this.painter.updatePath(this.looper.forward().value, type);
    }
    update(flag, type) {
      setPlayStatus();
      this.painter.updatePath(this.looper.get(), "slide");
      this.painter.update(flag, type);
    }
    exit() {
      onExit();
      strategies.reverse();
      this.run = null;
    }
    advance(data) {
      strategies[0](data);
    }
    init(data, type) {
      //ensure this runs once!
      this.run = this.run || strategies.reverse();
    }
    static from(...args) {
      return new nW1.Mediator(...args);
    }
  };
}());
