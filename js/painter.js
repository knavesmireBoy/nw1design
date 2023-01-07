/*jslint nomen: true */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */

(function () {
  "use strict";
  const meta = nW1.meta,
    utils = nW1.utils,
    $ = meta.$,
    $$ = meta.$$,
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    curry3 = meta.curryRight(3),
    getResult = meta.getResult,
    always = meta.always,
    invokeMethod = meta.invokeMethod,
    ptL = meta.doPartial(),
    deferPTL = meta.doPartial(true),
    setSrc = utils.setSrc,
    getById = (str) => $(str),
    equals = (a, b) => a === b,
    getStyle = curry2(meta.getter)("style"),
    setProperty = meta.pApply(
      meta.mittelFactory(getStyle),
      meta.invokePair,
      "setProperty"
    ),
    removeStyle = curry3(invokeMethod)('style')('removeAttribute'),
    setDisplay = setProperty("display"),
    setOpacity = setProperty("opacity"),
    setFloat = setProperty("float"),
    hide = compose(curry2(setDisplay)("none")),
    show = compose(curry2(setDisplay)("block")),
    doFloat = meta.pApply(invokeMethod, [$$('base'), $$('slide')], 'forEach', compose(curry2(setFloat)("left"))),
    undoStyle = meta.pApply(invokeMethod, [$$('base'), $$('slide')], 'forEach', removeStyle),
    displayPause = ptL(
      meta.invokeMethodV,
      $$("slideshow"),
      "classList",
      "pause"
    ),
    setMargin = setProperty("margin-left"),
    setInplayMargin = curry2(setMargin)("-100%"),
    resetMargin = curry2(setMargin)(0),
    postQueryHeight = (flag, base, slide) => {
      const swap = compose(resetMargin, always(slide), hide),
        unswap = compose(setInplayMargin, always(slide), show);
      meta.doBest([swap, unswap], always(flag), always(base))();
    },
    getHeight = curry2(meta.getter)("naturalHeight"),
    testProp = (a, b, getprop) =>
      [a, b]
        .map(getById)
        .map((item) => getResult(item))
        .map(getprop),
    deferForward = compose(
      curry2(meta.getter)("value"),
      deferPTL(invokeMethod, nW1.Looper, "forward", null)
    ),
    reducer = curry3(invokeMethod)(meta.negator(equals))("reduce"),
    queryHeight = function (base, slide) {
      let bool = reducer(testProp("base", "slide", getHeight));
      postQueryHeight(bool, base, slide);
      return bool;
    };

  nW1.Painter = class extends Publisher {
    constructor(slide, base) {
      super();
      this.slide = getResult(slide);
      this.base = getResult(base);
    }
    updateOpacity(o) {
      if (!this.slide.onload) {
        show(this.slide);
       doFloat();
        this.notify(null, "init");
      }
      setOpacity(this.slide, o);
    }
    updatePath(data, type) {
      if (data) {
        let el = type === "slide" ? this.slide : this.base;
        setSrc(getResult(data))(el);
      }
    }
    update(flag) {
      //flag from $recur
      const that = this;
      this.slide.onload = (e) => {
        if (flag) {
         that.updatePath(deferForward, "base");
        } else {
          //inform preview pic etc..
          that.notify(utils.getImgPath(e), "swap");
        }
      };
      this.base.onload = () => {
        that.notify(queryHeight(that.base, that.slide), "query");
      };
    }
    cleanup() {
      displayPause("remove");
      show(this.base);
      hide(this.slide);
      resetMargin(this.slide);
      this.base.onload = null;
      this.slide.onload = null;
      undoStyle();
      hide(meta.$("slide"));
    }
    static from(...args) {
      return new nW1.Painter(...args);
    }
  };
}());
