/*jslint nomen: true */
/*global Modernizr: false */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */

(function (config, Mod, ipad) {
    "use strict";
    function getResult(o) {
      if (typeof o === "function") {
        return o();
      }
      return o;
    }

    const utils = nW1.utils,
    ops = nW1.ops,
    broadcaster = Publisher.from(),
    looper = nW1.Looper,
    compose = utils.compose,
    curry2 = utils.curryRight(2),
    curryL2 = utils.curryLeft(2),
    curry3 = utils.curryRight(3),
    curryL3 = utils.curryLeft(3),
    curryL33 = utils.curryLeft(3, true),
    invoke = utils.invoke,
    invokeMethod = utils.invokeMethod,
    invokeMethodBridge = utils.invokeMethodBridge,
    ptL = utils.doPartial(),
    deferPTL = utils.doPartial(true),
    doMake = ops.doMake,
    append = ops.append,
    prepend = ops.prepend,
    getParent = ops.getParent,
    doH2 = compose(
        curry2(invoke)(document.body),
        append,
        getParent,
        prepend(doMake("h2")),
        ops.doText("Navigation")
    )();

}());


