/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

const meta = nW1.meta,
  curry2 = meta.curryRight(2),
  compose = meta.compose,
  deferPTL = meta.doPartial(true),
  getter = (o, p) => o[p],
  invokeMethod = meta.invokeMethod,
    /*
  getHeight = (o) => {
    let h = o.naturalHeight;
    h = Math.floor(h / 10);
    return h * 10;
  },
  */
  deferForward = compose(
    curry2(getter)("value"),
    deferPTL(invokeMethod, nW1.Looper, "forward", null)
  ),
  playMaker = function ($recur, getNext) {
    const fade = {
        validate: function () {
          return $recur.i <= -1;
        },
        inc: function () {
          $recur.i -= 1;
        },
        reset: function (arg) {
          $recur.i = $recur.dur;
          $recur.notify(true, "update");
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
          $recur.notify(false, "update");
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
          $recur.notify(getNext, "base");
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
      this.nextplayer = playMaker(this, deferForward);
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
    }
  };
  if (makePub) {
    return nW1.Publish().makepublisher(ret);
  }
  return ret;
};

/*

  FOP : 17/12/14
  BENSON
  AFEN : 01/08/15
  DIS HOUSE 30/04/16
  BP 11/06/12
  UKOOA 15/10/13   23/12/15
  ORKNEY 26/04/10 08/10/20
  SAFARI 31/10/04 - 26/02/04  -22/03/04
      getMobile = nW1.meta.pApply(Modernizr.mq, mob);
        window.addEventListener(
        "resize",
        pApply(throttle, pApply(isMobile, [sliderActions]), 222)
      );
       sliderLoad = Mod.mq(ipad) || Mod.mq(mob) ? sliderTxt : sliderTxtAlt,
       sliderOptions = Mod.mq(ipad) || Mod.mq(mob)
       getMobile = Mod.mq(mob) ? getMobile : pApply(negate, getMobile);
         isMobile = function (alternators) {
      if (!getMobile()) {
        alternators.forEach((f) => f());
        getMobile = pApply(meta.negate, getMobile);
      }
    },
  */
