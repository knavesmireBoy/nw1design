/*jslint nomen: true */
/*global Modernizr: false */
/*global nW1: false */
/* eslint-disable indent */

if (!window.nW1) {
    window.nW1 = {};
  }
  window.nW1.router = function($recur) {
    let player = null;
    const meta = nW1.meta,
    utils = nW1.utils,
    ptL = meta.doPartial(),
    deferPTL = meta.doPartial(true),
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    Mod = Modernizr,
    playMaker = function () {
        const func = meta.doAlternate(),
          displayPause = ptL(
            meta.invokeMethodV,
            meta.$$("slideshow"),
            "classList",
            "pause"
          ),
          exec = compose(
            displayPause,
            meta.always("remove"),
            $recur.play.bind($recur, true)
          ),
          undo = compose(
            displayPause,
            meta.always("add"),
            $recur.suspend.bind($recur, null)
          );
        return func([exec, undo]);
      },
      loop = deferPTL(meta.invokeMethodBind, nW1.Looper),
      set = loop("set"),
      routines = [
        set(false),
        loop("back", null),
        loop("forward", null),
        set(true)
      ];
    return {
      menu: function (e) {
        e.preventDefault();
        const cb = Mod.backgroundsize ? utils.getAttrs("id") : utils.getText,
          found = compose(cb, utils.getTarget)(e),
          which = curry2(ptL(meta.invokeMethodBridge, "match"))(found),
          i = [/^start$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
        player = player || playMaker();
        if (found.match(/^p/i)) {
          nW1.Looper.setStrategy(true);
          player();
        } else {
          player = null;
          nW1.Looper.setStrategy();
          $recur.suspend();
          if (routines[i]) {
            routines[i]();
          }
        }
      },
      sidebar: function (e) {
        e.preventDefault();
        let img = utils.getImgPath(e),
          visit = false;
          meta.toArray(meta.$Q(".active", true)).forEach((el) =>
            el.classList.remove("active")
          );
        if (utils.matchLink(e)) {
          headers.show(utils.getTarget(e), true);
          visit = true;
        }
        if (img) {
          visit = true;
          nW1.Looper.find(img);
          utils.doActive(utils.getTargetNode(e.target, /li/i, 'parentNode'));
          makePortrait.call(e.target);
        }
        if (visit) {
          player = null;
          $recur.suspend();
        }
      }
    };
  }; //router