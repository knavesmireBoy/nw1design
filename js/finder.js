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
        static doFinder1(str) {
          return function (cur) {
            let res = str.match(/\/(\w+)_/.exec(cur)[1]);
            //becomes this.finder callback to findIndex
            return res;
          };
        }

        static doFinder(str) {
          return function (cur) {
            let reg = /\/(\w+)_/,
            reg2 = /\/([a-z]+\d)_/,
            reg3 = /\/([a-z]+\d\d)_/;
            try {
              return str.match(reg3.exec(cur)[1]);
            }
            catch(e){
              return str.match(reg2.exec(cur)[1]);
            }
           return null;
            //becomes this.finder callback to findIndex
          };
        }
      };

  };