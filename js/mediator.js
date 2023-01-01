/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
(function () {
  "use strict";

  nW1.Mediator = class {
    constructor(looper, painter) {
      this.looper = looper;
      this.painter = painter;
    }
    next(type) {
      this.painter(this.looper.forward(), type);
    }
    static from(...args) {
      return new this(...args);
    }
  };
}());
