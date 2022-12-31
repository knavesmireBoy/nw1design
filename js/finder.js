/*jslint nomen: true */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */

if (!window.nW1) {
  window.nW1 = {};
}

const curry3 = nW1.meta.curryRight(3),
  getLinks = (grp) => {
    const get = curry3(nW1.utils.getTargetNode)("firstChild")(/^a$/i);
    return grp.map((lis) => nW1.meta.compose(nW1.utils.getAttrs("href"), get)(lis));
  },
  getLinksDeep = (grp) => {
    const ul = grp.map(curry3(nW1.utils.getTargetNode)("nextSibling")(/ul/i)),
      lis = ul.map(({ children }) => nW1.meta.toArray(children));
    return lis.map(getLinks);
  };

class Finder extends Publisher {
    constructor(grp = [], kls = "active", h = []) {
      super(h);
      this.grp = grp;
      this.current = null;
      this.finder = () => null;
    }
    hide(el, click) {
      if (el && el === this.current && click) {
        this.current = null;
        return nW1.utils.undoActive(el);
      }
    }
    show(el, click) {
      if (el && !this.hide(el, click)) {
        nW1.utils.undoActiveCB(this.grp);
        this.current = nW1.utils.doActive(el);
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
        let res = str.match(/\/(\w+)_/.exec(cur)[1]);
        //becomes this.finder callback to findIndex
        return res;
      };
    }
    //becomes this.finder callback to findIndex
    static doFinder2(str) {
      return function (cur) {
        let reg1 = /\/(\w+\d)_/,
          reg2 = /\/(\w+\d\d)_/,
          res;
        try {
          res = reg2.exec(cur)[1];
          return res && str.match(res);
        } catch (e) {
          res = reg1.exec(cur)[1];
          return str.match(res);
        }
      };
    }
  };


class Header extends Finder {
  search() {
    const links = getLinksDeep(nW1.meta.toArray(this.grp)),
      i = links
        .map((strs) => strs.findIndex(this.finder))
        .findIndex((n) => n >= 0);
    return nW1.meta.compose(this.notify.bind(this), this.show.bind(this))(this.grp[i]);
  }
  static from(grp, kls = "active") {
    return new Header(grp, kls);
  }
}

class Thumbs extends Finder {
  search() {
    const paths = getLinks(nW1.meta.toArray(this.grp)),
    [first, second] = paths.filter(this.finder),
    hi = paths.findIndex((cur) => cur === second),
    lo = paths.findIndex((cur) => cur === first);
  //img1.jpg would match the condition before img10.jpg, so use the second if > -1, ie exists;
  return this.show(this.grp[Math.max(hi, lo)]);
  }
  static from(grp, kls = "active") {
    return new Thumbs(grp, kls);
  }
}