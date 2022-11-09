/* eslint-disable indent */
/*global nW1: false */
if (!window.nW1) {
    window.nW1 = {};
}

if (!window.nW1) {
    window.nW1 = {};
}

function equals(a, b) {
    return a === b;
}

function doPortrait(m, o, v) {
  return o.classList[m](v);
}

const getTgt = (str) => $$(str),
    isInplay = $$q('.inplay'),
    //getHeight = curry2(getter)('naturalHeight'),
    getHeight = (o) => {
      let h = o.naturalHeight;
      h = Math.floor(h/10);
      return h * 10;
    },
    compare = (pred) => (p, a, b) => {
      return typeof p === 'string' ? pred(a[p], b[p]) : p ? pred(p[a], p[b]) : pred(a, b);
    },
    eitherOr = (a, b, pred) => pred ? a : b,
    applyPortait = curry3(doPortrait)('portrait'),
    testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getRes(item)).map(getprop),
    doPic = ptL(setterBridge, 'src'),

    displayInplay = ptL(invokeMethod, document.body.classList, 'add'),
    doCompare = compose(ptL(eitherOr, 'add', 'remove'), curry3(compare(gtThanEq))('naturalWidth')('naturalHeight')),
    onInplay = curry22(invoke)('inplay')(displayInplay),
    deferForward = deferPTL(invokeMethod, nW1.Looper, 'forward', null),
    advance = compose(/*doCompare, $$('slide'), */onInplay, doPic($$('base')), curry2(getter)('value'), deferForward),
    reducer = curry3(invokeMethod)(equals)('reduce'),
    updateBase = curry2(doWhenFactory())(advance),
    doSwap = function () {
        let bool = compose(reducer)(testProp('base', 'slide', getHeight)),
            displaySwap = curry2(ptL(invokeMethod, document.body.classList))('swap');
        displaySwap(bool ? 'remove' : 'add'); //paint
        return !bool;
    },
    playMaker = function ($recur) {
        const doLoad = curry22(doWhenFactory())(compose($recur.setPlayer.bind($recur), doSwap))(isInplay);

        function updateImages(flag) {
            const s = $('slide'),
                b = $('base');
            doPic(s, getImgSrc(b));
            s.onload = () => updateBase(flag);
            b.onload = b.onload || doLoad;
        }
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
                    return $recur.i <= -.1;
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
                    doPic($('base'), nW1.Looper.forward().value);
                }
            },
            actions = [fadeIn, fadeOut];

        return function (flag) {
            return flag ? actions.reverse()[0] : fade;
        };
    },
    recurMaker = function (duration = 100, wait = 50, i = 1, makePub = false) {
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
                const o = !isNaN(flag) ? .5 : 1;
                this.notify(o);
                window.cancelAnimationFrame(this.t);
                this.t = flag; //either set to undefined(forward/back/exit) or null(pause)
                if (o === 1) {
                    this.notify(null, 'delete');
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

