/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */

(function () {
  "use strict";

  function getResult(o) {
    if (typeof o === "function") {
      return o();
    }
    return o;
  }

  const meta = nW1.meta,
    utils = nW1.utils,
    $ = meta.$,
    $$ = meta.$$,
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    curry22 = meta.curryRight(2, true),
    curry3 = meta.curryRight(3),
    always = meta.always,
    invoke = meta.invoke,
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
    setDisplay = setProperty("display"),
    setOpacity = setProperty("opacity"),
    hide = compose(curry2(setDisplay)("none")),
    show = compose(curry2(setDisplay)("block")),
    displayPause = ptL(
      meta.invokeMethodV,
      $$("slideshow"),
      "classList",
      "pause"
    ),
    bodyKlas = curry2(ptL(invokeMethod, document.body.classList)),
    queryInplay = bodyKlas("inplay"),
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
    displayInplay = ptL(invokeMethod, document.body.classList, "add"),
    onInplay = curry22(invoke)("inplay")(displayInplay),
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
  nW1.Painter = class {
    constructor(slide, base, $recur) {
      this.slide = getResult(slide);
      this.base = getResult(base);
      this.recur = $recur;
    }
    updateOpacity(o) {
      if (!this.slide.onload) {
        show(this.slide);
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
          onInplay();
        } else {
          that.updatePath(utils.getImgPath(e), "swap");
        }
      };
      this.base.onload = () => {
        let bool = queryHeight(that.base, that.slide);
        that.recur.setPlayer(bool);
      };
    }
    cleanup() {
      queryInplay("remove");
      displayPause("remove");
      show(this.base);
      hide(this.slide);
      resetMargin(this.slide);
      this.base.onload = null;
      this.slide.onload = null;
    }
    static from(...args) {
      return new nW1.Painter(...args);
    }
  };
}());
