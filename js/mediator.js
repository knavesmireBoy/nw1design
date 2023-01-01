/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function () {
  "use strict";

  const meta = nW1.meta,
  ptL = meta.doPartial(),
  curry22 = meta.curryRight(2, true),
  invoke = meta.invoke,
  invokeMethod = meta.invokeMethod,
  displayInplay = ptL(invokeMethod, document.body.classList, "add"),
  onInplay = curry22(invoke)("inplay")(displayInplay);

  nW1.Mediator = class {
    constructor(looper, painter, player) {
      this.looper = looper;
      this.painter = painter;
      this.player = player;
    }
    next(data, type) {
      this.painter.updatePath(this.looper.forward().value, type);
    }
    update(flag, type) {
      if(flag){
       // onInplay();
      }
     this.painter.updatePath(this.looper.get(), "slide");
    }
    static from(...args) {
      return new nW1.Mediator(...args);
    }
  };
}());
