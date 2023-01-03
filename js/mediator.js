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
  best = (coll, fun) => () => coll.reduce((a, b) => fun(a, b) ? a : b ),
  invoke = (f) => f(),
  invokeMethod = meta.invokeMethod,
  displayInplay = ptL(invokeMethod, document.body.classList, "add"),
  noOp = () => undefined,
  onInplay = curry22(meta.invoke)("inplay")(displayInplay),
  defer = best([noOp, onInplay], meta.$$Q('.inplay')),
  doInPlay = meta.compose(invoke, defer);

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
