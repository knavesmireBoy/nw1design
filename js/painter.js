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

   function painter (slide, base, $recur) {
        const getHeight = curry2(meta.getter)("naturalHeight"),
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
          deferCurrent = deferPTL(invokeMethod, nW1.Looper, "get", "value"),
          reducer = curry3(invokeMethod)(meta.negator(equals))("reduce"),
          queryHeight = function () {
            let bool = reducer(testProp("base", "slide", getHeight));
            postQueryHeight(bool, base, slide);
            return bool;
          },
          doload = compose($recur.setPlayer.bind($recur), queryHeight);
        let ret = {
          updateOpacity: function (o) {
            let el = getResult(slide);
            if (!el.onload) {
              show(el);
            }
            setOpacity(el, o);
          },
          updatePath: function (data, type) {
            if (data) {
              let el = type === "slide" ? getResult(slide) : getResult(base);
              setSrc(getResult(data))(el);
            }
          },
          update: (flag) => {
            //flag from $recur
            $recur.notify(deferCurrent, "slide");
            slide.onload = (e) => {
              if (flag) {
                $recur.notify(deferForward, "base");
                onInplay();
              } else {
                $recur.notify(utils.getImgPath(e), "swap");
              }
            };
            base.onload = doload;
          },
          cleanup: function () {
            queryInplay("remove");
            displayPause("remove");
            show(base);
            hide(slide);
            resetMargin(slide);
            base.onload = null;
            slide.onload = null;
          }
        };
        return nW1.Publish().makepublisher(ret);
      };

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
  };

  nW1.painter = painter;

  }());