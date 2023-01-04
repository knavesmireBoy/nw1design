/*jslint nomen: true */
/*global Publisher: false */
/* eslint-disable indent */

function getResult(o) {
    if (typeof o === "function") {
      return o();
    }
    return o;
  }

class Slider extends Publisher {
        constructor() {
            super();
    }
    init(el) {
      this.el = getResult(el);
      const that = this;
       this.el.oninput = function () {
         that.notify(this.value, true);
   };
    }
}