/*jslint nomen: true */
/*global Modernizr: false */
/*global Publisher: false */
/*global Header: false */
/*global nW1: false */
/* eslint-disable indent */

(function (Mod) {
  "use strict";
  let $wrapper = Publisher.from(),
    headers = {},
    m = nW1.meta.mittelFactory(),
    f = m(nW1.meta.setter, "classList"),
    prepClassListNav = nW1.meta.pApply(f, nW1.meta.$$("navigation"));

  function makePortrait(el = nW1.meta.$("wrapper")) {
    let kls = this.naturalHeight > this.naturalWidth ? "portrait" : "";
    $wrapper.notify(kls);
    //https://stackoverflow.com/questions/49241330/javascript-domtokenlist-prototype
    if (el === nW1.meta.$("wrapper")) {
      el.classList = kls;
    }
  }

  function router($player) {
    let player = null;
    const playMaker = function () {
        const func = meta.doAlternate(),
          displayPause = ptL(
            meta.invokeMethodV,
            $$("slideshow"),
            "classList",
            "pause"
          ),
          exec = compose(
            displayPause,
            always("remove"),
            $player.play.bind($player, true)
          ),
          undo = compose(
            displayPause,
            always("add"),
            $player.suspend.bind($player, null)
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
          which = curry2(ptL(invokeMethodBridge, "match"))(found),
          i = [/^start$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
        player = player || playMaker();
        if (found.match(/^p/i)) {
          nW1.Looper.setStrategy(true);
          player();
        } else {
          player = null;
          nW1.Looper.setStrategy();
          $player.suspend();
          if (routines[i]) {
            routines[i]();
          }
        }
      },
      sidebar: function (e) {
        e.preventDefault();
        let img = utils.getImgPath(e),
          visit = false;
        toArray($Q(".active", true)).forEach((el) =>
          el.classList.remove("active")
        );
        if (utils.matchLink(e)) {
          headers.show(utils.getTarget(e), true);
          visit = true;
        }
        if (img) {
          visit = true;
          nW1.Looper.find(img);
          utils.doActive(utils.getTargetNode(e.target, /li/i, "parentNode"));
          makePortrait.call(e.target);
        }
        if (visit) {
          player = null;
          $player.suspend();
        }
      }
    };
  } //router

  const meta = nW1.meta,
    utils = nW1.utils,
    $$ = meta.$$,
    $Q = meta.$Q,
    $$Q = meta.$$Q,
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    curryL2 = meta.curryLeft(2),
    always = meta.always,
    invokeMethodBridge = meta.invokeMethodBridge,
    ptL = meta.doPartial(),
    deferPTL = meta.doPartial(true),
    toArray = meta.toArray,
    negate = meta.negate,
    headings = compose(
      curry2(toArray)(curryL2(negate)(utils.matchPath)),
      $$Q("#navigation a", true)
    );

  headers = Header.from(headings());
  $wrapper.attach(prepClassListNav);

  nW1.router = router;
}(Modernizr));
