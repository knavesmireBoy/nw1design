/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}


const utils = nW1.utils,
  getTgt = (str) => utils.$(str),
  curry2 = utils.curryRight(2),
  curry22 = utils.curryRight(2, true),
  curry3 = utils.curryRight(3),
  compose = utils.compose,
  $$ = utils.$$,
  isFunction = utils.tagTester("Function"),
  ptL = utils.doPartial(),
  deferPTL = utils.doPartial(true),
  getRes = function (arg) {
    if (isFunction(arg)) {
      return arg();
    }
    return arg;
  },
  equals = (a, b) => a === b,
  getter = (o, p) => o[p],
  gtThan = (a, b) => a > b,
  setter = (o, k, v) => {
    getRes(o)[k] = v;
  },
  setterBridge = (k, o, v) => {
    setter(o, k, v);
    return getRes(o);
  },
  invoke = (f, v) => f(v),
  invokeMethod = utils.invokeMethod,
  isInplay = utils.$$Q(".inplay"),
  //getHeight = curry2(getter)('naturalHeight'),
  getHeight = (o) => {
    let h = o.naturalHeight;
    h = Math.floor(h / 10);
    return h * 10;
  },
  compare = (pred) => (p, a, b) => {
    return typeof p === "string"
      ? pred(a[p], b[p])
      : p
      ? pred(p[a], p[b])
      : pred(a, b);
  },
  eitherOr = (a, b, pred) => (pred ? a : b),
  testProp = (a, b, getprop) =>
    [a, b]
      .map(getTgt)
      .map((item) => getRes(item))
      .map(getprop),
  doPic = ptL(setterBridge, "src"),
  machPortrait = (m) => {
    utils.$('wrapper').classList[m]("portrait");
   // nW1.$wrapper.notify(m === 'add' ? 'portrait' : '');
  },
  displayInplay = ptL(invokeMethod, document.body.classList, "add"),
  doCompare = compose(
    ptL(eitherOr, "add", "remove"),
    curry3(compare(gtThan))("naturalWidth")("naturalHeight")
  ),
  onInplay = curry22(invoke)("inplay")(displayInplay),
  deferForward = deferPTL(invokeMethod, nW1.Looper, "forward", null),
  advance = compose(
    doCompare,
    $$("slide"),
    onInplay,
    doPic($$("base")),
    curry2(getter)("value"),
    deferForward
  ),
  reducer = curry3(invokeMethod)(equals)("reduce"),
  doSwap = function () {
    let bool = compose(reducer)(testProp("base", "slide", getHeight)),
      displaySwap = curry2(ptL(invokeMethod, document.body.classList))("swap");
    displaySwap(bool ? "remove" : "add"); //paint
    return !bool;
  },
  playMaker = function ($recur) {
    const doLoad = curry22(utils.doWhenFactory())(
        compose($recur.setPlayer.bind($recur), doSwap)
      )(isInplay),
      mittel = utils.mittelFactory(),
      getImgSrc = curry2(mittel(invokeMethod, "getAttribute"))("src"),
      updateBase = curry2(utils.doWhenFactory())(advance),
      //flag from $recur
      updateImages = (flag) => {
        const s = utils.$("slide"),
          b = utils.$("base");
        doPic(s, getImgSrc(b));
        s.onload = (e) => {
            let m = updateBase(flag);
            if(m){
              // machPortrait(m);
            }
          //nW1.ops.makePortrait.call(e.target);
        };
        //b.onload = b.onload || doLoad;
        b.onload = doLoad;
      };
    const fade = {
        validate: function () {
          return $recur.i <= -1;
        },
        inc: function () {
          $recur.i -= 1;
        },
        reset: function (arg) {
          $recur.i = $recur.dur;
          updateImages(true);
        }
      },
      fadeOut = {
        validate: function () {
          return $recur.i <= -0.1;
        },
        inc: function () {
          $recur.i -= 1;
        },
        reset: function () {
          updateImages();
          //ensure fadeIn will follow
          $recur.setPlayer(true);
        }
      },
      fadeIn = {
        validate: function () {
          return $recur.i >= 222;
        },
        inc: function () {
          $recur.i += 1;
        },
        reset: function () {
          doPic(utils.$("base"), nW1.Looper.forward().value);
        }
      },
      actions = [fadeIn, fadeOut];

    return function (flag) {
      return flag ? actions.reverse()[0] : fade;
    };
  };
nW1.recurMaker = function (duration = 100, wait = 50, i = 1, makePub = false) {
  let ret = {
    init: function () {
      this.nextplayer = playMaker(this);
      this.player = this.nextplayer();
      this.dur = duration;
      this.wait = wait;
      this.i = i;
      this.t = null;
      this.handlers = [];
      return this;
    },
    play: function () {
      if (this.player.validate()) {
        this.player.reset();
      } else {
        this.notify(this.i / this.wait);
        this.resume();
      }
    },
    suspend: function (flag) {
      const o = !isNaN(flag) ? 0.5 : 1;
      this.notify(o);
      window.cancelAnimationFrame(this.t);
      this.t = flag; //either set to undefined(forward/back/exit) or null(pause)
      if (o === 1) {
        this.notify(null, "delete");
      }
    },
    setPlayer: function (arg) {
      this.player = this.nextplayer(arg);
      this.play();
    },
    resume: function () {
      this.player.inc();
      this.t = window.requestAnimationFrame(this.play.bind(this));
    }
  };
  if (makePub) {
    return nW1.Publish().makepublisher(ret);
  }
  return ret;
};
