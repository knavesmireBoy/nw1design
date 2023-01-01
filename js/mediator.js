/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function () {
  "use strict";

  nW1.Mediator = class {
    constructor(looper, painter, player) {
      this.looper = looper;
      this.painter = painter;
      this.player = player;
    }
    next(type) {
      this.painter(this.looper.forward(), type);
    }
    update(flag, type) {
      console.log(flag, type);
      //this.painter.updatePath(this.looper.get(), type);
    }
    static from(...args) {
      return new this(...args);
    }
  };
}());
