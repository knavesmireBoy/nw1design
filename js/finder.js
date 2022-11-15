/*jslint nomen: true */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */


if (!window.nW1) {
    window.nW1 = {};
  }

  nW1.getFinder = () => {
    return class Finder extends Publisher {
        constructor(grp = [], kls = "active", h = []) {
          super(h);
          this.grp = grp;
          this.current = null;
          this.finder = () => null;
        }
        hide(el, click) {
          if (el && el === this.current && click) {
            this.current = null;
            return nW1.ops.undoActive(el);
          }
        }
        show(el, click) {
          if (el && !this.hide(el, click)) {
            nW1.ops.undoActiveCB(this.grp);
            this.current = nW1.ops.doActive(el);
          }
          return this.current;
        }
        setFinder(src) {
          this.finder = Finder.doFinder(src);
          return this.search();
        }
        search() {
          throw new Error("must be implemented in a subclass");
        }
        static from(grp, kls = "active") {
          return new Finder(grp, kls);
        }
        static doFinder(str) {
          return function (cur) {
            //becomes this.finder callback to findIndex
            return str.match(/\/(\w+)_/.exec(cur)[1]);
          };
        }
      };

  };