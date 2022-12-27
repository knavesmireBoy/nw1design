/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

const meta = nW1.meta,
  getById = (str) => meta.$(str),
  curry2 = meta.curryRight(2),
  curry22 = meta.curryRight(2, true),
  curry3 = meta.curryRight(3),
  compose = meta.compose,
  $$ = meta.$$,
  isFunction = meta.tagTester("Function"),
  ptL = meta.doPartial(),
  deferPTL = meta.doPartial(true),
  getRes = function (arg) {
    if (isFunction(arg)) {
      return arg();
    }
    return arg;
  },
  equals = (a, b) => a === b,
  getter = (o, p) => o[p],
  setter = (o, k, v) => {
    getRes(o)[k] = v;
  },
  setterBridge = (k, o, v) => {
    setter(o, k, v);
    return getRes(o);
  },
  invoke = (f, v) => f(v),
  invokeMethod = meta.invokeMethod,
  isInplay = meta.$$Q(".inplay"),
  getHeight = curry2(getter)("naturalHeight"),
  /*
  getHeight = (o) => {
    let h = o.naturalHeight;
    h = Math.floor(h / 10);
    return h * 10;
  },
  */
  testProp = (a, b, getprop) =>
    [a, b]
      .map(getById)
      .map((item) => getRes(item))
      .map(getprop),
  displayInplay = ptL(invokeMethod, document.body.classList, "add"),
  onInplay = curry22(invoke)("inplay")(displayInplay),
  deferForward = compose(
    curry2(getter)("value"),
    deferPTL(invokeMethod, nW1.Looper, "forward", null)
  ),
  deferCurrent = deferPTL(invokeMethod, nW1.Looper, "get", "value"),
  displaySwap = curry2(ptL(invokeMethod, document.body.classList))("swap"),
  reducer = curry3(invokeMethod)(meta.negator(equals))("reduce"),
  doSwap = function () {
    let bool = reducer(testProp("base", "slide", getHeight));
    compose(displaySwap, ptL(meta.eitherOr, "add", "remove"))(bool);
    return bool;
  },
  playMaker = function ($recur, getCurrent, getNext) {
    //note getCurrent, getNext are functions invoked by subscribers
    const doload = compose($recur.setPlayer.bind($recur), doSwap),
      //flag from $recur
      previewUpdate = (src) => {
        $recur.notify(src, "swap");
      },
      updateImages = (flag) => {
        const s = meta.$("slide"),
          b = meta.$("base");
        $recur.notify(getCurrent, "slide");
        s.onload = (e) => {
          if (flag) {
            $recur.notify(deferForward, "base");
            onInplay();
          } else {
            previewUpdate(e.target.getAttribute("src"));
          }
        };
        b.onload = doload;
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
        },
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
        },
      },
      fadeIn = {
        validate: function () {
          return $recur.i >= 222;
        },
        inc: function () {
          $recur.i += 1;
        },
        reset: function () {
          //ensure implements...
          $recur.notify(getNext, "base");
        },
      },
      actions = [fadeIn, fadeOut];

    return function (flag) {
      return flag ? actions.reverse()[0] : fade;
    };
  };
nW1.recurMaker = function (duration = 100, wait = 50, i = 1, makePub = false) {
  let ret = {
    init: function () {
      this.nextplayer = playMaker(this, deferCurrent, deferForward);
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
        this.notify(this.i / this.wait, "opacity");
        this.resume();
      }
    },
    suspend: function (flag) {
      const o = !isNaN(flag) ? 0.5 : 1;
      this.notify(o, "opacity");
      window.cancelAnimationFrame(this.t);
      //window.clearTimeout(this.t);
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
      //this.t = window.setTimeout(this.play.bind(this), wait);
    },
  };
  if (makePub) {
    return nW1.Publish().makepublisher(ret);
  }
  return ret;
};
