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
  noOp = () => undefined,
  onInplay = curry22(invoke)("inplay")(displayInplay),
  doBuz = curry22(invoke)("buzz")(displayInplay),
  doInPlay = meta.best(meta.$$Q('.inplay'), [doBuz, onInplay]);
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
      doInPlay();
      this.painter.updatePath(this.looper.get(), 'slide');
      this.painter.update(flag, type);
    }
    static from(...args) {
      return new nW1.Mediator(...args);
    }
  };
}());
